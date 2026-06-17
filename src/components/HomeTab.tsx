import React, { useState } from 'react';
import { Award, Flame, Zap, ArrowRight, ShieldCheck, Clock, BookOpen, AlertCircle, Sparkles, Bell, BellOff, Volume2, Target, BarChart2 } from 'lucide-react';
import { DoctorProfile, SubjectCategory } from '../types';

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
  onStartExam: () => void;
  weakChapters: WeakChapter[];
  onDrillChapter: (category: SubjectCategory) => void;
  reminderEnabled: boolean;
  onToggleReminder: (enabled: boolean) => void;
  reminderTime: string;
  onSelectReminderTime: (time: string) => void;
  questionsSolvedToday: number;
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
  questionsSolvedToday
}: HomeTabProps) {
  const [showNotificationAlert, setShowNotificationAlert] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string>('');

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
      <div className="flex items-center justify-between" id="doc_profile_header">
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

      {/* Specialty Profile Card */}
      <div 
        className="bg-slate-900 rounded-2xl p-4 text-white relative overflow-hidden shadow-md border border-slate-800/80"
        id="fcps_specialty_card"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/15 rounded-full blur-xl translate-x-4 -translate-y-4" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-805/40 rounded-full blur-md -translate-x-4 translate-y-4" />
        
        <div className="flex items-start justify-between relative z-10">
          <div>
            <p className="text-[9px] text-teal-400 font-bold tracking-widest uppercase mb-0.5">Target Specialty</p>
            <h3 className="text-sm font-extrabold tracking-tight text-white">{doctor.targetSpecialty}</h3>
            <p className="text-[9px] text-slate-400 mt-2">CPSP Pakistan Verification ID</p>
            <p className="text-xs font-mono font-bold text-teal-300">CPSP-MED-493-2026</p>
          </div>
          <div className="bg-teal-500/10 p-2 rounded-xl border border-teal-500/20 shrink-0">
            <Award className="w-5 h-5 text-teal-400" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-between items-center text-xs relative z-10">
          <div>
            <span className="text-slate-400 block text-[8px] uppercase tracking-wider font-semibold">CPSP Exam Session</span>
            <span className="text-white font-bold">{doctor.targetDate}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[8px] uppercase tracking-wider font-semibold">Preparation Delta</span>
            <span className="text-amber-400 font-extrabold">129 Days Left</span>
          </div>
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

      {/* Chorcha-style Daily Streak & Routine Push Notification Alarm Engine */}
      <div 
        className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-4"
        id="chorcha-streak-and-reminder-engine"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="bg-orange-50 p-1.5 rounded-lg">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-800">{streakCount} Days Active Flame</h4>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Chorcha Routine Reminders</p>
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

        {/* Alarm and scheduling toggle box (Chorcha Style) */}
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

    </div>
  );
}
