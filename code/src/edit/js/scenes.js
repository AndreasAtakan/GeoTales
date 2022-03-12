/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

"use strict";


function Scenes() {
	this.store = [];
	this.active = "";


	this.setup = function() {
		$("#scenes").sortable({ // https://api.jqueryui.com/sortable/
			cursor: "move", handle: "button#reorder", items: "> li", containment: "parent", tolerance: "pointer", cancel: "", zIndex: 1003, //scroll: false, axis: "x",
			start: (ev, ui) => {
				ev.stopPropagation();
				this.unbind();
			},
			update: (ev, ui) => {
				ev.stopPropagation();
				//let id = $(ui.item[0]).data("id"), order = $("#scenes").sortable("toArray");
				this.reorder( $("#scenes").sortable("toArray") );
			},
			stop: (ev, ui) => {
				ev.stopPropagation();
				this.bind();
			}
		});

		$(`button#recapture`).prop("disabled", true);
	};

	this.get = function(id) {
		for(let i = 0; i < this.store.length; i++) {
			let s = Object.assign({}, this.store[i]);
			if(s.id == id) { s.index = i; return s; }
		}
		return null;
	};

	this.getEl = function(el) {
		for(let i = 0; i < this.store.length; i++) {
			let s = Object.assign({}, this.store[i]);
			if( $(`li[data-id="${s.id}"]`)[0].contains(el) ) { s.index = i; return s; }
		}
		return null;
	};

	this.getPrevScene = function(id) {
		let s = this.get(id);
		if(!s || s.index <= 0) { return; }

		return Object.assign({}, this.store[ s.index - 1 ]);
	};

	this.reorder = function(order) {
		this.store.sort((a,b) => order.indexOf(a.id) - order.indexOf(b.id));
		this.setNumbering();
		this.set(this.active);
	};

	this.add = function() {
		let s = new Scene(this, null, this.active);
		s.capture();

		if(this.active) {
			let p = this.get(this.active);
			s.title = p.title;
			$(`li[data-id="${s.id}"] input#title`).val(s.title);
		}

		if(this.active) { this.store.splice(this.get(this.active).index + 1, 0, s); }
		else{ this.store.push(s); }

		this.setNumbering();

		this.set(s.id);
		this.bind();
	};

	this.delete = function(id) {
		let s = this.get(id);

		if(s.id == this.active) {
			_MAP.deleteScene(id);

			if( !this.prev() ) { this.next(); }
		}

		this.store.splice(s.index, 1);

		$(`li[data-id="${s.id}"]`).remove();

		this.setNumbering();

		if(this.store.length <= 0) {
			this.active = "";
			document.dispatchEvent( new Event("_reset") );
		}
	};

	this.sceneInactive = function() {
		if(this.active) { this.get(this.active).inactive(); }
	};

	this.unbind = function() {
		$("#scenes li button#reorder").prop("disabled", true);
		$("#scenes li").off("click");
	};
	this.bind = function() {
		$("#scenes li button#reorder").prop("disabled", false);
		$("#scenes li").off("click");
		$("#scenes li").click(ev => {
			let s = this.getEl(ev.target);
			if(!s) { return; }

			let el = $(`li[data-id="${s.id}"]`);
			if(el.hasClass("active")) { return; }

			if(el.hasClass("inactive")) {
				if(_IS_MAP_MOVING) { return; }

				_MAP.setFlyTo(s.bounds);
				_IS_MAP_MOVING = true;

				s.active();
			}
			else{ this.set(s.id); }
		});
	};

	this.prev = function() {
		let s = this.get(this.active);
		if(!s || s.index <= 0) { return; }

		s = this.store[ s.index - 1 ];
		this.set(s.id);
		return Object.assign({}, s);
	};

	this.current = function() {
		this.set(this.active);
		this.bind();
	};

	this.next = function() {
		let s = this.get(this.active);
		if(!s || s.index >= this.store.length-1) { return; }

		s = this.store[ s.index + 1 ];
		this.set(s.id);
		return Object.assign({}, s);
	};

	this.set = function(id) {
		if(this.active) { this.get(this.active).disable(); }
		this.active = id;

		let s = this.get(id);
		s.active();

		$(`li[data-id="${s.id}"]`)[0].scrollIntoView({ behavior: "smooth", block: "center" });

		// TODO; Set textbox content

		if(s.basemap.url) {
			let basemap = get_basemap(s.basemap.url);

			if(basemap) { _MAP.setBasemap( basemap.tiles ); }
			else{ _MAP.setBasemap(L.tileLayer(s.basemap.url, { minZoom: 0, maxZoom: 22, attribution: `&copy; <a href="https://${_HOST}" target="_blank">GeoTales</a>` })); }
		}
		else if(s.basemap.img) { _MAP.imgBasemap(s.basemap.img, s.basemap.width, s.basemap.height); }

		_MAP.setObjects(s.id, true);
		_MAP.setFlyTo(s.bounds);
	};

	this.setBasemap = function() {
		this.store[ this.get(this.active).index ].setBasemap();
	};
	this.capture = function() {
		let s = this.store[ this.get(this.active).index ];
		s.capture(); s.active(); flash_map();
	};

	this.setNumbering = function() {
		let i = 1;
		for(let n of $("#scenes li span#num")) {
			$(n).html(i++);
		}
	};

	this.importData = function(data) {
		if(data.length <= 0) { return; }

		if(this.store.length <= 0 || !this.active) {
			this.active = data[0].id;
		}

		for(let o of data) {
			let s = new Scene(this, o.id);
			s.bounds = o.bounds; s.basemap = o.basemap;
			s.chapter = o.chapter; s.title = o.title;

			s.disable();

			this.store.push(s);
		}
	};

	this.exportData = function() {
		let r = [];
		for(let s of this.store) { r.push( s.exportData() ); }
		return r;
	};
}



