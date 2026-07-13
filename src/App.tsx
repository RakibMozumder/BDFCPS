import React, { useState, useEffect } from 'react';
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
  XCircle,
  Database
} from 'lucide-react';
import { DoctorProfile, Exam, Question, UserProgress, SubjectCategory } from './types';
import { QUESTIONS_BANK, LIVE_EXAMS_DATA } from './data/questions';
import PhoneSimulator from './components/PhoneSimulator';
import CodeExportPanel from './components/CodeExportPanel';
import DatabaseManagement, { getGoogleSheetsCsvUrl, getRowValue } from './components/DatabaseManagement';
const bdfcpsLogo = "/src/assets/images/bdfcps_logo_1782055989338.jpg";

export const DEFAULT_AVATAR = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100%25' height='100%25' fill='%23e1e1e1'/%3E%3Ccircle cx='50' cy='41' r='19' fill='%23a3a3a3'/%3E%3Cpath d='M 11 91 C 11 64,%2089 64,%2089%2091 Z' fill='%23a3a3a3'/%3E%3C/svg%3E";

interface WeakChapter {
  chapter: string;
  category: SubjectCategory;
  accuracy: number;
  count: number;
  topic: string;
}

export default function App() {
  // Splash Screen State
  const [showGlobalSplash, setShowGlobalSplash] = useState<boolean>(true);
  const [splashMsg, setSplashMsg] = useState<string>('Initializing systems...');

  // Global loading splash transition effect
  useEffect(() => {
    const sequence = [
      { delay: 500, msg: 'Connecting secure clinical MCQ bank...' },
      { delay: 1100, msg: 'Loading Firebase Firestore credentials...' },
      { delay: 1700, msg: 'Initializing diagnostic analytics...' },
      { delay: 2100, msg: 'Syllabus aligned (Paper I, II, III)...' },
      { delay: 2400, msg: 'Running final pre-flight checks...' },
      { delay: 2605, msg: 'Ready' }
    ];

    sequence.forEach((item) => {
      setTimeout(() => {
        setSplashMsg(item.msg);
        if (item.msg === 'Ready') {
          setTimeout(() => {
            setShowGlobalSplash(false);
          }, 300);
        }
      }, item.delay);
    });
  }, []);

  // Authentication State with localStorage caches
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('fcps_auth_logged_in') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    bmdcNumber: string;
    mobile: string;
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
        hospital: 'Dhaka Medical College',
        avatar: DEFAULT_AVATAR,
        dailyStudyGoal: 40
      };
    }
    return {
      name: 'Rakib Mozumder',
      specialty: 'FCPS Part-I Medicine Candidate',
      targetDate: 'Oct 24, 2026',
      targetSpecialty: 'Internal Medicine & Allied',
      hospital: 'Dhaka Medical College',
      avatar: DEFAULT_AVATAR,
      dailyStudyGoal: 40
    };
  });

  // Adaptive Weak Chapters (BDFCPS Style)
  const [weakChapters, setWeakChapters] = useState<WeakChapter[]>([
    { chapter: 'Renal Physiology & Tubules', category: 'Physiology & Biochemistry', accuracy: 58, count: 12, topic: 'Renal clearance' },
    { chapter: 'Upper Limb Anatomy & Plexus', category: 'Anatomy', accuracy: 62, count: 8, topic: 'Brachial nerve loop' },
  ]);

  // Alarm routine reminder state (Chorcha Style)
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(false);
  const [reminderTime, setReminderTime] = useState<string>('08:00 PM');

  // Track MCQs solved today for Daily Study Goal visualization
  const [questionsSolvedToday, setQuestionsSolvedToday] = useState<number>(18);

  // Automated Revision Folders ('My Mistakes' Feature)
  const [mistakenQuestions, setMistakenQuestions] = useState<Question[]>(() => {
    // Pre-populate with 2 representative anatomy and pathology mistakes
    return [QUESTIONS_BANK[0], QUESTIONS_BANK[1]];
  });

  // Step-by-Step Custom Mock Test Builder states
  const [customExams, setCustomExams] = useState<Exam[]>([]);

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

  const [activeSegment, setActiveSegment] = useState<'simulation' | 'export' | 'database'>('simulation');
  const [questions, setQuestions] = useState<Question[]>(() => {
    const cached = localStorage.getItem('fcps_cloud_questions');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error('Failed to parse cached questions', e);
      }
    }
    return QUESTIONS_BANK;
  });

  const [sheetSyncNotification, setSheetSyncNotification] = useState<{
    addedCount: number;
    totalCount: number;
    sheetName: string;
  } | null>(null);

  const handleUpdateQuestions = (newQs: Question[]) => {
    setQuestions(newQs);
    try {
      localStorage.setItem('fcps_cloud_questions', JSON.stringify(newQs));
    } catch (e) {
      console.warn('Storage quota exceeded; cached in memory only.', e);
    }
  };

  // Automated silent background sync (every day / on startup) from Google Sheets published URL
  useEffect(() => {
    const runAutoSync = async () => {
      const now = Date.now();

      // Retrieve existing questions count to compare if new ones are added
      const currentQuestions = (() => {
        const cached = localStorage.getItem('fcps_cloud_questions');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.length > 0) return parsed;
          } catch (e) {}
        }
        return QUESTIONS_BANK;
      })();
      const existingIds = new Set(currentQuestions.map(q => q.id));

      try {
        console.log('FCPS Auto-Sync: Fetching from server-sync Google Sheets cache...');
        const apiRes = await fetch('/api/questions');
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData.success && apiData.questions && apiData.questions.length > 0) {
            const apiQs = apiData.questions as Question[];
            const newCount = apiQs.filter(q => !existingIds.has(q.id)).length;

            handleUpdateQuestions(apiQs);
            localStorage.setItem('fcps_cloud_last_sync', now.toString());
            console.log(`FCPS Auto-Sync: Loaded ${apiQs.length} questions from Firebase/Server Sheet sync successfully.`);
            
            if (newCount > 0) {
              setSheetSyncNotification({
                addedCount: newCount,
                totalCount: apiQs.length,
                sheetName: 'BDFCPS'
              });
            }
            return;
          }
        }
      } catch (apiErr) {
        console.warn('FCPS Auto-Sync: server endpoint was not ready. Proceeding to direct CORS CSV reader.', apiErr);
      }

      const stored = localStorage.getItem('fcps_sheet_id');
      const spreadsheetId = (!stored || stored === '2PACX-1vS_gZ448jpxmCH8m47V4Y18k4DsdbyOon3qK3Hn5Lz_16Y_mY-gOP-uR7uR66-Ior1x_gOH4L9_Q2R')
        ? '1OvzxOaT5cGZWKjkdcQ25uOFYDs5glgc_xTwGZs-jCUM'
        : stored;
      const apiKey = localStorage.getItem('fcps_sheets_api_key') || '';
      const rangeName = localStorage.getItem('fcps_sheet_range') || 'Sheet1!A1:K300';
      const syncMethod = localStorage.getItem('fcps_sync_method') || 'csv';

      console.log('FCPS Auto-Sync: Starting silent background fetch from online Google Sheets...');

      try {
        let incomingQuestions: Question[] = [];

        if (syncMethod === 'api' && apiKey.trim()) {
          const encodedRange = encodeURIComponent(rangeName);
          const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId.trim()}/values/${encodedRange}?key=${apiKey.trim()}`;
          
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            const rows: string[][] = data.values;

            if (rows && rows.length >= 2) {
              const headers = rows[0].map((h: string) => h.trim().toLowerCase());
              const colMap: Record<string, number> = {};
              headers.forEach((h: string, idx: number) => {
                colMap[h] = idx;
              });

              const getVal = (rowArr: string[], keys: string[], defaultVal = '') => {
                for (const key of keys) {
                  const idx = colMap[key];
                  if (idx !== undefined && rowArr[idx] !== undefined) {
                    return rowArr[idx].trim();
                  }
                  // case space-insensitive search
                  const targetClean = key.replace(/[\s_-]/g, '').toLowerCase();
                  for (const hKey in colMap) {
                    const hKeyClean = hKey.replace(/[\s_-]/g, '').toLowerCase();
                    if (targetClean === hKeyClean) {
                      const innerIdx = colMap[hKey];
                      if (innerIdx !== undefined && rowArr[innerIdx] !== undefined) {
                        return rowArr[innerIdx].trim();
                      }
                    }
                  }
                }
                return defaultVal;
              };

              incomingQuestions = rows.slice(1).map((row: string[], index: number) => {
                const id = getVal(row, ['id', 'questionid', 'question id', 'qid'], `sheets-api-${index}-${Date.now()}`);
                const typeStr = getVal(row, ['type', 'questiontype', 'question type'], 'SBA').toUpperCase();
                const type: 'SBA' | 'MTF' = typeStr.includes('MTF') ? 'MTF' : 'SBA';
                const tagsRaw = getVal(row, ['tags', 'tag', 'subject', 'category'], '[Medicine & Allied]');
                
                let subjectStr = tagsRaw;
                let topicStr = tagsRaw;
                
                const bracketMatch = tagsRaw.match(/\[(.*?)\]/);
                if (bracketMatch) {
                  subjectStr = bracketMatch[1];
                  topicStr = tagsRaw.replace(bracketMatch[0], '').trim() || 'Syllabus Chapter Unit';
                } else if (tagsRaw.startsWith('[') && tagsRaw.endsWith(']')) {
                  subjectStr = tagsRaw.slice(1, -1);
                  topicStr = 'Syllabus Chapter Chapter Unit';
                }

                const validSubjects: SubjectCategory[] = [
                  'Anatomy',
                  'Physiology & Biochemistry',
                  'Pathology & Microbiology',
                  'Medicine & Allied',
                  'Surgery & Allied',
                  'Gynecology & Obstetrics',
                  'Pediatrics'
                ];
                
                let subject: SubjectCategory = 'Medicine & Allied';
                const cleanSub = subjectStr.toLowerCase();
                
                if (cleanSub.includes('anatomy')) subject = 'Anatomy';
                else if (cleanSub.includes('physio') || cleanSub.includes('biochem') || cleanSub.includes('tubule') || cleanSub.includes('renal')) subject = 'Physiology & Biochemistry';
                else if (cleanSub.includes('patho') || cleanSub.includes('micro')) subject = 'Pathology & Microbiology';
                else if (cleanSub.includes('surg') || cleanSub.includes('bailey') || cleanSub.includes('oper')) subject = 'Surgery & Allied';
                else if (cleanSub.includes('gyn') || cleanSub.includes('obs') || cleanSub.includes('gynecology') || cleanSub.includes('obstetrics') || cleanSub.includes('gynaec')) subject = 'Gynecology & Obstetrics';
                else if (cleanSub.includes('peds') || cleanSub.includes('pedi')) subject = 'Pediatrics';
                else if (cleanSub.includes('med') || cleanSub.includes('internal')) subject = 'Medicine & Allied';
                else {
                  const matched = validSubjects.find(s => s.toLowerCase() === cleanSub || cleanSub.includes(s.toLowerCase()));
                  if (matched) subject = matched;
                }

                const questionTextRaw = getVal(row, ['questiontext', 'question', 'question text', 'question_text', 'scenario', 'clinical scenario'], 'No body text supplied.');
                
                const optA = getVal(row, ['optiona', 'option a', 'option_a', 'a'], '');
                const optB = getVal(row, ['optionb', 'option b', 'option_b', 'b'], '');
                const optC = getVal(row, ['optionc', 'option c', 'option_c', 'c'], '');
                const optD = getVal(row, ['optiond', 'option d', 'option_d', 'd'], '');
                const optE = getVal(row, ['optione', 'option e', 'option_e', 'e'], '');

                const options: string[] = [];
                if (optA) options.push(optA);
                if (optB) options.push(optB);
                if (optC) options.push(optC);
                if (optD) options.push(optD);
                if (optE) options.push(optE);

                while (options.length < 5) {
                  options.push(`Prepopulated Option ${String.fromCharCode(65 + options.length)}`);
                }

                const rawCorrect = getVal(row, ['correctanswer', 'correct', 'answer', 'correctanswerindex', 'correct answer', 'correct_answer'], 'A');
                let correctAnswerIndex = 0;
                let mtfAnswers: string[] | undefined = undefined;

                if (type === 'MTF') {
                  let truthList: string[] = [];
                  if (rawCorrect.includes(',')) {
                    truthList = rawCorrect.split(',').map((s: string) => s.trim().toUpperCase());
                  } else {
                    truthList = rawCorrect.split('').map((s: string) => s.toUpperCase());
                  }
                  while (truthList.length < 5) {
                    truthList.push('F');
                  }
                  mtfAnswers = truthList.slice(0, 5);
                  const firstTrueIdx = truthList.findIndex(t => t === 'T');
                  correctAnswerIndex = firstTrueIdx !== -1 ? firstTrueIdx : 0;
                } else {
                  const normCorrect = rawCorrect.trim().toUpperCase();
                  if (normCorrect === 'A' || normCorrect === '1') correctAnswerIndex = 0;
                  else if (normCorrect === 'B' || normCorrect === '2') correctAnswerIndex = 1;
                  else if (normCorrect === 'C' || normCorrect === '3') correctAnswerIndex = 2;
                  else if (normCorrect === 'D' || normCorrect === '4') correctAnswerIndex = 3;
                  else if (normCorrect === 'E' || normCorrect === '5') correctAnswerIndex = 4;
                  else {
                    const parsedNum = parseInt(rawCorrect, 10);
                    if (!isNaN(parsedNum)) {
                      if (parsedNum >= 1 && parsedNum <= 5) {
                        correctAnswerIndex = parsedNum - 1;
                      } else if (parsedNum >= 0 && parsedNum <= 4) {
                        correctAnswerIndex = parsedNum;
                      } else {
                        correctAnswerIndex = 0;
                      }
                    } else {
                      const matchedIdx = options.findIndex(opt => opt && opt.trim().toUpperCase() === normCorrect);
                      correctAnswerIndex = matchedIdx !== -1 ? matchedIdx : 0;
                    }
                  }
                }

                const expAndRef = getVal(row, ['explanation', 'rationale', 'explanationtext', 'explanation text', 'reference text'], '');
                let explanation = expAndRef;
                let reference = 'CPSP Syllabus Guideline';
                const refBracketMatch = expAndRef.match(/\[(.*?)\]/);
                if (refBracketMatch) {
                  reference = refBracketMatch[1];
                  explanation = expAndRef.replace(refBracketMatch[0], '').trim();
                }

                return {
                  id,
                  subject,
                  topic: topicStr,
                  question: questionTextRaw,
                  options,
                  correctAnswerIndex,
                  explanation,
                  reference,
                  type,
                  mtfAnswers
                };
              });
            }
          }
        } else {
          // CSV Parser fallback/primary path (highly secure & works without any API Key)
          const csvUrl = getGoogleSheetsCsvUrl(spreadsheetId);

          const res = await fetch(csvUrl);
          if (res.ok) {
            const text = await res.text();
            
            const splitRowLocal = (line: string): string[] => {
              const result: string[] = [];
              let currentVal = '';
              let inQuotes = false;
              for (let i = 0; i < line.length; i++) {
                const char = line[ i ];
                if (char === '"') {
                  if (inQuotes && line[i + 1] === '"') {
                    currentVal += '"';
                    i++;
                  } else {
                    inQuotes = !inQuotes;
                  }
                } else if (char === ',' && !inQuotes) {
                  result.push(currentVal);
                  currentVal = '';
                } else {
                  currentVal += char;
                }
              }
              result.push(currentVal);
              return result;
            };

            const lines: string[] = [];
            let currentLine = '';
            let inQuotes = false;
            for (let i = 0; i < text.length; i++) {
              const char = text[i];
              if (char === '"') {
                inQuotes = !inQuotes;
                currentLine += char;
              } else if ((char === '\n' || char === '\r') && !inQuotes) {
                if (currentLine.trim()) {
                  lines.push(currentLine);
                }
                currentLine = '';
              } else {
                currentLine += char;
              }
            }
            if (currentLine.trim()) {
              lines.push(currentLine);
            }

            if (lines.length > 0) {
              const headers = splitRowLocal(lines[0]).map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());
              const parsedRows: Record<string, string>[] = [];

              for (let i = 1; i < lines.length; i++) {
                const values = splitRowLocal(lines[i]);
                const obj: Record<string, string> = {};
                headers.forEach((header, idxVal) => {
                  const val = values[idxVal];
                  obj[header] = val ? val.replace(/^"|"$/g, '').trim() : '';
                });
                parsedRows.push(obj);
              }

              incomingQuestions = parsedRows.map((row, index) => {
                const id = getRowValue(row, ['id', 'questionid', 'question id', 'qid'], `sheets-csv-${index}-${Date.now()}`);
                const typeStr = getRowValue(row, ['type', 'questiontype', 'question type'], 'SBA').toUpperCase();
                const type: 'SBA' | 'MTF' = typeStr.includes('MTF') ? 'MTF' : 'SBA';
                
                let tagsRaw = getRowValue(row, ['tags', 'tag', 'subject', 'category'], '[Medicine & Allied] General chapter');
                let subjectStr = tagsRaw;
                let topicStr = tagsRaw;
                
                const bracketMatch = tagsRaw.match(/\[(.*?)\]/);
                if (bracketMatch) {
                  subjectStr = bracketMatch[1];
                  topicStr = tagsRaw.replace(bracketMatch[0], '').trim() || 'Syllabus Chapter Unit';
                } else if (tagsRaw.startsWith('[') && tagsRaw.endsWith(']')) {
                  subjectStr = tagsRaw.slice(1, -1);
                  topicStr = 'Syllabus Chapter Chapter Unit';
                }

                const validSubjects: SubjectCategory[] = [
                  'Anatomy',
                  'Physiology & Biochemistry',
                  'Pathology & Microbiology',
                  'Medicine & Allied',
                  'Surgery & Allied',
                  'Gynecology & Obstetrics',
                  'Pediatrics'
                ];
                
                let subject: SubjectCategory = 'Medicine & Allied';
                const cleanSub = subjectStr.toLowerCase();
                
                if (cleanSub.includes('anatomy')) subject = 'Anatomy';
                else if (cleanSub.includes('physio') || cleanSub.includes('biochem') || cleanSub.includes('tubule') || cleanSub.includes('renal')) subject = 'Physiology & Biochemistry';
                else if (cleanSub.includes('patho') || cleanSub.includes('micro')) subject = 'Pathology & Microbiology';
                else if (cleanSub.includes('surg') || cleanSub.includes('bailey') || cleanSub.includes('oper')) subject = 'Surgery & Allied';
                else if (cleanSub.includes('gyn') || cleanSub.includes('obs') || cleanSub.includes('gynecology') || cleanSub.includes('obstetrics') || cleanSub.includes('gynaec')) subject = 'Gynecology & Obstetrics';
                else if (cleanSub.includes('peds') || cleanSub.includes('pedi')) subject = 'Pediatrics';
                else if (cleanSub.includes('med') || cleanSub.includes('internal')) subject = 'Medicine & Allied';
                else {
                  const matched = validSubjects.find(s => s.toLowerCase() === cleanSub || cleanSub.includes(s.toLowerCase()));
                  if (matched) subject = matched;
                }

                const questionTextRaw = getRowValue(row, ['questiontext', 'question', 'question text', 'question_text', 'scenario', 'clinical scenario'], 'No body text supplied.');
                
                const optA = getRowValue(row, ['optiona', 'option a', 'option_a', 'a'], '');
                const optB = getRowValue(row, ['optionb', 'option b', 'option_b', 'b'], '');
                const optC = getRowValue(row, ['optionc', 'option c', 'option_c', 'c'], '');
                const optD = getRowValue(row, ['optiond', 'option d', 'option_d', 'd'], '');
                const optE = getRowValue(row, ['optione', 'option e', 'option_e', 'e'], '');

                const options: string[] = [];
                if (optA) options.push(optA);
                if (optB) options.push(optB);
                if (optC) options.push(optC);
                if (optD) options.push(optD);
                if (optE) options.push(optE);

                while (options.length < 5) {
                  options.push(`Prepopulated Option ${String.fromCharCode(65 + options.length)}`);
                }

                const rawCorrect = getRowValue(row, ['correctanswer', 'correct', 'answer', 'correctanswerindex', 'correct answer', 'correct_answer'], 'A');
                let correctAnswerIndex = 0;
                let mtfAnswers: string[] | undefined = undefined;

                if (type === 'MTF') {
                  let truthList: string[] = [];
                  if (rawCorrect.includes(',')) {
                    truthList = rawCorrect.split(',').map((s: string) => s.trim().toUpperCase());
                  } else {
                    truthList = rawCorrect.split('').map((s: string) => s.toUpperCase());
                  }
                  while (truthList.length < 5) {
                    truthList.push('F');
                  }
                  mtfAnswers = truthList.slice(0, 5);
                  const firstTrueIdx = truthList.findIndex(t => t === 'T');
                  correctAnswerIndex = firstTrueIdx !== -1 ? firstTrueIdx : 0;
                } else {
                  const normCorrect = rawCorrect.trim().toUpperCase();
                  if (normCorrect === 'A' || normCorrect === '1') correctAnswerIndex = 0;
                  else if (normCorrect === 'B' || normCorrect === '2') correctAnswerIndex = 1;
                  else if (normCorrect === 'C' || normCorrect === '3') correctAnswerIndex = 2;
                  else if (normCorrect === 'D' || normCorrect === '4') correctAnswerIndex = 3;
                  else if (normCorrect === 'E' || normCorrect === '5') correctAnswerIndex = 4;
                  else {
                    const parsedNum = parseInt(rawCorrect, 10);
                    if (!isNaN(parsedNum)) {
                      if (parsedNum >= 1 && parsedNum <= 5) {
                        correctAnswerIndex = parsedNum - 1;
                      } else if (parsedNum >= 0 && parsedNum <= 4) {
                        correctAnswerIndex = parsedNum;
                      } else {
                        correctAnswerIndex = 0;
                      }
                    } else {
                      const matchedIdx = options.findIndex(opt => opt && opt.trim().toUpperCase() === normCorrect);
                      correctAnswerIndex = matchedIdx !== -1 ? matchedIdx : 0;
                    }
                  }
                }

                const expAndRef = getRowValue(row, ['explanation', 'rationale', 'explanationtext', 'explanation text', 'reference text'], '');
                let explanation = expAndRef;
                let reference = 'CPSP Syllabus Guideline';
                const refBracketMatch = expAndRef.match(/\[(.*?)\]/);
                if (refBracketMatch) {
                  reference = refBracketMatch[1];
                  explanation = expAndRef.replace(refBracketMatch[0], '').trim();
                }

                return {
                  id,
                  subject,
                  topic: topicStr,
                  question: questionTextRaw,
                  options,
                  correctAnswerIndex,
                  explanation,
                  reference,
                  type,
                  mtfAnswers
                };
              });
            }
          }
        }

        if (incomingQuestions.length > 0) {
          const newCount = incomingQuestions.filter(q => !existingIds.has(q.id)).length;

          handleUpdateQuestions(incomingQuestions);
          localStorage.setItem('fcps_cloud_last_sync', now.toString());
          console.log(`FCPS Auto-Sync: Successfully gathered & synchronized ${incomingQuestions.length} medical clinical items silently.`);

          if (newCount > 0) {
            setSheetSyncNotification({
              addedCount: newCount,
              totalCount: incomingQuestions.length,
              sheetName: 'BDFCPS'
            });
          }
        }
      } catch (err) {
        console.warn('FCPS Auto-Sync silent request encountered error:', err);
      }
    };

    runAutoSync();
  }, []);

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

  // Automated utility to submit registrations & test mock scores to the bdfcps Google Sheet WebApp
  const forwardToGoogleSheetsWebApp = async (type: 'registration' | 'exam_result', data: any) => {
    const webappUrl = localStorage.getItem('fcps_sheets_webapp_url') || 'https://script.google.com/macros/s/AKfycbwopV73sE-CSfv2ZQfuutO6_Nqs6KQNo9tRWAwJWBwbDqgTidfBXgWDpPrL7Q5bRWBW7Q/exec';
    if (!webappUrl) return;

    try {
      console.log(`[WebApp Sync Tracker] Forwarding ${type} to Google WebApp script: ${webappUrl}`);
      await fetch('/api/proxy/webapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webappUrl,
          payload: {
            type,
            ...data,
            timestamp: new Date().toISOString()
          }
        })
      });
      console.log(`[WebApp Sync Tracker] Successfully delivered ${type} payload.`);
    } catch (err) {
      console.warn(`[WebApp Sync Tracker] Sync notification skipped or client offline:`, err);
    }
  };

  // Auth screen handlers
  const handleAuthSuccess = (doctorData: { 
    name: string; 
    email: string; 
    bmdcNumber: string; 
    mobile: string; 
    state?: any;
    isNewRegistration?: boolean;
  }) => {
    setIsAuthenticated(true);
    const simplifiedUser = {
      name: doctorData.name,
      email: doctorData.email,
      bmdcNumber: doctorData.bmdcNumber,
      mobile: doctorData.mobile
    };
    setCurrentUser(simplifiedUser);
    localStorage.setItem('fcps_auth_logged_in', 'true');
    localStorage.setItem('fcps_auth_user', JSON.stringify(simplifiedUser));

    // If cloud state returned, restore everything instantly
    if (doctorData.state) {
      if (doctorData.state.profile) setDoctor(doctorData.state.profile);
      if (doctorData.state.progress) setProgress(doctorData.state.progress);
      if (doctorData.state.mistakes) setMistakenQuestions(doctorData.state.mistakes);
      if (doctorData.state.customExams) setCustomExams(doctorData.state.customExams);
    } else {
      // Align matching metadata profile parameters
      setDoctor(prev => ({
        ...prev,
        name: doctorData.name,
      }));
    }
    setEditName(doctorData.name);

    // Registration only stored in Firebase Firestore, bypassing Google Sheets
    if (doctorData.isNewRegistration) {
      console.log('[Firebase Account Sync]: User information successfully recorded in cloud.');
    }
  };

  const handleLogOut = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('fcps_auth_logged_in');
    localStorage.removeItem('fcps_auth_user');
  };

  // Real-time Cloud persistence synchronization (Debounced save triggered on state change)
  useEffect(() => {
    if (!isAuthenticated || !currentUser?.mobile) return;

    const syncStateToCloud = async () => {
      try {
        await fetch('/api/user/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mobile: currentUser.mobile,
            profile: doctor,
            progress: progress,
            mistakes: mistakenQuestions,
            customExams: customExams
          })
        });
      } catch (err) {
        console.error('Failed to sync to cloud server:', err);
      }
    };

    const delayTimer = setTimeout(() => {
      syncStateToCloud();
    }, 1200);

    return () => clearTimeout(delayTimer);
  }, [doctor, progress, mistakenQuestions, customExams, isAuthenticated, currentUser?.mobile]);

  // Dynamic Remediation Logic (BDFCPS Style)
  // Invoked when they fail any question inside Practice mode
  const handleSolveQuestion = (correct: boolean, question?: Question) => {
    // Increment daily study progress MCQ solved count
    setQuestionsSolvedToday(prev => prev + 1);

    // 1. Update general progress
    setProgress(prev => {
      const newSolved = prev.questionsSolvedCount + 1;
      const accuracyShift = correct ? 1.5 : -1.0;
      const newScore = Math.max(0, Math.min(100, Math.round(prev.averageScorePercentage + accuracyShift)));

      const nextSubjectAverages = { ...prev.subjectAverages };
      if (question && question.subject) {
        const currentSubjAvg = nextSubjectAverages[question.subject] || 70;
        const subShift = correct ? 2.5 : -1.5;
        nextSubjectAverages[question.subject] = Math.max(0, Math.min(100, Math.round(currentSubjAvg + subShift)));
      }

      const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      let nextHistory = [...(prev.history || [])];
      const todayIndex = nextHistory.findIndex(h => h.date === todayStr);
      if (todayIndex >= 0) {
        nextHistory[todayIndex] = {
          ...nextHistory[todayIndex],
          questionsSolved: nextHistory[todayIndex].questionsSolved + 1,
          score: newScore
        };
      } else {
        nextHistory.push({
          date: todayStr,
          questionsSolved: 1,
          score: newScore
        });
      }
      if (nextHistory.length > 7) {
        nextHistory = nextHistory.slice(-7);
      }

      return {
        ...prev,
        questionsSolvedCount: newSolved,
        averageScorePercentage: newScore,
        streakCount: prev.streakCount + (correct ? 1 : 0),
        subjectAverages: nextSubjectAverages,
        history: nextHistory
      };
    });

    // 2. Adaptive remediation processing: If answer is wrong, update weak chapters
    if (!correct && question) {
      setMistakenQuestions(prev => {
        if (prev.some(item => item.id === question.id)) return prev;
        return [...prev, question];
      });

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
  const handleCompleteExam = (examPercentage: number, wrongQuestions?: Question[], totalQuestions?: number, subject?: SubjectCategory) => {
    const solvedCount = totalQuestions || 10;
    setQuestionsSolvedToday(prev => prev + solvedCount);

    setProgress(prev => {
      const newCompleted = prev.completedExamCount + 1;
      const combinedScore = Math.round((prev.averageScorePercentage + examPercentage) / 2);

      const nextSubjectAverages = { ...prev.subjectAverages };
      if (subject) {
        const currentSubjAvg = nextSubjectAverages[subject] || 70;
        nextSubjectAverages[subject] = Math.max(0, Math.min(100, Math.round((currentSubjAvg + examPercentage) / 2)));
      }

      // Format current date like "Jun 20"
      const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      let nextHistory = [...(prev.history || [])];
      const todayIndex = nextHistory.findIndex(h => h.date === todayStr);
      if (todayIndex >= 0) {
        nextHistory[todayIndex] = {
          ...nextHistory[todayIndex],
          questionsSolved: nextHistory[todayIndex].questionsSolved + solvedCount,
          score: combinedScore
        };
      } else {
        nextHistory.push({
          date: todayStr,
          questionsSolved: solvedCount,
          score: combinedScore
        });
      }
      if (nextHistory.length > 7) {
        nextHistory = nextHistory.slice(-7);
      }

      return {
        ...prev,
        questionsSolvedCount: prev.questionsSolvedCount + solvedCount,
        completedExamCount: newCompleted,
        averageScorePercentage: combinedScore,
        subjectAverages: nextSubjectAverages,
        history: nextHistory
      };
    });

    // Bulk adaptive remediation on mock mistakes
    if (wrongQuestions && wrongQuestions.length > 0) {
      // Append each wrong question to the mistakes revision folder
      setMistakenQuestions(prev => {
        const next = [...prev];
        wrongQuestions.forEach(q => {
          if (!next.some(item => item.id === q.id)) {
            next.push(q);
          }
        });
        return next;
      });

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

    // Submit candidate's completed mock exam results to BDFCPS spreadsheet WebApp & Firebase Firestore database
    if (currentUser) {
      const examPayload = {
        candidateName: currentUser.name,
        mobile: currentUser.mobile,
        bmdcNumber: currentUser.bmdcNumber,
        score: examPercentage,
        correctCount: Math.round((examPercentage / 100) * solvedCount),
        totalQuestions: solvedCount
      };

      // 1. Submit to Firebase Firestore cloud database (Google Sheets submission disabled as requested)
      fetch('/api/user/exam_result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examPayload)
      })
      .then(res => res.json())
      .then(data => console.log('[Firebase Exam Sync Success]:', data))
      .catch(err => console.warn('[Firebase Exam Sync Failure]:', err instanceof Error ? err.message : String(err)));
    }
  };

  const handleLaunchCustomTest = (subject: SubjectCategory, topic: string, questionCount: number, sbaOnly: boolean, includeMixed: boolean) => {
    let pool = questions && questions.length > 0 ? questions : QUESTIONS_BANK;
    if (!includeMixed) {
      pool = pool.filter(q => q.subject === subject);
    }
    
    // Sort and slice
    const selected = [...pool].sort(() => 0.5 - Math.random()).slice(0, Math.round(questionCount));
    
    const newExam: Exam = {
      id: `custom-${Date.now()}`,
      title: `Custom ${subject} Mock (${topic || 'All Topics'})`,
      subject: subject,
      questionCount: selected.length,
      durationMinutes: Math.max(5, Math.ceil(selected.length * 1.5)),
      startTime: 'Custom Built Drill',
      status: 'Active' as const,
      questions: selected
    };
    
    setCustomExams(prev => [...prev, newExam]);
    setStartExamTrigger(newExam.id);
  };

  const handleDrillChapterPractice = (category: SubjectCategory) => {
    // Simply logging dynamic drill selection or filter inside simulation
    console.log(`Drilling category ${category} in Practice Deck.`);
  };

  // Resolve source pool dynamically for live synchronization
  const finalPool = questions && questions.length > 0 ? questions : QUESTIONS_BANK;

  // Build the dynamic mock papers on-the-fly to support the grid launcher buttons
  const paper1Exam: Exam = {
    id: 'paper-1-exam',
    title: 'Paper I (Anatomy/Physiology) Rapid Drill',
    subject: 'Anatomy' as SubjectCategory,
    questionCount: Math.min(10, finalPool.filter(q => q.subject === 'Anatomy' || q.subject === 'Physiology & Biochemistry').length || 10),
    durationMinutes: 15,
    startTime: 'Dynamic Prep Drill',
    status: 'Active' as const,
    questions: finalPool.filter(q => q.subject === 'Anatomy' || q.subject === 'Physiology & Biochemistry').length > 0
      ? finalPool.filter(q => q.subject === 'Anatomy' || q.subject === 'Physiology & Biochemistry').slice(0, 10)
      : finalPool.slice(0, 10)
  };

  const paper2Exam: Exam = {
    id: 'paper-2-exam',
    title: 'Paper II (Pathology/Microbiology) Master Drill',
    subject: 'Pathology & Microbiology' as SubjectCategory,
    questionCount: Math.min(10, finalPool.filter(q => q.subject === 'Pathology & Microbiology').length || 10),
    durationMinutes: 15,
    startTime: 'Dynamic Prep Drill',
    status: 'Active' as const,
    questions: finalPool.filter(q => q.subject === 'Pathology & Microbiology').length > 0
      ? finalPool.filter(q => q.subject === 'Pathology & Microbiology').slice(0, 10)
      : finalPool.slice(0, 10)
  };

  const paper3Exam: Exam = {
    id: 'paper-3-exam',
    title: 'Paper III (Pharmacology/Medicine) Boost Study',
    subject: 'Medicine & Allied' as SubjectCategory,
    questionCount: Math.min(10, finalPool.filter(q => q.subject === 'Medicine & Allied' || q.subject === 'Physiology & Biochemistry').length || 10),
    durationMinutes: 15,
    startTime: 'Dynamic Prep Drill',
    status: 'Active' as const,
    questions: finalPool.filter(q => q.subject === 'Medicine & Allied' || q.subject === 'Physiology & Biochemistry').length > 0
      ? finalPool.filter(q => q.subject === 'Medicine & Allied' || q.subject === 'Physiology & Biochemistry').slice(0, 10)
      : finalPool.slice(0, 10)
  };

  const customMistakesExam: Exam = {
    id: 'my-mistakes-exam',
    title: 'My Mistakes - Automated Revision Set',
    subject: 'Medicine & Allied' as SubjectCategory,
    questionCount: mistakenQuestions.length,
    durationMinutes: Math.max(5, Math.ceil(mistakenQuestions.length * 1.5)),
    startTime: 'Simulated Revision Queue',
    status: 'Active' as const,
    questions: mistakenQuestions
  };

  const computedExams = [
    // 1. Dynamic National Grand Mock using all Google Sheets synced questions
    {
      id: 'live1',
      title: 'FCPS Part I - National Grand Mock Examination',
      subject: 'Medicine & Allied' as SubjectCategory,
      questionCount: finalPool.length,
      durationMinutes: Math.max(30, Math.ceil(finalPool.length * 1.5)),
      startTime: 'Scheduled for Today: 8:00 PM',
      status: 'Active' as const,
      questions: finalPool
    },
    // 2. Paper I Booster using filtered Anatomy/Physiology from Google Sheets questions
    {
      id: 'live2',
      title: 'Paper I Booster Mock - Core Basic Sciences',
      subject: 'Anatomy' as SubjectCategory,
      questionCount: finalPool.filter(q => q.subject === 'Anatomy' || q.subject === 'Physiology & Biochemistry').length || finalPool.length,
      durationMinutes: 60,
      startTime: 'Starts Tomorrow: 10:00 AM',
      status: 'Upcoming' as const,
      questions: finalPool.filter(q => q.subject === 'Anatomy' || q.subject === 'Physiology & Biochemistry').length > 0 
        ? finalPool.filter(q => q.subject === 'Anatomy' || q.subject === 'Physiology & Biochemistry')
        : finalPool
    },
    // 3. Surgical Foundations Mock using filtered Surgery/Pathology from Google Sheets questions
    {
      id: 'live3',
      title: 'Surgical Foundations Mock - Paper II',
      subject: 'Surgery & Allied' as SubjectCategory,
      questionCount: finalPool.filter(q => q.subject === 'Surgery & Allied' || q.subject === 'Pathology & Microbiology').length || finalPool.length,
      durationMinutes: 90,
      startTime: 'Completed 2 Days Ago',
      status: 'Completed' as const,
      questions: finalPool.filter(q => q.subject === 'Surgery & Allied' || q.subject === 'Pathology & Microbiology').length > 0
        ? finalPool.filter(q => q.subject === 'Surgery & Allied' || q.subject === 'Pathology & Microbiology')
        : finalPool
    },
    ...customExams,
    customMistakesExam,
    paper1Exam,
    paper2Exam,
    paper3Exam
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between" id="app-root-layout">
      {showGlobalSplash && (
        <div 
          className="fixed inset-0 bg-[#f8fafc] flex flex-col items-center justify-center font-sans p-6 z-[9999] select-none transition-opacity duration-500" 
          id="global-heavy-splash-screen"
          style={{ backgroundImage: 'radial-gradient(circle at 50% 41%, #fef2f4 0%, #edf8f9 100%)' }}
        >
          {/* Subtle background glow bubbles */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-rose-200/10 blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-teal-200/10 blur-3xl pointer-events-none animate-pulse" />

          <div className="relative flex flex-col items-center max-w-md text-center space-y-6 z-10">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-rose-500/10 to-teal-500/15 blur-xl pointer-events-none scale-110 animate-pulse" />
              <div className="relative w-28 h-28 rounded-3xl bg-white p-2.5 border border-slate-100 shadow-xl flex items-center justify-center">
                <img 
                  src={bdfcpsLogo} 
                  alt="BDFCPS Companion Logo" 
                  className="w-full h-full object-contain rounded-2xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -inset-1 rounded-3xl border border-teal-500/10 animate-ping pointer-events-none" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight" id="splash-app-title">
                Bangladesh FCPS Companion
              </h1>
              <p className="text-xs text-slate-500 font-semibold max-w-xs mx-auto leading-relaxed">
                Premium clinical case question-bank simulator and adaptive study companion.
              </p>
            </div>

            <div className="w-56 space-y-3 pt-2">
              <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-teal-650 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: '#0d9488',
                    width: 
                      splashMsg.includes('secure') ? '25%' :
                      splashMsg.includes('Firestore') ? '50%' :
                      splashMsg.includes('diagnostic') ? '70%' :
                      splashMsg.includes('aligned') ? '85%' :
                      splashMsg.includes('checks') ? '95%' : '100%'
                  }}
                />
              </div>

              <div className="flex items-center justify-center gap-1.5 min-h-[16px]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-teal-700">
                  {splashMsg}
                </span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-0 right-0 text-center text-[10px] text-slate-400 font-bold tracking-widest uppercase z-10">
            Bangladesh College of Physicians & Surgeons Simulator • v2.0
          </div>
        </div>
      )}
      
      {/* Upper Navigation Medical Bar */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-4 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl bg-[#fef2f4] border border-rose-100 p-1 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
              <img 
                src={bdfcpsLogo} 
                alt="BDFCPS App Logo" 
                className="w-full h-full object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-snug flex items-center gap-1.5">
                BCPS BDFCPS Prep Companion <span className="bg-teal-50 text-teal-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded">v2.0</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Bangladesh College of Physicians & Surgeons (BCPS) Specialization Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-semibold text-slate-500">Database Connection:</span>
            <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-250 select-none flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-550 animate-ping" /> Synchronized Offline
            </span>
            {isAuthenticated && (
              <button
                onClick={handleLogOut}
                className="ml-2 flex items-center gap-1.5 px-3 py-1.5 border border-rose-200 text-rose-600 bg-rose-50/50 rounded-xl text-xs font-bold hover:bg-rose-100 hover:text-rose-700 transition active:scale-95 cursor-pointer"
                id="header-logout-btn"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            )}
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
                onClick={() => setActiveSegment('database')}
                className={`py-3 px-6 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  activeSegment === 'database' 
                    ? 'border-teal-500 text-teal-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
                id="tab-btn-database"
              >
                <Database className="w-4 h-4" /> Cloud Database Sync
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
                    exams={computedExams}
                    questions={questions}
                    onUpdateQuestions={handleUpdateQuestions}
                    sheetSyncNotification={sheetSyncNotification}
                    onDismissSyncNotification={() => setSheetSyncNotification(null)}
                    progress={progress}
                    onSolveQuestion={handleSolveQuestion}
                    onCompleteExam={handleCompleteExam}
                    startExamTrigger={startExamTrigger}
                    clearStartExamTrigger={() => setStartExamTrigger(null)}
                    onChangeTabInSimulator={(tabId) => {
                      if (tabId === 'Live') setStartExamTrigger('live1');
                    }}
                    questionsSolvedToday={questionsSolvedToday}
                    
                    // Mistakes and custom builder
                    mistakenQuestions={mistakenQuestions}
                    onLaunchCustomTest={handleLaunchCustomTest}
                    onSetStartExamTrigger={(examId: string) => setStartExamTrigger(examId)}

                    // Auth state props
                    isAuthenticated={isAuthenticated}
                    onAuthSuccess={handleAuthSuccess}
                    onLogout={handleLogOut}
                    onUpdateProfile={setDoctor}

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
            ) : activeSegment === 'database' ? (
              <div className="animate-fadeIn">
                <DatabaseManagement 
                  questions={questions}
                  onUpdateQuestions={handleUpdateQuestions}
                />
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
          <p>© 2026 Bangladesh College of Physicians and Surgeons (BCPS). All Rights Reserved.</p>
          <p className="text-slate-500 flex items-center gap-1">
            Built for doctors preparing for FCPS Part I in Bangladesh. Crafted with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />.
          </p>
        </div>
      </footer>

    </div>
  );
}
