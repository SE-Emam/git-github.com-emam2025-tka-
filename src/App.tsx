import * as React from 'react';
import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/src/context/AuthContext';
import { LanguageProvider } from '@/src/context/LanguageContext';
import { ProtectedRoute } from '@/src/components/auth/ProtectedRoute';

const Home = React.lazy(() => import('@/src/pages/Home'));
const Login = React.lazy(() => import('@/src/pages/Login'));
const About = React.lazy(() => import('@/src/pages/About'));
const Contact = React.lazy(() => import('@/src/pages/Contact'));
const Courses = React.lazy(() => import('@/src/pages/Courses'));
const StudentDashboard = React.lazy(() => import('@/src/pages/StudentDashboard'));
const TrainerDashboard = React.lazy(() => import('@/src/pages/TrainerDashboard'));
const AdminDashboard = React.lazy(() => import('@/src/pages/AdminDashboard'));
const SupervisorDashboard = React.lazy(() => import('@/src/pages/SupervisorDashboard'));
const Profile = React.lazy(() => import('@/src/pages/Profile'));
const Groups = React.lazy(() => import('@/src/pages/Groups'));
const Attendance = React.lazy(() => import('@/src/pages/Attendance'));
const Progress = React.lazy(() => import('@/src/pages/Progress'));
const Certificates = React.lazy(() => import('@/src/pages/Certificates'));
const CertificateVerification = React.lazy(() => import('@/src/pages/CertificateVerification'));
const Register = React.lazy(() => import('@/src/pages/Register'));
const Enrollment = React.lazy(() => import('@/src/pages/Enrollment'));
const DashboardRedirect = React.lazy(() => import('@/src/pages/DashboardRedirect'));
const ScholarshipDetails = React.lazy(() => import('@/src/pages/ScholarshipDetails'));
const TechnoMathDetails = React.lazy(() => import('@/src/pages/TechnoMathDetails'));
const CourseDetails = React.lazy(() => import('@/src/pages/CourseDetails'));
const CourseBuilder = React.lazy(() => import('@/src/pages/admin/CourseBuilder'));
const CMSDashboard = React.lazy(() => import('@/src/pages/CMSDashboard'));
const TrainingRequest = React.lazy(() => import('@/src/pages/TrainingRequest'));
const TrainerAssessmentForm = React.lazy(() => import('@/src/pages/assessments/TrainerAssessmentForm'));
const ProgramAssessmentForm = React.lazy(() => import('@/src/pages/assessments/ProgramAssessmentForm'));
const StudentFeedbackForm = React.lazy(() => import('@/src/pages/assessments/StudentFeedbackForm'));
const PerformanceTrackingForm = React.lazy(() => import('@/src/pages/assessments/PerformanceTrackingForm'));
const AssessmentManager = React.lazy(() => import('@/src/pages/assessments/AssessmentManager'));
import StickyPWAPrompt from '@/src/components/common/StickyPWAPrompt';

const LoadingFallback = () => <div className="min-h-screen flex items-center justify-center">Loading...</div>;

export default function App() {
  return (
      <LanguageProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/course/:id" element={<CourseDetails />} />
          <Route path="/scholarship" element={<ScholarshipDetails />} />
          <Route path="/techno-math" element={<TechnoMathDetails />} />
          <Route path="/verify" element={<CertificateVerification />} />
          <Route path="/verify/:code" element={<CertificateVerification />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/enrollment" element={<Enrollment />} />
          <Route path="/training-request" element={<TrainingRequest />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/apply/student" element={<Register defaultRole="student" />} />
          <Route path="/apply/job" element={<Register defaultRole="trainer" />} />

          {/* Protected Dashboards */}
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route 
            path="/dashboard/student" 
            element={
              <ProtectedRoute allowedRoles={['student', 'trial', 'admin']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/student/courses" 
            element={
              <ProtectedRoute allowedRoles={['student', 'trial', 'trainer', 'admin']}>
                <StudentDashboard activeTab="courses" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/student/billing" 
            element={
              <ProtectedRoute allowedRoles={['student', 'trial', 'supervisor', 'admin']}>
                <StudentDashboard activeTab="billing" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/student/software" 
            element={
              <ProtectedRoute allowedRoles={['student', 'trial', 'admin']}>
                <StudentDashboard activeTab="software" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/trainer" 
            element={
              <ProtectedRoute allowedRoles={['trainer', 'admin']}>
                <TrainerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/cms" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CMSDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/admin/course-builder" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CourseBuilder />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/supervisor" 
            element={
              <ProtectedRoute allowedRoles={['supervisor', 'admin']}>
                <SupervisorDashboard />
              </ProtectedRoute>
            } 
          />

          {/* SHARED PROTECTED ROUTES */}
          <Route 
            path="/dashboard/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/groups" 
            element={
              <ProtectedRoute allowedRoles={['trainer', 'supervisor', 'admin']}>
                <Groups />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/attendance" 
            element={
              <ProtectedRoute allowedRoles={['trainer', 'supervisor', 'admin']}>
                <Attendance />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/progress" 
            element={
              <ProtectedRoute allowedRoles={['trainer', 'supervisor', 'admin']}>
                <Progress />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/certificates" 
            element={
              <ProtectedRoute allowedRoles={['supervisor', 'admin']}>
                <Certificates />
              </ProtectedRoute>
            } 
          />

          {/* Assessment System (Hidden/Manual Access) */}
          <Route path="/assessments/trainer" element={<TrainerAssessmentForm />} />
          <Route path="/assessments/program" element={<ProgramAssessmentForm />} />
          <Route path="/assessments/student" element={<StudentFeedbackForm />} />
          <Route path="/assessments/performance" element={<PerformanceTrackingForm />} />
          
          <Route 
            path="/dashboard/assessments" 
            element={
              <ProtectedRoute allowedRoles={['supervisor', 'admin']}>
                <AssessmentManager />
              </ProtectedRoute>
            } 
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
            </Suspense>
        <StickyPWAPrompt />
      </Router>
    </LanguageProvider>
  );
}







