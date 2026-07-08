import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCoursesData } from '@/src/hooks/useCoursesData';
import { Navbar, GlassCard, GlassButton } from '@/src/components/common/Layout';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Clock, Target, CheckCircle2, ChevronRight, GraduationCap } from 'lucide-react';

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathsData, isAr, t } = useCoursesData();

  // Find the requested course
  let courseDetails = null;
  let categoryInfo = null;
  
  for (const cat of pathsData) {
    const found = cat.items.find(item => item.id === id);
    if (found) {
      courseDetails = found;
      categoryInfo = cat;
      break;
    }
  }

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!courseDetails) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">{isAr ? 'لم يتم العثور على الدورة' : 'Course Not Found'}</h1>
          <GlassButton onClick={() => navigate('/courses')} variant="primary">
            {isAr ? 'العودة للدورات' : 'Back to Courses'}
          </GlassButton>
        </div>
      </div>
    );
  }

  const Icon = courseDetails.icon;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      
      {/* Hero Header */}
      <section className="relative pt-32 pb-20 px-4 bg-slate-900 overflow-hidden text-white">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
           <div className={`absolute -top-24 ${isAr ? '-left-24' : '-right-24'} w-96 h-96 ${courseDetails.color} rounded-full mix-blend-multiply filter blur-3xl`} />
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center text-white ${courseDetails.color} shadow-2xl shadow-${courseDetails.color.replace('bg-', '')}/50 border border-white/20`}
          >
            <Icon size={48} />
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-slate-300 font-medium mb-3 uppercase tracking-widest text-sm"
          >
            {categoryInfo?.category}
          </motion.p>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display font-extrabold mb-6 leading-tight text-white"
          >
            {courseDetails.title}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-light"
          >
            {courseDetails.brief}
          </motion.p>
          
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="flex items-center justify-center gap-4"
          >
            <GlassButton 
              variant="primary" 
              onClick={() => navigate('/apply/student')}
              className="py-4 px-10 text-lg shadow-xl shadow-primary/30"
            >
              {t('enrollNow')}
            </GlassButton>
          </motion.div>
        </div>
      </section>

      {/* Course Roadmap & Details content */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          
          <div className="grid md:grid-cols-3 gap-12">
            
            <div className="md:col-span-2 space-y-12">
              {/* About */}
              <motion.div 
                initial={{ opacity: 0, x: isAr ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-display font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <Target className="text-primary" size={28} />
                  {isAr ? 'نظرة عامة' : 'Overview'}
                </h2>
                <div className="prose prose-lg text-slate-600">
                  <p className="leading-relaxed">{courseDetails.details}</p>
                </div>
              </motion.div>

              {/* Outcomes Timeline / Roadmap */}
              <motion.div 
                initial={{ opacity: 0, x: isAr ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-3xl font-display font-bold text-slate-900 mb-8 flex items-center gap-3">
                  <GraduationCap className="text-primary" size={28} />
                  {isAr ? 'مخرجات التعلم' : 'Learning Outcomes'}
                </h2>
                
                <div className="space-y-6">
                  {courseDetails.learningOutcomes?.map((outcome, idx) => (
                    <GlassCard key={idx} hover={true} className="flex flex-col md:flex-row md:items-center gap-4 border-l-4 border-l-primary bg-white transition-all group">
                       <div className="hidden md:flex flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                         <span className="font-bold">{idx + 1}</span>
                       </div>
                       <div>
                         <p className="text-lg font-medium text-slate-800">{outcome}</p>
                       </div>
                    </GlassCard>
                  ))}
                </div>
              </motion.div>
              
            </div>

            {/* Sidebar info */}
            <div className="space-y-6">
              <GlassCard className="bg-white sticky top-24 shadow-sm border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6 font-display border-b pb-4">
                  {isAr ? 'تفاصيل الانضمام' : 'Enrollment Details'}
                </h3>
                
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Clock size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{isAr ? 'المدة الزمنية' : 'Duration'}</p>
                      <p className="font-bold text-slate-900">{courseDetails.duration}</p>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-slate-100">
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                      {isAr 
                        ? 'انضم الآن وابدأ رحلتك نحو التميز المهني وإتقان المهارات التكنولوجية الحديثة.'
                        : 'Join now and start your journey towards professional excellence and modern tech mastery.'}
                    </p>
                    <GlassButton 
                      variant="primary" 
                      onClick={() => navigate('/register')}
                      className="w-full py-4 text-center justify-center"
                    >
                      {t('enrollNow')}
                    </GlassButton>
                    <button 
                      onClick={() => navigate('/courses')}
                      className={`w-full mt-4 flex items-center justify-center gap-2 text-primary font-medium hover:underline`}
                    >
                      {isAr ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                      {isAr ? 'تصفح كل المسارات' : 'Browse All Paths'}
                    </button>
                  </div>
                </div>
              </GlassCard>
            </div>
            
          </div>
        </div>
      </section>
    </div>
  );
}
