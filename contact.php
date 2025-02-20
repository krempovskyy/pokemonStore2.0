<?php
session_start();
$title = "Contact Us - Pokemon Store";
$md = "Contact us for any questions or support";
include 'includes/header.php';
?>

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
                <form id="contactForm" class="contact-form">
                    <div class="mb-3">
                        <label for="name" class="form-label">Name</label>
                        <input type="text" id="name" name="name" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" id="email" name="email" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label for="subject" class="form-label">Subject</label>
                        <input type="text" id="subject" name="subject" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label for="message" class="form-label">Message</label>
                        <textarea id="message" name="message" class="form-control" rows="5" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary w-100">
                        <i class="fas fa-paper-plane me-2"></i>Send Message
                        <span class="spinner-border spinner-border-sm ms-2 d-none" role="status"></span>
                    </button>
                </form>
            </div>
        </div>
    </div>
</main>

<!-- Add SweetAlert2 -->
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const spinner = submitButton.querySelector('.spinner-border');

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Show loading state
        submitButton.disabled = true;
        spinner.classList.remove('d-none');

        try {
            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };

            const response = await fetch('includes/api/contact_process.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                // Show success message
                await Swal.fire({
                    title: 'Success!',
                    text: 'Your message has been sent successfully.',
                    icon: 'success',
                    confirmButtonColor: '#8860d0'
                });

                // Reset form
                contactForm.reset();
            } else {
                throw new Error(result.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error:', error);
            await Swal.fire({
                title: 'Error!',
                text: error.message || 'An error occurred while sending your message. Please try again.',
                icon: 'error',
                confirmButtonColor: '#8860d0'
            });
        } finally {
            // Reset button state
            submitButton.disabled = false;
            spinner.classList.add('d-none');
        }
    });
});
</script>

<?php include 'includes/footer.php'; ?>
