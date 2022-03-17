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
		$("input#_img").change(function(ev) {
			let id = $(this).data("id"),
				file = $(this)[0].files[0];
			if(!id || !file) { return; }

			$("#loadingModal").modal("show");
			let data = new FormData(); data.append("image", file);
			$.ajax({
				type: "POST",
				url: "api/img.php",
				data: data,
				contentType: false,
				processData: false,
				success: function(result, status, xhr) {
					$(`div[data-id="${id}"] div#content`).trumbowyg("execCmd", { cmd: "insertImage", param: result, forceCss: false, skipTrumbowyg: true });
					setTimeout(function() { $("#loadingModal").modal("hide"); }, 750);
				},
				error: function(xhr, status, error) {
					console.log(xhr.status);
					console.log(error);

					setTimeout(function() { $("#loadingModal").modal("hide"); $("#errorModal").modal("show"); }, 750);
				}
			});
		});
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

	this.new = function() {
		let s = new Textbox(this, null);
		s.sceneId = _SCENES.active;
		this.store.push(s);
		return this.get(s.id);
	};

	this.add = function() {
		let s =  this.store[ this.new().index ];
		s.enable();
	};

	this.addScene = function(sceneId) {
		let prev = _SCENES.getPrevScene(sceneId), c = 0;
		if(prev) {
			for(let t of this.store) {
				if(t.sceneId == prev.id && t.locked) { c++;
					let s =  this.store[ this.new().index ];
					s.sceneId = sceneId;
					s.pos = t.pos; s.dim = t.dim; s.content = t.content;
					s.locked = true;
					s.enable();
				}
			}
		}

		if(c <= 0) {
			let s =  this.store[ this.new().index ];
			s.sceneId = sceneId;
			s.enable();
		}
	};

	this.delete = function(id) {
		let s = this.get(id);
		s.disable();
		s.destroy();
		this.store.splice(s.index, 1);
	};

	this.deleteScene = function(sceneId) {
		for(let s of this.store) {
			if(s.sceneId == sceneId) { this.delete(s.id); }
		}
	};

	this.set = function(sceneId) {
		for(let s of this.store) {
			if(s.sceneId == sceneId) { s.enable(); }
			else{ s.disable(); }
		}
		//$(":focus").blur();
		//$("#sceneCol").click();
	};

	this.importData = function(data) {
		if(data.length <= 0) { return; }

		for(let o of data) {
			let t = new Textbox(this, o.id);
			t.pos = o.pos; t.dim = o.dim;
			t.content = o.content;

			t.disable();

			this.store.push(t);
		}
	};

	this.exportData = function() {
		let r = [];
		for(let t of this.store) { r.push( t.exportData() ); }
		return r;
	};
}



