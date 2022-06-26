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
	_OPTIONS = data.options;

	if(data.scenes.length <= 0) { return; }

	if(_SCENES.store.length <= 0) { document.dispatchEvent( new Event("_setup") ); }

	_SCENES.importData(data.scenes);
	_TEXTBOXES.importData(data.textboxes);
	_MAP.importData(data.objects);

	_SCENES.current();
}

function export_data() {
	return JSON.stringify({
		options: _OPTIONS,
		scenes: _SCENES.exportData(),
		textboxes: _TEXTBOXES.exportData(),
		objects: _MAP.exportData()
	});
}

function save_data(callback) {
	$.ajax({
		type: "POST",
		url: "api/map.php",
		data: {
			"op": "write",
			"id": _ID,
			"data": export_data(),
			"preview": _MAP.getCenterBasemapTile()
		},
		dataType: "json",
		success: function(result, status, xhr) {
			saved_changes();
			setTimeout(function() { if(callback) { callback(); } }, 750);
		},
		error: function(xhr, status, error) {
			console.error(xhr.status, error);
			setTimeout(function() { $("#loadingModal").modal("hide"); $("#errorModal").modal("show"); }, 750);
		}
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



function get_aspect_ratio_dimentions(w, h, r) {
	let _w = r * h;
	if(_w <= w) {
		return [_w, h];
	}else{
		return [w, w / r];
	}
}
