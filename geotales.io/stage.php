<?php
/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@geotales.io>, January 2022                  *
*******************************************************************************/

ini_set('display_errors', 'On'); ini_set('html_errors', 0); error_reporting(-1);

include "init.php";
include_once("helper.php");

$user_id = headerUserID();

if(sane_is_null($user_id)) { // Not logged in
	header("location: signin.php?return_url=stage.php"); exit;
}

//
// Onboarding users; "Try now" button on landing-page links here throught signin.php return_url parameter

$title = "First map";
$description = "My first map";

$stmt = $PDO->prepare("INSERT INTO \"Map\" (title, description) VALUES (?, ?) RETURNING id");
$stmt->execute([$title, $description]);
$id = $stmt->fetchColumn();

$stmt = $PDO->prepare("INSERT INTO \"User_Map\" (user_id, map_id, status) VALUES (?, ?, ?)");
$stmt->execute([$user_id, $id, "owner"]);

header("location: edit.php?id={$id}");

exit;