function Textbox(_super, id) {
	this.id = id || uuid();

	this.locked = false;

	this.pos = null;
	this.dim = null;
	this.content = "";

	new_textbox(this.id);

	var w = window.innerWidth * 0.3 - 30, h = window.innerHeight - 60;
	$(`div[data-id="${this.id}"]`).dialog({
		autoOpen: false, closeOnEscape: false, title: "", appendTo: "#mapCol", position: { my: "left top", at: "left top", of: "#mapCol", collision: "fit", within: "#mapCol" },
		//show: true, hide: true,
		width: w, minWidth: Math.min(250, w), minHeight: Math.min(200, h), maxHeight: h,
		dragStop: (ev, ui) => { this.pos = [ ui.position.left, ui.position.top ]; },
		resizeStop: (ev, ui) => { this.dim = [ ui.size.width, ui.size.height ]; },
		close: (ev, ui) => { if( $(ev.currentTarget).hasClass("ui-dialog-titlebar-close") ) { _super.delete(this.id); } }
	});
	let ui = $(`div[data-id="${this.id}"]`).closest(".ui-dialog"); ui.draggable("option", "containment", "#mapCol"); ui.resizable("option", "containment", "#mapCol");
	//$(ui).off("focusin");
	$(`div[data-id="${this.id}"] div#content`).trumbowyg({
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
				fn: ev => { $("input#_img").data("id", this.id); $("input#_img").click(); },
				title: "Add image", ico: "insertImage"
			},
			makeLink: {
				fn: ev => {
					$(`div[data-id="${this.id}"] div#content`).trumbowyg("saveRange");
					let text = $(`div[data-id="${this.id}"] div#content`).trumbowyg("getRangeText");
					if(text.replace(/\s/g, "") == "") { return; }

					if(["http", "https"].indexOf(text.split("://")[0]) < 0) { text = `https://${text}`; }
					$(`div[data-id="${this.id}"] div#content`).trumbowyg("execCmd", { cmd: "insertHTML", param: `<a href="${text}" target="_blank">${text}</a>`, forceCss: false });
				},
				title: "Create link", ico: "link"
			}
		},
		btns: [
			["formatting"], ["format"], ["align"], ["fontfamily"], ["foreColor", "backColor"], ["makeLink"], ["uploadImg"]
		],
		plugins: {}
	}).on("tbwchange", () => { this.content = $(`div[data-id="${this.id}"] div#content`).trumbowyg("html"); });

	$(`div[data-id="${this.id}"]`).closest(".ui-dialog").find(".ui-dialog-title").append(`
		<input type="checkbox" class="form-check-input" value="" id="lockTextbox" title="Lock textbox" />
	`);
	$(`div[data-id="${this.id}"]`).closest(".ui-dialog").find("input#lockTextbox").change(ev => {
		this.locked = ev.target.checked;
		$(`div[data-id="${this.id}"]`).dialog("option", { draggable: !this.locked, resizable: !this.locked });
	});


	this.enable = function() {
		$(`div[data-id="${this.id}"]`).dialog("open");

		$(`div[data-id="${this.id}"] div#content`).trumbowyg("enable");
		$(`div[data-id="${this.id}"] div#content`).trumbowyg("html", this.content);

		$(`div[data-id="${this.id}"]`).closest(".ui-dialog").find("input#lockTextbox").prop({ disabled: false, checked: this.locked });

		$(`div[data-id="${this.id}"]`).dialog("option", { draggable: !this.locked, resizable: !this.locked });
		if(this.dim) { $(`div[data-id="${this.id}"]`).dialog("option", { width: this.dim[0], height: this.dim[1] }); }
		if(this.pos) { $(`div[data-id="${this.id}"]`).closest(".ui-dialog").css({ left: `${this.pos[0]}px`, top: `${this.pos[1]}px` }); }

		//$(`div[data-id="${this.id}"]`).closest(".ui-dialog").find(".ui-dialog-titlebar-close")[0].blur();
		//$(":focus").blur();
		//$("#scenes")[0].focus();
	};

	this.disable = function() {
		$(`div[data-id="${this.id}"]`).dialog("close");
		$(`div[data-id="${this.id}"] div#content`).trumbowyg("disable");
		$(`div[data-id="${this.id}"]`).closest(".ui-dialog").find("input#lockTextbox").prop("disabled", true);
	};

	this.destroy = function() {
		$(`div[data-id="${this.id}"]`).closest(".ui-dialog").find("input#lockTextbox").off("change");
		$(`div[data-id="${this.id}"] div#content`).trumbowyg("destroy");
		$(`div[data-id="${this.id}"]`).dialog("destroy");
		$(`div[data-id="${this.id}"]`).remove();
	};

	this.exportData = function() {
		return {
			id: this.id,
			pos: this.pos,
			dim: this.dim,
			content: this.content
		};
	};
}


/*
#textbox {
	display: none;
	position: absolute;
	z-index: 1002;
	top: 70px;
	left: 175px;

	width: 30%;
	max-width: 450px;
	min-width: 250px;
	max-height: calc(100% - 130px);
}
#textbox .trumbowyg-box {
	max-height: calc(100vh - 250px);
	min-height: 0px !important;
}
#textbox #content { overflow-y: auto; max-height: 100%; }
*/

/*
$("#textbox div#content").trumbowyg("html", c.content);
*/
