<?php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
$dir = "uploads/Allimages/";
$files = array_diff(scandir($dir), array('.', '..'));

$images = [];
foreach ($files as $file) {
    $images[] = ['filename' => $file];
}
echo json_encode($images);





?>
