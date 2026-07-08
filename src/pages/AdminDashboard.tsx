import * as React from 'react';
import { collection, onSnapshot, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/src/firebase';
import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import { GlassCard, GlassButton } from '@/src/components/common/Layout';
import { 
  Users, 
  Settings, 
  ShieldCheck, 
  DollarSign, 
  Activity, 
  Search, 
  Filter, 
  FileText,
  TrendingUp,
  UserPlus,
  Check,
  CheckCircle2,
  X,
  Upload,
  DownloadCloud,
  UserCheck,
  Loader2,
  CreditCard,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Smile,
  LayoutTemplate
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn, formatCurrency } from '@/src/lib/utils';
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import * as XLSX from 'xlsx';
import { 
  approveRegistration, 
  importStudents,
  getDatabaseBackup
} from '@/src/services/firestoreService';
import { safeStringify } from '@/src/lib/safeStringify';
import ToolLibrary from '@/src/components/dashboard/ToolLibrary';
import {
  getFinancialSummaryFromSQL,
  getPaymentSettingsFromSQL,
  updatePaymentSettingsInSQL,
  getSystemSettingsFromSQL,
  updateSystemSettingsInSQL,
  getStudentsInGroupFromSQL,
  recordPaymentToSQL,
  addApplicationToSQL,
  getUsersByRoleFromSQL,
  updateUserRoleInSQL,
  getAllGroupsFromSQL,
  updateGroupInSQL,
  apiFetch
} from '@/src/services/hybridApiService';
import { useAuth } from '@/src/context/AuthContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { 
  Monitor, 
  Smartphone, 
  Terminal, 
  Box,
  Plus as PlusIcon,
  Trash2,
  Info
} from 'lucide-react';

const chartData = [
  { name: 'Jan', revenue: 45000 },
  { name: 'Feb', revenue: 52000 },
  { name: 'Mar', revenue: 48000 },
  { name: 'Apr', revenue: 61000 },
  { name: 'May', revenue: 55000 },
  { name: 'Jun', revenue: 67000 },
];

