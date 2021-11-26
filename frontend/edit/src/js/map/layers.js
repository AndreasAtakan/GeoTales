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


L.FadeLayer = L.FeatureGroup.extend({

	addLayer: function(object, type, id) {
		L.FeatureGroup.prototype.addLayer.call(this, object);

		if(id && !object.options.id) object.options.id = id;
		if(type && !object.options.type) object.options.type = type;

		switch(object.options.type) {
			case "marker":
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

		object.on("click", ev => { _MAP.insertObject(object); });
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


L.fadeLayer = function(options) {
	return new L.FadeLayer(options);
};




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

		object.bindPopup(popup, {
			keepInView: true,
			maxWidth: 350,
			maxHeight: 450
		});

		object.on("click", ev => { _EVENTS.object.setup(object); });

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

		object.closePopup();
		object.unbindPopup();

		object.off("click"); object.off("mouseover"); object.off("mouseout");

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


L.editLayer = function(options) {
	return new L.EditLayer(options);
};




L.MarkerLayer = L.FeatureGroup.extend({

	addLayer: function(object, id) {
		L.FeatureGroup.prototype.addLayer.call(this, object);

		object.options.id = id || uuid();
		if(!object.options.type)				object.options.type = "marker";
		if(!object.options.borderColor)			object.options.borderColor = "#563d7c";
		if(!object.options.borderThickness)		object.options.borderThickness = 0;
		if(!object.options.overlayBlur)			object.options.overlayBlur = 0;
		if(!object.options.overlayGrayscale)	object.options.overlayGrayscale = 0;
		if(!object.options.overlayBrightness)	object.options.overlayBrightness = 0;
		if(!object.options.overlayTransparency)	object.options.overlayTransparency = 0;

		$(object._icon).css("border", `${object.options.borderThickness}px solid ${object.options.borderColor}`);
		$(object._icon).css("filter", `
			blur(${object.options.overlayBlur}px)
			grayscale(${object.options.overlayGrayscale*100}%)
			drop-shadow(0 0 ${object.options.overlayBrightness}px yellow)
			opacity(${(1 - object.options.overlayTransparency)*100}%)
		`);

		object.dragging.enable();

		this.bind(object);
	},

	bind: function(object) {
		object.bindPopup( marker_popup() , {
			keepInView: true,
			maxWidth: 350,
			maxHeight: 450
		});

		object.on("click", ev => { _EVENTS.object.setup(object); });

		object.on("dragend", ev => { _MAP.updateObject(object.options.id); });

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

		object.slideCancel();

		object.closePopup();
		object.unbindPopup();

		object.dragging.disable();

		object.off("click"); object.off("dragend"); object.off("mouseover"); object.off("mouseout");

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


L.markerLayer = function(options) {
	return new L.MarkerLayer(options);
};
