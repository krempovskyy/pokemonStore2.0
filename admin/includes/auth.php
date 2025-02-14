<?php
function checkAuth() {
    // Kiểm tra session/database
    echo "
    <script>
        if (localStorage.getItem('adminLoggedIn') !== 'true') {
            window.location.href = '/admin/login.php'; // Thêm /admin/ vào path
        }
    </script>
    ";
}
?>
