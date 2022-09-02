/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@geotales.io>, January 2022                  *
*******************************************************************************/

"use strict";

import { import_data } from "./helpers.js";
import { init, reset } from "./generate.js";

import { Scenes } from "./scenes.js";
import { Textboxes } from "./textboxes.js";

import "./map/map.js";


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

	// Set up nav-btn-fade-out
	let btnTimer = null, btnFadeTime = 5000,
		btnToggle = v => { $("#mapNav, #extraNav").css("opacity", v || 0); };
	$(window).on("mousemove", function() {
		btnToggle(1); clearTimeout(btnTimer);
		btnTimer = setTimeout(btnToggle, btnFadeTime);
	});
	setTimeout(btnToggle, btnFadeTime);



	_SCENES = new Scenes();

	$("#mapNav #fullscreen").click(ev => {
		if(_MAP.isFullscreen) {
			if(document.exitFullscreen) { document.exitFullscreen(); }
			else if(document.webkitExitFullscreen) { document.webkitExitFullscreen(); } /* Safari */
			else if(document.msExitFullscreen) { document.msExitFullscreen(); } /* IE11 */
		}else{
			let el = document.body;
			if(el.requestFullscreen) { el.requestFullscreen(); }
			else if(el.webkitRequestFullscreen) { el.webkitRequestFullscreen(); } /* Safari */
			else if(el.msRequestFullscreen) { el.msRequestFullscreen(); } /* IE11 */
		}
		_MAP.isFullscreen = !_MAP.isFullscreen;
		_MAP.setAspectRatio();
	});
	$(document).keydown(ev => { if(["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft", "Space"].indexOf(ev.code) > -1) { ev.preventDefault(); } });
	$(document).keyup(ev => {
		let keycode = ev.code;

		if(["ArrowUp","ArrowLeft"].indexOf(keycode) > -1) { ev.preventDefault(); _SCENES.prev(); }
		if(["ArrowDown", "ArrowRight", "Space"].indexOf(keycode) > -1) { ev.preventDefault(); _SCENES.next(); }
		if(["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft", "Space"].indexOf(keycode) > -1) { ev.preventDefault(); }
	});

	$("#shareModal input#linkInput").val(`https://${_HOST}/pres.php?id=${_ID}`);
	$("#shareModal a#facebook").prop("href", `https://www.facebook.com/sharer/sharer.php?u=https://${_HOST}/pres.php?id=${_ID}`);
	$("#shareModal a#twitter").prop("href", `https://twitter.com/intent/tweet?url=https://${_HOST}/pres.php?id=${_ID}&text=`);
	$("#shareModal a#linkedin").prop("href", `https://www.linkedin.com/shareArticle?mini=true&url=https://${_HOST}/pres.php?id=${_ID}`);
	$("#shareModal a#pinterest").prop("href", `https://pinterest.com/pin/create/button/?url=https://${_HOST}/pres.php?id=${_ID}&media=&description=`);
	$("#shareModal a#email").prop("href", `mailto:?&subject=&cc=&bcc=&body=https://${_HOST}/pres.php?id=${_ID}%0A`);
	$("#shareModal button#copyLink").click(ev => {  navigator.clipboard.writeText( $("#shareModal input#linkInput").val() ); });
	$("#shareModal button#clone").click(ev => {
		$("#loadingModal").modal("show");

		$.ajax({
			type: "POST",
			url: "api/map.php",
			data: {
				"op": "clone",
				"id": _ID,
				"password": _PASSWORD
			},
			dataType: "json",
			success: function(result, status, xhr) {
				window.location.assign(`edit.php?id=${result.id}`);
			},
			error: function(xhr, status, error) {
				console.log(xhr.status, error);
				if(xhr.status == 401) { window.location.assign("settings.php"); }
				else{ setTimeout(function() { $("#loadingModal").modal("hide"); $("#shareModal").modal("hide"); $("#errorModal").modal("show"); }, 750); }
			}
		});
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
		boxZoom: false,
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

	setTimeout(function() {
		$("button#closeAd").css("display", "block");
	}, 5000);
	$("button#closeAd").click(ev => {
		$("#adsense").css("display", "none");
	});



	// Load data
	$("#loadingModal").modal("show");
	$.ajax({
		type: "GET",
		url: "api/map.php",
		data: {
			"op": "read",
			"id": _ID,
			"password": ""
		},
		dataType: "json",
		success: function(result, status, xhr) {
			if(result.data) { import_data( JSON.parse(result.data) ); }

			setTimeout(function() { $("#loadingModal").modal("hide"); }, 750);
		},
		error: function(xhr, status, error) {
			console.log(xhr.status, error);

			if(xhr.status == 401) { setTimeout(function() { $("#loadingModal").modal("hide"); $("#passwordModal").modal("show"); }, 750); }
			else{ setTimeout(function() { $("#loadingModal").modal("hide"); $("#errorModal").modal("show"); }, 750); }
		}
	});

	$("#passwordModal button#enter").click(ev => {
		let password = $("#passwordModal input#passwordInput").val();
		password = password === "" ? password : sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash( password ));
		_PASSWORD = password;

		$("#passwordModal").modal("hide");
		$("#loadingModal").modal("show");

		$.ajax({
			type: "GET",
			url: "api/map.php",
			data: {
				"op": "read",
				"id": _ID,
				"password": password
			},
			dataType: "json",
			success: function(result, status, xhr) {
				if(result.data) { import_data( JSON.parse(result.data) ); }

				setTimeout(function() { $("#loadingModal").modal("hide"); }, 750);
			},
			error: function(xhr, status, error) {
				console.log(xhr.status, error);
				setTimeout(function() { $("#loadingModal").modal("hide"); $("#errorModal").modal("show"); }, 750);
			}
		});
	});

};
