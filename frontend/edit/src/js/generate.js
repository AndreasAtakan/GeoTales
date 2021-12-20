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

	$("#sceneCol").html(`
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

				<div class="row gx-0 mx-2" id="bottomPadScene">
					<div class="col">
						<hr />
					</div>
				</div>

				<!--div class="row gx-0" id="bottomPadScene">
					<div class="col">
						<center>
							<button type="button" class="btn btn-outline-secondary px-5" id="addScene" title="Add new scene">
								<strong>+</strong>
							</button>
						</center>
					</div>
				</div-->
			</div>
		</div>
	`);

}

function reset_scene() {

	$("#sceneCol").html(`
		<div class="row align-items-center h-100 g-0">
			<div class="col">
				<center>
					<button type="button" class="btn btn-outline-secondary px-5" id="addScene" title="Add new scene">
						<strong>+</strong>
					</button>

					<p class="text-muted mt-3">
						Click to capture scene
					</p>
				</center>
			</div>
		</div>
	`);

}

function add_scene(id, prevId) {

	let cont = `
		<li class="list-group-item" id="${id}" data-sceneid="${id}">
			<form class="container-fluid gx-0">
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
								<span id="capture" title="Recapture scene">
									<i class="fas fa-camera"></i>
								</span>
							</div>
						</div>
						<div class="row gx-0 mb-3" style="position: absolute; bottom: 55px;">
							<div class="col">
								<span id="delete" title="Delete scene">
									<i class="fas fa-trash"></i>
								</span>
							</div>
						</div>
						<div class="row gx-0 mb-3" style="position: absolute; bottom: 0;">
							<div class="col">
								<span id="add" title="Add scene below">
									<i class="fas fa-plus"></i>
								</span>
							</div>
						</div>
					</div>
					<div class="col-10" style="width: 90%;">
						<div class="row mb-3">
							<div class="col">
								<div class="input-group input-group-sm">
									<select class="form-select" id="periodInput" aria-label="timeperiod" style="flex-grow: 0; width: auto;" disabled>
										<option value="ad" selected>AD</option>
										<option value="bc">BC</option>
									</select>
									<input type="date" class="form-control" id="dateInput" disabled />
									<input type="time" class="form-control" id="timeInput" step="1" disabled />
								</div>
							</div>
						</div>
						<div class="row mb-2">
							<div class="col textInput" style="overflow-y: auto;">
								<div id="textInput"></div>
							</div>
						</div>
					</div>
				</div>
			</form>
		</li>
	`;

	if(prevId) { $(`li[data-sceneid="${prevId}"]`).after(cont); }
	else{ $("ul#sceneContainer").append(cont); }

}



function marker_popup() {

	return `
		<form class="container-fluid" id="markerPopup">
			<div class="row">
				<div class="col">
					<input type="text" class="form-control form-control-sm" id="label" aria-label="label" placeholder="Label" />
				</div>
			</div>

			<div class="row mt-3">
				<div class="col">
					<h6>Icon</h6>
					<div class="input-group input-group-sm">
						<input type="file" class="form-control form-control-sm" id="icon" accept="image/*" />
						<input type="number" min="10" max="100" class="form-control" id="size" placeholder="Size" />
					</div>
					<div class="form-check mt-1">
						<input class="form-check-input" type="checkbox" value="" id="rounded">
						<label class="form-check-label" for="rounded">Rounded</label>
					</div>
				</div>
			</div>

			<div class="row mt-2">
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
					<div class="input-group input-group-sm">
						<input type="number" min="0" max="3" step="0.1" class="form-control" id="blur" placeholder="Blur" />
						<input type="number" min="0" max="1" step="0.1" class="form-control" id="grayscale" placeholder="Grayscale" />
					</div>
					<div class="input-group input-group-sm mb-3">
						<input type="number" min="0" max="6" step="1" class="form-control" id="brightness" placeholder="Brightness" />
						<input type="number" min="0" max="0.9" step="0.1" class="form-control" id="transparency" placeholder="Transparency" />
					</div>
				</div>
			</div>

			<div class="row">
				<div class="col-7">
					<!--button type="button" class="btn btn-sm btn-outline-secondary mx-1" id="bringToFront" title="Bring to front">
						<i class="fas fa-share"></i>
					</button-->
				</div>
				<div class="col-3">
					<button type="button" class="btn btn-sm btn-outline-secondary mx-1" id="makeGlobal" title="Save options globally">
						<i class="fas fa-save"></i> <strong>*</strong>
					</button>
				</div>
				<div class="col-2">
					<button type="button" class="btn btn-sm btn-outline-secondary mx-1" id="delete" style="float: right;" title="Delete">
						<i class="fas fa-trash"></i>
					</button>
				</div>
			</div>
		</form>
	`;

}

