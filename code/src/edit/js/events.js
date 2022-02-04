/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

"use strict";


/*_EVENTS.section = {

	setup: function() {
		init_section();

		_CONTENT = new Content();

		$("#sectionCol").keydown(ev => { if(["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft", "Space"].indexOf(ev.code) > -1) { ev.preventDefault(); } });
		$("#sectionCol").keyup(ev => {
			let keycode = ev.code;

			if(keycode == "ArrowUp") {
				ev.preventDefault();
				_CONTENT.prev();
			}

			if(keycode == "ArrowDown") {
				ev.preventDefault();
				_CONTENT.next();
			}

			if(["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft", "Space"].indexOf(keycode) > -1) { ev.preventDefault(); }
		});

		_MAP.setup();

		_CONTENT.add("scene");
	},

	reset: function() {
		reset_section();

		_CONTENT = null;
		_MAP.reset();

		$("#sectionCol button#add").click(ev => { this.setup(); });
	},

	set_add: function(id, prevId) {
		let self = this;
		add_section(id, prevId);

		$(`li[data-id="${id}"]`).on("keydown keyup", ev => { ev.stopPropagation(); });

		$(`li[data-id="${id}"] select#periodInput`).change( ev => { this.input(id, "period", ev.target.value); } );
		$(`li[data-id="${id}"] input#dateInput`).change( ev => { this.input(id, "date", ev.target.value); } );
		$(`li[data-id="${id}"] input#timeInput`).change( ev => { this.input(id, "time", ev.target.value); } );
		$(`li[data-id="${id}"] #textInput`).trumbowyg({
			autogrow: true,
			semantic: false,
			resetCss: true,
			removeformatPasted: true,
			urlProtocol: true,
			defaultLinkTarget: "_blank",
			tagsToRemove: ["script", "link"],
			btnsDef: {
				format: {
					dropdown: ["bold", "italic", "underline", "del"],
					title: "Format",
					ico: "bold"
				},
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

							let data = new FormData();
							data.append("image", file);

							$.ajax({
								type: "POST",
								url: "api/img.php",
								data: data,
								contentType: false,
								processData: false,
								success: function(result, status, xhr) {
									$(`li[data-id="${id}"] #textInput`).trumbowyg("execCmd", {
										cmd: "insertImage",
										param: result,
										forceCss: false,
										skipTrumbowyg: true
									});

									$("#loadingModal").modal("hide");
								},
								error: function(xhr, status, error) {
									console.log(xhr.status);
									console.log(error);

									$("#loadingModal").modal("hide");
									$("#errorModal").modal("show");
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
				//["undo", "redo"], // NOTE: Only supported in Blink browsers
				["formatting"],
				["format"],
				["align"],
				["fontfamily"],
				["foreColor", "backColor"],
				//["link"],
				["uploadImg"]
				//["removeformat"]
			],
			plugins: {}
		}).on("tbwchange", function() {
			let cont = $(this).trumbowyg("html");
			self.input(id, "content", cont);
		});
	}

};*/



