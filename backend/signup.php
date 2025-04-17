<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Allow-Headers: Content-Type");

include 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['countries'])) {
    $result = $conn->query("SELECT id, name FROM countries");
    $countries = [];
    while ($row = $result->fetch_assoc()) {
        $countries[] = $row;
    }
    echo json_encode($countries);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (
    empty($data['first_name']) || empty($data['last_name']) ||
    empty($data['email']) || empty($data['password']) ||
    empty($data['country_id'])
) {
    echo json_encode(["error" => "All fields are required"]);
    exit;
}

$first_name = $conn->real_escape_string($data['first_name']);
$last_name  = $conn->real_escape_string($data['last_name']);
$email      = $conn->real_escape_string($data['email']);
$password   = password_hash($data['password'], PASSWORD_BCRYPT);
$phone      = $conn->real_escape_string($data['phone'] ?? '');
$gender     = $conn->real_escape_string($data['gender'] ?? '');
$country_id = (int) $data['country_id'];

// Check for duplicate email
$checkEmail = $conn->prepare("SELECT id FROM users WHERE email = ?");
$checkEmail->bind_param("s", $email);
$checkEmail->execute();
$checkEmail->store_result();

if ($checkEmail->num_rows > 0) {
    echo json_encode(["error" => "Email already exists"]);
    exit;
}

// Insert into users
$stmt = $conn->prepare("INSERT INTO users (first_name, last_name, email, password, phone, gender, country_id) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssssi", $first_name, $last_name, $email, $password, $phone, $gender, $country_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "User registered successfully"]);
} else {
    echo json_encode(["error" => "Error inserting user"]);
}

$stmt->close();
$conn->close();
?>
