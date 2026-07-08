import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard, GlassButton, Navbar } from '@/src/components/common/Layout';
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Building2, 
  Search, 
  Code2, 
  Settings, 
  Target, 
  Truck, 
  Cpu, 
  DollarSign, 
  FileText,
  Mail,
  Phone,
  Globe,
  Briefcase,
  Users,
  Clock,
  MessageSquare,
  BadgeCheck,
  Send,
  Info
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useLanguage } from '@/src/context/LanguageContext';
import { db } from '@/src/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { submitTrainingRequestToSQL } from '@/src/services/hybridApiService';

export default function TrainingRequest() {
  const { isRtl, t } = useLanguage();
  const [step, setStep] = React.useState(1);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const [formData, setFormData] = React.useState({
    // Section 1: Identity
    applicantType: '',
    fullName: '',
    email: '',
    phone: '',
    jobTitle: '',
    careerLevel: '',
    location: '',
    companyName: '',
    contactPerson: '',
    contactRole: '',
    companyWebsite: '',
    targetEmployeeCount: '',
    referralSource: '',
    otherReferral: '',

    // Section 2: Training Type
    trainingFields: [] as string[],
    otherTech: '',
    otherAdmin: '',
    trainingLevel: '',
    targetAudience: [] as string[],
    otherAudience: '',

    // Section 3: Goals
    primaryGoal: '',
    otherGoal: '',
    specificSkills: '',
    successMeasurement: [] as string[],
    otherMeasurement: '',
    challenges: '',

    // Section 4: Logistics
    trainingMethod: '',
    preferredLanguage: '',
    otherLanguage: '',
    duration: '',
    timing: '',
    totalHours: '',

    // Section 5: Technical
    techPrerequisites: '',
    otherPrerequisites: '',
    customContent: '',
    preferredMaterials: [] as string[],
    certificateNeeded: '',

    // Section 6: Follow-up
    evaluationType: [] as string[],
    postTrainingSupport: [] as string[],
    otherSupport: '',
    isRecurring: '',

    // Section 7: Budget
    budgetRange: '',
    paymentMethod: '',
    budgetIncludes: [] as string[],
    otherBudgetInclude: '',

    // Section 8: Main Contact
    mainContactName: '',
    mainContactRole: '',
    mainContactEmail: '',
    mainContactPhone: '',
    internalTeam: '',
    otherInternalTeam: '',
    preferredCommunication: [] as string[],
    startDate: '',
    otherstartDate: '',
    isCompetingOffers: '',
    specialNotes: '',

    // Section 9: Consent
    consentPrivacy: false,
    consentFollowUp: false,
    consentAccuracy: false,
    consentAuthority: false,
  });

  const totalSteps = 9;

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: string, value: string) => {
    setFormData(prev => {
      const current = (prev as any)[field] as string[];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // We attempt submission to both Firestore (Realtime/Backup) and SQL (Official Hosting API)
    try {
      // 1. Submit to Firestore
      const firestoreJob = addDoc(collection(db, 'training_requests'), {
        ...formData,
        submittedAt: serverTimestamp(),
        status: 'pending'
      });

      // 2. Submit to Hostinger SQL API
      const sqlJob = submitTrainingRequestToSQL({
        ...formData,
        status: 'pending'
      });

      // Execute both
      await Promise.allSettled([firestoreJob, sqlJob]);

      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="pt-32 pb-20 px-4 max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-12 bg-white dark:bg-slate-900 shadow-2xl rounded-[40px] border-2 border-green-100 dark:border-green-900/30"
          >
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-tight">{t('trainingSuccessTitle')}</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 leading-relaxed">
              {t('trainingSuccessDesc')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-right mb-10">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="font-bold text-slate-800 dark:text-white mb-1">{t('trainingSuccessAnalysis')}</p>
                <p className="text-xs text-slate-500">{t('trainingSuccessAnalysisDesc')}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="font-bold text-slate-800 dark:text-white mb-1">{t('trainingSuccessDesign')}</p>
                <p className="text-xs text-slate-500">{t('trainingSuccessDesignDesc')}</p>
              </div>
            </div>
            <GlassButton variant="primary" onClick={() => window.location.href = '/'} className="px-12 py-4 rounded-2xl uppercase tracking-widest font-black">{t('registerBackHome')}</GlassButton>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4"
            >
              {t('trainingRequestSubtitle')}
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight uppercase tracking-tighter">
              {t('trainingRequestTitle')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
              {t('trainingRequestDesc')}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('trainingStep')} {step} {t('trainingOf')} {totalSteps}</span>
              <span className="text-[10px] font-black uppercase text-primary tracking-widest">{Math.round((step / totalSteps) * 100)}% {t('trainingCompleted')}</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="relative">
            <AnimatePresence mode="wait">
              {/* Step 1: Type & Contact */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
                  className="space-y-8"
                >
                  <GlassCard className="border-none shadow-2xl rounded-[40px] p-8 md:p-12">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><User size={20} /></div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">القسم 1: نوع المتقدم وطريقة التواصل</h2>
                    </div>

                    <div className="space-y-6">
                      <label className="block text-sm font-black text-slate-700 dark:text-slate-200 mb-2 uppercase tracking-wide">أنت تتقدم بطلب التدريب بصفتك: *</label>
                      <div className="grid grid-cols-1 gap-3">
                        {[
                          { id: 'individual', label: 'فرد يبحث عن تطوير مهاراته الشخصية' },
                          { id: 'company_small', label: 'ممثل شركة/مؤسسة صغيرة (أقل من 50 موظف)' },
                          { id: 'company_medium', label: 'ممثل مؤسسة/شركة متوسطة (50-250 موظف)' },
                          { id: 'company_large', label: 'ممثل مؤسسة كبيرة/حكومية/تعليمية (250+ موظف)' },
                          { id: 'academic', label: 'جهة تعليمية أو أكاديمية (جامعة، معهد، مركز تدريب)' }
                        ].map(opt => (
                          <label key={opt.id} className={cn(
                            "flex items-center gap-4 p-5 rounded-3xl border-2 transition-all cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-800/50",
                            formData.applicantType === opt.id ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" : "border-slate-100 dark:border-slate-800"
                          )}>
                            <input 
                              type="radio" 
                              name="applicantType" 
                              value={opt.id} 
                              checked={formData.applicantType === opt.id}
                              onChange={(e) => updateFormData('applicantType', e.target.value)}
                              className="w-5 h-5 text-primary border-slate-300 focus:ring-primary"
                              required
                            />
                            <span className="font-bold text-slate-800 dark:text-slate-200">{opt.label}</span>
                          </label>
                        ))}
                      </div>

                      {formData.applicantType && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="pt-8 space-y-6 border-t border-slate-100 dark:border-slate-800"
                        >
                          <h3 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-widest">{t('trainingBasicInfo')}</h3>
                          
                          <div className="grid md:grid-cols-2 gap-6">
                            {formData.applicantType === 'individual' ? (
                              <>
                                <Input label={t('trainingFullName')} required value={formData.fullName} onChange={(val) => updateFormData('fullName', val)} placeholder={isRtl ? "اسمك الثلاثي" : "Your full name"} />
                                <Input label={t('trainingEmail')} type="email" required value={formData.email} onChange={(val) => updateFormData('email', val)} placeholder="example@mail.com" />
                                <Input label={t('trainingPhoneWhatsapp')} type="tel" required value={formData.phone} onChange={(val) => updateFormData('phone', val)} placeholder="01XXXXXXXXX" />
                                <Input label={t('trainingJobTitle')} value={formData.jobTitle} onChange={(val) => updateFormData('jobTitle', val)} placeholder={isRtl ? "مثلاً: مبرمج جونيور، طالب" : "e.g. Junior Developer, Student"} />
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('trainingCareerLevel')}</label>
                                  <select value={formData.careerLevel} onChange={(e) => updateFormData('careerLevel', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold">
                                    <option value="">{isRtl ? 'اختر المستوى' : 'Select Level'}</option>
                                    <option value="beginner">{isRtl ? 'مبتدئ' : 'Beginner'}</option>
                                    <option value="intermediate">{isRtl ? 'متوسط' : 'Intermediate'}</option>
                                    <option value="advanced">{isRtl ? 'متقدم' : 'Advanced'}</option>
                                    <option value="expert">{isRtl ? 'خبير' : 'Expert'}</option>
                                  </select>
                                </div>
                                <Input label={t('trainingLocation')} value={formData.location} onChange={(val) => updateFormData('location', val)} placeholder={isRtl ? "مثلاً: مصر، القاهرة" : "e.g. Egypt, Cairo"} />
                              </>
                            ) : (
                              <>
                                <Input label={t('trainingCompanyName')} required value={formData.companyName} onChange={(val) => updateFormData('companyName', val)} placeholder={isRtl ? "اسم الكيان الرسمي" : "Official Entity Name"} />
                                <Input label={t('trainingContactPerson')} required value={formData.contactPerson} onChange={(val) => updateFormData('contactPerson', val)} placeholder={isRtl ? "الاسم الكامل" : "Full Name"} />
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('trainingContactRole')}</label>
                                  <select value={formData.contactRole} onChange={(e) => updateFormData('contactRole', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold">
                                    <option value="">{isRtl ? 'اختر المنصب' : 'Select Role'}</option>
                                    <option value="hr_manager">{isRtl ? 'مدير موارد بشرية' : 'HR Manager'}</option>
                                    <option value="training_manager">{isRtl ? 'مدير تدريب' : 'Training Manager'}</option>
                                    <option value="cto">{isRtl ? 'مدير تقني' : 'CTO'}</option>
                                    <option value="ceo">{isRtl ? 'CEO/مدير عام' : 'CEO/General Manager'}</option>
                                    <option value="other">{isRtl ? 'أخرى' : 'Other'}</option>
                                  </select>
                                </div>
                                <Input label={t('trainingCorporateEmail')} type="email" required value={formData.email} onChange={(val) => updateFormData('email', val)} placeholder="corporate@company.com" />
                                <Input label={t('trainingPhoneWhatsapp')} type="tel" required value={formData.phone} onChange={(val) => updateFormData('phone', val)} placeholder="01XXXXXXXXX" />
                                <Input label={t('companyWebsite')} type="url" value={formData.companyWebsite} onChange={(val) => updateFormData('companyWebsite', val)} placeholder="https://company.com" />
                                <Input label={t('trainingTargetCount')} type="number" value={formData.targetEmployeeCount} onChange={(val) => updateFormData('targetEmployeeCount', val)} placeholder={isRtl ? "مثلاً: 15" : "e.g. 15"} />
                                <Input label={t('trainingLocation')} value={formData.location} onChange={(val) => updateFormData('location', val)} placeholder={isRtl ? "الدولة والمدينة" : "Country and City"} />
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}

                      <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                        <label className="block text-sm font-black text-slate-700 dark:text-slate-200 mb-4 uppercase tracking-wide">{t('trainingReferralSource')}</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[
                            { id: 'search', label: isRtl ? 'محرك بحث (جوجل، بينج)' : 'Search Engine (Google, Bing)' },
                            { id: 'social', label: isRtl ? 'وسائل التواصل الاجتماعي' : 'Social Media' },
                            { id: 'recommendation', label: isRtl ? 'توصية من زميل/شركة' : 'Recommendation from colleague/company' },
                            { id: 'previous_course', label: isRtl ? 'حضور دورة سابقة لنا' : 'Previous course with us' },
                            { id: 'event', label: isRtl ? 'معرض/مؤتمر/فعالية' : 'Event/Conference' },
                            { id: 'ads', label: isRtl ? 'إعلان ممول' : 'Sponsored Ads' },
                            { id: 'other', label: isRtl ? 'أخرى (اذكرها)' : 'Other (Please specify)' }
                          ].map(opt => (
                            <label key={opt.id} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                              <input 
                                type="radio" 
                                name="referralSource" 
                                value={opt.id} 
                                checked={formData.referralSource === opt.id}
                                onChange={(e) => updateFormData('referralSource', e.target.value)}
                                className="w-4 h-4 text-primary"
                              />
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                        {formData.referralSource === 'other' && (
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-4">
                            <Input label={isRtl ? "المصدر الآخر" : "Other Source"} value={formData.otherReferral} onChange={(val) => updateFormData('otherReferral', val)} placeholder={isRtl ? "من فضلك اذكر المصدر" : "Please specify source"} />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* Step 2: Training Category */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
                  className="space-y-8"
                >
                  <GlassCard className="border-none shadow-2xl rounded-[40px] p-8 md:p-12">
                     <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary"><Code2 size={20} /></div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{isRtl ? 'القسم 2: نوع التدريب المطلوب' : 'Section 2: Required Training Type'}</h2>
                    </div>

                    <div className="space-y-8">
                       <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">ما هو المجال الرئيسي للتدريب؟ * (يمكن اختيار أكثر من واحد)</p>
                       
                       <div className="space-y-6">
                          <h3 className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-[0.2em]"><Cpu size={14}/> التدريب التقني والبرمجي</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                             {[
                               'تطوير الويب (Frontend: HTML, CSS, React)',
                               'تطوير الويب (Backend: Node.js, Python, PHP)',
                               'تطوير تطبيقات الجوال (Flutter, Swift)',
                               'قواعد البيانات (SQL, MongoDB, Firebase)',
                               'الذكاء الاصطناعي وتعلم الآلة (AI/ML)',
                               'تحليل وعلوم البيانات (Data Science, Power BI)',
                               'الأمن السيبراني وحماية المعلومات',
                               'الحوسبة السحابية (AWS, Azure, GCP)',
                               'DevOps وأدوات النشر المستمر',
                               'اختبار البرمجيات وضمان الجودة (QA)',
                               'إدارة المنتجات الرقمية (Product)',
                               'أخرى تقنية'
                             ].map(opt => (
                               <Checkbox key={opt} label={opt} checked={formData.trainingFields.includes(opt)} onChange={() => toggleArrayField('trainingFields', opt)} />
                             ))}
                          </div>
                          {formData.trainingFields.includes('أخرى تقنية') && (
                            <Input label="المجالات التقنية الأخرى" value={formData.otherTech} onChange={(val) => updateFormData('otherTech', val)} placeholder="صف المجالات المطلوبة" />
                          )}
                       </div>

                        <div className="space-y-6 pt-8 border-t border-slate-100 dark:border-slate-800">
                          <h3 className="flex items-center gap-2 text-secondary font-black uppercase text-xs tracking-[0.2em]"><Settings size={14}/> التدريب الإداري والمهني</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                             {[
                               'القيادة وإدارة الفرق (Leadership)',
                               'إدارة المشاريع (PMP, Agile, Scrum)',
                               'التواصل الفعال والعرض التقديمي',
                               'التفكير الاستراتيجي واتخاذ القرار',
                               'إدارة الوقت والإنتاجية الشخصية',
                               'الموارد البشرية وإدارة المواهب',
                               'المبيعات والتسويق الحديث',
                               'خدمة العملاء وتجربة المستخدم',
                               'ريادة الأعمال وتطوير المشاريع الناشئة',
                               'التحول الرقمي وإدارة التغيير',
                               'أخرى إدارية'
                             ].map(opt => (
                               <Checkbox key={opt} label={opt} checked={formData.trainingFields.includes(opt)} onChange={() => toggleArrayField('trainingFields', opt)} />
                             ))}
                          </div>
                          {formData.trainingFields.includes('أخرى إدارية') && (
                            <Input label="المجالات الإدارية الأخرى" value={formData.otherAdmin} onChange={(val) => updateFormData('otherAdmin', val)} placeholder="صف المجالات المطلوبة" />
                          )}
                       </div>

                       <div className="space-y-6 pt-8 border-t border-slate-100 dark:border-slate-800">
                          <h3 className="flex items-center gap-2 text-amber-500 font-black uppercase text-xs tracking-[0.2em]"><Target size={14}/> {t('trainingCustomTraining')}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                             {[
                               'برنامج تدريبي مخصص حسب احتياجاتنا',
                               'مزيج من تقني وإداري (Tech + Management)',
                               'استشارة تدريبية أولاً لتحديد الاحتياجات',
                               'لا أعرف بالضبط - أحتاج مساعدة في التحديد'
                             ].map(opt => (
                               <Checkbox key={opt} label={opt} checked={formData.trainingFields.includes(opt)} onChange={() => toggleArrayField('trainingFields', opt)} />
                             ))}
                          </div>
                       </div>

                       <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                          <label className="block text-sm font-black text-slate-700 dark:text-slate-200 mb-4 uppercase tracking-wide">{t('trainingLevelLabel')}</label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {[
                              { id: 'beginner', label: 'تمهيدي/مبتدئ' },
                              { id: 'intermediate', label: 'متوسط' },
                              { id: 'advanced', label: 'متقدم/محترف' },
                              { id: 'leadership', label: 'مستوى قيادي' },
                              { id: 'multi', label: 'مستويات متعددة' }
                            ].map(opt => (
                              <label key={opt.id} className={cn(
                                "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-800/50",
                                formData.trainingLevel === opt.id ? "border-primary bg-primary/5" : "border-slate-100 dark:border-slate-800"
                              )}>
                                <input 
                                  type="radio" 
                                  name="trainingLevel" 
                                  value={opt.id} 
                                  checked={formData.trainingLevel === opt.id}
                                  onChange={(e) => updateFormData('trainingLevel', e.target.value)}
                                  className="w-4 h-4 text-primary"
                                />
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{opt.label}</span>
                              </label>
                            ))}
                          </div>
                       </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* Step 3: Goals */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
                  className="space-y-8"
                >
                  <GlassCard className="border-none shadow-2xl rounded-[40px] p-8 md:p-12">
                     <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600"><Target size={20} /></div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('trainingSectionGoals')}</h2>
                    </div>

                    <div className="space-y-8">
                       <div>
                          <label className="block text-sm font-black text-slate-700 dark:text-slate-200 mb-4 uppercase tracking-wide">{t('trainingMainGoalLabel')}</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                               { id: 'gap', label: t('trainingGoalGap') },
                               { id: 'efficiency', label: t('trainingGoalEfficiency') },
                               { id: 'promotion', label: t('trainingGoalPromotion') },
                               { id: 'agile', label: t('trainingGoalAgile') },
                               { id: 'productivity', label: t('trainingGoalProductivity') },
                               { id: 'localization', label: t('trainingGoalLocalization') },
                               { id: 'certification', label: t('trainingGoalCertification') },
                               { id: 'other', label: t('trainingOther') }
                            ].map(opt => (
                              <label key={opt.id} className={cn(
                                "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-800/50",
                                formData.primaryGoal === opt.label ? "border-primary bg-primary/5" : "border-slate-100 dark:border-slate-800"
                              )}>
                                <input 
                                  type="radio" 
                                  name="primaryGoal" 
                                  value={opt.label} 
                                  checked={formData.primaryGoal === opt.label}
                                  onChange={(e) => updateFormData('primaryGoal', e.target.value)}
                                  className="w-4 h-4 text-primary"
                                />
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{opt.label}</span>
                              </label>
                            ))}
                          </div>
                          {formData.primaryGoal === t('trainingOther') && (
                            <div className="mt-4">
                               <Input label={t('trainingOtherGoalLabel')} value={formData.otherGoal} onChange={(val) => updateFormData('otherGoal', val)} />
                            </div>
                          )}
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('trainingExpectedOutcomes')}</label>
                          <textarea 
                            required 
                            value={formData.specificSkills} 
                            onChange={(e) => updateFormData('specificSkills', e.target.value)}
                            className="w-full h-32 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-slate-700 dark:text-slate-300 resize-none"
                            placeholder={t('trainingExpectedOutcomesPlaceholder')}
                          />
                       </div>

                       <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                          <label className="block text-sm font-black text-slate-700 dark:text-slate-200 mb-4 uppercase tracking-wide">{t('trainingSuccessMeasureLabel')}</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                             {[
                                { id: 'prepost', label: t('trainingSuccessPrePost') },
                                { id: 'project', label: t('trainingSuccessProject') },
                                { id: 'kpi', label: t('trainingSuccessKPI') },
                                { id: 'feedback', label: t('trainingSuccessFeedback') },
                                { id: 'cert', label: t('trainingSuccessCert') },
                                { id: 'workplace', label: t('trainingSuccessWorkplace') },
                                { id: 'other', label: t('trainingOther') }
                             ].map(opt => (
                               <Checkbox key={opt.id} label={opt.label} checked={formData.successMeasurement.includes(opt.label)} onChange={() => toggleArrayField('successMeasurement', opt.label)} />
                             ))}
                          </div>
                       </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* Step 4: Logistics */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
                  className="space-y-8"
                >
                  <GlassCard className="border-none shadow-2xl rounded-[40px] p-8 md:p-12">
                     <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-100 flex items-center justify-center text-cyan-600"><Truck size={20} /></div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">القسم 4: التفاصيل اللوجستية والتفضيلات</h2>
                    </div>

                    <div className="space-y-8">
                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-6">
                             <label className="block text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">طريقة التدريب المفضلة:</label>
                             <div className="space-y-3">
                                {[
                                  'تدريب مباشر وجهاً لوجه',
                                  'تدريب أونلاين مباشر (Live Online)',
                                  'نموذج هجين (مزيج من حضوري وأونلاين)',
                                  'تدريب ذاتي مسجل مع دعم المدرب',
                                  'لا تفضيل - نختار الأنسب'
                                ].map(opt => (
                                  <Radio key={opt} name="trainingMethod" label={opt} value={opt} checked={formData.trainingMethod === opt} onChange={(val) => updateFormData('trainingMethod', val)} />
                                ))}
                             </div>
                          </div>
                          <div className="space-y-6">
                             <label className="block text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">اللغة المفضلة للتدريب:</label>
                             <div className="space-y-3">
                                {[
                                  'العربية الفصحى',
                                  'الإنجليزية',
                                  'مزيج من العربية والإنجليزية',
                                  'لغة أخرى'
                                ].map(opt => (
                                  <Radio key={opt} name="preferredLanguage" label={opt} value={opt} checked={formData.preferredLanguage === opt} onChange={(val) => updateFormData('preferredLanguage', val)} />
                                ))}
                             </div>
                          </div>
                       </div>

                       <div className="grid md:grid-cols-3 gap-6 pt-8 border-t border-slate-100 dark:border-slate-800">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">المدة الزمنية المفضلة</label>
                              <select value={formData.duration} onChange={(e) => updateFormData('duration', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 outline-none font-bold">
                                 <option value="">اختر المدة</option>
                                 <option value="short">مكثف قصير (1-3 أيام)</option>
                                 <option value="medium">متوسط (أسبوع - أسبوعين)</option>
                                 <option value="extended">ممتد (4-8 أسابيع)</option>
                                 <option value="long">برنامج طويل (3-6 أشهر)</option>
                                 <option value="flexible">مرن</option>
                              </select>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">التوقيت المفضل</label>
                              <select value={formData.timing} onChange={(e) => updateFormData('timing', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 outline-none font-bold">
                                 <option value="">اختر التوقيت</option>
                                 <option value="morning">ساعات العمل الرسمية</option>
                                 <option value="evening">مسائي</option>
                                 <option value="weekend">عطلة نهاية الأسبوع</option>
                                 <option value="flexible">مرن</option>
                              </select>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">عدد الساعات الإجمالي</label>
                              <select value={formData.totalHours} onChange={(e) => updateFormData('totalHours', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 outline-none font-bold">
                                 <option value="">اختر الساعات</option>
                                 <option value="u20">أقل من 20 ساعة</option>
                                 <option value="20-40">20-40 ساعة</option>
                                 <option value="40-80">40-80 ساعة</option>
                                 <option value="80+">80+ ساعة</option>
                                 <option value="undetermined">غير محدد</option>
                              </select>
                           </div>
                       </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* Step 5: Technical Details */}
              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
                  className="space-y-8"
                >
                  <GlassCard className="border-none shadow-2xl rounded-[40px] p-8 md:p-12">
                     <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600"><Cpu size={20} /></div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">القسم 5: المتطلبات التقنية والمحتوى</h2>
                    </div>

                    <div className="space-y-8">
                       <div className="space-y-4">
                          <label className="block text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">هل توجد متطلبات تقنية مسبقة للمشاركين؟</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                             {[
                               'لا - البرنامج يبدأ من الصفر',
                               'نعم - معرفة أساسية بمجال محدد',
                               'نعم - امتلاك جهاز/برامج محددة',
                               'غير متأكد - أحتاج لتقييم المشاركين أولاً'
                             ].map(opt => (
                               <Radio key={opt} name="techPrerequisites" label={opt} value={opt} checked={formData.techPrerequisites === opt} onChange={(val) => updateFormData('techPrerequisites', val)} />
                             ))}
                          </div>
                          {formData.techPrerequisites.includes('نعم') && (
                             <Input label="اذكر المتطلبات" value={formData.otherPrerequisites} onChange={(val) => updateFormData('otherPrerequisites', val)} placeholder="مثلاً: معرفة بأساسيات بايثون" />
                          )}
                       </div>

                       <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
                          <label className="block text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">هل ترغبون في محتوى مخصص لسياق عملكم؟</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                              'نعم - نريد أمثلة وتمارين من بيئة عملنا',
                              'جزئياً - نريد بعض التخصيص مع محتوى قياسي',
                              'لا - نكتفي بالمحتوى القياسي المعتمد',
                              'أحتاج استشارة لتحديد درجة التخصيص'
                            ].map(opt => (
                              <Radio key={opt} name="customContent" label={opt} value={opt} checked={formData.customContent === opt} onChange={(val) => updateFormData('customContent', val)} />
                            ))}
                          </div>
                       </div>

                       <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
                          <label className="block text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">ما نوع المواد التدريبية التي تفضلون توفيرها؟</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                             {[
                               'عروض تقديمية (Slides)',
                               'ملفات تمارين عملية وحلولها',
                               'تسجيلات الجلسات للمراجعة',
                               'أدوات ومصادر إضافية (قوالب)',
                               'منصة تعليمية (LMS)',
                               'جميع ما سبق'
                             ].map(opt => (
                               <Checkbox key={opt} label={opt} checked={formData.preferredMaterials.includes(opt)} onChange={() => toggleArrayField('preferredMaterials', opt)} />
                             ))}
                          </div>
                       </div>

                       <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
                          <label className="block text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">هل تحتاجون لشهادات معتمدة؟</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                              'نعم - شهادة حضور من مؤسستكم',
                              'نعم - شهادة معتمدة محلياً',
                              'نعم - شهادة معتمدة دولياً',
                              'لا - التركيز على المهارة فقط',
                              'غير متأكد'
                            ].map(opt => (
                              <Radio key={opt} name="certificateNeeded" label={opt} value={opt} checked={formData.certificateNeeded === opt} onChange={(val) => updateFormData('certificateNeeded', val)} />
                            ))}
                          </div>
                       </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* Step 6: Evaluation & Follow-up */}
              {step === 6 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
                  className="space-y-8"
                >
                  <GlassCard className="border-none shadow-2xl rounded-[40px] p-8 md:p-12">
                     <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center text-green-600"><BadgeCheck size={20} /></div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">القسم 6: التقييم والمتابعة ما بعد التدريب</h2>
                    </div>

                    <div className="space-y-8">
                       <div className="space-y-4">
                          <label className="block text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">ما نوع التقييم الذي تفضلونه خلال البرنامج؟</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                             {[
                               'تقييم مستمر عبر تمارين ومشاريع صغيرة',
                               'اختبار نهائي نظري/عملي',
                               'عرض مشروع تخرج أمام الفريق',
                               'تقييم 360 درجة',
                               'لا نحتاج تقييم رسمي'
                             ].map(opt => (
                               <Checkbox key={opt} label={opt} checked={formData.evaluationType.includes(opt)} onChange={() => toggleArrayField('evaluationType', opt)} />
                             ))}
                          </div>
                       </div>

                       <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
                          <label className="block text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">هل ترغبون في دعم أو متابعة بعد انتهاء التدريب؟</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                              'جلسات أسئلة ومتابعة أسبوعية',
                              'وصول للمدرب للاستشارات السريعة',
                              'مجتمع تعلم خاص (Slack/Discord)',
                              'تحديثات دورية للمحتوى التقني',
                              'لا نحتاج متابعة'
                            ].map(opt => (
                              <Checkbox key={opt} label={opt} checked={formData.postTrainingSupport.includes(opt)} onChange={() => toggleArrayField('postTrainingSupport', opt)} />
                            ))}
                          </div>
                       </div>

                       <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
                          <label className="block text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">هل تخططون لبرنامج تدريبي مستمر/سنوي؟</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                              'نعم - نبحث عن شريك طويل المدى',
                              'ربما - نبدأ ببرنامج واحد ثم نقرر',
                              'لا - احتياج لمرة واحدة فقط',
                              'غير متأكد'
                            ].map(opt => (
                              <Radio key={opt} name="isRecurring" label={opt} value={opt} checked={formData.isRecurring === opt} onChange={(val) => updateFormData('isRecurring', val)} />
                            ))}
                          </div>
                       </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* Step 7: Budget */}
              {step === 7 && (
                <motion.div
                  key="step7"
                  initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
                  className="space-y-8"
                >
                  <GlassCard className="border-none shadow-2xl rounded-[40px] p-8 md:p-12">
                     <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600"><DollarSign size={20} /></div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">القسم 7: الميزانية والاعتبارات المالية</h2>
                    </div>

                    <div className="space-y-8">
                       <div className="space-y-4">
                          <label className="block text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">نطاق الميزانية المخصص للتدريب:</label>
                          <div className="grid grid-cols-1 gap-3">
                            {formData.applicantType === 'individual' ? (
                               [
                                 'أقل من $200 للدورة الواحدة',
                                 '$200 - $500',
                                 '$500 - $1,500',
                                 '$1,500+ (للشهادات المتقدمة)',
                                 'الميزانية مرنة حسب القيمة'
                               ].map(opt => <Radio key={opt} name="budgetRange" label={opt} value={opt} checked={formData.budgetRange === opt} onChange={(val) => updateFormData('budgetRange', val)} />)
                            ) : (
                               [
                                 'أقل من $2,000 للبرنامج',
                                 '$2,000 - $10,000',
                                 '$10,000 - $50,000',
                                 '$50,000+ (برامج مؤسسية)',
                                 'الميزانية حسب العرض والعدد',
                                 'غير محدد - أحتاج عرضاً أولاً'
                               ].map(opt => <Radio key={opt} name="budgetRange" label={opt} value={opt} checked={formData.budgetRange === opt} onChange={(val) => updateFormData('budgetRange', val)} />)
                            )}
                          </div>
                       </div>

                       <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
                          <label className="block text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">طريقة الدفع المفضلة:</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                             {[
                               'دفع كامل مقدماً (خصم محتمل)',
                               'دفع على أقساط مرحلية',
                               'دفع بعد الانتهاء والرضا',
                               'فاتورة مؤسسية (شركات/حكومي)',
                               'تمويل/منحة تدريبية (إذا متاح)'
                             ].map(opt => <Radio key={opt} name="paymentMethod" label={opt} value={opt} checked={formData.paymentMethod === opt} onChange={(val) => updateFormData('paymentMethod', val)} />)}
                          </div>
                       </div>

                       <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
                          <label className="block text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">هل الميزانية تشمل:</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                             {[
                               'المواد التدريبية والوصول للمنصة',
                               'الشهادات المعتمدة',
                               'جلسات المتابعة والدعم',
                               'التخصيص الكامل للمحتوى',
                               'سفر وإقامة المدرب (حضوري)',
                               'أخرى'
                             ].map(opt => <Checkbox key={opt} label={opt} checked={formData.budgetIncludes.includes(opt)} onChange={() => toggleArrayField('budgetIncludes', opt)} />)}
                          </div>
                       </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* Step 8: Additional Info */}
              {step === 8 && (
                <motion.div
                  key="step8"
                  initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
                  className="space-y-8"
                >
                   <GlassCard className="border-none shadow-2xl rounded-[40px] p-8 md:p-12">
                     <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600"><Info size={20} /></div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">القسم 8: معلومات التواصل الإضافية</h2>
                    </div>

                    <div className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-6">
                           <Input label="جهة التواصل الرئيسية (الاسم)" value={formData.mainContactName} onChange={(val) => updateFormData('mainContactName', val)} />
                           <Input label="المنصب" value={formData.mainContactRole} onChange={(val) => updateFormData('mainContactRole', val)} />
                           <Input label="البريد الإلكتروني" type="email" value={formData.mainContactEmail} onChange={(val) => updateFormData('mainContactEmail', val)} />
                           <Input label="رقم الهاتف" type="tel" value={formData.mainContactPhone} onChange={(val) => updateFormData('mainContactPhone', val)} />
                        </div>

                        <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-6">
                           <div className="space-y-4">
                              <label className="block text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">طريقة التواصل المفضلة:</label>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                 {[
                                   'البريد الإلكتروني',
                                   'واتساب/تيليجرام',
                                   'مكالمات فيديو (Zoom)',
                                   'منصة تعاون (Slack)',
                                   'اجتماعات حضورية'
                                 ].map(opt => <Checkbox key={opt} label={opt} checked={formData.preferredCommunication.includes(opt)} onChange={() => toggleArrayField('preferredCommunication', opt)} />)}
                              </div>
                           </div>

                           <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">تاريخ البدء المفضل</label>
                                <input type="date" value={formData.startDate} onChange={(e) => updateFormData('startDate', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 outline-none font-bold" />
                              </div>
                              <div className="space-y-4">
                                <label className="block text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">هل تتقدمون بعروض لجهات أخرى؟</label>
                                <select value={formData.isCompetingOffers} onChange={(e) => updateFormData('isCompetingOffers', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 outline-none font-bold">
                                   <option value="">اختر إجابة</option>
                                   <option value="no">لا - أنتم خيارنا الأول</option>
                                   <option value="yes">نعم - نقارن بين عدة عروض</option>
                                   <option value="info">في مرحلة جمع المعلومات فقط</option>
                                   <option value="private">لا أود الإفصاح</option>
                                </select>
                              </div>
                           </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                           <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">ملاحظات أو طلبات خاصة</label>
                           <textarea 
                             value={formData.specialNotes} 
                             onChange={(e) => updateFormData('specialNotes', e.target.value)}
                             className="w-full h-32 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl px-6 py-4 outline-none font-medium text-slate-700 dark:text-slate-300 resize-none"
                             placeholder="أي معلومات إضافية أو أسئلة تود طرحها..."
                           />
                        </div>
                    </div>
                   </GlassCard>
                </motion.div>
              )}

              {/* Step 9: Consent */}
              {step === 9 && (
                <motion.div
                  key="step9"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-8"
                >
                   <GlassCard className="border-none shadow-2xl rounded-[40px] p-8 md:p-12 bg-gradient-to-br from-primary/5 to-white dark:from-primary/10 dark:to-slate-900">
                     <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><CheckCircle2 size={20} /></div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">القسم 9: الموافقة والخصوصية</h2>
                    </div>

                    <div className="space-y-6">
                       <p className="text-slate-600 dark:text-slate-400 font-medium mb-8 leading-relaxed">
                         يرجى مراجعة وتأكيد البنود التالية لإرسال طلبك. نحن نلتزم بخصوصيتكم وسرية بياناتكم بالكامل.
                       </p>

                       {[
                         { field: 'consentPrivacy', label: 'أوافق على معالجة بياناتي/بيانات مؤسستي وفقاً لسياسة الخصوصية *' },
                         { field: 'consentFollowUp', label: 'أوافق على التواصل معي لمتابعة طلب التدريب *' },
                         { field: 'consentAccuracy', label: 'أقر بأن المعلومات المقدمة صحيحة ودقيقة لأفضل علمي' },
                         { field: 'consentAuthority', label: 'أملك الصلاحية لتمثيل الجهة في هذا الطلب (للمؤسسات) *' }
                       ].map(opt => (
                         <label key={opt.field} className="flex items-start gap-4 p-5 rounded-3xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 cursor-pointer hover:shadow-md transition-all shadow-sm">
                            <input 
                              type="checkbox" 
                              required 
                              checked={(formData as any)[opt.field]} 
                              onChange={(e) => updateFormData(opt.field, e.target.checked)}
                              className="w-6 h-6 rounded-lg text-primary mt-0.5"
                            />
                            <span className="font-bold text-slate-800 dark:text-slate-200">{opt.label}</span>
                         </label>
                       ))}

                       <div className="p-8 bg-black/5 dark:bg-white/5 rounded-[30px] mt-8 text-xs text-slate-500 font-medium space-y-2">
                          <p>* لن نشارك بياناتكم مع أي طرف ثالث دون موافقتكم الخطية.</p>
                          <p>* جميع المعلومات التدريبية تحفظ بسرية وتستخدم فقط لأغراض التصميم والتسليم.</p>
                       </div>
                    </div>
                   </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-12 gap-4">
              {step > 1 ? (
                 <GlassButton 
                   type="button" 
                   variant="secondary" 
                   onClick={prevStep} 
                   className="px-10 rounded-2xl flex items-center gap-2 font-black uppercase tracking-widest text-xs"
                 >
                   {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />} السابق
                 </GlassButton>
              ) : <div />}

              {step < totalSteps ? (
                 <GlassButton 
                   type="button" 
                   variant="primary" 
                   onClick={nextStep} 
                   disabled={step === 1 && !formData.applicantType}
                   className="px-10 rounded-2xl flex items-center gap-2 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                 >
                   التالي {isRtl ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                 </GlassButton>
              ) : (
                <GlassButton 
                   type="submit" 
                   variant="primary" 
                   disabled={loading}
                   className="px-12 rounded-2xl flex items-center gap-2 font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/30 py-4 bg-primary text-white border-0 hover:scale-105 transition-transform"
                >
                  {loading ? (isRtl ? 'جاري الإرسال...' : 'Sending...') : (isRtl ? 'إرسال طلب التدريب' : 'Submit Training Request')} <Send size={20} className="ml-2" />
                </GlassButton>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Helper Components
const Input = ({ label, value, onChange, type = 'text', required = false, placeholder = '' }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{label}</label>
    <input 
      type={type} 
      required={required} 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
    />
  </div>
);

const Radio = ({ label, name, value, checked, onChange }: any) => (
  <label className={cn(
    "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-800/50",
    checked ? "border-primary bg-primary/5 shadow-sm" : "border-slate-50 dark:border-slate-800"
  )}>
    <input 
      type="radio" 
      name={name} 
      value={value} 
      checked={checked} 
      onChange={(e) => onChange(e.target.value)}
      className="w-4 h-4 text-primary border-slate-300 focus:ring-primary"
    />
    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</span>
  </label>
);

const Checkbox = ({ label, checked, onChange }: any) => (
  <label className={cn(
    "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-800/50",
    checked ? "border-primary bg-primary/5 shadow-sm" : "border-slate-50 dark:border-slate-800"
  )}>
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={onChange}
      className="w-5 h-5 rounded-lg text-primary border-slate-300 focus:ring-primary"
    />
    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</span>
  </label>
);
