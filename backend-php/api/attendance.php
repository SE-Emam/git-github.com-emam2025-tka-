<?php
// attendance.php
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
    // 1. Create attendance table if not exists
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS attendance (
            id INT AUTO_INCREMENT PRIMARY KEY,
            groupId INT NOT NULL,
            date DATE NOT NULL,
            studentId VARCHAR(128) NOT NULL,
            status BOOLEAN NOT NULL DEFAULT 1,
            trainerId VARCHAR(128),
            recordedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_attendance (groupId, date, studentId)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    if ($method === 'GET') {
        $action = $_GET['action'] ?? null;
        $groupId = $_GET['groupId'] ?? null;
        $date = $_GET['date'] ?? null;

        // Fetch attendance records for a group on a specific date
        if ($action === 'get_records' && $groupId && $date) {
            $stmt = $pdo->prepare("SELECT studentId, status FROM attendance WHERE groupId = ? AND date = ?");
            $stmt->execute([$groupId, $date]);
            
            $records = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $records[$row['studentId']] = (bool)$row['status'];
            }
            
            echo json_encode(["status" => "success", "data" => $records]);
            exit;
        }

        if ($action === 'get_summary' && $groupId) {
            // Count attended sessions for each student in this group for the current month
            $month = $_GET['month'] ?? date('Y-m');
            $stmt = $pdo->prepare("
                SELECT studentId, COUNT(*) as attended_count 
                FROM attendance 
                WHERE groupId = ? AND status = 1 AND date LIKE ?
                GROUP BY studentId
            ");
            $stmt->execute([$groupId, $month . '%']);
            $summary = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(["status" => "success", "data" => $summary]);
            exit;
        }

        if ($action === 'student_history' && isset($_GET['studentId'])) {
            $studentId = $_GET['studentId'];
            $stmt = $pdo->prepare("
                SELECT a.*, g.name as groupName 
                FROM attendance a
                LEFT JOIN study_groups g ON a.groupId = g.id
                WHERE a.studentId = ? 
                ORDER BY a.date DESC
            ");
            $stmt->execute([$studentId]);
            $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(["status" => "success", "data" => $history]);
            exit;
        }

    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? '';

        if ($action === 'record') {
            $groupId = $input['groupId'] ?? null;
            $date = $input['date'] ?? null;
            $presentIds = $input['presentIds'] ?? [];
            $allStudentIds = $input['allStudentIds'] ?? []; // we need all students to mark absents
            $trainerId = $input['trainerId'] ?? null;

            if (!$groupId || !$date) {
                echo json_encode(["status" => "error", "message" => "groupId and date are required"]);
                exit;
            }

            $pdo->beginTransaction();

            $stmt = $pdo->prepare("
                INSERT INTO attendance (groupId, date, studentId, status, trainerId) 
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE status = VALUES(status), trainerId = VALUES(trainerId)
            ");

            foreach ($allStudentIds as $studentId) {
                $isPresent = in_array($studentId, $presentIds) ? 1 : 0;
                $stmt->execute([$groupId, $date, $studentId, $isPresent, $trainerId]);
            }

            $pdo->commit();

            echo json_encode(["status" => "success", "message" => "Attendance recorded"]);
            exit;
        }
    }

    echo json_encode(["status" => "error", "message" => "Invalid endpoint or action"]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "System error: " . $e->getMessage()]);
}
