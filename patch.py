import re

with open('src/pages/Login.tsx', 'r') as f:
    code = f.read()

email_login_pattern = r"const handleEmailLogin = async.*?};\n"
email_login_replacement = """const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Check your credentials.');
      setLoading(false);
    }
  };
"""

code = re.sub(email_login_pattern, email_login_replacement, code, flags=re.DOTALL)

student_login_pattern = r"const handleStudentLogin = async.*?};\n"
student_login_replacement = """const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithStudentCode(studentCode, studentPassword);
    } catch (err: any) {
      if (err.message === 'Invalid Student Code or Password') {
        setError('كود الطالب أو كلمة المرور غير صحيحة.');
      } else {
        setError(err.message || 'Failed to sign in.');
      }
      setLoading(false);
    }
  };
"""

code = re.sub(student_login_pattern, student_login_replacement, code, flags=re.DOTALL)


trial_login_pattern = r"const handleCreateTrial = async.*?};\n"
trial_login_replacement = """const handleCreateTrial = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await generateAndCreateTrialUser();
      setSuccess(`تم إنشاء الحساب بنجاح! جاري تحويلك للوحة التحكم...`);
    } catch (err: any) {
      console.error("Quick Access Error:", err?.message || err);
      setError(err.message || 'فشل إنشاء مستخدم تجريبي. يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };
"""

code = re.sub(trial_login_pattern, trial_login_replacement, code, flags=re.DOTALL)


google_login_pattern = r"const handleGoogleLogin = async.*?};\n"
google_login_replacement = """const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await ensureUserProfile(result.user);
      }
    } catch (err: any) {
      if (err.code === 'auth/network-request-failed') {
        setError('فشل الاتصال بخدمات Google. يرجى التأكد من عدم حظر النوافذ المنبثقة وشبكة الخادم.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('تم إغلاق نافذة تسجيل الدخول قبل اكتمال العملية. يرجى المحاولة مرة أخرى أو فتح التطبيق في نافذة مستقلة إذا كنت تواجه مشكلة متكررة.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(`هذا النطاق (${window.location.hostname}) غير مصرح له بتسجيل الدخول. يرجى إضافته إلى "Authorized Domains" في وحدة تحكم Firebase (Firebase Console).`);
      } else {
        setError(err.message || 'Google sign-in failed.');
      }
      setLoading(false);
    }
  };
"""

code = re.sub(google_login_pattern, google_login_replacement, code, flags=re.DOTALL)

code = code.replace("const { profile, user, login } = useAuth();", "const { profile, user } = useAuth();")

with open('src/pages/Login.tsx', 'w') as f:
    f.write(code)

