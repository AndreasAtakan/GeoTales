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


if($op == "read") {

	if(!isset($_GET['id'])
	|| !isset($_GET['password'])) {
		http_response_code(422); exit;
	}
	$id = $_GET['id'];
	$password = $_GET['password'];

	$status_flag = true;
	if(isset($_SESSION['uid']) && validUID($PDO, $_SESSION['uid'])) {
		$uid = $_SESSION['uid'];
		$stmt = $PDO->prepare("SELECT status NOT IN ('owner', 'editor') AS st FROM \"User_Map\" WHERE user_id = ? AND map_id = ?");
		$stmt->execute([$uid, $id]);
		$row = $stmt->fetch();
		$status_flag = $row['st'] ?? false;
	}

	$stmt = $PDO->prepare("SELECT password IS NOT NULL AS pw, password FROM \"Map\" WHERE id = ?");
	$stmt->execute([$id]);
	$row = $stmt->fetch();
	if($row['pw']
	&& $row['password'] != $password
	&& $status_flag) { http_response_code(401); exit; }

	$stmt = $PDO->prepare("SELECT data FROM \"Map\" WHERE id = ?");
	$stmt->execute([$id]);
	$row = $stmt->fetch();

	echo json_encode(array(
		"data" => $row['data']
	));
	exit;

}


// Not logged in
if(!isset($_SESSION['uid']) || !validUID($PDO, $_SESSION['uid'])) {
	http_response_code(401); exit;
}
$uid = $_SESSION['uid'];
$username = $_SESSION['username'];



