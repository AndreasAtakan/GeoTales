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

if(!isset($_REQUEST['op'])) {
	http_response_code(422); exit;
}
$op = $_REQUEST['op'];


// Not logged in
if(!isset($_SESSION['uid']) || !validUID($PDO, $_SESSION['uid'])) {
	http_response_code(401); exit;
}
$uid = $_SESSION['uid'];
$username = $_SESSION['username'];



if($op == "create_checkout_session") {

	$stmt = $PDO->prepare("SELECT paid, stripe_id FROM \"User\" WHERE uid = ?");
	$stmt->execute([$uid]);
	$row = $stmt->fetch();
	$stripe_id = $row['stripe_id'];

	if($row['paid']) { http_response_code(500); exit; }
	if(is_null($stripe_id)) {
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_URL, "https://api.stripe.com/v1/customers");
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array( "Content-Type: application/x-www-form-urlencoded" ));
		curl_setopt($ch, CURLOPT_USERPWD, $TESTING ? $CONFIG['stripe_secret_key_test'] : $CONFIG['stripe_secret_key_live']);
		curl_setopt($ch, CURLOPT_POSTFIELDS, "name={$username}");
		$res = curl_exec($ch);
		curl_close($ch);
		$res = json_decode($res, true);

		$stripe_id = $res['id'];
		$stmt = $PDO->prepare("UPDATE \"User\" SET stripe_id = ? WHERE id = ?");
		$stmt->execute([$stripe_id, $uid]);
	}

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_URL, "https://api.stripe.com/v1/checkout/sessions");
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array( "Content-Type: application/x-www-form-urlencoded" ));
	curl_setopt($ch, CURLOPT_USERPWD, $TESTING ? $CONFIG['stripe_secret_key_test'] : $CONFIG['stripe_secret_key_live']);
	curl_setopt($ch, CURLOPT_POSTFIELDS, "success_url={$CONFIG['host']}/settings.php&
										  cancel_url={$CONFIG['host']}/settings.php&
										  mode=subscription&customer={$stripe_id}&
										  line_items[0][price]={$CONFIG['stripe_price_id']}&
										  line_items[0][quantity]=1");
	$res = curl_exec($ch);
	curl_close($ch);
	$res = json_decode($res, true);

	echo json_encode(array(
		"url" => $res['url']
	));
	exit;

}
else
if($op == "create_portal_session") {

	$stmt = $PDO->prepare("SELECT paid, stripe_id FROM \"User\" WHERE uid = ?");
	$stmt->execute([$uid]);
	$row = $stmt->fetch();

	if(!$row['paid'] || is_null($row['stripe_id'])) { http_response_code(500); exit; }

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_URL, "https://api.stripe.com/v1/billing_portal/sessions");
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array( "Content-Type: application/x-www-form-urlencoded" ));
	curl_setopt($ch, CURLOPT_USERPWD,
		$TESTING ? $CONFIG['stripe_secret_key_test'] : $CONFIG['stripe_secret_key_live']
	);
	curl_setopt($ch, CURLOPT_POSTFIELDS, "customer={$row['stripe_id']}&
										  return_url={$CONFIG['host']}/settings.php");
	$res = curl_exec($ch);
	curl_close($ch);
	$res = json_decode($res, true);

	echo json_encode(array(
		"url" => $res['url']
	));
	exit;

}else{
	http_response_code(501); exit;
}
