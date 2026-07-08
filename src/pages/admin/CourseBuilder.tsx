import * as React from 'react';
import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import { GlassCard, GlassButton } from '@/src/components/common/Layout';
import { useAuth } from '@/src/context/AuthContext';
import { Save, Plus, Trash2, List, Settings, Clock, ArrowRight, ArrowLeft, LayoutTemplate } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { safeStringify } from '@/src/lib/safeStringify';
import { apiFetch } from '@/src/services/hybridApiService';

export default function CourseBuilder() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');

  const [saving, setSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // Basic Course Info
  const [courseTitle, setCourseTitle] = React.useState('');
  const [courseGoal, setCourseGoal] = React.useState('');
  const [expectedDuration, setExpectedDuration] = React.useState('');
  const [lectureDuration, setLectureDuration] = React.useState('ساعة تفاعلية (60 دقيقة)');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState(1);
  const [status, setStatus] = React.useState('active');

  // Curriculum definition (List of lectures)
  const [lectures, setLectures] = React.useState<any[]>([]);

  // Editor states
  const [activeLectureIndex, setActiveLectureIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (editId) {
      const fetchCourse = async () => {
        setLoading(true);
        try {
          const res = await apiFetch(`/courses.php?action=get_single&id=${editId}`);
          if (res.status === 'success') {
            const c = res.data;
            setCourseTitle(c.title);
            setCourseGoal(c.goal);
            setExpectedDuration(c.expected_duration);
            setLectureDuration(c.lecture_duration);
            setDescription(c.description);
            setCategory(parseInt(c.category_id));
            setLectures(c.curriculum || []);
            setStatus(c.status || 'active');
            if (c.curriculum?.length > 0) setActiveLectureIndex(0);
          }
        } catch (err) {
          console.error(err);
        }
        setLoading(false);
      };
      fetchCourse();
    }
  }, [editId]);

  const addLecture = () => {
    setLectures([
      ...lectures,
      {
        title: `المحاضرة ${lectures.length + 1}: `,
        objectives: [''],
        steps: [''],
        checklist: [''],
        resources: []
      }
    ]);
    setActiveLectureIndex(lectures.length);
  };

  const updateLecture = (index: number, key: string, value: any) => {
    const updated = [...lectures];
    updated[index][key] = value;
    setLectures(updated);
  };

  const updateArrayItem = (lecIdx: number, arrKey: string, arrIdx: number, value: string) => {
    const updated = [...lectures];
    updated[lecIdx][arrKey][arrIdx] = value;
    setLectures(updated);
  };

  const addArrayItem = (lecIdx: number, arrKey: string) => {
    const updated = [...lectures];
    if (!updated[lecIdx][arrKey]) updated[lecIdx][arrKey] = [];
    updated[lecIdx][arrKey].push('');
    setLectures(updated);
  };

  const removeArrayItem = (lecIdx: number, arrKey: string, arrIdx: number) => {
    const updated = [...lectures];
    updated[lecIdx][arrKey].splice(arrIdx, 1);
    setLectures(updated);
  };

  // Resources specifically (for PDF, Video, Image, Links)
  const addResource = (lecIdx: number) => {
    const updated = [...lectures];
    if (!updated[lecIdx].resources) updated[lecIdx].resources = [];
    updated[lecIdx].resources.push({ title: '', url: '', type: 'link' });
    setLectures(updated);
  };

  const updateResource = (lecIdx: number, resIdx: number, field: string, value: string) => {
    const updated = [...lectures];
    updated[lecIdx].resources[resIdx][field] = value;
    setLectures(updated);
  };

  const removeResource = (lecIdx: number, resIdx: number) => {
    const updated = [...lectures];
    updated[lecIdx].resources.splice(resIdx, 1);
    setLectures(updated);
  };

  const handleSaveCourse = async () => {
    if (!courseTitle) {
      alert("يرجى إدخال اسم المادة الدراسية.");
      return;
    }
    
    setSaving(true);
    try {
      const payload: any = {
        title: courseTitle,
        description: description,
        goal: courseGoal,
        expected_duration: expectedDuration,
        lectures_count: lectures.length,
        lecture_duration: lectureDuration,
        curriculum: lectures,
        category_id: category,
        status: status
      };

      if (editId) payload.id = editId;

      const action = editId ? 'update' : 'create';
      const res = await apiFetch(`/courses.php?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: safeStringify(payload)
      });
      
      if (res.status === 'success') {
        alert(editId ? "تم تحديث المقرر الدراسي بنجاح!" : "تم إنشاء المقرر الدراسي بنجاح!");
        navigate('/dashboard/admin');
      } else {
        alert("حدث خطأ أثناء الحفظ.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save the course.");
    }
    setSaving(false);
  };

  const handleSeedAICourse = () => {
     if(!confirm("هل أنت متأكد من تعبئة النموذج ببيانات دورة المساعد الذكي؟ سيتم مسح أي بيانات غير محفوظة.")) return;
     
     setCourseTitle("المساعد الذكي المُبرمج (Offline AI Assistant)");
     setDescription("دورة متقدمة لتعليم الأطفال الفئة العمرية (8-15) مفاهيم الذكاء الاصطناعي وبناء مساعد ذكي خاص بهم يعمل محلياً بدون إنترنت باستخدام بايثون ونماذج لغوية.");
     setCourseGoal("بنهاية هذا المعسكر التدريبي، سيتمكن المتدرب من إدراك مفاهيم الذكاء الاصطناعي، تشغيل نماذج لغوية (LLM) على جهازه محلياً وبناء مساعده الشخصي وبرمجته ليفهم الأوامر.");
     setExpectedDuration("شهرين (24 محاضرة تفاعلية)");
     setLectureDuration("ساعة تفاعلية (60 دقيقة)");
     
     const seededLectures = [
       {
         title: "المحاضرة 1: أساسيات الذكاء الاصطناعي وما هو المساعد الذكي",
         objectives: [
           "تفريق الطالب بين البرمجة العادية والذكاء الاصطناعي",
           "فهم مفهوم النماذج اللغوية (LLMs)",
           "تخيل شكل ومهمة المساعد الذي سيقوم بصنعه"
         ],
         steps: [
           "الترحيب وكسر الجليد (10 دقائق)",
           "لعبة تفاعلية: هل هذا ذكاء اصطناعي أم برمجة تقليدية؟ (15 دقيقة)",
           "شرح مبسط: كيف يتعلم الكمبيوتر (15 دقيقة)",
           "تحديد شخصية مساعد كل طالب (15 دقيقة)",
           "الختام وتوضيح مطلوبات اللقاء القادم"
         ],
         checklist: [
           "الطالب استطاع التمييز بين البرمجة الكلاسيكية والذكاء الاصطناعي",
           "الطالب قام بتسمية مساعده وتحديد ماهيته",
           "حماس الطالب مرتفع للمحاضرة القادمة"
         ]
       },
       {
         title: "المحاضرة 2: إعداد بيئة العمل للذكاء الاصطناعي",
         objectives: [
           "تنزيل وتثبيت بيئة بايثون",
           "تثبيت الأداة الخاصة بتشغيل النماذج (مثل Ollama)",
           "فهم معنى خوادم محلية (Offline)"
         ],
         steps: [
           "مراجعة المكتسبات السابقة (5 د)",
           "خطوة بخطوة تطبيق تثبيت بيئة العمل مع كل طالب (35 د)",
           "تشغيل الأداة لأول مرة للتأكد من الجاهزية (15 دقيقة)",
           "وضع القواعد لمجلدات البرمجة (5 د)"
         ],
         checklist: [
           "بايثون مثبت وجاهز للعمل",
           "الأداة Local LLM مثبتة وتعمل بدون انترنت",
           "التأكد من أمان أجهزة كل الطلاب وخلوها من المشاكل الفنية"
         ]
       },
       {
         title: "المحاضرة 3: كتابة أول كود برمجي للمساعد",
         objectives: [
           "التعرف على المتغيرات في بايثون",
           "طباعة نصوص على الشاشة",
           "إرسال أول رسالة ثابتة للموديل"
         ],
         steps: [
           "تحية وشرح وظيفة الكود (10 د)",
           "تطبيق: فتح محرر الأكواد وكتابة Hello World (20 د)",
           "تطبيق: دمج الكود ليرد الذكاء الاصطناعي محلياً (25 د)",
           "استعراض إنجازات الطلاب (5 د)"
         ],
         checklist: [
           "ملف الكود يعمل بنجاح بدون أخطاء",
           "الاستجابة تظهر من الموديل الذكي على وحدة التحكم Terminal"
         ]
       },
       {
         title: "المحاضرة 4: تصميم الواجهة (GUI) الأولى للمساعد",
         objectives: [
           "فهم مفاهيم واجهة المستخدم",
           "بناء نافذة بسيطة باستخدام مكتبة Tkinter أو CustomTkinter"
         ],
         steps: [
           "رسم تخيل للواجهة على ورقة (10 د)",
           "تأسيس كود الواجهة وإظهار النافذة (20 د)",
           "إضافة حقل إدخال وزر إرسال (25 د)",
           "تنسيق الألوان وتجربة الواجهة (5 د)"
         ],
         checklist: [
           "الواجهة تعمل ولا تغلق فجأة",
           "مربع النص وحقل الإدخال موجودان"
         ]
       },
       {
         title: "المحاضرة 5: ربط قلب وعقل المساعد",
         objectives: [
           "دمج واجهة المستخدم التي صممها الطالب مع كود تشغيل الموديل"
         ],
         steps: [
           "شرح كيف يتواصل الزر مع الذكاء الاصطناعي (15 د)",
           "تطبيق: جعل الواجهة متفاعلة مع ضغطة الزر (30 د)",
           "تطبيق: عرض نتيجة الموديل في مربع النص (15 د)"
         ],
         checklist: [
           "الطالب نجح في إنشاء محادثة كاملة داخل الواجهة بدون أخطاء",
           "تم إرشاد الطلاب على كيفية التعامل مع التأخير أثناء توليد الردود"
         ]
       }
     ];
     
     setLectures(seededLectures);
     setActiveLectureIndex(0);
  };

  return (
    <DashboardLayout role={profile?.role || 'admin'} userName={profile?.name || "Admin Access"}>
      <div className="space-y-8">
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900">بناء وتأسيس المناهج والمواد الدراسية 🧩</h1>
            <p className="text-slate-600 mt-1">قم بإعداد منهج متكامل، وتلقائياً سيتم تنظيم الدروس للمدربين والطلاب.</p>
          </div>
          <div className="flex items-center gap-3">
             <GlassButton variant="secondary" onClick={handleSeedAICourse} className="hidden lg:flex gap-2 text-xs">
                ✨ توليد منهج المساعد الذكي المُبرمج
             </GlassButton>
             <GlassButton variant="primary" onClick={handleSaveCourse} disabled={saving} className="gap-2 px-8 py-3">
                <Save size={18} /> {saving ? 'جاري الحفظ...' : 'حفظ ونشر المنهج'}
             </GlassButton>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Course Info */}
          <div className="md:col-span-1 space-y-6">
            <GlassCard className="p-6 space-y-6 border border-slate-200">
               <h2 className="font-bold text-lg flex items-center gap-2"><Settings className="text-primary"/> معلومات المادة الأساسية</h2>
               
               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500 uppercase">اسم المادة</label>
                     <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} placeholder="مثال: الذكاء الاصطناعي..." />
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500 uppercase">وصف سريع</label>
                     <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" value={description} onChange={e => setDescription(e.target.value)} placeholder="شرح مبسط يظهر للمستخدم..." />
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500 uppercase">الهدف النهائي (Capstone)</label>
                     <textarea className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" value={courseGoal} onChange={e => setCourseGoal(e.target.value)} placeholder="النتيجة النهائية للمتعلم..." />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">المدة الإجمالية</label>
                        <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" value={expectedDuration} onChange={e => setExpectedDuration(e.target.value)} placeholder="مثال: 12 أسبوع" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">مدة الحصة</label>
                        <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" value={lectureDuration} onChange={e => setLectureDuration(e.target.value)} placeholder="60 دقيقة" />
                     </div>
                  </div>
               </div>
            </GlassCard>

            <GlassCard className="p-6 border border-slate-200">
               <div className="flex justify-between items-center mb-4">
                 <h2 className="font-bold text-lg flex items-center gap-2"><List className="text-primary"/> الفهرس (المحاضرات) {lectures.length > 0 && <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">{lectures.length}</span>}</h2>
                 <button onClick={addLecture} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all"><Plus size={16}/></button>
               </div>

               <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                 {lectures.map((lec, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setActiveLectureIndex(idx)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${activeLectureIndex === idx ? 'bg-primary/5 border-primary text-primary font-bold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-primary/50'}`}
                    >
                      <span className="truncate text-sm">{lec.title || `محاضرة ${idx + 1}`}</span>
                      <ArrowLeft size={16} className={`${activeLectureIndex === idx ? 'opacity-100' : 'opacity-0'}`}/>
                    </div>
                 ))}
                 {lectures.length === 0 && (
                   <p className="text-center text-slate-400 text-sm py-4">لم يتم إضافة محاضرات بَعد.</p>
                 )}
               </div>
            </GlassCard>
          </div>

          {/* Lecture Editor */}
          <div className="md:col-span-2">
            <AnimatePresence mode="wait">
              {activeLectureIndex !== null && lectures[activeLectureIndex] ? (
                 <motion.div 
                    key={activeLectureIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                 >
                   <GlassCard className="p-8 space-y-8 border-t-4 border-t-primary shadow-xl">
                      <div className="border-b border-slate-100 pb-6 flex justify-between items-center">
                         <div className="flex-1 mr-8">
                            <label className="text-xs font-bold text-slate-500 uppercase">عنوان المحاضرة</label>
                            <input 
                              type="text" 
                              className="w-full text-2xl font-bold bg-transparent border-0 border-b-2 border-transparent hover:border-slate-200 focus:border-primary focus:ring-0 px-0 py-2 transition-all outline-none" 
                              value={lectures[activeLectureIndex].title} 
                              onChange={(e) => updateLecture(activeLectureIndex, 'title', e.target.value)} 
                              placeholder="أدخل عنوان المحاضرة هنا..." 
                            />
                         </div>
                         <div className="flex gap-2">
                           <button onClick={() => {
                             const l = [...lectures];
                             l.splice(activeLectureIndex, 1);
                             setLectures(l);
                             setActiveLectureIndex(l.length > 0 ? 0 : null);
                           }} className="p-2 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={18}/></button>
                         </div>
                      </div>

                      {/* Objectives */}
                      <div>
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                          أهداف المدرب (Objectives)
                          <button onClick={() => addArrayItem(activeLectureIndex, 'objectives')} className="text-xs text-primary bg-primary/10 px-3 py-1 rounded-full">+ إضافة هدف</button>
                        </h3>
                        <div className="space-y-3">
                           {lectures[activeLectureIndex].objectives.map((obj: string, i: number) => (
                             <div key={i} className="flex gap-3">
                               <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">{i+1}</span>
                               <input type="text" className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm" value={obj} onChange={e => updateArrayItem(activeLectureIndex, 'objectives', i, e.target.value)} placeholder="الهدف من هذا الشرح..." />
                               <button onClick={() => removeArrayItem(activeLectureIndex, 'objectives', i)} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                             </div>
                           ))}
                        </div>
                      </div>

                      {/* Steps */}
                      <div>
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                          خطوات المدرب المنهجية (Trainer Flow)
                          <button onClick={() => addArrayItem(activeLectureIndex, 'steps')} className="text-xs text-primary bg-primary/10 px-3 py-1 rounded-full">+ إضافة خطوة</button>
                        </h3>
                        <div className="space-y-3">
                           {lectures[activeLectureIndex].steps.map((step: string, i: number) => (
                             <div key={i} className="flex gap-3">
                               <div className="shrink-0 pt-2"><ArrowLeft size={16} className="text-slate-400"/></div>
                               <textarea className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm h-16 resize-none" value={step} onChange={e => updateArrayItem(activeLectureIndex, 'steps', i, e.target.value)} placeholder="- Warm-up: سؤال تمهيدي...&#10;- Demo: ..." />
                               <button onClick={() => removeArrayItem(activeLectureIndex, 'steps', i)} className="text-slate-400 hover:text-red-500 mt-2"><Trash2 size={16}/></button>
                             </div>
                           ))}
                        </div>
                      </div>

                      {/* Checklist */}
                      <div className="pt-6 border-t border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                          متطلبات التسليم للدرس (Checklist)
                          <button onClick={() => addArrayItem(activeLectureIndex, 'checklist')} className="text-xs text-primary bg-primary/10 px-3 py-1 rounded-full">+ إضافة شرط</button>
                        </h3>
                        <div className="space-y-3">
                           {lectures[activeLectureIndex].checklist.map((chk: string, i: number) => (
                             <div key={i} className="flex gap-3 items-center">
                               <input type="checkbox" disabled className="w-4 h-4 rounded border-slate-300 text-primary" />
                               <input type="text" className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm" value={chk} onChange={e => updateArrayItem(activeLectureIndex, 'checklist', i, e.target.value)} placeholder="مثال: الطالب قام بتجهيز الواجهة..." />
                               <button onClick={() => removeArrayItem(activeLectureIndex, 'checklist', i)} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                             </div>
                           ))}
                        </div>
                      </div>

                      {/* Resources / Assets */}
                      <div className="pt-6 border-t border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                          المرفقات والمصادر (كتب، صور، فيديو، روابط)
                          <button onClick={() => addResource(activeLectureIndex)} className="text-xs text-primary bg-primary/10 px-3 py-1 rounded-full">+ إضافة مرفق جديد</button>
                        </h3>
                        <div className="space-y-3">
                           {lectures[activeLectureIndex].resources?.map((res: any, i: number) => (
                             <div key={i} className="flex gap-3 items-start bg-slate-50 p-3 rounded-xl border border-slate-200">
                               <select 
                                 className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-sm w-32"
                                 value={res.type}
                                 onChange={e => updateResource(activeLectureIndex, i, 'type', e.target.value)}
                               >
                                  <option value="link">رابط (Link)</option>
                                  <option value="pdf">كتاب (PDF)</option>
                                  <option value="video">فيديو (Video)</option>
                                  <option value="image">صورة (Image)</option>
                               </select>
                               <div className="flex-1 space-y-2">
                                  <input 
                                    type="text" 
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm" 
                                    value={res.title} 
                                    onChange={e => updateResource(activeLectureIndex, i, 'title', e.target.value)} 
                                    placeholder="اسم المرفق (مثال: كتاب الذكاء الاصطناعي...)" 
                                  />
                                  <input 
                                    type="url" 
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm" 
                                    value={res.url} 
                                    onChange={e => updateResource(activeLectureIndex, i, 'url', e.target.value)} 
                                    placeholder="https://" 
                                  />
                               </div>
                               <button onClick={() => removeResource(activeLectureIndex, i)} className="text-slate-400 hover:text-red-500 mt-2"><Trash2 size={16}/></button>
                             </div>
                           ))}
                           {(!lectures[activeLectureIndex].resources || lectures[activeLectureIndex].resources.length === 0) && (
                              <p className="text-xs text-slate-400">لا يوجد مرفقات مضافة لهذه المحاضرة حالياً.</p>
                           )}
                        </div>
                      </div>

                   </GlassCard>
                 </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <LayoutTemplate size={64} className="opacity-20" />
                  <p>الرجاء إنشاء أو اختيار محاضرة لتعديل تفاصيلها.</p>
                  <GlassButton variant="secondary" onClick={addLecture}>+ إضافة المحاضرة الأولى</GlassButton>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
