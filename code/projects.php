<?php

ini_set('display_errors', 'On'); ini_set('html_errors', 0); error_reporting(-1);

//session_set_cookie_params(['SameSite' => 'None', 'Secure' => true]);
session_start();

if(!isset($_SESSION['uid'])) { // Not logged in
	header("location: index.php");
	exit;
}

include "init_db.php";

$uid = $_SESSION['uid'];
$username = $_SESSION['username'];

$stmt = $pdo->prepare("
	SELECT
		P.pid AS pid,
		P.title AS title,
		P.description AS description,
		P.created AS created,
		PU.url AS url
	FROM
		\"User_Project\" AS UP INNER JOIN
		\"Project\" AS P
			ON UP.pid = P.pid LEFT OUTER JOIN
		\"Public\" AS PU
			ON P.pid = PU.pid
	WHERE
		UP.status IN ('owner', 'editor') AND
		UP.uid = ?
");
$stmt->execute([$uid]);
$rows = $stmt->fetchAll();

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
								<a class="nav-link" href="https://forum.tellusmap.com/c/public-maps/5" target="_blank">Gallery</a>
							</li>

							<li class="nav-item me-3">
								<a role="button" class="btn btn-sm btn-outline-light mt-1" href="https://forum.tellusmap.com" target="_blank">Forum</a>
							</li>

							<li class="nav-item dropdown">
								<a class="nav-link dropdown-toggle" href="#" id="navbarUserDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
									<i class="fas fa-user"></i>
								</a>
								<ul class="dropdown-menu dropdown-menu-sm-end" aria-labelledby="navbarUserDropdown">
									<li><a class="dropdown-item" href="projects.php">Projects</a></li>
									<li><a class="dropdown-item" href="<?php print("https://forum.tellusmap.com/u/$username/preferences/account"); ?>" target="_blank">My profile</a></li>
									<li><a class="dropdown-item" href="settings.php">Settings</a></li>
									<li><hr class="dropdown-divider"></li>
									<li><a class="dropdown-item" href="logout.php">Log out</a></li>
								</ul>
							</li>
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
						<form>
							<div class="row mb-3">
								<div class="col-sm-5 order-sm-2 mb-4 mb-sm-0">
									<button type="button" class="btn btn-lg btn-primary float-sm-end mt-2 mt-sm-0">New project</button>
								</div>
								<div class="col-sm-7 order-sm-1">
									<div class="input-group">
										<input type="text" class="form-control" id="search" placeholder="Search title" aria-label="search" aria-describedby="search-button" />
										<button class="btn btn-outline-secondary" type="button" id="search-button">Search</button>
									</div>
								</div>
							</div>
							<div class="row">
								<div class="col">
									<span class="text-muted me-2">Sort by</span>

									<div class="btn-group btn-group-sm" role="group" aria-label="Sort by">
										<input type="radio" class="btn-check" name="sortby" id="sortbyTitle" autocomplete="off" checked>
										<label class="btn btn-outline-secondary" for="sortbyTitle">Title</label>

										<input type="radio" class="btn-check" name="sortby" id="sortbyCreated" autocomplete="off">
										<label class="btn btn-outline-secondary" for="sortbyCreated">Created date</label>
									</div>
								</div>
							</div>
						</form>
					</div>
				</div>

				<div class="row my-5">
					<div class="col"></div>
				</div>

				<div class="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-3" id="projects">
					<?php
						foreach($rows as $row) {
							$created = date_format(date_create($row['created']), "d.M Y, H:i");
					?>
							<div class="col">
								<div class="card">
									<div class="card-body">
										<h5 class="card-title"><?php print($row['title']); ?></h5>
										<h6 class="card-subtitle mb-2 text-muted"><?php print($created); ?></h6>
										<p class="card-text"><?php print($row['description']); ?></p>
										<div class="row">
											<div class="col">
												<a role="button" class="btn btn-sm btn-outline-secondary" href="edit.php?pid=<?php print($row['pid']); ?>" target="_blank">Open project</a>
											</div>
											<div class="col">
												<div class="dropdown float-end">
													<button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="optionsDropdown" data-bs-toggle="dropdown" aria-expanded="false">
														<i class="fas fa-pen"></i>
													</button>
													<ul class="dropdown-menu dropdown-menu-end" aria-labelledby="optionsDropdown">
														<li><button type="button" class="dropdown-item">Edit title</button></li>
														<li><button type="button" class="dropdown-item">Edit description</button></li>
														<li>
														<?php
															if(is_null($row['url'])) {
																?><button type="button" class="dropdown-item">Publish map</button><?php
															}else{
																?><a class="dropdown-item" href="<?php print($row['url']); ?>" target="_blank">View public post</a><?php
															}
														?>
														</li>
														<li><hr class="dropdown-divider"></li>
														<li><button type="button" class="dropdown-item">Delete</button></li>
													</ul>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
					<?php
						}
					?>
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
