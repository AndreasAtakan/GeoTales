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

	this.basemapButton = L.easyButton({
		id: "chooseBasemap",
		position: "topright",
		leafletClasses: true,
		states: [
			{
				stateName: "main",
				onClick: function(button, map) { $("#basemapModal").modal("show"); },
				title: "Choose a basemap",
				icon: "fa-layer-group"
			}
		]
	});
	this.addControl( this.basemapButton );

	/*this.addControl( L.Control.zoomHome({ position: "topright" }) );*/

	/*this.addControl( L.control.locate({ position: "topright" }) );*/





	// Basemap

	this.basemap = L.tileLayer.provider("OpenStreetMap.HOT");
	this.basemap.options.source = { name: "OpenStreetMap.HOT" };
	this.addLayer( this.basemap );





	// Object layers

	this.objects = [];
	this.fadeLayer = L.fadeLayer();
	this.editLayer = L.editLayer();
	this.markerLayer = L.markerLayer();

	this.addLayer( this.fadeLayer );
	this.addLayer( this.editLayer );
	this.addLayer( this.markerLayer );

	this.on(L.Draw.Event.CREATED, ev => {
		let object = ev.layer,
			type = ev.layerType;

		if(type == "marker") this.markerLayer.addLayer(object);
		else this.editLayer.addLayer(object, type);

		if(!this.editHandler.enabled()) { this.editHandler.enable(); }
	});





	// Draw and edit control

	L.EditToolbar.Delete.include({ removeAllLayers: false });
	this.drawingControl = new L.Control.Draw({
		position: "topleft",
		edit: false,
		draw: {
			marker: {
				icon: L.icon({
					iconUrl: "assets/user-circle-solid.svg",
					iconSize: [50, 50],
					popupAnchor: [0, -25],
					className: "markerIcon"
				})
			},
			polyline: {
				shapeOptions: { weight: 3, color: "#563d7c", opacity: 1 }
			},
			polygon: {
				shapeOptions: { weight: 3, color: "#563d7c", opacity: 1, fillColor: "#563d7c", fillOpacity: 0.2 }
			},
			rectangle: {
				shapeOptions: { weight: 3, color: "#563d7c", opacity: 1, fillColor: "#563d7c", fillOpacity: 0.2 }
			},
			circle: false,
			circlemarker: false
		}
	});
	L.drawLocal.draw.toolbar.buttons.marker = "Place an avatar";
	L.drawLocal.draw.handlers.marker.tooltip.start = "Click map to place avatar.";
	L.drawLocal.edit.handlers.edit.tooltip.text = null; // NOTE: removes the instructions-tooltip for editing mode
	L.drawLocal.edit.handlers.edit.tooltip.subtext = null;
	L.drawLocal.edit.handlers.remove.tooltip.text = null;

	this.addControl( this.drawingControl );

	this.editControl = new L.EditToolbar({
		edit: {
			selectedPathOptions: {
				dashArray: "none",
				maintainColor: true
			}
		},
		featureGroup: this.editLayer
	});

	delete this.editControl.options.edit.selectedPathOptions.fillOpacity; // NOTE: this is a crazy hack, but necessary to make use that the fill opacity of the map objects are not changed when entered into editing mode
	this.editHandler = this.editControl.getModeHandlers()[0].handler;
	this.editHandler._map = this; // NOTE: this is also a hack, but necessary to make editing work
	//L.Edit.Marker = null; // NOTE: to no one's surprise, this is also a hack. Removes the marker editing-style

});




