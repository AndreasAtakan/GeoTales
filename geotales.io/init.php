<?php
/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@geotales.io>, January 2022                    *
*******************************************************************************/

// config

$TESTING = true;
$CONFIG = array(
	"host" => $TESTING ? "http://localhost/geotales" : "https://{$_SERVER['SERVER_NAME']}",
	"email" => "contact@geotales.io",

	"aws_access_key_id" => "AKIA5RSTXAFR2WC5KUEB", // secret
	"aws_secret_access_key" => "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", // secret
	"aws_bucket_name" => "geotales", // secret
	"aws_region" => "eu-north-1", // secret
	"aws_ses_region" => "email.eu-north-1.amazonaws.com", // secret

	"stripe_publishable_key" => $TESTING ? "pk_test_51LUu5CHd8g1LTf9T1EmnnA4u8pEN9KrUuF2LJOQBMt9u22sCUaTBw43L6dhKYyG2daCrMNeHFEyBNjigxlmhQpRf00u2N9fFaQ" : "pk_live_51LUu5CHd8g1LTf9TjhRd9vfUpk5sctMg2HpeyNRHxU14IWuqavOOlSXYdOfx2GF3Bl6QQ9N7KRswdITm40S0NeYj00Oqfxraht",
	"stripe_secret_key" => $TESTING ? "sk_test_51LUu5CHd8g1LTf9TmgT5T4M5QeBi7RRtFCGv5rlfMX2gwRuQ0Go5hGUqwmkBXpVdOt959kBD9ylhDyhq9ZbMU3gq00zr9sNaVS" : "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", // secret
	"stripe_price_id" => $TESTING ? "price_1LUv2YHd8g1LTf9TTDZSSXLW" : "price_1LUvHNHd8g1LTf9TE4dPmf5g", // secret
	"stripe_product_id" => $TESTING ? "prod_MDLkgjpY91RExH" : "prod_MDLzrJl69Fqrib", // secret
	"stripe_webhooks_secret" => $TESTING ? "whsec_0a9feccdf1e3844afe6da0f40ff518a17dc0a9618f23da9ca9640373219ba637" : "whsec_XHrlB7hYjlMX3vNbFhPdJgM4UyQjLRTu" // secret
);



// DB init

$host = "localhost";
$port = $TESTING ? "5432" : "63333";
$user = $TESTING ? "www-data" : "postgres";
$pass = "vleowemnxoyvq"; // secret
$db   = $TESTING ? "www-data" : "geotales";
//$charset = "utf8mb4";

$dsn = "pgsql:host={$host};port={$port};dbname={$db};options='--client_encoding=UTF8'";
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
