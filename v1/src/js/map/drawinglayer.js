/*©agpl*************************************************************************
*                                                                              *
* DynastyMap                                                                   *
* Copyright (C) 2021  DynastyMap AS                                            *
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
		var id = id || uuid();

		if(id) object.options.id = id;
		if(type) object.options.type = type;

		L.FeatureGroup.prototype.addLayer.call(this, object);
		this._objects.push(object);

		let popup;
		switch(type) {
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
		object.bindPopup(popup);

		object.on("click", ev => {
			if(!object.options.original) { object.options.original = object.options; }

			if(object.editing.enabled()) { object.closePopup(); }

			_EVENTS.object.setup(object.options.type);
		});

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

