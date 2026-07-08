import * as React from 'react';
import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import { GlassCard, GlassButton } from '@/src/components/common/Layout';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  ShieldAlert, 
  DollarSign, 
  Search, 
  Filter, 
  MoreVertical,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  MessageSquare,
  History,
  FileText,
  BellRing,
  Plus as PlusIcon,
  FileEdit,
  Trash2,
  BarChart3,
  Smile,
  X,
  Plus,
  ChevronDown,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn, formatCurrency } from '@/src/lib/utils';
import { 
  getTrainerGroupsFromSQL, 
  getAllGroupsFromSQL, 
  getStudentsInGroupFromSQL,
  getProfileFromSQL,
  recordPaymentToSQL,
  getPaymentsFromSQL,
  getFinancialSummaryFromSQL,
  getUsersByRoleFromSQL,
  createGroupInSQL,
  updateGroupInSQL,
  deleteGroupInSQL,
  getAttendanceSummaryFromSQL,
  recordAttendanceToSQL,
  getAttendanceFromSQL,
  getStudentAttendanceHistoryFromSQL,
  getStudentProgressFromSQL,
  getTrainerBalanceFromSQL,
  getTrainerFinancialHistoryFromSQL,
  addTrainerTransactionInSQL,
  updateTrainerHourlyRateInSQL,
  getContractsFromSQL,
  issueContractInSQL,
  addApplicationToSQL
} from '@/src/services/hybridApiService';
import { 
  getStudentNotes, 
  addStudentNote,
  sendNotification
} from '@/src/services/firestoreService';
import { useAuth } from '@/src/context/AuthContext';

import { useLanguage } from '@/src/context/LanguageContext';

