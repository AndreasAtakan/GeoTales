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

$user_id = headerUserID();
$logged_in = !sane_is_null($user_id);
$photo = ""; $paid = false;
if($logged_in) {
	$username = getUsername($PDO, $user_id);
	$photo = getUserPhoto($PDO, $user_id);
	$paid = getUserPaid($PDO, $user_id);
}

if(!isset($_GET['id'])) {
	http_response_code(422); exit;
}
$id = $_GET['id'];


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
		M.id != ?
	LIMIT 10
");
$stmt->execute([$id]);
$suggested = $stmt->fetchAll();
$suggestedNum = $stmt->rowCount();

$stmt = $PDO->prepare("
	SELECT
		M.title,
		M.description,
		M.thumbnail,
		M.published_date,
		U.username,
		U.photo AS user_photo
	FROM
		\"Map\" AS M INNER JOIN
		\"User_Map\" AS UM
			ON UM.map_id = M.id INNER JOIN
		\"User\" AS U
			ON UM.user_id = U.id
	WHERE
		M.id = ?
");
$stmt->execute([$id]);
$row = $stmt->fetch();

$likes = getLikes($PDO, $id);
$views = getViews($PDO, $id);
$flags = getFlags($PDO, $id);
$comments = getAllComments($PDO, $id);

$has_liked = false; $has_flagged = false;
if($logged_in) {
	$has_liked = userMapHasLiked($PDO, $user_id, $id);
	$has_flagged = userMapHasFlagged($PDO, $user_id, $id);
}

$link = "{$CONFIG['host']}/view.php?id={$id}";
$embedLink = "<iframe src=\"{$CONFIG['host']}/pres.php?id={$id}\" width=\"100%\" height=\"650\" allowfullscreen=\"true\" style=\"border:none !important;\"></iframe>";

?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta http-equiv="x-ua-compatible" content="ie=edge" />
		<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, shrink-to-fit=no, target-densitydpi=device-dpi" />

		<meta name="csrf-token" content="<?php echo headerCSRFToken(); ?>" />

		<title>GeoTales – <?php echo $row['title']; ?></title>
		<meta name="title" content="GeoTales – <?php echo $row['title']; ?>" />
		<meta name="description" content="<?php echo $row['description']; ?>" />

		<!-- Open Graph / Facebook -->
		<meta property="og:type" content="website" />
		<meta property="og:url" content="https://geotales.io/" />
		<meta property="og:title" content="GeoTales – <?php echo $row['title']; ?>" />
		<meta property="og:description" content="<?php echo $row['description']; ?>" />
		<meta property="og:site_name" content="GeoTales" />
		<meta property="og:image" content="<?php echo $row['thumbnail']; ?>" />
		<!--meta property="og:image:type" content="image/png" /-->

		<!-- Twitter -->
		<meta property="twitter:card" content="summary_large_image" />
		<meta name="twitter:site" content="@Geotales_io" />
		<meta name="twitter:creator" content="@Geotales_io" />
		<meta property="twitter:url" content="https://geotales.io/" />
		<meta property="twitter:title" content="GeoTales – <?php echo $row['title']; ?>" />
		<meta property="twitter:description" content="<?php echo $row['description']; ?>" />
		<meta property="twitter:image" content="<?php echo $row['thumbnail']; ?>" />

		<link rel="icon" href="assets/logo.png" />

		<!-- Load lib/ CSS -->
		<link rel="stylesheet" href="lib/fontawesome/css/all.min.css" />
		<link rel="stylesheet" href="lib/jquery-ui/jquery-ui.min.css" />
		<link rel="stylesheet" href="lib/bootstrap/css/bootstrap.min.css" />

		<!-- Google AdSense -->
		<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4056519983936625" crossorigin="anonymous"></script>

		<!-- Load CSS -->
		<link rel="stylesheet" href="main.css" />

		<style type="text/css">
			:root {
				--app-height: 100%;
			}

			html, body {
				/**/
			}
			html.noOverflow { overflow-y: hidden; }
			body.noOverflow { overflow-y: hidden; }

			#main { background-color: #e6e6e6; }

			#header { height: 39px; }
			#content {
				height: calc(100vh - 39px);
			}

			#mapSection { overflow-y: hidden; }
			#infoSection {
				overflow-y: auto;
				height: inherit;
			}

			.fullscreen#mapSection {
				position: absolute;
				top: 0;
				left: 0;
				width: 100vw;
				height: 100vh;
				height: var(--app-height);
				z-index: 1031;
				padding: 0 !important;
			}

			#infoTab .nav-link { color: grey; }
			#infoTab .nav-link.active { background-color: grey; color: white; }

			@media (max-width: 575.98px) {
				#content { height: auto; }
				#mapSection { min-height: calc(70vh - 39px); }
			}
		</style>
	</head>
	<body>

		<!-- Share modal -->
		<div class="modal fade" id="shareModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" tabindex="-1" aria-labelledby="shareModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-scrollable modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="shareModalLabel">Share</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<div class="container-fluid">
							<div class="row mb-1">
								<div class="col">
									<div class="input-group input-group-lg">
										<input type="text" class="form-control" id="linkInput" aria-label="linkInput" aria-describedby="copyLink" readonly value="<?php echo $link; ?>" />
										<button class="btn btn-outline-secondary" type="button" id="copyLink" title="Copy to clipboard"><i class="fas fa-copy"></i></button>
									</div>
								</div>
							</div>
							<div class="row">
								<div class="col">
									<div class="input-group input-group-sm">
										<input type="text" class="form-control" id="embedInput" aria-label="embedInput" aria-describedby="copyEmbed" readonly value="" />
										<button class="btn btn-outline-secondary" type="button" id="copyEmbed" title="Copy to clipboard"><i class="fas fa-copy"></i></button>
									</div>
								</div>
							</div>

							<div class="row my-3">
								<hr />
							</div>

							<div class="row">
								<div class="col col-md-7">
							<?php if($logged_in) { ?>
									<button type="button" class="btn btn-sm btn-outline-secondary mb-2" id="clone" title="Make a clone of this GeoTale">Clone</button>
							<?php } ?>
								</div>
								<div class="col col-md-1">
									<a role="button" class="btn btn-lg btn-outline-light" href="https://www.facebook.com/sharer/sharer.php?u=<?php echo $link; ?>" id="facebook" target="_blank"><i class="fab fa-facebook" style="color: #4267B2;"></i></a>
								</div>
								<div class="col col-md-1">
									<a role="button" class="btn btn-lg btn-outline-light" href="https://twitter.com/intent/tweet?url=<?php echo $link; ?>&text=<?php echo urlencode("Check out this GeoTale!")."%0A".urlencode($row['title']); ?>&via=geotales_io&hashtags=geotales" id="twitter" target="_blank"><i class="fab fa-twitter" style="color: #1DA1F2;"></i></a>
								</div>
								<div class="col col-md-1">
									<a role="button" class="btn btn-lg btn-outline-light" href="https://www.linkedin.com/shareArticle?mini=true&url=<?php echo $link; ?>" id="linkedin" target="_blank"><i class="fab fa-linkedin" style="color: #0072b1;"></i></a>
								</div>
								<div class="col col-md-1">
									<a role="button" class="btn btn-lg btn-outline-light" href="https://pinterest.com/pin/create/button/?url=<?php echo $link; ?>&media=&description=<?php echo urlencode('Check out this GeoTale! '.$row['title']); ?>" id="pinterest" target="_blank"><i class="fab fa-pinterest" style="color: #E60023;"></i></a>
								</div>
								<div class="col col-md-1">
									<a role="button" class="btn btn-lg btn-outline-light" href="mailto:?&subject=<?php echo "Check out this GeoTale! {$row['title']}"; ?>&cc=&bcc=&body=<?php echo "Check out this GeoTale!%0A{$row['title']}%0A%0A{$link}"; ?>" id="email"><i class="fas fa-envelope" style="color: grey;"></i></a>
								</div>
							</div>
						</div>
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



		<div class="container-fluid p-0" id="main">
			<div class="row g-0" id="header">
				<div class="col">
					<nav class="navbar navbar-expand-sm navbar-dark fixed-top shadow px-2" style="background-color: #eba937; padding-top: 0.25rem; padding-bottom: 0.25rem;">
						<a class="navbar-brand py-0" href="index.php" style="line-height: 0;">
							<img src="assets/logo.png" alt="GeoTales" width="auto" height="20" />
						</a>

						<button class="navbar-toggler py-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
							<span class="navbar-toggler-icon"></span>
						</button>

						<div class="collapse navbar-collapse" id="navbarContent">
							<ul class="navbar-nav mb-0 px-0 w-100">
						<?php if($logged_in) { ?>
								<li class="nav-item dropdown ms-sm-auto">
									<a class="nav-link dropdown-toggle py-1 py-sm-0" href="#" id="navbarUserDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
										<img class="rounded" src="<?php echo $photo; ?>" alt="&nbsp;" width="auto" height="31" />
									</a>
									<ul class="dropdown-menu dropdown-menu-sm-end" aria-labelledby="navbarUserDropdown">
										<li><a class="dropdown-item" href="maps.php">My GeoTales</a></li>
										<li><a class="dropdown-item" href="profile.php">Profile</a></li>
										<li><hr class="dropdown-divider" /></li>
										<li><a class="dropdown-item" href="signout.php">Sign out</a></li>
									</ul>
								</li>
						<?php }else{ ?>
								<li class="nav-item ms-sm-auto">
									<a role="button" class="btn btn-sm btn-light my-1 my-sm-0" href="signin.php?return_url=view.php?id=<?php echo $id; ?>">Sign in</a>
								</li>
						<?php } ?>
							</ul>
						</div>
					</nav>
				</div>
			</div>

			<div class="row g-0" id="content">
				<div class="col-12 col-sm-7 col-md-8 col-lg-9 col-xl-10 px-1" id="mapSection">
					<iframe id="pres" src="pres.php?id=<?php echo $id; ?>" width="100%" height="100%" allowfullscreen="true" style="border: none !important;"></iframe>
				</div>
				<div class="col-12 col-sm-5 col-md-4 col-lg-3 col-xl-2 p-3" id="infoSection">
			<?php if((!$logged_in || !$paid) && !$TESTING && false) { ?>
					<div class="row g-0 mb-2" id="adsense">
						<div class="col">
							<button type="button" class="btn-close btn-close-white float-end" id="closeAd" aria-label="Close" style="display: none;"></button>
							<ins class="adsbygoogle"
								 style="display:block"
								 data-ad-client="ca-pub-4056519983936625"
								 data-ad-slot="9235179738"
								 data-ad-format="auto"
								 data-full-width-responsive="true"
							></ins>
							<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
						</div>
					</div>
			<?php } ?>

					<div class="row g-0 mb-2">
						<div class="col">
							<h4 class="text-muted m-0"><?php echo $row['title']; ?></h4>
							<p class="text-muted m-0 mb-2" style="max-height: 150px; overflow-y: auto;"><?php echo $row['description']; ?></p>
							<p class="text-muted small m-0">
								<i class="fas fa-user"></i> <?php echo $row['username']; ?>
								<i class="fas fa-eye"></i> <?php echo $views; ?> <br />
								<?php echo date_format(date_create($row['published_date'] ?? ""), "d.M Y, H:i"); ?>
							</p>
						</div>
					</div>

					<div class="row g-0 mb-4">
						<div class="col">
							<input type="checkbox" class="btn-check" id="like-check" autocomplete="off" <?php if($has_liked) { echo "checked"; } ?> <?php if(!$logged_in) { echo "disabled"; } ?> />
							<label class="btn btn-sm btn-outline-secondary" for="like-check" title="Like this GeoTale"><i class="fas fa-thumbs-up"></i> <span id="likes"><?php echo $likes; ?></span></label>

							<button type="button" class="btn btn-sm btn-outline-secondary" id="share" title="Share" data-bs-toggle="modal" data-bs-target="#shareModal"><i class="fas fa-share-alt"></i></button>

					<?php if($logged_in) { ?>
							<input type="checkbox" class="btn-check" id="flag-check" autocomplete="off" <?php if($has_flagged) { echo "checked"; } ?> />
							<label class="btn btn-sm btn-outline-secondary float-end" for="flag-check" title="Flag as inappropriate"><i class="fas fa-flag"></i> <span id="flags"><?php echo $flags; ?></span></label>
					<?php } ?>
						</div>
					</div>

					<div class="row g-0">
						<div class="col">
							<ul role="tablist" class="nav nav-pills justify-content-center mb-3" id="infoTab">
								<li role="presentation" class="nav-item">
									<button type="button" role="tab" class="nav-link btn-sm py-1 px-2 active" id="comments-tab" data-bs-toggle="pill" data-bs-target="#comments" aria-controls="comments" aria-selected="true">Comments</button>
								</li>
								<li role="presentation" class="nav-item">
									<button type="button" role="tab" class="nav-link btn-sm py-1 px-2" id="suggested-tab" data-bs-toggle="pill" data-bs-target="#suggested" aria-controls="suggested" aria-selected="false">Suggested</button>
								</li>
							</ul>
							<div class="tab-content" id="infoTabContent">
								<div role="tabpanel" class="tab-pane fade show active" id="comments" aria-labelledby="comments-tab">
									<div class="row g-0 mb-3">
										<div class="col">
									<?php if($logged_in) { ?>
											<div class="input-group input-group-sm">
												<input type="text" name="comment" class="form-control" id="comment" aria-label="Comment" aria-describedby="send" placeholder="Comment" />
												<button type="button" class="btn btn-outline-secondary" id="send" title="Post comment"><i class="fas fa-share"></i></button>
											</div>
									<?php } ?>
										</div>
									</div>
									<div class="row g-0" id="allComments">
										<div class="col">
							<?php if(count($comments) > 0) {
									foreach($comments as $c) {
										$created_date_full = date_format(date_create($c['created_date']), "d.M Y, H:i");
										$created_date = date_format(date_create($c['created_date']), "d.M");
							?>
											<div class="row g-0 mb-2">
												<div class="col-2">
													<img class="rounded" src="<?php echo $c['user_photo']; ?>" width="auto" height="35" />
												</div>
												<div class="col-10 ps-1">
													<p class="text-muted small mb-1"><?php echo $c['username']; ?> – <span title="<?php echo $created_date_full; ?>"><?php echo $created_date; ?></span></p>
													<p class="small mb-0"><?php echo $c['content']; ?></p>
												</div>
											</div>
								<?php }
									}else{ ?>
											<div class="row g-0" id="noComments">
												<div class="col">
													<p class="text-muted small">No comments yet</p>
												</div>
											</div>
							<?php } ?>
										</div>
									</div>
								</div>

								<div role="tabpanel" class="tab-pane fade" id="suggested" aria-labelledby="suggested-tab">
						<?php if($suggestedNum > 0) { ?>
									<div class="row row-cols-1 g-1">
							<?php foreach($suggested as $r) {
									$href = "view.php?id={$r['id']}";
									$published_date = date_format(date_create($r['published_date'] ?? ""), "d.M Y, H:i");
							?>
										<div class="col">
											<div class="card text-dark bg-light">
												<a class="text-decoration-none" href="<?php echo $href; ?>">
													<img src="<?php echo $r['thumbnail']; ?>" class="card-img-top" alt="" <?php if(sane_is_null($r['thumbnail'])) { echo "height=\"0\""; } ?> />
													<div class="card-body py-2">
												<?php if(!sane_is_null($r['user_photo'])) { ?>
														<img class="rounded float-end" src="<?php echo $r['user_photo']; ?>" width="auto" height="20" alt="&nbsp" />
												<?php } ?>
														<h5 class="card-title" style="color: grey;"><?php echo $r['title']; ?></h5>
														<h6 class="card-subtitle" style="color: grey;"><?php echo $published_date; ?></h6>
													</div>
												</a>
											</div>
										</div>
							<?php } ?>
									</div>
						<?php }else{ ?>
									<div class="row g-0">
										<div class="col">
											<p class="text-muted text-center text-shadow">None found</p>
										</div>
									</div>
						<?php } ?>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

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

				const _ID = `<?php echo $id; ?>`,
					  _USERNAME = `<?php echo $username; ?>`,
					  _USER_PHOTO = `<?php echo $photo; ?>`;

				$("#shareModal input#embedInput").val(`<?php echo $embedLink; ?>`);

				$.ajax({
					type: "POST",
					url: "api/analytics.php",
					data: { "agent": window.navigator ? window.navigator.userAgent : "" },
					dataType: "json",
					success: function(result, status, xhr) { console.log("Analytics registered"); },
					error: function(xhr, status, error) { console.log(xhr.status, error); }
				});

				const appHeight = ev => { document.documentElement.style.setProperty("--app-height", `${window.innerHeight}px`); };
				$(window).on("resize", appHeight); appHeight();

				window.addEventListener("message", function(ev) {
					if(ev.data == "fullscreenEnter") {
						$("html, body").addClass("noOverflow");
						$("#mapSection").addClass("fullscreen");
					}
					else
					if(ev.data == "fullscreenExit") {
						$("html, body").removeClass("noOverflow");
						$("#mapSection").removeClass("fullscreen");
					}
				});

				setTimeout(function() { $("button#closeAd").css("display", "block"); }, 5000);
				$("button#closeAd").click(ev => { $("#adsense").css("display", "none"); });

				$("#shareModal button#copyLink").click(ev => {  navigator.clipboard.writeText( $("#shareModal input#linkInput").val() ); });
				$("#shareModal button#copyEmbed").click(ev => {  navigator.clipboard.writeText( $("#shareModal input#embedInput").val() ); });

				$("#shareModal button#clone").click(ev => {
					$("#loadingModal").modal("show");

					let password = $("iframe#pres")[0].contentWindow["_PASSWORD"];
					$.ajax({
						type: "POST",
						url: "api/map_clone.php",
						data: { "id": _ID, "password": password },
						dataType: "json",
						success: function(result, status, xhr) {
							window.location.assign(result.url);
						},
						error: function(xhr, status, error) {
							console.log(xhr.status, error);
							setTimeout(function() { $("#loadingModal").modal("hide"); $("#shareModal").modal("hide"); $("#errorModal").modal("show"); }, 750);
						}
					});
				});

				$("input#like-check").change(ev => {
					let checked = $(ev.target).is(":checked"),
						likes = parseInt($("span#likes").html());
					$.ajax({
						type: "POST",
						url: `api/${checked ? "map_like" : "map_unlike"}.php`,
						data: { "id": _ID },
						dataType: "json",
						success: function(result, status, xhr) {
							$("span#likes").html( checked ? likes + 1 : likes - 1 );
						},
						error: function(xhr, status, error) {
							console.log(xhr.status, error);
							setTimeout(function() { $("#errorModal").modal("show"); }, 750);
						}
					});
				});

				$("input#flag-check").change(ev => {
					let checked = $(ev.target).is(":checked"),
						flags = parseInt($("span#flags").html());
					$.ajax({
						type: "POST",
						url: `api/${checked ? "map_flag" : "map_unflag"}.php`,
						data: { "id": _ID },
						dataType: "json",
						success: function(result, status, xhr) {
							$("span#flags").html( checked ? flags + 1 : flags - 1 );
						},
						error: function(xhr, status, error) {
							console.log(xhr.status, error);
							setTimeout(function() { $("#errorModal").modal("show"); }, 750);
						}
					});
				});

				$("button#send").click(ev => {
					$("#loadingModal").modal("show");

					let comment = $("input#comment").val();
					if(!comment || comment == "") { return; }

					$.ajax({
						type: "POST",
						url: "api/map_comment.php",
						data: { "id": _ID, "content": comment },
						dataType: "json",
						success: function(result, status, xhr) {
							$("#noComments").remove();

							$("#allComments .col").prepend(`
								<div class="row g-0 mb-2">
									<div class="col-2">
										<img class="rounded" src="${_USER_PHOTO}" width="auto" height="35" />
									</div>
									<div class="col-10 ps-1">
										<p class="text-muted small mb-1">${_USERNAME} – now</p>
										<p class="small mb-0">${comment}</p>
									</div>
								</div>
							`);

							$("input#comment").val(null);

							setTimeout(function() { $("#loadingModal").modal("hide"); }, 750);
						},
						error: function(xhr, status, error) {
							console.log(xhr.status, error);
							setTimeout(function() { $("#loadingModal").modal("hide"); $("#errorModal").modal("show"); }, 750);
						}
					});
				});

			};
		</script>

	</body>
</html>
