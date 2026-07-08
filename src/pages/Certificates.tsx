import * as React from 'react';
import DashboardLayout from '@/src/components/dashboard/DashboardLayout';
import { GlassCard, GlassButton } from '@/src/components/common/Layout';
import { 
  Award, 
  Search, 
  Printer, 
  Share2, 
  CheckCircle2, 
  Loader2,
  AlertCircle,
  Sparkles,
  Eye
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/context/AuthContext';
import { 
  getUsersByRoleFromSQL,
  getAllCertificatesFromSQL,
  issueCertificateInSQL
} from '@/src/services/hybridApiService';
import { GoogleGenAI } from "@google/genai";

export default function Certificates() {
  const { user, profile } = useAuth();
  const [students, setStudents] = React.useState<any[]>([]);
  const [activeCerts, setActiveCerts] = React.useState<any[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [issuing, setIssuing] = React.useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = React.useState(false);

  const loadData = React.useCallback(async () => {
    const studentsList = await getUsersByRoleFromSQL('student');
    const trainersList = await getUsersByRoleFromSQL('trainer');
    setStudents([...studentsList, ...trainersList]);

    const certsList = await getAllCertificatesFromSQL();
    setActiveCerts(certsList);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleIssue = async (student: any) => {
    if (!user) return;
    setIssuing(student.id);
    setAiGenerating(true);
    
    try {
      const prog = prompt("Enter Program Name:", "AI & Software Engineering") || "AI & Software Engineering";
      const sName = student.displayName || student.fullName || student.name || "Student";
      
      // Personalize with AI
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a short (15 words max) personalized motivational congratulations message for a student named ${sName} who just finished a course in ${prog}. Make it sound professional and inspiring from TKA Egypt.`,
      });
      
      const customMessage = response.text || "Congratulations on your outstanding achievement!";

      await issueCertificateInSQL({
        studentId: student.id,
        studentName: sName,
        programName: prog,
        issuerId: user.uid,
        customMessage // Store AI message
      });
      
      alert(`Certificate issued! AI Message: "${customMessage}"`);
      loadData(); // Refresh list
    } catch (error) {
      console.error(error);
      alert("Error issuing certificate. AI service might be busy.");
    } finally {
      setIssuing(null);
      setAiGenerating(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const searchVal = searchTerm.toLowerCase();
    const name = (s.displayName || s.fullName || s.name || "").toLowerCase();
    const email = (s.email || "").toLowerCase();
    return name.includes(searchVal) || email.includes(searchVal);
  });

  return (
    <DashboardLayout role={profile?.role || 'supervisor'} userName={profile?.displayName || user?.displayName || "Supervisor"}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900">Certificate Issuance 🎖️</h1>
          <p className="text-slate-600 mt-1">Generate and manage official TKA Egypt credentials.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
           {/* Issuance Section */}
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-lg font-bold text-slate-800">Ready for Issuance</h3>
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      placeholder="Find student..." 
                      className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-primary/50"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
              </div>

              <div className="space-y-3">
                 {filteredStudents.map(s => (
                   <GlassCard key={s.id} className="flex items-center justify-between p-4 shadow-sm border border-slate-100">
                      <div>
                         <p className="font-bold text-slate-900 text-sm">{s.fullName || s.name}</p>
                         <p className="text-[10px] text-slate-500 font-mono">{s.email}</p>
                      </div>
                      <GlassButton 
                        variant="primary" 
                        className="py-2 text-xs h-9 bg-primary text-white border-none shadow-sm"
                        onClick={() => handleIssue(s)}
                        disabled={issuing === s.id}
                      >
                         {issuing === s.id ? <Loader2 className="animate-spin" size={14}/> : <Award size={14} className="mr-2"/>}
                         Issue Official Cert
                      </GlassButton>
                   </GlassCard>
                 ))}
              </div>
           </div>

           {/* Active Certificates List */}
           <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800">Generated Credentials</h3>
              <div className="space-y-4">
                 {activeCerts.map(cert => (
                   <GlassCard key={cert.id} className="p-6 border-l-4 border-l-secondary shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <p className="font-display font-bold text-slate-900">{cert.studentName}</p>
                            <p className="text-xs text-secondary font-bold uppercase tracking-widest">{cert.programName}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-mono text-slate-400">{cert.verificationCode}</p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-600 mt-1 uppercase">Verified</span>
                         </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                         <div className="flex gap-4">
                            <button className="text-slate-400 hover:text-primary transition-all"><Printer size={16} /></button>
                            <button className="text-slate-400 hover:text-primary transition-all"><Share2 size={16} /></button>
                         </div>
                         <p className="text-[10px] text-slate-400">Issued: {new Date(cert.issueDate).toLocaleDateString()}</p>
                      </div>
                   </GlassCard>
                 ))}
                 {activeCerts.length === 0 && (
                   <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-300 rounded-3xl">
                      <AlertCircle className="mx-auto text-slate-300 mb-2" />
                      <p className="text-slate-400 italic">No certificates issued yet.</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