_EVENTS.object = {

	setup: function(object) {
		switch(object.options.type) {
			case "marker":
				this.setup_marker(object);
				break;

			case "polyline":
				this.setup_polyline(object);
				break;

			case "polygon":
			case "rectangle":
				this.setup_polygon(object);
				break;

			default:
				console.error("object type invalid");
				break;
		}
	},

	setup_marker: function(object) {
		$("#markerPopup input#label").change(function(ev) {
			let val = $(this).val();

			if(val) {
				let tooltip = object.getTooltip();

				if(!tooltip) { object.bindTooltip(val, { direction: "bottom", permanent: true }); }
				else{ object.setTooltipContent(val); }
			}
			else{ object.unbindTooltip(); }

			object.options.label = val;
			_MAP.updateObject(object.options.id);
		});
		$("#markerPopup input#label").val(object.options.label || "");

		$("#markerPopup input#icon").change(function(ev) {
			let file = $(this)[0].files[0];
			if(!file) { return; }

			$("#loadingModal").modal("show");

			let fr = new FileReader();
			fr.onload = function() {
				let res = fr.result;

				let img = new Image();
				img.onload = function() {
					let ratio = this.width / this.height,
						width, height;

					for(let w = 50; w > 0; w--) {
						let h = w / ratio;
						if(h < 180) {
							width = w;
							height = h;
							break;
						}
					}
					if(!width || !height) { return; }

					$("#markerPopup select#size").val("medium");
					$("#markerPopup input#rounded").prop("checked", false);
					// TODO: Also set rotation-angle input to 0

					object.options.ratio = ratio;
					object.options.rounded = false;
					object.options.angle = 0;

					let data = new FormData();
					data.append("image", file);

					$.ajax({
						type: "POST",
						url: "api/img.php",
						data: data,
						contentType: false,
						processData: false,
						success: function(result, status, xhr) {
							object.setIcon(
								L.icon({
									iconUrl: result,
									iconSize: [ width, height ],
									popupAnchor: [ 0, (-1) * (height / 2) ],
									tooltipAnchor: [ 0, height / 2 ]
								})
							);

							_MAP.updateObject(object.options.id);
							_MAP.setIcon(object.options.id, [width, height]);

							$("#loadingModal").modal("hide");
						},
						error: function(xhr, status, error) {
							console.log(xhr.status);
							console.log(error);

							$("#loadingModal").modal("hide");
							$("#errorModal").modal("show");
						}
					});

					return true;
				};
				img.src = res;
			};
			fr.readAsDataURL(file);
		});

		$("#markerPopup input#size").change(function(ev) {
			let val = $(this).val();

			_MAP.setIcon(object.options.id, [ val, val / object.options.ratio ]);
			_MAP.updateObject(object.options.id);
		});

		$("#markerPopup input#rounded").change(function(ev) {
			object.options.rounded = this.checked;

			_MAP.updateObject(object.options.id);
			_MAP.setIcon(object.options.id);
		});
		$("#markerPopup input#rounded").prop("checked", object.options.rounded);

		$("#markerPopup input#color").change(function(ev) {
			let val = $(this).val();

			object.options.borderColor = val;
			_MAP.updateObject(object.options.id);
			_MAP.setIcon(object.options.id);
		});
		$("#markerPopup input#color").val(object.options.borderColor || "#563d7c");

		$("#markerPopup input#thickness").change(function(ev) {
			let val = Math.min( Math.max( 0, $(this).val() ), 10 );

			object.options.borderThickness = val;
			_MAP.updateObject(object.options.id);
			_MAP.setIcon(object.options.id);
		});

		$("#markerPopup input#blur").change(function(ev) {
			let val = Math.min( Math.max( 0, $(this).val() ), 3 );

			object.options.overlayBlur = val;
			_MAP.updateObject(object.options.id);
			_MAP.setIcon(object.options.id);
		});

		$("#markerPopup input#grayscale").change(function(ev) {
			let val = Math.min( Math.max( 0, $(this).val() ), 1 );

			object.options.overlayGrayscale = val;
			_MAP.updateObject(object.options.id);
			_MAP.setIcon(object.options.id);
		});

		$("#markerPopup input#brightness").change(function(ev) {
			let val = Math.min( Math.max( 0, $(this).val() ), 6 );

			object.options.overlayBrightness = val;
			_MAP.updateObject(object.options.id);
			_MAP.setIcon(object.options.id);
		});

		$("#markerPopup input#transparency").change(function(ev) {
			let val = Math.min( Math.max( 0, $(this).val() ), 0.9 );

			object.options.overlayTransparency = val;
			_MAP.updateObject(object.options.id);
			_MAP.setIcon(object.options.id);
		});

		//$("#markerPopup #bringToFront").click(function(ev) { /**/ });

		$("#markerPopup #makeGlobal").click(function(ev) {
			_MAP.globalObjectOptions(object.options.id);
		});

		$("#markerPopup #delete").click(function(ev) {
			_MAP.deleteObject(object.options.id, object.options.type);
		});
	},

	setup_polyline: function(object) {
		$("#polylinePopup input#color").change(function(ev) {
			object.setStyle({ color: $(this).val() });
			_MAP.updateObject(object.options.id);
		});
		$("#polylinePopup input#color").val(object.options.color || "#563d7c");

		$("#polylinePopup input#thickness").change(function(ev) {
			object.setStyle({ weight: Math.min( Math.max( 2, $(this).val() ), 10 ) });
			_MAP.updateObject(object.options.id);
		});

		$("#polylinePopup input#transparency").change(function(ev) {
			object.setStyle({ opacity: 1 - Math.min( Math.max( 0, $(this).val() ), 0.9 ) });
			_MAP.updateObject(object.options.id);
		});

		$("#polylinePopup #delete").click(function(ev) {
			_MAP.deleteObject(object.options.id, object.options.type);
		});
	},

	setup_polygon: function(object) {
		$("#polygonPopup input#lineColor").change(function(ev) {
			object.setStyle({ color: $(this).val() });
			_MAP.updateObject(object.options.id);
		});
		$("#polygonPopup input#lineColor").val(object.options.color || "#563d7c");

		$("#polygonPopup input#lineThickness").change(function(ev) {
			object.setStyle({ weight: Math.min( Math.max( 2, $(this).val() ), 10 ) });
			_MAP.updateObject(object.options.id);
		});

		$("#polygonPopup input#lineTransparency").change(function(ev) {
			object.setStyle({ opacity: 1 - Math.min( Math.max( 0, $(this).val() ), 0.9 ) });
			_MAP.updateObject(object.options.id);
		});

		$("#polygonPopup input#fillColor").change(function(ev) {
			object.setStyle({ fillColor: $(this).val() });
			_MAP.updateObject(object.options.id);
		});
		$("#polygonPopup input#fillColor").val(object.options.fillColor || "#563d7c");

		$("#polygonPopup input#fillTransparency").change(function(ev) {
			object.setStyle({ fillOpacity: 1 - Math.min( Math.max( 0, $(this).val() ), 1 ) });
			_MAP.updateObject(object.options.id);
		});

		$("#polygonPopup #delete").click(function(ev) {
			_MAP.deleteObject(object.options.id, object.options.type);
		});
	}

};



