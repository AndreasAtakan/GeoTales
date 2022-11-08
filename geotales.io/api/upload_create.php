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

//if(!isset($_POST['type'])) { http_response_code(422); exit; }

$user_id = headerUserID();

$type = sanitize($_POST['type']);

$res = uploadCreate($PDO, $user_id, $type, $_FILES["image"]["tmp_name"], $_FILES["image"]["name"]);

if(!$res) { http_response_code(500); exit; }

echo $res;
exit;

?>
