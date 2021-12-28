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

		//$("#sceneCol button#addScene").click( ev => { this.add(); } );

		$("ul#sceneContainer").sortable({ // https://api.jqueryui.com/sortable/
			cursor: "move",
			handle: "#reorder",
			items: "> li",
			axis: "y",
			containment: "parent",
			tolerance: "pointer",
			//scroll: false,
			start: (ev, ui) => {
				ev.stopPropagation();
				this.unset_click();
			},
			update: (ev, ui) => {
				ev.stopPropagation();

				let order = $("ul#sceneContainer").sortable("toArray"),
					sceneId = $(ui.item[0]).data("sceneid");
				this.reorder( order, sceneId );
			},
			stop: (ev, ui) => {
				ev.stopPropagation();
				this.set_click();
			}
		});

		$("#sceneCol").keydown(ev => { if(["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft", "Space"].indexOf(ev.code) > -1) { ev.preventDefault(); } });
		$("#sceneCol").keyup(ev => {
			let keycode = ev.code,
				id = $("#sceneContainer li[class*=\"active\"]").data("sceneid");
			if(!id) return;

			let s = get_scene(id);

			if(keycode == "ArrowUp" && s.index > 0) {
				ev.preventDefault();
				this.set_scene( _SCENES[s.index - 1].id, true );
			}

			if(keycode == "ArrowDown" && s.index < _SCENES.length - 1) {
				ev.preventDefault();
				this.set_scene( _SCENES[s.index + 1].id, true );
			}

			if(["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft", "Space"].indexOf(keycode) > -1) { ev.preventDefault(); }
		});

		_MAP.setup();
	},

	reset: function() {
		reset_scene();
		$("#sceneCol button#addScene").click( ev => { this.setup(); this.add(); } );

		_MAP.reset();
	},

	prepare: function(prevId) {
		prepare_scene(prevId);

		this.unset_click();

		let handler = ev => { ev.stopPropagation(); };
		$("#sceneContainer li #reorder").mousedown(handler);

		$("#sceneContainer li").removeClass("inactive active");
		$("li#prepare").addClass("active");

		$("li#prepare")[0].scrollIntoView({ behavior: "smooth", block: "center" });

		$("li#prepare button#capture").click(ev => {
			$("#sceneContainer li #reorder").unbind("mousedown", handler);
			$("li#prepare").remove();

			this.add(prevId);
		});
	},

	add: function(prevId) {
		let id = uuid();

		this.set_add(id, prevId);

		let s = { id: id };

		if(prevId) {
			let prevScene = get_scene(prevId);
			if(prevScene.period)	s.period = prevScene.period;
			if(prevScene.date)		s.date = prevScene.date;
			if(prevScene.time)		s.time = prevScene.time;
			if(prevScene.content)	s.content = prevScene.content;

			$(`li[data-sceneid="${id}"] select#periodInput`).val( s.period || "ad" );
			$(`li[data-sceneid="${id}"] input#dateInput`).val( s.date || "" );
			$(`li[data-sceneid="${id}"] input#timeInput`).val( s.time || "" );
			$(`li[data-sceneid="${id}"] #textInput`).trumbowyg("html", s.content || "");

			_SCENES.splice(prevScene.index + 1, 0, s);
		}
		else{ _SCENES.push(s); }

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

		let nw = _MAP.getBounds().getNorthWest(),
			se = _MAP.getBounds().getSouthEast();
		_SCENES[s.index].bounds = [[nw.lat, nw.lng], [se.lat, se.lng]];

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
			if(nextS && !nextS.basemap) { _SCENES[ s.index + 1 ].basemap = s.basemap; }
		}

		_SCENES.splice(s.index, 1);

		$(`li[data-sceneid="${id}"] #textInput`).trumbowyg("destroy");
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

		this.set_basemap( s.basemap || get_last_scene_basemap(id) );

		_MAP.setObjects(id, animate);

		_MAP.setFlyTo(s.bounds);
	},

	set_scene_input: function(id) {
		$("#sceneContainer span#capture, #sceneContainer span#delete, #sceneContainer span#add").off("click");
		$("#sceneContainer select#periodInput, #sceneContainer input#dateInput, #sceneContainer input#timeInput").prop("disabled", true);
		$("#sceneContainer #textInput").each(function(index) { $(this).trumbowyg("disable"); });

		$(`li[data-sceneid="${id}"] span#capture`).click( ev => { this.capture(id); this.set_scene_style(id); } );
		$(`li[data-sceneid="${id}"] span#delete`).click( ev => { this.delete(id); } );
		$(`li[data-sceneid="${id}"] span#add`).click( ev => { this.prepare(id); ev.stopPropagation(); } );
		$(`li[data-sceneid="${id}"] select#periodInput, li[data-sceneid="${id}"] input#dateInput, li[data-sceneid="${id}"] input#timeInput`).prop("disabled", false);
		$(`li[data-sceneid="${id}"] #textInput`).trumbowyg("enable");
	},

	set_scene_style: function(id) {
		if( $(`li[data-sceneid="${id}"]`).hasClass("active") ) return;

		$("#sceneContainer li").removeClass("inactive active");
		$(`li[data-sceneid="${id}"]`).addClass("active");
	},

	set_click: function() {
		this.unset_click();

		$("#sceneContainer li:not([class*=\"active\"])").click(ev => {
			let scene = get_element_scene(ev.target);
			if(!scene) return;
			let id = scene.id;

			let prevId = $("#sceneContainer li[class*=\"active\"]").data("sceneid"), t = false;
			if(prevId) { t = Math.abs( get_scene(id).index - get_scene(prevId).index ) == 1; }

			this.set_scene( id, t );
		});

		$("#sceneContainer li[class*=\"active\"]").click(ev => {
			if(_IS_MAP_MOVING) return;

			let scene = get_element_scene(ev.target);
			if(!scene) return;
			let id = scene.id;

			if( $(`li[data-sceneid="${id}"]`).hasClass("inactive") ) {
				$(`li[data-sceneid="${id}"]`).removeClass("inactive");
				$(`li[data-sceneid="${id}"]`).addClass("active");
			}

			_MAP.setFlyTo(scene.bounds);
			_IS_MAP_MOVING = true;
		});

		$("#sceneContainer li input, #sceneContainer li select, #sceneContainer li .trumbowyg-box").click(ev => { ev.stopPropagation(); });
	},
	unset_click: function() {
		$("#sceneContainer li, #sceneContainer li input, #sceneContainer li select, #sceneContainer li .trumbowyg-box").off("click");
	},

	set_add: function(id, prevId) {
		let self = this;
		add_scene(id, prevId);

		$(`li[data-sceneid="${id}"]`).on("keydown keyup", ev => { ev.stopPropagation(); });

		$(`li[data-sceneid="${id}"] select#periodInput`).change( ev => { this.input(id, "period", ev.target.value); } );
		$(`li[data-sceneid="${id}"] input#dateInput`).change( ev => { this.input(id, "date", ev.target.value); } );
		$(`li[data-sceneid="${id}"] input#timeInput`).change( ev => { this.input(id, "time", ev.target.value); } );
		$(`li[data-sceneid="${id}"] #textInput`).trumbowyg({
			autogrow: true,
			semantic: false,
			resetCss: true,
			removeformatPasted: true,
			urlProtocol: true,
			defaultLinkTarget: "_blank",
			tagsToRemove: ["script", "link"],
			btnsDef: {
				format: {
					dropdown: ["bold", "italic", "underline", "del"],
					title: "Format",
					ico: "bold"
				},
				align: {
					dropdown: ["justifyLeft", "justifyCenter", "justifyRight", "justifyFull", "unorderedList", "orderedList"],
					title: "List/Align",
					ico: "justifyLeft"
				}
			},
			btns: [
				//["undo", "redo"], // NOTE: Only supported in Blink browsers
				["formatting"],
				["format"],
				["align"],
				["fontfamily"],
				["foreColor", "backColor"],
				//["link"],
				["base64"]
				//["removeformat"]
			],
			plugins: {}
		}).on("tbwchange", function() {
			let cont = $(this).trumbowyg("html");
			self.input(id, "content", cont);
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
		$("#markerPopup input#label").change(function(ev) {
			let val = $(this).val();

			if(val) {
				let tooltip = object.getTooltip();

				if(!tooltip) object.bindTooltip(val, { direction: "bottom", permanent: true });
				else object.setTooltipContent(val);
			}
			else{ object.unbindTooltip(); }

			object.options.label = val;
			_MAP.updateObject(object.options.id);
		});
		$("#markerPopup input#label").val(object.options.label || "");

		$("#markerPopup input#icon").change(function(ev) {
			let file = $(this)[0].files[0];

			let fr = new FileReader();
			fr.onload = function() {
				let res = fr.result;

				let img = new Image();
				img.onload = function() {
					let ratio = this.width / this.height,
						width, height;

					for(let w = 50; w > 0; w--) {
						let h = w / ratio;
						if(h < 180) {
							width = w;
							height = h;
							break;
						}
					}
					if(!width || !height) { return; }

					object.setIcon(
						L.icon({
							iconUrl: res,
							iconSize: [ width, height ],
							popupAnchor: [ 0, (-1) * (height / 2) ],
							tooltipAnchor: [ 0, height / 2 ]
						})
					);

					$("#markerPopup select#size").val("medium");
					$("#markerPopup input#rounded").prop("checked", false);
					// TODO: Also set rotation-angle input to 0

					object.options.ratio = ratio;
					object.options.rounded = false;
					object.options.angle = 0;

					_MAP.updateObject(object.options.id);
					_MAP.setIcon(object.options.id, [width, height]);

					return true;
				};
				img.src = res;
			};
			fr.readAsDataURL(file);
		});

		$("#markerPopup input#size").change(function(ev) {
			let val = Math.min( Math.max( 10, $(this).val() ), 100 );

			_MAP.setIcon(object.options.id, [ val, val / object.options.ratio ]);
			_MAP.updateObject(object.options.id);
		});

		$("#markerPopup input#rounded").change(function(ev) {
			object.options.rounded = this.checked;

			_MAP.updateObject(object.options.id);
			_MAP.setIcon(object.options.id);
		});
		$("#markerPopup input#rounded").prop("checked", object.options.rounded);

		$("#markerPopup input#color").change(function(ev) {
			let val = $(this).val();

			object.options.borderColor = val;
			_MAP.updateObject(object.options.id);
			_MAP.setIcon(object.options.id);
		});
		$("#markerPopup input#color").val(object.options.borderColor || "#563d7c");

		$("#markerPopup input#thickness").change(function(ev) {
			let val = Math.min( Math.max( 0, $(this).val() ), 10 );

			object.options.borderThickness = val;
			_MAP.updateObject(object.options.id);
			_MAP.setIcon(object.options.id);
		});

		$("#markerPopup input#blur").change(function(ev) {
			let val = Math.min( Math.max( 0, $(this).val() ), 3 );

			object.options.overlayBlur = val;
			_MAP.updateObject(object.options.id);
			_MAP.setIcon(object.options.id);
		});

		$("#markerPopup input#grayscale").change(function(ev) {
			let val = Math.min( Math.max( 0, $(this).val() ), 1 );

			object.options.overlayGrayscale = val;
			_MAP.updateObject(object.options.id);
			_MAP.setIcon(object.options.id);
		});

		$("#markerPopup input#brightness").change(function(ev) {
			let val = Math.min( Math.max( 0, $(this).val() ), 6 );

			object.options.overlayBrightness = val;
			_MAP.updateObject(object.options.id);
			_MAP.setIcon(object.options.id);
		});

		$("#markerPopup input#transparency").change(function(ev) {
			let val = Math.min( Math.max( 0, $(this).val() ), 0.9 );

			object.options.overlayTransparency = val;
			_MAP.updateObject(object.options.id);
			_MAP.setIcon(object.options.id);
		});

		//$("#markerPopup #bringToFront").click(function(ev) { /**/ });

		$("#markerPopup #makeGlobal").click(function(ev) {
			_MAP.globalObjectOptions(object.options.id);
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

			$(this).css("font-family", font);

			_FONT = font;
		});

		//init_themes();

		/*$("#optionsModal input[name=\"themeRadio\"]").click(ev => {
			let theme = $(ev.target).prop("id");
			if(!theme) return;

			_THEME = theme;
		});*/

	}

};



_EVENTS.basemapOptions = {

	setup: function() {

		init_basemaps();

		$("#basemapModal #basemaps").click(ev => {
			let index = $(ev.target).data("basemap");
			if(!index && index != 0) return;
			let basemap = _BASEMAPS[index];

			this.unsetSceneBasemap();
			_MAP.setBasemap( basemap.tiles );
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
			if(!url) return;

			let tiles = L.tileLayer(url, { minZoom: 0, maxZoom: 22, attribution: "&copy; <a href=\"https://tellusmap.com\" target=\"_blank\">TellUs</a>" });

			let protocol = url.split(/\:/ig)[0];
			if(protocol == "mapbox") {
				let username = url.split(/mapbox\:\/\/styles\//ig)[1].split(/\//ig)[0],
					styleID = url.split(/mapbox\:\/\/styles\//ig)[1].split(/\//ig)[1],
					key = $("#basemapModal input#basemapKey").val();
				if(!key) {
					$("#basemapModal input#basemapKey").change(ev => { //$(ev.target).off("change");
						key = $(ev.target).val();

						url = `https://api.mapbox.com/styles/v1/${username}/${styleID}/tiles/256/{z}/{x}/{y}?access_token=${key}`;
						tiles.setUrl(url, true);
						_MAP.setBasemap(tiles, is_internal_roman_basemap(url));
					});
				}else{
					url = `https://api.mapbox.com/styles/v1/${username}/${styleID}/tiles/256/{z}/{x}/{y}?access_token=${key}`;
					tiles.setUrl(url, true);
					_MAP.setBasemap(tiles, is_internal_roman_basemap(url));
				}
			}else{
				_MAP.setBasemap(tiles);
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

			$(`li[data-sceneid="${s.id}"] select#periodInput`).val( s.period || "ad" );
			$(`li[data-sceneid="${s.id}"] input#dateInput`).val( s.date || "" );
			$(`li[data-sceneid="${s.id}"] input#timeInput`).val( s.time || "" );
			$(`li[data-sceneid="${s.id}"] #textInput`).trumbowyg("html", s.content || s.text || "");
		}

		_MAP.importData(data.objects);

		_EVENTS.scene.set_scene( _SCENES[index].id );
	},

	export: function() {
		$("#exportMap").off("click");

		let el = document.createElement("a");

		let f = v => v < 10 && v >= 0 ? `0${v}` : `${v}`;
		let date = new Date();
		let y = date.getFullYear(),
			m = f(date.getMonth() + 1),
			d = f(date.getDate()),
			H = f(date.getHours()),
			M = f(date.getMinutes()),
			S = f(date.getSeconds());
		let filename = `project-${y}.${m}.${d}-${H}.${M}.${S}.tellus`;

		let project = {
			options: {
				clustering: _CLUSTERING,
				avatarspeed: _AVATARSPEED,
				panningspeed: _PANNINGSPEED,
				font: _FONT,
				theme: _THEME
			},
			scenes: _SCENES.map(scene => {
				let s = Object.assign({}, scene);
				if(s.content && s.text) { delete s.text }
				return s;
			}),
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
