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

$username = $_SESSION['username'];

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

		<link rel="icon" href="assets/logo.png" />

		<!-- Load lib/ CSS -->
		<link rel="stylesheet" href="lib/fontawesome/css/all.min.css" />
		<link rel="stylesheet" href="lib/jquery-ui/jquery-ui.min.css" />
		<link rel="stylesheet" href="lib/bootstrap/css/bootstrap.min.css" />

		<!-- Load src/ CSS -->
		<link rel="stylesheet" href="src/main.css" />

		<style type="text/css">
			html, body {
				/**/
			}

			main {
				margin-top: calc(3rem + 50px);
			}
		</style>
	</head>
	<body>

		<header>
			<nav class="navbar navbar-expand-sm navbar-dark fixed-top shadow px-2 px-sm-3 py-1" style="background-color: #eba937;">
				<div class="container">
					<a class="navbar-brand" href="index.php">
						<img src="assets/logo.png" alt="TellUs" width="30" height="30" />
					</a>

					<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
						<span class="navbar-toggler-icon"></span>
					</button>

					<div class="collapse navbar-collapse" id="navbarContent">
						<ul class="navbar-nav mb-2 mb-sm-0 px-2 px-sm-0 w-100">
							<li class="nav-item">
								<a class="nav-link" href="index.php">Gallery</a>
							</li>
							<li class="nav-item me-auto">
								<a class="nav-link" href="maps.php">My maps</a>
							</li>

							<li class="nav-item dropdown">
								<a class="nav-link dropdown-toggle" href="#" id="navbarUserDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
									<i class="fas fa-user"></i>
								</a>
								<ul class="dropdown-menu dropdown-menu-sm-end" aria-labelledby="navbarUserDropdown">
									<li><a class="dropdown-item" href="https://forum.tellusmap.com/u/<?php echo $username; ?>/preferences/account">Profile</a></li>
									<li><a class="dropdown-item active" href="settings.php">Settings</a></li>
									<li><hr class="dropdown-divider"></li>
									<li><a class="dropdown-item" href="logout.php">Log out</a></li>
								</ul>
							</li>
						</ul>
					</div>
				</div>
			</nav>
		</header>

		<main role="main">
			<div class="container" id="main">
				<div class="row my-5">
					<div class="col">
						<hr />
					</div>
				</div>

				<div class="row mx-auto" style="max-width: 950px;">
					<div class="col">
						<h3>Add payment method</h3>
					</div>
				</div>

				<div class="row mx-auto" style="max-width: 950px;">
					<div class="col">
						<form>
							<div class="row my-3">
								<div class="col">
									<label for="cardInput" class="form-label">Card number</label>
									<input type="number" class="form-control" id="cardInput" aria-describedby="cardHelp" />
									<div id="cardHelp" class="form-text">12-digit number</div>
								</div>
							</div>
							<div class="row my-3">
								<div class="col-6">
									<label for="expiryInput" class="form-label">Expiry date</label>
									<div class="input-group">
										<input type="number" class="form-control" id="expiryMonthInput" placeholder="Month" aria-label="Month" aria-describedby="expiryInput" min="1" max="12" />
										<input type="number" class="form-control" id="expiryYearInput" placeholder="Year" aria-label="Year" aria-describedby="expiryInput" min="2010" />
									</div>
								</div>
								<div class="col-6">
									<label for="cvvInput" class="form-label">CVV</label>
									<input type="number" class="form-control" id="cvvInput" />
								</div>
							</div>
							<button type="button" class="btn btn-primary">Save</button> <!-- type="submit" -->
						</form>
					</div>
				</div>

				<div class="row my-5">
					<div class="col">
						<hr />
					</div>
				</div>

			</div>
		</main>

		<footer class="py-3 shadow" style="background-color: #e6e6e6;">
			<div class="container">
				<div class="row">
					<div class="col-sm-4 mt-2">
						<p class="text-muted text-center">© <a class="text-decoration-none" href="https://tellusmap.com">tellusmap.com</a> – all rights reserved</p>
					</div>
					<div class="col-sm-4 mt-2">
						<center>
							<img class="d-none d-sm-block" src="assets/logo.png" alt="TellUs" width="60" height="60" />
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
		<!--script type="text/javascript" src="src/settings.js"></script-->

	</body>
</html>
