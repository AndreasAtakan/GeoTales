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

// Not logged in
if(!isset($_SESSION['uid']) || !validUID($PDO, $_SESSION['uid'])) {
	header("location: login.php?return_url=maps.php"); exit;
}
$uid = $_SESSION['uid'];
$username = $_SESSION['username'];
$avatar = getAvatar($CONFIG['forum_host'], $username);

$title = "%";
if(isset($_GET['title'])) { $title .= "{$_GET['title']}%"; }

$stmt = $PDO->prepare("
	SELECT
		M.id AS id,
		M.title AS title,
		M.description AS description,
		M.created AS created,
		M.post AS post,
		M.preview AS preview
	FROM
		\"User_Map\" AS UM INNER JOIN
		\"Map\" AS M
			ON UM.map_id = M.id
	WHERE
		UM.status IN ('owner', 'editor') AND
		UM.user_id = ? AND
		lower(M.title) LIKE lower(?)
	ORDER BY
		M.created DESC
");
$stmt->execute([$uid, $title]);
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
				margin-top: calc(3rem + 50px);
			}
		</style>
	</head>
	<body>

		<!-- New map modal -->
		<div class="modal fade" id="newModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" tabindex="-1" aria-labelledby="newModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-scrollable modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="newModalLabel">New map</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<div class="container-fluid">
							<div class="row mb-3">
								<div class="col">
									<label for="titleInput" class="form-label">Title</label>
									<input type="text" class="form-control" id="titleInput" aria-describedby="titleHelp" maxlength="65" />
									<div id="titleHelp" class="form-text">Max 65 characters</div>
								</div>
							</div>

							<div class="row mb-3">
								<div class="col">
									<label for="descriptionInput" class="form-label">Description</label>
									<textarea class="form-control" id="descriptionInput" rows="5" aria-describedby="descriptionHelp"></textarea>
									<div id="descriptionHelp" class="form-text">Arbitrary length</div>
								</div>
							</div>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
						<button type="button" class="btn btn-primary" id="create">Create map</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Edit map modal -->
		<div class="modal fade" id="editModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-scrollable modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="editModalLabel">Change attributes</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<div class="container-fluid">
							<div class="row mb-3">
								<div class="col">
									<label for="titleInput" class="form-label">Title</label>
									<input type="text" class="form-control" id="titleInput" aria-describedby="titleHelp" placeholder="Loading..." disabled />
									<div id="titleHelp" class="form-text">Max 65 characters</div>
								</div>
							</div>

							<div class="row mb-3">
								<div class="col">
									<label for="descriptionInput" class="form-label">Description</label>
									<textarea class="form-control" id="descriptionInput" rows="5" aria-describedby="descriptionHelp" placeholder="Loading..." disabled></textarea>
									<div id="descriptionHelp" class="form-text">Arbitrary length</div>
								</div>
							</div>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
						<button type="button" class="btn btn-primary" id="save" data-id="" disabled>Save changes</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Share modal -->
		<div class="modal fade" id="shareModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" tabindex="-1" aria-labelledby="shareModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-scrollable modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="shareModalLabel">Share map</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<div class="container-fluid">
							<div class="row mb-1">
								<div class="col">
									<div class="input-group input-group-lg">
										<input type="text" class="form-control" id="linkInput" aria-label="linkInput" aria-describedby="copyLink" readonly />
										<button class="btn btn-outline-secondary" type="button" id="copyLink" title="Copy to clipboard"><i class="fas fa-copy"></i></button>
									</div>
								</div>
							</div>

							<div class="row">
								<div class="col">
									<div class="input-group input-group-sm">
										<input type="text" class="form-control" id="embedInput" aria-label="embedInput" aria-describedby="copyEmbed" readonly />
										<button class="btn btn-outline-secondary" type="button" id="copyEmbed" title="Copy to clipboard"><i class="fas fa-copy"></i></button>
									</div>
								</div>
							</div>

							<div class="row my-3">
								<hr />
							</div>

							<div class="row">
								<div class="col-7">
									<a role="button" class="btn btn-sm btn-outline-secondary mb-2" href="#" id="publish" data-id=""></a>
									<p class="small text-muted" id="publishText"></p>
								</div>
								<div class="col-1">
									<a role="button" class="btn btn-outline-light" href="#" id="facebook" target="_blank"><i class="fab fa-facebook" style="color: #4267B2;"></i></a>
								</div>
								<div class="col-1">
									<a role="button" class="btn btn-outline-light" href="#" id="twitter" target="_blank"><i class="fab fa-twitter" style="color: #1DA1F2;"></i></a>
								</div>
								<div class="col-1">
									<a role="button" class="btn btn-outline-light" href="#" id="linkedin" target="_blank"><i class="fab fa-linkedin" style="color: #0072b1;"></i></a>
								</div>
								<div class="col-1">
									<a role="button" class="btn btn-outline-light" href="#" id="pinterest" target="_blank"><i class="fab fa-pinterest" style="color: #E60023;"></i></a>
								</div>
								<div class="col-1">
									<a role="button" class="btn btn-outline-light" href="#" id="email"><i class="fas fa-envelope" style="color: grey;"></i></a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Delete modal -->
		<div class="modal fade" id="deleteModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-scrollable modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="deleteModalLabel">Delete map</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<p>Are you sure you want to delete? This can not be undone.</p>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
						<button type="button" class="btn btn-danger" id="deleteConfirm" data-id="">Delete</button>
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



		<header>
			<nav class="navbar navbar-expand-sm navbar-dark fixed-top shadow px-2 px-sm-3 py-1" style="background-color: #eba937;">
				<div class="container">
					<a class="navbar-brand" href="index.php">
						<img src="assets/logo.png" alt="GeoTales" width="auto" height="30" />
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
								<a class="nav-link active" aria-current="page" href="maps.php">My maps</a>
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

				<div class="row">
					<div class="col">
						<form method="get">
							<div class="row mb-2">
								<div class="col-sm-3 order-sm-2 mb-4 mb-sm-0">
									<button type="button" class="btn btn-primary float-sm-end mt-2 mt-sm-0" data-bs-toggle="modal" data-bs-target="#newModal">New map</button>
								</div>
								<div class="col-sm-9 order-sm-1">
									<div class="input-group d-inline-flex" style="max-width: 650px;">
										<a role="button" class="btn btn-outline-secondary" href="maps.php" title="Clear search"><i class="fas fa-minus"></i></a>
										<input type="text" class="form-control" name="title" placeholder="Search title" aria-label="search" aria-describedby="search-button" />
										<button type="submit" class="btn btn-secondary" id="search-button">Search</button>
									</div>
								</div>
							</div>
						</form>
					</div>
				</div>

				<div class="row my-5">
					<div class="col"></div>
				</div>

				<div class="row">
					<div class="col">
						<div class="table-responsive" style="min-height: 300px;">
							<table class="table table-striped table-hover">
						<?php
							if($count > 0) {
						?>
								<caption>List of your maps</caption>
								<thead>
									<tr>
										<th scope="col">#</th>
										<th scope="col"></th>
										<th scope="col"></th>
										<th scope="col"></th>
										<th scope="col"></th>
										<th scope="col"></th>
									</tr>
								</thead>
								<tbody>
						<?php
								foreach($rows as $row) {
									$created = date_format(date_create($row['created']), "d.M Y, H:i");
						?>
									<tr>
										<th style="width: 8.33%;" scope="row">
											<img class="img-fluid" src="<?php echo $row['preview']; ?>" alt="#" />
										</th>
										<td style="width: 16.66%;"><?php echo $row['title']; ?></td>
										<td style="width: 25%; max-width: 65px;" class="text-truncate"><?php echo $row['description']; ?></td>
										<td style="width: 16.66%;"><?php echo $created; ?></td>
										<td style="width: 8.33%;">
											<div class="btn-group btn-group-sm" role="group" aria-label="view-edit">
												<a role="button" class="btn btn-outline-secondary" href="edit.php?id=<?php echo $row['id']; ?>">Edit</a>
												<a role="button" class="btn btn-outline-secondary" href="pres.php?id=<?php echo $row['id']; ?>" target="_blank">View</a>
											</div>
										</td>
										<td style="width: 8.33%;">
											<div class="dropdown float-end">
												<button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="optionsDropdown<?php echo $row['id']; ?>" data-bs-toggle="dropdown" aria-expanded="false">
													<i class="fas fa-ellipsis-v"></i>
												</button>
												<ul class="dropdown-menu dropdown-menu-end" aria-labelledby="optionsDropdown<?php echo $row['id']; ?>">
													<li><button type="button" class="dropdown-item" id="edit" data-id="<?php echo $row['id']; ?>">Change</button></li>
													<li><button type="button" class="dropdown-item" id="share" data-id="<?php echo $row['id']; ?>" data-post="<?php echo $row['post']; ?>">Share</button></li>
													<li><hr class="dropdown-divider"></li>
													<li><button type="button" class="dropdown-item" id="delete" data-id="<?php echo $row['id']; ?>">Delete</button></li>
												</ul>
											</div>
										</td>
									</tr>
						<?php
								}
						?>
								</tbody>
						<?php
							}else{
						?>
								<caption>No maps found</caption>
						<?php
							}
						?>
							</table>
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
							<img class="d-none d-sm-block" src="assets/logo.png" alt="GeoTales" width="auto" height="40" />
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
		<script type="text/javascript" src="src/maps.js"></script>

	</body>
</html>
