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
		L.control.zoom({ position: "bottomleft" })
	);

	this.basemapButton = L.easyButton({
		id: "chooseBasemap",
		position: "bottomleft",
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
	this.basemapButton.disable();

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

	this.basemap = L.tileLayer.provider("Esri.WorldStreetMap", { noWrap: false });
	this.basemap.options.source = { url: "Esri.WorldStreetMap" };
	this.addLayer( this.basemap );





	// Object layers

	this.objects = [];
	this.fadeLayer = L.fadeLayer();
	this.editLayer = L.editLayer();
	this.markerLayer = L.markerLayer();
	this.overlayRect = L.rectangle(this.getBounds(), { interactive: false, color: "#ffffff", weight: 2, opacity: 0.8, fill: false });

	this.addLayer( this.fadeLayer );
	this.addLayer( this.editLayer );
	this.addLayer( this.markerLayer );

	this.on(L.Draw.Event.CREATED, ev => {
		let object = ev.layer,
			type = ev.layerType;

		let sceneId = $("#sceneContainer li[class*=\"active\"]").data("sceneid");
		object.options.sceneId = sceneId || console.error("No active scene found");

		if(type == "marker") {
			object.options.ratio = 496 / 512; // NOTE: this is hard-coded from the pixel-width of 'user-circle-solid.svg'
			object.options.rounded = false;
			object.options.angle = 0;
			object.options.borderColor = "#563d7c";
			object.options.borderThickness = 0;
			object.options.overlayBlur = 0;
			object.options.overlayGrayscale = 0;
			object.options.overlayBrightness = 0;
			object.options.overlayTransparency = 0;

			this.markerLayer.addLayer(object);
		}
		else this.editLayer.addLayer(object, type);

		this.objects.push( this.extractObject(object) );

		if(!this.editHandler.enabled()) { this.editHandler.enable(); }
	});

	this.on(`${L.Draw.Event.EDITMOVE} ${L.Draw.Event.EDITRESIZE}`, ev => {
		let object = ev.layer;
		this.updateObject(object.options.id);
	});
	this.on(L.Draw.Event.EDITVERTEX, ev => {
		let object = ev.poly;
		this.updateObject(object.options.id);
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
					iconSize: [30, 30],
					popupAnchor: [0, -15],
					tooltipAnchor: [ 0, 15 ]
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

	// Disable drawing-control
	this._drawingClick = function(ev) { ev.preventDefault(); return false; };
	this.disableDrawing();


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

	this.on("movestart", ev => {
		let activeScene = $("#sceneContainer li.active").data("sceneid");
		if(!activeScene) return;

		$(`li[data-sceneid="${activeScene}"]`).removeClass("active");
		$(`li[data-sceneid="${activeScene}"]`).addClass("inactive");
	});

});




L.Map.include({

	setup: function() {
		this.enableDrawing();
		this.basemapButton.enable();
	},
	reset: function() {
		this.markerLayer.clearLayers();
		this.editLayer.clearLayers();
		this.fadeLayer.clearLayers();
		this.removeLayer(this.overlayRect);

		this.disableDrawing();
		this.basemapButton.disable();
	},

	enableDrawing: function() {
		let buttons = [ $(".leaflet-draw-draw-polyline"), $(".leaflet-draw-draw-polygon"), $(".leaflet-draw-draw-rectangle"), $(".leaflet-draw-draw-marker") ];
		for(let b of buttons) {
			b.removeClass("draw-control-disabled");
			b.unbind("click", this._drawingClick);
		}
	},
	disableDrawing: function() {
		let buttons = [ $(".leaflet-draw-draw-polyline"), $(".leaflet-draw-draw-polygon"), $(".leaflet-draw-draw-rectangle"), $(".leaflet-draw-draw-marker") ];
		for(let b of buttons) {
			b.addClass("draw-control-disabled");
			b.click(this._drawingClick);
		}
	},

	setOverlay: function() { // TODO
		return;

		this.on("moveend", ev => {
			this.off("moveend");

			if(!this.hasLayer(this.overlayRect)) this.addLayer(this.overlayRect);
			this.overlayRect.setBounds( this.getBounds() );
			this.overlayRect.redraw();
			this.overlayRect.bringToBack(); this.basemap.bringToBack();

			// NOTE: overlayRect lingers on last scene's bounds, I have no idea why. this.getBounds returns correct values
		});

		/*let c = this.project(center, zoom),
			half = this.getSize().divideBy(2);
		let tl = this.unproject(c.subtract(half)),
			br = this.unproject(c.add(half));

		console.log(tl, br); // NOTE: tl and br are WAY too big, something goes wrong with the project/unproject. Fix this!
		this.overlayRect.setLatLngs([
			[[85.06,-180], [85.06,180], [-85.06,180], [-85.06,-180]],
			[[tl.lat, tl.lng], [tl.lat, br.lng], [br.lat, br.lng], [br.lat, tl.lng]]
		]);*/
	},
	setFlyTo: function(center, zoom) {
		this.setOverlay();
		this.flyTo(center, zoom, { noMoveStart: true, duration: _PANNINGSPEED || null });
	},

	deleteScene: function(sceneId) {
		let newO = [];

		for(let o of this.objects) {
			if(o.sceneId != sceneId) newO.push(o);
		}

		this.objects = newO;
	},

	highlightObject: function(id) {
		let o = this.fadeLayer.getObject(id);
		if(!o) return;

		if(o.options.type == "marker") {
			$(o._icon).css("filter", `
				blur(${o.options.overlayBlur}px)
				grayscale(${o.options.overlayGrayscale*100}%)
				opacity(70%)
			`);
		} else o.setStyle({ opacity: 0.8 });
	},
	unhighlightObject: function(id) {
		let o = this.fadeLayer.getObject(id);
		if(!o) return;

		if(o.options.type == "marker") {
			$(o._icon).css("filter", `
				blur(${o.options.overlayBlur}px)
				grayscale(${o.options.overlayGrayscale*100}%)
				opacity(40%)
			`);
		} else o.setStyle({ opacity: 0.3 });
	},

	setObjects: function(sceneId, animate) {
		let s = get_scene(sceneId),
			prevSceneId = s.index > 0 ? _SCENES[s.index - 1].id : null;

		this.fadeLayer.clearLayers();
		if(prevSceneId) {
			for(let o of this.objects) {
				if(o.sceneId == prevSceneId) this.fadeLayer.addLayer(this.createObject(o), o.type, o.id);
			}
		}

		let os = this.markerLayer.getLayers().map(o => {
			let r = this.extractObject(o); return { id: r.id, pos: r.pos };
		});
		this.markerLayer.clearLayers();
		this.editLayer.clearLayers();
		for(let o of this.objects) {
			if(o.sceneId == sceneId) {
				if(o.type == "marker") {
					let m = this.createObject(o);
					this.markerLayer.addLayer(m, o.id);

					if(animate) {
						for(let oo of os) {
							if(o.id == oo.id) {
								m.setLatLng(oo.pos);
								m.slideTo(o.pos, { duration: _AVATARSPEED });
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
				else this.editLayer.addLayer(this.createObject(o), o.type, o.id);
			}
		}
	},

	insertObject: function(o) {
		if(this.editLayer.getObject(o.options.id)
		|| this.markerLayer.getObject(o.options.id)) return;

		let object;
		for(let oo of this.objects) {
			if(oo.id == o.options.id && oo.sceneId == o.options.sceneId) {
				object = this.createObject(oo);
				break;
			}
		}

		let sceneId = $("#sceneContainer li[class*=\"active\"]").data("sceneid");
		object.options.sceneId = sceneId || console.error("No active scene found");

		if(object.options.type == "marker") this.markerLayer.addLayer(object, object.options.id);
		else this.editLayer.addLayer(object, object.options.type, object.options.id);

		this.objects.push( this.extractObject(object) );
	},

	updateObject: function(id) {
		let object = this.editLayer.getObject(id) || this.markerLayer.getObject(id);

		for(let i = 0; i < this.objects.length; i++) {
			let o = this.objects[i];
			if(o.id == id && o.sceneId == object.options.sceneId) {
				this.objects[i] = this.extractObject(object);
				break;
			}
		}
	},

	deleteObject: function(id, type) {
		let object = this.editLayer.getObject(id) || this.markerLayer.getObject(id);
		let sceneId = object.options.sceneId;

		if(type == "marker") this.markerLayer.removeLayer(object);
		else this.editLayer.removeLayer(object);

		for(let i = 0; i < this.objects.length; i++) {
			let o = this.objects[i];
			if(o.id == id && o.sceneId == sceneId) {
				this.objects.splice(i, 1);
				break;
			}
		}
	},

	globalObjectOptions: function(id) {
		let object = this.editLayer.getObject(id) || this.markerLayer.getObject(id);
		let o = this.extractObject(object);
		delete o.id; delete o.sceneId; delete o.type; delete o.pos;

		for(let i = 0; i < this.objects.length; i++) {
			let oo = this.objects[i];
			if(oo.id == id && oo.sceneId != object.options.sceneId) {
				this.objects[i] = mergeObjects(oo, o);
			}
		}

		object = this.fadeLayer.getObject(id);
		if(object) {
			this.fadeLayer.removeLayer(object);

			let oo = mergeObjects(this.extractObject(object), o);
			this.fadeLayer.addLayer(this.createObject(oo), oo.type, oo.id);
		}
	},

	setIcon: function(id, size, icon) {
		this.markerLayer.setIcon(id, size, icon);
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
			this.basemap = L.tileLayer.provider(url, { noWrap: false });
		}else{
			this.basemap = L.tileLayer(url, {
				attribution: cc,
				minZoom: minZoom,
				maxZoom: maxZoom,
				noWrap: false
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
					icon: L.icon({
						iconUrl: o.icon,
						iconSize: o.size,
						popupAnchor: [0, (-1) * (o.size[1] / 2)],
						tooltipAnchor: [ 0, o.size[1] / 2 ]
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
	},

	exportData: function() {
		return this.objects;
	}

});
