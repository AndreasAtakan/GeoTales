/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Can Atakan <aca@tellusmap.com>, January 2022              *
*******************************************************************************/

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
