<?php
require_once("db.php");

$email = $_POST["email"];
$password = $_POST["password"];

$sql = "SELECT * FROM 'users' WHERE email = '$email' AND 'password' = '$password'";