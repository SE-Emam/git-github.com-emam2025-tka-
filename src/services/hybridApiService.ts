import { auth } from '@/src/firebase';
import { safeStringify } from '@/src/lib/safeStringify';
import { onAuthStateChanged, User } from 'firebase/auth';

const API_BASE_URL = import.meta.env.VITE_SQL_API_BASE || 'https://tka-egypt.com/api';

// Simple in-memory cache for GET requests to reduce latency
const apiCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

/**
 * Utility to wait for Firebase Auth to be ready
 */
async function waitForUser(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
    // Timeout if Auth takes too long
    setTimeout(() => {
        unsub();
        resolve(auth.currentUser);
    }, 3000);
  });
}

/**
 * Generic fetch wrapper that automatically attaches the Firebase ID Token with AbortController and Timeout support.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}, retries = 2, skipAuth = false): Promise<any> {
  const isGet = !options.method || options.method === 'GET';
  
  if (isGet) {
    const cached = apiCache.get(endpoint);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  let idToken = null;
  if (!skipAuth) {
    let currentUser = auth.currentUser;
    if (!currentUser) currentUser = await waitForUser();
    if (!currentUser) {
        console.error("apiFetch Error: currentUser is null. Auth state:", !!auth.currentUser);
        throw new Error("User not authenticated.");
    }
    idToken = await currentUser.getIdToken();
  }

  // Create AbortController to manage request cancellation
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout

  try {
    const headers: Record<string, string> = { 
        'Content-Type': 'application/json', 
        ...(options.headers as Record<string, string>)
    };
    
    if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal // Link to abort controller
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Do NOT retry 4xx errors
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`[${response.status}] Client Error`);
      }
      
      // Retry 5xx errors or network issues
      if (retries > 0) {
        return apiFetch(endpoint, options, retries - 1, skipAuth);
      }
      
      throw new Error(`[${response.status}] Server Error`);
    }

    const result = await response.json();
    if (isGet) apiCache.set(endpoint, { data: result, timestamp: Date.now() });
    return result;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // Retry on network errors
    if (error.name !== 'AbortError' && retries > 0) {
      return apiFetch(endpoint, options, retries - 1, skipAuth);
    }
    
    throw error;
  }
}

/**
 * Clears the API cache (e.g., after an update)
 */
export function clearApiCache() {
  apiCache.clear();
}

/**
 * Fetch Courses from MySQL (Hostinger)
 */
export async function getCoursesFromSQL() {
  try {
    // We use skipAuth = false (default) because the PHP backend crashes (500 Server Error)
    // if the Authorization header is completely missing.
    const res = await apiFetch('/courses.php');
    return res.data; // Expected to match the pathsData structure
  } catch (error: any) {
    // Safely swallow "User not authenticated" and "500 Server Error" to avoid console spam
    // as we have a resilient hardcoded fallback in useCoursesData.
    if (error?.message && (error.message.includes('User not authenticated') || error.message.includes('500'))) {
       return null;
    }
    
    // For other unexpected errors, we can log a warning instead of a red error
    console.warn("SQL Backend unreachable for courses, using fallback.");
    return null;
  }
}

/**
 * Fetch All Groups from MySQL
 */
export async function getAllGroupsFromSQL() {
  try {
    const res = await apiFetch('/groups.php?action=all');
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch all groups from SQL", error);
    return [];
  }
}

/**
 * Fetch Trainer Groups from MySQL
 */
export async function getTrainerGroupsFromSQL(userId: string) {
  try {
    const res = await apiFetch(`/groups.php?action=trainer&userId=${encodeURIComponent(userId)}`);
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch trainer groups from SQL", error);
    return [];
  }
}

/**
 * Fetch Students in a Group
 */
export async function getStudentsInGroupFromSQL(groupId: string | number) {
  try {
    const res = await apiFetch(`/progress.php?action=students_in_group&groupId=${groupId}`);
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch students in group", error);
    return [];
  }
}

