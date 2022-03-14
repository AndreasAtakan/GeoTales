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

	this.get = function(id) {
		for(let i = 0; i < this.store.length; i++) {
			let s = Object.assign({}, this.store[i]);
			if(s.id == id) { s.index = i; return s; }
		}
		return null;
	};

	this.add = function() {
		let s = new Textbox(null);
		s.sceneId = _SCENES.active;
		s.enable();
		this.store.push(s);
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



function Textbox(id) {
	this.id = id || uuid();

	this.pos = null;
	this.dim = null;
	this.content = "";

	new_textbox(this.id);

	var id = this.id, w = window.innerWidth * 0.3 - 30, h = window.innerHeight - 60;
	$(`div[data-id="${this.id}"]`).dialog({
		autoOpen: false, closeOnEscape: false, title: "", appendTo: "#mapCol", position: { my: "left top", at: "left top", of: "#mapCol", collision: "fit", within: "#mapCol" },
		//show: true, hide: true,
		width: w, minWidth: Math.min(250, w), minHeight: Math.min(200, h), maxHeight: h,
		dragStop: function(ev, ui) { this.pos = [ ui.position.top, ui.position.left ]; },
		resizeStop: function(ev, ui) { this.dim = [ ui.size.width, ui.size.height ]; }
	});
	let ui = $(`div[data-id="${this.id}"]`).closest(".ui-dialog"); ui.draggable("option", "containment", "#mapCol"); ui.resizable("option", "containment", "#mapCol");
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
				fn: function(e) { $("input#_img").data("id", id); $("input#_img").click(); },
				title: "Add image", ico: "insertImage"
			},
			makeLink: {
				fn: function(e) {
					$(`div[data-id="${id}"] div#content`).trumbowyg("saveRange");
					let text = $(`div[data-id="${id}"] div#content`).trumbowyg("getRangeText");
					if(text.replace(/\s/g, "") == "") { return; }

					if(["http", "https"].indexOf(text.split("://")[0]) < 0) { text = `https://${text}`; }
					$(`div[data-id="${id}"] div#content`).trumbowyg("execCmd", { cmd: "insertHTML", param: `<a href="${text}" target="_blank">${text}</a>`, forceCss: false });
				},
				title: "Create link", ico: "link"
			}
		},
		btns: [
			["formatting"], ["format"], ["align"], ["fontfamily"], ["foreColor", "backColor"], ["makeLink"], ["uploadImg"]
		],
		plugins: {}
	}).on("tbwchange", () => { this.content = $(`div[data-id="${this.id}"] div#content`).trumbowyg("html"); });


	this.enable = function() {
		$(`div[data-id="${this.id}"]`).dialog("open");
		$(`div[data-id="${this.id}"] div#content`).trumbowyg("enable");
	};

	this.disable = function() {
		$(`div[data-id="${this.id}"]`).dialog("close");
		$(`div[data-id="${this.id}"] div#content`).trumbowyg("disable");
	};

	this.destroy = function() {
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
