import React, { useState } from 'react';
import { Award, Flame, Zap, ArrowRight, ShieldCheck, Clock, BookOpen, AlertCircle, Sparkles, Bell, BellOff, Volume2, Target, BarChart2, Users, Sliders, X, FileText, CheckCircle, RefreshCw, Calendar, TrendingUp, Activity } from 'lucide-react';
import { DoctorProfile, SubjectCategory, Question, UserProgress } from '../types';

interface WeakChapter {
  chapter: string;
  category: SubjectCategory;
  accuracy: number;
  count: number;
  topic: string;
}

interface HomeTabProps {
  doctor: DoctorProfile;
  streakCount: number;
  onNavigateToTab: (tabId: string) => void;
  onStartExam: (examId?: string) => void;
  weakChapters: WeakChapter[];
  onDrillChapter: (category: SubjectCategory) => void;
  reminderEnabled: boolean;
  onToggleReminder: (enabled: boolean) => void;
  reminderTime: string;
  onSelectReminderTime: (time: string) => void;
  questionsSolvedToday: number;
  mistakenQuestions: Question[];
  onLaunchCustomTest: (subject: SubjectCategory, topic: string, questionCount: number, sbaOnly: boolean, includeMixed: boolean) => void;
  progress: UserProgress;
}

export default function HomeTab({
  doctor,
  streakCount,
  onNavigateToTab,
  onStartExam,
  weakChapters = [],
  onDrillChapter,
  reminderEnabled,
  onToggleReminder,
  reminderTime,
  onSelectReminderTime,
  questionsSolvedToday,
  mistakenQuestions = [],
  onLaunchCustomTest,
  progress
}: HomeTabProps) {
  const [showNotificationAlert, setShowNotificationAlert] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string>('');

  // Step-by-Step Custom Mock Test Builder states
  const [showTestBuilder, setShowTestBuilder] = useState<boolean>(false);
  const [builderStep, setBuilderStep] = useState<number>(1);
  const [selectedSubject, setSelectedSubject] = useState<SubjectCategory>('Anatomy');
  const [selectedTopic, setSelectedTopic] = useState<string>('Brachial Nerve Plexus');
  const [selectedQuestionCount, setSelectedQuestionCount] = useState<number>(10);
  const [sbaOnly, setSbaOnly] = useState<boolean>(true);
  const [includeMixed, setIncludeMixed] = useState<boolean>(false);

  // Leaderboard state
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  const weekdayChecks = [
    { name: 'Mon', active: true },
    { name: 'Tue', active: true },
    { name: 'Wed', active: true },
    { name: 'Thu', active: true },
    { name: 'Fri', active: true },
    { name: 'Sat', active: true },
    { name: 'Sun', active: false },
  ];

  const handleReminderToggleChange = () => {
    const newState = !reminderEnabled;
    onToggleReminder(newState);
    setNotificationMessage(
      newState
        ? `Alarm routine activated for ${reminderTime}. You will receive push reminders 15 mins before daily Mock releases.`
        : 'Daily routine reminder alarms disabled.'
    );
    setShowNotificationAlert(true);
    setTimeout(() => setShowNotificationAlert(false), 4500);
  };

  const handleTimeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const time = e.target.value;
    onSelectReminderTime(time);
    if (reminderEnabled) {
      setNotificationMessage(`Reminder routine updated! Alarm registered at ${time}.`);
      setShowNotificationAlert(true);
      setTimeout(() => setShowNotificationAlert(false), 4000);
    }
  };

  return (
    <div className="flex flex-col overflow-y-auto max-h-[580px] px-4 py-4 pb-20 space-y-5 scrollbar-thin scrollbar-thumb-slate-300" id="home-dashboard-tab">
      
      {/* Toast Push Notification Alert System */}
      {showNotificationAlert && (
        <div 
          className="bg-slate-900 border border-teal-500/30 text-white rounded-xl p-3 shrink-0 flex items-start gap-2 animate-fadeIn shadow-lg text-[10px] sm:text-xs relative z-30"
          id="reminder-toast-alert"
        >
          <Bell className="w-4 h-4 text-teal-400 shrink-0 mt-0.5 animate-bounce" />
          <div className="space-y-0.5">
            <span className="font-extrabold text-teal-400 uppercase tracking-widest block text-[8px]">Push Alarm Scheduler</span>
            <p className="text-slate-200 font-medium leading-relaxed">{notificationMessage}</p>
          </div>
        </div>
      )}

      {/* Doctor Profile Header */}
      <div 
        onClick={() => onNavigateToTab('Profile')}
        className="flex items-center justify-between p-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-100 shadow-xs cursor-pointer transition active:scale-98" 
        id="doc_profile_header"
        title="View/Edit Profile"
      >
        <div className="space-y-0.5">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-teal-600">Verification Active</p>
          <h1 className="text-base font-bold text-slate-800 flex items-center gap-1.5 leading-snug">
            {doctor.name}
            <span className="bg-teal-100 text-teal-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <ShieldCheck className="w-2.5 h-2.5" /> FCPS-I
            </span>
          </h1>
          <p className="text-[11px] text-slate-500 italic max-w-[210px] truncate">{doctor.hospital}</p>
        </div>
        <img
          src={doctor.avatar}
          alt={doctor.name}
          className="w-12 h-12 rounded-full border-2 border-teal-500 shadow-sm object-cover shrink-0"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Days Active Flame Streak & Compact Calendar Tracker (Requirement 3) */}
      <div className="bg-slate-900 rounded-2xl p-4 text-white relative overflow-hidden shadow-md border border-slate-800" id="flame-streak-calendar-card">
        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-xl translate-x-4 -translate-y-4 animate-pulse" />
        <div className="flex items-center justify-between gap-2.5 relative z-10">
          <div className="space-y-1 flex-1">
            <span className="text-[8px] text-teal-400 font-extrabold tracking-widest uppercase">Days Active Counter</span>
            <div className="flex items-center gap-2">
              <Flame className="w-8 h-8 text-orange-500 fill-orange-500 shrink-0 filter drop-shadow-[0_2px_8px_rgba(249,115,22,0.4)] animate-pulse" />
              <div>
                <h3 className="text-sm font-black text-white leading-none">{streakCount} Days Active</h3>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mt-1.5">Elite Streak Tracker</span>
              </div>
            </div>
          </div>

          {/* Compact Monthly Calendar Grid view */}
          <div className="bg-slate-950/65 border border-slate-850 rounded-xl p-2 shrink-0 w-[125px]" id="mini-calendar-month-grid">
            <div className="flex justify-between items-center mb-1 text-[7px] text-slate-400 font-extrabold uppercase tracking-wide">
              <span>June 2026</span>
              <span className="text-teal-400 font-bold">✓ Active</span>
            </div>
            {/* Mini 30 day grid */}
            <div className="grid grid-cols-6 gap-0.5">
              {Array.from({ length: 30 }).map((_, i) => {
                const isFilled = i < 18; // June 1 to 18 active
                const isToday = i === 17; // Today (18th)
                return (
                  <div 
                    key={i} 
                    className={`h-3 bg-slate-900 rounded-sm flex items-center justify-center text-[5px] font-black leading-none ${
                      isToday
                        ? 'bg-orange-500 border border-orange-400 text-white animate-pulse'
                        : isFilled 
                          ? 'bg-gradient-to-br from-teal-500 to-teal-600 border border-teal-500 text-white' 
                          : 'border border-slate-800 text-slate-600'
                    }`}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Performance Progress Bar Card under Streak (Requirement 3) */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/60 space-y-2 relative z-10" id="performance-progress-metric">
          <div className="flex justify-between text-[9px] items-center">
            <span className="text-slate-400 font-semibold uppercase text-[7px] tracking-wider">Overall Accuracy Model</span>
            <span className="text-teal-405 font-extrabold">{progress.averageScorePercentage}% Correct Choices</span>
          </div>
          
          {/* High precision two-tone bar */}
          <div className="w-full bg-rose-600 h-2 rounded-full overflow-hidden flex shadow-xs">
            <div 
              className="bg-teal-500 h-full transition-all duration-500"
              style={{ width: `${progress.averageScorePercentage}%` }}
            />
          </div>

          {/* Detailed Legend */}
          <div className="flex justify-between text-[8px] font-mono text-slate-400">
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> Correct ({progress.averageScorePercentage}%)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Incorrect ({100 - progress.averageScorePercentage}%)
            </span>
          </div>
        </div>
      </div>

      {/* Feature Hub Dashboard Medical Grid (6 Option Cards - Requirement 1) */}
      <div className="space-y-2" id="dashboard-feature-channels">
        <div className="flex items-center justify-between px-0.5">
          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Feature Hub Dashboard</h4>
          <span className="text-[8px] font-extrabold text-teal-600 uppercase tracking-widest bg-teal-50/80 px-2 py-0.5 rounded-md">6 Core Portals</span>
        </div>

        <div className="grid grid-cols-2 gap-3" id="medical-feature-hub-grid">
          
          {/* 1. Paper I (Anatomy/Physiology) */}
          <button 
            type="button"
            onClick={() => onStartExam('paper-1-exam')}
            className="bg-white hover:bg-slate-50 border border-slate-100 hover:border-slate-205 rounded-2xl p-3 text-left flex flex-col justify-between h-[100px] shadow-xs cursor-pointer active:scale-95 transition-all relative overflow-hidden group"
            id="card-paper-i"
          >
            <div className="absolute top-0 right-0 w-12 h-12 bg-sky-500/5 rounded-full blur-md -mr-2 -mt-2 group-hover:scale-125 transition-all" />
            <div className="bg-sky-50 text-sky-600 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-sky-100/50">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div className="mt-1 text-slate-850">
              <p className="text-[9.5px] font-black leading-tight">Paper I</p>
              <p className="text-[8px] text-slate-400 font-bold mb-1 truncate">Anatomy/Physiology</p>
              <span className="text-[7.5px] bg-sky-50 text-sky-700 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">10 Scenario SBA</span>
            </div>
          </button>

          {/* 2. Paper II (Pathology/Microbiology) */}
          <button 
            type="button"
            onClick={() => onStartExam('paper-2-exam')}
            className="bg-white hover:bg-slate-50 border border-slate-100 hover:border-slate-205 rounded-2xl p-3 text-left flex flex-col justify-between h-[100px] shadow-xs cursor-pointer active:scale-95 transition-all relative overflow-hidden group"
            id="card-paper-ii"
          >
            <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-500/5 rounded-full blur-md -mr-2 -mt-2 group-hover:scale-125 transition-all" />
            <div className="bg-indigo-50 text-indigo-600 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-indigo-100/50">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div className="mt-1 text-slate-850">
              <p className="text-[9.5px] font-black leading-tight">Paper II</p>
              <p className="text-[8px] text-slate-400 font-bold mb-1 truncate">Pathology/Microbiology</p>
              <span className="text-[7.5px] bg-indigo-50 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">10 Scenario SBA</span>
            </div>
          </button>

          {/* 3. Paper III (Pharmacology/Medicine) */}
          <button 
            type="button"
            onClick={() => onStartExam('paper-3-exam')}
            className="bg-white hover:bg-slate-50 border border-slate-100 hover:border-slate-205 rounded-2xl p-3 text-left flex flex-col justify-between h-[100px] shadow-xs cursor-pointer active:scale-95 transition-all relative overflow-hidden group"
            id="card-paper-iii"
          >
            <div className="absolute top-0 right-0 w-12 h-12 bg-purple-500/5 rounded-full blur-md -mr-2 -mt-2 group-hover:scale-125 transition-all" />
            <div className="bg-purple-50 text-purple-600 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-purple-100/50">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <div className="mt-1 text-slate-850">
              <p className="text-[9.5px] font-black leading-tight">Paper III</p>
              <p className="text-[8px] text-slate-400 font-bold mb-1 truncate">Pharmacology/Medicine</p>
              <span className="text-[7.5px] bg-purple-50 text-purple-700 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">10 Scenario SBA</span>
            </div>
          </button>

          {/* 4. My Mistakes */}
          <button 
            type="button"
            onClick={() => {
              if (mistakenQuestions.length === 0) {
                alert("Your Automated Mistakes Revision folder is currently clean! Keep solving Mock exam papers to trigger error collections.");
              } else {
                onStartExam('my-mistakes-exam');
              }
            }}
            className="bg-white hover:bg-slate-50 border border-slate-105 hover:border-rose-150 rounded-2xl p-3 text-left flex flex-col justify-between h-[100px] shadow-xs cursor-pointer active:scale-95 transition-all relative overflow-hidden group border-rose-100-style"
            id="card-my-mistakes"
          >
            <div className="absolute top-0 right-0 w-12 h-12 bg-rose-500/5 rounded-full blur-md -mr-2 -mt-2 group-hover:scale-125 transition-all" />
            <div className="bg-rose-50 text-rose-600 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-rose-100/50">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="mt-1 text-slate-850">
              <p className="text-[9.5px] font-black leading-tight">My Mistakes</p>
              <p className="text-[8px] text-slate-400 font-bold mb-1 truncate">Automated Revision</p>
              <span className="text-[7.5px] bg-rose-50 text-rose-700 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                {mistakenQuestions.length} Saved Mistakes
              </span>
            </div>
          </button>

          {/* 5. Quick Test Builder */}
          <button 
            type="button"
            onClick={() => setShowTestBuilder(true)}
            className="bg-white hover:bg-slate-50 border border-slate-100 hover:border-teal-150 rounded-2xl p-3 text-left flex flex-col justify-between h-[100px] shadow-xs cursor-pointer active:scale-95 transition-all relative overflow-hidden group"
            id="card-quick-builder"
          >
            <div className="absolute top-0 right-0 w-12 h-12 bg-teal-500/5 rounded-full blur-md -mr-2 -mt-2 group-hover:scale-125 transition-all" />
            <div className="bg-teal-50 text-teal-600 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-teal-100/50">
              <Sliders className="w-3.5 h-3.5" />
            </div>
            <div className="mt-1 text-slate-850">
              <p className="text-[9.5px] font-black leading-tight">Test Builder</p>
              <p className="text-[8px] text-slate-400 font-bold mb-1 truncate font-mono">Step-by-Step Config</p>
              <span className="text-[7.5px] bg-teal-50 text-teal-700 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">Custom Mock Set</span>
            </div>
          </button>

          {/* 6. Leaderboard */}
          <button 
            type="button"
            onClick={() => setShowLeaderboard(true)}
            className="bg-white hover:bg-slate-50 border border-slate-100 hover:border-amber-150 rounded-2xl p-3 text-left flex flex-col justify-between h-[100px] shadow-xs cursor-pointer active:scale-95 transition-all relative overflow-hidden group"
            id="card-leaderboard"
          >
            <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500/5 rounded-full blur-md -mr-2 -mt-2 group-hover:scale-125 transition-all" />
            <div className="bg-amber-50 text-amber-600 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-amber-100/50">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div className="mt-1 text-slate-850">
              <p className="text-[9.5px] font-black leading-tight">Leaderboard</p>
              <p className="text-[8px] text-slate-400 font-bold mb-1 truncate">Nationwide Doctors</p>
              <span className="text-[7.5px] bg-amber-50 text-amber-700 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">Live Competing</span>
            </div>
          </button>

        </div>
      </div>

      {/* Daily Study Goal Progress Card */}
      <div 
        className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3.5 animate-fadeIn"
        id="daily-study-goal-meter"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-teal-50/80 p-1.5 rounded-lg text-teal-600">
              <Target className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-800">Daily MCQ Study Goal</h4>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Target Practice Quota</p>
            </div>
          </div>
          
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
            Math.min(100, Math.round((questionsSolvedToday / (doctor.dailyStudyGoal || 40)) * 100)) >= 100 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : 'bg-teal-50 text-teal-700 border border-teal-150'
          }`}>
            {Math.min(100, Math.round((questionsSolvedToday / (doctor.dailyStudyGoal || 40)) * 100))}% Completed
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold tracking-tight text-slate-850">
              {questionsSolvedToday}
            </span>
            <span className="text-xs text-slate-400 font-semibold">/ {doctor.dailyStudyGoal || 40} MCQs Today</span>
          </div>
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">
            SBA Sets + Exam Papers
          </span>
        </div>

        {/* Linear progress bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              Math.min(100, Math.round((questionsSolvedToday / (doctor.dailyStudyGoal || 40)) * 100)) >= 100 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-sm' 
                : 'bg-gradient-to-r from-teal-500 to-teal-600'
            }`}
            style={{ width: `${Math.min(100, Math.round((questionsSolvedToday / (doctor.dailyStudyGoal || 40)) * 100))}%` }}
          />
        </div>

        <div className="pt-0.5 text-[10px] leading-relaxed text-slate-600 flex items-start gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <p>
            {Math.min(100, Math.round((questionsSolvedToday / (doctor.dailyStudyGoal || 40)) * 100)) >= 100 ? (
              <span><strong>Excellent prep work doctor!</strong> Daily MCQ quota accomplished. Continue practicing to dominate the preparation ranking!</span>
            ) : (
              <span>Solve <strong>{Math.max(0, (doctor.dailyStudyGoal || 40) - questionsSolvedToday)} more MCQs</strong> today to satisfy your recommended clinical proficiency index!</span>
            )}
          </p>
        </div>
      </div>

      {/* BDFCPS-style Daily Streak & Routine Push Notification Alarm Engine */}
      <div 
        className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-4"
        id="bdfcps-streak-and-reminder-engine"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="bg-orange-50 p-1.5 rounded-lg">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-800">{streakCount} Days Active Flame</h4>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">BDFCPS Routine Reminders</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 bg-orange-50 text-orange-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
            <Zap className="w-3 h-3 fill-orange-500 shrink-0" />
            <span>Elite Streak</span>
          </div>
        </div>

        {/* Week Visual Grid Checkboxes */}
        <div className="grid grid-cols-7 gap-1">
          {weekdayChecks.map((day, idx) => (
            <div key={day.name} className="flex flex-col items-center space-y-1">
              <div 
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black transition-colors duration-200 ${
                  day.active 
                    ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-sm' 
                    : idx === 6 
                      ? 'bg-orange-50 border border-orange-200 text-orange-600 font-bold animate-pulse'
                      : 'bg-slate-50 border border-slate-100 text-slate-300'
                }`}
              >
                {day.active ? '✓' : idx === 6 ? 'Today' : '-'}
              </div>
              <span className={`text-[8px] font-extrabold uppercase ${day.active ? 'text-slate-700' : 'text-slate-400'}`}>
                {day.name}
              </span>
            </div>
          ))}
        </div>

        {/* Alarm and scheduling toggle box (BDFCPS Style) */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg shrink-0 ${reminderEnabled ? 'bg-teal-50 text-teal-600' : 'bg-slate-200 text-slate-400'}`}>
                {reminderEnabled ? <Bell className="w-3.5 h-3.5 animate-bounce" /> : <BellOff className="w-3.5 h-3.5" />}
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-700 block">Daily Push Reminder Alarm</span>
                <span className="text-[8px] text-slate-400 font-medium">Routine check-in before mock releases</span>
              </div>
            </div>
            
            {/* Soft Toggle switch */}
            <button
              type="button"
              onClick={handleReminderToggleChange}
              className={`w-10 h-5.5 rounded-full transition-colors relative focus:outline-none shrink-0 ${
                reminderEnabled ? 'bg-teal-600' : 'bg-slate-300'
              }`}
              id="push-reminder-toggle"
            >
              <span 
                className={`w-4.5 h-4.5 rounded-full bg-white absolute top-0.5 shadow-sm transition-transform ${
                  reminderEnabled ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/40 text-[9px]">
            <span className="text-slate-500 font-semibold uppercase">Routine Check-In Time:</span>
            <select
              value={reminderTime}
              onChange={handleTimeSelect}
              className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-[10px] text-slate-700 outline-none font-bold"
              id="reminder-time-selector"
            >
              <option value="08:00 AM">08:00 AM (Morning Study)</option>
              <option value="12:00 PM">12:00 PM (Noon Drills)</option>
              <option value="04:00 PM">04:00 PM (Afternoon Mock)</option>
              <option value="08:00 PM">08:00 PM (Prime Syllabus)</option>
              <option value="10:30 PM">10:30 PM (Night Summary)</option>
            </select>
          </div>
        </div>

        <p className="text-[9px] text-slate-500 text-center leading-relaxed">
          Dr. {doctor.name.replace('Dr. ', '')}, completing <strong>today's Live MCQ Mock Paper</strong> earns you a premium streak ranking!
        </p>
      </div>

      {/* Shortcut Card to "Start Today\'s Live Exam" */}
      <div 
        onClick={onStartExam}
        className="group relative bg-gradient-to-r from-teal-650 to-slate-800 rounded-2xl p-4 text-white overflow-hidden shadow-lg cursor-pointer hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 border border-teal-500/10"
        id="start_live_exam_shortcut"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
        
        <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <div className="bg-white/20 backdrop-blur-sm text-[8px] font-mono font-bold tracking-widest text-teal-200 px-2 py-0.5 rounded uppercase">
              Mock Assessment Live
            </div>
            <div className="flex items-center text-[9px] text-teal-300 font-mono gap-1 font-semibold">
              <Clock className="w-3 h-3 text-teal-400" /> National Pool Active
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-xs tracking-tight group-hover:text-teal-200 transition-colors inline-flex items-center gap-1">
              Start Today's Live Exam <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            </h3>
            <p className="text-[10px] text-slate-300 leading-snug">
              "FCPS Part I - National Grand Mock". 100 SBA core questions compiled from verified 2021-2025 past papers.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1.5 text-[9px] text-teal-300 font-semibold border-t border-white/10">
            <span className="truncate max-w-[130px]">Syllabus: Pathology & Physiology</span>
            <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full text-[8px] text-white tracking-wider font-extrabold uppercase shrink-0">
              Launch Test →
            </div>
          </div>
        </div>
      </div>

      {/* Shikho-style Adaptive 'Weak Chapters' Remediation areas */}
      <div 
        className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3.5"
        id="shikho-focus-remediation-dashboard"
      >
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <div className="bg-rose-50 p-1.5 rounded-lg shrink-0">
              <Target className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800">Your Focus Remediation Areas</h4>
              <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">Shikho Adaptive Remediation Engine</p>
            </div>
          </div>
          <span className="bg-rose-50 text-rose-700 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0">
            Fail Safe Active
          </span>
        </div>

        <p className="text-[9.5px] text-slate-500 leading-relaxed">
          Our systems track your incorrect mock selections to isolate chapters of sub-optimal accuracy. Drilling these chapters dynamically boosts performance.
        </p>

        {/* Dynamic List of remediations */}
        <div className="space-y-3" id="weak-chapters-remediation-list">
          {weakChapters.length === 0 ? (
            <div className="p-3 text-center bg-slate-50 rounded-xl text-slate-400 text-[10px] italic">
              Excellent diagnostic rates! No weakness parameters collected.
            </div>
          ) : (
            weakChapters.map((item, idx) => {
              // Determine visual accent based on accuracy
              const isVeryLow = item.accuracy < 60;
              const progressColor = isVeryLow ? 'bg-red-500' : 'bg-amber-500';
              const textBadgeColor = isVeryLow ? 'text-red-700 bg-red-50' : 'text-amber-700 bg-amber-50';

              return (
                <div 
                  key={`${item.chapter}-${idx}`}
                  className="bg-slate-50 rounded-xl p-3 border border-slate-200/40 hover:border-rose-250 transition-all flex flex-col space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 pr-1">
                      <span className="text-[8px] font-mono uppercase font-black text-slate-400 tracking-wider">
                        {item.category}
                      </span>
                      <h5 className="text-[11px] font-extrabold text-slate-850 truncate leading-tight">
                        {item.chapter}
                      </h5>
                    </div>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded shrink-0 ${textBadgeColor}`}>
                      {item.accuracy}% Accuracy
                    </span>
                  </div>

                  {/* Linear progress accuracy bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[8px] font-mono text-slate-400">
                      <span>Recent Mistakes: {item.count}</span>
                      <span>Target: 75% accuracy</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                        style={{ width: `${item.accuracy}%` }}
                      />
                    </div>
                  </div>

                  {/* Drill chapter action button */}
                  <button
                    onClick={() => onDrillChapter(item.category)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-teal-300 text-[9px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 border border-slate-800"
                    id={`drill-weak-chapter-${idx}`}
                  >
                    <BookOpen className="w-3 h-3 text-teal-400" />
                    <span>Drill Wrong SBA Sets ({item.topic})</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Diagnostic Insights Banner */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 text-slate-600 text-[10px] space-y-1.5">
        <div className="flex items-center gap-1 text-slate-800 font-bold">
          <AlertCircle className="w-3.5 h-3.5 text-teal-600 shrink-0" /> Syllabus Progress Notice
        </div>
        <p className="leading-relaxed">
          Neurology Core exhibits peak expertise (85%). Make sure to review the <strong>Anatomy of upper extremities</strong> using our focused remediation panels to bypass competitive margins.
        </p>
      </div>

      {/* Step-by-Step Custom Mock Test Builder bottom-sheet Slide-up (Requirement 2 & 5) */}
      {showTestBuilder && (
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex flex-col justify-end overflow-hidden animate-fadeIn" id="test-builder-modal-overlay">
          <div className="bg-white rounded-t-3xl p-5 flex flex-col max-h-[90%] space-y-4 shadow-2xl shrink-0 animate-slideUp">
            
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-slate-105 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Custom Mock Test Builder</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">BCPS Bangladesh Curriculum Config</p>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowTestBuilder(false);
                  setBuilderStep(1);
                }}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-550 transition shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Step Indicator Progress Dots */}
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-teal-600 font-black">Step {builderStep} of 4</span>
              <div className="flex gap-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i + 1 === builderStep 
                        ? 'w-6 bg-teal-600' 
                        : i + 1 < builderStep 
                          ? 'w-2 bg-emerald-500' 
                          : 'w-2 bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Step Contents */}
            <div className="flex-1 overflow-y-auto min-h-[220px] max-h-[350px] pr-0.5">
              {builderStep === 1 && (
                <div className="space-y-3" id="builder-step-1">
                  <p className="text-[11px] font-extrabold text-slate-700">Choose Core Specialization Subject:</p>
                  <div className="space-y-2">
                    {[
                      { id: 'Anatomy', label: 'Anatomy', subtext: 'Plenum neuroanatomy, osteology, viscera' },
                      { id: 'Physiology & Biochemistry', label: 'Physiology & Biochemistry', subtext: 'Systemic clearance, transport, endocrine' },
                      { id: 'Pathology & Microbiology', label: 'Pathology & Microbiology', subtext: 'Systemic mutations, cellular inflammation' },
                      { id: 'Medicine & Allied', label: 'Medicine & Allied', subtext: 'Diagnostics, clinical setups & guidelines' }
                    ].map((subj) => (
                      <button
                        type="button"
                        key={subj.id}
                        onClick={() => {
                          setSelectedSubject(subj.id as SubjectCategory);
                          setBuilderStep(2);
                        }}
                        className={`w-full text-left p-3 rounded-xl border transition-all text-[11px] flex justify-between items-center ${
                          selectedSubject === subj.id 
                            ? 'border-teal-500 bg-teal-50/50 text-slate-900 font-black' 
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <span className="font-bold">{subj.label}</span>
                          <span className="block text-[8px] text-slate-400 font-semibold mt-0.5">{subj.subtext}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {builderStep === 2 && (
                <div className="space-y-3" id="builder-step-2">
                  <p className="text-[11px] font-extrabold text-slate-700">Select Specific Revision Topic:</p>
                  <div className="space-y-2">
                    {(selectedSubject === 'Anatomy' 
                      ? ['Brachial Nerve Plexus', 'Thorax & Lungs', 'Cranium Osteology', 'Head & Neck Viscera']
                      : selectedSubject === 'Physiology & Biochemistry'
                        ? ['Renal Clearance Model', 'Endocrine Feedback Links', 'Cardiorespiratory Flow', 'Biochemical Krebs Chain']
                        : selectedSubject === 'Pathology & Microbiology'
                          ? ['Neoplastic Mutators', 'Cellular Apoptosis', 'Viral Envelopes', 'Immunopathology Blocks']
                          : ['Critical Care Pharmacology', 'ECG Wave Interpretations', 'Maternal Gynecology Drills', 'General Clinical Diagnostics']
                    ).map((topic) => (
                      <button
                        type="button"
                        key={topic}
                        onClick={() => {
                          setSelectedTopic(topic);
                          setBuilderStep(3);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs flex justify-between items-center ${
                          selectedTopic === topic 
                            ? 'border-teal-500 bg-teal-50/50 text-slate-900 font-black' 
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="font-semibold">{topic}</span>
                        <CheckCircle className="w-4 h-4 text-teal-600 opacity-60" />
                      </button>
                    ))}
                  </div>
                  <button 
                    type="button"
                    onClick={() => setBuilderStep(1)}
                    className="text-[10px] text-teal-605 font-bold hover:underline"
                  >
                    ← Back to Subjects
                  </button>
                </div>
              )}

              {builderStep === 3 && (
                <div className="space-y-3" id="builder-step-3">
                  <p className="text-[11px] font-extrabold text-slate-700">Choose Question Pool Size:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[5, 10, 15].map((count) => (
                      <button
                        type="button"
                        key={count}
                        onClick={() => {
                          setSelectedQuestionCount(count);
                          setBuilderStep(4);
                        }}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          selectedQuestionCount === count 
                            ? 'border-teal-500 bg-teal-50/50 text-slate-950 font-black shadow-xs' 
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="text-base block leading-none font-extrabold">{count}</span>
                        <span className="text-[8px] text-slate-400 mt-1 block font-bold">MCQs</span>
                      </button>
                    ))}
                  </div>
                  <button 
                    type="button"
                    onClick={() => setBuilderStep(2)}
                    className="text-[10px] text-teal-605 font-bold hover:underline block pt-2"
                  >
                    ← Back to Topics
                  </button>
                </div>
              )}

              {builderStep === 4 && (
                <div className="space-y-4" id="builder-step-4">
                  <p className="text-[11px] font-extrabold text-slate-700">Refine Drill Modes & Verification:</p>
                  
                  <div className="space-y-2">
                    {/* Toggle 1: SBA Mode Only */}
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] font-black text-slate-800 block">Single Best Answer (SBA) Only</span>
                        <span className="text-[8px] text-slate-450 font-bold">Locks test into pure CPSP standards</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSbaOnly(!sbaOnly)}
                        className={`w-9 h-5 rounded-full transition relative shrink-0 ${
                          sbaOnly ? 'bg-teal-600' : 'bg-slate-300'
                        }`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                          sbaOnly ? 'right-0.5' : 'left-0.5'
                        }`} />
                      </button>
                    </div>

                    {/* Toggle 2: Include Mixed Papers */}
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] font-black text-slate-800 block">Include Mixed Papers</span>
                        <span className="text-[8px] text-slate-455 font-bold">Injects cross-disciplinary clinical setups</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIncludeMixed(!includeMixed)}
                        className={`w-9 h-5 rounded-full transition relative shrink-0 ${
                          includeMixed ? 'bg-teal-600' : 'bg-slate-300'
                        }`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                          includeMixed ? 'right-0.5' : 'left-0.5'
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Ready Confirmation */}
                  <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 flex items-start gap-2 text-[9px] text-slate-700 leading-normal">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <p>
                      Verification verified! Allocating <strong>{selectedQuestionCount}</strong> specialized MCQs of topic <strong>{selectedTopic}</strong>. Launch sequence ready.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setBuilderStep(3)}
                      className="flex-1 bg-slate-105 hover:bg-slate-200 text-slate-600 text-[10px] font-extrabold py-2 rounded-xl border border-slate-200 transition active:scale-95"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onLaunchCustomTest(selectedSubject, selectedTopic, selectedQuestionCount, sbaOnly, includeMixed);
                        setShowTestBuilder(false);
                        setBuilderStep(1);
                      }}
                      className="flex-[2] bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-[10px] font-black py-2 rounded-xl shadow-md cursor-pointer active:scale-95 transition-all"
                    >
                      Build & Launch Mock Test ⚡
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Leaderboard Nationwide Elite Rankings slide-up (Requirement 1, 2) */}
      {showLeaderboard && (
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex flex-col justify-end overflow-hidden animate-fadeIn" id="leaderboard-modal-overlay">
          <div className="bg-slate-900 rounded-t-3xl p-5 flex flex-col max-h-[92%] space-y-4 shadow-2xl shrink-0 animate-slideUp text-white">
            
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xs font-black text-white flex items-center gap-1">
                  Nationwide Elite Rankings <Sparkles className="w-3 h-3 text-amber-450 fill-amber-400" />
                </h3>
                <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">Live Competing Doctors Pool</p>
              </div>
              <button 
                type="button"
                onClick={() => setShowLeaderboard(false)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 transition shrink-0"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            {/* Podium Top 3 Rank Doctors section with active staggered bouncy-entrance animation (Requirement 2) */}
            <div className="grid grid-cols-3 gap-1.5 items-end pt-4 pb-2.5 px-1 border-b border-slate-800/60 font-sans">
              
              {/* 2nd - Silver (Left) */}
              <div className="flex flex-col items-center space-y-1.5 animate-bounce-entrance" style={{ animationDelay: '150ms' }}>
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=120" 
                    alt="Dr. Arshad" 
                    className="w-8 h-8 rounded-full border border-slate-300 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute -top-1 -right-1 bg-slate-300 text-slate-900 text-[6px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">2</span>
                </div>
                <div className="text-center">
                  <span className="text-[8px] font-bold block truncate max-w-[70px]">Dr. A. Malik</span>
                  <span className="text-[7.5px] text-indigo-400 font-mono font-bold">198 Correct</span>
                </div>
                <div className="w-full bg-slate-850 h-10 rounded-t-lg border-t border-x border-slate-800 flex items-center justify-center">
                  <span className="text-[8px] font-black text-slate-300 uppercase">Silver</span>
                </div>
              </div>

              {/* 1st - Gold (Center) */}
              <div className="flex flex-col items-center space-y-1.5 animate-bounce-entrance" style={{ animationDelay: '0ms' }}>
                <div className="relative">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-amber-400 animate-bounce text-[10px]">
                    👑
                  </div>
                  <img 
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=120" 
                    alt="Dr. Sarah" 
                    className="w-10 h-10 rounded-full border-2 border-amber-400 object-cover filter drop-shadow-[0_2px_10px_rgba(245,158,11,0.35)]"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[7px] font-black w-4 h-4 rounded-full flex items-center justify-center">1</span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] font-black block text-amber-300 truncate max-w-[75px]">Dr. S. Ahmed</span>
                  <span className="text-[7.5px] text-amber-400 font-mono font-bold">206 Correct</span>
                </div>
                <div className="w-full bg-gradient-to-t from-slate-850 to-amber-950/40 h-14 rounded-t-xl border-t border-x border-amber-500/20 flex items-center justify-center shadow-[0_-5px_15px_rgba(245,158,11,0.1)]">
                  <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider">GOLD</span>
                </div>
              </div>

              {/* 3rd - Bronze (Right) */}
              <div className="flex flex-col items-center space-y-1.5 animate-bounce-entrance" style={{ animationDelay: '300ms' }}>
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=120" 
                    alt="Dr. Faisal" 
                    className="w-8 h-8 rounded-full border border-slate-600 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[6px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">3</span>
                </div>
                <div className="text-center">
                  <span className="text-[8px] font-bold block truncate max-w-[70px]">Dr. F. Chaudhry</span>
                  <span className="text-[7.5px] text-amber-550 font-mono font-bold">184 Correct</span>
                </div>
                <div className="w-full bg-slate-850 h-10 rounded-t-lg border-t border-x border-slate-800 flex items-center justify-center">
                  <span className="text-[8px] font-black text-amber-600 uppercase">Bronze</span>
                </div>
              </div>

            </div>

            {/* Scrollable list of additional competing doctors */}
            <div className="flex-1 overflow-y-auto space-y-2 max-h-[190px] scrollbar-thin scrollbar-thumb-slate-700 pr-1">
              {[
                { name: 'Dr. Maryam Khan', rank: 4, correctSBA: 172, avatar: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=100' },
                { name: 'Dr. Kamran Baig', rank: 5, correctSBA: 168, avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=100' },
                { name: 'Dr. Ayesha Siddiqa', rank: 6, correctSBA: 154, avatar: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=100' },
                { name: 'Dr. Faisal Mahmood', rank: 7, correctSBA: 149, avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=100' }
              ].map((peer, idx) => (
                <div key={peer.rank} className="flex items-center justify-between p-2 bg-slate-950/45 border border-slate-850 rounded-xl hover:border-slate-800 transition">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[9px] font-mono font-bold text-slate-400 w-3.5">#{peer.rank}</span>
                    <img src={peer.avatar} alt={peer.name} className="w-7 h-7 rounded-full border border-slate-800 object-cover shrink-0" referrerPolicy="no-referrer" />
                    <span className="text-[10px] font-semibold text-slate-300 truncate">{peer.name}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-805">
                    <span className="text-[9px] font-mono font-bold text-teal-400">{peer.correctSBA} SBA</span>
                  </div>
                </div>
              ))}

              {/* User's own entry */}
              <div className="flex items-center justify-between p-2 bg-gradient-to-r from-teal-950/50 to-slate-900 border border-teal-500/20 rounded-xl mt-3 animate-pulse">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[9px] font-mono font-black text-teal-300 w-3.5">#29</span>
                  <img src={doctor.avatar} alt={doctor.name} className="w-7 h-7 rounded-full border border-teal-500 object-cover shrink-0" referrerPolicy="no-referrer" />
                  <div className="min-w-0">
                    <span className="text-[10.5px] font-black text-white block truncate">{doctor.name} (You)</span>
                    <span className="text-[8px] text-teal-400 uppercase font-black tracking-wider">CPSP Rank Delta: +8</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 bg-teal-500/20 px-2 py-0.5 rounded-full border border-teal-500/30">
                  <span className="text-[9px] font-mono font-black text-teal-400">{progress.questionsSolvedCount} SBA</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
