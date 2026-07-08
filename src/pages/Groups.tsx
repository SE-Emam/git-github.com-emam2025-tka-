import * as React from 'react';
import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import { GlassCard, GlassButton } from '@/src/components/common/Layout';
import { 
  Plus, 
  Users as UsersIcon, 
  Video, 
  Settings, 
  MoreVertical,
  ArrowUpRight,
  MonitorPlay,
  X,
  Check,
  Loader2,
  UserPlus,
  UserX,
  Shield,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { JitsiMeeting } from '@/src/components/dashboard/JitsiMeeting';
import { useAuth } from '@/src/context/AuthContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { 
  getUsersByRole, 
  updateGroup, 
  toggleGroupActive,
  addStudentToGroup,
  removeStudentFromGroup
} from '@/src/services/firestoreService';
import {
  getAllGroupsFromSQL,
  getTrainerGroupsFromSQL,
  createGroupInSQL
} from '@/src/services/hybridApiService';

export default function Groups() {
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const [groups, setGroups] = React.useState<any[]>([]);
  const [activeSession, setActiveSession] = React.useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  
  // Management modal
  const [manageGroup, setManageGroup] = React.useState<any | null>(null);

  // Create Modal State
  const [newGroupName, setNewGroupName] = React.useState('');
  const [jitsiRoomName, setJitsiRoomName] = React.useState('');
  const [selectedTrainerIds, setSelectedTrainerIds] = React.useState<string[]>([]);
  const [allTrainers, setAllTrainers] = React.useState<any[]>([]);
  const [isCreating, setIsCreating] = React.useState(false);

  const loadGroups = React.useCallback(async () => {
    if (!user || !profile) return;
    setLoading(true);
    let fetchedGroups = [];
    if (profile.role === 'trainer') {
      fetchedGroups = await getTrainerGroupsFromSQL(user.uid);
    } else {
      fetchedGroups = await getAllGroupsFromSQL();
    }
    setGroups(fetchedGroups);
    setLoading(false);
  }, [user, profile]);

  React.useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  React.useEffect(() => {
    if (showCreateModal || manageGroup) {
       getUsersByRole('trainer').then(setAllTrainers);
    }
  }, [showCreateModal, manageGroup]);

  const handleToggleTrainer = async (groupId: string, trainerId: string, currentTrainerIds: string[]) => {
    const newTrainers = currentTrainerIds.includes(trainerId)
      ? currentTrainerIds.filter(id => id !== trainerId)
      : [...currentTrainerIds, trainerId];
    
    try {
      await updateGroup(groupId, { trainerIds: newTrainers });
      await loadGroups(); // Refresh after update
    } catch (error) {
      console.error(error);
    }
  };

  const handleStartLecture = (group: any) => {
    // Unique room per trainer per group to allow simultaneous sessions
    const trainerId = user?.uid;
    const room = `${group.jitsiRoom || group.name.replace(/\s+/g, '-')}-${trainerId}`;
    setActiveSession(room);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName) return;
    setIsCreating(true);
    try {
      await createGroupInSQL({
        name: newGroupName,
        trainerIds: selectedTrainerIds,
        jitsiRoom: jitsiRoomName || newGroupName.replace(/\s+/g, '-')
      });
      setShowCreateModal(false);
      setNewGroupName('');
      setJitsiRoomName('');
      setSelectedTrainerIds([]);
      await loadGroups(); // Refetch from SQL after creating
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <DashboardLayout role={profile?.role || 'trainer'} userName={profile?.displayName || user?.displayName || "Trainer"}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900">{t('groupsTitle')}</h1>
            <p className="text-slate-600 mt-1">{t('groupsDesc')}</p>
          </div>
          {(profile?.role === 'admin' || profile?.role === 'supervisor') && (
            <GlassButton 
              icon={Plus} 
              variant="primary" 
              className="bg-primary text-white border-none"
              onClick={() => setShowCreateModal(true)}
            >
              {t('createNewGroup')}
            </GlassButton>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-300 rounded-3xl">
            <UsersIcon size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-900">{t('noGroups')}</h3>
            <p className="text-slate-500">{language === 'ar' ? 'أنشئ مجموعتك الأولى لبدء إدارة الطلاب.' : 'Create your first group to start managing students.'}</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 text-slate-900">
            {groups.map((group) => (
              <GlassCard key={group.id} hover className="flex flex-col shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <button 
                       onClick={() => toggleGroupActive(group.id, !group.isActive)}
                       className={ cn(
                         "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors",
                         group.isActive ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                       )}
                    >
                      {group.isActive ? 'Active' : 'Archived'}
                    </button>
                    {(profile?.role === 'admin' || profile?.role === 'supervisor') && (
                      <button 
                         onClick={() => setManageGroup(group)}
                         className="text-slate-400 hover:text-primary transition-colors p-2 bg-slate-50 rounded-lg"
                      >
                        <Shield size={18} />
                      </button>
                    )}
                </div>

                <h3 className="text-xl font-bold mb-1 text-slate-900">{group.name}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6">{language === 'ar' ? 'مسار TKA' : 'TKA Track'}</p>

                <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 flex items-center gap-2"><UsersIcon size={14} /> {t('supervisor.allStudents' as any)}</span>
                      <span className="font-bold text-slate-800">{group.studentIds?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">{t('videoPortal')}</span>
                      <span className="text-primary font-medium">{group.jitsiRoom || t('notSet')}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-8">
                    <GlassButton 
                      className="py-3 text-xs bg-slate-100 text-slate-700 hover:bg-primary hover:text-white border-none shadow-sm" 
                      icon={MonitorPlay}
                      onClick={() => handleStartLecture(group)}
                    >
                      {t('common.personalSession')}
                    </GlassButton>
                    <GlassButton 
                      className="py-3 text-xs bg-slate-900 text-white border-none shadow-lg" 
                      icon={ArrowUpRight}
                      onClick={() => window.location.href = `/dashboard/attendance?groupId=${group.id}`}
                    >
                      {t('navAttendance')}
                    </GlassButton>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
            >
              <div className="bg-primary p-6 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold">{t('common.newGroup')}</h3>
                <button onClick={() => setShowCreateModal(false)} className="hover:rotate-90 transition-transform">
                  <X />
                </button>
              </div>
              
              <form onSubmit={handleCreateGroup} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">{t('common.groupName')}</label>
                  <input 
                    required
                    placeholder="e.g. Full Stack Bootcamp #12"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 text-slate-900"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">{t('common.jitsiOptional')}</label>
                  <input 
                    placeholder="e.g. tka-bootcamp-room"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 text-slate-900"
                    value={jitsiRoomName}
                    onChange={(e) => setJitsiRoomName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-widest text-slate-500">{t('common.trainersOptional')}</label>
                   <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                      {allTrainers.filter(t => t.id !== user?.uid).map(t => (
                        <div key={t.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                           <input 
                             type="checkbox" 
                             checked={selectedTrainerIds.includes(t.id)}
                             onChange={(e) => {
                               if (e.target.checked) setSelectedTrainerIds([...selectedTrainerIds, t.id]);
                               else setSelectedTrainerIds(selectedTrainerIds.filter(id => id !== t.id));
                             }}
                             className="w-4 h-4 accent-primary"
                           />
                           <span className="text-[10px] font-bold text-slate-700 truncate">{t.fullName || t.name}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="space-y-4 pt-4">
                  <GlassButton 
                    type="submit" 
                    variant="primary" 
                    className="w-full py-4 bg-primary text-white border-none shadow-lg shadow-primary/20"
                    disabled={isCreating}
                  >
                    {isCreating ? <Loader2 className="animate-spin mr-2" size={18} /> : <Check className="mr-2" size={18} />}
                    {isCreating ? (language === 'ar' ? 'جاري الإنشاء...' : 'Creating...') : (language === 'ar' ? 'تأكيد الإنشاء' : 'Confirm Creation')}
                  </GlassButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Live Session UI */}
        {activeSession && (
          <JitsiMeeting 
            roomName={activeSession} 
            userName={profile?.displayName || user?.displayName || "Trainer"} 
            onClose={() => setActiveSession(null)}
          />
        )}

        {/* Management Modal */}
        <AnimatePresence>
          {manageGroup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setManageGroup(null)} />
              <motion.div 
                 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
                 className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden"
              >
                 <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center text-slate-900">
                    <div>
                       <h2 className="text-xl font-bold">Group Management 🛡️</h2>
                       <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">{manageGroup.name}</p>
                    </div>
                    <button onClick={() => setManageGroup(null)} className="p-2"><X /></button>
                 </div>
                 
                 <div className="p-8 space-y-6">
                    <div>
                       <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Current Instructors</h3>
                       <div className="space-y-3">
                          {allTrainers.map(t => {
                            const isAssigned = manageGroup.trainerIds?.includes(t.uid);
                            return (
                              <div key={t.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.displayName || t.name}`} />
                                    </div>
                                    <div>
                                       <p className="text-sm font-bold text-slate-900">{t.displayName || t.name}</p>
                                       <p className="text-[10px] text-slate-400">{t.email}</p>
                                    </div>
                                 </div>
                                 <button 
                                   onClick={() => handleToggleTrainer(manageGroup.id, t.uid, manageGroup.trainerIds || [])}
                                   className={cn(
                                     "p-2 rounded-xl transition-all",
                                     isAssigned ? "bg-red-50 text-red-500 hover:bg-red-500 hover:text-white" : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
                                   )}
                                 >
                                    {isAssigned ? <UserX size={18} /> : <UserPlus size={18} />}
                                 </button>
                              </div>
                            )
                          })}
                       </div>
                    </div>
                    <div>
                       <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Students</h3>
                       <p className="text-sm text-slate-600">Total enrolled: {manageGroup.studentIds?.length || 0}</p>
                    </div>
                 </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
