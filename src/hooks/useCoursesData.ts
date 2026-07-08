import { useState, useEffect } from 'react';
import { useLanguage } from '@/src/context/LanguageContext';
import { getCoursesFromSQL } from '@/src/services/hybridApiService';
import { 
  Bot, Code2, Terminal, BarChart, PenTool, Share2, 
  Cpu, Briefcase, Monitor, LayoutTemplate, 
  Brain, Laptop, Rocket, Wand2, Calculator, Microscope
} from 'lucide-react';

const iconDictionary: Record<string, any> = {
  Bot, Code2, Terminal, BarChart, PenTool, Share2, 
  Cpu, Briefcase, Monitor, LayoutTemplate, 
  Brain, Laptop, Rocket, Wand2, Calculator, Microscope
};

export const useCoursesData = () => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const [sqlPathsData, setSqlPathsData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const sqlData = await getCoursesFromSQL();
        if (isMounted) {
          if (sqlData && sqlData.length > 0) {
            const mappedData = sqlData.map((cat: any) => ({
              ...cat,
              category: isAr ? (cat.category_ar || cat.category) : (cat.category_en || cat.category),
              description: isAr ? (cat.description_ar || cat.description) : (cat.description_en || cat.description),
              items: cat.items.map((item: any) => ({
                ...item,
                title: isAr ? (item.title_ar || item.title) : (item.title_en || item.title),
                brief: isAr ? (item.brief_ar || item.brief) : (item.brief_en || item.brief),
                details: isAr ? (item.details_ar || item.details) : (item.details_en || item.details),
                icon: iconDictionary[item.icon] || Laptop
              }))
            }));
            setSqlPathsData(mappedData);
          } else {
            setSqlPathsData(null);
          }
        }
      } catch (err) {
        console.error("Error loading courses from DB, using fallback:", err);
        if (isMounted) setSqlPathsData(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCourses();
    return () => { isMounted = false; };
  }, [language]);

  // Hardcoded fallback data computed every render to stay reactive to language
  const hardcodedPathsData = [
    {
      categoryId: 'ai-smart-productivity',
      category: isAr ? "I. الذكاء الاصطناعي والإنتاجية الذكية" : "I. Artificial Intelligence & Smart Productivity",
      description: isAr ? "تسخير التكنولوجيا لخدمة أهدافك اليومية والمهنية." : "Harness technology to serve your daily and professional goals.",
      items: [
        { 
          id: 'icdl-ai', 
          title: isAr ? "الرخصة الدولية المدمجة بالذكاء الاصطناعي" : "ICDL + AI Foundations", 
          brief: isAr ? "ابدأ رحلتك التقنية من الصفر مع مقدمة في الذكاء الاصطناعي." : "Start your tech journey from scratch with an introduction to AI.",
          details: isAr ? "كسر حاجز الخوف من التكنولوجيا، إتقان إنتاج التقارير والعروض بتوظيف أدوات الذكاء الاصطناعي لتوفير الوقت والجهد." : "Break the fear barrier of technology, master MS Office using modern techniques, and prepare professional reports in minutes using AI.",
          duration: isAr ? "38 ساعة" : "38 Hours", 
          color: "bg-blue-500",
          icon: Laptop,
          learningOutcomes: isAr 
            ? ["إتقان برامج الأوفيس", "فهم أساسيات الذكاء الاصطناعي", "إنشاء عروض تقديمية احترافية بسرعة"] 
            : ["Master MS Office suite", "Understand AI basics", "Create professional presentations rapidly"]
        },
        { 
          id: 'ai-foundations', 
          title: isAr ? "أساسيات الذكاء الاصطناعي" : "AI Foundations", 
          brief: isAr ? "ادخل عالم الذكاء الاصطناعي واستخدم أدواته في العمل والدراسة." : "Enter the world of AI and use its tools for study and work.",
          details: isAr ? "تعلم كيفية استغلال أدوات الذكاء الاصطناعي لتأدية المهام اليومية وتعزيز الإنتاجية." : "Learn how to leverage AI tools for daily tasks and productivity enhancement.",
          duration: isAr ? "28 ساعة" : "28 Hours", 
          color: "bg-purple-500",
          icon: Brain,
          learningOutcomes: isAr 
            ? ["التعامل مع نماذج اللغات الكبيرة", "هندسة الأوامر (Prompt Engineering)", "تحسين الإنتاجية اليومية"] 
            : ["Interact with LLMs", "Master Prompt Engineering", "Enhance daily productivity"]
        },
        { 
          id: 'local-ai', 
          title: isAr ? "بناء مساعدك الذكي المحلي" : "Build Your Local AI Assistant", 
          brief: isAr ? "اكسر قيود الإنترنت وأنشئ مساعدك الخاص محلياً على جهازك." : "Create a private smart assistant that works locally without internet.",
          details: isAr ? "أنشئ مساعدك الذكي الخاص الذي يعمل محلياً دون الحاجة للاتصال بالإنترنت مع ضمان الخصوصية التامة للبيانات." : "Understand how LLMs function locally. Install and configure tools to run AI on personal computers with absolute privacy.",
          duration: isAr ? "22 ساعة" : "22 Hours", 
          color: "bg-green-500",
          icon: Cpu,
          learningOutcomes: isAr
            ? ["تثبيت النماذج محلياً", "ضمان أمن البيانات", "استخدام الذكاء الاصطناعي بدون إنترنت"]
            : ["Install models locally", "Ensure data privacy", "Use AI without internet connection"]
        }
      ]
    },
    {
      categoryId: 'software-web-development',
      category: isAr ? "II. هندسة البرمجيات والتطوير" : "II. Programming & Web Development",
      description: isAr ? "تعلم لغة العصر وابدأ في بناء حلول برمجية خاصة بك." : "Learn the language of the age and start building your own software solutions.",
      items: [
        { 
          id: 'py-beg', 
          title: isAr ? "برمجة بايثون (مبتدئ)" : "Python Programming (Beginner)", 
          brief: isAr ? "تعلم برمجة بايثون من الصفر بطريقة عملية." : "Learn Python programming from scratch using a practical approach.",
          details: isAr ? "تأسيس التفكير المنطقي وحل المشكلات برمجياً وبناء نصوص الأتمتة للمهام المتكررة." : "Establish logical thinking and programmatic Problem Solving. Build automation scripts for repetitive tasks.",
          duration: isAr ? "22 ساعة" : "22 Hours", 
          color: "bg-teal-500",
          icon: Terminal,
          learningOutcomes: isAr
            ? ["أساسيات بايثون", "الخوارزميات وحل المشكلات", "أتمتة المهام البسيطة"]
            : ["Python fundamentals", "Algorithms and Problem Solving", "Basic task automation"]
        },
        { 
          id: 'py-adv', 
          title: isAr ? "برمجة بايثون (متقدم)" : "Python Programming (Advanced)", 
          brief: isAr ? "بناء تطبيقات ومشاريع احترافية باستخدام بايثون." : "Building professional applications and projects using Python.",
          details: isAr ? "إتقان البرمجة الكائنية (OOP) والتعامل مع قواعد البيانات لبناء تطبيقات واقعية للتأهيل لسوق العمل." : "Master Object-Oriented Programming (OOP) and handle databases to build real-world applications.",
          duration: isAr ? "28 ساعة" : "28 Hours", 
          color: "bg-amber-500",
          icon: Rocket,
          learningOutcomes: isAr
            ? ["البرمجة الكائنية OOP", "الاتصال بقواعد البيانات", "تطوير تطبيقات مكتبية أو ويب بسيطة"]
            : ["Object-Oriented Programming (OOP)", "Database Connections", "Develop desktop and simple web apps"]
        },
        { 
          id: 'web-dev', 
          title: isAr ? "تطوير الويب" : "Web Development", 
          brief: isAr ? "تصميم وتطوير مواقع الويب (HTML, CSS, JavaScript)." : "Designing and developing websites (HTML, CSS, JavaScript).",
          details: isAr ? "الإتقان الاحترافي لـ Markup Languages وإضافة التفاعل باستخدام JS لبناء مواقع شخصية متكاملة." : "Professional mastery of markup languages. Add interactivity with JS to build complete personal websites or Landing Pages.",
          duration: isAr ? "28 ساعة" : "28 Hours", 
          color: "bg-orange-500",
          icon: Code2,
          learningOutcomes: isAr
            ? ["تصميم المواقع وتجاوبها", "التعامل مع HTML و CSS", "إضافة التفاعل بواجهة الموقع بواسطة JS"]
            : ["Responsive web design", "HTML and CSS mastery", "Interactive interfaces via JS"]
        },
        { 
          id: 'wp-dev', 
          title: isAr ? "تطوير ووردبريس" : "WordPress Development", 
          brief: isAr ? "انشاء المواقع الالكترونية المتكاملة بدون الحاجة للبرمجة." : "Creating full websites without the need for programming.",
          details: isAr ? "تعلم بناء وإدارة مواقع إلكترونية متكاملة باستخدام قوالب وإضافات ووردبريس." : "Learn to build and manage complete, functional websites using WordPress themes and plugins.",
          duration: isAr ? "24 ساعة" : "24 Hours", 
          color: "bg-cyan-600",
          icon: LayoutTemplate,
          learningOutcomes: isAr
            ? ["إعداد ووردبريس وتثبيته", "التعامل مع القوالب الإضافات", "إنشاء مدونات ومتاجر إلكترونية"]
            : ["WordPress setup and install", "Themes and Plugins management", "Build blogs and e-commerce stores"]
        }
      ]
    },
    {
      categoryId: 'data-digital-management',
      category: isAr ? "III. إدارة البيانات والتحول الرقمي" : "III. Data & Digital Management",
      description: isAr ? "للمديرين ومحللي البيانات الساعين للتميز." : "For managers, accountants, and data analysts striving for excellence.",
      items: [
        { 
          id: 'data-bi', 
          title: isAr ? "تحليل البيانات (Power BI)" : "Data Analysis (Power BI)", 
          brief: isAr ? "تحليل البيانات واستخراج تقارير تفاعلية احترافية." : "Data analysis and creating professional interactive reports.",
          details: isAr ? "ربط البيانات من مصادرها، تنظيفها، وتصميم لوحات تحكم (Dashboards) لمراقبة الأداء." : "Connect data from sources, clean it, and design professional dashboards to monitor performance in real-time.",
          duration: isAr ? "26 ساعة" : "26 Hours", 
          color: "bg-amber-700",
          icon: BarChart,
          learningOutcomes: isAr
            ? ["تنظيف وتحليل البيانات", "بناء تقارير تفاعلية بلوحات المراقبة", "تحليل الأعمال ودعم اتخاذ القرار"]
            : ["Data cleaning and analysis", "Interactive dashboard reports", "Business analytics and decision support"]
        },
        { 
          id: 'mgmt-ai', 
          title: isAr ? "الإدارة والمحاسبة بالذكاء الاصطناعي" : "Management & Accounting via AI", 
          brief: isAr ? "دمج العمل الإداري بأدوات الذكاء الاصطناعي." : "Merge administrative workflows with modern AI tools.",
          details: isAr ? "أتمتة القيود المحاسبية، وتوليد التقارير المالية لبناء نظام إداري ذكي." : "Automate accounting entries and financial reports. Build a smart administrative system reducing manual effort significantly.",
          duration: isAr ? "يحدد لاحقاً" : "TBD", 
          color: "bg-slate-600",
          icon: Briefcase,
          learningOutcomes: isAr
            ? ["استخدام الذكاء الاصطناعي في الأعمال", "أتمتة المحاسبة وإدارة الأرقام", "تقليص الأخطاء اليدوية"]
            : ["Implement AI in business tasks", "Automate accounting tasks", "Reduce manual errors"]
        }
      ]
    },
    {
      categoryId: 'creativity-digital-marketing',
      category: isAr ? "IV. الإبداع والتسويق الرقمي" : "IV. Creativity & Digital Marketing",
      description: isAr ? "اصنع هويتك البصرية وسوّق لها باحترافية." : "Create your visual identity and market it professionally.",
      items: [
        { 
          id: 'gd-beg', 
          title: isAr ? "التصميم الجرافيكي (مبتدئ)" : "Graphic Design (Beginner)", 
          brief: isAr ? "تعلم أساسيات التصميم الجرافيكي من الألف للياء." : "Learn the fundamentals of graphic design from the ground up.",
          details: isAr ? "إتقان أدوات التصميم العالمية وفهم سيكولوجية الألوان والخطوط." : "Master global design tools (Photoshop, Illustrator) and understand color and font psychology.",
          duration: isAr ? "20 ساعة" : "20 Hours", 
          color: "bg-fuchsia-500",
          icon: PenTool,
          learningOutcomes: isAr
            ? ["أساسيات الفوتوشوب والاليستريتور", "نظرية الألوان والخطوط", "تصميمات المطبوعات البسيطة"]
            : ["Photoshop and Illustrator basics", "Color and typography theory", "Basic print designs"]
        },
        { 
          id: 'gd-adv', 
          title: isAr ? "التصميم الجرافيكي (متقدم)" : "Graphic Design (Advanced)", 
          brief: isAr ? "احتراف بناء الهوية البصرية وتصاميم السوشيال ميديا." : "Mastering visual identity and social media designs.",
          details: isAr ? "تصميم الشعارات وملفات الشركات وبناء معرض أعمال قوي (Portfolio)." : "Design logos, company profiles, and build a strong portfolio qualifying you as a Freelancer.",
          duration: isAr ? "24 ساعة" : "24 Hours", 
          color: "bg-rose-500",
          icon: Wand2,
          learningOutcomes: isAr
            ? ["تصميم الشعارات والهويات البصرية الكاملة", "تصاميم السوشيال ميديا الإحترافية", "بناء Portfolio مميز للعمل الحر"]
            : ["Logo and Full Visual Identity design", "Professional Social Media graphics", "Build a strong Freelance Portfolio"]
        },
        { 
          id: 'smm-ads', 
          title: isAr ? "السوشيال ميديا والإعلانات" : "Social Media & Ads", 
          brief: isAr ? "إدارة المنصات وإطلاق الحملات الإعلانية الناجحة." : "Managing platforms and launching successful advertising campaigns.",
          details: isAr ? "دراسة خوارزميات المنصات، والاستهداف الدقيق، وإدارة الصفحات بنمو حقيقي." : "Study platform algorithms, target audiences precisely, and manage business pages with real growth.",
          duration: isAr ? "20 ساعة" : "20 Hours", 
          color: "bg-pink-500",
          icon: Share2,
          learningOutcomes: isAr
            ? ["إدارة الإعلانات الممولة (Meta, TikTok)", "فهم خوارزميات الاستهداف والميزانية", "تحسين الحملات وتحليل النتائج"]
            : ["Manage paid social campaigns", "Understand precision targeting algorithms", "Analyze and optimize performance metrics"]
        }
      ]
    },
    {
      categoryId: 'advanced-ai-engineering',
      category: isAr ? "V. الأتمتة وهندسة الذكاء الاصطناعي المتقدمة" : "V. Automation & Advanced AI Engineering",
      description: isAr ? "للمهتمين ببناء أنظمة تعمل نيابة عن البشر ومستقبل الأتمتة." : "For those interested in building systems that work on behalf of humans.",
      items: [
        { 
          id: 'ai-adv', 
          title: isAr ? "الذكاء الاصطناعي المتقدم والأتمتة" : "AI Advanced: Agents & Automation", 
          brief: isAr ? "بناء الأنظمة الذكية وأتمتة الأعمال." : "Building smart systems (AI Agents) and business automation.",
          details: isAr ? "تصميم الوكلاء الأذكياء (Agents) للرد على العملاء وإدارة العمليات تلقائياً." : "Design intelligent agents that respond to customers and manage operations automatically.",
          duration: isAr ? "38 ساعة" : "38 Hours", 
          color: "bg-rose-600",
          icon: Bot,
          learningOutcomes: isAr
            ? ["بناء وكالات ذكاء اصطناعي", "برمجة الـ AI Chatbots القوية", "التعامل مع الـ APIs والذكاء الاصطناعي كواجهة"]
            : ["Build AI Agentic workflows", "Develop robust AI Chatbots", "Interact with AI Programmatic Interfaces (APIs)"]
        },
        { 
          id: 'n8n-auto', 
          title: isAr ? "هندسة الذكاء والأتمتة (n8n)" : "AI Engineering & Automation (n8n)", 
          brief: isAr ? "بناء أنظمة متكاملة لربط التطبيقات ببعضها." : "Building smart automation systems by connecting tools with n8n.",
          details: isAr ? "بناء أتمتة توفر آلاف الساعات من العمل اليدوي وتعلم العمل كمستشار أتمتة (Automation Consultant)." : "Build automated workflows saving thousands of hours of manual work. Learn to work as an Automation Consultant.",
          duration: isAr ? "30 ساعة" : "30 Hours", 
          color: "bg-yellow-600",
          icon: Microscope,
          learningOutcomes: isAr
            ? ["احتراف بيئة n8n للأتمتة", "ربط الأنظمة مثل CRM، و الإيميلات بقواعد البيانات", "تطوير سير عمل معقد يحاكي العقل البشري"]
            : ["Master n8n workflow environment", "Connect external tools (CRM, Mail, DB)", "Develop complex human-like automations"]
        }
      ]
    },
    {
      categoryId: 'foundational-skills',
      category: isAr ? "VI. المهارات التأسيسية والمعرفية" : "VI. Foundational & Cognitive Skills",
      description: isAr ? "تطوير المرونة الذهنية والقدرات المعرفية لشبابنا." : "Developing the mental agility and cognitive abilities of our youth.",
      items: [
        { 
          id: 'techno-math', 
          title: isAr ? "تكنو ماث (الحساب الذهني)" : "Techno Math (Mental Arithmetic)", 
          brief: isAr ? "برنامج تدريبي متخصص للأطفال من 8 إلى 15 سنة لتطوير مهارات الحساب الذهني." : "A specialized training program for children ages 8–15 to develop mental arithmetic skills.",
          details: isAr ? "يتدرج من أساسيات العداد (Abacus) إلى التخيل الذهني الاحترافي والسرعة على مدار عام." : "Progresses from Abacus basics to professional mental visualization and speed over the course of one year.",
          duration: isAr ? "12 شهراً" : "12 Months", 
          color: "bg-indigo-500",
          icon: Calculator,
          learningOutcomes: isAr
            ? ["إتقان المعداد (Abacus)", "الحساب الذهني الاحترافي السريع", "تحسين الذاكرة وتخيل الأرقام"]
            : ["Master the physical Abacus", "High-speed mental arithmetic", "Improve memory and visual representation"]
        }
      ]
    }
  ];

  const pathsData = sqlPathsData && sqlPathsData.length > 0 ? sqlPathsData : hardcodedPathsData;

  return { pathsData, isAr, t, loading };
};
