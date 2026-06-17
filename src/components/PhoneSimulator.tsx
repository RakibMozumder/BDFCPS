import React, { useState } from 'react';
import { 
  Home as HomeIcon, 
  Activity as LiveIcon, 
  BookOpen as PracticeIcon, 
  BarChart2 as AnalyticsIcon, 
  Wifi, 
  Battery, 
  Signal, 
  ShieldCheck,
  Lock
} from 'lucide-react';
import { DoctorProfile, Exam, Question, UserProgress, SubjectCategory } from '../types';
import HomeTab from './HomeTab';
import LiveExamsTab from './LiveExamsTab';
import PracticeTab from './PracticeTab';
import AnalyticsTab from './AnalyticsTab';
import AuthScreen from './AuthScreen';

interface WeakChapter {
  chapter: string;
  category: SubjectCategory;
  accuracy: number;
  count: number;
  topic: string;
}

interface PhoneSimulatorProps {
  doctor: DoctorProfile;
  exams: Exam[];
  questions: Question[];
  progress: UserProgress;
  onSolveQuestion: (correct: boolean, question?: Question) => void;
  onCompleteExam: (score: number, wrongQuestions?: Question[]) => void;
  startExamTrigger?: string | null;
  clearStartExamTrigger?: () => void;
  onChangeTabInSimulator?: (tabId: string) => void;
  onUpdateQuestions?: (qs: Question[]) => void;

  // Authentication State
  isAuthenticated: boolean;
  onAuthSuccess: (doctorData: { name: string; email: string; bmdcNumber: string }) => void;

  // Adaptive Remediation
  weakChapters: WeakChapter[];
  onDrillChapter: (category: SubjectCategory) => void;

  // Alarm Reminders
  reminderEnabled: boolean;
  onToggleReminder: (enabled: boolean) => void;
  reminderTime: string;
  onSelectReminderTime: (time: string) => void;

  questionsSolvedToday: number;
}

