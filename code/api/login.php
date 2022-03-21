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
include_once("helper.php");

$loc = "../maps.php";
if(isset($_GET['return_url'])) {
	$loc = $_GET['return_url'];
}

// user is already logged in
if(isset($_SESSION['uid']) && validUID($PDO, $_SESSION['uid'])) {
	header("location: $loc"); exit;
}

if(isset($_GET['sso']) && isset($_GET['sig'])) { // arriving from SSO

	$sso = $_GET['sso'];
	$sig = $_GET['sig'];

	// validate sso
	if(hash_hmac('sha256', urldecode($sso), $CONFIG['sso_secret']) !== $sig) {
		http_response_code(404); exit;
	}

	$sso = urldecode($sso);
	$query = array();
	parse_str(base64_decode($sso), $query);

	// verify nonce with generated nonce
	$nonce = $_SESSION['nonce']; unset($_SESSION['nonce']);
	if($query['nonce'] != $nonce) {
		http_response_code(404); exit;
	}

	// check if user is in database
	$uid = $query['external_id'];
	$username = $query['username'];

	$stmt = $PDO->prepare("SELECT count(uid) AS c FROM \"User\" WHERE uid = ?");
	$stmt->execute([$uid]);
	$row = $stmt->fetch();
	if($row['c'] < 1) {
		$stmt = $PDO->prepare("INSERT INTO \"User\" (uid) VALUES (?)");
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

	if($TESTING) {
		$nonce = hash('sha512', mt_rand());
		$_SESSION['nonce'] = $nonce;

		$payload = base64_encode(http_build_query(array('nonce' => $nonce, 'return_sso_url' => "https://{$CONFIG['host']}/api/login.php?return_url=$loc")));
		$query = http_build_query(array('sso' => $payload, 'sig' => hash_hmac('sha256', $payload, $CONFIG['sso_secret'])));
		$url = "https://{$CONFIG['forum_host']}/session/sso_provider?$query";

		header("location: $url");
		exit;
	}
	else{
		$_SESSION['uid'] = 1;
		$_SESSION['username'] = "andreas";

		header("location: $loc");
		exit;
	}

}
