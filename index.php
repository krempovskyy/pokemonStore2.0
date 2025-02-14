<?php
$title = "Pokemon Store - Home";
$md = "Welcome to Pokemon Store - Your one-stop shop for Pokemon merchandise";

include 'includes/header.php';
?>

<main>
    <div class="container">
        <div class="row g-4 my-4">
            <!-- Clothes Section -->
            <div class="col-12 col-md-6">
                <div class="category-card">
                    <h2 class="text-center mb-3">Shop now Clothes</h2>
                    <a href="clothes.php" class="category-link">
                        <img src="pictures/clothes.jpg" alt="Pokemon Clothes" class="img-fluid category-image">
                    </a>
                </div>
            </div>

            <!-- Toys Section -->
            <div class="col-12 col-md-6">
                <div class="category-card">
                    <h2 class="text-center mb-3">Shop now Toys & Cards</h2>
                    <a href="toys.php" class="category-link">
                        <img src="pictures/toys.jpg" alt="Pokemon Toys & Cards" class="img-fluid category-image">
                    </a>
                </div>
            </div>
        </div>
    </div>
</main>

<?php include 'includes/footer.php'; ?>
