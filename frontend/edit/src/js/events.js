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


let textareas = {};

_EVENTS.scene = {

	setup: function() {
		init_scene();

		$("#sceneCol button#addScene").click( ev => { this.add(); } );

		$("ul#sceneContainer").sortable({
			cursor: "move",
			handle: "#reorder",
			items: "> li",
			//scroll: false,
			start: (ev, ui) => {
				ev.stopPropagation();
				this.unset_click();
			},
			update: (ev, ui) => {
				ev.stopPropagation();

				let order = $("ul#sceneContainer").sortable("toArray"),
					scene = get_element_scene(ev.originalEvent.target);
				this.reorder( order, scene.id );
			},
			stop: (ev, ui) => {
				ev.stopPropagation();
				this.set_click();
			}
		});

		$(document).keydown(ev => {
			let keycode = ev.keyCode,
				id = $("#sceneContainer li[class*=\"active\"]").data("sceneid");
			if(!id) return;

			let s = get_scene(id);

			if(keycode == 38 && s.index > 0) {
				ev.preventDefault();
				this.set_scene( _SCENES[s.index - 1].id );
			}

			if(keycode == 40 && s.index < _SCENES.length - 1) {
				ev.preventDefault();
				this.set_scene( _SCENES[s.index + 1].id, true );
			}

			if((keycode == 38 || keycode == 40)
			&& (s.index <= 0 || s.index >= _SCENES.length - 1)) {
				ev.preventDefault();
			}
		});

		_MAP.setup();
	},

	reset: function() {
		reset_scene();
		$("#sceneCol button#addScene").click( ev => { this.setup(); this.add(); } );

		_MAP.reset();
	},

	add: function() {
		let id = uuid();

		this.set_add(id);

		let s = { id: id };

		let prevId = _SCENES.length > 0 ? _SCENES[_SCENES.length - 1].id : null;
		_SCENES.push(s);

		if(prevId) {
			let prevScene = get_scene(prevId);
			if(prevScene.title)		s.title = prevScene.title;
			if(prevScene.period)	s.period = prevScene.period;
			if(prevScene.date)		s.date = prevScene.date;
			if(prevScene.time)		s.time = prevScene.time;
			if(prevScene.media)		s.media = prevScene.media;
			if(prevScene.text)		s.text = prevScene.text;

			$(`li[data-sceneid="${id}"] input#titleInput`).val( s.title || "" );
			$(`li[data-sceneid="${id}"] select#periodInput`).val( s.period || "ad" );
			$(`li[data-sceneid="${id}"] input#dateInput`).val( s.date || "" );
			$(`li[data-sceneid="${id}"] input#timeInput`).val( s.time || "" );
			if(s.media && s.media.length > 0) this.set_media(id);
			textareas[id].content.innerHTML = s.text || "";
		}

		this.capture(id);
		this.set_scene(id);
	},

	input: function(id, type, value) {
		let s = get_scene(id);

		_SCENES[s.index][type] = value;

		if(type == "date" && !s.period) { _SCENES[s.index].period = "ad"; }
	},

	capture: function(id) {
		let s = get_scene(id);

		let center = _MAP.getCenter(), zoom = _MAP.getZoom();
		_SCENES[s.index].center = { lat: center.lat, lng: center.lng };
		_SCENES[s.index].zoom = zoom;

		let b = _MAP.getBasemap(), lastB = get_last_scene_basemap(id);
		if(lastB) {
			if(b.url && b.url == lastB.url) { b = null; }
			else if(b.img && b.img == lastB.img) { b = null; }
		}
		_SCENES[s.index].basemap = b;

		this.flash_map();
	},

	delete: function(id) {
		let s = get_scene(id);
		let i = s.index == _SCENES.length - 1 ? s.index - 1 : s.index;

		if(s.basemap) {
			let nextS = _SCENES[ s.index + 1 ];
			if(nextS && !nextS.basemap) {
				_SCENES[ s.index + 1 ].basemap = s.basemap;
			}
		}

		_SCENES.splice(s.index, 1);
		delete textareas[id];

		$(`li[data-sceneid="${id}"]`).remove();

		if(_SCENES.length <= 0) { this.reset(); }
		else { this.set_scene( _SCENES[i].id ); }

		_MAP.deleteScene(id);
	},

	reorder: function(order, id) {
		let scene = get_scene(id);
		if(!scene) { console.error("No scene found"); return; }

		let lastB;
		if(!scene.basemap) { lastB = get_last_scene_basemap(id); }
		else {
			let nextScene = _SCENES[ scene.index + 1 ];
			if(nextScene && !nextScene.basemap) {
				_SCENES[ scene.index + 1 ].basemap = scene.basemap;
			}
		}

		_SCENES.sort((a,b) => order.indexOf(a.id) - order.indexOf(b.id));

		scene = get_scene(id);
		if(lastB) { _SCENES[ scene.index ].basemap = lastB; }

		let nextScene = _SCENES[ scene.index + 1 ];
		if(nextScene && !nextScene.basemap) {
			let lastScene = _SCENES[ scene.index - 1 ];
			if(lastScene) {
				lastB = lastScene.basemap || get_last_scene_basemap(lastScene.id);
				_SCENES[ scene.index + 1 ].basemap = lastB;
			}
		}

		reset_scene_basemaps();

		this.set_scene( $("#sceneContainer li[class*=\"active\"]").data("sceneid") );
	},



	set_scene: function(id, animate) {
		let s = get_scene(id);

		this.set_scene_input(id);
		this.set_scene_style(id);
		this.set_click();

		$(`li[data-sceneid="${id}"]`)[0].scrollIntoView({ behavior: "smooth", block: "center" });

		if(s.basemap) {
			if(s.basemap.url) this.set_basemap(s.basemap.url);
			else if(s.basemap.img) _MAP.imgBasemap(s.basemap.img, s.basemap.width, s.basemap.height);
		}else{
			let b = get_last_scene_basemap(id);
			if(b) {
				if(b.url) this.set_basemap(b.url);
				else if(b.img) _MAP.imgBasemap(b.img, b.width, b.height);
			}
		}

		_MAP.setObjects(id, animate);

		_MAP.flyTo(s.center, Math.min(s.zoom, _MAP.getMaxZoom()), { noMoveStart: true, duration: _PANNINGSPEED || null });
	},

	set_scene_input: function(id) {
		$("#sceneContainer span#capture").off("click");
		$("#sceneContainer span#delete").off("click");
		$("#sceneContainer input#titleInput").prop("disabled", true);
		$("#sceneContainer select#periodInput").prop("disabled", true);
		$("#sceneContainer input#dateInput").prop("disabled", true);
		$("#sceneContainer input#timeInput").prop("disabled", true);
		$("#sceneContainer input#mediaInput").prop("disabled", true);

		$(`li[data-sceneid="${id}"] span#capture`).click( ev => { this.capture(id); this.set_scene_style(id); } );
		$(`li[data-sceneid="${id}"] span#delete`).click( ev => { this.delete(id); } );
		$(`li[data-sceneid="${id}"] input#titleInput`).prop("disabled", false);
		$(`li[data-sceneid="${id}"] select#periodInput`).prop("disabled", false);
		$(`li[data-sceneid="${id}"] input#dateInput`).prop("disabled", false);
		$(`li[data-sceneid="${id}"] input#timeInput`).prop("disabled", false);
		$(`li[data-sceneid="${id}"] input#mediaInput`).prop("disabled", false);
	},

	set_scene_style: function(id) {
		if( $(`li[data-sceneid="${id}"]`).hasClass("active") ) return;

		$("#sceneContainer li").removeClass("inactive");
		$("#sceneContainer li").removeClass("active");
		$(`li[data-sceneid="${id}"]`).addClass("active");

		if(_FONT) {
			$(`li[data-sceneid="${id}"] input#titleInput`).css("font-family", _FONT);
			$(`li[data-sceneid="${id}"] select#periodInput`).css("font-family", _FONT);
			$(`li[data-sceneid="${id}"] input#dateInput`).css("font-family", _FONT);
			$(`li[data-sceneid="${id}"] input#timeInput`).css("font-family", _FONT);
			$(`li[data-sceneid="${id}"] div#textInput`).css("font-family", _FONT);
		}
	},

	set_click: function() {
		$("#sceneContainer li").off("click");
		$("#sceneContainer li:not([class*=\"active\"])").click(ev => {
			let scene = get_element_scene(ev.target);
			if(!scene) return;
			let id = scene.id;

			let prevId = $("#sceneContainer li[class*=\"active\"]").data("sceneid"), t = false;
			if(prevId) {
				t = get_scene(prevId).index == get_scene(id).index - 1;
			}

			this.set_scene( id, t );
		});
		$("#sceneContainer li[class*=\"active\"]").click(ev => {
			let scene = get_element_scene(ev.target);
			if(!scene) return;
			let id = scene.id;

			if( $(`li[data-sceneid="${id}"]`).hasClass("inactive") ) {
				$(`li[data-sceneid="${id}"]`).removeClass("inactive");
				$(`li[data-sceneid="${id}"]`).addClass("active");
			}

			let s = get_scene(id);
			_MAP.flyTo(s.center, Math.min(s.zoom, _MAP.getMaxZoom()), { noMoveStart: true, duration: _PANNINGSPEED || null });
		});
		$("#sceneContainer li input, #sceneContainer li div#textInput").click(ev => { ev.stopPropagation(); });
	},
	unset_click: function() {
		$("#sceneContainer li, #sceneContainer li input, #sceneContainer li div#textInput").off("click");
	},

	set_add: function(id) {
		add_scene(id);

		$(`li[data-sceneid="${id}"] input#titleInput`).change( ev => { this.input(id, "title", ev.target.value); } );
		$(`li[data-sceneid="${id}"] select#periodInput`).change( ev => { this.input(id, "period", ev.target.value); } );
		$(`li[data-sceneid="${id}"] input#dateInput`).change( ev => { this.input(id, "date", ev.target.value); } );
		$(`li[data-sceneid="${id}"] input#timeInput`).change( ev => { this.input(id, "time", ev.target.value); } );
		$(`li[data-sceneid="${id}"] input#mediaInput`).change( ev => {
			let files = ev.target.files,
				media = [],
				self = this;
			let length = Math.min(files.length, 4);

			for(let i = 0; i < length; i++) {
				(function(file) {
					let fr = new FileReader();
					fr.onload = function(ev) {
						media.push( ev.target.result );

						if(media.length >= length) {
							self.input(id, "media", media);
							self.set_media(id);
						}
					};
					fr.readAsDataURL( file );
				})(files[i]);
			}
		} );
		textareas[id] = pell.init({
			element: document.querySelector(`li[data-sceneid="${id}"] div#textInput`),
			onChange: html => { this.input(id, "text", html); },
			defaultParagraphSeparator: "p",
			styleWithCSS: false,
			actions: [ "bold", "underline", { name: "italic", result: () => pell.exec("italic") }, { name: "link", result: () => { const url = window.prompt("Enter the link URL"); if(url) pell.exec("createLink", url); } } ]
		});
	},

	set_media: function(id) {
		let s = get_scene(id);

		let res = "", w = 12 / Math.min(s.media.length, 4);
		for(let m of s.media) {
			res += `
				<div class="col-${w}">
					<img src="${m}" class="img-fluid rounded" alt="" />
				</div>
			`;
		}
		$(`li[data-sceneid="${id}"] #mediaPlaceholder`).html(res);
	},

	set_basemap: function(url) {
		let basemap = get_basemap(url);

		if(basemap) _MAP.setBasemap(basemap.int, basemap.int ? basemap.name : basemap.url, basemap.zoom[0], basemap.zoom[1], basemap.cc);
		else _MAP.setBasemap(false, url, 0, 22, "&copy; <a href=\"https://tellusmap.com\" target=\"_blank\">TellUs</a>");
	},

	flash_map: function() {
		$("div#map").addClass("snapshot");
		setTimeout(function() { $("div#map").removeClass("snapshot"); }, 240);
	}

};



