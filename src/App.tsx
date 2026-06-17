import React, { useState } from 'react';
import { 
  Heart, 
  Award, 
  BookOpen, 
  Code, 
  User, 
  Info,
  Smartphone,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Bell,
  Check,
  ChevronRight,
  LogOut,
  Stethoscope,
  XCircle
} from 'lucide-react';
import { DoctorProfile, Exam, Question, UserProgress, SubjectCategory } from './types';
import { QUESTIONS_BANK, LIVE_EXAMS_DATA } from './data/questions';
import PhoneSimulator from './components/PhoneSimulator';
import CodeExportPanel from './components/CodeExportPanel';

interface WeakChapter {
  chapter: string;
  category: SubjectCategory;
  accuracy: number;
  count: number;
  topic: string;
}

export default function App() {
  // Authentication State with localStorage caches
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('fcps_auth_logged_in') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    bmdcNumber: string;
  } | null>(() => {
    const cached = localStorage.getItem('fcps_auth_user');
    return cached ? JSON.parse(cached) : null;
  });

  // Candidate Profile State matching current auth values
  const [doctor, setDoctor] = useState<DoctorProfile>(() => {
    if (currentUser) {
      return {
        name: currentUser.name,
        specialty: 'FCPS Part-I Medicine Candidate',
        targetDate: 'Oct 24, 2026',
        targetSpecialty: 'Internal Medicine & Allied',
        hospital: 'Mayo Hospital, Lahore',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
        dailyStudyGoal: 40
      };
    }
    return {
      name: 'Dr. Sarah Ahmed',
      specialty: 'FCPS Part-I Medicine Candidate',
      targetDate: 'Oct 24, 2026',
      targetSpecialty: 'Internal Medicine & Allied',
      hospital: 'Mayo Hospital, Lahore',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
      dailyStudyGoal: 40
    };
  });

  // Adaptive Weak Chapters (Shikho Style)
  const [weakChapters, setWeakChapters] = useState<WeakChapter[]>([
    { chapter: 'Renal Physiology & Tubules', category: 'Physiology & Biochemistry', accuracy: 58, count: 12, topic: 'Renal clearance' },
    { chapter: 'Upper Limb Anatomy & Plexus', category: 'Anatomy', accuracy: 62, count: 8, topic: 'Brachial nerve loop' },
  ]);

  // Alarm routine reminder state (Chorcha Style)
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(false);
  const [reminderTime, setReminderTime] = useState<string>('08:00 PM');

  // Track MCQs solved today for Daily Study Goal visualization
  const [questionsSolvedToday, setQuestionsSolvedToday] = useState<number>(18);

  // Simulator Progress State
  const [progress, setProgress] = useState<UserProgress>({
    streakCount: 7,
    completedExamCount: 0,
    questionsSolvedCount: 204,
    averageScorePercentage: 74,
    history: [
      { date: 'Jun 13', questionsSolved: 30, score: 70 },
      { date: 'Jun 14', questionsSolved: 25, score: 72 },
      { date: 'Jun 15', questionsSolved: 45, score: 80 }
    ],
    subjectAverages: {
      'Anatomy': 65,
      'Physiology & Biochemistry': 71,
      'Pathology & Microbiology': 76,
      'Medicine & Allied': 85,
      'Surgery & Allied': 72,
      'Gynecology & Obstetrics': 68,
      'Pediatrics': 70
    }
  });

  const [activeSegment, setActiveSegment] = useState<'simulation' | 'export'>('simulation');
  const [questions, setQuestions] = useState<Question[]>(QUESTIONS_BANK);

  // Trigger exam launcher from external controls
  const [startExamTrigger, setStartExamTrigger] = useState<string | null>(null);

  // Profile customization toggle inputs
  const [editingProfile, setEditingProfile] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(doctor.name);
  const [editSpecialty, setEditSpecialty] = useState<string>(doctor.targetSpecialty);
  const [editHospital, setEditHospital] = useState<string>(doctor.hospital);
  const [editDailyGoal, setEditDailyGoal] = useState<number>(doctor.dailyStudyGoal || 40);

  const handleUpdateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDoctor(prev => ({
      ...prev,
      name: editName,
      targetSpecialty: editSpecialty,
      hospital: editHospital,
      dailyStudyGoal: editDailyGoal
    }));
    setEditingProfile(false);
  };

  // Auth screen handlers
  const handleAuthSuccess = (doctorData: { name: string; email: string; bmdcNumber: string }) => {
    setIsAuthenticated(true);
    setCurrentUser(doctorData);
    localStorage.setItem('fcps_auth_logged_in', 'true');
    localStorage.setItem('fcps_auth_user', JSON.stringify(doctorData));

    // Align matching metadata profile parameters
    setDoctor(prev => ({
      ...prev,
      name: doctorData.name,
    }));
    setEditName(doctorData.name);
  };

  const handleLogOut = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('fcps_auth_logged_in');
    localStorage.removeItem('fcps_auth_user');
  };

  // Dynamic Remediation Logic (Shikho Style)
  // Invoked when they fail any question inside Practice mode
  const handleSolveQuestion = (correct: boolean, question?: Question) => {
    // Increment daily study progress MCQ solved count
    setQuestionsSolvedToday(prev => prev + 1);

    // 1. Update general progress
    setProgress(prev => {
      const newSolved = prev.questionsSolvedCount + 1;
      const accuracyShift = correct ? 1.5 : -1.0;
      const newScore = Math.max(0, Math.min(100, Math.round(prev.averageScorePercentage + accuracyShift)));

      return {
        ...prev,
        questionsSolvedCount: newSolved,
        averageScorePercentage: newScore,
        streakCount: prev.streakCount + (correct ? 1 : 0)
      };
    });

    // 2. Adaptive remediation processing: If answer is wrong, update weak chapters
    if (!correct && question) {
      setWeakChapters(prev => {
        const matchIdx = prev.findIndex(item => item.chapter.toLowerCase().includes(question.topic.toLowerCase()) || item.category === question.subject);
        if (matchIdx >= 0) {
          const updated = [...prev];
          const prevItem = updated[matchIdx];
          
          // Re-calculate accuracy downward
          const newAccuracy = Math.max(30, Math.round(prevItem.accuracy * 0.9));
          updated[matchIdx] = {
            ...prevItem,
            accuracy: newAccuracy,
            count: prevItem.count + 1
          };
          return updated;
        } else {
          // Add new weak area parameter
          return [
            ...prev,
            {
              chapter: `${question.topic} Core Segment`,
              category: question.subject,
              accuracy: 60,
              count: 1,
              topic: question.topic
            }
          ];
        }
      });
    }
  };

  // Invoked when they complete a mock exam paper
  const handleCompleteExam = (examPercentage: number, wrongQuestions?: Question[], totalQuestions?: number) => {
    const solvedCount = totalQuestions || 10;
    setQuestionsSolvedToday(prev => prev + solvedCount);

    setProgress(prev => {
      const newCompleted = prev.completedExamCount + 1;
      const combinedScore = Math.round((prev.averageScorePercentage + examPercentage) / 2);

      return {
        ...prev,
        questionsSolvedCount: prev.questionsSolvedCount + solvedCount,
        completedExamCount: newCompleted,
        averageScorePercentage: combinedScore
      };
    });

    // Bulk adaptive remediation on mock mistakes
    if (wrongQuestions && wrongQuestions.length > 0) {
      setWeakChapters(prev => {
        const nextList = [...prev];
        wrongQuestions.slice(0, 3).forEach(q => {
          const matchIdx = nextList.findIndex(item => item.category === q.subject || item.chapter.includes(q.topic));
          if (matchIdx >= 0) {
            nextList[matchIdx] = {
              ...nextList[matchIdx],
              accuracy: Math.max(35, Math.round(nextList[matchIdx].accuracy * 0.85)),
              count: nextList[matchIdx].count + 1
            };
          } else {
            nextList.push({
              chapter: `${q.topic} Foundations`,
              category: q.subject,
              accuracy: 65,
              count: 1,
              topic: q.topic
            });
          }
        });
        return nextList;
      });
    }
  };

  const handleDrillChapterPractice = (category: SubjectCategory) => {
    // Simply logging dynamic drill selection or filter inside simulation
    console.log(`Drilling category ${category} in Practice Deck.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between" id="app-root-layout">
      
      {/* Upper Navigation Medical Bar */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-4 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-teal-500/10 p-2.5 rounded-2xl border border-teal-500/20 text-teal-600">
              <Stethoscope className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-snug flex items-center gap-1.5">
                CPSP FCPS Prep Companion <span className="bg-teal-50 text-teal-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded">v2.0</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">College of Physicians & Surgeons Pakistan Specialization Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-slate-500">Database Connection:</span>
            <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-250 select-none flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-550 animate-ping" /> Synchronized Offline
            </span>
          </div>
        </div>
      </header>

      {/* Main 2-column Container layout */}
      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Controls & Metadata Descriptions */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            
            {/* Candidate Identity verification card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-teal-600" /> Candidate Verification Card
                  </h2>
                  <p className="text-[10px] text-slate-400">Configure Doctor details to update the profile card dynamically</p>
                </div>
                {isAuthenticated && (
                  <span className="bg-emerald-100 text-emerald-800 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">Verified</span>
                )}
              </div>

              {isAuthenticated ? (
                <div className="space-y-4" id="verified-candidate-pane">
                  <div className="space-y-3 bg-slate-950 border border-slate-900 p-4 rounded-2xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-teal-500/10 rounded-full blur-xl" />
                    
                    <div className="flex items-center gap-3">
                      <img 
                        src={doctor.avatar} 
                        alt="" 
                        className="w-11 h-11 rounded-full border border-teal-500 object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-extrabold text-xs text-white truncate">{doctor.name}</p>
                        <p className="text-[10px] text-teal-400 font-mono tracking-wider uppercase font-bold">
                          {currentUser?.bmdcNumber || 'BMDC-49321-D'}
                        </p>
                        <p className="text-[9px] text-slate-400 truncate leading-relaxed">{currentUser?.email}</p>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-900/60 flex items-center justify-between text-[9px] text-slate-400">
                      <span>Affiliated Hub:</span>
                      <span className="font-bold text-white">{doctor.hospital}</span>
                    </div>
                  </div>

                  {!editingProfile ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditName(doctor.name);
                          setEditSpecialty(doctor.targetSpecialty);
                          setEditHospital(doctor.hospital);
                          setEditDailyGoal(doctor.dailyStudyGoal || 40);
                          setEditingProfile(true);
                        }}
                        className="flex-1 bg-slate-900 text-teal-300 text-xs font-bold py-2 rounded-xl hover:bg-slate-850 transition active:scale-95"
                      >
                        Edit Details
                      </button>
                      <button
                        onClick={handleLogOut}
                        className="p-2 border border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition duration-150 flex items-center justify-center"
                        title="Log Out Security Session"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleUpdateProfileSubmit} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-400">Doctor Name</label>
                        <input 
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-400">Target Field</label>
                        <select 
                          value={editSpecialty}
                          onChange={(e) => setEditSpecialty(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                        >
                          <option value="Internal Medicine & Allied">Internal Medicine & Allied</option>
                          <option value="General Surgery & Allied">General Surgery & Allied</option>
                          <option value="Gynecology & Obstetrics">Gynecology & Obstetrics</option>
                          <option value="Pediatrics Core">Pediatrics Core</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-400">Hospital Appointment</label>
                        <input 
                          type="text"
                          required
                          value={editHospital}
                          onChange={(e) => setEditHospital(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-400">Daily MCQ Study Goal</label>
                        <input 
                          type="number"
                          required
                          min="5"
                          max="200"
                          value={editDailyGoal}
                          onChange={(e) => setEditDailyGoal(Math.max(5, Number(e.target.value)))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                        />
                      </div>

                      <div className="flex gap-1.5 pt-1">
                        <button 
                          type="button"
                          onClick={() => setEditingProfile(false)}
                          className="flex-1 bg-slate-100 text-slate-600 text-xs py-1.5 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="flex-1 bg-teal-650 text-white text-xs font-bold py-1.5 rounded-lg"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-900 rounded-2xl p-4 text-xs space-y-2.5" id="auth-unauth-warning">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <span className="font-extrabold text-amber-950 uppercase tracking-widest text-[9px] block">CBT Lockscreen Active</span>
                      <p className="text-slate-700 leading-relaxed text-[11px]">
                        The mobile emulator is locked behind candidates registration portal. Register your clinical details inside the phone viewport to unlock full telemetry logs.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CPSP Syllabus Guidelines Info Panel */}
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 text-white space-y-4 shadow-md">
              <div className="flex items-center gap-1.5 border-b border-slate-850 pb-3">
                <Info className="w-5 h-5 text-teal-400" />
                <h3 className="font-semibold text-xs tracking-wider uppercase text-teal-400">CPSP FCPS Guidelines</h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  FCPS Part I consists of two primary papers administered under computer-based examination environments (CBT). 
                </p>

                <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl space-y-2">
                  <h4 className="font-bold text-teal-200 text-[10px] uppercase">Subject Weightings:</h4>
                  <ul className="space-y-1 text-slate-400 text-[10px] bullet-list pl-1">
                    <li>• Basic Anatomy: 25% / Paper I</li>
                    <li>• General Pathology: 30% / Paper I</li>
                    <li>• Physiology & Pharm: 35% / Paper II</li>
                    <li>• Clinical Diagnostics: 10% / Paper II</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Simulated Live Analytics telemetry panel */}
            {isAuthenticated && (
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3 text-xs text-slate-500" id="live-telemetry-panel">
                <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-teal-500" /> Live Adaptive Telemetry
                </h4>
                <p>Telemetry stats captured from ongoing clinical simulation:</p>
                <div className="grid grid-cols-2 gap-2 text-center text-slate-800 font-bold text-xs pt-1">
                  <div className="bg-teal-50 border border-teal-150 rounded-xl p-2.5">
                    <span className="block text-teal-700 text-base">{progress.questionsSolvedCount - 204}</span>
                    <span className="text-[8px] text-teal-600 tracking-wider font-extrabold uppercase">This Session</span>
                  </div>
                  <div className="bg-rose-50 border border-rose-150 rounded-xl p-2.5">
                    <span className="block text-rose-700 text-base">{weakChapters.length}</span>
                    <span className="text-[8px] text-rose-600 tracking-wider font-extrabold uppercase font-mono">Weak Areas</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Columns: Center/Right containing Simulator and Expo Code Inspector */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* View Segments tab controls */}
            <div className="flex border-b border-slate-250">
              <button
                onClick={() => setActiveSegment('simulation')}
                className={`py-3 px-6 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  activeSegment === 'simulation' 
                    ? 'border-teal-500 text-teal-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Smartphone className="w-4 h-4" /> Interactive Smartphone Simulator
              </button>
              <button
                onClick={() => setActiveSegment('export')}
                className={`py-3 px-6 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  activeSegment === 'export' 
                    ? 'border-teal-500 text-teal-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Code className="w-4 h-4" /> View React Native Expo Code (App)
              </button>
            </div>

            {/* Segment Contents */}
            {activeSegment === 'simulation' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start bg-white p-6 rounded-3xl border border-slate-100 shadow-sm" id="simulator-grid-segment">
                
                {/* Simulated Device Frame column */}
                <div className="flex justify-center">
                  <PhoneSimulator 
                    doctor={doctor}
                    exams={LIVE_EXAMS_DATA}
                    questions={questions}
                    onUpdateQuestions={setQuestions}
                    progress={progress}
                    onSolveQuestion={handleSolveQuestion}
                    onCompleteExam={handleCompleteExam}
                    startExamTrigger={startExamTrigger}
                    clearStartExamTrigger={() => setStartExamTrigger(null)}
                    onChangeTabInSimulator={(tabId) => {
                      if (tabId === 'Live') setStartExamTrigger('live1');
                    }}
                    questionsSolvedToday={questionsSolvedToday}
                    
                    // Auth state props
                    isAuthenticated={isAuthenticated}
                    onAuthSuccess={handleAuthSuccess}

                    // Remediation props
                    weakChapters={weakChapters}
                    onDrillChapter={handleDrillChapterPractice}

                    // Reminders settings
                    reminderEnabled={reminderEnabled}
                    onToggleReminder={setReminderEnabled}
                    reminderTime={reminderTime}
                    onSelectReminderTime={setReminderTime}
                  />
                </div>

                {/* Companion Sandbox Controls */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Drill & Exam Sandbox Controls</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      Manipulate active variables or invoke sudden simulation prompts to observe real-time native visual feedback.
                    </p>
                  </div>

                  {/* Force Streak increment */}
                  {isAuthenticated && (
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-205/60 space-y-3" id="app-streak-controls">
                      <h4 className="text-xs font-bold text-slate-800">Streak Engine Controls</h4>
                      <p className="text-[11px] text-slate-500">Accelerate preparation goals! Instantly award daily task accomplishments to verify visual Flame streaks:</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setProgress(prev => ({ ...prev, streakCount: prev.streakCount + 1 }))}
                          className="bg-white border border-slate-250 hover:bg-slate-100 text-slate-700 text-[11px] font-bold px-3 py-2 rounded-xl transition active:scale-95 flex-1 shadow-xs"
                        >
                          🔥 Bump Prepare Streak
                        </button>
                        <button
                          onClick={() => setProgress(prev => ({ ...prev, streakCount: Math.max(0, prev.streakCount - 1) }))}
                          className="bg-white border border-slate-250 hover:bg-slate-100 text-slate-700 text-[11px] font-medium px-3 py-2 rounded-xl transition active:scale-95 flex-1"
                        >
                          Reset/Reduce Streak
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Force Direct Mock Exam Start */}
                  {isAuthenticated && (
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-205/60 space-y-3" id="app-trigger-controls">
                      <h4 className="text-xs font-bold text-slate-800">Interactive Hotkeys</h4>
                      <p className="text-[11px] text-slate-500">Inject parameters immediately into the mobile navigation matrix:</p>
                      <button
                        onClick={() => {
                          setStartExamTrigger('live1');
                        }}
                        className="w-full bg-teal-600 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-teal-700 transition active:scale-95 shadow flex items-center justify-center gap-1.5"
                      >
                        ⚡ Hot Launch "FCPS National Mock"
                      </button>
                    </div>
                  )}

                  {/* Info list on medical contents */}
                  <div className="border border-slate-100 rounded-2xl p-4 space-y-2 text-[11px] text-slate-500 leading-relaxed">
                    <span className="font-bold text-slate-700 block uppercase tracking-wide text-[9px]">Included SBA Syllabus Scope</span>
                    <p>Our simulator leverages genuine past exam questions relating to phase components of repolarization cycles (Ganong\'s Physiology), Hesselbach\'s inguinal hernia margins (Bailey & Love), primary hyperpigmentation adrenal Addison syndromes (Harrison\'s Endocrinology), and mature smudge lymphoblasts (Robbins Hematology).</p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="animate-fadeIn">
                <CodeExportPanel />
              </div>
            )}

          </div>

        </div>
      </main>

      {/* Footer credits */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-6 text-center shrink-0" id="global-layout-footer">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© 2526 College of Physicians and Surgeons Pakistan. All Rights Reserved.</p>
          <p className="text-slate-500 flex items-center gap-1">
            Built for doctors preparing Part 1 with slate-teal theme. Crafted with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />.
          </p>
        </div>
      </footer>

    </div>
  );
}
