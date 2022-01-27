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

if(!isset($_SESSION['uid'])) { // Not logged in
	header("location: index.php");
	exit;
}

include "init.php";

$username = $_SESSION['username'];

if(!isset($_GET['id'])) {
	http_response_code(422);
	exit;
}
$id = $_GET['id'];


$stmt = $pdo->prepare("SELECT title, description FROM \"Map\" WHERE id = ?");
$stmt->execute([$id]);
$row = $stmt->fetch();

?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta http-equiv="x-ua-compatible" content="ie=edge" />
		<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, shrink-to-fit=no, target-densitydpi=device-dpi" />

		<title>TellUs – <?php echo $row['title']; ?></title>
		<meta name="title" content="TellUs – <?php echo $row['title']; ?>" />
		<meta name="description" content="<?php echo $row['description']; ?>" />

		<link rel="icon" href="assets/logo.png" />

		<!-- Load lib/ CSS -->
		<link rel="stylesheet" href="lib/fontawesome/css/all.min.css" />
		<link rel="stylesheet" href="lib/jquery-ui/jquery-ui.min.css" />
		<link rel="stylesheet" href="lib/bootstrap/css/bootstrap.min.css" />
		<link rel="stylesheet" href="lib/leaflet/leaflet.css" />
		<!--link rel="stylesheet" href="lib/leaflet.fullscreen/leaflet.fullscreen.css" /-->
		<!--link rel="stylesheet" href="lib/leaflet.zoomhome/leaflet.zoomhome.css" /-->
		<!--link rel="stylesheet" href="lib/leaflet.locatecontrol/L.Control.Locate.min.css" /-->
		<link rel="stylesheet" href="lib/leaflet.draw/leaflet.draw.css" />
		<link rel="stylesheet" href="lib/leaflet.easybutton/easy-button.css" />
		<link rel="stylesheet" href="lib/leaflet.htmllegend/L.Control.HtmlLegend.css" />
		<link rel="stylesheet" href="lib/leaflet.contextmenu/leaflet.contextmenu.min.css" />
		<!--link rel="stylesheet" href="lib/prism/prism.css" /-->
		<link rel="stylesheet" href="lib/trumbowyg/ui/trumbowyg.min.css" />
		<link rel="stylesheet" href="lib/trumbowyg/plugins/colors/ui/trumbowyg.colors.min.css" />
		<!--link rel="stylesheet" href="lib/trumbowyg/plugins/highlight/ui/trumbowyg.highlight.min.css" /-->
		<link rel="stylesheet" href="lib/trumbowyg/plugins/specialchars/ui/trumbowyg.specialchars.min.css" />
		<link rel="stylesheet" href="lib/trumbowyg/plugins/table/ui/trumbowyg.table.min.css" />

		<!-- Load src/ CSS -->
		<link rel="stylesheet" href="src/edit/css/main.css" />

		<style type="text/css">
			.leaflet-draw-toolbar a.leaflet-draw-draw-marker {
				background-image: linear-gradient(transparent, transparent), url('assets/user-circle-solid.svg');
				background-size: 14px 14px;
				background-position: 8px 8px !important;
			}
		</style>
	</head>
	<body>



		<!-- Import modal -->
		<div class="modal fade" id="importModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" tabindex="-1" aria-labelledby="importModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-scrollable modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="importModalLabel">Import data</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<div class="mb-3">
							<label for="fileInput" class="form-label">Choose a data-file</label>
							<input type="file" class="form-control" id="fileInput" aria-describedby="fileHelp" />
							<div id="fileHelp" class="form-text">Supported formats: GEDCOM, CSV, Excel, TellUs map-file</div>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
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
							<div class="row mb-3">
								<div class="col">
									<h5>Avatar</h5>
								</div>
							</div>

							<div class="row">
								<div class="col">
									<p>Animation speed: <small><span id="avatarSpeedInputValue">2000 milliseconds</span></small></p>
									<input type="range" class="form-range" id="avatarSpeedInput" min="200" max="3000" step="100" value="2000" />
								</div>
							</div>

							<br />
							<hr />
							<br />

							<div class="row mb-2">
								<div class="col">
									<h5>Map</h5>
								</div>
							</div>

							<div class="row">
								<div class="col">
									<p>Panning speed: <small><span id="panningSpeedInputValue">auto</span></small></p>
									<input type="range" class="form-range" id="panningSpeedInput" min="0" max="4000" step="100" />
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



		<!-- Basemap modal -->
		<div class="modal fade" id="basemapModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" tabindex="-1" aria-labelledby="basemapModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-scrollable modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="basemapModalLabel">Choose basemap</h5>
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
									<label for="basemapFile"><small>Or choose custom basemap</small></label>
									<input type="file" class="form-control form-control-sm" id="basemapFile" aria-describedby="basemapFileHelp" accept="image/gif, image/jpeg, image/png" />
									<div id="basemapFileHelp" class="form-text">This can be any image file</div>
								</div>
							</div>

							<div class="row my-2">
								<div class="col">
									<label for="basemapLink"><small>Or link to an online basemap</small></label>
									<div class="input-group input-group-sm">
										<input type="text" class="form-control" id="basemapLink" aria-label="Url" aria-describedby="inputGroup-sizing-sm" placeholder="URL" style="width: 70%;" />
										<input type="text" class="form-control" id="basemapKey" aria-label="Access key" aria-describedby="inputGroup-sizing-sm" placeholder="Access key" style="width: 30%;" />
									</div>
									<div id="basemapKey" class="form-text">XYZ-tiles or a Mapbox style. Access key is required with Mapbox style</div>
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
			<div class="row g-0">
				<div class="col">
					<nav class="navbar navbar-expand-sm navbar-dark fixed-top shadow px-2 px-sm-3 py-1" style="background-color: #eba937;">
						<a class="navbar-brand" href="maps.php">
							<img src="assets/logo.png" alt="TellUs" width="30" height="30" />
						</a>

						<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
							<span class="navbar-toggler-icon"></span>
						</button>

						<div class="collapse navbar-collapse" id="navbarContent">
							<ul class="navbar-nav mb-2 mb-sm-0 px-2 px-sm-0 w-100">
								<li class="nav-item dropdown">
									<a class="nav-link dropdown-toggle" href="#" id="navbarFileDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
										File
									</a>
									<ul class="dropdown-menu" aria-labelledby="navbarFileDropdown">
										<li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#importModal">Import map-file</a></li>
										<li><a class="dropdown-item" href="#" id="export">Export</a></li>
									</ul>
								</li>
								<li class="nav-item me-auto">
									<a class="nav-link" href="#" data-bs-toggle="modal" data-bs-target="#optionsModal">Options</a>
								</li>

								<li class="nav-item mt-1 me-4">
									<div class="btn-group btn-group-sm" role="group" aria-label="Save/Preview">
										<button type="button" class="btn btn-light" id="save">Save</button>
										<a role="button" class="btn btn-outline-light" href="pres.php?id=<?php echo $id; ?>" target="_blank">View</a>
									</div>
								</li>

								<li class="nav-item dropdown">
									<a class="nav-link dropdown-toggle" href="#" id="navbarUserDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
										<i class="fas fa-user"></i>
									</a>
									<ul class="dropdown-menu dropdown-menu-sm-end" aria-labelledby="navbarUserDropdown">
										<li><a class="dropdown-item" href="maps.php">My maps</a></li>
										<li><a class="dropdown-item" href="https://forum.tellusmap.com/u/<?php echo $username; ?>/preferences/account">Profile</a></li>
										<li><a class="dropdown-item" href="settings.php">Settings</a></li>
										<li><hr class="dropdown-divider"></li>
										<li><a class="dropdown-item" href="logout.php">Log out</a></li>
									</ul>
								</li>
							</ul>
						</div>
					</nav>
				</div>
			</div>


			<div class="row g-0" style="height: 100vh;">
				<div class="col-12" id="mapCol">
					<div id="map"></div>
				</div>

				<div class="col-12 col-sm-6 col-lg-5 col-xl-4 col-xxl-3 shadow" id="sceneCol" tabindex="0">

					<div class="row align-items-center h-100 g-0">
						<div class="col">
							<center>
								<button type="button" class="btn btn-outline-secondary px-5" id="addScene">
									<strong>+</strong>
								</button>

								<p class="text-muted mt-3">
									Click to capture scene
								</p>
							</center>
						</div>
					</div>

				</div>

			</div>
		</div>

		<!-- NOTE: Used as placeholder input for trumbowyg image upload -->
		<input type="file" id="_img" accept="image/gif, image/jpeg, image/png" style="display: none;" />

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
		<!--script type="text/javascript" src="lib/leaflet.zoomhome/leaflet.zoomhome.min.js"></script-->
		<!--script type="text/javascript" src="lib/leaflet.locatecontrol/L.Control.Locate.min.js"></script-->
		<script type="text/javascript" src="lib/leaflet.draw/leaflet.draw.js"></script>
		<script type="text/javascript" src="lib/leaflet.marker.slideto/Leaflet.Marker.SlideTo.js"></script>
		<script type="text/javascript" src="lib/leaflet.easybutton/easy-button.js"></script>
		<script type="text/javascript" src="lib/leaflet.htmllegend/L.Control.HtmlLegend.js"></script>
		<script type="text/javascript" src="lib/leaflet.contextmenu/leaflet.contextmenu.min.js"></script>
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

		<!-- Set ID -->
		<script type="text/javascript">
			const _ID = <?php echo $id; ?>;
		</script>

		<!-- Load src/ JS -->
		<script type="text/javascript" src="src/edit/js/map/L.TileLayer.Mars.js"></script>

		<script type="text/javascript" src="src/edit/js/globals.js"></script>

		<script type="text/javascript" src="src/edit/js/helpers.js"></script>

		<script type="text/javascript" src="src/edit/js/generate.js"></script>

		<script type="text/javascript" src="src/edit/js/events.js"></script>

		<script type="text/javascript" src="src/edit/js/map/layers.js"></script>
		<script type="text/javascript" src="src/edit/js/map/map.js"></script>

		<script type="text/javascript" src="src/edit/js/main.js"></script>

	</body>
</html>
