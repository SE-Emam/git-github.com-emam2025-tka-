import * as React from 'react';
import { Navbar, GlassCard } from '@/src/components/common/Layout';
import { motion } from 'motion/react';
import { Target, Eye, Rocket, Brain, CheckCircle2, Search, Medal, Quote } from 'lucide-react';
import { useCMSData } from '@/src/services/cmsService';
import { useLanguage } from '@/src/context/LanguageContext';

export default function About() {
  const { data: aboutCMS } = useCMSData('about', {
    ceoMessage: "We don't just teach your children programming... we grant them the language of leadership in the world of the future.",
    ceoName: "Ahmed Ali",
    ceoRole: "Executive Director",
    ceoBio: "Over 15 years of experience in educational management and technology leads our vision.",
    ceoPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80"
  });
  const { t, isRtl } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-primary/30">
      <Navbar />
      
      {/* Hero Content / Who We Are */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display font-bold mb-6 text-slate-900 dark:text-white">
              {t('whoWeAre')}
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl mx-auto mb-4">
              {t('aboutDesc1')}
            </p>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl mx-auto">
              {t('aboutDesc2')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vision and Mission */}
      <section className="pb-16 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <GlassCard neon variant="primary" className="p-10">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
              <Eye size={28} />
            </div>
            <h3 className="text-xl md:text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">{t('vision')}</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('visionDesc')}
            </p>
          </GlassCard>

          <GlassCard neon variant="secondary" className="p-10">
            <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-6">
              <Target size={28} />
            </div>
            <h3 className="text-xl md:text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">{t('missionH')}</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('missionDesc')}
            </p>
          </GlassCard>
        </div>
      </section>

      {/* Strategic Objectives */}
      <section className="py-16 px-4 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">{t('ourStrategicObj')}</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Brain size={24} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('obj1Title')}</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{t('obj1Desc')}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                <Rocket size={24} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('obj2Title')}</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{t('obj2Desc')}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                <Medal size={24} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('obj3Title')}</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{t('obj3Desc')}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                <Search size={24} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('obj4Title')}</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{t('obj4Desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CEO's Message */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <GlassCard neon variant="primary" className="relative overflow-hidden p-8 md:p-12 border-none bg-slate-900/95 text-white">
            <Quote className="absolute top-8 right-8 w-32 h-32 text-white/5" />
            
              <div className={`relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start ${isRtl ? 'md:text-right text-right' : 'md:text-left text-left'}`}>
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full shrink-0 overflow-hidden border-4 border-white/10 shadow-xl bg-slate-700">
                    <img 
                      src={aboutCMS.ceoPhoto || "/ceo.jpg"} 
                      alt={aboutCMS.ceoName || t('ceoName')} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://picsum.photos/seed/ceo/200/200";
                      }}
                    />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1 text-white">{aboutCMS.ceoName || t('ceoName')}</h2>
                  <p className="text-primary-light font-medium mb-6 uppercase tracking-wider text-sm">{aboutCMS.ceoRole || t('ceoTitle')}</p>
                  
                  <p className="text-xl md:text-2xl font-display font-medium text-white mb-6 italic leading-snug">
                    "{aboutCMS.ceoMessage || t('ceoMessageFallback')}"
                  </p>
                  
                  <div className="space-y-4 text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-line">
                    <p>{aboutCMS.ceoBio || (t('ceoBio1') + '\n' + t('ceoBio2'))}</p>
                  </div>
                </div>
              </div>
          </GlassCard>
        </div>
      </section>

    </div>
  );
}

