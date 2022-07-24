/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@geotales.io>, January 2022                  *
*******************************************************************************/

"use strict";


window.onload = function(ev) {

	// Disable mobile pinch-zoom
	document.addEventListener("touchmove", function(ev) {
		if(ev.scale !== 1) { ev.preventDefault(); }
	}, false);

	// Set up window resize start/end events
	let resizeTimer = false;
	$(window).on("resize", function(ev) {
		if( !resizeTimer ) { $(window).trigger("resizestart"); }
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(function() {
			resizeTimer = false;
			$(window).trigger("resizeend");
		}, 250);
	}).on("resizeend", function() { _MAP.setAspectRatio(); });



	_SCENES = new Scenes();

	let isFullscreen = false;
	$("#sceneNav #fullscreen").click(ev => {
		if(isFullscreen) {
			if(document.exitFullscreen) { document.exitFullscreen(); }
			else if(document.webkitExitFullscreen) { document.webkitExitFullscreen(); } /* Safari */
			else if(document.msExitFullscreen) { document.msExitFullscreen(); } /* IE11 */
		}else{
			let el = document.body;
			if(el.requestFullscreen) { el.requestFullscreen(); }
			else if(el.webkitRequestFullscreen) { el.webkitRequestFullscreen(); } /* Safari */
			else if(el.msRequestFullscreen) { el.msRequestFullscreen(); } /* IE11 */
		}
		isFullscreen = !isFullscreen;
		_MAP.setAspectRatio();
	});
	$(document).keydown(ev => { if(["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft", "Space"].indexOf(ev.code) > -1) { ev.preventDefault(); } });
	$(document).keyup(ev => {
		let keycode = ev.code;

		if(["ArrowUp","ArrowLeft"].indexOf(keycode) > -1) { ev.preventDefault(); _SCENES.prev(); }
		if(["ArrowDown", "ArrowRight", "Space"].indexOf(keycode) > -1) { ev.preventDefault(); _SCENES.next(); }
		if(["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft", "Space"].indexOf(keycode) > -1) { ev.preventDefault(); }
	});

	_TEXTBOXES = new Textboxes();

	_MAP = L.map("map", {
		center: [ 50, 6 ],
		zoom: window.innerWidth < 575.98 ? 3 : 5,
		zoomControl: false,
		maxZoom: 18,
		doubleClickZoom: false,
		zoomAnimationThreshold: 100,
		wheelPxPerZoomLevel: 1500,
		keyboard: false,
		tap: false,
		//touchZoom: false,
		//worldCopyJump: true

		contextmenu: true,
		contextmenuItems: [
			{ text: "Copy coordinates", callback: ev => { navigator.clipboard.writeText( `${ev.latlng.lat}, ${ev.latlng.lng}` ); } },
			{ text: "Center map here", callback: ev => { _MAP.panTo(ev.latlng); } },
			"-",
			{ text: "Zoom in", icon: "assets/zoom-in.png", callback: ev => { _MAP.zoomIn(); } },
			{ text: "Zoom out", icon: "assets/zoom-out.png", callback: ev => { _MAP.zoomOut(); } }
		]
	});

	document.addEventListener("_setup", ev => { init(); _MAP.setup(); _TEXTBOXES.setup(); _SCENES.setup(); });
	document.addEventListener("_reset", ev => { _SCENES.reset(); _TEXTBOXES.reset(); _MAP.reset(); reset(); });



	// Load data
	$("#loadingModal").modal("show");
	$.ajax({
		type: "GET",
		url: "api/map.php",
		data: {
			"op": "read",
			"id": _ID
		},
		dataType: "json",
		success: function(result, status, xhr) {
			if(result.data) { import_data( JSON.parse(result.data) ); }

			setTimeout(function() { $("#loadingModal").modal("hide"); }, 750);
		},
		error: function(xhr, status, error) {
			console.log(xhr.status);
			console.log(error);

			setTimeout(function() { $("#loadingModal").modal("hide"); $("#errorModal").modal("show"); }, 750);
		}
	});

};
