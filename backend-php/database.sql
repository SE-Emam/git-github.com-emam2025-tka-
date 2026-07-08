CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(128) PRIMARY KEY, -- Firebase UID
    email VARCHAR(255) NOT NULL,
    displayName VARCHAR(255),
    role VARCHAR(50) DEFAULT 'student',
    nationalId VARCHAR(50),
    phoneNumber VARCHAR(50),
    address TEXT,
    bio TEXT,
    subscriptionExpiry BIGINT, -- Timestamp in milliseconds
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    goal TEXT,
    expected_duration VARCHAR(100),
    lectures_count INT DEFAULT 0,
    lecture_duration VARCHAR(100),
    curriculum_json TEXT, -- Stored as JSON string
    price DECIMAL(10,2),
    level VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS study_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    courseId INT,
    jitsiRoom VARCHAR(255),
    isLive BOOLEAN DEFAULT FALSE,
    scheduledTime DATETIME,
    current_lecture_index INT DEFAULT -1,
    archived_lectures_json TEXT, -- JSON array of indices or light objects
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS group_members (
    groupId INT,
    userId VARCHAR(128),
    role VARCHAR(50) DEFAULT 'student', -- 'student' or 'trainer'
    joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (groupId, userId),
    FOREIGN KEY (groupId) REFERENCES study_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS progress_marks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(128),
    groupId INT,
    taskName VARCHAR(255),
    marks INT DEFAULT 0,
    maxMarks INT DEFAULT 100,
    feedback TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (groupId) REFERENCES study_groups(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    studentId VARCHAR(128) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method VARCHAR(50) NOT NULL,
    period VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    notes TEXT,
    transactionId VARCHAR(100), -- For gateway IDs
    paidAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payment_settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value TEXT,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value TEXT,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS software_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image VARCHAR(255),
  target_type ENUM('all', 'level', 'group', 'student') DEFAULT 'all',
  target_id VARCHAR(100) DEFAULT NULL,
  platforms JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS video_library (
  id INT AUTO_INCREMENT PRIMARY KEY,
  groupId VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  level VARCHAR(100),
  subject VARCHAR(100),
  trainerId VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trainer_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trainer_id VARCHAR(128) NOT NULL,
    submitted_by VARCHAR(128) NOT NULL,
    total_score DECIMAL(5,2),
    technical_score DECIMAL(5,2),
    communication_score DECIMAL(5,2),
    materials_score DECIMAL(5,2),
    organization_score DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS program_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    program_title VARCHAR(255) NOT NULL,
    submitted_by VARCHAR(128) NOT NULL,
    total_score DECIMAL(5,2),
    goals_score DECIMAL(5,2),
    content_score DECIMAL(5,2),
    design_score DECIMAL(5,2),
    measurement_score DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(128) NOT NULL,
    group_id INT NOT NULL,
    satisfaction_rating INT CHECK (satisfaction_rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_performance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(128) NOT NULL,
    group_id INT NOT NULL,
    attendance_rate DECIMAL(5,2),
    commitment_rating INT CHECK (commitment_rating BETWEEN 1 AND 5),
    progress_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE
);

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

CREATE TABLE IF NOT EXISTS contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(255) NOT NULL,
    type ENUM('trainer', 'supervisor', 'student') NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status ENUM('pending', 'signed') DEFAULT 'pending',
    issuedBy VARCHAR(255) NOT NULL,
    issuedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    signedAt TIMESTAMP NULL,
    signatureIP VARCHAR(45) NULL,
    signatureMetadata TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
