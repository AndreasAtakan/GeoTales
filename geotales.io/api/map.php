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

	$user_can_write = false;
	if(isset($_SESSION['user_id']) && validUserID($PDO, $_SESSION['user_id'])) {
		$user_can_write = userMapCanWrite($PDO, $_SESSION['user_id'], $id);
	}
	if(!$user_can_write
	&& !userMapCheckPw($PDO, $id, $password)) { http_response_code(401); exit; }

	$stmt = $PDO->prepare("SELECT data FROM \"Map\" WHERE id = ?");
	$stmt->execute([$id]);
	$row = $stmt->fetch();

	echo json_encode(array(
		"data" => $row['data']
	));
	exit;

}
else
if($op == "view") {

	if(!isset($_POST['id'])) {
		http_response_code(422); exit;
	}
	$id = $_POST['id'];

	$stmt = $PDO->prepare("UPDATE \"Map\" SET views = views + 1 WHERE id = ?");
	$stmt->execute([$id]);

	echo json_encode(array("status" => "success"));
	exit;

}


// Not logged in
if(!isset($_SESSION['user_id']) || !validUserID($PDO, $_SESSION['user_id'])) {
	http_response_code(401); exit;
}
$user_id = $_SESSION['user_id'];
$paid = getUserPaid($PDO, $user_id);
$map_count_ok = userMapWithinLimit($PDO, $user_id);



if($op == "create") {

	if(!isset($_POST['title'])
	|| !isset($_POST['description'])) {
		http_response_code(422); exit;
	}
	$title = sanitize($_POST['title']);
	$description = sanitize($_POST['description']);

	if(!$paid && !$map_count_ok) { http_response_code(401); exit; }

	$stmt = $PDO->prepare("INSERT INTO \"Map\" (title, description) VALUES (?, ?) RETURNING id");
	$stmt->execute([$title, $description]);
	$id = $stmt->fetchColumn();

	$stmt = $PDO->prepare("INSERT INTO \"User_Map\" (user_id, map_id, status) VALUES (?, ?, ?)");
	$stmt->execute([$user_id, $id, "owner"]);

	if(isset($_POST['thumbnail'])
	&& $_POST['thumbnail'] != "") {
		$thumbnail = $_POST['thumbnail'];
		$stmt = $PDO->prepare("UPDATE \"Map\" SET thumbnail = ? WHERE id = ?");
		$stmt->execute([$thumbnail, $id]);
	}
	if(isset($_POST['password'])
	&& $_POST['password'] != "") {
		$password = $_POST['password'];
		mb_substr($password, 0, 64);
		$stmt = $PDO->prepare("UPDATE \"Map\" SET password = ? WHERE id = ?");
		$stmt->execute([$password, $id]);
	}

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

	$stmt = $PDO->prepare("SELECT title, description, thumbnail, published_date IS NOT NULL AS published FROM \"Map\" WHERE id = ?");
	$stmt->execute([$id]);
	$row = $stmt->fetch();

	echo json_encode(array(
		"title" => $row['title'],
		"description" => $row['description'],
		"thumbnail" => $row['thumbnail'],
		"published" => $row['published']
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

	if(!$paid && !$map_count_ok) { http_response_code(401); exit; }

	if(!userMapCanWrite($PDO, $user_id, $id)
	&& !userMapCheckPw($PDO, $id, $password)) { http_response_code(401); exit; }

	$stmt = $PDO->prepare("INSERT INTO \"Map\" (title, description, thumbnail, data) SELECT CONCAT('Copy of ', title) AS title, description, thumbnail, data FROM \"Map\" WHERE id = ? RETURNING id");
	$stmt->execute([$id]);
	$new_id = $stmt->fetchColumn();

	$stmt = $PDO->prepare("INSERT INTO \"User_Map\" (user_id, map_id, status) VALUES (?, ?, ?)");
	$stmt->execute([$user_id, $new_id, "owner"]);

	echo json_encode(array(
		"id" => $new_id
	));
	exit;

}
else
if($op == "like"
|| $op == "flag") {

	if(!isset($_POST['id'])) {
		http_response_code(422); exit;
	}
	$id = $_POST['id'];

	$sql = "";
	if($op == "like") { $sql = "UPDATE \"Map\" SET likes = likes + 1 WHERE id = ?"; }
	elseif($op == "flag") { $sql = "UPDATE \"Map\" SET flags = flags + 1 WHERE id = ?"; }

	$stmt = $PDO->prepare($sql);
	$stmt->execute([$id]);

	echo json_encode(array("status" => "success"));
	exit;

}
else{

	if(!isset($_POST['id'])) {
		http_response_code(422); exit;
	}
	$id = $_POST['id'];

	if(!userMapCanWrite($PDO, $user_id, $id)) { http_response_code(401); exit; }

	if($op == "update") {

		if(!isset($_POST['title'])
		&& !isset($_POST['description'])
		&& !isset($_POST['thumbnail'])
		&& !isset($_POST['password'])) {
			http_response_code(422); exit;
		}

		if(isset($_POST['title'])) {
			$title = sanitize($_POST['title']);
			$stmt = $PDO->prepare("UPDATE \"Map\" SET title = ? WHERE id = ?");
			$stmt->execute([$title, $id]);
		}
		if(isset($_POST['description'])) {
			$description = sanitize($_POST['description']);
			$stmt = $PDO->prepare("UPDATE \"Map\" SET description = ? WHERE id = ?");
			$stmt->execute([$description, $id]);
		}
		if(isset($_POST['thumbnail'])
		&& $_POST['thumbnail'] != "") {
			$thumbnail = $_POST['thumbnail'];
			$stmt = $PDO->prepare("UPDATE \"Map\" SET thumbnail = ? WHERE id = ?");
			$stmt->execute([$thumbnail, $id]);
		}
		if(isset($_POST['password'])
		&& $_POST['password'] != "") {
			$password = $_POST['password'];
			mb_substr($password, 0, 64);
			$stmt = $PDO->prepare("UPDATE \"Map\" SET password = ? WHERE id = ?");
			$stmt->execute([$password, $id]);
		}

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

		if(!isset($_POST['data'])) {
			http_response_code(422); exit;
		}
		$data = $_POST['data'];

		$stmt = $PDO->prepare("UPDATE \"Map\" SET data = ? WHERE id = ?");
		$stmt->execute([$data, $id]);

		if(isset($_POST['thumbnail'])
		&& !hasMapThumbnail($PDO, $id)) {
			$stmt = $PDO->prepare("UPDATE \"Map\" SET thumbnail = ? WHERE id = ?");
			$stmt->execute([$_POST['thumbnail'], $id]);
		}

		echo json_encode(array("status" => "success"));
		exit;

	}
	else
	if($op == "republish") {
		$stmt = $PDO->prepare("SELECT published_date IS NOT NULL AS published FROM \"Map\" WHERE id = ?");
		$stmt->execute([$id]);
		$row = $stmt->fetch();
		$published = $row['published'] ?? false;

		$sql = "";
		if($published) { $sql = "UPDATE \"Map\" SET published = NULL WHERE id = ?"; }
		else{ $sql = "UPDATE \"Map\" SET published = NOW() WHERE id = ?"; }
		$stmt = $PDO->prepare($sql);
		$stmt->execute([$id]);

		echo json_encode(array(
			"published" => !$published
		));
		exit;
	}
	else{
		http_response_code(501); exit;
	}

}
