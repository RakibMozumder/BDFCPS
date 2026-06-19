import React, { useState, useEffect } from 'react';
import { Timer, ClipboardList, CheckCircle2, ChevronRight, Play, AlertTriangle, Book, AlertCircle, ArrowLeft, RefreshCw, Star, Clock, Sparkles, Check, Award } from 'lucide-react';
import { Exam, Question, SubjectCategory } from '../types';
import CountdownTimer from './CountdownTimer';
import { useCountdownTimer } from '../hooks/useCountdownTimer';

const SHIKHO_SMART_NOTES_MAP: Record<string, { criteria: string[]; steps: string[]; citation: string }> = {
  q1: {
    criteria: [
      'Prolonged QTc interval on standard ECG (>450ms in males, >460ms in females).',
      'Triggered by congenital channelopathies (e.g., KCNQ1, KCNH2 potassium currents mutations).',
      'Associated with high susceptibility to polymorphic ventricular tachycardia (Torsades de Pointes).'
    ],
    steps: [
      'Draw serum electrolytes immediately (evaluate for hypokalemia, hypomagnesemia, and hypocalcemia).',
      'Perform urgent drug reconciliation; immediately discontinue any offending QT-prolonging pharmaceutical agents.',
      'Administer Magnesium Sulfate 2g IV push over 1-2 minutes if hemodynamically unstable, regardless of serum levels.'
    ],
    citation: "Ganong's Review of Medical Physiology, 26th Ed, Chapter 30"
  },
  q2: {
    criteria: [
      'Inguinal region bulging emerging medial to the inferior epigastric artery vessels.',
      'Protrusion occurs through Hesselbach’s triangle, bounded by rectus margin, inguinal ligament, and inferior epigastric artery.',
      'Primarily caused by acquired progressive weakness in the transversalis fascia (posterior wall of inguinal canal).'
    ],
    steps: [
      'Assess for hernia reducibility at bedside with gentle manual compression and patient in supine position.',
      'Monitor for persistent groin pain, skin erythema, vomiting, or obstipation highlighting clinical strangulation.',
      'Schedule surgical repair utilizing standard tension-free Lichtenstein polypropylene mesh hernioplasty.'
    ],
    citation: "Bailey & Love's Short Practice of Surgery, 27th Ed, Page 288"
  },
  q3: {
    criteria: [
      'Serum morning cortisol < 3 mcg/dL accompanied by high ACTH levels (>100 pg/mL).',
      'Hyperpigmentation of palmar creases, oral mucosal check surfaces, or scars due to melanocyte POMC cleavage.',
      'Serum electrolyte imbalances: profound hyponatremia, hyperkalemia, and recurrent fasting hypoglycemia.'
    ],
    steps: [
      'Establish immediate intravenous access and draw blood for serum cortisol, ACTH, and electrolyte baselines.',
      'Administer 250 mcg Cosyntropin (synthetic ACTH) IV or IM bolus.',
      'Measure serum cortisol levels at exactly 30 and 60 minutes. Cortisol failure to rise above 18-20 mcg/dL confirms primary insufficiency.'
    ],
    citation: "Harrison's Principles of Internal Medicine, 21st Ed, Chapter 379"
  },
  q4: {
    criteria: [
      'Sustained absolute monoclonal B-lymphocytosis (>=5,000/μL) with co-expression of CD19, CD20, CD5, and CD23 markers.',
      'Fragile B-lymphocytes ruptured during blood film smear prep, creating diagnostic "Smudge Cells" or "Basket Cells".',
      'Systemic painless lymphadenopathy and cytopenias secondary to progressive bone marrow infiltration.'
    ],
    steps: [
      'Request systemic peripheral blood flow cytometry to confirm clonal B-cell phenotype and rule out reactive states.',
      'Perform fluorescence in situ hybridization (FISH) to isolate risk markers like del(17p) which guide chemotherapy.',
      'Monitor closely and defer clinical chemotherapy until disease progression features (splenomegaly, fever, weight loss) emerge.'
    ],
    citation: "Robbins & Cotran Pathologic Basis of Disease, 10th Ed, Chapter 13"
  },
  q5: {
    criteria: [
      'Abrupt onset of extreme, generalized peritonitic abdominal pain with marked guarding, rigidity ("board-like" abdomen).',
      'Pneumoperitoneum demonstrating crescentic subdiaphragmatic free air on upright erect chest radiographs.',
      'Systemic inflammatory response syndrome (SIRS): tachycardia, hypotension, high-grade spikes in core temperature.'
    ],
    steps: [
      'Keep patient strictly NPO, install a double-lumen nasogastric tube to initiate active gastric decompression.',
      'Commence aggressive fluid volume resuscitation with warm crystalloids and administer broad-spectrum IV triple antibiotics.',
      'Arrange immediate transfer to the operating theater for emergent exploratory laparotomy or laparoscopy with visceral repair.'
    ],
    citation: "Bailey & Love's Short Practice of Surgery, 27th Ed, Chapter 60"
  },
  q6: {
    criteria: [
      'New-onset hypertension (BP >= 160/110 mmHg) on two separate readings after 20 weeks gestation.',
      'Significant proteinuria (protein/creatinine ratio >= 0.3 or 3+ on dipstick analysis).',
      'Cerebral or visual disturbances (throbbing headache, scotomata), hyperreflexia, or epigastric quadrant pain.'
    ],
    steps: [
      'Establish secure venous access and commence active seizure prophylaxis with Magnesium Sulfate (4g IV loading over 20 minutes).',
      'Maintain Magnesium Sulfate infusion at 1-2g/hour and monitor patellar reflexes, respiratory rates, and urine output closely.',
      'Initiate urgent anti-hypertensive control (IV Hydralazine or Labetalol) and organize delivery of the fetus.'
    ],
    citation: "William's Obstetrics, 26th Ed, Chapter 40"
  },
  q7: {
    criteria: [
      'Presence of severe restlessness, distress, or clinical irritability in a child.',
      'Anatomically sunken eye globes combined with dry mucous membranes and slow, sluggish skin-pinch recoil (takes >1.5 seconds).',
      'General signs of cellular dehydration classification matching the WHO IMCI "Some Dehydration" threshold.'
    ],
    steps: [
      'Assess fluid requirements according to WHO Rehydration Plan B parameters.',
      'Decompress rehydration deficits over 4 hours with 75 ml/kg of low-osmolality Oral Rehydration Salts (ORS) solution.',
      'Re-examine clinical signs continuously and encourage continuation of breastfeeding/normal nutrition.'
    ],
    citation: "Nelson Textbook of Pediatrics, 21st Ed, Chapter 363"
  }
};

