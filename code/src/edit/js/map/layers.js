/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

"use strict";


L.FadeLayer = L.FeatureGroup.extend({
	addLayer: function(object, id) {
		L.FeatureGroup.prototype.addLayer.call(this, object);
		if(id && !object.options.id) object.options.id = id;
		object.options.pmIgnore = true;

		if(object instanceof L.ImageOverlay) {
			object.setOpacity(0.3);
			$(object._image).css("border-radius", object.options.rounded ? "50%" : "0");
			//$(object._image).css("transform", `rotate(${object.options.angle}deg)`);
			$(object._image).css("border", `${object.options.borderThickness}px solid ${object.options.borderColor}`);
			$(object._image).css("filter", `
				blur(${object.options.overlayBlur}px)
				grayscale(${object.options.overlayGrayscale*100}%)
			`);
		}else{
			object.setStyle({ opacity: 0.3 });
			object.setStyle({ fillOpacity: 0.2 });
		}
		object.on("click", ev => { _MAP.insertObject(object); });
	},

	getObject: function(id) {
		for(let o of this.getLayers()) {
			if(o.options.id == id) { return o; }
		}
		return null;
	},

	removeLayer: function(object, id) {
		var object = object || (id ? this.getObject(id) : null);
		if(!object) { return; }
		object.off("click");
		L.FeatureGroup.prototype.removeLayer.call(this, object);
	},

	initialize: function(options) {
		L.FeatureGroup.prototype.initialize.call(this);
		this.options.id = "0";
		this.options = Object.assign({}, this.options, options);
	}
});
L.fadeLayer = function(options) { return new L.FadeLayer(options); };




L.ObjectLayer = L.FeatureGroup.extend({

	addLayer: function(object, type, id) {
		object.options.id = id || uuid();
		if(type && !object.options.type) { object.options.type = type; }
		console.log(object);

		L.FeatureGroup.prototype.addLayer.call(this, object);
		return;

		switch(object.options.type) {
			case "avatar":
				this.avatarLayer.addLayer(object);
				break;

			case "polyline":
			case "polygon":
			case "rectangle":
				this.editLayer.addLayer(object);
				break;

			default: console.error("object type invalid"); break;
		}
	},

	getObject: function(id) {
		for(let o of this.getLayers()) {
			if(o.options.id == id) { return o; }
		}
		return null;
	},

	/*getLayers: function() {
		return this.avatarLayer.getLayers().concat(this.editLayer.getLayers());
	},*/

	setIcon: function(id, size, icon) { /**/ },

	removeLayer: function(object, id) {
		var object = object || (id ? this.getObject(id) : null);
		if(!object) { return; }

		L.FeatureGroup.prototype.removeLayer.call(this, object);
		return;

		switch(object.options.type) {
			case "avatar":
				this.avatarLayer.removeLayer(object);
				break;

			case "polyline":
			case "polygon":
			case "rectangle":
				this.editLayer.removeLayer(object);
				break;

			default: console.error("object type invalid"); break;
		}
	},

	/*clearLayers: function() {
		this.avatarLayer.clearLayers();
		this.editLayer.clearLayers();
	},*/

	initialize: function(options) {
		L.FeatureGroup.prototype.initialize.call(this);
		this.options.id = uuid();
		this.options = Object.assign({}, this.options, options);

		//this.avatarLayer = L.avatarLayer();
		//this.editLayer = L.editLayer();

		//L.FeatureGroup.prototype.addLayer.call(this, this.avatarLayer);
		//L.FeatureGroup.prototype.addLayer.call(this, this.editLayer);
	}
});
L.objectLayer = function(options) { return new L.ObjectLayer(options); };