if($op == "create") {

	if(!isset($_POST['title'])
	|| !isset($_POST['description'])) {
		http_response_code(422); exit;
	}
	$title = $_POST['title'];
	$description = $_POST['description'];

	$stmt = $PDO->prepare("INSERT INTO \"Map\" (title, description) VALUES (?, ?) RETURNING id");
	$stmt->execute([$title, $description]);
	$id = $stmt->fetchColumn();

	$stmt = $PDO->prepare("INSERT INTO \"User_Map\" (user_id, map_id, status) VALUES (?, ?, ?)");
	$stmt->execute([$uid, $id, "owner"]);

	echo json_encode(array(
		"id" => $id
	));
	exit;

}
else
if($op == "get") {

	if(!isset($_GET['id'])) {
		http_response_code(422); exit;
	}
	$id = $_GET['id'];

	$stmt = $PDO->prepare("SELECT title, description FROM \"Map\" WHERE id = ?");
	$stmt->execute([$id]);
	$row = $stmt->fetch();

	echo json_encode(array(
		"title" => $row['title'],
		"description" => $row['description']
	));
	exit;

}
else
if($op == "clone") {

	if(!isset($_POST['id'])
	|| !isset($_POST['password'])) {
		http_response_code(422); exit;
	}
	$id = $_POST['id'];
	$password = $_POST['password'];

	$status_flag = true;
	$stmt = $PDO->prepare("SELECT status NOT IN ('owner', 'editor') AS st FROM \"User_Map\" WHERE user_id = ? AND map_id = ?");
	$stmt->execute([$uid, $id]);
	$row = $stmt->fetch();
	$status_flag = $row['st'] ?? false;

	$stmt = $PDO->prepare("SELECT password IS NOT NULL AS pw, password FROM \"Map\" WHERE id = ?");
	$stmt->execute([$id]);
	$row = $stmt->fetch();
	if($row['pw']
	&& $row['password'] != $password
	&& $status_flag) { http_response_code(401); exit; }

	$stmt = $PDO->prepare("INSERT INTO \"Map\" (title, description, preview, data) SELECT CONCAT('Copy of ', title) AS title, description, preview, data FROM \"Map\" WHERE id = ? RETURNING id");
	$stmt->execute([$id]);
	$new_id = $stmt->fetchColumn();

	$stmt = $PDO->prepare("INSERT INTO \"User_Map\" (user_id, map_id, status) VALUES (?, ?, ?)");
	$stmt->execute([$uid, $new_id, "owner"]);

	echo json_encode(array(
		"id" => $new_id
	));
	exit;

}
else{

	if(!isset($_POST['id'])) {
		http_response_code(422); exit;
	}
	$id = $_POST['id'];

	$stmt = $PDO->prepare("SELECT status NOT IN ('owner', 'editor') AS st FROM \"User_Map\" WHERE user_id = ? AND map_id = ?");
	$stmt->execute([$uid, $id]);
	$row = $stmt->fetch();

	if( $row['st'] ) { http_response_code(401); exit; }

	if($op == "edit") {

		if(!isset($_POST['title'])
		|| !isset($_POST['description'])) {
			http_response_code(422); exit;
		}
		$title = $_POST['title'];
		$description = $_POST['description'];
		$password = isset($_POST['password']) ? $_POST['password'] : null;
		if(!is_null($password)) { mb_substr($password, 0, 64); }

		$stmt = $PDO->prepare("UPDATE \"Map\" SET title = ?, description = ?, password = ? WHERE id = ?");
		$stmt->execute([$title, $description, $password, $id]);

		echo json_encode(array("status" => "success"));
		exit;

	}
	else
	if($op == "delete") {

		$stmt = $PDO->prepare("DELETE FROM \"Map\" WHERE id = ?");
		$stmt->execute([$id]);

		echo json_encode(array("status" => "success"));
		exit;

	}
	else
	if($op == "write") {

		if(!isset($_POST['data'])
		|| !isset($_POST['preview'])) {
			http_response_code(422); exit;
		}
		$data = $_POST['data'];
		$preview = $_POST['preview'];

		$stmt = $PDO->prepare("UPDATE \"Map\" SET data = ?, preview = ? WHERE id = ?");
		$stmt->execute([$data, $preview, $id]);

		echo json_encode(array("status" => "success"));
		exit;

	}
	else
	if($op == "publish") {

		$stmt = $PDO->prepare("SELECT title, description FROM \"Map\" WHERE id = ?");
		$stmt->execute([$id]);
		$row = $stmt->fetch();

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_URL, "https://{$CONFIG['forum_host']}/posts.json");
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
			"Content-Type: application/json",
			"Api-Key: {$CONFIG['apikey']}",
			"Api-Username: {$username}"
		));
		curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(array(
			"title" => $row['title'],
			"raw" => "<iframe src=\"https://{$CONFIG['host']}/pres.php?id=$id\" width=\"100%\" height=\"450\" allowfullscreen=\"true\" style=\"border:none !important;\"></iframe>
<a href=\"https://{$CONFIG['host']}/pres.php?id=$id\" target=\"_blank\">Open in separate window</a>

{$row['description']}

Created by: @{$username}",
			"category" => 5
		)));
		$res = curl_exec($ch);
		curl_close($ch);
		$res = json_decode($res, true);

		$url = "https://{$CONFIG['forum_host']}/t/{$res['topic_slug']}/{$res['topic_id']}";

		$stmt = $PDO->prepare("UPDATE \"Map\" SET post = ? WHERE id = ?");
		$stmt->execute([$url, $id]);

		echo json_encode(array(
			"url" => $url
		));
		exit;

	}
	else
	if($op == "unpublish") {

		$stmt = $PDO->prepare("SELECT post FROM \"Map\" WHERE id = ?");
		$stmt->execute([$id]);
		$row = $stmt->fetch();
		$p = explode("/", $row['post']);
		$post_id = end($p);

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_URL, "https://{$CONFIG['forum_host']}/posts/{$post_id}.json");
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
			//"Content-Type: application/json",
			"Api-Key: {$CONFIG['apikey']}",
			"Api-Username: {$username}"
		));
		$res = curl_exec($ch);
		curl_close($ch);
		$res = json_decode($res, true);

		$stmt = $PDO->prepare("UPDATE \"Map\" SET post = null WHERE id = ?");
		$stmt->execute([$id]);

		echo json_encode(array("status" => "success"));
		exit;

	}
	else{
		http_response_code(501); exit;
	}

}
