import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { DoctorProfile, UserProgress, Question, Exam, SubjectCategory } from './src/types';

export interface UserAccount {
  mobile: string;
  name: string;
  email: string;
  bmdcNumber: string;
  passwordHash: string; // Plaintext or simple base64 hash since we are in container environment
  profile: DoctorProfile;
  progress: UserProgress;
  mistakes: Question[];
  customExams: Exam[];
  createdAt: string;
}

const DB_FILE_PATH = path.join(process.cwd(), 'database.json');

// Get Firebase Config
let firebaseConfig: any = null;
let useFirestore = false;

try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    if (firebaseConfig && firebaseConfig.apiKey) {
      useFirestore = true;
    }
  }
} catch (e) {
  console.warn("Could not parse firebase-applet-config.json:", e);
}

// Lazy-loaded or auto-healing Firebase JS SDK Firestore initialization
let dbInstance: any = null;

async function testDatabaseConnection(db: any): Promise<boolean> {
  try {
    // Attempt a trivial check on a dummy document in the users collection to match rules
    const docRef = doc(db, 'users', 'status_check_connection_test_ping');
    await getDoc(docRef);
    return true;
  } catch (err: any) {
    console.warn(`[Firebase JS SDK Connection Test] Failed for db "${firebaseConfig?.firestoreDatabaseId || '(default)'}":`, err.message);
    return false;
  }
}

export async function getFirestoreWithFallback(): Promise<any | null> {
  if (dbInstance) {
    return dbInstance;
  }

  if (!firebaseConfig) return null;

  try {
    console.log(`[Firebase JS SDK Init] Initializing connection for: "${firebaseConfig.projectId}"`);
    
    // Check if app already initialized
    const app = getApps().length === 0 ? initializeApp({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      appId: firebaseConfig.appId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId
    }) : getApp();

    const dbId = firebaseConfig.firestoreDatabaseId;
    let tempDb: any;
    if (dbId && dbId !== '(default)') {
      tempDb = getFirestore(app, dbId);
    } else {
      tempDb = getFirestore(app);
    }

    // Run connection check in background/non-blocking way or log status
    testDatabaseConnection(tempDb).then(isHealthy => {
      if (isHealthy) {
        console.log(`[Firebase JS SDK Init] Connection verify: database "${dbId || '(default)'}" is ONLINE`);
      } else {
        console.warn(`[Firebase JS SDK Init] Connection verify: database "${dbId || '(default)'}" ping failed. Will continue attempting Firestore with local standby database logic active.`);
      }
    });

    dbInstance = tempDb;
    return dbInstance;
  } catch (err) {
    console.error(`[Firebase JS SDK Init] Unexpected during client creation:`, err);
  }

  return null;
}

// Local File Database helper fallback
function loadLocalDatabase(): Record<string, UserAccount> {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading local file database:', err);
  }
  return {};
}

function saveLocalDatabase(data: Record<string, UserAccount>) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to local file database:', err);
  }
}

// Async API that attempts Firestore with transparent local file fallback

export async function getUserByMobile(mobile: string): Promise<UserAccount | null> {
  const cleanMobile = mobile.trim();
  if (useFirestore) {
    try {
      const db = await getFirestoreWithFallback();
      if (db) {
        const docRef = doc(db, 'users', cleanMobile);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          console.log(`[Firestore JS SDK] Successfully fetched profile for mobile: ${cleanMobile}`);
          return docSnap.data() as UserAccount;
        }
      }
    } catch (err) {
      console.warn(`[Firestore Status] Read failed or offline. Falling back to local file DB.`, err);
    }
  }

  // Fallback to local file DB
  const dbLocal = loadLocalDatabase();
  return dbLocal[cleanMobile] || null;
}

export async function registerUser(account: Omit<UserAccount, 'createdAt'>): Promise<UserAccount> {
  const cleanMobile = account.mobile.trim();
  const newUser: UserAccount = {
    ...account,
    createdAt: new Date().toISOString()
  };

  if (useFirestore) {
    try {
      const db = await getFirestoreWithFallback();
      if (db) {
        const docRef = doc(db, 'users', cleanMobile);
        await setDoc(docRef, newUser);
        console.log(`[Firestore JS SDK] Registered new user into cloud collection 'users': ${cleanMobile}`);
        
        // Keep local database hot-standby copy synced
        const dbLocal = loadLocalDatabase();
        dbLocal[cleanMobile] = newUser;
        saveLocalDatabase(dbLocal);
        return newUser;
      }
    } catch (err) {
      console.warn(`[Firestore Status] Write failed or offline. Registering in local file DB fallback.`, err);
    }
  }

  const dbLocal = loadLocalDatabase();
  dbLocal[cleanMobile] = newUser;
  saveLocalDatabase(dbLocal);
  return newUser;
}

