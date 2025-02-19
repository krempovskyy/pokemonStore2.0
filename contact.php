<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ContactUs</title>
    <link href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
</head>
<?php
// include the header file 
$title = "Contact Us - Pokemon Store";
$md = "Contact us for any questions or support";
include 'includes/header.php';
?>

<link rel="stylesheet" href="contactStyle.css">
<link href="css/contactStyle.css" rel="stylesheet">

<main class="container py-5">
    <div class="row">
        <div class="col-lg-6 mb-4">
            <div class="contact-info-section">
                <h2 class="section-title mb-4">We Love to Hear from You!</h2>
                <div class="contact-info">
                    <img src="images/contact.png" alt="contact" class="contact-image mb-4">
                    <div class="info-details">
                        <h3>Pokemon Store</h3>
                        <p><i class="fas fa-phone me-2"></i>+358 999 99 99</p>
                        <p><i class="fas fa-envelope me-2"></i>info@pokemon.lol</p>
                        <p><i class="fas fa-map-marker-alt me-2"></i>1111, Hämeenlinna</p>
                    </div>
                </div>

                <div class="social-links mt-4">
                    <h3 class="mb-3">Follow Us</h3>
                    <div class="d-flex gap-3">
                        <a href="https://www.pokemon.com/us" target="_blank" class="btn btn-outline-primary">
                            <i class="fas fa-globe me-2"></i>Main Website
                        </a>
                        <a href="https://www.facebook.com/PokemonTCG/" target="_blank" class="btn btn-outline-primary">
                            <i class="fab fa-facebook me-2"></i>Facebook
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-lg-6">
            <div class="contact-form-section">
                <h2 class="section-title mb-4">Send Us a Message</h2>
                <form id="contactForm" action="contact_process.php" method="POST" class="contact-form" onsubmit="return validateForm()">
                    <div class="mb-3">
                        <label for="name" class="form-label">Name</label>
                        <input type="text" id="name" name="name" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" id="email" name="email" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label for="message" class="form-label">Message</label>
                        <textarea id="message" name="message" class="form-control" rows="5" required></textarea>
                    </div>
                    <button type="submit" name="submit" class="btn btn-primary w-100">
                        <i class="fas fa-paper-plane me-2"></i>Send Message
                    </button>
                </form>
            </div>
        </div>
    </div>
</main>

<!-- Add cart manager scripts -->
<script src="js/cart-manager.js"></script>
<script src="js/cart.js"></script>
<script src="js/contact.js"></script>

<?php
// include the footer file 
include 'includes/footer.php';
?>
