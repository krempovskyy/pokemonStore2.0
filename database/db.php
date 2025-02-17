<?php
$servername = "db";
$username = "pokemonStore";
$password = "passwordPS";
$dbname = "pokemonStore";

// creating connection
$conn = new mysqli($servername, $username, $password, $dbname);

// check connection
if($conn->connect_error){
    die("Connection failed; ". $conn->connect_error);
}
?>