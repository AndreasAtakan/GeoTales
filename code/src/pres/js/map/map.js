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

	this.basemapLegend = L.control.htmllegend({
		position: "topright",
		collapsedOnInit: true,
		disableVisibilityControls: true,
		updateOpacity: null
	});
	this.addControl( this.basemapLegend );

	this.addControl(
		L.control.zoom({ position: "topright" })
	);

	this.fullscreenButton = L.easyButton({
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
	});
	this.addControl( this.fullscreenButton );

	/*this.addControl( L.Control.zoomHome({ position: "topright" }) );*/

	/*this.addControl( L.control.locate({ position: "topright" }) );*/





	// Basemap

	this.basemap = _BASEMAPS[9].tiles;
	this.basemap.options.source = { url: this.basemap._url };
	this.addLayer( this.basemap );





	// Object layers

	this.objects = [];
	this.objectLayer = L.objectLayer();

	this.addLayer( this.objectLayer );





	// Map events

	this.on("movestart", ev => { $("#scene").addClass("inactive"); });
	this.on("moveend", ev => { _IS_MAP_MOVING = false; });

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
		let s = get_scene(sceneId),
			prevSceneId = s.index > 0 ? _SCENES[s.index - 1].id : null;

		let os = this.objectLayer.getLayers().filter(o => o.options.type == "marker").map(o => {
			let r = this.extractObject(o); return { id: r.id, pos: r.pos };
		});

		this.objectLayer.clearLayers();
		for(let o of this.objects) {
			if(o.sceneId == sceneId) {
				let object = this.createObject(o);
				this.objectLayer.addLayer(object, o.type, o.id);

				if(o.type == "marker") {
					for(let oo of os) {
						if(o.id == oo.id) {
							object.setLatLng(oo.pos);
							object.slideTo(o.pos, { duration: _AVATARSPEED });
							break;
						}
					}
				}
			}
		}
	},

	getBasemap: function() {
		return this.basemap.options.source;
	},

	imgBasemap: function(img, width, height) {
		if(this.basemap.options.source.img
		&& this.basemap.options.source.img == img) return;

		this.removeLayer( this.basemap );
		this.basemapLegend.removeLegend(1);

		// NOTE: finds the maximum zoom-level where the image extent does not exceed the map-projection extent
		let zoom, bl, tr;
		for(let i = 0; i < 18; i++) {
			bl = L.CRS.EPSG3857.pointToLatLng(L.point(0, 0), i);
			tr = L.CRS.EPSG3857.pointToLatLng(L.point(width, height), i);
			if(bl.lat >= -85.06 && bl.lng >= -180
			&& tr.lat <=  85.06 && tr.lng <=  180) {
				zoom = i;
				break;
			}
		}
		if(zoom != 0 && !zoom) return;

		let bounds = [[bl.lat, bl.lng], [tr.lat, tr.lng]];

		this.basemap = L.imageOverlay(img, bounds, {
			zIndex: 0,
			attribution: "&copy; <a href=\"https://tellusmap.com\" target=\"_blank\">TellUs</a>"
		});
		this.basemap.options.source = { img: img, width: width, height: height };

		this.presetZoom(0, 18);

		this.addLayer( this.basemap );
		//this.fitBounds(bounds);
	},

	setBasemap: function(tiles, legend) {
		if(this.basemap.options.source.url
		&& this.basemap.options.source.url == tiles._url) return;

		this.removeLayer( this.basemap );
		this.basemapLegend.removeLegend(1);

		this.basemap = tiles;
		this.basemap.options.source = { url: this.basemap._url };

		if(legend) {
			this.basemapLegend.addLegend({
				name: "Basemap legend",
				layer: this.basemap,
				elements: [ { html: legend } ]
			});
		}

		this.presetZoom(this.basemap.options.minZoom, this.basemap.options.maxZoom);

		this.addLayer( this.basemap );

		$("div.leaflet-control-attribution a").prop("target", "_blank");
	},

	resetBasemap: function() { this.setBasemap( _BASEMAPS[9].tiles ); },

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
		//let TransitionedIcon = L.TransitionedIcon.extend({ options: { cssTransitionName: "marker-transition" } });

		switch(o.type) {
			case "marker":
				oo = L.marker(o.pos, {
					keyboard: false,
					interactive: false,
					icon: L.icon({
						iconUrl: o.icon,
						iconSize: o.size,
						popupAnchor: [ 0, (-1) * (o.size[1] / 2) ],
						tooltipAnchor: [ 0, o.size[1] / 2 ]
						//shadowUrl: "lib/leaflet/images/marker-shadow.png",
						//shadowSize: [41, 41]
					})
				});
				oo.options.label = o.label;
				oo.options.ratio = o.ratio;
				oo.options.rounded = o.rounded;
				oo.options.angle = o.angle;
				oo.options.borderColor = o.borderColor;
				oo.options.borderThickness = o.borderThickness;
				oo.options.overlayBlur = o.blur;
				oo.options.overlayBrightness = o.brightness;
				oo.options.overlayGrayscale = o.grayscale;
				oo.options.overlayTransparency = o.transparency;
				break;

			case "polyline":
				oo = L.polyline(o.pos, {
					interactive: false,
					color:		o.color,
					weight:		o.thickness,
					opacity:	1 - o.transparency
				});
				break;

			case "polygon":
				oo = L.polygon(o.pos, {
					interactive: false,
					color:			o.lineColor,
					weight:			o.lineThickness,
					opacity:		1 - o.lineTransparency,
					fillColor:		o.fillColor,
					fillOpacity:	1 - o.fillTransparency
				});
				break;

			case "rectangle":
				oo = L.rectangle(o.pos, {
					interactive: false,
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
			case "marker":
				oo = {
					id:					o.options.id,
					sceneId:			o.options.sceneId,
					type:				o.options.type,
					pos:				{ lat: o.getLatLng().lat, lng: o.getLatLng().lng },
					label:				o.options.label,
					icon:				o.getIcon().options.iconUrl,
					size:				o.getIcon().options.iconSize,
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
						if(!e.length) return { lat: e.lat, lng: e.lng };
						else return e.map(f => { return { lat: f.lat, lng: f.lng }; });
					}),
					color:			o.options.color,
					thickness:		o.options.weight,
					transparency:	1 - o.options.opacity
				};
				break;

			case "polygon":
			case "rectangle":
				oo = {
					id:					o.options.id,
					sceneId:			o.options.sceneId,
					type:				o.options.type,
					pos:				o.getLatLngs().map(e => e.map(f => { return { lat: f.lat, lng: f.lng }; })),
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
