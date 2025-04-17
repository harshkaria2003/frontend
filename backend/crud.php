<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");


header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require "db.php";

$action = $_GET['action'] ?? '';

if ($action === "getUsers") {
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $page = isset($_GET['page']) && $_GET['page'] > 0 ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) && $_GET['limit'] > 0 ? (int)$_GET['limit'] : 5;
    $offset = ($page - 1) * $limit;

    $params = [];
    $paramTypes = "";

    // Base SQL Query
    $sql = "SELECT users.*, COALESCE(countries.name, 'Unknown') AS country_name 
            FROM users 
            LEFT JOIN countries ON users.country_id = countries.id";

    $countSql = "SELECT COUNT(*) AS total FROM users";

    // Apply search filter if search term is provided
    if (!empty($search)) {
        $searchQuery = " WHERE (users.first_name LIKE ? 
                          OR users.last_name LIKE ? 
                          OR users.email LIKE ?)";
        $sql .= $searchQuery;
        $countSql .= $searchQuery;
        $search = "%{$search}%";

        array_push($params, $search, $search, $search);
        $paramTypes .= "sss";
    }

    // Execute count query to get total number of users for pagination
    $countStmt = $conn->prepare($countSql);
    if (!empty($paramTypes)) {
        $countStmt->bind_param($paramTypes, ...$params);
    }
    $countStmt->execute();
    $countResult = $countStmt->get_result();
    $totalUsers = $countResult->fetch_assoc()['total'];

    // Ensure at least 1 page
    $totalPages = max(1, ceil($totalUsers / $limit));

    // Append pagination to the main query
    $sql .= " LIMIT ? OFFSET ?";
    array_push($params, $limit, $offset);
    $paramTypes .= "ii";

    // Execute the query to fetch users based on the current page and search
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($paramTypes, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    $users = $result->fetch_all(MYSQLI_ASSOC);

    // Return the result as a JSON response
    echo json_encode([
        "success" => true,
        "data" => $users,
        "totalPages" => $totalPages,
        "totalUsers" => $totalUsers,
        "currentPage" => $page
    ]);
    exit;
}






if ($action === "getCountries") {
    if ($conn->connect_error) {
        echo json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]);
        exit;
    }

    $sql = "SELECT id, name FROM countries";
    $result = $conn->query($sql);           

    if (!$result) {
        echo json_encode(["success" => false, "message" => "Query failed: " . $conn->error]);
        exit;
    }

    $countries = [];
    while ($row = $result->fetch_assoc()) {
        $countries[] = $row;
    }

    echo json_encode(["success" => true, "data" => $countries]);
    exit;
}

if ($action === "addUser") {
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['first_name']) || empty($data['last_name']) || empty($data['phone']) || empty($data['email']) || empty($data['country_id'])) {
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        exit;
    }

    $sql = "INSERT INTO users (first_name, last_name, phone, email, gender, education, hobbies, country_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $hobbies = isset($data['hobbies']) ? implode(",", $data['hobbies']) : '';
    $stmt->bind_param("sssssssi", $data['first_name'], $data['last_name'], $data['phone'], $data['email'], $data['gender'], $data['education'], $hobbies, $data['country_id']);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "User added successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to add user"]);
    }
    exit;
}

if ($action === "updateUser") {
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['first_name']) || empty($data['last_name']) || empty($data['phone']) || empty($data['email']) || empty($data['id']) || empty($data['country_id'])) {
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        exit;
    }

    $sql = "UPDATE users SET first_name=?, last_name=?, phone=?, email=?, gender=?, education=?, hobbies=?, country_id=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    $hobbies = isset($data['hobbies']) ? implode(",", $data['hobbies']) : '';
    $stmt->bind_param("sssssssii", $data['first_name'], $data['last_name'], $data['phone'], $data['email'], $data['gender'], $data['education'], $hobbies, $data['country_id'], $data['id']);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "User updated successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to update user"]);
    }
    exit;
}

if ($action === "deleteUser") {
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['id'])) {
        echo json_encode(["success" => false, "message" => "Missing user ID"]);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM users WHERE id=?");
    $stmt->bind_param("i", $data['id']);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "User deleted successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to delete user"]);
    }
    exit;
}

echo json_encode(["success" => false, "message" => "Invalid action"]);
?>
