/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

"use strict";


L.Map.addInitHook(function() {

	// Init map aspect ratio

	this.setAspectRatio();



	// Plugins

	/*this.addControl( new L.Control.Fullscreen({ position: "topright" }) );*/

	/*this.addControl( L.control.zoom({ position: "bottomright" }) );*/

	/*this.addControl( L.control.locate({ position: "topright" }) );*/

	this.panLock = true;





	// Basemap

	this.basemap = _BASEMAPS[10].tiles;
	this.addLayer( this.basemap );





	// Object layers

	this.objects = [];
	this.objectLayer = L.featureGroup();
	this.addLayer( this.objectLayer );

	this.objectLayer.on("layeradd", ev => {
		let o = ev.layer;

		let label = o.options.label;
		if(label) {
			o.bindTooltip(label, {
				direction: o instanceof L.ImageOverlay ? "bottom" : "center",
				permanent: true
			});
		}

		if(o instanceof L.ImageOverlay) { this.setIcon(o); }
	});

	this.objectLayer.on("layerremove", ev => {
		let o = ev.layer;

		o.closeTooltip(); o.unbindTooltip();
		o.slideCancel();
	});





	// Map events
	//this.on("moveend", ev => {});

});




L.Map.include({

	setup: function() {
		$("div.leaflet-control-attribution a").prop("target", "_blank");

		$("#mapNav #zoomIn").click(ev => { this.zoomIn(); });
		$("#mapNav #zoomOut").click(ev => { this.zoomOut(); });

		$("#mapNav #panLock").click(ev => {
			let c = "";
			if(this.panLock) {
				c = "🔓"; this.enable();
			}else{
				c = "🔒"; this.disable();
				this.fitBounds( _SCENES.get( _SCENES.active ).bounds, { maxZoom: this.getMaxZoom(), noMoveStart: true } );
			}

			$(ev.target).html(c);
			this.panLock = !this.panLock;
			$(`#mapNav #zoomIn,
			   #mapNav #zoomOut`).prop("disabled", this.panLock);
		});

		this.disable();
	},
	reset: function() {
		this.clearLayers();
	},

	enable: function() {
		this.boxZoom.enable();
		this.doubleClickZoom.enable();
		this.dragging.enable();
		this.keyboard.enable();
		this.scrollWheelZoom.enable();
		this.touchZoom.enable();
		if(this.tapHold) { this.tapHold.enable(); }
	},
	disable: function() {
		this.boxZoom.disable();
		this.doubleClickZoom.disable();
		this.dragging.disable();
		this.keyboard.disable();
		this.scrollWheelZoom.disable();
		this.touchZoom.disable();
		if(this.tapHold) { this.tapHold.disable(); }
	},

	setAspectRatio: function() {
		let w = $("#main").outerWidth(),
			h = $("#main").outerHeight(),
			r = _OPTIONS.aspectratio;

		let dim = get_aspect_ratio_dimentions(w, h, r);
		$("#map").css({
			width: `${(dim[0]/w) * 100}%`,
			height: `${(dim[1]/h) * 100}%`,
			left: `${(((w - dim[0]) / 2) / w) * 100}%`,
			top: `${(((h - dim[1]) / 2)/ h) * 100}%`
		});

		this.invalidateSize();
	},

	setFlyTo: function(bounds) {
		if(this.panLock) {
			this.flyToBounds(bounds, { maxZoom: this.getMaxZoom(), noMoveStart: true, duration: _OPTIONS.panningspeed || null });
		}
	},



	clearLayers: function() {
		this.objectLayer.clearLayers();
	},

	getLayers: function() {
		return this.objectLayer.getLayers();
	},

	setObjects: function(sceneId) {
		let os = this.getLayers().map(o => {
			let r = this.extractObject(o); return { id: r.id, pos: r.pos, radius: r.radius };
		});
		this.clearLayers();
		for(let i = 0; i < this.objects.length; i++) {
			let o = Object.assign({}, this.objects[i]);
			if(o.sceneId == sceneId) {
				let pos = o.pos, rad = o.radius;
				for(let oo of os) {
					if(o.id == oo.id) {
						o.pos = oo.pos;
						if(o.type == "circle") { o.radius = oo.radius; }
						break;
					}
				}

				let object = this.createObject(o);
				this.objectLayer.addLayer(object);

				for(let oo of os) {
					if(o.id == oo.id) {
						object.slideTo( pos , { radius: rad, duration: _OPTIONS.animationspeed });
						break;
					}
				}
			}
		}
	},

	setIcon: function(o, size, icon) {
		if(icon) { o.setUrl(icon); }
		if(size) {
			let zoom = this.getZoom();
			let c = this.project(o.getBounds().getCenter(), zoom);
			o.setBounds([
				this.unproject([ c.x - size[0] / 2, c.y - size[1] / 2 ], zoom),
				this.unproject([ c.x + size[0] / 2, c.y + size[1] / 2 ], zoom)
			]);
		}

		$(o._image).css("border-radius", o.options.rounded ? "50%" : "0");
		//$(o._image).css("transform", `rotate(${o.options.angle}deg)`);
		$(o._image).css("border", `${o.options.borderThickness}px solid ${o.options.borderColor}`);
		$(o._image).css("filter", `
			blur(${o.options.overlayBlur}px)
			grayscale(${o.options.overlayGrayscale*100}%)
			drop-shadow(0 0 ${o.options.overlayBrightness}px yellow)
			opacity(${(1 - o.options.overlayTransparency)*100}%)
		`);

		if(o.options.label) { o.closeTooltip(); o.openTooltip(); }
	},



	getBasemap: function() {
		if(this.basemap instanceof L.TileLayer) {
			return {
				type: "tiles",
				url: this.basemap._url,
				minZoom: this.basemap.options.minZoom,
				maxZoom: this.basemap.options.maxZoom,
				attribution: this.basemap.options.attribution
			};
		}else
		if(this.basemap instanceof L.ImageOverlay) {
			return {
				type: "image",
				img: this.basemap._url,
				width: this.basemap.options.width,
				height: this.basemap.options.height
			};
		}
		return null;
	},

	setBasemap: function(source) {
		let basemap;

		if(source instanceof L.TileLayer) {
			if(this.basemap instanceof L.TileLayer
			&& source._url == this.basemap._url) { return; }

			basemap = source;
		}else
		if(source.type == "tiles") {
			if(this.basemap instanceof L.TileLayer
			&& source.url == this.basemap._url) { return; }

			basemap = L.tileLayer(source.url, {
				minZoom: source.minZoom || 0,
				maxZoom: source.maxZoom || 22,
				attribution: source.attribution || `&copy; <a href="https://${_HOST}" target="_blank">GeoTales</a>`
			});
		}else
		if(source.type == "image") {
			if(this.basemap instanceof L.ImageOverlay
			&& source.img == this.basemap._url) { return; }

			// NOTE: finds the maximum zoom-level where the image extent does not exceed the map-projection extent
			let zoom, bl, tr;
			for(let i = 0; i < 18; i++) {
				bl = L.CRS.EPSG3857.pointToLatLng(L.point(0, 0), i);
				tr = L.CRS.EPSG3857.pointToLatLng(L.point(source.width, source.height), i);
				if(bl.lat >= -85.06 && bl.lng >= -180
				&& tr.lat <=  85.06 && tr.lng <=  180) {
					zoom = i;
					break;
				}
			}
			if(!zoom && zoom != 0) { return; }
			let bounds = [[bl.lat, bl.lng], [tr.lat, tr.lng]];

			basemap = L.imageOverlay(source.img, bounds, {
				zIndex: 0,
				minZoom: 0, maxZoom: 22,
				width: source.width, height: source.height,
				attribution: `&copy; <a href="https://${_HOST}" target="_blank">GeoTales</a>`
			});
		}
		else{ return; }

		this.removeLayer( this.basemap );

		this.basemap = basemap;

		this.presetZoom(this.basemap.options.minZoom, this.basemap.options.maxZoom);

		this.addLayer( this.basemap );

		$("div.leaflet-control-attribution a").prop("target", "_blank");
	},

	resetBasemap: function() { this.setBasemap( _BASEMAPS[10].tiles ); },

	presetZoom: function(min, max) {
		let zoom = this.getZoom();

		if(zoom < min || zoom > max) {
			if(zoom < min) { this.setZoom(min); }
			if(zoom > max) { this.setZoom(max); }
		}

		this.setMinZoom(min);
		this.setMaxZoom(max);
	},



	createObject: function(o) {
		let oo = null;

		switch(o.type) {
			case "avatar":
				oo = L.imageOverlay(o.icon, o.pos, {
					interactive:			false,
					label:					o.label,
					ratio:					o.ratio,
					rounded:				o.rounded,
					angle:					o.angle,
					borderColor:			o.borderColor,
					borderThickness:		o.borderThickness,
					overlayBlur:			o.blur,
					overlayBrightness:		o.brightness,
					overlayGrayscale:		o.grayscale,
					overlayTransparency:	o.transparency
				});
				break;

			case "polyline":
				oo = L.polyline(o.pos, {
					interactive:	false,
					label:			o.label,
					dashArray:		o.dashed ? "5, 10" : "",
					color:			o.color,
					weight:			o.thickness,
					opacity:		1 - o.transparency
				});
				break;

			case "polygon":
				oo = L.polygon(o.pos, {
					interactive:	false,
					label:			o.label,
					dashArray:		o.dashed ? "5, 10" : "",
					color:			o.lineColor,
					weight:			o.lineThickness,
					opacity:		1 - o.lineTransparency,
					fillColor:		o.fillColor,
					fillOpacity:	1 - o.fillTransparency
				});
				break;

			case "rectangle":
				oo = L.rectangle(o.pos, {
					interactive:	false,
					label:			o.label,
					dashArray:		o.dashed ? "5, 10" : "",
					color:			o.lineColor,
					weight:			o.lineThickness,
					opacity:		1 - o.lineTransparency,
					fillColor:		o.fillColor,
					fillOpacity:	1 - o.fillTransparency
				});
				break;

			case "circle":
				oo = L.circle(o.pos, {
					interactive:	false,
					radius:			o.radius,
					label:			o.label,
					dashArray:		o.dashed ? "5, 10" : "",
					color:			o.lineColor,
					weight:			o.lineThickness,
					opacity:		1 - o.lineTransparency,
					fillColor:		o.fillColor,
					fillOpacity:	1 - o.fillTransparency
				});
				break;

			default:
				console.error("object type invalid");
				break;
		}

		oo.options.id = o.id;
		oo.options.sceneId = o.sceneId;

		return oo;
	},

	extractObject: function(o) {
		let oo = null;

		if(o instanceof L.ImageOverlay) {
			let nw = o.getBounds().getNorthWest(), se = o.getBounds().getSouthEast();
			oo = {
				id:					o.options.id,
				sceneId:			o.options.sceneId,
				type:				"avatar",
				pos:				[[nw.lat, nw.lng], [se.lat, se.lng]],
				label:				o.options.label,
				icon:				o._url,
				ratio:				o.options.ratio,
				rounded:			o.options.rounded,
				angle:				0,
				borderColor:		o.options.borderColor,
				borderThickness:	o.options.borderThickness,
				blur:				o.options.overlayBlur,
				grayscale:			o.options.overlayGrayscale,
				brightness:			o.options.overlayBrightness,
				transparency:		o.options.overlayTransparency
			};
		}else
		if(o instanceof L.Polygon) {
			oo = {
				id:					o.options.id,
				sceneId:			o.options.sceneId,
				type:				o instanceof L.Rectangle ? "rectangle" : "polygon",
				pos:				o.getLatLngs().map(e => e.map(f => { return { lat: f.lat, lng: f.lng }; })),
				label:				o.options.label,
				dashed:				!!o.options.dashArray,
				lineColor:			o.options.color,
				lineThickness:		o.options.weight,
				lineTransparency:	1 - o.options.opacity,
				fillColor:			o.options.fillColor,
				fillTransparency:	1 - o.options.fillOpacity
			};
		}else
		if(o instanceof L.Polyline) {
			oo = {
				id:				o.options.id,
				sceneId:		o.options.sceneId,
				type:			"polyline",
				pos:			o.getLatLngs().map(e => {
					if(!e.length) { return { lat: e.lat, lng: e.lng }; }
					else{ return e.map(f => { return { lat: f.lat, lng: f.lng }; }); }
				}),
				label:			o.options.label,
				dashed:			!!o.options.dashArray,
				color:			o.options.color,
				thickness:		o.options.weight,
				transparency:	1 - o.options.opacity
			};
		}else
		if(o instanceof L.Circle) {
			let p = o.getLatLng();
			oo = {
				id:					o.options.id,
				sceneId:			o.options.sceneId,
				type:				"circle",
				pos:				[ p.lat, p.lng ],
				radius:				o.getRadius(),
				label:				o.options.label,
				dashed:				!!o.options.dashArray,
				lineColor:			o.options.color,
				lineThickness:		o.options.weight,
				lineTransparency:	1 - o.options.opacity,
				fillColor:			o.options.fillColor,
				fillTransparency:	1 - o.options.fillOpacity
			};
		}else{ console.error("object type invalid"); }

		return oo;
	},

	importData: function(data) {
		for(let i = 0; i < data.length; i++) {
			this.objects.push( data[i] );
		}
	}

});