/*_EVENTS.options = {

	setup: function() {

		$("#optionsModal input#avatarSpeedInput").change(function(ev) {
			let val = $(this).val();
			_AVATARSPEED = parseInt(val);

			$("#optionsModal span#avatarSpeedInputValue").html(`${val} milliseconds`);
		});

		$("#optionsModal input#panningSpeedInput").change(function(ev) {
			let val = $(this).val();
			_PANNINGSPEED = (val / 1000) || null;

			$("#optionsModal span#panningSpeedInputValue").html(val <= 0 ? `auto` : `${val} milliseconds`);
		});

		//init_themes();
		$("#optionsModal input[name=\"themeRadio\"]").click(ev => {
			let theme = $(ev.target).prop("id");
			if(!theme) { return; }
			_THEME = theme;
		});

	}

};*/



/*_EVENTS.basemap = {

	setup: function() {

		init_basemaps();

		$("#basemapModal #basemaps").click(ev => {
			let index = $(ev.target).data("basemap");
			if(!index && index != 0) { return; }
			let basemap = _BASEMAPS[index];

			_MAP.setBasemap( basemap.tiles );
			_CONTENT.setBasemap();
		});

		$("#basemapModal input#basemapFile").change(ev => {
			let file = $(ev.target)[0].files[0];
			if(!file) { return; }
			var self = this;

			$("#loadingModal").modal("show");

			let fr = new FileReader();
			fr.onload = function() {
				let res = fr.result;

				let img = new Image();
				img.onload = function() {
					let width = this.width,
						height = this.height;

					let data = new FormData();
					data.append("image", file);

					$.ajax({
						type: "POST",
						url: "api/img.php",
						data: data,
						contentType: false,
						processData: false,
						success: function(result, status, xhr) {
							_MAP.imgBasemap(result, width, height);
							_CONTENT.setBasemap();
							$("#loadingModal").modal("hide");
						},
						error: function(xhr, status, error) {
							console.log(xhr.status);
							console.log(error);

							$("#loadingModal").modal("hide");
							$("#errorModal").modal("show");
						}
					});

					return true;
				};
				img.src = res;
			};
			fr.readAsDataURL(file);
		});

		$("#basemapModal button#basemapFetch").click(ev => {
			let url = $("#basemapModal input#basemapLink").val();
			if(!url) { return; }

			let tiles = L.tileLayer(url, { minZoom: 0, maxZoom: 22, attribution: `&copy; <a href="https://${_HOST}" target="_blank">TellUs</a>` });

			let protocol = url.split(/\:/ig)[0];
			if(protocol == "mapbox") {
				let username = url.split(/mapbox\:\/\/styles\//ig)[1].split(/\//ig)[0],
					styleID = url.split(/mapbox\:\/\/styles\//ig)[1].split(/\//ig)[1],
					key = $("#basemapModal input#basemapKey").val();
				if(!key) { return; }

				url = `https://api.mapbox.com/styles/v1/${username}/${styleID}/tiles/256/{z}/{x}/{y}?access_token=${key}`;
				tiles.setUrl(url, true);
			}

			_MAP.setBasemap(tiles, is_internal_basemap(url));
			_CONTENT.setBasemap();
		});

	}

};*/



