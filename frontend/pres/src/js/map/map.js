/*©agpl*************************************************************************
*                                                                              *
* TellUs                                                                       *
* Copyright (C) 2021  TellUs AS                                                *
*                                                                              *
* This program is free software: you can redistribute it and/or modify         *
* it under the terms of the GNU Affero General Public License as published by  *
* the Free Software Foundation, either version 3 of the License, or            *
* (at your option) any later version.                                          *
*                                                                              *
* This program is distributed in the hope that it will be useful,              *
* but WITHOUT ANY WARRANTY; without even the implied warranty of               *
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the                 *
* GNU Affero General Public License for more details.                          *
*                                                                              *
* You should have received a copy of the GNU Affero General Public License     *
* along with this program. If not, see <http://www.gnu.org/licenses/>.         *
*                                                                              *
*****************************************************************************©*/

"use strict";


L.Map.addInitHook(function() {

	// Plugins

	/*this.addControl( new L.Control.Fullscreen({ position: "topleft" }) );*/

	this.addControl(
		L.control.zoom({ position: "bottomleft" })
	);

	this.fullscreenButton = L.easyButton({
		id: "fullscreen",
		position: "topleft",
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

	this.basemapLegend = L.control.htmllegend({
		position: "bottomright",
		collapsedOnInit: true,
		disableVisibilityControls: true,
		updateOpacity: null
	});
	this.addControl( this.basemapLegend );





	// Basemap

	this.basemap = L.tileLayer.provider("Esri.WorldStreetMap");
	this.basemap.options.source = { url: "Esri.WorldStreetMap" };
	this.addLayer( this.basemap );





	// Object layers

	this.objects = [];
	this.objectLayer = L.objectLayer();

	this.addLayer( this.objectLayer );





	// Map events

	this.on("movestart", ev => {
		let activeScene = $("#sceneContainer li.active").data("sceneid");
		if(!activeScene) return;

		$(`li[data-sceneid="${activeScene}"]`).removeClass("active");
		$(`li[data-sceneid="${activeScene}"]`).addClass("inactive");
	});

});




L.Map.include({

	setup: function() {
		//
	},
	reset: function() {
		this.objectLayer.clearLayers();
	},

	setFlyTo: function(center, zoom) {
		this.flyTo(center, zoom, { noMoveStart: true, duration: _PANNINGSPEED || null });
	},

	setObjects: function(sceneId, animate) {
		let s = get_scene(sceneId),
			prevSceneId = s.index > 0 ? _SCENES[s.index - 1].id : null;

		let os = [];
		for(let o of this.objectLayer.getLayers()) {
			if(o.options.type == "marker") {
				let r = this.extractObject(o);
				os.push( { id: r.id, pos: r.pos } );
			}
		}

		this.objectLayer.clearLayers();
		for(let o of this.objects) {
			if(o.sceneId == sceneId) {
				let object = this.createObject(o);
				this.objectLayer.addLayer(object, o.type, o.id);

				if(animate && o.type == "marker") {
					for(let oo of os) {
						if(o.id == oo.id) {
							object.setLatLng(oo.pos);
							object.slideTo(o.pos, { duration: _AVATARSPEED });
							/*let point = this.latLngToContainerPoint(oo.pos);
							this.on("move", ev => {
								m.setLatLng( this.containerPointToLatLng(point) );
							});
							this.on("moveend", ev => { m.slideTo(o.pos, { duration: 500 }); this.off("move"); });*/
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

	setBasemap: function(int, url, minZoom, maxZoom, cc, legend) {
		if(this.basemap.options.source.url
		&& this.basemap.options.source.url == url) return;

		this.removeLayer( this.basemap );
		this.basemapLegend.removeLegend(1);

		if(int) {
			this.basemap = L.tileLayer.provider(url);
		}else{
			this.basemap = L.tileLayer(url, {
				attribution: cc,
				minZoom: minZoom,
				maxZoom: maxZoom
			});

			if(legend) {
				this.basemapLegend.addLegend({
					name: "Basemap legend",
					layer: this.basemap,
					elements: [ { html: legend } ]
				});
			}
		}
		this.basemap.options.source = { url: url };

		this.presetZoom(minZoom, maxZoom);

		this.addLayer( this.basemap );

		$("div.leaflet-control-attribution a").prop("target", "_blank");
	},

	resetBasemap: function() {
		let name = "Esri.WorldStreetMap";
		let basemap = get_basemap(name);

		this.setBasemap(name, basemap.zoom[0], basemap.zoom[1]);
	},

	presetZoom: function(min, max) {
		let zoom = this.getZoom();

		if(zoom < min || zoom > max) {
			if(zoom < min) this.setZoom(min);
			if(zoom > max) this.setZoom(max);
		}

		this.setMinZoom(min);
		this.setMaxZoom(max);
	},

	createObject: function(o) {
		let oo = null;

		switch(o.type) {
			case "marker":
				oo = L.marker(o.pos, {
					keyboard: false,
					interactive: false,
					icon: L.icon({
						iconUrl: o.icon.url,
						iconSize: o.icon.size,
						popupAnchor: [0, (o.icon.size[1] / 2) * (-1)],
						className: "markerIcon"
					})
				});
				oo.options.borderColor = o.borderColor;
				oo.options.borderThickness = o.borderThickness;
				oo.options.overlayBlur = o.blur;
				oo.options.overlayBrightness = o.brightness;
				oo.options.overlayTransparency = o.transparency;
				oo.options.overlayGrayscale = o.grayscale;
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
					icon:				{
						url: o.getIcon().options.iconUrl,
						size: o.getIcon().options.iconSize
					},
					borderColor:		o.options.borderColor,
					borderThickness:	o.options.borderThickness,
					blur:				o.options.overlayBlur,
					brightness:			o.options.overlayBrightness,
					transparency:		o.options.overlayTransparency,
					grayscale:			o.options.overlayGrayscale
				};
				break;

			case "polyline":
				oo = {
					id:				o.options.id,
					sceneId:		o.options.sceneId,
					type:			o.options.type,
					pos:			o.getLatLngs().map(e => { return { lat: e.lat, lng: e.lng }; }),
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
