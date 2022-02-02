<?php
/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

ini_set('display_errors', 'On'); ini_set('html_errors', 0); error_reporting(-1);



//
function validUID($PDO, $uid) {
	$stmt = $PDO->prepare("SELECT count(uid) AS c FROM \"User\" WHERE uid = ?");
	$stmt->execute([$uid]);
	$row = $stmt->fetch();

	return $row['c'] == 1;
}



//
function getAvatar($host, $username) {
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_URL, "https://$host/u/$username.json");
	$res = curl_exec($ch);
	curl_close($ch);
	$res = json_decode($res, true);
	$res = str_replace('{size}', '30', $res['user']['avatar_template']);

	return "https://{$host}{$res}";
}
