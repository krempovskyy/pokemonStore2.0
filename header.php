<!-- header.php -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<?php echo $md; ?>">
    
    <title>
        <?php echo $title;?>
    </title>
    <style>
body {
    font-family: 'Luckiest Guy', cursive;
    margin: 0;
    padding: 0;
}
/*hover effect for all links inside the body*/
body a:hover{
    color: #8860d0;
}

header{
    background-color: #c1c8e4;
    color: black;
    padding: 20px 0;
    font-family: 'Luckiest Guy', cursive;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
/*Navigation item links inside the header*/
header .nav-item a{
    color: black;
    text-decoration: none;
    font-weight: normal;
    font-size: 25px;
}
/*Visited link styling in the navigation*/
header .nav-item a:visited{
    color:rgb(83, 154, 121)
}
/*Hover effect for navigation links*/
header .nav-item a:hover{
    color:#8860d0;
}
/*Logo inside the header*/
header .logo img{
    max-width: 200px;
}
</style>
</head>
<body>
    <header>
        <nav>
            <ul class="nav">
                <li class="nav-item"><a href="index.html" class="nav-link">Home</a></li>
                <li class="nav-item"><a href="clothes.html" class="nav-link">Clothes</a></li>
                <li class="nav-item"><a href="toys.html" class="nav-link">Toys</a></li>
                <li class="nav-item"><a href="cart.html" class="nav-link">Cart</a></li>
                <li class="nav-item"><a href="contact.html" class="nav-link">Contact Us</a></li> 
            </ul>
        </nav>
        <h1 class="logo"><img src="Images/logo.png" alt="logo"></h1>
    </header>