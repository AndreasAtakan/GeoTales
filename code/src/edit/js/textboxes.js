/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

"use strict";


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
$("#textbox").draggable({ // https://api.jqueryui.com/draggable/
	cursor: "move", containment: "parent", zIndex: 1003
});

$("#textbox div#content").trumbowyg({
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
							$(`li[data-id="${id}"] div#content`).trumbowyg("execCmd", { cmd: "insertImage", param: result, forceCss: false, skipTrumbowyg: true });
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
		["formatting"], ["format"], ["align"], ["fontfamily"], ["foreColor", "backColor"], ["link"], ["uploadImg"]
	],
	plugins: {}
}).on("tbwchange", () => { this.store[ this.get(this.active).index ].content = $("#textbox div#content").trumbowyg("html"); });

$("#textbox").draggable("destroy");
$("#textbox div#content").trumbowyg("destroy");

$("#textbox div#content").trumbowyg("html", c.content);

$(`li[data-id="${this.id}"] div#content`).trumbowyg("enable");
$(`li[data-id="${this.id}"] div#content`).trumbowyg("disable");
*/