/*_EVENTS.file = {

	setup: function() {
		let self = this;

		$("#importModal button#import").click(ev => {
			$("#importModal").modal("hide");

			let file = $("#importModal input#fileInput")[0].files[0];
			if(!file) { return; }

			let fr = new FileReader();
			fr.onload = function() {
				let res = fr.result;
				res = JSON.parse(res);

				self.import(res);
			};
			fr.readAsText(file);
		});

		let exportEv = ev => {
			$("#export").off("click");

			let el = document.createElement("a");

			let f = v => v < 10 && v >= 0 ? `0${v}` : `${v}`;
			let date = new Date();
			let y = date.getFullYear(),
				m = f(date.getMonth() + 1),
				d = f(date.getDate()),
				H = f(date.getHours()),
				M = f(date.getMinutes()),
				S = f(date.getSeconds());
			let filename = `${_TITLE} ${y}.${m}.${d} ${H}.${M}.${S}.tellus`;

			let data = this.export();

			el.setAttribute("href", "data:application/json;charset=utf-8," + encodeURIComponent(data));
			el.setAttribute("download", filename);
			el.style.display = "none";

			document.body.appendChild(el);
			$(el).ready(() => {
				el.click();
				document.body.removeChild(el);

				$("#export").click(exportEv);
			});
		};
		$("#export").click(exportEv);

		$("#save").click(ev => {
			let data = this.export();

			$("#loadingModal").modal("show");

			$.ajax({
				type: "POST",
				url: "api/map.php",
				data: {
					"op": "write",
					"id": _ID,
					"data": data
				},
				dataType: "json",
				success: function(result, status, xhr) {
					saved_changes();
					$("#loadingModal").modal("hide");
				},
				error: function(xhr, status, error) {
					console.log(xhr.status);
					console.log(error);

					$("#loadingModal").modal("hide");
					$("#errorModal").modal("show");
				}
			});
		});

		$("#loadingModal").modal("show");
		$.ajax({
			type: "GET",
			url: "api/map.php",
			data: {
				"op": "read",
				"id": _ID
			},
			dataType: "json",
			success: function(result, status, xhr) {
				if(result.data) {
					self.import( JSON.parse(result.data) );
				}
				$(document).click(ev => { unsaved_changes(); });

				$("#loadingModal").modal("hide");
			},
			error: function(xhr, status, error) {
				console.log(xhr.status);
				console.log(error);

				$("#loadingModal").modal("hide");
				$("#errorModal").modal("show");
			}
		});

	},

	import: function(data) { // !!!!!!!! TODO
		_AVATARSPEED = data.options.avatarspeed;
		_PANNINGSPEED = data.options.panningspeed;

		_THEME = data.options.theme;

		if(data.content.length <= 0) { return; }

		let index = _CONTENT.length;
		if(index <= 0) _EVENTS.section.setup();

		for(let i = 0; i < data.content.length; i++) {
			let c = data.content[i];

			_EVENTS.section.set_add(c.id);

			_CONTENT.push(c);

			$(`li[data-id="${c.id}"] select#periodInput`).val( s.period || "ad" );
			$(`li[data-id="${c.id}"] input#dateInput`).val( s.date || "" );
			$(`li[data-id="${c.id}"] input#timeInput`).val( s.time || "" );
			//$(`li[data-id="${c.id}"] #textInput`).trumbowyg("html", s.content || "");
		}

		_MAP.importData(data.objects);

		_EVENTS.section.set_scene( _CONTENT[index].id );
	},

	export: function() {
		return JSON.stringify({
			options: {
				avatarspeed: _AVATARSPEED,
				panningspeed: _PANNINGSPEED,
				theme: _THEME
			},
			content: _CONTENT.export(),
			objects: _MAP.exportData()
		});
	}

};*/
