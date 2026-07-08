<?php
require_once 'config.php';
require_once 'verify_token.php';

$uid = verify_firebase_token();
if (!$uid) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    $groupId = $_GET['groupId'] ?? null;
    
    if ($groupId) {
        $stmt = $pdo->prepare("SELECT * FROM video_library WHERE groupId = ? ORDER BY created_at DESC");
        $stmt->execute([$groupId]);
    } else {
        $stmt = $pdo->prepare("SELECT * FROM video_library ORDER BY created_at DESC");
        $stmt->execute();
    }
    
    $videos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["status" => "success", "data" => $videos]);
    exit();
}

if ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $action = $data['action'] ?? '';

    if ($action == 'add') {
        $groupId = $data['groupId'];
        $title = $data['title'];
        $url = $data['url'];
        $level = $data['level'];
        $subject = $data['subject'];
        $trainerId = $data['trainerId'];

        $stmt = $pdo->prepare("INSERT INTO video_library (groupId, title, url, level, subject, trainerId) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$groupId, $title, $url, $level, $subject, $trainerId]);

        echo json_encode(["status" => "success", "id" => $pdo->lastInsertId()]);
        exit();
    }

    if ($action == 'delete') {
        $id = $data['id'];
        $stmt = $pdo->prepare("DELETE FROM video_library WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["status" => "success"]);
        exit();
    }
}
?>
