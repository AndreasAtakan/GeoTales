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

include "init.php";
include_once("helper.php");

// Not logged in
if(!isset($_SESSION['uid']) || !validUID($PDO, $_SESSION['uid'])) {
	header("location: login.php?return_url=stage.php"); exit;
}
$uid = $_SESSION['uid'];

//
// Onboarding users; "Try now" button on landing-page links here throught login.php's return_url parameter

$title = "First map";
$description = "My first map";

$stmt = $PDO->prepare("INSERT INTO \"Map\" (title, description) VALUES (?, ?) RETURNING id");
$stmt->execute([$title, $description]);
$id = $stmt->fetchColumn();

$stmt = $PDO->prepare("INSERT INTO \"User_Map\" (user_id, map_id, status) VALUES (?, ?, ?)");
$stmt->execute([$uid, $id, "owner"]);

header("location: ../edit.php?id=$id");
