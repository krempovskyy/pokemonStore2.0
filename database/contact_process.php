<?php

require 'db.php';

//check if form is submitted
if ($_server["REQUEST_METHOD"] == "POST") {
    $name = $conn->htmlspecialchars($_POST['name']);
    $email =  $conn->filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $message =  $conn->htmlspecialchars($_POST['message']);

//insert into database
$sql = "INSERT INTO contact_messages (name, email, message) VALUES ('$name', '$email', '$message')";

try {
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':message' => $message
    ]);

    echo "Thank you! Your message has been sent.";
    } catch (PDOException $e){
        echo "Error:" . $e->getMessage();
    }



//if ($conn->query($sql) === TRUE) {
  //  echo "<script>alert('Message Sent Successfully!'); window.location.href='contact.php';</script>";
//} else {
  //  echo "Error: " .$sql ."<br>" .$conn->error;
//} 
}

    //closing the connection 
//$conn->close();
?>