interface LiveExamsTabProps {
  exams: Exam[];
  onCompleteExam: (score: number, wrongQuestions?: Question[], totalQuestions?: number) => void;
  startExamId?: string | null;
  clearStartExamId?: () => void;
}

export default function LiveExamsTab({ exams, onCompleteExam, startExamId, clearStartExamId }: LiveExamsTabProps) {
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  const [reviewMode, setReviewMode] = useState<boolean>(false);

  const [initialSeconds, setInitialSeconds] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  // Hoist the submit function so hook can use it safely
  function handleSubmitExam() {
    setTimerActive(false);
    setShowResults(true);
    if (!activeExam) return;
    let correct = 0;
    const wrongQs: Question[] = [];
    activeExam.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswerIndex) {
        correct++;
      } else {
        wrongQs.push(q);
      }
    });
    const percentage = Math.round((correct / activeExam.questions.length) * 100);
    onCompleteExam(percentage, wrongQs, activeExam.questions.length);
  }

  const { timeLeft, setTimeLeft } = useCountdownTimer({
    initialSeconds,
    isActive: timerActive,
    onTimeUp: handleSubmitExam,
  });

  // Handle direct launch from homepage shortcut
  useEffect(() => {
    if (startExamId) {
      const match = exams.find(e => e.id === startExamId);
      if (match && match.status === 'Active') {
        handleStartExam(match);
      }
      if (clearStartExamId) clearStartExamId();
    }
  }, [startExamId, exams]);

  const handleStartExam = (exam: Exam) => {
    setActiveExam(exam);
    setCurrentQuestionIdx(0);
    setAnswers({});
    setInitialSeconds(exam.durationMinutes * 60);
    setTimerActive(true);
    setShowResults(false);
    setReviewMode(false);
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (showResults) return;
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };


  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (activeExam) {
    const currentQuestion = activeExam.questions[currentQuestionIdx];
    const totalQuestions = activeExam.questions.length;
    const answeredCount = Object.keys(answers).length;

    if (showResults) {
      // Calculate scores
      let correct = 0;
      let wrong = 0;
      activeExam.questions.forEach(q => {
        if (answers[q.id] === undefined) return;
        if (answers[q.id] === q.correctAnswerIndex) correct++;
        else wrong++;
      });
      const unattempted = totalQuestions - correct - wrong;
      const scorePercent = Math.round((correct / totalQuestions) * 100);
      const passed = scorePercent >= 75; // standard CPSP cutoff score is typically 75%

      return (
        <div className="flex flex-col overflow-y-auto max-h-[580px] p-4 space-y-4 pb-16 scrollbar-thin scrollbar-thumb-slate-300">
          <div className="text-center space-y-1 py-4">
            <div className="inline-flex p-3 rounded-full bg-slate-100 mb-2">
              <ClipboardList className={`w-8 h-8 ${passed ? 'text-teal-600' : 'text-amber-600'}`} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Exam Assessment Completed</h2>
            <p className="text-xs text-slate-500">{activeExam.title}</p>
          </div>

          {/* Core Score Circle */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-center space-y-3">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                <circle 
                  cx="48" cy="48" r="40" 
                  stroke={passed ? '#0d9488' : '#f59e0b'} 
                  strokeWidth="8" 
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - scorePercent / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-bold text-slate-800 font-mono">{scorePercent}%</span>
                <span className="block text-[8px] text-slate-400 font-bold tracking-wider uppercase">Your Score</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className={`text-xs font-bold inline-block px-3 py-0.5 rounded-full ${
                passed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}>
                {passed ? 'PASSED: Recommended for FCPS-I' : 'Marginal Score: Requires Focus'}
              </span>
              <p className="text-[10px] text-slate-400">Cut-off Passing Standard: 75%</p>
            </div>
          </div>

          {/* Micro Diagnostic Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5">
              <span className="block text-lg font-bold text-emerald-700 font-mono">{correct}</span>
              <span className="text-[9px] text-emerald-600 font-semibold uppercase">Correct</span>
            </div>
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-2.5">
              <span className="block text-lg font-bold text-rose-700 font-mono">{wrong}</span>
              <span className="text-[9px] text-rose-600 font-semibold uppercase">Incorrect</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <span className="block text-lg font-bold text-slate-500 font-mono">{unattempted}</span>
              <span className="text-[9px] text-slate-500 font-semibold uppercase">Skipped</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <button 
              onClick={() => { setReviewMode(true); setShowResults(false); setCurrentQuestionIdx(0); }}
              className="w-full bg-slate-900 text-white text-xs font-bold py-3 rounded-xl hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 shadow"
            >
              <Book className="w-4 h-4 text-teal-400" /> Review Explanations & References
            </button>
            <button 
              onClick={() => setActiveExam(null)}
              className="w-full bg-white border border-slate-200 text-slate-700 text-xs font-bold py-3 rounded-xl hover:bg-slate-50 active:scale-95 transition-all text-center"
            >
              Return to Exam Desk
            </button>
          </div>
        </div>
      );
    }

    if (reviewMode) {
      return (
        <div className="flex flex-col overflow-y-auto max-h-[580px] p-4 space-y-4 pb-16 scrollbar-thin scrollbar-thumb-slate-300">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => { setShowResults(true); setReviewMode(false); }}
              className="text-xs font-semibold text-slate-600 flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-lg"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Scorecard
            </button>
            <span className="text-xs text-slate-500 font-bold">Question {currentQuestionIdx + 1} of {totalQuestions}</span>
          </div>

          {/* Active Review MCQ */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-4 min-h-[220px]">
            <div className="flex items-start gap-1.5">
              <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded shrink-0">
                Q {currentQuestionIdx + 1}
              </span>
              <p className="text-slate-800 text-xs font-semibold leading-relaxed">{currentQuestion.question}</p>
            </div>

            {/* Render choices with highlight mapping */}
            <div className="space-y-2">
              {currentQuestion.options.map((option, oIdx) => {
                const userChoice = answers[currentQuestion.id];
                const isCorrectOption = oIdx === currentQuestion.correctAnswerIndex;
                const isUserWrongChoice = userChoice === oIdx && !isCorrectOption;

                let borderStyle = 'border-slate-100';
                let bgStyle = 'bg-slate-50';
                let indicatorText = null;

                if (isCorrectOption) {
                  borderStyle = 'border-emerald-500';
                  bgStyle = 'bg-emerald-50 text-emerald-800';
                  indicatorText = '✓ Correct Choice';
                } else if (isUserWrongChoice) {
                  borderStyle = 'border-rose-400';
                  bgStyle = 'bg-rose-50 text-rose-800';
                  indicatorText = '✗ Your Choice';
                }

                return (
                  <div key={oIdx} className={`p-3 rounded-xl border text-xs leading-normal transition-all ${borderStyle} ${bgStyle}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium pr-2">{option}</span>
                      {indicatorText && (
                        <span className="text-[8px] font-mono font-bold uppercase tracking-wider shrink-0 px-1.5 py-0.5 rounded bg-white/60">
                          {indicatorText}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Shikho-style Smart Note Rationale Card */}
            {(() => {
              const note = SHIKHO_SMART_NOTES_MAP[currentQuestion.id];
              const criteria = note ? note.criteria : [
                currentQuestion.explanation.split('.')[0] + '.',
                `Confirm and cross-reference diagnostic parameters for "${currentQuestion.topic}".`,
                'Verify absence of atypical mimic conditions prior to instituting therapy.'
              ];
              const steps = note ? note.steps : [
                'Establish patent IV access; monitor vital timelines and record serial ECG or serum levels.',
                'Utilize directed pharmaceutical or procedural protocols as outlined under clinical guidelines.',
                'Discharge with scheduled outpatient clinician follow-up index.'
              ];
              const citation = note ? note.citation : (currentQuestion.reference || 'Bailey & Love\'s 28th Ed, Page 412');

              return (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3.5 text-xs text-white shadow" id="shikho-smart-note-card">
                  {/* Glowing header badge */}
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-[9px] uppercase tracking-widest font-mono font-black text-teal-400 flex items-center gap-1.5 animate-pulse">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-450" />
                      Shikho Clinical Smart Note
                    </span>
                    <span className="text-[8px] font-mono text-slate-500 uppercase">Interactive Rationale</span>
                  </div>

                  {/* Core explanation overview */}
                  <div className="space-y-1">
                    <span className="text-[8px] uppercase font-bold text-slate-400 block tracking-wider">Clinical Insight</span>
                    <p className="text-slate-350 leading-relaxed text-[10.5px]">
                      {currentQuestion.explanation}
                    </p>
                  </div>

                  {/* Diagnostic Criteria Block */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] uppercase font-bold text-teal-400 block tracking-wider font-mono">1. Clinical Diagnostic Criteria</span>
                    <ul className="space-y-1 font-sans text-slate-300 text-[10px] pl-0.5">
                      {criteria.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-1.5 leading-snug">
                          <Check className="w-3 h-3 text-teal-500 shrink-0 mt-0.5" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Immediate Action Steps Block */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] uppercase font-bold text-rose-400 block tracking-wider font-mono">2. Immediate Clinical Actions Protocol</span>
                    <ol className="space-y-1 font-sans text-slate-300 text-[10px] pl-0.5">
                      {steps.map((step, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-2 leading-snug">
                          <span className="w-3.5 h-3.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 text-[8px] font-mono font-bold mt-0.5">
                            {sIdx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Highlighting Textbook Citation line */}
                  <div className="pt-2 border-t border-slate-800/80 text-[9px] font-mono font-semibold text-slate-400 flex items-center justify-between">
                    <span className="flex items-center gap-1"><Book className="w-3 h-3 text-slate-500" /> Textbook Citation:</span>
                    <span className="text-teal-400 font-extrabold">{citation}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Review Navigator */}
          <div className="flex items-center justify-between gap-2 pt-2">
            <button 
              disabled={currentQuestionIdx === 0}
              onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
              className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl disabled:opacity-40 text-xs transition-opacity"
            >
              Previous Exam Item
            </button>
            <button 
              disabled={currentQuestionIdx === totalQuestions - 1}
              onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
              className="flex-1 bg-slate-900 text-teal-400 font-bold py-2.5 rounded-xl disabled:opacity-40 text-xs transition-opacity"
            >
              Next Exam Item
            </button>
          </div>
          <button 
            onClick={() => setActiveExam(null)}
            className="w-full bg-teal-600 text-white font-bold py-2.5 rounded-xl text-xs shadow hover:bg-teal-700 transition"
          >
            Finish Review Desk
          </button>
        </div>
      );
    }

    // Active Testing Simulator UI
    return (
      <div className="flex flex-col h-[580px] relative pb-16">
        {/* Polished CountdownTimer and solved status display */}
        <CountdownTimer 
          timeLeft={timeLeft}
          setTimeLeft={setTimeLeft}
          isActive={!!activeExam && !showResults && !reviewMode}
          onTimeUp={handleSubmitExam}
          totalDuration={activeExam.durationMinutes * 60}
        />
        
        {/* Attempted Status Bar overlay */}
        <div className="bg-slate-950 px-4 py-1.5 text-white flex justify-between items-center text-[10px] font-mono border-b border-slate-900 select-none">
          <span className="text-slate-400 uppercase tracking-widest font-bold">Exam Console</span>
          <span className="text-teal-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            SOLVED: {answeredCount}/{totalQuestions} Items
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-1.5">
          <div 
            className="bg-teal-500 h-full transition-all duration-300"
            style={{ width: `${((currentQuestionIdx + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Question Area Scrollbody */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[460px] pb-10 scrollbar-thin scrollbar-thumb-slate-300">
          {/* Question Box */}
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">
                ITEM {currentQuestionIdx + 1} OF {totalQuestions}
              </span>
              <span className="bg-teal-50 text-teal-800 text-[9px] font-bold px-2 py-0.5 rounded">
                {currentQuestion.subject}
              </span>
            </div>

            <p className="text-xs font-bold text-slate-800 leading-relaxed">
              {currentQuestion.question}
            </p>
          </div>

          {/* Interactive Multiple Choice Options list (5 Options - standard FCPS Part 1) */}
          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => {
              const letter = String.fromCharCode(65 + index); // A, B, C, D, E
              const isSelected = answers[currentQuestion.id] === index;

              return (
                <div 
                  key={index}
                  onClick={() => handleSelectOption(currentQuestion.id, index)}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs cursor-pointer select-none transition-all duration-150 ${
                    isSelected 
                      ? 'bg-teal-50/80 border-teal-500 text-teal-900 shadow-sm translate-x-1' 
                      : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold ${
                    isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {letter}
                  </span>
                  <p className="leading-tight pt-0.5">{option}</p>
                </div>
              );
            })}
          </div>

          {/* Quick CBT Instructions */}
          <div className="bg-slate-100 rounded-xl p-3 text-[10px] text-slate-500 flex items-start gap-1.5 leading-relaxed">
            <AlertTriangle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            Once you submit, answers are run through the CPSP grading matrices. Correcting items or reviewing rationales are locked until submission.
          </div>
        </div>

        {/* Bottom Lock Controls */}
        <div className="absolute bottom-16 left-0 right-0 bg-white border-t border-slate-100 p-3 flex justify-between items-center z-10 gap-2">
          <button 
            disabled={currentQuestionIdx === 0}
            onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
            className="flex-1 bg-white border border-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl disabled:opacity-40 transition"
          >
            Previous
          </button>

          {currentQuestionIdx < totalQuestions - 1 ? (
            <button 
              onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
              className="flex-1 bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-slate-800 transition"
            >
              Next Item
            </button>
          ) : (
            <button 
              onClick={handleSubmitExam}
              className="flex-1 bg-teal-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-teal-700 transition flex items-center justify-center gap-1 shadow"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-200" /> Submit Paper
            </button>
          )}
        </div>
      </div>
    );
  }

  // Not started - display active portal lists
  return (
    <div className="flex flex-col overflow-y-auto max-h-[580px] p-4 space-y-4 pb-16 scrollbar-thin scrollbar-thumb-slate-300">
      
      <div className="space-y-1">
        <h2 className="text-base font-bold text-slate-800">BCPS Live Examination Desk</h2>
        <p className="text-xs text-slate-500">
          Engage in scheduled Bangladesh-wide mock exams targeting the actual FCPS format with real-time CBT system limits.
        </p>
      </div>

      {/* Loop exams list */}
      <div className="space-y-3">
        {exams.map(exam => {
          const isActive = exam.status === 'Active';
          const isUpcoming = exam.status === 'Upcoming';
          const isCompleted = exam.status === 'Completed';

          return (
            <div 
              key={exam.id} 
              className={`bg-white rounded-2xl border p-4 shadow-sm relative overflow-hidden transition-all duration-250 ${
                isActive ? 'border-teal-400 ring-2 ring-teal-500/10' : 'border-slate-100'
              }`}
            >
              {/* Decorative Corner Flashes */}
              {isActive && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-bl select-none animate-pulse">
                  🔴 LIVE NOW
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                    isActive ? 'bg-teal-50 text-teal-600' : isUpcoming ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {exam.subject}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-semibold">{exam.questionCount} Questions</span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800 leading-snug">{exam.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-semibold">
                    <Clock className="w-3 h-3" /> {exam.startTime}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-medium">Duration: {exam.durationMinutes} Mins</span>

                  {isActive ? (
                    <button 
                      onClick={() => handleStartExam(exam)}
                      className="bg-teal-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-lg flex items-center gap-1 hover:bg-teal-700 active:scale-95 transition-all shadow-sm"
                    >
                      <Play className="w-3 h-3 text-teal-200 fill-teal-200 shrink-0" /> Enter Mock
                    </button>
                  ) : isUpcoming ? (
                    <button 
                      disabled
                      className="bg-slate-100 border border-slate-200 text-slate-400 text-[10px] font-bold px-3 py-1.5 rounded-lg"
                    >
                      Locked (Soon)
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 bg-emerald-50 px-2 py-1 rounded-sm">
                      ✓ Completed (Score: 78%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CBT Rules details */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2 text-slate-600 text-[10px] leading-relaxed">
        <h5 className="font-bold text-slate-700 flex items-center gap-1 uppercase tracking-wider text-[9px]">
          <AlertCircle className="w-3.5 h-3.5 text-teal-600" /> CBT Medical Mock Protocols
        </h5>
        <ul className="list-disc pl-3.5 space-y-1 text-slate-500">
          <li>Negative marking is NOT applicable in FCPS Part I, so candidates are advised to answer all 100 questions.</li>
          <li>Our live system is calibrated to the official CPSP weighting matrix across basic subjects (Anatomy, Physiology, Pathology, Medicine).</li>
        </ul>
      </div>

    </div>
  );
}
