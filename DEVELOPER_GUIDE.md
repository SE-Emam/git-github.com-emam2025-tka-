# TKA Egypt - Developer & Maintenance Guide 🛠️

This document provides a comprehensive overview of the TKA Egypt Learning Management System (LMS) architecture, file structure, deployment steps, and database schema for maintenance and future development.

---

## 🏗️ 1. System Architecture (The Hybrid Strategy)
المعمارية النهائية المعتمدة للتطبيق (الاستراتيجية الهجينة) والتي توازن بين السرعة، والمساحة، والتكلفة:

- **Firebase Hosting**: لرفع ملفات الـ React (الواجهة، الأيقونات، الصور الثابتة والـ PWA). توفر سرعة أداء عالمية.
- **Firebase Firestore**: للشات اللحظي، الإشعارات، والعدادات (بحد أقصى 1 جيجابايت مجاناً). *ملاحظة: نقوم بتفريغ البيانات المؤقتة أولاً بأول للحفاظ على المساحة.*
- **Hostinger (MySQL/PHP)**: لتخزين الأرشيف، سجلات الحضور القديمة، البيانات المالية، معلومات الطلاب الرسمية، النماذج التقيمية الشاملة، وبيانات الشهادات والمناهج الدراسية الديناميكية.
- **Authentication**: Firebase Auth (Google Sign-In) للتحقق وإصدار الـ Tokens.
- **Intelligence**: Google Gemini AI (Automated certification messages & Dynamic Student Chatbot Context).

---

## 📂 2. Project Directory Map

### Frontend (Applet Environment)
- `/src/pages/`: Core UI views (Admin, Student, Trainer dashboards, Course Managers).
- `/src/context/`: State management (Auth, Language/i18n).
- `/src/services/`: 
    - `hybridApiService.ts`: Primary connector to MySQL/PHP backend (handling Assessments, Courses, AI limits).
    - `firestoreService.ts`: Real-time listeners for Firebase.
    - `aiService.ts`: Contains AI logic and the Student Chatbot Fallback context.
- `/src/components/`: Reusable UI components using "Bento Layout" & "Glassmorphism" Design Language.

### Backend (Upload to Hostinger `/public_html/api/`)
- `/backend-php/api/`: All PHP endpoints (including `assessments.php`, `courses.php`).
- `/backend-php/database.sql`: SQL initialization script.

---

## 🚀 3. خطوات الرفع على استضافة Firebase (Firebase Hosting Deployment)
بما أنك قمت بتنزيل `Node.js` على جهازك، اتبع الخطوات التالية لرفع الواجهة (Frontend) على استضافة Firebase المجانية:

### الخطوة 1: تثبيت أدوات Firebase
افتح الـ Terminal (أو موجه الأوامر CMD / PowerShell) واكتب الأمر التالي لتثبيت أدوات Firebase عالمياً:
```bash
npm install -g firebase-tools
```

### الخطوة 2: تسجيل الدخول لحساب جوجل
قم بربط الـ Terminal بحساب جوجل الخاص بك والذي يحتوي على مشروع Firebase:
```bash
firebase login
```

### الخطوة 3: تهيئة المشروع (Initialization)
تأكد أنك داخل مجلد المشروع، ثم قم بتشغيل الأمر التالي:
```bash
firebase init hosting
```
سيُطلب منك بعض الخيارات، أجب عليها كالتالي:
- `What do you want to use as your public directory?` اكتب **`dist`** (مهم جداً).
- `Configure as a single-page app (rewrite all urls to /index.html)?` اختر **`Yes`** (حرف Y).
- `Set up automatic builds and deploys with GitHub?` اختر **`No`** (حرف N).
- `File dist/index.html already exists. Overwrite?` إذا ظهر لك، اختر **`No`**.

### الخطوة 4: بناء التطبيق (Build)
قم بتحويل كود React إلى ملفات جاهزة للويب:
```bash
npm run build
```

### الخطوة 5: الرفع المباشر (Deploy)
بعد اكتمال بناء التطبيق (ظهور مجلد `dist` بالشكل النهائي)، قم برفع الموقع للأيف:
```bash
firebase deploy --only hosting
```
عند الانتهاء، سيعطيك الـ Terminal الرابط المباشر لتطبيقك (Hosting URL). مبروك! 🎉

