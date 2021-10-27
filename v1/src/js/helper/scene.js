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


function get_scene(id) {
	for(let i = 0; i < _SCENES.length; i++) {
		let s = _SCENES[i];

		if(s.id == id) {
			s.index = i;
			return s;
		}
	}
}



function getSceneInView() {
	for(let s of _SCENES) {
		if(isSceneInMiddleView(s.id)) {
			return s;
		}
	}
}

function isSceneInMiddleView(id) {
	let viewMiddle = $("div#_midline").offset().top; // P.S. This is the best hack of all time

	let rect = $(`div[data-sceneid="${id}"]`)[0].getBoundingClientRect();
	let elemTop = rect.top,
		elemBottom = rect.bottom;

	return (elemTop <= viewMiddle) && (elemBottom >= viewMiddle);
}
