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


// KREVER AT CLIENTEN ER LOGGET INN

$user_id = $_SESSION['user_id'];

$stmt = $PDO->prepare("SELECT U.ref, UU.type FROM \"User_Upload\" AS UU INNER JOIN \"Upload\" AS U ON UU.upload_id = U.id WHERE UU.user_id = ?");
$stmt->execute([$user_id]);
$rows = $stmt->fetchAll();

echo json_encode($rows);
exit;

?>
