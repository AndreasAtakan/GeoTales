/*©agpl*************************************************************************
*                                                                              *
* DynastyMap                                                                   *
* Copyright (C) 2021  DynastyMap AS                                            *
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

		this.add();
		this.set_scoll();
		$("div#sceneCol button#addScene").click( ev => { this.add(); } );

		$("ul#sceneContainer").sortable({
			cursor: "move",
			handle: "#reorder",
			items: "> li",
			//scroll: false,
			start: (ev, ui) => {
				ev.stopPropagation();
				this.unset_scoll();
			},
			update: (ev, ui) => {
				ev.stopPropagation();
				$("ul#sceneContainer li.active")[0].scrollIntoView({ block: "center" });
				setTimeout(() => { this.set_scoll(); }, 250);

				let order = $("ul#sceneContainer").sortable("toArray");
				this.reorder(order);
			}
			//stop: (ev, ui) => {}
		});
	},

	reset: function() {
		reset_scene();

		$("div#sceneCol button#addScene").click( ev => { this.setup(); } );
	},

	add: function() {
		let id = uuid();

		_SCENES.push({
			id: id,
			center: _MAP.getCenter(),
			zoom: _MAP.getZoom()
		});
		add_scene(id);

		$(`li[data-sceneid="${id}"] span#recapture`).click( ev => { this.recapture(id); } );
		$(`li[data-sceneid="${id}"] span#delete`).click( ev => { this.delete(id); } );

		$(`li[data-sceneid="${id}"] input#titleInput`).change( ev => { this.input(id, "title", ev.target.value); } );
		$(`li[data-sceneid="${id}"] input#timeInput`).change( ev => { this.input(id, "time", ev.target.value); } );
		$(`li[data-sceneid="${id}"] input#mediaInput`).change( ev => { this.input(id, "media", ""); } );

		textareas[id] = this.create_pell(id);

		this.flash_map();
		this.set_scene_style(id);

		let el = document.querySelector("div#sceneCol");
		el.scrollTo(0, el.scrollHeight);
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

		_SCENES.splice(s.index, 1);
		delete textareas[id];

		$(`li[data-sceneid="${id}"]`).remove();

		if(_SCENES.length <= 0) { this.reset(); }
		else { this.set_scene(); }
	},

	reorder: function(order) {
		_SCENES.sort((a,b) => order.indexOf(a.id) - order.indexOf(b.id));
	},



	set_scoll: function() {
		let isScrolling;

		$("div#sceneCol").scroll(ev => {
			window.clearTimeout( isScrolling );
			isScrolling = setTimeout(() => { this.set_scene(); }, 250);
		});
	},
	unset_scoll: function() {
		$("div#sceneCol").off("scroll");
	},

	set_scene: function() {
		let s = getSceneInView();

		this.set_scene_style(s.id);

		_MAP.off("movestart zoomstart", this.unset_scene_style);
		_MAP.flyTo(s.center, s.zoom, { duration: 1 });
		_MAP.on("movestart zoomstart", this.unset_scene_style);
	},

	set_scene_style: function(id) {
		if( $(`li[data-sceneid="${id}"]`).hasClass("active") ) return;

		$("ul#sceneContainer li").removeClass("inactive");
		$("ul#sceneContainer li").removeClass("active");
		$(`li[data-sceneid="${id}"]`).addClass("active");

		_MAP.sceneButton.disable();
	},
	unset_scene_style: function() {
		let id = $("ul#sceneContainer li.active").data("sceneid");

		if(!id) return;
		if( $(`li[data-sceneid="${id}"]`).hasClass("inactive") ) return;

		$("ul#sceneContainer li").removeClass("inactive");
		$("ul#sceneContainer li").removeClass("active");
		$(`li[data-sceneid="${id}"]`).addClass("inactive");

		_MAP.sceneButton.enable();
	},

	flash_map: function() {
		$("div#map").addClass("snapshot");
		setTimeout(function() { $("div#map").removeClass("snapshot"); }, 180);
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

		let o = _MAP.drawingLayer.getLayer(id);

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
				//$(object._icon).attr("data-objectid", object.options.id);
				$(object._icon).css("border", "1px solid black");
			};
			fr.readAsDataURL(file);
		});

		/*** $(`.markerIcon[data-objectid="${object.options.id}"]`); ***/

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
	}

};
