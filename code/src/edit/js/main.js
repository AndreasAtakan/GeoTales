/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

"use strict";


window.onload = function(ev) {

	// Disable mobile pinch-zoom
	document.addEventListener("touchmove", function(ev) {
		if(ev.scale !== 1) { ev.preventDefault(); }
	}, false);



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
		paddingTopLeft: L.point(0, 320), // TODO; fix
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



	_CONTENT = new Content();

	$("#sectionCol").keydown(ev => { if(["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft", "Space"].indexOf(ev.code) > -1) { ev.preventDefault(); } });
	$("#sectionCol").keyup(ev => {
		let keycode = ev.code;

		if(keycode == "ArrowUp") { ev.preventDefault(); _CONTENT.prev(); }
		if(keycode == "ArrowDown") { ev.preventDefault(); _CONTENT.next(); }
		if(["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft", "Space"].indexOf(keycode) > -1) { ev.preventDefault(); }
	});

	$("#sectionCol button#add").click(ev => {
		document.dispatchEvent( new Event("section_setup") );
		_CONTENT.add("scene");
	});

	document.addEventListener("section_setup", ev => { init_section(); _CONTENT.setup(); _MAP.setup(); });
	document.addEventListener("section_reset", ev => { _MAP.reset(); _CONTENT.reset(); reset_section();
		$("#sectionCol button#add").click(ev => {
			document.dispatchEvent( new Event("section_setup") );
			_CONTENT.add("scene");
		});
	});



	$("#optionsModal input#avatarSpeedInput").change(function(ev) {
		let val = $(this).val();
		_AVATARSPEED = parseInt(val);
		$("#optionsModal span#avatarSpeedInputValue").html(`${val} milliseconds`);
	});

	$("#optionsModal input#panningSpeedInput").change(function(ev) {
		let val = $(this).val();
		_PANNINGSPEED = (val / 1000) || null;
		$("#optionsModal span#panningSpeedInputValue").html(val <= 0 ? `auto` : `${val} milliseconds`);
	});

	/*init_themes();
	$("#optionsModal input[name=\"themeRadio\"]").click(ev => {
		let theme = $(ev.target).prop("id");
		if(!theme) { return; }
		_THEME = theme;
	});*/



	init_basemaps();
	$("#basemapModal #basemaps").click(ev => {
		let index = $(ev.target).data("basemap");
		if(!index && index != 0) { return; }

		_MAP.setBasemap( _BASEMAPS[index].tiles );
		_CONTENT.setBasemap();
	});

	$("#basemapModal input#basemapFile").change(ev => {
		let file = $(ev.target)[0].files[0];
		if(!file) { return; }

		$("#loadingModal").modal("show");

		let fr = new FileReader();
		fr.onload = function() {
			let res = fr.result;

			let img = new Image();
			img.onload = function() {
				let width = this.width, height = this.height;

				let data = new FormData(); data.append("image", file);

				$.ajax({
					type: "POST",
					url: "api/img.php",
					data: data,
					contentType: false,
					processData: false,
					success: function(result, status, xhr) {
						_MAP.imgBasemap(result, width, height);
						_CONTENT.setBasemap();
						setTimeout(function() { $("#loadingModal").modal("hide"); }, 750);
					},
					error: function(xhr, status, error) {
						console.log(xhr.status);
						console.log(error);

						setTimeout(function() { $("#loadingModal").modal("hide"); $("#errorModal").modal("show"); }, 750);
					}
				});
				return true;
			};
			img.src = res;
		};
		fr.readAsDataURL(file);
	});

	$("#basemapModal button#basemapFetch").click(ev => {
		let url = $("#basemapModal input#basemapLink").val();
		if(!url) { return; }

		let tiles = L.tileLayer(url, { minZoom: 0, maxZoom: 22, attribution: `&copy; <a href="https://${_HOST}" target="_blank">TellUs</a>` });

		let protocol = url.split(/\:/ig)[0];
		if(protocol == "mapbox") {
			let username = url.split(/mapbox\:\/\/styles\//ig)[1].split(/\//ig)[0],
				styleID = url.split(/mapbox\:\/\/styles\//ig)[1].split(/\//ig)[1],
				key = $("#basemapModal input#basemapKey").val();
			if(!key) { return; }

			url = `https://api.mapbox.com/styles/v1/${username}/${styleID}/tiles/256/{z}/{x}/{y}?access_token=${key}`;
			tiles.setUrl(url, true);
		}

		_MAP.setBasemap(tiles, is_internal_basemap(url));
		_CONTENT.setBasemap();
	});



	$("#importModal button#import").click(ev => {
		$("#importModal").modal("hide");

		let file = $("#importModal input#fileInput")[0].files[0];
		if(!file) { return; }

		let fr = new FileReader();
		fr.onload = function() { import_data( JSON.parse( fr.result ) ); };
		fr.readAsText(file);
	});

	let exportEv = ev => {
		$("a#export").off("click");

		let el = document.createElement("a");

		let f = v => v < 10 && v >= 0 ? `0${v}` : `${v}`;
		let date = new Date();
		let y = date.getFullYear(), m = f(date.getMonth() + 1), d = f(date.getDate()), H = f(date.getHours()), M = f(date.getMinutes()), S = f(date.getSeconds());
		let filename = `${_TITLE} - ${y}.${m}.${d} - ${H}.${M}.${S}.tellus`,
			data = export_data();

		el.setAttribute("href", "data:application/json;charset=utf-8," + encodeURIComponent(data));
		el.setAttribute("download", filename);
		el.style.display = "none";

		document.body.appendChild(el);
		$(el).ready(() => {
			el.click(); document.body.removeChild(el);
			$("a#export").click(exportEv);
		});
	};
	$("a#export").click(exportEv);

	$("a#save").click(ev => {
		$("#loadingModal").modal("show");

		$.ajax({
			type: "POST",
			url: "api/map.php",
			data: {
				"op": "write",
				"id": _ID,
				"data": export_data(),
				"preview": ""
			},
			dataType: "json",
			success: function(result, status, xhr) {
				saved_changes();
				setTimeout(function() { $("#loadingModal").modal("hide"); }, 750);
			},
			error: function(xhr, status, error) {
				console.log(xhr.status);
				console.log(error);

				setTimeout(function() { $("#loadingModal").modal("hide"); $("#errorModal").modal("show"); }, 750);
			}
		});
	});

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
			$(document).click(ev => { unsaved_changes(); });

			setTimeout(function() { $("#loadingModal").modal("hide"); }, 750);
		},
		error: function(xhr, status, error) {
			console.log(xhr.status);
			console.log(error);

			setTimeout(function() { $("#loadingModal").modal("hide"); $("#errorModal").modal("show"); }, 750);
		}
	});

};
