/*©agpl*************************************************************************
*                                                                              *
* DynastyMap                                                                   *
* Copyright (C) 2021  DynastyMap AS                                            *
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


window.onload = function(ev) {

	_MAP = L.map("map", {
		center: [ 51.781435604431195, 14.194335937500002 ],
		zoom: window.innerWidth < 575.98 ? 3 : 5,
		zoomControl: false,
		maxZoom: 18
	});

	$("div.leaflet-control-attribution a").attr("target", "_blank");

	$("div#sceneCol button#addScene").click( ev => { _EVENTS.scene.setup(); } );

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
