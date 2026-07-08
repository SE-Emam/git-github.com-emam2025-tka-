import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Send, 
  User, 
  BookOpen, 
  TrendingUp, 
  CheckCircle2, 
  ExternalLink,
  MessageCircle,
  Linkedin,
  Mail,
  Copy,
  Plus,
  ArrowRight,
  Filter,
  FileText,
  Smile,
  Star
} from 'lucide-react';
import { db } from '@/src/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Navbar, GlassCard, GlassButton } from '@/src/components/common/Layout';
import { cn } from '@/src/lib/utils';
import { shareAssessment } from '@/src/lib/shareUtils';
import { createAssessmentRequest } from '@/src/services/firestoreService';
import { getAssessmentsFromSQL } from '@/src/services/hybridApiService';
import { useAuth } from '@/src/context/AuthContext';
import { useLanguage } from '@/src/context/LanguageContext';

type AssessmentType = 'trainer_eval' | 'program_eval' | 'student_feedback' | 'performance_track';

export default function AssessmentManager() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = React.useState<AssessmentType>('trainer_eval');
  const [assessments, setAssessments] = React.useState<any[]>([]);
  const [requests, setRequests] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [showRequests, setShowRequests] = React.useState(false);
  const [shareData, setShareData] = React.useState({
    type: 'trainer_eval' as AssessmentType,
    targetName: '',
    targetId: '',
    recipientId: '',
    recipientEmail: ''
  });

  React.useEffect(() => {
    setLoading(true);
    
    const fetchAssessments = async () => {
      const sqlMap = {
        'trainer_eval': 'trainer',
        'program_eval': 'program',
        'student_feedback': 'student_feedback',
        'performance_track': 'performance'
      };
      const data = await getAssessmentsFromSQL(sqlMap[activeTab]);
      setAssessments(data);
      setLoading(false);
    };
    
    fetchAssessments();

    const qReq = query(collection(db, 'assessmentRequests'), orderBy('createdAt', 'desc'));
    const unsubReq = onSnapshot(qReq, (snap) => {
       setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubReq();
    };
  }, [activeTab]);

  const handleCreateRequest = async () => {
    if (!user) return;
    try {
      const typeKey = 
        shareData.type === 'trainer_eval' ? 'trainer' :
        shareData.type === 'program_eval' ? 'program' :
        shareData.type === 'student_feedback' ? 'student_feedback' : 'performance';

      const requestId = await createAssessmentRequest({
        type: typeKey as any,
        recipientId: shareData.recipientId || '',
        targetId: shareData.targetId || '',
        targetName: shareData.targetName,
        requestedBy: user.uid
      });
      
      // For external sharing, we get the request doc to get the token
      const tokenSnap = requests.find(r => r.id === requestId);
      const token = tokenSnap?.shareToken || Math.random().toString(36).substring(2, 11);
      
      const typePath = 
        shareData.type === 'trainer_eval' ? 'trainer' :
        shareData.type === 'program_eval' ? 'program' :
        shareData.type === 'student_feedback' ? 'student' : 'performance';
        
      const shareUrl = shareAssessment.generateUrl(typePath, requestId!, token);
      
      navigator.clipboard.writeText(shareUrl);
      alert("تم إنشاء طلب التقييم ونسخ الرابط بنجاح!");
      setShowShareModal(false);
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء إنشاء الطلب");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
           <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter">{t('qualityTitle')}</h1>
              <p className="text-slate-500 mt-2 font-medium">{t('qualitySubtitle')}</p>
           </div>
           <GlassButton variant="primary" className="gap-2 px-8" onClick={() => setShowShareModal(true)}>
             <Plus size={20} /> {t('qualityCreateNew')}
           </GlassButton>
        </header>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-8 bg-white/50 dark:bg-slate-900/50 p-2 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
           {[
             { id: 'trainer_eval', label: t('qualityTrainerEval'), icon: <User size={16}/> },
             { id: 'program_eval', label: t('qualityProgramEval'), icon: <BookOpen size={16}/> },
             { id: 'student_feedback', label: t('qualityStudentFeedback'), icon: <Smile size={16}/> },
             { id: 'performance_track', label: t('qualityPerformanceTrack'), icon: <TrendingUp size={16}/> }
           ].map(tab => (
             <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AssessmentType)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                activeTab === tab.id 
                  ? "bg-primary text-white shadow-lg shadow-primary/20 neon-primary" 
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-800/40"
              )}
             >
                {tab.icon} {tab.label}
             </button>
           ))}
        </div>

        <div className="grid gap-6">
           {loading ? (
             <div className="grid md:grid-cols-3 gap-6">
               {[1, 2, 3].map(i => <div key={i} className="h-64 glass-card animate-pulse" />)}
             </div>
           ) : assessments.length === 0 ? (
             <GlassCard className="p-20 text-center space-y-4">
                <BarChart3 size={48} className="text-slate-200 mx-auto" />
                <p className="text-slate-400 font-bold">{t('qualityNone')}</p>
             </GlassCard>
           ) : (
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assessments.map(item => (
                  <AssessmentCard type={activeTab as AssessmentType} data={item} />
                ))}
             </div>
           )}
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
         {showShareModal && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setShowShareModal(false)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden shadow-primary/10 border border-slate-100 dark:border-slate-800"
              >
                 <div className="p-12 space-y-8 text-right">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">إنشاء رابط <span className="text-primary italic">تقييم مخصص</span></h2>
                    
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-loose">نوع النموذج</label>
                          <select 
                            value={shareData.type} 
                            onChange={e => setShareData(prev => ({ ...prev, type: e.target.value as AssessmentType }))}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 font-bold outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all appearance-none"
                          >
                             <option value="trainer_eval">نموذج قياس جودة المدرب</option>
                             <option value="program_eval">نموذج قياس جودة البرنامج</option>
                             <option value="student_feedback">نموذج تقييم من المتدرب</option>
                             <option value="performance_track">نموذج تقييم المتدرب</option>
                          </select>
                       </div>
                       
                       <FormInput label="اسم الشخص/البرنامج المستهدف" value={shareData.targetName} onChange={v => setShareData(p => ({ ...p, targetName: v }))} />
                       <FormInput label="البريد الإلكتروني للمستلم (اختياري)" value={shareData.recipientEmail} onChange={v => setShareData(p => ({ ...p, recipientEmail: v }))} />
                    </div>

                    <div className="flex gap-4">
                       <GlassButton variant="secondary" className="flex-1" onClick={() => setShowShareModal(false)}>إلغاء</GlassButton>
                       <GlassButton variant="primary" className="flex-1 gap-2" onClick={handleCreateRequest}>
                          إنشاء وتطبيق الرابط <ArrowRight size={16} />
                       </GlassButton>
                    </div>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}

