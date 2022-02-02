<?php
/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
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

$FLAG = false;
$CONFIG = array(
	"host" => "tellusmap.com",
	"forum_host" => "forum.tellusmap.com",
	"email" => "contact@tellusmap.com",
	"apikey" => "4b90e8c0d5778d0fa06a5ba399cccf2c3c01fdcc2c5178b028a29b6075fec017", // secret
	"sso_secret" => "xnUhKjs4HfYqmPhLTgKFutvN7", // secret
	"webhooks_secret" => "xnUhKjs4HfYqmPhLTgKFutvN7" // secret
);
