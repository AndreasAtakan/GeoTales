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

		$("div#sceneCol button#addScene").click( ev => { this.add(); } );
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

		$(`div[data-sceneid="${id}"] span#recapture`).click( ev => { this.recapture(id); } );
		$(`div[data-sceneid="${id}"] span#delete`).click( ev => { this.delete(id); } );

		$(`div[data-sceneid="${id}"] input#titleInput`).change( ev => { this.input(id, "title", ev.target.value); } );
		$(`div[data-sceneid="${id}"] input#timeInput`).change( ev => { this.input(id, "time", ev.target.value); } );
		$(`div[data-sceneid="${id}"] input#mediaInput`).change( ev => { this.input(id, "media", ""); } );

		textareas[id] = pell.init({
			element: document.querySelector(`div[data-sceneid="${id}"] div#textInput`),
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

		this.flash_map();
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
	},

	delete: function(id) {
		let s = get_scene(id);

		_SCENES.splice(s.index, 1);
		delete textareas[id];

		$(`div[data-sceneid="${id}"]`).remove();

		if(_SCENES.length <= 0) { this.reset(); }
	},



	flash_map: function() {
		$("div#map").addClass("snapshot");
		setTimeout(function() { $("div#map").removeClass("snapshot"); }, 180);
	}

};
