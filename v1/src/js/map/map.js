/*©agpl*************************************************************************
*                                                                              *
* DynastyMap                                                                   *
* Copyright (C) 2021  DynastyMap AS                                            *
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
				onClick: function(button, map) { _EVENTS.scene.set_scene(); },
				title: "Go to current scene",
				icon: "fa-expand"
			}
		]
	});
	this.addControl( this.sceneButton );
	this.sceneButton.disable();

	/*this.addControl( L.Control.zoomHome({ position: "topright" }) );*/

	/*this.addControl( L.control.locate({ position: "topright" }) );*/





	// Basemap

	this.addLayer(
		L.tileLayer.provider("OpenStreetMap.HOT")
	);





	// Drawing layer

	this.drawingLayer = L.drawingLayer({
		id: "0",
		title: "drawing layer",
		lineThickness: 4,
		lineColor: "#ff9900",
		lineTransparency: 0.5,
		fillColor: "#ff9900",
		fillTransparency: 0.8
	});

	this.addLayer( this.drawingLayer );

	this.on(L.Draw.Event.CREATED, ev => {
		let object = ev.layer,
			type = ev.layerType;

		this.drawingLayer.addLayer(object, type);
	});

	this.on(L.Draw.Event.EDITED, ev => {
		//let layers = ev.layers;
	});





	// Draw control

	L.EditToolbar.Delete.include({
		removeAllLayers: false
	});

	this.drawingControl = new L.Control.Draw({
		position: "bottomleft",
		edit: { featureGroup: this.drawingLayer },
		draw: {
			marker: {},
			polyline: {
				shapeOptions: {
					color: "#ff9900",
					fillColor: "#ff9900"
				}
			},
			polygon: {
				shapeOptions: {
					color: "#ff9900",
					fillColor: "#ff9900"
				}
			},
			circle: false,
			rectangle: {
				shapeOptions: {
					color: "#ff9900",
					fillColor: "#ff9900"
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
	}

});
