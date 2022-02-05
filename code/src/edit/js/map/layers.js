/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

"use strict";


L.FadeLayer = L.FeatureGroup.extend({

	addLayer: function(object, type, id) {
		L.FeatureGroup.prototype.addLayer.call(this, object);

		if(id && !object.options.id) object.options.id = id;
		if(type && !object.options.type) object.options.type = type;

		switch(object.options.type) {
			case "marker":
				$(object._icon).css("border-radius", object.options.rounded ? "50%" : "0");
				//$(object._icon).css("transform", `rotate(${object.options.angle}deg)`);
				$(object._icon).css("border", `${object.options.borderThickness}px solid ${object.options.borderColor}`);
				$(object._icon).css("filter", `
					blur(${object.options.overlayBlur}px)
					grayscale(${object.options.overlayGrayscale*100}%)
					opacity(40%)
				`);
				break;

			case "polyline":
				object.setStyle({ opacity: 0.3 });
				break;

			case "polygon":
			case "rectangle":
				object.setStyle({ opacity: 0.3 });
				object.setStyle({ fillOpacity: 0.2 });
				break;

			default:
				console.error("object type invalid");
				break;
		}

		object.on("click", ev => { _MAP.insertObject(object.options.id, object.options.contentId); });
	},

	getObject: function(id) {
		for(let o of this.getLayers()) {
			if(o.options.id == id) { return o; }
		}
		return null;
	},

	removeLayer: function(object, id) {
		var object = object || (id ? this.getObject(id) : null);
		if(!object) return;

		object.off("click");

		L.FeatureGroup.prototype.removeLayer.call(this, object);
	},

	initialize: function(options) {
		L.FeatureGroup.prototype.initialize.call(this);

		this.options.id = uuid();
		this.options = Object.assign({}, this.options, options);
	}

});


L.fadeLayer = function(options) { return new L.FadeLayer(options); };




