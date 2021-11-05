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





	// Drawing layer

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
	//this.on(L.Draw.Event.EDITED, ev => { let objects = ev.layers; });
	//this.on(L.Draw.Event.DELETED, ev => { let objects = ev.layers; });





	// Draw control

	L.EditToolbar.Delete.include({
		removeAllLayers: false
	});

	this.drawingControl = new L.Control.Draw({
		position: "topleft",
		edit: { featureGroup: this.drawingLayer },
		draw: {
			marker: {},
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
			circle: false,
			rectangle: {
				shapeOptions: {
					weight: 3,
					color: "#563d7c",
					opacity: 1,
					fillColor: "#563d7c",
					fillOpacity: 0.2
				}
			},
			circlemarker: false
		}
	});

	this.addControl( this.drawingControl );





	// Move event

	this.on("movestart zoomstart", _EVENTS.scene.unset_scene_style);

});




L.Map.include({

	importData: function(data) {
		console.log(data);
	},

	setBasemap: function(img, width, height) {
		this.removeLayer( this.basemap );

		// NOTE: finds the maximum zoom-level where the image extent does not exceed the map-projection extent
		let zoom;
		for(let i = 0; i < 18; i++) {
			let r = L.CRS.EPSG3857.pointToLatLng(L.point(width, height), i);
			if(r.lat < 90 && r.lng < 180) {
				zoom = i;
				break;
			}
		}
		if(zoom != 0 && !zoom) return;

		let bl = L.CRS.EPSG3857.pointToLatLng(L.point(0, 0), zoom),
			tr = L.CRS.EPSG3857.pointToLatLng(L.point(width, height), zoom);
		let bounds = [[bl.lat, bl.lng], [tr.lat, tr.lng]];

		this.basemap = L.imageOverlay(img, bounds, {
			zIndex: 0,
			attribution: "© <a href=\"https://tellusmap.com\" target=\"_blank\">TellUs</a>"
		});

		this.addLayer( this.basemap );
		this.fitBounds(bounds);
	},

	presetBasemap: function(name) {
		this.removeLayer( this.basemap );
		this.basemap = L.tileLayer.provider(name);
		this.addLayer( this.basemap );
	},

	resetBasemap: function() { this.presetBasemap("OpenStreetMap.HOT"); }

});
