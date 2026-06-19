import React, { useState } from 'react';
import { BookOpen, Star, HelpCircle, Check, X, ShieldAlert, Sparkles, BookOpenCheck, ArrowRight, Bookmark, ChevronRight } from 'lucide-react';
import { Question, SubjectCategory } from '../types';

interface PracticeTabProps {
  questions: Question[];
  onSolveQuestion: (correct: boolean, question?: Question) => void;
  onUpdateQuestions?: (qs: Question[]) => void;
}

export default function PracticeTab({ questions, onSolveQuestion, onUpdateQuestions }: PracticeTabProps) {
  const [selectedSubject, setSelectedSubject] = useState<SubjectCategory | null>(null);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [answeredState, setAnsweredState] = useState<boolean>(false);
  const [bookmarkedQs, setBookmarkedQs] = useState<Record<string, boolean>>({});

  // Subjects definition with graphic icons and background accents
  const SUBJECT_DECKS: { name: SubjectCategory; subtitle: string; iconBg: string; textColor: string }[] = [
    { name: 'Physiology & Biochemistry', subtitle: 'Action potentials, endocrine receptors, metabolism', iconBg: 'bg-teal-50', textColor: 'text-teal-600' },
    { name: 'Anatomy', subtitle: 'Nerve mappings, hernia triangles, vascular loops', iconBg: 'bg-indigo-50', textColor: 'text-indigo-600' },
    { name: 'Pathology & Microbiology', subtitle: 'Hematopoiesis, smudge cells, viral replication', iconBg: 'bg-rose-50', textColor: 'text-rose-600' },
    { name: 'Medicine & Allied', subtitle: 'Endocrine assays, cardiology diagnoses, neurology', iconBg: 'bg-slate-900 text-white', textColor: 'text-slate-100' },
    { name: 'Surgery & Allied', subtitle: 'Gastrointestinal perforations, emergency bailey books', iconBg: 'bg-amber-50', textColor: 'text-amber-600' },
    { name: 'Gynecology & Obstetrics', subtitle: 'Severe preeclampsia, magnesium dosages, obstetric circles', iconBg: 'bg-emerald-50', textColor: 'text-emerald-600' },
    { name: 'Pediatrics', subtitle: 'IMCI dehydration, systemic pediatric guidelines', iconBg: 'bg-sky-50', textColor: 'text-sky-600' },
  ];

  const handleSelectSubject = (subject: SubjectCategory) => {
    setSelectedSubject(subject);
    setActiveQuestionIdx(0);
    setSelectedAnswerIdx(null);
    setAnsweredState(false);
  };

  const activeDeckQuestions = questions.filter(q => q.subject === selectedSubject);

  const handleAnswerSubmit = (optionIdx: number) => {
    if (answeredState) return;
    setSelectedAnswerIdx(optionIdx);
    setAnsweredState(true);

    const activeQuestion = activeDeckQuestions[activeQuestionIdx];
    const isCorrect = optionIdx === activeQuestion.correctAnswerIndex;
    onSolveQuestion(isCorrect, activeQuestion);
  };

  const handleNextQuestion = () => {
    if (activeQuestionIdx < activeDeckQuestions.length - 1) {
      setActiveQuestionIdx(prev => prev + 1);
      setSelectedAnswerIdx(null);
      setAnsweredState(false);
    }
  };

  const handleToggleBookmark = (qId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedQs(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  if (selectedSubject) {
    const totalDeckQs = activeDeckQuestions.length;
    const currentQ = activeDeckQuestions[activeQuestionIdx];

    return (
      <div className="flex flex-col overflow-y-auto max-h-[580px] p-4 space-y-4 pb-16 scrollbar-thin scrollbar-thumb-slate-300">
        
        {/* Selection Subheader */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSelectedSubject(null)}
            className="text-xs font-semibold text-slate-600 flex items-center gap-1 bg-slate-100 px-2.5 py-1.5 rounded-lg active:scale-95 transition-all"
            id="back-to-decks-btn"
          >
            ← Decks List
          </button>
          <span className="text-[10px] text-slate-400 font-bold uppercase">
            {selectedSubject} Library
          </span>
        </div>

        {totalDeckQs === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center space-y-3">
            <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-700 text-sm">Under Clinical Preparation</h3>
            <p className="text-xs text-slate-400 leading-normal">
              Our academic board is actively compiling verified Single Best Answers (SBAs) for this specific subfield. Choose Anatomy, Physiology, or Pathology in the interim!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Interactive Question Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-[9px] font-mono font-bold text-slate-400">
                  DECK ITEM {activeQuestionIdx + 1} OF {totalDeckQs}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="bg-teal-50 text-teal-800 text-[8px] font-bold px-2 py-0.5 rounded uppercase">
                    {currentQ.topic}
                  </span>
                  <button 
                    onClick={(e) => handleToggleBookmark(currentQ.id, e)}
                    className="p-1 rounded bg-slate-50 border border-slate-250 text-slate-500 hover:text-amber-500"
                    id={`bookmark-${currentQ.id}`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${bookmarkedQs[currentQ.id] ? 'fill-amber-400 text-amber-500 border-none' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-xs font-bold text-slate-800 leading-relaxed">
                {currentQ.question}
              </p>

              {/* Choices (5-option SBA format) */}
              <div className="space-y-2">
                {currentQ.options.map((opt, oIdx) => {
                  const letter = String.fromCharCode(65 + oIdx);
                  const isUserSelection = selectedAnswerIdx === oIdx;
                  const isCorrectAnswer = oIdx === currentQ.correctAnswerIndex;

                  let borderClass = 'border-slate-100';
                  let bgClass = 'bg-white text-slate-700 hover:bg-slate-50';
                  let circleClass = 'bg-slate-100 text-slate-500';

                  if (answeredState) {
                    if (isCorrectAnswer) {
                      borderClass = 'border-emerald-500';
                      bgClass = 'bg-emerald-50/70 text-emerald-900 border-emerald-500 font-medium scale-[1.01]';
                      circleClass = 'bg-emerald-600 text-white';
                    } else if (isUserSelection && !isCorrectAnswer) {
                      borderClass = 'border-rose-400';
                      bgClass = 'bg-rose-50/70 text-rose-900 border-rose-300';
                      circleClass = 'bg-rose-600 text-white';
                    } else {
                      bgClass = 'opacity-50 bg-white text-slate-500';
                    }
                  }

                  return (
                    <div 
                      key={oIdx}
                      onClick={() => handleAnswerSubmit(oIdx)}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer select-none transition-all ${borderClass} ${bgClass}`}
                      id={`option-${currentQ.id}-${oIdx}`}
                    >
                      <span className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold ${circleClass}`}>
                        {answeredState && isCorrectAnswer ? <Check className="w-3.5 h-3.5" /> : answeredState && isUserSelection ? <X className="w-3.5 h-3.5" /> : letter}
                      </span>
                      <p className="leading-tight pt-0.5">{opt}</p>
                    </div>
                  );
                })}
              </div>

              {/* Instant rationale panel upon answer */}
              {answeredState && (
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 space-y-2 text-xs animate-fadeIn">
                  <h5 className="font-bold text-amber-950 flex items-center gap-1">
                    <BookOpenCheck className="w-4 h-4 text-emerald-600" /> Clinical Diagnosis Explanation
                  </h5>
                  <p className="text-amber-900 leading-relaxed text-[11px]">
                    {currentQ.explanation}
                  </p>
                  <div className="pt-2 border-t border-amber-200/40 text-[9px] text-amber-800 font-mono font-medium flex items-center justify-between">
                    <span>📚 COMPENDIUM REF:</span>
                    <span className="font-bold text-teal-800">{currentQ.reference}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Next navigator card */}
            {answeredState && (
              <div className="flex gap-2">
                {activeQuestionIdx < totalDeckQs - 1 ? (
                  <button 
                    onClick={handleNextQuestion}
                    className="w-full bg-slate-900 text-teal-300 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow"
                    id="btn-next-question"
                  >
                    Next Question <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
                  </button>
                ) : (
                  <button 
                    onClick={() => setSelectedSubject(null)}
                    className="w-full bg-teal-600 text-white font-bold text-xs py-3 rounded-xl active:scale-95 transition"
                    id="btn-complete-deck"
                  >
                    Deck Completed! Back to Subjects
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Categories deck list index
  return (
    <div className="flex flex-col overflow-y-auto max-h-[580px] p-4 space-y-3.5 pb-16 scrollbar-thin scrollbar-thumb-slate-300">
      
      {/* Dynamic Header */}
      <div className="flex items-start justify-between gap-1.5 border-b border-slate-100 pb-3">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-800">CPSP Syllabus Practice</h2>
          <p className="text-[10px] sm:text-xs text-slate-500">
            Target basic medical sciences chapter-wise. Pick a subject to initiate interactive SBA cards.
          </p>
        </div>
      </div>

      {/* Main categories view */}
      <div className="space-y-2.5">
        {SUBJECT_DECKS.map((deck) => {
          const isMedicine = deck.name === 'Medicine & Allied';
          // Compute dynamic question count!
          const liveCount = questions.filter(q => q.subject === deck.name).length;

          return (
            <div 
              key={deck.name}
              onClick={() => handleSelectSubject(deck.name)}
              className={`group flex items-center justify-between p-3 rounded-2xl border border-slate-100 cursor-pointer transition-all duration-200 shadow-sm ${
                isMedicine 
                  ? 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800' 
                  : 'bg-white hover:border-teal-400 hover:translate-x-1 hover:shadow'
              }`}
              id={`deck-btn-${deck.name.replace(/\s+/g, '-')}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl shrink-0 ${isMedicine ? 'bg-teal-500/10 border border-teal-500/20' : deck.iconBg}`}>
                  <BookOpen className={`w-4 h-4 ${isMedicine ? 'text-teal-400' : deck.textColor}`} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold leading-tight">{deck.name}</h4>
                  <p className={`text-[10px] leading-tight line-clamp-1 max-w-[190px] ${isMedicine ? 'text-slate-400' : 'text-slate-500'}`}>
                    {deck.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  isMedicine ? 'bg-teal-500/15 text-teal-400' : 'bg-slate-100 text-slate-600'
                }`}>
                  {liveCount} Qs
                </span>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 group-hover:translate-x-1 transition-transform ${isMedicine ? 'text-teal-400' : 'text-slate-400'}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
