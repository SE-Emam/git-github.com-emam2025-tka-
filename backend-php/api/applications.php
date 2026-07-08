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
    $stmt = $pdo->prepare("SELECT * FROM software_applications ORDER BY created_at DESC");
    $stmt->execute();
    $apps = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Decode JSON for platforms
    foreach ($apps as &$app) {
        $app['platforms'] = json_decode($app['platforms'], true);
        $app['targetType'] = $app['target_type'];
        $app['targetId'] = $app['target_id'];
    }

    echo json_encode(["status" => "success", "data" => $apps]);
    exit();
}

if ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $action = $data['action'] ?? '';

    if ($action == 'add') {
        $name = $data['name'];
        $description = $data['description'];
        $image = $data['image'] ?? '';
        $target_type = $data['targetType'] ?? 'all';
        $target_id = $data['targetId'] ?? '';
        $platforms = json_encode($data['platforms']);

        $stmt = $pdo->prepare("INSERT INTO software_applications (name, description, image, target_type, target_id, platforms) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$name, $description, $image, $target_type, $target_id, $platforms]);

        echo json_encode(["status" => "success", "id" => $pdo->lastInsertId()]);
        exit();
    }

    if ($action == 'delete') {
        $id = $data['id'];
        $stmt = $pdo->prepare("DELETE FROM software_applications WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["status" => "success"]);
        exit();
    }
}
?>
