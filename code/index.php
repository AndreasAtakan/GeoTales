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

include "api/init.php";
include_once("api/helper.php");

$logged_in = false;
if(isset($_SESSION['uid']) && validUID($PDO, $_SESSION['uid'])) {
	$logged_in = true;
	$username = $_SESSION['username'];
	$avatar = getAvatar($CONFIG['forum_host'], $username);
}


// Get top posts
$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_URL, "https://{$CONFIG['forum_host']}/c/public-maps/5.json");
$res = curl_exec($ch);
curl_close($ch);
$res = json_decode($res, true);
$res = $res['topic_list']['topics'];

function s($a, $b) { return $b['views'] - $a['views']; }
uasort($res, "s");

$posts = array(); $i = 0;
foreach($res as $r) {
	if($i > 15) { break; } $i++;
	$url = "https://{$CONFIG['forum_host']}/t/{$r['slug']}/{$r['id']}";
	$posts[ $url ] = array( "views" => $r['views'], "likes" => $r['like_count'] );
}

$urls = array();
foreach($posts as $url => $val) { array_push($urls, "'{$url}'"); }
$urls = implode(', ', $urls);

$stmt = $PDO->prepare("
	SELECT
		M.id AS id,
		M.title AS title,
		M.description AS description,
		M.created AS created,
		M.post AS post,
		M.preview AS preview
	FROM
		\"Map\" AS M
	WHERE
		M.post IN ({$urls})
	ORDER BY
		M.created DESC
");
$stmt->execute();
$rows = $stmt->fetchAll();
$count = $stmt->rowCount();

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
		<link rel="stylesheet" href="src/main.css" />

		<style type="text/css">
			html, body {
				/**/
			}

			main {
				background-image: url('assets/jumbotron.png');
				background-size: contain;
				background-repeat: no-repeat;
			}

			#header-text {
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
						<img src="assets/logo.png" alt="GeoTales" width="30" height="30" />
					</a>

					<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
						<span class="navbar-toggler-icon"></span>
					</button>

					<div class="collapse navbar-collapse" id="navbarContent">
						<ul class="navbar-nav mb-2 mb-sm-0 px-2 px-sm-0 w-100">
							<li class="nav-item<?php if(!$logged_in) { echo " me-auto"; } ?>">
								<a class="nav-link active" aria-current="page" href="index.php">Gallery</a>
							</li>

					<?php
						if($logged_in) {
					?>
							<li class="nav-item me-auto">
								<a class="nav-link" href="maps.php">My maps</a>
							</li>
							<li class="nav-item dropdown">
								<a class="nav-link dropdown-toggle" href="#" id="navbarUserDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
									<img class="rounded" src="<?php echo $avatar; ?>" alt="&nbsp;" width="30" height="30" />
								</a>
								<ul class="dropdown-menu dropdown-menu-sm-end" aria-labelledby="navbarUserDropdown">
									<li><a class="dropdown-item" href="<?php echo "https://{$CONFIG['forum_host']}/u/{$username}/preferences/account"; ?>">Profile</a></li>
									<li><a class="dropdown-item" href="settings.php">Settings</a></li>
									<li><hr class="dropdown-divider"></li>
									<li><a class="dropdown-item" href="logout.php">Log out</a></li>
								</ul>
							</li>
					<?php
						}else{
					?>
							<li class="nav-item">
								<a role="button" class="btn btn-sm btn-light mt-1" href="login.php">Login</a>
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
			<div class="container" id="main">
				<div class="row my-5">
					<div class="col"></div>
				</div>

				<div class="row" id="header-text">
					<div class="col-sm-9">
						<h2 class="text-muted">GeoTales – Map stories</h2>
					</div>
					<div class="col-sm-3 mt-3">
						<div class="d-grid" style="text-shadow: none;">
							<a role="button" href="login.php?return_url=stage.php" class="btn btn-lg btn-info" style="color: white;">Create map</a>
						</div>
						<p class="text-muted text-center mt-2">Create your own map for <strong>free</strong></p>
					</div>
				</div>

				<div class="row my-5">
					<div class="col"></div>
				</div>

				<div class="row">
					<div class="col">
						<form method="get" action="<?php echo "https://{$CONFIG['forum_host']}/search"; ?>" id="search">
							<input type="hidden" name="expanded" value="true" />
							<input type="hidden" name="q" value="" />
							<div class="input-group" style="max-width: 650px;">
								<input type="text" class="form-control" name="none" placeholder="Search title" aria-label="search" aria-describedby="search-button" />
								<button type="submit" class="btn btn-outline-secondary" id="search-button">Search</button>
							</div>
						</form>
					</div>
				</div>

				<div class="row my-5">
					<div class="col"></div>
				</div>

				<div class="row my-2">
					<div class="col">
						<h5 class="text-muted">Top 15 most popular maps</h5>
					</div>
				</div>

				<div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
		<?php
			if($count > 0) {
				foreach($rows as $row) {
					$created = date_format(date_create($row['created']), "d.M Y, H:i");
					$views = $posts[ $row['post'] ]['views'];
					$likes = $posts[ $row['post'] ]['likes'];
		?>
					<div class="col">
						<div class="card">
							<a class="text-decoration-none" href="<?php echo $row['post']; ?>">
								<img src="<?php echo $row['preview']; ?>" class="card-img-top" alt="&nbsp;">
								<div class="card-body">
									<h5 class="card-title" style="color: black;"><?php echo $row['title']; ?></h5>
									<h6 class="card-subtitle mb-2 text-muted"><?php echo $created; ?></h6>
									<span class="badge bg-primary">Views: <?php echo $views; ?></span>
									<span class="badge bg-secondary">Likes: <?php echo $likes; ?></span>
								</div>
							</a>
						</div>
					</div>
		<?php
				}
		?>
					<div class="col">
						<div class="card">
							<div class="card-body">
								<div class="d-grid">
									<a role="button" class="btn btn-lg btn-outline-secondary" href="<?php echo "https://{$CONFIG['forum_host']}/c/public-maps/5"; ?>">
										Browse more maps
									</a>
								</div>
							</div>
						</div>
					</div>
		<?php
			}else{
		?>
					<div class="col">
						<p class="text-muted text-center">No maps found</p>
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

				<div class="row">
					<div class="col">
						<p class="small text-muted">
							For technical questions,
							please contact us at <a href="mailto:contact@tellusmap.com">contact@tellusmap.com</a>
						</p>
						<p class="small text-muted">
							Do you have feedback you want to share?
							<a href="<?php echo "https://{$CONFIG['forum_host']}/c/feedback/2"; ?>">Let us know</a>!
						</p>
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
								<a role="button" class="btn btn-outline-light" href="#" target="_blank">
									<i class="fab fa-facebook" style="color: #4267b2;"></i>
								</a>
								<a role="button" class="btn btn-outline-light" href="https://twitter.com/tellusmap" target="_blank">
									<i class="fab fa-twitter" style="color: #1da1f2;"></i>
								</a>
								<a role="button" class="btn btn-outline-light" href="#" target="_blank">
									<i class="fab fa-linkedin" style="color: #0072b1;"></i>
								</a>
							</div>
						</center>
					</div>
					<div class="col-sm-4 mt-2">
						<center>
							<img class="d-none d-sm-block" src="assets/logo.png" alt="GeoTales" width="40" height="40" />
						</center>
					</div>
					<div class="col-sm-4 mt-2">
						<p class="text-muted text-center">© <?php echo date("Y"); ?> <a class="text-decoration-none" href="<?php echo "https://{$CONFIG['host']}"; ?>"><?php echo $CONFIG['host']; ?></a> – all rights reserved</p>
						<p class="text-muted text-center"><a class="text-decoration-none" href="<?php echo "mailto:{$CONFIG['email']}"; ?>"><?php echo $CONFIG['email']; ?></a></p>
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
		<script type="text/javascript" src="src/index.js"></script>

	</body>
</html>