export default function PhoneSimulator({
  doctor,
  exams,
  questions,
  progress,
  onSolveQuestion,
  onCompleteExam,
  startExamTrigger,
  clearStartExamTrigger,
  onChangeTabInSimulator,
  onUpdateQuestions,

  isAuthenticated,
  onAuthSuccess,

  weakChapters,
  onDrillChapter,

  reminderEnabled,
  onToggleReminder,
  reminderTime,
  onSelectReminderTime,
  questionsSolvedToday
}: PhoneSimulatorProps) {
  const [platform, setPlatform] = useState<'iOS' | 'Android'>('iOS');
  const [activeTab, setActiveTab] = useState<'Home' | 'Live' | 'Practice' | 'Analytics'>('Home');
  const [batteryLevel] = useState<number>(98);

  // Sync clock time (simulate actual device status clock)
  const [timeStr, setTimeStr] = useState<string>('08:00 AM');
  React.useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${hours}:${minutes} ${ampm}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleHomeExamShortcut = () => {
    setActiveTab('Live');
    if (onChangeTabInSimulator) onChangeTabInSimulator('Live');
  };

  const handleDrillChapterRouting = (category: SubjectCategory) => {
    // Call drill callbacks
    onDrillChapter(category);
    // Switch to Practice deck list with specific focus
    setActiveTab('Practice');
  };

  // Render proper viewport tab
  const renderPlatformScreen = () => {
    if (!isAuthenticated) {
      return <AuthScreen onAuthSuccess={onAuthSuccess} />;
    }

    switch (activeTab) {
      case 'Home':
        return (
          <HomeTab 
            doctor={doctor} 
            streakCount={progress.streakCount} 
            onNavigateToTab={(tabId) => {
              if (tabId === 'Live') setActiveTab('Live');
              else if (tabId === 'Practice') setActiveTab('Practice');
              else if (tabId === 'Analytics') setActiveTab('Analytics');
            }}
            onStartExam={handleHomeExamShortcut}
            weakChapters={weakChapters}
            onDrillChapter={handleDrillChapterRouting}
            reminderEnabled={reminderEnabled}
            onToggleReminder={onToggleReminder}
            reminderTime={reminderTime}
            onSelectReminderTime={onSelectReminderTime}
            questionsSolvedToday={questionsSolvedToday}
          />
        );
      case 'Live':
        return (
          <LiveExamsTab 
            exams={exams} 
            onCompleteExam={onCompleteExam}
            startExamId={startExamTrigger}
            clearStartExamId={clearStartExamTrigger}
          />
        );
      case 'Practice':
        return (
          <PracticeTab 
            questions={questions} 
            onSolveQuestion={onSolveQuestion} 
            onUpdateQuestions={onUpdateQuestions}
          />
        );
      case 'Analytics':
        return (
          <AnalyticsTab 
            progress={progress} 
            doctorName={doctor.name}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4" id="simulated-device-container">
      
      {/* Platform Selection Switcher bar */}
      <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm z-10" id="platform-switcher">
        <button
          onClick={() => setPlatform('iOS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all focus:outline-none flex items-center gap-1.5 ${
            platform === 'iOS' 
              ? 'bg-slate-900 text-white shadow' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}
          id="toggle-ios-btn"
        >
          <span></span> iOS Emulator
        </button>
        <button
          onClick={() => setPlatform('Android')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all focus:outline-none flex items-center gap-1.5 ${
            platform === 'Android' 
              ? 'bg-slate-900 text-white shadow' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}
          id="toggle-android-btn"
        >
          <span className="text-emerald-500 text-base">🤖</span> Android Emulator
        </button>
      </div>

      {/* Structural Phone Body shell mockup */}
      <div className="relative mx-auto bg-slate-950 rounded-[44px] p-3.5 shadow-2xl border-[5px] border-slate-800 ring-4 ring-slate-900 w-[345px] h-[720px] select-none flex flex-col justify-between overflow-hidden" id="phone-hardware-shell shadow-2xl">
        
        {/* Apple curved camera notch or Android camera hole-punch */}
        {platform === 'iOS' ? (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 transition-all flex items-center justify-center gap-1.5 px-3">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-800" />
            <div className="w-2.5 h-1 bg-teal-500/10 rounded-sm" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-950 border border-slate-850" />
          </div>
        ) : (
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-30 transition-all flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-900/40" />
          </div>
        )}

        {/* Outer Phone Hardware Buttons Mockup */}
        <div className="absolute left-[-8px] top-28 w-1 h-12 bg-slate-800 rounded-r-sm" />
        <div className="absolute left-[-8px] top-44 w-1 h-12 bg-slate-800 rounded-r-sm" />
        <div className="absolute right-[-8px] top-32 w-1 h-16 bg-slate-800 rounded-l-sm" />

        {/* Viewport content area */}
        <div className="bg-slate-50 w-full h-full rounded-[34px] overflow-hidden flex flex-col justify-between relative border border-slate-100" id="emulator-screen-viewport">
          
          {/* Native OS styled top status bar */}
          <div className="h-11 bg-white/95 backdrop-blur px-5 flex items-end justify-between pb-1.5 border-b border-slate-100 relative z-20" id="status-bar">
            <span className="text-[11px] font-bold text-slate-800 tracking-tight font-sans">
              {timeStr.slice(0, 5)}
            </span>

            <div className="flex items-center gap-1 text-slate-700">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center gap-0.5">
                <span className="text-[9px] font-mono font-bold leading-none">{batteryLevel}%</span>
                <Battery className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />
              </div>
            </div>
          </div>

          {/* Active Title Header */}
          <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between shadow-sm relative z-10 shrink-0" id="dynamic-bar-header">
            <div>
              <h1 className="text-xs font-extrabold tracking-wider uppercase text-teal-400">FCPS COMPANION</h1>
              <p className="text-[9px] text-slate-400 uppercase font-mono tracking-tight font-semibold">
                {!isAuthenticated
                  ? 'Candidate Verification Gate'
                  : activeTab === 'Home' 
                    ? 'Study Desk' 
                    : activeTab === 'Live' 
                      ? 'Mock Portal' 
                      : activeTab === 'Practice' 
                        ? 'Chapter Bank' 
                        : 'Diagnostic Report'
                }
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {!isAuthenticated ? (
                <Lock className="w-3.5 h-3.5 text-rose-500" />
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[9px] font-mono text-slate-300 font-bold tracking-tight">CBT CLOUD</span>
                </>
              )}
            </div>
          </div>

          {/* Real simulated React Screen Viewport body wrap */}
          <div className="flex-1 bg-slate-50 relative overflow-hidden flex flex-col">
            {renderPlatformScreen()}
          </div>

          {/* Bottom Native Tab Navigation Bar (Locked behind authentication) */}
          {isAuthenticated && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200/80 px-3 flex justify-between items-center z-20 shadow-[0_-2px_12px_rgba(15,23,42,0.03)] pb-2 pt-1" id="tab-navigation-bar">
              <button 
                onClick={() => setActiveTab('Home')}
                className={`flex flex-col items-center justify-center space-y-1 transition-all flex-1 ${
                  activeTab === 'Home' ? 'text-teal-600 scale-105 font-bold' : 'text-slate-400 hover:text-slate-600'
                }`}
                id="tab-btn-home"
              >
                <HomeIcon className="w-4.5 h-4.5" />
                <span className="text-[9px] tracking-tight">Home</span>
              </button>

              <button 
                onClick={() => setActiveTab('Live')}
                className={`flex flex-col items-center justify-center space-y-1 transition-all flex-1 relative ${
                  activeTab === 'Live' ? 'text-teal-600 scale-105 font-bold' : 'text-slate-400 hover:text-slate-600'
                }`}
                id="tab-btn-live"
              >
                <span className="absolute top-[-3] right-3 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <LiveIcon className="w-4.5 h-4.5" />
                <span className="text-[9px] tracking-tight">Live Exams</span>
              </button>

              <button 
                onClick={() => setActiveTab('Practice')}
                className={`flex flex-col items-center justify-center space-y-1 transition-all flex-1 ${
                  activeTab === 'Practice' ? 'text-teal-600 scale-105 font-bold' : 'text-slate-400 hover:text-slate-600'
                }`}
                id="tab-btn-practice"
              >
                <PracticeIcon className="w-4.5 h-4.5" />
                <span className="text-[9px] tracking-tight">Practice</span>
              </button>

              <button 
                onClick={() => setActiveTab('Analytics')}
                className={`flex flex-col items-center justify-center space-y-1 transition-all flex-1 ${
                  activeTab === 'Analytics' ? 'text-teal-600 scale-105 font-bold' : 'text-slate-400 hover:text-slate-600'
                }`}
                id="tab-btn-analytics"
              >
                <AnalyticsIcon className="w-4.5 h-4.5" />
                <span className="text-[9px] tracking-tight">Analytics</span>
              </button>
            </div>
          )}

          {/* OS Soft Bottom bar indicator */}
          {platform === 'iOS' ? (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-350 rounded-full z-25 opacity-70" />
          ) : (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-14 h-1.5 bg-slate-400 rounded-full z-25 opacity-50" />
          )}

        </div>

      </div>

    </div>
  );
}
