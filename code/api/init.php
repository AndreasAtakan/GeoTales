<?php
/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@geotales.io>, January 2022                    *
*******************************************************************************/

// DB init

$host = "localhost";
$user = "www-data";
$pass = "vleowemnxoyvq"; // secret
$db   = "www-data";
//$charset = "utf8mb4";

$dsn = "pgsql:host=$host;dbname=$db;options='--client_encoding=UTF8'";
$options = array(
	PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
	PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
	PDO::ATTR_EMULATE_PREPARES   => false
);
try {
	$PDO = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
	throw new \PDOException($e->getMessage(), (int)$e->getCode());
}



// config

$TESTING = true;
$CONFIG = array(
	"host" => $_SERVER['SERVER_NAME'],
	"forum_host" => "forum.geotales.io",
	"email" => "contact@geotales.io",

	//"apikey" => "4b90e8c0d5778d0fa06a5ba399cccf2c3c01fdcc2c5178b028a29b6075fec017", // old
	"apikey" => "15f3af9ac9fed3435fbabdbecabbdc614cd7dd670dbf540adf6649846161c1ef", // secret
	"sso_secret" => "xnUhKjs4HfYqmPhLTgKFutvN7", // secret
	"webhooks_secret" => "xnUhKjs4HfYqmPhLTgKFutvN7", // secret

	"aws_access_key_id" => "AKIA5RSTXAFR7IU7J467", // secret
	"aws_secret_access_key" => "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", // secret
	"aws_bucket_name" => "geotales", // secret
	"aws_region" => "eu-north-1" // secret
);
