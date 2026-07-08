<?php
require_once 'config.php';
require_once 'verify_token.php';

header('Content-Type: application/json');

// Verify Firebase Token
$user_data = verify_firebase_token();
if (!$user_data) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$conn = get_db_connection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = $_GET['action'] ?? 'list';

    if ($action === 'list') {
        $studentId = $_GET['studentId'] ?? '';
        if (!$studentId) {
            echo json_encode(['error' => 'Student ID is required', 'data' => []]);
            exit;
        }

        $stmt = $conn->prepare("SELECT p.*, u.displayName as recorderName FROM payments p LEFT JOIN users u ON p.recordedBy = u.id WHERE p.studentId = ? ORDER BY p.paidAt DESC");
        $stmt->execute([$studentId]);
        $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Convert date for JS
        foreach ($payments as &$p) {
            $p['date'] = strtotime($p['paidAt']) * 1000;
        }

        echo json_encode(['data' => $payments]);
    } 
    elseif ($action === 'summary') {
        // High level summary for admin/supervisor
        $role = $user_data['role'] ?? 'student';
        if ($role !== 'admin' && $role !== 'supervisor') {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            exit;
        }

        $stmt = $conn->query("SELECT SUM(amount) as total FROM payments");
        $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

        // Mock pending dues for now or calculate based on groups
        echo json_encode([
            'data' => [
                'totalIncome' => (float)$total,
                'pendingDues' => 15200 // Mock value for illustration
            ]
        ]);
    }
} 
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? '';

    if ($action === 'record') {
        $studentId = $data['studentId'] ?? '';
        $amount = $data['amount'] ?? 0;
        $payMethod = $data['method'] ?? '';
        $period = $data['period'] ?? '';
        $notes = $data['notes'] ?? '';

        if (!$studentId || !$amount) {
            echo json_encode(['error' => 'Incomplete payment data']);
            exit;
        }

        try {
            $conn->beginTransaction();

            // 0. Ensure recordedBy column exists (optional self-healing)
            $conn->exec("ALTER TABLE payments ADD COLUMN IF NOT EXISTS recordedBy VARCHAR(128)");

            // 1. Insert payment record
            $recordedBy = $user_data['user_id'] ?? null;
            $stmt = $conn->prepare("INSERT INTO payments (studentId, amount, method, period, notes, recordedBy) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$studentId, $amount, $payMethod, $period, $notes, $recordedBy]);

            // 2. Update user subscription expiry (30 days from now) and ensure role is 'student'
            $newExpiry = (time() + (30 * 24 * 60 * 60)) * 1000;
            $stmt = $conn->prepare("UPDATE users SET subscriptionExpiry = ?, role = CASE WHEN role = 'trial' OR role = 'inactive' THEN 'student' ELSE role END WHERE id = ?");
            $stmt->execute([$newExpiry, $studentId]);

            $conn->commit();
            echo json_encode(['success' => true, 'message' => 'Payment recorded and subscription updated.']);
        } catch (Exception $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Failed to record payment: ' . $e->getMessage()]);
        }
    }
}
?>
