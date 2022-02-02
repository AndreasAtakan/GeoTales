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

	this.basemapLegend = L.control.htmllegend({
		position: "bottomright",
		collapsedOnInit: true,
		disableVisibilityControls: true,
		updateOpacity: null
	});
	this.addControl( this.basemapLegend );

	this.addControl(
		L.control.zoom({ position: "bottomright" })
	);

	this.basemapButton = L.easyButton({
		id: "chooseBasemap",
		position: "bottomright",
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





	// Basemap

	this.basemap = _BASEMAPS[9].tiles;
	this.basemap.options.source = { url: this.basemap._url };
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

		let sceneId = $("#section li[class*=\"active\"]").data("id");
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
		position: "topright",
		edit: false,
		draw: {
			marker: {
				icon: L.icon({
					iconUrl: "assets/user-circle-solid.svg",
					iconSize: [30, 30],
					popupAnchor: [0, -15],
					tooltipAnchor: [0, 15]
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

	this.on("movestart", ev => { _CONTENT.sceneInactive(); });
	this.on("moveend", ev => { _IS_MAP_MOVING = false; });
	this.on("autopanstart", ev => {
		let handler = ev => {
			this.off("moveend", handler);

			let c = this.getCenter(), z = this.getZoom();
			c = this.project(c, z); c.y -= 50;
			this.setView(this.unproject(c, z), z);
		};
		this.on("moveend", handler);
	});

});




L.Map.include({

	setup: function() {
		this.enableDrawing();
		this.basemapButton.enable();

		$("div.leaflet-control-attribution a").prop("target", "_blank");
	},
	clear: function() {
		this.markerLayer.clearLayers();
		this.editLayer.clearLayers();
		this.fadeLayer.clearLayers();
	},
	reset: function() {
		this.clear();

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

	setFlyTo: function(bounds) {
		this.flyToBounds(bounds, { maxZoom: this.getMaxZoom(), noMoveStart: true, duration: _PANNINGSPEED || null });
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
		let s = _CONTENT.get(sceneId),
			prevSceneId = null; //_CONTENT.prev() ? _CONTENT.prev().id : null;

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
								break;
							}
						}
					}
				}
				else{ this.editLayer.addLayer(this.createObject(o), o.type, o.id); }
			}
		}
	},

	insertObject: function(id, sceneId) {
		if(this.editLayer.getObject(id)
		|| this.markerLayer.getObject(id)) return;

		let object;
		for(let oo of this.objects) {
			if(oo.id == id && oo.sceneId == sceneId) {
				object = this.createObject(oo);
				break;
			}
		}

		let sId = $("#section li[class*=\"active\"]").data("id");
		object.options.sceneId = sId || console.error("No active scene found");

		if(object.options.type == "marker") this.markerLayer.addLayer(object, object.options.id);
		else this.editLayer.addLayer(object, object.options.type, object.options.id);

		this.objects.push( this.extractObject(object) );
	},
	cloneAvatar: function(id, sceneId) {
		let object, zoom = this.getZoom();
		for(let o of this.objects) {
			if(o.id == id && o.sceneId == sceneId) {
				object = Object.assign({}, o);

				object.id = uuid();

				let pos = this.project(object.pos, zoom);
					pos.x += 50; pos.y += 50;
					pos = this.unproject(pos, zoom);
				object.pos = { lat: pos.lat, lng: pos.lng };

				object = this.createObject(object);
				break;
			}
		}

		this.markerLayer.addLayer(object, object.options.id);

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

	setIcon: function(id, size, icon) { this.markerLayer.setIcon(id, size, icon); },

	getBasemap: function() { return this.basemap.options.source; },

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

		switch(o.type) {
			case "marker":
				oo = L.marker(o.pos, {
					icon: L.icon({
						iconUrl: o.icon,
						iconSize: o.size,
						popupAnchor: [ 0, (-1) * (o.size[1] / 2) ],
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

	exportData: function() { return this.objects; }

});