/**
 * Fetch Progress Marks for a Group
 */
export async function getGroupProgressFromSQL(groupId: string | number) {
  try {
    const res = await apiFetch(`/progress.php?action=group_progress&groupId=${groupId}`);
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch group progress", error);
    return [];
  }
}

/**
 * Record a Mark for a Student
 */
export async function recordStudentProgressInSQL(markData: any) {
  try {
    const res = await apiFetch('/progress.php', {
      method: 'POST',
      body: safeStringify({ action: 'record_mark', ...markData })
    });
    return res;
  } catch (error) {
    console.error("Failed to record mark in SQL", error);
    throw error;
  }
}
export async function createGroupInSQL(groupData: any) {
  try {
    const res = await apiFetch('/groups.php', {
      method: 'POST',
      body: safeStringify({ action: 'create', ...groupData })
    });
    return res;
  } catch (error) {
    console.error("Failed to create group in SQL", error);
    throw error;
  }
}

export async function updateGroupInSQL(groupId: string | number, groupData: any) {
  try {
    const res = await apiFetch('/groups.php', {
      method: 'POST',
      body: safeStringify({ action: 'update', groupId, ...groupData })
    });
    return res;
  } catch (error) {
    console.error("Failed to update group in SQL", error);
    throw error;
  }
}

export async function deleteGroupInSQL(groupId: string | number) {
  try {
    const res = await apiFetch('/groups.php', {
      method: 'POST',
      body: safeStringify({ action: 'delete', groupId })
    });
    return res;
  } catch (error) {
    console.error("Failed to delete group from SQL", error);
    throw error;
  }
}

/**
 * Update User Role - Admin Only
 */
export async function updateUserRoleInSQL(userId: string, role: string) {
  try {
    const res = await apiFetch('/users.php', {
      method: 'POST',
      body: safeStringify({ action: 'update_role', userId, role })
    });
    return res;
  } catch (error) {
    console.error("Failed to update user role", error);
    throw error;
  }
}
/**
 * Fetch Official Profile from MySQL
 */
export async function getProfileFromSQL() {
  try {
    const res = await apiFetch('/get_profile.php');
    return res.data;
  } catch (error) {
    console.error("Failed to fetch profile from SQL", error);
    return null;
  }
}

export async function updateProfileToSQL(profileData: any) {
  try {
    const res = await apiFetch('/get_profile.php', {
      method: 'POST',
      body: safeStringify(profileData)
    });
    return res;
  } catch (error) {
    console.error("Failed to update profile to SQL", error);
    throw error;
  }
}

/**
 * Fetch Attendance Records
 */
export async function getAttendanceFromSQL(groupId: string | number, date: string) {
  try {
    const res = await apiFetch(`/attendance.php?action=get_records&groupId=${groupId}&date=${date}`);
    return res.data || {};
  } catch (error) {
    console.error("Failed to fetch attendance", error);
    return {};
  }
}

export async function getAttendanceSummaryFromSQL(groupId: string | number, month?: string) {
  try {
    const m = month || new Date().toISOString().split('T')[0].substring(0, 7);
    const res = await apiFetch(`/attendance.php?action=get_summary&groupId=${groupId}&month=${m}`);
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch attendance summary", error);
    return [];
  }
}

export async function getStudentAttendanceHistoryFromSQL(studentId: string) {
  try {
    const res = await apiFetch(`/attendance.php?action=student_history&studentId=${encodeURIComponent(studentId)}`);
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch student attendance history", error);
    return [];
  }
}

export async function addTrainerTransactionInSQL(data: {
  trainerId: string,
  type: 'payment' | 'reward' | 'penalty',
  amount: number,
  description?: string,
  method?: string,
  recordedBy?: string
}) {
  try {
    const res = await apiFetch('/trainer_finances.php', {
      method: 'POST',
      body: safeStringify({ ...data, action: 'add_transaction' })
    });
    return res;
  } catch (error) {
    console.error("Failed to add trainer transaction", error);
    throw error;
  }
}

