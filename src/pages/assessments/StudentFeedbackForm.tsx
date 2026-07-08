import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  Heart, 
  ThumbsUp, 
  Settings, 
  Smile, 
  Send,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Navbar, GlassCard, GlassButton } from '@/src/components/common/Layout';
import { StarRating } from '@/src/components/assessments/AssessmentUI';
import { useSearchParams } from 'react-router-dom';
import { submitAssessmentToSQL } from '@/src/services/hybridApiService';

export default function StudentFeedbackForm() {
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('requestId') || '';
  const [step, setStep] = React.useState(1);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const [formData, setFormData] = React.useState({
    programName: 'دورة تطوير الويب الشاملة', // Fallback or from params
    trainerName: 'المهندس أحمد محمد',
    studentName: '',
    
    overallRating: 0,
    metExpectations: 0,
    recommendScore: 0,
    nps: 5, // 0-10

    skillGain: 0,
    canApply: 0,
    clarity: 0,
    exerciseValue: 0,
    timeValue: 0,

    trainerKnowledge: 0,
    trainerEngagement: 0,
    trainerFeedback: 0,
    trainerStyle: 0,

    locationRating: 0,
    materialsRating: 0,
    durationRating: 0,
    supportRating: 0,

    keyLearning: '',
    improvement: '',
    futureTopics: '',
    consent: false
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitAssessmentToSQL('student_feedback', {
        requestId,
        ...formData
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
       <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4">
         <Navbar />
         <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-8 max-w-xl">
           <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/20">
             <CheckCircle2 size={64} className="text-white" />
           </div>
           <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">شكراً لتقييمك! ✅</h1>
           <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
             ملاحظاتك تساعدنا على تحسين برامجنا وتقديم قيمة أفضل لك ولجميع زملائك.
           </p>
           <div className="p-8 bg-primary/5 rounded-[40px] border-2 border-primary/10">
              <Smile className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="font-black text-primary uppercase text-sm tracking-widest">هدية لك!</p>
              <p className="text-xs text-slate-500 mt-2">لقد حصلت على خصم 10% على دورتك القادمة كشكر لمشاركتك.</p>
           </div>
           <GlassButton variant="primary" onClick={() => window.location.href = '/'}>العودة للرئيسية</GlassButton>
         </motion.div>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4 max-w-3xl mx-auto">
        <header className="text-center mb-16 space-y-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-block px-4 py-1 rounded-full bg-amber-100 text-amber-600 text-[10px] font-black uppercase tracking-[0.2em]">شاركنا رأيك</motion.div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">تقييم <span className="text-primary italic">التجربة التعليمية</span></h1>
          <div className="flex items-center justify-center gap-2 text-slate-400 font-bold uppercase text-xs">
             <span>{formData.programName}</span>
             <span className="w-1 h-1 bg-slate-200 rounded-full" />
             <span>{formData.trainerName}</span>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12 pb-20">
           <AnimatePresence mode="wait">
             <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {step === 1 && (
                  <div className="space-y-8">
                     <GlassCard className="p-12 text-center space-y-12">
                        <StarRating label="ما مدى رضاك العام عن هذا البرنامج؟" value={formData.overallRating} onChange={v => updateField('overallRating', v)} />
                        <StarRating label="هل حقق البرنامج توقعاتك؟" value={formData.metExpectations} onChange={v => updateField('metExpectations', v)} />
                        <StarRating label="هل توصي بهذا البرنامج لزميل؟" value={formData.recommendScore} onChange={v => updateField('recommendScore', v)} />
                     </GlassCard>
                     
                     <GlassCard className="p-12 text-center space-y-6">
                        <label className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest leading-loose">ما مدى احتمال توصيتك بنا؟ (NPS)</label>
                        <div className="px-4">
                           <input 
                            type="range" min="0" max="10" step="1" 
                            value={formData.nps} onChange={e => updateField('nps', parseInt(e.target.value))}
                            className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-primary" 
                           />
                           <div className="flex justify-between mt-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                              <span>لن أوصي أبداً (0)</span>
                              <span className="text-lg text-primary">{formData.nps}</span>
                              <span>أوصي بشدة (10)</span>
                           </div>
                        </div>
                     </GlassCard>
                  </div>
                )}

                {step === 2 && (
                  <GlassCard className="p-12 space-y-8">
                     <p className="font-black text-slate-900 dark:text-white uppercase text-center tracking-[0.2em] opacity-40">Section 2: Goals & Personal Growth</p>
                     <div className="grid gap-6">
                        <SelectionRow label="اكتسبت مهارات/معارف جديدة مفيدة" value={formData.skillGain} onChange={v => updateField('skillGain', v)} />
                        <SelectionRow label="أستطيع تطبيق ما تعلمته في عملي" value={formData.canApply} onChange={v => updateField('canApply', v)} />
                        <SelectionRow label="المحتوى كان واضحاً وسهل الفهم" value={formData.clarity} onChange={v => updateField('clarity', v)} />
                        <SelectionRow label="التمارين العملية ساعدتني على التعلّم" value={formData.exerciseValue} onChange={v => updateField('exerciseValue', v)} />
                        <SelectionRow label="الوقت المستثمر في البرنامج كان يستحق" value={formData.timeValue} onChange={v => updateField('timeValue', v)} />
                     </div>
                  </GlassCard>
                )}

                {step === 3 && (
                  <GlassCard className="p-12 space-y-8">
                     <p className="font-black text-slate-900 dark:text-white uppercase text-center tracking-[0.2em] opacity-40">Section 3: Trainer Performance</p>
                     <div className="grid gap-6">
                        <SelectionRow label="المدرب كان ملمّاً بالموضوع" value={formData.trainerKnowledge} onChange={v => updateField('trainerKnowledge', v)} />
                        <SelectionRow label="المدرب شجّع على المشاركة والأسئلة" value={formData.trainerEngagement} onChange={v => updateField('trainerEngagement', v)} />
                        <SelectionRow label="المدرب قدّم تغذية راجعة مفيدة" value={formData.trainerFeedback} onChange={v => updateField('trainerFeedback', v)} />
                        <SelectionRow label="أسلوب العرض كان مشوقاً ومنظماً" value={formData.trainerStyle} onChange={v => updateField('trainerStyle', v)} />
                     </div>
                  </GlassCard>
                )}

                {step === 4 && (
                   <GlassCard className="p-12 space-y-8">
                     <p className="font-black text-slate-900 dark:text-white uppercase text-center tracking-[0.2em] opacity-40">Section 4: Logistics & Support</p>
                     <div className="grid gap-6">
                        <SelectionRow label="منصة/مكان التدريب كان مناسباً" value={formData.locationRating} onChange={v => updateField('locationRating', v)} />
                        <SelectionRow label="المواد التدريبية كانت مفيدة" value={formData.materialsRating} onChange={v => updateField('materialsRating', v)} />
                        <SelectionRow label="مدة البرنامج كانت مناسبة للمحتوى" value={formData.durationRating} onChange={v => updateField('durationRating', v)} />
                        <SelectionRow label="الدعم الفني/الإداري كان مستجيباً" value={formData.supportRating} onChange={v => updateField('supportRating', v)} />
                     </div>
                  </GlassCard>
                )}

                {step === 5 && (
                  <div className="space-y-6">
                     <GlassCard className="p-12 space-y-8">
                        <p className="font-black text-slate-900 dark:text-white uppercase text-center tracking-[0.2em] opacity-40">Section 5: Final Thoughts</p>
                        <div className="grid gap-12">
                           <div className="space-y-4">
                              <label className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest leading-loose">ما أهم شيء تعلمته في هذا البرنامج؟</label>
                              <textarea className="w-full h-32 glass-card p-6 border-none outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-700 dark:text-white resize-none" value={formData.keyLearning} onChange={e => updateField('keyLearning', e.target.value)} />
                           </div>
                           <div className="space-y-4">
                              <label className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest leading-loose">الشيء الوحيد الذي نتمنى تحسينه؟</label>
                              <textarea className="w-full h-32 glass-card p-6 border-none outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-700 dark:text-white resize-none" value={formData.improvement} onChange={e => updateField('improvement', e.target.value)} />
                           </div>
                        </div>
                     </GlassCard>

                     <label className="flex items-center gap-4 cursor-pointer p-6 rounded-3xl bg-primary/5 border-2 border-primary/10 transition-all hover:bg-primary/10">
                        <input type="checkbox" checked={formData.consent} onChange={e => updateField('consent', e.target.checked)} className="w-6 h-6 rounded-lg text-primary focus:ring-primary" />
                        <span className="text-xs font-black uppercase text-primary tracking-widest leading-relaxed">أوافق على استخدام تقييمي لأغراض تحسين الجودة</span>
                     </label>
                  </div>
                )}
             </motion.div>
           </AnimatePresence>

           <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center justify-between w-full max-w-lg px-8 py-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl z-50">
              <GlassButton variant="secondary" type="button" disabled={step === 1} onClick={() => setStep(step - 1)} className="rounded-2xl px-8 h-14 border-none bg-slate-100  dark:bg-slate-800 dark:text-white">السابق</GlassButton>
              <div className="flex gap-2">
                 {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={cn("w-2 h-2 rounded-full transition-all duration-500", step === i ? "bg-primary w-6" : "bg-slate-300 dark:bg-slate-700")} />
                 ))}
              </div>
              {step < 5 ? (
                <GlassButton variant="primary" type="button" onClick={() => (formData.overallRating > 0 || step > 1) ? setStep(step + 1) : alert('يرجى التقييم للمتابعة')} className="rounded-2xl px-12 h-14 font-black uppercase tracking-widest">التالي</GlassButton>
              ) : (
                <GlassButton variant="primary" type="submit" loading={loading} className="rounded-2xl px-12 h-14 font-black uppercase tracking-widest bg-green-500 border-none shadow-xl shadow-green-500/20">إرسال 🚀</GlassButton>
              )}
           </div>
        </form>
      </div>
    </div>
  );
}

function SelectionRow({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 group hover:shadow-lg transition-all">
       <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</span>
       <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(i => (
             <button
              key={i}
              type="button"
              onClick={() => onChange(i)}
              className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all border-2",
                value === i ? "bg-primary text-white border-primary" : 
                value > 0 ? "bg-white dark:bg-slate-800 text-slate-300 border-slate-100 dark:border-slate-700 opacity-30" :
                "bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700 hover:border-primary/50"
              )}
             >
                {i}
             </button>
          ))}
       </div>
    </div>
  );
}
