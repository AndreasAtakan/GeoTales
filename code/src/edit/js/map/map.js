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
	this.objectLayer = L.objectLayer();

	this.addLayer( this.fadeLayer );
	this.addLayer( this.objectLayer );

	this.on(L.Draw.Event.CREATED, ev => {
		let object = ev.layer,
			type = ev.layerType;

		switch(type) {
			case "circlemarker":
				let latlng = object.getLatLng();
				object = L.popup({
						keepInView: true,
						closeButton: false,
						autoClose: false,
						closeOnEscapeKey: false,
						closeOnClick: false,
						maxWidth: 3500,
						maxHeight: 450,
						autoPanPadding: L.point(60,60)
					})
					.setLatLng(latlng);
				type = "textbox";
				break;

			default: break;
		}

		object.options.contentId = _CONTENT.active;

		this.objectLayer.addLayer(object, type);
		this.objects.push( this.extractObject(object) );
	});

	this.on(`${L.Draw.Event.EDITMOVE} ${L.Draw.Event.EDITRESIZE} ${L.Draw.Event.EDITVERTEX}`, ev => {
		let object = ev.layer || ev.poly;
		this.updateObject(object.options.id);
	});





	// Draw and edit control

	L.drawLocal.draw.toolbar.buttons.marker = "Place an avatar";
	L.drawLocal.draw.handlers.marker.tooltip.start = "Click map to place.";
	L.drawLocal.edit.handlers.edit.tooltip.text = null; // NOTE: removes the instructions-tooltip for editing mode
	L.drawLocal.edit.handlers.edit.tooltip.subtext = null;
	L.drawLocal.edit.handlers.remove.tooltip.text = null;
	L.EditToolbar.Delete.include({ removeAllLayers: false });
	L.DrawToolbar.include({
		getModeHandlers: function(map) {
			return [
				{ enabled: this.options.polyline, handler: new L.Draw.Polyline(map, this.options.polyline), title: L.drawLocal.draw.toolbar.buttons.polyline },
				{ enabled: this.options.polygon, handler: new L.Draw.Polygon(map, this.options.polygon), title: L.drawLocal.draw.toolbar.buttons.polygon },
				{ enabled: this.options.rectangle, handler: new L.Draw.Rectangle(map, this.options.rectangle), title: L.drawLocal.draw.toolbar.buttons.rectangle },
				{ enabled: this.options.circle, handler: new L.Draw.Circle(map, this.options.circle), title: L.drawLocal.draw.toolbar.buttons.circle },
				{ enabled: this.options.circlemarker, handler: new L.Draw.CircleMarker(map, this.options.circlemarker), title: L.drawLocal.draw.toolbar.buttons.circlemarker },
				{ enabled: this.options.marker, handler: new L.Draw.Marker(map, this.options.marker), title: L.drawLocal.draw.toolbar.buttons.marker },
				{
					enabled: this.options.textbox,
					handler: new L.Draw.CircleMarker(map, { color: "#000000", radius: 5 }),
					title: "Place a textbox"
				}
			];
		}
	});
	this.addControl(
		new L.Control.Draw({
			position: "topright",
			edit: false,
			draw: {
				textbox: true,
				marker: {
					icon: L.icon({ iconUrl: "assets/user-circle-solid.svg", iconSize: [30, 30], popupAnchor: [0, -15], tooltipAnchor: [0, 15] })
				},
				polyline: { shapeOptions: { weight: 3, color: "#563d7c", opacity: 1 } },
				polygon: { shapeOptions: { weight: 3, color: "#563d7c", opacity: 1, fillColor: "#563d7c", fillOpacity: 0.2 } },
				rectangle: { shapeOptions: { weight: 3, color: "#563d7c", opacity: 1, fillColor: "#563d7c", fillOpacity: 0.2 } },
				circle: false,
				circlemarker: false
			}
		})
	);
	this.disableDrawing(); // Disable drawing-control


	this.on("movestart", ev => { _CONTENT.sceneInactive(); });
	this.on("moveend", ev => { _IS_MAP_MOVING = false; });

});





