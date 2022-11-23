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

require "vendor/autoload.php";

include "init.php";



//
function sane_is_null($v) {
	return is_null($v) || $v == "";
}

//
function sanitize($str) {
	if(sane_is_null($str)) { return null; }
	return htmlspecialchars($str);
}

//
function headerUserID() {
	return $_SERVER["HTTP_X_USER_ID"] ?? null;
}

//
function headerCSRFToken() {
	return $_SERVER["HTTP_X_CSRF_TOKEN"] ?? null;
}



function updateUser($PDO, $user_id, $username, $email, $photo) {
	if(sane_is_null($username)
	&& sane_is_null($email)
	&& sane_is_null($photo)) { return false; }

	if(!sane_is_null($username)) {
		if(isUsernameRegistered($PDO, $username)
		&& $username != getUsername($PDO, $user_id)) { return false; }

		$stmt = $PDO->prepare("UPDATE \"User\" SET username = ? WHERE id = ?");
		$stmt->execute([$username, $user_id]);
	}
	if(!sane_is_null($email)) {
		if(isEmailRegistered($PDO, $email)
		&& $email != getUserEmail($PDO, $user_id)) { return false; }

		$stmt = $PDO->prepare("UPDATE \"User\" SET email = ? WHERE id = ?");
		$stmt->execute([$email, $user_id]);
	}
	if(!sane_is_null($photo)) {
		$stmt = $PDO->prepare("UPDATE \"User\" SET photo = ? WHERE id = ?");
		$stmt->execute([$photo, $user_id]);
	}

	return true;
}



//
function getUsername($PDO, $id) {
	$stmt = $PDO->prepare("SELECT username FROM \"User\" WHERE id = ?");
	$stmt->execute([$id]);
	$row = $stmt->fetch();
	return $row['username'];
}

//
function getUserEmail($PDO, $id) {
	$stmt = $PDO->prepare("SELECT email FROM \"User\" WHERE id = ?");
	$stmt->execute([$id]);
	$row = $stmt->fetch();
	return $row['email'];
}

//
function getUserPhoto($PDO, $id) {
	$stmt = $PDO->prepare("SELECT photo FROM \"User\" WHERE id = ?");
	$stmt->execute([$id]);
	$row = $stmt->fetch();
	$photo = sane_is_null($row['photo']) ? "assets/user-circle-solid.svg" : $row['photo'];
	return $photo;
}

//
function getUserPaid($PDO, $id) {
	$stmt = $PDO->prepare("SELECT paid FROM \"User\" WHERE id = ?");
	$stmt->execute([$id]);
	$row = $stmt->fetch();
	return $row['paid'] ?? false;
}

//
function getUserStripeID($PDO, $id) {
	$stmt = $PDO->prepare("SELECT stripe_id FROM \"User\" WHERE id = ?");
	$stmt->execute([$id]);
	$row = $stmt->fetch();
	return $row['stripe_id'] ?? false;
}

//
function isUsernameRegistered($PDO, $username) {
	$stmt = $PDO->prepare("SELECT COUNT(id) >= 1 AS c FROM \"User\" WHERE username = ?");
	$stmt->execute([$username]);
	$row = $stmt->fetch();
	return $row['c'] ?? false;
}

//
function isEmailRegistered($PDO, $email) {
	$stmt = $PDO->prepare("SELECT COUNT(id) >= 1 AS c FROM \"User\" WHERE email = ?");
	$stmt->execute([$email]);
	$row = $stmt->fetch();
	return $row['c'] ?? false;
}



//
function mapCreate($PDO, $user_id, $title, $description, $thumbnail, $password) {
	if(!getUserPaid($PDO, $user_id)
	&& !userMapWithinLimit($PDO, $user_id)) { return false; }

	$stmt = $PDO->prepare("INSERT INTO \"Map\" (title, description) VALUES (?, ?) RETURNING id");
	$stmt->execute([$title, $description]);
	$id = $stmt->fetchColumn();

	$stmt = $PDO->prepare("INSERT INTO \"User_Map\" (user_id, map_id, status) VALUES (?, ?, ?)");
	$stmt->execute([$user_id, $id, "owner"]);

	if(!sane_is_null($thumbnail)) {
		$stmt = $PDO->prepare("UPDATE \"Map\" SET thumbnail = ? WHERE id = ?");
		$stmt->execute([$thumbnail, $id]);
	}

	if(!sane_is_null($password)) {
		$pw = $password; mb_substr($pw, 0, 64);
		$stmt = $PDO->prepare("UPDATE \"Map\" SET password = ? WHERE id = ?");
		$stmt->execute([$pw, $id]);
	}

	return $id;
}

