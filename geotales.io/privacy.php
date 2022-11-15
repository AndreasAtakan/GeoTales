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
if($logged_in) { $photo = getUserPhoto($PDO, $user_id); }

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
				margin-top: calc(3rem + 50px);
			}
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
						<img src="assets/logo.png" alt="GeoTales" width="auto" height="30" /><small>eoTales</small>
					</a>

					<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
						<span class="navbar-toggler-icon"></span>
					</button>

					<div class="collapse navbar-collapse" id="navbarContent">
						<ul class="navbar-nav mb-2 mb-sm-0 px-2 px-sm-0 w-100">
							<li class="nav-item">
								<a class="nav-link" href="index.php">
									<i class="fas fa-home"></i> Home
								</a>
							</li>
							<li class="nav-item">
								<a class="nav-link" href="pricing.php">
									<i class="fas fa-tag"></i> Pricing
								</a>
							</li>
							<li class="nav-item me-sm-auto">
								<a class="nav-link" href="about.php">
									<i class="fas fa-info-circle"></i> About
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
					<div class="col">
						<h1>Privacy Policy</h1>
						<p>Last updated: November 15, 2022</p>
						<p>This privacy policy will explain how our organization uses the personal data we collect from you when you use our website.</p>

						<h2>What data do we collect?</h2>
						<p>We collect the following data:</p>
						<ul>
							<li>
								<p>Personal identification information (Email address, etc.)</p>
							</li>
							<li>
								<p>Date and time of registration</p>
							</li>
							<li>
								<p>Date and time of email confirmation</p>
							</li>
						</ul>

						<h2>How do we collect your data?</h2>
						<p>You directly provide us with most of the data we collect. We collect data and process data when you:</p>
						<ul>
							<li>
								<p>Register online or place an order for any of our products or services.</p>
							</li>
							<li>
								<p>Voluntarily complete a customer survey or provide feedback on any of our message boards or via email.</p>
							</li>
							<li>
								<p>Use or view our website via your browser’s cookies.</p>
							</li>
						</ul>

						<h2>How will we use your data?</h2>
						<p>We collect your data so that we can:</p>
						<ul>
							<li>Process your order and manage your account.</li>
							<li>Email you with special offers on other products and services we think you might like.</li>
						</ul>
						<p>If you agree, we will share your data with our partner companies so that they may offer you their products and services.</p>
						<ul>
							<li>
								<p>
									<a href="https://aws.amazon.com/" target="_blank">Amazon Web Services (AWS)</a> <br />
									AWS is used to host all technical infrastructure used to run the GeoTales application and host its data. AWS is also used for all automated email communication. <br />
									<a href="https://aws.amazon.com/agreement/" target="_blank">AWS Data Processing Agreement</a>
								</p>
							</li>
							<li>
								<p>
									<a href="https://stripe.com/" target="_blank">Stripe</a> <br />
									Stripe is used to handle payments regarding GeoTales. <br />
									<a href="https://stripe.com/en-no/legal/dpa" target="_blank">Stripe Data Processing Agreement</a>
								</p>
							</li>
						</ul>
						<p>When we processes your order, it may send your data to — and also use the resulting information from — credit reference agencies to prevent fraudulent purchases.</p>

						<h2>How do we store your data?</h2>
						<p>We securely store your data on servers located within the EEA, due to how the internet works your data may be transited outside of the EEA in encrypted form.</p>
						<p>We will keep your personal information for up to 10 years. Once this time period has expired, we will delete your data by removing it from our database.</p>

						<h2>Marketing</h2>
						<p>We would like to send you information about products and services of ours that we think you might like.</p>
						<p>If you have agreed to receive marketing, you may always opt out at a later date.</p>
						<p>You have the right at any time to stop us from contacting you for marketing purposes or giving your data to other members of us.</p>
						<p>If you no longer wish to be contacted for marketing purposes, please get in touch with us <a href="mailto:<?php echo $CONFIG['email']; ?>">here</a>.</p>

						<h2>What are your data protection rights?</h2>
						<p>We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:</p>
						<ul>
							<li>
								<p>The right to access – You have the right to request for copies of your personal data. We may charge you a small fee for this service.</p>
							</li>
							<li>
								<p>The right to rectification – You have the right to request that we correct any information you believe is inaccurate. You also have the right to request us to complete the information you believe is incomplete.</p>
							</li>
							<li>
								<p>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</p>
							</li>
							<li>
								<p>The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.</p>
							</li>
							<li>
								<p>The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions.</p>
							</li>
							<li>
								<p>The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</p>
							</li>
						</ul>
						<p>If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us at our email <a href="mailto:<?php echo $CONFIG['email']; ?>"><?php echo $CONFIG['email']; ?></a>.</p>

						<h2>What are Cookies?</h2>
						<p>Cookies are text files placed on your computer to collect standard Internet log information and visitor behavior information. When you visit our websites, we may collect information from you automatically through cookies or similar technology.</p>
						<p>For further information, visit <a href="https://allaboutcookies.org/" target="_blank">allaboutcookies.org</a>.</p>

						<h2>How do we use cookies?</h2>
						<p>We use cookies in a range of ways to improve your experience on our website, including:</p>
						<ul>
							<li>
								<p>Keeping you signed in</p>
							</li>
							<li>
								<p>Understanding how you use our website</p>
							</li>
						</ul>

						<h2>What types of cookies do we use?</h2>
						<p>There are a number of different types of cookies, however, our website uses:</p>
						<ul>
							<li>
								<p>Functionality – We use these cookies so that we recognize you on our website and remember your previously selected preferences. These could include what language you prefer and location you are in. A mix of first-party and third-party cookies are used.</p>
							</li>
							<li>
								<p>Advertising – We use these cookies to collect information about your visit to our website, the content you viewed, the links you followed and information about your browser, device, and your IP address. Møller Systems ENK sometimes shares some limited aspects of this data with third parties for advertising purposes. We may also share online data collected through cookies with our advertising partners. This means that when you visit another website, you may be shown advertising based on your browsing patterns on our website.</p>
							</li>
						</ul>

						<h2>How to manage cookies</h2>
						<p>You can set your browser not to accept cookies, and the above website tells you how to remove cookies from your browser. However, in a few cases, some of our website features may not function as a result.</p>

						<h2>Privacy policies of other websites</h2>
						<p>The GeoTales website contains links to other websites. Our privacy policy applies only to our website, so if you click on a link to another website, you should read their privacy policy.</p>

						<h2>Changes to our privacy policy</h2>
						<p>We keep our privacy policy under regular review and places any updates on this web page. This privacy policy was last updated on November 15 2022.</p>

						<h2>How to contact us</h2>
						<p>If you have any questions about our privacy policy, the data we hold on you, or you would like to exercise one of your data protection rights, please do not hesitate to contact us.</p>
						<p>Email us at: <a href="mailto:<?php echo $CONFIG['email']; ?>"><?php echo $CONFIG['email']; ?></a></p>

						<h2>How to contact the appropriate authority</h2>
						<p>Should you wish to report a complaint or if you feel that we have not addressed your concern in a satisfactory manner, you may contact the Norwegian Data Protection Authority (datatilsynet)</p>
						<p><a href="https://www.datatilsynet.no/en/about-us/contact-us/how-to-complain-to-the-norwegian-dpa/" target="_blank">How to complain to the Norwegian Data Protection Authority</a></p>
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