export async function updateTrainerHourlyRateInSQL(trainerId: string, rate: number) {
  try {
    const res = await apiFetch('/trainer_finances.php', {
      method: 'POST',
      body: safeStringify({ action: 'update_rate', trainerId, rate })
    });
    return res;
  } catch (error) {
    console.error("Failed to update trainer rate", error);
    throw error;
  }
}

export async function recordAttendanceToSQL(data: {
  groupId: string | number,
  date: string,
  presentIds: string[],
  allStudentIds: string[],
  trainerId?: string
}) {
  try {
    const res = await apiFetch('/attendance.php', {
      method: 'POST',
      body: safeStringify({ ...data, action: 'record' })
    });
    return res;
  } catch (error) {
    console.error("Failed to record attendance to SQL", error);
    throw error;
  }
}

/**
 * Fetch Student's Progress from MySQL
 */
export async function getStudentProgressFromSQL(userId: string) {
  try {
    const res = await apiFetch(`/progress.php?action=student_progress&userId=${encodeURIComponent(userId)}`);
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch student progress from SQL", error);
    return [];
  }
}

/**
 * Fetch Student's Certificates from MySQL
 */
export async function getStudentCertificatesFromSQL(userId: string) {
  try {
    const res = await apiFetch(`/certificates.php?action=student_list&studentId=${encodeURIComponent(userId)}`);
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch student certificates from SQL", error);
    return [];
  }
}

/**
 * Fetch Single Group Details from MySQL
 */
export async function getSingleGroupFromSQL(groupId: string | number) {
  try {
    const res = await apiFetch(`/groups.php?action=get_single&groupId=${groupId}`);
    return res.data || null;
  } catch (error) {
    console.error("Failed to fetch single group from SQL", error);
    return null;
  }
}

/**
 * Fetch Users by Role from MySQL
 */
export async function getUsersByRoleFromSQL(role: string) {
  try {
    const res = await apiFetch(`/users.php?role=${role}`);
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch users by role", error);
    return [];
  }
}

/**
 * Fetch System Settings (Chatbot, etc.) from MySQL
 */
export async function getSystemSettingsFromSQL() {
  try {
    const res = await apiFetch('/system_settings.php');
    return res.data || {};
  } catch (error) {
    console.error("Failed to fetch system settings from SQL", error);
    return {};
  }
}

/**
 * Update System Settings in MySQL
 */
export async function updateSystemSettingsInSQL(settings: Record<string, string>) {
  try {
    const res = await apiFetch('/system_settings.php', {
      method: 'POST',
      body: safeStringify(settings)
    });
    return res;
  } catch (error) {
    console.error("Failed to update system settings in SQL", error);
    throw error;
  }
}

/**
 * Fetch All Certificates from MySQL
 */
export async function getAllCertificatesFromSQL() {
  try {
    const res = await apiFetch('/certificates.php?action=list');
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch all certificates from SQL", error);
    return [];
  }
}

/**
 * Issue a Certificate in MySQL
 */
export async function issueCertificateInSQL(certData: any) {
  try {
    const res = await apiFetch('/certificates.php', {
      method: 'POST',
      body: safeStringify({ action: 'issue', ...certData })
    });
    return res;
  } catch (error) {
    console.error("Failed to issue certificate in SQL", error);
    throw error;
  }
}

/**
 * Verify a Certificate in MySQL using UUID
 */
export async function verifyCertificateFromSQL(uuid: string) {
  try {
    const res = await apiFetch(`/certificates.php?action=verify&uuid=${encodeURIComponent(uuid)}`);
    return res.data;
  } catch (error) {
    console.error("Failed to verify certificate in SQL", error);
    return null;
  }
}

/**
 * Record Attendance
 */
