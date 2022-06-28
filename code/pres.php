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

$logged_in = false;
if(isset($_SESSION['uid']) && validUID($PDO, $_SESSION['uid'])) {
	$logged_in = true;
}

if(!isset($_GET['id'])) {
	http_response_code(422); exit;
}
$id = $_GET['id'];


$stmt = $PDO->prepare("SELECT title, description FROM \"Map\" WHERE id = ?");
$stmt->execute([$id]);
$row = $stmt->fetch();

?>

<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
		<meta http-equiv="x-ua-compatible" content="ie=edge" />
		<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, shrink-to-fit=no, target-densitydpi=device-dpi" />

		<title>GeoTales – <?php echo $row['title']; ?></title>
		<meta name="title" content="GeoTales – <?php echo $row['title']; ?>" />
		<meta name="description" content="<?php echo $row['description']; ?>" />

		<!-- Open Graph / Facebook -->
		<meta property="og:type" content="website" />
		<meta property="og:url" content="https://tellusmap.com/" />
		<meta property="og:title" content="GeoTales – <?php echo $row['title']; ?>" />
		<meta property="og:description" content="<?php echo $row['description']; ?>" />
		<meta property="og:site_name" content="GeoTales" />
		<meta property="og:image" content="assets/logo.png" />
		<meta property="og:image:type" content="image/png" />

		<!-- Twitter -->
		<meta property="twitter:card" content="summary_large_image" />
		<meta name="twitter:site" content="@TellusMap" />
		<meta name="twitter:creator" content="@TellusMap" />
		<meta property="twitter:url" content="https://tellusmap.com/" />
		<meta property="twitter:title" content="GeoTales – <?php echo $row['title']; ?>" />
		<meta property="twitter:description" content="<?php echo $row['description']; ?>" />
		<meta property="twitter:image" content="assets/logo.png" />

		<link rel="icon" href="assets/logo.png" />

		<!-- Load lib/ CSS -->
		<link rel="stylesheet" href="lib/fontawesome/css/all.min.css" />
		<!--link rel="stylesheet" href="lib/jquery-ui/jquery-ui.min.css" /-->
		<link rel="stylesheet" href="lib/bootstrap/css/bootstrap.min.css" />
		<link rel="stylesheet" href="lib/leaflet/leaflet.css" />
		<link rel="stylesheet" href="lib/leaflet.zoomhome/leaflet.zoomhome.css" />
		<link rel="stylesheet" href="lib/leaflet.easybutton/easy-button.css" />
		<link rel="stylesheet" href="lib/leaflet.contextmenu/leaflet.contextmenu.min.css" />
		<link rel="stylesheet" href="lib/leaflet.select/leaflet.control.select.css" />

		<!-- Load src/ CSS -->
		<link rel="stylesheet" href="src/pres/css/main.css" />

		<style type="text/css">
			/*.leaflet-draw-toolbar a.leaflet-draw-draw-marker {
				background-image: linear-gradient(transparent, transparent), url('assets/user-circle-solid.svg');
				background-size: 14px 14px;
				background-position: 8px 8px !important;
			}*/
		</style>
	</head>
	<body>



		<!-- Image modal -->
		<div class="modal fade" id="imageModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" tabindex="-1" aria-labelledby="imageModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl modal-fullscreen-lg-down">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<img alt="Could not load image" class="img-fluid mx-auto d-block" id="imgPreview" />
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
			<div class="row g-0" id="main">
				<div class="col-12">
					<div class="shadow" id="map"></div>

					<div class="card shadow" id="textbox">
						<div class="card-body">
							<div id="content"></div>
						</div>
					</div>

					<div class="dropdown" id="bookmarks">
						<button class="btn btn-sm btn-outline-light dropdown-toggle" type="button" id="bookmarksDropdown" data-bs-toggle="dropdown" aria-expanded="false">
							<i class="fas fa-bookmark"></i>
						</button>
						<ul class="dropdown-menu" aria-labelledby="bookmarksDropdown">
							<li><h6 class="dropdown-header">Bookmarks</h6></li>
						</ul>
					</div>

					<div role="group" class="btn-group btn-group-sm" id="sceneNav" aria-label="Scene navigation">
						<button type="button" class="btn btn-outline-light" id="prev">
							<i class="fas fa-chevron-left"></i>
						</button>
						<button type="button" class="btn btn-outline-light" id="fullscreen">
							<i class="fas fa-expand"></i>
						</button>
						<button type="button" class="btn btn-outline-light" id="next">
							<i class="fas fa-chevron-right"></i>
						</button>
					</div>

					<div class="dropdown" id="extraNav">
						<button class="btn btn-sm btn-outline-light dropdown-toggle" type="button" id="navDropdown" data-bs-toggle="dropdown" aria-expanded="false">
							<img src="assets/logo.png" alt="GeoTales" width="20" height="20" />
						</button>
						<ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navDropdown">
							<li><a class="dropdown-item" href="index.php">Gallery</a></li>
					<?php
						if($logged_in) {
					?>
							<li><hr class="dropdown-divider" /></li>
							<li><a class="dropdown-item" href="maps.php">My maps</a></li>
							<li><hr class="dropdown-divider" /></li>
							<li><a class="dropdown-item" href="#">Clone this map</a></li>
					<?php
						}
					?>
						</ul>
					</div>

					<div role="group" class="btn-group-vertical btn-group-sm" id="mapNav" aria-label="Map navigation">
						<button type="button" class="btn btn-outline-light" id="zoomIn">
							<i class="fas fa-plus"></i>
						</button>
						<button type="button" class="btn btn-outline-light" id="panLock">
							🔒
						</button>
						<button type="button" class="btn btn-outline-light" id="zoomOut">
							<i class="fas fa-minus"></i>
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Load lib/ JS -->
		<script type="text/javascript" src="lib/fontawesome/js/all.min.js"></script>
		<!--script type="text/javascript" src="lib/jquery/jquery-3.6.0.slim.min.js"></script-->
		<script type="text/javascript" src="lib/jquery-ui/external/jquery/jquery.js"></script>
		<!--script type="text/javascript" src="lib/jquery-ui/jquery-ui.min.js"></script-->
		<script type="text/javascript" src="lib/bootstrap/js/bootstrap.bundle.min.js"></script>
		<script type="text/javascript" src="lib/leaflet/leaflet.js"></script>
		<script type="text/javascript" src="lib/leaflet.providers/leaflet-providers.js"></script>
		<script type="text/javascript" src="lib/leaflet.zoomhome/leaflet.zoomhome.js"></script>
		<script type="text/javascript" src="lib/leaflet.slideto/Leaflet.SlideTo.js"></script>
		<script type="text/javascript" src="lib/leaflet.easybutton/easy-button.js"></script>
		<script type="text/javascript" src="lib/leaflet.contextmenu/leaflet.contextmenu.min.js"></script>

		<!-- Set ID, TITLE and HOST -->
		<script type="text/javascript">
			const _ID = `<?php echo $id; ?>`,
				  _TITLE = `<?php echo $row['title']; ?>`,
				  _HOST = window.location.host;;
		</script>

		<!-- Load src/ JS -->
		<!--script type="text/javascript" src="src/edit/js/map/L.GridLayer.js"></script-->
		<script type="text/javascript" src="src/pres/js/map/L.TileLayer.Mars.js"></script>

		<script type="text/javascript" src="src/pres/js/globals.js"></script>

		<script type="text/javascript" src="src/pres/js/helpers.js"></script>

		<script type="text/javascript" src="src/pres/js/generate.js"></script>

		<script type="text/javascript" src="src/pres/js/scenes.js"></script>

		<script type="text/javascript" src="src/pres/js/textboxes.js"></script>

		<script type="text/javascript" src="src/pres/js/map/layers.js"></script>
		<script type="text/javascript" src="src/pres/js/map/map.js"></script>

		<script type="text/javascript" src="src/pres/js/main.js"></script>

	</body>
</html>
