<?php
/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Can Atakan <aca@tellusmap.com>, January 2022              *
*******************************************************************************/

ini_set('display_errors', 'On'); ini_set('html_errors', 0); error_reporting(-1);

//session_set_cookie_params(['SameSite' => 'None', 'Secure' => true]);
session_start();

include "../init.php";

if(!isset($_SESSION['uid'])) { // Not logged in
	http_response_code(401);
	exit;
}
$uid = $_SESSION['uid'];

if(!isset($_REQUEST['op'])) {
	http_response_code(422);
	exit;
}
$op = $_REQUEST['op'];



if($op != "") {

	echo json_encode(array("status" => "success"));
	exit;

}
else{
	http_response_code(501);
	exit;
}
