import re

with open('src/services/firestoreService.ts', 'r') as f:
    code = f.read()

trial_pattern = r"export const generateAndCreateTrialUser = async.*?};\n"
trial_replacement = """export const generateAndCreateTrialUser = async () => {
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
"""

code = re.sub(trial_pattern, trial_replacement, code, flags=re.DOTALL)

student_login_pattern = r"export const loginWithStudentCode = async.*?};\n"
student_login_replacement = """export const loginWithStudentCode = async (studentCode: string, passwordInput: string) => {
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
"""

code = re.sub(student_login_pattern, student_login_replacement, code, flags=re.DOTALL)

code = re.sub(r"export const loginWithEmailLocally = async.*?};\n\n", "", code, flags=re.DOTALL)

with open('src/services/firestoreService.ts', 'w') as f:
    f.write(code)
