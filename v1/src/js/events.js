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


let textareas = {}, sceneid;

_EVENTS.scene = {

	setup: function() {
		init_scene();

		this.add();
		$("#sceneCol button#addScene").click( ev => { this.add(); } );
		//$("#markerPopup input#pin").prop("disabled", false);

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

				this.set_click();
				this.reorder( $("ul#sceneContainer").sortable("toArray") );
			}
			//stop: (ev, ui) => {}
		});

		$(document).keydown(ev => {
			let keycode = ev.keyCode,
				id = $("#sceneContainer [class*=\"active\"]").data("sceneid");
			if(!id) return;

			let s = get_scene(id);

			if(keycode == 38 && s.index > 0) {
				this.set_scene( _SCENES[s.index - 1].id );
			}

			if(keycode == 40 && s.index < _SCENES.length - 1) {
				this.set_scene( _SCENES[s.index + 1].id );
			}
		});
	},

	reset: function() {
		reset_scene();

		$("#sceneCol button#addScene").click( ev => { this.setup(); } );
		//$("#markerPopup input#pin").prop("disabled", true);
	},

	add: function() {
		let id = uuid(),
			prevId = _SCENES.length > 0 ? _SCENES[_SCENES.length - 1].id : null;

		add_scene(id);

		$(`li[data-sceneid="${id}"] input#titleInput`).change( ev => { this.input(id, "title", ev.target.value); } );
		$(`li[data-sceneid="${id}"] input#dateInput`).change( ev => { this.input(id, "date", ev.target.value); } );
		$(`li[data-sceneid="${id}"] input#timeInput`).change( ev => { this.input(id, "time", ev.target.value); } );
		$(`li[data-sceneid="${id}"] input#mediaInput`).change( ev => { this.input(id, "media", ""); } );
		textareas[id] = this.create_pell(id);

		let scene = {
			id: id,
			center: _MAP.getCenter(),
			zoom: _MAP.getZoom()
		};

		if(prevId) {
			let prevScene = get_scene(prevId);

			scene.date = prevScene.date;
			scene.time = prevScene.time;
			$(`li[data-sceneid="${id}"] input#dateInput`).val( scene.date || "" );
			$(`li[data-sceneid="${id}"] input#timeInput`).val( scene.time || "" );
		}

		_SCENES.push(scene);

		this.flash_map();
		this.set_scene(id);

		//let el = document.querySelector("div#sceneCol");
		//el.scrollTo(0, el.scrollHeight);
	},

	input: function(id, type, value) {
		let s = get_scene(id);

		_SCENES[s.index][type] = value;
	},

	recapture: function(id) {
		let s = get_scene(id);

		_SCENES[s.index].center = _MAP.getCenter();
		_SCENES[s.index].zoom = _MAP.getZoom();

		this.flash_map();

		this.set_scene_style(id);
	},

	delete: function(id) {
		let s = get_scene(id);
		let i = s.index == _SCENES.length - 1 ? s.index - 1 : s.index;

		_SCENES.splice(s.index, 1);
		delete textareas[id];

		$(`li[data-sceneid="${id}"]`).remove();

		if(_SCENES.length <= 0) { this.reset(); }
		else {
			this.set_click();
			this.set_scene( _SCENES[i].id );
		}
	},

	reorder: function(order) {
		_SCENES.sort((a,b) => order.indexOf(a.id) - order.indexOf(b.id));
	},



	set_click: function() {
		$("#sceneContainer li:not([class*=\"active\"])").off("click");
		$("#sceneContainer li:not([class*=\"active\"])").click(ev => {
			let id = $(ev.target).data("sceneid");
			if(!id) id = $(ev.target.offsetParent).data("sceneid");
			if(!id) return;

			this.set_scene(id);
		});
	},
	unset_click: function() {
		$("#sceneContainer li:not([class*=\"active\"])").off("click");
	},

	set_scene: function(id) {
		let s = get_scene(id); //, currentScene = $("#sceneContainer li[class*=\"active\"]").data("sceneid");

		this.set_scene_input(id);
		this.set_scene_style(id);
		this.set_click();

		$(`li[data-sceneid="${id}"]`)[0].scrollIntoView({ block: "center" });

		_MAP.off("movestart zoomstart", this.unset_scene_style);
		_MAP.flyTo(s.center, Math.min(s.zoom, _MAP.getMaxZoom()));
		_MAP.on("movestart zoomstart", this.unset_scene_style);
	},
	goto_scene: function() {
		let id = $("#sceneContainer li.inactive").data("sceneid");
		if(!id) return;

		this.set_scene(id);
	},

	set_scene_input: function(id) {
		$("#sceneContainer span#recapture").off("click");
		$("#sceneContainer span#delete").off("click");
		$("#sceneContainer input#titleInput").prop("disabled", true);
		$("#sceneContainer input#dateInput").prop("disabled", true);
		$("#sceneContainer input#timeInput").prop("disabled", true);
		$("#sceneContainer input#mediaInput").prop("disabled", true);

		$(`li[data-sceneid="${id}"] span#recapture`).click( ev => { this.recapture(id); } );
		$(`li[data-sceneid="${id}"] span#delete`).click( ev => { this.delete(id); } );
		$(`li[data-sceneid="${id}"] input#titleInput`).prop("disabled", false);
		$(`li[data-sceneid="${id}"] input#dateInput`).prop("disabled", false);
		$(`li[data-sceneid="${id}"] input#timeInput`).prop("disabled", false);
		$(`li[data-sceneid="${id}"] input#mediaInput`).prop("disabled", false);
	},

	set_scene_style: function(id) {
		if( $(`li[data-sceneid="${id}"]`).hasClass("active") ) return;

		$("#sceneContainer li").removeClass("inactive");
		$("#sceneContainer li").removeClass("active");
		$(`li[data-sceneid="${id}"]`).addClass("active");

		_MAP.sceneButton.disable();

		if(_FONT) {
			$(`li[data-sceneid="${id}"] input#titleInput`).css("font-family", _FONT);
			$(`li[data-sceneid="${id}"] input#dateInput`).css("font-family", _FONT);
			$(`li[data-sceneid="${id}"] input#timeInput`).css("font-family", _FONT);
			$(`li[data-sceneid="${id}"] div#textInput`).css("font-family", _FONT);
		}
	},
	unset_scene_style: function() {
		let id = $("#sceneContainer li.active").data("sceneid");

		if(!id) return;
		if( $(`li[data-sceneid="${id}"]`).hasClass("inactive") ) return;

		$("#sceneContainer li").removeClass("inactive");
		$("#sceneContainer li").removeClass("active");
		$(`li[data-sceneid="${id}"]`).addClass("inactive");

		_MAP.sceneButton.enable();
	},



	flash_map: function() {
		$("div#map").addClass("snapshot");
		setTimeout(function() { $("div#map").removeClass("snapshot"); }, 240);
	},

	create_pell: function(id) {
		return pell.init({
			element: document.querySelector(`li[data-sceneid="${id}"] div#textInput`),
			onChange: html => { this.input(id, "text", html); },
			defaultParagraphSeparator: "p",
			styleWithCSS: false,
			actions: [
				"bold",
				"underline",
				{ name: "italic", result: () => pell.exec("italic") },
				{ name: "link",
					result: () => {
						const url = window.prompt("Enter the link URL");
						if(url) pell.exec("createLink", url);
					}
				}
			]
		});
	}

};



