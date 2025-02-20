<?php
session_start();

//Include the DB connection
include 'db.php';

header('Content-Type: application/json');

$response = ['success' => false, 'message' => 'Invalid request'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    //capture form data
    $email = $_POST['email'];
    $password = $_POST['password'];

    //validate inputs 
    if (empty($email) || empty($password)) {
        $response['message'] = 'Please fill in all fields.';
    } else {
        //prepare bling query to select user by user name  
        $stmt = $conn->prepare("SELECT id, email FROM users WHERE email = ? AND password = ?");
        $stmt->bind_param("ss", $email, $password);
        $stmt->execute();
        $stmt->store_result();

        //check if the user exists
        if ($stmt->num_rows > 0) {
            $_SESSION["id"] = $email;
            echo '1';
        } else {
            echo 'No account with that email.';
        }

        $stmt->close();
    }
    $conn->close();

}
