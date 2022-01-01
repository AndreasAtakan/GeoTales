<?php

ini_set('display_errors', 'On'); ini_set('html_errors', 0); error_reporting(-1);

//session_set_cookie_params(['SameSite' => 'None', 'Secure' => true]);
session_start();

include "init.php";

if(!isset($_SESSION['uid'])) {
	http_response_code(401);
	exit;
}

if($FLAG) {
	$uid = $_SESSION['uid'];

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_URL, "https://forum.tellusmap.com/admin/users/$uid/log_out.json");
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array(
		"Api-Key: $apikey",
		"Api-Username: system"
	));
	$res = curl_exec($ch);
	curl_close($ch);
}

session_destroy();

header("location: index.php");

exit;