function polyline_popup() {

	return `
		<form class="container-fluid" id="polylinePopup">
			<div class="row">
				<div class="col">
					<h6>Color</h6>
					<div class="input-group input-group-sm mb-3">
						<input type="color" class="form-control form-control-color" id="color" value="#563d7c" title="Choose color" />
						<input type="number" min="2" max="10" class="form-control" id="thickness" placeholder="Thickness" />
						<input type="number" min="0" max="0.9" step="0.1" class="form-control" id="transparency" placeholder="Transparency" />
					</div>
				</div>
			</div>

			<div class="row">
				<div class="col">
					<button type="button" class="btn btn-sm btn-outline-secondary mx-1" id="delete" style="float: right;" title="Delete">
						<i class="fas fa-trash"></i>
					</button>
				</div>
			</div>
		</form>
	`;

}

function polygon_popup() {

	return `
		<form class="container-fluid" id="polygonPopup">
			<div class="row">
				<div class="col">
					<h6>Line</h6>
					<div class="input-group input-group-sm mb-3">
						<input type="color" class="form-control form-control-color" id="lineColor" value="#563d7c" title="Choose color" />
						<input type="number" min="2" max="10" class="form-control" id="lineThickness" placeholder="Thickness" />
						<input type="number" min="0" max="0.9" step="0.1" class="form-control" id="lineTransparency" placeholder="Transparency" />
					</div>
				</div>
			</div>

			<div class="row">
				<div class="col">
					<h6>Fill</h6>
					<div class="input-group input-group-sm mb-3">
						<input type="color" class="form-control form-control-color" id="fillColor" value="#563d7c" title="Choose color" />
						<input type="number" min="0" max="1" step="0.1" class="form-control" id="fillTransparency" placeholder="Transparency" />
					</div>
				</div>
			</div>

			<div class="row">
				<div class="col">
					<button type="button" class="btn btn-sm btn-outline-secondary mx-1" id="delete" style="float: right;" title="Delete">
						<i class="fas fa-trash"></i>
					</button>
				</div>
			</div>
		</form>
	`;

}



/*function init_themes() {

	let html = ``;

	for(let t of _THEMES) {
		html += `
			<div class="col">
				<div class="card ${t.style == "dark" ? "text-white" : ""} mt-2" style="background-color: ${t.primary};">
					<div class="card-header" style="background-color: ${t.secondary};">
						${t.name}
					</div>
					<div class="card-body">
						<input class="form-check-input" type="radio" name="themeRadio" id="${t.name}" ${t.name == "default" ? "checked" : ""} />
					</div>
				</div>
			</div>
		`;
	}

	$("#optionsModal #themeChoose").html(html);

}*/



function init_basemaps() {

	let html = ``;

	for(let i = 0; i < _BASEMAPS.length; i++) {
		let b = _BASEMAPS[i];
		html += `
			<div class="col">
				<div class="card mt-2">
					<div class="card-body">
						<h6 class="card-title mb-0">${b.name}</h6>
					</div>
					<img class="card-img-bottom" id="basemaps" src="${b.preview}" alt="${b.name}" data-basemap="${i}" />
				</div>
			</div>
		`;
	}

	$("#basemapModal #basemapChoose").html(html);

}
