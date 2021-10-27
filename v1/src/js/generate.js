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

				<div id="sceneContainer"></div>

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
						Click to capture current scene
					</p>
				</center>
			</div>
		</div>
	`);

}

function add_scene(id) {

	$("div#sceneContainer").append(`
		<div class="row gx-0" data-sceneid="${id}">
			<div class="col">
				<div class="card m-2" style="border-color: rgba(0,0,0,.4);">
					<div class="card-body">
						<form class="container-fluid">
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
											<span id="recapture" title="Recapture scene">
												<i class="fas fa-expand"></i>
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
											<input type="text" class="form-control" id="titleInput" placeholder="Title" />
										</div>
									</div>
									<div class="row mb-3">
										<div class="col">
											<input type="datetime-local" class="form-control form-control-sm" id="timeInput" step="1" style="width: auto;" />
										</div>
									</div>
									<div class="row mb-3">
										<div class="col">
											<div class="form-text" id="mediaHelp">Choose one or more media files</div>
											<input type="file" class="form-control form-control-sm" id="mediaInput" aria-describedby="mediaHelp" multiple />
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
					</div>
				</div>
			</div>
		</div>
	`);

}



function marker_popup() {

	return `
		<div class="container-fluid">
			<div class="row">
				<div class="col">
					icon
				</div>
			</div>

			<div class="row">
				<div class="col">
					border
				</div>
			</div>
		</div>
	`;

}

function polyline_popup() {

	/*
	<div class="input-group mb-3">
		<input type="color" class="form-control form-control-color" id="frameColorInput" value="#563d7c" title="Choose color" />
		<input type="number" min="1" max="10" class="form-control" id="frameThicknessInput" placeholder="Thickness" />
	</div>
	*/

	return `
		<div class="container-fluid">
			<div class="row">
				<div class="col">
					color
				</div>
			</div>

			<div class="row">
				<div class="col">
					thickness
				</div>
			</div>

			<div class="row">
				<div class="col">
					transparency
				</div>
			</div>
		</div>
	`;

}

function polygon_popup() {

	return `
		<div class="container-fluid">
			<div class="row">
				<div class="col">
					line color
				</div>
			</div>

			<div class="row">
				<div class="col">
					line thickness
				</div>
			</div>

			<div class="row">
				<div class="col">
					line transparency
				</div>
			</div>

			<div class="row">
				<div class="col">
					fill color
				</div>
			</div>

			<div class="row">
				<div class="col">
					fill thickness
				</div>
			</div>

			<div class="row">
				<div class="col">
					fill transparency
				</div>
			</div>
		</div>
	`;

}
