/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@geotales.io>, January 2022                  *
*******************************************************************************/

"use strict";


function Scenes() {
	this.store = [];
	this.active = "";


	this.setup = function() {
		$("#sceneNav #prev").click(ev => { _SCENES.prev(); });
		$("#sceneNav #next").click(ev => { _SCENES.next(); });

		this.bind();
	};

	this.reset = function() {
		//
	};

	this.get = function(id) {
		for(let i = 0; i < this.store.length; i++) {
			let s = Object.assign({}, this.store[i]);
			if(s.id == id) { s.index = i; return s; }
		}
		return null;
	};

	this.getPrevScene = function(id) {
		let c = this.get(id);
		if(!c || c.index <= 0) { return; }

		return Object.assign({}, this.store[c.index - 1]);
	};

	this.getNextScene = function(id) {
		let c = this.get(id);
		if(!c || c.index >= this.store.length-1) { return; }

		return Object.assign({}, this.store[c.index + 1]);
	};

	this.bind = function() {
		$("#bookmarks button#bookmark").off("click");
		$("#bookmarks button#bookmark").click(ev => {
			this.set( $(ev.target).data("id") );
		});

		$("#textbox #content img").off("click");
		$("#textbox #content img").click(ev => { ev.stopPropagation();
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

		_TEXTBOXES.set(s.id);
		_MAP.set(s.id);

		setTimeout(() => { this.bind(); }, 151);
	};

	this.importData = function(data) {
		if(data.length <= 0) { return; }

		if(this.store.length <= 0 || !this.active) {
			this.active = data[0].id;
		}

		for(let i = 0; i < data.length; i++) {
			let o = data[i];
			let s = new Scene(o.id);
			s.bounds = o.bounds;
			s.wms = o.wms;
			s.basemap = o.basemap;
			s.bookmark = o.bookmark;
			s.title = o.title;

			if(s.bookmark) {
				$("#bookmarks ul").append(`
					<li><button type="button" class="dropdown-item" id="bookmark" data-id="${s.id}">${s.title || `Scene ${i+1}`}</button></li>
				`);
			}

			this.store.push(s);
		}
	};
}



function Scene(id) {
	this.id = id || uuid();

	this.bounds = null;
	this.wms = null;
	this.basemap = null;

	this.bookmark = false;
	this.title = "";
}
