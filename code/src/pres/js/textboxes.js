/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

"use strict";


function Textboxes() {
	this.store = [];


	this.setup = function() {
		//
	};

	this.reset = function() {
		for(let s of this.store) { this.delete(s.id); }
	};

	this.get = function(id) {
		for(let i = 0; i < this.store.length; i++) {
			let s = Object.assign({}, this.store[i]);
			if(s.id == id) { s.index = i; return s; }
		}
		return null;
	};

	this.delete = function(id) {
		let s = this.get(id);
		s.disable();
		s.destroy();
		this.store.splice(s.index, 1);
	};

	this.set = function(sceneId) {
		for(let s of this.store) {
			if(s.sceneId == sceneId) { s.enable(); }
			else{ s.disable(); }
		}
	};

	this.importData = function(data) {
		if(data.length <= 0) { return; }

		for(let o of data) {
			let t = new Textbox(o.id);
			t.sceneId = o.sceneId;
			t.locked = o.locked;
			t.pos = o.pos; t.dim = o.dim;
			t.content = o.content;

			t.disable();

			this.store.push(t);
		}
	};
}



function Textbox(id) {
	this.id = id || uuid();

	this.sceneId = "";
	this.locked = false;

	this.pos = null;
	this.dim = null;
	this.content = "";

	new_textbox(this.id);


	this.enable = function() {
		$(`div[data-id="${this.id}"]`).css("display", "block");

		$(`div[data-id="${this.id}"] #content`).html(this.content);

		if(this.dim) {
			let w = $("#main").width(), h = $("#main").height();
			$(`div[data-id="${this.id}"]`).css({
				maxWidth: `${this.dim[0] * w}px`,
				maxHeight: `${this.dim[1] * h}px`
			});
		}
		if(this.pos) {
			let p = $("#main").position(), w = $("#main").width(), h = $("#main").height();
			$(`div[data-id="${this.id}"]`).css({
				left: `${this.pos[0] * w + p.left}px`,
				top: `${this.pos[1] * h + p.top}px`
			});
		}
	};

	this.disable = function() {
		$(`div[data-id="${this.id}"]`).css("display", "none");
	};

	this.destroy = function() {
		$(`div[data-id="${this.id}"]`).remove();
	};
}