export async function saveUserToFirebase(account: UserAccount): Promise<boolean> {
  const cleanMobile = account.mobile.trim();
  if (useFirestore) {
    try {
      const db = await getFirestoreWithFallback();
      if (db) {
        const docRef = doc(db, 'users', cleanMobile);
        await setDoc(docRef, account, { merge: true });
        console.log(`[Firestore JS SDK] Explicitly saved/synced user to Firebase 'users': ${cleanMobile}`);
        return true;
      }
    } catch (err) {
      console.warn(`[Firestore Status] Failed to save/sync user: ${cleanMobile} to Firebase.`, err);
    }
  }
  return false;
}

export async function updateUserPassword(mobile: string, passwordHash: string): Promise<boolean> {
  const cleanMobile = mobile.trim();
  if (useFirestore) {
    try {
      const db = await getFirestoreWithFallback();
      if (db) {
        const docRef = doc(db, 'users', cleanMobile);
        await setDoc(docRef, { passwordHash }, { merge: true });
        console.log(`[Firestore JS SDK] Password updated for keys: ${cleanMobile}`);
        
        const dbLocal = loadLocalDatabase();
        if (dbLocal[cleanMobile]) {
          dbLocal[cleanMobile].passwordHash = passwordHash;
          saveLocalDatabase(dbLocal);
        }
        return true;
      }
    } catch (err) {
      console.warn(`[Firestore Status] Password update failed in cloud. Saving in local fallback.`, err);
    }
  }

  const dbLocal = loadLocalDatabase();
  if (!dbLocal[cleanMobile]) return false;
  dbLocal[cleanMobile].passwordHash = passwordHash;
  saveLocalDatabase(dbLocal);
  return true;
}

export async function updateUserProfile(mobile: string, profile: DoctorProfile): Promise<boolean> {
  const cleanMobile = mobile.trim();
  if (useFirestore) {
    try {
      const db = await getFirestoreWithFallback();
      if (db) {
        const docRef = doc(db, 'users', cleanMobile);
        await setDoc(docRef, { profile }, { merge: true });
        console.log(`[Firestore JS SDK] Updated profile for mobile: ${cleanMobile}`);
        
        // Update local copy
        const dbLocal = loadLocalDatabase();
        if (dbLocal[cleanMobile]) {
          dbLocal[cleanMobile].profile = profile;
          saveLocalDatabase(dbLocal);
        }
        return true;
      }
    } catch (err) {
      console.warn(`[Firestore Status] Update profile failed. Syncing local file DB instead.`, err);
    }
  }

  const dbLocal = loadLocalDatabase();
  if (!dbLocal[cleanMobile]) return false;
  dbLocal[cleanMobile].profile = profile;
  saveLocalDatabase(dbLocal);
  return true;
}

export async function updateUserProgress(mobile: string, progress: UserProgress): Promise<boolean> {
  const cleanMobile = mobile.trim();
  if (useFirestore) {
    try {
      const db = await getFirestoreWithFallback();
      if (db) {
        const docRef = doc(db, 'users', cleanMobile);
        await setDoc(docRef, { progress }, { merge: true });
        console.log(`[Firestore JS SDK] Updated progress statistics for mobile: ${cleanMobile}`);
        
        const dbLocal = loadLocalDatabase();
        if (dbLocal[cleanMobile]) {
          dbLocal[cleanMobile].progress = progress;
          saveLocalDatabase(dbLocal);
        }
        return true;
      }
    } catch (err) {
      console.warn(`[Firestore Status] Update progress failed. Syncing local file DB instead.`, err);
    }
  }

  const dbLocal = loadLocalDatabase();
  if (!dbLocal[cleanMobile]) return false;
  dbLocal[cleanMobile].progress = progress;
  saveLocalDatabase(dbLocal);
  return true;
}

