<?php
// progress.php
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
        $action = $_GET['action'] ?? null;
        $groupId = $_GET['groupId'] ?? null;
        $userId = $_GET['userId'] ?? null;

        if ($action === 'group_progress' && $groupId) {
            // Fetch progress for this specific group
            $stmt = $pdo->prepare("
                SELECT p.*, u.displayName as studentName 
                FROM progress_marks p
                JOIN users u ON p.userId = u.id
                WHERE p.groupId = ?
                ORDER BY p.createdAt DESC
            ");
            $stmt->execute([$groupId]);
            $progress = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["status" => "success", "data" => $progress]);
            exit;
        }

        if ($action === 'student_progress' && $userId) {
            // Fetch progress for a single student across all groups
            $stmt = $pdo->prepare("
                SELECT p.*, g.name as groupName, c.title as courseTitle
                FROM progress_marks p
                JOIN study_groups g ON p.groupId = g.id
                LEFT JOIN courses c ON g.courseId = c.id
                WHERE p.userId = ?
                ORDER BY p.createdAt DESC
            ");
            $stmt->execute([$userId]);
            $studentProgress = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["status" => "success", "data" => $studentProgress]);
            exit;
        }

        if ($action === 'students_in_group' && $groupId) {
            // Get all student profiles in a specific group
            $stmt = $pdo->prepare("
                SELECT u.id, u.displayName, u.email 
                FROM users u
                JOIN group_members m ON u.id = m.userId
                WHERE m.groupId = ? AND m.role = 'student'
            ");
            $stmt->execute([$groupId]);
            $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["status" => "success", "data" => $students]);
            exit;
        }
    } 
    elseif ($method === 'POST') {
        // Read JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? '';

        if ($action === 'record_mark') {
            $studentId = $input['studentId'] ?? null;
            $groupId = $input['groupId'] ?? null;
            $taskName = $input['taskName'] ?? 'Task';
            $marks = $input['marks'] ?? 0;
            $maxMarks = $input['maxMarks'] ?? 100;
            $feedback = $input['feedback'] ?? '';
            $trainerId = $input['trainerId'] ?? null;

            if (!$studentId || !$groupId) {
                echo json_encode(["status" => "error", "message" => "Missing studentId or groupId"]);
                exit;
            }

            $stmt = $pdo->prepare("
                INSERT INTO progress_marks (userId, groupId, taskName, marks, maxMarks, feedback) 
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$studentId, $groupId, $taskName, $marks, $maxMarks, $feedback]);
            
            $markId = $pdo->lastInsertId();

            // We can also insert into notifications table here if needed

            echo json_encode(["status" => "success", "message" => "Mark recorded successfully", "id" => $markId]);
            exit;
        }
    }

    // Default fallback
    echo json_encode(["status" => "error", "message" => "Invalid endpoint or action"]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "System error: " . $e->getMessage()]);
}
