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
$paid = false;
if(isset($_SESSION['user_id']) && validUserID($PDO, $_SESSION['user_id'])) {
	$logged_in = true;

	$user_id = $_SESSION['user_id'];
	$stmt = $PDO->prepare("SELECT paid FROM \"User\" WHERE id = ?");
	$stmt->execute([$user_id]);
	$row = $stmt->fetch();
	$paid = $row['paid'];
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
		<link rel="stylesheet" href="lib/leaflet.select/leaflet.control.select.css" />

		<!-- Google AdSense -->
		<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4056519983936625" crossorigin="anonymous"></script>

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
							<div class="row">
								<div class="col">
									<div class="input-group input-group-lg">
										<input type="text" class="form-control" id="linkInput" aria-label="linkInput" aria-describedby="copyLink" readonly />
										<button class="btn btn-outline-secondary" type="button" id="copyLink" title="Copy to clipboard"><i class="fas fa-copy"></i></button>
									</div>
								</div>
							</div>

							<div class="row my-3">
								<hr />
							</div>

							<div class="row">
								<div class="col-0 col-sm-7">
							<?php if($logged_in) { ?>
									<button type="button" class="btn btn-sm btn-outline-secondary mb-2" id="clone">Clone this map</button>
							<?php } ?>
								</div>
								<div class="col col-sm-1">
									<a role="button" class="btn btn-lg btn-outline-light" href="#" id="facebook" target="_blank"><i class="fab fa-facebook" style="color: #4267B2;"></i></a>
								</div>
								<div class="col col-sm-1">
									<a role="button" class="btn btn-lg btn-outline-light" href="#" id="twitter" target="_blank"><i class="fab fa-twitter" style="color: #1DA1F2;"></i></a>
								</div>
								<div class="col col-sm-1">
									<a role="button" class="btn btn-lg btn-outline-light" href="#" id="linkedin" target="_blank"><i class="fab fa-linkedin" style="color: #0072b1;"></i></a>
								</div>
								<div class="col col-sm-1">
									<a role="button" class="btn btn-lg btn-outline-light" href="#" id="pinterest" target="_blank"><i class="fab fa-pinterest" style="color: #E60023;"></i></a>
								</div>
								<div class="col col-sm-1">
									<a role="button" class="btn btn-lg btn-outline-light" href="#" id="email"><i class="fas fa-envelope" style="color: grey;"></i></a>
								</div>
							</div>
						</div>
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
						<div class="card-footer text-muted">
							<div role="group" class="btn-group btn-group-sm" id="sceneNav" aria-label="Scene navigation">
								<button type="button" class="btn btn-light" id="prev">
									<i class="fas fa-chevron-left"></i>
								</button>
								<div role="group" class="btn-group btn-group-sm dropup" id="bookmarks">
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

					<div class="dropdown" id="extraNav">
						<button class="btn btn-sm btn-light dropdown-toggle" type="button" id="navDropdown" data-bs-toggle="dropdown" aria-expanded="false">
							<img src="assets/logo.png" alt="GeoTales" width="auto" height="20" />
						</button>
						<ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navDropdown" style="min-width: 0;">
							<li><a class="dropdown-item" href="<?php echo $logged_in ? "maps.php" : "index.php"; ?>"><i class="fas fa-home"></i></a></li>
							<li><hr class="dropdown-divider" /></li>
							<li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#shareModal"><i class="fas fa-share-alt"></i></a></li>
						</ul>
					</div>

					<div role="group" class="btn-group-vertical btn-group-sm" id="mapNav" aria-label="Map navigation">
						<button type="button" class="btn btn-light" id="zoomIn" disabled>
							<i class="fas fa-plus"></i>
						</button>
						<button type="button" class="btn btn-light" id="panLock">
							🔒
						</button>
						<button type="button" class="btn btn-light" id="fullscreen">
							<i class="fas fa-expand"></i>
						</button>
						<button type="button" class="btn btn-light" id="zoomOut" disabled>
							<i class="fas fa-minus"></i>
						</button>
					</div>

					<?php
						if((!$logged_in || !$paid) && !$TESTING && false) {
					?>
							<div class="card" id="adsense">
								<div class="card-header">
									Advertisement
									<button type="button" class="btn-close float-end" id="closeAd" aria-label="Close" style="display: none;"></button>
								</div>
								<div class="card-body">
									<ins class="adsbygoogle"
										style="display:block"
										data-ad-client="ca-pub-4056519983936625"
										data-ad-slot="9235179738"
										data-ad-format="auto"
										data-full-width-responsive="true"></ins>
									<script>
										(adsbygoogle = window.adsbygoogle || []).push({});
									</script>
								</div>
							</div>
					<?php
						}
					?>
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

		<!-- Set ID, TITLE and HOST -->
		<script type="text/javascript">
			const _ID = `<?php echo $id; ?>`,
				  _TITLE = `<?php echo $row['title']; ?>`,
				  _HOST = window.location.host;
			let _PASSWORD = "";
		</script>

		<!-- Load src/ JS -->
		<!--script type="text/javascript" src="src/pres/js/map/L.GridLayer.js"></script-->
		<script type="text/javascript" src="src/pres/js/map/L.TileLayer.Mars.js"></script>
		<script type="text/javascript" src="src/pres/globals.js"></script>
		<script type="text/javascript" src="src/pres/main.js"></script>

	</body>
</html>