export async function updateUserMistakes(mobile: string, mistakes: Question[]): Promise<boolean> {
  const cleanMobile = mobile.trim();
  if (useFirestore) {
    try {
      const db = await getFirestoreWithFallback();
      if (db) {
        const docRef = doc(db, 'users', cleanMobile);
        await setDoc(docRef, { mistakes }, { merge: true });
        console.log(`[Firestore JS SDK] Updated mistakes folder for mobile: ${cleanMobile}`);
        
        const dbLocal = loadLocalDatabase();
        if (dbLocal[cleanMobile]) {
          dbLocal[cleanMobile].mistakes = mistakes;
          saveLocalDatabase(dbLocal);
        }
        return true;
      }
    } catch (err) {
      console.warn(`[Firestore Status] Update mistakes failed. Syncing local file DB instead.`, err);
    }
  }

  const dbLocal = loadLocalDatabase();
  if (!dbLocal[cleanMobile]) return false;
  dbLocal[cleanMobile].mistakes = mistakes;
  saveLocalDatabase(dbLocal);
  return true;
}

export async function updateUserCustomExams(mobile: string, customExams: Exam[]): Promise<boolean> {
  const cleanMobile = mobile.trim();
  if (useFirestore) {
    try {
      const db = await getFirestoreWithFallback();
      if (db) {
        const docRef = doc(db, 'users', cleanMobile);
        await setDoc(docRef, { customExams }, { merge: true });
        console.log(`[Firestore JS SDK] Updated custom exams list for mobile: ${cleanMobile}`);
        
        const dbLocal = loadLocalDatabase();
        if (dbLocal[cleanMobile]) {
          dbLocal[cleanMobile].customExams = customExams;
          saveLocalDatabase(dbLocal);
        }
        return true;
      }
    } catch (err) {
      console.warn(`[Firestore Status] Update custom exams failed. Syncing local file DB instead.`, err);
    }
  }

  const dbLocal = loadLocalDatabase();
  if (!dbLocal[cleanMobile]) return false;
  dbLocal[cleanMobile].customExams = customExams;
  saveLocalDatabase(dbLocal);
  return true;
}

export interface ExamResult {
  id?: string;
  candidateName: string;
  mobile: string;
  bmdcNumber: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timestamp: string;
}

export async function saveExamResult(result: ExamResult): Promise<boolean> {
  const resultId = result.id || `result_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const cleanResult = {
    id: resultId,
    candidateName: result.candidateName,
    mobile: result.mobile,
    bmdcNumber: result.bmdcNumber,
    score: result.score,
    correctCount: result.correctCount,
    totalQuestions: result.totalQuestions,
    timestamp: result.timestamp || new Date().toISOString()
  };

  if (useFirestore) {
    try {
      const db = await getFirestoreWithFallback();
      if (db) {
        const docRef = doc(db, 'exam_results', resultId);
        await setDoc(docRef, cleanResult);
        console.log(`[Firestore JS SDK] Stored new exam result for: ${result.mobile} in 'exam_results'`);
      }
    } catch (err: any) {
      console.warn(`[Firestore Status] Exam result save failed. Falling back to local copy.`, err.message);
    }
  }

  // Also store / append to local file database_results.json
  try {
    const resultsFilePath = path.join(process.cwd(), 'database_results.json');
    let localResults: ExamResult[] = [];
    if (fs.existsSync(resultsFilePath)) {
      localResults = JSON.parse(fs.readFileSync(resultsFilePath, 'utf-8'));
    }
    localResults.push(cleanResult);
    fs.writeFileSync(resultsFilePath, JSON.stringify(localResults, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error saving exam results locally:`, err);
  }

  return true;
}

function splitRowLocal(line: string): string[] {
  const result: string[] = [];
  let currentVal = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
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
}

function getRowValueLocal(row: Record<string, string>, keys: string[], defaultVal = ''): string {
  for (const key of keys) {
    if (row[key] !== undefined) {
      return row[key].trim();
    }
    const targetClean = key.replace(/[\s_-]/g, '').toLowerCase();
    for (const rKey in row) {
      const rKeyClean = rKey.replace(/[\s_-]/g, '').toLowerCase();
      if (targetClean === rKeyClean) {
        return row[rKey].trim();
      }
    }
  }
  return defaultVal;
}

