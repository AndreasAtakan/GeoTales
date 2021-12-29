<?php

ini_set('display_errors', 'On'); ini_set('html_errors', 0); error_reporting(-1);

//session_set_cookie_params(['SameSite' => 'None', 'Secure' => true]);
session_start();

include "init_sso.php";

?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta http-equiv="x-ua-compatible" content="ie=edge" />
		<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, shrink-to-fit=no, target-densitydpi=device-dpi" />

		<title>TellUs – Map stories</title>
		<meta name="title" content="TellUs" />
		<meta name="description" content="Map stories" />

		<link rel="icon" href="assets/logo.jpg" />

		<!-- Load lib/ CSS -->
		<link rel="stylesheet" href="lib/fontawesome/css/all.min.css" />
		<link rel="stylesheet" href="lib/jquery-ui/jquery-ui.min.css" />
		<link rel="stylesheet" href="lib/bootstrap/css/bootstrap.min.css" />

		<!-- Load src/ CSS -->
		<link rel="stylesheet" href="src/css/main.css" />

		<style type="text/css">
			html, body {
				/**/
			}

			img#jumbotron {
				width: 100%;
				max-height: 650px;
				object-fit: cover;
				filter: blur(3px);
			}
			#jumbotron-text {
				position: absolute;
				top: 200px;
				left: 20%;

				color: white;
				text-shadow: #333 1px 1px 3px;
				-webkit-font-smoothing: antialiased;
				font-family: Helvetica Neue,Helvetica,Arial,sans-serif;
			}

			#map-preview {
				color: white;
				text-shadow: #000 1px 1px 3px;
				-webkit-font-smoothing: antialiased;
			}
			#map-preview img {
				filter: blur(1px);
			}
			#map-preview .card:hover { cursor: pointer; }
		</style>
	</head>
	<body>

		<header>
			<nav class="navbar navbar-expand-sm navbar-dark fixed-top shadow px-2 px-sm-3 py-1" style="background-color: #563d7c;">
				<div class="container">
					<a class="navbar-brand" href="index.php">
						<img id="logo" src="assets/logo.jpg" alt="TellUs" width="30" height="30" />
					</a>

					<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
						<span class="navbar-toggler-icon"></span>
					</button>

					<div class="collapse navbar-collapse" id="navbarContent">
						<ul class="navbar-nav mb-2 mb-sm-0 px-2 px-sm-0 w-100">
							<li class="nav-item">
								<a class="nav-link" href="index.php">Home</a>
							</li>
							<li class="nav-item me-auto">
								<a class="nav-link active" aria-current="page" href="gallery.php">Gallery</a>
							</li>

							<li class="nav-item me-3">
								<a role="button" class="btn btn-sm btn-outline-light mt-1" href="https://forum.tellusmap.com" target="_blank">Forum</a>
							</li>

							<?php
								if(isset($_SESSION['uid'])) { // logged in
									$username = $_SESSION['username'];
									echo("
										<li class=\"nav-item dropdown\">
											<a class=\"nav-link dropdown-toggle\" href=\"#\" id=\"navbarUserDropdown\" role=\"button\" data-bs-toggle=\"dropdown\" aria-expanded=\"false\">
												<i class=\"fas fa-user\"></i>
											</a>
											<ul class=\"dropdown-menu dropdown-menu-sm-end\" aria-labelledby=\"navbarUserDropdown\">
												<li><a class=\"dropdown-item\" href=\"projects.php\">Projects</a></li>
												<li><a class=\"dropdown-item\" href=\"https://forum.tellusmap.com/u/$username/preferences/account\" target=\"_blank\">My profile</a></li>
												<li><a class=\"dropdown-item\" href=\"settings.php\">Settings</a></li>
												<li><hr class=\"dropdown-divider\"></li>
												<li><a class=\"dropdown-item\" href=\"logout.php\">Log out</a></li>
											</ul>
										</li>
									");
								}else{
									$nonce = hash('sha512', mt_rand());
									$_SESSION['nonce'] = $nonce;

									$payload = base64_encode(http_build_query(array('nonce' => $nonce, 'return_sso_url' => 'https://'.$_SERVER['HTTP_HOST'].'/login.php')));
									$query = http_build_query(array('sso' => $payload, 'sig' => hash_hmac('sha256', $payload, $sso_secret)));
									$url = "https://forum.tellusmap.com/session/sso_provider?$query";

									echo("
										<li class=\"nav-item\">
											<a role=\"button\" class=\"btn btn-sm btn-light mt-1\" href=\"login.php\" target=\"_blank\">Login</a>
										</li>
									");
								}
							?>
						</ul>
					</div>
				</div>
			</nav>
		</header>

		<main role="main" style="margin-top: calc(3rem + 50px);">
			<div class="container" id="main">
				<div class="row my-5">
					<div class="col">
						<hr />
					</div>
				</div>

				<div class="row mx-auto" style="max-width: 950px;">
					<div class="col">
						<h4>Map gallery</h4>
					</div>
				</div>

				<div class="row my-5">
					<div class="col">
						<hr />
					</div>
				</div>

			</div>
		</main>

		<footer class="py-5 mt-5 shadow" style="background-color: #e6e6e6;">
			<div class="container">
				<div class="row">
					<div class="col">
						<p class="text-muted">© <a class="text-decoration-none" href="https://tellusmap.com">tellusmap.com</a> – all rights reserved</p>
					</div>
					<div class="col">
						<center>
							<img id="logo" src="assets/logo.jpg" alt="TellUs" width="60" height="60" />
						</center>
					</div>
					<div class="col">
						<p class="text-muted text-end"><a class="text-decoration-none" href="mailto:contact@tellusmap.com">contact@tellusmap.com</a></p>
						<p class="text-muted text-end"><a class="text-decoration-none" href="tel:+4748006325">+47 48 00 63 25</a></p>
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
		<script type="text/javascript" src="src/js/main.js"></script>

	</body>
</html>
