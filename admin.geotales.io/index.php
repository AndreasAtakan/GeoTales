<?php
/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@geotales.io>, January 2022                  *
*******************************************************************************/

ini_set('display_errors', 'On'); ini_set('html_errors', 0); error_reporting(-1);

include "init.php";
include_once("helper.php");

$user_id = headerUserID();

if(sane_is_null($user_id)) { // Not logged in
	header("location: signin.php"); exit;
}


// Operations
if(isset($_POST['op']) && isset($_POST['table']) && isset($_POST['id'])) {
	$op = $_POST['op'];
	$table = $_POST['table'];
	$id = $_POST['id'];

	if($op == "delete") {
		if($table == "User") { userDelete($PDO, $id); }
		else
		if($table == "Map") { mapDelete($PDO, $id); }
		else
		if($table == "Comment") { commentDelete($PDO, $id); }
	}
	else
	if($op == "make_premium" && $table == "User") { userMakePremium($PDO, $id); }
	else
	if($op == "reset_password" && $table == "User") { /**/ }
	else
	if($op == "unpublish" && $table == "Map") { mapUnpublish($PDO, $id); }
}


// Get results

$table = isset($_POST['table']) ? sanitize($_POST['table']) : "User";

$stmt = $PDO->prepare("SELECT * FROM \"{$table}\" LIMIT 500");
$stmt->execute();
$rows = $stmt->fetchAll();
$count = $stmt->rowCount();

$stmt = $PDO->prepare("SELECT column_name AS n FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ?");
$stmt->execute([$table]);
$cs = $stmt->fetchAll(); $columns = array();
foreach($cs as $c) { array_push($columns, $c['n']); }

$res = $rows;

if($table == "Map") {
	array_push($columns, "likes", "views", "flags");
	$columns = array_diff($columns, array("data"));

	$ids = array(); foreach($rows as $row) { array_push($ids, $row['id']); }
	$likes = getAllLikes($PDO, $ids);
	$views = getAllViews($PDO, $ids);
	$flags = getAllFlags($PDO, $ids);

	$res = array();
	foreach($rows as $row) {
		$r = $row;
		$r['likes'] = $likes[ $row['id'] ] ?? 0;
		$r['views'] = $views[ $row['id'] ] ?? 0;
		$r['flags'] = $flags[ $row['id'] ] ?? 0;
		array_push($res, $r);
	}

	usort($res, function($a, $b) { return $b['flags'] - $a['flags']; });
}

?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta http-equiv="x-ua-compatible" content="ie=edge" />
		<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, shrink-to-fit=no, target-densitydpi=device-dpi" />

		<meta name="csrf-token" content="<?php echo headerCSRFToken(); ?>" />

		<title>GeoTales – Admin</title>
		<meta name="title" content="GeoTales" />
		<meta name="description" content="Admin" />

		<link rel="icon" href="assets/logo.png" />

		<!-- Load lib/ CSS -->
		<link rel="stylesheet" href="lib/fontawesome/css/all.min.css" />

		<!-- Load CSS -->
		<link rel="stylesheet" href="main.css" />

		<style type="text/css">
			html, body {
				/**/
			}
		</style>
	</head>
	<body>

		<form method="post" autocomplete="off" id="search">
			<select name="table">
				<option value="" disabled selected>Choose..</option>
				<option value="User">User</option>
				<option value="Map">Map</option>
				<option value="Comment">Comment</option>
				<option value="Upload">Upload</option>
			</select>
		</form>

		<br />

		<form method="post">
			<input type="hidden" name="table" value="<?php echo $table; ?>">
			<button type="submit">REFRESH LIST</button>
		</form>

		<br /><br />

		<table>
	<?php if($count > 0) { ?>
			<caption><?php echo "{$table} – {$count}"; ?></caption>
			<thead>
				<tr>
	<?php foreach($columns as $c) { ?>
					<th><?php echo $c; ?></th>
	<?php } ?>
				</tr>
			</thead>
			<tbody>
	<?php foreach($res as $row) { ?>
				<tr>
		<?php foreach($columns as $c) { ?> <td><?php echo $row[ $c ]; ?></td> <?php } ?>
		<?php
			if($table == "User"
			|| $table == "Map"
			|| $table == "Comment") {
		?>
					<td>
						<form method="post">
							<input type="hidden" name="op" value="delete" />
							<input type="hidden" name="table" value="<?php echo $table; ?>" />
							<input type="hidden" name="id" value="<?php echo $row['id']; ?>" />
							<button type="submit">DELETE</button>
						</form>
					</td>
		<?php } if($table == "User") { ?>
					<td>
						<form method="post">
							<input type="hidden" name="op" value="make_premium" />
							<input type="hidden" name="table" value="<?php echo $table; ?>" />
							<input type="hidden" name="id" value="<?php echo $row['id']; ?>" />
							<button type="submit">MAKE PREMIUM</button>
						</form>
					</td>
					<td>
						<form method="post">
							<input type="hidden" name="op" value="reset_password" />
							<input type="hidden" name="table" value="<?php echo $table; ?>" />
							<input type="hidden" name="id" value="<?php echo $row['id']; ?>" />
							<button type="submit">RESET PASSWORD</button>
						</form>
					</td>
		<?php } if($table == "Map") { ?>
					<td>
						<form method="post">
							<input type="hidden" name="op" value="unpublish" />
							<input type="hidden" name="table" value="<?php echo $table; ?>" />
							<input type="hidden" name="id" value="<?php echo $row['id']; ?>" />
							<button type="submit">UNPUBLISH</button>
						</form>
					</td>
		<?php } ?>
				</tr>
	<?php } ?>
			</tbody>
	<?php }else{ ?>
			<caption>None found</caption>
	<?php } ?>
		</table>

		<!-- Load lib/ JS -->
		<script type="text/javascript" src="lib/fontawesome/js/all.min.js"></script>
		<script type="text/javascript" src="lib/jquery/jquery-3.6.1.min.js"></script>

		<!-- Load JS -->
		<script type="text/javascript" src="assets/ajax_setup.js"></script>
		<script type="text/javascript">
			"use strict";

			window.onload = function(ev) {

				$("select[name=\"table\"]").change(ev => { document.forms.search.submit(); });

			};
		</script>

	</body>
</html>
