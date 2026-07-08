import * as React from 'react';
import { motion } from 'motion/react';
import { 
  LineChart, 
  Target, 
  Users, 
  Award, 
  Smile, 
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
  MessageCircle,
  FileText
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Navbar, GlassCard, GlassButton } from '@/src/components/common/Layout';
import { RatingScale, AssessmentSection } from '@/src/components/assessments/AssessmentUI';
import { useSearchParams } from 'react-router-dom';
import { submitAssessmentToSQL } from '@/src/services/hybridApiService';

export default function PerformanceTrackingForm() {
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('requestId') || '';
  const [loading, setLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const [formData, setFormData] = React.useState({
    studentId: '',
    studentName: '',
    programName: '',
    trainerName: '',
    assessmentType: 'final', // mid, final, followup

    attendanceRate: 0, // %
    completionRate: 0, // %
    commitmentLevel: '', // excellent, good, average, weak
    participationLevel: '', 
    peerInteraction: '',

    theoreticalScore: 0, // 1-100
    practicalScore: 0, 
    projectScore: 0,

    skillsBefore: [0, 0, 0, 0, 0],
    skillsAfter: [0, 0, 0, 0, 0],
    skillNames: ['', '', '', '', ''],

    workplaceApplication: '',
    impactOnPerformance: '',
    obstacles: '',
    additionalSupport: '',

    strengths: '',
    developmentAreas: '',
    trainerRecommendation: '',
    followUpPlan: '',
    
    finalGrade: 0
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateSkill = (index: number, type: 'before' | 'after', value: number) => {
    setFormData(prev => {
      const skills = type === 'before' ? [...prev.skillsBefore] : [...prev.skillsAfter];
      skills[index] = value;
      return { ...prev, [type === 'before' ? 'skillsBefore' : 'skillsAfter']: skills };
    });
  };

  const updateSkillName = (index: number, name: string) => {
    setFormData(prev => {
      const names = [...prev.skillNames];
      names[index] = name;
      return { ...prev, skillNames: names };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitAssessmentToSQL('performance', {
        requestId,
        ...formData
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
      alert('فشل حفظ التقييم');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Navbar />
        <GlassCard className="max-w-md w-full p-12 text-center space-y-6">
           <CheckCircle2 size={64} className="text-green-500 mx-auto" />
           <h1 className="text-2xl font-black text-slate-900 uppercase">تم تقييم أداء المتدرب</h1>
           <GlassButton variant="primary" onClick={() => window.location.href = '/'}>العودة للرئيسية</GlassButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <div className="pt-32 pb-20 px-4 max-w-5xl mx-auto">
        <header className="mb-16 text-center space-y-4">
           <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
              <TrendingUp size={12} /> تتبع الأداء والالتزام
           </div>
           <h1 className="text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">قياس <span className="text-primary italic">تطور المتدرب</span></h1>
           <p className="text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">تتبع التقدم المعرفي والمهاري للمتدرب خلال وبعد البرنامج التدريبي لضمان أقصى استفادة.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-20">
           <AssessmentSection title="القسم 1: معلومات المتدرب والبرنامج" icon={<Users />}>
              <GlassCard className="p-8 grid md:grid-cols-3 gap-6">
                 <FormInput label="اسم المتدرب" value={formData.studentName} onChange={v => updateField('studentName', v)} />
                 <FormInput label="البرنامج التدريبي" value={formData.programName} onChange={v => updateField('programName', v)} />
                 <FormInput label="المدرب المسؤول" value={formData.trainerName} onChange={v => updateField('trainerName', v)} />
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">نوع التقييم</label>
                    <div className="flex gap-2">
                       {['stage', 'final', 'followup'].map(type => (
                          <button key={type} type="button" onClick={() => updateField('assessmentType', type)} className={cn("flex-1 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest border-2 transition-all", formData.assessmentType === type ? "bg-primary text-white border-primary" : "bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-800")}>
                             {type === 'stage' ? 'مرحلي' : type === 'final' ? 'نهائي' : 'متابعة'}
                          </button>
                       ))}
                    </div>
                 </div>
              </GlassCard>
           </AssessmentSection>

           <AssessmentSection title="القسم 2: مؤشرات الالتزام والحضور" icon={<Target />}>
              <div className="grid md:grid-cols-2 gap-6">
                 <IndicatorCard label="نسبة الحضور" value={formData.attendanceRate} onChange={v => updateField('attendanceRate', v)} min={0} max={100} unit="%" />
                 <IndicatorCard label="نسبة إكمال المهام" value={formData.completionRate} onChange={v => updateField('completionRate', v)} min={0} max={100} unit="%" />
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                 <SelectGroup label="الالتزام بالمواعيد" value={formData.commitmentLevel} onChange={v => updateField('commitmentLevel', v)} options={['ممتاز', 'جيد', 'متوسط', 'ضعيف']} />
                 <SelectGroup label="المشاركة في النقاش" value={formData.participationLevel} onChange={v => updateField('participationLevel', v)} options={['نشط جداً', 'نشط', 'متوسط', 'محدود']} />
                 <SelectGroup label="التفاعل مع الزملاء" value={formData.peerInteraction} onChange={v => updateField('peerInteraction', v)} options={['ممتاز', 'جيد', 'متوسط', 'ضعيف']} />
              </div>
           </AssessmentSection>

           <AssessmentSection title="القسم 3: التقدم المعرفي والمهاري" icon={<BrainCircuit />}>
               <GlassCard className="p-8 space-y-12">
                  <div className="grid md:grid-cols-3 gap-8">
                     <ScoreInput label="الاختبار النظري" value={formData.theoreticalScore} onChange={v => updateField('theoreticalScore', v)} />
                     <ScoreInput label="الاختبار التطبيقي" value={formData.practicalScore} onChange={v => updateField('practicalScore', v)} />
                     <ScoreInput label="مشروع التخرج" value={formData.projectScore} onChange={v => updateField('projectScore', v)} />
                  </div>

                  <div className="space-y-6 pt-12 border-t border-slate-100 dark:border-slate-800">
                     <p className="font-black text-slate-800 dark:text-slate-100 uppercase text-xs tracking-widest text-center">مقارنة المهارات (قبل / بعد)</p>
                     <div className="space-y-8">
                        {[0, 1, 2, 3, 4].map(idx => (
                           <div key={idx} className="grid md:grid-cols-4 items-center gap-6 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50">
                              <input placeholder={`اسم المهارة ${idx + 1}`} value={formData.skillNames[idx]} onChange={e => updateSkillName(idx, e.target.value)} className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3 font-bold text-sm outline-none" />
                              <div className="space-y-2">
                                 <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest text-center">قبل</p>
                                 <RatingDots value={formData.skillsBefore[idx]} onChange={v => updateSkill(idx, 'before', v)} />
                              </div>
                              <div className="space-y-2">
                                 <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest text-center">بعد</p>
                                 <RatingDots value={formData.skillsAfter[idx]} onChange={v => updateSkill(idx, 'after', v)} color="bg-green-500" />
                              </div>
                              <div className="text-center">
                                 <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">معدل التحسن</p>
                                 <p className="text-lg font-black text-green-500">+{((formData.skillsAfter[idx] - formData.skillsBefore[idx]) / (formData.skillsBefore[idx] || 1) * 100).toFixed(0)}%</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </GlassCard>
           </AssessmentSection>

           <AssessmentSection title="القسم 4: التقييم النوعي والتوصيات" icon={<MessageCircle />}>
              <div className="grid gap-6">
                 <textarea className="glass-card p-6 min-h-[120px] outline-none font-bold" placeholder="أبرز نقاط القوة خلال البرنامج..." value={formData.strengths} onChange={e => updateField('strengths', e.target.value)} />
                 <textarea className="glass-card p-6 min-h-[120px] outline-none font-bold" placeholder="المجالات التي تحتاج لتطوير..." value={formData.developmentAreas} onChange={e => updateField('developmentAreas', e.target.value)} />
                 <div className="grid md:grid-cols-2 gap-6">
                    <SelectGroup label="توصية المدرب للمستقبل" value={formData.trainerRecommendation} onChange={v => updateField('trainerRecommendation', v)} options={['جاهز لمستوى متقدم', 'مواصلة التعلم في المسار', 'استكشاف مسار مرتبط', 'يحتاج دعم إضافي']} />
                    <SelectGroup label="خطة المتابعة" value={formData.followUpPlan} onChange={v => updateField('followUpPlan', v)} options={['لا يحتاج متابعة', 'موارد شهرية', 'جلسة بعد 30 يوم', 'خطة تطوير فردية']} />
                 </div>
              </div>
           </AssessmentSection>

           <footer className="flex flex-col md:flex-row items-center justify-between gap-8 pt-12 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-6">
                 <div className="w-20 h-20 bg-primary/10 rounded-3xl flex flex-col items-center justify-center text-primary">
                    <span className="text-[10px] font-black uppercase tracking-widest">الدرجة</span>
                    <span className="text-3xl font-black">{( (formData.attendanceRate + formData.completionRate + formData.theoreticalScore + formData.practicalScore + formData.projectScore) / 5 ).toFixed(0)}</span>
                 </div>
                 <div className="text-right">
                    <p className="text-xs font-black uppercase text-slate-400 tracking-widest">الدرجة النهائية المرجحة</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">حالة الإتمام: <span className="text-green-500">ناجح بامتياز</span></p>
                 </div>
              </div>
              <GlassButton variant="primary" type="submit" loading={loading} className="px-16 h-16 rounded-[2rem] text-lg font-black uppercase tracking-widest shadow-2xl shadow-primary/20">حفظ التقييم النهائي 🚀</GlassButton>
           </footer>
        </form>
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} className="w-full bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-900 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/30 transition-all" />
    </div>
  );
}

function IndicatorCard({ label, value, onChange, min, max, unit }: { label: string, value: number, onChange: (v: number) => void, min: number, max: number, unit: string }) {
  return (
    <GlassCard className="p-8 flex flex-col gap-4">
       <div className="flex justify-between items-center">
          <span className="text-xs font-black uppercase text-slate-400 tracking-widest">{label}</span>
          <span className="text-2xl font-black text-primary">{value}{unit}</span>
       </div>
       <input type="range" min={min} max={max} value={value} onChange={e => onChange(parseInt(e.target.value))} className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-primary" />
    </GlassCard>
  );
}

function SelectGroup({ label, value, onChange, options }: { label: string, value: string, onChange: (v: string) => void, options: string[] }) {
  return (
    <div className="space-y-3">
       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">{label}</label>
       <div className="flex flex-wrap gap-2">
          {options.map(opt => (
             <button key={opt} type="button" onClick={() => onChange(opt)} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border-2", value === opt ? "bg-primary text-white border-primary" : "bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-800")}>{opt}</button>
          ))}
       </div>
    </div>
  );
}

function ScoreInput({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</label>
       <div className="relative w-24 h-24">
          <input type="number" min="0" max="100" value={value} onChange={e => onChange(parseInt(e.target.value))} className="w-full h-full rounded-3xl border-4 border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 text-2xl font-black text-center outline-none focus:border-primary/30 transition-all appearance-none" />
          <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-[10px] font-black text-primary">/100</span>
       </div>
    </div>
  );
}

function RatingDots({ value, onChange, color = "bg-primary" }: { value: number, onChange: (v: number) => void, color?: string }) {
  return (
    <div className="flex justify-center gap-1">
       {[1, 2, 3, 4, 5].map(i => (
          <button key={i} type="button" onClick={() => onChange(i)} className={cn("w-6 h-6 rounded-lg transition-all", i <= value ? color : "bg-slate-200 dark:bg-slate-800 hover:bg-slate-300")} />
       ))}
    </div>
  );
}