export async function recordAttendanceInSQL(data: { groupId: string | number, date: string, presentIds: string[], allStudentIds: string[], trainerId?: string }) {
  try {
    const res = await apiFetch('/attendance.php', {
      method: 'POST',
      body: safeStringify({ action: 'record', ...data })
    });
    return res;
  } catch (error) {
    console.error("Failed to record attendance", error);
    throw error;
  }
}

/**
 * Record a Payment/Subscription Renewal in MySQL
 */
export async function recordPaymentToSQL(paymentData: { studentId: string, amount: number, method: string, period: string, notes?: string }) {
  try {
    const res = await apiFetch('/payment.php', {
      method: 'POST',
      body: safeStringify({ action: 'record', ...paymentData })
    });
    // This endpoint should also update the subscription_expiry in the users table
    return res;
  } catch (error) {
    console.error("Failed to record payment in SQL", error);
    throw error;
  }
}

/**
 * Fetch Payment History for a Student from MySQL
 */
export async function getPaymentsFromSQL(studentId: string) {
  try {
    const res = await apiFetch(`/payment.php?action=list&studentId=${encodeURIComponent(studentId)}`);
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch payments from SQL", error);
    return [];
  }
}

/**
 * Fetch Financial Summary (Total income, pending dues) - For Super/Admin
 */
export async function getFinancialSummaryFromSQL() {
  try {
    const res = await apiFetch('/payment.php?action=summary');
    return res.data || { totalIncome: 0, pendingDues: 0 };
  } catch (error) {
    console.error("Failed to fetch financial summary", error);
    return { totalIncome: 0, pendingDues: 0 };
  }
}

/**
 * Fetch Payment Settings (Wallets, InstaPay, etc.)
 */
export async function getPaymentSettingsFromSQL() {
  try {
    const res = await apiFetch('/payment_setting.php');
    return res.data || {};
  } catch (error) {
    console.error("Failed to fetch payment settings", error);
    return {};
  }
}

/**
 * Update Payment Settings - Admin Only
 */
