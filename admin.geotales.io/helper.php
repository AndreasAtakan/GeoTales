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
function random_string($length = 10) {
	$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	$charactersLength = strlen($characters);
	$randomString = '';
	for($i = 0; $i < $length; $i++) {
		$randomString .= $characters[rand(0, $charactersLength - 1)];
	}
	return $randomString;
}

//
function headerUserID() {
	return getallheaders()['X-User-ID'] ?? null;
}

//
function headerCSRFToken() {
	return getallheaders()['X-CSRF-Token'] ?? null;
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
function userDelete($PDO, $user_id) {
	$stmt = $PDO->prepare("DELETE FROM \"User\" WHERE id = ?");
	$stmt->execute([$user_id]);
	return true;
}

//
function userMakePremium($PDO, $user_id) {
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

	$stmt = $PDO->prepare("UPDATE \"User\" SET paid = true WHERE id = ?");
	$stmt->execute([$user_id]);
	return true;
}



//
function mapDelete($PDO, $map_id) {
	$stmt = $PDO->prepare("DELETE FROM \"Map\" WHERE id = ?");
	$stmt->execute([$map_id]);
	return true;
}

//
function mapUnpublish($PDO, $map_id) {
	$stmt = $PDO->prepare("UPDATE \"Map\" SET published_date = NULL WHERE id = ?");
	$stmt->execute([$map_id]);
	return true;
}



//
function commentDelete($PDO, $id) {
	$stmt = $PDO->prepare("DELETE FROM \"Comment\" WHERE id = ?");
	$stmt->execute([$id]);
	return true;
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
