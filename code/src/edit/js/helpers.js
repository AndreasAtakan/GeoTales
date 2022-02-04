/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

"use strict";


function uuid(a) {
	return a ? (a^Math.random()*16>>a/4).toString(16) : ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, uuid);
}



function import_data(data) {
	_AVATARSPEED = data.options.avatarspeed;
	_PANNINGSPEED = data.options.panningspeed;

	_THEME = data.options.theme;

	if(data.content.length <= 0) { return; }

	let index = _CONTENT.store.length;
	if(index <= 0) { document.dispatchEvent( new Event("section_setup") ); }

	_CONTENT.importData(data.content);
	_MAP.importData(data.objects);

	_CONTENT.current();
}

function export_data() {
	return JSON.stringify({
		options: {
			avatarspeed: _AVATARSPEED,
			panningspeed: _PANNINGSPEED,
			theme: _THEME
		},
		content: _CONTENT.exportData(),
		objects: _MAP.exportData()
	});
}



function unsaved_changes() {
	$(window).off("beforeunload");
	$(window).on("beforeunload", ev => {
		ev.preventDefault();

		let m = "Unsaved changes could be lost. Are you sure you want to close?";
		ev.returnValue = m;
		return m;
	});
}

function saved_changes() {
	$(window).off("beforeunload");
}



function flash_map() {
	$("div#map").addClass("snapshot");
	setTimeout(function() { $("div#map").removeClass("snapshot"); }, 240);
}



function get_basemap(url) {
	for(let b of _BASEMAPS) {
		if(b.tiles._url == url) { return b; }
	}

	return null;
}



function is_internal_basemap(url) {
	let r;

	switch(url) {
		case "https://api.mapbox.com/styles/v1/andreasatakan/ckwjt95pj0zn714lvg9q9p7da/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW5kcmVhc2F0YWthbiIsImEiOiJjazlndzM1cmUwMnl5M21tZjQ3dXpzeHJnIn0.oE5zp040ZzJj5QgCDznweg":
			r = `
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
			break;

		default:
			r = null;
			break;
	}

	return r;
}
