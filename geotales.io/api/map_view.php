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


if(!isset($_POST['id'])) { http_response_code(422); exit; }

$id = $_POST['id'];

$user_id = headerUserID();

$stmt = $PDO->prepare("INSERT INTO \"View\" (user_id, map_id) VALUES (?, ?)");
$stmt->execute([$user_id, $id]);

echo json_encode(array("status" => "success"));
exit;

?>
