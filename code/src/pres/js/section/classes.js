/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

"use strict";


function Content() {
	this.store = []; // Store of all scenes
	this.active = ""; // The scene that is currently active


	this.setup = function() {
		$("#chapters").css("display", "block");
		$("#section").css("display", "block");
		this.bind();
	};

	this.reset = function() {
		$("#chapters").css("display", "none");
		$("#section").css("display", "none");
	};

	this.get = function(id) {
		for(let i = 0; i < this.store.length; i++) {
			let c = Object.assign({}, this.store[i]);
			if(c.id == id) { c.index = i; return c; }
		}
		return null;
	};

	this.getPrevScene = function(id) {
		let c = this.get(id);
		if(!c || c.index <= 0) { return; }

		for(let i = c.index - 1; i >= 0; i--) {
			let s = Object.assign({}, this.store[i]);
			if(s.type == "scene") { return s; }
		}
		return null;
	};

	this.getNextScene = function(id) {
		let c = this.get(id);
		if(!c || c.index >= this.store.length-1) { return; }

		for(let i = c.index + 1; i < this.store.length; i++) {
			let s = Object.assign({}, this.store[i]);
			if(s.type == "scene") { return s; }
		}
		return null;
	};

	this.sceneActive = function() {
		$("#section").removeClass("inactive active");
		$("#section").addClass("active");
	};

	this.sceneInactive = function() {
		$("#section").removeClass("inactive active");
		$("#section").addClass("inactive");
	};

	this.bind = function() {
		$("#chapters button#chapter").off("click");
		$("#chapters button#chapter").click(ev => {
			let id = $(ev.target).data("id");
			let s = this.getNextScene(id);
			this.set(s.id);
		});

		$("#section").off("click");
		$("#section").click(ev => {
			let s = this.get(this.active);
			if(!s) { return; }

			let el = $("#section");
			if(el.hasClass("active")) { return; }

			if(el.hasClass("inactive")) {
				if(_IS_MAP_MOVING) { return; }

				_MAP.setFlyTo(s.bounds);
				_IS_MAP_MOVING = true;

				this.sceneActive();
			}
			else{ this.set(s.id); }
		});

		$("#section #content img").off("click");
		$("#section #content img").click(ev => { ev.stopPropagation();
			$("#imageModal img#imgPreview").attr("src", ev.target.src);
			$("#imageModal").modal("show");
		});
	};

	this.prev = function() {
		let s = this.getPrevScene(this.active);
		if(!s) { return; }
		this.set(s.id);
		return s;
	};

	this.current = function() {
		this.set(this.active);
	};

	this.next = function() {
		let s = this.getNextScene(this.active);
		if(!s) { return; }
		this.set(s.id);
		return s;
	};

	this.set = function(id) {
		let s = this.get(id);

		this.active = id;
		this.sceneActive();

		this.setDatetime();

		$("#section #content").html(s.content || "");

		this.bind();

		if(s.basemap.url) {
			let basemap = get_basemap(s.basemap.url);

			if(basemap) { _MAP.setBasemap( basemap.tiles ); }
			else{ _MAP.setBasemap(L.tileLayer(s.basemap.url, { minZoom: 0, maxZoom: 22, attribution: `&copy; <a href="https://${_HOST}" target="_blank">GeoTales</a>` }), is_internal_basemap(s.basemap.url)); }
		}
		else if(s.basemap.img) { _MAP.imgBasemap(s.basemap.img, s.basemap.width, s.basemap.height); }

		_MAP.setObjects(s.id, true);
		_MAP.setFlyTo(s.bounds);
	};
	this.setDatetime = function() {
		let s = this.get(this.active);
		let els = [], current = {}, last = {};

		if(s.time || s.date || s.period) { $("#section #datetime").css("display", "block"); }
		else{ $("#section #datetime").css("display", "none"); return; }

		if(s.period) {
			$("#section #datetime #period").css("display", "inline");
			$("#section #datetime #period").html( s.period.toUpperCase() );
		}else{ $("#section #datetime #period").css("display", "none"); }

		if(s.date) {
			$("#section #datetime #date").css("display", "inline");

			els.push("year", "month", "day");

			current.year = s.date.split("-")[0];
			current.month = s.date.split("-")[1];
			current.day = s.date.split("-")[2];

			last.year = $("#section #datetime #year").html() || 1;
			last.month = $("#section #datetime #month").html() || 1;
			last.day = $("#section #datetime #day").html() || 1;
		}else{ $("#section #datetime #date").css("display", "none"); }

		if(s.time) {
			$("#section #datetime #time").css("display", "inline");

			els.push("hour", "minute", "second");

			current.hour = s.time.split(":")[0];
			current.minute = s.time.split(":")[1];
			current.second = s.time.split(":")[2];

			last.hour = $("#section #datetime #hour").html() || 1;
			last.minute = $("#section #datetime #minute").html() || 1;
			last.second = $("#section #datetime #second").html() || 1;
		}else{ $("#section #datetime #time").css("display", "none"); }

		if(s.date && s.time) { $("#section #datetime #dateNtime").css("display", "inline"); }
		else { $("#section #datetime #dateNtime").css("display", "none"); }

		for(let e of els) {
			let c = parseInt( current[e] ),
				l = parseInt( last[e] );

			$(`#section #datetime #${e}`).html( l );
			animate_val(`#section #datetime #${e}`, l, c, 1000);
		}
	};

	this.importData = function(data) {
		if(this.store.length <= 0 || !this.active) {
			for(let o of data) { if(o.type == "scene") { this.active = o.id; break; } }
		}

		for(let o of data) {
			let c;
			switch(o.type) {
				case "chapter":
					c = new Chapter(o.id);
					c.title = o.title;
					$("#chapters ul").append(`
						<li><button type="button" class="dropdown-item" id="chapter" data-id="${c.id}">${c.title}</button></li>
					`);
					break;

				case "scene":
					c = new Scene(o.id);
					c.bounds = o.bounds; c.basemap = o.basemap;
					c.period = o.period; c.date = o.date; c.time = o.time; c.content = o.content;
					break;

				default: console.error("Content type invalid"); break;
			}

			this.store.push(c);
		}
	};
}



function Chapter(id, prevId) {
	this.id = id || uuid();
	this.type = "chapter";

	this.title = "";
}



function Scene(id, prevId) {
	this.id = id || uuid();
	this.type = "scene";

	this.bounds = null;
	this.basemap = null;

	this.period = "ad";
	this.date = "";
	this.time = "";
	this.content = "";
}
