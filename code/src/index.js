/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@geotales.io>, January 2022                  *
*******************************************************************************/

"use strict";


window.onload = function(ev) {

	let form = document.forms.search;
	form.onsubmit = function(ev) {
		ev.preventDefault();
		form.elements.q.value = `#public-maps ${form.elements.none.value}`;
		form.elements.none.value = "";
		form.submit();
	};

};
