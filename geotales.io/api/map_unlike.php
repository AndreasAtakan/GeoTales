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

if(!isset($_POST['id'])) { http_response_code(422); exit; }

$user_id = headerUserID();

$id = $_POST['id'];

$stmt = $PDO->prepare("DELETE FROM \"Reaction\" WHERE type = 'like' AND user_id = ? AND map_id = ?");
$stmt->execute([$user_id, $id]);

echo json_encode(array("status" => "success"));
exit;

?>
