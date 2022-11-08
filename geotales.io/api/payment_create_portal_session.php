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

$user_id = headerUserID();

$portal = paymentCreatePortal($PDO, $user_id);
if(!$portal) { http_response_code(500); exit; }

echo json_encode(array(
	"url" => $portal
));
exit;

?>
