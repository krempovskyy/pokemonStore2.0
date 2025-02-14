<?php

//include 'config.php';
$servername = "localhost";
$username = "root";
$password = "password";
$dbname = "pokemon_store";

//creating a new connection
$conn = new mysqli($servername, $username, $password);

//checking if connection is established
if ($conn->connect_error) {
    die("Connection failed:". $conn->connect_error);
}

//check if form is submitted
if ($_server["REQUEST_METHOD"] == "POST") {
    $name = $conn->real_escape_string($_POST['name']);
    $email =  $conn->real_escape_string($_POST['email']);
    $message =  $conn->real_escape_string($_POST['message']);

//insert into database
$sql = "INSERT INTO contact_message (name, email, message) VALUES ('$name', '$email', '$message')";

if ($conn->query($sql) === TRUE) {
    echo "<script>alert('Message Sent Successfully!'); window.location.href='contact.php';</script>";
} else {
    echo "Error: " .$sql ."<br>" .$conn->error;
} 
}

    //closing the connection 
$conn->close();
?>