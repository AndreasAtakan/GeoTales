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

if(!isset($_POST['id'])
|| !isset($_POST['content'])
|| sane_is_null($_POST['content'])) { http_response_code(422); exit; }
$id = $_POST['id'];
$content = sanitize($_POST['content']);
$ref = $_POST['ref'] ?? null;

$user_id = $_SESSION['user_id'];

$stmt = $PDO->prepare("INSERT INTO \"Comment\" (user_id, map_id, ref, content) VALUES (?, ?, ?, ?)");
$stmt->execute([$user_id, $id, $ref, $content]);

echo json_encode(array("status" => "success"));
exit;

?>