function AssessmentCard({ type, data }: { type: AssessmentType, data: any }) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500 bg-green-50";
    if (score >= 75) return "text-blue-500 bg-blue-50";
    if (score >= 60) return "text-orange-500 bg-orange-50";
    return "text-red-500 bg-red-50";
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
       <GlassCard className="p-8 h-full flex flex-col group hover:shadow-2xl transition-all border-none">
          <div className="flex justify-between items-start mb-6">
             <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                   {type === 'trainer_eval' ? <User size={20}/> : type === 'program_eval' ? <BookOpen size={20}/> : type === 'student_feedback' ? <Smile size={20}/> : <TrendingUp size={20}/>}
                </div>
                <div>
                   <h3 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tight">{data.targetName || data.trainerName || data.programName || data.studentName || 'غير معروف'}</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(data.submittedAt || data.createdAt).toLocaleDateString('ar-EG')}</p>
                </div>
             </div>
             {data.totalScore !== undefined && (
                <div className={cn("px-4 py-2 rounded-2xl font-black text-xs", getScoreColor(data.totalScore))}>
                   {data.totalScore}%
                </div>
             )}
              {data.overallRating !== undefined && (
                <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-4 py-2 rounded-2xl font-black text-xs">
                   {data.overallRating} <Star size={12} fill="currentColor" />
                </div>
             )}
          </div>

          <div className="flex-1 space-y-4">
             <p className="text-sm font-medium text-slate-600 dark:text-slate-400 line-clamp-2">{data.notes || data.feedback || data.strengths || data.keyLearning || 'لا توجد ملاحظات واضحة مسجلة حتى الآن...'}</p>
             
             <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50 dark:border-slate-800">
                <button onClick={() => shareAssessment.whatsapp('تحقق من هذا التقييم:', window.location.href)} className="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all"><MessageCircle size={14}/></button>
                <button onClick={() => shareAssessment.linkedin(window.location.href)} className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all"><Linkedin size={14}/></button>
                <button onClick={() => shareAssessment.email('تقرير تقييم جديد', 'يمكنك الاطلاع على التقرير من هنا')} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><Mail size={14}/></button>
                <button onClick={() => shareAssessment.pdf()} className="w-8 h-8 rounded-lg bg-slate-500/10 text-slate-500 flex items-center justify-center hover:bg-slate-500 hover:text-white transition-all"><FileText size={14}/></button>
             </div>
          </div>

          <GlassButton variant="secondary" className="w-full mt-6 gap-2 text-[10px] font-black uppercase tracking-[0.2em] h-12 rounded-xl">
            عرض التفاصيل <ExternalLink size={12} />
          </GlassButton>
       </GlassCard>
    </motion.div>
  );
}

function FormInput({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-loose">{label}</label>
      <input 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all" 
      />
    </div>
  );
}
