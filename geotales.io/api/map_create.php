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

if(!isset($_POST['title'])
|| !isset($_POST['description'])) { http_response_code(422); exit; }

$user_id = $_SESSION['user_id'];

$title = sanitize($_POST['title']);
$description = sanitize($_POST['description']);
$thumbnail = null;
$password = $_POST['password'] ?? null;

if(isset($_FILES["thumbnail"])) { $thumbnail = uploadCreate($PDO, $user_id, "thumbnail", $_FILES["thumbnail"]["tmp_name"], $_FILES["thumbnail"]["name"]); }

$id = mapCreate($PDO, $user_id, $title, $description, $thumbnail, $password);

$ref = "";
if(!$id) { $ref = paymentCreateCheckout($PDO, $user_id); }
else { $ref = "edit.php?id={$id}"; }

echo json_encode(array("url" => $ref));
exit;

?>
