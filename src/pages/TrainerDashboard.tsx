import * as React from 'react';
import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import { GlassCard, GlassButton } from '@/src/components/common/Layout';
import { 
  Users, 
  CheckSquare, 
  BookOpen, 
  Plus, 
  MoreVertical, 
  Video, 
  Clock, 
  CheckCircle2, 
  XCircle,
  BarChart2,
  MessageSquare,
  PlaySquare,
  X,
  Box,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { safeStringify } from '@/src/lib/safeStringify';
import { useAuth } from '@/src/context/AuthContext';
import { 
  getTrainerGroupsFromSQL, 
  getStudentsInGroupFromSQL,
  recordStudentProgressInSQL,
  addApplicationToSQL,
  getSingleGroupFromSQL,
  apiFetch,
  getTrainerBalanceFromSQL,
  getTrainerFinancialHistoryFromSQL,
  getContractsFromSQL,
  signContractInSQL
} from '@/src/services/hybridApiService';
import { 
  DollarSign,
  TrendingUp,
  AlertTriangle,
  History,
  FileText
} from 'lucide-react';
import { 
  addStudentNote,
  sendNotification,
  getMyPendingAssessments
} from '@/src/services/firestoreService';
import { useNavigate } from 'react-router-dom';
import ChatWindow from '@/src/components/chat/ChatWindow';
import VideoLibrary from '@/src/components/dashboard/VideoLibrary';
import ToolLibrary from '@/src/components/dashboard/ToolLibrary';

export default function TrainerDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'overview' | 'groups' | 'students' | 'schedule' | 'finances' | 'contracts'>('overview');
  const [groups, setGroups] = React.useState<any[]>([]);
  const [students, setStudents] = React.useState<any[]>([]);
  const [pendingAssessments, setPendingAssessments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // Finance states
  const [balance, setBalance] = React.useState<any>(null);
  const [history, setHistory] = React.useState<{sessions: any[], transactions: any[]}>({sessions: [], transactions: []});
  
  // Contracts state
  const [contracts, setContracts] = React.useState<any[]>([]);
  const [showSignModal, setShowSignModal] = React.useState<any | null>(null);

  const fetchContracts = async () => {
    if (user) {
      const data = await getContractsFromSQL(user.uid);
      setContracts(data);
    }
  };

  const handleSignContract = async () => {
    if (!showSignModal) return;
    try {
      if (!user) return;
      await signContractInSQL(showSignModal.id, user.uid);
      alert("تم توقيع العقد بنجاح");
      setShowSignModal(null);
      fetchContracts();
    } catch (err) {
      alert("فشل التوقيع");
    }
  };

  React.useEffect(() => {
    fetchContracts();
  }, [user]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(val);
  };
  
  // Modals / Overlays
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [chatGroupId, setChatGroupId] = React.useState<string | null>(null);
  const [activeVideoLibraryGroup, setActiveVideoLibraryGroup] = React.useState<any | null>(null);
  const [activeToolLibraryGroup, setActiveToolLibraryGroup] = React.useState<any | null>(null);
  
  // Evaluation Modal
  const [evalStudent, setEvalStudent] = React.useState<any | null>(null);
  const [marks, setMarks] = React.useState('');
  const [maxMarks, setMaxMarks] = React.useState('100');
  const [feedback, setFeedback] = React.useState('');
  const [evalType, setEvalType] = React.useState<'assignment' | 'exam' | 'quiz'>('assignment');
  const [evalGroupId, setEvalGroupId] = React.useState('');

  // Task/Asset Modal
  const [showTaskModal, setShowTaskModal] = React.useState(false);
  const [taskForm, setTaskForm] = React.useState({
    name: '',
    url: '',
    category: 'tools',
    groupId: '',
    levelName: ''
  });

  // Curriculum states
  const [curriculumGroup, setCurriculumGroup] = React.useState<any>(null);
  const [curriculumData, setCurriculumData] = React.useState<any[]>([]);
  const [activeLectureIdx, setActiveLectureIdx] = React.useState<number>(-1);
  const [archivedLectures, setArchivedLectures] = React.useState<number[]>([]);
  const [loadingCurriculum, setLoadingCurriculum] = React.useState(false);

  const handleOpenCurriculum = async (group: any) => {
     setCurriculumGroup(group);
     setLoadingCurriculum(true);
     try {
        const res = await getSingleGroupFromSQL(group.id);
        if (res && res.curriculum) {
           setCurriculumData(res.curriculum);
           setActiveLectureIdx(parseInt(res.current_lecture_index) || -1);
           setArchivedLectures(res.archived_lectures || []);
        } else {
           setCurriculumData([]);
        }
     } catch (err) {
        console.error(err);
     }
     setLoadingCurriculum(false);
  };

  const handleActivateLecture = async (index: number) => {
     if (!confirm("هل أنت متأكد من تفعيل هذه المحاضرة كالمحاضرة الحالية؟ سيتم أرشفة المحاضرة السابقة.")) return;
     try {
        const res = await apiFetch('/groups.php', {
           method: 'POST',
           body: safeStringify({ action: 'activate_lecture', groupId: curriculumGroup.id, lectureIndex: index })
        });
        if (res && res.status === 'success') {
           setActiveLectureIdx(parseInt(res.current));
           setArchivedLectures(res.archived || []);
           alert("تم تحديث المحاضرة بنجاح! ستظهر الآن للطلاب كمحاضرة اليوم.");
        } else {
           alert("حدث خطأ أثناء التحديث");
        }
     } catch (err) {
        console.error(err);
     }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        try {
          const groupsData = await getTrainerGroupsFromSQL(user.uid);
          if (groupsData) {
            setGroups(groupsData);
            // Fetch students for all groups
            const allStudents: any[] = [];
            for (const g of groupsData) {
              const groupStudents = await getStudentsInGroupFromSQL(g.id);
              groupStudents.forEach((s: any) => {
                if (!allStudents.find(existing => existing.id === s.id)) {
                  allStudents.push({ ...s, groupName: g.name, groupId: g.id });
                }
              });
            }
            setStudents(allStudents);
          }
        } catch (err) {
          console.error("Error fetching trainer data:", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();

    let unsubAssessments: () => void = () => {};
    if (user) {
      unsubAssessments = getMyPendingAssessments(user.uid, (data) => {
        setPendingAssessments(data);
      });
    }

    return () => unsubAssessments();
  }, [user]);

  React.useEffect(() => {
    const fetchFinances = async () => {
      if (user && activeTab === 'finances') {
        const bal = await getTrainerBalanceFromSQL(user.uid);
        const hist = await getTrainerFinancialHistoryFromSQL(user.uid);
        setBalance(bal);
        setHistory(hist);
      }
    };
    fetchFinances();
  }, [user, activeTab]);

  const handleToggleLive = async (groupId: string, currentStatus: boolean) => {
    setGroups(prev => prev.map(g => g.id === groupId ? {...g, isLive: !currentStatus} : g));
  };

  const handleRecordMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalStudent || !user) return;
    try {
      await recordStudentProgressInSQL({
        studentId: evalStudent.uid || evalStudent.id,
        trainerId: user.uid,
        groupId: evalGroupId || evalStudent.groupId,
        marks: Number(marks),
        maxMarks: Number(maxMarks),
        feedback,
        type: evalType
      });
      alert('Evaluation recorded successfully!');
      setEvalStudent(null);
      setMarks('');
      setFeedback('');
    } catch (error) {
      alert('Failed to record mark');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
       await addApplicationToSQL(taskForm);
       alert('Task/Asset added successfully!');
       setShowTaskModal(false);
       setTaskForm({ name: '', url: '', category: 'tools', groupId: '', levelName: '' });
    } catch (error) {
       alert('Failed to add task');
    }
  };

  if (loading) {
     return (
       <DashboardLayout role="trainer" userName={profile?.displayName || "Trainer"}>
          <div className="flex items-center justify-center h-64">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
       </DashboardLayout>
     );
  }

  return (
    <DashboardLayout role={profile?.role || 'trainer'} userName={profile?.displayName || user?.displayName || "Trainer"}>
      <div className="space-y-8">
        {pendingAssessments.length > 0 && (
          <GlassCard className="bg-primary/5 border-primary/20 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-4 text-right md:text-right">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                   <MessageSquare className="animate-bounce" />
                </div>
                <div>
                   <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">لديك <span className="text-primary">{pendingAssessments.length}</span> تقييمات معلقة</h3>
                   <p className="text-xs font-medium text-slate-500">مطلوب تقييم أداء المتدربين لمتابعة الجودة.</p>
                </div>
             </div>
             <div className="flex gap-2">
                {pendingAssessments.map(item => (
                  <GlassButton 
                    key={item.id}
                    variant="primary" 
                    className="text-[10px] px-4 py-2"
                    onClick={() => navigate(`/assessments/performance?requestId=${item.id}&token=${item.shareToken}`)}
                  >
                    تقييم {item.targetName || 'المتدرب'}
                  </GlassButton>
                ))}
             </div>
          </GlassCard>
        )}
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black font-display tracking-tight text-slate-900 dark:text-white uppercase">مركز المدربين / Trainer Hub 🛠️</h1>
            <p className="text-slate-500 mt-1 dark:text-slate-400 font-medium">Powering the next generation of Tech Talents.</p>
          </div>
          <div className="flex items-center gap-2">
             <GlassButton icon={Plus} variant="primary" onClick={() => setShowTaskModal(true)}>إضافة محتوى / Add Asset</GlassButton>
             <GlassButton icon={MessageSquare} variant="secondary" onClick={() => {
                setChatGroupId('general');
                setIsChatOpen(true);
             }}>System Chat</GlassButton>
          </div>
        </div>

        {/* Modular Tabs */}
        <div className="flex border-b border-slate-200 gap-8 overflow-x-auto no-scrollbar dark:border-slate-800">
           {[
             { id: 'overview', label: 'Overview', icon: BarChart2 },
             { id: 'groups', label: 'My Groups', icon: Users },
             { id: 'students', label: 'Students', icon: BookOpen },
             { id: 'schedule', label: 'Schedule', icon: Clock },
             { id: 'finances', label: 'Finances', icon: DollarSign },
             { id: 'contracts', label: 'Contracts', icon: FileText },
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={cn(
                 "pb-4 text-sm font-bold whitespace-nowrap px-1 border-b-2 transition-all flex items-center gap-2 uppercase tracking-widest",
                 activeTab === tab.id 
                   ? "border-primary text-primary" 
                   : "border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
               )}
             >
               <tab.icon size={16} />
               {tab.label}
             </button>
           ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <GlassCard className="bg-primary/5 border-primary/10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Active Groups</p>
                    <h4 className="text-3xl font-black text-slate-900 dark:text-white">{groups.length}</h4>
                  </GlassCard>
                  <GlassCard className="bg-secondary/5 border-secondary/10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">Total Students</p>
                    <h4 className="text-3xl font-black text-slate-900 dark:text-white">{students.length}</h4>
                  </GlassCard>
                  <GlassCard className="bg-green-500 text-white border-0 shadow-lg shadow-green-500/20">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">Live Right Now</p>
                    <h4 className="text-3xl font-black">{groups.filter(g => g.isLive).length}</h4>
                  </GlassCard>
                  <GlassCard className="bg-slate-900 text-white border-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">System Health</p>
                    <h4 className="text-xl font-bold flex items-center gap-2"><CheckCircle2 className="text-green-500" /> Optimal</h4>
                  </GlassCard>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <GlassCard noPadding className="overflow-hidden shadow-sm">
                     <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-900 uppercase text-sm tracking-tight">Recent Activity Log</h3>
                        <GlassButton className="text-[10px] py-1" variant="secondary">History</GlassButton>
                     </div>
                     <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-primary transition-colors cursor-pointer group">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Users size={20} /></div>
                              <div>
                                <p className="font-bold text-sm text-slate-900">Attendance: {groups[0]?.name || 'N/A'}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Last recorded 2h ago</p>
                              </div>
                           </div>
                           <ArrowRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                        </div>
                     </div>
                  </GlassCard>

                  <GlassCard className="bg-white border-slate-100 shadow-sm">
                     <h3 className="font-bold mb-6 flex items-center gap-2 text-slate-900 uppercase text-sm tracking-tight border-b border-slate-50 pb-4">
                        <Video className="text-primary" /> Live Control Room
                     </h3>
                     <div className="space-y-3">
                        {groups.map(g => (
                          <div key={g.id} className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all">
                             <div>
                                <p className="font-bold text-sm text-slate-900">{g.name}</p>
                                <p className="text-[10px] text-slate-500 font-mono italic">meet.jit.si/{g.jitsiRoom || 'room'}</p>
                             </div>
                             <div 
                               onClick={() => handleToggleLive(g.id, g.isLive)}
                               className={cn(
                                 "w-14 h-7 rounded-full p-1 cursor-pointer transition-all relative flex items-center",
                                 g.isLive ? "bg-red-500 shadow-lg shadow-red-500/20" : "bg-slate-200"
                               )}
                             >
                                <motion.div 
                                  animate={{ x: g.isLive ? 28 : 0 }}
                                  className="w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
                                >
                                   <div className={cn("w-1 h-1 rounded-full", g.isLive ? "bg-red-500" : "bg-slate-300")} />
                                </motion.div>
                             </div>
                          </div>
                        ))}
                     </div>
                  </GlassCard>
               </div>
            </motion.div>
          )}

          {activeTab === 'groups' && (
            <motion.div 
              key="groups"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {groups.map(group => (
                <GlassCard key={group.id} className="flex flex-col border-t-8 border-t-primary shadow-xl hover:shadow-2xl transition-all h-full rounded-[40px]">
                  <div className="flex justify-between items-start mb-6">
                     <div>
                        <h3 className="font-black text-2xl text-slate-900 dark:text-white leading-tight uppercase tracking-tighter">{group.name}</h3>
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 bg-slate-100 rounded-full px-3 py-1 w-fit">
                           <Users size={12} className="text-primary" /> {group.studentIds?.length || 0} Talents
                        </div>
                     </div>
                     <div className={cn("p-3 rounded-2xl shadow-lg", group.isLive ? "bg-red-500 text-white animate-pulse" : "bg-white text-slate-300")}>
                        <Video size={20} />
                     </div>
                  </div>
                  
                  <div className="space-y-4 mb-10 flex-1">
                     <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-[30px] border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-100">
                             <Clock className="text-primary" size={20} />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Schedule</p>
                              <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{group.scheduledTime || 'Not Configured'}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <GlassButton 
                        variant="primary" 
                        className="py-4 text-[10px] font-black tracking-widest bg-slate-900 border-0 text-white shadow-xl hover:bg-primary transition-all rounded-3xl"
                        onClick={() => {
                           const room = `${group.jitsiRoom || 'TKA-Session'}-${profile?.uid?.substr(0,4)}`;
                           window.open(`https://meet.jit.si/${room}#config.prejoinPageEnabled=false&config.disableDeepLinking=true`, '_blank');
                        }}
                     >
                        GO LIVE
                     </GlassButton>
                     <GlassButton 
                        className="py-4 text-[10px] font-black tracking-widest uppercase rounded-3xl"
                        onClick={() => navigate('/dashboard/attendance')}
                     >
                        ATTENDANCE
                     </GlassButton>
                     <GlassButton className="col-span-2 py-4 shadow-md bg-secondary/10 text-secondary hover:bg-secondary hover:text-white transition-all text-[10px] uppercase font-black tracking-widest rounded-3xl" onClick={() => handleOpenCurriculum(group)}>📖 COURSE CURRICULUM</GlassButton>
                     <GlassButton className="py-4 text-[10px] uppercase font-black tracking-widest rounded-3xl" variant="secondary" onClick={() => setActiveVideoLibraryGroup(group)}>ARCHIVE</GlassButton>
                     <GlassButton className="py-4 text-[10px] uppercase font-black tracking-widest rounded-3xl" variant="secondary" onClick={() => setActiveToolLibraryGroup(group)}>SOFTWARE</GlassButton>
                  </div>
                </GlassCard>
              ))}
            </motion.div>
          )}

          {activeTab === 'students' && (
            <motion.div 
               key="students"
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.98 }}
               className="space-y-6"
            >
               <GlassCard noPadding className="overflow-hidden shadow-2xl rounded-[40px] border-none bg-white">
                  <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                     <div>
                        <h3 className="font-black text-2xl text-slate-900 uppercase tracking-tight">Technical Talent Roster</h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Direct evaluations & progress management</p>
                     </div>
                     <div className="bg-primary/10 text-primary text-xs font-black px-4 py-2 rounded-2xl uppercase tracking-widest">{students.length} Total</div>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead className="bg-slate-50/50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                           <tr>
                              <th className="px-8 py-6">Learner</th>
                              <th className="px-8 py-6">Group Connection</th>
                              <th className="px-8 py-6">Last Evaluation</th>
                              <th className="px-8 py-6">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                           {students.map(s => (
                             <tr key={s.id} className="hover:bg-primary/5 transition-colors group">
                                <td className="px-8 py-6">
                                   <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-black text-slate-400 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                                        {s.displayName?.charAt(0) || 'S'}
                                      </div>
                                      <div>
                                         <p className="text-sm font-black text-slate-900 dark:text-white uppercase leading-tight">{s.displayName}</p>
                                         <p className="text-[10px] text-slate-400 font-mono">{s.email}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-8 py-6">
                                   <span className="px-3 py-1.5 bg-slate-100 text-slate-600 text-[9px] font-black rounded-xl uppercase tracking-widest border border-slate-200">{s.groupName}</span>
                                </td>
                                <td className="px-8 py-6">
                                   <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-green-500" />
                                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Recorded Recently</span>
                                   </div>
                                </td>
                                <td className="px-8 py-6">
                                   <div className="flex items-center gap-2">
                                      <GlassButton 
                                        className="p-3 min-w-0 bg-primary text-white border-0 shadow-lg shadow-primary/20 hover:scale-110 transition-transform"
                                        onClick={() => {
                                          setEvalStudent(s);
                                          setEvalGroupId(s.groupId);
                                        }}
                                      >
                                        <Plus size={16} />
                                      </GlassButton>
                                      <GlassButton className="p-3 min-w-0 hover:bg-slate-100" onClick={() => navigate(`/dashboard/profile?uid=${s.uid || s.id}`)}><Users size={16} /></GlassButton>
                                   </div>
                                </td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </GlassCard>
            </motion.div>
          )}

          {activeTab === 'schedule' && (
             <motion.div 
               key="schedule"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="py-40 text-center space-y-4"
             >
                <div className="w-24 h-24 bg-slate-100 rounded-[40px] flex items-center justify-center mx-auto text-slate-300">
                   <Clock size={48} />
                </div>
                <h3 className="text-slate-900 dark:text-white font-black text-2xl uppercase tracking-tighter">Academic Calendar</h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto font-medium">Coming soon: Sync your group lectures, assessment deadlines, and one-on-one reviews directly with Google Calendar.</p>
             </motion.div>
          )}

          {activeTab === 'finances' && (
            <motion.div 
              key="finances"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <GlassCard className="bg-slate-900 text-white border-none p-8">
                     <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">الرصيد المستحق الحالي</p>
                     <h3 className="text-4xl font-black text-green-400">{formatCurrency(balance?.balance || 0)}</h3>
                     <p className="text-[10px] text-slate-500 mt-4 font-bold">بناءً على المحاضرات المسجلة والعمليات المالية هذا الشهر</p>
                  </GlassCard>
                  
                  <GlassCard className="bg-white border-slate-100 p-8 shadow-sm">
                     <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">أرباح معلقة (ساعات)</p>
                     <h4 className="text-2xl font-black text-slate-900">{formatCurrency(balance?.unsettled_earnings || 0)}</h4>
                     <p className="text-[10px] text-slate-500 mt-2">ساعات عمل تم تسجيلها ولم يتم تسويتها بعد</p>
                  </GlassCard>

                  <GlassCard className="bg-white border-slate-100 p-8 shadow-sm">
                     <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">إجمالي المسحوبات</p>
                     <h4 className="text-2xl font-black text-slate-900">{formatCurrency(balance?.payments || 0)}</h4>
                     <p className="text-[10px] text-slate-500 mt-2">مجموع المبالغ التي تم استلامها بالفعل</p>
                  </GlassCard>
               </div>

               <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase text-sm tracking-widest">
                        <History size={18} className="text-primary" /> جلسات العمل (المحاضرات)
                     </h3>
                     <div className="space-y-3">
                        {history.sessions.map((s: any) => (
                           <div key={s.id} className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                                    <BookOpen size={18} />
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{s.groupName}</p>
                                    <p className="text-[10px] text-slate-500">{new Date(s.sessionDate).toLocaleDateString('ar-EG')} • {s.durationHours} ساعة</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-sm font-black text-slate-900 dark:text-white">+{formatCurrency(s.earnedAmount)}</p>
                                 <span className={cn("text-[9px] font-bold", s.status === 'settled' ? "text-green-500" : "text-orange-500")}>
                                    {s.status === 'settled' ? 'تمت التسوية' : 'قيد الانتظار'}
                                 </span>
                              </div>
                           </div>
                        ))}
                        {history.sessions.length === 0 && <p className="text-center py-10 text-slate-400">لا توجد محاضرات مسجلة حالياً</p>}
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase text-sm tracking-widest">
                        <TrendingUp size={18} className="text-primary" /> السجل المالي
                     </h3>
                     <div className="space-y-3">
                        {history.transactions.map((t: any) => (
                           <div key={t.id} className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm text-slate-900 dark:text-white">
                              <div className="flex items-center gap-3">
                                 <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center",
                                    t.type === 'payment' ? "bg-green-50 text-green-600" : t.type === 'reward' ? "bg-purple-50 text-purple-600" : "bg-red-50 text-red-600"
                                 )}>
                                    {t.type === 'payment' ? <CheckCircle2 size={18} /> : t.type === 'reward' ? <TrendingUp size={18} /> : <AlertTriangle size={18} />}
                                 </div>
                                 <div className="text-slate-900 dark:text-white">
                                    <p className="text-sm font-bold">{t.description || (t.type === 'payment' ? 'استلام راتب' : t.type === 'reward' ? 'مكافأة' : 'خصم')}</p>
                                    <p className="text-[10px] text-slate-500">{new Date(t.createdAt).toLocaleDateString('ar-EG')} {t.method ? `• عبر ${t.method}` : ''}</p>
                                 </div>
                              </div>
                              <div className="text-right text-slate-900 dark:text-white">
                                 <p className={cn("text-sm font-black", t.type === 'penalty' ? "text-red-500" : "text-green-600")}>
                                    {t.type === 'penalty' ? '-' : '+'}{formatCurrency(t.amount)}
                                 </p>
                              </div>
                           </div>
                        ))}
                        {history.transactions.length === 0 && <p className="text-center py-10 text-slate-400">لا توجد عمليات مالية مسجلة</p>}
                     </div>
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'contracts' && (
            <motion.div 
              key="contracts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
               <div className="flex items-center justify-between">
                  <div>
                     <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">العقود والاتفاقيات 📜</h2>
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">إطلع على عقودك المبرمة وقم بالتوقيع الرقمي عليها</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contracts.map(contract => (
                     <GlassCard key={contract.id} className="p-6 relative overflow-hidden group">
                        <div className={cn(
                           "absolute top-0 right-0 w-1.5 h-full",
                           contract.status === 'signed' ? "bg-green-500" : "bg-orange-500"
                        )} />
                        <div className="flex items-center gap-3 mb-4">
                           <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center",
                              contract.status === 'signed' ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                           )}>
                              <FileText size={20} />
                           </div>
                           <div>
                              <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">{contract.title}</h4>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{contract.type}</p>
                           </div>
                        </div>
                        <div className="mb-6 h-20 overflow-hidden relative">
                           <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 whitespace-pre-wrap">{contract.content}</p>
                           <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white dark:from-slate-900 to-transparent" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                           <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                              contract.status === 'signed' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                           )}>
                              {contract.status === 'signed' ? 'تم التوقيع' : 'بإنتظار التوقيع'}
                           </span>
                           <GlassButton 
                             variant="primary" 
                             className="text-[10px] uppercase font-black px-4 py-2"
                             onClick={() => setShowSignModal(contract)}
                           >
                             عرض وتوقيع
                           </GlassButton>
                        </div>
                     </GlassCard>
                  ))}
                  {contracts.length === 0 && (
                     <div className="col-span-full py-20 text-center space-y-4">
                        <Box size={48} className="mx-auto text-slate-200" />
                        <h3 className="text-slate-900 dark:text-white font-bold uppercase tracking-widest">لا توجد عقود حالياً</h3>
                        <p className="text-slate-500 text-xs">سيتم عرض العقود المرسلة إليك هنا فور إصدارها من الإدارة.</p>
                     </div>
                  )}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SIGN CONTRACT MODAL */}
      <AnimatePresence>
         {showSignModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowSignModal(null)} />
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                 className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl relative z-10 flex flex-col max-h-[90vh]"
               >
                  <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                     <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{showSignModal.title}</h2>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">إصدار بتاريخ: {new Date(showSignModal.createdAt).toLocaleDateString('ar-EG')}</p>
                     </div>
                     <button onClick={() => setShowSignModal(null)} className="p-2 hover:rotate-90 transition-transform text-slate-400"><X size={28} /></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-10 bg-slate-50/30">
                     <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm text-sm leading-relaxed text-slate-700 whitespace-pre-wrap font-medium">
                        {showSignModal.content}
                     </div>
                     
                     {showSignModal.status === 'signed' && (
                        <div className="mt-8 p-6 bg-green-50 border border-green-100 rounded-3xl flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-green-500 text-white flex items-center justify-center">
                              <CheckCircle2 size={24} />
                           </div>
                           <div>
                              <p className="text-sm font-black text-green-800 uppercase tracking-tight">تم التوقيع بنجاح ✅</p>
                              <p className="text-[10px] text-green-600 font-bold">بتاريخ {new Date(showSignModal.signatureTimestamp).toLocaleString('ar-EG')} من عنوان IP: {showSignModal.signatureIP}</p>
                           </div>
                        </div>
                     )}
                  </div>

                  {showSignModal.status !== 'signed' && (
                     <div className="p-8 bg-white border-t border-slate-100 flex flex-col gap-4">
                        <p className="text-[10px] text-slate-500 font-bold text-center italic">بالضغط على زر "أوافق وأوقع الآن" فإنك تقر بصحة ما ورد في العقد وتعتبره ملزماً لك قانونياً.</p>
                        <GlassButton 
                          onClick={handleSignContract}
                          variant="primary" 
                          className="w-full py-6 font-black tracking-widest uppercase rounded-3xl shadow-xl shadow-primary/20 bg-primary text-white border-none"
                        >
                           أوافق وأوقع الآن رقمياً <CheckCircle2 className="ml-2 w-6 h-6" />
                        </GlassButton>
                     </div>
                  )}
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* EVALUATION MODAL */}
      <AnimatePresence>
         {evalStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setEvalStudent(null)} />
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                 className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl relative z-10 overflow-hidden"
               >
                  <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                     <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Record Evaluation 📝</h2>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{evalStudent.displayName}</p>
                     </div>
                     <button onClick={() => setEvalStudent(null)} className="p-2 hover:rotate-90 transition-transform"><X size={28} /></button>
                  </div>
                  <form onSubmit={handleRecordMark} className="p-10 space-y-8">
                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Score</label>
                           <input required type="number" value={marks} onChange={(e) => setMarks(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/10 text-xl font-bold" placeholder="95" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Type</label>
                           <select value={evalType} onChange={(e) => setEvalType(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/10 text-lg font-bold">
                              <option value="assignment">Assignment</option>
                              <option value="exam">Major Exam</option>
                              <option value="quiz">Weekly Quiz</option>
                           </select>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Feedback/Comments</label>
                        <textarea required value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/10 resize-none font-medium" placeholder="Excellent logic, but try to optimize the build method..."></textarea>
                     </div>
                     <GlassButton type="submit" variant="primary" className="w-full py-6 font-black tracking-widest text-lg rounded-3xl shadow-2xl shadow-primary/20 bg-primary border-none text-white">SUBMIT RECORD <CheckCircle2 className="ml-2 w-6 h-6" /></GlassButton>
                  </form>
               </motion.div>
            </div>
         )}

         {showTaskModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowTaskModal(false)} />
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                 className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl relative z-10 overflow-hidden"
               >
                  <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                     <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">New Resource 🚀</h2>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Add helpful software or assets</p>
                     </div>
                     <button onClick={() => setShowTaskModal(false)} className="p-2 hover:rotate-90 transition-transform"><X size={28} /></button>
                  </div>
                  <form onSubmit={handleCreateTask} className="p-10 space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Resource Name</label>
                        <input required value={taskForm.name} onChange={(e) => setTaskForm({...taskForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none" placeholder="e.g. Adobe Illustrator 2024" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Direct Download URL</label>
                        <input required type="url" value={taskForm.url} onChange={(e) => setTaskForm({...taskForm, url: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none" placeholder="https://..." />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Assign Group</label>
                           <select required value={taskForm.groupId} onChange={(e) => setTaskForm({...taskForm, groupId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none">
                              <option value="">Select Group</option>
                              <option value="global">Global (All Groups)</option>
                              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Category</label>
                           <select required value={taskForm.category} onChange={(e) => setTaskForm({...taskForm, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none">
                              <option value="tools">Pro Software</option>
                              <option value="resources">Design Assets</option>
                              <option value="docs">Documentations</option>
                           </select>
                        </div>
                     </div>
                     <GlassButton type="submit" variant="primary" className="w-full py-6 font-black tracking-widest uppercase rounded-3xl">PUBLISH RESOURCE</GlassButton>
                  </form>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* Curriculum Modal */}
      <AnimatePresence>
        {curriculumGroup && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm">
             <motion.div 
               initial={{ x: '100%', opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               exit={{ x: '100%', opacity: 0 }}
               className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col"
             >
               <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div>
                     <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">📖 {curriculumGroup.course_title || 'منهج المادة'}</h2>
                     <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">{curriculumGroup.name}</p>
                  </div>
                  <button onClick={() => setCurriculumGroup(null)} className="p-2 bg-white rounded-full hover:bg-slate-200 transition-colors"><X size={24}/></button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-8 space-y-6">
                 {loadingCurriculum ? (
                    <div className="flex justify-center items-center h-48">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                 ) : curriculumData.length === 0 ? (
                    <div className="text-center text-slate-500 py-12">
                       <BookOpen size={48} className="mx-auto opacity-20 mb-4" />
                       <p>لا يوجد منهج مبني لهذه المادة حالياً.</p>
                    </div>
                 ) : (
                    curriculumData.map((lec: any, idx: number) => {
                       const isActive = activeLectureIdx === idx;
                       const isArchived = archivedLectures.includes(idx);
                       return (
                         <div key={idx} className={cn("p-6 rounded-3xl border-2 transition-all relative overflow-hidden", isActive ? "border-primary bg-primary/5" : isArchived ? "border-slate-100 bg-slate-50 opacity-70" : "border-slate-100 bg-white")}>
                            {isActive && (
                               <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-black uppercase px-3 py-1 rounded-full animate-pulse">LIVE NOW</div>
                            )}
                            {isArchived && (
                               <div className="absolute top-4 left-4 border border-slate-300 text-slate-400 text-[10px] font-black uppercase px-3 py-1 rounded-full">Archived</div>
                            )}
                            <h3 className="font-bold text-lg mb-4 ml-12">{lec.title}</h3>
                            
                            <div className="space-y-4">
                               {lec.objectives?.length > 0 && (
                                 <div className="bg-white p-4 rounded-2xl border border-slate-100">
                                   <p className="font-bold text-xs text-slate-400 mb-2 uppercase">🎯 Objectives</p>
                                   <ul className="text-sm list-disc pl-4 space-y-1">
                                      {lec.objectives.map((o: string, i: number) => <li key={i}>{o}</li>)}
                                   </ul>
                                 </div>
                               )}

                               {lec.steps?.length > 0 && (
                                 <div className="bg-white p-4 rounded-2xl border border-slate-100">
                                   <p className="font-bold text-xs text-slate-400 mb-2 uppercase">👣 Trainer Flow</p>
                                   <ul className="text-sm space-y-2">
                                      {lec.steps.map((step: string, i: number) => (
                                         <li key={i} className="flex items-start gap-2">
                                            <span className="text-primary mt-1"><CheckCircle2 size={12}/></span>
                                            <span>{step}</span>
                                         </li>
                                      ))}
                                   </ul>
                                 </div>
                               )}
                               
                               {lec.resources?.length > 0 && (
                                 <div className="bg-white p-4 rounded-2xl border border-slate-100">
                                   <p className="font-bold text-xs text-slate-400 mb-2 uppercase">📎 المرفقات والمصادر</p>
                                   <div className="space-y-2">
                                      {lec.resources.map((res: any, i: number) => (
                                         <a key={i} href={res.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg group">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                               {res.type === 'pdf' ? <BookOpen size={14}/> : res.type === 'video' ? <Video size={14}/> : res.type === 'image' ? <Box size={14}/> : <ArrowRight size={14}/>}
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">{res.title || 'عرض المرفق'}</span>
                                         </a>
                                      ))}
                                   </div>
                                 </div>
                               )}
                            </div>

                            {!isActive && (
                               <div className="mt-6">
                                 <GlassButton variant={isArchived ? "secondary" : "primary"} className="w-full text-xs font-black tracking-widest uppercase" onClick={() => handleActivateLecture(idx)}>
                                    {isArchived ? "RE-ACTIVATE LECTURE" : "ACTIVATE LECTURE NOW"}
                                 </GlassButton>
                               </div>
                            )}
                         </div>
                       )
                    })
                 )}
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {chatGroupId && (
        <ChatWindow 
          groupId={chatGroupId} 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
        />
      )}

      {/* MODALS - VIDEO & TOOL LIBRARIES */}
      <AnimatePresence>
        {activeVideoLibraryGroup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white dark:bg-slate-900 rounded-[40px] w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                <div>
                   <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 uppercase tracking-tight">
                     <Video className="text-primary"/> Group Video Archive
                   </h2>
                   <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">{activeVideoLibraryGroup.name}</p>
                </div>
                <button onClick={() => setActiveVideoLibraryGroup(null)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full dark:hover:bg-slate-700 transition-[background-color]">
                  <XCircle size={24} />
                </button>
              </div>
              <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50 dark:bg-slate-900">
                 <VideoLibrary groupId={activeVideoLibraryGroup.id} />
              </div>
            </motion.div>
          </div>
        )}
        {activeToolLibraryGroup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white dark:bg-slate-900 rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                <div>
                   <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 uppercase tracking-tight">
                     <Box className="text-primary"/> Group Assets & Tools
                   </h2>
                   <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">{activeToolLibraryGroup.name}</p>
                </div>
                <button onClick={() => setActiveToolLibraryGroup(null)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full dark:hover:bg-slate-700 transition-[background-color]">
                  <XCircle size={24} />
                </button>
              </div>
              <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50 dark:bg-slate-900">
                 <ToolLibrary groupId={activeToolLibraryGroup.id} isAdmin={true} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
