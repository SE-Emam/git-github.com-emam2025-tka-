import * as React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  Zap, 
  ShieldCheck, 
  Award,
  Globe,
  Users,
  Smartphone
} from 'lucide-react';
import { GlassCard, GlassButton } from '@/src/components/common/Layout';
import { useLanguage } from '@/src/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '@/src/services/hybridApiService';

export default function Enrollment() {
  const { t, language, isRtl } = useLanguage();
  const navigate = useNavigate();
  const [courses, setCourses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiFetch('/courses.php?action=list').then(res => {
      if (res.status === 'success') setCourses(res.data);
      setLoading(false);
    });
  }, []);

  const features = [
    { icon: <Zap className="text-amber-500" />, title_ar: 'تعلم تفاعلي', title_en: 'Interactive Learning', desc_ar: 'محاضرات مباشرة وتدريب عملي مكثف.', desc_en: 'Live sessions and intensive practical training.' },
    { icon: <ShieldCheck className="text-green-500" />, title_ar: 'شهادات معتمدة', title_en: 'Certified Degrees', desc_ar: 'احصل على شهادة موثقة عند إتمام المسار.', desc_en: 'Get a verified certificate upon completion.' },
    { icon: <Globe className="text-blue-500" />, title_ar: 'وصول من أي مكان', title_en: 'Access Anywhere', desc_ar: 'ادرس من منزلك عبر منصتنا المتطورة.', desc_en: 'Study from home via our advanced platform.' }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-24">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20 mb-4"
          >
            <Award size={16} /> {language === 'ar' ? 'بوابتك للاحتراف' : 'Your Gateway to Professionalism'}
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight"
          >
            {language === 'ar' ? 'سجل الآن في ' : 'Enroll Now in '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              TKA Egypt
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
          >
            {language === 'ar' 
              ? 'انضم لأكثر من 5000 متدرب وصمم مستقبلك البرمجي مع نخبة من الخبراء في الشرق الأوسط.'
              : 'Join over 5000 trainees and design your software future with top experts in the Middle East.'}
          </motion.p>
        </div>

        {/* Courses Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-80 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-3xl" />
            ))
          ) : (
            courses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <GlassCard className="h-full flex flex-col p-0 overflow-hidden group hover:shadow-2xl hover:shadow-primary/10 transition-all border-slate-200 dark:border-slate-800">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={course.image_url || `https://picsum.photos/seed/${course.id}/800/600`}
                      alt={course.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2">
                        <span className="bg-primary px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                          {course.level || 'Beginner'}
                        </span>
                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                          {course.duration || '3 Months'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{course.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-6">
                      {course.description}
                    </p>
                    
                    <div className="mt-auto space-y-4">
                      <div className="flex items-center justify-between py-4 border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{language === 'ar' ? 'رسوم الدورة' : 'Course Fee'}</p>
                          <p className="text-2xl font-black text-slate-900 dark:text-white">
                            {course.price > 0 ? `${course.price} EGP` : (language === 'ar' ? 'مجاني' : 'Free')}
                          </p>
                        </div>
                        <GlassButton 
                          variant="primary" 
                          icon={ArrowRight}
                          onClick={() => navigate('/apply/student')}
                        >
                          {language === 'ar' ? 'سجل الآن' : 'Apply'}
                        </GlassButton>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))
          )}
        </div>

        {/* Why Us section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="p-8 text-center h-full border-slate-100 dark:border-slate-800">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center mx-auto mb-6 text-2xl shadow-inner">
                  {f.icon}
                </div>
                <h4 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">
                  {language === 'ar' ? f.title_ar : f.title_en}
                </h4>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                  {language === 'ar' ? f.desc_ar : f.desc_en}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="relative rounded-[40px] bg-slate-900 overflow-hidden p-8 md:p-16 text-center text-white"
        >
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 blur-[80px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/20 blur-[80px] translate-x-1/2 translate-y-1/2" />
          </div>
          
          <div className="relative z-10 space-y-8">
            <div className="flex justify-center -space-x-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-slate-900 bg-slate-800 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="u" />
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-4 border-slate-900 bg-primary flex items-center justify-center text-xs font-bold">
                +5k
              </div>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black max-w-3xl mx-auto leading-tight">
              {language === 'ar' ? 'هل أنت مستعد لبدء مسيرتك المهنية؟' : 'Ready to Launch Your Professional Career?'}
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GlassButton 
                variant="primary" 
                className="py-5 px-10 text-lg bg-white text-slate-900 border-none shadow-white/10"
                onClick={() => navigate('/apply/student')}
              >
                {language === 'ar' ? 'انضم إلينا اليوم' : 'Join Us Today'}
              </GlassButton>
              <GlassButton 
                variant="secondary" 
                className="py-5 px-10 text-lg border-white/20 text-white hover:bg-white/10"
                onClick={() => window.location.href = 'https://wa.me/201234567890'}
              >
                {language === 'ar' ? 'تحدث مع خبير' : 'Talk to an Expert'}
              </GlassButton>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Branding */}
      <div className="py-12 text-center text-slate-400 text-sm font-medium border-t border-slate-100 dark:border-slate-800">
        © {new Date().getFullYear()} TKA Egypt - Total Knowledge Academy. All rights reserved.
      </div>
    </div>
  );
}
