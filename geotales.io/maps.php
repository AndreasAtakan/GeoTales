<?php
/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@geotales.io>, January 2022                  *
*******************************************************************************/

ini_set('display_errors', 'On'); ini_set('html_errors', 0); error_reporting(-1);

//session_set_cookie_params(['SameSite' => 'None', 'Secure' => true]);
session_start();

include "api/init.php";
include_once("api/helper.php");

// Not logged in
if(!isset($_SESSION['user_id']) || !validUserID($PDO, $_SESSION['user_id'])) {
	header("location: signin.php?return_url=maps.php"); exit;
}
$user_id = $_SESSION['user_id'];
$username = getUsername($PDO, $user_id);
$photo = getUserPhoto($PDO, $user_id);

$search = "%";
if(isset($_GET['search'])) { $search .= "{$_GET['search']}%"; }

$stmt = $PDO->prepare("
	SELECT
		M.id AS id,
		M.title AS title,
		M.description AS description,
		M.created_date AS created_date,
		M.thumbnail AS thumbnail
	FROM
		\"User_Map\" AS UM INNER JOIN
		\"Map\" AS M
			ON UM.map_id = M.id
	WHERE
		UM.status IN ('owner', 'editor') AND
		UM.user_id = ? AND
		LOWER(M.title) LIKE LOWER(?)
	ORDER BY
		M.created_date DESC
");
$stmt->execute([$user_id, $search]);
$rows = $stmt->fetchAll();
$count = $stmt->rowCount();

?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta http-equiv="x-ua-compatible" content="ie=edge" />
		<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, shrink-to-fit=no, target-densitydpi=device-dpi" />

		<title>GeoTales – Map stories</title>
		<meta name="title" content="GeoTales" />
		<meta name="description" content="Map stories" />

		<link rel="icon" href="assets/logo.png" />

		<!-- Load lib/ CSS -->
		<link rel="stylesheet" href="lib/fontawesome/css/all.min.css" />
		<link rel="stylesheet" href="lib/jquery-ui/jquery-ui.min.css" />
		<link rel="stylesheet" href="lib/bootstrap/css/bootstrap.min.css" />

		<!-- Load src/ CSS -->
		<link rel="stylesheet" href="main.css" />

		<style type="text/css">
			html, body {
				/**/
			}

			main {
				margin-top: calc(3rem + 50px);
			}
		</style>
	</head>
	<body>

		<!-- New map modal -->
		<div class="modal fade" id="newModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" tabindex="-1" aria-labelledby="newModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-scrollable modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="newModalLabel">New</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<div class="container-fluid">
							<div class="row mb-3">
								<div class="col">
									<label for="titleInput" class="form-label">Title</label>
									<input type="text" class="form-control" id="titleInput" aria-describedby="titleHelp" maxlength="65" />
									<div id="titleHelp" class="form-text">Max 65 characters</div>
								</div>
							</div>

							<div class="row mb-3">
								<div class="col">
									<label for="descriptionInput" class="form-label">Description</label>
									<textarea class="form-control" id="descriptionInput" rows="5"></textarea>
								</div>
							</div>

							<div class="row mb-3">
								<div class="col">
									<label for="passwordInput" class="form-label">Password</label>
									<input type="text" class="form-control" id="passwordInput" aria-describedby="passwordHelp" />
									<div id="passwordHelp" class="form-text">Will be required when viewing the GeoTale</div>
								</div>
								<div class="col">
									<label for="thumbnailInput" class="form-label">Thumbnail</label>
									<input type="file" class="form-control form-control-sm" id="thumbnailInput" accept="image/gif, image/jpeg, image/png, image/webp" />
								</div>
							</div>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
						<button type="button" class="btn btn-primary" id="create">Create</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Edit map modal -->
		<div class="modal fade" id="editModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-scrollable modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="editModalLabel">Options</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<div class="container-fluid">
							<div class="row mb-3">
								<div class="col">
									<label for="titleInput" class="form-label">Title</label>
									<input type="text" class="form-control" id="titleInput" aria-describedby="titleHelp" maxlength="65" placeholder="Loading..." disabled />
									<div id="titleHelp" class="form-text">Max 65 characters</div>
								</div>
							</div>

							<div class="row mb-3">
								<div class="col">
									<label for="descriptionInput" class="form-label">Description</label>
									<textarea class="form-control" id="descriptionInput" rows="5" placeholder="Loading..." disabled></textarea>
								</div>
							</div>

							<div class="row mb-3">
								<div class="col">
									<label for="passwordInput" class="form-label">Password</label>
									<input type="text" class="form-control" id="passwordInput" aria-describedby="passwordHelp" disabled />
									<div id="passwordHelp" class="form-text">Will be required when viewing the GeoTale</div>
								</div>
								<div class="col">
									<label for="thumbnailInput" class="form-label">Thumbnail</label>
									<input type="file" class="form-control form-control-sm" id="thumbnailInput" accept="image/gif, image/jpeg, image/png, image/webp" disabled />
								</div>
							</div>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
						<button type="button" class="btn btn-primary" id="save" data-id="" disabled>Save changes</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Share modal -->
		<div class="modal fade" id="shareModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" tabindex="-1" aria-labelledby="shareModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-scrollable modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="shareModalLabel">Share</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<div class="container-fluid">
							<div class="row mb-1">
								<div class="col">
									<div class="input-group input-group-lg">
										<input type="text" class="form-control" id="linkInput" aria-label="linkInput" aria-describedby="copyLink" readonly />
										<button class="btn btn-outline-secondary" type="button" id="copyLink" title="Copy to clipboard"><i class="fas fa-copy"></i></button>
									</div>
								</div>
							</div>

							<div class="row">
								<div class="col">
									<div class="input-group input-group-sm">
										<input type="text" class="form-control" id="embedInput" aria-label="embedInput" aria-describedby="copyEmbed" readonly />
										<button class="btn btn-outline-secondary" type="button" id="copyEmbed" title="Copy to clipboard"><i class="fas fa-copy"></i></button>
									</div>
								</div>
							</div>

							<div class="row my-3">
								<hr />
							</div>

							<div class="row">
								<div class="col-sm-7">
									<button type="button" class="btn btn-sm btn-outline-secondary" id="publish" title="Will make your GeoTale visible to other users" data-id="">Publish</button>
								</div>
								<div class="col-sm-1">
									<a role="button" class="btn btn-outline-light" href="#" id="facebook" target="_blank"><i class="fab fa-facebook" style="color: #4267B2;"></i></a>
								</div>
								<div class="col-sm-1">
									<a role="button" class="btn btn-outline-light" href="#" id="twitter" target="_blank"><i class="fab fa-twitter" style="color: #1DA1F2;"></i></a>
								</div>
								<div class="col-sm-1">
									<a role="button" class="btn btn-outline-light" href="#" id="linkedin" target="_blank"><i class="fab fa-linkedin" style="color: #0072b1;"></i></a>
								</div>
								<div class="col-sm-1">
									<a role="button" class="btn btn-outline-light" href="#" id="pinterest" target="_blank"><i class="fab fa-pinterest" style="color: #E60023;"></i></a>
								</div>
								<div class="col-sm-1">
									<a role="button" class="btn btn-outline-light" href="#" id="email"><i class="fas fa-envelope" style="color: grey;"></i></a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Delete modal -->
		<div class="modal fade" id="deleteModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-scrollable modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="deleteModalLabel">Delete GeoTale</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<p>Are you sure you want to delete? This can not be undone.</p>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
						<button type="button" class="btn btn-danger" id="deleteConfirm" data-id="">Delete</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Loading modal -->
		<div class="modal fade" id="loadingModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" tabindex="-1" aria-labelledby="loadingModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-scrollable modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="loadingModalLabel">Loading</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<div class="spinner-border text-primary" role="status">
							<span class="visually-hidden">Loading...</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Error modal -->
		<div class="modal fade" id="errorModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" tabindex="-1" aria-labelledby="errorModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-scrollable modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="errorModalLabel">Error</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<p>Something went wrong. Please try again.</p>
					</div>
				</div>
			</div>
		</div>



		<header>
			<nav class="navbar navbar-expand-sm navbar-dark fixed-top shadow px-2 px-sm-3 py-1" style="background-color: #eba937;">
				<div class="container">
					<a class="navbar-brand" href="index.php">
						<img src="assets/logo.png" alt="GeoTales" width="auto" height="30" />
						GeoTales
					</a>

					<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
						<span class="navbar-toggler-icon"></span>
					</button>

					<div class="collapse navbar-collapse" id="navbarContent">
						<ul class="navbar-nav mb-2 mb-sm-0 px-2 px-sm-0 w-100">
							<li class="nav-item">
								<a class="nav-link" href="index.php">
									<i class="fas fa-home"></i> Home
								</a>
							</li>
							<li class="nav-item me-sm-auto">
								<a class="nav-link" href="pricing.php">
									<i class="fas fa-tag"></i> Pricing
								</a>
							</li>

							<li class="nav-item me-sm-2">
								<a class="nav-link active" aria-current="page" href="maps.php">
									<i class="fas fa-map"></i> My GeoTales
								</a>
							</li>

							<li class="nav-item dropdown">
								<a class="nav-link dropdown-toggle" href="#" id="navbarUserDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
									<img class="rounded" src="<?php echo $photo; ?>" alt="&nbsp;" width="auto" height="25" />
								</a>
								<ul class="dropdown-menu dropdown-menu-sm-end" aria-labelledby="navbarUserDropdown">
									<li><a class="dropdown-item" href="profile.php">Profile</a></li>
									<li><hr class="dropdown-divider"></li>
									<li><a class="dropdown-item" href="signout.php">Sign out</a></li>
								</ul>
							</li>
						</ul>
					</div>
				</div>
			</nav>
		</header>

		<main role="main">
			<div class="container" id="main">
				<div class="row my-5">
					<div class="col">
						<hr />
					</div>
				</div>

				<div class="row">
					<div class="col">
						<form method="get">
							<div class="row mb-2">
								<div class="col-sm-3 order-sm-2 mb-4 mb-sm-0">
									<button type="button" class="btn btn-primary float-sm-end mt-2 mt-sm-0" data-bs-toggle="modal" data-bs-target="#newModal">New GeoTale</button>
								</div>
								<div class="col-sm-9 order-sm-1">
									<div class="input-group d-inline-flex" style="max-width: 650px;">
										<a role="button" class="btn btn-outline-secondary" href="maps.php" title="Clear search"><i class="fas fa-minus"></i></a>
										<input type="text" class="form-control" name="search" placeholder="Search title" aria-label="search" aria-describedby="search-button" />
										<button type="submit" class="btn btn-secondary" id="search-button">Search</button>
									</div>
								</div>
							</div>
						</form>
					</div>
				</div>

				<div class="row my-4">
					<div class="col"></div>
				</div>

				<div class="row">
					<div class="col">
						<div class="table-responsive" style="min-height: 300px;">
							<table class="table table-striped table-hover">
						<?php
							if($count > 0) {
						?>
								<caption>Your GeoTales</caption>
								<thead>
									<tr>
										<th scope="col">#</th>
										<th scope="col"></th>
										<th scope="col"></th>
										<th scope="col"></th>
										<th scope="col"></th>
										<th scope="col"></th>
									</tr>
								</thead>
								<tbody>
						<?php
								foreach($rows as $row) {
									$created_date = date_format(date_create($row['created_date']), "d.M Y, H:i");
						?>
									<tr>
										<th style="width: 8.33%;" scope="row">
											<img class="img-fluid" src="<?php echo $row['thumbnail']; ?>" alt="#" />
										</th>
										<td style="width: 16.66%;"><?php echo $row['title']; ?></td>
										<td style="width: 25%; max-width: 65px;" class="text-truncate"><?php echo $row['description']; ?></td>
										<td style="width: 16.66%;"><?php echo $created_date; ?></td>
										<td style="width: 8.33%;">
											<div class="btn-group btn-group-sm" role="group" aria-label="view-edit">
												<a role="button" class="btn btn-outline-secondary" href="edit.php?id=<?php echo $row['id']; ?>">Edit</a>
												<a role="button" class="btn btn-outline-secondary" href="pres.php?id=<?php echo $row['id']; ?>" target="_blank">View</a>
											</div>
										</td>
										<td style="width: 8.33%;">
											<div class="dropdown float-end">
												<button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="optionsDropdown<?php echo $row['id']; ?>" data-bs-toggle="dropdown" aria-expanded="false">
													<i class="fas fa-ellipsis-v"></i>
												</button>
												<ul class="dropdown-menu dropdown-menu-end" aria-labelledby="optionsDropdown<?php echo $row['id']; ?>" style="min-width: 0;">
													<li><button type="button" class="dropdown-item" id="edit" data-id="<?php echo $row['id']; ?>"><i class="fas fa-pen"></i></button></li>
													<li><button type="button" class="dropdown-item" id="share" data-id="<?php echo $row['id']; ?>"><i class="fas fa-share-alt"></i></button></li>
													<li><hr class="dropdown-divider"></li>
													<li><button type="button" class="dropdown-item" id="delete" data-id="<?php echo $row['id']; ?>"><i class="fas fa-trash"></i></button></li>
												</ul>
											</div>
										</td>
									</tr>
						<?php } ?>
								</tbody>
						<?php }else{ ?>
								<caption>No GeoTales found</caption>
						<?php } ?>
							</table>
						</div>
					</div>
				</div>

				<div class="row my-5">
					<div class="col">
						<hr />
					</div>
				</div>
			</div>
		</main>

		<footer class="py-3 shadow" style="background-color: #e6e6e6;">
			<div class="container">
				<div class="row">
					<div class="col-sm-4 mt-2">
						<center>
							<div class="btn-group btn-group-lg" role="group" aria-label="Socials">
								<a role="button" class="btn btn-outline-light" href="https://www.facebook.com/Geotales-107125105285825" target="_blank">
									<i class="fab fa-facebook" style="color: #4267b2;"></i>
								</a>
								<a role="button" class="btn btn-outline-light" href="https://twitter.com/Geotales_io" target="_blank">
									<i class="fab fa-twitter" style="color: #1da1f2;"></i>
								</a>
							</div>
						</center>
					</div>
					<div class="col-sm-4 mt-2">
						<center>
							<img class="d-none d-sm-block" src="assets/logo.png" alt="GeoTales" width="auto" height="40" />
						</center>
					</div>
					<div class="col-sm-4 mt-2">
						<p class="text-muted text-center">© <?php echo date("Y"); ?> <a class="text-decoration-none" href="<?php echo $CONFIG['host']; ?>"><?php echo $CONFIG['host']; ?></a> – all rights reserved</p>
						<p class="text-muted text-center">
							<a class="text-decoration-none" href="<?php echo "mailto:{$CONFIG['email']}"; ?>"><?php echo $CONFIG['email']; ?></a>
						</p>
					</div>
				</div>
			</div>
		</footer>

		<!-- Load lib/ JS -->
		<script type="text/javascript" src="lib/fontawesome/js/all.min.js"></script>
		<!--script type="text/javascript" src="lib/jquery/jquery-3.6.0.slim.min.js"></script-->
		<script type="text/javascript" src="lib/jquery-ui/external/jquery/jquery.js"></script>
		<script type="text/javascript" src="lib/jquery-ui/jquery-ui.min.js"></script>
		<script type="text/javascript" src="lib/jquery-resizable/jquery-resizable.min.js"></script>
		<script type="text/javascript" src="lib/bootstrap/js/bootstrap.bundle.min.js"></script>
		<script type="text/javascript" src="lib/sjcl/sjcl.js"></script>

		<!-- Load src/ JS -->
		<script type="text/javascript">
			"use strict";

			window.onload = function(ev) {

				$("#newModal input#titleInput, #editModal input#titleInput").change(ev => {
					let v = $(ev.target).val();
					if(v.length > 65) { $(ev.target).val(v.substring(0, 65)); }
				});

				$("#newModal button#create").click(ev => {
					let title = $("#newModal input#titleInput").val().substring(0, 65),
						description = $("#newModal textarea#descriptionInput").val(),
						password = $("#newModal input#passwordInput").val(),
						thumbnail = $("#newModal input#thumbnailInput").prop("files")[0];
					password = password === "" ? null : sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash( password ));

					$("#newModal").modal("hide");
					$("#loadingModal").modal("show");

					let callback = ref => {
						$.ajax({
							type: "POST",
							url: "api/map.php",
							data: {
								"op": "create",
								"title": title,
								"description": description,
								"thumbnail": ref,
								"password": password
							},
							dataType: "json",
							success: function(result, status, xhr) {
								window.location.assign(`edit.php?id=${result.id}`);
							},
							error: function(xhr, status, error) {
								console.log(xhr.status, error);

								if(xhr.status == 401) { window.location.assign("profile.php"); }
								else{ setTimeout(function() { $("#loadingModal").modal("hide"); $("#errorModal").modal("show"); }, 750); }
							}
						});
					};

					if(thumbnail) {
						let data = new FormData();
						data.append("op", "create");
						data.append("type", "thumbnail");
						data.append("image", thumbnail);

						$.ajax({
							type: "POST",
							url: "api/upload.php",
							data: data,
							contentType: false,
							processData: false,
							success: function(result, status, xhr) {
								callback(result);
								setTimeout(function() { $("#loadingModal").modal("hide"); }, 750);
							},
							error: function(xhr, status, error) {
								console.error(xhr.status, error);
								setTimeout(function() { $("#loadingModal").modal("hide"); $("#errorModal").modal("show"); }, 750);
							}
						});
					}else{ callback(null); }
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
							$("#editModal input#passwordInput").val(null);

							$("#editModal input#titleInput, #editModal textarea#descriptionInput, #editModal input#thumbnailInput, #editModal input#passwordInput, #editModal button#save").prop("disabled", false);
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
						description = $("#editModal textarea#descriptionInput").val(),
						password = $("#editModal input#passwordInput").val(),
						thumbnail = $("#editModal input#thumbnailInput").prop("files")[0];
					password = password === "" ? null : sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash( password ));

					$("#editModal").modal("hide");
					$("#loadingModal").modal("show");

					let callback = ref => {
						$.ajax({
							type: "POST",
							url: "api/map.php",
							data: {
								"op": "update",
								"id": id,
								"title": title,
								"description": description,
								"thumbnail": ref,
								"password": password
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
					};

					if(thumbnail) {
						let data = new FormData();
						data.append("op", "create");
						data.append("type", "thumbnail");
						data.append("image", thumbnail);

						$.ajax({
							type: "POST",
							url: "api/upload.php",
							data: data,
							contentType: false,
							processData: false,
							success: function(result, status, xhr) {
								callback(result);
								setTimeout(function() { $("#loadingModal").modal("hide"); }, 750);
							},
							error: function(xhr, status, error) {
								console.error(xhr.status, error);
								setTimeout(function() { $("#loadingModal").modal("hide"); $("#errorModal").modal("show"); }, 750);
							}
						});
					}else{ callback(null); }
				});

				$("#shareModal button#copyLink").click(ev => {  navigator.clipboard.writeText( $("#shareModal input#linkInput").val() ); });
				$("#shareModal button#copyEmbed").click(ev => {  navigator.clipboard.writeText( $("#shareModal input#embedInput").val() ); });
				$("button#share").click(ev => {
					let id = $(ev.target).data("id") || $(ev.target).parents("button").data("id");
					const host = window.location.host;

					$("#shareModal").modal("show");

					$("#shareModal input#linkInput").val(`https://${host}/pres.php?id=${id}`);
					$("#shareModal input#embedInput").val(`<iframe src="https://${host}/pres.php?id=${id}" width="100%" height="450" allowfullscreen="true" style="border:none !important;"></iframe>`);
					$("#shareModal a#facebook").prop("href", `https://www.facebook.com/sharer/sharer.php?u=https://${host}/pres.php?id=${id}`);
					$("#shareModal a#twitter").prop("href", `https://twitter.com/intent/tweet?url=https://${host}/pres.php?id=${id}&text=`);
					$("#shareModal a#linkedin").prop("href", `https://www.linkedin.com/shareArticle?mini=true&url=https://${host}/pres.php?id=${id}`);
					$("#shareModal a#pinterest").prop("href", `https://pinterest.com/pin/create/button/?url=https://${host}/pres.php?id=${id}&media=&description=`);
					$("#shareModal a#email").prop("href", `mailto:?&subject=&cc=&bcc=&body=https://${host}/pres.php?id=${id}%0A`);
					$("#shareModal button#publish").data("id", id);

					$.ajax({
						type: "GET",
						url: "api/map.php",
						data: {
							"op": "get",
							"id": id
						},
						dataType: "json",
						success: function(result, status, xhr) {
							$("#shareModal button#publish").html(result.published ? "Unpublish" : "Publish");
							$("#shareModal button#publish").prop("title", result.published ? "GeoTale no longer visible to other users" : "Will make your GeoTale visible to other users");
						},
						error: function(xhr, status, error) {
							console.log(xhr.status, error);
							setTimeout(function() { $("#editModal").modal("hide"); $("#errorModal").modal("show"); }, 750);
						}
					});
				});
				$("#shareModal button#publish").click(ev => {
					let id = $(ev.target).data("id");
					$.ajax({
						type: "POST",
						url: "api/map.php",
						data: {
							"op": "republish",
							"id": id
						},
						dataType: "json",
						success: function(result, status, xhr) {
							$("#shareModal button#publish").html(result.published ? "Unpublish" : "Publish");
							$("#shareModal button#publish").prop("title", result.published ? "GeoTale no longer visible to other users" : "Will make your GeoTale visible to other users");
						},
						error: function(xhr, status, error) {
							console.log(xhr.status, error);
							setTimeout(function() { $("#editModal").modal("hide"); $("#errorModal").modal("show"); }, 750);
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
		</script>

	</body>
</html>