_EVENTS.object = {

	setup: function(object) {
		switch(object.options.type) {
			case "marker":
				this.setup_marker(object);
				break;

			case "polyline":
				this.setup_polyline(object);
				break;

			case "polygon":
			case "rectangle":
				this.setup_polygon(object);
				break;

			default:
				console.error("object type invalid");
				break;
		}
	},

	setup_marker: function(object) {
		$("#markerPopup input#icon").change(function(ev) {
			let file = $(this)[0].files[0];

			let fr = new FileReader();
			fr.onload = function() {
				let res = fr.result;

				object.setIcon(
					L.icon({
						iconUrl: res,
						iconSize: [50, 50],
						popupAnchor: [0, -25],
						className: "markerIcon"
					})
				);

				$(object._icon).css("border", "0px solid #563d7c");
				_MAP.updateObject(object.options.id);
			};
			fr.readAsDataURL(file);
		});

		$("#markerPopup input#color").change(function(ev) {
			let val = $(this).val();

			$(object._icon).css("border-color", val);
			object.options.borderColor = val;
			_MAP.updateObject(object.options.id);
		});
		$("#markerPopup input#color").val(object.options.borderColor || "#563d7c");

		$("#markerPopup input#thickness").change(function(ev) {
			let val = Math.min( Math.max( 0, $(this).val() ), 10 );

			$(object._icon).css("border-width", `${val}px`);
			object.options.borderThickness = val;
			_MAP.updateObject(object.options.id);
		});

		$("#markerPopup input#blur").change(function(ev) {
			let val = Math.min( Math.max( 0, $(this).val() ), 3 );

			object.options.overlayBlur = val;
			$(object._icon).css("filter", `
				blur(${object.options.overlayBlur}px)
				grayscale(${object.options.overlayGrayscale*100}%)
				drop-shadow(0 0 ${object.options.overlayBrightness}px yellow)
				opacity(${(1 - object.options.overlayTransparency)*100}%)
			`);

			_MAP.updateObject(object.options.id);
		});

		$("#markerPopup input#grayscale").change(function(ev) {
			let val = Math.min( Math.max( 0, $(this).val() ), 1 );

			object.options.overlayGrayscale = val;
			$(object._icon).css("filter", `
				blur(${object.options.overlayBlur}px)
				grayscale(${object.options.overlayGrayscale*100}%)
				drop-shadow(0 0 ${object.options.overlayBrightness}px yellow)
				opacity(${(1 - object.options.overlayTransparency)*100}%)
			`);

			_MAP.updateObject(object.options.id);
		});

		$("#markerPopup input#brightness").change(function(ev) {
			let val = Math.min( Math.max( 0, $(this).val() ), 6 );

			object.options.overlayBrightness = val;
			$(object._icon).css("filter", `
				blur(${object.options.overlayBlur}px)
				grayscale(${object.options.overlayGrayscale*100}%)
				drop-shadow(0 0 ${object.options.overlayBrightness}px yellow)
				opacity(${(1 - object.options.overlayTransparency)*100}%)
			`);

			_MAP.updateObject(object.options.id);
		});

		$("#markerPopup input#transparency").change(function(ev) {
			let val = Math.min( Math.max( 0, $(this).val() ), 0.9 );

			object.options.overlayTransparency = val;
			$(object._icon).css("filter", `
				blur(${object.options.overlayBlur}px)
				grayscale(${object.options.overlayGrayscale*100}%)
				drop-shadow(0 0 ${object.options.overlayBrightness}px yellow)
				opacity(${(1 - object.options.overlayTransparency)*100}%)
			`);

			_MAP.updateObject(object.options.id);
		});

		$("#markerPopup #delete").click(function(ev) {
			_MAP.deleteObject(object.options.id, object.options.type);
		});
	},

	setup_polyline: function(object) {
		$("#polylinePopup input#color").change(function(ev) {
			object.setStyle({ color: $(this).val() });
			_MAP.updateObject(object.options.id);
		});
		$("#polylinePopup input#color").val(object.options.color || "#563d7c");

		$("#polylinePopup input#thickness").change(function(ev) {
			object.setStyle({ weight: Math.min( Math.max( 2, $(this).val() ), 10 ) });
			_MAP.updateObject(object.options.id);
		});

		$("#polylinePopup input#transparency").change(function(ev) {
			object.setStyle({ opacity: 1 - Math.min( Math.max( 0, $(this).val() ), 0.9 ) });
			_MAP.updateObject(object.options.id);
		});

		$("#polylinePopup #delete").click(function(ev) {
			_MAP.deleteObject(object.options.id, object.options.type);
		});
	},

	setup_polygon: function(object) {
		$("#polygonPopup input#lineColor").change(function(ev) {
			object.setStyle({ color: $(this).val() });
			_MAP.updateObject(object.options.id);
		});
		$("#polygonPopup input#lineColor").val(object.options.color || "#563d7c");

		$("#polygonPopup input#lineThickness").change(function(ev) {
			object.setStyle({ weight: Math.min( Math.max( 2, $(this).val() ), 10 ) });
			_MAP.updateObject(object.options.id);
		});

		$("#polygonPopup input#lineTransparency").change(function(ev) {
			object.setStyle({ opacity: 1 - Math.min( Math.max( 0, $(this).val() ), 0.9 ) });
			_MAP.updateObject(object.options.id);
		});

		$("#polygonPopup input#fillColor").change(function(ev) {
			object.setStyle({ fillColor: $(this).val() });
			_MAP.updateObject(object.options.id);
		});
		$("#polygonPopup input#fillColor").val(object.options.fillColor || "#563d7c");

		$("#polygonPopup input#fillTransparency").change(function(ev) {
			object.setStyle({ fillOpacity: 1 - Math.min( Math.max( 0, $(this).val() ), 1 ) });
			_MAP.updateObject(object.options.id);
		});

		$("#polygonPopup #delete").click(function(ev) {
			_MAP.deleteObject(object.options.id, object.options.type);
		});
	}

};



