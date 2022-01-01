<?php

ini_set('display_errors', 'On'); ini_set('html_errors', 0); error_reporting(-1);

session_start();

include "init.php";

$loc = 'projects.php';

if($FLAG && isset($_GET['sso']) && isset($_GET['sig'])) {

	// user is already logged in
	if(isset($_SESSION['uid'])) {
		header("location: $loc");
		exit;
	}

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
}
else{ $_SESSION['uid'] = 1; $_SESSION['username'] = 'andreas'; }

// user is logged in
header("location: $loc");

exit;
