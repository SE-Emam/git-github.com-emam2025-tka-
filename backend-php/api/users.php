<?php
// users.php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'config.php';
require_once 'verify_token.php';

header('Content-Type: application/json');

// Authenticate user
$user = authenticate();
$uid = $user['user_id'];

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $role = $_GET['role'] ?? null;
        
        if ($role) {
            $stmt = $pdo->prepare("SELECT id, email, displayName, role, subscriptionExpiry, createdAt, hourly_rate FROM users WHERE role = ?");
            $stmt->execute([$role]);
        } else {
            $stmt = $pdo->query("SELECT id, email, displayName, role, subscriptionExpiry, createdAt, hourly_rate FROM users");
        }
        
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $users]);
        exit;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
