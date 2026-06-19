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
  const [currentScreen, setCurrentScreen] = useState<'Menu' | 'Edit' | 'AvatarSelect'>('Menu');
  
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

  // Custom photo upload reference hooks
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);

  // Predefined avatar selections
  const avatarsList = [
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200', // Female Doctor
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200', // Male Doctor
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200', // Young Doctor
    'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200', // Pediatrician
    'https://images.unsplash.com/photo-1622902046580-2b47f47f0471?auto=format&fit=crop&q=80&w=200', // Surgeon
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

          {/* Social Accounts Quick-linking Wrapper (From Screenshot 2) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-2.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Link Accounts</span>
            <div className="flex gap-2.5">
              {/* Facebook Link */}
              <button 
                onClick={() => setLinkedFB(!linkedFB)}
                className={`flex-1 py-1.5 px-3 border rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-bold transition active:scale-95 ${
                  linkedFB 
                    ? 'bg-blue-50 border-blue-200 text-blue-600' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Facebook className="w-3.5 h-3.5 fill-blue-600 border-none" />
                <span>Facebook</span>
                {linkedFB ? <span className="text-[9px] text-emerald-500">✓</span> : <Plus className="w-3 h-3 text-slate-400" />}
              </button>

              {/* Google Link */}
              <button 
                onClick={() => setLinkedGoogle(!linkedGoogle)}
                className={`flex-1 py-1.5 px-3 border rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-bold transition active:scale-95 ${
                  linkedGoogle 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Chrome className="w-3.5 h-3.5" />
                <span>Google</span>
                {linkedGoogle ? <span className="text-[9px] text-emerald-500">✓</span> : <Plus className="w-3 h-3 text-slate-400" />}
              </button>

              {/* Apple Link */}
              <button 
                onClick={() => setLinkedApple(!linkedApple)}
                className={`flex-1 py-1.5 px-3 border rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-bold transition active:scale-95 ${
                  linkedApple 
                    ? 'bg-slate-900 border-slate-800 text-white' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Apple className="w-3.5 h-3.5 fill-current" />
                <span>Apple</span>
                {linkedApple ? <span className="text-[9px] text-teal-400">✓</span> : <Plus className="w-3 h-3 text-slate-400" />}
              </button>
            </div>
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
                setToastMsg("Premium features are unlocked in developer sandbox mode!");
                setShowSaveToast(true);
                setTimeout(() => setShowSaveToast(false), 1500);
              }}
              className="w-full px-4 py-3 hover:bg-slate-50 flex items-center justify-between text-left transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Upgrade (Premium License)</h4>
                  <p className="text-[9px] text-slate-400">Unlimited mock tests and tracking revision</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* option 4: Subscription */}
            <button 
              onClick={() => {
                setToastMsg("Your premium subscription is currently active");
                setShowSaveToast(true);
                setTimeout(() => setShowSaveToast(false), 1500);
              }}
              className="w-full px-4 py-3 hover:bg-slate-50 flex items-center justify-between text-left transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Subscription</h4>
                  <p className="text-[9px] text-slate-400">Valid until: October 24, 2026</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* option 5: History */}
            <button 
              onClick={() => {
                setToastMsg("Mock test history has been refreshed");
                setShowSaveToast(true);
                setTimeout(() => setShowSaveToast(false), 1500);
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
                
                <div className="space-y-3">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Account Linking</span>
                  
                  {/* Phone display */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 block">Phone Number</label>
                    <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-600 font-mono font-semibold flex items-center justify-between">
                      <span>{mobile}</span>
                      <span className="text-teal-600 text-[10px] font-bold flex items-center gap-0.5">
                        <CheckCircle className="w-3.5 h-3.5 fill-teal-100" /> Verified
                      </span>
                    </div>
                  </div>

                  {/* Social buttons linking */}
                  <div className="flex gap-2 text-center">
                    <button 
                      onClick={() => setLinkedFB(!linkedFB)}
                      className={`flex-1 py-2 border rounded-xl flex items-center justify-center gap-1 text-[11px] font-black transition ${
                        linkedFB ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      <Facebook className="w-3.5 h-3.5 fill-current border-none" />
                      <span>FB +</span>
                    </button>
                    <button 
                      onClick={() => setLinkedGoogle(!linkedGoogle)}
                      className={`flex-1 py-2 border rounded-xl flex items-center justify-center gap-1 text-[11px] font-black transition ${
                        linkedGoogle ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      <Chrome className="w-3.5 h-3.5" />
                      <span>Google +</span>
                    </button>
                    <button 
                      onClick={() => setLinkedApple(!linkedApple)}
                      className={`flex-1 py-2 border rounded-xl flex items-center justify-center gap-1 text-[11px] font-black transition ${
                        linkedApple ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      <Apple className="w-3.5 h-3.5 fill-current" />
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

            <div className="grid grid-cols-2 gap-4">
              {avatarsList.map((avatarUrl, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleAvatarSelect(avatarUrl)}
                  className={`p-2 bg-white rounded-2xl border text-center transition hover:shadow-md active:scale-95 ${
                    doctor.avatar === avatarUrl ? 'border-teal-500 bg-teal-50/20 shadow-sm' : 'border-slate-200'
                  }`}
                >
                  <img 
                    src={avatarUrl} 
                    alt={`Avatar ${idx}`} 
                    className="w-16 h-16 rounded-full mx-auto object-cover border border-slate-100"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[10px] text-slate-500 font-bold block mt-2">
                    {idx === 0 ? 'Pleasant Doctor' : idx === 1 ? 'Stylish Male' : idx === 2 ? 'Young Doctor' : idx === 3 ? 'Pediatric Doctor' : 'Surgeon Specialist'}
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

    </div>
  );
}
