import * as React from 'react';
import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import { GlassCard, GlassButton } from '@/src/components/common/Layout';
import { useAuth } from '@/src/context/AuthContext';
import { useCMSData, updateCMSDocument } from '@/src/services/cmsService';
import { Save, LayoutTemplate, Activity } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function CMSDashboard() {
  const { profile } = useAuth();
  
  // Section states
  const [activeTab, setActiveTab] = React.useState<'home' | 'about'>('home');

  // CMS Hooks with Fallbacks
  const { data: homeData, loading: homeLoading } = useCMSData('home', {
    stats: [
      { label: "Graduates", val: "2,500+" },
      { label: "Success Rate", val: "94%" },
      { label: "Partner Companies", val: "120+" },
      { label: "Active Groups", val: "45" },
    ]
  });

  const { data: aboutData, loading: aboutLoading } = useCMSData('about', {
    ceoMessage: "We don't just teach your children programming... we grant them the language of leadership in the world of the future.",
    ceoName: "Ahmed Ali",
    ceoRole: "Executive Director",
    ceoBio: "Over 15 years of experience in educational management and technology leads our vision.",
    ceoPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80"
  });

  // Local state for editing
  const [stats, setStats] = React.useState(homeData.stats);
  const [aboutForm, setAboutForm] = React.useState({
    ceoMessage: aboutData.ceoMessage,
    ceoName: aboutData.ceoName,
    ceoRole: aboutData.ceoRole,
    ceoBio: aboutData.ceoBio,
    ceoPhoto: aboutData.ceoPhoto
  });
  const [saving, setSaving] = React.useState(false);

  // Sync state when CMS loads
  React.useEffect(() => {
    if (!homeLoading) setStats(homeData.stats);
    if (!aboutLoading) setAboutForm({
      ceoMessage: aboutData.ceoMessage,
      ceoName: aboutData.ceoName,
      ceoRole: aboutData.ceoRole,
      ceoBio: aboutData.ceoBio,
      ceoPhoto: aboutData.ceoPhoto
    });
  }, [homeData, aboutData, homeLoading, aboutLoading]);

  const handleSaveHome = async () => {
    setSaving(true);
    try {
      await updateCMSDocument('home', { stats });
      alert("Home stats updated on the live website.");
    } catch (e) {
      alert("Failed to save.");
    }
    setSaving(false);
  };

  const handleSaveAbout = async () => {
    setSaving(true);
    try {
      await updateCMSDocument('about', aboutForm);
      alert("About page content updated on the live website.");
    } catch (e) {
      alert("Failed to save.");
    }
    setSaving(false);
  };

  const updateStat = (index: number, field: string, value: string) => {
    const newStats = [...stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setStats(newStats);
  };

  return (
    <DashboardLayout role={profile?.role || 'admin'} userName={profile?.name || "Admin Access"}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900">Content Management (CMS) 📝</h1>
          <p className="text-slate-600 mt-1">Update public website text, stats, and configurations.</p>
        </div>

        <div className="flex gap-4 border-b border-slate-200 pb-2">
          <button 
            onClick={() => setActiveTab('home')}
            className={cn("font-bold px-4 py-2 rounded-lg transition-colors border", activeTab === 'home' ? "bg-white border-slate-200 text-primary shadow-sm" : "border-transparent text-slate-500")}
          >
            <Activity className="inline-block w-4 h-4 mr-2" /> Home Page Stats
          </button>
          <button 
            onClick={() => setActiveTab('about')}
            className={cn("font-bold px-4 py-2 rounded-lg transition-colors border", activeTab === 'about' ? "bg-white border-slate-200 text-primary shadow-sm" : "border-transparent text-slate-500")}
          >
            <LayoutTemplate className="inline-block w-4 h-4 mr-2" /> About Us (CEO)
          </button>
        </div>

        {activeTab === 'home' && (
          <GlassCard className="p-6">
            <h3 className="font-bold text-lg mb-4 text-slate-900">Homepage Highlight Statistics</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
               {stats.map((stat: any, i: number) => (
                 <div key={i} className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <label className="text-xs font-bold text-slate-500 uppercase">Stat {i+1} Label (ex. Graduates)</label>
                    <input 
                      type="text" 
                      value={stat.label} 
                      onChange={(e) => updateStat(i, 'label', e.target.value)}
                      className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                    />
                    <label className="text-xs font-bold text-slate-500 uppercase mt-2 block">Stat {i+1} Value (ex. 2,500+)</label>
                    <input 
                      type="text" 
                      value={stat.val} 
                      onChange={(e) => updateStat(i, 'val', e.target.value)}
                      className="w-full font-bold text-lg p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                    />
                 </div>
               ))}
            </div>
            <GlassButton variant="primary" onClick={handleSaveHome} icon={Save} className={saving ? "opacity-50" : ""}>
              {saving ? "Saving..." : "Publish to Live Site"}
            </GlassButton>
          </GlassCard>
        )}

        {activeTab === 'about' && (
          <GlassCard className="p-6">
            <h3 className="font-bold text-lg mb-6 text-slate-900">CEO / Director Profile</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Director Name</label>
                <input 
                  type="text" 
                  value={aboutForm.ceoName}
                  onChange={(e) => setAboutForm({...aboutForm, ceoName: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Role Title</label>
                <input 
                  type="text" 
                  value={aboutForm.ceoRole}
                  onChange={(e) => setAboutForm({...aboutForm, ceoRole: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Photo URL</label>
                <input 
                  type="text" 
                  value={aboutForm.ceoPhoto}
                  onChange={(e) => setAboutForm({...aboutForm, ceoPhoto: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary font-mono text-xs"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Quote / Message</label>
                <textarea 
                  value={aboutForm.ceoMessage}
                  onChange={(e) => setAboutForm({...aboutForm, ceoMessage: e.target.value})}
                  className="w-full h-24 p-4 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Short Bio</label>
                <textarea 
                  value={aboutForm.ceoBio}
                  onChange={(e) => setAboutForm({...aboutForm, ceoBio: e.target.value})}
                  className="w-full h-32 p-4 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <GlassButton variant="primary" onClick={handleSaveAbout} icon={Save} className={saving ? "opacity-50" : ""}>
              {saving ? "Saving..." : "Publish to Live Site"}
            </GlassButton>
          </GlassCard>
        )}

      </div>
    </DashboardLayout>
  );
}
