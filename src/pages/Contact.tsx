import * as React from 'react';
import { Navbar, GlassCard, GlassButton } from '@/src/components/common/Layout';
import { Phone, Mail, MapPin, Send, MessageCircle, Headphones, Headset } from 'lucide-react';
import { useLanguage } from '@/src/context/LanguageContext';

export default function Contact() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
            <div>
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-slate-900 dark:text-white leading-tight">{t('getInTouch')}</h1>
                <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg mb-12">
                    {t('getInTouchDesc')}
                </p>

                <div className="space-y-8">
                   <div className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><MessageCircle /></div>
                      <div className="flex-1 flex justify-between items-center pr-4 md:pr-0">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{t('whatsappTitle')}</p>
                          <p className="text-slate-600 dark:text-slate-400">01062540164</p>
                          <p className="text-xs text-red-500 font-bold mt-1">{t('whatsappOnly')}</p>
                        </div>
                        <a href="https://wa.me/201062540164" target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 mt-2 md:mt-0 rounded-lg text-sm font-bold hover:bg-[#1ebe5d] transition-colors shadow-lg shadow-[#25D366]/20">
                           <Headset size={16} /> دعم فني
                        </a>
                      </div>
                   </div>
                   <div className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0"><Mail /></div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{t('emailSupport')}</p>
                        <p className="text-slate-600 dark:text-slate-400">info@tka-egypt.com</p>
                      </div>
                   </div>
                   <div className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0"><MapPin /></div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{t('headquarters')}</p>
                        <p className="text-slate-600 dark:text-slate-400">{t('message') === 'الرسالة' ? 'القرية الذكية، الجيزة، مصر' : 'Smart Village, Giza, Egypt'}</p>
                      </div>
                   </div>
                </div>
            </div>

              <GlassCard neon variant="primary" className="p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                   <div className="grid grid-cols-2 gap-4 text-slate-900 dark:text-slate-100">
                      <div className="space-y-1">
                         <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{t('firstName')}</label>
                         <input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:border-primary focus:outline-none" placeholder={t('message') === 'الرسالة' ? 'أحمد' : 'John'} />
                      </div>
                      <div className="space-y-1">
                         <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{t('lastName')}</label>
                         <input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:border-primary focus:outline-none" placeholder={t('message') === 'الرسالة' ? 'محمد' : 'Doe'} />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4 text-slate-900 dark:text-slate-100">
                      <div className="space-y-1">
                          <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{t('emailAddress')}</label>
                          <input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:border-primary focus:outline-none" placeholder={t('message') === 'الرسالة' ? 'ahmed@example.com' : 'john@example.com'} />
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">رقم الهاتف / Phone Number</label>
                          <input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:border-primary focus:outline-none" placeholder="01XXXXXXXXX" />
                      </div>
                   </div>
                   <div className="space-y-1 text-slate-900 dark:text-slate-100">
                      <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">غرض التواصل / Purpose</label>
                      <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:border-primary focus:outline-none">
                          <option value="reg_issue">مشكلة بالتسجيل / Registration Issue</option>
                          <option value="join_team">الانضمام لفريق العمل / Join Work Team</option>
                          <option value="job_search">بحث عن وظيفة / Job Search</option>
                          <option value="discount">خصم ومنح / Discount & Scholarship</option>
                          <option value="tech_issue">الدعم الفني / Technical Support</option>
                      </select>
                   </div>
                   <div className="space-y-1 text-slate-900 dark:text-slate-100">
                      <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{t('message')}</label>
                      <textarea className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 h-32 focus:border-primary focus:outline-none" placeholder={t('message') === 'الرسالة' ? 'كيف يمكننا المساعدة؟' : 'How can we help?'} />
                   </div>
                   <GlassButton variant="primary" className="w-full py-4 text-base font-bold text-white shadow-xl" icon={Send}>{t('sendMessage')}</GlassButton>
                </form>
            </GlassCard>
        </div>
      </section>
    </div>
  );
}
