<?php
require_once 'config.php';
require_once 'verify_token.php';

header('Content-Type: application/json');

$user_data = verify_firebase_token();
if (!$user_data) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$conn = get_db_connection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Both Admins and Students can view system settings (like chatbot context)
    $stmt = $conn->query("SELECT * FROM system_settings");
    $settings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $config = [];
    foreach ($settings as $s) {
        $config[$s['setting_key']] = $s['setting_value'];
    }
    
    echo json_encode(['data' => $config]);
} 
elseif ($method === 'POST') {
    // Only Admin can update system settings
    if (($user_data['role'] ?? '') !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    
    try {
        $conn->beginTransaction();
        
        foreach ($data as $key => $value) {
            $stmt = $conn->prepare("INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?");
            $stmt->execute([$key, $value, $value]);
        }
        
        $conn->commit();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        $conn->rollBack();
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
