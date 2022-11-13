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

if(!sane_is_null($user_id)) { // user is already logged in
	header("location: index.php"); exit;
}

?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta http-equiv="x-ua-compatible" content="ie=edge" />
		<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, shrink-to-fit=no, target-densitydpi=device-dpi" />

		<meta name="csrf-token" content="<?php echo headerCSRFToken(); ?>" />

		<title>GeoTales – Admin</title>
		<meta name="title" content="GeoTales" />
		<meta name="description" content="Admin" />

		<link rel="icon" href="assets/logo.png" />

		<!-- Load lib/ CSS -->
		<link rel="stylesheet" href="lib/fontawesome/css/all.min.css" />

		<!-- Load CSS -->
		<link rel="stylesheet" href="main.css" />

		<style type="text/css">
			html, body {
				/**/
			}
		</style>
	</head>
	<body>

		<form method="post" autocomplete="on" id="signin">
			<input type="text" id="username" placeholder="Username" required />
			<input type="password" id="password" placeholder="Password" required />
			<button type="submit">Sign in</button>
		</form>

		<!-- Load lib/ JS -->
		<script type="text/javascript" src="lib/fontawesome/js/all.min.js"></script>
		<script type="text/javascript" src="lib/jquery/jquery-3.6.0.slim.min.js"></script>
		<script type="text/javascript" src="lib/sjcl/sjcl.js"></script>

		<!-- Load JS -->
		<script type="text/javascript" src="assets/ajax_setup.js"></script>
		<script type="text/javascript">
			"use strict";

			window.onload = function(ev) {

				document.forms.signin.onsubmit = function(ev) { ev.preventDefault();
					let form = ev.target;
					let el = form.elements;

					$.ajax({
						type: "POST",
						url: "/auth/login",
						data: {
							"username": el.username.value,
							"password": sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash( el.password.value ))
						},
						dataType: "json",
						success: function(result, status, xhr) {
							window.location.assign("index.php");
						},
						error: function(xhr, status, error) {
							console.error(xhr.status, error);
							alert("Failed to sign in");
						}
					});
				};

			};
		</script>

	</body>
</html>
