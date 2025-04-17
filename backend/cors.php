<?php
// Get the origin of the request
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Allow only localhost with any port during development
if (preg_match('/^http:\/\/localhost:\d+$/', $origin)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

    // Handle preflight request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204); // No Content
        exit;
    }
}
?>
