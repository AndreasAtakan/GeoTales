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
		$("#textbox").resizable({
			containment: "#mapRow", handles: "e", minWidth: 50,
			stop: (ev, ui) => {
				let w = ui.size.width / ($("#mapRow").outerWidth() - 20),
					t = this.get(_SCENES.active);
				if(t) {
					this.store[ t.index ].dim = [0, w];
					$("#textbox").css({ width: `${w * 100}%` });
				}
			}
		});

		$("#textbox #content").trumbowyg({
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
					fn: ev => { $("input#_img").click(); },
					title: "Add image", ico: "insertImage"
				},
				makeLink: {
					fn: ev => {
						$("#textbox #content").trumbowyg("saveRange");
						let text = $("#textbox #content").trumbowyg("getRangeText");
						if(text.replace(/\s/g, "") == "") { return; }

						if(["http", "https"].indexOf(text.split("://")[0]) < 0) { text = `https://${text}`; }
						$("#textbox #content").trumbowyg("execCmd", { cmd: "insertHTML", param: `<a href="${text}" target="_blank">${text}</a>`, forceCss: false });
					},
					title: "Create link", ico: "link"
				}
			},
			btns: [
				["formatting"], ["format"], ["align"], ["fontfamily"], ["foreColor", "backColor"], ["makeLink"], ["uploadImg"]
			],
			plugins: {}
		}).on("tbwchange", () => {
			let t = this.get(_SCENES.active);
			if(t) { this.store[ t.index ].content = $("#textbox #content").trumbowyg("html"); }
		});

		$("input#_img").change(function(ev) {
			let file = $(this)[0].files[0];
			if(!file) { return; }

			$("#loadingModal").modal("show");
			let data = new FormData(); data.append("image", file);
			$.ajax({
				type: "POST",
				url: "api/upload.php",
				data: data,
				contentType: false,
				processData: false,
				success: function(result, status, xhr) {
					$("#textbox #content").trumbowyg("execCmd", { cmd: "insertImage", param: result, forceCss: false, skipTrumbowyg: true });
					setTimeout(function() { $("#loadingModal").modal("hide"); }, 750);
				},
				error: function(xhr, status, error) {
					console.log(xhr.status, error);
					setTimeout(function() { $("#loadingModal").modal("hide"); $("#errorModal").modal("show"); }, 750);
				}
			});
		});

		$("#textbox input#lock").change(ev => {
			let t = this.get(_SCENES.active);
			if(t) { this.store[ t.index ].locked = ev.target.checked; }
		});

		$("#textbox button#close").click(ev => { this.delete(_SCENES.active); });
	};

	this.get = function(sceneId) {
		for(let i = 0; i < this.store.length; i++) {
			let t = Object.assign({}, this.store[i]);
			if(t.sceneId == sceneId) { t.index = i; return t; }
		}
		return null;
	};

	this.add = function() {
		let t = new Textbox(null);
		t.sceneId = _SCENES.active;
		t.enable();
		this.store.push(t);
	};

	this.addScene = function(sceneId) {
		let prev = _SCENES.getPrevScene(sceneId);
		if(prev) {
			for(let t of this.store) {
				if(t.sceneId == prev.id && t.locked) {
					let tt = new Textbox(null);
					tt.sceneId = sceneId;
					tt.dim = t.dim; tt.content = t.content;
					tt.locked = true;
					tt.enable();
					this.store.push(tt);
					break;
				}
			}
		}
	};

	this.delete = function(sceneId) {
		let t = this.get(sceneId);
		t.disable();
		this.store.splice(t.index, 1);
	};

	this.deleteScene = function(sceneId) {
		for(let t of this.store) {
			if(t.sceneId == sceneId) { this.delete(t.id); }
		}
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

	this.exportData = function() {
		let r = [];
		for(let t of this.store) { r.push( t.exportData() ); }
		return r;
	};
}



function Textbox(id) {
	this.id = id || uuid();

	this.sceneId = "";
	this.locked = false;

	this.dim = [0, 0.25];
	this.content = "";


	this.enable = function() {
		$("#textbox").css("display", "block");
		$("#textbox").css({ width: `${this.dim[1] * 100}%` });

		$("#textbox #content").trumbowyg("enable");
		$("#textbox #content").trumbowyg("html", this.content);

		$("#textbox #lock").prop({ disabled: false, checked: this.locked });

		_MAP.textboxButton.disable();
	};

	this.disable = function() {
		$("#textbox").css("display", "none");
		$("#textbox #content").trumbowyg("disable");
		$("#textbox #lock").prop("disabled", true);
		_MAP.textboxButton.enable();
	};

	this.exportData = function() {
		return {
			id: this.id,
			sceneId: this.sceneId,
			locked: this.locked,
			dim: this.dim,
			content: this.content
		};
	};
}
