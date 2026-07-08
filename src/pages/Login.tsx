import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
} from 'firebase/auth';
import { auth, googleProvider } from '@/src/firebase';
import { useAuth } from '@/src/context/AuthContext';
import { GlassCard, GlassButton, Navbar } from '@/src/components/common/Layout';
import { Mail, Lock, ChevronRight, Chrome, AlertCircle, Hash, UserPlus, ExternalLink, ArrowRight, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/src/context/LanguageContext';
import { generateAndCreateTrialUser, loginWithStudentCode, ensureUserProfile } from '../services/firestoreService';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, isRtl, language } = useLanguage();
  const { profile, user } = useAuth();
  
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [studentCode, setStudentCode] = React.useState('');
  const [studentPassword, setStudentPassword] = React.useState('');
  
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [isInIframe, setIsInIframe] = React.useState(false);
  const [showStudentCode, setShowStudentCode] = React.useState(false);

  React.useEffect(() => {
    // Detect if running in iframe
    try {
      setIsInIframe(window.self !== window.top);
    } catch (e) {
      setIsInIframe(true);
    }
  }, []);

  // Handle redirect if already logged in
  const isIframe = React.useMemo(() => {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }, []);

  const openInNewWindow = () => {
    window.open(window.location.href, '_blank');
  };

  React.useEffect(() => {
    if (user && profile) {
      const targetRole = profile.role === 'trial' ? 'student' : profile.role;
      const from = (location.state as any)?.from?.pathname || `/dashboard/${targetRole}`;
      navigate(from, { replace: true });
    }
  }, [user, profile, navigate, location]);

  const handleEmailLogin = async (e: React.FormEvent) => {
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

  const handleStudentLogin = async (e: React.FormEvent) => {
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

  const handleCreateTrial = async () => {
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

  const handleGoogleLogin = async () => {
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-primary/30">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden pt-24">
        {/* Background elements */}
        <div className="absolute top-1/4 -left-10 w-80 h-80 bg-primary/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-1/4 -right-10 w-80 h-80 bg-secondary/10 blur-[100px] rounded-full" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          {isIframe && (
            <motion.div 
               initial={{ y: -20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="mb-8 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-[28px] text-center shadow-lg shadow-amber-500/5"
            >
               <div className="flex justify-center mb-3">
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-2xl text-amber-600 dark:text-amber-400">
                     <AlertTriangle size={24} />
                  </div>
               </div>
               <h3 className="text-amber-900 dark:text-amber-100 font-bold mb-2">تسجيل الدخول المقيد</h3>
               <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed mb-4 font-bold">
                 أنت تستخدم التطبيق داخل نافذة فرعية. قد لا تعمل أزرار Google والدخول السريع بشكل صحيح في هذا الوضع.
               </p>
               <GlassButton 
                 variant="primary" 
                 onClick={openInNewWindow}
                 className="w-full bg-amber-500 text-white border-none py-3 text-xs tracking-widest font-black shadow-lg shadow-amber-500/20"
               >
                 فتح التطبيق في نافذة مستقلة 🚀
               </GlassButton>
            </motion.div>
          )}

          <div className="text-center mb-10">
            <div className="w-24 h-24 mx-auto flex items-center justify-center mb-2 overflow-hidden p-1">
                <img 
                  src="/logo-light.png" 
                  alt="TKA Logo" 
                  className="w-full h-full object-contain filter drop-shadow-lg dark:hidden"
                  referrerPolicy="no-referrer"
                  loading="eager"
                />
                <img 
                  src="/logo-dark.png" 
                  alt="TKA Logo Dark" 
                  className="w-full h-full object-contain filter drop-shadow-lg hidden dark:block"
                  referrerPolicy="no-referrer"
                  loading="eager"
                />
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs sm:text-sm">{language === 'ar' ? 'اشحذ معرفتك' : 'Sharpen your Knowledge'}</p>
          </div>

          <GlassCard className="p-0 overflow-hidden transition-all duration-500" neon shadow-xl>
              {isInIframe && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-900/40 p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 text-[10px] font-bold font-sans">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                    المتصفح قد يمنع تسجيل الدخول داخل الإطار:
                  </div>
                  <button 
                    onClick={() => window.open(window.location.href, '_blank')}
                    className="bg-primary text-white text-[10px] px-3 py-1.5 rounded-lg font-black uppercase hover:opacity-90 transition-all shadow-sm"
                  >
                    الفتح في نافذة مستقلة
                  </button>
                </div>
              )}

            <div className="p-8">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{t('login')}</h1>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 font-sans mb-4">{language === 'ar' ? 'TKA مصر - الأكاديمية' : 'TKA Egypt - Academy'}</p>
                  
                  {/* Developer Quick Access */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800 mb-4">
                    <p className="text-[10px] text-blue-700 dark:text-blue-300 font-bold mb-2">{language === 'ar' ? 'تسجيل دخول سريع للمعاينة:' : 'Quick preview login:'}</p>
                    <button 
                      type="button"
                      onClick={handleCreateTrial}
                      className="w-full bg-blue-600 text-white text-xs py-2 rounded-lg font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                      <UserPlus size={14} /> {language === 'ar' ? 'دخول كمستخدم تجريبي' : 'Login as Trial User'}
                    </button>
                  </div>
                </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-5 bg-red-50 border-2 border-red-200 rounded-2xl flex flex-col gap-4 text-red-600 shadow-lg shadow-red-500/10"
                >
                  <div className="flex items-start gap-3 text-sm">
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-base">خطأ في الدخول</p>
                      <p className="opacity-90">{error}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/50 p-4 rounded-xl border border-red-100">
                    <button 
                      onClick={() => window.open(window.location.href, '_blank')}
                      className="w-full text-sm font-bold bg-[#001d4a] text-white rounded-xl py-3 shadow-md hover:bg-black transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
                    >
                      <ExternalLink size={16} /> فتح في نافذة مستقلة (حل نهائي)
                    </button>
                  </div>
                </motion.div>
              )}

              {success && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3 text-green-600 text-sm"
                >
                  <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                  <p className="font-medium">{success}</p>
                </motion.div>
              )}

              <div className="space-y-6">
                {/* Social Login */}
                <button 
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm group active:scale-95 font-sans"
                >
                  <Chrome size={20} className="text-primary group-hover:rotate-12 transition-transform" />
                  {language === 'ar' ? 'الدخول بواسطة جوجل' : 'Sign in with Google'}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">أو</span>
                  </div>
                </div>

                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 pr-1">{language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 dark:text-white"
                        placeholder="name@example.com"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 pr-1">{language === 'ar' ? 'كلمة المرور' : 'Password'}</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 dark:text-white"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <GlassButton 
                    type="submit"
                    variant="primary"
                    className="w-full py-4 text-base font-bold shadow-lg shadow-primary/20 rounded-xl"
                    disabled={loading}
                  >
                    {loading ? (language === 'ar' ? 'جاري التحقق...' : 'Verifying...') : (language === 'ar' ? 'تسجيل الدخول' : 'Sign In')} <ChevronRight className="w-5 h-5 ml-1 rtl:rotate-180" />
                  </GlassButton>

                  <button 
                    type="button"
                    onClick={handleCreateTrial}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-4 px-4 border-2 border-dashed border-gold text-gold-dark dark:text-gold rounded-xl font-black bg-gold/5 hover:bg-gold/10 transition-all font-sans shiny-btn uppercase"
                  >
                    <UserPlus size={20} />
                    {language === 'ar' ? 'إنشاء مستخدم تجريبي مجاني' : 'Create Free Trial User'}
                  </button>
                </form>

                <div className="relative pt-2">
                  <div className="text-center">
                    <button 
                      type="button"
                      onClick={() => setShowStudentCode(!showStudentCode)}
                      className="text-slate-500 dark:text-slate-400 font-bold text-xs hover:text-primary dark:hover:text-primary-light transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                      <Hash size={14} /> {showStudentCode ? (language === 'ar' ? 'إخفاء دخول الرمز' : 'Hide Code Login') : (language === 'ar' ? 'هل لديك كود طالب؟ اضغط هنا' : 'Have a Student Code? Click Here')}
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {showStudentCode && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <form onSubmit={handleStudentLogin} className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                          <input
                            type="text"
                            required
                            value={studentCode}
                            onChange={(e) => setStudentCode(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-lg py-2.5 px-4 text-sm font-mono focus:ring-2 focus:ring-gold/20 outline-none"
                            placeholder="Student Code (e.g. TRIAL-1234)"
                          />
                          <input
                            type="password"
                            required
                            value={studentPassword}
                            onChange={(e) => setStudentPassword(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-gold/20 outline-none"
                            placeholder="Password"
                          />
                          <button 
                            type="submit"
                            className="w-full bg-gold text-[#001d4a] font-bold py-2.5 rounded-lg hover:bg-gold-dark transition-all text-sm"
                          >
                            {language === 'ar' ? 'دخول الطلاب المشتركين' : 'Student Login'}
                          </button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-6 border-t border-slate-200 dark:border-slate-800 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-sans underline decoration-gold/30">{language === 'ar' ? 'ليس لديك حساب بعد؟' : 'Don\'t have an account?'}</p>
              <a href="/register" className="text-primary font-bold hover:underline mt-1 inline-block font-sans">{language === 'ar' ? 'تواصل مع مكتب القبول والتسجيل' : 'Contact Admissions Office'}</a>
            </div>
          </GlassCard>

          {/* Home Link */}
          <div className="text-center mt-8">
              <GlassButton 
                onClick={() => navigate('/')}
                variant="primary"
                className="mx-auto px-10"
              >
                <ArrowRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                {t('home') || 'العودة للرئيسية'}
              </GlassButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Helper icon
function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
