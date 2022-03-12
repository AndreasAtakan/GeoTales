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

	if(data.scenes.length <= 0) { return; }

	if(_SCENES.store.length <= 0) { document.dispatchEvent( new Event("_setup") ); }

	_SCENES.importData(data.scenes);
	_MAP.importData(data.objects);

	_SCENES.current();
}

function export_data() {
	return JSON.stringify({
		options: {
			avatarspeed: _AVATARSPEED,
			panningspeed: _PANNINGSPEED
		},
		scenes: _SCENES.exportData(),
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
