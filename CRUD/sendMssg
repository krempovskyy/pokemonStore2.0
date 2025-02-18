<?php include 'database/db.php' ;
$fname= $_POST['name'];
$message= $_POST['message'];
$sql="insert into studentsinfo (fname, lname, city, groupid)
values('$name', '$message')";

if($conn->query($sql) === TRUE) {
    echo "New record added";
    echo "<a href='update.php' class='top'>Home </a>";
}
else
{
    echo "ERROR: " .$sql. "<br>" . $conn->error;
}
$conn->close();

?>