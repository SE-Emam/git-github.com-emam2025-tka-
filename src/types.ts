export type UserRole = 'student' | 'trainer' | 'supervisor' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  subscriptionStatus?: 'active' | 'expired' | 'trial';
  createdAt: number;
}

export interface TrainingGroup {
  id: string;
  name: string;
  courseId: string;
  trainerId: string;
  studentIds: string[];
  schedule: string; // e.g., "Mon-Wed 6 PM"
  jitsiRoom?: string;
  isActive: boolean;
}

export interface AttendanceRecord {
  id: string;
  groupId: string;
  date: string; // ISO format
  presentIds: string[];
  absentIds: string[];
}

export interface Task {
  id: string;
  groupId: string;
  title: string;
  description: string;
  deadline: number;
  badgeId?: string;
}

export interface Submission {
  id: string;
  taskId: string;
  studentId: string;
  fileUrl: string;
  score?: number;
  feedback?: string;
  submittedAt: number;
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  amount: number;
  method: 'vodafone_cash' | 'instapay' | 'fawry' | 'card' | 'myfatoorah';
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
}
