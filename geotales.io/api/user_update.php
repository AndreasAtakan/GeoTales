<?php
/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@geotales.io>, January 2022                    *
*******************************************************************************/

session_start();

include "../init.php";
include_once("../helper.php");


// KREVER AT CLIENTEN ER LOGGET INN

if(!isset($_POST['username'])
&& !isset($_POST['email'])
&& !isset($_POST['password'])) { http_response_code(422); exit; }

echo sanitize($_POST['password']);

$user_id = $_SESSION['user_id'];

$photo = isset($_FILES["photo"]) ? uploadCreate($PDO, $user_id, "profile_photo", $_FILES["photo"]["tmp_name"], $_FILES["photo"]["name"]) : null;

$r = updateUser(
	$PDO,
	$user_id,
	isset($_POST['username']) ? sanitize($_POST['username']) : null,
	isset($_POST['email']) ? sanitize($_POST['email']) : null,
	$photo,
	isset($_POST['password']) ? sanitize($_POST['password']) : null
);
if(!$r) { http_response_code(500); exit; }

echo json_encode(array("status" => "success"));
exit;

?>