---

## 🗄️ 4. Database Schema (MySQL)

### Core Tables & Relationships
1. **`users`**: Official student/staff records.
2. **`courses`**: Academic catalog (Enhanced with dynamic Curriculum Builders containing objectives, lectures mapped as JSON).
3. **`course_categories`**: Hierarchy mapping.
4. **`study_groups`**: Instances of courses. (Relation: `courseId` -> `courses.id`).
5. **`group_members`**: Junction table for Users & Groups.
6. **`progress_marks`**: Academic performance.
7. **`attendance`**: Daily presence logs.
8. **`certificates`**: Issued credentials with unique validation UUIDs.
9. **`payments`**: Manual and automatic payment archives.
10. **Assessments Tables**: `trainer_assessments`, `program_assessments`, `student_performance`, `student_feedback` to isolate evaluation analytics.

---

## 🔌 5. API Documentation (PHP Endpoints)

All requests to the PHP backend must include a `Bearer <Firebase_ID_Token>` in the headers.

| Endpoint | Method | Actions / Use Case |
| :--- | :--- | :--- |
| `config.php` | N/A | Database connection configuration. |
| `verify_token.php` | N/A | Middleware to validate Firebase JWT tokens. |
| `courses.php` | GET/POST | Fetching (`action=list`) or Adding (`action=create`) Dynamic Courses and Curriculums. |
| `groups.php` | GET/POST | `action=all`, `action=trainer`, `action=get_single`. |
| `attendance.php` | GET/POST | `action=list`, `action=submit`. |
| `progress.php` | GET/POST | `action=student_progress`, `action=submit_mark`. |
| `assessments.php`| GET/POST | Submitting and fetching Analytics (Evaluations). |
| `certificates.php` | GET/POST | `action=list`, `action=issue`, `action=verify&uuid=...`. |
| `payments.php` | GET/POST | `action=list`, `action=summary`, `action=record`. |
| `get_profile.php` | GET/POST | Fetch/Update official user profile. |

---

## 🛡️ 6. Security & Authentication Logic

### Token Verification Flow:
1. React App calls `auth.currentUser.getIdToken()`.
2. Token is sent via `Authorization` header to Hostinger.
3. `verify_token.php` uses Firebase public keys to verify the signature.
4. If valid, the PHP script proceeds to execute SQL queries.

### Chatbot Guardrails & AI Safety:
- The system employs a unified **System Instruction** template directly stored in settings (with a fallback in `aiService.ts`).
- **No Spoon-Feeding**: The bot is configured to reject generating full code, enforcing pedagogical debugging ("teach to fish" methodology).
- **Personalized Context Injection**: The backend retrieves current user's profile and payment state, directly mounting it into the AI's internal scope before querying the LLM, enabling contextual answers without exposing DB queries to the prompt entirely.

---

## 🌐 7. Environment Variables
Ensure these are set when compiling or deploying:
- `GEMINI_API_KEY`: For AI-generated certification success messages and Student Chatbot.
- `VITE_SQL_API_BASE`: The URL pointing to your Hostinger API folder (e.g., `https://tka-egypt.com/api`).

---

## 🔧 8. Maintenance Checklist
1. **Database Migration:** When adding new features, update `database.sql` and run `ALTER TABLE` commands on Hostinger.
2. **API Deployment:** Always upload `verify_token.php` alongside any new API file.
3. **CORS Issues:** If the app URL changes (from Firebase Hosting), update the CORS headers in `config.php`.
4. **AI Models:** If updating to a newer Gemini model, update the model name in `Certificates.tsx` and `aiService.ts`.

---

**Developed for:** TKA Egypt Academy  
**Version:** 3.5 (Contract Management System, Experience Certificate Automation, Digital Signatures)  
**Maintenance Contact:** [AI Studio Build Agent / Project Owner]

---

## 📝 Appendix: Recent Updates (v3.5)
1. **Contract Management System**: 
    - New `contracts` table in MySQL to store legal documents for staff and talent.
    - PHP endpoint `contracts.php` added for issuing, listing, and digitally signing contracts.
    - **Digital Integrity**: IP address and timestamp are recorded upon signature to ensure legal traceability.
