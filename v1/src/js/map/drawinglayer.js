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


L.DrawingLayer = L.FeatureGroup.extend({

	addLayer: function(object, type, id) {
		L.FeatureGroup.prototype.addLayer.call(this, object);

		if(object.options.id && !type) {
			if(this._objects.map(o => o.options.id).indexOf(object.options.id) > -1) {
				this.bind(object);
				_EVENTS.object.set_marker_style(object);
				return;
			}
		}

		var id = id || uuid();

		if(id) object.options.id = id;
		if(type) object.options.type = type;

		if(type == "marker") {
			object.options.borderColor = "#563d7c";
			object.options.borderThickness = "0";
			$(object._icon).css("border", "0px solid #563d7c");
		}

		this._objects.push(object);

		this.bind(object);
	},

	bind: function(object) {
		let popup;
		switch(object.options.type) {
			case "marker":
				popup = marker_popup();
				break;

			case "polyline":
				popup = polyline_popup();
				break;

			case "polygon":
			case "rectangle":
				popup = polygon_popup();
				break;

			default:
				popup = "";
		}
		object.bindPopup(popup, {
			keepInView: true,
			maxWidth: 350,
			maxHeight: 450
		});

		object.on("click", ev => {
			if(!object.options.original) { object.options.original = object.options; }

			if(object.editing.enabled()) { object.closePopup(); }

			_EVENTS.object.setup(object.options.id, object.options.type);
		});
	},

	getObject: function(id) {
		for(let i = 0; i < this._objects.length; i++) {
			let o = this._objects[i];
			if(o.options.id == id) {
				o.options.index = i;
				return o;
			}
		}
	},

	removeLayer: function(id) {
		let object = this.getObject(id);

		this._objects.splice(object.options.index, 1);
		object.closePopup();
		object.unbindPopup();

		L.FeatureGroup.prototype.removeLayer.call(this, object);
	},

	removeAvatarBorders: function() {
		for(let o of this._objects) {
			if(o.options.type == "marker") {
				$(o._icon).css("border", "");
			}
		}
	},
	readdAvatarBorders: function() {
		for(let o of this._objects) {
			if(o.options.type == "marker") {
				$(o._icon).css("border", `${o.options.borderThickness}px solid ${o.options.borderColor}`);
			}
		}
	},

	export: function() {
		let res = [];

		for(let o of this._objects) {
			let oo = null;

			switch(o.options.type) {
				case "marker":
					oo = {
						id: o.options.id,
						type: o.options.type,
						borderColor: o.options.borderColor,
						borderThickness: o.options.borderThickness
					};
					oo.icon = o.getIcon().options.iconUrl;
					if(o.options.overlayBlur) oo.blur = o.options.overlayBlur;
					if(o.options.overlayTransparency) oo.transparency = o.options.overlayTransparency;
					if(o.options.overlayGrayscale) oo.grayscale = o.options.overlayGrayscale;
					break;

				case "polyline":
					oo = {
						id: o.options.id,
						type: o.options.type,
						color: o.options.color,
						thickness: o.options.weight,
						transparency: 1 - o.options.opacity
					};
					break;

				case "polygon":
				case "rectangle":
					oo = {
						id: o.options.id,
						type: o.options.type,
						lineColor: o.options.color,
						lineThickness: o.options.weight,
						lineTransparency: 1 - o.options.opacity,
						fillColor: o.options.fillColor,
						fillTransparency: 1 - o.options.fillOpacity
					};
					break;

				default: break;
			}

			if(oo) res.push(oo);
		}

		return res;
	},

	initialize: function(options) {
		L.FeatureGroup.prototype.initialize.call(this);

		this.options.id = uuid();
		this.options.type = "DRAWING";

		this.options = mergeObjects(this.options, options);

		this._objects = [];
		//this.markercluster = L.markerClusterGroup();
		//L.FeatureGroup.prototype.addLayer.call(this, this.markercluster);
	}

});




L.drawingLayer = function(options) {
	return new L.DrawingLayer(options);
};