export default function SupervisorDashboard() {
  const { user, profile: myProfile } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [groups, setGroups] = React.useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = React.useState<string>('all');
  const [students, setStudents] = React.useState<any[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [summary, setSummary] = React.useState({ totalIncome: 0, pendingDues: 0 });
  const [showRegisterModal, setShowRegisterModal] = React.useState(false);
  const [regForm, setRegForm] = React.useState({
    fullName: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    password: 'password123',
    assignedLevel: 'Level 1'
  });

  // Modals state
  const [showPaymentModal, setShowPaymentModal] = React.useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = React.useState<any | null>(null);
  
  // Payment Form State
  const [amount, setAmount] = React.useState('');
  const [method, setMethod] = React.useState('Vodafone Cash');
  const [period, setPeriod] = React.useState('Month 1');
  const [notes, setNotes] = React.useState('');

  // detail modal data
  const [paymentHistory, setPaymentHistory] = React.useState<any[]>([]);
  const [attendanceHistory, setAttendanceHistory] = React.useState<any[]>([]);
  const [studentProgress, setStudentProgress] = React.useState<any[]>([]);
  const [studentNotes, setStudentNotes] = React.useState<any[]>([]);
  const [newNote, setNewNote] = React.useState('');
  const [noteType, setNoteType] = React.useState('general');

  const [activeSegment, setActiveSegment] = React.useState<'students' | 'groups' | 'trainers' | 'assessments'>('students');
  const [trainers, setTrainers] = React.useState<any[]>([]);
  const [showTrainerFinanceModal, setShowTrainerFinanceModal] = React.useState<any | null>(null);
  const [trainerBalanceInfo, setTrainerBalanceInfo] = React.useState<any>(null);
  const [trainerHistory, setTrainerHistory] = React.useState<{sessions: any[], transactions: any[]}>({sessions: [], transactions: []});
  const [financeForm, setFinanceForm] = React.useState({ type: 'payment' as any, amount: '', description: '', method: 'Cash' });
  const [newRate, setNewRate] = React.useState('');
  
  const [showGroupModal, setShowGroupModal] = React.useState<any | null>(null);
  const [showSessionModal, setShowSessionModal] = React.useState<any | null>(null);
  const [sessionAttendance, setSessionAttendance] = React.useState<string[]>([]);
  const [attendanceSummary, setAttendanceSummary] = React.useState<Record<string, number>>({});
  const [isAttendanceSaving, setIsAttendanceSaving] = React.useState(false);
  
  // Group Form State
  const [groupForm, setGroupForm] = React.useState({
    name: '',
    trainerIds: [] as string[],
    isActive: true,
    scheduledTime: '',
    jitsiRoom: ''
  });

  // Contract Management State
  const [showContractModal, setShowContractModal] = React.useState<any>(null);
  const [contractForm, setContractForm] = React.useState({
    title: '',
    content: '',
    type: 'trainer' as 'trainer' | 'supervisor' | 'student'
  });
  const [contracts, setContracts] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
       const [gData, fSummary, tData] = await Promise.all([
         getAllGroupsFromSQL(),
         getFinancialSummaryFromSQL(),
         getUsersByRoleFromSQL('trainer')
       ]);
       setGroups(gData);
       setSummary(fSummary);
       setTrainers(tData);
    };
    fetchData();
  }, []);

  const handleCreateOrUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (myProfile?.role === 'supervisor' && !myProfile?.canCreateGroups && !showGroupModal?.id) {
       alert("عذراً، يجب الحصول على إذن من المسؤول (الآدمن) لإنشاء مجموعات جديدة.");
       return;
    }

    try {
      if (showGroupModal?.id) {
        await updateGroupInSQL(showGroupModal.id, groupForm);
        alert("Group updated!");
      } else {
        const payload = {
           ...groupForm,
           isActive: myProfile?.role === 'admin' ? true : false // Supervisors create pending groups
        };
        await createGroupInSQL(payload);
        alert(myProfile?.role === 'admin' ? "Group created!" : "تم إنشاء المجموعة بنجاح وهي في انتظار تفعيل الآدمن.");
      }
      setShowGroupModal(null);
      getAllGroupsFromSQL().then(setGroups);
    } catch (err) {
      alert("Action failed.");
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm("Are you sure? This will not delete students but will remove the group structure.")) return;
    try {
      await deleteGroupInSQL(id);
      getAllGroupsFromSQL().then(setGroups);
    } catch (err) {
      alert("Delete failed.");
    }
  };

  React.useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      if (selectedGroupId === 'all') {
         const allStudents = await getUsersByRoleFromSQL('student');
         setStudents(allStudents);
      } else {
         const groupStudents = await getStudentsInGroupFromSQL(selectedGroupId);
         setStudents(groupStudents);
      }
      setLoading(false);
    };
    loadStudents();
  }, [selectedGroupId]);

  React.useEffect(() => {
    if (selectedGroupId && selectedGroupId !== 'all') {
      getAttendanceSummaryFromSQL(selectedGroupId).then(data => {
        const mapping: Record<string, number> = {};
        data.forEach((item: any) => {
          mapping[item.studentId] = item.attended_count;
        });
        setAttendanceSummary(mapping);
      });
    }
  }, [selectedGroupId, showSessionModal]);

  React.useEffect(() => {
    if (showSessionModal) {
      const today = new Date().toISOString().split('T')[0];
      getAttendanceFromSQL(showSessionModal.id, today).then(records => {
        const present = Object.keys(records).filter(id => records[id]);
        setSessionAttendance(present);
      });
    }
  }, [showSessionModal]);

  const handleSaveAttendance = async () => {
    if (!showSessionModal) return;
    setIsAttendanceSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await recordAttendanceToSQL({
        groupId: showSessionModal.id,
        date: today,
        presentIds: sessionAttendance,
        allStudentIds: students.map(s => s.id),
        trainerId: user?.uid
      });
      alert(t('supervisor.attendanceSuccess' as any));
      setShowSessionModal(null);
    } catch (err) {
      alert(t('supervisor.attendanceError' as any));
    } finally {
      setIsAttendanceSaving(false);
    }
  };

  const toggleAttendance = (id: string) => {
    setSessionAttendance(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  React.useEffect(() => {
    if (showDetailModal) {
      const sId = showDetailModal.id || showDetailModal.uid;
      getPaymentsFromSQL(sId).then(setPaymentHistory);
      getStudentAttendanceHistoryFromSQL(sId).then(setAttendanceHistory);
      getStudentProgressFromSQL(sId).then(setStudentProgress);
      const unsubN = getStudentNotes(sId, setStudentNotes);
      return () => { unsubN(); };
    }
  }, [showDetailModal]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPaymentModal || !user) return;
    try {
      await recordPaymentToSQL({
        studentId: showPaymentModal.id || showPaymentModal.uid,
        amount: Number(amount),
        method,
        period,
        notes
      });
      setShowPaymentModal(null);
      setAmount('');
      setNotes('');
      
      // Refresh students to show updated expiry
      if (selectedGroupId === 'all') {
        getStudentsInGroupFromSQL('all').then(setStudents);
      } else {
        getStudentsInGroupFromSQL(selectedGroupId).then(setStudents);
      }
      getFinancialSummaryFromSQL().then(setSummary);
      
      alert("Payment recorded in SQL Archive!");
    } catch (error) {
      console.error(error);
      alert("Failed to record payment. Check SQL logs.");
    }
  };

  const generatePDFReport = async () => {
    if (!showDetailModal) return;
    
    // Dynamically import jsPDF to keep main bundle light
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    
    const doc = new jsPDF();
    const s = showDetailModal;
    
    // Header
    doc.setFillColor(30, 41, 59); // Slate 800
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("TKA EGYPT - Student Report", 20, 20);
    doc.setFontSize(10);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, 30);
    
    // Student Info
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(16);
    doc.text("Personal Information", 20, 55);
    doc.setFontSize(10);
    doc.text(`Name: ${s.fullName || s.name}`, 20, 65);
    doc.text(`Email: ${s.email}`, 20, 72);
    doc.text(`Enrollment Date: ${new Date(s.createdAt).toLocaleDateString()}`, 20, 79);
    doc.text(`Assigned Level: ${s.assignedLevel || 'Not Set'}`, 20, 86);
    
    // 1. Financial Report
    doc.setFontSize(14);
    doc.text("1. Financial Report (Payments)", 20, 105);
    const payRows = paymentHistory.map(p => [
      p.period,
      formatCurrency(p.amount),
      p.method,
      new Date(p.paidAt).toLocaleDateString(),
      p.recorderName || 'System'
    ]);
    
    autoTable(doc, {
      startY: 110,
      head: [['Period', 'Amount', 'Method', 'Date', 'Received By']],
      body: payRows,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] }
    });
    
    // 2. Attendance & Activity
    let currentY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text("2. Attendance & Activity Record", 20, currentY);
    const attendRows = attendanceHistory.map(a => [
      new Date(a.date).toLocaleDateString(),
      a.groupName || 'N/A',
      a.status ? 'Present' : 'Absent'
    ]);
    
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Date', 'Group', 'Status']],
      body: attendRows,
      theme: 'striped'
    });
    
    // 3. Training & Progress
    currentY = (doc as any).lastAutoTable.finalY + 15;
    if (currentY > 240) { doc.addPage(); currentY = 20; }
    doc.setFontSize(14);
    doc.text("3. Training Progress & Feedback", 20, currentY);
    const progRows = studentProgress.map(p => [
      p.taskName || 'Assignment',
      `${p.marks}/${p.maxMarks}`,
      new Date(p.createdAt).toLocaleDateString(),
      p.feedback || 'No feedback'
    ]);
    
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Assessment', 'Result', 'Date', 'Trainer Feedback']],
      body: progRows,
      theme: 'grid'
    });
    
    // 4. Admin Notes
    currentY = (doc as any).lastAutoTable.finalY + 15;
    if (currentY > 240) { doc.addPage(); currentY = 20; }
    doc.setFontSize(14);
    doc.text("4. Administrative Observations", 20, currentY);
    const noteRows = studentNotes.map(n => [
      n.type.replace('_', ' ').toUpperCase(),
      n.content,
      new Date(n.createdAt).toLocaleDateString()
    ]);
    
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Note Category', 'Observation Details', 'Date']],
      body: noteRows,
      theme: 'grid'
    });
    
    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`TKA Egypt Management System - Internal Student Report - Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    }
    
    doc.save(`TKA_Report_${(s.fullName || s.name).replace(/\s/g, '_')}.pdf`);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDetailModal || !user || !newNote) return;
    try {
      await addStudentNote({
        studentId: showDetailModal.id,
        content: newNote,
        type: noteType,
        authorId: user.uid
      });
      setNewNote('');
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    if (showTrainerFinanceModal) {
      const tId = showTrainerFinanceModal.id;
      getTrainerBalanceFromSQL(tId).then(setTrainerBalanceInfo);
      getTrainerFinancialHistoryFromSQL(tId).then(setTrainerHistory);
      setNewRate(showTrainerFinanceModal.hourly_rate?.toString() || '0');
    }
  }, [showTrainerFinanceModal]);

  const handleTrainerTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showTrainerFinanceModal || !user) return;
    try {
      await addTrainerTransactionInSQL({
        trainerId: showTrainerFinanceModal.id,
        type: financeForm.type,
        amount: parseFloat(financeForm.amount),
        description: financeForm.description,
        method: financeForm.method,
        recordedBy: user.uid
      });
      alert(t('supervisor.transactionSuccess' as any));
      setFinanceForm({ type: 'payment', amount: '', description: '', method: 'Cash' });
      // Refresh data
      const tId = showTrainerFinanceModal.id;
      getTrainerBalanceFromSQL(tId).then(setTrainerBalanceInfo);
      getTrainerFinancialHistoryFromSQL(tId).then(setTrainerHistory);
    } catch (err) {
      alert(t('supervisor.transactionError' as any));
    }
  };

  const handleUpdateRate = async () => {
    if (!showTrainerFinanceModal) return;
    try {
      await updateTrainerHourlyRateInSQL(showTrainerFinanceModal.id, parseFloat(newRate));
      alert(t('supervisor.hourlyRateSuccess' as any));
      getUsersByRoleFromSQL('trainer').then(setTrainers);
    } catch (err) {
      alert(t('supervisor.hourlyRateError' as any));
    }
  };

  const handleIssueContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showContractModal || !user) return;
    try {
      await issueContractInSQL({
        userId: showContractModal.id,
        type: contractForm.type,
        title: contractForm.title,
        content: contractForm.content,
        issuedBy: user.uid
      });
      alert(t('supervisor.contractSuccess' as any));
      setShowContractModal(null);
      getContractsFromSQL().then(setContracts);
    } catch (err) {
      alert(t('supervisor.contractError' as any));
    }
  };

  const getContractTemplate = (type: string, userData: any) => {
    const date = new Date().toLocaleDateString('ar-EG');
    if (type === 'trainer') {
      return `عقد عمل مدرب
