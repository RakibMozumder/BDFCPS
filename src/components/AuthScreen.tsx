import React, { useState, useEffect, useRef } from 'react';
import { 
  Facebook, 
  Smartphone, 
  Lock, 
  User, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  RefreshCw,
  Clock,
  Send,
  ChevronLeft,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
const bdfcpsLogo = "/src/assets/images/bdfcps_logo_1782055989338.jpg";

interface AuthScreenProps {
  onAuthSuccess: (userData: { name: string; email: string; bmdcNumber: string; mobile: string; state?: any; isNewRegistration?: boolean }) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  // Authentication stage tracking: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Input Type selector: 'mobile' | 'email'
  const [authType, setAuthType] = useState<'mobile' | 'email'>('mobile');
  
  // Value states
  const [mobile, setMobile] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // Registration data fields
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [bmdcNumber, setBmdcNumber] = useState<string>('');

  // Password recovery (Forget Password) flow state
  const [forgetPasswordMode, setForgetPasswordMode] = useState<boolean>(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'request' | 'verify' | 'new_password'>('request');
  const [pendingForgotUserIdent, setPendingForgotUserIdent] = useState<string>('');
  const [generatedForgotOtp, setGeneratedForgotOtp] = useState<string>('');
  const [forgotOtpDigits, setForgotOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [forgotNewPassword, setForgotNewPassword] = useState<string>('');
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState<string | null>(null);

  // OTP Verification view state
  const [showOtpScreen, setShowOtpScreen] = useState<boolean>(false);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [pendingRegisterData, setPendingRegisterData] = useState<any>(null);

  // Client Firebase configuration fetched dynamically on mount
  const [firebaseConfig, setFirebaseConfig] = useState<any>(null);

  // Social Sim Sandbox popup fallback simulation state
  const [socialSimModal, setSocialSimModal] = useState<{
    open: boolean;
    provider: 'Google' | 'Facebook';
    name: string;
    email: string;
    uid: string;
  } | null>(null);

  // UI state managers
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Refs for jumping OTP input focus
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const forgotOtpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Call API on mount to check if Firebase project credentials can be dynamically configured
  useEffect(() => {
    fetch('/api/auth/firebase-config')
      .then(res => res.ok ? res.json() : null)
      .then(config => {
        if (config && config.apiKey) {
          setFirebaseConfig(config);
          console.log("[Firebase SDK Client] Configured successfully from workspace environment.");
        }
      })
      .catch(err => {
        console.warn("[Firebase SDK Client] Dynamic initialization skipped.", err);
      });
  }, []);

  // Format phone strings
  const getCleanMobile = () => {
    let clean = mobile.replace(/[^0-9]/g, '');
    if (clean.startsWith('88')) {
      clean = clean.substring(2);
    }
    return clean;
  };

  // Switch modes cleanly
  const toggleAuthMode = () => {
    setAuthMode(prev => prev === 'signin' ? 'signup' : 'signin');
    setErrorMsg(null);
    setForgotSuccessMsg(null);
    setShowOtpScreen(false);
  };

  // Sign In submit handler
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setForgotSuccessMsg(null);

    const identifier = authType === 'mobile' ? getCleanMobile() : emailInput.trim();
    if (!identifier) {
      setErrorMsg(authType === 'mobile' ? 'Please enter a valid mobile number' : 'Please enter your email address');
      return;
    }

    if (authType === 'mobile' && identifier.length < 10) {
      setErrorMsg('Please enter a valid mobile number starting with 01');
      return;
    }

    if (authType === 'email' && !identifier.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: identifier, password })
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
        setErrorMsg(data.error || 'Incorrect values. Please check credentials.');
      }
    } catch (err) {
      setErrorMsg('Could not connect to BDFCPS authentication servers.');
    } finally {
      setLoading(false);
    }
  };

  // Sign Up click step -> generates OTP and enters Screen 3
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setForgotSuccessMsg(null);

    const checkMobile = authType === 'mobile' ? getCleanMobile() : mobile.replace(/[^0-9]/g, '');
    const checkEmail = authType === 'email' ? emailInput.trim() : email.trim();

    if (authType === 'mobile' && checkMobile.length < 10) {
      setErrorMsg('Please enter a valid mobile number starting with 01');
      return;
    }

    if (authType === 'email' && (!checkEmail || !checkEmail.includes('@'))) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }

    if (password.length < 5) {
      setErrorMsg('Password should be at least 5 characters long');
      return;
    }

    setLoading(true);
    try {
      const keyToCheck = authType === 'mobile' ? checkMobile : checkEmail;
      
      // Verify if account already registered
      const resVal = await fetch('/api/auth/verify-mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: keyToCheck })
      });
      const dataVal = await resVal.json();

      if (resVal.ok && dataVal.registered) {
        setErrorMsg('This contact is already registered. Please go to Sign In.');
        setLoading(false);
        return;
      }

      // Generate a dynamic secure 6-digit OTP passcode
      const secureOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(secureOtp);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpError(null);

      setPendingRegisterData({
        mobile: keyToCheck,
        name: name.trim(),
        email: checkEmail,
        bmdcNumber: bmdcNumber.trim(),
        password
      });

      setShowOtpScreen(true);
    } catch (err) {
      setErrorMsg('Database connectivity sluggish. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and complete registration inside database
  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    const codeTyped = otpDigits.join('');
    if (codeTyped.length < 6) {
      setOtpError('Please enter all 6 digits of the verification code');
      return;
    }

    if (codeTyped !== generatedOtp) {
      setOtpError('Invalid 6-digit code. Check the simulated SMS/Email notification below.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingRegisterData)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        onAuthSuccess({
          mobile: data.user.mobile,
          name: data.user.name,
          email: data.user.email,
          bmdcNumber: data.user.bmdcNumber,
          state: data.user,
          isNewRegistration: true
        });
      } else {
        setErrorMsg(data.error || 'Server rejected registration parameters.');
        setShowOtpScreen(false);
      }
    } catch (err) {
      setErrorMsg('Error submitting profile to database router.');
      setShowOtpScreen(false);
    } finally {
      setLoading(false);
    }
  };

  // PASSWORD RECOVERY / RESET FLOWS
  const handleForgetPasswordRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setForgotSuccessMsg(null);

    let identifier = pendingForgotUserIdent.trim();
    if (!identifier) {
      setErrorMsg('Specify your registered mobile number or email address');
      return;
    }

    if (!identifier.includes('@')) {
      identifier = identifier.replace(/[^0-9]/g, '');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: identifier })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setGeneratedForgotOtp(data.otp);
        setForgotOtpDigits(['', '', '', '', '', '']);
        setForgotPasswordStep('verify');
      } else {
        setErrorMsg(data.error || 'No active medical user registered with this contact.');
      }
    } catch (err) {
      setErrorMsg('Verification router slow. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgetPasswordVerifyDigits = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const typedOtp = forgotOtpDigits.join('');
    if (typedOtp !== generatedForgotOtp) {
      setErrorMsg('Invalid 6-digit reset key. Verify against SMS dispatcher below.');
      return;
    }

    setForgotPasswordStep('new_password');
    setForgotNewPassword('');
  };

  const handleForgotPasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (forgotNewPassword.length < 5) {
      setErrorMsg('New password must match security guidelines (min 5 chars).');
      return;
    }

    setLoading(true);
    try {
      const identifier = pendingForgotUserIdent.trim();
      const cleanIdent = identifier.includes('@') ? id => identifier : identifier.replace(/[^0-9]/g, '');

      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: identifier, password: forgotNewPassword })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setForgotSuccessMsg('Password successfully changed for your device simulation.');
        setForgetPasswordMode(false);
        setForgotPasswordStep('request');
        setPassword('');
        
        // Match identifiers for easier access
        if (identifier.includes('@')) {
          setAuthType('email');
          setEmailInput(identifier);
        } else {
          setAuthType('mobile');
          setMobile(identifier);
        }
      } else {
        setErrorMsg(data.error || 'Reset query rejected by secure fallback.');
      }
    } catch (err) {
      setErrorMsg('Network state stale while writing to cloud instances.');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Google/Facebook authentication wrapper with iframe fallback simulator
  const handleSocialLaunchPopup = async (provider: 'Google' | 'Facebook') => {
    setLoading(true);
    setErrorMsg(null);
    setForgotSuccessMsg(null);

    try {
      let emailSocial = '';
      let nameSocial = '';
      let uidSocial = '';

      if (firebaseConfig) {
        try {
          const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
          const auth = getAuth(app);
          const oProvider = provider === 'Google' ? new GoogleAuthProvider() : new FacebookAuthProvider();
          
          console.log(`[Firebase Popups] Launching native OAuth UI: ${provider}`);
          const popupResult = await signInWithPopup(auth, oProvider);
          const fUser = popupResult.user;

          emailSocial = fUser.email || '';
          nameSocial = fUser.displayName || '';
          uidSocial = fUser.uid;
        } catch (interactiveErr: any) {
          console.warn("[Firebase Popups] blocked inside sandbox preview. Launching bypass emulator.", interactiveErr.message);
          throw interactiveErr;
        }
      } else {
        throw new Error("Client config missing");
      }

      // Sync active profile parameters with full-stack router
      const syncRes = await fetch('/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, name: nameSocial, email: emailSocial, uid: uidSocial })
      });
      const syncData = await syncRes.json();

      if (syncRes.ok && syncData.success) {
        onAuthSuccess({
          mobile: syncData.user.mobile,
          name: syncData.user.name,
          email: syncData.user.email,
          bmdcNumber: syncData.user.bmdcNumber,
          state: syncData.user
        });
      } else {
        setErrorMsg(syncData.error || 'Authentication synchronizer failure.');
      }
    } catch (err) {
      // Setup beautiful virtual window emulator for block-free testing flow
      setSocialSimModal({
        open: true,
        provider,
        name: provider === 'Google' ? 'Dr. Nayeem Hasan' : 'Dr. Samantha Rahman',
        email: provider === 'Google' ? 'nayeem.hasan@bdfcps.org' : 'samantha.rahman@bdfcps.org',
        uid: provider === 'Google' ? 'gg_sim_' + Math.floor(1000 + Math.random() * 9000) : 'fb_sim_' + Math.floor(1000 + Math.random() * 9000)
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle key-by-key jump logic for OTP elements
  const handleOtpKeyTyped = (idx: number, keyVal: string) => {
    if (/[^0-9]/.test(keyVal)) return;

    const newOtp = [...otpDigits];
    newOtp[idx] = keyVal;
    setOtpDigits(newOtp);

    if (keyVal !== '' && idx < 5) {
      otpInputRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpBackspace = (idx: number, eventKey: string) => {
    if (eventKey === 'Backspace') {
      if (otpDigits[idx] === '' && idx > 0) {
        const newOtp = [...otpDigits];
        newOtp[idx - 1] = '';
        setOtpDigits(newOtp);
        otpInputRefs.current[idx - 1]?.focus();
      } else {
        const newOtp = [...otpDigits];
        newOtp[idx] = '';
        setOtpDigits(newOtp);
      }
    }
  };

  // Forgot password elements jump logic
  const handleForgotOtpKeyTyped = (idx: number, val: string) => {
    if (/[^0-9]/.test(val)) return;

    const newOtp = [...forgotOtpDigits];
    newOtp[idx] = val;
    setForgotOtpDigits(newOtp);

    if (val !== '' && idx < 5) {
      forgotOtpInputRefs.current[idx + 1]?.focus();
    }
  };

  const handleForgotOtpBackspace = (idx: number, eventKey: string) => {
    if (eventKey === 'Backspace') {
      if (forgotOtpDigits[idx] === '' && idx > 0) {
        const newOtp = [...forgotOtpDigits];
        newOtp[idx - 1] = '';
        setForgotOtpDigits(newOtp);
        forgotOtpInputRefs.current[idx - 1]?.focus();
      } else {
        const newOtp = [...forgotOtpDigits];
        newOtp[idx] = '';
        setForgotOtpDigits(newOtp);
      }
    }
  };

  // Extract variables for simpler view renders
  const showCustomAuthSelection = !showOtpScreen && !forgetPasswordMode;

  return (
    <div 
      className="flex flex-col h-[580px] justify-between items-center bg-[#f9fafc] text-slate-800 select-none relative overflow-y-auto font-sans p-4" 
      id="auth-screen-display-wrapper" 
      style={{ backgroundImage: 'radial-gradient(circle at 50% 10%, #fef2f4 0%, #f8fafc 100%)' }}
    >
      {/* 1. TOP PROGRESS INDICATOR BAR */}
      <div className="w-full flex justify-between items-center px-2 pt-2 pb-1" id="top-simulated-header-progress">
        {/* Back navigation button */}
        {(showOtpScreen || forgetPasswordMode) ? (
          <button 
            type="button"
            onClick={() => {
              setErrorMsg(null);
              setOtpError(null);
              if (showOtpScreen) {
                setShowOtpScreen(false);
              } else if (forgetPasswordMode) {
                setForgetPasswordMode(false);
                setForgotPasswordStep('request');
              }
            }}
            className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all active:scale-95 cursor-pointer shadow-2xs"
            title="Go Back"
          >
            <ChevronLeft className="w-4 h-4 shrink-0" />
          </button>
        ) : (
          <div className="w-8 h-8" /> /* balance workspace space */
        )}

        {/* 3-Stage Progress Indicators matching Screen UX */}
        <div className="flex gap-1.5 items-center">
          <div 
            className={`h-1 rounded-full transition-all duration-300 ${
              (!showOtpScreen && !forgetPasswordMode) ? 'w-8 bg-[#ea2c59]' : 'w-4 bg-slate-200'
            }`} 
          />
          <div 
            className={`h-1 rounded-full transition-all duration-300 ${
              (forgetPasswordMode) ? 'w-8 bg-[#ea2c59]' : 'w-4 bg-slate-200'
            }`} 
          />
          <div 
            className={`h-1 rounded-full transition-all duration-300 ${
              (showOtpScreen) ? 'w-8 bg-[#ea2c59]' : 'w-4 bg-slate-200'
            }`} 
          />
        </div>

        <div className="w-8 h-8" />
      </div>

      {/* 2. LOGO AREA - SOFT FLOATING EMBLEM */}
      <div className="flex flex-col items-center mt-3 text-center space-y-2">
        <div className="relative" id="logo-branding-badge">
          {/* Layered soft red/peach background bubble */}
          <div className="absolute inset-0 rounded-full bg-rose-250/20 blur-lg scale-125 animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-white flex items-center justify-center border border-rose-100 shadow-md p-1.5 overflow-hidden">
            <img 
              src={bdfcpsLogo} 
              alt="BDFCPS Companion Logo" 
              className="w-full h-full object-contain rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <div className="space-y-0.5">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight" id="main-identity-header">
            {showOtpScreen ? 'Enter OTP code' : (
              <>
                {forgetPasswordMode && 'Forgot Password'}
                {!forgetPasswordMode && (authMode === 'signin' ? 'Sign In' : 'Sign Up')}
              </>
            )}
          </h1>
          <p className="text-[10.5px] text-slate-500 font-medium max-w-[220px] mx-auto leading-relaxed">
            {showOtpScreen ? `Please enter the 6-digit OTP passcode dispatched to ${pendingRegisterData?.mobile || 'your device'}` : (
              <>
                {forgetPasswordMode && 'Restore your companion credentials to continue learning'}
                {!forgetPasswordMode && (authMode === 'signin' 
                  ? 'Access Bangladesh FCPS Companion simulator dynamic question banks'
                  : 'Establish a new dynamic medical credentials account'
                )}
              </>
            )}
          </p>
        </div>
      </div>

      {/* 3. CORE INTERACTIVE FORMS - ROUNDED CAPSULE STYLING */}
      <div className="w-full max-w-[315px] flex-grow flex flex-col justify-center my-4">
        {/* Dynamic Inner Card with Glass-like Shadow Borders */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl pt-5 pb-6 px-5 border border-slate-100 shadow-sm space-y-4">
          
          {/* SWITCH LOGICAL MODE BAR (In case verification screen isn't open) */}
          {showCustomAuthSelection && (
            <div className="flex bg-slate-100/60 p-1 rounded-full border border-slate-100" id="main-mode-toggle-pill">
              <button
                type="button"
                onClick={() => {
                  setAuthType('mobile');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-1 px-3 text-[10px] font-bold rounded-full transition-all cursor-pointer ${
                  authType === 'mobile' ? 'bg-white text-rose-600 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Mobile Phone
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthType('email');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-1 px-3 text-[10px] font-bold rounded-full transition-all cursor-pointer ${
                  authType === 'email' ? 'bg-white text-rose-600 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Email Address
              </button>
            </div>
          )}

          {/* SCREEN A: LOG IN PANEL (Matches leftmost Screen 1 in design) */}
          {authMode === 'signin' && !showOtpScreen && !forgetPasswordMode && (
            <form onSubmit={handleSignInSubmit} className="space-y-3.5">
              {/* Field 1: Identifier (Username/Phone/Email) */}
              <div className="relative">
                <div className="absolute left-4 top-3.5 text-slate-400">
                  {authType === 'mobile' ? <Smartphone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                </div>
                <input
                  type={authType === 'mobile' ? 'tel' : 'email'}
                  required
                  placeholder={authType === 'mobile' ? 'Username / Mobile No.' : 'Username / Email Address'}
                  value={authType === 'mobile' ? mobile : emailInput}
                  onChange={(e) => {
                    if (authType === 'mobile') setMobile(e.target.value);
                    else setEmailInput(e.target.value);
                  }}
                  className="w-full bg-[#f5f5f7] border-0 text-xs text-slate-800 rounded-full pl-11 pr-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#ea2c59]/10 transition-all font-medium"
                  id="signin-identifier"
                />
                {authType === 'mobile' && mobile.length >= 10 && (
                  <div className="absolute right-4 top-3.5 text-emerald-500">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Field 2: Password Choice with Eye visibility toggle */}
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f5f5f7] border-0 text-xs text-slate-800 rounded-full pl-11 pr-11 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#ea2c59]/10 transition-all font-medium font-sans"
                  id="signin-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Toggle Password View"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Forget Password link */}
              <div className="flex justify-end pr-1">
                <button
                  type="button"
                  onClick={() => {
                    setPendingForgotUserIdent(authType === 'mobile' ? mobile : emailInput);
                    setForgetPasswordMode(true);
                    setForgotPasswordStep('request');
                    setErrorMsg(null);
                  }}
                  className="text-[10px] text-slate-400 hover:text-[#ea2c59] transition font-bold"
                  id="forgot-password-trigger"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Cherry Red Pill Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ea2c59] hover:bg-[#d0244cf2] text-white text-xs font-black py-3.5 rounded-full shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 font-sans tracking-wide uppercase"
                id="btn-sign-in"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : 'Sign In'}
              </button>
            </form>
          )}

          {/* SCREEN B: SIGN UP CREATURES PANEL (Matches Screen 2 in design) */}
          {authMode === 'signup' && !showOtpScreen && !forgetPasswordMode && (
            <form onSubmit={handleSignUpSubmit} className="space-y-3">
              
              {/* Field 1: Dr's Full Candidate name */}
              <div className="relative">
                <User className="absolute left-4 top-3 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Full Candidate Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#f5f5f7] border-0 text-xs text-slate-800 rounded-full pl-11 pr-4 py-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-[#ea2c59]/10 transition-all font-medium font-sans"
                  id="reg-input-name"
                />
              </div>

              {/* Field 2: Email or Mobile dynamic display based on tabs */}
              {authType === 'mobile' ? (
                <>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-3 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="Username / Mobile No."
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full bg-[#f5f5f7] border-0 text-xs text-slate-800 rounded-full pl-11 pr-4 py-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-[#ea2c59]/10 transition-all font-mono font-medium"
                      id="reg-input-mobile"
                    />
                  </div>
                  
                  {/* Optional secondary Email field */}
                  <div className="relative">
                    <Mail className="absolute left-4 top-3 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="email"
                      placeholder="Email Address (Optional)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#f5f5f7] border-0 text-xs text-slate-800 rounded-full pl-11 pr-4 py-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-[#ea2c59]/10 transition-all font-medium"
                      id="reg-input-sec-email"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="Username / Email Address"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-[#f5f5f7] border-0 text-xs text-slate-800 rounded-full pl-11 pr-4 py-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-[#ea2c59]/10 transition-all font-medium"
                      id="reg-input-email"
                    />
                  </div>

                  {/* Optional secondary Mobile field */}
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-3 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="Mobile number (Secondary)"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full bg-[#f5f5f7] border-0 text-xs text-slate-800 rounded-full pl-11 pr-4 py-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-[#ea2c59]/10 transition-all font-mono"
                      id="reg-input-sec-mobile"
                    />
                  </div>
                </>
              )}

              {/* Field 3: BMDC License No */}
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-3 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="BMDC Number (Medical Council No.)"
                  value={bmdcNumber}
                  onChange={(e) => setBmdcNumber(e.target.value)}
                  className="w-full bg-[#f5f5f7] border-0 text-xs text-slate-800 rounded-full pl-11 pr-4 py-2.5 outline-none focus:bg-white font-medium"
                  id="reg-input-bmdc"
                />
              </div>

              {/* Field 4: Custom Password Selection */}
              <div className="relative">
                <Lock className="absolute left-4 top-3 w-3.5 h-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password (minimum 5 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f5f5f7] border-0 text-xs text-slate-800 rounded-full pl-11 pr-11 py-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-[#ea2c59]/10 transition-all font-medium font-sans"
                  id="reg-input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-4 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Toggle view"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Fill Cherry Red Pill Sign Up button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ea2c59] hover:bg-[#d0244cf2] text-white text-xs font-black py-3.5 rounded-full shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 font-sans tracking-wide uppercase mt-2"
                id="btn-sign-up"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : 'Sign Up'}
              </button>
            </form>
          )}

          {/* SCREEN C: OTP INPUT SCREEN (Screen 3 in screenshot design) */}
          {showOtpScreen && (
            <form onSubmit={handleVerifyOtpAndRegister} className="space-y-4">
              
              {/* Individual circular digits cells display */}
              <div className="flex justify-between items-center px-1" id="otp-bubbles-group">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    ref={(el) => { otpInputRefs.current[idx] = el; }}
                    type="text"
                    maxLength={1}
                    required
                    value={digit}
                    onKeyDown={(e) => handleOtpBackspace(idx, e.key)}
                    onChange={(e) => handleOtpKeyTyped(idx, e.target.value)}
                    className="w-10 h-10 border border-slate-200 rounded-full text-center text-lg font-black text-slate-800 bg-slate-50 focus:bg-white focus:border-[#ea2c59] focus:ring-2 focus:ring-[#ea2c59]/10 transition-all font-sans shadow-2xs outline-none"
                  />
                ))}
              </div>

              {otpError && (
                <p className="text-[10px] text-rose-500 text-center font-bold font-sans animate-bounce" id="otp-error-prompt">
                  {otpError}
                </p>
              )}

              {/* Simulated notification banner containing transient OTP to preserve sandbox functionality */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-[10.5px] text-white space-y-1 text-left shadow-lg scale-95 relative overflow-hidden" id="dynamic-verification-island">
                <div className="absolute right-0 top-0 overflow-visible w-20 h-20 bg-rose-500/5 rounded-full -translate-y-6 translate-x-6 shrink-0" />
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-1 mr-0.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#ea2c59] rounded-full animate-ping" />
                    <span className="font-extrabold text-[8.5px] text-rose-400 uppercase tracking-widest pl-1">Device Simulated OTP</span>
                  </div>
                  <span className="text-[7.5px] text-slate-400 font-mono">JUST NOW</span>
                </div>
                <p className="font-mono text-[9px] leading-relaxed text-slate-200">
                  [BDFCPS] Verification OTP passcode is: <span className="text-emerald-400 font-black text-[11px] tracking-widest pl-1">{generatedOtp}</span>. Do not expose.
                </p>
              </div>

              {/* Verify pill button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ea2c59] hover:bg-[#d0244cf2] text-white text-xs font-black py-3.5 rounded-full shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 font-sans tracking-wide uppercase"
                id="btn-otp-verify"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : 'Verify'}
              </button>

              <div className="text-center pt-1" id="resend-otp-group">
                <button
                  type="button"
                  onClick={() => {
                    const freshOtp = Math.floor(100000 + Math.random() * 900000).toString();
                    setGeneratedOtp(freshOtp);
                    setOtpDigits(['', '', '', '', '', '']);
                    setOtpError(null);
                    setErrorMsg('A fresh verification code has been simulated on your device.');
                  }}
                  className="text-[10px] text-[#ea2c59] font-bold hover:underline transition"
                >
                  Didn't get OTP? Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* SCREEN D: FORGET PASSWORD SUB-PAGES */}
          {forgetPasswordMode && (
            <div className="space-y-4" id="forgot-password-layout">
              {/* STEP 1: Enter Username details */}
              {forgotPasswordStep === 'request' && (
                <form onSubmit={handleForgetPasswordRequestSubmit} className="space-y-3.5">
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Username / Mobile or Email"
                      value={pendingForgotUserIdent}
                      onChange={(e) => setPendingForgotUserIdent(e.target.value)}
                      className="w-full bg-[#f5f5f7] border-0 text-xs text-slate-800 rounded-full pl-11 pr-4 py-3 outline-none focus:bg-white font-medium"
                      id="forgot-identifier"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#ea2c59] hover:bg-[#d0244cf2] text-white text-xs font-black py-3.5 rounded-full shadow-lg active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center font-sans tracking-wide uppercase"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Request Code'}
                  </button>
                </form>
              )}

              {/* STEP 2: Verify reset token cells */}
              {forgotPasswordStep === 'verify' && (
                <form onSubmit={handleForgetPasswordVerifyDigits} className="space-y-4">
                  <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-2.5 text-center">
                    <span className="text-[9.5px] text-slate-500 font-semibold block">Recovery Code sent to</span>
                    <p className="text-[10.5px] text-slate-800 font-mono font-bold">{pendingForgotUserIdent}</p>
                  </div>

                  <div className="flex justify-between items-center px-1" id="forgot-otp-bubbles">
                    {forgotOtpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`forgot-otp-input-${idx}`}
                        ref={(el) => { forgotOtpInputRefs.current[idx] = el; }}
                        type="text"
                        maxLength={1}
                        required
                        value={digit}
                        onKeyDown={(e) => handleForgotOtpBackspace(idx, e.key)}
                        onChange={(e) => handleForgotOtpKeyTyped(idx, e.target.value)}
                        className="w-10 h-10 border border-slate-200 rounded-full text-center text-lg font-black text-slate-800 bg-slate-50 focus:bg-white focus:border-[#ea2c59] transition-all font-sans shadow-2xs outline-none"
                      />
                    ))}
                  </div>

                  {/* Notification banner mock recovery */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-[10.5px] text-white space-y-1 text-left shadow-lg scale-95 relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-1">
                      <span className="font-extrabold text-[8.5px] text-rose-400 uppercase tracking-widest pl-1">Simulated SMS Broadcaster</span>
                      <span className="text-[7.5px] text-slate-400 font-mono">NOW</span>
                    </div>
                    <p className="font-mono text-[9px] leading-relaxed text-slate-200">
                      [BDFCPS] Recovery passcode is: <span className="text-emerald-400 font-black text-xs tracking-widest pl-1">{generatedForgotOtp}</span>. Enter to reset password.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#ea2c59] hover:bg-[#d0244cf2] text-white text-xs font-black py-3.5 rounded-full shadow-lg"
                  >
                    Verify Code
                  </button>
                </form>
              )}

              {/* STEP 3: Enter complete brand new password */}
              {forgotPasswordStep === 'new_password' && (
                <form onSubmit={handleForgotPasswordResetSubmit} className="space-y-3.5">
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="Choose New Password"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      className="w-full bg-[#f5f5f7] border-0 text-xs text-slate-800 rounded-full pl-11 pr-4 py-3 outline-none focus:bg-white font-medium"
                      id="forgot-new-password-input"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#ea2c59] hover:bg-[#d0244cf2] text-white text-xs font-black py-3.5 rounded-full shadow-lg"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : 'Reset Password & Login'}
                  </button>
                </form>
              )}

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setForgetPasswordMode(false);
                    setForgotPasswordStep('request');
                    setErrorMsg(null);
                  }}
                  className="text-[10px] text-[#ea2c59] font-bold hover:underline"
                >
                  Back to Sign In page
                </button>
              </div>
            </div>
          )}

          {/* SHARED SOCIAL SINGLE SEPARATOR (Google / Facebook sign-ins) */}
          {showCustomAuthSelection && (
            <>
              <div className="relative flex py-0.5 items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-2 text-[9px] text-slate-400 font-black tracking-widest uppercase">Or</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              {/* Social login elements (Screen 1 & 2 icons/buttons matching design) */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleSocialLaunchPopup('Google')}
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/80 text-[10.5px] font-bold py-3 rounded-full transition-all cursor-pointer shadow-2xs"
                  id="google-pill-button"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.67 0 3.17.58 4.35 1.71l3.24-3.24C17.63 1.71 14.99.71 12 .71 7.37.71 3.42 3.39 1.48 7.3l3.86 2.99C6.27 7.31 8.91 5.04 12 5.04z" />
                    <path fill="#4285F4" d="M23.49 12.27c0-.82-.07-1.61-.21-2.38H12v4.51h6.44c-.28 1.49-1.12 2.76-2.38 3.61l3.7 2.87c2.16-1.99 3.43-4.91 3.43-8.61z" />
                    <path fill="#FBBC05" d="M5.34 14.79a7.16 7.16 0 0 1 0-4.38L1.48 7.42a11.96 11.96 0 0 0 0 10.36l3.86-2.99z" />
                    <path fill="#34A853" d="M12 23.29c3.24 0 5.96-1.08 7.95-2.92l-3.7-2.87c-1.03.69-2.35 1.1-4.25 1.1-3.09 0-5.73-2.27-6.66-5.25L1.48 16.34C3.42 20.61 7.37 23.29 12 23.29z" />
                  </svg>
                  <span>Sign In with Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLaunchPopup('Facebook')}
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/80 text-[10.5px] font-bold py-3 rounded-full transition-all cursor-pointer shadow-2xs"
                  id="facebook-pill-button"
                >
                  <Facebook className="w-3.5 h-3.5 text-[#1877F2] fill-[#1877F2] shrink-0" />
                  <span>Sign In with Facebook</span>
                </button>
              </div>
            </>
          )}

          {/* ACTIVE DISPATCHER FOR NOTICES / ERRORS */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-2.5 rounded-2xl text-[10px] flex items-start gap-2.5 animate-shake" id="shared-auth-error">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span className="leading-tight font-bold">{errorMsg}</span>
            </div>
          )}

          {forgotSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-2.5 rounded-2xl text-[10px] font-extrabold text-center">
              {forgotSuccessMsg}
            </div>
          )}

        </div>
      </div>

      {/* 4. FOOTER TO SWITCH MODES (Matches "Don't have account? Sign Up" indicator link) */}
      {!showOtpScreen && !forgetPasswordMode && (
        <div className="w-full text-center pb-2" id="bottom-links-selector">
          <p className="text-[11px] text-slate-500">
            {authMode === 'signin' ? "Don't have account? " : "Already have account? "}
            <button
              type="button"
              onClick={toggleAuthMode}
              className="text-[#ea2c59] font-black hover:underline cursor-pointer transition ml-1"
              id="switch-modes-link"
            >
              {authMode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      )}

      {/* FOOTER UNDER FORGOT PASSWORD */}
      {forgetPasswordMode && (
        <div className="w-full text-center pb-2">
          <p className="text-[10px] text-slate-400 font-medium">BDFCPS Simulated Sandbox Gateway v4.1</p>
        </div>
      )}

      {/* FOOTER UNDER OTP */}
      {showOtpScreen && (
        <div className="w-full text-center pb-2">
          <p className="text-[10px] text-slate-400 font-medium">Instant simulated credentials dispatcher live</p>
        </div>
      )}

      {/* 5. VIRTUAL EMBEDDED POPUP GLASS INTERFACE FOR BLOCKED ENVIRONMENT SIMULATION */}
      {socialSimModal?.open && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="env-auth-simulator">
          <div className="bg-white rounded-3xl max-w-[285px] w-full p-5 space-y-3 shadow-2xl border border-slate-100 flex flex-col">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <div className={`p-1.5 rounded-full ${socialSimModal.provider === 'Google' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'}`}>
                {socialSimModal.provider === 'Google' ? (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                ) : (
                  <Facebook className="w-3.5 h-3.5 text-[#1877F2] fill-[#1877F2]" />
                )}
              </div>
              <h3 className="text-xs font-black text-slate-800">
                {socialSimModal.provider} Sandbox Emulator
              </h3>
            </div>

            <p className="text-[10px] text-slate-500 leading-relaxed">
              Popups are restricted inside standard preview frames. Simulating authentic Google/Facebook federated profile attributes:
            </p>

            <div className="space-y-2 text-left">
              <div className="space-y-0.5">
                <label className="text-[8px] font-black tracking-wider uppercase text-slate-400 font-sans">Full Name</label>
                <input
                  type="text"
                  required
                  value={socialSimModal.name}
                  onChange={(e) => setSocialSimModal({ ...socialSimModal, name: e.target.value })}
                  className="w-full bg-[#f5f5f7] border-0 text-xs text-slate-800 rounded-full px-3 py-1.5 outline-none focus:bg-white font-semibold font-sans"
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-[8px] font-black tracking-wider uppercase text-slate-400 font-sans">Email Address</label>
                <input
                  type="email"
                  required
                  value={socialSimModal.email}
                  onChange={(e) => setSocialSimModal({ ...socialSimModal, email: e.target.value })}
                  className="w-full bg-[#f5f5f7] border-0 text-xs text-slate-800 rounded-full px-3 py-1.5 outline-none focus:bg-white font-semibold font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSocialSimModal(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-[10.5px] py-2 rounded-full transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  try {
                    const res = await fetch('/api/auth/social', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        provider: socialSimModal.provider,
                        name: socialSimModal.name,
                        email: socialSimModal.email,
                        uid: socialSimModal.uid
                      })
                    });
                    const data = await res.json();
                    if (res.ok && data.success) {
                       setSocialSimModal(null);
                       onAuthSuccess({
                         mobile: data.user.mobile,
                         name: data.user.name,
                         email: data.user.email,
                         bmdcNumber: data.user.bmdcNumber,
                         state: data.user
                       });
                    } else {
                      setErrorMsg(data.error || 'Simulated sync rejected.');
                    }
                  } catch (e) {
                    setErrorMsg('Simulation connection error.');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="bg-[#ea2c59] hover:bg-[#d0244cf2] text-white font-extrabold text-[10.5px] py-2 rounded-full transition cursor-pointer"
              >
                Authenticate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
