/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@geotales.io>, January 2022                  *
*******************************************************************************/

"use strict";


window.onload = function(ev) {

	$("#newModal button#create").click(ev => {
		let title = $("#newModal input#titleInput").val().substring(0, 65),
			description = $("#newModal textarea#descriptionInput").val();

		$("#newModal").modal("hide");
		$("#loadingModal").modal("show");

		$.ajax({
			type: "POST",
			url: "api/map.php",
			data: {
				"op": "create",
				"title": title,
				"description": description
			},
			dataType: "json",
			success: function(result, status, xhr) {
				window.location.assign(`edit.php?id=${result.id}`);
			},
			error: function(xhr, status, error) {
				console.log(xhr.status, error);
				setTimeout(function() { $("#loadingModal").modal("hide"); $("#errorModal").modal("show"); }, 750);
			}
		});
	});

	$("button#edit").click(ev => {
		let id = $(ev.target).data("id") || $(ev.target).parents("button").data("id");
		$("#editModal").modal("show");

		$.ajax({
			type: "GET",
			url: "api/map.php",
			data: {
				"op": "get",
				"id": id
			},
			dataType: "json",
			success: function(result, status, xhr) {
				$("#editModal input#titleInput").val(result.title);
				$("#editModal textarea#descriptionInput").val(result.description);

				$("#editModal input#titleInput, #editModal textarea#descriptionInput, #editModal button#save").prop("disabled", false);
				$("#editModal button#save").data("id", id);
			},
			error: function(xhr, status, error) {
				console.log(xhr.status, error);
				setTimeout(function() { $("#editModal").modal("hide"); $("#errorModal").modal("show"); }, 750);
			}
		});
	});
	$("#editModal button#save").click(ev => {
		let id = $(ev.target).data("id"),
			title = $("#editModal input#titleInput").val().substring(0, 65),
			description = $("#editModal textarea#descriptionInput").val();

		$("#editModal").modal("hide");
		$("#loadingModal").modal("show");

		$.ajax({
			type: "POST",
			url: "api/map.php",
			data: {
				"op": "edit",
				"id": id,
				"title": title,
				"description": description
			},
			dataType: "json",
			success: function(result, status, xhr) {
				window.location.reload();
			},
			error: function(xhr, status, error) {
				console.log(xhr.status, error);
				setTimeout(function() { $("#loadingModal").modal("hide"); $("#errorModal").modal("show"); }, 750);
			}
		});
	});

	$("button#share").click(ev => {
		let id = $(ev.target).data("id") || $(ev.target).parents("button").data("id"),
			post = $(ev.target).data("post") || $(ev.target).parents("button").data("post");
		const host = window.location.host;

		$("#shareModal").modal("show");

		$("#shareModal input#linkInput").val(`https://${host}/pres.php?id=${id}`);
		$("#shareModal input#embedInput").val(`<iframe src="https://${host}/pres.php?id=${id}" width="100%" height="450" allowfullscreen="true" style="border:none !important;"></iframe>`);

		$("#shareModal a#publish").data("id", id);
		if(post) {
			$("#shareModal a#publish").data("published", true);
			$("#shareModal a#publish").html("Unpublish");
			$("#shareModal a#publishText").html("View map in gallery");
			$("#shareModal a#publishText").prop("href", post);
		}else{
			$("#shareModal a#publish").data("published", false);
			$("#shareModal a#publish").html("Publish map");
			$("#shareModal a#publishText").html("This will post your map to the public gallery");
			$("#shareModal a#publishText").prop("href", "#");
		}

		$("#shareModal a#facebook").prop("href", `https://www.facebook.com/sharer/sharer.php?u=https://${host}/pres.php?id=${id}`);
		$("#shareModal a#twitter").prop("href", `https://twitter.com/intent/tweet?url=https://${host}/pres.php?id=${id}&text=`);
		$("#shareModal a#linkedin").prop("href", `https://www.linkedin.com/shareArticle?mini=true&url=https://${host}/pres.php?id=${id}`);
		$("#shareModal a#pinterest").prop("href", `https://pinterest.com/pin/create/button/?url=https://${host}/pres.php?id=${id}&media=&description=`);
		$("#shareModal a#email").prop("href", `mailto:?&subject=&cc=&bcc=&body=https://${host}/pres.php?id=${id}%0A`);
	});
	$("#shareModal button#copyLink").click(ev => {  navigator.clipboard.writeText( $("#shareModal input#linkInput").val() ); });
	$("#shareModal button#copyEmbed").click(ev => {  navigator.clipboard.writeText( $("#shareModal input#embedInput").val() ); });
	$("#shareModal a#publish").click(ev => {
		let id = $(ev.target).data("id"),
			published = $(ev.target).data("published"), callback;

		$("#loadingModal").modal("show");

		if(published) {
			callback = (result) => { // unpublish
				$(ev.target).data("published", false);
				$(ev.target).html("Publish map");
				$("#shareModal a#publishText").html("This will post your map to the public gallery");
				$("#shareModal a#publishText").prop("href", "#");
			};
		}else{
			callback = (result) => { // publish
				$(ev.target).data("published", true);
				$(ev.target).html("Unpublish");
				$("#shareModal a#publishText").html("View map in gallery");
				$("#shareModal a#publishText").prop("href", result.url);
			};
		}

		$.ajax({
			type: "POST",
			url: "api/map.php",
			data: {
				"op": published ? "unpublish" : "publish",
				"id": id
			},
			dataType: "json",
			success: function(result, status, xhr) {
				callback(result);
				setTimeout(function() { $("#loadingModal").modal("hide"); }, 750);
			},
			error: function(xhr, status, error) {
				console.log(xhr.status, error);
				setTimeout(function() { $("#loadingModal").modal("hide"); $("#shareModal").modal("hide"); $("#errorModal").modal("show"); }, 750);
			}
		});
	});

	$("button#delete").click(ev => {
		let id = $(ev.target).data("id") || $(ev.target).parents("button").data("id");
		$("#deleteModal").modal("show");
		$("#deleteModal button#deleteConfirm").data("id", id);
	});
	$("#deleteModal button#deleteConfirm").click(ev => {
		let id = $(ev.target).data("id");
		$("#deleteModal").modal("hide");
		$("#loadingModal").modal("show");

		$.ajax({
			type: "POST",
			url: "api/map.php",
			data: {
				"op": "delete",
				"id": id
			},
			dataType: "json",
			success: function(result, status, xhr) {
				window.location.reload();
			},
			error: function(xhr, status, error) {
				console.log(xhr.status, error);
				setTimeout(function() { $("#loadingModal").modal("hide"); $("#errorModal").modal("show"); }, 750);
			}
		});
	});

};
