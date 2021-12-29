<?php

ini_set('display_errors', 'On'); ini_set('html_errors', 0); error_reporting(-1);

//session_set_cookie_params(['SameSite' => 'None', 'Secure' => true]);
session_start();

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
		'Api-Key: 7a7397a7cf172b15c061776cb5d1ea1e3585c92e52c9a06b7ea47b0ee5a9f1ea',
		'Api-Username: system'
	));
	$res = curl_exec($ch);
}

session_destroy();

header("location: index.php");

exit;
