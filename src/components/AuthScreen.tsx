import React, { useState } from 'react';
import { 
  Facebook, 
  Smartphone, 
  Lock, 
  User, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (userData: { name: string; email: string; bmdcNumber: string; mobile: string; state?: any }) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  // Mobile verification phase: 'mobile' | 'login_password' | 'register'
  const [phase, setPhase] = useState<'mobile' | 'login_password' | 'register'>('mobile');
  
  // Registration and login fields
  const [mobile, setMobile] = useState<string>('01517016312');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [bmdcNumber, setBmdcNumber] = useState<string>('');

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Clean and validate mobile phone number
  const getCleanMobile = () => {
    let clean = mobile.replace(/[^0-9]/g, '');
    if (clean.startsWith('88')) {
      clean = clean.substring(2);
    }
    return clean;
  };

  // Step 1: Submit Mobile for verification
  const handleVerifyMobile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    
    const cleanMobile = getCleanMobile();
    if (cleanMobile.length < 11 || cleanMobile.length > 14) {
      setErrorMsg('Please enter a valid 11-digit mobile number (e.g. 01517016312)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: cleanMobile })
      });
      const data = await res.json();
      
      if (res.ok) {
        if (data.registered) {
          // User exists, proceed to enter password
          setPhase('login_password');
        } else {
          // New subscriber, proceed to registration
          setName('');
          setPassword('');
          setBmdcNumber('');
          setEmail('');
          setPhase('register');
        }
      } else {
        setErrorMsg(data.error || 'There was an issue verifying your mobile number.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Unable to connect to the server. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle sign in for existing user
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    const cleanMobile = getCleanMobile();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: cleanMobile, password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // Authenticated! Pass backend state up to trigger local updates
        onAuthSuccess({
          mobile: data.user.mobile,
          name: data.user.name,
          email: data.user.email,
          bmdcNumber: data.user.bmdcNumber,
          state: data.user // Passes whole synced object (progress, mistakes, customExams)
        });
      } else {
        setErrorMsg(data.error || 'Incorrect password. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Handle registration of a new subscriber
  const handleRegisterAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (password.length < 5) {
      setErrorMsg('For security, the password must be at least 5 characters long.');
      return;
    }

    setLoading(true);
    const cleanMobile = getCleanMobile();

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: cleanMobile,
          name: name.trim(),
          email: email.trim(),
          bmdcNumber: bmdcNumber.trim(),
          password
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        onAuthSuccess({
          mobile: data.user.mobile,
          name: data.user.name,
          email: data.user.email,
          bmdcNumber: data.user.bmdcNumber,
          state: data.user
        });
      } else {
        setErrorMsg(data.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Social simulated signs
  const handleSocialSignIn = async (provider: 'Google' | 'Facebook') => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const demoEmail = provider === 'Google' ? 'doctor.google@gtest.com' : 'doctor.fb@fbtest.com';
      const demoName = provider === 'Google' ? 'Dr. Tanjim Hasan' : 'Dr. Raisa Rahman';
      const demoUid = provider === 'Google' ? 'google_user_9921' : 'fb_user_4431';

      const res = await fetch('/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          name: demoName,
          email: demoEmail,
          uid: demoUid
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        onAuthSuccess({
          mobile: data.user.mobile,
          name: data.user.name,
          email: data.user.email,
          bmdcNumber: data.user.bmdcNumber,
          state: data.user
        });
      } else {
        setErrorMsg('Social login failed.');
      }
    } catch (err) {
      setErrorMsg('Unable to connect to the social login server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[580px] p-6 justify-between items-center bg-white text-slate-850 select-none relative overflow-y-auto" id="auth-screen-component">
      
      {/* Decorative Brand Header Container */}
      <div className="w-full text-center space-y-4 pt-4">
        
        {/* Modern styled BDFCPS Shield/Lettermark Logo */}
        <div className="flex flex-col items-center justify-center relative my-4" id="bdfcps-authentic-logo">
          <div className="relative flex items-center gap-2 px-6 py-3.5 bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            {/* Glowing active pulse on the corner */}
            <div className="w-2 h-2 bg-teal-400 rounded-full absolute -top-1 -right-1 shadow-md shadow-teal-500/50 animate-ping" />
            <div className="w-2 h-2 bg-teal-400 rounded-full absolute -top-1 -right-1 shadow-md shadow-teal-500/50" />
            
            {/* Medical Shield Icon representation */}
            <div className="p-1.5 bg-teal-500/10 rounded-lg border border-teal-500/25 text-teal-400">
              <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            
            <h1 className="text-xl font-black text-white tracking-widest font-sans flex items-center">
              BD<span className="text-teal-400 font-extrabold animate-pulse">FCPS</span>
            </h1>
          </div>
        </div>

        {/* Dynamic Bengali text "লগইন/রেজিস্টার" */}
        <h2 className="text-xl font-extrabold text-slate-850 tracking-tight -mt-1">
          {phase === 'mobile' && 'Login / Register'}
          {phase === 'login_password' && 'Enter Password'}
          {phase === 'register' && 'Create New Account'}
        </h2>
      </div>

      {/* Main Core Action Form Wrapper */}
      <div className="w-full max-w-[290px] space-y-4 my-auto relative z-10">
        
        {/* Step 1: Input Mobile Form */}
        {phase === 'mobile' && (
          <form onSubmit={handleVerifyMobile} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 tracking-tight block">
                Mobile Number
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="01517016312"
                  className="w-full bg-slate-50 border border-slate-200 text-sm text-slate-800 rounded-2xl pl-10 pr-4 py-3 outline-none focus:bg-white focus:border-[#007A4B] focus:ring-1 focus:ring-[#007A4B] transition-all placeholder:text-slate-400 font-mono"
                  id="mobile-input-field"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#007A4B] hover:bg-[#00683f] text-white font-extrabold text-sm py-3.5 rounded-2xl transition duration-150 active:scale-98 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              id="mobile-submit-btn"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: Login Enter Password Form */}
        {phase === 'login_password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-semibold text-slate-500 font-mono">{mobile}</span>
                <button 
                  type="button" 
                  onClick={() => setPhase('mobile')} 
                  className="text-[10px] text-teal-600 hover:underline font-bold"
                >
                  Change Number
                </button>
              </div>
              <label className="text-xs font-bold text-slate-755 tracking-tight block">
                Enter Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-slate-50 border border-slate-200 text-sm text-slate-800 rounded-2xl pl-10 pr-4 py-3 outline-none focus:bg-white focus:border-teal-500 transition-all placeholder:text-slate-400"
                  id="login-password-field"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#007A4B] hover:bg-[#00683f] text-white font-extrabold text-sm py-3.5 rounded-2xl transition duration-150 active:scale-98 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              id="login-submit-btn"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Log In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 3: Registration Form (For non-existent account) */}
        {phase === 'register' && (
          <form onSubmit={handleRegisterAccount} className="space-y-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-semibold text-slate-500 font-mono">Mobile: {mobile}</span>
              <button 
                type="button" 
                onClick={() => setPhase('mobile')} 
                className="text-[10px] text-teal-600 hover:underline font-bold"
              >
                Change Number
              </button>
            </div>

            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-700 tracking-tight block">Your Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Sazzad Hossain"
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-[#007A4B] transition-all"
                  id="reg-name-field"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-700 tracking-tight block">Email (Optional)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-[#007A4B] transition-all"
                  id="reg-email-field"
                />
              </div>
            </div>

            {/* BMDC Registration No */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-700 tracking-tight block">BMDC Number (Optional)</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={bmdcNumber}
                  onChange={(e) => setBmdcNumber(e.target.value)}
                  placeholder="e.g. BMDC-12345-D"
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-[#007A4B] transition-all"
                  id="reg-bmdc-field"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-700 tracking-tight block">Choose Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 5 characters"
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-[#007A4B] transition-all"
                  id="reg-password-field"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#007A4B] hover:bg-[#00683f] text-white font-extrabold text-xs py-3 rounded-xl transition duration-150 active:scale-98 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer mt-2"
              id="reg-submit-btn"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Display Error Prompt */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-2.5 rounded-xl text-[11px] flex items-start gap-2 animate-shake" id="auth-error-notice">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span className="leading-tight">{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Social Login Section matching image exactly */}
      <div className="w-full text-center space-y-4 pt-3 border-t border-slate-100 mt-auto pb-4">
        
        {/* Separator labeling */}
        <p className="text-xs text-slate-400 font-medium">
          Login / Registration with
        </p>

        {/* Double Brand Interactive Social Buttons */}
        <div className="grid grid-cols-2 gap-3 max-w-[290px] mx-auto">
          
          {/* Facebook Link Option */}
          <button
            type="button"
            onClick={() => handleSocialSignIn('Facebook')}
            disabled={loading}
            className="flex items-center justify-center gap-2 border border-slate-200 py-3 rounded-2xl bg-white hover:bg-slate-50 active:scale-95 transition cursor-pointer"
            id="social-login-fb"
          >
            <Facebook className="w-4 h-4 text-[#1877F2] fill-[#1877F2]" />
            <span className="text-xs font-bold text-slate-700">Facebook</span>
          </button>

          {/* Google Link Option */}
          <button
            type="button"
            onClick={() => handleSocialSignIn('Google')}
            disabled={loading}
            className="flex items-center justify-center gap-2 border border-slate-200 py-3 rounded-2xl bg-white hover:bg-slate-50 active:scale-95 transition cursor-pointer"
            id="social-login-google"
          >
            {/* High fidelity Google G vector */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-xs font-bold text-slate-700">Google</span>
          </button>
        </div>

        {/* Demo profiles helper notice */}
        <div className="text-[10px] text-slate-400 text-center leading-normal max-w-[240px] mx-auto">
          You can enter the test number <strong className="text-teal-600 font-mono">01517016312</strong> to log in instantly.
        </div>
      </div>

    </div>
  );
}