L.AvatarLayer = L.FeatureGroup.extend({
	addLayer: function(object) {
		L.FeatureGroup.prototype.addLayer.call(this, object);

		this.setIcon(object.options.id);
		this.bind(object.options.id);
	},

	bind: function(id) {
		let o = this.getObject(id);

		o.bindPopup(avatar_popup(), { keepInView: true, closeOnEscapeKey: false, maxWidth: 350, maxHeight: 450 });

		let label = o.options.label;
		if(label) { o.bindTooltip(label, { direction: "bottom", permanent: true }); }

		let drag = new L.Draggable( o.getElement() ), isDragEv = false;
		drag.enable();
		drag.on("dragstart", ev => { isDragEv = true; });
		drag.on("dragend", ev => {
			let zoom = _MAP.getZoom(), p = ev.target._newPos;
			let b = [ o.getBounds().getNorthWest(), o.getBounds().getSouthEast() ]
					.map(p => _MAP.project(p, zoom));
			let size = [ b[1].x - b[0].x, b[1].y - b[0].y ];
			o.setBounds([
				_MAP.layerPointToLatLng([ p.x, p.y ]),
				_MAP.layerPointToLatLng([ p.x + size[0], p.y + size[1] ])
			]);
			_MAP.updateObject(o.options.id);
		});

		o.on("popupopen", ev => {
			if(isDragEv) { o.closePopup(); isDragEv = false; }
			else{ bind_setup(o); }
		});
		o.on("mouseover", ev => { _MAP.highlightObject(o.options.id); });
		o.on("mouseout", ev => { _MAP.unhighlightObject(o.options.id); });

		o.bindContextMenu({
			contextmenu: true,
			contextmenuItems: [ { text: "Clone avatar", callback: ev => { _MAP.cloneAvatar(o.options.id, o.options.sceneId); }, index: 0 } ]
		});
	},

	unbind: function(id) {
		let o = this.getObject(id);

		o.closeTooltip(); o.unbindTooltip();
		o.closePopup(); o.unbindPopup();

		o.off("popupopen"); o.off("mouseover"); o.off("mouseout");

		o.slideCancel();
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

		if(o.options.label) { o.closeTooltip(); o.openTooltip(); }
	},

	removeLayer: function(object, id) {
		var object = object || (id ? this.getObject(id) : null);
		this.unbind(object.options.id);
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
		this.bind(object.options.id);

		/*if(!this.editHandler.enabled()) {
			this.editHandler._map = this._map; // NOTE: this is also a hack, but necessary to make editing work
			this.editHandler.enable();
		}*/
	},

	bind: function(id) {
		let o = this.getObject(id);

		let label = o.options.label;
		if(label) { o.bindTooltip(label, { direction: "center", permanent: true }); }

		let popup = "";
		switch(o.options.type) {
			case "polyline": popup = polyline_popup(); break;
			case "polygon":
			case "rectangle": popup = polygon_popup(); break;
			default: console.error("object type invalid"); break;
		}
		o.bindPopup(popup, { keepInView: true, closeOnEscapeKey: false, maxWidth: 350, maxHeight: 450 });

		o.on("popupopen", ev => { bind_setup(o); });
		o.on("mouseover", ev => { _MAP.highlightObject(o.options.id); });
		o.on("mouseout", ev => { _MAP.unhighlightObject(o.options.id); });
	},

	unbind: function(id) {
		let o = this.getObject(id);

		o.closeTooltip(); o.unbindTooltip();
		o.closePopup(); o.unbindPopup();
		o.off("popupopen"); o.off("mouseover"); o.off("mouseout");
	},

	getObject: function(id) {
		for(let o of this.getLayers()) {
			if(o.options.id == id) { return o; }
		}
		return null;
	},

	removeLayer: function(object, id) {
		var object = object || (id ? this.getObject(id) : null);
		this.unbind(object.options.id);
		L.FeatureGroup.prototype.removeLayer.call(this, object);
	},

	initialize: function(options) {
		L.FeatureGroup.prototype.initialize.call(this);
		this.options.id = uuid();
		this.options = Object.assign({}, this.options, options);

		/*let editControl = new L.EditToolbar({
			edit: { selectedPathOptions: { dashArray: "none", maintainColor: true } },
			featureGroup: this
		});
		delete editControl.options.edit.selectedPathOptions.fillOpacity; // NOTE: this is a crazy hack, but necessary to make use that the fill opacity of the map objects are not changed when entered into editing mode
		this.editHandler = editControl.getModeHandlers()[0].handler;*/
	}
});
L.editLayer = function(options) { return new L.EditLayer(options); };








