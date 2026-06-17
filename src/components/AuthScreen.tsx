import React, { useState } from 'react';
import { ShieldCheck, User, Mail, Lock, Stethoscope, Search, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (doctorData: { name: string; email: string; bmdcNumber: string }) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  
  // Registration States
  const [doctorName, setDoctorName] = useState<string>('');
  const [bmdcNumber, setBmdcNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  // Validation / Loading States
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifyingBMDC, setIsVerifyingBMDC] = useState<boolean>(false);
  const [bmdcVerified, setBmdcVerified] = useState<boolean>(false);

  const handleValidateForm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.includes('@') || email.length < 5) {
      setErrorMsg('Please input a valid institutional email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Security mandate: Password must be at least 6 characters.');
      return;
    }

    if (isRegister) {
      if (!doctorName.trim()) {
        setErrorMsg('Please provide your full medical name.');
        return;
      }
      
      const bmdcClean = bmdcNumber.trim();
      const bmdcRegex = /^BMDC-\d{4,6}-[D|A|N]$/i;
      
      if (!bmdcClean) {
        setErrorMsg('BMDC registration number is critical for doctor identity verification.');
        return;
      }

      // Simulate BMDC Verification
      setIsVerifyingBMDC(true);
      setTimeout(() => {
        setIsVerifyingBMDC(false);
        setBmdcVerified(true);
        
        // Complete auth
        setTimeout(() => {
          onAuthSuccess({
            name: doctorName.trim().startsWith('Dr.') ? doctorName.trim() : `Dr. ${doctorName.trim()}`,
            email: email.trim(),
            bmdcNumber: bmdcClean.toUpperCase(),
          });
        }, 800);
      }, 1500);

    } else {
      // Simulate Login
      setIsVerifyingBMDC(true);
      setTimeout(() => {
        setIsVerifyingBMDC(false);
        onAuthSuccess({
          name: doctorName.trim() || 'Dr. Sarah Ahmed',
          email: email.trim(),
          bmdcNumber: bmdcNumber.trim().toUpperCase() || 'BMDC-49321-D',
        });
      }, 1000);
    }
  };

  const loadDemoCredentials = () => {
    setIsRegister(false);
    setEmail('candidate.ahmed@cpsp.edu.pk');
    setPassword('fcpspass2026');
    setDoctorName('Dr. Sarah Ahmed');
    setBmdcNumber('BMDC-49321-D');
  };

  return (
    <div className="flex flex-col h-[580px] p-6 justify-center items-center bg-slate-950 text-white select-none relative" id="auth-screen-component">
      {/* Decorative pulse glow */}
      <div className="absolute top-10 left-10 w-28 h-28 bg-teal-500/10 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-28 h-28 bg-teal-600/10 rounded-full blur-2xl animate-pulse" />

      <div className="w-full max-w-[290px] space-y-5 relative z-10">
        
        {/* Core Medical Icon Logo */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex p-3 rounded-2xl bg-teal-500/10 border border-teal-500/25 text-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.15)] mb-1">
            <Stethoscope className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold tracking-tight text-slate-100 uppercase">FCPS Companion</h2>
          <p className="text-[10px] text-teal-400 font-bold font-mono tracking-widest uppercase">CPSP CBT Portal Credentials</p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleValidateForm} className="space-y-3">
          
          {isRegister && (
            <>
              {/* Doctor Name Field */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Doctor's Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="e.g. Dr. Sarah Ahmed"
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-teal-500 transition-all placeholder:text-slate-600"
                    id="reg-doctor-name-input"
                  />
                </div>
              </div>

              {/* BMDC Verification Code Field */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">BMDC Registration No.</label>
                  <span className="text-[8px] text-teal-400 font-mono tracking-tight font-semibold">Format: BMDC-12345-D</span>
                </div>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={bmdcNumber}
                    onChange={(e) => setBmdcNumber(e.target.value)}
                    placeholder="e.g. BMDC-49321-D"
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-teal-500 transition-all placeholder:text-slate-600"
                    id="reg-bmdc-number-input"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email Address Field */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Credentials Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@hospital.edu"
                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-teal-500 transition-all placeholder:text-slate-600"
                id="auth-email-input"
              />
            </div>
          </div>

          {/* Secure Password Field */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Security Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-teal-500 transition-all placeholder:text-slate-600"
                id="auth-password-input"
              />
            </div>
          </div>

          {/* Show error logging notice */}
          {errorMsg && (
            <div className="bg-red-550/10 border border-red-500/20 text-red-400 p-2 rounded-lg text-[9px] flex items-center gap-1.5" id="auth-error-notice">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Syncing/Verifying BMDC Loading Feedback */}
          {isVerifyingBMDC && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center space-y-2 animate-pulse" id="bmdc-verifying-ui">
              <div className="flex items-center justify-center gap-2">
                <Search className="w-3.5 h-3.5 text-teal-400 animate-spin" />
                <span className="text-[9px] font-mono text-teal-400 uppercase tracking-wider font-extrabold">Querying CPSP Registrar Database...</span>
              </div>
              <p className="text-[8px] text-slate-500 leading-normal">Cross-matching BMDC parameters against National Medical rosters</p>
            </div>
          )}

          {/* Success Validation state */}
          {bmdcVerified && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-2.5 text-center flex items-center justify-center gap-1.5" id="bmdc-verified-ui">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-[9px] font-bold tracking-wider uppercase font-mono">BMDC Verification Passed!</span>
            </div>
          )}

          {/* Form Action Button */}
          {!isVerifyingBMDC && !bmdcVerified && (
            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs py-2.5 rounded-xl transition duration-150 active:scale-95 flex items-center justify-center gap-1.5 shadow"
              id="auth-submit-btn"
            >
              <span>{isRegister ? 'Register & Verify Doctor' : 'Secure Login'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Divider & Switch Form Controls */}
        <div className="pt-3 border-t border-slate-900 flex flex-col gap-2.5 text-center">
          <button
            onClick={() => {
              setErrorMsg(null);
              setIsRegister(!isRegister);
            }}
            className="text-[10px] text-slate-400 hover:text-teal-400 transition"
            id="auth-toggle-screen-btn"
          >
            {isRegister ? 'Already have a verified profile? Login' : 'New Candidate? Register Doctor Profile'}
          </button>

          <button
            type="button"
            onClick={loadDemoCredentials}
            className="text-[9px] px-2 py-1 bg-slate-900 hover:bg-slate-850 text-slate-500 hover:text-slate-300 rounded-lg max-w-max mx-auto border border-slate-850"
            id="auth-demo-shortcut-btn"
          >
            Load Verified Mock Profile (Sarah Ahmed)
          </button>
        </div>

      </div>
    </div>
  );
}
