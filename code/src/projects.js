/*©agpl*************************************************************************
*                                                                              *
* TellUs                                                                       *
* Copyright (C) 2021  TellUs AS                                                *
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
				setTimeout(function() { $("#loadingModal").modal("hide"); }, 500);

				window.location.assign(`edit.php?pid=${result.pid}`);
			},
			error: function(xhr, status, error) {
				console.log(xhr.status);
				console.log(error);

				setTimeout(function() { $("#loadingModal").modal("hide"); }, 500);
				$("#errorModal").modal("show");
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

				setTimeout(function() { $("#editModal").modal("hide"); }, 250);
				$("#errorModal").modal("show");
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
				//$("#editModal input#titleInput, #editModal textarea#descriptionInput, #editModal button#save").prop("disabled", true);
				//$("#editModal input#titleInput, #editModal textarea#descriptionInput").val("");
				//$("#editModal button#save").data("pid", "");

				//setTimeout(function() { $("#loadingModal").modal("hide"); }, 500);
				window.location.reload();
			},
			error: function(xhr, status, error) {
				console.log(xhr.status);
				console.log(error);

				setTimeout(function() { $("#loadingModal").modal("hide"); }, 500);
				$("#errorModal").modal("show");
			}
		});
	});

	$("button#delete").click(ev => {
		let pid = $(ev.target).data("pid");
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
				//setTimeout(function() { $("#loadingModal").modal("hide"); }, 500);
				window.location.reload();
			},
			error: function(xhr, status, error) {
				console.log(xhr.status);
				console.log(error);

				setTimeout(function() { $("#loadingModal").modal("hide"); }, 500);
				$("#errorModal").modal("show");
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
				setTimeout(function() { $("#loadingModal").modal("hide"); }, 500);

				$(ev.target).prop("disabled", true);
				window.open(result.url, "_blank");
			},
			error: function(xhr, status, error) {
				console.log(xhr.status);
				console.log(error);

				setTimeout(function() { $("#loadingModal").modal("hide"); }, 500);
				$("#errorModal").modal("show");
			}
		});
	});

};
