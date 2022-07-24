<?php
/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

ini_set('display_errors', 'On'); ini_set('html_errors', 0); error_reporting(-1);

//session_set_cookie_params(['SameSite' => 'None', 'Secure' => true]);
session_start();

include "api/init.php";
include_once("api/helper.php");

// Not logged in
if(!isset($_SESSION['uid']) || !validUID($PDO, $_SESSION['uid'])) {
	header("location: login.php?return_url=maps.php"); exit;
}
$username = $_SESSION['username'];
$avatar = getAvatar($CONFIG['forum_host'], $username);


if(!isset($_GET['id'])) {
	http_response_code(422); exit;
}
$id = $_GET['id'];


$stmt = $PDO->prepare("SELECT title, description FROM \"Map\" WHERE id = ?");
$stmt->execute([$id]);
$row = $stmt->fetch();

?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta http-equiv="x-ua-compatible" content="ie=edge" />
		<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, shrink-to-fit=no, target-densitydpi=device-dpi" />

		<title>GeoTales – <?php echo $row['title']; ?></title>
		<meta name="title" content="GeoTales – <?php echo $row['title']; ?>" />
		<meta name="description" content="<?php echo $row['description']; ?>" />

		<link rel="icon" href="assets/logo.png" />

		<!-- Load lib/ CSS -->
		<link rel="stylesheet" href="lib/fontawesome/css/all.min.css" />
		<link rel="stylesheet" href="lib/jquery-ui/jquery-ui.min.css" />
		<link rel="stylesheet" href="lib/bootstrap/css/bootstrap.min.css" />
		<link rel="stylesheet" href="lib/leaflet/leaflet.css" />
		<!--link rel="stylesheet" href="lib/leaflet.fullscreen/leaflet.fullscreen.css" /-->
		<link rel="stylesheet" href="lib/leaflet.zoomhome/leaflet.zoomhome.css" />
		<!--link rel="stylesheet" href="lib/leaflet.locatecontrol/L.Control.Locate.min.css" /-->
		<!--link rel="stylesheet" href="lib/leaflet.draw/leaflet.draw.css" /-->
		<link rel="stylesheet" href="lib/leaflet.geoman/leaflet-geoman.css" />
		<link rel="stylesheet" href="lib/leaflet.easybutton/easy-button.css" />
		<!--link rel="stylesheet" href="lib/leaflet.htmllegend/L.Control.HtmlLegend.css" /-->
		<link rel="stylesheet" href="lib/leaflet.contextmenu/leaflet.contextmenu.min.css" />
		<!--link rel="stylesheet" href="lib/leaflet.centercontrol/leaflet-control-topcenter.css" /-->
		<!--link rel="stylesheet" href="lib/prism/prism.css" /-->
		<link rel="stylesheet" href="lib/trumbowyg/ui/trumbowyg.min.css" />
		<link rel="stylesheet" href="lib/trumbowyg/plugins/colors/ui/trumbowyg.colors.min.css" />
		<!--link rel="stylesheet" href="lib/trumbowyg/plugins/highlight/ui/trumbowyg.highlight.min.css" /-->
		<link rel="stylesheet" href="lib/trumbowyg/plugins/specialchars/ui/trumbowyg.specialchars.min.css" />
		<link rel="stylesheet" href="lib/trumbowyg/plugins/table/ui/trumbowyg.table.min.css" />

		<!-- Load src/ CSS -->
		<link rel="stylesheet" href="src/edit/css/main.css" />
	</head>
	<body>

		<!-- Project import -->
		<input type="file" class="form-control" id="projectFileInput" style="display: none;" />

		<!-- GeoJSON import modal -->
		<div class="modal fade" id="geojsonImportModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" tabindex="-1" aria-labelledby="geojsonImportModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-scrollable modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="geojsonImportModalLabel">Import GeoJSON</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<div class="container-fluid">
							<div class="row">
								<div class="col col-md-10">
									<label for="fileInput" class="form-label">Choose GeoJSON-file</label>
									<input type="file" class="form-control form-control-sm" id="fileInput" accept="application/json,.json,application/geo+json,.geojson" />
								</div>
							</div>
							<div class="row mt-3">
								<div class="col col-md-10">
									<label for="lineThickness" class="form-label">Line options</label>
									<div class="input-group input-group-sm">
										<input type="color" class="form-control form-control-color" id="lineColor" value="#563d7c" title="Choose color" />
										<input type="number" min="2" max="10" class="form-control" id="lineThickness" placeholder="Thickness" />
										<input type="number" min="0" max="0.9" step="0.1" class="form-control" id="lineTransparency" placeholder="Transparency" />
									</div>
								</div>
							</div>
							<div class="row mt-3">
								<div class="col col-md-10">
									<label for="fillTransparency" class="form-label">Fill options</label>
									<div class="input-group input-group-sm">
										<input type="color" class="form-control form-control-color" id="fillColor" value="#563d7c" title="Choose color" />
										<input type="number" min="0" max="1" step="0.1" class="form-control" id="fillTransparency" placeholder="Transparency" />
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
						<button type="button" class="btn btn-secondary" id="import">Import</button>
					</div>
				</div>
			</div>
		</div>

		<!-- GEDCOM import modal -->
		<div class="modal fade" id="gedcomImportModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" tabindex="-1" aria-labelledby="gedcomImportModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-scrollable modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="gedcomImportModalLabel">Import GEDCOM</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<div class="mb-3">
							<label for="fileInput" class="form-label">Choose GEDCOM-file</label>
							<input type="file" class="form-control form-control-sm" id="fileInput" />
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
						<button type="button" class="btn btn-secondary" id="import">Import</button>
					</div>
				</div>
			</div>
		</div>



		<!-- Options modal -->
		<div class="modal fade" id="optionsModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" tabindex="-1" aria-labelledby="optionsModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-scrollable modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="optionsModalLabel">Options</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<div class="container-fluid">
							<div class="row">
								<div class="col">
									<label for="animationSpeed" class="form-label">Default animation speed</label>
									<input type="number" class="form-control" id="animationSpeed" min="200" max="3000" value="2000" />
								</div>
								<div class="col">
									<label for="panningSpeed" class="form-label">Map panning speed</label>
									<input type="number" class="form-control" id="panningSpeed" min="500" max="4000" placeholder="auto" />
								</div>
							</div>
							<div class="row">
								<div class="col col-md-10 mt-4">
									<label for="aspectRatio" class="form-label">Map aspect ratio</label>
									<select class="form-select" id="aspectRatio" aria-label="Map aspect ratio">
										<option value="16/9" selected>16/9</option>
										<option value="4/3">4/3</option>
										<option value="9/16">9/16</option>
									</select>
								</div>
							</div>
							<!--div class="row">
								<div class="col col-md-10 mt-4">
									<label for="bookOrientation" class="form-label">Book orientation</label>
									<select class="form-select" id="bookOrientation" aria-label="Book orientation">
										<option value="left" selected>Left</option>
										<option value="right">Right</option>
									</select>
								</div>
							</div-->
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
					</div>
				</div>
			</div>
		</div>



		<!-- Basemap modal -->
		<div class="modal fade" id="basemapModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" tabindex="-1" aria-labelledby="basemapModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-scrollable modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="basemapModalLabel">Change basemap</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<div class="container-fluid">
							<div class="row my-2">
								<div class="col">
									<div class="accordion" id="basemapAccordion">
										<div class="accordion-item">
											<h2 class="accordion-header" id="basemapAccordionHeading">
												<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#basemapAccordionCollapse" aria-expanded="false" aria-controls="basemapAccordionCollapse">
													Available basemaps
												</button>
											</h2>
											<div id="basemapAccordionCollapse" class="accordion-collapse collapse" aria-labelledby="basemapAccordionHeading" data-bs-parent="#basemapAccordion">
												<div class="accordion-body">
													<div class="row row-cols-2 row-cols-md-3" id="basemapChoose"></div>
												</div>
											</div>
										  </div>
									</div>
								</div>
							</div>

							<div class="row my-4">
								<div class="col col-md-10">
									<label for="basemapFile"><small>Or use custom basemap</small></label>
									<input type="file" class="form-control form-control-sm" id="basemapFile" aria-describedby="basemapFileHelp" accept="image/gif, image/jpeg, image/png, image/webp" />
									<div id="basemapFileHelp" class="form-text">This can be any image file</div>
								</div>
							</div>

							<div class="row my-2">
								<div class="col">
									<label for="basemapLink"><small>Or link to an online basemap</small></label>
									<div class="input-group input-group-sm">
										<input type="text" class="form-control" id="basemapLink" aria-label="Url" aria-describedby="keyText" placeholder="URL" />
										<input type="text" class="form-control" id="basemapKey" aria-label="Access key" aria-describedby="keyText" placeholder="Access key (optional)" />
										<button type="button" class="btn btn-outline-secondary" id="basemapFetch">Apply</button>
									</div>
									<div id="keyText" class="form-text">XYZ-tiles or Mapbox style. Access key is required with Mapbox style</div>
								</div>
							</div>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
					</div>
				</div>
			</div>
		</div>



		<!-- Scene warning modal -->
		<div class="modal fade" id="sceneWarningModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" tabindex="-1" aria-labelledby="sceneWarningModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-scrollable modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="sceneWarningModalLabel">Delete scene</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<p>Are you sure you want to delete the current scene?</p>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
						<button type="button" class="btn btn-danger" id="delete">Delete</button>
					</div>
				</div>
			</div>
		</div>



		<!-- Textbox options modal -->
		<div class="modal fade" id="textboxOptionsModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" tabindex="-1" aria-labelledby="textboxOptionsModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-scrollable modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="textboxOptionsModalLabel">Book options</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<div class="container-fluid">
							<div class="row">
								<div class="col col-md-10">
									<label for="bookOrientation" class="form-label">Book orientation</label>
									<select class="form-select" id="bookOrientation" aria-label="Book orientation">
										<option value="left" selected>Left</option>
										<option value="right">Right</option>
									</select>
								</div>
							</div>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
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





		<div class="container-fluid p-0">
			<div class="row g-0" style="height: 39px;">
				<div class="col">
					<nav class="navbar navbar-expand-sm navbar-dark fixed-top px-2" style="background-color: #eba937; padding-top: 0.25rem; padding-bottom: 0.25rem;">
						<a class="navbar-brand py-0 mx-2" href="maps.php" style="line-height: 0;">
							<img src="assets/logo.png" alt="GeoTales" width="auto" height="20" />
						</a>

						<button class="navbar-toggler py-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
							<span class="navbar-toggler-icon"></span>
						</button>

						<div class="collapse navbar-collapse" id="navbarContent">
							<ul class="navbar-nav mb-0 px-0 w-100">
								<li class="nav-item dropdown">
									<a class="nav-link dropdown-toggle py-0" href="#" id="navbarFileDropdown" role="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
										File
									</a>
									<ul class="dropdown-menu" aria-labelledby="navbarFileDropdown" style="max-height: calc(100vh - 39px); overflow-y: visible;">
										<li class="dropend">
											<button type="button" class="dropdown-toggle dropdown-item" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
												Import
											</button>
											<ul class="dropdown-menu">
												<li><button type="button" class="dropdown-item" onclick="$('#projectFileInput').click();">Project file</button></li>
												<li><button type="button" class="dropdown-item" data-bs-toggle="modal" data-bs-target="#geojsonImportModal">GeoJSON</button></li>
												<li><button type="button" class="dropdown-item" data-bs-toggle="modal" data-bs-target="#gedcomImportModal">GEDCOM</button></li>
											</ul>
										</li>
										<li class="dropend">
											<button type="button" class="dropdown-toggle dropdown-item" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
												Export as
											</button>
											<ul class="dropdown-menu">
												<li><button type="button" class="dropdown-item" onclick="export_data('project');">Project file</button></li>
												<li><button type="button" class="dropdown-item" onclick="export_data('geojson');">GeoJSON</button></li>
											</ul>
										</li>
										<li><hr class="dropdown-divider" /></li>
										<li><a class="dropdown-item" href="#" id="save">Save</a></li>
										<li><hr class="dropdown-divider" /></li>
										<li><a class="dropdown-item" href="maps.php">Exit</a></li>
									</ul>
								</li>
								<li class="nav-item dropdown">
									<a class="nav-link dropdown-toggle py-0" href="#" id="navbarEditDropdown" role="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
										Edit
									</a>
									<ul class="dropdown-menu" aria-labelledby="navbarEditDropdown" style="max-height: calc(100vh - 39px); overflow-y: visible;">
										<li class="dropend">
											<button type="button" class="dropdown-toggle dropdown-item" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
												Scene
											</button>
											<ul class="dropdown-menu">
												<li><button type="button" class="dropdown-item" onclick="_SCENES.add();">Add new scene</button></li>
												<li><button type="button" class="dropdown-item" onclick="_SCENES.capture();">Recapture</button></li>
												<li><button type="button" class="dropdown-item" data-bs-toggle="modal" data-bs-target="#sceneWarningModal">Delete</button></li>
												<li><button type="button" class="dropdown-item" onclick="_SCENES.bookmark();">Bookmark scene</button></li>
												<li><button type="button" class="dropdown-item" onclick="">Copy scene position</button></li>
												<li><button type="button" class="dropdown-item" onclick="">Paste scene position</button></li>
											</ul>
										</li>
										<li class="dropend">
											<button type="button" class="dropdown-toggle dropdown-item" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
												Book
											</button>
											<ul class="dropdown-menu">
												<li><button type="button" class="dropdown-item" onclick="_TEXTBOXES.add();">Add book</button></li>
												<li><button type="button" class="dropdown-item" onclick="_TEXTBOXES.setLock(true);">Lock</button></li>
												<li><button type="button" class="dropdown-item" onclick="_TEXTBOXES.setLock(false);">Unlock</button></li>
												<li><button type="button" class="dropdown-item" onclick="_TEXTBOXES.delete(_SCENES.active);">Remove</button></li>
												<li class="dropend">
													<button type="button" class="dropdown-toggle dropdown-item" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
														Set orientation
													</button>
													<ul class="dropdown-menu">
														<li><button type="button" class="dropdown-item" onclick="_TEXTBOXES.setOrientation('left');">Left</button></li>
														<li><button type="button" class="dropdown-item" onclick="_TEXTBOXES.setOrientation('right');">Right</button></li>
													</ul>
												</li>
											</ul>
										</li>
										<li class="dropend">
											<button type="button" class="dropdown-toggle dropdown-item" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
												Map
											</button>
											<ul class="dropdown-menu">
												<li><button type="button" class="dropdown-item" data-bs-toggle="modal" data-bs-target="#basemapModal">Change basemap</button></li>
												<li class="dropend">
													<button type="button" class="dropdown-toggle dropdown-item" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
														Set aspect ratio
													</button>
													<ul class="dropdown-menu">
														<li><button type="button" class="dropdown-item" onclick="_MAP.setAspectRatio(16/9);">16/9</button></li>
														<li><button type="button" class="dropdown-item" onclick="_MAP.setAspectRatio(4/3);">4/3</button></li>
														<li><button type="button" class="dropdown-item" onclick="_MAP.setAspectRatio(9/16);">9/16</button></li>
													</ul>
												</li>
											</ul>
										</li>
									</ul>
								</li>
								<li class="nav-item mb-2 mb-sm-0 me-auto">
									<a class="nav-link py-0" href="#" data-bs-toggle="modal" data-bs-target="#optionsModal">Options</a>
								</li>

								<li class="nav-item mb-2 mb-sm-0 me-4">
									<div class="btn-group btn-group-sm" role="group" aria-label="Save/Preview">
										<a role="button" class="btn btn-light" href="#" id="save">Save</a>
										<a role="button" class="btn btn-outline-light" href="pres.php?id=<?php echo $id; ?>" target="_blank">View</a>
									</div>
								</li>

								<li class="nav-item dropdown">
									<a class="nav-link dropdown-toggle py-1 py-sm-0" href="#" id="navbarUserDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
										<img class="rounded" src="<?php echo $avatar; ?>" alt="&nbsp;" width="25" height="25" />
									</a>
									<ul class="dropdown-menu dropdown-menu-sm-end" aria-labelledby="navbarUserDropdown">
										<li><a class="dropdown-item" href="maps.php">My maps</a></li>
										<li><a class="dropdown-item" href="<?php echo "https://{$CONFIG['forum_host']}/u/{$username}/preferences/account"; ?>">Profile</a></li>
										<li><a class="dropdown-item" href="settings.php">Settings</a></li>
										<li><hr class="dropdown-divider" /></li>
										<li><a class="dropdown-item" href="logout.php">Log out</a></li>
									</ul>
								</li>
							</ul>
						</div>
					</nav>
				</div>
			</div>

			<div class="row g-0" id="sceneRow" style="height: 49px;">
				<div class="col shadow" style="z-index: 1003;">
					<div class="row g-0">
						<div class="col text-center p-2" style="max-width: 150px;">
							<button type="button" class="btn btn-sm btn-light" id="delete" title="Delete current scene" data-bs-toggle="modal" data-bs-target="#sceneWarningModal" disabled>
								<i class="fas fa-trash"></i>
							</button>

							<button type="button" class="btn btn-sm btn-light" id="recapture" title="Recapture map-extent" disabled>
								<i class="fas fa-camera"></i>
							</button>

							<button type="button" class="btn btn-sm btn-light" id="add" title="Add new scene" style="width: 60px;">
								<i class="fas fa-plus"></i>
							</button>
						</div>

						<div class="col px-2" tabindex="0" style="max-width: calc(100% - 150px); border-left: 1px solid grey;">
							<ul class="list-group list-group-horizontal" id="scenes"></ul>
						</div>
					</div>
				</div>
			</div>

			<div class="row g-0" id="mapRow" style="height: calc(100vh - 39px - 49px);">
				<div class="col">
					<div class="shadow" id="map"></div>
					<div class="shadow" id="textbox">
						<div id="banner">
							<button type="button" class="btn btn-outline-secondary btn-sm py-0" id="options" title="Book options" data-bs-toggle="modal" data-bs-target="#textboxOptionsModal" style="float: left;">
								<i class="fas fa-cog"></i>
							</button>
							<input type="checkbox" class="form-check-input ms-1" value="" id="lock" title="Lock" />
							<button type="button" class="btn btn-outline-secondary btn-sm py-0" id="close" title="Remove book" style="float: right;">
								<i class="fas fa-times"></i>
							</button>
						</div>
						<div id="content"></div>
					</div>
				</div>
			</div>
		</div>

		<!-- NOTE: placeholders for trumbowyg image upload and avatar icon upload -->
		<input type="file" id="_img_textbox" accept="image/gif, image/jpeg, image/png, image/webp" style="display: none;" />
		<input type="file" id="_img_icon" accept="image/gif, image/jpeg, image/png, image/webp" style="display: none;" />

		<!-- Load lib/ JS -->
		<script type="text/javascript" src="lib/fontawesome/js/all.min.js"></script>
		<!--script type="text/javascript" src="lib/jquery/jquery-3.6.0.slim.min.js"></script-->
		<script type="text/javascript" src="lib/jquery-ui/external/jquery/jquery.js"></script>
		<script type="text/javascript" src="lib/jquery-ui/jquery-ui.min.js"></script>
		<script type="text/javascript" src="lib/jquery-resizable/jquery-resizable.min.js"></script>
		<script type="text/javascript" src="lib/bootstrap/js/bootstrap.bundle.min.js"></script>
		<script type="text/javascript" src="lib/leaflet/leaflet.js"></script>
		<script type="text/javascript" src="lib/leaflet.providers/leaflet-providers.js"></script>
		<!--script type="text/javascript" src="lib/leaflet.fullscreen/Leaflet.fullscreen.min.js"></script-->
		<script type="text/javascript" src="lib/leaflet.zoomhome/leaflet.zoomhome.js"></script>
		<!--script type="text/javascript" src="lib/leaflet.locatecontrol/L.Control.Locate.min.js"></script-->
		<!--script type="text/javascript" src="lib/leaflet.draw/leaflet.draw.js"></script-->
		<script type="text/javascript" src="lib/leaflet.geoman/leaflet-geoman.min.js"></script>
		<script type="text/javascript" src="lib/leaflet.slideto/Leaflet.SlideTo.js"></script>
		<script type="text/javascript" src="lib/leaflet.easybutton/easy-button.js"></script>
		<!--script type="text/javascript" src="lib/leaflet.htmllegend/L.Control.HtmlLegend.js"></script-->
		<script type="text/javascript" src="lib/leaflet.contextmenu/leaflet.contextmenu.min.js"></script>
		<!--script type="text/javascript" src="lib/leaflet.centercontrol/leaflet-control-topcenter.js"></script-->
		<!--script type="text/javascript" src="lib/geotiff/geotiff.js"></script-->
		<!--script type="text/javascript" src="lib/plotty/plotty.min.js"></script-->
		<!--script type="text/javascript" src="lib/leaflet.geotiff/leaflet-geotiff.js"></script-->
		<!--script type="text/javascript" src="lib/leaflet.geotiff/leaflet-geotiff-plotty.js"></script-->
		<!--script type="text/javascript" src="lib/leaflet.geotiff/leaflet-geotiff-vector-arrows.js"></script-->
		<!--script type="text/javascript" src="lib/prism/prism.js"></script-->
		<script type="text/javascript" src="lib/trumbowyg/trumbowyg.min.js"></script>
		<script type="text/javascript" src="lib/trumbowyg/plugins/base64/trumbowyg.base64.min.js"></script>
		<script type="text/javascript" src="lib/trumbowyg/plugins/colors/trumbowyg.colors.min.js"></script>
		<script type="text/javascript" src="lib/trumbowyg/plugins/fontfamily/trumbowyg.fontfamily.min.js"></script>
		<script type="text/javascript" src="lib/trumbowyg/plugins/fontsize/trumbowyg.fontsize.min.js"></script>
		<!--script type="text/javascript" src="lib/trumbowyg/plugins/highlight/trumbowyg.highlight.min.js"></script-->
		<script type="text/javascript" src="lib/trumbowyg/plugins/history/trumbowyg.history.min.js"></script>
		<script type="text/javascript" src="lib/trumbowyg/plugins/indent/trumbowyg.indent.min.js"></script>
		<script type="text/javascript" src="lib/trumbowyg/plugins/lineheight/trumbowyg.lineheight.min.js"></script>
		<script type="text/javascript" src="lib/trumbowyg/plugins/pasteimage/trumbowyg.pasteimage.min.js"></script>
		<script type="text/javascript" src="lib/trumbowyg/plugins/resizimg/trumbowyg.resizimg.min.js"></script>
		<script type="text/javascript" src="lib/trumbowyg/plugins/specialchars/trumbowyg.specialchars.min.js"></script>
		<script type="text/javascript" src="lib/trumbowyg/plugins/table/trumbowyg.table.min.js"></script>

		<!-- Set ID, TITLE and HOST -->
		<script type="text/javascript">
			const _ID = `<?php echo $id; ?>`,
				  _TITLE = `<?php echo $row['title']; ?>`,
				  _HOST = window.location.host;
		</script>

		<!-- Load src/ JS -->
		<!--script type="text/javascript" src="src/edit/js/map/L.GridLayer.js"></script-->
		<script type="text/javascript" src="src/edit/js/map/L.TileLayer.Mars.js"></script>

		<script type="text/javascript" src="src/edit/js/globals.js"></script>

		<script type="text/javascript" src="src/edit/js/helpers.js"></script>

		<script type="text/javascript" src="src/edit/js/generate.js"></script>

		<script type="text/javascript" src="src/edit/js/scenes.js"></script>

		<script type="text/javascript" src="src/edit/js/textboxes.js"></script>

		<script type="text/javascript" src="src/edit/js/map/layers.js"></script>
		<script type="text/javascript" src="src/edit/js/map/map.js"></script>

		<script type="text/javascript" src="src/edit/js/main.js"></script>

	</body>
</html>
