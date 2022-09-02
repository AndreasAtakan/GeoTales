<?php
/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@geotales.io>, January 2022                  *
*******************************************************************************/

ini_set('display_errors', 'On'); ini_set('html_errors', 0); error_reporting(-1);

//session_set_cookie_params(['SameSite' => 'None', 'Secure' => true]);
session_start();

include "init.php";
include_once("helper.php");

if(!isset($_REQUEST['op'])) {
	http_response_code(422); exit;
}
$op = $_REQUEST['op'];


if($op == "unique") {

	if(!isset($_GET['username'])) {
		http_response_code(422); exit;
	}
	$username = $_GET['username'];

	$stmt = $PDO->prepare("SELECT COUNT(id) AS c FROM \"User\" WHERE username = ?");
	$stmt->execute([$username]);
	$row = $stmt->fetch();

	echo json_encode(array(
		"isUnique" => $row['c'] == 0
	));
	exit;

}


// Not logged in
if(!isset($_SESSION['user_id']) || !validUserID($PDO, $_SESSION['user_id'])) {
	http_response_code(401); exit;
}
$user_id = $_SESSION['user_id'];



if($op == "update") {

	if(!isset($_POST['username'])
	&& !isset($_POST['password'])
	&& !isset($_POST['email'])
	&& !isset($_POST['photo'])) {
		http_response_code(422); exit;
	}

	if(isset($_POST['username'])) {
		$username = sanitize($_POST['username']);

		if(isUsernameRegistered($PDO, $username)) { http_response_code(500); exit; }

		$stmt = $PDO->prepare("UPDATE \"User\" SET username = ? WHERE id = ?");
		$stmt->execute([$username, $id]);
	}
	if(isset($_POST['password'])) {
		$password = sanitize($_POST['password']);
		$stmt = $PDO->prepare("UPDATE \"User\" SET password = ? WHERE id = ?");
		$stmt->execute([$password, $id]);
	}
	if(isset($_POST['email'])) {
		$email = sanitize($_POST['email']);
		$stmt = $PDO->prepare("UPDATE \"User\" SET email = ? WHERE id = ?");
		$stmt->execute([$email, $id]);
	}
	if(isset($_POST['photo'])) {
		$photo = sanitize($_POST['photo']);
		$stmt = $PDO->prepare("UPDATE \"User\" SET photo = ? WHERE id = ?");
		$stmt->execute([$photo, $id]);
	}

	echo json_encode(array("status" => "success"));
	exit;

}
else
if($op == "delete") {

	$stmt = $PDO->prepare("DELETE FROM \"User\" WHERE id = ?");
	$stmt->execute([$user_id]);

	echo json_encode(array("status" => "success"));
	exit;

}
else{ http_response_code(501); exit; }
