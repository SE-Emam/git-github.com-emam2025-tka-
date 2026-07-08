<?php
// config.php
// Allow CORS for the React Frontend
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db_host = 'localhost'; // Usually localhost on Hostinger
$db_user = 'YOUR_DB_USERNAME'; // Change this
$db_pass = 'YOUR_DB_PASSWORD'; // Change this
$db_name = 'YOUR_DB_NAME';     // Change this

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database connection failed", "details" => $e->getMessage()]);
    exit();
}
?>
