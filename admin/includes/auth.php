<?php
function checkAuth() {
    // Trong thực tế sẽ check session/database
    // Hiện tại chỉ return true để test
    echo "
    <script>
        if (localStorage.getItem('adminLoggedIn') !== 'true') {
            window.location.href = 'login.php';
        }
    </script>
    ";
}
?>
