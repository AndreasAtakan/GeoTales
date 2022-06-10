/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

"use strict";


function init() {

	$("div#main").append(`
		<div class="card" id="bookmarks">
			<div class="card-body p-0">
				<div class="dropdown">
					<button class="btn btn-sm btn-light dropdown-toggle" type="button" id="bookmarksDropdown" data-bs-toggle="dropdown" aria-expanded="false">
						<i class="fas fa-bookmark"></i>
					</button>
					<ul class="dropdown-menu" aria-labelledby="bookmarksDropdown">
						<li><h6 class="dropdown-header">Bookmarks</h6></li>
					</ul>
				</div>
			</div>
		</div>
	`);

}

function new_textbox(id) {
	$("div#main").append(`
		<div class="card" id="textbox" data-id="${id}">
			<div class="card-body">
				<div id="content"></div>
			</div>
		</div>
	`);
}

function reset() {

	$("div#bookmarks").remove();

}
