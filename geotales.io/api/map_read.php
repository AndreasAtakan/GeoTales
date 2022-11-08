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


/*if(!isset($_GET['id'])
|| !isset($_GET['password'])) { http_response_code(422); exit; }*/

$id = $_GET['id'];
$password = $_GET['password'];

$user_can_write = false;
$user_id = headerUserID();
if(!sane_is_null($user_id)) {
	$user_can_write = userMapCanWrite($PDO, $user_id, $id);
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
