import * as React from 'react';
import { Navbar, GlassCard, GlassButton } from '@/src/components/common/Layout';
import { 
  ArrowRight,
  Clock,
  Terminal,
  Code2,
  Briefcase
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/src/context/LanguageContext';
import { useCoursesData } from '@/src/hooks/useCoursesData';

export default function Courses() {
  const navigate = useNavigate();
  const { pathsData, isAr, t, loading } = useCoursesData();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display font-bold mb-4 text-slate-900 dark:text-white"
            >
              {t('coursesPageTitle')} <span className="text-primary">TKA-Egypt</span>
            </motion.h1>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-lg">
              {t('coursesPageDesc')}
            </p>
          </div>

          {loading ? (
            <div className="space-y-12 animate-pulse">
               {[1,2].map(i => (
                 <div key={i} className="space-y-6">
                    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4" />
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                       {[1,2,3].map(j => (
                         <div key={j} className="h-[400px] bg-slate-100 dark:bg-slate-800/50 rounded-3xl" />
                       ))}
                    </div>
                 </div>
               ))}
            </div>
          ) : (
            <div className="space-y-20">
            {pathsData.map((path, idx) => (
              <div key={idx} className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                   <div>
                     <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white">{path.category}</h2>
                     <p className="text-slate-600 dark:text-slate-300 mt-2">{path.description}</p>
                   </div>
                   <div className="hidden md:block h-px flex-1 bg-slate-200 dark:bg-slate-800 mb-2 ml-8" />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {path.items.map((course) => (
                     <GlassCard key={course.id} hover neon variant="primary" className="flex flex-col h-full bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 group hover:shadow-xl hover:border-primary/20 transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                           <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${course.color} group-hover:scale-110 transition-transform duration-300`}>
                              <course.icon size={24} className="group-hover:animate-pulse" />
                           </div>
                           <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                              <Clock size={12} className="text-slate-500 dark:text-slate-400" />
                              <span className="text-[10px] font-bold tracking-wider text-slate-600 dark:text-slate-300">{course.duration}</span>
                           </div>
                        </div>

                        <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white line-clamp-2 group-hover:text-primary transition-colors">{course.title}</h3>
                        <p className="text-sm font-medium text-primary mb-3">
                           {course.brief}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed flex-1">
                           {course.details}
                        </p>

                        <GlassButton 
                          className={`mt-auto py-3 w-full group-hover:shadow-lg transition-all flex items-center justify-center`} 
                          variant="primary"
                          onClick={() => {
                            if (course.id === 'techno-math') {
                              navigate('/techno-math');
                            } else {
                              navigate(`/course/${course.id}`);
                            }
                          }}
                        >
                          {course.id === 'techno-math' ? t('viewLevels') : t('viewPath')} 
                          {isAr ? <ArrowRight className="mr-2 rotate-180 transition-transform group-hover:-translate-x-1" size={16} /> : <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={16} />}
                        </GlassButton>
                     </GlassCard>
                   ))}
                </div>
              </div>
            ))}
          </div>
          )}

          {/* Value Proposition Section */}
          <div className="mt-24 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
             <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 font-display">{t('whyChooseUs')}</h2>
             <div className="grid md:grid-cols-3 gap-8">
                <div>
                   <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mx-auto mb-4">
                      <Terminal size={32} />
                   </div>
                   <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{t('practicalApp')}</h3>
                   <p className="text-slate-600 dark:text-slate-400 text-sm">{t('practicalAppDesc')}</p>
                </div>
                <div>
                   <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center mx-auto mb-4">
                      <Code2 size={32} />
                   </div>
                   <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{t('expertTrainers')}</h3>
                   <p className="text-slate-600 dark:text-slate-400 text-sm">{t('expertTrainersDesc')}</p>
                </div>
                <div>
                   <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center mx-auto mb-4">
                      <Briefcase size={32} />
                   </div>
                   <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{t('certifiedCerts')}</h3>
                   <p className="text-slate-600 dark:text-slate-400 text-sm">{t('certifiedCertsDesc')}</p>
                </div>
             </div>
          </div>

        </div>
      </section>
    </div>
  );
}