function Scene(_super, id, prevId) {
	this.id = id || uuid();

	this.bounds = null;
	this.basemap = null;

	this.chapter = false;
	this.title = "";

	new_scene(this.id, prevId);

	$(`li[data-id="${this.id}"]`).on("keydown keyup", ev => { ev.stopPropagation(); });
	$(`li[data-id="${this.id}"] input#chapter`).change(ev => { this.chapter = ev.target.checked; });
	$(`li[data-id="${this.id}"] input#title`).change(ev => { this.title = ev.target.value; });
	$(`li[data-id="${this.id}"] button#delete`).click(ev => { _super.delete(this.id); });
	$(`li[data-id="${this.id}"] button, li[data-id="${this.id}"] input`).click(ev => { ev.stopPropagation(); });


	this.active = function() {
		this.enable();
		$(`li[data-id="${this.id}"]`).removeClass("inactive active");
		$(`li[data-id="${this.id}"]`).addClass("active");
		$(`button#recapture`).prop("disabled", true);
	};

	this.inactive = function() {
		this.enable();
		$(`li[data-id="${this.id}"]`).removeClass("inactive active");
		$(`li[data-id="${this.id}"]`).addClass("inactive");
		$(`li[data-id="${this.id}"] button#delete`).prop("disabled", true);
		$(`button#recapture`).prop("disabled", false);
	};

	this.enable = function() {
		$(`li[data-id="${this.id}"] input,
		   li[data-id="${this.id}"] button`).prop("disabled", false);
	};

	this.disable = function() {
		$(`li[data-id="${this.id}"]`).removeClass("inactive active");
		$(`button#recapture,
		   li[data-id="${this.id}"] input,
		   li[data-id="${this.id}"] button#delete`).prop("disabled", true);
	};

	this.setBasemap = function() {
		this.basemap = _MAP.getBasemap();
	};

	this.capture = function() {
		let nw = _MAP.getBounds().getNorthWest(),
			se = _MAP.getBounds().getSouthEast();
		this.bounds = [[nw.lat, nw.lng], [se.lat, se.lng]];

		this.setBasemap();
	};

	this.exportData = function() {
		return {
			id: this.id,
			bounds: this.bounds,
			basemap: this.basemap,
			chapter: this.chapter,
			title: this.title
		};
	};
}
