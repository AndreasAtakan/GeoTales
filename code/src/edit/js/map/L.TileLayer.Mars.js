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


L.TileLayer.Mars = L.TileLayer.extend({

	getTileUrl: function(coords) {
		let bound = Math.pow(2, coords.z),
			x = coords.x,
			y = coords.y;

		// Don't repeat across y-axis (vertically).
		if(y < 0 || y >= bound) { return null; }

		// Repeat across x-axis.
		if(x < 0 || x >= bound) { x = (x % bound + bound) % bound; }

		let qstr = "t";
		for(let z = 0; z < coords.z; z++) {
			bound = bound / 2;
			if(y < bound) {
				if (x < bound) { qstr += "q"; }
				else {
					qstr += "r";
					x -= bound;
				}
			}else{
				if(x < bound) {
					qstr += "t";
					y -= bound;
				}else{
					qstr += "s";
					x -= bound;
					y -= bound;
				}
			}
		}

		return `https://mw1.google.com/mw-planetary/mars/${this.options.layer}/${qstr}.jpg`;
	},

	initialize: function(options) {
		L.TileLayer.prototype.initialize.call(this, "", options);
	}

});


L.tileLayer.mars = function(options) { return new L.TileLayer.Mars(options); }
