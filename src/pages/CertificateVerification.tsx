import * as React from 'react';
import { Navbar, GlassCard, GlassButton } from '@/src/components/common/Layout';
import { ShieldCheck, Search, Award, Download, ExternalLink, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams } from 'react-router-dom';
import { verifyCertificateFromSQL } from '@/src/services/hybridApiService';

export default function CertificateVerification() {
  const { code } = useParams();
  const [certId, setCertId] = React.useState(code || '');
  const [result, setResult] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  // Auto-verify if code is in URL
  React.useEffect(() => {
    if (code) {
      handleVerify();
    }
  }, [code]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetCode = certId || code;
    if (!targetCode) return;
    
    setLoading(true);
    try {
      const cert = await verifyCertificateFromSQL(targetCode.trim());
      if (cert) {
        setResult({
          student: cert.studentName,
          course: cert.programName,
          date: new Date(cert.issuedAt).toLocaleDateString(),
          grade: 'Authenticated',
          status: 'Verified',
          code: cert.certificate_uuid
        });
      } else {
        setResult('not_found');
      }
    } catch (error) {
      console.error(error);
      setResult('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary mb-6">
               <ShieldCheck size={32} />
            </div>
            <h1 className="text-4xl font-display font-bold text-slate-900">Certificate <span className="text-primary">Verification</span></h1>
            <p className="text-slate-600">Validate the authenticity of TKA Egypt professional certificates.</p>
          </div>

          <GlassCard neon shadow-lg>
            <form onSubmit={handleVerify} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Certificate ID</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                     <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                           value={certId}
                           onChange={(e) => setCertId(e.target.value)}
                           placeholder="Enter e.g. TKA-2023-XYZ" 
                           className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm focus:border-primary outline-none transition-all font-mono text-slate-900"
                        />
                     </div>
                     <GlassButton 
                        type="submit" 
                        variant="primary" 
                        className="py-4 px-8"
                        disabled={loading || !certId}
                     >
                        {loading ? 'Verifying...' : 'Validate Now'}
                     </GlassButton>
                  </div>
               </div>
            </form>

            <AnimatePresence>
               {result && (
                 <motion.div 
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: 'auto' }}
                   exit={{ opacity: 0, height: 0 }}
                   className="mt-8 pt-8 border-t border-slate-200"
                 >
                    {result === 'not_found' ? (
                      <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-center text-sm font-bold">
                         Certificate ID not found in our records. Please verify the ID and try again.
                      </div>
                    ) : (
                      <div className="space-y-6 text-slate-900">
                         <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-100 rounded-2xl">
                            <ShieldCheck className="text-green-600" size={24} />
                            <div>
                               <p className="text-xs font-bold text-green-600 uppercase tracking-widest leading-none">Status: Authenticated</p>
                               <p className="text-sm text-green-600/80 mt-1">This certificate was officially issued by TKA Egypt Training Center.</p>
                            </div>
                         </div>

                         <div className="grid sm:grid-cols-2 gap-8">
                            <div className="space-y-4">
                               <div>
                                  <label className="text-[10px] font-bold uppercase text-slate-500">Student Name</label>
                                  <p className="font-bold text-lg text-slate-900">{result.student}</p>
                               </div>
                               <div>
                                  <label className="text-[10px] font-bold uppercase text-slate-500">Course Track</label>
                                  <p className="font-bold text-lg text-primary">{result.course}</p>
                               </div>
                            </div>
                            <div className="space-y-4">
                               <div>
                                  <label className="text-[10px] font-bold uppercase text-slate-500">Issue Date</label>
                                  <p className="font-bold text-lg text-slate-900">{result.date}</p>
                               </div>
                               <div>
                                  <label className="text-[10px] font-bold uppercase text-slate-500">Final Evaluation</label>
                                  <p className="font-bold text-lg text-secondary">{result.grade}</p>
                               </div>
                            </div>
                         </div>

                         <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <GlassButton icon={Download} className="flex-1">Download PDF</GlassButton>
                            <GlassButton icon={ExternalLink} className="flex-1" variant="secondary">View Original</GlassButton>
                         </div>
                      </div>
                    )}
                 </motion.div>
               )}
            </AnimatePresence>
          </GlassCard>

          <div className="text-center text-slate-500 text-xs mt-12">
             <p>All certificates issued after January 2023 are digitally signed and verifiable.</p>
             <p className="mt-1">For older manual certificates, please contact our support department.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
