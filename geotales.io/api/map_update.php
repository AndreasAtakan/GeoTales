<?php
/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@geotales.io>, January 2022                    *
*******************************************************************************/

include "../init.php";
include_once("../helper.php");


// KREVER AT CLIENTEN ER LOGGET INN

if(!isset($_POST['id'])
|| !isset($_POST['title'])
|| !isset($_POST['description'])) { http_response_code(422); exit; }

$user_id = headerUserID();

$id = $_POST['id'];

if(!userMapCanWrite($PDO, $user_id, $id)) { http_response_code(401); exit; }

$title = sanitize($_POST['title']);
$description = sanitize($_POST['description']);
$thumbnail = null;
$password = $_POST['password'] ?? null;

if(isset($_FILES["thumbnail"])) { $thumbnail = uploadCreate($PDO, $user_id, "thumbnail", $_FILES["thumbnail"]["tmp_name"], $_FILES["thumbnail"]["name"]); }

$r = mapUpdate($PDO, $id, $title, $description, $thumbnail, $password);
if(!$r) { http_response_code(500); exit; }

echo json_encode(array("status" => "success"));
exit;

?>
