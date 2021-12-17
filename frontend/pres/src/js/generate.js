/*©agpl*************************************************************************
*                                                                              *
* TellUs                                                                       *
* Copyright (C) 2021  TellUs AS                                                *
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


function init_scene() {

	$("div#col").append(`
		<div class="card" id="scene" data-sceneid="">
			<div class="card-body">
				<div class="btn-group btn-group-sm" role="group" aria-label="Scene buttons" id="navBtns">
					<button type="button" class="btn btn-light" id="sceneBackward">
						<i class="fas fa-chevron-left"></i>
					</button>
					<button type="button" class="btn btn-light" id="sceneForward">
						<i class="fas fa-chevron-right"></i>
					</button>
				</div>

				<h6 class="card-subtitle my-2 text-muted" id="datetime"></h6>
				<div id="content"></div>
			</div>
		</div>
	`);

}

function reset_scene() {

	$("div#scene").remove();

}
