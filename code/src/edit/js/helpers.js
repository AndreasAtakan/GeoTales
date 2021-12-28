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

function get_basemap(url) {
	for(let b of _BASEMAPS) {
		if(b.tiles._url == url) { return b; }
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

			if((lastB.url && lastB.url == s.basemap.url)
			|| (lastB.img && lastB.img == s.basemap.img)) {
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



function is_internal_roman_basemap(url) {
	if(url == "https://api.mapbox.com/styles/v1/andreasatakan/ckwjt95pj0zn714lvg9q9p7da/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW5kcmVhc2F0YWthbiIsImEiOiJjazlndzM1cmUwMnl5M21tZjQ3dXpzeHJnIn0.oE5zp040ZzJj5QgCDznweg") {
		return `
			<p style="margin-right: 1rem;"><img style="width: 25px;" src="https://raw.githubusercontent.com/klokantech/roman-empire/master/icons/bath.svg" /> Bath house</p>
			<p style="margin-right: 1rem;"><img style="width: 25px;" src="https://raw.githubusercontent.com/klokantech/roman-empire/master/icons/bridge.svg" /> Bridge</p>
			<p style="margin-right: 1rem;"><img style="width: 25px;" src="https://raw.githubusercontent.com/klokantech/roman-empire/master/icons/cemetery.svg" /> Cemetery</p>
			<p style="margin-right: 1rem;"><img style="width: 25px;" src="https://raw.githubusercontent.com/klokantech/roman-empire/master/icons/circle.svg" /> Settlement</p>
			<p style="margin-right: 1rem;"><img style="width: 25px;" src="https://raw.githubusercontent.com/klokantech/roman-empire/master/icons/circle_11.svg" /> Settlement</p>
			<p style="margin-right: 1rem;"><img style="width: 25px;" src="https://raw.githubusercontent.com/klokantech/roman-empire/master/icons/circle_brown.svg" /> Settlement</p>
			<p style="margin-right: 1rem;"><img style="width: 25px;" src="https://raw.githubusercontent.com/klokantech/roman-empire/master/icons/dam.svg" /> Dam</p>
			<p style="margin-right: 1rem;"><img style="width: 25px;" src="https://raw.githubusercontent.com/klokantech/roman-empire/master/icons/diamond.svg" /> Settlement</p>
			<p style="margin-right: 1rem;"><img style="width: 25px;" src="https://raw.githubusercontent.com/klokantech/roman-empire/master/icons/diamond_red.svg" /> Settlement</p>
			<p style="margin-right: 1rem;"><img style="width: 25px;" src="https://raw.githubusercontent.com/klokantech/roman-empire/master/icons/lighthouse.svg" /> Lighthouse</p>
			<p style="margin-right: 1rem;"><img style="width: 25px;" src="https://raw.githubusercontent.com/klokantech/roman-empire/master/icons/mine.svg" /> Mine</p>
			<p style="margin-right: 1rem;"><img style="width: 25px;" src="https://raw.githubusercontent.com/klokantech/roman-empire/master/icons/mount.svg" /> Mount</p>
			<p style="margin-right: 1rem;"><img style="width: 25px;" src="https://raw.githubusercontent.com/klokantech/roman-empire/master/icons/oasis.svg" /> Oasis</p>
			<p style="margin-right: 1rem;"><img style="width: 25px;" src="https://raw.githubusercontent.com/klokantech/roman-empire/master/icons/pass.svg" /> Pass</p>
			<p style="margin-right: 1rem;"><img style="width: 25px;" src="https://raw.githubusercontent.com/klokantech/roman-empire/master/icons/production.svg" /> Production</p>
			<p style="margin-right: 1rem;"><img style="width: 25px;" src="https://raw.githubusercontent.com/klokantech/roman-empire/master/icons/rectangle.svg" /> Settlement</p>
			<p style="margin-right: 1rem;"><img style="width: 25px;" src="https://raw.githubusercontent.com/klokantech/roman-empire/master/icons/settlement.svg" /> Settlement</p>
			<p style="margin-right: 1rem;"><img style="width: 25px;" src="https://raw.githubusercontent.com/klokantech/roman-empire/master/icons/shipwreck.svg" /> Shipwreck</p>
			<p style="margin-right: 1rem;"><img style="width: 25px;" src="https://raw.githubusercontent.com/klokantech/roman-empire/master/icons/spiral.svg" /> Settlement</p>
			<p style="margin-right: 1rem;"><img style="width: 25px;" src="https://raw.githubusercontent.com/klokantech/roman-empire/master/icons/square.svg" /> Settlement</p>
			<p style="margin-right: 1rem;"><img style="width: 25px;" src="https://raw.githubusercontent.com/klokantech/roman-empire/master/icons/star.svg" /> Settlement</p>
			<p style="margin-right: 1rem;"><img style="width: 25px;" src="https://raw.githubusercontent.com/klokantech/roman-empire/master/icons/tumulus.svg" /> Tumulus</p>
			<p style="margin-right: 1rem;"><img style="width: 25px;" src="https://raw.githubusercontent.com/klokantech/roman-empire/master/icons/villa.svg" /> Villa</p>
			<p style="margin-right: 1rem;"><img style="width: 25px;" src="https://raw.githubusercontent.com/klokantech/roman-empire/master/icons/waterwheel.svg" /> Waterwheel</p>
			<p style="margin-right: 1rem;"><img style="width: 25px;" src="https://raw.githubusercontent.com/klokantech/roman-empire/master/icons/windmill.svg" /> Windmill</p>
		`;
	}

	return null;
}
