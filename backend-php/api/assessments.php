<?php
require_once 'config.php';
require_once 'verify_token.php';

header("Content-Type: application/json");

// Verify auth token
$user = verifyToken($conn);
if (!$user) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

if ($method === 'GET') {
    $action = $_GET['action'] ?? '';
    
    if ($action === 'list') {
        $type = $_GET['type'] ?? '';
        $results = [];
        
        if ($type === 'trainer') {
            $query = "SELECT t.*, u.displayName as target_name FROM trainer_assessments t 
                      LEFT JOIN users u ON t.trainer_id = u.id 
                      ORDER BY t.created_at DESC";
            $res = $conn->query($query);
            while($row = $res->fetch_assoc()) {
                // Map to frontend structure
                $results[] = [
                    'id' => $row['id'],
                    'targetName' => $row['target_name'] ?: 'Unknown',
                    'totalScore' => (float)$row['total_score'],
                    'notes' => $row['notes'],
                    'submittedAt' => $row['created_at'],
                    'type' => 'trainer_eval'
                ];
            }
        } elseif ($type === 'program') {
            $query = "SELECT * FROM program_assessments ORDER BY created_at DESC";
            $res = $conn->query($query);
            while($row = $res->fetch_assoc()) {
                $results[] = [
                    'id' => $row['id'],
                    'targetName' => $row['program_title'],
                    'totalScore' => (float)$row['total_score'],
                    'notes' => $row['notes'],
                    'submittedAt' => $row['created_at'],
                    'type' => 'program_eval'
                ];
            }
        } elseif ($type === 'student_feedback') {
            $query = "SELECT s.*, u.displayName as student_name FROM student_feedback s
                      LEFT JOIN users u ON s.student_id = u.id
                      ORDER BY s.created_at DESC";
            $res = $conn->query($query);
            while($row = $res->fetch_assoc()) {
                $results[] = [
                    'id' => $row['id'],
                    'targetName' => $row['student_name'] ?: 'Anonymous',
                    'totalScore' => (float)$row['satisfaction_rating'] * 20, // Scale 1-5 to percentage
                    'notes' => $row['comment'],
                    'submittedAt' => $row['created_at'],
                    'type' => 'student_feedback'
                ];
            }
        } elseif ($type === 'performance') {
            $query = "SELECT p.*, u.displayName as student_name FROM student_performance p
                      LEFT JOIN users u ON p.student_id = u.id
                      ORDER BY p.created_at DESC";
            $res = $conn->query($query);
            while($row = $res->fetch_assoc()) {
                $results[] = [
                    'id' => $row['id'],
                    'targetName' => $row['student_name'] ?: 'Unknown',
                    'totalScore' => ((float)$row['attendance_rate'] + ((float)$row['commitment_rating'] * 20)) / 2,
                    'notes' => $row['progress_notes'],
                    'submittedAt' => $row['created_at'],
                    'type' => 'performance_track'
                ];
            }
        }
        
        echo json_encode(["status" => "success", "data" => $results]);
        exit;
    }
}

if ($method === 'POST') {
    $action = $data['action'] ?? '';
    
    if ($action === 'submit_assessment') {
        $type = $data['assessmentType']; // trainer, program, student_feedback, performance
        $payload = $data['payload'];
        $submittedBy = $user['uid']; // From Firebase token
        
        $stmt = null;
        
        try {
            if ($type === 'trainer') {
                $stmt = $conn->prepare("INSERT INTO trainer_assessments 
                    (trainer_id, submitted_by, total_score, technical_score, communication_score, materials_score, organization_score, notes) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                
                $trainerId = $payload['targetTrainerId'] ?? '';
                $total = $payload['totalScore'] ?? 0;
                $tech = $payload['sectionScores']['technical'] ?? 0;
                $comm = $payload['sectionScores']['communication'] ?? 0;
                $mat = $payload['sectionScores']['materials'] ?? 0;
                $org = $payload['sectionScores']['organization'] ?? 0;
                $notes = $payload['developmentPlan'] ?? '';
                
                $stmt->bind_param("ssddddds", $trainerId, $submittedBy, $total, $tech, $comm, $mat, $org, $notes);
                
            } elseif ($type === 'program') {
                $stmt = $conn->prepare("INSERT INTO program_assessments 
                    (program_title, submitted_by, total_score, goals_score, content_score, design_score, measurement_score, notes) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                
                $title = $payload['programTitle'] ?? 'Unknown';
                $total = $payload['totalScore'] ?? 0;
                $goals = $payload['sectionScores']['goals'] ?? 0;
                $content = $payload['sectionScores']['content'] ?? 0;
                $design = $payload['sectionScores']['design'] ?? 0;
                $meas = $payload['sectionScores']['measurement'] ?? 0;
                $notes = $payload['improvementSuggestions'] ?? '';
                
                $stmt->bind_param("ssddddds", $title, $submittedBy, $total, $goals, $content, $design, $meas, $notes);

            } elseif ($type === 'student_feedback') {
                $stmt = $conn->prepare("INSERT INTO student_feedback 
                    (student_id, group_id, satisfaction_rating, comment) 
                    VALUES (?, ?, ?, ?)");
                
                // For student_feedback, the submittedBy is the student themselves.
                // If they don't provide a specific groupId, we use 0 or parse it.
                $groupId = isset($payload['groupId']) ? intval($payload['groupId']) : 0;
                
                // Let's create an average satisfaction based on their program understanding score for now
                // if 'satisfaction_rating' isn't explicitly defined.
                $satisfaction = $payload['programUnderstanding'] ?? 5; 
                $comment = $payload['improvement'] ?? '';
                
                $stmt->bind_param("siis", $submittedBy, $groupId, $satisfaction, $comment);
                
            } elseif ($type === 'performance') {
                $stmt = $conn->prepare("INSERT INTO student_performance 
                    (student_id, group_id, attendance_rate, commitment_rating, progress_notes) 
                    VALUES (?, ?, ?, ?, ?)");
                 
                $studentId = $payload['studentId'] ?? ''; 
                $groupId = isset($payload['groupId']) ? intval($payload['groupId']) : 0;
                $attendance = $payload['attendanceRate'] ?? 0;
                $commitment = $payload['commitmentScore'] ?? 0;
                $notes = $payload['trainerNotes'] ?? '';
                 
                $stmt->bind_param("sidds", $studentId, $groupId, $attendance, $commitment, $notes);
            } else {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Unknown assessment type"]);
                exit;
            }
            
            if ($stmt && $stmt->execute()) {
                echo json_encode(["status" => "success", "id" => $stmt->insert_id]);
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => $stmt ? $stmt->error : "Failed to prepare statement"]);
            }
            if ($stmt) {
                $stmt->close();
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
}
?>
