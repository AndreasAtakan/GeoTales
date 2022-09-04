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
	$username = getUsername($PDO, $user_id);
	$photo = getUserPhoto($PDO, $user_id);
}


// Get top posts
$search = "%";
if(isset($_GET['search'])) { $search .= "{$_GET['search']}%"; }
$order = $_GET['order'] ?? "views";

$likes = getAllLikes($PDO); $views = getAllViews($PDO);
$stmt = $PDO->prepare("
	SELECT
		M.id AS id,
		M.title AS title,
		M.description AS description,
		M.published_date AS published_date,
		M.thumbnail AS thumbnail,
		U.id AS user_id,
		U.photo AS user_photo
	FROM
		\"Map\" AS M INNER JOIN
		\"User_Map\" AS UM
			ON UM.map_id = M.id INNER JOIN
		\"User\" AS U
			ON UM.user_id = U.id
	WHERE
		M.published_date IS NOT NULL AND
		UM.status = 'owner' AND
		LOWER(M.title) LIKE LOWER(?) OR
		true
	LIMIT 150
");
$stmt->execute([$search]);
$rows = $stmt->fetchAll();
$count = $stmt->rowCount();

$res = array();
foreach($rows as $row) {
	$r = $row;
	$r['likes'] = $likes[ $row['id'] ] ?? 0;
	$r['views'] = $views[ $row['id'] ] ?? 0;
	array_push($res, $r);
}

if($order == "views") { usort($res, function($a, $b) { return $a['views'] - $b['views']; }); }
if($order == "likes") { usort($res, function($a, $b) { return $a['likes'] - $b['likes']; }); }
if($order == "date") { usort($res, function($a, $b) { return date_format(date_create($a['published_date']), "U") - date_format(date_create($b['published_date']), "U"); }); }

?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta http-equiv="x-ua-compatible" content="ie=edge" />
		<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, shrink-to-fit=no, target-densitydpi=device-dpi" />

		<title>GeoTales – Map stories</title>
		<meta name="title" content="GeoTales" />
		<meta name="description" content="Map stories" />

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

			.text-shadow {
				text-shadow: #fff -1px 1px 3px;
				-webkit-font-smoothing: antialiased;
			}

			@media (max-width: 575.98px) {
				/**/
			}
		</style>
	</head>
	<body>

		<header>
			<nav class="navbar navbar-expand-sm navbar-dark fixed-top shadow px-2 px-sm-3 py-1" style="background-color: #eba937;">
				<div class="container">
					<a class="navbar-brand" href="index.php">
						<img src="assets/logo.png" alt="GeoTales" width="auto" height="30" />
						GeoTales
					</a>

					<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
						<span class="navbar-toggler-icon"></span>
					</button>

					<div class="collapse navbar-collapse" id="navbarContent">
						<ul class="navbar-nav mb-2 mb-sm-0 px-2 px-sm-0 w-100">
							<li class="nav-item">
								<a class="nav-link active" aria-current="page" href="index.php">
									<i class="fas fa-home"></i> Home
								</a>
							</li>
							<li class="nav-item me-sm-auto">
								<a class="nav-link" href="pricing.php">
									<i class="fas fa-tag"></i> Pricing
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

				<div class="row">
					<div class="col-sm-9">
						<form method="get">
							<div class="input-group mb-1" style="max-width: 650px;">
								<a role="button" class="btn btn-outline-secondary" href="index.php" title="Clear search"><i class="fas fa-minus"></i></a>
								<input type="text" class="form-control" name="search" placeholder="Search title" aria-label="search" aria-describedby="search-button" value="<?php echo $_GET['search'] ?? ""; ?>" />
								<button type="submit" class="btn btn-outline-light" id="search-button">Search</button>
							</div>
							<div class="input-group" style="max-width: 150px; margin-left: 40px;">
								<select class="form-select form-select-sm" name="order" aria-label="Sort by">
									<option value="" selected disabled>Sort by</option>
									<option value="views">Views</option>
									<option value="likes">Likes</option>
									<option value="date">Date</option>
								</select>
							</div>
						</form>
					</div>
					<div class="col-sm-3 mt-sm-0 mt-4">
						<div class="d-grid" style="text-shadow: none;">
							<a role="button" class="btn btn-info" href="stage.php" style="color: white;">Create</a>
						</div>
						<p class="text-muted text-center text-shadow mt-2">Create your own GeoTale for <strong>free</strong></p>
					</div>
				</div>

				<div class="row my-4">
					<div class="col"></div>
				</div>

				<div class="row mb-2">
					<div class="col">
						<h5 class="text-muted text-shadow">Most popular GeoTales</h5>
					</div>
				</div>

				<div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
		<?php
			if($count > 0) {
				foreach($res as $row) {
					$href = "pres.php?id={$row['id']}";
					$published_date = date_format(date_create($row['published_date']), "d.M Y, H:i");
		?>
					<div class="col">
						<div class="card">
							<a class="text-decoration-none" href="<?php echo $href; ?>">
								<img src="<?php echo $row['thumbnail']; ?>" class="card-img-top" alt="&nbsp;" />
								<div class="card-body">
									<h5 class="card-title" style="color: black;"><?php echo $row['title']; ?></h5>
									<h6 class="card-subtitle mb-2 text-muted"><?php echo $published_date; ?></h6>
									<span class="badge rounded-pill bg-primary">Views: <?php echo $row['views']; ?></span>
									<span class="badge rounded-pill bg-secondary">Likes: <?php echo $row['likes']; ?></span>
							<?php if(!sane_is_null($row['user_photo'])) { ?>
									<img class="rounded ms-2 float-end" src="<?php echo $row['user_photo']; ?>" width="30" height="auto" alt="&nbsp" />
							<?php } ?>
								</div>
							</a>
						</div>
					</div>
		<?php
				}
			}else{
		?>
					<div class="col">
						<p class="text-muted text-center text-shadow">None found</p>
					</div>
		<?php
			}
		?>
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
							<a class="text-decoration-none" href="<?php echo "mailto:{$CONFIG['email']}"; ?>"><?php echo $CONFIG['email']; ?></a>
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
					url: "api/analytics.php",
					data: { "agent": window.navigator ? window.navigator.userAgent : "" },
					dataType: "json",
					success: function(result, status, xhr) { console.log("Analytics registered"); },
					error: function(xhr, status, error) { console.log(xhr.status, error); }
				});

			};
		</script>

	</body>
</html>
