import * as React from 'react';
import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import { GlassCard, GlassButton } from '@/src/components/common/Layout';
import { useAuth } from '@/src/context/AuthContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Calendar, 
  ShieldCheck, 
  Camera,
  Save,
  CreditCard,
  MapPin,
  GraduationCap
} from 'lucide-react';
import { motion } from 'motion/react';
import { updateUserProfile } from '@/src/services/firestoreService';
import { updateProfileToSQL } from '@/src/services/hybridApiService';

export default function Profile() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = React.useState<any>({});
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // 1. Try to save to the new SQL hybrid system
      updateProfileToSQL({
         ...formData,
         displayName: formData.name || user.displayName || 'User',
         email: user.email,
      }).then(() => {
        console.log("Saved to SQL Database gracefully.");
      }).catch((sqlErr) => {
        alert("⚠️ خطأ في الاتصال بالاستضافة (Hostinger):\n" + sqlErr.message);
        console.error("Warning: SQL Save failed", sqlErr);
      });

      // 2. Fallback / Sync with Firestore
      await updateUserProfile(user.uid, formData);
      alert(t('saveChanges') + ' ✅');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  return (
    <DashboardLayout role={profile?.role || 'student'} userName={profile?.name || user?.displayName || "User"}>
      <div className="max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">{t('profileTitle')}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">{t('profileDesc')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Avatar Card */}
          <GlassCard className="flex flex-col items-center text-center shadow-sm">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full border-4 border-primary/20 p-1">
                <div className="w-full h-full rounded-full bg-slate-100 overflow-hidden border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                   <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.displayName || user?.displayName || 'user'}`} 
                    alt="avatar" 
                    className="w-full h-full object-cover"
                   />
                </div>
              </div>
              <button className="absolute bottom-1 right-1 p-2 bg-primary rounded-full text-white shadow-lg hover:bg-primary/90 transition-all">
                <Camera size={16} />
              </button>
            </div>
            
            <h2 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">{profile?.name || user?.displayName || "TKA Member"}</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{profile?.email || user?.email}</p>
            
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 w-full space-y-4">
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{t('accountRole')}</span>
                  <span className="text-primary font-bold uppercase tracking-widest text-[10px]">{t(profile?.role || 'trialLabel' as any)}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{t('joinDate')}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</span>
               </div>
            </div>
          </GlassCard>

          {/* Details Card */}
          <GlassCard className="md:col-span-2 shadow-sm" noPadding>
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
               <h3 className="font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                 <ShieldCheck size={18} className="text-primary" /> {t('profileDetails')}
               </h3>
               <GlassButton 
                 onClick={handleSave} 
                 className="py-1 px-3 text-xs" 
                 icon={Save}
                 disabled={saving}
               >
                 {saving ? t('saving') : t('saveChanges')}
               </GlassButton>
            </div>
            <div className="p-8 space-y-8 min-h-[500px] overflow-y-auto custom-scrollbar">
               {/* Disabling Profile Restrictions notice */}
               <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs font-bold font-sans dark:bg-amber-900/20 dark:border-amber-900/30 dark:text-amber-200">
                  {t('profileNotice')}
               </div>

               <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">{t('fullName')}</label>
                     <div className="relative opacity-60">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input name="name" readOnly className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none text-slate-900 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={formData.name || ""} />
                     </div>
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">{t('emailAddress')}</label>
                     <div className="relative opacity-60">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input name="email" readOnly className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none text-slate-900 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={user?.email || ""} />
                     </div>
                  </div>
               </div>

               <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">{t('whatsappNumber')}</label>
                     <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input name="whatsappNumber" onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-primary outline-none text-slate-900 dark:bg-slate-800/50 dark:border-slate-700 dark:text-white" value={formData.whatsappNumber || ""} />
                     </div>
                  </div>
               </div>

               <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">{t('dob')}</label>
                     <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input type="date" name="dob" onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-primary outline-none text-slate-900 dark:bg-slate-800/50 dark:border-slate-700 dark:text-white" value={formData.dob || ""} />
                     </div>
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">{t('homeCity')}</label>
                     <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input name="address" onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-primary outline-none text-slate-900 dark:bg-slate-800/50 dark:border-slate-700 dark:text-white" value={formData.address || ""} />
                     </div>
                  </div>
               </div>

               {profile?.role === 'student' && (
                 <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Institutional Data</h4>
                    <div className="grid sm:grid-cols-2 gap-6">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">{t('nationalId')}</label>
                          <div className="relative">
                             <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                             <input name="nationalId" onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-primary outline-none text-slate-900 dark:bg-slate-800/50 dark:border-slate-700 dark:text-white" value={formData.nationalId || ""} placeholder="For official certification" />
                          </div>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">{t('currentLevel')}</label>
                          <div className="relative opacity-60">
                             <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                             <input className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={profile.assignedLevel || 'Not Set'} readOnly />
                          </div>
                       </div>
                    </div>
                 </div>
               )}

               <div className="space-y-1.5 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">{t('bio')}</label>
                  <textarea name="bio" onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none h-24 text-slate-900 dark:bg-slate-800/50 dark:border-slate-700 dark:text-white" placeholder={t('bioPlaceholder')} value={formData.bio || ""} />
               </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
