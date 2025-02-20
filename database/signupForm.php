<?php
require_once("db.php");
$firstname = $_POST["firstname"];
$lastname = $_POST["lastname"];
$email = $_POST["email"];
$phone = $_POST["phone"];
$password = $_POST["password"];
$confirmPassword = $_POST["confirmPassword"];

$sql = "INSERT INTO 'users' (first_name, last_name, email, phone, 'password') VALUES ('$firstname','$lastname','$email','$phone','$password')";

$conn -> query($sql);