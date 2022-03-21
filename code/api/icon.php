<?php
/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

ini_set('display_errors', 'On'); ini_set('html_errors', 0); error_reporting(-1);

//session_set_cookie_params(['SameSite' => 'None', 'Secure' => true]);
session_start();

include "init.php";
include_once("helper.php");


// Not logged in
if(!isset($_SESSION['uid']) || !validUID($PDO, $_SESSION['uid'])) {
	http_response_code(401); exit;
}
$uid = $_SESSION['uid'];


$stmt = $PDO->prepare("
	SELECT
		I.ref
	FROM
		\"User_Icon\" AS UI INNER JOIN
		\"Icon\" AS I
			ON UI.icon_id = I.id
	WHERE
		UI.user_id = ?
");
$stmt->execute([$uid]);
$rows = $stmt->fetchAll();

echo json_encode($rows);

exit;
