import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocFromServer,
  setDoc,
  serverTimestamp,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { db, auth } from '../firebase';
import { safeStringify } from '../lib/safeStringify';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Unknown Firestore Error');
  const errorCode = (error as any)?.code || 'unknown';

  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid || 'anonymous',
      email: auth.currentUser?.email || 'no-email',
      emailVerified: auth.currentUser?.emailVerified || false,
    },
    operationType,
    path
  };
  
  const serialized = safeStringify(errInfo);
  console.warn(`Firestore [${operationType}] at [${path}] failed (Code: ${errorCode}):`, errorMessage);
  throw new Error(`Firestore Error: ${errorMessage}`);
}

// Group Management
export const createGroup = async (groupData: { name: string, trainerIds: string[], isActive: boolean, jitsiRoom?: string }) => {
  const path = 'groups';
  try {
    const docRef = await addDoc(collection(db, 'groups'), {
      ...groupData,
      studentIds: [],
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateGroup = async (groupId: string, data: any) => {
  const path = `groups/${groupId}`;
  try {
    await updateDoc(doc(db, 'groups', groupId), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const toggleGroupActive = async (groupId: string, isActive: boolean) => {
  const path = `groups/${groupId}`;
  try {
    await updateDoc(doc(db, 'groups', groupId), { isActive });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const addStudentToGroup = async (groupId: string, studentId: string) => {
  const path = `groups/${groupId}`;
  try {
    const groupRef = doc(db, 'groups', groupId);
    const groupSnap = await getDocFromServer(groupRef);
    if (groupSnap.exists()) {
      const studentIds = groupSnap.data().studentIds || [];
      if (!studentIds.includes(studentId)) {
        await updateDoc(groupRef, {
          studentIds: [...studentIds, studentId]
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const removeStudentFromGroup = async (groupId: string, studentId: string) => {
  const path = `groups/${groupId}`;
  try {
    const groupRef = doc(db, 'groups', groupId);
    const groupSnap = await getDocFromServer(groupRef);
    if (groupSnap.exists()) {
      const studentIds = groupSnap.data().studentIds || [];
      await updateDoc(groupRef, {
        studentIds: studentIds.filter((id: string) => id !== studentId)
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export type UserRole = 'student' | 'trainer' | 'supervisor' | 'admin' | 'trial';

// User Fetching for Assignments
export const getUsersByRole = async (role: UserRole) => {
  const path = 'users';
  try {
    const q = query(collection(db, 'users'), where('role', '==', role));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const getStudentsProfiles = async (studentIds: string[]) => {
  const path = 'users';
  try {
    // Firestore 'in' query supports up to 10-30 IDs usually, but let's assume small groups for now
    if (studentIds.length === 0) return [];
    const q = query(collection(db, 'users'), where('uid', 'in', studentIds));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

// Group Fetching
export const getGroupsForTrainerOnce = async (trainerId: string) => {
  const path = 'groups';
  try {
    const q = query(collection(db, 'groups'), where('trainerIds', 'array-contains', trainerId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const getGroupsForTrainer = (trainerId: string, callback: (groups: any[]) => void) => {
  const q = query(collection(db, 'groups'), where('trainerIds', 'array-contains', trainerId));
  return onSnapshot(q, (snapshot) => {
    const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(groups);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'groups');
  });
};

export const trackVideoProgress = async (videoId: string, studentId: string) => {
  const path = 'videoProgress';
  try {
    const recordId = `${videoId}_${studentId}`;
    await setDoc(doc(db, 'videoProgress', recordId), {
      videoId,
      studentId,
      completed: true,
      completedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getVideoProgressForStudent = (studentId: string, callback: (progress: any[]) => void) => {
  const q = query(collection(db, 'videoProgress'), where('studentId', '==', studentId));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'videoProgress');
  });
};

// Learning Material Management
export const addLearningMaterial = async (data: { title: string, description: string, fileUrl: string, trainerId: string, groupId: string }) => {
  const path = 'materials';
  try {
    await addDoc(collection(db, 'materials'), {
      ...data,
      createdAt: Date.now()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const getMaterialsByGroupOnce = async (groupId: string) => {
  const path = 'materials';
  try {
    const q = query(collection(db, 'materials'), where('groupId', '==', groupId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const getMaterialsByGroup = (groupId: string, callback: (materials: any[]) => void) => {
  const q = query(collection(db, 'materials'), where('groupId', '==', groupId));
  return onSnapshot(q, (snapshot) => {
    const materials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(materials);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'materials');
  });
};

// Student Progress Tracking
export const recordStudentProgress = async (data: { studentId: string, trainerId: string, groupId: string, marks: number, maxMarks: number, feedback: string, type: 'assignment' | 'exam' | 'quiz' }) => {
  const path = 'progress';
  try {
    await addDoc(collection(db, 'progress'), {
      ...data,
      date: Date.now()
    });

    // Notify student
    await sendNotification({
       recipientId: data.studentId,
       title: 'New Grade Available 📝',
       message: `An instructor has posted feedback for your recent ${data.type}. Check your dashboard!`,
       type: 'system'
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const getGroupProgress = (groupId: string, callback: (data: any[]) => void) => {
  const q = query(
    collection(db, 'progress'),
    where('groupId', '==', groupId)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'progress'));
};

export const getStudentProgressOnce = async (studentId: string) => {
  const path = 'progress';
  try {
    const q = query(collection(db, 'progress'), where('studentId', '==', studentId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const getStudentProgress = (studentId: string, callback: (records: any[]) => void) => {
  const q = query(collection(db, 'progress'), where('studentId', '==', studentId));
  return onSnapshot(q, (snapshot) => {
    const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(records);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'progress');
  });
};

// Financial & Subscription Management (Admin/Supervisor Only)
export const recordPayment = async (data: { studentId: string, amount: number, method: string, period: string, notes?: string }) => {
  const path = 'payments';
  try {
    await addDoc(collection(db, 'payments'), {
      ...data,
      date: Date.now(),
      status: 'completed'
    });

    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const userRef = doc(db, 'users', data.studentId);
    await updateDoc(userRef, {
      subscriptionExpiry: Date.now() + thirtyDays,
      status: 'active'
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getPaymentsByStudent = (studentId: string, callback: (payments: any[]) => void) => {
  const q = query(collection(db, 'payments'), where('studentId', '==', studentId), orderBy('date', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'payments');
  });
};

// Student Notes (Supervisor Only)
export const addStudentNote = async (data: { studentId: string, content: string, type: string, authorId: string }) => {
  const path = 'studentNotes';
  try {
    await addDoc(collection(db, 'studentNotes'), {
      ...data,
      createdAt: Date.now()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const getStudentNotes = (studentId: string, callback: (notes: any[]) => void) => {
  const q = query(collection(db, 'studentNotes'), where('studentId', '==', studentId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'studentNotes');
  });
};

// Notification Center
export const sendNotification = async (data: { recipientId: string, title: string, message: string, type: 'payment_reminder' | 'submission' | 'system' }) => {
  const path = 'notifications';
  try {
    await addDoc(collection(db, 'notifications'), {
      ...data,
      read: false,
      createdAt: Date.now()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const getMyNotifications = (uid: string, limitCount: number = 20, callback: (notifs: any[]) => void) => {
  const q = query(collection(db, 'notifications'), where('recipientId', '==', uid), orderBy('createdAt', 'desc'), limit(limitCount));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'notifications');
  });
};

export const cleanupOldNotifications = async () => {
  // Delete notifications older than 30 days
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const q = query(collection(db, 'notifications'), where('createdAt', '<', thirtyDaysAgo));
  
  try {
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(docSnap => {
       // Manual delete since batch limits exist
       return updateDoc(doc(db, 'notifications', docSnap.id), { _deleted: true }); // Better to use actual delete but for now
       // return deleteDoc(doc(db, 'notifications', docSnap.id)); 
    });
    // In a real app we'd use writeBatch
    console.log(`Matched ${snapshot.docs.length} old notifications for cleanup`);
  } catch (error) {
    console.error('Cleanup error:', error);
  }
};

export const markNotificationRead = async (notifId: string) => {
  const path = `notifications/${notifId}`;
  try {
    await updateDoc(doc(db, 'notifications', notifId), { read: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const getAllGroupsOnce = async () => {
  const path = 'groups';
  try {
    const querySnapshot = await getDocs(collection(db, 'groups'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const getAllGroups = (callback: (groups: any[]) => void) => {
  const q = collection(db, 'groups');
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'groups');
  });
};

export const suspendStudent = async (studentId: string) => {
  const path = `users/${studentId}`;
  try {
    await updateDoc(doc(db, 'users', studentId), {
      status: 'suspended'
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const issueCertificate = async (data: { studentId: string, studentName: string, programName: string, issuerId: string, customMessage?: string }) => {
  const path = 'certificates';
  try {
    const verificationCode = `TKA-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    await addDoc(collection(db, 'certificates'), {
      ...data,
      verificationCode,
      issueDate: Date.now(),
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${window.location.origin}/verify/${verificationCode}`
    });
    return verificationCode;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

// Attendance Logic
export const recordAttendance = async (groupId: string, date: string, presentIds: string[]) => {
  const path = 'attendance';
  try {
    const recordId = `${groupId}_${date}`;
    await setDoc(doc(db, 'attendance', recordId), {
      groupId,
      date,
      presentIds,
      updatedAt: serverTimestamp(),
      recordedBy: auth.currentUser?.uid
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

// Registration Flows
export const registerFullStudent = async (uid: string, data: { name: string, email: string, [key: string]: any }) => {
  const path = `users/${uid}`;
  try {
    await setDoc(doc(db, 'users', uid), {
      ...data,
      uid,
      role: 'student',
      status: 'pending',
      createdAt: Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const registerTrialStudent = async (uid: string, data: { name: string, whatsappNumber: string }) => {
  const path = `users/${uid}`;
  try {
    await setDoc(doc(db, 'users', uid), {
      ...data,
      uid,
      role: 'trial',
      status: 'pending',
      isTrial: true,
      createdAt: Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const generateAndCreateTrialUser = async () => {
  const studentCode = `TRIAL-${Math.floor(1000 + Math.random() * 9000)}`;
  const password = Math.random().toString(36).slice(-8);
  const email = `${studentCode.toLowerCase()}@trial.tkaegypt.pro`;

  try {
    // 1. Create in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // 2. Create in Firestore
    await setDoc(doc(db, 'users', uid), {
      uid,
      name: `Trial Admin (${studentCode})`,
      studentCode,
      password, // Store password in firestore for student code login convenience
      email,
      role: 'admin',
      status: 'active',
      isTrial: true,
      createdAt: Date.now(),
    });

    return { studentCode, password, email };
  } catch (error: any) {
    console.error('Trial Creation Error Details:', error?.message || error);
    if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Firebase Email/Password authentication is not enabled in the console.');
    }
    throw error;
  }
};

export const loginWithStudentCode = async (studentCode: string, passwordInput: string) => {
  try {
    const q = query(
      collection(db, 'users'), 
      where('studentCode', '==', studentCode.toUpperCase())
    );
    const snap = await getDocs(q);
    
    if (snap.empty) {
      throw new Error('Invalid Student Code or Password');
    }

    const userData = snap.docs[0].data();
    // Use the email stored to sign in with Firebase Auth
    return await signInWithEmailAndPassword(auth, userData.email, passwordInput);
  } catch (error: any) {
    throw error;
  }
};

export const approveRegistration = async (regId: string, regData: any) => {
  const path = `users/${regId}`;
  try {
    // 1. Create User Document
    await setDoc(doc(db, 'users', regId), {
      ...regData,
      name: regData.name || regData.fullName || 'Approved Student',
      status: 'approved',
      createdAt: serverTimestamp(),
    });
    
    // 2. Mark registration as approved
    await updateDoc(doc(db, 'registrations', regId), { status: 'approved' });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

// Profile Management
export const ensureUserProfile = async (user: any) => {
  const userRef = doc(db, 'users', user.uid);
  try {
    const docSnap = await getDocFromServer(userRef);
    if (!docSnap.exists()) {
      // Create default profile for first-time Google user
      const adminEmails = ['TKA.egypt@gmail.com', 'eng.waheedea@gmail.com'];
      const isAdminEmail = adminEmails.includes(user.email);
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName || 'Unnamed User',
        email: user.email,
        role: isAdminEmail ? 'admin' : 'student',
        createdAt: Date.now(),
        // Defaults for students
        subscriptionStatus: 'trial'
      });
      return true; // Created
    }
    return false; // Already existed
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    return false;
  }
};

export const updateUserProfile = async (uid: string, data: any) => {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

// Batch Import
export const importStudents = async (studentsList: any[]) => {
  const path = 'users/batch';
  try {
    for (const student of studentsList) {
      const uid = student.uid || `imported_${Math.random().toString(36).substring(2, 9)}`;
      await setDoc(doc(db, 'users', uid), {
        ...student,
        name: student.name || student.fullName || 'Imported Student',
        email: student.email || `${uid}@imported.tkaegypt.pro`,
        uid,
        status: 'active',
        createdAt: Date.now()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getDatabaseBackup = async () => {
  const path = 'backup';
  try {
    const collectionsToBackup = ['users', 'groups', 'registrations', 'progress', 'attendance', 'payments', 'certificates'];
    const backupData: any = {};
    
    for (const colName of collectionsToBackup) {
      const q = collection(db, colName);
      const snap = await getDocs(q);
      backupData[colName] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    return backupData;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return null;
  }
};

export const testConnection = async () => {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection verified.");
  } catch (error: any) {
    if (error?.message?.includes('offline') || error?.code === 'unavailable') {
      console.warn("Firestore is operating in OFFLINE mode. This is expected in some sandbox environments.");
    } else {
      console.error("Firestore connection issue:", error?.message || error);
    }
  }
};

// Assessment & Quality Management
export const createAssessmentRequest = async (data: { 
  type: 'trainer' | 'program' | 'student_feedback' | 'performance',
  recipientId: string,
  targetId: string,
  targetName: string,
  requestedBy: string
}) => {
  const path = 'assessmentRequests';
  try {
    const docRef = await addDoc(collection(db, 'assessmentRequests'), {
      ...data,
      status: 'pending',
      createdAt: Date.now(),
      shareToken: Math.random().toString(36).substring(2, 15)
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const getMyPendingAssessments = (uid: string, callback: (assessments: any[]) => void) => {
  const q = query(
    collection(db, 'assessmentRequests'), 
    where('recipientId', '==', uid), 
    where('status', '==', 'pending')
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'assessmentRequests');
  });
};

export const submitAssessmentResults = async (requestId: string, type: string, results: any) => {
  const collectionName = 
    type === 'trainer' ? 'trainerAssessments' :
    type === 'program' ? 'programAssessments' :
    type === 'student_feedback' ? 'studentFeedback' :
    'performanceTracking';

  try {
    // 1. Save result
    await addDoc(collection(db, collectionName), {
      ...results,
      requestId,
      submittedAt: Date.now()
    });

    // 2. Update request status
    await updateDoc(doc(db, 'assessmentRequests', requestId), {
      status: 'completed',
      completedAt: Date.now()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionName);
  }
};

