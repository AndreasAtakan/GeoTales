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

	/*this.addControl( new L.Control.Fullscreen({ position: "topright" }) );*/

	this.addControl(
		L.control.zoom({ position: "topright" })
	);

	this.sceneButton = L.easyButton({
		id: "gotoScene",
		position: "topright",
		leafletClasses: true,
		states: [
			{
				stateName: "main",
				onClick: function(button, map) { _EVENTS.scene.goto_scene(); },
				title: "Go to current scene",
				icon: "fa-reply"
			}
		]
	});
	this.addControl( this.sceneButton );
	this.sceneButton.disable();

	/*this.addControl( L.Control.zoomHome({ position: "topright" }) );*/

	/*this.addControl( L.control.locate({ position: "topright" }) );*/





	// Basemap

	this.basemap = L.tileLayer.provider("OpenStreetMap.HOT");
	this.addLayer( this.basemap );





	// Drawing and edit layer

	this.drawingLayer = L.drawingLayer({
		title: "drawing layer",
		lineThickness: 3,
		lineColor: "#563d7c",
		lineTransparency: 1,
		fillColor: "#563d7c",
		fillTransparency: 0.8
	});

	this.addLayer( this.drawingLayer );

	this.on(L.Draw.Event.CREATED, ev => {
		let object = ev.layer,
			type = ev.layerType;

		this.drawingLayer.addLayer(object, type);
	});

	this.on(L.Draw.Event.EDITSTART, ev => { this.drawingLayer.removeAvatarBorders(); });
	this.on(L.Draw.Event.EDITSTOP, ev => { this.drawingLayer.readdAvatarBorders(); });

	//this.on(L.Draw.Event.EDITED, ev => { let objects = ev.layers; });
	//this.on(L.Draw.Event.DELETED, ev => { let objects = ev.layers; });

	this.editLayer = L.featureGroup();





	// Draw and edit control

	L.EditToolbar.Delete.include({
		removeAllLayers: false
	});

	this.drawingControl = new L.Control.Draw({
		position: "topleft",
		edit: false,
		draw: {
			marker: {
				icon: L.icon({
					iconUrl: "assets/user-circle-solid.svg",
					iconSize: [30, 30],
					popupAnchor: [0, -15],
					className: "markerIcon"
				})
			},
			polyline: {
				shapeOptions: {
					weight: 3,
					color: "#563d7c",
					opacity: 1
				}
			},
			polygon: {
				shapeOptions: {
					weight: 3,
					color: "#563d7c",
					opacity: 1,
					fillColor: "#563d7c",
					fillOpacity: 0.2
				}
			},
			rectangle: {
				shapeOptions: {
					weight: 3,
					color: "#563d7c",
					opacity: 1,
					fillColor: "#563d7c",
					fillOpacity: 0.2
				}
			},
			circle: false,
			circlemarker: false
		}
	});
	L.drawLocal.draw.toolbar.buttons.marker = "Place an avatar";
	L.drawLocal.draw.handlers.marker.tooltip.start = "Click map to place avatar.";
	L.drawLocal.edit.handlers.edit.tooltip.text = "Drag handles to edit objects.";

	this.addControl( this.drawingControl );

	this.editControl = new L.EditToolbar({ featureGroup: this.editLayer });
	this.editHandler = this.editControl.getModeHandlers()[0].handler;
	this.editHandler._map = this; // NOTE: this is a hack, but necessary to make editing work





	// Map events

	this.on("movestart zoomstart", _EVENTS.scene.unset_scene_style);

	this.on("move", ev => {
		if(_PINNED_MARKER) {
			let o = this.drawingLayer.getObject(_PINNED_MARKER);
			o.setLatLng(this.getCenter()); // FIX: a bug is here, must investigate
		}
	});

});




L.Map.include({

	importData: function(data) {
		console.log(data);
	},

	setBasemap: function(img, width, height) {
		this.removeLayer( this.basemap );

		// NOTE: finds the maximum zoom-level where the image extent does not exceed the map-projection extent
		let zoom, bl, tr;
		for(let i = 0; i < 18; i++) {
			bl = L.CRS.EPSG3857.pointToLatLng(L.point(0, 0), i);
			tr = L.CRS.EPSG3857.pointToLatLng(L.point(width, height), i);
			if(bl.lat >= -90 && bl.lng >= -180
			&& tr.lat <=  90 && tr.lng <=  180) {
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

		this.presetZoom(0, 18);

		this.addLayer( this.basemap );
		this.fitBounds(bounds);
	},

	presetBasemap: function(name) {
		let basemap = get_basemap(name);

		this.removeLayer( this.basemap );

		if(basemap.int) {
			this.basemap = L.tileLayer.provider(name);
		}else{
			this.basemap = L.tileLayer(basemap.url, {
				attribution: basemap.cc,
				minZoom: basemap.zoom[0],
				maxZoom: basemap.zoom[1]
			});
		}

		this.presetZoom(basemap.zoom[0], basemap.zoom[1]);

		this.addLayer( this.basemap );

		$("div.leaflet-control-attribution a").attr("target", "_blank");
	},

	resetBasemap: function() { this.presetBasemap("OpenStreetMap.HOT"); },

	presetZoom: function(min, max) {
		let zoom = this.getZoom();

		if(zoom < min || zoom > max) {
			if(zoom < min) { this.setZoom( min ); }
			if(zoom > max) { this.setZoom( max ); }
		}

		this.setMinZoom(min);
		this.setMaxZoom(max);
	}

});
