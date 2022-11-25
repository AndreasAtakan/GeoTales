<?php
/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@geotales.io>, January 2022                  *
*******************************************************************************/

ini_set('display_errors', 'On'); ini_set('html_errors', 0); error_reporting(-1);

include "init.php";
include_once("helper.php");

$loc = "maps.php";
if(isset($_REQUEST['return_url'])) {
	$loc = sanitize($_REQUEST['return_url']);
}

$user_id = headerUserID();
$logged_in = !sane_is_null($user_id);
if($logged_in) {
	$username = getUsername($PDO, $user_id);
}

if(!isset($_GET['token'])) { // didn't get a token
	header("location: index.php"); exit;
}
$token = $_GET['token'];

?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta http-equiv="x-ua-compatible" content="ie=edge" />
		<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, shrink-to-fit=no, target-densitydpi=device-dpi" />

		<meta name="csrf-token" content="<?php echo headerCSRFToken(); ?>" />

		<title>GeoTales – Tales on a map</title>
		<meta name="title" content="GeoTales" />
		<meta name="description" content="GeoTales – Tell your story on maps and maplike surfaces" />

		<link rel="icon" href="assets/logo.png" />

		<!-- Load lib/ CSS -->
		<link rel="stylesheet" href="lib/fontawesome/css/all.min.css" />
		<link rel="stylesheet" href="lib/jquery-ui/jquery-ui.min.css" />
		<link rel="stylesheet" href="lib/bootstrap/css/bootstrap.min.css" />

		<!-- Load CSS -->
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

			#reset_failed { display: none; }
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
						<img src="assets/logo.png" alt="GeoTales" width="auto" height="30" />
					</a>
				</div>
			</nav>
		</header>

		<main role="main">
			<div class="container" id="main">
				<div class="row my-5">
					<div class="col"></div>
				</div>

				<div class="row mx-auto" style="max-width: 350px;">
					<div class="col">
						<div role="alert" class="alert alert-danger alert-dismissible fade show" id="reset_failed">
							<strong>Failed</strong> to reset password.
							<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
						</div>

						<form method="post" autocomplete="off" id="signreset">
					<?php if($logged_in) { ?>
							<p class="lead text-muted">User: <?php echo $username; ?></p>
					<?php } ?>
							<div class="mb-1">
								<label for="pw1" class="form-label">New password</label>
								<div class="input-group">
									<input type="password" class="form-control" id="pw1" aria-label="Password" aria-describedby="pwShow" tabindex="1" required />
									<button type="button" class="btn btn-outline-secondary" id="pwShow" title="Toggle password"><i class="fas fa-eye"></i></button>
								</div>
							</div>
							<div class="mb-3">
								<input type="password" class="form-control" id="pw2" aria-label="Confirm password" tabindex="2" required />
								<label for="pw2" class="form-label small text-muted">Confirm password</label>
							</div>
							<button type="submit" class="btn btn-primary">Reset password</button>
						</form>

						<p class="text-muted my-3">
							Or <strong><a href="signin.php?return_url=<?php echo $loc; ?>">sign in</a></strong>
						</p>
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
								<a role="button" class="btn btn-outline-light" href="https://www.instagram.com/geotales.io/" target="_blank">
									<i class="fab fa-instagram" style="color: #d62976;"></i>
								</a>
								<a role="button" class="btn btn-outline-light" href="https://www.reddit.com/user/geotales/" target="_blank">
									<i class="fab fa-reddit" style="color: #ff5700;"></i>
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
						<p class="text-muted text-center mb-1">
							<a class="text-decoration-none" href="terms.php">Terms and conditions</a>
						</p>
						<p class="text-muted text-center">
							<a class="text-decoration-none" href="privacy.php">Privacy Policy</a>
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

		<!-- Load JS -->
		<script type="text/javascript" src="assets/ajax_setup.js"></script>
		<script type="text/javascript">
			"use strict";

			window.onload = function(ev) {

				const _RETURN_URL = "<?php echo str_replace('"', '\"', $loc); ?>",
					  _TOKEN = "<?php echo str_replace('"', '\"', $token); ?>";

				$.ajax({
					type: "POST",
					url: "api/analytics.php",
					data: { "agent": window.navigator ? window.navigator.userAgent : "" },
					dataType: "json",
					success: function(result, status, xhr) { console.log("Analytics registered"); },
					error: function(xhr, status, error) { console.log(xhr.status, error); }
				});

				let pwShow = false;
				$("button#pwShow").click(ev => {
					pwShow = !pwShow;
					$("form#signreset input#pw1, form#signreset input#pw2").prop("type", pwShow ? "text" : "password");
				});

				$("form#signreset input#pw1, form#signreset input#pw2").change(ev => {
					let el = document.forms.signreset.elements;
					let pw1 = $("form#signreset input#pw1").val(),
						pw2 = $("form#signreset input#pw2").val();

					if(pw1 !== pw2) {
						$("form#signreset input#pw1, form#signreset input#pw2").addClass("is-invalid");
						el.pw1.setCustomValidity("Passwords unequal");
						el.pw2.setCustomValidity("Passwords unequal");
					}else{
						$("form#signreset input#pw1, form#signreset input#pw2").removeClass("is-invalid");
						el.pw1.setCustomValidity("");
						el.pw2.setCustomValidity("");
					}
				});

				document.forms.signreset.onsubmit = function(ev) { ev.preventDefault();
					let form = ev.target;
					let el = form.elements;

					if(el.pw1.value !== el.pw2.value) { $("#errorModal").modal("show"); return; }

					$("#loadingModal").modal("show");

					$.ajax({
						type: "POST",
						url: "/auth/commit-password-reset",
						contentType: "application/json",
						data: JSON.stringify({
							"token": _TOKEN,
							"password": el.pw2.value
						}),
						dataType: "json",
						success: function(result, status, xhr) {
							if(result.status == "ok") { window.location.assign(_RETURN_URL); }
							else{
								$("#reset_failed").css("display", "block");
								setTimeout(function() { $("#loadingModal").modal("hide"); }, 750);
							}
						},
						error: function(xhr, status, error) {
							console.error(xhr.status, error);
							setTimeout(function() { $("#loadingModal").modal("hide"); $("#errorModal").modal("show"); }, 750);
						}
					});
				};

			};
		</script>

	</body>
</html>
