<?php
/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

ini_set('display_errors', 'On'); ini_set('html_errors', 0); error_reporting(-1);

//session_set_cookie_params(['SameSite' => 'None', 'Secure' => true]);
session_start();

include "../init.php";

if(!isset($_SESSION['uid'])) { // Not logged in
	http_response_code(401);
	exit;
}
$uid = $_SESSION['uid'];

if(!isset($_REQUEST['op'])) {
	http_response_code(422);
	exit;
}
$op = $_REQUEST['op'];



if($op == "create") {

	if(!isset($_POST['title'])
	|| !isset($_POST['description'])) {
		http_response_code(422);
		exit;
	}
	$title = $_POST['title'];
	$description = $_POST['description'];

	$stmt = $pdo->prepare("INSERT INTO \"Project\" (title, description) VALUES (?, ?) RETURNING pid");
	$stmt->execute([$title, $description]);
	$pid = $stmt->fetchColumn();

	$stmt = $pdo->prepare("INSERT INTO \"User_Project\" (uid, pid, status) VALUES (?, ?, ?)");
	$stmt->execute([$uid, $pid, "owner"]);

	echo json_encode(array(
		"pid" => $pid
	));
	exit;

}
else
if($op == "get") {

	if(!isset($_GET['pid'])) {
		http_response_code(422);
		exit;
	}
	$pid = $_GET['pid'];

	$stmt = $pdo->prepare("SELECT title, description FROM \"Project\" WHERE pid = ?");
	$stmt->execute([$pid]);
	$row = $stmt->fetch();

	echo json_encode(array(
		"title" => $row['title'],
		"description" => $row['description']
	));
	exit;

}
else
if($op == "read") {

	if(!isset($_GET['pid'])) {
		http_response_code(422);
		exit;
	}
	$pid = $_GET['pid'];

	$stmt = $pdo->prepare("SELECT data FROM \"Project\" WHERE pid = ?");
	$stmt->execute([$pid]);
	$row = $stmt->fetch();

	echo json_encode(array(
		"data" => $row['data']
	));
	exit;

}
else{

	if(!isset($_POST['pid'])) {
		http_response_code(422);
		exit;
	}
	$pid = $_POST['pid'];

	$stmt = $pdo->prepare("SELECT status FROM \"User_Project\" WHERE uid = ? AND pid = ?");
	$stmt->execute([$uid, $pid]);
	$row = $stmt->fetch();

	if($row['status'] != "owner"
	&& $row['status'] != "editor") {
		http_response_code(401);
		exit;
	}

	if($op == "edit") {

		if(!isset($_POST['title'])
		|| !isset($_POST['description'])) {
			http_response_code(422);
			exit;
		}
		$title = $_POST['title'];
		$description = $_POST['description'];

		$stmt = $pdo->prepare("UPDATE \"Project\" SET title = ?, description = ? WHERE pid = ?");
		$stmt->execute([$title, $description, $pid]);

		echo json_encode(array("status" => "success"));
		exit;

	}
	else
	if($op == "delete") {

		$stmt = $pdo->prepare("DELETE FROM \"Project\" WHERE pid = ?");
		$stmt->execute([$pid]);

		echo json_encode(array("status" => "success"));
		exit;

	}
	else
	if($op == "publish") {

		$stmt = $pdo->prepare("SELECT title, description FROM \"Project\" WHERE pid = ?");
		$stmt->execute([$pid]);
		$row = $stmt->fetch();

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_URL, "https://forum.tellusmap.com/posts.json");
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
			"Content-Type: application/json",
			"Api-Key: $apikey",
			"Api-Username: {$_SESSION['username']}"
		));
		curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(array(
			"title" => $row['title'],
			"raw" => "{$row['description']}

[Click to view map](https://tellusmap.com/pres.php?pid=$pid)
Created by: @{$_SESSION['username']}",
			"category" => 5
		)));
		$res = curl_exec($ch);
		curl_close($ch);
		$res = json_decode($res, true);

		$url = "https://forum.tellusmap.com/t/{$res['topic_slug']}/{$res['topic_id']}";

		$stmt = $pdo->prepare("UPDATE \"Project\" SET post = ? WHERE pid = ?");
		$stmt->execute([$url, $pid]);

		echo json_encode(array(
			"url" => $url
		));
		exit;

	}
	else
	if($op == "write") {

		if(!isset($_POST['data'])) {
			http_response_code(422);
			exit;
		}
		$data = $_POST['data'];

		$stmt = $pdo->prepare("UPDATE \"Project\" SET data = ? WHERE pid = ?");
		$stmt->execute([$data, $pid]);

		echo json_encode(array("status" => "success"));
		exit;

	}
	else{
		http_response_code(501);
		exit;
	}

}