export async function updatePaymentSettingsInSQL(settings: Record<string, string>) {
  try {
    const res = await apiFetch('/payment_setting.php', {
      method: 'POST',
      body: safeStringify(settings)
    });
    return res;
  } catch (error) {
    console.error("Failed to update payment settings", error);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// APPLICATIONS (TOOLS) API
// ---------------------------------------------------------------------------

export async function getApplicationsFromSQL() {
  try {
    const res = await apiFetch('/applications.php');
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch applications", error);
    return [];
  }
}

export async function addApplicationToSQL(appData: any) {
  try {
    const res = await apiFetch('/applications.php', {
      method: 'POST',
      body: safeStringify({ action: 'add', ...appData })
    });
    return res;
  } catch (error) {
    console.error("Failed to add application", error);
    throw error;
  }
}

export async function deleteApplicationFromSQL(appId: string) {
  try {
    const res = await apiFetch('/applications.php', {
      method: 'POST',
      body: safeStringify({ action: 'delete', id: appId })
    });
    return res;
  } catch (error) {
    console.error("Failed to delete application", error);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// VIDEO LIBRARY API
// ---------------------------------------------------------------------------

export async function getVideosFromSQL(params: { groupId?: string, levelName?: string, subject?: string } = {}) {
  try {
    const queryString = new URLSearchParams(params as any).toString();
    const res = await apiFetch(`/videos.php?${queryString}`);
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch videos", error);
    return [];
  }
}

export async function addVideoToSQL(videoData: any) {
  try {
    const res = await apiFetch('/videos.php', {
      method: 'POST',
      body: safeStringify({ action: 'add', ...videoData })
    });
    return res;
  } catch (error) {
    console.error("Failed to add video", error);
    throw error;
  }
}

export async function deleteVideoFromSQL(videoId: string) {
  try {
    const res = await apiFetch('/videos.php', {
      method: 'POST',
      body: safeStringify({ action: 'delete', id: videoId })
    });
    return res;
  } catch (error) {
    console.error("Failed to delete video", error);
    throw error;
  }
}

/**
 * Submit Training Request to SQL Backend
 */
export async function submitTrainingRequestToSQL(requestData: any) {
  try {
    const res = await apiFetch('/training_requests.php', {
      method: 'POST',
      body: safeStringify({ action: 'submit', ...requestData })
    });
    return res;
  } catch (error) {
    console.error("Failed to submit training request to SQL", error);
    throw error;
  }
}

/**
 * Submit Assessment to SQL Backend
 */
export async function submitAssessmentToSQL(assessmentType: string, payload: any) {
  try {
    const res = await apiFetch('/assessments.php', {
      method: 'POST',
      body: safeStringify({ action: 'submit_assessment', assessmentType, payload })
    });
    return res;
  } catch (error) {
    console.error("Failed to submit assessment to SQL", error);
    throw error;
  }
}

export async function getAssessmentsFromSQL(type: string) {
  try {
    // type maps to trainer, program, student_feedback, performance
    const res = await apiFetch(`/assessments.php?action=list&type=${type}`);
    return res.data || [];
  } catch (error) {
    console.error(`Failed to fetch ${type} assessments`, error);
    return [];
  }
}

export async function getTrainerFinancialHistoryFromSQL(trainerId: string, month?: string) {
  try {
    const m = month || new Date().toISOString().substring(0, 7);
    const res = await apiFetch(`/trainer_finances.php?action=history&trainerId=${encodeURIComponent(trainerId)}&month=${m}`);
    return res.data || { sessions: [], transactions: [] };
  } catch (error) {
    console.error("Failed to fetch trainer finance history", error);
    return { sessions: [], transactions: [] };
  }
}

export async function getTrainerBalanceFromSQL(trainerId: string) {
  try {
    const res = await apiFetch(`/trainer_finances.php?action=balance&trainerId=${encodeURIComponent(trainerId)}`);
    return res.data || { balance: 0, unsettled_earnings: 0, payments: 0 };
  } catch (error) {
    console.error("Failed to fetch trainer balance", error);
    return { balance: 0, unsettled_earnings: 0, payments: 0 };
  }
}

export async function logTrainerSessionInSQL(data: {
  trainerId: string;
  groupId: string | number;
  date: string;
  durationHours: number;
}) {
  try {
    const res = await apiFetch('/trainer_finances.php', {
      method: 'POST',
      body: safeStringify({ action: 'log_session', ...data })
    });
    return res;
  } catch (error) {
    console.error("Failed to log trainer session", error);
    throw error;
  }
}

// Contract Functions
export async function getContractsFromSQL(userId?: string) {
  try {
    const url = userId ? `/contracts.php?userId=${encodeURIComponent(userId)}` : '/contracts.php';
    const res = await apiFetch(url);
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch contracts", error);
    return [];
  }
}

export async function getContractDetailsFromSQL(id: string | number) {
  try {
    const res = await apiFetch(`/contracts.php?id=${id}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch contract details", error);
    return null;
  }
}

export async function issueContractInSQL(data: {
  userId: string,
  type: 'trainer' | 'supervisor' | 'student',
  title: string,
  content: string,
  issuedBy: string
}) {
  try {
    const res = await apiFetch('/contracts.php', {
      method: 'POST',
      body: safeStringify({ ...data, action: 'create' })
    });
    return res;
  } catch (error) {
    console.error("Failed to issue contract", error);
    throw error;
  }
}

export async function signContractInSQL(contractId: string | number, userId: string) {
  try {
    const res = await apiFetch('/contracts.php', {
      method: 'POST',
      body: safeStringify({ action: 'sign', contractId, userId })
    });
    return res;
  } catch (error) {
    console.error("Failed to sign contract", error);
    throw error;
  }
}

/**
 * Generic API helpers for simple POST/GET requests
 */
export const hybridApi = {
  get: (endpoint: string) => apiFetch(endpoint, { method: 'GET' }),
  post: (endpoint: string, body: any) => apiFetch(endpoint, {
    method: 'POST',
    body: safeStringify(body)
  })
};

