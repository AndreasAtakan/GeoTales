/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

"use strict";


L.ObjectLayer = L.FeatureGroup.extend({

	addLayer: function(object, type, id) {
		L.FeatureGroup.prototype.addLayer.call(this, object);

		object.options.id = id || uuid();
		if(type && !object.options.type) { object.options.type = type; }

		if(object.options.type == "avatar") {
			//if(!object.options.angle)				object.options.angle = 0;
			if(!object.options.borderColor)			object.options.borderColor = "#563d7c";
			if(!object.options.borderThickness)		object.options.borderThickness = 0;
			if(!object.options.overlayBlur)			object.options.overlayBlur = 0;
			if(!object.options.overlayGrayscale)	object.options.overlayGrayscale = 0;
			if(!object.options.overlayBrightness)	object.options.overlayBrightness = 0;
			if(!object.options.overlayTransparency)	object.options.overlayTransparency = 0;

			this.setIcon(object.options.id);
		}

		this.bind(object.options.id);
	},

	bind: function(id) {
		let o = this.getObject(id);

		let label = o.options.label;
		if(label) { o.bindTooltip(label, { direction: "bottom", permanent: true }); }
	},

	unbind: function(id) {
		let o = this.getObject(id);

		o.closeTooltip(); o.unbindTooltip();
		if(o.options.type == "avatar") { o.slideCancel(); }
	},

	getObject: function(id) {
		for(let o of this.getLayers()) {
			if(o.options.id == id) { return o; }
		}
		return null;
	},

	setIcon: function(id) {
		let o = this.getObject(id);

		$(o._image).css("border-radius", o.options.rounded ? "50%" : "0");
		//$(o._image).css("transform", `rotate(${o.options.angle}deg)`);
		$(o._image).css("border", `${o.options.borderThickness}px solid ${o.options.borderColor}`);
		$(o._image).css("filter", `
			blur(${o.options.overlayBlur}px)
			grayscale(${o.options.overlayGrayscale*100}%)
			drop-shadow(0 0 ${o.options.overlayBrightness}px yellow)
			opacity(${(1 - o.options.overlayTransparency)*100}%)
		`);
	},

	removeLayer: function(object, id) {
		var object = object || (id ? this.getObject(id) : null);
		if(!object) return;

		this.unbind(object.options.id);

		L.FeatureGroup.prototype.removeLayer.call(this, object);
	},

	initialize: function(options) {
		L.FeatureGroup.prototype.initialize.call(this);

		this.options.id = uuid();
		this.options = Object.assign({}, this.options, options);
	}

});


L.objectLayer = function(options) { return new L.ObjectLayer(options); };
