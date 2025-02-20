<?php

// Check if the 'submit' button in the form was clicked
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    echo"Form received!</br>";

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
        $stmt->bind_param("sss", $name, $email, $message);

        //ececute the statement
        if( $stmt->execute() ) {
            //success message 
            echo '<script type="text/javascript">
            alert("Data Successfully submitted!");
            window.location.href = "../index.php";
            </script>';
        } else {
            echo '<script type ="text/javascript">
            alert("Error: ' . $stmt->error . '";
            </script>';
        }
            $stmt->close();
     } else {
            echo '<script type="text/javascript">
                     alert("Error preparing the SQL statement.");
        </script>';
        }
        //close statement
        $conn->close();
}
?>

    