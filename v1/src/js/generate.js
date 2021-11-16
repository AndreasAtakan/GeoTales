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
				<div class="row gx-0 mx-2" id="topPadScene">
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

				<div class="row gx-0" id="bottomPadScene">
					<div class="col">
						<center>
							<button type="button" class="btn btn-outline-secondary px-5" id="addScene">
								<strong>+</strong>
							</button>
						</center>
					</div>
				</div>
			</div>
		</div>
	`);

}

function reset_scene() {

	$("div#sceneCol").html(`
		<div class="row align-items-center h-100 g-0">
			<div class="col">
				<center>
					<button type="button" class="btn btn-outline-secondary px-5" id="addScene">
						<strong>+</strong>
					</button>

					<p class="text-muted mt-3">
						Click to prepare a scene
					</p>
				</center>
			</div>
		</div>
	`);

}

function add_scene(id) {

	$("ul#sceneContainer").append(`
		<li class="list-group-item prepare" style="border-color: rgba(0,0,0,.4);" id="${id}" data-sceneid="${id}">
			<form class="container-fluid needs-validation px-0">
				<div class="row g-0">
					<div class="col-1">
						<div class="row gx-0 mb-3">
							<div class="col">
								<span id="reorder" title="Change ordering">
									<i class="fas fa-bars"></i>
								</span>
							</div>
						</div>
						<div class="row gx-0">
							<div class="col">
								<span id="capture" title="Capture scene">
									<i class="fas fa-camera"></i>
								</span>
							</div>
						</div>
						<div class="row gx-0 mb-3" style="position: absolute; bottom: 0;">
							<div class="col">
								<span id="delete" title="Delete scene">
									<i class="fas fa-trash"></i>
								</span>
							</div>
						</div>
					</div>
					<div class="col-11">
						<div class="row mb-1">
							<div class="col">
								<input type="text" class="form-control" id="titleInput" placeholder="Title" required disabled />
							</div>
						</div>
						<div class="row mb-3">
							<div class="col">
								<input type="date" class="form-control form-control-sm" id="dateInput" style="width: auto; display: inline;" required disabled />
								<input type="time" class="form-control form-control-sm" id="timeInput" step="1" style="width: auto; display: inline;" required disabled />
							</div>
						</div>
						<div class="row mb-3">
							<div class="col">
								<div class="form-text" id="mediaHelp">Choose one or more media files</div>
								<input type="file" class="form-control form-control-sm" id="mediaInput" aria-describedby="mediaHelp" accept="image/*" multiple disabled />
							</div>
						</div>
						<div class="row">
							<div class="col">
								<div class="pell" id="textInput"></div>
							</div>
						</div>
					</div>
				</div>
			</form>
		</li>
	`);

}



function marker_popup() {

	return `
		<div class="container-fluid" id="markerPopup">
			<div class="row">
				<div class="col">
					<h6>Icon</h6>
					<input type="file" class="form-control form-control-sm" id="icon" accept="image/*" />
				</div>
			</div>

			<div class="row mt-4">
				<div class="col">
					<h6>Border</h6>
					<div class="input-group input-group-sm">
						<input type="color" class="form-control form-control-color" id="color" value="#563d7c" title="Choose color" />
						<input type="number" min="0" max="10" class="form-control" id="thickness" placeholder="Thickness" />
					</div>
				</div>
			</div>

			<div class="row mt-4">
				<div class="col">
					<h6>Overlay</h6>
					<div class="input-group input-group-sm mb-3">
						<input type="number" min="0" max="3" step="0.1" class="form-control" id="blur" placeholder="Blur" />
						<input type="number" min="0" max="1" step="0.1" class="form-control" id="grayscale" placeholder="Grayscale" />
						<input type="number" min="0" max="90" step="5" class="form-control" id="transparency" placeholder="Transparency" />
						<span class="input-group-text">%</span>
					</div>
				</div>
			</div>

			<div class="row">
				<div class="col">
					<button type="button" class="btn btn-sm btn-outline-secondary mx-1" id="delete" style="float: right;">
						<i class="fas fa-trash"></i>
					</button>
				</div>
			</div>
		</div>
	`;

}

function polyline_popup() {

	return `
		<div class="container-fluid" id="polylinePopup">
			<div class="row">
				<div class="col">
					<h6>Color</h6>
					<div class="input-group input-group-sm mb-3">
						<input type="color" class="form-control form-control-color" id="color" value="#563d7c" title="Choose color" />
						<input type="number" min="2" max="10" class="form-control" id="thickness" placeholder="Thickness" />
						<input type="number" min="0" max="90" step="5" class="form-control" id="transparency" placeholder="Transparency" />
						<span class="input-group-text">%</span>
					</div>
				</div>
			</div>

			<div class="row">
				<div class="col">
					<button type="button" class="btn btn-sm btn-outline-secondary mx-1" id="delete" style="float: right;">
						<i class="fas fa-trash"></i>
					</button>
				</div>
			</div>
		</div>
	`;

}

function polygon_popup() {

	return `
		<div class="container-fluid" id="polygonPopup">
			<div class="row">
				<div class="col">
					<h6>Line</h6>
					<div class="input-group input-group-sm mb-3">
						<input type="color" class="form-control form-control-color" id="lineColor" value="#563d7c" title="Choose color" />
						<input type="number" min="2" max="10" class="form-control" id="lineThickness" placeholder="Thickness" />
						<input type="number" min="0" max="90" step="5" class="form-control" id="lineTransparency" placeholder="Transparency" />
						<span class="input-group-text">%</span>
					</div>
				</div>
			</div>

			<div class="row">
				<div class="col">
					<h6>Fill</h6>
					<div class="input-group input-group-sm mb-3">
						<input type="color" class="form-control form-control-color" id="fillColor" value="#563d7c" title="Choose color" />
						<input type="number" min="0" max="100" step="5" class="form-control" id="fillTransparency" placeholder="Transparency" />
						<span class="input-group-text">%</span>
					</div>
				</div>
			</div>

			<div class="row">
				<div class="col">
					<button type="button" class="btn btn-sm btn-outline-secondary mx-1" id="delete" style="float: right;">
						<i class="fas fa-trash"></i>
					</button>
				</div>
			</div>
		</div>
	`;

}



function init_basemaps() {

	let html = ``;

	for(let b of _BASEMAPS) {
		html += `
			<div class="col">
				<div class="card mt-2">
					<div class="card-body">
						<h6 class="card-title mb-0">${b.name}</h6>
					</div>
					<img class="card-img-bottom" id="basemaps" src="${b.preview}" alt="${b.name}" data-basemap="${b.name}" />
				</div>
			</div>
		`;
	}

	$("#basemapModal #basemapChoose").html(html);

}
