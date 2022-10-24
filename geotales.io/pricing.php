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

include "init.php";
include_once("helper.php");

$logged_in = false;
if(isset($_SESSION['user_id']) && validUserID($PDO, $_SESSION['user_id'])) {
	$logged_in = true;
	$user_id = $_SESSION['user_id'];
	$photo = getUserPhoto($PDO, $user_id);
}

?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta http-equiv="x-ua-compatible" content="ie=edge" />
		<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, shrink-to-fit=no, target-densitydpi=device-dpi" />

		<title>GeoTales – Tales on a map</title>
		<meta name="title" content="GeoTales" />
		<meta name="description" content="Tales on a map" />

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
				background-image: url('assets/background.png');
				background-size: cover;
				background-repeat: no-repeat;
				background-position: center;
			}
		</style>
	</head>
	<body>

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
						<img src="assets/logo.png" alt="GeoTales" width="auto" height="30" /><small>eoTales</small>
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
							<li class="nav-item">
								<a class="nav-link active" aria-current="page" href="pricing.php">
									<i class="fas fa-tag"></i> Pricing
								</a>
							</li>
							<li class="nav-item me-sm-auto">
								<a class="nav-link" href="about.php">
									<i class="fas fa-info-circle"></i> About
								</a>
							</li>

					<?php if($logged_in) { ?>
							<li class="nav-item me-sm-2">
								<a class="nav-link" href="maps.php">
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
					<?php }else{ ?>
							<li class="nav-item">
								<a role="button" class="btn btn-sm btn-light" href="signin.php" style="margin-top: 0.35rem;">Sign in</a>
							</li>
					<?php } ?>
						</ul>
					</div>
				</div>
			</nav>
		</header>

		<main role="main">
			<div class="container" id="main">
				<div class="row my-5">
					<div class="col"></div>
				</div>

				<div class="row row-cols-1 row-cols-md-3 g-3">
					<div class="col">
						<div class="card">
							<div class="card-body">
								<h4 class="card-title text-center">Basic</h4>
								<h6 class="card-subtitle mb-2 text-center text-muted">Free</h6>
								<p class="card-text small ms-md-4"><i class="fas fa-check" style="color: #00cc44;"></i> Create and publish your own GeoTales</p>
								<p class="card-text small ms-md-4"><i class="fas fa-check" style="color: #00cc44;"></i> 5 GeoTales for free</p>
								<p class="card-text small ms-md-4"><i class="fas fa-check" style="color: #00cc44;"></i> 40+ free basemaps</p>
								<p class="card-text small ms-md-4"><i class="fas fa-times" style="color: #cc2900;"></i> Custom basemaps</p>
								<p class="card-text small ms-md-4"><i class="fas fa-times" style="color: #cc2900;"></i> WMS-layers</p>
								<p class="card-text small ms-md-4"><i class="fas fa-times" style="color: #cc2900;"></i> Import and export of data-files</p>
								<p class="card-text small ms-md-4"><i class="fas fa-times" style="color: #cc2900;"></i> Password-protected GeoTales</p>
								<div class="d-grid">
									<a role="button" class="btn btn-primary" href="<?php echo $logged_in ? "profile.php" : "signup.php" ?>">Sign up for free</a>
								</div>
							</div>
						</div>
					</div>
					<div class="col">
						<div class="card">
							<div class="card-body">
								<h4 class="card-title text-center">Premium</h4>
								<h6 class="card-subtitle mb-2 text-center text-muted">$5 / month per user</h6>
								<p class="card-text small ms-md-4"><i class="fas fa-check" style="color: #00cc44;"></i> Create and publish your own GeoTales</p>
								<p class="card-text small ms-md-4"><i class="fas fa-check" style="color: #00cc44;"></i> Unlimited GeoTales</p>
								<p class="card-text small ms-md-4"><i class="fas fa-check" style="color: #00cc44;"></i> 40+ free basemaps</p>
								<p class="card-text small ms-md-4"><i class="fas fa-check" style="color: #00cc44;"></i> Custom basemaps</p>
								<p class="card-text small ms-md-4"><i class="fas fa-check" style="color: #00cc44;"></i> WMS-layers</p>
								<p class="card-text small ms-md-4"><i class="fas fa-check" style="color: #00cc44;"></i> Import and export of data-files</p>
								<p class="card-text small ms-md-4"><i class="fas fa-check" style="color: #00cc44;"></i> Password-protected GeoTales</p>
								<p class="card-text small ms-md-4"><i class="fas fa-check" style="color: #00cc44;"></i> Option to create organization-account</p>
								<div class="d-grid">
									<a role="button" class="btn btn-primary" href="<?php echo $logged_in ? "profile.php?op=payment" : "signup.php?return_url=profile.php?op=payment" ?>">Sign up <br /> <small>and add a subscription</small></a>
								</div>
							</div>
						</div>
					</div>
					<div class="col">
						<div class="card">
							<div class="card-body">
								<h4 class="card-title text-center">Enterprise</h4>
								<h6 class="card-subtitle mb-2 text-center text-muted">Contact us</h6>
								<p class="card-text small ms-md-4"><i class="fas fa-check" style="color: #00cc44;"></i> Create and publish your own GeoTales</p>
								<p class="card-text small ms-md-4"><i class="fas fa-check" style="color: #00cc44;"></i> Unlimited GeoTales</p>
								<p class="card-text small ms-md-4"><i class="fas fa-check" style="color: #00cc44;"></i> 40+ free basemaps</p>
								<p class="card-text small ms-md-4"><i class="fas fa-check" style="color: #00cc44;"></i> Custom basemaps</p>
								<p class="card-text small ms-md-4"><i class="fas fa-check" style="color: #00cc44;"></i> WMS-layers</p>
								<p class="card-text small ms-md-4"><i class="fas fa-check" style="color: #00cc44;"></i> Import and export of data-files</p>
								<p class="card-text small ms-md-4"><i class="fas fa-check" style="color: #00cc44;"></i> Password-protected GeoTales</p>
								<p class="card-text small ms-md-4"><i class="fas fa-check" style="color: #00cc44;"></i> Organization-account</p>

								<p class="card-text small ms-md-4"><i class="fas fa-check" style="color: #00cc44;"></i> Dedicated customer-support</p>
								<p class="card-text small ms-md-4"><i class="fas fa-check" style="color: #00cc44;"></i> Dedicated server for hosting</p>
								<p class="card-text small ms-md-4"><i class="fas fa-check" style="color: #00cc44;"></i> Custom integrations <br /> (GPS-hardware, CMS, website-embedding, etc.)</p>
								<p class="card-text small ms-md-4">...</p>
								<div class="d-grid">
									<a role="button" class="btn btn-primary" href="mailto:<?php echo $CONFIG['email'] ?>?subject=GeoTales Enterprise account" target="_blank">Contact us</a>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="row my-5">
					<div class="col"></div>
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
							<a class="text-decoration-none" href="terms.php">Terms and conditions</a>
						</p>
						<p class="text-muted text-center">
							<a class="text-decoration-none" href="mailto:<?php echo $CONFIG['email']; ?>"><?php echo $CONFIG['email']; ?></a>
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

		<!-- Load src/ JS -->
		<script type="text/javascript">
			"use strict";

			window.onload = function(ev) {

				$.ajax({
					type: "POST",
					url: "api.php",
					data: { "op": "analytics", "agent": window.navigator ? window.navigator.userAgent : "" },
					dataType: "json",
					success: function(result, status, xhr) { console.log("Analytics registered"); },
					error: function(xhr, status, error) { console.log(xhr.status, error); }
				});

			};
		</script>

	</body>
</html>
