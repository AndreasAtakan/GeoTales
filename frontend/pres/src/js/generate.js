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

	$("div#sceneCol").html(`
		<div id="_midline"></div>

		<div class="row align-items-center g-0 h-100">
			<div class="col">
				<div class="btn-group btn-group-sm" role="group" aria-label="Scene buttons" id="navBtns">
					<button type="button" class="btn btn-light" id="sceneUp">
						<i class="fas fa-chevron-up"></i>
					</button>
					<button type="button" class="btn btn-light" id="sceneDown">
						<i class="fas fa-chevron-down"></i>
					</button>
				</div>

				<div id="topFade"></div>

				<div class="row gx-0 mx-2">
					<div class="col">
						<hr />
					</div>
				</div>

				<div class="row mx-2">
					<div class="col">
						<ul class="list-group" id="sceneContainer"></ul>
					</div>
				</div>

				<div class="row gx-0 mx-2">
					<div class="col">
						<hr />
					</div>
				</div>

				<div id="bottomFade"></div>
			</div>
		</div>
	`);

}

function reset_scene() {

	$("div#sceneCol").html(`
		<div class="row align-items-center h-100 g-0">
			<div class="col">
				<center>
					<button type="button" class="btn btn-outline-secondary px-5" id="import" title="Import project">
						<strong>+</strong>
					</button>

					<p class="text-muted mt-3">
						Click to import project
					</p>
				</center>
			</div>
		</div>
	`);

}

function add_scene(id) {

	$("ul#sceneContainer").append(`
		<li class="list-group-item" id="${id}" data-sceneid="${id}">
			<div class="container-fluid">
				<div class="row">
					<div class="col">
						<div class="row my-1">
							<div class="col">
								<p class="text-muted text-end mb-1" id="datetime"></p>
							</div>
						</div>
						<div class="row my-1">
							<div class="col">
								<div id="content"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</li>
	`);

}
