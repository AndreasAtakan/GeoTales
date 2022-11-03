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


$user_id = null;
if(isset($_SESSION['user_id']) && validUserID($PDO, $_SESSION['user_id'])) { $user_id = $_SESSION['user_id']; } // Is logged in

$stmt = $PDO->prepare("INSERT INTO \"Analytics\" (user_id, location, ip, agent) VALUES (?, ?, ?, ?)");
$stmt->execute([$user_id, $_SERVER['HTTP_REFERER'], $_SERVER['REMOTE_ADDR'], $_POST['agent'] ?? $_SERVER['HTTP_USER_AGENT']]);

echo json_encode(array("status" => "success"));
exit;

?>
