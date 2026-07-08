<?php
// courses.php
require_once 'config.php';
require_once 'verify_token.php';

header('Content-Type: application/json');

// Authenticate user
$user = authenticate();
$uid = $user['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? 'all';
    
    if ($action === 'all') {
        // ... (existing categories/courses fetch)
    }

    if ($action === 'get_single' && isset($_GET['id'])) {
        $stmt = $pdo->prepare("SELECT * FROM courses WHERE id = ? OR slug = ?");
        $stmt->execute([$_GET['id'], $_GET['id']]);
        $course = $stmt->fetch();
        if ($course) {
            $course['curriculum'] = json_decode($course['curriculum_json'], true) ?: [];
            echo json_encode(["status" => "success", "data" => $course]);
        } else {
            echo json_encode(["status" => "error", "message" => "Course not found"]);
        }
        exit;
    }

    if ($action === 'admin_list') {
        $stmt = $pdo->query("SELECT id, title, brief, slug, status FROM courses ORDER BY id DESC");
        $courses = $stmt->fetchAll();
        echo json_encode(["status" => "success", "data" => $courses]);
        exit;
    }

    // 1. Fetch Categories
    $stmtCats = $pdo->prepare("SELECT * FROM course_categories ORDER BY order_index ASC");
    $stmtCats->execute();
    $categories = $stmtCats->fetchAll();

    // 2. Fetch Courses
    $stmtCourses = $pdo->prepare("SELECT * FROM courses WHERE status = 'active' ORDER BY category_id, id ASC");
    $stmtCourses->execute();
    $courses = $stmtCourses->fetchAll();

    // Organize into the structure React expects
    $pathsData = [];
    foreach ($categories as $cat) {
        $catCourses = array_filter($courses, function($c) use ($cat) {
            return $c['category_id'] == $cat['id'];
        });

        if (count($catCourses) > 0) {
            $formattedCourses = [];
            foreach ($catCourses as $c) {
                // Return arrays parsed from JSON if needed, or structured
                $formattedCourses[] = [
                    'id' => $c['slug'],
                    'title' => $c['title'], // Arabic/English combo handles client side
                    'brief' => $c['brief'],
                    'details' => $c['description'],
                    'duration' => $c['duration_hours'] . ' ساعة / Hours',
                    'color' => $c['theme_color'],
                    'icon' => $c['icon_name'], // e.g., 'Terminal', 'Code2'
                    'learningOutcomes' => json_decode($c['learning_outcomes'], true) ?: []
                ];
            }

            $pathsData[] = [
                'categoryId' => $cat['slug'],
                'category' => $cat['name'],
                'description' => $cat['description'],
                'items' => array_values($formattedCourses)
            ];
        }
    }

    echo json_encode(["status" => "success", "data" => $pathsData]);

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // SECURITY: This endpoint should ideally check for Admin Role
    // For initializing data only:
    $action = $_GET['action'] ?? '';

    if ($action === 'seed') {
        // Create tables if they don't exist yet
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS course_categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                slug VARCHAR(100) UNIQUE,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                order_index INT DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS courses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category_id INT,
                slug VARCHAR(100) UNIQUE,
                title VARCHAR(255) NOT NULL,
                brief TEXT,
                description TEXT,
                goal TEXT,
                expected_duration VARCHAR(100),
                lectures_count INT DEFAULT 0,
                lecture_duration VARCHAR(100),
                curriculum_json TEXT, -- JSON string for lectures and checklists
                duration_hours INT,
                theme_color VARCHAR(50) DEFAULT 'bg-blue-500',
                icon_name VARCHAR(50),
                learning_outcomes JSON,
                status VARCHAR(50) DEFAULT 'active',
                FOREIGN KEY (category_id) REFERENCES course_categories(id)
            );
        ");

        echo json_encode(["status" => "success", "message" => "Tables created successfully. You can now insert data manually via PHPMyAdmin."]);
    } else if ($action === 'create') {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $title = $data['title'] ?? '';
        $slug = $data['slug'] ?? uniqid('course_');
        $goal = $data['goal'] ?? '';
        $expected_duration = $data['expected_duration'] ?? '';
        $lectures_count = $data['lectures_count'] ?? 0;
        $lecture_duration = $data['lecture_duration'] ?? '';
        $curriculum = $data['curriculum'] ?? [];
        $category_id = $data['category_id'] ?? 1; // Default to first category
        $desc = $data['description'] ?? '';
        
        $stmt = $pdo->prepare("INSERT INTO courses (title, slug, goal, expected_duration, lectures_count, lecture_duration, curriculum_json, category_id, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $curriculum_json = json_encode($curriculum, JSON_UNESCAPED_UNICODE);
        
        if ($stmt->execute([$title, $slug, $goal, $expected_duration, $lectures_count, $lecture_duration, $curriculum_json, $category_id, $desc])) {
            echo json_encode(["status" => "success", "id" => $pdo->lastInsertId()]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to create course"]);
        }
    } else if ($action === 'update') {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'] ?? null;
        if (!$id) {
            echo json_encode(["status" => "error", "message" => "ID missing"]);
            exit;
        }
        
        $title = $data['title'] ?? '';
        $goal = $data['goal'] ?? '';
        $expected_duration = $data['expected_duration'] ?? '';
        $lectures_count = $data['lectures_count'] ?? 0;
        $lecture_duration = $data['lecture_duration'] ?? '';
        $curriculum = $data['curriculum'] ?? [];
        $category_id = $data['category_id'] ?? 1;
        $desc = $data['description'] ?? '';
        $status = $data['status'] ?? 'active';
        
        $curriculum_json = json_encode($curriculum, JSON_UNESCAPED_UNICODE);
        
        $stmt = $pdo->prepare("UPDATE courses SET title = ?, goal = ?, expected_duration = ?, lectures_count = ?, lecture_duration = ?, curriculum_json = ?, category_id = ?, description = ?, status = ? WHERE id = ?");
        
        if ($stmt->execute([$title, $goal, $expected_duration, $lectures_count, $lecture_duration, $curriculum_json, $category_id, $desc, $status, $id])) {
            echo json_encode(["status" => "success", "message" => "Course updated"]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to update course"]);
        }
    }
}
?>
