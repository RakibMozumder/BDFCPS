import React, { useState } from 'react';
import { 
  User, 
  ArrowLeft, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  School, 
  BookOpen, 
  Layers, 
  Phone, 
  Facebook, 
  Chrome, 
  Apple, 
  Lock, 
  Eye, 
  EyeOff, 
  Smartphone, 
  Volume2, 
  CheckCircle, 
  ChevronRight, 
  Plus, 
  Star, 
  Compass, 
  CreditCard, 
  Bell, 
  History, 
  Gift, 
  AlertCircle, 
  FileText, 
  Settings, 
  Sparkles, 
  LogOut,
  Camera
} from 'lucide-react';
import { DoctorProfile } from '../types';

interface ProfileTabProps {
  doctor: DoctorProfile;
  onUpdateProfile: (newProfile: DoctorProfile) => void;
  onLogout?: () => void;
  mobile?: string;
}

export default function ProfileTab({ 
  doctor, 
  onUpdateProfile, 
  onLogout,
  mobile = '01517016312'
}: ProfileTabProps) {
  // Navigation states: 'Menu' represents the dashboard options. 'Edit' represents personal/academic tabs.
  const [currentScreen, setCurrentScreen] = useState<'Menu' | 'Edit' | 'AvatarSelect' | 'ExamHistory'>('Menu');
  
  // Tabs within the edit screen: 'personal' | 'academic' | 'linking'
  const [activeSubTab, setActiveSubTab] = useState<'personal' | 'academic' | 'linking'>('personal');

  // Input states synchronized with DoctorProfile or local defaults
  const [name, setName] = useState<string>(doctor.name || '');
  const [birthDate, setBirthDate] = useState<string>(doctor.birthDate || '2000-01-01');
  const [studentStatus, setStudentStatus] = useState<string>(doctor.studentStatus || 'Intern Doctor');
  const [address, setAddress] = useState<string>(doctor.address || 'Dhaka, Bangladesh');
  
  const [institution, setInstitution] = useState<string>(doctor.institution || doctor.hospital || 'Dhaka Medical College');
  const [targetTopic, setTargetTopic] = useState<string>(doctor.targetTopic || 'FCPS Part-I');
  const [batch, setBatch] = useState<string>(doctor.batch || 'FCPS Jan 27');

  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [haptics, setHaptics] = useState<boolean>(doctor.hapticsEnabled ?? true);
  const [sounds, setSounds] = useState<boolean>(doctor.soundEffectsEnabled ?? true);

  const [linkedFB, setLinkedFB] = useState<boolean>(doctor.linkedFacebook ?? false);
  const [linkedGoogle, setLinkedGoogle] = useState<boolean>(doctor.linkedGoogle ?? true);
  const [linkedApple, setLinkedApple] = useState<boolean>(doctor.linkedApple ?? false);

  const [showSaveToast, setShowSaveToast] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');

  // Upgrade & Subscription Interactive states
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [loadingUpgrade, setLoadingUpgrade] = useState<boolean>(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState<boolean>(false);
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardName, setCardName] = useState<string>(doctor.name || '');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [mfsNumber, setMfsNumber] = useState<string>(mobile);
  const [mfsPin, setMfsPin] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mfs'>('card');
  const [autoRenew, setAutoRenew] = useState<boolean>(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Exam History retrieval states
  interface DBExamResult {
    id?: string;
    candidateName: string;
    mobile: string;
    bmdcNumber: string;
    score: number;
    correctCount: number;
    totalQuestions: number;
    timestamp: string;
  }
  const [examHistory, setExamHistory] = useState<DBExamResult[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  const loadExamHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/user/${mobile}/results`);
      const data = await res.json();
      if (data.success && data.results) {
        setExamHistory(data.results);
      }
    } catch (err) {
      console.warn("Failed fetching exam history on ProfileTab:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  React.useEffect(() => {
    loadExamHistory();
  }, [mobile]);

  // Custom photo upload reference hooks
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);

  const DEFAULT_AVATAR = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100%25' height='100%25' fill='%23e1e1e1'/%3E%3Ccircle cx='50' cy='41' r='19' fill='%23a3a3a3'/%3E%3Cpath d='M 11 91 C 11 64,%2089 64,%2089%2091 Z' fill='%23a3a3a3'/%3E%3C/svg%3E";

  // Predefined avatar selections
  const avatarsList = [
    DEFAULT_AVATAR
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        // Optimize and compress image on client-side to prevent network/storage payload errors
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            try {
              const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8);
              handleAvatarSelect(compressedDataUrl);
            } catch (err) {
              handleAvatarSelect(dataUrl);
            }
          } else {
            handleAvatarSelect(dataUrl);
          }
        };
        img.src = dataUrl;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAll = () => {
    onUpdateProfile({
      ...doctor,
      name,
      birthDate,
      studentStatus,
      address,
      hospital: institution,
      institution,
      targetTopic,
      batch,
      hapticsEnabled: haptics,
      soundEffectsEnabled: sounds,
      linkedFacebook: linkedFB,
      linkedGoogle: linkedGoogle,
      linkedApple: linkedApple
    });

    setToastMsg("Profile updated successfully!");
    setShowSaveToast(true);
    setTimeout(() => {
      setShowSaveToast(false);
      setCurrentScreen('Menu');
    }, 1500);
  };

  const handleAvatarSelect = (url: string) => {
    onUpdateProfile({
      ...doctor,
      avatar: url
    });
    setToastMsg("Profile picture updated successfully!");
    setShowSaveToast(true);
    setTimeout(() => {
      setShowSaveToast(false);
      setCurrentScreen('Menu');
    }, 1200);
  };

  // Profile completion calc
  const getProfileCompletionPercentage = () => {
    let score = 30; // base from registration info
    if (birthDate && birthDate !== '2000-01-01') score += 15;
    if (studentStatus) score += 10;
    if (address && address !== 'Dhaka, Bangladesh') score += 15;
    if (institution && institution !== 'Dhaka Medical College') score += 15;
    if (linkedFB) score += 10;
    if (linkedApple) score += 5;
    return Math.min(score, 100);
  };

  const completionPercent = getProfileCompletionPercentage();

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto max-h-[580px] pb-24 relative select-none scrollbar-thin scrollbar-thumb-slate-300" id="profile-container-tab">
      
      {/* Toast notifications */}
      {showSaveToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-emerald-500/30 text-white rounded-xl py-2 px-4 shadow-lg text-[11px] font-semibold flex items-center gap-1.5 animate-fadeIn">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Screen 1: MAIN MENU DRAWER (Screenshot 2 Alignment) */}
      {currentScreen === 'Menu' && (
        <div className="flex flex-col px-4 py-5 space-y-4">
          
          {/* Top Bar Header with Close/Settings label */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800 tracking-tight">My Profile</h2>
            <div className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              CBT Premium
            </div>
          </div>

          {/* User Information Big Header (Alignment With Screenshot 2) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col items-center text-center space-y-3 relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-teal-50 text-teal-800 border border-teal-100 rounded-full px-2 py-0.5 text-[8px] font-bold">
              Batch: {batch}
            </div>
            
            {/* Avatar Section */}
            <div className="relative">
              <img 
                src={doctor.avatar} 
                alt={doctor.name} 
                className="w-20 h-20 rounded-full border-4 border-slate-50 shadow-md object-cover"
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={() => setCurrentScreen('AvatarSelect')}
                className="absolute bottom-0 right-0 p-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-full transition shadow hover:scale-105"
                title="Edit Avatar"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-0.5">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center justify-center gap-1">
                {name || doctor.name}
                <ShieldCheck className="w-4 h-4 text-teal-600" />
              </h3>
              <p className="text-[11px] font-mono text-slate-500 font-bold">{mobile}</p>
              <span className="inline-block bg-teal-50 text-teal-800 text-[9px] font-bold px-2 py-0.5 rounded-full mt-1">
                {studentStatus}
              </span>
            </div>

            {/* Profile Completion Warning Widget (From Screenshot 2) */}
            <button 
              onClick={() => { setCurrentScreen('Edit'); setActiveSubTab('personal'); }}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl p-3 flex items-center justify-between text-left transition"
            >
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center text-[10px] text-slate-600 font-bold">
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${completionPercent === 100 ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    {completionPercent === 100 ? 'Profile Complete' : 'Profile Incomplete'}
                  </span>
                  <span>{completionPercent}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${completionPercent === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-3" />
            </button>
          </div>



          {/* List Options Menu (From Screenshot 2) */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
            
            {/* option 1: Personal Info */}
            <button 
              onClick={() => { setCurrentScreen('Edit'); setActiveSubTab('personal'); }}
              className="w-full px-4 py-3 hover:bg-slate-50 flex items-center justify-between text-left transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Personal Information</h4>
                  <p className="text-[9px] text-slate-400">Name, birth date, address, and more</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* option 2: Avatar select */}
            <button 
              onClick={() => setCurrentScreen('AvatarSelect')}
              className="w-full px-4 py-3 hover:bg-slate-50 flex items-center justify-between text-left transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Edit Profile Picture</h4>
                  <p className="text-[9px] text-slate-400">Choose from avatars, camera, or phone gallery</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* option 3: Upgrade Premium */}
            <button 
              onClick={() => {
                setCurrentScreen('Upgrade');
              }}
              className="w-full px-4 py-3 hover:bg-slate-50 flex items-center justify-between text-left transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 animate-pulse">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    Upgrade (Premium License)
                    {doctor.isPremium && (
                      <span className="bg-emerald-100 text-emerald-700 text-[8px] px-1.5 py-0.5 rounded-full font-extrabold font-mono shrink-0">
                        ACTIVE
                      </span>
                    )}
                  </h4>
                  <p className="text-[9px] text-slate-400">
                    {doctor.isPremium ? "Unlocked • Unlimited medical drills active" : "Unlimited mock tests and tracking revision"}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
 
            {/* option 4: Subscription */}
            <button 
              onClick={() => {
                setCurrentScreen('Subscription');
              }}
              className="w-full px-4 py-3 hover:bg-slate-50 flex items-center justify-between text-left transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Subscription</h4>
                  <p className="text-[9px] text-slate-400">
                    {doctor.isPremium 
                      ? `Valid until: ${doctor.subscriptionExpiry || 'October 24, 2026'}` 
                      : "Trial Level • Tap to activate license"}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* option 5: History */}
            <button 
              onClick={() => {
                loadExamHistory();
                setCurrentScreen('ExamHistory');
              }}
              className="w-full px-4 py-3 hover:bg-slate-50 flex items-center justify-between text-left transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Exam History</h4>
                  <p className="text-[9px] text-slate-400">Records of all exams taken before</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* option 6: App settings haptic */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Haptic Feedback</h4>
                  <p className="text-[9px] text-slate-400">Vibration response on every touch & interaction</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={haptics} 
                  onChange={(e) => {
                    setHaptics(e.target.checked);
                    onUpdateProfile({ ...doctor, hapticsEnabled: e.target.checked });
                  }} 
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>

            {/* option 7: Sound settings */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Sound Effects</h4>
                  <p className="text-[9px] text-slate-400">Audio tunes for correct or incorrect answers</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={sounds} 
                  onChange={(e) => {
                    setSounds(e.target.checked);
                    onUpdateProfile({ ...doctor, soundEffectsEnabled: e.target.checked });
                  }} 
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>

            {/* Option 8: Account Logout */}
            {onLogout && (
              <button 
                onClick={onLogout}
                className="w-full px-4 py-3 hover:bg-rose-50 flex items-center justify-between text-left transition text-rose-600"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">Log Out Account</h4>
                    <p className="text-[9px] text-rose-400">Sign out from this device</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-400" />
              </button>
            )}

          </div>

          <p className="text-center text-[9px] font-medium text-slate-400 mt-2">
            BDFCPS © 2026. All rights reserved. Registered for {name || doctor.name}.
          </p>

        </div>
      )}
         {/* Screen 2: DETAILED EDIT PREFERENCES (Alignment With Screenshot 1) */}
      {currentScreen === 'Edit' && (
        <div className="flex flex-col">
          
          {/* Back Header */}
          <div className="bg-white border-b border-slate-200/60 sticky top-0 px-4 py-3 flex items-center justify-between z-10 shrink-0">
            <button 
              onClick={() => setCurrentScreen('Menu')}
              className="p-1 px-2 border border-slate-250 hover:bg-slate-100 rounded-lg text-slate-700 flex items-center gap-1 transition text-xs font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
              <span>Back</span>
            </button>
            <h3 className="text-xs font-extrabold text-slate-850">Personal Info & Settings</h3>
            <button 
              onClick={handleSaveAll}
              className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-extrabold shadow-sm transition active:scale-95"
            >
              Save
            </button>
          </div>

          {/* Sub Tab selection (Personal Info | Academic Info | Account Linking) - Alignment with Screenshot 1 */}
          <div className="bg-white border-b border-slate-200/40 grid grid-cols-3 text-center shrink-0">
            <button 
              onClick={() => setActiveSubTab('personal')}
              className={`py-2.5 text-[10px] font-black transition-all ${
                activeSubTab === 'personal'
                  ? 'text-teal-600 border-b-2 border-teal-500 bg-slate-50/50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Personal Info
            </button>
            <button 
              onClick={() => setActiveSubTab('academic')}
              className={`py-2.5 text-[10px] font-black transition-all ${
                activeSubTab === 'academic'
                  ? 'text-teal-600 border-b-2 border-teal-500 bg-slate-50/50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Academic Info
            </button>
            <button 
              onClick={() => setActiveSubTab('linking')}
              className={`py-2.5 text-[10px] font-black transition-all ${
                activeSubTab === 'linking'
                  ? 'text-teal-600 border-b-2 border-teal-500 bg-slate-50/50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Account Linking
            </button>
          </div>

          {/* Tab Body contents */}
          <div className="p-4 space-y-4">
            
            {/* SUB TAB: PERSONAL (Personal Details) */}
            {activeSubTab === 'personal' && (
              <div className="space-y-3.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Personal Info</span>
                
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 block">Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-850 font-medium focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                {/* Birth Date */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 block">Birth Date</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={birthDate} 
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-850 font-medium focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Student Status */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 block">Status</label>
                  <select 
                    value={studentStatus}
                    onChange={(e) => setStudentStatus(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-850 font-medium focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                  >
                    <option value="Intern Doctor">Intern Doctor</option>
                    <option value="Post-Graduate Student">Post-Graduate Student</option>
                    <option value="General Practitioner">General Practitioner</option>
                    <option value="Medical Student">Medical Student</option>
                  </select>
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 block">Address</label>
                  <input 
                    type="text" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your address"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-850 font-medium focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

              </div>
            )}

            {/* SUB TAB: ACADEMIC (Academic Details) */}
            {activeSubTab === 'academic' && (
              <div className="space-y-3.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Academic Info</span>

                {/* Institution name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 block">College / Hospital Name</label>
                  <input 
                    type="text" 
                    value={institution} 
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Dhaka Medical College"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-850 font-medium focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                {/* Target Preparation Topic */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 block">What exam are you preparing for? (Category)</label>
                  <select 
                    value={targetTopic}
                    onChange={(e) => setTargetTopic(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-850 font-medium focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                  >
                    <option value="FCPS Part-I">FCPS Part-I</option>
                    <option value="FCPS Residency MD/MS">FCPS Residency MD/MS</option>
                    <option value="FCPS Diploma Exams">FCPS Diploma Exam</option>
                    <option value="FCPS Jobs/General Prep">FCPS Jobs / General Prep</option>
                  </select>
                </div>

                {/* Class/Batch */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 block">Batch</label>
                  <select 
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-850 font-medium focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                  >
                    <option value="FCPS Jan 27">FCPS Jan 27</option>
                    <option value="FCPS Jul 26">FCPS Jul 26</option>
                    <option value="FCPS Jan 26">FCPS Jan 26</option>
                    <option value="FCPS Specialty Batch">FCPS Specialty Batch</option>
                  </select>
                </div>

              </div>
            )}

            {/* SUB TAB: LINKING (Account Linking / Security) */}
            {activeSubTab === 'linking' && (
              <div className="space-y-4">
                
                <div className="space-y-4">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Account Linking</span>
                  
                  {/* Phone display */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Phone Number</label>
                    <div className="w-full bg-[#f3f7f9] border border-slate-100 rounded-2xl px-5 py-3 relative flex items-center justify-between text-slate-700">
                      <span className="text-sm font-semibold tracking-wide text-slate-700 font-mono">{mobile}</span>
                      <span className="text-teal-650 text-xs font-extrabold flex items-center gap-1.5 shrink-0">
                        <CheckCircle className="w-4 h-4 text-teal-600 fill-teal-100" /> Verified
                      </span>
                    </div>
                  </div>

                  {/* Social buttons linking */}
                  <div className="flex gap-2.5 text-center mt-4">
                    <button 
                      onClick={() => setLinkedFB(!linkedFB)}
                      className={`flex-1 py-3 border rounded-2xl flex items-center justify-center gap-1.5 text-xs font-black transition-all ${
                        linkedFB 
                          ? 'bg-blue-50/70 border-blue-200 text-blue-600 font-extrabold scale-[1.02]' 
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <Facebook className="w-4 h-4 fill-current border-none" />
                      <span>FB +</span>
                    </button>
                    <button 
                      onClick={() => setLinkedGoogle(!linkedGoogle)}
                      className={`flex-1 py-3 border rounded-2xl flex items-center justify-center gap-1.5 text-xs font-black transition-all ${
                        linkedGoogle 
                          ? 'bg-[#ecfdf5] border-[#10b981] text-[#059669] font-extrabold scale-[1.02]' 
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <Chrome className="w-4 h-4 text-current" />
                      <span>Google +</span>
                    </button>
                    <button 
                      onClick={() => setLinkedApple(!linkedApple)}
                      className={`flex-1 py-3 border rounded-2xl flex items-center justify-center gap-1.5 text-xs font-black transition-all ${
                        linkedApple 
                          ? 'bg-slate-950 border-slate-800 text-white font-extrabold scale-[1.02]' 
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <Apple className="w-4 h-4 fill-current" />
                      <span>Apple +</span>
                    </button>
                  </div>
                </div>

                {/* Password modification form */}
                <div className="pt-2 border-t border-slate-200/50 space-y-3">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Password Settings</span>
                  
                  {/* New Password */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 block">New Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-10 py-2 text-xs font-mono text-slate-850 focus:border-teal-500 focus:outline-hidden"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 block">Confirm Password</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-10 py-2 text-xs font-mono text-slate-850 focus:border-teal-500 focus:outline-hidden"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-2">
              <button 
                onClick={handleSaveAll}
                className="w-full py-2.5 bg-teal-650 hover:bg-teal-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Save Updates
              </button>
            </div>

          </div>


        </div>
      )}

      {/* Screen 3: AVATAR SELECTOR (Screenshot 1 and 2 Alignment) */}
      {currentScreen === 'AvatarSelect' && (
        <div className="flex flex-col">
          <div className="bg-white border-b border-slate-200/60 sticky top-0 px-4 py-3 flex items-center justify-between z-10 shrink-0">
            <button 
              onClick={() => setCurrentScreen('Menu')}
              className="p-1 px-2 border border-slate-250 hover:bg-slate-100 rounded-lg text-slate-700 flex items-center gap-1 transition text-xs font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
              <span>Back</span>
            </button>
            <h3 className="text-xs font-black text-slate-800">Select Profile Picture</h3>
            <div className="w-10" />
          </div>

          <div className="p-4 space-y-4">
            
            {/* Custom Photo Upload options - Requested by User */}
            <div className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200/50 text-center space-y-3">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">
                CUSTOM PROFILE PHOTO
              </span>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Take Photo button */}
                <button 
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-3.5 bg-white border border-slate-200/80 hover:border-teal-500 hover:bg-teal-50/10 rounded-xl transition active:scale-95 cursor-pointer shadow-2xs group"
                >
                  <div className="p-2.5 rounded-full bg-teal-50 text-teal-600 mb-2 group-hover:bg-teal-100 transition">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Take Photo</span>
                  <span className="text-[9px] text-slate-400 font-medium mt-0.5">Use Device Camera</span>
                </button>

                {/* Choose from Library button */}
                <button 
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-3.5 bg-white border border-slate-200/80 hover:border-teal-500 hover:bg-teal-50/10 rounded-xl transition active:scale-95 cursor-pointer shadow-2xs group"
                >
                  <div className="p-2.5 rounded-full bg-violet-50 text-violet-600 mb-2 group-hover:bg-violet-100 transition">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-700">Photo Gallery</span>
                  <span className="text-[9px] text-slate-400 font-medium mt-0.5">Device Library</span>
                </button>
              </div>

              {/* Hidden Standard File Inputs */}
              <input 
                type="file" 
                accept="image/*" 
                capture="user" 
                ref={cameraInputRef} 
                className="hidden" 
                onChange={handleFileChange} 
              />
              <input 
                type="file" 
                accept="image/*" 
                ref={galleryInputRef} 
                className="hidden" 
                onChange={handleFileChange} 
              />
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-[9px] font-bold tracking-widest uppercase">Or Choose Avatar</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="flex justify-center py-2">
              {avatarsList.map((avatarUrl, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleAvatarSelect(avatarUrl)}
                  className={`p-4 bg-white rounded-2xl border text-center transition hover:scale-103 active:scale-95 max-w-[150px] ${
                    doctor.avatar === avatarUrl ? 'border-teal-500 bg-teal-50/25 shadow-sm' : 'border-slate-200'
                  }`}
                >
                  <img 
                    src={avatarUrl} 
                    alt={`Avatar ${idx}`} 
                    className="w-16 h-16 rounded-full mx-auto object-cover border border-slate-100"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[11px] text-slate-500 font-bold block mt-2">
                    Default Avatar
                  </span>
                </button>
              ))}
            </div>

            <p className="text-[10.5px] text-slate-400 text-center leading-relaxed font-medium mt-4">
              Once changes are made, the avatar will be saved directly to your profile.
            </p>
          </div>
        </div>
      )}

      {/* Screen 4: EXAM HISTORY */}
      {currentScreen === 'ExamHistory' && (
        <div className="flex flex-col bg-slate-50 min-h-full">
          {/* Back Header */}
          <div className="bg-white border-b border-slate-200/65 sticky top-0 px-4 py-3.5 flex items-center justify-between z-10 shrink-0 shadow-3xs">
            <button 
              onClick={() => setCurrentScreen('Menu')}
              className="p-1 px-2.5 border border-slate-205 hover:bg-slate-50 rounded-xl text-slate-700 flex items-center gap-1 transition text-xs font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
              <span>Back</span>
            </button>
            <h3 className="text-xs font-extrabold text-slate-850 tracking-tight">Exam History</h3>
            <div className="w-[50px]"></div> {/* spacer spacer to center title */}
          </div>

          <div className="p-4 space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-3xs col-span-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">History Overview</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-teal-50/40 rounded-xl p-3 border border-teal-100/30 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block mb-0.5">Exams Completed</span>
                  <span className="text-lg font-black text-teal-700">{examHistory.length}</span>
                </div>
                <div className="bg-indigo-50/40 rounded-xl p-3 border border-indigo-100/30 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block mb-0.5">Avg Accuracy</span>
                  <span className="text-lg font-black text-indigo-700">
                    {examHistory.length > 0 
                      ? `${Math.round(examHistory.reduce((sum, item) => sum + item.score, 0) / examHistory.length)}%` 
                      : '0%'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Taken Exam Sessions</span>
              
              {loadingHistory ? (
                <div className="py-12 text-center text-xs text-slate-400 font-bold">
                  Loading performance records...
                </div>
              ) : examHistory.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 space-y-2 shadow-3xs">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <History className="w-5 h-5 text-slate-550" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-700">No Exam History Yet</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed max-w-[200px] mx-auto font-medium">
                    Take a live mock test or customize your clinical SBA drills to see detailed records here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...examHistory].reverse().map((result, index) => {
                    const formattedDate = new Date(result.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    
                    const isPassed = result.score >= 55; // standard exam pass criteria
                    
                    return (
                      <div 
                        key={result.id || index} 
                        className="bg-white rounded-2xl p-4 border border-slate-100 shadow-3xs hover:shadow-2xs transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-100">
                              MOCK TEST
                            </span>
                            <h4 className="text-[11px] font-black text-slate-800 leading-snug">
                              FCPS Medicine SBA Paper
                            </h4>
                            <p className="text-[9px] text-slate-400 font-medium">{formattedDate}</p>
                          </div>
                          <div className="text-right shrink-0 space-y-1">
                            <div className="text-sm font-black text-slate-800 font-mono tracking-xs">
                              {result.score}%
                            </div>
                            <span className={`inline-block text-[8px] font-black px-1.5 py-0.5 rounded-md ${
                              isPassed 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                : 'bg-red-50 text-red-600 border border-red-100'
                            }`}>
                              {result.correctCount}/{result.totalQuestions} MCQ • {isPassed ? 'PASSED' : 'RETRY'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Screen 5: UPGRADE PREMIUM SYSTEM */}
      {currentScreen === 'Upgrade' && (
        <div className="flex flex-col bg-slate-50 min-h-full">
          {/* Back Header */}
          <div className="bg-white border-b border-slate-200/65 sticky top-0 px-4 py-3.5 flex items-center justify-between z-10 shrink-0 shadow-3xs">
            <button 
              onClick={() => {
                setUpgradeSuccess(false);
                setCurrentScreen('Menu');
              }}
              className="p-1 px-2.5 border border-slate-205 hover:bg-slate-50 rounded-xl text-slate-700 flex items-center gap-1 transition text-xs font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
              <span>Back</span>
            </button>
            <h3 className="text-xs font-extrabold text-slate-850 tracking-tight">Upgrade License</h3>
            <div className="w-[50px]"></div>
          </div>

          <div className="p-4 space-y-4">
            
            {/* If successful */}
            {upgradeSuccess ? (
              <div className="bg-white rounded-3xl p-6 border border-teal-100 text-center space-y-4 shadow-sm animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck className="w-9 h-9 fill-emerald-100" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-800">License Activated!</h3>
                  <p className="text-xs text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                    Congratulations <strong>{doctor.name}</strong>! Your FCPS CBT Mock Exam & Intelligent driller pro key has been linked to your mobile successfully.
                  </p>
                </div>
                <div className="bg-[#f0fdf4] rounded-2xl p-4 border border-emerald-100 max-w-[280px] mx-auto text-left space-y-2">
                  <div className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> All premium privileges unlocked:
                  </div>
                  <ul className="text-[10px] text-slate-600 space-y-1 font-medium list-disc list-inside">
                    <li>3,600+ Real CPSP format clinical SBAs</li>
                    <li>Adaptive Weak-chapter diagnostics list</li>
                    <li>Automated Google Sheets spreadsheet sync</li>
                    <li>Verification Active Status indicator</li>
                  </ul>
                </div>
                <button
                  onClick={() => {
                    setUpgradeSuccess(false);
                    setCurrentScreen('Subscription');
                  }}
                  className="w-full bg-teal-650 hover:bg-teal-700 text-white py-3 rounded-2xl text-xs font-black transition shadow-sm active:scale-98"
                >
                  View Subscription Timeline
                </button>
              </div>
            ) : doctor.isPremium ? (
              /* Already Premium License State */
              <div className="bg-white rounded-3xl p-6 border border-slate-100 text-center space-y-4 shadow-3xs">
                <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                  <Star className="w-7 h-7 fill-amber-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-800">Premium active</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed max-w-[230px] mx-auto">
                    You have unlocked unlimited medical drill attempts. Subscription is valid until {doctor.subscriptionExpiry || 'October 24, 2026'}.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentScreen('Subscription')}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition"
                >
                  View Invoices & Billing Details
                </button>
              </div>
            ) : (
              /* Core Checkout Experience */
              <div className="space-y-4">
                
                {/* Header Feature banner */}
                <div className="bg-gradient-to-br from-teal-900 to-indigo-950 text-white rounded-3xl p-5 relative overflow-hidden shadow-2xs">
                  <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 rounded-full bg-teal-500 hover:bg-teal-400 opacity-20 filter blur-xl"></div>
                  <div className="relative space-y-2.5">
                    <span className="bg-amber-400 text-slate-900 text-[8px] font-black px-2 mt-0.5 py-0.5 rounded-full tracking-wider uppercase inline-block">
                      SPECIALIST PREPARATION SUITE
                    </span>
                    <h4 className="text-sm font-black tracking-tight max-w-[220px]">
                      Crack FCPS Part-I with the ultimate CBT Driller Key
                    </h4>
                    <p className="text-[10px] text-teal-200 leading-relaxed font-semibold max-w-[260px]">
                      Join 1,200+ selected candidates. Get instant access to full clinical modules, detailed explanations and automatic tracking progress!
                    </p>
                  </div>
                </div>

                {/* Pricing Tab Selection */}
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Choose License Plan</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedPlan('monthly')}
                    className={`p-3.5 bg-white rounded-2.5xl border text-left transition-all relative ${
                      selectedPlan === 'monthly' ? 'border-teal-500 ring-1 ring-teal-500 bg-teal-50/5' : 'border-slate-250/70 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">6-MONTH ACCESS</span>
                    <span className="text-sm font-black text-slate-800">৳1,500 <span className="text-[10px] font-semibold text-slate-500">BDT</span></span>
                    <span className="text-[9.5px] font-bold text-slate-400 block mt-1.5">SBA Driller Basic</span>
                  </button>

                  <button
                    onClick={() => setSelectedPlan('yearly')}
                    className={`p-3.5 bg-white rounded-2.5xl border text-left transition-all relative overflow-hidden ${
                      selectedPlan === 'yearly' ? 'border-teal-500 ring-1 ring-teal-500 bg-teal-50/5' : 'border-slate-250/70 hover:bg-slate-50'
                    }`}
                  >
                    <div className="absolute right-0 top-0 bg-amber-400 text-slate-950 text-[7px] font-black px-2 py-0.5 rounded-bl-lg tracking-wider uppercase">
                      BEST VALUE
                    </div>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">12-MONTH ACCESS</span>
                    <span className="text-sm font-black text-slate-800">৳2,500 <span className="text-[10px] font-semibold text-slate-500">BDT</span></span>
                    <span className="text-[9.5px] font-bold text-emerald-600 block mt-1.5 flex items-center gap-0.5">
                      <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" /> CPSP Pass Guarantee
                    </span>
                  </button>
                </div>

                {/* Switchable Payment Methods */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-3xs space-y-4">
                  <div className="flex border-b border-slate-100 pb-3 justify-between items-center text-xs">
                    <span className="font-extrabold text-slate-700">Payment Gateway</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setPaymentMethod('card')}
                        className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${
                          paymentMethod === 'card' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-650'
                        }`}
                      >
                        Credit Card
                      </button>
                      <button 
                        onClick={() => setPaymentMethod('mfs')}
                        className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${
                          paymentMethod === 'mfs' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-650'
                        }`}
                      >
                        bKash / Nagad
                      </button>
                    </div>
                  </div>

                  {paymentMethod === 'card' ? (
                    /* Credit Card Mock Input */
                    <div className="space-y-3.5">
                      
                      {/* Virtual interactive credit card layout */}
                      <div className="bg-gradient-to-tr from-indigo-900 via-slate-800 to-slate-900 rounded-2xl p-4 text-white relative shadow-inner overflow-hidden font-mono text-[9px] h-[100px] flex flex-col justify-between">
                        <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 w-16 h-16 rounded-full bg-white opacity-5"></div>
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] font-bold font-sans text-teal-400 tracking-wider">CBT SECURE PLATFORM</span>
                          <span className="font-bold text-[10px] italic">VISA</span>
                        </div>
                        <div className="text-[12px] font-bold tracking-widest text-center py-2">
                          {cardNumber ? cardNumber.replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                        </div>
                        <div className="flex justify-between gap-2 text-[7px] text-slate-350">
                          <div>
                            <span className="block text-[6px] text-slate-400 uppercase font-sans">Cardholder</span>
                            <span className="font-bold whitespace-nowrap text-white">{cardName || 'Dr. Candidate'}</span>
                          </div>
                          <div className="text-right">
                            <span className="block text-[6px] text-slate-400 uppercase font-sans">Expiry</span>
                            <span className="font-bold text-white">{cardExpiry || 'MM/YY'}</span>
                          </div>
                          <div className="text-right">
                            <span className="block text-[6px] text-slate-400 uppercase font-sans">CVV</span>
                            <span className="font-bold text-white font-mono">{cardCvv ? '•••' : '000'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Explicit interactive form inputs */}
                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block mb-1">Card Number</label>
                          <input 
                            type="text"
                            maxLength={16}
                            placeholder="4242 4242 4242 4242"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-1">Expiration Date</label>
                            <input 
                              type="text"
                              maxLength={5}
                              placeholder="MM/YY"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-1">Security Code (CVV)</label>
                            <input 
                              type="password"
                              maxLength={3}
                              placeholder="•••"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  ) : (
                    /* Mobile MFS Mock Inputs */
                    <div className="space-y-3.5">
                      <div className="p-3 bg-pink-50/40 rounded-xl border border-pink-100 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-pink-500 text-white font-black text-xs flex items-center justify-between justify-center uppercase select-none shrink-0 scale-95 shadow-sm">
                          b
                        </div>
                        <div className="text-[10px] text-slate-650 leading-relaxed font-semibold">
                          Complete payment securely with <strong>bKash or Nagad wallet</strong>. Your dynamic OTP verification screen triggers automatically.
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Mobile Wallet Number</label>
                          <input 
                            type="text"
                            placeholder="e.g. 01712345678"
                            value={mfsNumber}
                            onChange={(e) => setMfsNumber(e.target.value)}
                            className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Wallet PIN (Virtual Encrypted)</label>
                          <input 
                            type="password"
                            placeholder="••••"
                            maxLength={4}
                            value={mfsPin}
                            onChange={(e) => setMfsPin(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500 tracking-widest font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit pay actions */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setLoadingUpgrade(true);
                        setTimeout(() => {
                          setLoadingUpgrade(false);
                          setUpgradeSuccess(true);
                          
                          // Save the true premium upgrade to DoctorProfile state with proper timeline trigger
                          onUpdateProfile({
                            ...doctor,
                            isPremium: true,
                            subscriptionExpiry: selectedPlan === 'yearly' ? 'June 21, 2027' : 'December 21, 2026'
                          });

                          setToastMsg("Premium plan unlocked successfully!");
                          setShowSaveToast(true);
                          setTimeout(() => setShowSaveToast(false), 2000);
                        }, 1800);
                      }}
                      disabled={loadingUpgrade}
                      className="w-full bg-[#0a5c5a] hover:bg-teal-800 disabled:bg-slate-400 text-white font-black py-3 rounded-2xl text-xs tracking-wide transition shadow-sm flex items-center justify-center gap-2"
                    >
                      <Lock className="w-3.5 h-3.5 text-teal-200" />
                      {loadingUpgrade ? "Processing Sandbox Gateway..." : `Pay ৳${selectedPlan === 'yearly' ? '2,500' : '1,500'} & Activate Premium`}
                    </button>
                    <p className="text-[9px] text-slate-400 text-center font-medium mt-2 leading-relaxed">
                      SSL/TLS 256-bit Encrypted Transaction. Rest assured, you can safely trigger this mock checkout sandbox freely to simulate full pro privileges.
                    </p>
                  </div>

                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* Screen 6: SUBSCRIPTION TIMELINE & BILLING */}
      {currentScreen === 'Subscription' && (
        <div className="flex flex-col bg-slate-50 min-h-full">
          {/* Back Header */}
          <div className="bg-white border-b border-slate-200/65 sticky top-0 px-4 py-3.5 flex items-center justify-between z-10 shrink-0 shadow-3xs">
            <button 
              onClick={() => setCurrentScreen('Menu')}
              className="p-1 px-2.5 border border-slate-205 hover:bg-slate-50 rounded-xl text-slate-700 flex items-center gap-1 transition text-xs font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
              <span>Back</span>
            </button>
            <h3 className="text-xs font-extrabold text-slate-850 tracking-tight">My Subscription</h3>
            <div className="w-[50px]"></div>
          </div>

          <div className="p-4 space-y-4">
            
            {/* Status card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-3xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-0.5">CURRENT TIMELINE</span>
                  <h3 className="text-sm font-black text-slate-800">
                    {doctor.isPremium ? "FCPS CBT Ultimate Pass" : "Regular Basic Plan"}
                  </h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-extrabold font-mono flex items-center gap-1 ${
                  doctor.isPremium 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                    : 'bg-amber-50 text-amber-600 border border-amber-100'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${doctor.isPremium ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></span>
                  {doctor.isPremium ? 'PRO ACTIVE' : 'FREE BASIC'}
                </span>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 divide-y divide-slate-105-to-transparent text-[11px] font-bold space-y-2.5">
                <div className="flex justify-between pt-0 text-slate-600">
                  <span>Billing Period:</span>
                  <span className="text-slate-800 font-mono">
                    {doctor.isPremium ? 'June 21, 2026 - Present' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 text-slate-600">
                  <span>Valid Until Date:</span>
                  <span className="text-slate-800 font-mono">
                    {doctor.isPremium ? (doctor.subscriptionExpiry || 'October 24, 2026') : 'N/A'}
                  </span>
                </div>
                {doctor.isPremium && (
                  <div className="flex justify-between pt-2 text-slate-600 hover:opacity-90">
                    <span>Auto-renew membership:</span>
                    <button 
                      onClick={() => {
                        setAutoRenew(!autoRenew);
                        setToastMsg(autoRenew ? "Auto-renew disabled successfully" : "Auto-renew enabled successfully");
                        setShowSaveToast(true);
                        setTimeout(() => setShowSaveToast(false), 1500);
                      }}
                      className={`w-8 h-4.5 rounded-full p-0.5 transition-all outline-none ${
                        autoRenew ? 'bg-[#0a5c5a] flex justify-end' : 'bg-slate-300 flex justify-start'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 bg-white rounded-full block shadow-sm shrink-0"></span>
                    </button>
                  </div>
                )}
              </div>

              {/* If not premium, quick CTA to upgrade */}
              {!doctor.isPremium && (
                <button
                  onClick={() => setCurrentScreen('Upgrade')}
                  className="w-full bg-[#0a5c5a] hover:bg-teal-800 text-white font-black py-2.5 rounded-2xl text-[11px] transition shadow-inner active:scale-98 flex items-center justify-center gap-1.5"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> Upgrade Candidate License Now
                </button>
              )}
            </div>

            {/* Simulated invoices receipts */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Invoices & Receipts History</span>
              
              {doctor.isPremium ? (
                <div className="space-y-2.5">
                  {[
                    { id: 'INV-2026-0601', desc: 'FCPS CBT License Yearly Pass-Key', date: 'Jun 21, 2026', amt: '৳2,500', method: 'Visa Card **4242' },
                    { id: 'INV-2026-0515', desc: 'Anatomy Paper-I SBA Booster Pack', date: 'May 15, 2026', amt: '৳450', method: 'bKash Wallet' }
                  ].map((inv) => (
                    <div 
                      key={inv.id}
                      onClick={() => setSelectedInvoice(inv)}
                      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-3xs flex items-center justify-between hover:border-slate-200 transition cursor-pointer"
                    >
                      <div className="space-y-1">
                        <h4 className="text-[11px] font-black text-slate-800 leading-tight">{inv.desc}</h4>
                        <div className="flex items-center gap-2 text-[9px] text-slate-400 font-semibold font-mono">
                          <span>{inv.id}</span>
                          <span>•</span>
                          <span>{inv.date}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 space-y-1">
                        <div className="text-[11px] font-black font-mono text-slate-800">{inv.amt}</div>
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8px] font-extrabold font-mono px-1.5 py-0.5 rounded">
                          PAID
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-6 text-center border border-slate-100 text-slate-400 text-xs font-bold shadow-3xs">
                  <FileText className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                  No invoice records available for Basic Plan
                </div>
              )}
            </div>

            {/* Cancel subscription simulator if Premium */}
            {doctor.isPremium && (
              <div className="pt-2 text-center">
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to cancel your Premium License and fall back to Basic level? \nThis resets unlimited drills access.")) {
                      onUpdateProfile({
                        ...doctor,
                        isPremium: false,
                        subscriptionExpiry: undefined
                      });
                      setToastMsg("Premium plan canceled successfully");
                      setShowSaveToast(true);
                      setTimeout(() => setShowSaveToast(false), 1500);
                      setCurrentScreen('Menu');
                    }
                  }}
                  className="text-red-500 hover:text-red-700 text-[10px] font-bold tracking-tight border border-red-200/50 hover:bg-red-50/50 bg-white px-4 py-2 rounded-xl transition"
                >
                  Downgrade Account to Standard Basic
                </button>
              </div>
            )}

          </div>

          {/* Detailed Invoice modal popup inside frame */}
          {selectedInvoice && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xs flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="bg-white rounded-3xl w-full max-w-[320px] p-5 border border-slate-200/60 shadow-xl space-y-4">
                <div className="flex justify-between items-center border-b border-dashed border-slate-150 pb-3">
                  <div>
                    <h4 className="text-xs font-black text-slate-800">CBT Platform Invoice</h4>
                    <span className="text-[9px] text-slate-400 font-mono">{selectedInvoice.id}</span>
                  </div>
                  <span className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[8px] font-extrabold px-2 py-0.5 rounded-full font-mono">
                    COMPLETED
                  </span>
                </div>

                <div className="space-y-3 text-[10.5px]">
                  <div className="flex justify-between">
                    <span className="text-slate-450 font-bold">Candidate:</span>
                    <span className="text-slate-800 font-semibold">{doctor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450 font-bold">Hospital:</span>
                    <span className="text-slate-800 font-semibold text-right max-w-[150px] truncate">{doctor.hospital}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450 font-bold">Transaction Date:</span>
                    <span className="text-slate-800 font-mono">{selectedInvoice.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450 font-bold">Method:</span>
                    <span className="text-slate-800 font-mono">{selectedInvoice.method}</span>
                  </div>
                  
                  <div className="bg-slate-50/70 rounded-xl p-2.5 border border-slate-100 mt-2 space-y-1.5 text-[9.5px]">
                    <div className="flex justify-between font-extrabold text-slate-650">
                      <span>{selectedInvoice.desc}</span>
                      <span className="font-mono">{selectedInvoice.amt}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 font-bold text-[8px]">
                      <span>Intelligent MCQ Engine License Key Fee</span>
                      <span>৳0.00</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-dashed border-slate-150 pt-3 text-xs font-black text-slate-850">
                    <span>Total Charged:</span>
                    <span className="font-mono text-teal-700">{selectedInvoice.amt} BDT</span>
                  </div>
                </div>

                <div className="flex gap-2 text-center pt-2">
                  <button
                    onClick={() => {
                      setToastMsg("Simulating Invoice Receipt PDF Download...");
                      setShowSaveToast(true);
                      setTimeout(() => setShowSaveToast(false), 2000);
                    }}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-xl text-[10px] font-extrabold transition"
                  >
                    Download Receipt
                  </button>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-650 py-2 rounded-xl text-[10px] font-extrabold transition"
                  >
                    Close View
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
