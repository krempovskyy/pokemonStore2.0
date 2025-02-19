<?php

// Check if the 'submit' button in the form was clicked
if ($_server["request_method"] == "post") {

    // Retrieve data from the form and store it in variables
    $name = trim($_POST['name']);     // name
    $email = trim($_POST['email']);     // email
    $message = trim($_POST['message']);       // message
    
    // Include the database connection file
    include 'db.php';

    // Define an SQL query to insert data into the 'studentsinfo' table
    $sql = "INSERT INTO contact_messages (name, email, message)
            VALUES (?,?,?)";

    //prepare the statement
    if ($stmt = $conn->prepare($sql)) {

        //bind paramenters to the prepared stattement
        $stmt->bind_param("sss", $name, $email);

        //ececute the statement
        if( $stmt->execute() ) {
            //success message 
            echo"New record added successfully!";
        } else {
            echo "Error: " . $stmt->error;
        }
        //close statement
        $conn->close();
    } else {
        // if someone access the script without submitting the form 
        echo "Invalid Request!";
    }
}
    ?>

    