_EVENTS.object = {

	setup: function(id, type) {
		let o = _MAP.drawingLayer.getObject(id);

		switch(type) {
			case "marker":
				this.setup_marker(o);
				break;

			case "polyline":
				this.setup_polyline(o);
				break;

			case "polygon":
			case "rectangle":
				this.setup_polygon(o);
				break;

			default: break;
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

				$(object._icon).css("border", "1px solid #563d7c");
			};
			fr.readAsDataURL(file);
		});

		$("#markerPopup input#color").change(function(ev) {
			let val = $(this).val();

			$(object._icon).css("border-color", val);
			object.options.borderColor = val;
		});
		$("#markerPopup input#color").val(object.options.borderColor || "#563d7c");

		$("#markerPopup input#thickness").change(function(ev) {
			let val = $(this).val();

			$(object._icon).css("border-width", `${val}px`);
			object.options.borderThickness = val;
		});

		$("#markerPopup input#blur").change(function(ev) {
			let val = $(this).val();

			$(object._icon).css("filter", `blur(${val}px)`);
			object.options.overlayBlur = val;
		});

		$("#markerPopup input#transparency").change(function(ev) {
			let val = $(this).val();

			$(object._icon).css("filter", `opacity(${(1 - val)*100}%)`);
			object.options.overlayTransparency = val;
		});

		$("#markerPopup input#grayscale").change(function(ev) {
			let val = $(this).val();

			$(object._icon).css("filter", `grayscale(${val*100}%)`);
			object.options.overlayGrayscale = val;
		});

		$("#markerPopup input#pin").change(function(ev) {
			let checked = this.checked;

			//let sceneid = $("#sceneContainer [class*=\"active\"]").data("sceneid");
			//let scene = get_scene(sceneid);

			if(checked) {

				let lastPinned = _PINNED_MARKER;

				_PINNED_MARKER = object.options.id;
				object.options.lastPos = object.getLatLng();
				object.setLatLng(_MAP.getCenter());

				if(lastPinned) {
					let o = _MAP.drawingLayer.getObject(lastPinned);
					o.setLatLng(o.options.lastPos);
					delete o.options.lastPos;
				}

			}else{

				_PINNED_MARKER = "";
				object.setLatLng(object.options.lastPos);
				delete object.options.lastPos;

			}
		});
		$("#markerPopup input#pin").prop("checked", _PINNED_MARKER == object.options.id);
		//$("#markerPopup input#pin").prop("disabled", $("#sceneContainer [class*=\"active\"]").length <= 0);

		$("#markerPopup #delete").click(function(ev) {
			_MAP.drawingLayer.removeLayer(object.options.id);
		});
	},

	setup_polyline: function(object) {
		$("#polylinePopup input#color").change(function(ev) {
			object.setStyle({ color: $(this).val() });
		});
		$("#polylinePopup input#color").val(object.options.color || "#563d7c");

		$("#polylinePopup input#thickness").change(function(ev) {
			object.setStyle({ weight: $(this).val() });
		});

		$("#polylinePopup input#transparency").change(function(ev) {
			object.setStyle({ opacity: 1 - $(this).val() });
		});

		$("#polylinePopup #edit").click(ev => { this.set_edit(object); });

		$("#polylinePopup #delete").click(function(ev) {
			_MAP.drawingLayer.removeLayer(object.options.id);
		});
	},

	setup_polygon: function(object) {
		$("#polygonPopup input#lineColor").change(function(ev) {
			object.setStyle({ color: $(this).val() });
		});
		$("#polygonPopup input#lineColor").val(object.options.color || "#563d7c");

		$("#polygonPopup input#lineThickness").change(function(ev) {
			object.setStyle({ weight: $(this).val() });
		});

		$("#polygonPopup input#lineTransparency").change(function(ev) {
			object.setStyle({ opacity: 1 - $(this).val() });
		});

		$("#polygonPopup input#fillColor").change(function(ev) {
			object.setStyle({ fillColor: $(this).val() });
		});
		$("#polygonPopup input#fillColor").val(object.options.fillColor || "#563d7c");

		$("#polygonPopup input#fillTransparency").change(function(ev) {
			object.setStyle({ fillOpacity: 1 - $(this).val() });
		});

		$("#polygonPopup #edit").click(ev => { this.set_edit(object); });

		$("#polygonPopup #delete").click(function(ev) {
			_MAP.drawingLayer.removeLayer(object.options.id);
		});
	},

	set_marker_style: function(object) {
		let icon = object._icon,
			borderColor = object.options.borderColor,
			borderThickness = object.options.borderThickness,
			overlayBlur = object.options.overlayBlur,
			overlayTransparency = object.options.overlayTransparency,
			overlayGrayscale = object.options.overlayGrayscale;

		$(icon).css("border", `${borderThickness}px solid ${borderColor}`);
		$(icon).css("filter", `blur(${overlayBlur}px)`);
		$(icon).css("filter", `opacity(${(1 - overlayTransparency)*100}%)`);
		$(icon).css("filter", `grayscale(${overlayGrayscale*100}%)`);
	},

	set_edit: function(object) {
		return; // TODO: finish method

		_MAP.editLayer.addLayer(object);
		_MAP.editHandler.enable();

		object.setPopupContent( edit_popup() );
		let popup = object.getPopup();

		//_MAP.editHandler.disable();
		//_MAP.editLayer.removeLayer(object);
	}

};



