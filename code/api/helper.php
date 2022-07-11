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

include "init.php";



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

	if(!isset($res['user'])) { return "assets/user-circle-solid.svg"; }

	$res = str_replace('{size}', '30', $res['user']['avatar_template']);

	return "https://{$host}{$res}";
}



//
function getS3Hostname() {
	global $CONFIG;
	return $CONFIG['aws_bucket_name'] . ".s3.amazonaws.com";
}

function getS3Headers($file_path, $file_name) {
	global $CONFIG;

	// AWS API keys
	$aws_access_key_id = $CONFIG['aws_access_key_id'];
	$aws_secret_access_key = $CONFIG['aws_secret_access_key'];

	// AWS region and Host Name
	$aws_region = $CONFIG['aws_region'];
	$host_name = getS3Hostname();

	// Server path where content is present
	$content = file_get_contents($file_path);

	// AWS file permissions
	$content_acl = "public-read";

	// MIME type of file. Very important to set if you later plan to load the file from a S3 url in the browser (images, for example)
	$content_type = mime_content_type($file_path);
	// Name of content on S3
	$content_title = uniqid() . "." . strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

	// Service name for S3
	$aws_service_name = "s3";

	// UTC timestamp and date
	$timestamp = gmdate("Ymd\THis\Z");
	$date = gmdate("Ymd");

	// HTTP request headers as key & value
	$request_headers = array();
	$request_headers['Content-Type'] = $content_type;
	$request_headers['Date'] = $timestamp;
	$request_headers['Host'] = $host_name;
	$request_headers['x-amz-acl'] = $content_acl;
	$request_headers['x-amz-content-sha256'] = hash("sha256", $content);
	// Sort it in ascending order
	ksort($request_headers);

	// Canonical headers
	$canonical_headers = [];
	foreach($request_headers as $key => $value) {
		$canonical_headers[] = strtolower($key) . ":" . $value;
	}
	$canonical_headers = implode("\n", $canonical_headers);

	// Signed headers
	$signed_headers = [];
	foreach($request_headers as $key => $value) {
		$signed_headers[] = strtolower($key);
	}
	$signed_headers = implode(";", $signed_headers);

	// Cannonical request 
	$canonical_request = [];
	$canonical_request[] = "PUT";
	$canonical_request[] = "/" . $content_title;
	$canonical_request[] = "";
	$canonical_request[] = $canonical_headers;
	$canonical_request[] = "";
	$canonical_request[] = $signed_headers;
	$canonical_request[] = hash("sha256", $content);
	$canonical_request = implode("\n", $canonical_request);
	$hashed_canonical_request = hash("sha256", $canonical_request);

	// AWS Scope
	$scope = [];
	$scope[] = $date;
	$scope[] = $aws_region;
	$scope[] = $aws_service_name;
	$scope[] = "aws4_request";

	// String to sign
	$string_to_sign = [];
	$string_to_sign[] = "AWS4-HMAC-SHA256"; 
	$string_to_sign[] = $timestamp; 
	$string_to_sign[] = implode("/", $scope);
	$string_to_sign[] = $hashed_canonical_request;
	$string_to_sign = implode("\n", $string_to_sign);

	// Signing key
	$kSecret = "AWS4" . $aws_secret_access_key;
	$kDate = hash_hmac("sha256", $date, $kSecret, true);
	$kRegion = hash_hmac("sha256", $aws_region, $kDate, true);
	$kService = hash_hmac("sha256", $aws_service_name, $kRegion, true);
	$kSigning = hash_hmac("sha256", "aws4_request", $kService, true);

	// Signature
	$signature = hash_hmac("sha256", $string_to_sign, $kSigning);

	// Authorization
	$authorization = [
		"Credential=" . $aws_access_key_id . "/" . implode("/", $scope),
		"SignedHeaders=" . $signed_headers,
		"Signature=" . $signature
	];
	$authorization = "AWS4-HMAC-SHA256" . " " . implode(",", $authorization);

	// Curl headers
	$curl_headers = [ "Authorization: " . $authorization ];
	foreach($request_headers as $key => $value) {
		$curl_headers[] = $key . ": " . $value;
	}

	return array(
		"curl_headers" => $curl_headers,
		"content_title" => $content_title
	);
}

function uploadToS3($file_path, $file_name) {
	$host_name = getS3Hostname();
	$headers = getS3Headers($file_path, $file_name);

	$curl_headers = $headers['curl_headers'];

	$content = file_get_contents($file_path);
	$content_title = $headers['content_title'];

	$url = "https://" . $host_name . "/" . $content_title;
	$ch = curl_init($url);
	curl_setopt($ch, CURLOPT_HEADER, false);
	curl_setopt($ch, CURLOPT_HTTPHEADER, $curl_headers);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
	//curl_setopt($ch, CURLOPT_FAILONERROR, true);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
	curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
	curl_setopt($ch, CURLOPT_POSTFIELDS, $content);
	$res = curl_exec($ch);
	//if(curl_errno($ch)) { echo curl_error($ch); }
	curl_close($ch);

	return $res ? $content_title : false;
}
