<?php
/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@geotales.io>, January 2022                  *
*******************************************************************************/

ini_set('display_errors', 'On'); ini_set('html_errors', 0); error_reporting(-1);

//session_set_cookie_params(['SameSite' => 'None', 'Secure' => true]);
session_start();

include "init.php";
include_once("helper.php");


$stmt = $PDO->prepare("INSERT INTO \"Analytics\" (location, ip, agent) VALUES (?, ?, ?) RETURNING id");
$stmt->execute([
	$_SERVER['HTTP_REFERER'],
	$_SERVER['REMOTE_ADDR'],
	$_POST['agent'] ?? $_SERVER['HTTP_USER_AGENT']
]);
$id = $stmt->fetchColumn();

if(isset($_SESSION['user_id']) && validUserID($PDO, $_SESSION['user_id'])) { // Is logged in
	$stmt = $PDO->prepare("UPDATE \"Analytics\" SET user_id = ? WHERE id = ?");
	$stmt->execute([$_SESSION['user_id'], $id]);
}

echo json_encode(array("status" => "success"));
exit;
