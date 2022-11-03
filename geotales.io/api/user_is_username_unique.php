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


if(!isset($_GET['username'])) { http_response_code(422); exit; }
$username = $_GET['username'];

$stmt = $PDO->prepare("SELECT COUNT(id) = 0 AS c FROM \"User\" WHERE username = ?");
$stmt->execute([$username]);
$row = $stmt->fetch();

echo json_encode(array(
	"isUnique" => $row['c'] ?? false
));
exit;

?>
