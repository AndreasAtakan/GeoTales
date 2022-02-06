/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

"use strict";


L.AvatarLayer = L.FeatureGroup.extend({
	addLayer: function(object) {
		L.FeatureGroup.prototype.addLayer.call(this, object);

		this.setIcon(object.options.id);
		this.bind(object);
	},

	bind: function(object) {
		object.bindPopup(avatar_popup(), { keepInView: true, closeOnEscapeKey: false, maxWidth: 350, maxHeight: 450, autoPanPadding: L.point(60,60) });

		if(object.options.label) { object.bindTooltip(object.options.label, { direction: "bottom", permanent: true }); }

		let drag = new L.Draggable( object.getElement() ), isDragEv = false;
		drag.enable();
		drag.on("dragstart", ev => { isDragEv = true; });
		drag.on("dragend", ev => {
			let zoom = _MAP.getZoom(), p = ev.target._newPos;
			let b = [ object.getBounds().getNorthWest(), object.getBounds().getSouthEast() ]
					.map(p => _MAP.project(p, zoom));
			let size = [ b[1].x - b[0].x, b[1].y - b[0].y ];
			object.setBounds([
				_MAP.layerPointToLatLng([ p.x, p.y ]),
				_MAP.layerPointToLatLng([ p.x + size[0], p.y + size[1] ])
			]);
			_MAP.updateObject(object.options.id);
		});

		object.on("popupopen", ev => {
			if(isDragEv) { object.closePopup(); isDragEv = false; }
			else{ bind_setup(object); }
		});
		object.on("mouseover", ev => { _MAP.highlightObject(object.options.id); });
		object.on("mouseout", ev => { _MAP.unhighlightObject(object.options.id); });

		/*object.bindContextMenu({
			contextmenu: true,
			contextmenuItems: [ { text: "Clone avatar", callback: ev => { _MAP.cloneAvatar(object.options.id, object.options.contentId); }, index: 0 } ]
		});*/
	},

	unbind: function(object) {
		object.closeTooltip(); object.unbindTooltip();
		object.closePopup(); object.unbindPopup();

		object.off("popupopen"); object.off("mouseover"); object.off("mouseout");

		//object.slideCancel();
		//object.dragging.disable();
	},

	getObject: function(id) {
		for(let o of this.getLayers()) {
			if(o.options.id == id) { return o; }
		}
		return null;
	},

	setIcon: function(id, size, icon) {
		let o = this.getObject(id);

		if(icon) { o.setUrl(icon); }
		if(size) {
			let zoom = _MAP.getZoom();
			let c = _MAP.project(o.getBounds().getCenter(), zoom);
			o.setBounds([
				_MAP.unproject([ c.x - size[0] / 2, c.y - size[1] / 2 ], zoom),
				_MAP.unproject([ c.x + size[0] / 2, c.y + size[1] / 2 ], zoom)
			]);
		}

		$(o._image).css("border-radius", o.options.rounded ? "50%" : "0");
		//$(o._image).css("transform", `rotate(${o.options.angle}deg)`);
		$(o._image).css("border", `${o.options.borderThickness}px solid ${o.options.borderColor}`);
		$(o._image).css("filter", `
			blur(${o.options.overlayBlur}px)
			grayscale(${o.options.overlayGrayscale*100}%)
			drop-shadow(0 0 ${o.options.overlayBrightness}px yellow)
			opacity(${(1 - o.options.overlayTransparency)*100}%)
		`);

		o.closeTooltip(); o.openTooltip();
	},

	removeLayer: function(object, id) {
		var object = object || (id ? this.getObject(id) : null);
		this.unbind(object);
		L.FeatureGroup.prototype.removeLayer.call(this, object);
	},

	initialize: function(options) {
		L.FeatureGroup.prototype.initialize.call(this);
		this.options.id = uuid();
		this.options = Object.assign({}, this.options, options);
	}
});
L.avatarLayer = function(options) { return new L.AvatarLayer(options); };