_EVENTS.options = {

	setup: function() {

		$("#optionsModal select#clusteringInput").change(function(ev) {
			let val = $(this).val();
			_CLUSTERING = val;
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

		$("#optionsModal select#fontInput").change(function(ev) {
			let val = $(this).val(), font;

			switch(val) {
				case "arial":			font = "Arial, sans-serif"; break;
				case "verdana":			font = "Verdana, sans-serif"; break;
				case "helvetica":		font = "Helvetica, sans-serif"; break;
				case "times new roman":	font = "\"Times New Roman\", serif"; break;
				case "georgia":			font = "Georgia, serif"; break;
				case "courier new":		font = "\"Courier New\", monospace"; break;
				case "brush script mt":	font = "\"Brush Script MT\", cursive"; break;
				default:				font = "inherit"; break;
			}

			$("#sceneContainer input#titleInput").css("font-family", font);
			$("#sceneContainer select#periodInput").css("font-family", font);
			$("#sceneContainer input#dateInput").css("font-family", font);
			$("#sceneContainer input#timeInput").css("font-family", font);
			$("#sceneContainer div#textInput").css("font-family", font);

			$(this).css("font-family", font);

			_FONT = font;
		});

		init_themes();

		$("#optionsModal input[name=\"themeRadio\"]").click(ev => {
			let theme = $(ev.target).prop("id");
			if(!theme) return;

			_THEME = theme;
		});

	}

};



_EVENTS.basemapOptions = {

	setup: function() {

		init_basemaps();

		$("#basemapModal #basemaps").click(ev => {
			let name = $(ev.target).data("basemap");
			if(!name) return;
			let basemap = get_basemap(name);

			this.unsetSceneBasemap();
			_MAP.setBasemap(basemap.int, basemap.int ? name : basemap.url, basemap.zoom[0], basemap.zoom[1], basemap.cc);
			this.setSceneBasemap();
		});

		$("#basemapModal input#basemapFile").change(ev => {
			var self = this;
			let file = $(ev.target)[0].files[0];

			let fr = new FileReader();
			fr.onload = function() {
				let res = fr.result;

				let img = new Image();
				img.onload = function() {
					let width = this.width,
						height = this.height;

					self.unsetSceneBasemap();
					_MAP.imgBasemap(res, width, height);
					self.setSceneBasemap();

					return true;
				};
				img.src = res;
			};
			fr.readAsDataURL(file);
		});

		$("#basemapModal input#basemapLink").change(ev => {
			$("#basemapModal input#basemapKey").off("change");

			let url = $(ev.target).val();
			let protocol = url.split(/\:/ig)[0];

			if(protocol == "mapbox") {
				let key = $("#basemapModal input#basemapKey").val(),
					username = url.split(/mapbox\:\/\/styles\//ig)[1].split(/\//ig)[0],
					styleID = url.split(/mapbox\:\/\/styles\//ig)[1].split(/\//ig)[1];
				if(!key) {
					$("#basemapModal input#basemapKey").change(ev => {
						$(ev.target).off("change");
						key = $(ev.target).val();

						url = `https://api.mapbox.com/styles/v1/${username}/${styleID}/tiles/256/{z}/{x}/{y}?access_token=${key}`;
						_MAP.setBasemap(false, url, 0, 22, "&copy; <a href=\"https://tellusmap.com\" target=\"_blank\">TellUs</a>");
					});
				}else{
					url = `https://api.mapbox.com/styles/v1/${username}/${styleID}/tiles/256/{z}/{x}/{y}?access_token=${key}`;
					_MAP.setBasemap(false, url, 0, 22, "&copy; <a href=\"https://tellusmap.com\" target=\"_blank\">TellUs</a>");
				}
			}else{
				_MAP.setBasemap(false, url, 0, 22, "&copy; <a href=\"https://tellusmap.com\" target=\"_blank\">TellUs</a>");
			}
		});

	},

	unsetSceneBasemap: function() {
		let sceneId = $("#sceneContainer li[class*=\"active\"]").data("sceneid");
		if(!sceneId) { console.error("No active scene found"); return; }

		let i = get_scene(sceneId).index + 1;
		let nextScene = _SCENES[ i ];
		if(nextScene && !nextScene.basemap) {
			_SCENES[ i ].basemap = _MAP.getBasemap();
		}
	},

	setSceneBasemap: function() {
		let sceneId = $("#sceneContainer li[class*=\"active\"]").data("sceneid");
		if(!sceneId) { console.error("No active scene found"); return; }

		let s = get_scene(sceneId);
		_SCENES[s.index].basemap = _MAP.getBasemap();

		reset_scene_basemaps();
	}

};



_EVENTS.project = {

	setup: function() {
		let self = this;

		$("#importModal button#import").click(ev => {
			$("#importModal").modal("hide");

			let file = $("#importModal input#fileInput")[0].files[0];
			if(!file) return;

			let fr = new FileReader();
			fr.onload = function() {
				let res = fr.result;
				res = JSON.parse(res);

				self.import(res);
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

			_EVENTS.scene.set_add(s.id);

			_SCENES.push(s);

			$(`li[data-sceneid="${s.id}"] input#titleInput`).val( s.title || "" );
			$(`li[data-sceneid="${s.id}"] select#periodInput`).val( s.period || "ad" );
			$(`li[data-sceneid="${s.id}"] input#dateInput`).val( s.date || "" );
			$(`li[data-sceneid="${s.id}"] input#timeInput`).val( s.time || "" );
			if(s.media && s.media.length > 0) _EVENTS.scene.set_media(s.id);
			textareas[s.id].content.innerHTML = s.text || "";
		}

		_MAP.importData(data.objects);

		_EVENTS.scene.set_scene( _SCENES[index].id );
	},

	export: function() {
		$("#exportMap").off("click");

		let el = document.createElement("a");

		let filename = "project.tellus";

		let project = {
			options: {
				clustering: _CLUSTERING,
				avatarspeed: _AVATARSPEED,
				panningspeed: _PANNINGSPEED,
				font: _FONT,
				theme: _THEME
			},
			scenes: _SCENES,
			objects: _MAP.exportData()
		};
		project = JSON.stringify(project);

		el.setAttribute("href", "data:application/json;charset=utf-8," + encodeURIComponent(project));
		el.setAttribute("download", filename);
		el.style.display = "none";

		document.body.appendChild(el);
		$(el).ready(() => {
			el.click();
			document.body.removeChild(el);

			$("#exportMap").click(ev => { this.export(); });
		});
		/*setTimeout(function() {
			el.click();
			document.body.removeChild(el);

			$("#exportMap").click(ev => { this.export(); });
		}, 200);*/
	}

};
