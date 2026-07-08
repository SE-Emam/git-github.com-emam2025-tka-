import * as React from 'react';
import { 
  PlayCircle, 
  Plus, 
  Trash2, 
  Video, 
  CheckCircle2, 
  X,
  Filter 
} from 'lucide-react';
import { GlassCard, GlassButton } from '../common/Layout';
import { 
  trackVideoProgress, 
  getVideoProgressForStudent
} from '@/src/services/firestoreService';
import { getVideosFromSQL, addVideoToSQL, deleteVideoFromSQL } from '@/src/services/hybridApiService';
import { useAuth } from '@/src/context/AuthContext';
import { cn } from '@/src/lib/utils';
import { AnimatePresence, motion } from 'motion/react';

export default function VideoLibrary({ groupId }: { groupId: string }) {
  const { profile, user } = useAuth();
  const role = profile?.role || 'student';
  const isElevated = ['trainer', 'admin', 'staff', 'supervisor'].includes(role);
  
  const [videos, setVideos] = React.useState<any[]>([]);
  const [progressLog, setProgressLog] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [url, setUrl] = React.useState('');
  const [level, setLevel] = React.useState('');
  const [subject, setSubject] = React.useState('');

  const [filterLevel, setFilterLevel] = React.useState('All');
  const [filterSubject, setFilterSubject] = React.useState('All');
  
  const [activeVideo, setActiveVideo] = React.useState<any | null>(null);

  const fetchVideos = React.useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const data = await getVideosFromSQL({ groupId });
      setVideos(data.filter((v: any) => !v._deleted));
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  React.useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  React.useEffect(() => {
    if (role === 'student' && user?.uid) {
      const unsub = getVideoProgressForStudent(user.uid, setProgressLog);
      return () => unsub();
    }
  }, [role, user?.uid]);

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId || !title || !url || !level || !subject) return;
    try {
      await addVideoToSQL({
        groupId,
        title,
        url,
        level,
        subject,
        trainerId: user?.uid || 'system'
      });
      setShowAddModal(false);
      setTitle(''); setUrl(''); setLevel(''); setSubject('');
      fetchVideos();
    } catch (err) {
      console.error(err);
      alert('Failed to add video');
    }
  };

  const handleDelete = async (videoId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الفيديو؟')) {
      await deleteVideoFromSQL(videoId);
      fetchVideos();
    }
  };

  const markCompleted = async (videoId: string) => {
    if (user?.uid && role === 'student') {
      await trackVideoProgress(videoId, user.uid);
    }
  };

  const parseVideoUrl = (link: string) => {
    // Basic youtube parser
    const yp = /youtube\.com\/watch\?v=([a-zA-Z0-9_\-]+)/;
    const yps = /youtu\.be\/([a-zA-Z0-9_\-]+)/;
    let match = link.match(yp) || link.match(yps);
    if (match) return `https://www.youtube.com/embed/${match[1]}?rel=0`;
    return link; // Default to direct or other iframe
  };

  const isYoutube = (link: string) => link.includes('youtube.com') || link.includes('youtu.be');

  const levels = Array.from(new Set(videos.map(v => v.level)));
  const subjects = Array.from(new Set(videos.map(v => v.subject)));

  const filteredVideos = videos.filter(v => {
    if (filterLevel !== 'All' && v.level !== filterLevel) return false;
    if (filterSubject !== 'All' && v.subject !== filterSubject) return false;
    return true;
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
          <Video className="text-primary" /> مكتبة الفيديوهات التعليمية
        </h2>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          {levels.length > 0 && (
            <select 
              value={filterLevel} 
              onChange={(e) => setFilterLevel(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:border-slate-700"
            >
              <option value="All">كل المستويات</option>
              {levels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          )}
          {subjects.length > 0 && (
            <select 
              value={filterSubject} 
              onChange={(e) => setFilterSubject(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:border-slate-700"
            >
              <option value="All">كل المواد</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          {isElevated && (
            <GlassButton variant="primary" icon={Plus} onClick={() => setShowAddModal(true)} className="mr-auto w-full md:w-auto py-2">
              إضافة فيديو
            </GlassButton>
          )}
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map(video => {
           const isCompleted = progressLog.some(p => p.videoId === video.id && p.completed);
           
           return (
             <GlassCard key={video.id} className="p-0 overflow-hidden group border border-slate-200 shadow-sm transition-all hover:shadow-lg dark:border-slate-800">
               <div className="bg-slate-100 dark:bg-slate-800 aspect-video relative flex items-center justify-center border-b border-slate-200 dark:border-slate-700">
                  <PlayCircle size={48} className="text-slate-300 group-hover:text-primary transition-colors cursor-pointer" onClick={() => setActiveVideo(video)} />
                  {isElevated && (
                     <button 
                       onClick={() => handleDelete(video.id)}
                       className="absolute top-2 right-2 p-2 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 hover:text-white"
                     >
                       <Trash2 size={14} />
                     </button>
                  )}
                  {role === 'student' && isCompleted && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md">
                      <CheckCircle2 size={12} /> مكتمل
                    </div>
                  )}
               </div>
               <div className="p-4">
                 <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{video.level}</span>
                    <span className="text-[10px] font-bold bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">{video.subject}</span>
                 </div>
                 <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-3 line-clamp-2" title={video.title}>{video.title}</h3>
                 
                 <GlassButton 
                   variant="secondary" 
                   className="w-full text-xs py-2 group-hover:bg-primary group-hover:text-white transition-colors"
                   onClick={() => setActiveVideo(video)}
                 >
                   <PlayCircle size={14} className="ml-1" /> تشغيل الدرس
                 </GlassButton>
               </div>
             </GlassCard>
           );
        })}
        {filteredVideos.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white/50 rounded-2xl border border-dashed border-slate-300 dark:bg-slate-800/50 dark:border-slate-700">
            <Video size={48} className="mx-auto mb-4 opacity-20" />
            <p>لا توجد فيديوهات مطابقة للبحث في هذه المجموعة</p>
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {activeVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-sm">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                   <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{activeVideo.title}</h3>
                   <p className="text-xs text-slate-500 font-bold">{activeVideo.level} • {activeVideo.subject}</p>
                </div>
                <button onClick={() => setActiveVideo(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full dark:hover:bg-slate-800 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="bg-black w-full aspect-video">
                 {isYoutube(activeVideo.url) ? (
                    <iframe 
                      className="w-full h-full"
                      src={parseVideoUrl(activeVideo.url)}
                      title={activeVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      onLoad={() => {
                        // Optimistically mark as completed for students when they open it, 
                        // as cross-origin iframe events aren't fully interceptable without yt api
                        if(role === 'student') markCompleted(activeVideo.id);
                      }}
                    ></iframe>
                 ) : (
                    <video 
                      controls 
                      controlsList="nodownload" 
                      className="w-full h-full"
                      onContextMenu={(e) => e.preventDefault()}
                      onEnded={() => markCompleted(activeVideo.id)}
                    >
                      <source src={activeVideo.url} type="video/mp4" />
                      متصفحك لا يدعم تشغيل هذا الفيديو.
                    </video>
                 )}
              </div>
              {role === 'student' && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center dark:bg-slate-800 dark:border-slate-700">
                   {progressLog.some(p => p.videoId === activeVideo.id && p.completed) ? (
                      <p className="text-green-600 font-bold text-sm flex items-center justify-center gap-1">
                        <CheckCircle2 size={16}/> أتممت مشاهدة هذا الدرس
                      </p>
                   ) : (
                      <GlassButton variant="primary" onClick={() => markCompleted(activeVideo.id)} className="px-8 text-sm">
                        <CheckCircle2 size={16} className="ml-2" /> اضغط هنا بعد الإنتهاء لتوثيق حضورك
                      </GlassButton>
                   )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Video Modal */}
      <AnimatePresence>
        {showAddModal && isElevated && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl"
            >
               <h3 className="text-xl font-bold mb-4">إضافة فيديو جديد للمكتبة</h3>
               <form onSubmit={handleAddVideo} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">عنوان الدرس / الفيديو</label>
                    <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded-xl p-3 bg-slate-50 focus:ring-2 focus:ring-primary/20 outline-none" placeholder="مثال: مقدمة في الرياضيات..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-500">اسم المستوى</label>
                       <input required value={level} onChange={e => setLevel(e.target.value)} className="w-full border rounded-xl p-3 bg-slate-50 focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Level 1" />
                     </div>
                     <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-500">اسم المادة / الموضوع</label>
                       <input required value={subject} onChange={e => setSubject(e.target.value)} className="w-full border rounded-xl p-3 bg-slate-50 focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Math / Java" />
                     </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">رابط الفيديو (YouTube أو مباشر)</label>
                    <input required value={url} onChange={e => setUrl(e.target.value)} dir="ltr" className="w-full border rounded-xl p-3 bg-slate-50 focus:ring-2 focus:ring-primary/20 outline-none text-left" placeholder="https://youtu.be/..." />
                  </div>
                  <div className="pt-2 flex gap-3">
                     <GlassButton type="button" variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">إلغاء</GlassButton>
                     <GlassButton type="submit" variant="primary" className="flex-1">رفع وحفظ</GlassButton>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
