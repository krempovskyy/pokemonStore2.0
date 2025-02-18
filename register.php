<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pokemon Store Login</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet">
    <link href="css/registerStyle.css" rel="stylesheet">
    <script src="https://kit.fontawesome.com/6e08da5390.js" crossorigin="anonymous"></script>
</head>
<body>
    <div class="login-container">
        <img src="Images/logo.png" alt="Pokemon Store Logo">
        <h2>Sign up</h2>
        <form action="contact_process.php" method="POST" class="contact-form" onsubmit="return validateForm()">
            <div class="input-group">
                <span class="icon"><i class="fa-solid fa-user"></i></span>
                <input type="text" placeholder="Username" required>
            </div>
            <div class="input-group">
                <span class="icon"><i class="fa-solid fa-lock"></i></span>
                <input type="password" placeholder="Password" id="password" required>
                <span class="eye-icon" onclick="togglePassword()"><i class="fa-solid fa-eye"></i></span>
            </div>
            <div class="options">
                <label>
                    <input type="checkbox"> Remember me
                </label>
                <a href="#">Forgot password?</a>
            </div>
            <button type="submit" class="login-btn">Login</button>
        </form>
    </div>

    <script>
        function togglePassword() {
            const passwordInput = document.getElementById('password');
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
        }
    </script>
</body>
</html>
