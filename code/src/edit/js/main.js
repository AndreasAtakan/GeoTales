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

	$("#sceneRow").keydown(ev => { if(["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft", "Space"].indexOf(ev.code) > -1) { ev.preventDefault(); } });
	$("#sceneRow").keyup(ev => {
		let keycode = ev.code;
		if(keycode == "ArrowLeft") { ev.preventDefault(); _SCENES.prev(); }
		if(keycode == "ArrowRight") { ev.preventDefault(); _SCENES.next(); }
		if(["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft", "Space"].indexOf(keycode) > -1) { ev.preventDefault(); }
	});

	$("#sceneRow button#add").click(ev => { _SCENES.add(); });
	$("#sceneRow button#recapture").click(ev => { _SCENES.capture(); });
	$("#sceneWarningModal button#delete").click(ev => { _SCENES.delete(); $("#sceneWarningModal").modal("hide"); });


	_TEXTBOXES = new Textboxes();


	_MAP = L.map("map", {
		center: [ 49, 14 ],
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

	document.addEventListener("_setup", ev => {
		_MAP.setup(); _TEXTBOXES.setup(); _SCENES.setup();
	});
	document.addEventListener("_reset", ev => {
		_SCENES.reset(); _TEXTBOXES.reset(); _MAP.reset();
	});



	$("#optionsModal input#animationSpeed").change(function(ev) { _OPTIONS.animationspeed = parseInt( $(this).val() ); });
	$("#optionsModal input#panningSpeed").change(function(ev) { _OPTIONS.panningspeed = ( $(this).val() / 1000 ) || null; });
	$("#optionsModal select#aspectRatio").change(function(ev) { _MAP.setAspectRatio( eval( this.value ) ); });



	init_basemaps();
	$("#basemapModal #basemaps").click(ev => {
		let index = $(ev.target).data("basemap");
		if(!index && index != 0) { return; }

		_MAP.setBasemap( _BASEMAPS[index].tiles );
		_SCENES.setBasemap();
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
				let data = new FormData();
				data.append("op", "create");
				data.append("type", "basemap");
				data.append("image", file);

				$.ajax({
					type: "POST",
					url: "api/upload.php",
					data: data,
					contentType: false,
					processData: false,
					success: function(result, status, xhr) {
						_MAP.setBasemap({ type: "image", img: result, width: width, height: height });
						_SCENES.setBasemap();
						setTimeout(function() { $("#loadingModal").modal("hide"); }, 750);
					},
					error: function(xhr, status, error) {
						console.error(xhr.status, error);
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

		let protocol = url.split(/\:/ig)[0];
		if(protocol == "mapbox") {
			let username = url.split(/mapbox\:\/\/styles\//ig)[1].split(/\//ig)[0], styleID = url.split(/mapbox\:\/\/styles\//ig)[1].split(/\//ig)[1],
				key = $("#basemapModal input#basemapKey").val();
			if(!key) { return; }

			url = `https://api.mapbox.com/styles/v1/${username}/${styleID}/tiles/256/{z}/{x}/{y}?access_token=${key}`;
		}

		_MAP.setBasemap({ type: "tiles", url: url });
		_SCENES.setBasemap();
	});



	$("#importModal button#import").click(ev => {
		$("#importModal").modal("hide");

		let file = $("#importModal input#fileInput")[0].files[0];
		if(!file) { return; }

		let fr = new FileReader();
		fr.onload = function() { import_data( JSON.parse( fr.result ) ); };
		fr.readAsText(file);
	});

	$("a#export").click(function exportEv(ev) {
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
	});
	$("a#save").click(ev => {
		$("#loadingModal").modal("show");
		save_data(function() { $("#loadingModal").modal("hide"); });
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
			$(`div#sceneRow,
			   div#mapRow,
			   .navbar .navbarContent li`).click(ev => { unsaved_changes(); });

			setTimeout(function() { $("#loadingModal").modal("hide"); }, 750);
		},
		error: function(xhr, status, error) {
			console.error(xhr.status, error);
			setTimeout(function() { $("#loadingModal").modal("hide"); $("#errorModal").modal("show"); }, 750);
		}
	});

	/*$.ajax({
		type: "GET",
		url: "api/icon.php",
		dataType: "json",
		success: function(result, status, xhr) {
			//
		},
		error: function(xhr, status, error) {
			console.error(xhr.status, error);
		}
	});*/

};
