<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
require_once 'cors.php';

session_start();
session_unset();
session_destroy();

header('Content-Type: application/json');
echo json_encode([
  "success" => true,
  "message" => "Logged out successfully"
]);
?>
