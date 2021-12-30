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
				top: 15vw;
				left: 20%;

				color: white;
				text-shadow: #333 1px 1px 3px;
				-webkit-font-smoothing: antialiased;
				font-family: Helvetica Neue,Helvetica,Arial,sans-serif;
			}

			#map-preview {
				text-shadow: #000 1px 1px 3px;
				-webkit-font-smoothing: antialiased;
			}
			#map-preview img { filter: blur(1px); }
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
								<a class="nav-link active" aria-current="page" href="index.php">Home</a>
							</li>
							<li class="nav-item me-auto">
								<a class="nav-link" href="https://forum.tellusmap.com/c/public-maps/5" target="_blank">Gallery</a>
							</li>

							<li class="nav-item me-3">
								<a role="button" class="btn btn-sm btn-outline-light mt-1" href="https://forum.tellusmap.com" target="_blank">Forum</a>
							</li>

							<?php
								if(isset($_SESSION['uid'])) { // logged in
									$username = $_SESSION['username'];
							?>
									<li class="nav-item dropdown">
										<a class="nav-link dropdown-toggle" href="#" id="navbarUserDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
											<i class="fas fa-user"></i>
										</a>
										<ul class="dropdown-menu dropdown-menu-sm-end" aria-labelledby="navbarUserDropdown">
											<li><a class="dropdown-item" href="projects.php">Projects</a></li>
											<li><a class="dropdown-item" href="https://forum.tellusmap.com/u/<?php print($username); ?>/preferences/account" target="_blank">My profile</a></li>
											<li><a class="dropdown-item" href="settings.php">Settings</a></li>
											<li><hr class="dropdown-divider"></li>
											<li><a class="dropdown-item" href="logout.php">Log out</a></li>
										</ul>
									</li>
							<?php
								}else{
									$nonce = hash('sha512', mt_rand());
									$_SESSION['nonce'] = $nonce;

									$payload = base64_encode(http_build_query(array('nonce' => $nonce, 'return_sso_url' => 'https://'.$_SERVER['HTTP_HOST'].'/login.php')));
									$query = http_build_query(array('sso' => $payload, 'sig' => hash_hmac('sha256', $payload, $sso_secret)));
									$url = "https://forum.tellusmap.com/session/sso_provider?$query";

							?>
									<li class="nav-item">
										<a role="button" class="btn btn-sm btn-light mt-1" href="<?php /*print($url);*/ print("login.php"); ?>">Login</a>
									</li>
							<?php
								}
							?>
						</ul>
					</div>
				</div>
			</nav>
		</header>

		<main role="main">
			<div class="container-fluid p-0">
				<img class="img-fluid shadow" src="assets/jumbotron.png" alt="map" id="jumbotron" />

				<div class="row" id="jumbotron-text">
					<div class="col">
						<h1 class="display-3">TellUs</h1>
						<h2 class="ms-2">Map stories</h2>
					</div>
				</div>
			</div>

			<div class="container" id="main">
				<div class="row my-5">
					<div class="col">
						<hr />
					</div>
				</div>

				<div class="row mx-auto" style="max-width: 950px;">
					<div class="col">
						<h4>
							TellUs is a map-based tool designed to tell stories.
							Create incredible maps for presentations, as a teaching-tool or for your personal stories.
						</h4>
					</div>
				</div>

				<div class="row my-5">
					<div class="col">
						<hr />
					</div>
				</div>

				<div class="row row-cols-1 row-cols-md-2 g-4" id="map-preview">
					<div class="col">
						<div class="card">
							<img src="assets/map-preview-1.png" class="card-img" alt="map-preview-1" />
							<a class="text-decoration-none text-light" href="#" target="_blank">
								<div class="card-img-overlay">
									<h3 class="card-title">Map of Saint Paul's journey to Rome</h3>
									<p class="card-text">Click the image to open demo map</p>
								</div>
							</a>
						</div>
					</div>
					<div class="col">
						<div class="card">
							<img src="assets/map-preview-2.png" class="card-img" alt="map-preview-2" />
							<a class="text-decoration-none text-light" href="#" target="_blank">
								<div class="card-img-overlay">
									<h3 class="card-title">Visual presentation of the Wars of the Roses</h3>
									<p class="card-text">Click the image to open demo map</p>
								</div>
							</a>
						</div>
					</div>
				</div>

				<div class="row my-5">
					<div class="col">
						<hr />
					</div>
				</div>

				<div class="row mx-auto" style="max-width: 950px;">
					<div class="col">
						<h2>TellUs is the perfect tool for:</h2>
					</div>
				</div>

				<div class="row mx-auto mt-3 g-4" style="max-width: 950px;">
					<div class="col-sm-6 col-md-3">
						<h4>
							<i class="fas fa-chalkboard-teacher" style="color: #080;"></i> <br />
							Teachers and lecturers
						</h4>
					</div>
					<div class="col-sm-6 col-md-3">
						<h4>
							<i class="fas fa-graduation-cap" style="color: #e60000;"></i> <br />
							Students and academics
						</h4>
					</div>
					<div class="col-sm-6 col-md-3">
						<h4>
							<i class="fas fa-sitemap" style="color: #00f;"></i> <br />
							Genealogists
						</h4>
					</div>
					<div class="col-sm-6 col-md-3">
						<h4>
							<i class="fas fa-users" style="color: #e69500;"></i> <br />
							Conferences
						</h4>
					</div>
				</div>

				<div class="row my-5">
					<div class="col">
						<hr />
					</div>
				</div>

				<div class="row mx-auto" style="max-width: 950px;">
					<div class="col">
						<h2>Pricing</h2>
					</div>
				</div>

				<div class="row mx-auto mt-2 g-4" style="max-width: 950px;">
					<div class="col-sm-6">
						<div class="card">
							<div class="card-body">
								<h4 class="card-title">Single user</h4>
								<h6 class="card-subtitle mb-4"><em>$15 / month</em></h6>

								<p class="card-text">
									<i class="fas fa-check"></i> All map features
								</p>
								<p class="card-text">
									<i class="fas fa-check"></i> Unlimited projects
								</p>
								<p class="card-text">
									<i class="fas fa-check"></i> Share and publish projects
								</p>
								<p class="card-text">
									<i class="fas fa-check"></i> Forum priority account
								</p>

								<div class="d-grid mt-4">
									<a role="button" class="btn btn-secondary" href="login.php">Sign up</a>
								</div>
							</div>
						</div>
					</div>
					<div class="col-sm-6">
						<div class="card">
							<div class="card-body">
								<h4 class="card-title">Organization</h4>
								<h6 class="card-subtitle mb-4"><em>Contact sales</em></h6>

								<p class="card-text">
									<i class="fas fa-check"></i> All map features
								</p>
								<p class="card-text">
									<i class="fas fa-check"></i> Unlimited projects
								</p>
								<p class="card-text">
									<i class="fas fa-check"></i> Share and publish projects
								</p>
								<p class="card-text">
									<i class="fas fa-check"></i> Forum priority account
								</p>
								<p class="card-text">
									<i class="fas fa-check"></i> Dedicated support
								</p>
								<p class="card-text">
									<i class="fas fa-check"></i> Dedicated server
								</p>
								<p class="card-text">
									<i class="fas fa-check"></i> Much more...
								</p>

								<div class="d-grid mt-4">
									<a role="button" class="btn btn-secondary" href="mailto:contact@tellusmap.com">Contact sales</a>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="row my-5">
					<div class="col">
						<hr />
					</div>
				</div>

				<div class="row mx-auto" style="max-width: 950px;">
					<div class="col">
						<h2 class="text-center">Sign up and get a free 30-day trial</h2>
					</div>
				</div>

				<div class="row mx-auto mt-5" style="max-width: 450px;">
					<div class="col">
						<div class="d-grid">
							<a role="button" class="btn btn-lg btn-primary" href="login.php">Sign up</a>
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

		<footer class="py-5 mt-5 shadow" style="background-color: #e6e6e6;">
			<div class="container">
				<div class="row">
					<div class="col-sm-4 mt-2">
						<p class="text-muted text-center">© <a class="text-decoration-none" href="https://tellusmap.com">tellusmap.com</a> – all rights reserved</p>
					</div>
					<div class="col-sm-4 mt-2">
						<center>
							<img class="d-none d-sm-block" id="logo" src="assets/logo.jpg" alt="TellUs" width="60" height="60" />
						</center>
					</div>
					<div class="col-sm-4 mt-2">
						<p class="text-muted text-center"><a class="text-decoration-none" href="mailto:contact@tellusmap.com">contact@tellusmap.com</a></p>
						<p class="text-muted text-center"><a class="text-decoration-none" href="tel:+4748006325">+47 48 00 63 25</a></p>
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
