<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ContactUs</title>
    <link rel="stylesheet" href="contactStyle.css">
    <link href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
</head>
<?php
// include the header file 
$title ="Contact Page";
//$md = "global header footer";
include 'includes/header.php';
?>
<>

<article>
        <div class="contact-section">
            <h2 class="custom-heading">We Love to hear from you !</h2>
            <div class="contact-info">
                <img src="images/contact.png" atl="contact" class="contact-image">
                <p><strong> Pokemon Store</strong></p>
                <p>+358 999 99 99</p>
                <p>info@pokemon.lol</p>
                <p>1111, Hämeenlinna</p>
            </div>

            <form action="#" method="POST" class="contact-form">
                <div class="form-group">
                    <label for="name">Name:</label>
                    <input type="text" id="name" name="name" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="email">E-mail:</label>
                    <input type="email" id="email" name="email" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="message">Message:</label>
                    <textarea type="message" id="message" name="message" class="form-control" rows="4" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Send Message</button>
            </form>
        </div>

        <div class="social-links">
            <h3 class="custom-heading"> Follow Us</h3>
            <ul>
                <li class="nav-item1"><a href="https://www.pokemon.com/us" target="_blank">Main Website</a></li>
                <li class="nav-item1"><a href="https://www.facebook.com/PokemonTCG/" target="_blank"> facebook</a></li>
            </ul>
        </div>    
    </article>

<?php
// include the footer file 
include 'includes/footer.php';
?>
