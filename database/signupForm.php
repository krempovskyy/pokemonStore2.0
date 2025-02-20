<?php

//check if the form was submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    include 'db.php';

    $first_name = mysqli_real_escape_string($conn, $_POST["firstname"]);
    $last_name = mysqli_real_escape_string($conn, $_POST["lastname"]);
    $email = mysqli_real_escape_string($conn, $_POST["email"]);
    $phone = mysqli_real_escape_string($conn, $_POST["phone"]);
    $password = mysqli_real_escape_string($conn, $_POST["password"]);
    $confirmpassword = mysqli_real_escape_string($conn, $_POST["confirmpassword"]);

    //password confirmation check 
    if ($password !== $confirmpassword) {
        echo "Passwords do not match!";
        exit();
    }

    //Hash the password 
    // $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    //prepare the SQL query using a prepared statement
    $sql = "INSERT INTO users (first_name, last_name, email, phone, password) VALUES (?,?,?,?,?)";

    //Prepare the satement
    if ($stmt = $conn->prepare($sql)) {
        //Bind the paramenters
        $stmt->bind_param("sssss", $first_name, $last_name, $email, $phone, $password);

        //Execute the statement
        if ($stmt->execute()) {
            echo "1";
        } else {
            echo "Error: " . $stmt->error;
        }
        //close the statement
        $stmt->close();
    } else {
        echo "Error preparing the SQL statement";
    }
    //close the database connection
    // $conn->query($sql);
    exit();

}
?>