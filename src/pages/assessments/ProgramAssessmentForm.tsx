import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Target, 
  Layers, 
  Palette, 
  BarChart3, 
  MessageSquare, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Navbar, GlassCard, GlassButton } from '@/src/components/common/Layout';
import { RatingScale, AssessmentSection } from '@/src/components/assessments/AssessmentUI';
import { useSearchParams } from 'react-router-dom';
import { submitAssessmentToSQL } from '@/src/services/hybridApiService';

export default function ProgramAssessmentForm() {
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('requestId') || '';
  const [step, setStep] = React.useState(1);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const [formData, setFormData] = React.useState({
    programName: '',
    programCode: '',
    targetAudience: '',
    duration: '',
    reviewDate: new Date().toISOString().split('T')[0],
    reviewerName: '',

    goalsAlignment: 0,
    audienceMatching: 0,
    impactAlignment: 0,
    marketUpdates: 0,

    logicFlow: 0,
    balanceTheoPrac: 0,
    accuracy: 0,
    levelSuitability: 0,
    comprehensiveness: 0,
    realworldExamples: 0,

    varietyActivities: 0,
    exerciseQuality: 0,
    multimediaUsage: 0,
    flexiblePaths: 0,
    gamification: 0,

    preAssessment: 0,
    midAssessment: 0,
    finalAssessment: 0,
    measurementClarity: 0,
    feedbackProvision: 0,

    strengths: '',
    improvements: '',
    readiness: '',
    recommendations: '',
    nextReviewDate: ''
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateScore = (fields: (keyof typeof formData)[]) => 
    fields.reduce((acc: number, f) => acc + (Number(formData[f]) || 0), 0);

  const scores = {
    goals: calculateScore(['goalsAlignment', 'audienceMatching', 'impactAlignment', 'marketUpdates']),
    content: calculateScore(['logicFlow', 'balanceTheoPrac', 'accuracy', 'levelSuitability', 'comprehensiveness', 'realworldExamples']),
    design: calculateScore(['varietyActivities', 'exerciseQuality', 'multimediaUsage', 'flexiblePaths', 'gamification']),
    measurement: calculateScore(['preAssessment', 'midAssessment', 'finalAssessment', 'measurementClarity', 'feedbackProvision'])
  };

  const totalScore = Number(scores.goals) + Number(scores.content) + Number(scores.design) + Number(scores.measurement);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitAssessmentToSQL('program', {
        requestId,
        ...formData,
        totalScore,
        sectionScores: scores
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
      alert('فشل إرسال التقييم');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <Navbar />
        <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase">تم تقييم البرنامج بنجاح</h1>
        <p className="text-slate-500 my-4">تم حفظ البيانات في نظام ضمان الجودة.</p>
        <GlassButton variant="primary" onClick={() => window.location.href = '/'}>العودة للرئيسية</GlassButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">تقييم جودة <span className="text-primary">البرنامج التدريبي</span></h1>
          <p className="text-slate-500 mt-4">مراجعة شاملة للمحتوى، الأهداف، والتصميم التعليمي.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {step === 1 && (
                <AssessmentSection title="القسم 1: معلومات البرنامج" icon={<Building2 />}>
                  <GlassCard className="p-8 grid md:grid-cols-2 gap-6">
                    <FormInput label="اسم البرنامج" value={formData.programName} onChange={v => updateField('programName', v)} />
                    <FormInput label="الكود التعريفي" value={formData.programCode} onChange={v => updateField('programCode', v)} />
                    <FormInput label="الفئة المستهدفة" value={formData.targetAudience} onChange={v => updateField('targetAudience', v)} />
                    <FormInput label="مدة البرنامج" value={formData.duration} onChange={v => updateField('duration', v)} />
                    <FormInput label="تاريخ المراجعة" type="date" value={formData.reviewDate} onChange={v => updateField('reviewDate', v)} />
                    <FormInput label="اسم المراجع" value={formData.reviewerName} onChange={v => updateField('reviewerName', v)} />
                  </GlassCard>
                </AssessmentSection>
              )}

              {step === 2 && (
                <AssessmentSection title="القسم 2: مواءمة الأهداف والاحتياجات" icon={<Target />}>
                  <RatingScale label="وضوح الأهداف التعليمية (SMART)" value={formData.goalsAlignment} onChange={v => updateField('goalsAlignment', v)} />
                  <RatingScale label="مواءمة المحتوى مع احتياجات الجمهور" value={formData.audienceMatching} onChange={v => updateField('audienceMatching', v)} />
                  <RatingScale label="ارتباط المخرجات بأهداف العمل" value={formData.impactAlignment} onChange={v => updateField('impactAlignment', v)} />
                  <RatingScale label="تحديث المحتوى دورياً" value={formData.marketUpdates} onChange={v => updateField('marketUpdates', v)} />
                </AssessmentSection>
              )}

              {step === 3 && (
                <AssessmentSection title="القسم 3: جودة المحتوى والهيكلة" icon={<CheckCircle2 />}>
                  <RatingScale label="تسلسل منطقي للمحتوى" value={formData.logicFlow} onChange={v => updateField('logicFlow', v)} />
                  <RatingScale label="توازن المحتوى النظري والعملي" value={formData.balanceTheoPrac} onChange={v => updateField('balanceTheoPrac', v)} />
                  <RatingScale label="دقة المعلومات وخلوها من الأخطاء" value={formData.accuracy} onChange={v => updateField('accuracy', v)} />
                  <RatingScale label="ملاءمة مستوى الصعوبة" value={formData.levelSuitability} onChange={v => updateField('levelSuitability', v)} />
                  <RatingScale label="شمولية المحتوى" value={formData.comprehensiveness} onChange={v => updateField('comprehensiveness', v)} />
                  <RatingScale label="إثراء المحتوى بأمثلة واقعية" value={formData.realworldExamples} onChange={v => updateField('realworldExamples', v)} />
                </AssessmentSection>
              )}

              {step === 4 && (
                <AssessmentSection title="القسم 4: التصميم التعليمي والتفاعلي" icon={<Palette />}>
                  <RatingScale label="تنوع أنشطة التعلم" value={formData.varietyActivities} onChange={v => updateField('varietyActivities', v)} />
                  <RatingScale label="جودة التمارين والتقييمات" value={formData.exerciseQuality} onChange={v => updateField('exerciseQuality', v)} />
                  <RatingScale label="استخدام وسائط متعددة" value={formData.multimediaUsage} onChange={v => updateField('multimediaUsage', v)} />
                  <RatingScale label="توفير مسارات تعلم مرنة" value={formData.flexiblePaths} onChange={v => updateField('flexiblePaths', v)} />
                  <RatingScale label="دمج عناصر التحفيز والتلعيب" value={formData.gamification} onChange={v => updateField('gamification', v)} />
                </AssessmentSection>
              )}

              {step === 5 && (
                <AssessmentSection title="القسم 5: القياس والتقييم" icon={<BarChart3 />}>
                  <RatingScale label="وجود تقييم قبلي" value={formData.preAssessment} onChange={v => updateField('preAssessment', v)} />
                  <RatingScale label="تقييمات مرحلية" value={formData.midAssessment} onChange={v => updateField('midAssessment', v)} />
                  <RatingScale label="تقييم نهائي" value={formData.finalAssessment} onChange={v => updateField('finalAssessment', v)} />
                  <RatingScale label="وضوح معايير التقييم" value={formData.measurementClarity} onChange={v => updateField('measurementClarity', v)} />
                  <RatingScale label="توفير تغذية راجعة فورية" value={formData.feedbackProvision} onChange={v => updateField('feedbackProvision', v)} />
                </AssessmentSection>
              )}

              {step === 6 && (
                <AssessmentSection title="القسم 6: التقييم النوعي والنتائج" icon={<MessageSquare />}>
                   <GlassCard className="p-12 text-center mb-8">
                     <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2">المجموع الكلي للبرنامج</p>
                     <p className="text-7xl font-black text-primary">{totalScore}<span className="text-xl text-slate-400">/100</span></p>
                   </GlassCard>
                   <div className="grid gap-6">
                      <textarea className="glass-card p-6 min-h-[100px] outline-none border-none focus:ring-4 focus:ring-primary/10 transition-all font-bold" placeholder="نقاط القوة..." value={formData.strengths} onChange={e => updateField('strengths', e.target.value)} />
                      <textarea className="glass-card p-6 min-h-[100px] outline-none border-none focus:ring-4 focus:ring-primary/10 transition-all font-bold" placeholder="عناصر تحتاج تحسين..." value={formData.improvements} onChange={e => updateField('improvements', e.target.value)} />
                      <div className="grid md:grid-cols-2 gap-4">
                        <select className="glass-card p-4 font-bold outline-none border-none focus:ring-4 focus:ring-primary/10 appearance-none" value={formData.readiness} onChange={e => updateField('readiness', e.target.value)}>
                          <option value="">حالة جاهزية البرنامج</option>
                          <option value="ready">جاهز تماماً</option>
                          <option value="needs_minor">تعديلات طفيفة</option>
                          <option value="major_review">مراجعة جوهرية</option>
                          <option value="no">لا ينصح بالإطلاق</option>
                        </select>
                        <input className="glass-card p-4 font-bold outline-none border-none focus:ring-4 focus:ring-primary/10" type="date" value={formData.nextReviewDate} onChange={e => updateField('nextReviewDate', e.target.value)} />
                      </div>
                   </div>
                </AssessmentSection>
              )}
            </motion.div>
          </AnimatePresence>

          <footer className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl">
             <GlassButton variant="secondary" type="button" disabled={step === 1} onClick={() => setStep(step - 1)}>السابق</GlassButton>
             {step < 6 ? (
               <GlassButton variant="primary" type="button" onClick={() => setStep(step + 1)}>التالي</GlassButton>
             ) : (
               <GlassButton variant="primary" type="submit" loading={loading} className="bg-green-500 border-green-500">إرسال التقييم</GlassButton>
             )}
          </footer>
        </form>
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, type = 'text' }: { label: string, value: string, onChange: (v: string) => void, type?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-loose">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-3 font-bold text-slate-700 dark:text-white outline-none focus:border-primary/50 transition-all" />
    </div>
  );
}
