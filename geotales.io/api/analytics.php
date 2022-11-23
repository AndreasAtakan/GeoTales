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

require_once "../vendor/autoload.php";


$user_id = headerUserID();

$location = explode("/", $_SERVER['HTTP_REFERER']);
$location = end($location);

$lookup = new GeoIp2\Database\Reader("/usr/local/share/geoip/GeoLite2-City.mmdb");
$record = $lookup->city($_SERVER['HTTP_X_FORWARDED_FOR']);
$city = "{$record->city->name}, {$record->country->name}";

$agent = isset($_POST['agent']) ? sanitize($_POST['agent']) : $_SERVER['HTTP_USER_AGENT'];

$stmt = $PDO->prepare("INSERT INTO \"Analytics\" (user_id, location, city, agent) VALUES (?, ?, ?, ?)");
$stmt->execute([ $user_id, $location, $city, $agent ]);

echo json_encode(array("status" => "success"));
exit;

?>
