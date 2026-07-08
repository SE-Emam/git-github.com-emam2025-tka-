import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import { GlassCard, GlassButton } from '@/src/components/common/Layout';
import { Skeleton } from '@/src/components/common/Skeleton';
import { VirtualizedList } from '@/src/components/common/VirtualizedList';
import { useLanguage } from '@/src/context/LanguageContext';
import { 
  CheckCircle2, 
  XCircle, 
  Search, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Loader2,
  Save
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/context/AuthContext';
import { 
  getTrainerGroupsFromSQL, 
  getAllGroupsFromSQL, 
  getStudentsInGroupFromSQL,
  getAttendanceFromSQL,
  recordAttendanceInSQL,
  apiFetch
} from '@/src/services/hybridApiService';

export default function Attendance() {
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const [groups, setGroups] = React.useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = React.useState('');
  const [students, setStudents] = React.useState<any[]>([]);
  const [attendance, setAttendance] = React.useState<Record<string, boolean>>({});
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(false);
  const [history, setHistory] = React.useState<any[]>([]);

  // Fetch groups
  React.useEffect(() => {
    const fetchGroups = async () => {
      if (user && profile) {
        setLoading(true);
        let fetchedGroups: any[] = [];
        if (profile.role === 'trainer') {
           fetchedGroups = await getTrainerGroupsFromSQL(user.uid);
        } else {
           fetchedGroups = await getAllGroupsFromSQL();
        }
        
        if (fetchedGroups && fetchedGroups.length > 0) {
          setGroups(fetchedGroups);
          if (!selectedGroupId) {
            setSelectedGroupId(fetchedGroups[0].id);
          }
        }
        setLoading(false);
      }
    };
    fetchGroups();
  }, [user, profile]);

  const loadHistory = async () => {
     if (!selectedGroupId) return;
     const data = await apiFetch(`/attendance.php?action=group_history&group_id=${selectedGroupId}`);
     if (data.status === 'success') setHistory(data.data);
     setShowHistory(true);
  };

  // Fetch students and attendance on date or group change
  React.useEffect(() => {
    const loadGroupData = async () => {
      if (selectedGroupId) {
        setLoading(true);
        // Load students
        const profiles = await getStudentsInGroupFromSQL(selectedGroupId);
        setStudents(profiles);
        
        // Load existing attendance for the selected date
        if (profiles.length > 0) {
           const existingAttendance = await getAttendanceFromSQL(selectedGroupId, date);
           
           const initialAttendance: Record<string, boolean> = {};
           profiles.forEach((p: any) => {
             const sId = p.id || p.uid;
             // If record exists, use it, else default to true (present)
             initialAttendance[sId] = existingAttendance[sId] !== undefined ? existingAttendance[sId] : true;
           });
           setAttendance(initialAttendance);
        } else {
           setAttendance({});
        }
        setLoading(false);
      }
    };
    loadGroupData();
  }, [selectedGroupId, date]);

  const toggleAttendance = (studentId: string, status: boolean) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedGroupId || !user) return;
    setSaving(true);
    try {
      const presentIds = Object.keys(attendance).filter(uid => attendance[uid]);
      const allStudentIds = students.map(s => s.id || s.uid);
      
      await recordAttendanceInSQL({
        groupId: selectedGroupId,
        date: date,
        presentIds: presentIds,
        allStudentIds: allStudentIds,
        trainerId: user.uid
      });
      alert(t('attendanceSuccess'));
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout role={profile?.role || 'trainer'} userName={profile?.displayName || user?.displayName || "Trainer"}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">{t('attendanceTitle')}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{t('attendanceDesc')}</p>
          </div>
          <div className="flex items-center gap-3">
             <GlassButton icon={CalendarIcon} variant="secondary" onClick={loadHistory}>{t('viewHistory')}</GlassButton>
             <GlassButton 
              icon={saving ? Loader2 : Save} 
              variant="primary" 
              className={cn("bg-primary text-white border-none", saving && "animate-spin")}
              onClick={handleSaveAttendance}
              disabled={saving || students.length === 0}
            >
              {saving ? t('saving') : t('submitRecord')}
             </GlassButton>
          </div>
        </div>

        {/* Filters */}
        <GlassCard className="flex flex-wrap items-center gap-6 py-4">
           <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 dark:text-slate-400">{t('selectGroup')}</label>
              <select 
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary/50 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white min-w-[200px]"
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
              >
                {groups.length === 0 ? (
                  <option disabled>{t('noGroupsFound')}</option>
                ) : (
                  groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))
                )}
              </select>
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 dark:text-slate-400">{t('sessionDate')}</label>
              <input 
                type="date"
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary/50 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
           </div>
           <div className="flex-1 min-w-[200px] space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 dark:text-slate-400">{t('searchStudent')}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  placeholder={t('searchStudent')} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-primary/50 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
           </div>
        </GlassCard>

        {/* Attendance List */}
        <GlassCard noPadding className="overflow-hidden shadow-sm">
           <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            )}
            <div className="overflow-x-auto">
             <div className="flex flex-col w-full relative z-0">
                        {loading ? (
                          <div className="p-4 space-y-2">
                            <Skeleton count={5} className="h-12 w-full" />
                          </div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="p-6 text-center text-slate-500 italic">
                                {t('noStudents')}
                            </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-4 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                                <div>{t('studentName')}</div>
                                <div>{t('emailAddress')}</div>
                                <div>{t('status')}</div>
                                <div className="text-right">{t('actions')}</div>
                            </div>
                            <VirtualizedList
                                data={filteredStudents}
                                height={500}
                                itemHeight={70}
                                className="w-full"
                                renderItem={(student: any) => {
                                    const uid = student.uid || student.id;
                                    const isPresent = attendance[uid] !== false;
                                    const displayName = student.displayName || student.fullName || student.name || "Unknown Student";
                                    
                                    return (
                                    <div className="grid grid-cols-4 items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 font-mono overflow-hidden">
                                            {displayName.split(' ').map((n: string) => n[0]).join('').substring(0,2)}
                                            </div>
                                            <span className="font-medium text-sm text-slate-900 dark:text-white truncate">{displayName}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-500 font-mono truncate">{student.email}</span>
                                        </div>
                                        <div>
                                            <span className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block",
                                            isPresent ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                                            )}>
                                            {isPresent ? t('present') : t('absent')}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => toggleAttendance(uid, true)}
                                                className={cn(
                                                "p-2 rounded-lg transition-all",
                                                isPresent ? "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400" : "hover:bg-green-50 dark:hover:bg-green-900/20 text-slate-400 hover:text-green-600"
                                                )}
                                            >
                                                <CheckCircle2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => toggleAttendance(uid, false)}
                                                className={cn(
                                                "p-2 rounded-lg transition-all",
                                                !isPresent ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400" : "hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600"
                                                )}
                                            >
                                                <XCircle size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    );
                                }}
                            />
                        </>
                        )}
             </div>
            </div>
           </div>
           <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-500 text-xs">
              <span>{filteredStudents.length} Students</span>
              <div className="flex items-center gap-1">
                 <button className="p-1 hover:text-primary"><ChevronLeft size={16} /></button>
                 <span className="px-2 text-slate-900 dark:text-white font-bold">1</span>
                 <button className="p-1 hover:text-primary"><ChevronRight size={16} /></button>
              </div>
           </div>
        </GlassCard>

        {/* History Modal */}
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
             <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[90vh] relative z-10 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-slate-900 dark:text-white">
                   <h2 className="text-xl font-bold">{t('attendanceHistory' as any)}</h2>
                   <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><XCircle size={24} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-slate-900 dark:text-white">
                   <div className="space-y-4">
                      {history.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 italic">No historical records found for this group.</div>
                      ) : (
                        history.map((record, i) => (
                           <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between">
                              <div>
                                 <p className="font-bold">{new Date(record.date).toLocaleDateString()}</p>
                                 <p className="text-xs text-slate-500">{record.present_count} {t('present' as any)} • {record.absent_count} {t('absent' as any)}</p>
                              </div>
                              <GlassButton variant="secondary" className="!py-2 text-[10px]" onClick={() => {
                                setDate(record.date);
                                setShowHistory(false);
                              }}>
                                 {language === 'ar' ? 'تحميل السجل' : 'Load Record'}
                              </GlassButton>
                           </div>
                        ))
                      )}
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
