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

include "init.php";

$uid = $_SESSION['uid'];
$username = $_SESSION['username'];

$title = "%";
if(isset($_GET['title'])) { $title .= "{$_GET['title']}%"; }

$sql = "
	SELECT
		P.pid AS pid,
		P.title AS title,
		P.description AS description,
		P.created AS created,
		P.post AS post
	FROM
		\"User_Project\" AS UP INNER JOIN
		\"Project\" AS P
			ON UP.pid = P.pid
	WHERE
		UP.status IN ('owner', 'editor') AND
		UP.uid = ? AND
		P.title LIKE ?
	ORDER BY
		P.created DESC
";
$stmt = $pdo->prepare($sql); $stmt->execute([$uid, $title]);
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
		<link rel="stylesheet" href="src/main.css" />

		<style type="text/css">
			html, body {
				/**/
			}

			main {
				margin-top: calc(3rem + 50px);
				margin-bottom: calc(3rem + 120px);
			}

			footer {
				position: fixed;
				bottom: 0;
				width: 100%;
			}
		</style>
	</head>
	<body>

		<!-- New project modal -->
		<div class="modal fade" id="newModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" tabindex="-1" aria-labelledby="newModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-scrollable modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="newModalLabel">New project</h5>
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
						<button type="button" class="btn btn-primary" id="create">Create project</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Edit project modal -->
		<div class="modal fade" id="editModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-scrollable modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="editModalLabel">Edit project</h5>
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
						<button type="button" class="btn btn-primary" id="save" data-pid="" disabled>Save changes</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Delete modal -->
		<div class="modal fade" id="deleteModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-scrollable modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="deleteModalLabel">Delete project</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<p>Are you sure you want to delete? This can not be undone.</p>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
						<button type="button" class="btn btn-danger" id="deleteConfirm" data-pid="">Delete</button>
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

							<li class="nav-item dropdown">
								<a class="nav-link dropdown-toggle" href="#" id="navbarUserDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
									<i class="fas fa-user"></i>
								</a>
								<ul class="dropdown-menu dropdown-menu-sm-end" aria-labelledby="navbarUserDropdown">
									<li><a class="dropdown-item" href="projects.php">Projects</a></li>
									<li><a class="dropdown-item" href="<?php echo "https://forum.tellusmap.com/u/$username/preferences/account"; ?>" target="_blank">My profile</a></li>
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

				<div class="row mx-auto" style="max-width: 950px;">
					<div class="col">
						<form method="get">
							<div class="row mb">
								<div class="col-sm-5 order-sm-2 mb-4 mb-sm-0">
									<button type="button" class="btn btn-primary float-sm-end mt-2 mt-sm-0" data-bs-toggle="modal" data-bs-target="#newModal">New project</button>
								</div>
								<div class="col-sm-7 order-sm-1">
									<div class="input-group">
										<input type="text" class="form-control" name="title" placeholder="Search title" aria-label="search" aria-describedby="search-button" />
										<button class="btn btn-outline-secondary" type="submit" id="search-button">Search</button>
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
										<h5 class="card-title"><?php echo $row['title']; ?></h5>
										<h6 class="card-subtitle mb-2 text-muted"><?php echo $created; ?></h6>
										<p class="card-text"><?php echo $row['description']; ?></p>
										<div class="row">
											<div class="col">
												<div class="btn-group btn-group-sm" role="group" aria-label="view-edit">
													<a role="button" class="btn btn-outline-secondary" href="pres.php?pid=<?php echo $row['pid']; ?>" target="_blank">View</a>
													<a role="button" class="btn btn-outline-secondary" href="edit.php?pid=<?php echo $row['pid']; ?>" target="_blank">Edit</a>
												</div>
											</div>
											<div class="col">
												<div class="dropdown float-end">
													<button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="optionsDropdown" data-bs-toggle="dropdown" aria-expanded="false">
														<i class="fas fa-ellipsis-v"></i>
													</button>
													<ul class="dropdown-menu dropdown-menu-end" aria-labelledby="optionsDropdown">
														<li><button type="button" class="dropdown-item" id="edit" data-pid="<?php echo $row['pid']; ?>">Change attributes</button></li>
														<li>
														<?php
															if(is_null($row['post'])) {
																?><button type="button" class="dropdown-item" id="publish" data-pid="<?php echo $row['pid']; ?>">Publish map</button><?php
															}else{
																?><a class="dropdown-item" href="<?php echo $row['post']; ?>" target="_blank">View public post</a><?php
															}
														?>
														</li>
														<li><hr class="dropdown-divider"></li>
														<li><button type="button" class="dropdown-item" id="delete" data-pid="<?php echo $row['pid']; ?>">Delete</button></li>
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

		<footer class="py-3 shadow" style="background-color: #e6e6e6;">
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
		<script type="text/javascript" src="src/projects.js"></script>

	</body>
</html>
