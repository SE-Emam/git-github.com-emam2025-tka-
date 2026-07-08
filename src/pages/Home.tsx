import * as React from "react";
import { motion } from "motion/react";
import { GlassCard, GlassButton, Navbar } from "@/src/components/common/Layout";
import {
  Code2,
  BrainCircuit,
  LayoutDashboard,
  ArrowRight,
  Phone,
  Mail,
  MessageCircle,
  Facebook,
  Star,
  Quote,
  ShieldCheck,
  CheckCircle2,
  Users,
} from "lucide-react";
import { WhatsAppSupportButton } from "../components/whatsapp/WhatsAppSupportButton";
import { cn } from "@/src/lib/utils";
import { useNavigate } from "react-router-dom";
import { useCMSData } from "@/src/services/cmsService";
import { useLanguage } from "@/src/context/LanguageContext";
import PWAInstallButton from "@/src/components/common/PWAInstallButton";

export default function Home() {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();

  const courses = [
    {
      id: "ai-foundations",
      title: t("homeCourse1Title"),
      desc: t("homeCourse1Desc"),
      icon: BrainCircuit,
      color: "from-primary to-blue-600",
    },
    {
      id: "web-dev",
      title: t("homeCourse2Title"),
      desc: t("homeCourse2Desc"),
      icon: Code2,
      color: "from-secondary to-orange-500",
    },
    {
      id: "data-bi",
      title: t("homeCourse3Title"),
      desc: t("homeCourse3Desc"),
      icon: LayoutDashboard,
      color: "from-green-500 to-emerald-700",
    },
  ];

  const testimonials = [
    {
      id: 1,
      name: isRtl ? "أحمد كمال" : "Ahmed Kamal",
      role: isRtl ? "ولي أمر متدرب" : "Parent of a Trainee",
      text: isRtl
        ? "الأكاديمية وفرت بيئة ممتازة لابني لتعلم البرمجة من الصفر. لاحظت تطوراً كبيراً في قدرته على التفكير المنطقي."
        : "The academy provided an excellent environment for my son to learn programming from scratch. I noticed a huge improvement in his logical thinking.",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?u=1",
    },
    {
      id: 2,
      name: isRtl ? "مريم السيد" : "Maryam El-Sayed",
      role: isRtl ? "طالبة في مسار الذكاء الاصطناعي" : "Student in AI Path",
      text: isRtl
        ? "الكورسات مبسطة وعملية جداً. المشاريع التي طبقناها أعطتني ثقة كبيرة لدخول مجال التكنولوجيا."
        : "The courses are very simplified and practical. The projects we applied gave me great confidence to enter the tech field.",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?u=2",
    },
    {
      id: 3,
      name: isRtl ? "خالد مصطفى" : "Khaled Moustafa",
      role: isRtl ? "طالب في مسار تطوير الويب" : "Student in Web Dev",
      text: isRtl
        ? "المنصة ممتازة جداً والدعم الفني متواجد دائماً لحل أي مشكلة. استفدت جداً من الكورسات والتطبيق العملي."
        : "The platform is excellent and tech support is always available. I benefited greatly from the practical application.",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?u=3",
    },
  ];

  const defaultStats = [
    { label: t("statGrads"), val: "2,500+" },
    { label: t("statSuccess"), val: "94%" },
    { label: t("statPartners"), val: "120+" },
    { label: t("statGroups"), val: "45" },
  ];

  // Load dynamic CMS data
  const { data: homeCMS } = useCMSData("home", {
    stats: defaultStats,
  });

  const displayStats = homeCMS?.stats || defaultStats;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      {/* Hero Section - Optimized for Conversion */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden max-w-[100vw]">
        {/* Abstract Glassmorphism Backgrounds */}
        <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 dark:from-primary/10 dark:to-transparent pointer-events-none" />
        <div className="absolute top-20 -left-40 w-[400px] h-[400px] bg-primary/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none animate-float" />
        <div
          className="absolute bottom-10 -right-40 w-[500px] h-[500px] bg-gold/15 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none animate-float"
          style={{ animationDelay: "2s" }}
        />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10 w-full">
          {/* Left Content */}
          <div className="flex flex-col text-center lg:text-start relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 self-center lg:self-start inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm text-primary text-sm font-semibold tracking-wide uppercase shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {t("heroTag")}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="font-display font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.15]"
            >
              {t("heroTitle")} <br />
              <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent block mt-3 pb-2">
                {t("heroTitleHighlight")}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="max-w-xl mx-auto lg:mx-0 text-slate-600 text-lg md:text-xl mb-10 leading-relaxed dark:text-slate-400 font-medium"
            >
              {t("heroDesc")}
            </motion.p>

            {/* Primary Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-10"
            >
              <GlassButton
                variant="primary"
                onClick={() => navigate("/apply/student")}
                className="py-4 px-10 text-lg font-black w-full sm:w-auto shadow-xl shadow-primary/30 group"
              >
                {t("register")}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform rtl:rotate-180 rtl:group-hover:-translate-x-1 rtl:group-hover:translate-x-0 rtl:ml-0 rtl:mr-2" />
              </GlassButton>
              <GlassButton
                variant="secondary"
                onClick={() => navigate("/courses")}
                className="py-4 px-8 text-lg font-bold w-full sm:w-auto"
              >
                {t("courses")}
              </GlassButton>
            </motion.div>

            {/* Micro Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center lg:justify-start gap-4 text-sm font-medium text-slate-500 dark:text-slate-400"
            >
              <div className="flex -space-x-3 rtl:space-x-reverse">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    src={`https://i.pravatar.cc/100?img=${i}`}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 object-cover"
                  />
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex text-gold">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <span>
                  {isRtl ? "+2,500 متدرب سعيد" : "2,500+ Happy Students"}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Right Content - Visuals */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="hidden lg:flex relative w-full h-[600px] items-center justify-center"
          >
            {/* Main Glass Image Container */}
            <div className="relative w-[450px] h-[550px] rounded-[40px] border border-white/40 bg-white/20 backdrop-blur-2xl shadow-2xl p-4 overflow-hidden z-20">
              <img
                src="https://storage.googleapis.com/ais-cloud-run-public-assets/erwblndzz7wpwtdr4pi256/67f707f1-bdeb-4f81-ba55-90033ad881ff.png"
                alt="TKA Youth"
                className="w-full h-full object-cover rounded-[28px]"
              />

              {/* Floating Element 1 */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -left-12 top-20 bg-white/90 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl p-4 flex items-center gap-4 dark:bg-slate-900/80"
              >
                <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    {isRtl ? "شهادات معتمدة" : "Certified"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {isRtl ? "من الأكاديمية" : "By Academy"}
                  </p>
                </div>
              </motion.div>

              {/* Floating Element 2 */}
              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute -right-8 bottom-32 bg-white/90 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl p-4 flex items-center gap-4 dark:bg-slate-900/80"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Users size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    2,500+
                  </p>
                  <p className="text-xs text-slate-500">
                    {isRtl ? "خريج ناجح" : "Graduates"}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Background Decorators */}
            <div className="absolute top-10 right-0 w-32 h-32 border-[20px] border-secondary/20 rounded-full blur-sm" />
            <div className="absolute bottom-10 left-10 w-24 h-24 border-[15px] border-primary/20 rounded-full blur-sm" />
          </motion.div>
        </div>
      </section>

      {/* Hero Featured Programs Summary Cards */}
      <section className="relative px-4 max-w-7xl mx-auto -mt-16 lg:-mt-10 z-30 mb-24">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Tech Makers Scholarship Card */}
          <GlassCard
            neon
            variant="primary"
            className="p-6 md:p-8 flex flex-col h-full"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-primary/10 text-primary dark:text-primary-light text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                {t("scholarship")}
              </span>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
                {t("ages")}
              </span>
            </div>
            <h2 className="font-display font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              {isRtl ? "تِك ميكرز" : "Tech Makers"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8 flex-1">
              {t("scholarshipDesc")}
            </p>
            <div className="flex gap-4">
              <GlassButton
                onClick={() => navigate("/scholarship")}
                variant="primary"
                className="w-full justify-center"
              >
                {t("viewPath")}
              </GlassButton>
            </div>
          </GlassCard>

          {/* Techno Math Program Card */}
          <GlassCard
            neon
            variant="primary"
            className="p-8 flex flex-col h-full"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                {t("mentalMath")}
              </span>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
                {t("ages")}
              </span>
            </div>
            <h2 className="font-display font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              {t("technoMath")}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8 flex-1">
              {t("technoMathDesc")}
            </p>
            <div className="flex gap-4">
              <GlassButton
                onClick={() => navigate("/techno-math")}
                className="w-full justify-center"
              >
                {t("viewLevels")}
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {displayStats.map((stat: any, i: number) => (
            <GlassCard
              key={i}
              neon
              variant="primary"
              className="text-center group border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all duration-500 overflow-visible"
            >
              <div className="text-4xl font-black text-slate-900 dark:text-white mb-2 group-hover:scale-110 transition-transform">
                {stat.val}
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
                {stat.label}
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Testimonials Section (Social Proof) */}
      <section className="py-24 px-4 max-w-7xl mx-auto relative z-20">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/20 bg-gold/10 text-gold-dark font-semibold tracking-wide text-xs uppercase"
          >
            <Star className="w-3 h-3" fill="currentColor" />
            {isRtl ? "تجارب المتدربين" : "Student Success"}
          </motion.div>
          <h2 className="text-3xl font-black mb-4 dark:text-white">
            {isRtl ? "ماذا يقولون عنا؟" : "What Our Students Say"}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="h-full flex flex-col hover:border-gold/30 hover:shadow-gold/10 group">
                <Quote className="w-10 h-10 text-slate-200 dark:text-slate-800 absolute top-4 right-4 rtl:left-4 rtl:right-auto -z-10 group-hover:text-gold/20 transition-colors" />
                <div className="flex gap-1 text-gold mb-6">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed mb-8 flex-1 text-sm md:text-base">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {t.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t.role}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-24 px-4 max-w-7xl mx-auto border-t border-slate-200/50 dark:border-slate-800/50">
        {/* Prominent App Install Section for Visitors */}
        <div className="mb-24">
          <GlassCard
            neon
            variant="gold"
            className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10 bg-gradient-to-br from-amber-50 to-white dark:from-slate-900 dark:to-slate-950 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/20 blur-3xl rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-700" />
            <div className="flex-1 space-y-4 relative z-10 text-center md:text-start">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                {t("appExperienceTitle")}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-medium max-w-2xl">
                {t("appExperienceDesc")}
              </p>
            </div>
            <div className="shrink-0 relative z-10">
              <PWAInstallButton />
            </div>
          </GlassCard>
        </div>

        <div className="text-center mb-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary font-semibold tracking-wide text-xs uppercase"
          >
            {isRtl ? "المسارات التعليمية" : "Learning Paths"}
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-black mb-4 dark:text-white">
            {t("popularPrograms")}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium text-lg">
            {t("popularProgramsDesc")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard
                className="flex flex-col h-full hover:border-primary/40 hover:shadow-primary/10 transition-all duration-300 group overflow-hidden bg-white/50 dark:bg-slate-900/50"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors -z-10" />
                <div
                  className={cn(
                    "w-16 h-16 rounded-2xl mb-8 flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300",
                    course.color,
                  )}
                >
                  <course.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-primary transition-colors">{course.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-8 flex-grow leading-relaxed font-medium">
                  {course.desc}
                </p>
                <GlassButton
                  variant="primary"
                  onClick={() => navigate(`/course/${course.id}`)}
                  className="w-full text-sm font-bold py-3.5 group-hover:shadow-primary/20"
                >
                  {t("viewMore")} <ArrowRight className="w-4 h-4 ml-1 rtl:rotate-180" />
                </GlassButton>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 px-4 py-16 mt-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 text-slate-900 dark:text-slate-100">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4 text-xl font-bold font-display">
              <img
                src="/logo-light.png"
                alt="TKA Logo Light"
                className="h-8 w-auto dark:hidden"
                referrerPolicy="no-referrer"
              />
              <img
                src="/logo-dark.png"
                alt="TKA Logo Dark"
                className="h-8 w-auto hidden dark:block"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6 text-sm max-w-sm">
              {t("mission")}
            </p>
            <div className="flex gap-3">
              <GlassButton className="p-2 w-9 h-9 rounded-full">
                <Phone className="w-4 h-4" />
              </GlassButton>
              <GlassButton className="p-2 w-9 h-9 rounded-full">
                <Mail className="w-4 h-4" />
              </GlassButton>
              <a
                href="https://www.facebook.com/TKA.Egypt/"
                target="_blank"
                rel="noreferrer"
              >
                <GlassButton className="p-2 w-9 h-9 rounded-full text-blue-600 border-blue-200">
                  <Facebook className="w-4 h-4" />
                </GlassButton>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-slate-900 dark:text-white text-sm uppercase tracking-wide">
              {t("contactUs")}
            </h4>
            <div className="flex flex-col gap-3 text-slate-500 dark:text-slate-400 text-xs">
              <span className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary shrink-0" />{" "}
                <span dir="ltr">01062540164</span> ({t("whatsappOnly")})
              </span>
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-secondary shrink-0" />{" "}
                info@tka-egypt.com
              </span>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-slate-900 dark:text-white text-sm uppercase tracking-wide">
              {t("newsletter")}
            </h4>
            <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder={t("emailPlaceholder")}
                className="bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-xs focus:outline-none focus:border-primary transition-colors"
              />
              <GlassButton
                variant="primary"
                className="py-2 text-xs rounded-lg select-none hover:scale-105 active:scale-95 transition-all"
              >
                {t("subscribe")}
              </GlassButton>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
