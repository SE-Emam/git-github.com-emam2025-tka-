import * as React from 'react';
import { Navbar, GlassCard, GlassButton } from '@/src/components/common/Layout';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Target, Calendar, Users, Code, Bot, Globe, Medal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/src/context/LanguageContext';

export default function ScholarshipDetails() {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] selection:bg-primary/30 transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 relative overflow-hidden bg-[#001d4a] text-white max-w-[100vw]">
        {/* Elegant Vibrant Gradient Background combining Primary Blue and Shiny Yellow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#001d4a] via-[#3b82f6] to-[#d97706] opacity-90" />
        {/* Shiny Yellow overlays */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tl from-[#fbbf24]/40 via-transparent to-transparent" />
        
        {/* Glowing animated orbs */}
        <div className="absolute -top-32 -right-32 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#fbbf24] blur-[140px] rounded-full opacity-50 animate-pulse pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-[#60a5fa] blur-[150px] rounded-full opacity-50 pointer-events-none" />
        
        {/* Texture overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 inline-block px-4 py-1.5 rounded-full border border-[#fbbf24]/40 bg-[#fbbf24]/20 text-[#fbbf24] text-sm font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(251,191,36,0.3)]"
            >
              {t('forAges')}
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight drop-shadow-lg"
            >
              {t('scholarshipHeroTitle')}
              <span className="block text-2xl md:text-3xl text-[#fbbf24] mt-4 font-bold drop-shadow-md">
                {t('scholarshipHeroSubtitle')}
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-blue-50 text-lg md:text-xl mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 drop-shadow"
            >
              {t('scholarshipDesc')}
            </motion.p>
            <GlassButton 
              onClick={() => navigate('/apply/student')}
              variant="primary"
              className={`py-4 px-10 text-lg border border-white/20 shadow-2xl hover:scale-105 hover:bg-[#fbbf24] hover:text-[#001d4a] hover:border-transparent transition-all ${isRtl ? 'flex-row-reverse' : ''}`}
            >
              {t('enrollNow')} <ArrowRight className={isRtl ? "mr-2 w-5 h-5 rotate-180" : "ml-2 w-5 h-5"} />
            </GlassButton>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#fbbf24] to-[#3b82f6] rounded-3xl blur-[50px] opacity-40 animate-pulse pointer-events-none" />
            <img 
              src="/tech-makers.png" 
              alt="TKA Future Leaders" 
              referrerPolicy="no-referrer"
              className="relative w-full h-auto object-contain drop-shadow-2xl"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://picsum.photos/seed/scholarship/800/600";
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto space-y-20">

          {/* Target Audience & Goals */}
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <Users className="text-primary" /> {t('targetAudience')}
              </h2>
              <ul className="space-y-4">
                <li className="flex gap-3 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-6 h-6 text-secondary shrink-0" />
                  <span>{t('target1')}</span>
                </li>
                <li className="flex gap-3 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-6 h-6 text-secondary shrink-0" />
                  <span>{t('target2')}</span>
                </li>
                <li className="flex gap-3 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-6 h-6 text-secondary shrink-0" />
                  <span>{t('target3')}</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <Target className="text-primary" /> {t('goals')}
              </h2>
              <ul className="space-y-4">
                <li className="flex gap-3 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                  <span>{t('goal1')}</span>
                </li>
                <li className="flex gap-3 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                  <span>{t('goal2')}</span>
                </li>
                <li className="flex gap-3 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                  <span>{t('goal3')}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Path Details */}
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900">🛤️ {t('programPath')}</h2>
              <p className="text-slate-600 mt-4 text-lg">{t('programPathDesc')}</p>
            </div>
            
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {/* Year 1 */}
              <div className={`relative flex items-center justify-between md:justify-normal group is-active ${isRtl ? 'md:even:flex-row-reverse' : 'md:odd:flex-row-reverse'}`}>
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-200 group-[.is-active]:bg-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors duration-500">
                  1
                </div>
                <GlassCard neon variant="primary" className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="text-primary w-6 h-6" />
                    <h3 className="font-bold text-xl text-slate-900 dark:text-white">{t('year1')}</h3>
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    {t('year1Desc')}
                  </p>
                  <ul className="space-y-3 mt-4 text-sm text-slate-700">
                    <li className="flex items-center gap-2">
                       <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                       <span>{t('y1b1')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                       <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                       <span>{t('y1b2')}</span>
                    </li>
                    <li className="flex items-center gap-2 border-t border-slate-100 pt-3 font-semibold text-slate-900">
                       <Medal className="w-4 h-4 text-secondary shrink-0" />
                       <span>{t('y1b3')}</span>
                    </li>
                  </ul>
                </GlassCard>
              </div>

              {/* Year 2 */}
              <div className={`relative flex items-center justify-between md:justify-normal group is-active mt-12 md:mt-0 ${isRtl ? 'md:even:flex-row-reverse' : 'md:odd:flex-row-reverse'}`}>
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-200 group-[.is-active]:bg-secondary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors duration-500">
                  2
                </div>
                <GlassCard neon variant="primary" className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="text-secondary w-6 h-6" />
                    <h3 className="font-bold text-xl text-slate-900 dark:text-white">{t('year2')}</h3>
                  </div>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {t('year2Desc')}
                  </p>
                  
                  <div className="grid gap-4">
                    <div className="flex items-start gap-3 bg-slate-100/50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
                       <Globe className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                       <div>
                         <h4 className="font-bold text-slate-900 dark:text-white">{t('y2path1')}</h4>
                         <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('y2path1d')}</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-3 bg-slate-100/50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
                       <Code className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                       <div>
                         <h4 className="font-bold text-slate-900 dark:text-white">{t('y2path2')}</h4>
                         <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('y2path2d')}</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-3 bg-slate-100/50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
                       <Bot className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                       <div>
                         <h4 className="font-bold text-slate-900 dark:text-white">{t('y2path3')}</h4>
                         <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('y2path3d')}</p>
                       </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>

          {/* Philosophy & Outcomes */}
          <div className="grid lg:grid-cols-5 gap-12 items-start pt-10">
            <GlassCard neon variant="primary" className="lg:col-span-3 p-8 bg-slate-900/90 text-white">
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">💡 {t('philosophy')}</h2>
              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>
                  {t('phil1')}
                </p>
                <p>
                  {t('phil2')}
                </p>
                <p>
                  {t('phil3')}
                </p>
                <p>
                  {t('phil4')}
                </p>
              </div>
            </GlassCard>

            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white mb-6">🎯 {t('outcomes')}</h2>
              <p className="text-slate-600 mb-8">{t('outcomesDesc')}</p>
              
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                   <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                     <Code className="text-blue-600 w-5 h-5" />
                   </div>
                   <p className="text-slate-700 font-medium pt-2">{t('out1')}</p>
                </div>
                <div className="flex gap-4 items-start">
                   <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                     <Target className="text-purple-600 w-5 h-5" />
                   </div>
                   <p className="text-slate-700 font-medium pt-2">{t('out2')}</p>
                </div>
                <div className="flex gap-4 items-start">
                   <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                     <Bot className="text-green-600 w-5 h-5" />
                   </div>
                   <p className="text-slate-700 font-medium pt-2">{t('out3')}</p>
                </div>
                <div className="flex gap-4 items-start">
                   <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                     <Globe className="text-orange-600 w-5 h-5" />
                   </div>
                   <p className="text-slate-700 font-medium pt-2">{t('out4')}</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>
      
      {/* Footer Call to Action */}
      <section className="py-20 bg-white border-t border-slate-200 text-center px-4 mt-10">
         <h2 className="text-3xl font-bold font-display text-slate-900 mb-6">{t('readyToEmpower')}</h2>
         <p className="text-slate-600 mb-10 max-w-xl mx-auto">{t('readyToEmpowerDesc')}</p>
         <GlassButton 
            onClick={() => navigate('/register')}
            variant="primary"
            className={`py-4 px-12 text-lg mx-auto ${isRtl ? 'flex-row-reverse' : ''}`}
          >
            {t('enrollNow')} <ArrowRight className={isRtl ? "mr-2 w-5 h-5 rotate-180" : "ml-2 w-5 h-5"} />
          </GlassButton>
      </section>

    </div>
  );
}
