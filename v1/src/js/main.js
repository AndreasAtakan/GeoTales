/*©agpl*************************************************************************
*                                                                              *
* DynastyMap                                                                   *
* Copyright (C) 2020  DynastyMap AS                                            *
*                                                                              *
* This program is free software: you can redistribute it and/or modify         *
* it under the terms of the GNU Affero General Public License as published by  *
* the Free Software Foundation, either version 3 of the License, or            *
* (at your option) any later version.                                          *
*                                                                              *
* This program is distributed in the hope that it will be useful,              *
* but WITHOUT ANY WARRANTY; without even the implied warranty of               *
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the                 *
* GNU Affero General Public License for more details.                          *
*                                                                              *
* You should have received a copy of the GNU Affero General Public License     *
* along with this program. If not, see <http://www.gnu.org/licenses/>.         *
*                                                                              *
*****************************************************************************©*/

"use strict";


let map;

window.onload = function(ev) {

	map = L.map("map", {
		center: [ 51.781435604431195, 14.194335937500002 ],
		zoom: window.innerWidth < 575.98 ? 3 : 5,
		zoomControl: false,
		maxZoom: 18
	});

	$("div.leaflet-control-attribution a").attr("target", "_blank");



	pell.init({
		element: document.querySelector("#textInput"),
		onChange: html => {
			//console.log(html);
		},
		defaultParagraphSeparator: "p",
		styleWithCSS: false,
		actions: [
			"bold",
			"underline",
			{
				name: "italic",
				result: () => pell.exec("italic")
			},
			/*{
				name: "backColor",
				icon: "<div style=\"background-color:pink;\">A</div>",
				title: "Highlight Color",
				result: () => pell.exec("backColor", "pink")
			},*/
			/*{
				name: "image",
				result: () => {
					const url = window.prompt("Enter the image URL");
					if(url) pell.exec("insertImage", url);
				}
			},*/
			{
				name: "link",
				result: () => {
					const url = window.prompt("Enter the link URL");
					if(url) pell.exec("createLink", url);
				}
			}
		]
	});

};

/*let height;
window.onresize = function(ev) {

	if(height >= 630 && window.innerHeight < 630) {
		map.drawingControl.setPosition("bottomleft");
	}else if(height < 630 && window.innerHeight >= 630) {
		map.drawingControl.setPosition("bottomright");
	}

	height = window.innerHeight;

};*/
