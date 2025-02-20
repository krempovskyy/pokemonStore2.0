<?php
// Test script for API endpoints
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Function to make API request
function testEndpoint($endpoint, $method = 'POST', $data = []) {
    $ch = curl_init();
    
    $url = "http://localhost:81/includes/api/" . $endpoint;
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    curl_close($ch);
    
    return [
        'endpoint' => $endpoint,
        'method' => $method,
        'data' => $data,
        'response' => json_decode($response, true),
        'http_code' => $httpCode
    ];
}

// Function to display test results
function displayResult($result) {
    echo "\n=== Testing {$result['endpoint']} ===\n";
    echo "Method: {$result['method']}\n";
    echo "Data: " . json_encode($result['data'], JSON_PRETTY_PRINT) . "\n";
    echo "HTTP Code: {$result['http_code']}\n";
    echo "Response: " . json_encode($result['response'], JSON_PRETTY_PRINT) . "\n";
    echo "=====================================\n";
}

// Test 1: Sign Up - Invalid data (missing fields)
$signupTest1 = testEndpoint('signup_process.php', 'POST', [
    'first_name' => '',
    'last_name' => '',
    'email' => '',
    'phone' => '',
    'password' => '',
    'confirm_password' => ''
]);
displayResult($signupTest1);

// Test 2: Sign Up - Valid data
$signupTest2 = testEndpoint('signup_process.php', 'POST', [
    'first_name' => 'Test',
    'last_name' => 'User',
    'email' => 'test' . time() . '@example.com',
    'phone' => '1234567890',
    'password' => 'Password123!',
    'confirm_password' => 'Password123!'
]);
displayResult($signupTest2);

// Test 3: Sign In - Invalid credentials
$signinTest1 = testEndpoint('signin_process.php', 'POST', [
    'email' => 'nonexistent@example.com',
    'password' => 'wrongpassword'
]);
displayResult($signinTest1);

// Test 4: Sign In - Valid credentials (using the account we just created)
if ($signupTest2['response']['success']) {
    $signinTest2 = testEndpoint('signin_process.php', 'POST', [
        'email' => $signupTest2['data']['email'],
        'password' => 'Password123!'
    ]);
    displayResult($signinTest2);
}

// Test 5: Contact Form - Invalid data
$contactTest1 = testEndpoint('contact_process.php', 'POST', [
    'name' => '',
    'email' => '',
    'message' => ''
]);
displayResult($contactTest1);

// Test 6: Contact Form - Valid data
$contactTest2 = testEndpoint('contact_process.php', 'POST', [
    'name' => 'Test Contact',
    'email' => 'contact@example.com',
    'message' => 'This is a test message'
]);
displayResult($contactTest2);

// Test 7: Send Message (CRUD) - Invalid data
$sendMsgTest1 = testEndpoint('sendMssg.php', 'POST', [
    'name' => '',
    'message' => ''
]);
displayResult($sendMsgTest1);

// Test 8: Send Message (CRUD) - Valid data
$sendMsgTest2 = testEndpoint('sendMssg.php', 'POST', [
    'name' => 'Test Message',
    'message' => 'This is a test CRUD message'
]);
displayResult($sendMsgTest2);

?> 