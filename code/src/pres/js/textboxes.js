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
		//
	};

	this.get = function(sceneId) {
		for(let i = 0; i < this.store.length; i++) {
			let t = Object.assign({}, this.store[i]);
			if(t.sceneId == sceneId) { t.index = i; return t; }
		}
		return null;
	};

	this.delete = function(sceneId) {
		let t = this.get(sceneId);
		t.disable();
		this.store.splice(t.index, 1);
	};

	this.set = function(sceneId) {
		for(let t of this.store) {
			if(t.sceneId == sceneId) { t.enable(); break; }
			else{ t.disable(); }
		}
	};

	this.importData = function(data) {
		if(data.length <= 0) { return; }

		for(let o of data) {
			let t = new Textbox(o.id);
			t.sceneId = o.sceneId;
			t.locked = o.locked; t.dim = o.dim;
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

	this.dim = [0, 0.25];
	this.content = "";


	this.enable = function() {
		if(this.content == "") { return; }

		$("#textbox").css("display", "block");

		$("#textbox #content").html(this.content);

		if(this.dim) {
			$("#textbox").css({ maxWidth: `${this.dim[1] * 100}%` });
		}
	};

	this.disable = function() {
		$("#textbox").css("display", "none");
	};
}
