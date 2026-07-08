import * as React from 'react';
import { 
  Download, 
  Monitor, 
  Smartphone, 
  Terminal, 
  Info,
  ExternalLink,
  Trash2,
  Plus,
  Box
} from 'lucide-react';
import { GlassCard, GlassButton } from '../common/Layout';
import { useAuth } from '@/src/context/AuthContext';
import { getApplicationsFromSQL, deleteApplicationFromSQL } from '@/src/services/hybridApiService';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface ToolLibraryProps {
  groupId?: string;
  levelName?: string;
  userId?: string;
  isAdmin?: boolean;
}

export default function ToolLibrary({ groupId, levelName, userId, isAdmin }: ToolLibraryProps) {
  const [apps, setApps] = React.useState<any[]>([]);
  const { profile } = useAuth();
  const [loading, setLoading] = React.useState(true);

  const fetchApps = React.useCallback(async () => {
    setLoading(true);
    try {
      const allApps = await getApplicationsFromSQL();
      if (isAdmin) {
        setApps(allApps);
        return;
      }

      // Filter based on targeting logic
      const filtered = allApps.filter((app: any) => {
        if (app.targetType === 'all') return true;
        if (app.targetType === 'level' && levelName && app.targetId === levelName) return true;
        if (app.targetType === 'group' && groupId && app.targetId === groupId) return true;
        if (app.targetType === 'student' && userId && app.targetId === userId) return true;
        
        // Fallback for current user profile if props are missing
        if (app.targetType === 'student' && profile?.uid === app.targetId) return true;
        if (app.targetType === 'group' && profile?.groupId === app.targetId) return true;
        
        return false;
      });
      setApps(filtered);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [groupId, levelName, userId, isAdmin, profile?.uid, profile?.groupId]);

  React.useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التطبيق؟')) {
      await deleteApplicationFromSQL(id);
      fetchApps();
    }
  };

  const getOSIcon = (os: string) => {
    switch (os.toLowerCase()) {
      case 'windows': return <Monitor size={14} />;
      case 'mac': 
      case 'macos': return <Box size={14} />;
      case 'linux': return <Terminal size={14} />;
      case 'android': 
      case 'ios': return <Smartphone size={14} />;
      default: return <Download size={14} />;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Box className="text-primary" /> تطبيقات وأدوات المنهج
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {apps.map(app => (
          <GlassCard key={app.id} className="p-0 overflow-hidden border border-slate-200 shadow-sm transition-all hover:shadow-lg dark:border-slate-800 flex flex-col h-full">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  {app.image ? (
                    <img src={app.image} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <Box size={24} />
                  )}
                </div>
                {isAdmin && (
                  <button 
                    onClick={() => handleDelete(app.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              
              <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{app.name}</h4>
              <p className="text-xs text-slate-500 leading-relaxed dark:text-slate-400 mb-6">{app.description}</p>
              
              <div className="space-y-2 mt-auto">
                {app.platforms?.map((platform: any, idx: number) => (
                  <a 
                    key={idx}
                    href={platform.url}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group hover:border-primary transition-all dark:bg-slate-800 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400 group-hover:text-primary dark:bg-slate-900">
                        {getOSIcon(platform.os)}
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{platform.os}</span>
                    </div>
                    <Download size={16} className="text-slate-300 group-hover:text-primary" />
                  </a>
                ))}
              </div>
            </div>
            {isAdmin && (
               <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between dark:bg-slate-800/50 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Target: {app.targetType} {app.targetId ? `(${app.targetId})` : ''}
                  </span>
               </div>
            )}
          </GlassCard>
        ))}

        {apps.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl dark:border-slate-800">
            <Box size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium tracking-wide">لا توجد تطبيقات مضافة لهذا القسم حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
}
