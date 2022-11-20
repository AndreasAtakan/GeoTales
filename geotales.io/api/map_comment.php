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
|| !isset($_POST['content'])
|| sane_is_null($_POST['content'])) { http_response_code(422); exit; }

$user_id = headerUserID();

$id = $_POST['id'];
$content = sanitize($_POST['content']);
$ref = isset($_POST['ref']) ? sanitize($_POST['ref']) : null;

$stmt = $PDO->prepare("INSERT INTO \"Comment\" (user_id, map_id, ref, content) VALUES (?, ?, ?, ?)");
$stmt->execute([$user_id, $id, $ref, $content]);

echo json_encode(array("status" => "success"));
exit;

?>