L.EditLayer = L.FeatureGroup.extend({
	addLayer: function(object) {
		L.FeatureGroup.prototype.addLayer.call(this, object);
		this.bind(object);

		if(!this.editHandler.enabled()) {
			this.editHandler._map = this._map; // NOTE: this is also a hack, but necessary to make editing work
			this.editHandler.enable();
		}
	},

	bind: function(object) {
		let popup = "";
		switch(object.options.type) {
			case "polyline": popup = polyline_popup(); break;
			case "polygon":
			case "rectangle": popup = polygon_popup(); break;
			default: console.error("object type invalid"); break;
		}
		object.bindPopup(popup, { keepInView: true, closeOnEscapeKey: false, maxWidth: 350, maxHeight: 450, autoPanPadding: L.point(60,60) });

		object.on("popupopen", ev => { bind_setup(object); });
		object.on("mouseover", ev => { _MAP.highlightObject(object.options.id); });
		object.on("mouseout", ev => { _MAP.unhighlightObject(object.options.id); });
	},

	unbind: function(object) {
		object.closePopup(); object.unbindPopup();
		object.off("popupopen"); object.off("mouseover"); object.off("mouseout");
	},

	getObject: function(id) {
		for(let o of this.getLayers()) {
			if(o.options.id == id) { return o; }
		}
		return null;
	},

	removeLayer: function(object, id) {
		var object = object || (id ? this.getObject(id) : null);
		this.unbind(object);
		L.FeatureGroup.prototype.removeLayer.call(this, object);
	},

	initialize: function(options) {
		L.FeatureGroup.prototype.initialize.call(this);
		this.options.id = uuid();
		this.options = Object.assign({}, this.options, options);

		let editControl = new L.EditToolbar({
			edit: { selectedPathOptions: { dashArray: "none", maintainColor: true } },
			featureGroup: this
		});
		delete editControl.options.edit.selectedPathOptions.fillOpacity; // NOTE: this is a crazy hack, but necessary to make use that the fill opacity of the map objects are not changed when entered into editing mode
		this.editHandler = editControl.getModeHandlers()[0].handler;
	}
});
L.editLayer = function(options) { return new L.EditLayer(options); };

















