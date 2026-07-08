<?php
// get_profile.php
require_once 'config.php';
require_once 'verify_token.php';

header('Content-Type: application/json');

// Authenticate via Firebase token sent from React
$user = authenticate();
$uid = $user['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get user from MySQL
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$uid]);
    $profile = $stmt->fetch();
    
    if ($profile) {
        echo json_encode(["status" => "success", "data" => $profile]);
    } else {
        // Fallback: Return standard if not created yet
        echo json_encode(["status" => "success", "data" => null]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Update or create profile
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check if exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
    $stmt->execute([$uid]);
    
    if ($stmt->fetch()) {
        // Update
        $update = $pdo->prepare("UPDATE users SET displayName = ?, nationalId = ?, phoneNumber = ?, address = ?, bio = ? WHERE id = ?");
        $update->execute([
            $data['displayName'] ?? '', 
            $data['nationalId'] ?? '', 
            $data['phoneNumber'] ?? '', 
            $data['address'] ?? '', 
            $data['bio'] ?? '', 
            $uid
        ]);
        echo json_encode(["status" => "success", "message" => "Updated successfully"]);
    } else {
        // Create
        $insert = $pdo->prepare("INSERT INTO users (id, email, displayName, role) VALUES (?, ?, ?, ?)");
        $insert->execute([$uid, $user['email'] ?? '', $data['displayName'] ?? 'User', 'student']);
        echo json_encode(["status" => "success", "message" => "Created successfully"]);
    }
}
?>
