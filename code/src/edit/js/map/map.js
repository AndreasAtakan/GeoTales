/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

"use strict";


L.Map.addInitHook(function() {

	// Plugins

	/*this.addControl( new L.Control.Fullscreen({ position: "topright" }) );*/

	this.addControl(
		L.control.zoom({ position: "bottomright" })
	);

	this.basemapButton = L.easyButton({
		id: "changeBasemap",
		position: "bottomright",
		leafletClasses: true,
		states: [
			{
				stateName: "main",
				onClick: function(button, map) { $("#basemapModal").modal("show"); },
				title: "Change basemap",
				icon: "fa-layer-group"
			}
		]
	});
	this.addControl( this.basemapButton );
	this.basemapButton.disable();

	this.textboxButton = L.easyButton({
		id: "addTextbox",
		position: "topleft",
		leafletClasses: true,
		states: [
			{
				stateName: "main",
				onClick: function(button, map) { _TEXTBOXES.add(); },
				title: "Add textbox",
				icon: "fa-comment-alt"
			}
		]
	});
	this.addControl( this.textboxButton );
	this.textboxButton.disable();

	/*this.addControl( L.Control.zoomHome({ position: "topright" }) );*/

	/*this.addControl( L.control.locate({ position: "topright" }) );*/





	// Basemap

	this.basemap = _BASEMAPS[10].tiles;
	this.addLayer( this.basemap );





	// Object layers

	this.objects = [];
	this.fadeLayer = L.fadeLayer();
	this.objectLayer = L.objectLayer();

	this.addLayer( this.fadeLayer );
	this.addLayer( this.objectLayer );

	this.on(L.Draw.Event.CREATED, ev => {
		let object = ev.layer,
			type = ev.layerType;

		if(type == "marker") {
			let zoom = this.getZoom();
			let p = this.project(object.getLatLng(), zoom),
				url = object.getIcon().options.iconUrl,
				size = object.getIcon().options.iconSize;
			object = L.imageOverlay(url, [
				this.unproject([ p.x - size[0] / 2, p.y - size[1] / 2 ], zoom),
				this.unproject([ p.x + size[0] / 2, p.y + size[1] / 2 ], zoom)
			], {
				interactive:			true,
				ratio:					496 / 512, // NOTE: this is hard-coded from the pixel-width of 'user-circle-solid.svg'
				rounded:				false,
				angle:					0,
				borderColor:			"#563d7c",
				borderThickness:		0,
				overlayBlur:			0,
				overlayGrayscale:		0,
				overlayBrightness:		0,
				overlayTransparency:	0
			});
			type = "avatar";
		}

		object.options.sceneId = _SCENES.active;

		this.objectLayer.addLayer(object, type);
		this.objects.push( this.extractObject(object) );
	});

	this.on(`${L.Draw.Event.EDITMOVE} ${L.Draw.Event.EDITRESIZE} ${L.Draw.Event.EDITVERTEX}`, ev => {
		let object = ev.layer || ev.poly;
		this.updateObject(object.options.id);
		if(object.options.label) { object.closeTooltip(); object.openTooltip(); }
	});





	// Draw and edit control

	L.drawLocal.draw.toolbar.buttons.marker = "Place an avatar";
	L.drawLocal.draw.handlers.marker.tooltip.start = "Click map to place avatar.";
	L.drawLocal.edit.handlers.edit.tooltip.text = null; // NOTE: removes the instructions-tooltip for editing mode
	L.drawLocal.edit.handlers.edit.tooltip.subtext = null;
	L.drawLocal.edit.handlers.remove.tooltip.text = null;
	L.EditToolbar.Delete.include({ removeAllLayers: false });
	this.addControl(
		new L.Control.Draw({
			position: "topright",
			edit: false,
			draw: {
				marker: {
					icon: L.icon({ iconUrl: "assets/user-circle-solid.svg", iconSize: [30, 30], popupAnchor: [0, -15], tooltipAnchor: [0, 15] })
				},
				polyline: { shapeOptions: { weight: 3, color: "#563d7c", opacity: 1 } },
				polygon: { shapeOptions: { weight: 3, color: "#563d7c", opacity: 1, fillColor: "#563d7c", fillOpacity: 0.2 } },
				rectangle: false,
				circle: false,
				circlemarker: false
			}
		})
	);
	this.disableDrawing(); // Disable drawing-control


	this.on("movestart", ev => { _SCENES.sceneInactive(); });
	this.on("moveend", ev => { _IS_MAP_MOVING = false; });

});





