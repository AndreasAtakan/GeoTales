/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

"use strict";


function init_scene() {

	$("div#col").append(`
		<div class="card" id="scene" data-sceneid="">
			<div class="card-body">
				<h6 class="card-subtitle my-2 text-muted" id="datetime"></h6>
				<div id="content"></div>
			</div>
		</div>
	`);

}

function reset_scene() {

	$("div#scene").remove();

}