بين أكاديمية التدريب والطرف الثاني السيد/ ${userData.fullName || userData.name}
رقم الهاتف: ${userData.phone || '..........'}

البند الأول: يلتزم الطرف الثاني بالقيام بمهام التدريب للمجموعات المسندة إليه.
البند الثاني: يتقاضى الطرف الثاني أجراً عن ساعة التدريب الفعلية قدره [${userData.hourly_rate || 0}] جنيه مصري.
البند الثالث: تلتزم الأكاديمية بتوفير القاعات والمادة العلمية اللازمة.
البند الرابع: مدة هذا العقد تبدأ من تاريخ ${date}.

طرف أول (الأكاديمية)                          طرف ثان (المدرب)`;
    }
    if (type === 'student') {
      return `اتفاقية تدريب طالب
الطرف الأول: الأكاديمية
الطرف الثاني الطالب/ ${userData.fullName || userData.name}

يلتزم الطالب بالشروط التالية:
1. الالتزام بمواعيد المسار التدريبي.
2. دفع الرسوم المقررة في المواعيد المحددة.
3. يحصل الطالب على الشهادة عند إكمال الحضور واجتياز الاختبارات.

تاريخ الاتفاق: ${date}`;
    }
    return '';
  };

  React.useEffect(() => {
    if (showContractModal) {
      setContractForm({
        title: `عقد ${showContractModal.role === 'trainer' ? 'مدرب' : 'طالب'}: ${showContractModal.fullName || showContractModal.name}`,
        content: getContractTemplate(showContractModal.role === 'trainer' ? 'trainer' : 'student', showContractModal),
        type: showContractModal.role === 'trainer' ? 'trainer' : 'student'
      });
    }
  }, [showContractModal]);

  const handleSendReminder = async (studentId: string) => {
    try {
      await sendNotification({
        recipientId: studentId,
        title: 'Payment Reminder 💳',
        message: 'Your subscription is about to expire or has expired. Please fulfill the payment to keep your account active.',
        type: 'payment_reminder'
      });
      alert("Reminder sent to student's dashboard!");
    } catch (error) {
      console.error(error);
    }
  };

  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addApplicationToSQL({
        ...regForm,
        role: 'student',
        status: 'active'
      });
      alert(language === 'ar' ? "تم تسجيل الطالب بنجاح" : "Student registered successfully!");
      setShowRegisterModal(false);
      const allStudents = await getUsersByRoleFromSQL('student');
      setStudents(allStudents);
    } catch (err) {
      alert("Registration failed.");
    }
  };

  const filteredStudents = React.useMemo(() => {
    return students.filter(s => 
      s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.whatsappNumber?.includes(searchTerm)
    );
  }, [students, searchTerm]);

  const getSubscriptionStatus = (expiry?: number) => {
    if (!expiry) return { label: 'No Data', color: 'bg-slate-100 text-slate-500' };
    const now = Date.now();
    const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return { label: 'Expired', color: 'bg-red-100 text-red-600' };
    if (daysLeft < 7) return { label: `${daysLeft}d left`, color: 'bg-orange-100 text-orange-600' };
    return { label: 'Active', color: 'bg-green-100 text-green-600' };
  };

  return (
    <DashboardLayout role={myProfile?.role || 'supervisor'} userName={myProfile?.displayName || user?.displayName || "Supervisor"}>
      <div className="space-y-8 pb-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white line-clamp-1">
              {t('supervisor.title')} 🏛️
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {t('supervisor.subtitle')}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
             <GlassButton variant="primary" icon={UserPlus} onClick={() => setShowRegisterModal(true)}>
                {t('supervisor.registerNewStudent' as any)}
             </GlassButton>
             <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto custom-scrollbar">
             <button 
               onClick={() => setSelectedGroupId('all')}
               className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap", selectedGroupId === 'all' ? "bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200")}
             >
                {t('supervisor.allStudents')}
             </button>
             {groups.map(g => (
               <button 
                  key={g.id}
                  onClick={() => setSelectedGroupId(g.id)}
                  className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap", selectedGroupId === g.id ? "bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200")}
               >
                  {g.name}
               </button>
             ))}
          </div>
        </div>

        {/* Dropdown for Mobile / Tabs for Desktop */}
        <div className="relative mb-6">
          <div className="md:hidden w-full">
            <select
              value={activeSegment}
              onChange={(e) => setActiveSegment(e.target.value as any)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 appearance-none shadow-sm"
            >
              <option value="students">{t('supervisor.manageStudents')}</option>
              <option value="groups">{t('supervisor.manageGroups')}</option>
              <option value="trainers">{t('supervisor.manageTrainers')}</option>
              <option value="assessments">{t('supervisor.assessments')}</option>
            </select>
            <div className={`absolute ${language === 'ar' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 pointer-events-none text-slate-400`}>
              <Filter size={16} />
            </div>
          </div>

           <div className="flex-1 w-full max-w-sm mb-8">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">{t('supervisor.actionCenter' as any)}</label>
              <div className="relative group/sel">
                <select 
                  className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 font-bold text-sm outline-none focus:border-primary transition-all text-slate-900 dark:text-white appearance-none cursor-pointer pr-10"
                  value={activeSegment}
                  onChange={(e) => setActiveSegment(e.target.value as any)}
                >
                  <option value="students">{t('supervisor.manageStudents' as any)}</option>
                  <option value="groups">{t('supervisor.manageGroups' as any)}</option>
                  <option value="trainers">{t('supervisor.manageTrainers' as any)}</option>
                  <option value="assessments">{t('supervisor.qualityAssessments' as any)}</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within/sel:text-primary transition-colors" size={16} />
              </div>
           </div>
        </div>

        {activeSegment === 'students' && (
          <>
            {/* Filters/Search */}
            <div className="grid md:grid-cols-4 gap-4">
               <GlassCard className="md:col-span-2 h-auto p-4 flex flex-col md:flex-row gap-4 items-center">
                  <div className="relative flex-1 w-full">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                     <input 
                       placeholder={t('supervisor.searchPlaceholder')} 
                       className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white"
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                     />
                  </div>
               </GlassCard>
               
               <GlassCard className="p-4 flex flex-col justify-center h-full border-green-100 bg-green-50/30 dark:bg-green-900/10">
                  <p className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                     <DollarSign size={10} /> {t('supervisor.totalRevenue')}
                  </p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(summary.totalIncome)}</p>
               </GlassCard>

               <GlassCard className="p-4 flex flex-col justify-center h-full border-red-100 bg-red-50/30 dark:bg-red-900/10">
                  <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                     <ShieldAlert size={10} /> {t('supervisor.pendingDues')}
                  </p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(summary.pendingDues)}</p>
               </GlassCard>
            </div>
          </>
        )}

        {activeSegment === 'students' && (
          <div className="w-full overflow-x-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mt-6 relative">
             <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                   <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                      <th className="px-6 py-5">{t('attendance.studentName')}</th>
                      <th className="px-6 py-5">{t('supervisor.status')}</th>
                      <th className="px-6 py-5">{t('supervisor.financialStatus')}</th>
                      <th className="px-6 py-5 text-right">{t('supervisor.actions')}</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                   {students.filter(s => 
                     s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                     s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     s.email?.toLowerCase().includes(searchTerm.toLowerCase())
                   ).map((s) => {
                      const sub = getSubscriptionStatus(s.subscriptionExpiry);
                      return (
                         <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                            <td className="px-6 py-5">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                     {s.fullName?.[0] || s.name?.[0]}
                                  </div>
                                  <div>
                                     <p className="font-bold text-slate-900 dark:text-slate-100">{s.fullName || s.name}</p>
                                     <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{s.assignedLevel || 'No Level'} • {groups.find(g => g.studentIds?.includes(s.id))?.name || 'No Group'}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-5">
                               <span className={cn(
                                 "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                 s.status === 'active' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                               )}>
                                  {s.status}
                               </span>
                            </td>
                            <td className="px-6 py-5">
                               <div className="flex flex-col gap-1">
                                  <span className={cn("inline-block px-2 py-0.5 rounded text-[10px] font-bold w-fit", sub.color)}>
                                     {sub.label}
                                  </span>
                                  <div className="flex items-center gap-2">
                                     <p className="text-[9px] text-slate-400">Next Due: {s.subscriptionExpiry ? new Date(s.subscriptionExpiry).toLocaleDateString() : 'N/A'}</p>
                                     {selectedGroupId !== 'all' && (
                                       <span className="text-[9px] font-bold text-primary bg-primary/5 px-1.5 rounded flex items-center gap-1">
                                          <Clock size={8} /> {attendanceSummary[s.id] || 0} جلسة/شهر
                                       </span>
                                     )}
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-5">
                               <div className="flex items-center justify-end gap-2">
                                  <button 
                                    onClick={() => setShowDetailModal(s)}
                                    className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm"
                                    title={t('supervisor.viewHistory')}
                                  >
                                     <FileText size={16} />
                                  </button>
                                  <button 
                                    onClick={() => setShowPaymentModal(s)}
                                    className="p-2.5 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                    title={t('supervisor.recordPayment')}
                                  >
                                     <DollarSign size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleSendReminder(s.id)}
                                    className="p-2.5 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                    title={t('supervisor.sendReminder')}
                                  >
                                     <BellRing size={16} />
                                  </button>
                               </div>
                            </td>
                         </tr>
                      );
                   })}
                </tbody>
             </table>
          </div>
        )}

        {activeSegment === 'groups' && (
           <div className="space-y-6 pb-20">
              <div className="flex justify-between items-center">
                 <h2 className="text-xl font-bold dark:text-white">{t('supervisor.allGroups')}</h2>
                 {(!myProfile?.canCreateGroups && myProfile?.role === 'supervisor') ? (
                    <p className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-xl border border-amber-100 dark:border-amber-900/30">{t('supervisor.waitingPerm')}</p>
                 ) : (
                    <GlassButton variant="primary" icon={PlusIcon} onClick={() => {
                      setGroupForm({ name: '', trainerIds: [], isActive: true, scheduledTime: '', jitsiRoom: '' });
                      setShowGroupModal({});
                    }}>{t('supervisor.createNewGroup')}</GlassButton>
                 )}
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-slate-900 dark:text-white">
                 {groups.map(g => (
                   <GlassCard key={g.id} className="p-6 relative group overflow-hidden">
                      <div className="flex justify-between mb-4">
                         <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Users /></div>
                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setGroupForm(g); setShowGroupModal(g); }} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><FileEdit size={14} /></button>
                            <button onClick={() => handleDeleteGroup(g.id)} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"><Trash2 size={14} /></button>
                         </div>
                      </div>
                      <h3 className="text-lg font-bold mb-1">{g.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{g.studentIds?.length || 0} {t('supervisor.studentsCount')}</p>
                      
                      <div className="mt-4 flex flex-col gap-2">
                         <GlassButton 
                           className="w-full !py-2 text-[10px]" 
                           variant="primary" 
                           icon={CheckCircle2}
                           onClick={() => {
                             setSelectedGroupId(g.id);
                             setShowSessionModal(g);
                           }}
                         >
                           {t('supervisor.trackAttendance')}
                         </GlassButton>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                         <div className="flex -space-x-3">
                            {g.trainerIds?.slice(0, 3).map((tid: string) => (
                              <div key={tid} title={trainers.find(t => t.id === tid)?.name} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${tid}`} alt="tr" />
                              </div>
                            ))}
                         </div>
                         <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase", g.isActive ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400")}>
                           {g.isActive ? t('supervisor.active') : t('supervisor.archived')}
                         </span>
                      </div>
                   </GlassCard>
                 ))}
              </div>
           </div>
        )}

        {activeSegment === 'trainers' && (
           <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('supervisor.trainingStaff')}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-slate-900 dark:text-white">
                 {trainers.map(t => (
                   <GlassCard key={t.id} className="flex flex-col items-center text-center p-8">
                      <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-1 mb-4">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.id}`} className="w-full h-full object-cover rounded-2xl" alt="tr" />
                      </div>
                      <h3 className="font-black text-slate-900 dark:text-white">{t.name || t.fullName}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-6">{t.email}</p>
                      
                      <div className="w-full grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                         <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{t('supervisor.groups')}</p>
                            <p className="text-lg font-bold">{groups.filter(g => g.trainerIds?.includes(t.id)).length}</p>
                         </div>
                         <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{t('supervisor.hourlyRate')}</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(t.hourly_rate || 0)}/hr</p>
                         </div>
                      </div>

                      <div className="w-full mt-6 grid grid-cols-2 gap-3">
                         <GlassButton 
                           variant="primary" 
                           className="!py-2 text-[10px] w-full" 
                           icon={DollarSign}
                           onClick={() => setShowTrainerFinanceModal(t)}
                         >
                            {t('supervisor.finances')}
                         </GlassButton>
                         <GlassButton 
                           variant="secondary" 
                           className="!py-2 text-[10px] w-full" 
                           icon={FileText}
                           onClick={() => {
                              alert(`Generating Experience Certificate for ${t.name || t.fullName}`);
                           }}
                         >
                            {t('supervisor.expCert')}
                         </GlassButton>
                      </div>
                   </GlassCard>
                 ))}
              </div>
           </div>
        )}

        {activeSegment === 'assessments' && (
           <section className="space-y-6">
              <div className="flex items-center justify-between">
                 <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white"><BarChart3 className="text-primary" /> {t('supervisor.qualityAssessments' as any)}</h2>
                 <GlassButton variant="primary" onClick={() => navigate('/dashboard/assessments')}>{t('supervisor.qualityPanel' as any)}</GlassButton>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                   { title: t('supervisor.trainerEval' as any), path: '/assessments/trainer', icon: <Users /> },
                   { title: t('supervisor.programQuality' as any), path: '/assessments/program', icon: <BookOpen /> },
                   { title: t('supervisor.studentFeedback' as any), path: '/assessments/student', icon: <Smile /> },
                   { title: t('supervisor.performance' as any), path: '/assessments/performance', icon: <TrendingUp /> }
                 ].map((item, i) => (
                   <GlassCard key={i} className="p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border-none" onClick={() => navigate(item.path)}>
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">{item.icon}</div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</h3>
                   </GlassCard>
                 ))}
              </div>
           </section>
        )}

        {/* Detail Modal (History & Notes) */}
        <AnimatePresence>
           {showDetailModal && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowDetailModal(null)} 
                />
                <motion.div 
                  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
                  className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[90vh] relative z-10 flex flex-col overflow-hidden"
                >
                   <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                      <div className="flex items-center gap-4">
                         <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{showDetailModal.fullName}</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest mt-1">{t('supervisor.enrollDate')}: {new Date(showDetailModal.createdAt).toLocaleDateString()}</p>
                         </div>
                         <GlassButton 
                            onClick={generatePDFReport}
                            className="bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white transition-all ml-4"
                            icon={FileText}
                         >
                            {t('supervisor.exportPDF')}
                         </GlassButton>
                      </div>
                      <button onClick={() => setShowDetailModal(null)} className="p-2 bg-slate-200 dark:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300"><X size={24} /></button>
                   </div>

                   <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white dark:bg-slate-900">
                      <div className="grid lg:grid-cols-3 gap-8">
                         {/* 1. Payment History */}
                         <div className="space-y-6">
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                               <DollarSign size={16} className="text-green-600" /> {t('supervisor.paymentHistory')}
                            </h3>
                            <div className="space-y-4">
                               {paymentHistory.map((p, i) => (
                                 <div key={p.id} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                       <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">{p.period}</p>
                                       <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(p.amount)}</p>
                                    </div>
                                    <div className="space-y-1">
                                       <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                          <Clock size={10} /> {new Date(p.paidAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                                       </p>
                                       <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                                          💳 {t('supervisor.method')}: {p.method}
                                       </p>
                                       <p className="text-[9px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-2 font-medium">
                                          👤 {t('supervisor.receivedBy')}: <span className="text-slate-600 dark:text-slate-300">{p.recorderName || t('supervisor.eWallet')}</span>
                                       </p>
                                    </div>
                                    {p.notes && <p className="mt-2 text-[10px] text-slate-400 italic border-t dark:border-slate-700 pt-2">"{p.notes}"</p>}
                                 </div>
                               ))}
                               {paymentHistory.length === 0 && <p className="text-slate-400 italic text-sm text-center py-10">{t('supervisor.noPayments')}</p>}
                            </div>
                         </div>

                         {/* 2. Attendance History */}
                         <div className="space-y-6">
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                               <Clock size={16} className="text-blue-600" /> {t('supervisor.attendanceActivity')}
                            </h3>
                            <div className="space-y-3">
                               {attendanceHistory.map((a) => (
                                  <div key={a.id} className={cn(
                                    "p-3 rounded-xl border flex items-center justify-between text-xs",
                                    a.status ? "bg-green-50 border-green-100 text-green-700 dark:bg-green-900/10 dark:border-green-900 dark:text-green-400" : "bg-red-50 border-red-100 text-red-700 dark:bg-red-900/10 dark:border-red-900 dark:text-red-400"
                                  )}>
                                     <div className={cn(language === 'ar' ? 'text-right' : 'text-left')}>
                                        <p className="font-bold">{a.groupName}</p>
                                        <p className="text-[10px] opacity-70">{new Date(a.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
                                     </div>
                                     <span className="font-black px-2 py-1 rounded-lg bg-white/50 dark:bg-slate-800/50">
                                        {a.status ? t('attendance.present') : t('attendance.absent')}
                                     </span>
                                  </div>
                               ))}
                               {attendanceHistory.length === 0 && <p className="text-slate-400 italic text-sm text-center py-10">{t('supervisor.noAttendance')}</p>}
                            </div>
                         </div>

                         {/* 3. Notes & Admin */}
                         <div className="space-y-6">
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                               <MessageSquare size={16} className="text-orange-600" /> {t('supervisor.adminNotes')}
                            </h3>
                            <form onSubmit={handleAddNote} className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                               <textarea 
                                 placeholder={t('supervisor.addNotePlaceholder')} 
                                 className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-[10px] resize-none h-20 outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white"
                                 value={newNote}
                                 onChange={(e) => setNewNote(e.target.value)}
                               />
                               <div className="flex flex-col gap-2">
                                  <select 
                                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[9px] font-bold px-3 py-2 outline-none text-slate-900 dark:text-white"
                                    value={noteType}
                                    onChange={(e) => setNoteType(e.target.value)}
                                  >
                                     <option value="general">{t('supervisor.noteGeneral')}</option>
                                     <option value="discount_excellence">{t('supervisor.noteExcellence')}</option>
                                     <option value="discount_social">{t('supervisor.noteSocial')}</option>
                                     <option value="dues">{t('supervisor.noteDues')}</option>
                                  </select>
                                  <GlassButton type="submit" className="w-full py-2 text-[10px] bg-slate-900 dark:bg-slate-700 text-white rounded-lg">{t('supervisor.saveNote')}</GlassButton>
                               </div>
                            </form>

                            <div className="space-y-3">
                               {studentNotes.map(n => (
                                 <div key={n.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-1">
                                    <div className="flex justify-between">
                                       <span className={cn(
                                         "px-2 py-0.5 rounded text-[8px] font-bold uppercase",
                                         n.type.includes('discount') ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : n.type === 'dues' ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                       )}>{n.type.replace('_', ' ')}</span>
                                       <span className="text-[8px] text-slate-400 dark:text-slate-500">{new Date(n.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{n.content}</p>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                </motion.div>
           </div>
        )}
      </AnimatePresence>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPaymentModal(null)} />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
             >
                <div className="bg-green-600 p-8 text-white flex justify-between items-center">
                   <div>
                      <h3 className="text-xl font-bold">{t('supervisor.recordSubscription')}</h3>
                      <p className="text-xs text-white/70 mt-1">{t('supervisor.student')}: {showPaymentModal.fullName || showPaymentModal.name}</p>
                   </div>
                   <button onClick={() => setShowPaymentModal(null)} className="p-2 hover:rotate-90 transition-transform"><XCircle size={28} /></button>
                </div>
                <form onSubmit={handlePayment} className="p-10 space-y-6">
                   <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">{t('supervisor.paymentAmount')}</label>
                      <input required type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-green-500/10 text-xl font-bold text-slate-900 dark:text-white" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">{t('supervisor.period')}</label>
                         <input required placeholder="Month 1" value={period} onChange={(e) => setPeriod(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">{t('supervisor.method')}</label>
                         <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">
                            <option>Vodafone Cash</option>
                            <option>InstaPay</option>
                            <option>Cash</option>
                            <option>Bank</option>
                         </select>
                      </div>
                   </div>
                   <GlassButton type="submit" variant="primary" className="w-full py-5 bg-green-600 text-white border-none shadow-xl shadow-green-600/20 font-bold tracking-widest">
                      {t('supervisor.updateSubscription')} <CheckCircle2 className={`${language === 'ar' ? 'mr-2' : 'ml-2'} w-5 h-5`} />
                   </GlassButton>
                </form>
             </motion.div>
          </div>
       )}
        {/* Group Management Modal */}
        {showGroupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowGroupModal(null)} />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden"
             >
                <div className="bg-primary p-8 text-white flex justify-between items-center">
                   <div>
                      <h3 className="text-xl font-bold">{showGroupModal.id ? t('supervisor.editGroup') : t('supervisor.createGroup')}</h3>
                      <p className="text-xs text-white/70 mt-1">{t('supervisor.configureGroup')}</p>
                   </div>
                   <button onClick={() => setShowGroupModal(null)} className="p-2 hover:rotate-90 transition-transform"><XCircle size={28} /></button>
                </div>
                <form onSubmit={handleCreateOrUpdateGroup} className="p-8 space-y-6">
                   <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">{t('supervisor.groupName')}</label>
                      <input 
                        required 
                        value={groupForm.name} 
                        onChange={(e) => setGroupForm({...groupForm, name: e.target.value})} 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/10 text-lg font-bold text-slate-900 dark:text-white" 
                        placeholder="e.g. Flutter Track - Group A"
                      />
                   </div>
                   
                   <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">{t('supervisor.assignTrainers')}</label>
                      <div className="flex flex-wrap gap-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                         {trainers.map(tData => (
                           <button
                             key={tData.id}
                             type="button"
                             onClick={() => {
                               const ids = groupForm.trainerIds.includes(tData.id) 
                                 ? groupForm.trainerIds.filter(id => id !== tData.id)
                                 : [...groupForm.trainerIds, tData.id];
                               setGroupForm({...groupForm, trainerIds: ids});
                             }}
                             className={cn(
                               "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                               groupForm.trainerIds.includes(tData.id) ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600"
                             )}
                           >
                             {tData.name || tData.fullName}
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">{t('supervisor.scheduledTime')}</label>
                         <input 
                           placeholder="e.g. Sat 4PM" 
                           value={groupForm.scheduledTime} 
                           onChange={(e) => setGroupForm({...groupForm, scheduledTime: e.target.value})} 
                           className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white" 
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">{t('supervisor.jitsiRoomId')}</label>
                         <input 
                           placeholder="Custom Room Name" 
                           value={groupForm.jitsiRoom} 
                           onChange={(e) => setGroupForm({...groupForm, jitsiRoom: e.target.value})} 
                           className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white" 
                         />
                      </div>
                   </div>

                   <GlassButton type="submit" variant="primary" className="w-full py-5 font-bold tracking-widest">
                      {showGroupModal.id ? t('supervisor.saveChanges') : t('supervisor.createGroupBtn')} <CheckCircle2 className={`${language === 'ar' ? 'mr-2' : 'ml-2'} w-5 h-5`} />
                   </GlassButton>
                </form>
             </motion.div>
          </div>
        )}

        {/* Contract Issue Modal */}
        <AnimatePresence>
          {showContractModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowContractModal(null)} />
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                 className="bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden"
               >
                  <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                     <div className={cn(language === 'ar' ? 'text-right' : 'text-left')}>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('supervisor.issueNewContract')} 📜</h2>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{showContractModal.fullName || showContractModal.name}</p>
                     </div>
                     <GlassButton icon={X} onClick={() => setShowContractModal(null)} className="!p-2" variant="secondary" />
                  </div>
                  <form onSubmit={handleIssueContract} className="p-8 space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('supervisor.contractTitle')}</label>
                        <input 
                          required 
                          value={contractForm.title} 
                          onChange={(e) => setContractForm({...contractForm, title: e.target.value})} 
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/10 font-bold text-slate-900 dark:text-white" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('supervisor.contractContent')}</label>
                        <textarea 
                          required 
                          value={contractForm.content} 
                          onChange={(e) => setContractForm({...contractForm, content: e.target.value})} 
                          className="w-full h-80 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/10 resize-none font-medium text-sm leading-relaxed text-slate-900 dark:text-white" 
                        />
                     </div>
                     <GlassButton type="submit" variant="primary" className="w-full py-6 font-black tracking-widest uppercase rounded-3xl shadow-xl shadow-primary/20">
                        {t('supervisor.sendForSignature')} <CheckCircle2 className={`${language === 'ar' ? 'mr-2' : 'ml-2'} w-5 h-5`} />
                     </GlassButton>
                  </form>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Session / Attendance Modal */}
        <AnimatePresence>
          {showSessionModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
                onClick={() => setShowSessionModal(null)} 
              />
              <motion.div 
                initial={{ y: 20, opacity: 0, scale: 0.95 }} 
                animate={{ y: 0, opacity: 1, scale: 1 }} 
                exit={{ y: 20, opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[90vh] relative z-10 flex flex-col overflow-hidden dark:bg-slate-900"
              >
                  <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-primary text-white">
                    <div className={cn(language === 'ar' ? 'text-right' : 'text-left')}>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <CheckCircle2 /> {t('supervisor.sessionAttendance')}: {showSessionModal.name}
                      </h2>
                      <p className="text-xs text-white/70 mt-1">{t('progress.date')}: {new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <button onClick={() => setShowSessionModal(null)} className="p-2 hover:rotate-90 transition-transform"><XCircle size={28} /></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="space-y-4">
                      {students.map((s) => {
                        const sub = getSubscriptionStatus(s.subscriptionExpiry);
                        const isPresent = sessionAttendance.includes(s.id);
                        return (
                          <div key={s.id} className={cn(
                            "group p-4 rounded-2xl border transition-all flex items-center justify-between",
                            isPresent ? "bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-900" : "bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-700"
                          )}>
                            <div className="flex items-center gap-4">
                              <button 
                                onClick={() => toggleAttendance(s.id)}
                                className={cn(
                                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm",
                                  isPresent ? "bg-green-500 text-white" : "bg-slate-100 text-slate-300 dark:bg-slate-700 dark:text-slate-500"
                                )}
                              >
                                <CheckCircle2 size={24} />
                              </button>
                              <div className={cn(language === 'ar' ? 'text-right' : 'text-left')}>
                                <h4 className="font-bold text-slate-900 dark:text-slate-100">{s.fullName || s.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={cn("px-2 py-0.5 rounded text-[8px] font-bold uppercase", sub.color)}>
                                    {sub.label}
                                  </span>
                                  <span className="text-[10px] text-slate-400">{t('supervisor.monthActivity')}: {attendanceSummary[s.id] || 0} {t('supervisor.sessions')}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                               <button 
                                 onClick={() => setShowDetailModal(s)}
                                 className="p-2 text-slate-400 hover:text-primary transition-colors"
                                 title={t('common.details')}
                               >
                                  <FileText size={18} />
                               </button>
                               <button 
                                 onClick={() => setShowContractModal(s)}
                                 className="p-2 text-slate-400 hover:text-orange-500 transition-colors"
                                 title={t('supervisor.issueContract')}
                               >
                                  <ShieldAlert size={18} />
                                </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
                     <button 
                        onClick={() => setShowSessionModal(null)}
                        className="px-6 py-3 font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                     >
                        {t('common.cancel')}
                     </button>
                     <GlassButton 
                        variant="primary" 
                        disabled={isAttendanceSaving}
                        onClick={handleSaveAttendance}
                        className="px-10"
                     >
                        {isAttendanceSaving ? t('common.saving') : t('supervisor.saveSessionAttendance')}
                     </GlassButton>
                  </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Trainer Finance Modal */}
        <AnimatePresence>
           {showTrainerFinanceModal && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                   className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowTrainerFinanceModal(null)} 
                />
                <motion.div 
                   initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                   className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-5xl max-h-[90vh] relative z-10 flex flex-col overflow-hidden"
                >
                   <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <DollarSign size={24} />
                         </div>
                         <div className={cn(language === 'ar' ? 'text-right' : 'text-left')}>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('supervisor.trainerFinances')}: {showTrainerFinanceModal.displayName || showTrainerFinanceModal.name}</h2>
                            <p className="text-xs text-slate-500 font-bold">{t('supervisor.trainerFinanceNote')}</p>
                         </div>
                      </div>
                      <button onClick={() => setShowTrainerFinanceModal(null)} className="p-2 bg-slate-200 dark:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300"><X size={24} /></button>
                   </div>

                   <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white dark:bg-slate-900">
                      <div className="grid lg:grid-cols-3 gap-8">
                         <div className="space-y-6">
                            <GlassCard className="p-6 bg-slate-900 text-white border-none">
                               <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{t('supervisor.currentBalance')}</p>
                               <h3 className="text-4xl font-black text-green-400">{formatCurrency(trainerBalanceInfo?.balance || 0)}</h3>
                               <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
                                  <div>
                                     <p className="text-[8px] uppercase text-slate-400 font-bold">{t('supervisor.pendingHours')}</p>
                                     <p className="text-sm font-bold">{formatCurrency(trainerBalanceInfo?.unsettled_earnings || 0)}</p>
                                  </div>
                                  <div>
                                     <p className="text-[8px] uppercase text-slate-400 font-bold">{t('supervisor.totalPaid')}</p>
                                     <p className="text-sm font-bold text-slate-300">{formatCurrency(trainerBalanceInfo?.payments || 0)}</p>
                                  </div>
                               </div>
                            </GlassCard>

                            <div className="p-6 space-y-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-slate-900 dark:text-white">
                               <h4 className="text-xs font-black  uppercase">{t('supervisor.updateHourlyRate')}</h4>
                               <div className="flex gap-2">
                                  <input 
                                    type="number" 
                                    className="flex-1 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-2 text-sm outline-none font-bold"
                                    value={newRate}
                                    onChange={(e) => setNewRate(e.target.value)}
                                  />
                                  <GlassButton variant="primary" className="!py-2" onClick={handleUpdateRate}>{t('common.update')}</GlassButton>
                               </div>
                            </div>

                            <form onSubmit={handleTrainerTransaction} className="space-y-4 p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white">
                               <h4 className="text-xs font-black uppercase flex items-center gap-2">
                                  <PlusIcon size={14} className="text-primary" /> {t('supervisor.addTransaction')}
                               </h4>
                               <div className="space-y-3">
                                  <select 
                                    className="w-full bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                                    value={financeForm.type}
                                    onChange={(e) => setFinanceForm({...financeForm, type: e.target.value as any})}
                                  >
                                     <option value="payment">{t('supervisor.transPayment')}</option>
                                     <option value="reward">{t('supervisor.transReward')}</option>
                                     <option value="penalty">{t('supervisor.transPenalty')}</option>
                                  </select>
                                  <input 
                                    type="number" 
                                    placeholder={t('supervisor.amount')}
                                    className="w-full bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                                    value={financeForm.amount}
                                    onChange={(e) => setFinanceForm({...financeForm, amount: e.target.value})}
                                    required
                                  />
                                  <textarea 
                                    placeholder={t('supervisor.notes')}
                                    className="w-full bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none h-16 resize-none"
                                    value={financeForm.description}
                                    onChange={(e) => setFinanceForm({...financeForm, description: e.target.value})}
                                  />
                                  {financeForm.type === 'payment' && (
                                    <input 
                                      type="text" 
                                      placeholder={t('supervisor.paymentMethod')}
                                      className="w-full bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                                      value={financeForm.method}
                                      onChange={(e) => setFinanceForm({...financeForm, method: e.target.value})}
                                    />
                                  )}
                                  <GlassButton type="submit" variant="primary" className="w-full !py-2 text-xs">{t('supervisor.recordTransaction')}</GlassButton>
                               </div>
                            </form>
                         </div>

                         <div className="lg:col-span-2 space-y-6">
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                               <History size={16} className="text-primary" /> {t('supervisor.financeHistory')}
                            </h3>
                            <div className="space-y-4">
                               {trainerHistory.sessions.map((s) => (
                                 <div key={s.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                                    <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                                          <BookOpen size={16} />
                                       </div>
                                       <div className={cn(language === 'ar' ? 'text-right' : 'text-left')}>
                                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{s.groupName}</p>
                                          <p className="text-[9px] text-slate-400">{new Date(s.sessionDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')} • {s.durationHours} {t('supervisor.hours')}</p>
                                       </div>
                                    </div>
                                    <div className={cn(language === 'ar' ? 'text-left' : 'text-right', "text-slate-900 dark:text-white")}>
                                       <p className="text-sm font-black">+{formatCurrency(s.earnedAmount)}</p>
                                       <span className={cn("text-[8px] font-bold uppercase", s.status === 'settled' ? "text-green-500" : "text-orange-500")}>
                                          {s.status === 'settled' ? t('supervisor.statusSettled') : t('supervisor.statusPending')}
                                       </span>
                                    </div>
                                 </div>
                               ))}

                               {trainerHistory.transactions.map((tra) => (
                                 <div key={tra.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                                    <div className="flex items-center gap-3">
                                       <div className={cn(
                                          "w-8 h-8 rounded-lg flex items-center justify-center",
                                          tra.type === 'payment' ? "bg-green-50 text-green-600 dark:bg-green-900/20" :
                                          tra.type === 'reward' ? "bg-purple-50 text-purple-600 dark:bg-purple-900/20" : "bg-red-50 text-red-600 dark:bg-red-900/20"
                                       )}>
                                          {tra.type === 'payment' ? <CheckCircle2 size={16} /> : tra.type === 'reward' ? <TrendingUp size={16} /> : <AlertTriangle size={16} />}
                                       </div>
                                       <div className={cn(language === 'ar' ? 'text-right' : 'text-left')}>
                                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{tra.description || tra.type}</p>
                                          <p className="text-[9px] text-slate-400">{new Date(tra.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
                                       </div>
                                    </div>
                                    <div className={cn(language === 'ar' ? 'text-left' : 'text-right')}>
                                       <p className={cn("text-sm font-black", tra.type === 'penalty' ? "text-red-500" : "text-green-600")}>
                                          {tra.type === 'penalty' ? '-' : '+'}{formatCurrency(tra.amount)}
                                       </p>
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                </motion.div>
             </div>
           )}
        </AnimatePresence>
        
        {/* Student Registration Modal */}
        <AnimatePresence>
          {showRegisterModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
                onClick={() => setShowRegisterModal(false)} 
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl w-full max-w-xl relative z-10 overflow-hidden"
              >
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                  <div className={cn(language === 'ar' ? 'text-right' : 'text-left')}>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('supervisor.registerNewStudent' as any)} 🎓</h2>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{t('supervisor.registerNote' as any)}</p>
                  </div>
                  <GlassButton icon={X} onClick={() => setShowRegisterModal(false)} className="!p-2" variant="secondary" />
                </div>
                
                <form onSubmit={handleRegisterStudent} className="p-8 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 px-1">{t('common.fullName')}</label>
                      <input 
                        required
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 font-bold dark:text-white"
                        value={regForm.fullName}
                        onChange={(e) => setRegForm({...regForm, fullName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 px-1">{t('common.email')}</label>
                      <input 
                        required type="email"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 font-bold dark:text-white"
                        value={regForm.email}
                        onChange={(e) => setRegForm({...regForm, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 px-1">{t('common.phone')}</label>
                      <input 
                        required
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 font-bold dark:text-white"
                        value={regForm.phone}
                        onChange={(e) => setRegForm({...regForm, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 px-1">{t('common.whatsappNumber')}</label>
                      <input 
                        required
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 font-bold dark:text-white"
                        value={regForm.whatsappNumber}
                        onChange={(e) => setRegForm({...regForm, whatsappNumber: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400 px-1">{t('common.level')}</label>
                      <select 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 font-bold dark:text-white appearance-none"
                        value={regForm.assignedLevel}
                        onChange={(e) => setRegForm({...regForm, assignedLevel: e.target.value})}
                      >
                         <option value="Level 1">Level 1 - Scratch & Logic</option>
                         <option value="Level 2">Level 2 - Web Development</option>
                         <option value="Level 3">Level 3 - Python & AI</option>
                         <option value="Level 4">Level 4 - Advanced Projects</option>
                      </select>
                    </div>
                  </div>
                  
                  <GlassButton type="submit" variant="primary" className="w-full py-4 mt-4 font-black tracking-widest uppercase rounded-2xl shadow-xl shadow-primary/20">
                    {t('supervisor.completeRegistration' as any)}
                  </GlassButton>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </DashboardLayout>
  );
}
