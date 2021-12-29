<?php

$host = "localhost";
$user = "www-data";
$pass = "vleowemnxoyvq"; # secret
$db   = "www-data";
//$charset = "utf8mb4";

$dsn = "pgsql:host=$host;dbname=$db;options='--client_encoding=UTF8'";
$options = array(
	PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
	PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
	PDO::ATTR_EMULATE_PREPARES   => false
);
try {
	$pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
	throw new \PDOException($e->getMessage(), (int)$e->getCode());
}
