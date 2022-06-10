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

	/*this.addControl( new L.Control.Fullscreen({ position: "topleft" }) );*/

	this.addControl(
		L.control.zoom({ position: "bottomright" })
	);

	this.addControl(
		L.easyButton({
			id: "fullscreen",
			position: "topright",
			leafletClasses: true,
			states: [
				{
					stateName: "enterFullscreen",
					onClick: function(button, map) {
						let el = document.body;
						if (el.requestFullscreen) { el.requestFullscreen(); }
						else if (el.webkitRequestFullscreen) { el.webkitRequestFullscreen(); } /* Safari */
						else if (el.msRequestFullscreen) { el.msRequestFullscreen(); } /* IE11 */
						button.state("exitFullscreen");
					},
					title: "Enter fullscreen",
					icon: "fa-expand"
				},
				{
					stateName: "exitFullscreen",
					onClick: function(button, map) {
						if (document.exitFullscreen) { document.exitFullscreen(); }
						else if (document.webkitExitFullscreen) { document.webkitExitFullscreen(); } /* Safari */
						else if (document.msExitFullscreen) { document.msExitFullscreen(); } /* IE11 */
						button.state("enterFullscreen");
					},
					title: "Exit fullscreen",
					icon: "fa-compress"
				}
			]
		})
	);

	this.addControl(
		L.easyBar([
			L.easyButton({
				id: "sceneBackward",
				leafletClasses: true,
				states: [
					{
						stateName: "main",
						onClick: function(button, map) { _SCENES.prev(); },
						title: "Previous scene",
						icon: "fa-chevron-left"
					}
				]
			}),
			L.easyButton({
				id: "sceneForward",
				leafletClasses: true,
				states: [
					{
						stateName: "main",
						onClick: function(button, map) { _SCENES.next(); },
						title: "Next scene",
						icon: "fa-chevron-right"
					}
				]
			})
		], { position: "topleft", id: "sceneNav" })
	);

	/*this.addControl( L.Control.zoomHome({ position: "topright" }) );*/

	/*this.addControl( L.control.locate({ position: "topright" }) );*/





	// Basemap

	this.basemap = _BASEMAPS[10].tiles;
	this.addLayer( this.basemap );





	// Object layers

	this.objects = [];
	this.objectLayer = L.objectLayer();

	this.addLayer( this.objectLayer );





	// Map events
	//this.on("moveend", ev => {});

});




L.Map.include({

	setup: function() {
		$("div.leaflet-control-attribution a").prop("target", "_blank");
	},
	reset: function() {
		this.objectLayer.clearLayers();
	},

	setFlyTo: function(bounds) {
		this.flyToBounds(bounds, { maxZoom: this.getMaxZoom(), noMoveStart: true, duration: _PANNINGSPEED || null });
	},

	setObjects: function(sceneId) {
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
					color:			o.color,
					weight:			o.thickness,
					opacity:		1 - o.transparency
				});
				break;

			case "polygon":
				oo = L.polygon(o.pos, {
					interactive:	false,
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
	}

});
