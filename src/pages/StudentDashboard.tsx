import * as React from 'react';
import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import { GlassCard, GlassButton } from '@/src/components/common/Layout';
import { 
  Play, 
  Calendar, 
  Award, 
  CreditCard, 
  CheckCircle2, 
  ArrowUpRight,
  BrainCircuit,
  UserCircle2,
  Upload,
  MessageSquare,
  Bell,
  X,
  ShieldCheck,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/context/AuthContext';
import { requestNotificationPermission } from '@/src/services/notificationService';
import ToolLibrary from '@/src/components/dashboard/ToolLibrary';
import { getStudentProgressFromSQL, getStudentCertificatesFromSQL, getSingleGroupFromSQL, getPaymentsFromSQL, getPaymentSettingsFromSQL } from '@/src/services/hybridApiService';
import { sendNotification, getMyPendingAssessments } from '@/src/services/firestoreService';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/src/lib/utils';
import { Mail, Phone, MapPin, Copy, Smartphone } from 'lucide-react';

import { useLanguage } from '@/src/context/LanguageContext';
import Countdown from '@/src/components/common/Countdown';
const ChatWindow = React.lazy(() => import('@/src/components/chat/ChatWindow'));
const VideoLibrary = React.lazy(() => import('@/src/components/dashboard/VideoLibrary'));

export default function StudentDashboard({ activeTab = 'overview' }: { activeTab?: 'overview' | 'courses' | 'billing' | 'software' }) {
  const { user, profile } = useAuth();
  const { t, isRtl, language } = useLanguage();
  const isAr = language === 'ar';
  const navigate = useNavigate();
  const [progress, setProgress] = React.useState<any[]>([]);
  const [pendingAssessments, setPendingAssessments] = React.useState<any[]>([]);
  const [group, setGroup] = React.useState<any | null>(null);
  const [certificates, setCertificates] = React.useState<any[]>([]);
  const [payments, setPayments] = React.useState<any[]>([]);
  const [paymentSettings, setPaymentSettings] = React.useState<Record<string, string>>({});
  const [showSubmitModal, setShowSubmitModal] = React.useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = React.useState(false);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [submissionTitle, setSubmissionTitle] = React.useState('');
  const [submissionLink, setSubmissionLink] = React.useState('');
  const [notificationPermission, setNotificationPermission] = React.useState(Notification.permission);
  const soundRef = React.useRef(new Audio("https://actions.google.com/sounds/v1/notifications/piece_of_cake.ogg"));
  const prevIsLive = React.useRef(group?.isLive);

  React.useEffect(() => {
    if (prevIsLive.current === false && group?.isLive === true) {
      console.log('Lecture started!');
    }
    prevIsLive.current = group?.isLive;
  }, [group?.isLive]);

  const parentRef = React.useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
	count: progress.length,
	getScrollElement: () => parentRef.current,
	estimateSize: () => 70,
	overscan: 5,
  });

  const loadStudentData = React.useCallback(async () => {
    if (!user) return;
    
    // Fetch multiple records in parallel for better performance
    const [progData, certData, paymentData, settingsData] = await Promise.all([
      getStudentProgressFromSQL(user.uid),
      getStudentCertificatesFromSQL(user.uid),
      getPaymentsFromSQL(user.uid),
      getPaymentSettingsFromSQL()
    ]);
    
    setProgress(progData || []);
    setCertificates(certData || []);
    setPayments(paymentData || []);
    setPaymentSettings(settingsData || {});

    const gId = profile?.groupId || (profile as any)?.group_id;
    if (gId) {
      const gData = await getSingleGroupFromSQL(gId);
      setGroup(gData);
    }
  }, [user, profile]);

  React.useEffect(() => {
    loadStudentData();
    
    let unsubAssessments: () => void = () => {};
    if (user) {
      unsubAssessments = getMyPendingAssessments(user.uid, (data) => {
        setPendingAssessments(data);
      });
    }

    // Polling refresh for group status every 30s, only if tab is visible
    const interval = setInterval(async () => {
       if (document.hidden) return;
       const gId = profile?.groupId || (profile as any)?.group_id;
       if (gId) {
          const gData = await getSingleGroupFromSQL(gId);
          setGroup(gData);
       }
    }, 30000);

    return () => {
      clearInterval(interval);
      unsubAssessments();
    };
  }, [loadStudentData, profile, user]);

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !group) return;
    try {
      // Notify all trainers in the group
      const trainerIds = group.trainerIds || [];
      for (const tId of trainerIds) {
        await sendNotification({
          recipientId: tId,
          title: 'New Student Submission 📂',
          message: `${profile?.displayName} has submitted effort for: ${submissionTitle}. View it at ${submissionLink}`,
          type: 'submission'
        });
      }
      setShowSubmitModal(false);
      setSubmissionTitle('');
      setSubmissionLink('');
      alert("Submission notified to your instructors!");
    } catch (error) {
      console.error(error);
    }
  };

  const overallProgress = React.useMemo(() => {
    if (progress.length === 0) return 0;
    const avg = progress.reduce((acc, curr) => acc + (curr.marks / curr.maxMarks), 0) / progress.length;
    return Math.round(avg * 100);
  }, [progress]);

  const subExpiry = profile?.subscriptionExpiry;
  const isExpired = subExpiry ? Date.now() > subExpiry : true;

  return (
    <DashboardLayout role={profile?.role || 'student'} userName={profile?.displayName || "Student"}>
      <div className="space-y-8 max-w-7xl mx-auto px-2 md:px-4 pb-12 pt-4">
        {pendingAssessments.length > 0 && (
          <GlassCard className="bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10 border-amber-200 dark:border-amber-500/20 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-amber-500/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl group-hover:bg-amber-400/20 transition-colors pointer-events-none" />
             <div className="flex items-center gap-5 text-right relative z-10 w-full md:w-auto">
                <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/40 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner shrink-0">
                   <MessageSquare className="animate-bounce" size={24} />
                </div>
                <div>
                   <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-lg mb-1">لديك <span className="text-amber-600 dark:text-amber-400">{pendingAssessments.length}</span> تقييمات معلقة</h3>
                   <p className="text-sm font-medium text-slate-600 dark:text-slate-400">ملاحظاتك تهمنا! يرجى ملء نماذج التقييم المطلوبة.</p>
                </div>
             </div>
             <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 relative z-10">
                {pendingAssessments.map(item => (
                  <button 
                    key={item.id}
                    className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 text-xs font-bold px-5 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
                    onClick={() => navigate(`/assessments/student?requestId=${item.id}&token=${item.shareToken}`)}
                  >
                    تقييم {item.targetName || 'البرنامج'}
                  </button>
                ))}
             </div>
          </GlassCard>
        )}
        {profile?.role === 'student' && (!profile.nationalId || !profile.address) && (
          <GlassCard className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 flex flex-col md:flex-row items-center justify-between p-5 md:p-6 shadow-sm gap-4">
            <div className="flex items-start md:items-center gap-4 w-full md:w-auto">
              <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-xl text-red-600 dark:text-red-400 shrink-0">
                 <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-base font-bold text-slate-900 dark:text-red-100 mb-1">{isAr ? 'يرجى إكمال بياناتك الرسمية!' : 'Please complete your official student records!'}</p>
                <p className="text-xs text-red-600 dark:text-red-400/80 uppercase font-bold tracking-widest">{isAr ? 'مطلوب: الرقم القومي، العنوان، نبذة شخصية' : 'Required: National ID, Address, Bio'}</p>
              </div>
            </div>
            <button 
              className="w-full md:w-auto py-2.5 px-6 text-sm font-bold rounded-xl border-2 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors whitespace-nowrap active:scale-95"
              onClick={() => window.location.href = '/dashboard/profile'}
            >
              {isAr ? 'تحديث الملف الشخصي' : 'Update Profile'}
            </button>
          </GlassCard>
        )}
        
        {/* Welcome Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 relative z-10 pt-4">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-transparent blur-xl rounded-full opacity-50 dark:opacity-20 pointer-events-none" />
            <div className="relative">
              <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight text-slate-900 dark:text-white mb-2">
                {t('howdy')}, <span className="text-primary">{profile?.displayName?.split(' ')[0] || profile?.name?.split(' ')[0]}</span>! 👋
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-medium">{t('readyToContinue')} {group?.name || t('learning')} {t('journeyToday')}?</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-4">
                 <Calendar size={14} className="text-primary/70" /> {t('lastInteraction')}: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
             <button 
                onClick={() => { setIsChatOpen(true); }}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all active:scale-95 flex-1 lg:flex-none"
             >
               <MessageSquare size={18} className="text-primary" />
               {isAr ? 'المحادثة' : 'Chat'} 
               {profile?.unreadByGroup?.[group?.id] > 0 && (
                 <span className="ml-1 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                   {profile.unreadByGroup[group.id]}
                 </span>
               )}
             </button>
             
             {notificationPermission !== 'granted' && (
                <button 
                  onClick={async () => {
                     if (user) {
                       const granted = await requestNotificationPermission(user.uid);
                       if (granted) setNotificationPermission('granted');
                     }
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all active:scale-95 flex-1 lg:flex-none"
                >
                   <Bell size={18} />
                   {isAr ? 'تفعيل التنبيهات' : 'Enable Notifications'}
                </button>
             )}
             
             <button 
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all active:scale-95 flex-1 lg:flex-none"
             >
                <Upload size={18} className="text-slate-400" />
                {t('tasks')}
             </button>
             
             {group?.isLive ? (
                <button 
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 transition-all active:scale-95 w-full lg:w-auto animate-pulse"
                  onClick={() => {
                    const room = `${group?.jitsiRoom || 'TKA-Session'}-${group?.trainerIds?.[0]?.substr(0, 4) || 'room'}`;
                    window.open(`https://meet.jit.si/${room}#config.prejoinPageEnabled=false&config.disableDeepLinking=true`, '_blank');
                  }}
                >
                  <Play size={18} className="fill-current" />
                  {isAr ? 'انضم للقاعة الحية الان' : 'Join Live Hub Now'}
                </button>
             ) : group?.scheduledTime && group.scheduledTime > Date.now() ? (
               <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm w-full lg:w-auto">
                 <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{isAr ? 'اللقاء القادم:' : 'Next Session:'}</span>
                 <Countdown targetDate={group.scheduledTime} />
               </div>
             ) : null}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-8 overflow-x-auto scrollbar-hide relative mt-8">
           {[
             { id: 'overview', label: t('navOverview') },
             { id: 'courses', label: t('navMyCourses') },
             { id: 'software', label: t('message') === 'الرسالة' ? 'التطبيقات والبرامج' : 'Software & Apps' },
             { id: 'billing', label: t('subscription') }
           ].map(tab => (
             <button 
                key={tab.id}
                onClick={() => navigate(tab.id === 'overview' ? '/dashboard/student' : `/dashboard/student/${tab.id}`)} 
                className={cn(
                  "pb-4 text-sm font-black whitespace-nowrap px-2 transition-all relative uppercase tracking-wider", 
                  activeTab === tab.id 
                    ? "text-primary dark:text-primary-light" 
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                )}
             >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(var(--color-primary),0.5)]"
                  />
                )}
             </button>
           ))}
        </div>

        {/* Grid Components conditionally rendered based on activeTab */}
        {(activeTab === 'overview' || activeTab === 'courses' || activeTab === 'billing' || activeTab === 'software') && (
          <div className="bento-grid mt-8">
            {(activeTab === 'overview' || activeTab === 'courses' || activeTab === 'software') && (
              <div className="lg:col-span-2 space-y-8">
                {activeTab !== 'software' && (
                  <GlassCard className="relative overflow-hidden group border-0 bg-gradient-to-br from-primary via-primary-dark to-slate-900 shadow-2xl shadow-primary/20">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                     <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
                       <BrainCircuit size={160} className="text-white" />
                     </motion.div>
                  </div>
                  
                  <div className="relative z-10 flex flex-col h-full text-white p-6 md:p-8">
                    <div className="flex items-center gap-2.5 mb-6">
                      <span className="flex h-3.5 w-3.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#feb700] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#feb700]"></span>
                      </span>
                      <span className="text-xs font-black uppercase tracking-widest text-[#feb700] drop-shadow-md">{t('myGroup')}</span>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-lg">{group?.name || (t('message') === 'الرسالة' ? 'غير منضم لأي مجموعة' : 'Not Enrolled')}</h2>
                    
                    {/* Active Lecture Injection */}
                    {group?.curriculum && group?.current_lecture_index !== undefined && group.current_lecture_index !== -1 && group.curriculum[group.current_lecture_index] && (
                       <div className="my-8 bg-white/10 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-white/20 shadow-inner">
                          <p className="text-[10px] font-black uppercase text-[#feb700] mb-2 tracking-widest">{t('message') === 'الرسالة' ? 'محاضرة اليوم' : "Today's Lecture"}</p>
                          <h3 className="text-2xl font-bold mb-3">{group.curriculum[group.current_lecture_index].title}</h3>
                          {group.curriculum[group.current_lecture_index].checklist && group.curriculum[group.current_lecture_index].checklist.length > 0 && (
                            <ul className="text-sm font-medium space-y-2 mt-3 mb-2 text-blue-50/90">
                               {group.curriculum[group.current_lecture_index].checklist.map((chk: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2.5">
                                     <CheckCircle2 size={16} className="mt-0.5 text-[#feb700] shrink-0" />
                                     <span className="leading-relaxed">{chk}</span>
                                  </li>
                               ))}
                            </ul>
                          )}

                          {/* Student Resources for this Lecture */}
                          {group.curriculum[group.current_lecture_index].resources && group.curriculum[group.current_lecture_index].resources.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-white/20">
                               <p className="text-[10px] font-black uppercase text-blue-200 mb-2">{t('message') === 'الرسالة' ? 'المصادر المرفقة' : 'Lecture Resources'}</p>
                               <div className="flex flex-wrap gap-2">
                                  {group.curriculum[group.current_lecture_index].resources.map((res: any, i: number) => (
                                     <a key={i} href={res.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors">
                                        <ExternalLink size={12}/> {res.title || (t('message') === 'الرسالة' ? 'عرض المصدر' : 'View Resource')}
                                     </a>
                                  ))}
                               </div>
                            </div>
                          )}
                       </div>
                    )}
                    
                    <p className="text-blue-100 mb-6 flex items-center gap-2 font-medium">
                       <UserCircle2 size={16} /> {t('message') === 'الرسالة' ? 'مع مرشديك التقنيين' : 'with Your Mentors'}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-white/20 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="text-center">
                            <p className="text-xs text-blue-100 font-bold uppercase">{t('message') === 'الرسالة' ? 'المدربين' : 'Trainers'}</p>
                            <p className="text-lg font-black text-white">{group?.trainerIds?.length || 0}</p>
                         </div>
                      </div>
                      <GlassButton 
                          className="bg-white text-[#0846ed] border-0 hover:bg-slate-100 font-black shadow-xl"
                          icon={Play}
                          onClick={() => {
                              const room = `${group?.jitsiRoom || 'TKA-Session'}-${group?.trainerIds?.[0]?.substr(0, 4) || 'room'}`;
                              window.open(`https://meet.jit.si/${room}#config.prejoinPageEnabled=false&config.disableDeepLinking=true`, '_blank');
                          }}
                      >
                        {language === 'ar' ? 'الانضمام للقاعة' : 'Join Meeting'}
                      </GlassButton>
                    </div>
                  </div>
                </GlassCard>
              )}

                {activeTab === 'courses' && group?.id && (
                   <VideoLibrary groupId={group.id} />
                )}

                {activeTab === 'software' && (
                   <ToolLibrary groupId={group?.id} levelName={profile?.level} userId={user?.uid} />
                )}
              </div>
            )}

            {(activeTab === 'overview' || activeTab === 'billing') && (
            <div className="lg:col-span-2 space-y-8">
              <GlassCard className="flex flex-col text-slate-900 shadow-sm dark:text-white">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="text-secondary" /> {t('subscription')}
                </h3>
                <div className={cn("rounded-2xl p-4 mb-6 border", isExpired ? "bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900/40" : "bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-700")}>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 dark:text-slate-400">Renewal Date</p>
                  <p className="text-xl font-bold">{subExpiry ? new Date(subExpiry).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Status</span>
                    <span className={cn(
                      "font-bold px-2 py-1 rounded-lg", 
                      isExpired ? "text-white bg-red-600 animate-pulse" : "text-green-600"
                    )}>
                      {isExpired ? 'OVERDUE - PAY NOW' : 'Active'}
                    </span>
                  </div>
                </div>
                <GlassButton variant="secondary" className="w-full mt-auto" onClick={() => setShowCheckoutModal(true)}>Renew Access Now</GlassButton>
              </GlassCard>

              {activeTab === 'billing' && (
                <GlassCard className="text-slate-900 dark:text-white">
                   <h3 className="text-lg font-bold mb-6">Recent Payment History (SQL Archives)</h3>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                         <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                               <th className="pb-4">Period</th>
                               <th className="pb-4">Amount</th>
                               <th className="pb-4">Method</th>
                               <th className="pb-4">Date</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {payments.map((p, i) => (
                               <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                  <td className="py-4 font-bold">{p.period}</td>
                                  <td className="py-4 text-green-600 font-bold">{formatCurrency(p.amount)}</td>
                                  <td className="py-4 text-slate-500">{p.method}</td>
                                  <td className="py-4 text-slate-400 text-xs">{new Date(p.date).toLocaleDateString()}</td>
                               </tr>
                            ))}
                            {payments.length === 0 && (
                               <tr>
                                  <td colSpan={4} className="py-8 text-center text-slate-400 italic">No historical payments found in archives.</td>
                               </tr>
                            )}
                         </tbody>
                      </table>
                   </div>
                </GlassCard>
              )}
            </div>
            )}
          </div>
        )}

        {/* Bottom Grid */}
        {(activeTab === 'overview') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-slate-900">
          <GlassCard noPadding className="flex flex-col shadow-sm border-slate-100 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold dark:text-white">{t('navProgress')}</h3>
              <ArrowUpRight className="text-slate-400 hover:text-primary cursor-pointer transition-colors" />
            </div>
            <div className="p-6 text-center border-b border-slate-100 dark:border-slate-800">
               <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">{isAr ? 'الإتقان العام' : 'Overall Mastery'}</p>
               <h4 className="text-4xl font-bold text-primary">{overallProgress}%</h4>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto custom-scrollbar" ref={parentRef}>
               {progress.length === 0 && <div className="p-8 text-center text-slate-400 italic text-xs">{isAr ? 'لا توجد سجلات تقييم حتى الآن.' : 'No evaluations recorded yet.'}</div>}
               {progress.length > 0 && (
                 <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
                   {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                     const p = progress[virtualRow.index];
                     return (
                       <div
                         key={virtualRow.key}
                         style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }}
                         className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors border-b border-slate-100 dark:border-slate-800"
                       >
                         <div className="flex justify-between items-center mb-1">
                           <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{p.type.toUpperCase()}</span>
                           <span className="text-xs font-bold text-primary">{p.marks}/{p.maxMarks}</span>
                         </div>
                         <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">"{p.feedback}"</p>
                       </div>
                     );
                   })}
                 </div>
               )}
            </div>
          </GlassCard>

          <GlassCard shadow-sm className="flex flex-col border-slate-100 dark:border-slate-800 dark:bg-slate-900/50">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 dark:text-white">
              <Award className="text-yellow-600" /> {t('achievements')}
            </h3>
            <div className="bg-slate-50 dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 text-center mb-6">
               <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mx-auto mb-4 flex items-center justify-center text-2xl shadow-sm">
                  {overallProgress > 80 ? '🦁' : '🐣'}
               </div>
               <p className="font-bold text-slate-900 dark:text-white">{overallProgress > 80 ? (isAr ? 'قائد المسار' : 'Track Leader') : (isAr ? 'محارب التعلم' : 'Learning Warrior')}</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{isAr ? 'ترتيبك' : 'Your Rank'}</p>
            </div>

            <div className="space-y-4">
               <h4 className="text-sm font-bold text-slate-900 dark:text-white px-2 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-green-600" /> {t('certificates')}
               </h4>
               <div className="space-y-2">
                 {certificates.length > 0 ? (
                   certificates.map(cert => (
                     <div key={cert.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between group hover:border-primary transition-all shadow-sm">
                        <div className="flex-1">
                           <p className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-tight">{cert.programName}</p>
                           <p className="text-[10px] text-slate-400 mt-1 font-mono uppercase tracking-tighter">{cert.verificationCode}</p>
                        </div>
                        <a 
                          href={`/verify/${cert.verificationCode}`} 
                          target="_blank" 
                          referrerPolicy="no-referrer"
                          className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:text-primary transition-colors"
                        >
                           <ExternalLink size={16} />
                        </a>
                     </div>
                   ))
                 ) : (
                   <div className="p-8 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-400 italic font-sans">{isAr ? 'لم يتم إصدار شهادات بعد.' : 'No certificates issued yet.'}</p>
                   </div>
                 )}
               </div>
            </div>
          </GlassCard>
        </div>
        )}

        {/* Submission Modal */}
        <AnimatePresence>
        <React.Suspense fallback={null}>
          {isChatOpen && (
            <ChatWindow groupId={group?.id || 'general'} isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
          )}
        </React.Suspense>
          {showCheckoutModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCheckoutModal(false)} />
               <motion.div 
                 initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                 className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden"
               >
                  <div className="p-8 border-b border-slate-100 bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800 flex justify-between items-center">
                     <h2 className="text-xl font-bold dark:text-white">{isAr ? 'تجديد الاشتراك' : 'Renewal Checkout'}</h2>
                     <button onClick={() => setShowCheckoutModal(false)} className="dark:text-slate-400"><X /></button>
                  </div>
                  <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar dark:bg-slate-900">
                     <p className="text-sm text-slate-600 dark:text-slate-400">{isAr ? 'اختر طريقة الدفع المفضلة واتبع التعليمات:' : 'Choose your preferred payment method and follow the instructions:'}</p>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {paymentSettings.wallet_number && (
                          <GlassCard className="border border-slate-100 dark:border-slate-800 hover:border-primary transition-all">
                             <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Smartphone size={20} /></div>
                                <h3 className="font-bold dark:text-white">{paymentSettings.wallet_name || (isAr ? 'محفظة إلكترونية' : 'E-Wallet')}</h3>
                             </div>
                             <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{isAr ? 'أرسل إلى الرقم:' : 'Send to number:'}</p>
                             <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                                <code className="text-sm font-bold text-slate-900 dark:text-white font-mono">{paymentSettings.wallet_number}</code>
                                <button onClick={() => { navigator.clipboard.writeText(paymentSettings.wallet_number); alert(isAr ? 'تم النسخ!' : 'Copied!'); }} className="dark:text-slate-400"><Copy size={14} /></button>
                             </div>
                          </GlassCard>
                        )}
                        
                        {paymentSettings.instapay_link && (
                          <GlassCard className="border border-slate-100 dark:border-slate-800 hover:border-primary transition-all">
                             <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-secondary/10 rounded-lg text-secondary"><ArrowUpRight size={20} /></div>
                                <h3 className="font-bold dark:text-white">InstaPay</h3>
                             </div>
                             <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{isAr ? 'العنوان / الرابط:' : 'Address/Link:'}</p>
                             <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2 rounded-lg overflow-hidden">
                                <code className="text-[10px] font-bold text-slate-900 dark:text-white font-mono truncate mr-2">{paymentSettings.instapay_link}</code>
                                <button onClick={() => { navigator.clipboard.writeText(paymentSettings.instapay_link); alert(isAr ? 'تم النسخ!' : 'Copied!'); }} className="dark:text-slate-400"><Copy size={14} /></button>
                             </div>
                          </GlassCard>
                        )}

                        {paymentSettings.bank_gateway_api && (
                          <GlassCard className="md:col-span-2 border border-slate-100 dark:border-slate-800 hover:border-primary transition-all">
                             <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg text-green-600 dark:text-green-400"><CreditCard size={20} /></div>
                                <h3 className="font-bold dark:text-white">{isAr ? 'بطاقة بنكية' : 'Bank Card'}</h3>
                             </div>
                             <GlassButton variant="primary" className="w-full bg-green-600 border-none" onClick={() => window.open(paymentSettings.bank_gateway_api, '_blank')}>{isAr ? 'ادفع عبر بوابة آمنة' : 'Pay via Secure Gateway'}</GlassButton>
                          </GlassCard>
                        )}
                     </div>

                     <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                        <h4 className="font-bold text-sm dark:text-white">{isAr ? 'بعد الدفع، يرجى إخطار الإشراف:' : 'After payment, please notify supervision:'}</h4>
                        <div className="grid grid-cols-2 gap-4">
                           <GlassButton variant="secondary" className="w-full dark:bg-slate-800 dark:text-slate-200" onClick={() => window.open('https://api.whatsapp.com/send?phone=201026040854&text=I%20just%20paid%20my%20subscription.%20UID%3A%20' + user?.uid, '_blank')}>{isAr ? 'بلاغ واتساب' : 'WhatsApp Notice'}</GlassButton>
                           <GlassButton variant="secondary" className="w-full dark:bg-slate-800 dark:text-slate-200" onClick={() => setShowCheckoutModal(false)}>{isAr ? 'إغلاق' : 'Close'}</GlassButton>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
          )}
          {showSubmitModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowSubmitModal(false)} />
               <motion.div 
                 initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                 className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden"
               >
                  <div className="p-8 border-b border-slate-100 bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800 flex justify-between items-center">
                     <h2 className="text-xl font-bold dark:text-white">{isAr ? 'تسليم التكليفات' : 'Submit Assignment'}</h2>
                     <button onClick={() => setShowSubmitModal(false)} className="dark:text-slate-400"><X /></button>
                  </div>
                  <form onSubmit={handleSubmission} className="p-8 space-y-6 text-slate-900 dark:bg-slate-900">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">{isAr ? 'اسم العمل / المشروع' : 'Work Title'}</label>
                        <input required placeholder={isAr ? "مشروع 1: تنفيذ المنطق البرمجي" : "Project 1: Logic Implementation"} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans" value={submissionTitle} onChange={(e) => setSubmissionTitle(e.target.value)} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">{isAr ? 'رابط المشروع (Behance, GitHub, Drive)' : 'Resource Link (Behance, GitHub, Drive)'}</label>
                        <input required type="url" placeholder="https://..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans" value={submissionLink} onChange={(e) => setSubmissionLink(e.target.value)} />
                     </div>
                     <GlassButton type="submit" variant="primary" className="w-full py-4 bg-primary text-white border-none font-bold shadow-lg shadow-primary/20">{isAr ? 'إخطار المدرب بالعمل' : 'Notify My Trainer'} <ArrowUpRight className="ml-2 w-4 h-4" /></GlassButton>
                  </form>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
