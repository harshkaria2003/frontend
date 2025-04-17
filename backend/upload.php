<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include 'db.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    if (isset($_FILES["image"]) && isset($_POST['user_id']) && isset($_POST['type'])) {
        $user_id = intval($_POST['user_id']);
        $type = $_POST['type'];
        $target_dir = "uploads/";

        if (!is_dir($target_dir)) {
            mkdir($target_dir, 0777, true);
        }

        $unique_id = uniqid();
        $file_extension = strtolower(pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION));
        $new_file_name = $unique_id . "." . $file_extension;
        $target_file = $target_dir . $new_file_name;

        $allowed_types = ["jpg", "jpeg", "png", "gif"];
        if (!in_array($file_extension, $allowed_types)) {
            echo json_encode(["error" => "Invalid file type"]);
            exit;
        }

        if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
          
            $column = $type === "cover" ? "cover_image" : "profile_picture";

            $stmt = $conn->prepare("UPDATE users SET $column = ? WHERE id = ?");
            $stmt->bind_param("si", $new_file_name, $user_id);
            $stmt->execute();

            echo json_encode([
                "success" => true,
                "message" => "File uploaded successfully",
                "file" => $new_file_name,
                "url" => "http://localhost:8000/uploads/" . $new_file_name
            ]);
        } else {
            echo json_encode(["error" => "Failed to move uploaded file"]);
        }
    } else {
        echo json_encode(["error" => "Missing image, user_id or type"]);
    }
} else {
    echo json_encode(["error" => "Invalid request method"]);
}
?>
