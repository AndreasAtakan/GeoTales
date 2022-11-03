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


if(!isset($_GET['id'])
|| !isset($_GET['password'])) {
	http_response_code(422); exit;
}
$id = $_GET['id'];
$password = $_GET['password'];

$user_can_write = false;
if(isset($_SESSION['user_id']) && validUserID($PDO, $_SESSION['user_id'])) {
	$user_can_write = userMapCanWrite($PDO, $_SESSION['user_id'], $id);
}
if(mapHasPw($PDO, $id)
&& !$user_can_write
&& !mapCheckPw($PDO, $id, $password)) { http_response_code(401); exit; }

$stmt = $PDO->prepare("SELECT data FROM \"Map\" WHERE id = ?");
$stmt->execute([$id]);
$row = $stmt->fetch();

echo json_encode(array(
	"data" => $row['data']
));
exit;

?>
