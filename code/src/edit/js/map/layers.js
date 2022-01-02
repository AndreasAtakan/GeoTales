/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Can Atakan <aca@tellusmap.com>, January 2022              *
*******************************************************************************/

"use strict";


L.FadeLayer = L.FeatureGroup.extend({

	addLayer: function(object, type, id) {
		L.FeatureGroup.prototype.addLayer.call(this, object);

		if(id && !object.options.id) object.options.id = id;
		if(type && !object.options.type) object.options.type = type;

		switch(object.options.type) {
			case "marker":
				$(object._icon).css("border-radius", object.options.rounded ? "50%" : "0");
				//$(object._icon).css("transform", `rotate(${object.options.angle}deg)`);
				$(object._icon).css("border", `${object.options.borderThickness}px solid ${object.options.borderColor}`);
				$(object._icon).css("filter", `
					blur(${object.options.overlayBlur}px)
					grayscale(${object.options.overlayGrayscale*100}%)
					opacity(40%)
				`);
				break;

			case "polyline":
				object.setStyle({ opacity: 0.3 });
				break;

			case "polygon":
			case "rectangle":
				object.setStyle({ opacity: 0.3 });
				object.setStyle({ fillOpacity: 0.2 });
				break;

			default:
				console.error("object type invalid");
				break;
		}

		object.on("click", ev => { _MAP.insertObject(object.options.id, object.options.sceneId); });
	},

	getObject: function(id) {
		for(let o of this.getLayers()) {
			if(o.options.id == id) {
				return o;
			}
		}

		return null;
	},

	removeLayer: function(object, id) {
		var object = object || (id ? this.getObject(id) : null);
		if(!object) return;

		object.off("click");

		L.FeatureGroup.prototype.removeLayer.call(this, object);
	},

	initialize: function(options) {
		L.FeatureGroup.prototype.initialize.call(this);

		this.options.id = uuid();
		this.options = mergeObjects(this.options, options);
	}

});


L.fadeLayer = function(options) { return new L.FadeLayer(options); };




L.EditLayer = L.FeatureGroup.extend({

	addLayer: function(object, type, id) {
		L.FeatureGroup.prototype.addLayer.call(this, object);

		object.options.id = id || uuid();
		if(type && !object.options.type) object.options.type = type;

		this.bind(object);
	},

	bind: function(object) {
		let popup = "";

		switch(object.options.type) {
			case "polyline":
				popup = polyline_popup();
				break;

			case "polygon":
			case "rectangle":
				popup = polygon_popup();
				break;

			default:
				console.error("object type invalid");
				break;
		}

		object.bindPopup(popup, { keepInView: true, maxWidth: 350, maxHeight: 450 });

		object.on("popupopen", ev => { _EVENTS.object.setup(object); });

		object.on("mouseover", ev => { _MAP.highlightObject(object.options.id); });
		object.on("mouseout", ev => { _MAP.unhighlightObject(object.options.id); });
	},

	getObject: function(id) {
		for(let o of this.getLayers()) {
			if(o.options.id == id) {
				return o;
			}
		}

		return null;
	},

	removeLayer: function(object, id) {
		var object = object || (id ? this.getObject(id) : null);
		if(!object) return;

		object.closePopup(); object.unbindPopup();

		object.off("popupopen"); object.off("mouseover"); object.off("mouseout");

		L.FeatureGroup.prototype.removeLayer.call(this, object);
	},

	initialize: function(options) {
		L.FeatureGroup.prototype.initialize.call(this);

		this.options.id = uuid();
		this.options = mergeObjects(this.options, options);

		//this.markercluster = L.markerClusterGroup();
		//L.FeatureGroup.prototype.addLayer.call(this, this.markercluster);
	}

});


L.editLayer = function(options) { return new L.EditLayer(options); };




L.MarkerLayer = L.FeatureGroup.extend({

	addLayer: function(object, id) {
		L.FeatureGroup.prototype.addLayer.call(this, object);

		object.options.id = id || uuid();
		if(!object.options.type) object.options.type = "marker";

		object.dragging.enable();

		this.bind(object);
		this.setIcon(object.options.id);
	},

	bind: function(object) {
		if(object.options.label) object.bindTooltip(object.options.label, { direction: "bottom", permanent: true });

		object.bindPopup( marker_popup() , { keepInView: true, maxWidth: 350, maxHeight: 450 } );

		object.on("popupopen", ev => { _EVENTS.object.setup(object); });

		object.on("dragend", ev => { _MAP.updateObject(object.options.id); });

		object.on("mouseover", ev => { _MAP.highlightObject(object.options.id); });
		object.on("mouseout", ev => { _MAP.unhighlightObject(object.options.id); });

		object.bindContextMenu({
			contextmenu: true,
			contextmenuItems: [
				{
					text: "Clone avatar",
					callback: ev => { _MAP.cloneAvatar(object.options.id, object.options.sceneId); },
					index: 0
				}
			]
		});
	},

	getObject: function(id) {
		for(let o of this.getLayers()) {
			if(o.options.id == id) {
				return o;
			}
		}

		return null;
	},

	setIcon: function(id, size, icon) {
		let o = this.getObject(id);
		var size = size || o.getIcon().options.iconSize,
			icon = icon || o.getIcon().options.iconUrl;

		if(size[1] < 180) { // NOTE: this is to avoid the "Too much recursion" error
			o.setIcon(
				L.icon({
					iconUrl: icon,
					iconSize: size,
					popupAnchor: [ 0, (-1) * (size[1] / 2) ],
					tooltipAnchor: [ 0, size[1] / 2 ]
				})
			);
		}

		$(o._icon).css("border-radius", o.options.rounded ? "50%" : "0");
		//$(o._icon).css("transform", `rotate(${o.options.angle}deg)`);
		$(o._icon).css("border", `${o.options.borderThickness}px solid ${o.options.borderColor}`);
		$(o._icon).css("filter", `
			blur(${o.options.overlayBlur}px)
			grayscale(${o.options.overlayGrayscale*100}%)
			drop-shadow(0 0 ${o.options.overlayBrightness}px yellow)
			opacity(${(1 - o.options.overlayTransparency)*100}%)
		`);

		o.closeTooltip();
		o.openTooltip();
	},

	removeLayer: function(object, id) {
		var object = object || (id ? this.getObject(id) : null);
		if(!object) return;

		object.slideCancel();

		object.closeTooltip(); object.unbindTooltip();

		object.closePopup(); object.unbindPopup();

		object.dragging.disable();

		object.off("popupopen"); object.off("dragend"); object.off("mouseover"); object.off("mouseout");

		L.FeatureGroup.prototype.removeLayer.call(this, object);
	},

	initialize: function(options) {
		L.FeatureGroup.prototype.initialize.call(this);

		this.options.id = uuid();
		this.options = mergeObjects(this.options, options);

		//this.markercluster = L.markerClusterGroup();
		//L.FeatureGroup.prototype.addLayer.call(this, this.markercluster);
	}

});


L.markerLayer = function(options) { return new L.MarkerLayer(options); };
