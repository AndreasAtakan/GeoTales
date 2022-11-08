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

/*if(!isset($_POST['id'])
|| !isset($_POST['password'])) { http_response_code(422); exit; }*/

$user_id = headerUserID();

$id = $_POST['id'];
$password = $_POST['password'];

$id = mapClone($PDO, $user_id, $id, $password);

$ref = "";
if(!$id) {
	$ref = paymentCreateCheckout($PDO, $user_id);
}else{
	$ref = "edit.php?id={$id}";
}

echo json_encode(array("url" => $ref));
exit;

?>