//
function mapUpdate($PDO, $map_id, $title, $description, $thumbnail, $password) {
	if(sane_is_null($title)
	&& sane_is_null($description)
	&& sane_is_null($thumbnail)
	&& sane_is_null($password)) { return false; }

	if(!sane_is_null($title)) {
		$stmt = $PDO->prepare("UPDATE \"Map\" SET title = ? WHERE id = ?");
		$stmt->execute([$title, $map_id]);
	}
	if(!sane_is_null($description)) {
		$stmt = $PDO->prepare("UPDATE \"Map\" SET description = ? WHERE id = ?");
		$stmt->execute([$description, $map_id]);
	}
	if(!sane_is_null($thumbnail)) {
		$stmt = $PDO->prepare("UPDATE \"Map\" SET thumbnail = ? WHERE id = ?");
		$stmt->execute([$thumbnail, $map_id]);
	}
	if(!sane_is_null($password)) {
		$pw = $password;
		mb_substr($pw, 0, 64);
		$stmt = $PDO->prepare("UPDATE \"Map\" SET password = ? WHERE id = ?");
		$stmt->execute([$pw, $map_id]);
	}

	return true;
}

//
function mapDelete($PDO, $map_id) {
	$stmt = $PDO->prepare("DELETE FROM \"Map\" WHERE id = ?");
	$stmt->execute([$map_id]);
	return true;
}

//
function mapClone($PDO, $user_id, $map_id, $password) {
	if(!getUserPaid($PDO, $user_id)
	&& !userMapWithinLimit($PDO, $user_id)) { return false; }

	if(mapHasPw($PDO, $map_id)
	&& !userMapCanWrite($PDO, $user_id, $map_id)
	&& !mapCheckPw($PDO, $map_id, $password)) { return false; }

	$stmt = $PDO->prepare("INSERT INTO \"Map\" (title, description, thumbnail, data) SELECT CONCAT('Copy of ', title) AS title, description, thumbnail, data FROM \"Map\" WHERE id = ? RETURNING id");
	$stmt->execute([$map_id]);
	$id = $stmt->fetchColumn();

	$stmt = $PDO->prepare("INSERT INTO \"User_Map\" (user_id, map_id, status) VALUES (?, ?, ?)");
	$stmt->execute([$user_id, $id, "owner"]);

	return $id;
}

//
function mapRepublish($PDO, $map_id) {
	$stmt = $PDO->prepare("SELECT published_date IS NOT NULL AS published FROM \"Map\" WHERE id = ?");
	$stmt->execute([$map_id]);
	$row = $stmt->fetch();
	$published = $row['published'] ?? false;
	$published = $published ? "NULL" : "NOW()";

	$stmt = $PDO->prepare("UPDATE \"Map\" SET published_date = {$published} WHERE id = ?");
	$stmt->execute([$map_id]);

	return !$published;
}

//
function mapHasPw($PDO, $map_id) {
	$stmt = $PDO->prepare("SELECT password IS NOT NULL AS pw FROM \"Map\" WHERE id = ?");
	$stmt->execute([$map_id]);
	$row = $stmt->fetch();
	return $row['pw'] ?? false;
}

//
function mapCheckPw($PDO, $map_id, $password) {
	$stmt = $PDO->prepare("SELECT password IS NOT NULL AS pw, password FROM \"Map\" WHERE id = ?");
	$stmt->execute([$map_id]);
	$row = $stmt->fetch();
	$has_pw = $row['pw'] ?? false;
	return $has_pw && $row['password'] == $password;
}

//
function mapGetThumbnail($PDO, $map_id) {
	$stmt = $PDO->prepare("SELECT thumbnail FROM \"Map\" WHERE id = ?");
	$stmt->execute([$map_id]);
	$row = $stmt->fetch();
	return $row['thumbnail'];
}

//
function mapHasThumbnail($PDO, $map_id) {
	return sane_is_null( mapGetThumbnail($PDO, $map_id) );
}



//
function userMapWithinLimit($PDO, $user_id) {
	$stmt = $PDO->prepare("SELECT COUNT(id) <= 5 AS is_within FROM \"User_Map\" WHERE user_id = ? AND status = 'owner'");
	$stmt->execute([$user_id]);
	$row = $stmt->fetch();
	return $row['is_within'] ?? false;
}

//
function userMapCanWrite($PDO, $user_id, $map_id) {
	$stmt = $PDO->prepare("SELECT status IN ('owner', 'editor') AS st FROM \"User_Map\" WHERE user_id = ? AND map_id = ?");
	$stmt->execute([$user_id, $map_id]);
	$row = $stmt->fetch();
	return $row['st'] ?? false;
}

