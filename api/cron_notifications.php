<?php
require_once 'config.php'; // تأكد من وجود ملف الاتصال الحالي (Database Connection)
header('Content-Type: application/json');

// تحميل قوالب الرسائل
$notificationsData = file_get_contents('notifications.json');
$notifications = json_decode($notificationsData, true);

// إعداد مفتاح الـ FCM الخاص بك
$server_key = $config['fcm_server_key'] ?? 'YOUR_FIREBASE_SERVER_KEY'; 

// 1. جلب الطلاب النشطين الذين لديهم FCM Token
$stmt = $conn->prepare("SELECT id, firstname, fcm_token, age_group, notification_index 
                        FROM users 
                        WHERE fcm_token IS NOT NULL AND status = 'active'");
$stmt->execute();
$users = $stmt->get_result();

$results = [];

while ($row = $users->fetch_assoc()) {
    $ageGroup = $row['age_group']; // '8-11', '12-15', 'graduates'
    $idx = $row['notification_index'] % 30; // ضمان الدوران من 0-29

    $messageTemplate = $notifications[$ageGroup][$idx];
    
    // استبدال [NAME] بالاسم الفعلي
    $personalizedMessage = str_replace('[NAME]', ($row['firstname'] ?: 'بطلنا'), $messageTemplate);

    // إرسال الإشعار عبر FCM
    $fields = array(
        'to' => $row['fcm_token'],
        'notification' => array(
            'title' => 'تيك ميكرز 💡',
            'body' => $personalizedMessage
        )
    );

    $headers = array(
        'Authorization: key=' . $server_key,
        'Content-Type: application/json'
    );

    $ch = curl_init('https://fcm.googleapis.com/fcm/send');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fields));
    $response = curl_exec($ch);
    curl_close($ch);

    // تحديث ترتيب الإشعار في قاعدة البيانات للمرة القادمة
    $nextIdx = $idx + 1;
    $updateStmt = $conn->prepare("UPDATE users SET notification_index = ? WHERE id = ?");
    $updateStmt->bind_param("ii", $nextIdx, $row['id']);
    $updateStmt->execute();
    
    $results[] = ["user_id" => $row['id'], "status" => "sent"];
}

echo json_encode(["status" => "success", "processed_count" => count($results)]);
?>
