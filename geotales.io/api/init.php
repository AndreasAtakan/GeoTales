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
	"host" => $TESTING ? "http://localhost/geotales" : "https://{$_SERVER['SERVER_NAME']}",
	"forum_host" => "forum.geotales.io",
	"email" => "contact@geotales.io",

	//"apikey" => "4b90e8c0d5778d0fa06a5ba399cccf2c3c01fdcc2c5178b028a29b6075fec017", // old
	"discourse_apikey" => "15f3af9ac9fed3435fbabdbecabbdc614cd7dd670dbf540adf6649846161c1ef", // secret
	"discourse_sso_secret" => "xnUhKjs4HfYqmPhLTgKFutvN7", // secret
	"discourse_webhooks_secret" => "xnUhKjs4HfYqmPhLTgKFutvN7", // secret

	"aws_access_key_id" => "AKIA5RSTXAFR7IU7J467", // secret
	"aws_secret_access_key" => "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", // secret
	"aws_bucket_name" => "geotales", // secret
	"aws_region" => "eu-north-1", // secret

	"stripe_publishable_key_live" => "pk_live_51LUu5CHd8g1LTf9TjhRd9vfUpk5sctMg2HpeyNRHxU14IWuqavOOlSXYdOfx2GF3Bl6QQ9N7KRswdITm40S0NeYj00Oqfxraht",
	"stripe_secret_key_live" => "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", // secret
	"stripe_publishable_key_test" => "pk_test_51LUu5CHd8g1LTf9T1EmnnA4u8pEN9KrUuF2LJOQBMt9u22sCUaTBw43L6dhKYyG2daCrMNeHFEyBNjigxlmhQpRf00u2N9fFaQ",
	"stripe_secret_key_test" => "sk_test_51LUu5CHd8g1LTf9TmgT5T4M5QeBi7RRtFCGv5rlfMX2gwRuQ0Go5hGUqwmkBXpVdOt959kBD9ylhDyhq9ZbMU3gq00zr9sNaVS", // secret
	"stripe_price_id" => $TESTING ? "price_1LUv2YHd8g1LTf9TTDZSSXLW" : "price_1LUvHNHd8g1LTf9TE4dPmf5g", // secret
	"stripe_product_id" => $TESTING ? "prod_MDLkgjpY91RExH" : "prod_MDLzrJl69Fqrib" // secret
);
