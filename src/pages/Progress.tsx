import * as React from 'react';
import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import { GlassCard, GlassButton } from '@/src/components/common/Layout';
import { useLanguage } from '@/src/context/LanguageContext';
import { 
  Plus, 
  Search, 
  Trash2, 
  FileEdit, 
  Download, 
  Globe,
  Upload,
  BookOpen,
  User,
  Check,
  TrendingUp,
  History,
  MessageCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/context/AuthContext';
import {
  getTrainerGroupsFromSQL,
  getAllGroupsFromSQL,
  getStudentsInGroupFromSQL,
  getGroupProgressFromSQL,
  recordStudentProgressInSQL
} from '@/src/services/hybridApiService';
import { addLearningMaterial, getMaterialsByGroup } from '@/src/services/firestoreService';

export default function Progress() {
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const [groups, setGroups] = React.useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = React.useState('');
  const [students, setStudents] = React.useState<any[]>([]);
  const [materials, setMaterials] = React.useState<any[]>([]);
  const [groupProgress, setGroupProgress] = React.useState<any[]>([]);
  const [activeTab, setActiveTab] = React.useState<'marks' | 'materials'>('marks');
  const [loading, setLoading] = React.useState(true);
  
  // Mark Recording State
  const [selectedStudentId, setSelectedStudentId] = React.useState('');
  const [marks, setMarks] = React.useState('');
  const [maxMarks, setMaxMarks] = React.useState('100');
  const [feedback, setFeedback] = React.useState('');
  const [type, setType] = React.useState<'assignment' | 'exam' | 'quiz'>('assignment');
  const [recording, setRecording] = React.useState(false);

  // Material Upload State
  const [matTitle, setMatTitle] = React.useState('');
  const [matUrl, setMatUrl] = React.useState('');
  const [matDesc, setMatDesc] = React.useState('');

  React.useEffect(() => {
    async function loadGroups() {
      if (!user || !profile) return;
      let fetchedGroups = [];
      if (profile.role === 'trainer') {
        fetchedGroups = await getTrainerGroupsFromSQL(user.uid);
      } else {
        fetchedGroups = await getAllGroupsFromSQL();
      }
      setGroups(fetchedGroups);
      if (fetchedGroups.length > 0 && !selectedGroupId) {
        setSelectedGroupId(fetchedGroups[0].id);
      }
      setLoading(false);
    }
    loadGroups();
  }, [user, profile]);

  React.useEffect(() => {
    async function fetchGroupData() {
      if (!selectedGroupId) return;
      
      const studentsInGroup = await getStudentsInGroupFromSQL(selectedGroupId);
      setStudents(studentsInGroup);

      const progressData = await getGroupProgressFromSQL(selectedGroupId);
      setGroupProgress(progressData);
    }
    fetchGroupData();

    if (selectedGroupId) {
       // Materials are still fetched from Firebase for now if there is no endpoint
       const unsubMat = getMaterialsByGroup(selectedGroupId, setMaterials);
       return () => unsubMat();
    }
  }, [selectedGroupId]);

  const handleRecordProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedStudentId) return;
    setRecording(true);
    try {
      await recordStudentProgressInSQL({
        studentId: selectedStudentId,
        trainerId: user.uid,
        groupId: selectedGroupId,
        marks: Number(marks),
        maxMarks: Number(maxMarks),
        feedback,
        taskName: type
      });
      setMarks('');
      setFeedback('');
      alert(t('reminderSent'));
      
      // Refresh progress metrics
      const progressData = await getGroupProgressFromSQL(selectedGroupId);
      setGroupProgress(progressData);
    } catch (error) {
      console.error(error);
    } finally {
      setRecording(false);
    }
  };

  const myMaterials = materials.filter(m => m.trainerId === user?.uid);

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addLearningMaterial({
        title: matTitle,
        description: matDesc,
        fileUrl: matUrl,
        trainerId: user.uid,
        groupId: selectedGroupId
      });
      setMatTitle('');
      setMatUrl('');
      setMatDesc('');
      alert("✅ Done");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DashboardLayout role={profile?.role || 'trainer'} userName={profile?.displayName || user?.displayName || "Trainer"}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">{t('academicPortal')}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{profile?.role === 'trainer' ? 'Manage evaluations and materials' : 'View your academic progress'}</p>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
             <button 
               onClick={() => setActiveTab('marks')}
               className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", activeTab === 'marks' ? "bg-white text-primary shadow-sm dark:bg-slate-700" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200")}
             >
                {t('marksFeedback')}
             </button>
             <button 
                onClick={() => setActiveTab('materials')}
                className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", activeTab === 'materials' ? "bg-white text-secondary shadow-sm dark:bg-slate-700" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200")}
             >
                {t('courseMaterial')}
             </button>
          </div>
        </div>

        {/* Group Selector */}
        <div className="flex items-center gap-4">
           <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{t('selectGroup')}:</label>
           <select 
             className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary text-slate-900 dark:text-white font-bold shadow-sm"
             value={selectedGroupId}
             onChange={(e) => setSelectedGroupId(e.target.value)}
           >
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
           </select>
        </div>

        <div className="grid xl:grid-cols-3 gap-8">
           {activeTab === 'marks' ? (
             <>
               <div className="xl:col-span-1">
                  <GlassCard className="p-6 h-full shadow-sm">
                     <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white"><Plus size={18} className="text-primary" /> {t('evaluateStudent')}</h3>
                     <form onSubmit={handleRecordProgress} className="space-y-4">
                        <div className="space-y-1">
                           <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 dark:text-slate-500">{t('student')}</label>
                           <select 
                             required 
                             className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none text-slate-900 dark:text-white"
                             value={selectedStudentId}
                             onChange={(e) => setSelectedStudentId(e.target.value)}
                           >
                              <option value="">{t('searchStudent')}...</option>
                              {students.map(s => (
                                <option key={s.id} value={s.id}>{s.displayName || s.fullName || s.name}</option>
                              ))}
                           </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 dark:text-slate-500">{t('marks')}</label>
                              <select 
                                required 
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none text-slate-900 dark:text-white font-bold appearance-none"
                                value={marks} 
                                onChange={(e) => {
                                  setMarks(e.target.value);
                                  setMaxMarks('100');
                                }}
                              >
                                <option value="">{t('selectGrade' as any)}</option>
                                <option value="100">{language === 'ar' ? 'امتياز (100)' : 'Excellent (100)'}</option>
                                <option value="90">{language === 'ar' ? 'جيد جداً مرتفع (90)' : 'Very Good High (90)'}</option>
                                <option value="80">{language === 'ar' ? 'جيد جداً (80)' : 'Very Good (80)'}</option>
                                <option value="70">{language === 'ar' ? 'جيد (70)' : 'Good (70)'}</option>
                                <option value="60">{language === 'ar' ? 'مقبول (60)' : 'Pass (60)'}</option>
                                <option value="50">{language === 'ar' ? 'ضعيف (50)' : 'Weak (50)'}</option>
                                <option value="0">{language === 'ar' ? 'راسب (0)' : 'Fail (0)'}</option>
                              </select>
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 dark:text-slate-500">{t('maxMarks')}</label>
                              <input required type="number" readOnly className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none text-slate-400" value={maxMarks} />
                           </div>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 dark:text-slate-500">{t('type')}</label>
                           <select 
                             className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none text-slate-900 dark:text-white"
                             value={type}
                             onChange={(e) => setType(e.target.value as any)}
                           >
                              <option value="assignment">{t('assignment')}</option>
                              <option value="exam">{t('exam')}</option>
                              <option value="quiz">{t('quiz')}</option>
                           </select>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 dark:text-slate-500">{t('feedback')}</label>
                           <textarea rows={3} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none text-slate-900 dark:text-white resize-none" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
                        </div>
                        <GlassButton type="submit" variant="primary" className="w-full py-4 bg-primary text-white border-none shadow-lg shadow-primary/20" disabled={recording}>
                           {recording ? t('saving') : t('postMarks')}
                        </GlassButton>
                     </form>
                  </GlassCard>
               </div>
               <div className="xl:col-span-2">
                  <GlassCard noPadding className="h-full shadow-sm overflow-hidden border border-slate-200 dark:border-slate-800">
                      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-slate-900 dark:text-white">
                         <h3 className="font-bold">{t('evaluationHistory')}</h3>
                         <span className="text-[10px] font-bold bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-tighter">{groupProgress.length} {t('entries' as any)}</span>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto max-h-[600px] custom-scrollbar text-slate-900">
                         {groupProgress.length > 0 ? (
                           groupProgress.map((p) => {
                             const student = students.find(s => s.id === p.userId || s.id === p.studentId || s.uid === p.studentId);
                             return (
                               <div key={p.id} className="p-6 flex items-start justify-between group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                  <div className="flex gap-4">
                                     <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                                        <User size={20} />
                                     </div>
                                     <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{student?.displayName || student?.fullName || student?.name || p.studentName || 'Student'}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                           <span className={cn(
                                             "text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded",
                                             (p.taskName || p.type) === 'exam' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                                           )}>{t((p.taskName || p.type) as any)}</span>
                                           <span className="text-[10px] text-slate-400 dark:text-slate-500">{p.createdAt && p.createdAt.seconds ? new Date(p.createdAt.seconds * 1000).toLocaleDateString() : (p.createdAt ? new Date(p.createdAt).toLocaleDateString() : new Date().toLocaleDateString())}</span>
                                        </div>
                                        {p.feedback && (
                                           <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-white/50 dark:bg-slate-900/20 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 italic text-justify">
                                              "{p.feedback}"
                                           </p>
                                        )}
                                     </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                     <p className="text-lg font-bold text-primary">{p.marks}<span className="text-slate-300 dark:text-slate-700">/{p.maxMarks}</span></p>
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('score')}</p>
                                  </div>
                               </div>
                             );
                           })
                         ) : (
                           <div className="p-12 text-center">
                              <History size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                              <h4 className="text-lg font-bold text-slate-400 dark:text-slate-600">{t('noGrading')}</h4>
                              <p className="text-sm text-slate-300 dark:text-slate-700 mt-2">Evaluation records are private and isolated per instructor.</p>
                           </div>
                         )}
                      </div>
                  </GlassCard>
               </div>
             </>
           ) : (
             <>
               <div className="xl:col-span-1">
                  <GlassCard className="p-6 h-full shadow-sm text-slate-900 dark:text-white">
                     <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Upload size={18} className="text-secondary" /> {t('addMaterial')}</h3>
                     <form onSubmit={handleAddMaterial} className="space-y-4">
                        <div className="space-y-1">
                           <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 dark:text-slate-500">{t('materialTitle')}</label>
                           <input required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none text-slate-900 dark:text-white" value={matTitle} onChange={(e) => setMatTitle(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 dark:text-slate-500">{t('materialLink')}</label>
                           <input required type="url" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none text-slate-900 dark:text-white" value={matUrl} onChange={(e) => setMatUrl(e.target.value)} placeholder="https://..." />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 dark:text-slate-500">{t('labelDesc')}</label>
                           <textarea rows={3} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none text-slate-900 dark:text-white resize-none" value={matDesc} onChange={(e) => setMatDesc(e.target.value)} />
                        </div>
                        <GlassButton type="submit" className="w-full py-4 bg-secondary text-white border-none shadow-lg shadow-secondary/20 font-bold">
                           {t('uploadContent')}
                        </GlassButton>
                     </form>
                  </GlassCard>
               </div>
               <div className="xl:col-span-2">
                  <div className="grid md:grid-cols-2 gap-4 text-slate-900">
                     {myMaterials.map(m => (
                       <GlassCard key={m.id} className="p-6 border border-slate-100 dark:border-slate-800 hover:border-secondary dark:hover:border-secondary transition-all group">
                          <div className="flex justify-between items-start mb-4">
                             <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                                <BookOpen size={20} />
                             </div>
                             <a href={m.fileUrl} target="_blank" className="p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-primary">
                                <Download size={16} />
                             </a>
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white mb-1">{m.title}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 md:line-clamp-none leading-relaxed">{m.description}</p>
                          <div className="flex items-center gap-2 mt-4">
                             <span className="text-[8px] font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400">Resource</span>
                             <span className="text-[8px] font-bold uppercase tracking-widest bg-green-100 dark:bg-green-900/20 px-2 py-0.5 rounded text-green-600 dark:text-green-400">Your Content</span>
                          </div>
                       </GlassCard>
                     ))}
                     {myMaterials.length === 0 && <div className="md:col-span-2 py-20 text-center text-slate-400 dark:text-slate-600 italic">No course materials uploaded yet.</div>}
                  </div>
               </div>
             </>
           )}
        </div>
      </div>
    </DashboardLayout>
  );
}