L.Map.include({

	captureScene: function(sceneId) {
		let bounds = this.getBounds(), os = {};

		for(let m of this.markerLayer.getLayers()) {
			if( bounds.contains( m.getLatLng() ) ) {
				m.options.sceneId = sceneId;
				os[m.options.id] = this.extractObject(m);
			}
		}

		for(let o of this.editLayer.getLayers()) {
			if( bounds.overlaps( o.getBounds() ) ) {
				o.options.sceneId = sceneId;
				os[o.options.id] = this.extractObject(o);
			}
		}

		for(let i = 0; i < this.objects.length; i++) {
			let o = this.objects[i];
			if(os[o.id] && o.sceneId == sceneId) {
				this.objects[i] = os[o.id];
				delete os[o.id];
			}
		}
		for(let o in os) { this.objects.push( os[o] ); }
	},

	deleteScene: function(sceneId) {
		let newO = [];

		for(let o of this.objects) {
			if(o.sceneId != sceneId) {
				newO.push(o);
			}
		}

		this.objects = newO;
	},

	setObjects: function(sceneId, _new) {
		let s = get_scene(sceneId),
			prevSceneId = s.index > 0 ? _SCENES[s.index - 1].id : null;

		for(let o of this.editLayer.getLayers()) { if(o.options.sceneId) this.editLayer.removeLayer(o); }
		for(let o of this.markerLayer.getLayers()) { if(o.options.sceneId) this.markerLayer.removeLayer(o); }
		for(let o of this.objects) {
			if(o.sceneId == sceneId) {
				if(o.type == "marker") this.markerLayer.addLayer(this.createObject(o), o.id);
				else this.editLayer.addLayer(this.createObject(o), o.type, o.id);
			}
		}

		this.fadeLayer.clearLayers();
		if(prevSceneId) {
			for(let o of this.objects) {
				if(o.sceneId == prevSceneId) {
					this.fadeLayer.addLayer(this.createObject(o), o.type, o.id);

					if(_new) {
						let oo = this.createObject(o);
						delete oo.options.sceneId;

						if(o.type == "marker") this.markerLayer.addLayer(oo, o.id);
						else this.editLayer.addLayer(oo, o.type, o.id);
					}
				}
			}
		}
	},

	deleteObject: function(id, type) {
		let object = null;

		if(type == "marker") {
			for(let m of this.markerLayer.getLayers()) {
				if(m.options.id == id) {
					object = m;
					this.markerLayer.removeLayer(m);
				}
			}
		}else{
			for(let o of this.editLayer.getLayers()) {
				if(o.options.id == id) {
					object = o;
					this.editLayer.removeLayer(o);
				}
			}
		}

		if(object.options.sceneId) {
			for(let i = 0; i < this.objects.length; i++) {
				let o = this.objects[i];
				if(o.id == id && o.sceneId == object.options.sceneId) {
					this.objects.splice(i, 1);
					break;
				}
			}
		}
	},

	getBasemap: function() {
		return this.basemap.options.source;
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
		this.basemap.options.source = { url: img };

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
		this.basemap.options.source = { name: name };

		this.presetZoom(basemap.zoom[0], basemap.zoom[1]);

		this.addLayer( this.basemap );

		$("div.leaflet-control-attribution a").prop("target", "_blank");
	},

	resetBasemap: function() { this.presetBasemap("OpenStreetMap.HOT"); },

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
			case "marker":
				oo = L.marker(o.pos, {
					icon: L.icon({
						iconUrl: o.icon,
						iconSize: [50, 50],
						popupAnchor: [0, -25],
						className: "markerIcon"
					})
				});
				oo.options.borderColor = o.borderColor;
				oo.options.borderThickness = o.borderThickness;
				oo.options.overlayBlur = o.blur;
				oo.options.overlayTransparency = o.transparency;
				oo.options.overlayGrayscale = o.grayscale;
				break;

			case "polyline":
				oo = L.polyline(o.pos, {
					color:		o.color,
					weight:		o.thickness,
					opacity:	1 - o.transparency
				});
				break;

			case "polygon":
				oo = L.polygon(o.pos, {
					color:			o.lineColor,
					weight:			o.lineThickness,
					opacity:		1 - o.lineTransparency,
					fillColor:		o.fillColor,
					fillOpacity:	1 - o.fillTransparency
				});
				break;

			case "rectangle":
				oo = L.rectangle(o.pos, {
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

		switch(o.options.type) {
			case "marker":
				oo = {
					id:					o.options.id,
					sceneId:			o.options.sceneId,
					type:				o.options.type,
					pos:				o.getLatLng(),
					icon:				o.getIcon().options.iconUrl,
					borderColor:		o.options.borderColor,
					borderThickness:	o.options.borderThickness,
					blur:				o.options.overlayBlur,
					transparency:		o.options.overlayTransparency,
					grayscale:			o.options.overlayGrayscale
				};
				break;

			case "polyline":
				oo = {
					id:				o.options.id,
					sceneId:		o.options.sceneId,
					type:			o.options.type,
					pos:			o.getLatLngs(),
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
					pos:				o.getLatLngs(),
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
		console.log(data);
	},

	exportData: function() {
		return this.objects;
	}

});
