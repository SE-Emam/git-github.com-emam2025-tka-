<?php
require_once '../db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

try {
    // Self-healing: Add hourly_rate to users if missing
    $pdo->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 0;");

    // Self-healing: sessions table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS trainer_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            trainerId VARCHAR(128) NOT NULL,
            groupId INT NOT NULL,
            durationHours DECIMAL(5,2) DEFAULT 1.0,
            earnedAmount DECIMAL(10,2),
            sessionDate DATE NOT NULL,
            status VARCHAR(20) DEFAULT 'unsettled', 
            notes TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (trainerId) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (groupId) REFERENCES study_groups(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    // Self-healing: finances table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS trainer_finances (
            id INT AUTO_INCREMENT PRIMARY KEY,
            trainerId VARCHAR(128) NOT NULL,
            type ENUM('payment', 'reward', 'penalty') NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            description TEXT,
            method VARCHAR(50),
            recordedBy VARCHAR(128),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (trainerId) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    if ($method === 'GET') {
        $action = $_GET['action'] ?? '';
        $trainerId = $_GET['trainerId'] ?? null;

        if ($action === 'get_balance' && $trainerId) {
            // Calculate current unsettled earnings
            $stmt = $pdo->prepare("SELECT SUM(earnedAmount) as total FROM trainer_sessions WHERE trainerId = ? AND status = 'unsettled'");
            $stmt->execute([$trainerId]);
            $earnings = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

            // Calculate other transactions
            $stmt = $pdo->prepare("
                SELECT 
                    SUM(CASE WHEN type = 'reward' THEN amount ELSE 0 END) as rewards,
                    SUM(CASE WHEN type = 'penalty' THEN amount ELSE 0 END) as penalties,
                    SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END) as payments
                FROM trainer_finances 
                WHERE trainerId = ?
            ");
            $stmt->execute([$trainerId]);
            $trans = $stmt->fetch(PDO::FETCH_ASSOC);
            $rewards = $trans['rewards'] ?? 0;
            $penalties = $trans['penalties'] ?? 0;
            $payments = $trans['payments'] ?? 0;

            $currentBalance = ($earnings + $rewards) - ($penalties + $payments);

            echo json_encode(["status" => "success", "data" => [
                "balance" => (float)$currentBalance,
                "unsettled_earnings" => (float)$earnings,
                "rewards" => (float)$rewards,
                "penalties" => (float)$penalties,
                "payments" => (float)$payments
            ]]);
            exit;
        }

        if ($action === 'history' && $trainerId) {
            $month = $_GET['month'] ?? date('Y-m');
            
            // Sessions in the month
            $stmt = $pdo->prepare("
                SELECT s.*, g.name as groupName 
                FROM trainer_sessions s
                JOIN study_groups g ON s.groupId = g.id
                WHERE s.trainerId = ? AND s.sessionDate LIKE ?
                ORDER BY s.sessionDate DESC
            ");
            $stmt->execute([$trainerId, "$month%"]);
            $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Transactions in the month
            $stmt = $pdo->prepare("SELECT * FROM trainer_finances WHERE trainerId = ? AND createdAt LIKE ? ORDER BY createdAt DESC");
            $stmt->execute([$trainerId, "$month%"]);
            $finances = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["status" => "success", "data" => [
                "sessions" => $sessions,
                "transactions" => $finances
            ]]);
            exit;
        }
    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? '';

        if ($action === 'log_session') {
            // Usually triggered when a trainer finishes a lecture
            $trainerId = $input['trainerId'];
            $groupId = $input['groupId'];
            $hours = $input['durationHours'] ?? 1.0;
            $date = $input['date'] ?? date('Y-m-d');
            
            // Get current hourly rate of the trainer
            $stmt = $pdo->prepare("SELECT hourly_rate FROM users WHERE id = ?");
            $stmt->execute([$trainerId]);
            $rate = $stmt->fetch(PDO::FETCH_ASSOC)['hourly_rate'] ?? 0;
            
            $earned = $hours * $rate;

            $stmt = $pdo->prepare("INSERT INTO trainer_sessions (trainerId, groupId, durationHours, earnedAmount, sessionDate, status) VALUES (?, ?, ?, ?, ?, 'unsettled')");
            $stmt->execute([$trainerId, $groupId, $hours, $earned, $date]);
            
            echo json_encode(["status" => "success", "message" => "Session logged and earnings added to balance"]);
            exit;
        }

        if ($action === 'add_transaction') {
            // Admin only
            $trainerId = $input['trainerId'];
            $type = $input['type']; // payment, reward, penalty
            $amount = $input['amount'];
            $description = $input['description'] ?? '';
            $method = $input['method'] ?? null;
            $recordedBy = $input['recordedBy'] ?? null;

            $stmt = $pdo->prepare("INSERT INTO trainer_finances (trainerId, type, amount, description, method, recordedBy) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$trainerId, $type, $amount, $description, $method, $recordedBy]);

            // If it's a payment, we might want to settle sessions?
            // Actually, settling after payment is cleaner.
            if ($type === 'payment') {
                $stmt = $pdo->prepare("UPDATE trainer_sessions SET status = 'settled' WHERE trainerId = ? AND status = 'unsettled'");
                $stmt->execute([$trainerId]);
            }

            echo json_encode(["status" => "success", "message" => "Transaction recorded"]);
            exit;
        }
        
        if ($action === 'update_rate') {
            $trainerId = $input['trainerId'];
            $rate = $input['rate'];
            $stmt = $pdo->prepare("UPDATE users SET hourly_rate = ? WHERE id = ?");
            $stmt->execute([$rate, $trainerId]);
            echo json_encode(["status" => "success"]);
            exit;
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
