<?php
// groups.php
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
        $action = $_GET['action'] ?? 'all';
        $userId = $_GET['userId'] ?? null;
        $role = $_GET['role'] ?? 'student'; // trainer, admin, student

        if ($action === 'all') {
            // Fetch all groups with their course names
            $stmt = $pdo->query("
                SELECT g.*, c.title as course_title, c.theme_color, c.icon_name 
                FROM study_groups g
                LEFT JOIN courses c ON g.courseId = c.id
                ORDER BY g.createdAt DESC
            ");
            $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // For each group, we might want to fetch trainers/students...
            foreach ($groups as &$group) {
                $memStmt = $pdo->prepare("SELECT userId, role FROM group_members WHERE groupId = ?");
                $memStmt->execute([$group['id']]);
                $members = $memStmt->fetchAll(PDO::FETCH_ASSOC);
                
                $group['trainerIds'] = [];
                $group['studentIds'] = [];
                
                foreach ($members as $m) {
                    if ($m['role'] === 'trainer') {
                        $group['trainerIds'][] = $m['userId'];
                    } else {
                        $group['studentIds'][] = $m['userId'];
                    }
                }
            }
            echo json_encode(["status" => "success", "data" => $groups]);
            exit;
        }

        if ($action === 'get_single' && isset($_GET['groupId'])) {
            $stmt = $pdo->prepare("
                SELECT g.*, c.title as course_title, c.theme_color, c.icon_name, c.curriculum_json 
                FROM study_groups g
                LEFT JOIN courses c ON g.courseId = c.id
                WHERE g.id = ?
            ");
            $stmt->execute([$_GET['groupId']]);
            $group = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Format JSONs
            if ($group) {
                if ($group['curriculum_json']) {
                    $group['curriculum'] = json_decode($group['curriculum_json'], true);
                } else {
                    $group['curriculum'] = [];
                }
                
                if ($group['archived_lectures_json']) {
                    $group['archived_lectures'] = json_decode($group['archived_lectures_json'], true);
                } else {
                    $group['archived_lectures'] = [];
                }
            }
            
            echo json_encode(["status" => "success", "data" => $group]);
            exit;
        }

        if ($action === 'trainer') {
            if (!$userId) {
                echo json_encode(["status" => "error", "message" => "userId missing"]);
                exit;
            }
            // Fetch groups where this user is a trainer
            $stmt = $pdo->prepare("
                SELECT g.*, c.title as course_title, c.theme_color, c.icon_name
                FROM study_groups g
                JOIN group_members m ON g.id = m.groupId
                LEFT JOIN courses c ON g.courseId = c.id
                WHERE m.userId = ? AND m.role = 'trainer'
                ORDER BY g.createdAt DESC
            ");
            $stmt->execute([$userId]);
            $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["status" => "success", "data" => $groups]);
            exit;
        }
    } 
    elseif ($method === 'POST') {
        // Read JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? '';

        if ($action === 'create') {
            $name = $input['name'] ?? 'New Group';
            $jitsiRoom = $input['jitsiRoom'] ?? str_replace(' ', '-', $name);
            $trainerIds = $input['trainerIds'] ?? [];
            $courseId = !empty($input['courseId']) ? $input['courseId'] : null;

            $pdo->beginTransaction();

            $stmt = $pdo->prepare("INSERT INTO study_groups (name, courseId, jitsiRoom, isLive) VALUES (?, ?, ?, ?)");
            $stmt->execute([$name, $courseId, $jitsiRoom, 1]); // isLive=1 means active
            
            $groupId = $pdo->lastInsertId();

            if (!empty($trainerIds)) {
                $memStmt = $pdo->prepare("INSERT INTO group_members (groupId, userId, role) VALUES (?, ?, 'trainer')");
                foreach ($trainerIds as $tId) {
                    $memStmt->execute([$groupId, $tId]);
                }
            }

            $pdo->commit();
            echo json_encode(["status" => "success", "message" => "Group created", "groupId" => $groupId]);
            exit;
        }

        if ($action === 'activate_lecture') {
            $groupId = $input['groupId'] ?? null;
            $lectureIndex = $input['lectureIndex'] ?? -1;

            if (!$groupId) {
                echo json_encode(["status" => "error", "message" => "groupId missing"]);
                exit;
            }

            // Fetch current group to get the current_lecture_index to archive it
            $stmt = $pdo->prepare("SELECT current_lecture_index, archived_lectures_json FROM study_groups WHERE id = ?");
            $stmt->execute([$groupId]);
            $group = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($group) {
                $archived = $group['archived_lectures_json'] ? json_decode($group['archived_lectures_json'], true) : [];
                $currentIndex = (int)$group['current_lecture_index'];

                // If switching to a new lecture, and the current one isn't -1 and not already in archive, add it
                if ($currentIndex !== -1 && $currentIndex !== (int)$lectureIndex && !in_array($currentIndex, $archived)) {
                    $archived[] = $currentIndex;
                }

                $archivedJson = json_encode(array_values(array_unique($archived)));

                $upStmt = $pdo->prepare("UPDATE study_groups SET current_lecture_index = ?, archived_lectures_json = ? WHERE id = ?");
                $upStmt->execute([$lectureIndex, $archivedJson, $groupId]);

                echo json_encode(["status" => "success", "message" => "Lecture activated and previous archived", "archived" => $archived, "current" => $lectureIndex]);
                exit;
            }
            echo json_encode(["status" => "error", "message" => "Group not found"]);
            exit;
        }
    }

    // Default fallback
    echo json_encode(["status" => "error", "message" => "Invalid endpoint or action"]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error", "details" => $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "System error", "details" => $e->getMessage()]);
}