//
function userMapHasLiked($PDO, $user_id, $map_id) {
	$stmt = $PDO->prepare("SELECT COUNT(id) >= 1 AS c FROM \"Reaction\" WHERE type = 'like' AND user_id = ? AND map_id = ?");
	$stmt->execute([$user_id, $map_id]);
	$row = $stmt->fetch();
	return $row['c'] ?? false;
}

//
function userMapHasFlagged($PDO, $user_id, $map_id) {
	$stmt = $PDO->prepare("SELECT COUNT(id) >= 1 AS c FROM \"Flag\" WHERE user_id = ? AND map_id = ?");
	$stmt->execute([$user_id, $map_id]);
	$row = $stmt->fetch();
	return $row['c'] ?? false;
}



//
function getAllLikes($PDO, $map_ids) {
	$ids = "";
	if(count($map_ids) > 0) {
		foreach($map_ids as $id) { $ids .= "'{$id}',"; }
		$ids = mb_substr($ids, 0, -1);
	}else{ $ids = "null"; }

	$likes = array();
	$stmt = $PDO->prepare("SELECT map_id, COUNT(id) AS c FROM \"Reaction\" WHERE map_id IN ({$ids}) AND type = 'like' GROUP BY map_id");
	$stmt->execute();
	$rows = $stmt->fetchAll();
	foreach($rows as $row) { $likes[ $row['map_id'] ] = $row['c']; }
	return $likes;
}

//
function getAllViews($PDO, $map_ids) {
	$ids = "";
	if(count($map_ids) > 0) {
		foreach($map_ids as $id) { $ids .= "'{$id}',"; }
		$ids = mb_substr($ids, 0, -1);
	}else{ $ids = "null"; }

	$views = array();
	$stmt = $PDO->prepare("SELECT map_id, COUNT(id) AS c FROM \"View\" WHERE map_id IN ({$ids}) GROUP BY map_id");
	$stmt->execute();
	$rows = $stmt->fetchAll();
	foreach($rows as $row) { $views[ $row['map_id'] ] = $row['c']; }
	return $views;
}

//
function getAllFlags($PDO, $map_ids) {
	$ids = "";
	if(count($map_ids) > 0) {
		foreach($map_ids as $id) { $ids .= "'{$id}',"; }
		$ids = mb_substr($ids, 0, -1);
	}else{ $ids = "null"; }

	$flags = array();
	$stmt = $PDO->prepare("SELECT map_id, COUNT(id) AS c FROM \"Flag\" WHERE map_id IN ({$ids}) AND type = 'flag' GROUP BY map_id");
	$stmt->execute();
	$rows = $stmt->fetchAll();
	foreach($rows as $row) { $flags[ $row['map_id'] ] = $row['c']; }
	return $flags;
}

//
function getLikes($PDO, $map_id) {
	$stmt = $PDO->prepare("SELECT COUNT(id) AS c FROM \"Reaction\" WHERE type = 'like' AND map_id = ?");
	$stmt->execute([$map_id]);
	$row = $stmt->fetch();
	return $row['c'];
}

//
function getViews($PDO, $map_id) {
	$stmt = $PDO->prepare("SELECT COUNT(id) AS c FROM \"View\" WHERE map_id = ?");
	$stmt->execute([$map_id]);
	$row = $stmt->fetch();
	return $row['c'];
}

//
function getFlags($PDO, $map_id) {
	$stmt = $PDO->prepare("SELECT COUNT(id) AS c FROM \"Flag\" WHERE map_id = ?");
	$stmt->execute([$map_id]);
	$row = $stmt->fetch();
	return $row['c'];
}

//
function getAllComments($PDO, $map_id) {
	$stmt = $PDO->prepare("
		SELECT
			U.username,
			U.photo AS user_photo,
			C.content,
			C.created_date
		FROM
			\"Comment\" AS C INNER JOIN
			\"User\" AS U
				ON C.user_id = U.id
		WHERE
			C.map_id = ?
	");
	$stmt->execute([$map_id]);
	$rows = $stmt->fetchAll();
	return $rows;
}



//
function paymentCreateCheckout($PDO, $user_id) {
	global $CONFIG;

	$paid = getUserPaid($PDO, $user_id);
	$stripe_id = getUserStripeID($PDO, $user_id);

	if($paid) { return false; }
	if(!$stripe_id) {
		$username = getUsername($PDO, $user_id);
		$email = getUserEmail($PDO, $user_id);

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_URL, "https://api.stripe.com/v1/customers");
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array( "Content-Type: application/x-www-form-urlencoded" ));
		curl_setopt($ch, CURLOPT_USERPWD, $CONFIG['stripe_secret_key']);
		curl_setopt($ch, CURLOPT_POSTFIELDS, "name={$username}&email={$email}");
		$res = curl_exec($ch);
		curl_close($ch);
		$res = json_decode($res, true);

		$stripe_id = $res['id'];
		$stmt = $PDO->prepare("UPDATE \"User\" SET stripe_id = ? WHERE id = ?");
		$stmt->execute([$stripe_id, $user_id]);
	}

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_URL, "https://api.stripe.com/v1/checkout/sessions");
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array( "Content-Type: application/x-www-form-urlencoded" ));
	curl_setopt($ch, CURLOPT_USERPWD, $CONFIG['stripe_secret_key']);
	curl_setopt($ch, CURLOPT_POSTFIELDS, "success_url={$CONFIG['host']}/profile.php&
										  cancel_url={$CONFIG['host']}/profile.php&
										  mode=subscription&
										  customer={$stripe_id}&
										  line_items[0][price]={$CONFIG['stripe_price_id']}&
										  line_items[0][quantity]=1");
	$res = curl_exec($ch);
	curl_close($ch);
	$res = json_decode($res, true);

	return $res['url'];
}

