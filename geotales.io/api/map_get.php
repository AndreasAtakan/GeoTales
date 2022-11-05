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

if(!isset($_GET['id'])) { http_response_code(422); exit; }
$id = $_GET['id'];

$stmt = $PDO->prepare("SELECT title, description, thumbnail, published_date IS NOT NULL AS published FROM \"Map\" WHERE id = ?");
$stmt->execute([$id]);
$row = $stmt->fetch();

echo json_encode(array(
	"title" => $row['title'],
	"description" => $row['description'],
	"thumbnail" => $row['thumbnail'],
	"published" => $row['published'] ?? false
));
exit;

?>