L.Map.include({

	setup: function() {
		this.enableDrawing();
		this.basemapButton.enable();

		$("div.leaflet-control-attribution a").prop("target", "_blank");
	},
	clear: function() {
		this.objectLayer.clearLayers();
		this.fadeLayer.clearLayers();
	},
	reset: function() {
		this.clear();

		this.disableDrawing();
		this.basemapButton.disable();
	},

	enableDrawing: function() {
		for(let b of [$(".leaflet-draw-draw-polyline"), $(".leaflet-draw-draw-polygon"), $(".leaflet-draw-draw-rectangle"), $(".leaflet-draw-draw-marker")]) {
			b.removeClass("draw-control-disabled");
		}
	},
	disableDrawing: function() {
		for(let b of [$(".leaflet-draw-draw-polyline"), $(".leaflet-draw-draw-polygon"), $(".leaflet-draw-draw-rectangle"), $(".leaflet-draw-draw-marker")]) {
			b.addClass("draw-control-disabled");
		}
	},

	setFlyTo: function(bounds) {
		this.flyToBounds(bounds, { maxZoom: this.getMaxZoom(), noMoveStart: true, duration: _PANNINGSPEED || null });
	},

	deleteScene: function(contentId) {
		this.objects = this.objects.filter(o => o.contentId != contentId);
	},

	highlightObject: function(id) {
		let o = this.fadeLayer.getObject(id);
		if(!o) { return; }

		if(o.options.type == "marker") {
			$(o._icon).css("filter", `
				blur(${o.options.overlayBlur}px)
				grayscale(${o.options.overlayGrayscale*100}%)
				opacity(70%)
			`);
		}
		else{ o.setStyle({ opacity: 0.8 }); }
	},
	unhighlightObject: function(id) {
		let o = this.fadeLayer.getObject(id);
		if(!o) { return; }

		if(o.options.type == "marker") {
			$(o._icon).css("filter", `
				blur(${o.options.overlayBlur}px)
				grayscale(${o.options.overlayGrayscale*100}%)
				opacity(40%)
			`);
		}
		else{ o.setStyle({ opacity: 0.3 }); }
	},

	setObjects: function(contentId, animate) { // !!!!!!!!!!!!!! TODO
		let prev = _CONTENT.getPrevScene(contentId);
		let prevId = prev ? prev.id : null;

		this.fadeLayer.clearLayers();
		if(prevId) {
			for(let o of this.objects) {
				if(o.contentId == prevId) { this.fadeLayer.addLayer(this.createObject(o), o.type, o.id); }
			}
		}

		let os = this.objectLayer.getLayers().filter(o => o.options.type == "marker").map(o => {
			let r = this.extractObject(o); return { id: r.id, pos: r.pos };
		});
		this.objectLayer.clearLayers();
		for(let o of this.objects) {
			if(o.contentId == contentId) {
				let object = this.createObject(o);
				this.objectLayer.addLayer(object, o.type, o.id);

				if(animate && o.type == "marker") {
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

	insertObject: function(id, contentId) {
		if(this.objectLayer.getObject(id)) { return; }

		let object;
		for(let o of this.objects) {
			if(o.id == id && o.contentId == contentId) {
				object = Object.assign({}, o);
				break;
			}
		}
		object.contentId = _CONTENT.active;

		this.objectLayer.addLayer(this.createObject(object), object.type, object.id);
		this.objects.push(object);
	},
	cloneAvatar: function(id, contentId) {
		let object, zoom = this.getZoom();
		for(let o of this.objects) {
			if(o.id == id && o.contentId == contentId) {
				object = Object.assign({}, o);
				break;
			}
		}

		object.id = uuid();

		let pos = this.project(object.pos, zoom);
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
			if(o.id == id && o.contentId == object.options.contentId) {
				this.objects[i] = this.extractObject(object);
				break;
			}
		}
	},

	deleteObject: function(id, type) {
		let object = this.objectLayer.getObject(id);
		let contentId = object.options.contentId;

		this.objectLayer.removeLayer(object);

		for(let i = 0; i < this.objects.length; i++) {
			let o = this.objects[i];
			if(o.id == id && o.contentId == contentId) {
				this.objects.splice(i, 1);
				break;
			}
		}
	},

	globalObjectOptions: function(id) {
		let object = this.objectLayer.getObject(id);
		let o = this.extractObject(object);
		delete o.id; delete o.contentId; delete o.type; delete o.pos;

		for(let i = 0; i < this.objects.length; i++) {
			let oo = this.objects[i];
			if(oo.id == id && oo.contentId != object.options.contentId) {
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
			zIndex: 0, attribution: `&copy; <a href="https://${_HOST}" target="_blank">TellUs</a>`
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
		oo.options.contentId = o.contentId;
		oo.options.type = o.type;

		return oo;
	},

	extractObject: function(o) {
		let oo = null;

		switch(o.options.type) {
			case "marker":
				oo = {
					id:					o.options.id,
					contentId:			o.options.contentId,
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
					contentId:		o.options.contentId,
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
					contentId:			o.options.contentId,
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