function bind_setup(object) {

	switch(object.options.type) {
		case "avatar":
			$("#avatarPopup input#label").change(function(ev) {
				let val = $(this).val();

				if(val) {
					if(!object.getTooltip()) {
						object.bindTooltip( L.tooltip({ direction: "bottom", permanent: true }, object) );
					}
					object.setTooltipContent(val);
				}
				else{ object.unbindTooltip(); }

				object.options.label = val;
				_MAP.updateObject(object.options.id);
			});
			$("#avatarPopup input#label").val(object.options.label || "");

			$("#avatarPopup input#icon").change(function(ev) {
				let file = $(this)[0].files[0];
				if(!file) { return; }

				$("#loadingModal").modal("show");

				let fr = new FileReader();
				fr.onload = function() {
					let res = fr.result;

					let img = new Image();
					img.onload = function() {
						let width = this.width, height = this.height;
						let ratio = width / height;

						$("#avatarPopup input#rounded").prop("checked", false);
						// TODO: Also set rotation-angle input to 0

						object.options.ratio = ratio;
						object.options.rounded = false;
						object.options.angle = 0;

						let data = new FormData(); data.append("image", file);

						$.ajax({
							type: "POST",
							url: "api/img.php",
							data: data,
							contentType: false,
							processData: false,
							success: function(result, status, xhr) {
								_MAP.setIcon(object.options.id, [width, height], result);
								_MAP.updateObject(object.options.id);

								setTimeout(function() { $("#loadingModal").modal("hide"); }, 750);
							},
							error: function(xhr, status, error) {
								console.log(xhr.status);
								console.log(error);

								setTimeout(function() { $("#loadingModal").modal("hide"); $("#errorModal").modal("show"); }, 750);
							}
						});

						return true;
					};
					img.src = res;
				};
				fr.readAsDataURL(file);
			});

			$("#avatarPopup input#size").change(function(ev) {
				let val = $(this).val();

				_MAP.setIcon(object.options.id, [ val, val / object.options.ratio ]);
				_MAP.updateObject(object.options.id);
			});

			$("#avatarPopup input#rounded").change(function(ev) {
				object.options.rounded = this.checked;

				_MAP.updateObject(object.options.id);
				_MAP.setIcon(object.options.id);
			});
			$("#avatarPopup input#rounded").prop("checked", object.options.rounded);

			$("#avatarPopup input#color").change(function(ev) {
				let val = $(this).val();

				object.options.borderColor = val;
				_MAP.updateObject(object.options.id);
				_MAP.setIcon(object.options.id);
			});
			$("#avatarPopup input#color").val(object.options.borderColor || "#563d7c");

			$("#avatarPopup input#thickness").change(function(ev) {
				let val = Math.min( Math.max( 0, $(this).val() ), 10 );

				object.options.borderThickness = val;
				_MAP.updateObject(object.options.id);
				_MAP.setIcon(object.options.id);
			});

			$("#avatarPopup input#blur").change(function(ev) {
				let val = Math.min( Math.max( 0, $(this).val() ), 3 );

				object.options.overlayBlur = val;
				_MAP.updateObject(object.options.id);
				_MAP.setIcon(object.options.id);
			});

			$("#avatarPopup input#grayscale").change(function(ev) {
				let val = Math.min( Math.max( 0, $(this).val() ), 1 );

				object.options.overlayGrayscale = val;
				_MAP.updateObject(object.options.id);
				_MAP.setIcon(object.options.id);
			});

			$("#avatarPopup input#brightness").change(function(ev) {
				let val = Math.min( Math.max( 0, $(this).val() ), 6 );

				object.options.overlayBrightness = val;
				_MAP.updateObject(object.options.id);
				_MAP.setIcon(object.options.id);
			});

			$("#avatarPopup input#transparency").change(function(ev) {
				let val = Math.min( Math.max( 0, $(this).val() ), 0.9 );

				object.options.overlayTransparency = val;
				_MAP.updateObject(object.options.id);
				_MAP.setIcon(object.options.id);
			});

			$("#avatarPopup #bringToFront").click(function(ev) {
				object.bringToFront();
			});

			$("#avatarPopup #makeGlobal").click(function(ev) {
				_MAP.globalObjectOptions(object.options.id);
			});

			$("#avatarPopup #delete").click(function(ev) {
				_MAP.deleteObject(object.options.id, object.options.type);
			});
			break;


		case "polyline":
		case "polygon":
		case "rectangle":
			$("#shapePopup input#lineColor").change(function(ev) {
				object.setStyle({ color: $(this).val() });
				_MAP.updateObject(object.options.id);
			});
			$("#shapePopup input#lineColor").val(object.options.color || "#563d7c");

			$("#shapePopup input#lineThickness").change(function(ev) {
				object.setStyle({ weight: Math.min( Math.max( 2, $(this).val() ), 10 ) });
				_MAP.updateObject(object.options.id);
			});

			$("#shapePopup input#lineTransparency").change(function(ev) {
				object.setStyle({ opacity: 1 - Math.min( Math.max( 0, $(this).val() ), 0.9 ) });
				_MAP.updateObject(object.options.id);
			});

			if(object.options.type == "polygon"
			|| object.options.type == "rectangle") {
				$("#shapePopup input#fillColor").change(function(ev) {
					object.setStyle({ fillColor: $(this).val() });
					_MAP.updateObject(object.options.id);
				});
				$("#shapePopup input#fillColor").val(object.options.fillColor || "#563d7c");

				$("#shapePopup input#fillTransparency").change(function(ev) {
					object.setStyle({ fillOpacity: 1 - Math.min( Math.max( 0, $(this).val() ), 1 ) });
					_MAP.updateObject(object.options.id);
				});
			}

			$("#shapePopup #delete").click(function(ev) {
				_MAP.deleteObject(object.options.id, object.options.type);
			});
			break;


		default: console.error("object type invalid"); break;
	}

}
