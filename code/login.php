<?php
/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

ini_set('display_errors', 'On'); ini_set('html_errors', 0); error_reporting(-1);

session_start();

include "init.php";

$loc = "projects.php";

// user is already logged in
if(isset($_SESSION['uid'])) {
	header("location: $loc");
	exit;
}

if(isset($_GET['sso']) && isset($_GET['sig'])) { // arriving from SSO

	$sso = $_GET['sso'];
	$sig = $_GET['sig'];

	// validate sso
	if(hash_hmac('sha256', urldecode($sso), $sso_secret) !== $sig) {
		http_response_code(404);
		exit;
	}

	$sso = urldecode($sso);
	$query = array();
	parse_str(base64_decode($sso), $query);

	// verify nonce with generated nonce
	$nonce = $_SESSION['nonce']; unset($_SESSION['nonce']);
	if($query['nonce'] != $nonce) {
		http_response_code(404);
		exit;
	}

	// check if user is in database
	$uid = $query['external_id'];
	$username = $query['username'];

	$stmt = $pdo->prepare("SELECT count(uid) AS c FROM \"User\" WHERE uid = ?"); $stmt->execute([$uid]);
	$row = $stmt->fetch();
	if($row['c'] < 1) {
		$stmt = $pdo->prepare("INSERT INTO \"User\" (uid) VALUES (?)");
		$stmt->execute([$uid]);
	}
	elseif($row['c'] > 1) { http_response_code(500); exit; }

	// log user in
	$_SESSION['uid'] = $uid;
	$_SESSION['username'] = $username;

	header("Access-Control-Allow-Origin: *");
	header("location: $loc");
	exit;

}
else{ // redirect to SSO

	$nonce = hash('sha512', mt_rand());
	$_SESSION['nonce'] = $nonce;

	$payload = base64_encode(http_build_query(array('nonce' => $nonce, 'return_sso_url' => 'https://'.$_SERVER['HTTP_HOST'].'/login.php')));
	$query = http_build_query(array('sso' => $payload, 'sig' => hash_hmac('sha256', $payload, $sso_secret)));
	$url = "https://forum.tellusmap.com/session/sso_provider?$query";

	header("location: $url");
	exit;

}
