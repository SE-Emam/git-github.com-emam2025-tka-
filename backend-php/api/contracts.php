<?php
// contracts.php
require_once '../db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

try {
    // Migration: Create contracts table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS contracts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            userId VARCHAR(128) NOT NULL,
            type ENUM('trainer', 'supervisor', 'student') NOT NULL,
            title VARCHAR(255) NOT NULL,
            content LONGTEXT NOT NULL,
            status ENUM('draft', 'sent', 'signed') DEFAULT 'draft',
            signedAt DATETIME DEFAULT NULL,
            signatureIp VARCHAR(45) DEFAULT NULL,
            issuedBy VARCHAR(128) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    if ($method === 'GET') {
        $userId = $_GET['userId'] ?? null;
        $id = $_GET['id'] ?? null;

        if ($id) {
            $stmt = $pdo->prepare("SELECT * FROM contracts WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(["status" => "success", "data" => $stmt->fetch(PDO::FETCH_ASSOC)]);
        } elseif ($userId) {
            $stmt = $pdo->prepare("SELECT * FROM contracts WHERE userId = ? ORDER BY createdAt DESC");
            $stmt->execute([$userId]);
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } else {
            $stmt = $pdo->query("SELECT c.*, u.fullName as userName FROM contracts c JOIN users u ON c.userId = u.id ORDER BY c.createdAt DESC");
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        }
    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? '';

        if ($action === 'create') {
            $stmt = $pdo->prepare("INSERT INTO contracts (userId, type, title, content, issuedBy, status) VALUES (?, ?, ?, ?, ?, 'sent')");
            $stmt->execute([
                $input['userId'],
                $input['type'],
                $input['title'],
                $input['content'],
                $input['issuedBy']
            ]);
            echo json_encode(["status" => "success", "message" => "Contract issued", "id" => $pdo->lastInsertId()]);
        } elseif ($action === 'sign') {
            $stmt = $pdo->prepare("UPDATE contracts SET status = 'signed', signedAt = NOW(), signatureIp = ? WHERE id = ? AND userId = ?");
            $stmt->execute([
                $_SERVER['REMOTE_ADDR'],
                $input['contractId'],
                $input['userId']
            ]);
            echo json_encode(["status" => "success", "message" => "Contract signed digitally"]);
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