2. **Professional Certification**:
    - Integrated `jsPDF` for dynamic "Experience Certificate" generation directly from the Supervisor Dashboard.
3. **Trainer Dashboard (Digital Signature Hub)**:
    - Added a dedicated "Contracts" tab.
    - Status tracking (Signed vs. Pending) with visual feedback.
4. **Smart Daily Notification System (Engagement v3.5)**:
    - **Personalized Push Notifications**: System to send personalized daily motivational notifications to students via FCM.
    - **Dynamic Content (`notifications.json`)**: Managed templates categorized by age group (8-11, 12-15, Graduates), injecting student names dynamically via `cron_notifications.php`.
    - **Backend Automation**: PHP-based cron job executes daily to process active users, rotate notification messages, and ensure personalized delivery.
    - **PWA Frontend Integration**: Added `notificationService.ts` and UI in `StudentDashboard.tsx` to request Browser Web-Push permissions and register device tokens in MySQL.
5. **Database Expansion**:
    - Added `contracts` table schema: `CREATE TABLE IF NOT EXISTS contracts (id INT AUTO_INCREMENT PRIMARY KEY, userId VARCHAR(255), type ENUM('trainer', 'supervisor', 'student'), title VARCHAR(255), content TEXT, status ENUM('pending', 'signed'), issuedBy VARCHAR(255), issuedAt TIMESTAMP, signedAt TIMESTAMP, signatureIP VARCHAR(45), signatureMetadata TEXT);`
    - Added user notification tracking fields: `firstname` (VARCHAR), `fcm_token` (TEXT), `age_group` (ENUM), `notification_index` (INT).

---

## 📝 Appendix: Previous Updates (v3.2)
1. **Dynamic Course Builder Enhancement**: Added local state management for per-lecture resources (PDF, Video, Image, Link).
2. **Admin Course Management**: New Dashboard tab allowing administrators to list all courses, view their status, and jump directly into "Edit Mode" for any existing curriculum.
3. **API Expansion**: `courses.php` now supports `action=admin_list`, `action=get_single`, and `action=update` (PUT logic inside POST for PHP compatibility).
4. **AI Security (Hardening)**: System instructions in `aiService.ts` strictly forbid data leakage of other students and provide active protection against prompt injection (e.g., "ignore previous instructions").
5. **Resource Rendering**: Shared logic across Trainer and Student dashboards to display lecture assets dynamically based on the current active lecture.

---

## 📝 Appendix: Performance & Stability Updates (v3.6)
1. **API Optimization**:
   - Implemented `apiFetch` resilience with `AbortController` and 8s timeout.
   - Added recursive `retries` for 5xx errors (with `skipAuth` safety for public endpoints).
2. **Scroll Performance**:
   - Implemented Virtualization using `@tanstack/react-virtual` for attendance lists.
   - Added `content-visibility: auto` and `will-change` to Bento Cards to reduce paint load.
   - Enabled `-webkit-overflow-scrolling: touch` for iOS.

---

## 🎨 10. Design System & UI Specifications

### A. Design Language: "Modern Tech-Glass"
- **Typography**: Primary: `Inter` (Sans), Headings: `Space Grotesk`, Mono: `JetBrains Mono`.
- **Color Palette**: 
  - Primary: `#0846ed` (Deep Tech Blue)
  - Secondary: `#feb700` (Electric Yellow)
  - Background: `slate-50` / `slate-950` (Dark Mode ready)
- **Styling Method**: Tailwind CSS utility classes.
- **Visual Style**: `Glassmorphism` (backdrop-blur-md, border border-white/20, bg-white/10).

### B. UI Layout Logic (The "Wireframe Definition")
The app layout is built on a **Bento-Grid** architecture:
- **`DashboardLayout`**: The wrapper providing sidebar navigation and responsive topbar.
- **`GlassCard`**: The standardized container component for all dashboard widgets.
- **Bento Logic**:
  - `lg:col-span-2`: Used for primary "Feature Focus" widgets (e.g., Active Group, Welcome Header).
  - `lg:col-span-1`: Used for secondary actionable widgets (e.g., Progress, Achievements, Payments).
- **Interactive States**: Micro-animations using `motion/react` for card entrance and layout shifts.