L.Map.include({

	setup: function() {
		this.enableDrawing();
		this.basemapButton.enable();
		this.textboxButton.enable();

		$("div.leaflet-control-attribution a").prop("target", "_blank");
	},
	reset: function() {
		this.objectLayer.clearLayers();
		this.fadeLayer.clearLayers();

		this.disableDrawing();
		this.basemapButton.disable();
		this.textboxButton.disable();
	},

	enableDrawing: function() {
		for(let b of [$(".leaflet-draw-draw-polyline"), $(".leaflet-draw-draw-polygon"), $(".leaflet-draw-draw-rectangle"), $(".leaflet-draw-draw-marker")]) { b.removeClass("draw-control-disabled"); }
	},
	disableDrawing: function() {
		for(let b of [$(".leaflet-draw-draw-polyline"), $(".leaflet-draw-draw-polygon"), $(".leaflet-draw-draw-rectangle"), $(".leaflet-draw-draw-marker")]) { b.addClass("draw-control-disabled"); }
	},

	setFlyTo: function(bounds) {
		this.flyToBounds(bounds, { maxZoom: this.getMaxZoom(), noMoveStart: true, duration: _PANNINGSPEED || null });
	},

	deleteScene: function(sceneId) {
		this.objects = this.objects.filter(o => o.sceneId != sceneId);
	},

	highlightObject: function(id) {
		let o = this.fadeLayer.getObject(id);
		if(!o) { return; }

		if(o.options.type == "avatar") { o.setOpacity(0.8); }
		else{ o.setStyle({ opacity: 0.8 }); }
	},
	unhighlightObject: function(id) {
		let o = this.fadeLayer.getObject(id);
		if(!o) { return; }

		if(o.options.type == "avatar") { o.setOpacity(0.3); }
		else{ o.setStyle({ opacity: 0.3 }); }
	},

	setObjects: function(sceneId) {
		let prev = _SCENES.getPrevScene(sceneId);
		let prevId = prev ? prev.id : null;

		this.fadeLayer.clearLayers();
		if(prevId) {
			for(let o of this.objects) {
				if(o.sceneId == prevId) { this.fadeLayer.addLayer(this.createObject(o), o.type, o.id); }
			}
		}

		let os = this.objectLayer.getLayers().filter(o => o.options.type == "avatar").map(o => {
			let r = this.extractObject(o); return { id: r.id, pos: r.pos };
		});
		this.objectLayer.clearLayers();
		for(let o of this.objects) {
			if(o.sceneId == sceneId) {
				let object = this.createObject(o);
				this.objectLayer.addLayer(object, o.type, o.id);

				if(o.type == "avatar") {
					for(let oo of os) {
						if(o.id == oo.id) {
							object.setBounds( L.latLngBounds(oo.pos) );
							object.slideTo( L.latLngBounds(o.pos) , { duration: _AVATARSPEED });
							break;
						}
					}
				}
			}
		}
	},

	insertObject: function(id, sceneId) {
		if(this.objectLayer.getObject(id)) { return; }

		let object;
		for(let o of this.objects) {
			if(o.id == id && o.sceneId == sceneId) {
				object = Object.assign({}, o);
				break;
			}
		}
		object.sceneId = _SCENES.active;

		this.objectLayer.addLayer(this.createObject(object), object.type, object.id);
		this.objects.push(object);
	},
	cloneAvatar: function(id, sceneId) {
		let object;
		for(let o of this.objects) {
			if(o.id == id && o.sceneId == sceneId) {
				object = Object.assign({}, o);
				break;
			}
		}

		object.id = uuid();

		let zoom = this.getZoom();
		let pos = this.project(object.pos, zoom); // TODO: redo this with imageOverlay bounds
			pos.x += 50; pos.y += 50;
			pos = this.unproject(pos, zoom);
		object.pos = { lat: pos.lat, lng: pos.lng };

		this.objectLayer.addLayer(this.createObject(object), object.id);
		this.objects.push(object);
	},

	updateObject: function(id) {
		let object = this.objectLayer.getObject(id);

		for(let i = 0; i < this.objects.length; i++) {
			let o = this.objects[i];
			if(o.id == id && o.sceneId == object.options.sceneId) {
				this.objects[i] = this.extractObject(object);
				break;
			}
		}
	},

	deleteObject: function(id) {
		let object = this.objectLayer.getObject(id);
		let sceneId = object.options.sceneId;

		this.objectLayer.removeLayer(object);

		for(let i = 0; i < this.objects.length; i++) {
			let o = this.objects[i];
			if(o.id == id && o.sceneId == sceneId) {
				this.objects.splice(i, 1);
				break;
			}
		}
	},

	globalObjectOptions: function(id) {
		let object = this.objectLayer.getObject(id);
		let o = this.extractObject(object);
		delete o.id; delete o.sceneId; delete o.type; delete o.pos;

		for(let i = 0; i < this.objects.length; i++) {
			let oo = this.objects[i];
			if(oo.id == id && oo.sceneId != object.options.sceneId) {
				this.objects[i] = Object.assign({}, oo, o);
			}
		}

		object = this.fadeLayer.getObject(id);
		if(object) {
			this.fadeLayer.removeLayer(object);

			let oo = Object.assign({}, this.extractObject(object), o);
			this.fadeLayer.addLayer(this.createObject(oo), oo.type, oo.id);
		}
	},

	setIcon: function(id, size, icon) { this.objectLayer.setIcon(id, size, icon); },

	getCenterBasemapTile: function() {
		let s = this.basemap.getTileSize(),
			c = this.project( this.getCenter(), this.getZoom() );
		return this.basemap.getTileUrl({ x: Math.floor(c.x / s.x), y: Math.floor(c.y / s.y) });
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
					interactive:			true,
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
					label:		o.label,
					color:		o.color,
					weight:		o.thickness,
					opacity:	1 - o.transparency
				});
				break;

			case "polygon":
				oo = L.polygon(o.pos, {
					label:			o.label,
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
		oo.options.type = o.type;

		return oo;
	},

	extractObject: function(o) {
		let oo = null;

		switch(o.options.type) {
			case "avatar":
				let nw = o.getBounds().getNorthWest(), se = o.getBounds().getSouthEast();
				oo = {
					id:					o.options.id,
					sceneId:			o.options.sceneId,
					type:				o.options.type,
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
				break;

			case "polyline":
				oo = {
					id:				o.options.id,
					sceneId:		o.options.sceneId,
					type:			o.options.type,
					pos:			o.getLatLngs().map(e => {
						if(!e.length) { return { lat: e.lat, lng: e.lng }; }
						else{ return e.map(f => { return { lat: f.lat, lng: f.lng }; }); }
					}),
					label:			o.options.label,
					color:			o.options.color,
					thickness:		o.options.weight,
					transparency:	1 - o.options.opacity
				};
				break;

			case "polygon":
				oo = {
					id:					o.options.id,
					sceneId:			o.options.sceneId,
					type:				o.options.type,
					pos:				o.getLatLngs().map(e => e.map(f => { return { lat: f.lat, lng: f.lng }; })),
					label:				o.options.label,
					lineColor:			o.options.color,
					lineThickness:		o.options.weight,
					lineTransparency:	1 - o.options.opacity,
					fillColor:			o.options.fillColor,
					fillTransparency:	1 - o.options.fillOpacity
				};
				break;

			default:
				console.error("object type invalid");
				break;
		}

		return oo;
	},

	importData: function(data) {
		for(let i = 0; i < data.length; i++) {
			this.objects.push( data[i] );
		}
	},

	exportData: function() { return this.objects; }

});
