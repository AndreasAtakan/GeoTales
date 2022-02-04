/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

"use strict";


function init_section() {

	$("#sectionCol").html(`
		<div class="row align-items-center g-0 h-100">
			<div class="col">
				<div class="row gx-0 mx-2" id="topPadSection">
					<div class="col">
						<hr />
					</div>
				</div>

				<div class="row mx-2">
					<div class="col">
						<ul class="list-group" id="section"></ul>
					</div>
				</div>

				<div class="row gx-0 mx-2" id="bottomPadSection">
					<div class="col">
						<hr />
					</div>
				</div>
			</div>
		</div>
	`);

}

function reset_section() {

	$("#sectionCol").html(`
		<div class="row align-items-center h-100 g-0">
			<div class="col text-center">
				<button type="button" class="btn btn-outline-secondary px-5" id="add">
					<strong>+</strong>
				</button>

				<p class="text-muted mt-3">Click to capture scene</p>
			</div>
		</div>
	`);

}

function prepare_section(prevId) {

	$(`li[data-id="${prevId}"]`).after(`
		<li class="list-group-item" id="prepare">
			<div class="row g-0">
				<div class="col-5 text-center">
					<button type="button" class="btn btn-sm btn-outline-light" id="chapter" title="Add chapter">
						<i class="fas fa-paragraph"></i>
					</button>
					<p class="small text-muted mb-0">Add chapter</p>
				</div>
				<div class="col-5 text-center">
					<button type="button" class="btn btn-sm btn-outline-light" id="scene" title="Capture new scene">
						<i class="fas fa-camera"></i>
					</button>
					<p class="small text-muted mb-0">New scene</p>
				</div>
				<div class="col-2 text-center">
					<button type="button" class="btn btn-sm btn-outline-light" id="cancel" title="Cancel">
						<i class="fas fa-times"></i>
					</button>
				</div>
			</div>
		</li>
	`);

}

function chapter_section(id, prevId) {

	let cont = `
		<li class="list-group-item chapter p-0" id="${id}" data-id="${id}">
			<form class="container-fluid gx-0">
				<div class="row g-0 p-1">
					<div class="col">
						<div class="input-group input-group-sm">
							<button type="button" class="btn btn-outline-light" id="reorder" title="Change ordering">
								<i class="fas fa-bars"></i>
							</button>
							<input type="text" class="form-control" id="title" aria-label="Title" aria-describedby="reorder" style="z-index: 3;" />
							<button type="button" class="btn btn-outline-light" id="remove" title="Remove chapter">
								<i class="fas fa-times"></i>
							</button>
						</div>
					</div>
				</div>
			</form>
		</li>
	`;

	if(prevId) { $(`li[data-id="${prevId}"]`).after(cont); }
	else{ $("ul#section").append(cont); }

}

function scene_section(id, prevId) {

	let cont = `
		<li class="list-group-item p-0" id="${id}" data-id="${id}">
			<form class="container-fluid gx-0">
				<div class="row g-0 p-1">
					<div class="col">
						<div class="input-group input-group-sm">
							<button type="button" class="btn btn-outline-light" id="reorder" title="Change ordering">
								<i class="fas fa-bars"></i>
							</button>
							<select class="form-select pe-2" id="period" aria-label="Timeperiod" aria-describedby="reorder" style="z-index: 3; max-width: 45px; background-image: none;">
								<option value="ad" selected>AD</option>
								<option value="bc">BC</option>
							</select>
							<input type="date" class="form-control" id="date" aria-label="Date" />
							<input type="time" class="form-control" id="time" aria-label="Time" step="1" />
						</div>
					</div>
				</div>
				<div class="row g-0 my-1">
					<div class="col text-center">
						<button type="button" class="btn btn-sm btn-outline-light" id="capture" title="Recapture scene">
							<i class="fas fa-camera"></i>
						</button>
					</div>
					<div class="col text-center">
						<button type="button" class="btn btn-sm btn-outline-light" id="add" title="Add below">
							<i class="fas fa-plus"></i>
						</button>
					</div>
					<div class="col text-center">
						<button type="button" class="btn btn-sm btn-outline-light" id="delete" title="Delete scene">
							<i class="fas fa-trash"></i>
						</button>
					</div>
				</div>
			</form>
		</li>
	`;

	if(prevId) { $(`li[data-id="${prevId}"]`).after(cont); }
	else{ $("ul#section").append(cont); }

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
						<input type="file" class="form-control form-control-sm" id="icon" accept="image/gif, image/jpeg, image/png" />
						<input type="number" class="form-control" id="size" placeholder="Size" />
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
