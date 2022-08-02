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

//if($op == "0") {}


// Not logged in
if(!isset($_SESSION['uid']) || !validUID($PDO, $_SESSION['uid'])) {
	http_response_code(401); exit;
}
$uid = $_SESSION['uid'];
$username = $_SESSION['username'];



if($op == "create") {

	if(!isset($_POST['type'])) {
		http_response_code(422); exit;
	}
	$type = $_POST['type'];

	$path = $_FILES["image"]["tmp_name"];
	$name = $_FILES["image"]["name"];

	if(getimagesize($path) === false
	|| filesize($path) > 50000000) {
		http_response_code(422); exit;
	}
	$res = uploadToS3($path, $name);

	if(!$res) {
		http_response_code(500); exit;
	}

	$ref = "https://{$CONFIG['aws_bucket_name']}.s3.{$CONFIG['aws_region']}.amazonaws.com/{$res}";

	$stmt = $PDO->prepare("INSERT INTO \"Upload\" (ref) VALUES (?) RETURNING id");
	$stmt->execute([$ref]);
	$id = $stmt->fetchColumn();

	$stmt = $PDO->prepare("INSERT INTO \"User_Upload\" (user_id, upload_id, type) VALUES (?, ?, ?)");
	$stmt->execute([$uid, $id, $type]);

	echo $ref;
	exit;

}
else
if($op == "get") {

	$stmt = $PDO->prepare("SELECT U.ref, UU.type FROM \"User_Upload\" AS UU INNER JOIN \"Upload\" AS U ON UU.upload_id = U.id WHERE UU.user_id = ?");
	$stmt->execute([$uid]);
	$rows = $stmt->fetchAll();

	echo json_encode($rows);
	exit;

}
else
if($op == "delete") {

	if(!isset($_POST['id'])) {
		http_response_code(422); exit;
	}
	$id = $_POST['id'];

	$stmt = $PDO->prepare("DELETE FROM \"User_Upload\" WHERE user_id = ? AND upload_id = ?");
	$stmt->execute([$uid, $id]);

	echo json_encode(array("status" => "success"));
	exit;

}
else {
	http_response_code(501); exit;
}
