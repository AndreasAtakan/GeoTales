/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

"use strict";


window.onload = function(ev) {

	let form = document.forms.search;
	form.onsubmit = function(ev) {
		ev.preventDefault();

		let val = `#public-maps ${form.elements.q.value}`;
		form.elements.q.value = val;

		form.submit();
	};

};