export default function AdminDashboard() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [pendingUsers, setPendingUsers] = React.useState<any[]>([]);
  const [groups, setGroups] = React.useState<any[]>([]);
  const [allGroups, setAllGroups] = React.useState<any[]>([]);
  const [adminCourses, setAdminCourses] = React.useState<any[]>([]);
  const [teamMembers, setTeamMembers] = React.useState<any[]>([]);
  const [updatingUserRole, setUpdatingUserRole] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [importing, setImporting] = React.useState(false);
  const [backingUp, setBackingUp] = React.useState(false);
  const [summary, setSummary] = React.useState({ totalIncome: 0, pendingDues: 0 });
  const [activeTab, setActiveTab] = React.useState<'overview' | 'approvals' | 'payments' | 'students' | 'apps' | 'bot' | 'team' | 'assessments' | 'courses' | 'users'>('overview');
  const [allUsers, setAllUsers] = React.useState<any[]>([]);
  const [userSearch, setUserSearch] = React.useState('');

  React.useEffect(() => {
    if (activeTab === 'users') {
      const fetchAllUsers = async () => {
        const data = await apiFetch('/users.php?action=list_all');
        if (data.status === 'success') setAllUsers(data.data);
      };
      fetchAllUsers();
    }
  }, [activeTab]);

  React.useEffect(() => {
    getAllGroupsFromSQL().then(setAllGroups);
  }, []);

  React.useEffect(() => {
    if (activeTab === 'courses') {
       apiFetch('/courses.php?action=admin_list').then(res => {
         if (res.status === 'success') setAdminCourses(res.data);
       });
    }
    if (activeTab === 'team') {
       // Fetching admins, supervisors, and trainers
       const fetchTeam = async () => {
         const [admins, supers, trainers] = await Promise.all([
           getUsersByRoleFromSQL('admin'),
           getUsersByRoleFromSQL('supervisor'),
           getUsersByRoleFromSQL('trainer'),
         ]);
         setTeamMembers([...admins, ...supers, ...trainers]);
       };
       fetchTeam();
    }
  }, [activeTab]);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if(!confirm(`تغيير رتبة المستخدم إلى ${newRole}؟`)) return;
    setUpdatingUserRole(userId);
    try {
       await updateUserRoleInSQL(userId, newRole);
       // Sync with firestore too for role consistency
       await updateDoc(doc(db, 'users', userId), { role: newRole });
       
      // Refresh
      const [admins, supers, trainers] = await Promise.all([
        getUsersByRoleFromSQL('admin'),
        getUsersByRoleFromSQL('supervisor'),
        getUsersByRoleFromSQL('trainer'),
      ]);
      setTeamMembers([...admins, ...supers, ...trainers]);
      alert("تم تحديث الرتبة بنجاح");
    } catch(err) {
      alert("فشل تحديث الرتبة");
    } finally {
      setUpdatingUserRole(null);
    }
  };

  const handleTogglePermission = async (userId: string, field: string, currentValue: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { [field]: !currentValue });
      alert("تم تحديث الصلاحية بنجاح");
      // Refresh team data from SQL as it doesn't have permissions, but we'll manually update local state or re-fetch once Firestore syncs
      // For now, re-fetching team would be enough if profile hook is used elsewhere
      const [admins, supers, trainers] = await Promise.all([
        getUsersByRoleFromSQL('admin'),
        getUsersByRoleFromSQL('supervisor'),
        getUsersByRoleFromSQL('trainer'),
      ]);
      setTeamMembers([...admins, ...supers, ...trainers]);
    } catch (err) {
      alert("فشل تحديث الصلاحية");
    }
  };

  const handleActivateGroup = async (groupId: string) => {
    try {
       await updateGroupInSQL(groupId, { isActive: true });
       alert("تم تفعيل المجموعة بنجاح");
       getAllGroupsFromSQL().then(setAllGroups);
    } catch (err) {
       alert("فشل تفعيل المجموعة");
    }
  };
  const [paymentSettings, setPaymentSettings] = React.useState<Record<string, string>>({
    wallet_name: '',
    wallet_number: '',
    instapay_link: '',
    fawry_code: '',
    bank_gateway_api: ''
  });
  const [systemSettings, setSystemSettings] = React.useState<Record<string, string>>({
    chatbot_api_key: '',
    chatbot_context: ''
  });
  const [savingSettings, setSavingSettings] = React.useState(false);
  const [students, setStudents] = React.useState<any[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showPaymentModal, setShowPaymentModal] = React.useState<any | null>(null);
  const [amount, setAmount] = React.useState('');
  const [method, setMethod] = React.useState('Vodafone Cash');
  const [period, setPeriod] = React.useState('Month 1');
  const [notes, setNotes] = React.useState('');

  // Application Form State
  const [showAppModal, setShowAppModal] = React.useState(false);
  const [appForm, setAppForm] = React.useState({
    name: '',
    description: '',
    image: '',
    targetType: 'all' as 'all' | 'level' | 'group' | 'student',
    targetId: '',
    platforms: [{ os: 'Windows', url: '' }]
  });

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appForm.name) return;
    try {
      await addApplicationToSQL(appForm);
      setShowAppModal(false);
      setAppForm({
        name: '',
        description: '',
        image: '',
        targetType: 'all',
        targetId: '',
        platforms: [{ os: 'Windows', url: '' }]
      });
      alert('Application added successfully!');
    } catch (err) {
      alert('Failed to add application');
    }
  };

  // Fetch all students logic for manual payments
  React.useEffect(() => {
    if (activeTab === 'students') {
       getStudentsInGroupFromSQL('all').then(setStudents);
    }
  }, [activeTab]);

  const handleBackup = async () => {
    if(!confirm("أخذ نسخة احتياطية من جميع بيانات المتدربين والفواتير والمجموعات؟ تستغرق العملية بضعة ثواني.")) return;
    setBackingUp(true);
    try {
      const data = await getDatabaseBackup();
      if(data) {
        const jsonStr = safeStringify(data);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TKA_Backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch(err) {
       alert("حدثت مشكلة أثناء النسخ الاحتياطي");
    } finally {
       setBackingUp(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPaymentModal) return;
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
      // Refresh students to show updated role/expiry
      getStudentsInGroupFromSQL('all').then(setStudents);
      getFinancialSummaryFromSQL().then(setSummary);
      alert("Payment recorded and student activated!");
    } catch (error) {
      console.error(error);
      alert("Failed to record payment.");
    }
  };

  // Fetch SQL Financials & Settings
  React.useEffect(() => {
    getFinancialSummaryFromSQL().then(setSummary);
    getPaymentSettingsFromSQL().then(setPaymentSettings);
    getSystemSettingsFromSQL().then(setSystemSettings);
  }, []);

  // Fetch pending registrations
  React.useEffect(() => {
    const q = query(collection(db, 'registrations'), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setPendingUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  // Fetch groups for assignment
  React.useEffect(() => {
    const q = collection(db, 'groups');
    const unsubscribe = onSnapshot(q, (snap) => {
      setGroups(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      try {
        await importStudents(data);
        alert(`${data.length} students imported successfully!`);
      } catch (err) {
        alert("Import failed");
      } finally {
        setImporting(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleApprove = async (regId: string, regData: any) => {
    if (confirm(`Approve this registration?`)) {
      try {
        await approveRegistration(regId, regData);
        alert("Registration approved successfully.");
      } catch (error) {
        console.error("Error approving:", error);
        alert("Failed to approve.");
      }
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updatePaymentSettingsInSQL(paymentSettings);
      alert("Payment gateway settings updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleUpdateBotSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateSystemSettingsInSQL(systemSettings);
      alert("Bot settings updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update bot settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <DashboardLayout role={profile?.role || 'admin'} userName={profile?.name || "Admin Core"}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">{t('adminTitle')}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{t('adminDesc')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
             <div className="relative overflow-hidden inline-block cursor-pointer">
                <GlassButton icon={backingUp ? Loader2 : DownloadCloud} variant="secondary" onClick={handleBackup} className={cn("text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100", backingUp && "animate-pulse")}>
                  {backingUp ? 'جاري التحميل...' : 'نسخة احتياطية'}
                </GlassButton>
             </div>
             <div className="relative overflow-hidden inline-block cursor-pointer">
                <GlassButton icon={importing ? Loader2 : Upload} variant="secondary" className={cn(importing && "animate-spin")}>
                  {importing ? 'Importing...' : 'Import Students'}
                </GlassButton>
                <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept=".xlsx, .xls" />
             </div>
             <GlassButton icon={FileText} variant="primary" className="bg-primary text-white border-none shadow-lg shadow-primary/20">Generate Report</GlassButton>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 overflow-x-auto pb-px">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={cn("pb-4 text-sm font-bold transition-all border-b-2 px-2", activeTab === 'overview' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600")}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={cn("pb-4 text-sm font-bold transition-all border-b-2 px-2 flex items-center gap-2", activeTab === 'users' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600")}
          >
            {t('navControlAdmin')}
          </button>
          <button 
            onClick={() => setActiveTab('approvals')} 
            className={cn("pb-4 text-sm font-bold transition-all border-b-2 px-2", activeTab === 'approvals' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600")}
          >
            {t('navApprovals')} ({pendingUsers.length})
          </button>
          <button 
            onClick={() => setActiveTab('payments')} 
            className={cn("pb-4 text-sm font-bold transition-all border-b-2 px-2", activeTab === 'payments' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600")}
          >
            {t('navPayments')}
          </button>
          <button 
            onClick={() => setActiveTab('students')} 
            className={cn("pb-4 text-sm font-bold transition-all border-b-2 px-2", activeTab === 'students' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600")}
          >
            {t('navStudentsAdmin')}
          </button>
          <button 
            onClick={() => setActiveTab('apps')} 
            className={cn("pb-4 text-sm font-bold transition-all border-b-2 px-2", activeTab === 'apps' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600")}
          >
            {t('navApps')}
          </button>
          <button 
            onClick={() => setActiveTab('bot')} 
            className={cn("pb-4 text-sm font-bold transition-all border-b-2 px-2 flex items-center gap-2", activeTab === 'bot' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600")}
          >
            {t('navBotConfig')}
          </button>
          <button 
            onClick={() => setActiveTab('team')} 
            className={cn("pb-4 text-sm font-bold transition-all border-b-2 px-2 flex items-center gap-2", activeTab === 'team' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600")}
          >
            {t('navTeam')}
          </button>
          <button 
            onClick={() => setActiveTab('assessments')} 
            className={cn("pb-4 text-sm font-bold transition-all border-b-2 px-2 flex items-center gap-2", activeTab === 'assessments' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600")}
          >
            {t('navAssessments')}
          </button>
          <button 
            onClick={() => setActiveTab('courses')} 
            className={cn("pb-4 text-sm font-bold transition-all border-b-2 px-2 flex items-center gap-2", activeTab === 'courses' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600")}
          >
            {t('navAdminCourses')}
          </button>
          <div className="flex-1" />
          <button 
            onClick={() => window.location.href = '/dashboard/admin/course-builder'}
            className="pb-4 text-sm font-bold transition-all text-secondary hover:text-primary flex items-center gap-2"
          >
            + {t('navAdminCourses')}
          </button>
        </div>

        {activeTab === 'users' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="text-primary" /> Comprehensive User Base
              </h2>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                   <input 
                     placeholder="Search users..." 
                     className="bg-transparent border-none outline-none pl-10 pr-4 py-1.5 text-xs text-slate-900 dark:text-white min-w-[250px]"
                     value={userSearch}
                     onChange={(e) => setUserSearch(e.target.value)}
                   />
                 </div>
              </div>
            </div>

            <div className="w-full overflow-x-auto bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                        <th className="px-8 py-5">User Profile</th>
                        <th className="px-8 py-5">Role & Clearance</th>
                        <th className="px-8 py-5">Security Status</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                     {allUsers.filter(u => 
                       (u.name || u.fullName || '').toLowerCase().includes(userSearch.toLowerCase()) || 
                       (u.email || '').toLowerCase().includes(userSearch.toLowerCase())
                     ).map((u) => (
                       <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-primary">
                                   {(u.displayName?.[0] || u.fullName?.[0] || u.name?.[0] || u.email?.[0] || 'U').toUpperCase()}
                                </div>
                                <div>
                                   <p className="font-bold text-slate-900 dark:text-white">{u.displayName || u.fullName || u.name || 'N/A'}</p>
                                   <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{u.email}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <span className={cn(
                               "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                               u.role === 'admin' ? "bg-red-100 text-red-600 dark:bg-red-900/20" : 
                               u.role === 'supervisor' ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20" : 
                               "bg-green-100 text-green-600 dark:bg-green-900/20"
                             )}>
                                {u.role}
                             </span>
                          </td>
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-2">
                                <div className={cn("w-2 h-2 rounded-full", u.isVerified ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-slate-300")} />
                                <span className="text-[10px] font-bold text-slate-500 uppercase">{u.isVerified ? 'Verified' : 'Unverified'}</span>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <GlassButton variant="secondary" className="!p-2" icon={FileText} />
                                <GlassButton variant="secondary" className="!p-2 text-red-600 hover:bg-red-600 hover:text-white transition-all" icon={Trash2} onClick={() => confirm(`Are you sure you want to delete ${u.email}?`) && alert('Safety lock enabled: Deletion from admin board requires multi-layer auth.')} />
                             </div>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </section>
        )}

        {activeTab === 'approvals' && (
        <section className="space-y-8">
          <div className="space-y-4">
             <div className="flex items-center justify-between">
               <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                 <UserCheck className="text-primary" /> Pending User Approvals ({pendingUsers.length})
               </h2>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
               {pendingUsers.length === 0 ? (
                 <GlassCard className="lg:col-span-2 py-6 text-center text-slate-500 italic text-sm">
                   No pending registrations.
                 </GlassCard>
               ) : (
                 pendingUsers.map(user => (
                   <GlassCard key={user.id} className="flex items-center justify-between p-6 shadow-sm border-l-4 border-l-secondary">
                     <div>
                       <p className="font-bold text-slate-900">{user.fullName || user.name}</p>
                       <p className="text-xs text-slate-500 font-mono mt-0.5">{user.email || user.whatsappNumber}</p>
                       <div className="flex gap-2 mt-2">
                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-lg text-slate-600 font-bold uppercase">{user.role}</span>
                       </div>
                     </div>
                     <div className="flex items-center gap-2">
                       <button onClick={() => handleApprove(user.id, user)} className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all">
                         <Check size={18} />
                       </button>
                       <button className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                         <X size={18} />
                       </button>
                     </div>
                   </GlassCard>
                 ))
               )}
             </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-200">
             <h2 className="text-xl font-bold flex items-center gap-2"><LayoutTemplate className="text-secondary" /> Pending Group Activations</h2>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {allGroups.filter(g => !g.isActive).length === 0 ? (
                   <GlassCard className="lg:col-span-2 py-6 text-center text-slate-500 italic text-sm">No groups waiting for activation.</GlassCard>
                ) : (
                   allGroups.filter(g => !g.isActive).map(g => (
                      <GlassCard key={g.id} className="p-5 flex items-center justify-between border-l-4 border-l-amber-400">
                         <div>
                            <p className="font-bold">{g.name}</p>
                            <p className="text-xs text-slate-500">Created by Supervisor</p>
                         </div>
                         <GlassButton variant="primary" onClick={() => handleActivateGroup(g.id)} className="!py-2 !px-4 text-xs">Activate Group</GlassButton>
                      </GlassCard>
                   ))
                )}
             </div>
          </div>
        </section>
        )}

        {activeTab === 'payments' && (
          <section className="max-w-4xl space-y-8">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                   <DollarSign className="text-secondary" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Payment Gateway Setup</h2>
                  <p className="text-slate-500 text-sm">Configure how students pay and renew their subscriptions.</p>
                </div>
             </div>

             <form onSubmit={handleUpdateSettings} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <GlassCard className="space-y-6">
                   <h3 className="font-bold flex items-center gap-2"><CreditCard size={18} /> Electronic Wallets</h3>
                   <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Wallet Name (e.g. Vodafone Cash)</label>
                        <input 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          value={paymentSettings.wallet_name}
                          onChange={(e) => setPaymentSettings({...paymentSettings, wallet_name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Wallet Number</label>
                        <input 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          value={paymentSettings.wallet_number}
                          onChange={(e) => setPaymentSettings({...paymentSettings, wallet_number: e.target.value})}
                        />
                      </div>
                   </div>
                </GlassCard>

                <GlassCard className="space-y-6">
                   <h3 className="font-bold flex items-center gap-2"><ArrowUpRight size={18} /> InstaPay & Fawry</h3>
                   <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">InstaPay Address/Link</label>
                        <input 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          value={paymentSettings.instapay_link}
                          onChange={(e) => setPaymentSettings({...paymentSettings, instapay_link: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Fawry Pay Code</label>
                        <input 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          value={paymentSettings.fawry_code}
                          onChange={(e) => setPaymentSettings({...paymentSettings, fawry_code: e.target.value})}
                        />
                      </div>
                   </div>
                </GlassCard>

                <GlassCard className="md:col-span-2 space-y-6">
                   <h3 className="font-bold flex items-center gap-2"><ShieldCheck size={18} /> Bank Card API Gateway</h3>
                   <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Public API Key / Gateway Endpoint</label>
                        <input 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          value={paymentSettings.bank_gateway_api}
                          onChange={(e) => setPaymentSettings({...paymentSettings, bank_gateway_api: e.target.value})}
                          placeholder="e.g. https://api.paymob.com/..."
                        />
                      </div>
                   </div>
                </GlassCard>

                <div className="md:col-span-2 pt-4">
                   <GlassButton 
                      type="submit" 
                      variant="primary" 
                      className="w-full py-4 bg-slate-900 border-0 text-white shadow-2xl shadow-slate-900/20"
                      disabled={savingSettings}
                    >
                      {savingSettings ? 'Saving...' : 'SAVE GATEWAY CONFIGURATION'}
                   </GlassButton>
                </div>
             </form>
          </section>
        )}

        {activeTab === 'team' && (
          <section className="space-y-6">
             <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2"><ShieldCheck className="text-primary" /> Management Team</h2>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">{teamMembers.length} Person(s)</div>
             </div>
             
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.map((member) => (
                  <GlassCard key={member.id} className="p-6 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform" />
                     <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-primary">
                           {member.name?.[0] || member.email?.[0]}
                        </div>
                        <div>
                           <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{member.name || member.fullName || 'No Name'}</h3>
                           <p className="text-[10px] text-slate-500 font-mono line-clamp-1">{member.email}</p>
                        </div>
                     </div>
                     
                     <div className="space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                           <span>Current Role</span>
                           <span className={cn(
                             "px-2 py-0.5 rounded-full",
                             member.role === 'admin' ? "bg-red-100 text-red-600" : member.role === 'supervisor' ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                           )}>{member.role}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                           <button 
                             disabled={updatingUserRole === member.id}
                             onClick={() => handleUpdateRole(member.id, member.role === 'trainer' ? 'supervisor' : 'trainer')}
                             className="text-[10px] font-bold py-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                           >
                              {member.role === 'trainer' ? 'Promote to Super' : 'Demote to Trainer'}
                           </button>
                           <button 
                             disabled={updatingUserRole === member.id}
                             onClick={() => handleUpdateRole(member.id, member.role === 'admin' ? 'supervisor' : 'admin')}
                             className="text-[10px] font-bold py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
                           >
                              {member.role === 'admin' ? 'Remove Admin' : 'Assign Admin'}
                           </button>
                           {member.role === 'supervisor' && (
                              <button 
                                onClick={() => handleTogglePermission(member.id, 'canCreateGroups', member.canCreateGroups || false)}
                                className={cn(
                                  "col-span-2 text-[10px] font-bold py-2 rounded-xl transition-all border",
                                  member.canCreateGroups ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
                                )}
                              >
                                 {member.canCreateGroups ? '✓ Can Create Groups' : '× Cannot Create Groups'}
                              </button>
                           )}
                        </div>
                     </div>
                  </GlassCard>
                ))}
             </div>
          </section>
        )}
        {activeTab === 'bot' && (
          <section className="max-w-4xl space-y-8">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                   <Terminal className="text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{t('navBotConfig')}</h2>
                  <p className="text-slate-500 text-sm">{t('botSettingsDesc')}</p>
                </div>
             </div>

             <form onSubmit={handleUpdateBotSettings} className="grid grid-cols-1 gap-8">
                <GlassCard className="space-y-6">
                   <h3 className="font-bold flex items-center gap-2"><ShieldCheck size={18} /> API Key</h3>
                   <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Custom Gemini API Key (Optional)</label>
                        <input 
                          type="password"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          value={systemSettings.chatbot_api_key || ''}
                          onChange={(e) => setSystemSettings({...systemSettings, chatbot_api_key: e.target.value})}
                          placeholder="Leave empty to use system default..."
                        />
                        <p className="text-xs text-slate-400 mt-1">If using your own key, it will override the system's embedded generation key.</p>
                      </div>
                   </div>
                </GlassCard>

                <GlassCard className="space-y-6">
                   <h3 className="font-bold flex items-center gap-2"><Box size={18} /> {t('botTraining')}</h3>
                   <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Context & Behavior</label>
                        <textarea 
                          className="w-full h-80 bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-medium leading-relaxed outline-none focus:ring-2 focus:ring-primary/20 resize-none shadow-inner"
                          value={systemSettings.chatbot_context !== undefined ? systemSettings.chatbot_context : `أنت المساعد الذكي الرسمي والأكاديمي لأكاديمية TKA Egypt.
مهمتك الأساسية هي مساعدة الطلاب وتوجيههم أكاديمياً وتقنياً بأسلوب احترافي، محفز، وموجه نحو بناء عقليتهم البرمجية.

التعليمات والقواعد الصارمة (Guardrails):
1. عدم كتابة الأكواد الجاهزة (No Spoon-feeding): يمنع منعاً باتاً كتابة الكود البرمجي الكامل لحل التاسكات أو التكليفات الخاصة بالطالب. دورك هو توضيح المنطق البرمجي (Logic) وإعطاء أمثلة توضيحية مبسطة لمفاهيم مشابهة، ثم توجيه الطالب ليكتب الكود بنفسه.
2. تشخيص الأخطاء (Debugging): إذا قدم لك الطالب كوداً يحتوي على خطأ، لا تقم بتصحيحه مباشرة، بل أشر إلى السطر الذي يحتوي على الخطأ واشرح سبب المشكلة لتشجعه على اكتشاف الحل.
3. الالتزام بالسياق المهني: جيب أن تكون اللغة احترافية وداعمة ومحفزة. لا تناقش مواضيع خارج إطار البرمجة والأكاديمية.
4. الإيجاز والوضوح: اجعل إجاباتك مقسمة في نقاط واضحة ومباشرة.`}
                          onChange={(e) => setSystemSettings({...systemSettings, chatbot_context: e.target.value})}
                          placeholder="مثال: أنت مساعد ذكي لأكاديمية TKA..."
                          dir="auto"
                        />
                         <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                            <Info size={12}/> هذه التعليمات ستبني سياق وحدود (Guardrails) المحادثة. سيتم دمج بيانات الطالب معها تلقائياً خلف الكواليس.
                         </p>
                      </div>
                   </div>
                </GlassCard>

                <div className="pt-4">
                   <GlassButton 
                      type="submit" 
                      variant="primary" 
                      className="w-full py-4 bg-primary border-0 text-white shadow-2xl shadow-primary/20"
                      disabled={savingSettings}
                    >
                       {savingSettings ? t('common.saving') : t('saveBotSettings')}
                   </GlassButton>
                </div>
             </form>
          </section>
        )}

        {activeTab === 'assessments' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BarChart3 className="text-primary" /> نظام الجودة والتقييم الشامل
              </h2>
              <GlassButton variant="primary" onClick={() => window.location.href = '/dashboard/assessments'}>
                فتح لوحة الإدارة الكاملة
              </GlassButton>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                 { title: 'تقييم المدربين', count: '12', path: '/assessments/trainer', icon: <Users /> },
                 { title: 'جودة البرامج', count: '8', path: '/assessments/program', icon: <BookOpen /> },
                 { title: 'آراء المتدربين', count: '145', path: '/assessments/student', icon: <Smile /> },
                 { title: 'تتبع الأداء', count: '156', path: '/assessments/performance', icon: <TrendingUp /> }
               ].map((item, i) => (
                 <GlassCard key={i} className="p-6 group hover:shadow-xl transition-all cursor-pointer" onClick={() => window.location.href = item.path}>
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all mb-4">
                       {item.icon}
                    </div>
                    <h3 className="font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">فتح النموذج يدوياً</p>
                 </GlassCard>
               ))}
            </div>
          </section>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-slate-900">
               <GlassCard className="border-l-4 border-l-primary shadow-sm bg-primary/5">
                  <div className="flex justify-between items-start mb-2">
                     <p className="text-xs font-bold text-slate-500 uppercase">Total Revenue (SQL)</p>
                     <TrendingUp size={16} className="text-green-600" />
                  </div>
                  <p className="text-2xl font-black text-primary">{formatCurrency(summary.totalIncome)}</p>
                  <p className="text-[10px] text-slate-600 font-medium mt-1">Global collection archive</p>
               </GlassCard>
               
               <GlassCard className="border-l-4 border-l-secondary shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                     <p className="text-xs font-bold text-slate-500 uppercase">Pending Dues</p>
                     <ShieldCheck size={16} className="text-red-600" />
                  </div>
                  <p className="text-2xl font-black text-red-600">{formatCurrency(summary.pendingDues)}</p>
                  <p className="text-[10px] text-red-600/70 font-bold mt-1 uppercase tracking-tighter">Requires Supervisor Follow-up</p>
               </GlassCard>
               
               <GlassCard className="border-l-4 border-l-green-500 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                     <p className="text-xs font-bold text-slate-500 uppercase">Active Trainers</p>
                     <ShieldCheck size={16} className="text-green-600" />
                  </div>
                  <p className="text-2xl font-bold">18</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">All systems online</p>
               </GlassCard>
               
               <GlassCard className="border-l-4 border-l-purple-500 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                     <p className="text-xs font-bold text-slate-500 uppercase">Server Status</p>
                     <Activity size={16} className="text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold">99.9%</p>
                  <p className="text-[10px] text-purple-600 font-medium mt-1">Latency: 45ms</p>
               </GlassCard>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 text-slate-900">
               <GlassCard className="xl:col-span-2 min-h-[400px] shadow-sm">
                  <h3 className="text-lg font-bold mb-8">Revenue Growth Analytics</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#3A82F7" stopOpacity={0.1}/>
                               <stop offset="95%" stopColor="#3A82F7" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#00000008" vertical={false} />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `£${v/1000}k`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px' }}
                            itemStyle={{ color: '#3A82F7' }}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="#3A82F7" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                       </AreaChart>
                    </ResponsiveContainer>
                  </div>
               </GlassCard>

               <div className="space-y-6">
                  <GlassCard shadow-sm>
                     <h3 className="font-bold mb-6 flex items-center gap-2 text-slate-900"><DollarSign size={18} /> Payment Gates</h3>
                     <div className="space-y-4">
                        {['Vodafone Cash', 'InstaPay', 'MyFatoorah'].map((gate, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                             <span className="text-sm font-medium text-slate-800">{gate}</span>
                             <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-600 font-bold">Active</span>
                          </div>
                        ))}
                     </div>
                     <GlassButton variant="secondary" className="w-full mt-6" icon={Settings} onClick={() => setActiveTab('payments')}>Configure APIs</GlassButton>
                  </GlassCard>

                  <GlassCard className="bg-gradient-to-br from-secondary/5 to-transparent shadow-sm">
                      <h3 className="font-bold mb-4 text-slate-900">Subscription Distribution</h3>
                      <div className="space-y-4">
                         <div>
                            <div className="flex justify-between text-xs font-bold mb-1 text-slate-700">
                               <span>Premium Path</span>
                               <span>65%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full"><div className="bg-primary w-[65%] h-full rounded-full"></div></div>
                         </div>
                         <div>
                            <div className="flex justify-between text-xs font-bold mb-1 text-slate-700">
                               <span>Trial Students</span>
                               <span>20%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full"><div className="bg-secondary w-[20%] h-full rounded-full"></div></div>
                         </div>
                      </div>
                  </GlassCard>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <section className="space-y-6">
            <GlassCard className="p-4 flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input 
                   placeholder="Search by name, email, or ID..." 
                   className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
            </GlassCard>

            <div className="w-full overflow-x-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
               <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                     <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                        <th className="px-6 py-5">Full Name & Details</th>
                        <th className="px-6 py-5">Enrollment Status</th>
                        <th className="px-6 py-5 text-right">Action Center</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                     {students.filter(s => 
                       s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       s.email?.toLowerCase().includes(searchTerm.toLowerCase())
                     ).map((s) => (
                           <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                              <td className="px-6 py-5">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold">
                                       {s.fullName?.[0] || s.name?.[0]}
                                    </div>
                                    <div>
                                       <p className="font-bold text-slate-900 dark:text-slate-100">{s.fullName || s.name}</p>
                                       <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{s.email}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-5">
                                 <span className={cn(
                                   "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                   s.role === 'student' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                 )}>
                                    {s.role}
                                 </span>
                                 <p className="text-[9px] text-slate-400 mt-1">Expiry: {s.subscriptionExpiry ? new Date(s.subscriptionExpiry).toLocaleDateString() : 'N/A'}</p>
                              </td>
                              <td className="px-6 py-5">
                                 <div className="flex items-center justify-end gap-2">
                                    <button 
                                      onClick={() => setShowPaymentModal(s)}
                                      className="py-2.5 px-4 bg-green-50 text-green-600 text-xs font-bold rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                                    >
                                       Manual Payment <DollarSign size={14} />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </section>
        )}

        {activeTab === 'apps' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-bold text-slate-900 border-r-4 border-primary pr-4 dark:text-white">إدارة تطبيقات المنهج</h2>
               <button 
                 onClick={() => setShowAppModal(true)}
                 className="py-3 px-6 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
               >
                 إضافة تطبيق جديد <PlusIcon size={18} />
               </button>
            </div>
            <ToolLibrary isAdmin={true} />
          </section>
        )}

        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPaymentModal(null)} />
             <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
                <div className="bg-green-600 p-8 text-white flex justify-between items-center">
                   <div>
                      <h3 className="text-xl font-bold">Record Manual Payment</h3>
                      <p className="text-xs text-white/70 mt-1">Student: {showPaymentModal.fullName || showPaymentModal.name}</p>
                   </div>
                   <button onClick={() => setShowPaymentModal(null)} className="p-2 hover:rotate-90 transition-transform"><X size={28} /></button>
                </div>
                <form onSubmit={handlePayment} className="p-10 space-y-6">
                   <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Payment Amount (EGP)</label>
                      <input required type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-green-500/10 text-xl font-bold text-slate-900" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Period</label>
                         <input required placeholder="Month 1" value={period} onChange={(e) => setPeriod(e.target.value)} className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-xs font-bold text-slate-900" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Method</label>
                         <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-xs font-bold text-slate-900">
                            <option>Vodafone Cash</option>
                            <option>InstaPay</option>
                            <option>Cash</option>
                            <option>Bank</option>
                         </select>
                      </div>
                   </div>
                   <GlassButton type="submit" variant="primary" className="w-full py-5 bg-green-600 text-white border-none shadow-xl shadow-green-600/20 font-bold tracking-widest">
                      ACTIVATE STUDENT <CheckCircle2 className="ml-2 w-5 h-5" />
                   </GlassButton>
                </form>
             </div>
          </div>
        )}

        {showAppModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAppModal(false)} />
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden dark:bg-slate-900" dir="rtl">
               <div className="bg-primary p-6 text-white flex justify-between items-center">
                  <h3 className="text-xl font-bold flex items-center gap-2">إضافة تطبيق جديد <Box /></h3>
                  <button onClick={() => setShowAppModal(false)} className="p-2 hover:rotate-90 transition-transform"><X size={28} /></button>
               </div>
               
               <form onSubmit={handleCreateApp} className="p-8 space-y-4 max-h-[80vh] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400">اسم التطبيق</label>
                      <input 
                        required 
                        value={appForm.name} 
                        onChange={e => setAppForm({...appForm, name: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400">رابط أيقونة التطبيق (اختياري)</label>
                      <input 
                        value={appForm.image} 
                        onChange={e => setAppForm({...appForm, image: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-left dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">وصف التطبيق</label>
                    <textarea 
                      required 
                      value={appForm.description} 
                      onChange={e => setAppForm({...appForm, description: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 min-h-[100px] dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400">نوع الاستهداف</label>
                      <select 
                        value={appForm.targetType} 
                        onChange={e => setAppForm({...appForm, targetType: e.target.value as any, targetId: ''})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 dark:text-white"
                      >
                        <option value="all">للجميع</option>
                        <option value="level">مستوى محدد</option>
                        <option value="group">مجموعة محددة</option>
                        <option value="student">طالب محدد</option>
                      </select>
                    </div>
                    
                    {appForm.targetType !== 'all' && (
                      <div className="space-y-1 animate-in slide-in-from-right duration-300">
                        <label className="text-xs font-bold text-slate-400">
                          {appForm.targetType === 'level' ? 'اسم المستوى' : appForm.targetType === 'group' ? 'معرف المجموعة (ID)' : 'معرف الطالب (UID)'}
                        </label>
                        <input 
                          required 
                          value={appForm.targetId} 
                          onChange={e => setAppForm({...appForm, targetId: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-left dark:text-white"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-400">روابط التحميل وأنظمة التشغيل</label>
                      <button 
                        type="button" 
                        onClick={() => setAppForm({...appForm, platforms: [...appForm.platforms, { os: 'Windows', url: '' }]})}
                        className="text-primary text-[10px] font-bold uppercase flex items-center gap-1"
                      >
                        إضافة رابط <PlusIcon size={12} />
                      </button>
                    </div>
                    
                    {appForm.platforms.map((plat, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <select 
                          value={plat.os} 
                          onChange={e => {
                            const newPlatforms = [...appForm.platforms];
                            newPlatforms[idx].os = e.target.value;
                            setAppForm({...appForm, platforms: newPlatforms});
                          }}
                          className="w-1/3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-xs dark:text-white"
                        >
                          <option>Windows</option>
                          <option>Mac</option>
                          <option>Linux</option>
                          <option>Android</option>
                          <option>iOS</option>
                          <option>Web</option>
                        </select>
                        <input 
                          required 
                          placeholder="Link URL" 
                          value={plat.url}
                          onChange={e => {
                            const newPlatforms = [...appForm.platforms];
                            newPlatforms[idx].url = e.target.value;
                            setAppForm({...appForm, platforms: newPlatforms});
                          }}
                          className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-left dark:text-white" 
                        />
                        {appForm.platforms.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => {
                              const newPlatforms = appForm.platforms.filter((_, i) => i !== idx);
                              setAppForm({...appForm, platforms: newPlatforms});
                            }}
                            className="text-red-500 p-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <GlassButton type="submit" variant="primary" className="w-full py-4 mt-4">حفظ وإضافة التطبيق</GlassButton>
               </form>
            </div>
          </div>
        )}
        {activeTab === 'courses' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="text-primary" /> ادارة المناهج والمواد المتاحة ({adminCourses.length})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminCourses.map(course => (
                 <GlassCard key={course.id} className="p-6 relative group overflow-hidden border-t-4 border-t-primary shadow-xl">
                    <div className="flex justify-between items-start mb-4">
                       <h3 className="font-bold text-lg text-slate-900 pr-8">{course.title}</h3>
                       <div className={cn("text-[10px] font-black px-2 py-0.5 rounded-lg uppercase", course.status === 'active' ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400")}>
                          {course.status}
                       </div>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-6">{course.brief || 'لا يوجد وصف مختصر...'}</p>
                    
                    <div className="flex gap-2">
                       <GlassButton 
                         variant="primary" 
                         className="flex-1 py-2 text-xs font-black uppercase tracking-widest"
                         onClick={() => window.location.href = `/dashboard/admin/course-builder?id=${course.id}`}
                       >
                         تعديل المنهج
                       </GlassButton>
                       <GlassButton 
                         variant="secondary" 
                         className="p-2"
                         onClick={() => confirm("تحذير: سيتم تعطيل المادة ولن تظهر للطلاب. هل أنت متأكد؟") && alert("قيد التنفيذ...")}
                       >
                         <Trash2 size={16} />
                       </GlassButton>
                    </div>
                 </GlassCard>
              ))}
              {adminCourses.length === 0 && (
                 <div className="md:col-span-3 py-20 text-center bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                    <LayoutTemplate size={48} className="mx-auto text-slate-300 mb-4 opacity-30" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No courses built yet</p>
                    <GlassButton variant="primary" className="mt-4" onClick={() => window.location.href = '/dashboard/admin/course-builder'}>Build First Course</GlassButton>
                 </div>
              )}
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