function bind_setup(object) {

	$(".objectPopup input#label").change(function(ev) {
		let val = $(this).val();
		/* temp */ if(object.options.type == "avatar") { return; }

		if(val) {
			if(!object.getTooltip()) {
				object.bindTooltip( L.tooltip({
					direction: object.options.type == "avatar" ? "bottom" : "center",
					permanent: true
				}, object) );
			}
			object.setTooltipContent(val);
		}
		else{ object.unbindTooltip(); }

		object.options.label = val;
		_MAP.updateObject(object.options.id);
	});
	$(".objectPopup input#label").val(object.options.label || "");

	switch(object.options.type) {
		case "avatar":
			$("#avatarPopup input#icon").change(function(ev) {
				let file = $(this)[0].files[0];
				if(!file) { return; }

				$("#loadingModal").modal("show");

				let fr = new FileReader();
				fr.onload = function() {
					let res = fr.result;

					let img = new Image();
					img.onload = function() {
						$("#avatarPopup input#rounded").prop("checked", false);
						// TODO: Also set rotation-angle input to 0

						object.options.ratio = this.width / this.height;
						object.options.rounded = false;
						object.options.angle = 0;

						let data = new FormData(); data.append("image", file);

						$.ajax({
							type: "POST",
							url: "api/upload.php",
							data: data,
							contentType: false,
							processData: false,
							success: function(result, status, xhr) {
								_MAP.setIcon(object.options.id, [ 35, 35 / object.options.ratio ], result);
								_MAP.updateObject(object.options.id);

								setTimeout(function() { $("#loadingModal").modal("hide"); }, 750);
							},
							error: function(xhr, status, error) {
								console.error(xhr.status, error);
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
				let val = Math.min( Math.max( $(this).prop("min"), $(this).val() ), $(this).prop("max") );

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
				let val = Math.min( Math.max( $(this).prop("min"), $(this).val() ), $(this).prop("max") );

				object.options.borderThickness = val;
				_MAP.updateObject(object.options.id);
				_MAP.setIcon(object.options.id);
			});

			$("#avatarPopup input#blur").change(function(ev) {
				let val = Math.min( Math.max( $(this).prop("min"), $(this).val() ), $(this).prop("max") );

				object.options.overlayBlur = val;
				_MAP.updateObject(object.options.id);
				_MAP.setIcon(object.options.id);
			});

			$("#avatarPopup input#grayscale").change(function(ev) {
				let val = Math.min( Math.max( $(this).prop("min"), $(this).val() ), $(this).prop("max") );

				object.options.overlayGrayscale = val;
				_MAP.updateObject(object.options.id);
				_MAP.setIcon(object.options.id);
			});

			$("#avatarPopup input#brightness").change(function(ev) {
				let val = Math.min( Math.max( $(this).prop("min"), $(this).val() ), $(this).prop("max") );

				object.options.overlayBrightness = val;
				_MAP.updateObject(object.options.id);
				_MAP.setIcon(object.options.id);
			});

			$("#avatarPopup input#transparency").change(function(ev) {
				let val = Math.min( Math.max( $(this).prop("min"), $(this).val() ), $(this).prop("max") );

				object.options.overlayTransparency = val;
				_MAP.updateObject(object.options.id);
				_MAP.setIcon(object.options.id);
			});
			break;


		case "polyline":
		case "polygon":
			$("#shapePopup input#lineColor").change(function(ev) {
				object.setStyle({ color: $(this).val() });
				_MAP.updateObject(object.options.id);
			});
			$("#shapePopup input#lineColor").val(object.options.color || "#563d7c");

			$("#shapePopup input#lineThickness").change(function(ev) {
				object.setStyle({
					weight: Math.min( Math.max( $(this).prop("min"), $(this).val() ), $(this).prop("max") )
				});
				_MAP.updateObject(object.options.id);
			});

			$("#shapePopup input#lineTransparency").change(function(ev) {
				object.setStyle({
					opacity: 1 - Math.min( Math.max( $(this).prop("min"), $(this).val() ), $(this).prop("max") )
				});
				_MAP.updateObject(object.options.id);
			});

			if(object.options.type == "polygon") {
				$("#shapePopup input#fillColor").change(function(ev) {
					object.setStyle({ fillColor: $(this).val() });
					_MAP.updateObject(object.options.id);
				});
				$("#shapePopup input#fillColor").val(object.options.fillColor || "#563d7c");

				$("#shapePopup input#fillTransparency").change(function(ev) {
					object.setStyle({
						fillOpacity: 1 - Math.min( Math.max( $(this).prop("min"), $(this).val() ), $(this).prop("max") )
					});
					_MAP.updateObject(object.options.id);
				});
			}
			break;

		default: console.error("object type invalid"); break;
	}

	$(".objectPopup #bringToFront").click(function(ev) {
		object.bringToFront();
	});

	$(".objectPopup #makeGlobal").click(function(ev) {
		_MAP.globalObjectOptions(object.options.id);
	});

	$(".objectPopup #delete").click(function(ev) {
		_MAP.deleteObject(object.options.id, object.options.type);
	});
}
