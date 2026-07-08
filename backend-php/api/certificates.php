<?php
// certificates.php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'config.php';
require_once 'verify_token.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

try {
    // 1. Create certificates table if not exists
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS certificates (
            id INT AUTO_INCREMENT PRIMARY KEY,
            certificate_uuid VARCHAR(100) UNIQUE NOT NULL,
            studentId VARCHAR(128) NOT NULL,
            studentName VARCHAR(255) NOT NULL,
            programName VARCHAR(255) NOT NULL,
            issuerId VARCHAR(128),
            customMessage TEXT,
            issuedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    if ($method === 'GET') {
        $action = $_GET['action'] ?? 'list';
        
        if ($action === 'list') {
            authenticate();
            $stmt = $pdo->query("SELECT * FROM certificates ORDER BY issuedAt DESC");
            $certs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["status" => "success", "data" => $certs]);
            exit;
        }

        if ($action === 'student_list' && isset($_GET['studentId'])) {
            authenticate();
            $stmt = $pdo->prepare("SELECT * FROM certificates WHERE studentId = ? ORDER BY issuedAt DESC");
            $stmt->execute([$_GET['studentId']]);
            $certs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["status" => "success", "data" => $certs]);
            exit;
        }

        if ($action === 'verify' && isset($_GET['uuid'])) {
            $stmt = $pdo->prepare("SELECT * FROM certificates WHERE certificate_uuid = ?");
            $stmt->execute([$_GET['uuid']]);
            $cert = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($cert) {
                echo json_encode(["status" => "success", "data" => $cert]);
            } else {
                echo json_encode(["status" => "error", "message" => "Certificate not found"]);
            }
            exit;
        }
    } 
    elseif ($method === 'POST') {
        authenticate();
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? '';

        if ($action === 'issue') {
            $studentId = $input['studentId'];
            $studentName = $input['studentName'];
            $programName = $input['programName'];
            $issuerId = $input['issuerId'] ?? null;
            $customMessage = $input['customMessage'] ?? '';
            $uuid = bin2hex(random_bytes(8)); // Simple unique ID for the cert

            $stmt = $pdo->prepare("
                INSERT INTO certificates (certificate_uuid, studentId, studentName, programName, issuerId, customMessage) 
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$uuid, $studentId, $studentName, $programName, $issuerId, $customMessage]);
            
            $certId = $pdo->lastInsertId();
            echo json_encode(["status" => "success", "message" => "Certificate issued", "certificateId" => $certId, "uuid" => $uuid]);
            exit;
        }
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "System error: " . $e->getMessage()]);
}
