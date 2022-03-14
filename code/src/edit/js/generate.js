/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

"use strict";


function new_scene(id, prevId) {

	let cont = `
		<li class="list-group-item p-0 pt-1 mx-2 my-1" id="${id}" data-id="${id}">
			<div class="row g-0">
				<div class="col">
					<div class="input-group input-group-sm">
						<div class="input-group-text px-1" style="border-radius: 0; background-color: initial; border: none;">
							<input type="checkbox" class="form-check-input mt-0" id="chapter" value="" title="Start of chapter" aria-label="Start of chapter" />
						</div>
						<button type="button" class="btn btn-outline-light" id="reorder" title="Change ordering">
							<i class="fas fa-bars"></i>
						</button>
						<input type="text" class="form-control" id="title" aria-label="Title" />
						<button type="button" class="btn btn-outline-light" id="delete" title="Delete scene">
							<i class="fas fa-times"></i>
						</button>
					</div>
				</div>
			</div>
			<div class="row g-0">
				<div class="col">
					<span class="mx-2" id="num"></span>
				</div>
			</div>
		</li>
	`;

	if(prevId) { $(`li[data-id="${prevId}"]`).after(cont); }
	else{ $("ul#scenes").append(cont); }

}



function new_textbox(id) {

	let cont = `
		<div id="${id}" data-id="${id}">
			<div id="content"></div>
		</div>
	`;

	$("div#mapCol").append(cont);

}



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



function avatar_popup() {

	return `
		<form class="container-fluid" id="avatarPopup">
			<div class="row">
				<div class="col">
					<input type="text" class="form-control form-control-sm" id="label" aria-label="label" placeholder="Label" />
				</div>
			</div>

			<div class="row my-3">
				<div class="col">
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

			<div class="row my-3">
				<div class="col">
					<div class="input-group input-group-sm">
						<input type="color" class="form-control form-control-color" id="color" value="#563d7c" title="Choose color" />
						<input type="number" min="0" max="10" class="form-control" id="thickness" placeholder="Thickness" />
					</div>
				</div>
			</div>

			<div class="row my-3">
				<div class="col">
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
					<button type="button" class="btn btn-sm btn-outline-secondary mx-1" id="bringToFront" title="Bring to front">
						<i class="fas fa-share"></i>
					</button>
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
		<form class="container-fluid" id="shapePopup">
			<div class="row">
				<div class="col">
					<div class="input-group input-group-sm mb-3">
						<input type="color" class="form-control form-control-color" id="lineColor" value="#563d7c" title="Choose color" />
						<input type="number" min="2" max="10" class="form-control" id="lineThickness" placeholder="Thickness" />
						<input type="number" min="0" max="0.9" step="0.1" class="form-control" id="lineTransparency" placeholder="Transparency" />
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
		<form class="container-fluid" id="shapePopup">
			<div class="row">
				<div class="col">
					<div class="input-group input-group-sm mb-3">
						<input type="color" class="form-control form-control-color" id="lineColor" value="#563d7c" title="Choose color" />
						<input type="number" min="2" max="10" class="form-control" id="lineThickness" placeholder="Thickness" />
						<input type="number" min="0" max="0.9" step="0.1" class="form-control" id="lineTransparency" placeholder="Transparency" />
					</div>
				</div>
			</div>

			<div class="row">
				<div class="col">
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
