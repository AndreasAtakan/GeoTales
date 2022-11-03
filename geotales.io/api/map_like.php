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

if(!isset($_POST['id'])) { http_response_code(422); exit; }
$id = $_POST['id'];

$user_id = $_SESSION['user_id'];

$stmt = $PDO->prepare("INSERT INTO \"Reaction\" (user_id, map_id, type) VALUES (?, ?, 'like')");
$stmt->execute([$user_id, $id]);

echo json_encode(array("status" => "success"));
exit;

?>
