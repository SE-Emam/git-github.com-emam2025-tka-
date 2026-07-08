import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/src/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { GlassCard, GlassButton } from '@/src/components/common/Layout';
import { 
  User, 
  Briefcase,
  Users,
  GraduationCap, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
} from 'lucide-react';
import { useLanguage } from '@/src/context/LanguageContext';

type RegistrationRole = 'student' | 'trainer' | 'staff' | 'guardian' | null;

interface RegisterProps {
  defaultRole?: RegistrationRole;
}

export default function Register({ defaultRole }: RegisterProps) {
  const { t, language, isRtl: isAr } = useLanguage();
  const [step, setStep] = React.useState(defaultRole ? 2 : 1);
  const [role, setRole] = React.useState<RegistrationRole>(defaultRole || null);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  // Reset if defaultRole changes (e.g. navigation)
  React.useEffect(() => {
    if (defaultRole) {
      setRole(defaultRole);
      setStep(2);
    } else {
      setStep(1);
      setRole(null);
    }
  }, [defaultRole]);

  // Form Data
  const [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    country: 'EG',
    address: '',
    phoneCode: '+20',
    phone: '',
    whatsappCode: '+20',
    whatsapp: '',
    dob: '',
    purpose: '',
    
    // For Trainer/Staff
    specialization: '',
    experienceLevel: 'beginner', // beginner | experienced

    // For Guardian
    studentName: '',
    studentCode: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Generate a unique registration ID
      const regId = Date.now().toString();
      
      // Save data as pending in Firestore
      await setDoc(doc(db, 'registrations', regId), {
        ...formData,
        role,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      
      setStep(3);
    } catch (error: any) {
      console.error("Registration Error:", error?.message || error);
      alert("حدث خطأ أثناء إرسال طلبك. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden max-w-[100vw]">
      <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-secondary/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 mx-auto mt-8 sm:mt-0">
        <div className="text-center mb-8 relative">
          <button 
            onClick={() => navigate('/')} 
            className="sm:absolute right-0 sm:top-1/2 sm:-translate-y-1/2 mb-4 sm:mb-0 text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors font-bold mx-auto sm:mx-0 w-fit text-sm"
          >
            <ChevronRight size={18} className="rtl:rotate-180" /> {t('registerBackHome')}
          </button>
          
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
             {step === 1 ? (isAr ? 'بوابة التسجيل' : 'Registration Portal') : 
              role === 'student' ? t('registerEnrollmentTitle') : 
              role === 'trainer' ? t('registerTrainerTitle') : 
              t('registerCommunityTitle')}
          </h1>
          <p className="text-slate-500 font-bold text-sm">
             {step === 1 ? (isAr ? 'انضم إلى عائلة TKA-Egypt وابدأ رحلتك التعليمية' : 'Join TKA-Egypt family and start your learning journey') :
              role === 'student' ? t('registerEnrollmentDesc') :
              role === 'trainer' ? t('registerTrainerDesc') :
              t('registerCommunityDesc')}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <GlassCard 
                hover 
                neon
                variant="primary"
                onClick={() => { setRole('student'); setStep(2); }} 
                className="p-8 text-center cursor-pointer border-primary/20 bg-primary/5 hover:bg-primary/10 group transition-all"
              >
                <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <GraduationCap size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{t('regRoleStudent')}</h3>
                <p className="text-slate-500 text-sm font-bold">{isAr ? 'للطلاب الجدد الراغبين في الانضمام للمسارات التدريبية والمنح' : 'For new students wishing to join training tracks and scholarships'}</p>
              </GlassCard>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'trainer', title: t('regRoleTrainer'), icon: Briefcase, variant: 'primary' },
                  { id: 'guardian', title: t('regRoleGuardian'), icon: User, variant: 'gold' },
                  { id: 'staff', title: t('regRoleStaff'), icon: Users, variant: 'secondary' },
                ].map((r) => (
                  <GlassCard 
                    key={r.id} 
                    hover 
                    neon
                    variant={r.variant as any}
                    onClick={() => { setRole(r.id as RegistrationRole); setStep(2); }} 
                    className="p-6 text-center cursor-pointer bg-white/50 dark:bg-slate-900/50"
                  >
                    <r.icon className="mx-auto mb-3 text-slate-400 group-hover:text-primary transition-colors" size={24} />
                    <h3 className="font-bold text-xs text-slate-700 dark:text-slate-300">{r.title}</h3>
                  </GlassCard>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <GlassCard className="p-4 sm:p-8 shadow-xl border-t-4 border-t-primary">
                {!defaultRole && (
                    <button onClick={() => setStep(1)} className="mb-6 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-600 dark:text-slate-300 flex items-center gap-1 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors w-fit relative z-20"><ChevronRight size={16}/> {t('regBackToRoles')}</button>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-500 dark:text-slate-300">{t('regLabelFullName')} <span className="text-red-500">*</span></label>
                       <input name="fullName" placeholder={t('regPlaceholderFullName')} required onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold dark:text-white" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <label className="text-xs font-bold text-slate-500 dark:text-slate-300">{t('regLabelCountry')} <span className="text-red-500">*</span></label>
                         <select name="country" value={formData.country} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold cursor-pointer dark:text-white">
                           <option value="EG">مصر (Egypt)</option>
                           <option value="SA">السعودية (Saudi Arabia)</option>
                           <option value="AE">الإمارات (UAE)</option>
                           <option value="KW">الكويت (Kuwait)</option>
                           <option value="QA">قطر (Qatar)</option>
                           <option value="OM">عُمان (Oman)</option>
                           <option value="BH">البحرين (Bahrain)</option>
                           <option value="JO">الأردن (Jordan)</option>
                           <option value="Other">أخرى (Other)</option>
                         </select>
                      </div>
                      <div className="space-y-1">
                         <label className="text-xs font-bold text-slate-500 dark:text-slate-300">{t('regLabelAddress')} <span className="text-red-500">*</span></label>
                         <input name="address" placeholder={t('regPlaceholderAddress')} required onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold dark:text-white" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <label className="text-xs font-bold text-slate-500 dark:text-slate-300">{t('regLabelPhone')} <span className="text-red-500">*</span></label>
                         <div className="flex bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                            <input name="phone" dir="ltr" placeholder="10XXXXXX" required onChange={handleChange} className="w-full p-3 bg-transparent border-none focus:outline-none font-bold text-left dark:text-white" />
                            <select name="phoneCode" value={formData.phoneCode} onChange={handleChange} dir="ltr" className="bg-slate-100 dark:bg-slate-800 border-l dark:border-slate-700 px-2 font-bold cursor-pointer outline-none dark:text-white">
                              <option value="+20">+20</option>
                              <option value="+966">+966</option>
                              <option value="+971">+971</option>
                              <option value="+965">+965</option>
                              <option value="+974">+974</option>
                              <option value="+968">+968</option>
                              <option value="+973">+973</option>
                              <option value="+962">+962</option>
                            </select>
                         </div>
                      </div>
                      <div className="space-y-1">
                         <label className="text-xs font-bold text-slate-500 dark:text-slate-300">{t('regLabelWhatsapp')} <span className="text-red-500">*</span></label>
                         <div className="flex bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                            <input name="whatsapp" dir="ltr" placeholder="10XXXXXX" required onChange={handleChange} className="w-full p-3 bg-transparent border-none focus:outline-none font-bold text-left dark:text-white" />
                            <select name="whatsappCode" value={formData.whatsappCode} onChange={handleChange} dir="ltr" className="bg-slate-100 dark:bg-slate-800 border-l dark:border-slate-700 px-2 font-bold cursor-pointer outline-none dark:text-white">
                              <option value="+20">+20</option>
                              <option value="+966">+966</option>
                              <option value="+971">+971</option>
                              <option value="+965">+965</option>
                              <option value="+974">+974</option>
                              <option value="+968">+968</option>
                              <option value="+973">+973</option>
                              <option value="+962">+962</option>
                            </select>
                         </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-500 dark:text-slate-300">{t('regLabelEmailLogin')} <span className="text-red-500">*</span></label>
                       <input type="email" dir="ltr" name="email" placeholder="example@gmail.com" required onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold text-left dark:text-white" />
                    </div>

                    <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-500 dark:text-slate-300">{t('regLabelDOB')} <span className="text-red-500">*</span></label>
                       <input type="date" name="dob" required onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold text-left dark:text-white [&::-webkit-calendar-picker-indicator]:dark:invert" />
                    </div>
                  </div>
                  
                  {role === 'guardian' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-primary">{t('regLabelStudentName')} <span className="text-red-500">*</span></label>
                            <input name="studentName" required onChange={handleChange} className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 font-bold dark:text-white" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-primary">{t('regLabelStudentCode')} <span className="text-red-500">*</span></label>
                            <input name="studentCode" dir="ltr" required onChange={handleChange} className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 font-bold text-left dark:text-white" />
                        </div>
                    </div>
                  ) : (role === 'trainer' || role === 'staff') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-secondary/5 rounded-xl border border-secondary/10">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-secondary">{t('regLabelSpecialization')} <span className="text-red-500">*</span></label>
                            <input name="specialization" placeholder={t('regPlaceholderSpecialization')} required onChange={handleChange} className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-secondary/20 font-bold dark:text-white" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-secondary">{t('regLabelExpLevel')} <span className="text-red-500">*</span></label>
                            <select name="experienceLevel" onChange={handleChange} className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-secondary/20 font-bold dark:text-white">
                                <option value="beginner">{t('regExpBeginner')}</option>
                                <option value="middle">{t('regExpMid')}</option>
                                <option value="experienced">{t('regExpExpert')}</option>
                            </select>
                        </div>
                    </div>
                  )}

                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 dark:text-slate-300">
                        {role === 'student' ? t('regLabelStudentPurpose') : t('regLabelStaffPurpose')} <span className="text-red-500">*</span>
                     </label>
                     <textarea name="purpose" required onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl p-3 h-24 focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold resize-none dark:text-white" />
                  </div>

                  <GlassButton type="submit" variant="primary" className="w-full py-5 text-lg font-bold bg-primary text-white shadow-xl shadow-primary/20" disabled={loading}>
                    {loading ? t('regSending') : t('confirmAndSubmit')} <ChevronLeft className="mr-2" size={20} />
                  </GlassButton>
                </form>
              </GlassCard>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-12 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
              <CheckCircle2 className="mx-auto mb-6 text-green-500" size={80} />
              <h2 className="text-3xl font-display font-black text-slate-900 dark:text-white mb-4">{t('regSuccessTitle')}</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-8 font-bold text-lg leading-relaxed">
                 {t('regSuccessDesc')}
              </p>
              <GlassButton onClick={() => navigate('/')} variant="secondary" className="px-10 py-4 font-bold">{t('registerBackHome')}</GlassButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}