export async function importQuestionsFromGoogleSheet(): Promise<{ success: boolean; count: number; error?: string }> {
  const cleanUrl = 'https://docs.google.com/spreadsheets/d/1OvzxOaT5cGZWKjkdcQ25uOFYDs5glgc_xTwGZs-jCUM/export?format=csv';
  console.log(`[Automated Sheets Import] Pulling live question bank from: ${cleanUrl}`);
  
  try {
    const response = await fetch(cleanUrl);
    if (!response.ok) {
      throw new Error(`Google Sheets responded with HTTP status ${response.status}`);
    }
    const text = await response.text();
    
    // Split lines cleanly respecting double quotes
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

    if (lines.length < 2) {
      throw new Error('Google Sheet is empty or lacks rows.');
    }

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

    const validSubjects: SubjectCategory[] = [
      'Anatomy',
      'Physiology & Biochemistry',
      'Pathology & Microbiology',
      'Medicine & Allied',
      'Surgery & Allied',
      'Gynecology & Obstetrics',
      'Pediatrics'
    ];

    const importedQuestions: Question[] = parsedRows.map((row, index) => {
      const id = getRowValueLocal(row, ['id', 'questionid', 'question id', 'qid'], `sheets-auto-${index}-${Date.now()}`);
      const typeStr = getRowValueLocal(row, ['type', 'questiontype', 'question type'], 'SBA').toUpperCase();
      const type: 'SBA' | 'MTF' = typeStr.includes('MTF') ? 'MTF' : 'SBA';
      
      let tagsRaw = getRowValueLocal(row, ['tags', 'tag', 'subject', 'category'], '[Medicine & Allied] General chapter');
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

      const questionTextRaw = getRowValueLocal(row, ['questiontext', 'question', 'question text', 'question_text', 'scenario', 'clinical scenario'], 'No body text supplied.');
      
      const optA = getRowValueLocal(row, ['optiona', 'option a', 'option_a', 'a'], '');
      const optB = getRowValueLocal(row, ['optionb', 'option b', 'option_b', 'b'], '');
      const optC = getRowValueLocal(row, ['optionc', 'option c', 'option_c', 'c'], '');
      const optD = getRowValueLocal(row, ['optiond', 'option d', 'option_d', 'd'], '');
      const optE = getRowValueLocal(row, ['optione', 'option e', 'option_e', 'e'], '');

      const options: string[] = [];
      if (optA) options.push(optA);
      if (optB) options.push(optB);
      if (optC) options.push(optC);
      if (optD) options.push(optD);
      if (optE) options.push(optE);

      while (options.length < 5) {
        options.push(`Prepopulated Option ${String.fromCharCode(65 + options.length)}`);
      }

      const rawCorrect = getRowValueLocal(row, ['correctanswer', 'correct', 'answer', 'correctanswerindex', 'correct answer', 'correct_answer'], 'A');
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

      const expAndRef = getRowValueLocal(row, ['explanation', 'rationale', 'explanationtext', 'explanation text', 'reference text'], '');
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

    if (importedQuestions.length > 0) {
      // 1. Write to configs/questions_bank in Firestore
      if (useFirestore) {
        const db = await getFirestoreWithFallback();
        if (db) {
          // Remove any undefined properties from elements to avoid Firestore payload errors
          const sanitizedQuestions = importedQuestions.map(q => {
            const cleanQ: any = {};
            for (const key of Object.keys(q)) {
              const val = (q as any)[key];
              if (val !== undefined) {
                cleanQ[key] = val;
              }
            }
            return cleanQ;
          });

          const docRef = doc(db, 'configs', 'questions_bank');
          await setDoc(docRef, {
            questions: sanitizedQuestions,
            lastSynced: new Date().toISOString()
          });
          console.log(`[Automated Sheets Import] Successfully wrote ${importedQuestions.length} medical questions to Firestore cloud config.`);
        }
      }

      // 2. Write to a local questions backup cache
      const backupFilePath = path.join(process.cwd(), 'database_questions.json');
      fs.writeFileSync(backupFilePath, JSON.stringify(importedQuestions, null, 2), 'utf-8');
      console.log(`[Automated Sheets Import] Wrote ${importedQuestions.length} items to local file backup.`);

      return { success: true, count: importedQuestions.length };
    }

    return { success: false, count: 0, error: "Parsed 0 valid questions" };
  } catch (err: any) {
    console.error(`[Automated Sheets Import Error] Fetching/Parsing/Writing failed:`, err.message);
    return { success: false, count: 0, error: err.message };
  }
}

