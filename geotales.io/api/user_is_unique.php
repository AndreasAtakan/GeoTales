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


if(!isset($_GET['username'])
&& !isset($_GET['email'])) { http_response_code(422); exit; }
$username = $_GET['username'] ?? null;
$email = $_GET['email'] ?? null;

if(!sane_is_null($username)) {
	$stmt = $PDO->prepare("SELECT COUNT(id) = 0 AS c FROM \"User\" WHERE username = ?");
	$stmt->execute([$username]);
}
else
if(!sane_is_null($email)) {
	$stmt = $PDO->prepare("SELECT COUNT(id) = 0 AS c FROM \"User\" WHERE email = ?");
	$stmt->execute([$email]);
}

$row = $stmt->fetch();

echo json_encode(array(
	"isUnique" => $row['c'] ?? false
));
exit;

?>
