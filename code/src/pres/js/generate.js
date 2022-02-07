/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

"use strict";


function init_section() {

	$("div#main").append(`
		<div class="card" id="chapters">
			<div class="card-body p-0">
				<div class="dropdown">
					<button class="btn btn-sm btn-light dropdown-toggle" type="button" id="chaptersDropdown" data-bs-toggle="dropdown" aria-expanded="false">
						<i class="fas fa-paragraph"></i>
					</button>
					<ul class="dropdown-menu" aria-labelledby="chaptersDropdown">
						<li><h6 class="dropdown-header">Chapters</h6></li>
					</ul>
				</div>
			</div>
		</div>
	`);

	$("div#main").append(`
		<div class="card" id="section">
			<div class="card-body">
				<h6 class="card-subtitle my-2 text-muted" id="datetime">
					<span id="time">
						<span id="hour"></span>:<span id="minute"></span>:<span id="second"></span>
					</span>
					<span id="dateNtime">–</span>
					<span id="date">
						<span id="day"></span>/<span id="month"></span>/<span id="year"></span>
					</span>
					<span id="period"></span>
				</h6>
				<div id="content"></div>
			</div>
		</div>
	`);

}

function reset_section() {

	$("div#chapters").remove();
	$("div#section").remove();

}
