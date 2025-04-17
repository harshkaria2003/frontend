<?php

ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// CORS and headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once "db.php";


if ($_SERVER['REQUEST_METHOD'] === "OPTIONS") {
    http_response_code(200);
    exit;
}

function sendResponse($success, $message = "", $extra = [], $statusCode = 200) {
    http_response_code($success ? $statusCode : 400);
    echo json_encode(array_merge(["success" => $success, "message" => $message], $extra));
    exit;
}


$method = $_SERVER['REQUEST_METHOD'];

if ($method === "GET" && isset($_GET['action'])) {
    $action = $_GET['action'];

    if ($action === "getExperiences" && isset($_GET['user_id'])) {
        $user_id = intval($_GET['user_id']);
        getExperiences($conn, $user_id);
    } else {
        sendResponse(false, "Invalid GET action or missing user_id", [], 400);
    }
} elseif ($method === "POST") {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        sendResponse(false, "Invalid JSON payload", [], 400);
    }

    if (!isset($data['action'])) {
        sendResponse(false, "Missing 'action' in POST payload", [], 400);
    }

    $action = $data['action'];

    switch ($action) {
        case "addExperience":
            addExperience($conn, $data['experience'] ?? []);
            break;
        case "updateExperience":
            updateExperience($conn, $data['experience_id'] ?? 0, $data['experience'] ?? []);
            break;
        case "deleteExperience":
            deleteExperience($conn, $data['experience_id'] ?? 0);
            break;
        default:
            sendResponse(false, "Invalid POST action", [], 400);
    }
} else {
    sendResponse(false, "Unsupported request method", [], 405);
}



function getExperiences($conn, $user_id) {
    $stmt = $conn->prepare("SELECT * FROM user_experience WHERE user_id = ?");
    if (!$stmt) {
        error_log("MySQL Prepare Error: " . $conn->error);
        sendResponse(false, "Server error while preparing statement");
    }

    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if (!$result) {
        sendResponse(false, "Error fetching data");
    }

    $experiences = $result->fetch_all(MYSQLI_ASSOC);
    sendResponse(true, "Experiences fetched", ["data" => $experiences]);
}

function addExperience($conn, $experience) {
    $required = ['user_id', 'job_title', 'company_name', 'years_of_experience', 'start_date'];
    foreach ($required as $field) {
        if (empty($experience[$field])) {
            sendResponse(false, "Missing required field: $field");
        }
    }

    $experience['end_date'] = $experience['end_date'] ?? null;
    $experience['description'] = $experience['description'] ?? null;

    $stmt = $conn->prepare("
        INSERT INTO user_experience (user_id, job_title, company_name, years_of_experience, start_date, end_date, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    if (!$stmt) {
        error_log("MySQL Prepare Error (insert): " . $conn->error);
        sendResponse(false, "Server error while preparing insert");
    }

    $stmt->bind_param(
        "ississs",
        $experience['user_id'],
        $experience['job_title'],
        $experience['company_name'],
        $experience['years_of_experience'],
        $experience['start_date'],
        $experience['end_date'],
        $experience['description']
    );

    if ($stmt->execute()) {
        $newExperience = ["id" => $conn->insert_id] + $experience;
        sendResponse(true, "Experience added", ["experience" => $newExperience]);
    } else {
        sendResponse(false, "Failed to add experience: " . $stmt->error);
    }
}

function updateExperience($conn, $id, $experience) {
    if (!$id) {
        sendResponse(false, "Experience ID is required for update");
    }

    $required = ['job_title', 'company_name', 'years_of_experience', 'start_date'];
    foreach ($required as $field) {
        if (empty($experience[$field])) {
            sendResponse(false, "Missing required field: $field");
        }
    }

    $experience['end_date'] = $experience['end_date'] ?? null;
    $experience['description'] = $experience['description'] ?? null;

    $stmt = $conn->prepare("
        UPDATE user_experience 
        SET job_title = ?, company_name = ?, years_of_experience = ?, start_date = ?, end_date = ?, description = ?
        WHERE id = ?
    ");
    if (!$stmt) {
        error_log("MySQL Prepare Error (update): " . $conn->error);
        sendResponse(false, "Server error while preparing update");
    }

    $stmt->bind_param(
        "ssisssi",
        $experience['job_title'],
        $experience['company_name'],
        $experience['years_of_experience'],
        $experience['start_date'],
        $experience['end_date'],
        $experience['description'],
        $id
    );

    if ($stmt->execute()) {
        sendResponse(true, "Experience updated");
    } else {
        sendResponse(false, "Failed to update experience: " . $stmt->error);
    }
}

function deleteExperience($conn, $id) {
    if (!$id) {
        sendResponse(false, "Experience ID is required for deletion");
    }

    $stmt = $conn->prepare("DELETE FROM user_experience WHERE id = ?");
    if (!$stmt) {
        error_log("MySQL Prepare Error (delete): " . $conn->error);
        sendResponse(false, "Server error while preparing delete");
    }

    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        sendResponse(true, "Experience deleted");
    } else {
        sendResponse(false, "Failed to delete experience: " . $stmt->error);
    }
}