_EVENTS.mapOptions = {

	setup: function() {

		$("#mapModal select#clusterInput").change(function(ev) {
			let val = $(this).val();
			_CLUSTERING = val;
		});

		$("#mapModal select#fontInput").change(function(ev) {
			let val = $(this).val(), font;

			switch(val) {
				case "arial":			font = "Arial, sans-serif"; break;
				case "verdana":			font = "Verdana, sans-serif"; break;
				case "helvetica":		font = "Helvetica, sans-serif"; break;
				//case "tahoma":		font = "Tahoma, sans-serif"; break;
				//case "trebuchet ms":	font = "\"Trebuchet MS\", sans-serif"; break;
				case "times new roman":	font = "\"Times New Roman\", serif"; break;
				case "georgia":			font = "Georgia, serif"; break;
				//case "garamond":		font = "Garamond, serif"; break;
				case "courier new":		font = "\"Courier New\", monospace"; break;
				case "brush script mt":	font = "\"Brush Script MT\", cursive"; break;
				default: break;
			}

			$("#sceneContainer input#titleInput").css("font-family", font);
			$("#sceneContainer input#dateInput").css("font-family", font);
			$("#sceneContainer input#timeInput").css("font-family", font);
			$("#sceneContainer div#textInput").css("font-family", font);

			_FONT = font;
		});

		$("#mapModal input#basemapFile").change(function(ev) {
			let file = $(this)[0].files[0];

			let fr = new FileReader();
			fr.onload = function() {
				let res = fr.result;

				let img = new Image();
				img.onload = function() {
					let width = this.width,
						height = this.height;

					_MAP.setBasemap(res, width, height);
					_BASEMAP = res;

					return true;
				};
				img.src = res;
			};
			fr.readAsDataURL(file);
		});

		init_basemaps();

		$("#mapModal #basemaps").click(function(ev) {
			let basemap = $(this).data("basemap");
			if(!basemap) return;

			_MAP.presetBasemap(basemap);
			_BASEMAP = basemap;
		});

	}

};



_EVENTS.project = {

	export: function() {
		let el = document.createElement("a");

		let filename = "project.tellus";

		let project = {
			font: _FONT || "default",
			basemap: _BASEMAP || "default",
			clustering: _CLUSTERING || "default",
			pinned_marker: _PINNED_MARKER || "",
			scenes: _SCENES,
			objects: _MAP.drawingLayer.export()
		};
		project = JSON.stringify(project);

		el.setAttribute("href", "data:application/json;charset=utf-8," + encodeURIComponent(project));
		el.setAttribute("download", filename);
		el.style.display = "none";

		document.body.appendChild(el);
		el.click();
		document.body.removeChild(el);
	}

};
