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

if(sane_is_null($user_id)) { // user is not logged in
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

		<title>GeoTales – Tales on a map</title>
		<meta name="title" content="GeoTales" />
		<meta name="description" content="GeoTales – Tell your story on maps and maplike surfaces" />

		<link rel="icon" href="assets/logo.png" />

		<style type="text/css">
			html, body {
				/**/
			}
		</style>
	</head>
	<body>

		<p id="status">Signing out...</p>

		<!-- Load JS -->
		<script type="text/javascript" src="lib/jquery-ui/external/jquery/jquery.js"></script>
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

				$.ajax({
					type: "POST",
					url: "/auth/logout",
					contentType: "application/json",
					data: JSON.stringify({}),
					dataType: "json",
					success: function(result, status, xhr) {
						if(result.status == "ok") { window.location.assign("index.php"); }
						else{ $("#status").html("Failed to sign out."); }
					},
					error: function(xhr, status, error) {
						console.error(xhr.status, error);
						$("#status").html("An error has occurred.");
					}
				});

			};
		</script>

	</body>
</html>
