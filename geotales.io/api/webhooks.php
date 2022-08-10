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

$payload = file_get_contents("php://input");
$data = json_decode($payload, true);


if($_SERVER['X-Discourse-Event'] == "user_destroyed") {

	$sha = hash_hmac("sha256", $payload, $CONFIG['discourse_webhooks_secret']);
	if($_SERVER['X-Discourse-Event-Signature'] != $sha) {
		http_response_code(401); exit;
	}
	$uid = $data['user']['id'];

	$stmt = $PDO->prepare("SELECT stripe_id FROM \"User\" WHERE uid = ?");
	$stmt->execute([$uid]);
	$row = $stmt->fetch();
	$stripe_id = $row['stripe_id'];

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_URL, "https://api.stripe.com/v1/customers/{$stripe_id}");
	curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
	curl_setopt($ch, CURLOPT_USERPWD, $TESTING ? $CONFIG['stripe_secret_key_test'] : $CONFIG['stripe_secret_key_live']);
	$res = curl_exec($ch);
	curl_close($ch);
	$res = json_decode($res, true);

	if(!$res['deleted']) { http_response_code(500); exit; }

	$stmt = $PDO->prepare("DELETE FROM \"User\" WHERE uid = ?");
	$stmt->execute([$uid]);

	http_response_code(200); exit;

}
else
if($data['type'] == "customer.subscription.created"
|| $data['type'] == "customer.subscription.deleted") {

	$prod = $data['data']['object']['items']['data'][0]['price']['product'];
	$cust = $data['data']['object']['customer'];
	$paid = $data['type'] == "customer.subscription.created";

	if($prod == $CONFIG['stripe_product_id']) {
		$stmt = $PDO->prepare("UPDATE \"User\" SET paid = ? WHERE stripe_id = ?");
		$stmt->execute([$paid, $cust]);
	}
	else{ http_response_code(500); exit; }

	http_response_code(200); exit;

}
else
if($data['type'] == "customer.deleted") {

	$stripe_id = $data['data']['object']['id'];
	$stmt = $PDO->prepare("UPDATE \"User\" SET paid = false, stripe_id = null WHERE stripe_id = ?");
	$stmt->execute([$stripe_id]);

	http_response_code(200); exit;

}
else{
	http_response_code(501); exit;
}
