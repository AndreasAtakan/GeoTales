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


L.ObjectLayer = L.FeatureGroup.extend({

	addLayer: function(object, type, id) {
		L.FeatureGroup.prototype.addLayer.call(this, object);

		object.options.id = id || uuid();
		if(type && !object.options.type) object.options.type = type;

		if(object.options.type == "marker") {
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

		if(label) o.bindTooltip(label, { direction: "bottom", permanent: true });
	},

	getObject: function(id) {
		for(let o of this.getLayers()) {
			if(o.options.id == id) {
				return o;
			}
		}

		return null;
	},

	setIcon: function(id) {
		let o = this.getObject(id);

		$(o._icon).css("border-radius", o.options.rounded ? "50%" : "0");
		//$(o._icon).css("transform", `rotate(${o.options.angle}deg)`);
		$(o._icon).css("border", `${o.options.borderThickness}px solid ${o.options.borderColor}`);
		$(o._icon).css("filter", `
			blur(${o.options.overlayBlur}px)
			grayscale(${o.options.overlayGrayscale*100}%)
			drop-shadow(0 0 ${o.options.overlayBrightness}px yellow)
			opacity(${(1 - o.options.overlayTransparency)*100}%)
		`);
	},

	removeLayer: function(object, id) {
		var object = object || (id ? this.getObject(id) : null);
		if(!object) return;

		if(object.options.type == "marker") {
			object.slideCancel();
			object.closeTooltip();
			object.unbindTooltip();
		}

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


L.objectLayer = function(options) {
	return new L.ObjectLayer(options);
};
