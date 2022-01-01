<?php

ini_set('display_errors', 'On'); ini_set('html_errors', 0); error_reporting(-1);

//session_set_cookie_params(['SameSite' => 'None', 'Secure' => true]);
session_start();

include "../init.php";

if(!isset($_SESSION['uid'])) { // Not logged in
	http_response_code(401);
	exit;
}
$uid = $_SESSION['uid'];


$fileType = strtolower(pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION));
$file = uniqid().".$fileType";
$path = "../assets/img/$file";
$uploadOk = true;


if(getimagesize($_FILES["image"]["tmp_name"]) === false) { // Not an actual image
	$uploadOk = false;
}


if(file_exists($path)) { // Path already exists
	$uploadOk = false;
}


if($_FILES["image"]["size"] > 10000000) { // Size greater than 10MB
	$uploadOk = false;
}


if($fileType != "jpg"
&& $fileType != "png"
&& $fileType != "jpeg"
&& $fileType != "gif" ) { // Format not allowed
	$uploadOk = false;
}


if($uploadOk) { // Only if all checks are passed

	if(move_uploaded_file($_FILES["image"]["tmp_name"], $path)) {
		echo "http://localhost/tellus/assets/img/$file"; /*"https://tellusmap.com/assets/img/$file"*/
		exit;
	}
	else{
		http_response_code(500);
		exit;
	}

}
else{
	http_response_code(422);
	exit;
}
