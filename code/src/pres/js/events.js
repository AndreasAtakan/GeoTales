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


_EVENTS.scene = {

	setup: function() {
		init_scene();
		$("button#importProject").css("display", "none");
		$("#scene").css("display", "block");

		this.set_click();

		$(document).keydown(ev => {
			let keycode = ev.code,
				id = $("#scene").data("sceneid");
			if(!id) return;

			let s = get_scene(id);

			if(["ArrowUp", "ArrowLeft"].indexOf(keycode) > -1 && s.index > 0) {
				ev.preventDefault();
				this.set_scene( _SCENES[s.index - 1].id );
			}

			if(["ArrowDown", "ArrowRight", "Space"].indexOf(keycode) > -1 && s.index < _SCENES.length - 1) {
				ev.preventDefault();
				this.set_scene( _SCENES[s.index + 1].id );
			}

			if(keycode == "ArrowUp" || keycode == "ArrowDown") { ev.preventDefault(); }
		});

		$("button#sceneBackward").click(ev => {
			let id = $("#scene").data("sceneid");
			if(!id) return;

			let s = get_scene(id);
			if(s.index > 0) { this.set_scene( _SCENES[s.index - 1].id ); }
		});
		$("button#sceneForward").click(ev => {
			let id = $("#scene").data("sceneid");
			if(!id) return;

			let s = get_scene(id);
			if(s.index < _SCENES.length - 1) { this.set_scene( _SCENES[s.index + 1].id ); }
		});

		_MAP.setup();
	},

	reset: function() {
		reset_scene();
		$("button#importProject").click(ev => { $("#importModal").modal("show"); });

		_MAP.reset();
	},



	set_scene: function(id) {
		let s = get_scene(id);

		this.set_scene_style();

		$("#scene").data("sceneid", id);

		let y = "", m = "", d = "", H = "", M = "", S = "";
		if(s.date) { y = s.date.split("-")[0]; m = s.date.split("-")[1]; d = s.date.split("-")[2]; }
		if(s.time) { H = s.time.split(":")[0]; M = s.time.split(":")[1]; S = s.time.split(":")[2]; }
		$("#scene #datetime").html(
			`${s.time ? `${H}:${M}:${S}` : ""} ${s.time && s.date ? "–" : ""} ${s.date ? `${d}/${m}/${y}` : ""} ${s.period ? s.period.toUpperCase() : ""}`
		);

		$("#scene #content").html(s.content || "");
		$("#scene #content img").click(ev => { ev.stopPropagation();
			$("#imageModal img#imgPreview").attr("src", ev.target.src);
			$("#imageModal").modal("show");
		});

		if(_FONT) $("#scene #datetime").css("font-family", _FONT);

		this.set_basemap( s.basemap || get_last_scene_basemap(id) );

		_MAP.setObjects(id);

		_MAP.setFlyTo(s.bounds);

		this.set_datetime(id);
	},

	set_scene_style: function() {
		// TODO: add fade in and out effect to scene card
	},

	set_click: function() {
		$("#scene").click(ev => {
			if(_IS_MAP_MOVING) return;

			let id = $("#scene").data("sceneid");
			let scene = get_scene( id );

			$("#scene").removeClass("inactive");

			_MAP.setFlyTo(scene.bounds);
			_IS_MAP_MOVING = true;
		});
	},

	set_basemap: function(b) {
		if(b.url) {
			let basemap = get_basemap(b.url);

			if(basemap) _MAP.setBasemap( basemap.tiles );
			else _MAP.setBasemap(L.tileLayer(b.url, { minZoom: 0, maxZoom: 22, attribution: "&copy; <a href=\"https://tellusmap.com\" target=\"_blank\">TellUs</a>" }), is_internal_roman_basemap(b.url));
		}
		else if(b.img) {
			_MAP.imgBasemap(b.img, b.width, b.height);
		}
	},

	set_datetime: function(id) {
		let s = get_scene(id);
		let els = [], current = {}, last = {};

		if(s.time || s.date || s.period) { $("#dateticker").css("display", "block"); }
		else{ $("#dateticker").css("display", "none"); return; }

		if(s.period) {
			$("#dateticker #period").css("display", "inline");
			$("#dateticker #period").html( s.period.toUpperCase() );
		}else{ $("#dateticker #period").css("display", "none"); }

		if(s.date) {
			$("#dateticker #date").css("display", "inline");

			els.push("year", "month", "day");

			current.year = s.date.split("-")[0];
			current.month = s.date.split("-")[1];
			current.day = s.date.split("-")[2];

			last.year = $("#dateticker #year").html() || 1;
			last.month = $("#dateticker #month").html() || 1;
			last.day = $("#dateticker #day").html() || 1;
		}else{ $("#dateticker #date").css("display", "none"); }

		if(s.time) {
			$("#dateticker #time").css("display", "inlineinline");

			els.push("hour", "minute", "second");

			current.hour = s.time.split(":")[0];
			current.minute = s.time.split(":")[1];
			current.second = s.time.split(":")[2];

			last.hour = $("#dateticker #hour").html() || 1;
			last.minute = $("#dateticker #minute").html() || 1;
			last.second = $("#dateticker #second").html() || 1;
		}else{ $("#dateticker #time").css("display", "none"); }

		if(s.date && s.time) { $("#dateticker #dateNtime").css("display", "inline"); }
		else { $("#dateticker #dateNtime").css("display", "none"); }

		for(let e of els) {
			let c = parseInt( current[e] ),
				l = parseInt( last[e] );

			$(`#dateticker #${e}`).html( l );
			this.animate_val(`#dateticker #${e}`, l, c, 1000);
		}
	},
	animate_val: function(el, start, end, duration) {
		let startTimestamp = null;
		const step = (timestamp) => {
			if(!startTimestamp) startTimestamp = timestamp;

			const progress = Math.min((timestamp - startTimestamp) / duration, 1);
			let val = Math.floor(progress * (end - start) + start);
			$(el).html( val < 10 && val >= 0 ? `0${val}` : val );

			if(progress < 1) window.requestAnimationFrame(step);
		};
		window.requestAnimationFrame(step);
	}

};



_EVENTS.project = {

	setup: function() {
		$("#importModal button#import").click(ev => {
			$("#importModal").modal("hide");

			let file = $("#importModal input#fileInput")[0].files[0];
			if(!file) return;

			let fr = new FileReader();
			fr.onload = () => {
				this.import(
					JSON.parse( fr.result )
				);
			};
			fr.readAsText(file);
		});

	},

	import: function(data) {
		_CLUSTERING = data.options.clustering;
		_AVATARSPEED = data.options.avatarspeed;
		_PANNINGSPEED = data.options.panningspeed;

		_FONT = data.options.font;
		_THEME = data.options.theme;

		if(data.scenes.length <= 0) return;

		let index = _SCENES.length;
		if(index <= 0) _EVENTS.scene.setup();

		for(let i = 0; i < data.scenes.length; i++) {
			let s = data.scenes[i];

			_SCENES.push(s);
		}

		_MAP.importData(data.objects);

		if(index >= 0) _EVENTS.scene.set_scene( _SCENES[index].id );

		$("#dateticker").css("font-family", _FONT);
	}

};
