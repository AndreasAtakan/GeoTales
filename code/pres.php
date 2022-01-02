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

include "init.php";

if(!isset($_GET['pid'])) {
	http_response_code(422);
	exit;
}
$pid = $_GET['pid'];


$stmt = $pdo->prepare("SELECT title, description FROM \"Project\" WHERE pid = ?");
$stmt->execute([$pid]);
$row = $stmt->fetch();

?>

<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
		<meta http-equiv="x-ua-compatible" content="ie=edge" />
		<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, shrink-to-fit=no, target-densitydpi=device-dpi" />

		<title>TellUs – <?php echo $row['title']; ?></title>
		<meta name="title" content="TellUs – <?php echo $row['title']; ?>" />
		<meta name="description" content="<?php echo $row['description']; ?>" />

		<!-- Open Graph / Facebook -->
		<meta property="og:type" content="website" />
		<meta property="og:url" content="https://tellusmap.com/" />
		<meta property="og:title" content="TellUs – <?php echo $row['title']; ?>" />
		<meta property="og:description" content="<?php echo $row['description']; ?>" />
		<meta property="og:site_name" content="TellUs" />
		<meta property="og:image" content="assets/logo.jpg" />
		<meta property="og:image:type" content="image/png" />

		<!-- Twitter -->
		<meta property="twitter:card" content="summary_large_image" />
		<meta name="twitter:site" content="@TellusMap" />
		<meta name="twitter:creator" content="@TellusMap" />
		<meta property="twitter:url" content="https://tellusmap.com/" />
		<meta property="twitter:title" content="TellUs – <?php echo $row['title']; ?>" />
		<meta property="twitter:description" content="<?php echo $row['description']; ?>" />
		<meta property="twitter:image" content="assets/logo.jpg" />

		<link rel="icon" href="assets/logo.jpg" />

		<!-- Load lib/ CSS -->
		<link rel="stylesheet" href="lib/fontawesome/css/all.min.css" />
		<!--link rel="stylesheet" href="lib/jquery-ui/jquery-ui.min.css" /-->
		<link rel="stylesheet" href="lib/bootstrap/css/bootstrap.min.css" />
		<link rel="stylesheet" href="lib/leaflet/leaflet.css" />
		<link rel="stylesheet" href="lib/leaflet.easybutton/easy-button.css" />
		<link rel="stylesheet" href="lib/leaflet.htmllegend/L.Control.HtmlLegend.css" />
		<link rel="stylesheet" href="lib/leaflet.contextmenu/leaflet.contextmenu.min.css" />

		<!-- Load src/ CSS -->
		<link rel="stylesheet" href="src/pres/css/main.css" />

		<style type="text/css">
			.leaflet-draw-toolbar a.leaflet-draw-draw-marker {
				background-image: linear-gradient(transparent, transparent), url('assets/user-circle-solid.svg');
				background-size: 14px 14px;
				background-position: 8px 8px !important;
			}
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
			<div class="row g-0" style="height: calc(100vh);">
				<div class="col-12" id="col">
					<div id="map"></div>

					<div class="card" id="dateticker">
						<div class="card-body">
							<h5 class="card-title text-muted mb-0" id="datetime">
								<span id="time">
									<span id="hour"></span>:<span id="minute"></span>:<span id="second"></span>
								</span>
								<span id="dateNtime">–</span>
								<span id="date">
									<span id="day"></span>/<span id="month"></span>/<span id="year"></span>
								</span>
								<span id="period"></span>
							</h5>
						</div>
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
		<script type="text/javascript" src="lib/leaflet.marker.slideto/Leaflet.Marker.SlideTo.js"></script>
		<script type="text/javascript" src="lib/leaflet.transitionedicon/leaflet-transitionedicon.js"></script>
		<script type="text/javascript" src="lib/leaflet.easybutton/easy-button.js"></script>
		<script type="text/javascript" src="lib/leaflet.htmllegend/L.Control.HtmlLegend.js"></script>
		<script type="text/javascript" src="lib/leaflet.contextmenu/leaflet.contextmenu.min.js"></script>

		<!-- Set PID -->
		<script type="text/javascript">
			const _PID = <?php echo $pid; ?>;
		</script>

		<!-- Load src/ JS -->
		<script type="text/javascript" src="src/pres/js/map/L.TileLayer.Mars.js"></script>

		<script type="text/javascript" src="src/pres/js/globals.js"></script>

		<script type="text/javascript" src="src/pres/js/helpers.js"></script>

		<script type="text/javascript" src="src/pres/js/generate.js"></script>

		<script type="text/javascript" src="src/pres/js/events.js"></script>

		<script type="text/javascript" src="src/pres/js/map/layers.js"></script>
		<script type="text/javascript" src="src/pres/js/map/map.js"></script>

		<script type="text/javascript" src="src/pres/js/main.js"></script>

	</body>
</html>
