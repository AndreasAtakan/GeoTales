/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

"use strict";


function Content() {
	this.store = []; // Store of all scenes
	this.active = ""; // The scene that is currently active
	this.prep = false; // If Content is in "prepare" mode


	this.setup = function() {
		$("#section").sortable({ // https://api.jqueryui.com/sortable/
			cursor: "move", handle: "button#reorder", items: "> li", axis: "y", containment: "parent", tolerance: "pointer", cancel: "", /*scroll: false,*/
			start: (ev, ui) => {
				ev.stopPropagation();
				this.unbind();
			},
			update: (ev, ui) => {
				ev.stopPropagation();
				let order = $("#section").sortable("toArray"); //id = $(ui.item[0]).data("id");
				this.reorder(order);
			},
			stop: (ev, ui) => {
				ev.stopPropagation();
				this.bind();
			}
		});
	};

	this.reset = function() {
		$("#section").sortable("destroy");
	};

	this.get = function(id) {
		for(let i = 0; i < this.store.length; i++) {
			let c = Object.assign({}, this.store[i]);
			if(c.id == id) { c.index = i; return c; }
		}
		return null;
	};

	this.getEl = function(el) {
		for(let i = 0; i < this.store.length; i++) {
			let c = Object.assign({}, this.store[i]);
			if( $(`li[data-id="${c.id}"]`)[0].contains(el) ) { c.index = i; return c; }
		}
		return null;
	};

	this.getPrevScene = function(id) {
		let c = this.get(id);
		if(!c || c.index <= 0) { return; }

		for(let i = c.index - 1; i >= 0; i--) {
			let s = Object.assign({}, this.store[i]);
			if(s.type == "scene") { return s; }
		}
		return null;
	};

	this.getNextScene = function(id) {
		let c = this.get(id);
		if(!c || c.index >= this.store.length-1) { return; }

		for(let i = c.index + 1; i < this.store.length; i++) {
			let s = Object.assign({}, this.store[i]);
			if(s.type == "scene") { return s; }
		}
		return null;
	};

	this.reorder = function(order) {
		this.store.sort((a,b) => order.indexOf(a.id) - order.indexOf(b.id));
		this.set(this.active);
	};

	this.prepare = function() {
		new Prepare(this, this.active);

		this.get(this.active).disable();
		this.unbind();
		this.prep = true;

		_MAP.setObjectsPrepare(this.active);
	};

	this.add = function(type) {
		let c;
		switch(type) {
			case "chapter": c = new Chapter(this, null, this.active); break;
			case "scene":
				c = new Scene(this, null, this.active);
				c.capture();

				if(this.active) {
					let p = this.get(this.active);
					c.period = p.period; c.date = p.date; c.time = p.time; c.content = p.content;
					$(`li[data-id="${c.id}"] select#period`).val( c.period );
					$(`li[data-id="${c.id}"] input#date`).val( c.date );
					$(`li[data-id="${c.id}"] input#time`).val( c.time );
					$(`li[data-id="${c.id}"] div#content`).trumbowyg("html", c.content);
				}
				break;
			default: console.error("Content type invalid"); break;
		}

		if(this.active) { this.store.splice(this.get(this.active).index + 1, 0, c); }
		else{ this.store.push(c); }

		if(type == "scene") { this.set(c.id); }
		else{ this.set(this.active); }

		this.bind();
		this.prep = false;
	};

	this.delete = function(id) {
		let s = this.get(id);

		if(s.type == "scene"
		&& s.id == this.active) {
			_MAP.deleteScene(id);

			let r = this.prev();
			if(!r) {
				r = this.next();
				if(!r) { _MAP.clear(); }
			}
		}

		this.store.splice(s.index, 1);

		$(`li[data-id="${s.id}"] div#content`).trumbowyg("destroy");
		$(`li[data-id="${s.id}"]`).remove();

		if(this.store.length <= 0) {
			this.active = "";
			document.dispatchEvent( new Event("section_reset") );
		}
	};

	this.sceneInactive = function() {
		if(!this.prep && this.active) { this.get(this.active).inactive(); }
	};

	this.unbind = function() {
		$("#section li button#reorder, #section li button#remove").prop("disabled", true);
		$("#section li").off("click");
	};
	this.bind = function() {
		$("#section li button#reorder, #section li button#remove").prop("disabled", false);
		$("#section li").click(ev => {
			let c = this.getEl(ev.target);
			if(!c || c.type != "scene") { return; }

			let el = $(`li[data-id="${c.id}"]`);
			if(el.hasClass("active")) { return; }

			if(el.hasClass("inactive")) {
				if(_IS_MAP_MOVING) { return; }

				_MAP.setFlyTo(c.bounds);
				_IS_MAP_MOVING = true;

				c.active();
			}
			else{ this.set(c.id); }
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
		this.bind();
		this.prep = false;
	};

	this.next = function() {
		let s = this.getNextScene(this.active);
		if(!s) { return; }
		this.set(s.id);
		return s;
	};

	this.set = function(id) {
		if(this.active) { this.get(this.active).disable(); }

		let s = this.get(id);

		this.active = id;
		s.active();

		$(`li[data-id="${s.id}"]`)[0].scrollIntoView({ behavior: "smooth", block: "center" });

		if(s.basemap.url) {
			let basemap = get_basemap(s.basemap.url);

			if(basemap) { _MAP.setBasemap( basemap.tiles ); }
			else{ _MAP.setBasemap(L.tileLayer(s.basemap.url, { minZoom: 0, maxZoom: 22, attribution: `&copy; <a href="https://${_HOST}" target="_blank">TellUs</a>` }), is_internal_basemap(s.basemap.url)); }
		}
		else if(s.basemap.img) { _MAP.imgBasemap(s.basemap.img, s.basemap.width, s.basemap.height); }

		_MAP.setObjects(s.id, true);
		_MAP.setFlyTo(s.bounds);
	};

	this.setBasemap = function() {
		this.store[ this.get(this.active).index ].setBasemap();
	};

	this.importData = function(data) {
		if(this.store.length <= 0 || !this.active) {
			for(let o of data) { if(o.type == "scene") { this.active = o.id; break; } }
		}

		for(let o of data) {
			let c;
			switch(o.type) {
				case "chapter":
					c = new Chapter(this, o.id);
					c.title = o.title;
					$(`li[data-id="${c.id}"] input#title`).val( c.title );
					break;

				case "scene":
					c = new Scene(this, o.id);
					c.bounds = o.bounds; c.basemap = o.basemap;
					c.period = o.period; c.date = o.date; c.time = o.time; c.content = o.content;

					$(`li[data-id="${c.id}"] select#period`).val( c.period );
					$(`li[data-id="${c.id}"] input#date`).val( c.date );
					$(`li[data-id="${c.id}"] input#time`).val( c.time );
					$(`li[data-id="${c.id}"] div#content`).trumbowyg("html", c.content);

					c.disable();
					break;

				default: console.error("Content type invalid"); break;
			}

			this.store.push(c);
		}
	};

	this.exportData = function() {
		let r = [];
		for(let c of this.store) { r.push( c.exportData() ); }
		return r;
	};
}



function Prepare(_super, prevId) {
	this.id = uuid();
	this.type = "prepare";

	prepare_section(prevId);

	$("li#prepare").addClass("active");
	$("li#prepare")[0].scrollIntoView({ behavior: "smooth", block: "center" });

	$("li#prepare button#cancel").click(ev => {
		$("li#prepare").remove(); _super.current();
	});
	$("li#prepare button#chapter").click(ev => {
		$("li#prepare").remove(); _super.add("chapter");
	});
	$("li#prepare button#scene").click(ev => {
		$("li#prepare").remove(); _super.add("scene");
	});
}



function Chapter(_super, id, prevId) {
	this.id = id || uuid();
	this.type = "chapter";

	this.title = "";

	chapter_section(this.id, prevId);

	$(`li[data-id="${this.id}"]`).on("keydown keyup", ev => { ev.stopPropagation(); });
	$(`li[data-id="${this.id}"] input#title`).change(ev => { this.title = ev.target.value; });
	$(`li[data-id="${this.id}"] button#remove`).click(ev => { _super.delete(this.id); });
	$(`li[data-id="${this.id}"] input`).click(ev => { ev.stopPropagation(); });

	this.exportData = function() {
		return {
			id: this.id,
			type: "chapter",
			title: this.title
		};
	};
}



function Scene(_super, id, prevId) {
	this.id = id || uuid();
	this.type = "scene";

	this.bounds = null;
	this.basemap = null;

	this.period = "ad";
	this.date = "";
	this.time = "";
	this.content = "";

	scene_section(this.id, prevId);

	var id = this.id;
	$(`li[data-id="${this.id}"]`).on("keydown keyup", ev => { ev.stopPropagation(); });
	$(`li[data-id="${this.id}"] select#period`).change(ev => { this.period = ev.target.value; });
	$(`li[data-id="${this.id}"] input#date`).change(ev => { this.date = ev.target.value; });
	$(`li[data-id="${this.id}"] input#time`).change(ev => { this.time = ev.target.value; });
	$(`li[data-id="${this.id}"] button#capture`).click(ev => { this.capture(); this.active(); });
	$(`li[data-id="${this.id}"] button#add`).click(ev => { _super.prepare(); });
	$(`li[data-id="${this.id}"] button#delete`).click(ev => { _super.delete(this.id); });
	$(`li[data-id="${this.id}"] div#content`).trumbowyg({
		autogrow: true, semantic: false, resetCss: true, removeformatPasted: true, urlProtocol: true,
		defaultLinkTarget: "_blank",
		tagsToRemove: ["script", "link"],
		btnsDef: {
			format: { dropdown: ["bold", "italic", "underline", "del"], title: "Format", ico: "bold" },
			align: {
				dropdown: ["justifyLeft", "justifyCenter", "justifyRight", "justifyFull", "unorderedList", "orderedList"],
				title: "List/Align",
				ico: "justifyLeft"
			},
			uploadImg: {
				fn: function(e) {
					$("input#_img").off("change");
					$("input#_img").change(function(ev) {
						let file = $(this)[0].files[0];
						if(!file) { return; }

						$("#loadingModal").modal("show");
						let data = new FormData(); data.append("image", file);
						$.ajax({
							type: "POST",
							url: "api/img.php",
							data: data,
							contentType: false,
							processData: false,
							success: function(result, status, xhr) {
								$(`li[data-id="${id}"] div#content`).trumbowyg("execCmd", {
									cmd: "insertImage", param: result, forceCss: false, skipTrumbowyg: true
								});

								setTimeout(function() { $("#loadingModal").modal("hide"); }, 750);
							},
							error: function(xhr, status, error) {
								console.log(xhr.status);
								console.log(error);

								setTimeout(function() { $("#loadingModal").modal("hide"); $("#errorModal").modal("show"); }, 750);
							}
						});
					});
					$("input#_img").click();
				},
				title: "Add image",
				ico: "insertImage"
			}
		},
		btns: [
			["formatting"], ["format"], ["align"], ["fontfamily"], ["foreColor", "backColor"], /*["link"],*/ ["uploadImg"]
		],
		plugins: {}
	}).on("tbwchange", () => { this.content = $(`li[data-id="${this.id}"] div#content`).trumbowyg("html"); });
	$(`li[data-id="${this.id}"] select, li[data-id="${this.id}"] input, li[data-id="${this.id}"] .trumbowyg-box *`).click(ev => { ev.stopPropagation(); });


	this.active = function() {
		this.enable();
		$(`li[data-id="${this.id}"]`).removeClass("inactive active");
		$(`li[data-id="${this.id}"]`).addClass("active");
		$(`li[data-id="${this.id}"] button#capture`).prop("disabled", true);
	};

	this.inactive = function() {
		this.enable();
		$(`li[data-id="${this.id}"]`).removeClass("inactive active");
		$(`li[data-id="${this.id}"]`).addClass("inactive");
		$(`li[data-id="${this.id}"] button#add,
		   li[data-id="${this.id}"] button#delete`).prop("disabled", true);
	};

	this.enable = function() {
		$(`li[data-id="${this.id}"] select, li[data-id="${this.id}"] input, li[data-id="${this.id}"] button`).prop("disabled", false);
		$(`li[data-id="${this.id}"] div#content`).trumbowyg("enable");
	};

	this.disable = function() {
		$(`li[data-id="${this.id}"]`).removeClass("inactive active");
		$(`li[data-id="${this.id}"] select,
		   li[data-id="${this.id}"] input,
		   li[data-id="${this.id}"] button#capture,
		   li[data-id="${this.id}"] button#add,
		   li[data-id="${this.id}"] button#delete`).prop("disabled", true);
		$(`li[data-id="${this.id}"] div#content`).trumbowyg("disable");
		let h = (ev) => { $(`li[data-id="${this.id}"] div#content`).unbind("click", h); _super.set(this.id); };
		$(`li[data-id="${this.id}"] div#content`).click(h);
	};

	this.setBasemap = function() {
		this.basemap = _MAP.getBasemap();
	};

	this.capture = function() {
		let nw = _MAP.getBounds().getNorthWest(),
			se = _MAP.getBounds().getSouthEast();
		this.bounds = [[nw.lat, nw.lng], [se.lat, se.lng]];

		this.setBasemap();

		flash_map();
	};

	this.exportData = function() {
		return {
			id: this.id,
			type: "scene",
			bounds: this.bounds,
			basemap: this.basemap,
			period: this.period,
			date: this.date,
			time: this.time,
			content: this.content
		};
	};
}
