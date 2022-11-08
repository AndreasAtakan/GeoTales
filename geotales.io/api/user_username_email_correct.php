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


/*if(!isset($_GET['username'])
|| !isset($_GET['email'])) { http_response_code(422); exit; }*/

$username = $_GET['username'];
$email = $_GET['email'];

echo json_encode(array(
	"isValid" => validUserEmail($PDO, $username, $email)
));
exit;

?>
