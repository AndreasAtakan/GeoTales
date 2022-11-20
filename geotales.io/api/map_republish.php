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

if(!userMapCanWrite($PDO, $user_id, $id)) { http_response_code(401); exit; }

$published = mapRepublish($PDO, $id);

echo json_encode(array(
	"published" => $published
));
exit;

?>
