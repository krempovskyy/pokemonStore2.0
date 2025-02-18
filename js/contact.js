function validateForm() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();
    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;

    // Validate name
    if (name === "") {
        Swal.fire({
            title: 'Error!',
            text: 'Please enter your name',
            icon: 'error',
            confirmButtonColor: '#8860d0'
        });
        return false;
    }

    // Validate email
    if (email === "" || !email.match(emailPattern)) {
        Swal.fire({
            title: 'Error!',
            text: 'Please enter a valid email address',
            icon: 'error',
            confirmButtonColor: '#8860d0'
        });
        return false;
    }

    // Validate message
    if (message === "") {
        Swal.fire({
            title: 'Error!',
            text: 'Please enter your message',
            icon: 'error',
            confirmButtonColor: '#8860d0'
        });
        return false;
    }

    // Show success message
    Swal.fire({
        title: 'Success!',
        text: 'Your message has been sent successfully',
        icon: 'success',
        confirmButtonColor: '#8860d0'
    });

    return true;
}

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (typeof cartManager !== 'undefined') {
        cartManager.loadCart();
    }
});