L.ObjectLayer = L.FeatureGroup.extend({

	addLayer: function(object, type, id) {
		object.options.id = id || uuid();
		if(type && !object.options.type) { object.options.type = type; }

		switch(object.options.type) {
			case "marker":
				L.FeatureGroup.prototype.addLayer.call(this, object);
				object.dragging.enable();

				object.options.ratio = 496 / 512; // NOTE: this is hard-coded from the pixel-width of 'user-circle-solid.svg'
				object.options.rounded = false;
				object.options.angle = 0;
				object.options.borderColor = "#563d7c";
				object.options.borderThickness = 0;
				object.options.overlayBlur = 0;
				object.options.overlayGrayscale = 0;
				object.options.overlayBrightness = 0;
				object.options.overlayTransparency = 0;
				this.setIcon(object.options.id);
				break;

			case "textbox":
				L.FeatureGroup.prototype.addLayer.call(this, object);
				object.setContent("I am a standalone popup.").openOn(this);
				break;

			case "polyline":
			case "polygon":
			case "rectangle":
				this.editLayer.addLayer(object);
				break;

			default: console.error("object type invalid"); break;
		}

		this.bind(object);

		if(!this.editHandler.enabled()) {
			this.editHandler._map = this._map; // NOTE: this is also a hack, but necessary to make editing work
			this.editHandler.enable();
		}
	},

	bind: function(object) {
		let popup = "";
		switch(object.options.type) {
			case "marker": popup = marker_popup(); break;
			case "polyline": popup = polyline_popup(); break;
			case "polygon":
			case "rectangle": popup = polygon_popup(); break;
			default: console.error("object type invalid"); break;
		}
		object.bindPopup(popup, { keepInView: true, maxWidth: 350, maxHeight: 450, autoPanPadding: L.point(60,60) });

		if(object.options.label) { object.bindTooltip(object.options.label, { direction: "bottom", permanent: true }); }

		object.on("popupopen", ev => { bind_setup(object); });
		object.on("mouseover", ev => { _MAP.highlightObject(object.options.id); });
		object.on("mouseout", ev => { _MAP.unhighlightObject(object.options.id); });

		if(object.options.type == "marker") {
			object.on("dragend", ev => { _MAP.updateObject(object.options.id); });
			object.bindContextMenu({
				contextmenu: true,
				contextmenuItems: [ { text: "Clone avatar", callback: ev => { _MAP.cloneAvatar(object.options.id, object.options.contentId); }, index: 0 } ]
			});
		}
	},

	unbind: function(object) {
		object.closeTooltip(); object.unbindTooltip();

		object.closePopup(); object.unbindPopup();

		object.off("popupopen"); object.off("mouseover"); object.off("mouseout");

		if(object.options.type == "marker") {
			object.slideCancel();
			object.dragging.disable();
			object.off("dragend");
		}
	},

	getObject: function(id) {
		for(let o of this.getLayers().concat(this.editLayer.getLayers())) {
			if(o.options.id == id) { return o; }
		}
		return null;
	},

	setIcon: function(id, size, icon) {
		let o = this.getObject(id);
		var size = size || o.getIcon().options.iconSize,
			icon = icon || o.getIcon().options.iconUrl;

		if(size[1] < 180) { // NOTE: this is to avoid the "Too much recursion" error
			o.setIcon(
				L.icon({
					iconUrl: icon,
					iconSize: size,
					popupAnchor: [ 0, (-1) * (size[1] / 2) ],
					tooltipAnchor: [ 0, size[1] / 2 ]
				})
			);
		}

		$(o._icon).css("border-radius", o.options.rounded ? "50%" : "0");
		//$(o._icon).css("transform", `rotate(${o.options.angle}deg)`);
		$(o._icon).css("border", `${o.options.borderThickness}px solid ${o.options.borderColor}`);
		$(o._icon).css("filter", `
			blur(${o.options.overlayBlur}px)
			grayscale(${o.options.overlayGrayscale*100}%)
			drop-shadow(0 0 ${o.options.overlayBrightness}px yellow)
			opacity(${(1 - o.options.overlayTransparency)*100}%)
		`);

		o.closeTooltip(); o.openTooltip();
	},

	removeLayer: function(object, id) {
		var object = object || (id ? this.getObject(id) : null);
		if(!object || object.options.type == "editLayer") { return; }

		this.unbind(object);

		switch(object.options.type) {
			case "marker":
				L.FeatureGroup.prototype.removeLayer.call(this, object);
				break;

			case "polyline":
			case "polygon":
			case "rectangle":
				this.editLayer.removeLayer(object);
				break;

			default: console.error("object type invalid"); break;
		}
	},

	clearLayers: function() {
		this.editLayer.clearLayers();
		L.FeatureGroup.prototype.clearLayers.call(this);
	},

	initialize: function(options) {
		L.FeatureGroup.prototype.initialize.call(this);

		this.options.id = uuid();
		this.options = Object.assign({}, this.options, options);

		this.editLayer = L.featureGroup();
		this.editLayer.options.type = "editLayer";
		L.FeatureGroup.prototype.addLayer.call(this, this.editLayer);

		let editControl = new L.EditToolbar({
			edit: { selectedPathOptions: { dashArray: "none", maintainColor: true } },
			featureGroup: this.editLayer
		});
		delete editControl.options.edit.selectedPathOptions.fillOpacity; // NOTE: this is a crazy hack, but necessary to make use that the fill opacity of the map objects are not changed when entered into editing mode
		this.editHandler = editControl.getModeHandlers()[0].handler;
	}

});


L.objectLayer = function(options) { return new L.ObjectLayer(options); };




function bind_setup(object) {

	switch(object.options.type) {
		case "marker":
			$("#markerPopup input#label").change(function(ev) {
				let val = $(this).val();

				if(val) {
					if(!object.getTooltip()) { object.bindTooltip(val, { direction: "bottom", permanent: true }); }
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
						let ratio = this.width / this.height, width, height;

						for(let w = 50; w > 0; w--) {
							let h = w / ratio;
							if(h < 180) { width = w; height = h; break; }
						}
						if(!width || !height) { return; }

						$("#markerPopup select#size").val("medium");
						$("#markerPopup input#rounded").prop("checked", false);
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