//
function paymentCreatePortal($PDO, $user_id) {
	global $CONFIG;

	$paid = getUserPaid($PDO, $user_id);
	$stripe_id = getUserStripeID($PDO, $user_id);

	if(!$paid || !$stripe_id) { return false; }

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_URL, "https://api.stripe.com/v1/billing_portal/sessions");
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array( "Content-Type: application/x-www-form-urlencoded" ));
	curl_setopt($ch, CURLOPT_USERPWD, $CONFIG['stripe_secret_key']);
	curl_setopt($ch, CURLOPT_POSTFIELDS, "customer={$stripe_id}&
										  return_url={$CONFIG['host']}/profile.php");
	$res = curl_exec($ch);
	curl_close($ch);
	$res = json_decode($res, true);

	return $res['url'];
}



//
function uploadCreate($PDO, $user_id, $type, $path, $name) {
	global $CONFIG;

	if(sane_is_null($path)
	|| sane_is_null($name)) { return null; }

	if(getimagesize($path) === false
	|| filesize($path) > 50000000) { return null; }

	$ref = uploadToS3($path, $name);
	if(sane_is_null($ref)) { return null; }

	//$ref = "https://{$CONFIG['aws_bucket_name']}.s3.{$CONFIG['aws_region']}.amazonaws.com/{$res}";

	$stmt = $PDO->prepare("INSERT INTO \"Upload\" (ref) VALUES (?) RETURNING id");
	$stmt->execute([$ref]);
	$id = $stmt->fetchColumn();

	$stmt = $PDO->prepare("INSERT INTO \"User_Upload\" (user_id, upload_id, type) VALUES (?, ?, ?)");
	$stmt->execute([$user_id, $id, $type]);

	return $ref;
}



//
function uploadToS3($file_path, $file_name) {
	global $CONFIG;

	try {
		$s3_client = new Aws\S3\S3Client(array(
			"region" => $CONFIG['aws_region'],
			"version" => "2006-03-01",
			"credentials" => array(
				"key" => $CONFIG['aws_access_key_id'],
				"secret" => $CONFIG['aws_secret_access_key']
			)
		));

		$key = uniqid() . "." . strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

		$res = $s3_client->putObject(array(
			"Bucket" => $CONFIG['aws_bucket_name'],
			"Key" => $key,
			"SourceFile" => $file_path,
			"ACL" => "public-read",
			"ContentType" => mime_content_type($file_path)
		));

		return $res['ObjectURL'];
	}
	catch(Aws\Exception\AwsException $e) { echo $e->getMessage(); }

	return null;
}



//
/*function sendSESEmail($to_address, $subject, $body) {
	global $CONFIG;

	$ses_client = new Aws\Ses\SesClient([
		"region" => $CONFIG['aws_region'],
		"version" => "2006-03-01",
		"credentials" => array(
			"key" => $CONFIG['aws_access_key_id'],
			"secret" => $CONFIG['aws_secret_access_key']
		)
	]);

	$char_set = "UTF-8";
	$sender_email = "contact@geotales.io";

	try {
		$res = $ses_client->sendEmail(array(
			"Destination" => array(
				"ToAddresses" => array( $to_address ),
			),
			"ReplyToAddresses" => array( $sender_email ),
			"Source" => $sender_email,
			"Message" => array(
				"Subject" => array(
					"Charset" => $char_set,
					"Data" => $subject
				),
				"Body" => array(
					"Html" => array(
						"Charset" => $char_set,
						"Data" => $body
					),
					"Text" => array(
						"Charset" => $char_set,
						"Data" => $body
					)
				)
			)
		));

		return true;
	}
	catch(Aws\Exception\AwsException $e) { echo $e->getMessage(); }

	return false;
}*/
