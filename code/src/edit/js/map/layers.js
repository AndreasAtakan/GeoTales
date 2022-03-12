/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

"use strict";


L.FadeLayer = L.FeatureGroup.extend({
	addLayer: function(object, type, id) {
		L.FeatureGroup.prototype.addLayer.call(this, object);
		if(id && !object.options.id) object.options.id = id;
		if(type && !object.options.type) object.options.type = type;

		switch(object.options.type) {
			case "avatar":
				object.setOpacity(0.3);
				$(object._image).css("border-radius", object.options.rounded ? "50%" : "0");
				//$(object._image).css("transform", `rotate(${object.options.angle}deg)`);
				$(object._image).css("border", `${object.options.borderThickness}px solid ${object.options.borderColor}`);
				$(object._image).css("filter", `
					blur(${object.options.overlayBlur}px)
					grayscale(${object.options.overlayGrayscale*100}%)
				`);
				break;

			case "polyline":
			case "polygon":
				object.setStyle({ opacity: 0.3 });
				object.setStyle({ fillOpacity: 0.2 });
				break;

			default: console.error("object type invalid"); break;
		}
		object.on("click", ev => { _MAP.insertObject(object.options.id, object.options.sceneId); });
	},

	getObject: function(id) {
		for(let o of this.getLayers()) {
			if(o.options.id == id) { return o; }
		}
		return null;
	},

	removeLayer: function(object, id) {
		var object = object || (id ? this.getObject(id) : null);
		if(!object) { return; }
		object.off("click");
		L.FeatureGroup.prototype.removeLayer.call(this, object);
	},

	initialize: function(options) {
		L.FeatureGroup.prototype.initialize.call(this);
		this.options.id = uuid();
		this.options = Object.assign({}, this.options, options);
	}
});
L.fadeLayer = function(options) { return new L.FadeLayer(options); };




L.ObjectLayer = L.FeatureGroup.extend({

	addLayer: function(object, type, id) {
		object.options.id = id || uuid();
		if(type && !object.options.type) { object.options.type = type; }

		switch(object.options.type) {
			case "avatar":
				this.avatarLayer.addLayer(object);
				break;

			case "polyline":
			case "polygon":
				this.editLayer.addLayer(object);
				break;

			default: console.error("object type invalid"); break;
		}
	},

	getObject: function(id) {
		for(let o of this.avatarLayer.getLayers().concat(this.editLayer.getLayers())) {
			if(o.options.id == id) { return o; }
		}
		return null;
	},

	getLayers: function() {
		return this.avatarLayer.getLayers().concat(this.editLayer.getLayers());
	},

	setIcon: function(id, size, icon) { this.avatarLayer.setIcon(id, size, icon); },

	removeLayer: function(object, id) {
		var object = object || (id ? this.getObject(id) : null);
		if(!object) { return; }

		switch(object.options.type) {
			case "avatar":
				this.avatarLayer.removeLayer(object);
				break;

			case "polyline":
			case "polygon":
				this.editLayer.removeLayer(object);
				break;

			default: console.error("object type invalid"); break;
		}
	},

	clearLayers: function() {
		this.avatarLayer.clearLayers();
		this.editLayer.clearLayers();
	},

	initialize: function(options) {
		L.FeatureGroup.prototype.initialize.call(this);
		this.options.id = uuid();
		this.options = Object.assign({}, this.options, options);

		this.avatarLayer = L.avatarLayer();
		this.editLayer = L.editLayer();

		L.FeatureGroup.prototype.addLayer.call(this, this.avatarLayer);
		L.FeatureGroup.prototype.addLayer.call(this, this.editLayer);
	}
});
L.objectLayer = function(options) { return new L.ObjectLayer(options); };
