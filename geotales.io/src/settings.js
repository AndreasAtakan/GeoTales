/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@geotales.io>, January 2022                  *
*******************************************************************************/

"use strict";


window.onload = function(ev) {

	$("button#addPayment").click(ev => {
		$("#loadingModal").modal("show");

		$.ajax({
			type: "POST",
			url: "api/payment.php",
			data: {
				"op": "create_checkout_session"
			},
			dataType: "json",
			success: function(result, status, xhr) {
				window.location.assign(result.url);
			},
			error: function(xhr, status, error) {
				console.log(xhr.status, error);
				setTimeout(function() { $("#loadingModal").modal("hide"); $("#errorModal").modal("show"); }, 750);
			}
		});
	});

	$("button#managePayment").click(ev => {
		$("#loadingModal").modal("show");

		$.ajax({
			type: "POST",
			url: "api/payment.php",
			data: {
				"op": "create_portal_session"
			},
			dataType: "json",
			success: function(result, status, xhr) {
				window.location.assign(result.url);
			},
			error: function(xhr, status, error) {
				console.log(xhr.status, error);
				setTimeout(function() { $("#loadingModal").modal("hide"); $("#errorModal").modal("show"); }, 750);
			}
		});
	});

};
