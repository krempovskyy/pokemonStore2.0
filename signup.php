<?php
session_start();
$title = "Sign Up - Pokemon Store";
$md = "Create your Pokemon Store account";

// Check if user is already logged in
if (isset($_SESSION['user_id'])) {
    header('Location: index.php');
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $title; ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link href="css/auth.css" rel="stylesheet">
</head>
<body>
    <div class="auth-container">
        <div class="auth-card">
            <div class="text-center mb-4">
                <a href="index.php">
                    <img src="images/logo.png" alt="Pokemon Store Logo" class="auth-logo">
                </a>
                <h2 class="mt-3">Create Account</h2>
                <p class="text-muted">Join our Pokemon community</p>
            </div>

            <form action="database/signupForm.php" method="POST" id="signupForm" class="needs-validation" novalidate>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">First Name</label>
                        <div class="input-group">
                            <span class="input-group-text">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" 
                                   class="form-control" 
                                   name="firstName" 
                                   placeholder="First name"
                                   required
                                   minlength="2"
                                   pattern="[A-Za-zÀ-ỹ\s'-]+">
                            <div class="invalid-feedback">
                                Please enter a valid first name
                            </div>
                        </div>
                    </div>

                    <div class="col-md-6 mb-3">
                        <label class="form-label">Last Name</label>
                        <div class="input-group">
                            <span class="input-group-text">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" 
                                   class="form-control" 
                                   name="lastName" 
                                   placeholder="Last name"
                                   required
                                   minlength="2"
                                   pattern="[A-Za-zÀ-ỹ\s'-]+">
                            <div class="invalid-feedback">
                                Please enter a valid last name
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label">Email</label>
                    <div class="input-group">
                        <span class="input-group-text">
                            <i class="fas fa-envelope"></i>
                        </span>
                        <input type="email" 
                               class="form-control" 
                               name="email" 
                               placeholder="Enter your email"
                               required>
                        <div class="invalid-feedback">
                            Please enter a valid email address
                        </div>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label">Phone Number</label>
                    <div class="input-group">
                        <span class="input-group-text">
                            <i class="fas fa-phone"></i>
                        </span>
                        <input type="tel" 
                               class="form-control" 
                               name="phone" 
                               placeholder="Enter your phone number"
                               required
                               pattern="\+?[1-9]\d{1,14}">
                        <div class="invalid-feedback">
                            Please enter a valid phone number
                        </div>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label">Address</label>
                    <div class="input-group">
                        <span class="input-group-text">
                            <i class="fas fa-map-marker-alt"></i>
                        </span>
                        <textarea class="form-control" 
                               name="address" 
                               placeholder="Enter your address"
                               required
                               rows="2"></textarea>
                        <div class="invalid-feedback">
                            Please enter your address
                        </div>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label">Password</label>
                    <div class="input-group">
                        <span class="input-group-text">
                            <i class="fas fa-lock"></i>
                        </span>
                        <input type="password" 
                               class="form-control" 
                               name="password" 
                               id="password"
                               placeholder="Create a password"
                               required
                               minlength="8"
                               pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$">
                        <button type="button" name="createaccount" class="btn btn-outline-secondary toggle-password">
                            <i class="fas fa-eye"></i>
                        </button>
                        <div class="invalid-feedback">
                            Password must be at least 8 characters long and include uppercase, lowercase, number and special character
                        </div>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label">Confirm Password</label>
                    <div class="input-group">
                        <span class="input-group-text">
                            <i class="fas fa-lock"></i>
                        </span>
                        <input type="password" 
                               class="form-control" 
                               name="confirmPassword"
                               placeholder="Confirm your password"
                               required>
                        <div class="invalid-feedback">
                            Passwords do not match
                        </div>
                    </div>
                </div>

                <div class="mb-4">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="terms" name="terms" required>
                        <label class="form-check-label" for="terms">
                            I agree to the <a href="terms.php">Terms of Service</a> and <a href="privacy.php">Privacy Policy</a>
                        </label>
                        <div class="invalid-feedback">
                            You must agree to the terms and conditions
                        </div>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary w-100 mb-3">
                    Create Account
                </button>

                <div class="text-center">
                    <p class="mb-0">Already have an account? <a href="signin.php">Sign In</a></p>
                </div>
            </form>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
    <script src="js/auth.js"></script>
</body>
</html>