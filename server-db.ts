import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { DoctorProfile, UserProgress, Question, Exam } from './src/types';

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
    return useFirestore ? dbInstance : null;
  }

  if (!useFirestore || !firebaseConfig) return null;

  try {
    console.log(`[Firebase JS SDK Init] Initializing secondary API-Key connection for: "${firebaseConfig.projectId}"`);
    
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

    const isHealthy = await testDatabaseConnection(tempDb);
    if (isHealthy) {
      console.log(`[Firebase JS SDK Init] Successfully authorized connection to database: "${dbId || '(default)'}"`);
      dbInstance = tempDb;
      return dbInstance;
    } else {
      console.warn(`[Firebase JS SDK Init] Primary validation failed. Routing database connections to local JSON copy.`);
      useFirestore = false;
    }
  } catch (err) {
    console.error(`[Firebase JS SDK Init] Unexpected during client creation:`, err);
    useFirestore = false;
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
