import * as React from 'react';
import { Navbar, GlassCard, GlassButton } from '@/src/components/common/Layout';
import { motion } from 'motion/react';
import { Target, Users, Puzzle, CheckCircle2, ArrowRight, Rocket, BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/src/context/LanguageContext';

export default function TechnoMathDetails() {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-500/30">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden bg-indigo-950 text-white max-w-[100vw]">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-indigo-600/20 to-purple-800/20 opacity-50" />
        <div className="max-w-6xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 inline-block px-4 py-1.5 rounded-full border border-indigo-400 bg-indigo-500/20 text-indigo-200 text-sm font-semibold tracking-wider uppercase"
            >
              {t('forAges')}
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6"
            >
              {t('technoMathHeroTitle')} <br/>
              <span className="text-indigo-400">{t('technoMathHeroSubtitle')}</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-300 text-lg md:text-xl mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              {t('technoMathLongDesc')}
            </motion.p>
            <GlassButton 
              onClick={() => navigate('/apply/student')}
              className={`bg-indigo-500 hover:bg-indigo-600 text-white border-none py-4 px-10 text-lg shadow-[0_0_20px_rgba(99,102,241,0.5)] ${isRtl ? 'flex-row-reverse' : ''}`}
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
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl blur-[40px] opacity-30 animate-pulse" />
            <img 
              src="https://picsum.photos/seed/math-kids-abacus/800/600?blur=1" 
              alt="Child focusing on math" 
              referrerPolicy="no-referrer"
              className="relative w-full h-auto rounded-3xl shadow-2xl border border-white/10 object-cover aspect-video"
            />
          </motion.div>
        </div>
      </section>

      {/* Program Objectives */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">🎯 {t('tmGoalTitle')}</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">{t('tmGoalDesc')}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             <GlassCard neon variant="primary" className="flex gap-4 p-6">
                <Target className="w-8 h-8 text-indigo-500 shrink-0" />
                <p className="font-medium text-slate-800 dark:text-white">{t('tmGoal1')}</p>
             </GlassCard>
             <GlassCard neon variant="primary" className="flex gap-4 p-6">
                <BrainCircuit className="w-8 h-8 text-indigo-500 shrink-0" />
                <p className="font-medium text-slate-800 dark:text-white">{t('tmGoal2')}</p>
             </GlassCard>
             <GlassCard neon variant="primary" className="flex gap-4 p-6">
                <Rocket className="w-8 h-8 text-indigo-500 shrink-0" />
                <p className="font-medium text-slate-800 dark:text-white">{t('tmGoal3')}</p>
             </GlassCard>
             <GlassCard neon variant="primary" className="flex gap-4 p-6">
                <Puzzle className="w-8 h-8 text-indigo-500 shrink-0" />
                <p className="font-medium text-slate-800 dark:text-white">{t('tmGoal4')}</p>
             </GlassCard>
             <GlassCard neon variant="primary" className="flex gap-4 p-6">
                <Users className="w-8 h-8 text-indigo-500 shrink-0" />
                <p className="font-medium text-slate-800 dark:text-white">{t('tmGoal5')}</p>
             </GlassCard>
             <GlassCard neon variant="primary" className="flex gap-4 p-6">
                <CheckCircle2 className="w-8 h-8 text-indigo-500 shrink-0" />
                <p className="font-medium text-slate-800 dark:text-white">{t('tmGoal6')}</p>
             </GlassCard>
          </div>
        </div>
      </section>

      {/* Path Details - 4 Levels */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold text-slate-900 mb-4">🧭 {t('tmPathTitle')}</h2>
            <p className="text-slate-600 text-lg">{t('tmPathDesc')}</p>
          </div>
          
          <div className="space-y-6">
            {/* Level 1 */}
            <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
               <div className="bg-indigo-50 md:w-64 p-6 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-slate-200 shrink-0 group-hover:bg-indigo-500 transition-colors duration-300">
                  <div className="text-4xl font-black text-indigo-200 mb-2 group-hover:text-white/20">L1</div>
                  <h3 className="font-bold text-indigo-900 group-hover:text-white">{t('tmL1Title')}</h3>
                  <p className="text-sm font-bold text-indigo-600 mt-2 px-3 py-1 bg-white/50 rounded-full">{isRtl ? '٣ أشهر' : '3 Months'}</p>
               </div>
               <div className="p-6 md:p-8 flex-1">
                  <p className="text-slate-700 mb-4"><strong>{t('labelDesc')}</strong> {t('tmL1Desc')}</p>
                  <p className="text-slate-700 mb-2"><strong>🎯 {t('labelObj')}</strong> {t('tmL1Obj')}</p>
                  <p className="text-slate-700"><strong>🎓 {t('labelOut')}</strong> {t('tmL1Out')}</p>
               </div>
            </div>

            {/* Level 2 */}
            <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
               <div className="bg-indigo-50 md:w-64 p-6 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-slate-200 shrink-0 group-hover:bg-indigo-500 transition-colors duration-300">
                  <div className="text-4xl font-black text-indigo-200 mb-2 group-hover:text-white/20">L2</div>
                  <h3 className="font-bold text-indigo-900 group-hover:text-white">{t('tmL2Title')}</h3>
                  <p className="text-sm font-bold text-indigo-600 mt-2 px-3 py-1 bg-white/50 rounded-full">{isRtl ? '٣ أشهر' : '3 Months'}</p>
               </div>
               <div className="p-6 md:p-8 flex-1">
                  <p className="text-slate-700 mb-4"><strong>{t('labelDesc')}</strong> {t('tmL2Desc')}</p>
                  <p className="text-slate-700 mb-2"><strong>🎯 {t('labelObj')}</strong> {t('tmL2Obj')}</p>
                  <p className="text-slate-700"><strong>🎓 {t('labelOut')}</strong> {t('tmL2Out')}</p>
               </div>
            </div>

            {/* Level 3 */}
            <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
               <div className="bg-indigo-50 md:w-64 p-6 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-slate-200 shrink-0 group-hover:bg-indigo-500 transition-colors duration-300">
                  <div className="text-4xl font-black text-indigo-200 mb-2 group-hover:text-white/20">L3</div>
                  <h3 className="font-bold text-indigo-900 group-hover:text-white">{t('tmL3Title')}</h3>
                  <p className="text-sm font-bold text-indigo-600 mt-2 px-3 py-1 bg-white/50 rounded-full">{isRtl ? '٣ أشهر' : '3 Months'}</p>
               </div>
               <div className="p-6 md:p-8 flex-1">
                  <p className="text-slate-700 mb-4"><strong>{t('labelDesc')}</strong> {t('tmL3Desc')}</p>
                  <p className="text-slate-700 mb-2"><strong>🎯 {t('labelObj')}</strong> {t('tmL3Obj')}</p>
                  <p className="text-slate-700"><strong>🎓 {t('labelOut')}</strong> {t('tmL3Out')}</p>
               </div>
            </div>

            {/* Level 4 */}
            <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
               <div className="bg-indigo-50 md:w-64 p-6 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-slate-200 shrink-0 group-hover:bg-indigo-500 transition-colors duration-300">
                  <div className="text-4xl font-black text-indigo-200 mb-2 group-hover:text-white/20">L4</div>
                  <h3 className="font-bold text-indigo-900 group-hover:text-white">{t('tmL4Title')}</h3>
                  <p className="text-sm font-bold text-indigo-600 mt-2 px-3 py-1 bg-white/50 rounded-full">{isRtl ? '٣ أشهر' : '3 Months'}</p>
               </div>
               <div className="p-6 md:p-8 flex-1">
                  <p className="text-slate-700 mb-4"><strong>{t('labelDesc')}</strong> {t('tmL4Desc')}</p>
                  <p className="text-slate-700 mb-2"><strong>🎯 {t('labelObj')}</strong> {t('tmL4Obj')}</p>
                  <p className="text-slate-700"><strong>🎓 {t('labelOut')}</strong> {t('tmL4Out')}</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Call to Action */}
      <section className="py-20 bg-indigo-950 text-center px-4">
         <h2 className="text-3xl font-bold font-display text-white mb-6">{t('startJourneyTitle')}</h2>
         <p className="text-indigo-200 mb-10 max-w-xl mx-auto">{t('startJourneyDesc')}</p>
         <GlassButton 
            onClick={() => navigate('/register')}
            className={`bg-white text-indigo-900 hover:bg-slate-100 border-none py-4 px-12 text-lg mx-auto ${isRtl ? 'flex-row-reverse' : ''}`}
          >
            {t('startJourneyBtn')} <ArrowRight className={isRtl ? "mr-2 w-5 h-5 rotate-180" : "ml-2 w-5 h-5"} />
          </GlassButton>
      </section>

    </div>
  );
}
