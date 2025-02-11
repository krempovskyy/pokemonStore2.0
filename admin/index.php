<?php
include 'includes/auth.php';
checkAuth();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Pokemon Store</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link href="css/admin.css" rel="stylesheet">
</head>
<body>
    <div class="dashboard">
        <h1>Welcome to Dashboard</h1>
        <p>Logged in as: <span id="adminUsername"></span></p>
        <button onclick="logout()" class="btn btn-danger">Logout</button>
    </div>

    <script>
        // Hiển thị username
        document.getElementById('adminUsername').textContent = 
            localStorage.getItem('adminUsername');
        
        // Hàm logout
        function logout() {
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('adminUsername');
            window.location.href = 'login.php';
        }
    </script>
</body>
</html>
