/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

"use strict";


window.onload = function(ev) {

	$("button#create").click(ev => {
		let title = $("#newModal input#titleInput").val().substring(0, 65),
			description = $("#newModal textarea#descriptionInput").val();

		$("#newModal").modal("hide");
		$("#loadingModal").modal("show");

		$.ajax({
			type: "POST",
			url: "api/project.php",
			data: {
				"op": "create",
				"title": title,
				"description": description
			},
			dataType: "json",
			success: function(result, status, xhr) {
				window.location.assign(`edit.php?pid=${result.pid}`);
			},
			error: function(xhr, status, error) {
				console.log(xhr.status);
				console.log(error);

				$("#errorModal").modal("show");
				setTimeout(function() { $("#loadingModal").modal("hide"); }, 500);
			}
		});
	});

	$("button#edit").click(ev => {
		let pid = $(ev.target).data("pid");
		$("#editModal").modal("show");

		$.ajax({
			type: "GET",
			url: "api/project.php",
			data: {
				"op": "get",
				"pid": pid
			},
			dataType: "json",
			success: function(result, status, xhr) {
				$("#editModal input#titleInput").val(result.title);
				$("#editModal textarea#descriptionInput").val(result.description);

				$("#editModal input#titleInput, #editModal textarea#descriptionInput, #editModal button#save").prop("disabled", false);
				$("#editModal button#save").data("pid", pid);
			},
			error: function(xhr, status, error) {
				console.log(xhr.status);
				console.log(error);

				$("#errorModal").modal("show");
				setTimeout(function() { $("#editModal").modal("hide"); }, 250);
			}
		});
	});
	$("button#save").click(ev => {
		let pid = $(ev.target).data("pid"),
			title = $("#editModal input#titleInput").val(),
			description = $("#editModal textarea#descriptionInput").val();

		$("#editModal").modal("hide");
		$("#loadingModal").modal("show");

		$.ajax({
			type: "POST",
			url: "api/project.php",
			data: {
				"op": "edit",
				"pid": pid,
				"title": title,
				"description": description
			},
			dataType: "json",
			success: function(result, status, xhr) {
				window.location.reload();
			},
			error: function(xhr, status, error) {
				console.log(xhr.status);
				console.log(error);

				$("#errorModal").modal("show");
				setTimeout(function() { $("#loadingModal").modal("hide"); }, 500);
			}
		});
	});

	$("button#delete").click(ev => {
		let pid = $(ev.target).data("pid");
		$("#deleteModal").modal("show");
		$("#deleteModal button#deleteConfirm").data("pid", pid);
	});
	$("button#deleteConfirm").click(ev => {
		let pid = $(ev.target).data("pid");
		$("#deleteModal").modal("hide");
		$("#loadingModal").modal("show");

		$.ajax({
			type: "POST",
			url: "api/project.php",
			data: {
				"op": "delete",
				"pid": pid
			},
			dataType: "json",
			success: function(result, status, xhr) {
				window.location.reload();
			},
			error: function(xhr, status, error) {
				console.log(xhr.status);
				console.log(error);

				$("#errorModal").modal("show");
				setTimeout(function() { $("#loadingModal").modal("hide"); }, 500);
			}
		});
	});

	$("button#publish").click(ev => {
		let pid = $(ev.target).data("pid");
		$("#loadingModal").modal("show");

		$.ajax({
			type: "POST",
			url: "api/project.php",
			data: {
				"op": "publish",
				"pid": pid
			},
			dataType: "json",
			success: function(result, status, xhr) {
				$(ev.target).prop("disabled", true);
				setTimeout(function() { $("#loadingModal").modal("hide"); }, 500);

				window.open(result.url, "_blank");
			},
			error: function(xhr, status, error) {
				console.log(xhr.status);
				console.log(error);

				$("#errorModal").modal("show");
				setTimeout(function() { $("#loadingModal").modal("hide"); }, 500);
			}
		});
	});

};
