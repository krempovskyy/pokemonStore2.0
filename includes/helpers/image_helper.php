<?php
/**
 * Helper functions for handling image paths
 */

/**
 * Get the full URL for a product image
 * @param string $imagePath The relative path of the image from database
 * @return string The full URL to the image
 */
function getProductImageUrl($imagePath) {
    // Default image if no path provided
    if (empty($imagePath)) {
        return '/Images/default-product.jpg';
    }
    
    // Remove any leading slashes
    $imagePath = ltrim($imagePath, '/');
    
    // Build the server path to check file existence
    $serverPath = $_SERVER['DOCUMENT_ROOT'] . '/' . $imagePath;
    
    // Check if file exists
    if (!file_exists($serverPath)) {
        error_log("Product image not found: " . $serverPath);
        return '/Images/default-product.jpg';
    }
    
    // If the path starts with 'uploads/', it's a user-uploaded image
    if (strpos($imagePath, 'uploads/') === 0) {
        return '/' . $imagePath;
    }
    
    // If the path starts with 'Images/', ensure it has a leading slash
    if (strpos($imagePath, 'Images/') === 0) {
        return '/' . $imagePath;
    }
    
    // If no directory specified, assume it's in Images/
    if (strpos($imagePath, '/') === false) {
        return '/Images/' . $imagePath;
    }
    
    // Ensure there's a leading slash
    return '/' . $imagePath;
}

/**
 * Get gallery images URLs
 * @param mixed $gallery The gallery data from database (JSON string or array)
 * @param string $defaultImage The default image to use if gallery is empty
 * @return array Array of image URLs
 */
function getGalleryUrls($gallery, $defaultImage = '') {
    if (empty($gallery)) {
        return empty($defaultImage) ? [] : [getProductImageUrl($defaultImage)];
    }
    
    if (is_string($gallery)) {
        $gallery = json_decode($gallery, true);
    }
    
    if (!is_array($gallery)) {
        return empty($defaultImage) ? [] : [getProductImageUrl($defaultImage)];
    }
    
    // Filter out any invalid image paths
    $validImages = array_filter($gallery, function($path) {
        $serverPath = $_SERVER['DOCUMENT_ROOT'] . '/' . ltrim($path, '/');
        return file_exists($serverPath);
    });
    
    // If no valid images found, return default image
    if (empty($validImages)) {
        return empty($defaultImage) ? [] : [getProductImageUrl($defaultImage)];
    }
    
    return array_map('getProductImageUrl', $validImages);
} 