<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

include 'db.php';

$action = $_REQUEST['action'] ?? '';

switch ($action) {
    case 'get_all':
        $categories = [];
        $items = [];

        
        $res1 = $conn->query("SELECT * FROM categories WHERE status = 1");
        while ($row = $res1->fetch_assoc()) {
            $categories[] = $row;
        }

       
        $res2 = $conn->query("SELECT * FROM items WHERE status = 1");
        while ($row = $res2->fetch_assoc()) {
            $row['images'] = explode(",", $row['image'] ?? ''); 
            $items[] = $row;
        }

        echo json_encode([
            'success' => true,
            'categories' => $categories,
            'items' => $items,
        ]);
        break;

    case 'add_category':
        $name = trim($_POST['name'] ?? '');
        if ($name !== '') {
            $stmt = $conn->prepare("INSERT INTO categories (name, status) VALUES (?, 1)");
            $stmt->bind_param("s", $name);
            $stmt->execute();
            echo json_encode(["success" => true, "message" => "Category added"]);
        } else {
            echo json_encode(["success" => false, "error" => "Category name is required"]);
        }
        break;

    case 'update_category':
        $id = intval($_POST['id'] ?? 0);
        $name = trim($_POST['name'] ?? '');
        if ($id && $name) {
            $stmt = $conn->prepare("UPDATE categories SET name = ? WHERE id = ?");
            $stmt->bind_param("si", $name, $id);
            $stmt->execute();
            echo json_encode(["success" => true, "message" => "Category updated"]);
        } else {
            echo json_encode(["success" => false, "error" => "Missing ID or name"]);
        }
        break;

    case 'delete_category':
        $id = intval($_POST['id'] ?? 0);
        if ($id) {
            $stmt = $conn->prepare("DELETE FROM categories WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            echo json_encode(["success" => true, "message" => "Category deleted"]);
        } else {
            echo json_encode(["success" => false, "error" => "Missing ID"]);
        }
        break;

    case 'add_item':
        $name = trim($_POST['name'] ?? '');
        $price = trim($_POST['price'] ?? '');
        $category_id = intval($_POST['category_id'] ?? 0);

        if (!$name || !$price || !$category_id) {
            echo json_encode(["success" => false, "error" => "All item fields are required"]);
            exit;
        }

        // Insert the item
        $stmt = $conn->prepare("INSERT INTO items (category_id, name, price, status) VALUES (?, ?, ?, 1)");
        $stmt->bind_param("iss", $category_id, $name, $price);
        $stmt->execute();
        $item_id = $stmt->insert_id; // Get the inserted item's ID

        // Handle multiple image uploads
        $uploadedImages = handleImageUploads($_FILES['images'] ?? [], "uploads/Allitems/");

        if (!empty($uploadedImages)) {
            $imageList = implode(",", $uploadedImages); // Store as comma-separated list
            $stmtImg = $conn->prepare("UPDATE items SET image = ? WHERE id = ?");
            $stmtImg->bind_param("si", $imageList, $item_id);
            $stmtImg->execute();
        }

        echo json_encode(["success" => true, "message" => "Item with images added"]);
        break;

    case 'update_item':
        $id = intval($_POST['id'] ?? 0);
        $name = trim($_POST['name'] ?? '');
        $price = trim($_POST['price'] ?? '');
        $category_id = intval($_POST['category_id'] ?? 0);
        $removed_images_str = $_POST['removed_images'] ?? '';
        if (!$id || !$name || !$price || !$category_id) {
            echo json_encode(["success" => false, "error" => "Missing fields"]);
            exit;
        }

        // Update the item details in the database (name, price, category)
        $stmt = $conn->prepare("UPDATE items SET category_id = ?, name = ?, price = ? WHERE id = ?");
        $stmt->bind_param("issi", $category_id, $name, $price, $id);
        if (!$stmt->execute()) {
            echo json_encode(["success" => false, "error" => "Failed to update item details"]);
            exit;
        }

        // Handle image removal
        if (!empty($removed_images)) {
            $stmtGetImages = $conn->prepare("SELECT image FROM items WHERE id = ?");
            $stmtGetImages->bind_param("i", $id);
            $stmtGetImages->execute();
            $resGetImages = $stmtGetImages->get_result();
            $existingItem = $resGetImages->fetch_assoc();

            if ($existingItem) {
                $existingImages = explode(",", $existingItem['image'] ?? '');
                $updatedImages = array_diff($existingImages, $removed_images); // Remove images from the list
                $updatedImageList = implode(",", $updatedImages); // Rebuild the image list

                // Delete physical files for removed images
                foreach ($removed_images as $removedImage) {
                    $imagePath = "uploads/Allitems/" . trim($removedImage);
                    if (file_exists($imagePath)) {
                        unlink($imagePath); // Delete the image file from the server
                    }
                }

                // Update the image list in the database
                $stmtUpdateImages = $conn->prepare("UPDATE items SET image = ? WHERE id = ?");
                $stmtUpdateImages->bind_param("si", $updatedImageList, $id);
                $stmtUpdateImages->execute();
            }
        }

        // Handle new images for the item
        $uploadedImages = handleImageUploads($_FILES['images'] ?? [], "uploads/Allitems/");

        if (!empty($uploadedImages)) {
            // Fetch current images and append the new ones
            $stmtGetImages = $conn->prepare("SELECT image FROM items WHERE id = ?");
            $stmtGetImages->bind_param("i", $id);
            $stmtGetImages->execute();
            $resGetImages = $stmtGetImages->get_result();
            $existingItem = $resGetImages->fetch_assoc();
            $existingImages = $existingItem['image'] ?? '';
            $updatedImageList = '';

            if ($existingImages) {
                $updatedImageList = $existingImages . "," . implode(",", $uploadedImages); // Append new images
            } else {
                $updatedImageList = implode(",", $uploadedImages); // Set new images if none existed before
            }

            // Update the database with the new image list
            $stmtImg = $conn->prepare("UPDATE items SET image = ? WHERE id = ?");
            $stmtImg->bind_param("si", $updatedImageList, $id);
            $stmtImg->execute();
        }

        echo json_encode(["success" => true, "message" => "Item updated successfully"]);
        break;

       case 'delete_item_image':
    $item_id = isset($_POST['item_id']) ? intval($_POST['item_id']) : 0;
    $image_name = isset($_POST['image_name']) ? trim($_POST['image_name']) : '';
  
    if (!$item_id || $image_name === '') {
        echo json_encode(["success" => false, "error" => "Missing item ID or image name"]);
        exit;
    }
  
    // Fetch the item by ID
    $stmt = $conn->prepare("SELECT image FROM items WHERE id = ?");
    $stmt->bind_param("i", $item_id);
    $stmt->execute();
    $res = $stmt->get_result();
    $item = $res->fetch_assoc();
  
    if (!$item) {
        echo json_encode(["success" => false, "error" => "Item not found"]);
        exit;
    }
  
    // Get the current image list
    $images = $item['image'] ? explode(",", $item['image']) : [];
  
    // Check if the image is in the list and remove it
    if (!in_array($image_name, $images)) {
        echo json_encode(["success" => false, "error" => "Image not found in the item"]);
        exit;
    }

    // Debugging: Log the image list and the image name
    error_log("Images before deletion: " . implode(",", $images));
    error_log("Deleting image: " . $image_name);
  
    // Remove the image from the array
    $updatedImages = array_filter($images, fn($img) => trim($img) !== $image_name);
  
    // Path to the image on the server
    $imagePath = "uploads/Allitems/" . $image_name;
    if (file_exists($imagePath)) {
        if (unlink($imagePath)) {
            // Debugging: Confirm the image deletion
            error_log("Image deleted: " . $imagePath);
        } else {
            // Debugging: Log if image deletion fails
            error_log("Failed to delete image: " . $imagePath);
        }
    } else {
        // Debugging: Log if the image doesn't exist
        error_log("Image not found on server: " . $imagePath);
    }
  
    // Update the image string in the database
    $updatedImageStr = implode(",", $updatedImages);
  
    // Debugging: Log the updated image string
    error_log("Updated image string: " . $updatedImageStr);
  
    // Update the database with the new image list
    $stmt = $conn->prepare("UPDATE items SET image = ? WHERE id = ?");
    $stmt->bind_param("si", $updatedImageStr, $item_id);
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Image deleted successfully"]);
    } else {
        echo json_encode(["success" => false, "error" => "Failed to update database"]);
    }
    break;

    case 'delete_item':
        $id = intval($_POST['id'] ?? 0);
        if ($id) {
            $stmt = $conn->prepare("DELETE FROM items WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            echo json_encode(["success" => true, "message" => "Item deleted"]);
        } else {
            echo json_encode(["success" => false, "error" => "Missing ID"]);
        }
        break;

}

function handleImageUploads($files, $targetDir) {
    $uploadedFiles = [];
    if (!empty($files['name'][0])) {
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }

        foreach ($files['tmp_name'] as $key => $tmp_name) {
            $originalName = basename($files['name'][$key]);
            $filename = time() . '_' . $originalName;
            $filepath = $targetDir . $filename;

           
            $fileType = mime_content_type($tmp_name);
            if (!in_array($fileType, ['image/jpeg', 'image/png', 'image/gif'])) {
                continue; // Skip invalid file types
            }
            if (filesize($tmp_name) > 5 * 1024 * 1024) { // Max size 5MB
                continue; // Skip if file is too large
            }

            if (move_uploaded_file($tmp_name, $filepath)) {
                $uploadedFiles[] = $filename;
            }
        }
    }
    return $uploadedFiles;
}
?>
