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


function uuid(a) {
	return a ? (a^Math.random()*16>>a/4).toString(16) : ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, uuid);
}



function mergeObjects(o, u) {
	return Object.assign({}, o, u);
}



function get_scene(id) {
	for(let i = 0; i < _SCENES.length; i++) {
		let s = Object.assign({}, _SCENES[i]);

		if(s.id == id) {
			s.index = i;
			return s;
		}
	}

	return null;
}



function get_last_scene_basemap(id) {
	let scene = get_scene(id);

	for(let i = scene.index-1; i >= 0; i--) {
		let s = _SCENES[i];
		if(s.basemap) return s.basemap;
	}

	return null;
}

function get_basemap(name) {
	for(let b of _BASEMAPS) {
		if(b.name == name) {
			return b;
		}
	}

	return null;
}

function reset_scene_basemaps() {
	let fs = _SCENES[0];
	if(!fs.basemap) { _SCENES[0].basemap = _MAP.getBasemap(); }

	for(let i = 1; i < _SCENES.length; i++) {
		let s = _SCENES[i];

		if(s.basemap) {
			let lastB = get_last_scene_basemap(s.id);

			if((lastB.name && lastB.name == s.basemap.name)
			|| (lastB.url && lastB.url == s.basemap.url)) {
				_SCENES[i].basemap = null;
			}
		}
	}
}



function get_element_scene(el) {
	for(let i = 0; i < _SCENES.length; i++) {
		let s = Object.assign({}, _SCENES[i]);

		if( $(`li[data-sceneid="${s.id}"]`)[0].contains(el) ) {
			s.index = i;
			return s;
		}
	}

	return null;
}
