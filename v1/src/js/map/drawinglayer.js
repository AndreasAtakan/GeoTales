/*©agpl*************************************************************************
*                                                                              *
* DynastyMap                                                                   *
* Copyright (C) 2020  DynastyMap AS                                            *
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

	addLayer: function(object, type, title, id) {
		var id = id || uuid();

		object.options.id = id;
		object.options.type = type;
		object.options.title = title;

		switch(type) {
			/*case "marker":
				this.markercluster.addLayer(object);
				break;*/

			case "marker":
			case "polyline":
			case "polygon":
			case "rectangle":
				L.FeatureGroup.prototype.addLayer.call(this, object);
				break;

			default:
				console.error("(addLayer) mapobject-type: not recognized");
		}
		this._objects.push(object);

		object.bindPopup(`
			<h6>${title}</h6>
		`);

		object.on("click", ev => {
			if(!object.options.original) { object.options.original = object.options; }

			if(object.editing.enabled()) { object.closePopup(); }
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

