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

$logged_in = false;
if(isset($_SESSION['user_id']) && validUserID($PDO, $_SESSION['user_id'])) {
	$logged_in = true;
	$user_id = $_SESSION['user_id'];
}

if(!isset($_GET['id'])) {
	http_response_code(422); exit;
}
$id = $_GET['id'];


$stmt = $PDO->prepare("SELECT title, description, thumbnail FROM \"Map\" WHERE id = ?");
$stmt->execute([$id]);
$row = $stmt->fetch();

?>

<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
		<meta http-equiv="x-ua-compatible" content="ie=edge" />
		<meta name="viewport" content="minimal-ui, width=device-width, height=device-height, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, shrink-to-fit=no, target-densitydpi=device-dpi" />

		<title>GeoTales – <?php echo $row['title']; ?></title>
		<meta name="title" content="GeoTales – <?php echo $row['title']; ?>" />
		<meta name="description" content="<?php echo $row['description']; ?>" />

		<!-- Open Graph / Facebook -->
		<meta property="og:type" content="website" />
		<meta property="og:url" content="https://geotales.io/" />
		<meta property="og:title" content="GeoTales – <?php echo $row['title']; ?>" />
		<meta property="og:description" content="<?php echo $row['description']; ?>" />
		<meta property="og:site_name" content="GeoTales" />
		<meta property="og:image" content="<?php echo $row['thumbnail']; ?>" />
		<!--meta property="og:image:type" content="image/png" /-->

		<!-- Twitter -->
		<meta property="twitter:card" content="summary_large_image" />
		<meta name="twitter:site" content="@TellusMap" />
		<meta name="twitter:creator" content="@TellusMap" />
		<meta property="twitter:url" content="https://geotales.io/" />
		<meta property="twitter:title" content="GeoTales – <?php echo $row['title']; ?>" />
		<meta property="twitter:description" content="<?php echo $row['description']; ?>" />
		<meta property="twitter:image" content="<?php echo $row['thumbnail']; ?>" />

		<link rel="icon" href="assets/logo.png" />

		<!-- Load lib/ CSS -->
		<link rel="stylesheet" href="lib/fontawesome/css/all.min.css" />
		<!--link rel="stylesheet" href="lib/jquery-ui/jquery-ui.min.css" /-->
		<link rel="stylesheet" href="lib/bootstrap/css/bootstrap.min.css" />
		<link rel="stylesheet" href="lib/leaflet/leaflet.css" />
		<link rel="stylesheet" href="lib/leaflet.zoomhome/leaflet.zoomhome.css" />
		<link rel="stylesheet" href="lib/leaflet.easybutton/easy-button.css" />
		<link rel="stylesheet" href="lib/leaflet.contextmenu/leaflet.contextmenu.min.css" />
		<link rel="stylesheet" href="lib/leaflet.centercontrol/leaflet-control-topcenter.css" />

		<!-- Load src/ CSS -->
		<link rel="stylesheet" href="src/pres/css/main.css" />

		<style type="text/css"></style>
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



		<!-- Password modal -->
		<div class="modal fade" id="passwordModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" tabindex="-1" aria-labelledby="passwordModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-scrollable modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="passwordModalLabel">Enter password</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<div class="container-fluid">
							<div class="row">
								<div class="col">
									<input type="password" class="form-control" id="passwordInput" />
								</div>
							</div>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" id="enter">Enter</button>
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
				<div class="col">
					<div class="shadow" id="map"></div>

					<div class="card shadow" id="textbox">
						<div class="card-body">
							<div id="content"></div>
						</div>
					</div>

					<div role="group" class="btn-group btn-group-sm" id="sceneNav" aria-label="Scene navigation">
						<button type="button" class="btn btn-light" id="prev">
							<i class="fas fa-chevron-left"></i>
						</button>
						<div role="group" class="btn-group dropup" id="bookmarks">
							<button type="button" class="btn btn-light dropdown-toggle px-3" id="bookmarksDropdown" data-bs-toggle="dropdown" aria-expanded="false">
								<i class="fas fa-bookmark"></i>
							</button>
							<ul class="dropdown-menu" aria-labelledby="bookmarksDropdown">
								<li><h6 class="dropdown-header">Bookmarks</h6></li>
							</ul>
						</div>
						<button type="button" class="btn btn-light" id="next">
							<i class="fas fa-chevron-right"></i>
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
		<script type="text/javascript" src="lib/sjcl/sjcl.js"></script>
		<script type="text/javascript" src="lib/leaflet/leaflet.js"></script>
		<script type="text/javascript" src="lib/leaflet.providers/leaflet-providers.js"></script>
		<script type="text/javascript" src="lib/leaflet.zoomhome/leaflet.zoomhome.js"></script>
		<script type="text/javascript" src="lib/leaflet.slideto/Leaflet.SlideTo.js"></script>
		<script type="text/javascript" src="lib/leaflet.easybutton/easy-button.js"></script>
		<script type="text/javascript" src="lib/leaflet.contextmenu/leaflet.contextmenu.min.js"></script>
		<script type="text/javascript" src="lib/leaflet.centercontrol/leaflet-control-topcenter.js"></script>

		<!-- Set superglobals and init -->
		<script type="text/javascript">
			const _ID = `<?php echo $id; ?>`,
				  _TITLE = `<?php echo $row['title']; ?>`,
				  _HOST = window.location.host,
				  _IS_MOBILE = window.navigator ? /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent) : false;
			var _PASSWORD = "";

			$.ajax({
				type: "POST",
				url: "api/analytics.php",
				data: { "agent": window.navigator ? window.navigator.userAgent : "" },
				dataType: "json",
				success: function(result, status, xhr) { console.log("Analytics registered"); },
				error: function(xhr, status, error) { console.log(xhr.status, error); }
			});

			$.ajax({
				type: "POST",
				url: "api/map.php",
				data: { "op": "view", "id": _ID },
				dataType: "json",
				success: function(result, status, xhr) { console.log("View registered"); },
				error: function(xhr, status, error) { console.log(xhr.status, error); }
			});
		</script>

		<!-- Load src/ JS -->
		<!--script type="text/javascript" src="src/pres/js/map/L.GridLayer.js"></script-->
		<script type="text/javascript" src="src/pres/js/map/L.TileLayer.Mars.js"></script>
		<script type="text/javascript" src="src/pres/globals.js"></script>
		<script type="text/javascript" src="src/pres/main_1663238863.js"></script>

	</body>
</html>
