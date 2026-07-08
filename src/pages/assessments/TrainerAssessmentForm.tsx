import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  BookOpen, 
  Presentation, 
  Wrench, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Briefcase,
  Target,
  Award
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Navbar, GlassCard, GlassButton } from '@/src/components/common/Layout';
import { RatingScale, AssessmentSection } from '@/src/components/assessments/AssessmentUI';
import { useSearchParams } from 'react-router-dom';
import { submitAssessmentToSQL } from '@/src/services/hybridApiService';

export default function TrainerAssessmentForm() {
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('requestId') || '';
  const targetId = searchParams.get('id') || '';
  
  const [step, setStep] = React.useState(1);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const [formData, setFormData] = React.useState({
    // Section 1: Basic Info
    trainerName: '',
    programName: '',
    evaluationDate: new Date().toISOString().split('T')[0],
    evaluatorName: '',
    evaluatorRole: '',

    // Section 2: Technical (1-5)
    knowledgeDepth: 0,
    simplificationSkill: 0,
    answerAccuracy: 0,
    latestPractices: 0,
    theoryAppRelation: 0,
    section2Notes: '',

    // Section 3: Communication (1-5)
    voiceClarity: 0,
    bodyLanguage: 0,
    examplesUsage: 0,
    attentionGrip: 0,
    difficultQuestionsHandle: 0,
    engagementSkill: 0,
    section3Notes: '',

    // Section 4: Materials (1-5)
    slidesQuality: 0,
    practicalRelevance: 0,
    methodVariety: 0,
    interactiveTools: 0,
    referenceClarity: 0,
    section4Notes: '',

    // Section 5: Organization (1-5)
    scheduleCommitment: 0,
    timeBalance: 0,
    emergencyFlexibility: 0,
    logicalFlow: 0,
    section5Notes: '',

    // Section 6: Qualitative
    strengths: '',
    improvements: '',
    recommendation: '', // Highly recommend, recommend with notes, neutral, no
    additionalNotes: '',

    // Section 7: Final (Admin Only usually, but here as part of form)
    managementDecision: '',
    developmentPlan: ''
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateSectionScore = (fields: (keyof typeof formData)[]) => {
    return fields.reduce((acc: number, field) => acc + (Number(formData[field]) || 0), 0);
  };

  const section2Score = calculateSectionScore(['knowledgeDepth', 'simplificationSkill', 'answerAccuracy', 'latestPractices', 'theoryAppRelation']);
  const section3Score = calculateSectionScore(['voiceClarity', 'bodyLanguage', 'examplesUsage', 'attentionGrip', 'difficultQuestionsHandle', 'engagementSkill']);
  const section4Score = calculateSectionScore(['slidesQuality', 'practicalRelevance', 'methodVariety', 'interactiveTools', 'referenceClarity']);
  const section5Score = calculateSectionScore(['scheduleCommitment', 'timeBalance', 'emergencyFlexibility', 'logicalFlow']);
  
  const totalScore = Number(section2Score) + Number(section3Score) + Number(section4Score) + Number(section5Score);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitAssessmentToSQL('trainer', {
        requestId,
        ...formData,
        totalScore,
        sectionScores: {
          technical: section2Score,
          communication: section3Score,
          materials: section4Score,
          organization: section5Score
        },
        targetTrainerId: targetId
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Submission error:", error);
      alert('حدث خطأ أثناء إرسال التقييم');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 7));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <Navbar />
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-6">
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">تم إرسال التقييم بنجاح</h1>
          <p className="text-slate-500 max-w-md mx-auto">شكرًا لمساهمتك في تحسين جودة التدريب وبرامجنا التعليمية.</p>
          <GlassButton variant="primary" onClick={() => window.location.href = '/'}>العودة للرئيسية</GlassButton>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
        <header className="mb-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4"
            >
              نظام تقييم جودة التدريب
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight uppercase tracking-tighter">
              نموذج قياس جودة <span className="text-primary tracking-normal">المدرب</span>
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto font-medium leading-relaxed">
              ساعدنا في الحفاظ على أعلى معايير التميز في أكاديميتنا من خلال تقديم تقييمك الدقيق والشفاف.
            </p>
        </header>

        {/* Stepper */}
        <div className="flex justify-between items-center mb-12 px-4 gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
               <div key={i} className="flex-1 flex flex-col items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all",
                    step === i ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110" : 
                    step > i ? "bg-green-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                  )}>
                    {step > i ? <CheckCircle2 size={16} /> : i}
                  </div>
                  <div className="hidden md:block mt-2 text-[8px] font-black uppercase text-slate-400 tracking-widest">
                    {i === 1 ? 'المعلومات' : i === 2 ? 'الكفاءة' : i === 3 ? 'العرض' : i === 4 ? 'المواد' : i === 5 ? 'التنظيم' : i === 6 ? 'النتائج' : 'القرار'}
                  </div>
               </div>
            ))}
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
               {step === 1 && (
                 <AssessmentSection title="القسم 1: المعلومات الأساسية" icon={<User size={20}/>}>
                   <GlassCard className="grid md:grid-cols-2 gap-6 p-8">
                      <Input label="اسم المدرب" value={formData.trainerName} onChange={(val) => updateField('trainerName', val)} />
                      <Input label="اسم البرنامج التدريبي" value={formData.programName} onChange={(val) => updateField('programName', val)} />
                      <Input label="تاريخ التقييم" type="date" value={formData.evaluationDate} onChange={(val) => updateField('evaluationDate', val)} />
                      <Input label="اسم المقيِّم" value={formData.evaluatorName} onChange={(val) => updateField('evaluatorName', val)} />
                      <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">صفة المقيِّم</p>
                        <div className="grid grid-cols-2 gap-3">
                          {['مدير تدريب', 'مراقب جودة', 'متدرب', 'عميل مؤسسي'].map(role => (
                            <button
                              key={role}
                              type="button"
                              onClick={() => updateField('evaluatorRole', role)}
                              className={cn(
                                "p-3 rounded-2xl border-2 text-xs font-bold transition-all text-right",
                                formData.evaluatorRole === role ? "border-primary bg-primary/5 text-primary" : "border-slate-100 dark:border-slate-800 text-slate-500"
                              )}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>
                   </GlassCard>
                 </AssessmentSection>
               )}

               {step === 2 && (
                 <AssessmentSection title="القسم 2: الكفاءة المعرفية والمهنية" icon={<BookOpen size={20}/>}>
                    <p className="text-xs font-medium text-slate-400 mb-4 px-2 tracking-wide uppercase">درجات القسم: {section2Score} / 25</p>
                    <RatingScale label="عمق المعرفة في المجال" value={formData.knowledgeDepth} onChange={(val) => updateField('knowledgeDepth', val)} />
                    <RatingScale label="القدرة على تبسيط المفاهيم المعقدة" value={formData.simplificationSkill} onChange={(val) => updateField('simplificationSkill', val)} />
                    <RatingScale label="دقة الإجابات على أسئلة المتدربين" value={formData.answerAccuracy} onChange={(val) => updateField('answerAccuracy', val)} />
                    <RatingScale label="تحديث المعلومات حسب أحدث الممارسات" value={formData.latestPractices} onChange={(val) => updateField('latestPractices', val)} />
                    <RatingScale label="الربط بين النظرية والتطبيق العملي" value={formData.theoryAppRelation} onChange={(val) => updateField('theoryAppRelation', val)} />
                    <textarea 
                      placeholder="ملاحظات إضافية على الكفاءة..." 
                      className="w-full h-32 glass-card p-6 border-none outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-slate-700 rounded-[32px] resize-none"
                      value={formData.section2Notes}
                      onChange={(e) => updateField('section2Notes', e.target.value)}
                    />
                 </AssessmentSection>
               )}

               {step === 3 && (
                 <AssessmentSection title="القسم 3: مهارات العرض والتواصل" icon={<Presentation size={20}/>}>
                    <p className="text-xs font-medium text-slate-400 mb-4 px-2 tracking-wide uppercase">درجات القسم: {section3Score} / 30</p>
                    <RatingScale label="وضوح الصوت وسرعة الكلام المناسبة" value={formData.voiceClarity} onChange={(val) => updateField('voiceClarity', val)} />
                    <RatingScale label="لغة الجسد والثقة أثناء العرض" value={formData.bodyLanguage} onChange={(val) => updateField('bodyLanguage', val)} />
                    <RatingScale label="استخدام الأمثلة والقصص التوضيحية" value={formData.examplesUsage} onChange={(val) => updateField('examplesUsage', val)} />
                    <RatingScale label="القدرة على جذب الانتباه والحفاظ عليه" value={formData.attentionGrip} onChange={(val) => updateField('attentionGrip', val)} />
                    <RatingScale label="التعامل باحترافية مع الأسئلة الصعبة" value={formData.difficultQuestionsHandle} onChange={(val) => updateField('difficultQuestionsHandle', val)} />
                    <RatingScale label="تشجيع المشاركة والتفاعل الجماعي" value={formData.engagementSkill} onChange={(val) => updateField('engagementSkill', val)} />
                 </AssessmentSection>
               )}

               {step === 4 && (
                 <AssessmentSection title="القسم 4: جودة المواد والأدوات التدريبية" icon={<Wrench size={20}/>}>
                    <p className="text-xs font-medium text-slate-400 mb-4 px-2 tracking-wide uppercase">درجات القسم: {section4Score} / 25</p>
                    <RatingScale label="جودة وتصميم العروض التقديمية" value={formData.slidesQuality} onChange={(val) => updateField('slidesQuality', val)} />
                    <RatingScale label="ملاءمة التمارين العملية للأهداف" value={formData.practicalRelevance} onChange={(val) => updateField('practicalRelevance', val)} />
                    <RatingScale label="تنوع أساليب التدريب" value={formData.methodVariety} onChange={(val) => updateField('methodVariety', val)} />
                    <RatingScale label="استخدام أدوات تفاعلية وتقنيات حديثة" value={formData.interactiveTools} onChange={(val) => updateField('interactiveTools', val)} />
                    <RatingScale label="وضوح ودقة المواد المرجعية المرفقة" value={formData.referenceClarity} onChange={(val) => updateField('referenceClarity', val)} />
                 </AssessmentSection>
               )}

               {step === 5 && (
                 <AssessmentSection title="القسم 5: الإدارة الزمنية والتنظيم" icon={<Clock size={20}/>}>
                    <p className="text-xs font-medium text-slate-400 mb-4 px-2 tracking-wide uppercase">درجات القسم: {section5Score} / 20</p>
                    <RatingScale label="الالتزام بجدول الدورة الزمني" value={formData.scheduleCommitment} onChange={(val) => updateField('scheduleCommitment', val)} />
                    <RatingScale label="توزيع الوقت بين الأجزاء بشكل متوازن" value={formData.timeBalance} onChange={(val) => updateField('timeBalance', val)} />
                    <RatingScale label="المرونة في التعامل مع الطوارئ" value={formData.emergencyFlexibility} onChange={(val) => updateField('emergencyFlexibility', val)} />
                    <RatingScale label="تنظيم الجلسات وتسلسل المحتوى منطقياً" value={formData.logicalFlow} onChange={(val) => updateField('logicalFlow', val)} />
                 </AssessmentSection>
               )}

               {step === 6 && (
                 <AssessmentSection title="القسم 6: التقييم النوعي" icon={<MessageSquare size={20}/>}>
                    <GlassCard className="p-8 space-y-8">
                       <div className="space-y-4">
                          <label className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">أبرز نقاط قوة هذا المدرب؟</label>
                          <textarea 
                            className="w-full h-32 bg-slate-50 dark:bg-slate-900 border-none rounded-3xl p-6 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-slate-700 dark:text-slate-300 resize-none"
                            value={formData.strengths}
                            onChange={(e) => updateField('strengths', e.target.value)}
                          />
                       </div>
                       <div className="space-y-4">
                          <label className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">المجالات التي يحتاج فيها للتطوير؟</label>
                          <textarea 
                            className="w-full h-32 bg-slate-50 dark:bg-slate-900 border-none rounded-3xl p-6 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-slate-700 dark:text-slate-300 resize-none"
                            value={formData.improvements}
                            onChange={(e) => updateField('improvements', e.target.value)}
                          />
                       </div>
                       <div className="space-y-4">
                          <label className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">هل توصي بالاستمرار في التعاقد؟</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                             {[
                               { id: 'strongly_yes', label: 'نعم، بشدة' },
                               { id: 'yes_with_notes', label: 'نعم، مع ملاحظات تطويرية' },
                               { id: 'neutral', label: 'محايد / بحاجة لمزيد من المراقبة' },
                               { id: 'no', label: 'لا، لا أنصح بالتعاقد مستقبلاً' }
                             ].map(opt => (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => updateField('recommendation', opt.id)}
                                  className={cn(
                                    "p-5 rounded-3xl border-2 text-sm font-bold transition-all text-right flex items-center justify-between",
                                    formData.recommendation === opt.id ? "border-primary bg-primary/5 text-primary" : "border-slate-100 dark:border-slate-800 text-slate-500"
                                  )}
                                >
                                  {opt.label}
                                  {formData.recommendation === opt.id && <CheckCircle2 size={16}/>}
                                </button>
                             ))}
                          </div>
                       </div>
                    </GlassCard>
                 </AssessmentSection>
               )}

               {step === 7 && (
                 <AssessmentSection title="القسم 7: قرار الإدارة وخطة التطوير" icon={<Target size={20}/>}>
                    <GlassCard className="p-12 space-y-12">
                       <div className="text-center">
                          <div className="inline-block px-12 py-8 bg-slate-50 dark:bg-slate-900 rounded-[40px] border-4 border-primary/20">
                             <p className="text-xs font-black uppercase text-slate-400 tracking-[0.3em] mb-2">المجموع الكلي</p>
                             <div className="text-7xl font-black text-primary tracking-tighter">
                                {totalScore}<span className="text-2xl text-slate-300">/100</span>
                             </div>
                             <div className={cn(
                               "mt-4 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest inline-block",
                               totalScore >= 90 ? "bg-green-100 text-green-600" :
                               totalScore >= 75 ? "bg-blue-100 text-blue-600" :
                               totalScore >= 60 ? "bg-orange-100 text-orange-600" : "bg-red-100 text-red-600"
                             )}>
                                {totalScore >= 90 ? "ممتاز" : totalScore >= 75 ? "جيد جداً" : totalScore >= 60 ? "جيد" : "يحتاج تحسين"}
                             </div>
                          </div>
                       </div>

                       <div className="space-y-6">
                           <label className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">قرار الإدارة</label>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {[
                                { id: 'renew', label: 'تجديد التعاقد' },
                                { id: 'conditional', label: 'تعاقد مشروط بخطة تطوير' },
                                { id: 'stop', label: 'إيقاف التعاقد' },
                                { id: 'internal', label: 'إحالة للتدريب الداخلي' }
                              ].map(opt => (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => updateField('managementDecision', opt.id)}
                                  className={cn(
                                    "p-5 rounded-3xl border-2 text-sm font-bold transition-all text-right",
                                    formData.managementDecision === opt.id ? "border-primary bg-primary/5 text-primary" : "border-slate-100 dark:border-slate-800 text-slate-500"
                                  )}
                                >
                                  {opt.label}
                                </button>
                              ))}
                           </div>
                       </div>

                       <div className="space-y-4">
                          <label className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">خطة التطوير المقترحة</label>
                          <textarea 
                            className="w-full h-32 bg-slate-50 dark:bg-slate-900 border-none rounded-3xl p-6 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-slate-700 dark:text-slate-300 resize-none"
                            value={formData.developmentPlan}
                            onChange={(e) => updateField('developmentPlan', e.target.value)}
                            placeholder="صف الخطوات العملية لتطوير أداء المدرب..."
                          />
                       </div>
                    </GlassCard>
                 </AssessmentSection>
               )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-12 bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800">
             <GlassButton 
               variant="secondary"
               type="button" 
               disabled={step === 1} 
               onClick={prevStep}
               className="gap-2 px-8"
             >
                <ChevronRight size={20} /> السابق
             </GlassButton>
             
             {step < 7 ? (
               <GlassButton 
                 variant="primary" 
                 type="button" 
                 onClick={nextStep}
                 className="gap-2 px-8"
               >
                  التالي <ChevronLeft size={20} />
               </GlassButton>
             ) : (
               <GlassButton 
                 variant="primary" 
                 type="submit" 
                 loading={loading}
                 className="gap-3 px-12 bg-green-500 hover:bg-green-600 border-green-500"
               >
                  إرسال التقييم النهائي <CheckCircle2 size={20} />
               </GlassButton>
             )}
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', required = false }: { label: string, value: string, onChange: (val: string) => void, type?: string, required?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{label} {required && '*'}</label>
      <input 
        type={type} 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-900 rounded-2xl px-6 py-4 outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-700 dark:text-slate-100"
      />
    </div>
  );
}
