var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var fs2 = __toESM(require("fs"), 1);
var import_vite = require("vite");

// server-db.ts
var fs = __toESM(require("fs"), 1);
var path = __toESM(require("path"), 1);
var import_app = require("firebase/app");
var import_firestore = require("firebase/firestore");
var DB_FILE_PATH = path.join(process.cwd(), "database.json");
var firebaseConfig = null;
var useFirestore = false;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    if (firebaseConfig && firebaseConfig.apiKey) {
      useFirestore = true;
    }
  }
} catch (e) {
  console.warn("Could not parse firebase-applet-config.json:", e);
}
var dbInstance = null;
async function testDatabaseConnection(db) {
  try {
    const docRef = (0, import_firestore.doc)(db, "users", "status_check_connection_test_ping");
    await (0, import_firestore.getDoc)(docRef);
    return true;
  } catch (err) {
    console.warn(`[Firebase JS SDK Connection Test] Failed for db "${firebaseConfig?.firestoreDatabaseId || "(default)"}":`, err.message);
    return false;
  }
}
async function getFirestoreWithFallback() {
  if (dbInstance) {
    return dbInstance;
  }
  if (!firebaseConfig) return null;
  try {
    console.log(`[Firebase JS SDK Init] Initializing connection for: "${firebaseConfig.projectId}"`);
    const app = (0, import_app.getApps)().length === 0 ? (0, import_app.initializeApp)({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      appId: firebaseConfig.appId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId
    }) : (0, import_app.getApp)();
    const dbId = firebaseConfig.firestoreDatabaseId;
    let tempDb;
    if (dbId && dbId !== "(default)") {
      tempDb = (0, import_firestore.getFirestore)(app, dbId);
    } else {
      tempDb = (0, import_firestore.getFirestore)(app);
    }
    testDatabaseConnection(tempDb).then((isHealthy) => {
      if (isHealthy) {
        console.log(`[Firebase JS SDK Init] Connection verify: database "${dbId || "(default)"}" is ONLINE`);
      } else {
        console.warn(`[Firebase JS SDK Init] Connection verify: database "${dbId || "(default)"}" ping failed. Will continue attempting Firestore with local standby database logic active.`);
      }
    });
    dbInstance = tempDb;
    return dbInstance;
  } catch (err) {
    console.error(`[Firebase JS SDK Init] Unexpected during client creation:`, err);
  }
  return null;
}
function loadLocalDatabase() {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading local file database:", err);
  }
  return {};
}
function saveLocalDatabase(data) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing to local file database:", err);
  }
}
async function getUserByMobile(mobile) {
  const cleanMobile = mobile.trim();
  if (useFirestore) {
    try {
      const db = await getFirestoreWithFallback();
      if (db) {
        const docRef = (0, import_firestore.doc)(db, "users", cleanMobile);
        const docSnap = await (0, import_firestore.getDoc)(docRef);
        if (docSnap.exists()) {
          console.log(`[Firestore JS SDK] Successfully fetched profile for mobile: ${cleanMobile}`);
          return docSnap.data();
        }
      }
    } catch (err) {
      console.warn(`[Firestore Status] Read failed or offline. Falling back to local file DB.`, err);
    }
  }
  const dbLocal = loadLocalDatabase();
  return dbLocal[cleanMobile] || null;
}
async function registerUser(account) {
  const cleanMobile = account.mobile.trim();
  const newUser = {
    ...account,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (useFirestore) {
    try {
      const db = await getFirestoreWithFallback();
      if (db) {
        const docRef = (0, import_firestore.doc)(db, "users", cleanMobile);
        await (0, import_firestore.setDoc)(docRef, newUser);
        console.log(`[Firestore JS SDK] Registered new user into cloud collection 'users': ${cleanMobile}`);
        const dbLocal2 = loadLocalDatabase();
        dbLocal2[cleanMobile] = newUser;
        saveLocalDatabase(dbLocal2);
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
async function saveUserToFirebase(account) {
  const cleanMobile = account.mobile.trim();
  if (useFirestore) {
    try {
      const db = await getFirestoreWithFallback();
      if (db) {
        const docRef = (0, import_firestore.doc)(db, "users", cleanMobile);
        await (0, import_firestore.setDoc)(docRef, account, { merge: true });
        console.log(`[Firestore JS SDK] Explicitly saved/synced user to Firebase 'users': ${cleanMobile}`);
        return true;
      }
    } catch (err) {
      console.warn(`[Firestore Status] Failed to save/sync user: ${cleanMobile} to Firebase.`, err);
    }
  }
  return false;
}
async function updateUserPassword(mobile, passwordHash) {
  const cleanMobile = mobile.trim();
  if (useFirestore) {
    try {
      const db = await getFirestoreWithFallback();
      if (db) {
        const docRef = (0, import_firestore.doc)(db, "users", cleanMobile);
        await (0, import_firestore.setDoc)(docRef, { passwordHash }, { merge: true });
        console.log(`[Firestore JS SDK] Password updated for keys: ${cleanMobile}`);
        const dbLocal2 = loadLocalDatabase();
        if (dbLocal2[cleanMobile]) {
          dbLocal2[cleanMobile].passwordHash = passwordHash;
          saveLocalDatabase(dbLocal2);
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
async function updateUserProfile(mobile, profile) {
  const cleanMobile = mobile.trim();
  if (useFirestore) {
    try {
      const db = await getFirestoreWithFallback();
      if (db) {
        const docRef = (0, import_firestore.doc)(db, "users", cleanMobile);
        await (0, import_firestore.setDoc)(docRef, { profile }, { merge: true });
        console.log(`[Firestore JS SDK] Updated profile for mobile: ${cleanMobile}`);
        const dbLocal2 = loadLocalDatabase();
        if (dbLocal2[cleanMobile]) {
          dbLocal2[cleanMobile].profile = profile;
          saveLocalDatabase(dbLocal2);
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
async function updateUserProgress(mobile, progress) {
  const cleanMobile = mobile.trim();
  if (useFirestore) {
    try {
      const db = await getFirestoreWithFallback();
      if (db) {
        const docRef = (0, import_firestore.doc)(db, "users", cleanMobile);
        await (0, import_firestore.setDoc)(docRef, { progress }, { merge: true });
        console.log(`[Firestore JS SDK] Updated progress statistics for mobile: ${cleanMobile}`);
        const dbLocal2 = loadLocalDatabase();
        if (dbLocal2[cleanMobile]) {
          dbLocal2[cleanMobile].progress = progress;
          saveLocalDatabase(dbLocal2);
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
async function updateUserMistakes(mobile, mistakes) {
  const cleanMobile = mobile.trim();
  if (useFirestore) {
    try {
      const db = await getFirestoreWithFallback();
      if (db) {
        const docRef = (0, import_firestore.doc)(db, "users", cleanMobile);
        await (0, import_firestore.setDoc)(docRef, { mistakes }, { merge: true });
        console.log(`[Firestore JS SDK] Updated mistakes folder for mobile: ${cleanMobile}`);
        const dbLocal2 = loadLocalDatabase();
        if (dbLocal2[cleanMobile]) {
          dbLocal2[cleanMobile].mistakes = mistakes;
          saveLocalDatabase(dbLocal2);
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
async function updateUserCustomExams(mobile, customExams) {
  const cleanMobile = mobile.trim();
  if (useFirestore) {
    try {
      const db = await getFirestoreWithFallback();
      if (db) {
        const docRef = (0, import_firestore.doc)(db, "users", cleanMobile);
        await (0, import_firestore.setDoc)(docRef, { customExams }, { merge: true });
        console.log(`[Firestore JS SDK] Updated custom exams list for mobile: ${cleanMobile}`);
        const dbLocal2 = loadLocalDatabase();
        if (dbLocal2[cleanMobile]) {
          dbLocal2[cleanMobile].customExams = customExams;
          saveLocalDatabase(dbLocal2);
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
async function saveExamResult(result) {
  const resultId = result.id || `result_${Date.now()}_${Math.floor(Math.random() * 1e3)}`;
  const cleanResult = {
    id: resultId,
    candidateName: result.candidateName,
    mobile: result.mobile,
    bmdcNumber: result.bmdcNumber,
    score: result.score,
    correctCount: result.correctCount,
    totalQuestions: result.totalQuestions,
    timestamp: result.timestamp || (/* @__PURE__ */ new Date()).toISOString()
  };
  if (useFirestore) {
    try {
      const db = await getFirestoreWithFallback();
      if (db) {
        const docRef = (0, import_firestore.doc)(db, "exam_results", resultId);
        await (0, import_firestore.setDoc)(docRef, cleanResult);
        console.log(`[Firestore JS SDK] Stored new exam result for: ${result.mobile} in 'exam_results'`);
      }
    } catch (err) {
      console.warn(`[Firestore Status] Exam result save failed. Falling back to local copy.`, err.message);
    }
  }
  try {
    const resultsFilePath = path.join(process.cwd(), "database_results.json");
    let localResults = [];
    if (fs.existsSync(resultsFilePath)) {
      localResults = JSON.parse(fs.readFileSync(resultsFilePath, "utf-8"));
    }
    localResults.push(cleanResult);
    fs.writeFileSync(resultsFilePath, JSON.stringify(localResults, null, 2), "utf-8");
  } catch (err) {
    console.error(`Error saving exam results locally:`, err);
  }
  return true;
}
function splitRowLocal(line) {
  const result = [];
  let currentVal = "";
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
    } else if (char === "," && !inQuotes) {
      result.push(currentVal);
      currentVal = "";
    } else {
      currentVal += char;
    }
  }
  result.push(currentVal);
  return result;
}
function getRowValueLocal(row, keys, defaultVal = "") {
  for (const key of keys) {
    if (row[key] !== void 0) {
      return row[key].trim();
    }
    const targetClean = key.replace(/[\s_-]/g, "").toLowerCase();
    for (const rKey in row) {
      const rKeyClean = rKey.replace(/[\s_-]/g, "").toLowerCase();
      if (targetClean === rKeyClean) {
        return row[rKey].trim();
      }
    }
  }
  return defaultVal;
}
async function importQuestionsFromGoogleSheet() {
  const cleanUrl = "https://docs.google.com/spreadsheets/d/1OvzxOaT5cGZWKjkdcQ25uOFYDs5glgc_xTwGZs-jCUM/export?format=csv";
  console.log(`[Automated Sheets Import] Pulling live question bank from: ${cleanUrl}`);
  try {
    const response = await fetch(cleanUrl);
    if (!response.ok) {
      throw new Error(`Google Sheets responded with HTTP status ${response.status}`);
    }
    const text = await response.text();
    const lines = [];
    let currentLine = "";
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        inQuotes = !inQuotes;
        currentLine += char;
      } else if ((char === "\n" || char === "\r") && !inQuotes) {
        if (currentLine.trim()) {
          lines.push(currentLine);
        }
        currentLine = "";
      } else {
        currentLine += char;
      }
    }
    if (currentLine.trim()) {
      lines.push(currentLine);
    }
    if (lines.length < 2) {
      throw new Error("Google Sheet is empty or lacks rows.");
    }
    const headers = splitRowLocal(lines[0]).map((h) => h.replace(/^"|"$/g, "").trim().toLowerCase());
    const parsedRows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = splitRowLocal(lines[i]);
      const obj = {};
      headers.forEach((header, idxVal) => {
        const val = values[idxVal];
        obj[header] = val ? val.replace(/^"|"$/g, "").trim() : "";
      });
      parsedRows.push(obj);
    }
    const validSubjects = [
      "Anatomy",
      "Physiology & Biochemistry",
      "Pathology & Microbiology",
      "Medicine & Allied",
      "Surgery & Allied",
      "Gynecology & Obstetrics",
      "Pediatrics"
    ];
    const importedQuestions = parsedRows.map((row, index) => {
      const id = getRowValueLocal(row, ["id", "questionid", "question id", "qid"], `sheets-auto-${index}-${Date.now()}`);
      const typeStr = getRowValueLocal(row, ["type", "questiontype", "question type"], "SBA").toUpperCase();
      const type = typeStr.includes("MTF") ? "MTF" : "SBA";
      let tagsRaw = getRowValueLocal(row, ["tags", "tag", "subject", "category"], "[Medicine & Allied] General chapter");
      let subjectStr = tagsRaw;
      let topicStr = tagsRaw;
      const bracketMatch = tagsRaw.match(/\[(.*?)\]/);
      if (bracketMatch) {
        subjectStr = bracketMatch[1];
        topicStr = tagsRaw.replace(bracketMatch[0], "").trim() || "Syllabus Chapter Unit";
      } else if (tagsRaw.startsWith("[") && tagsRaw.endsWith("]")) {
        subjectStr = tagsRaw.slice(1, -1);
        topicStr = "Syllabus Chapter Chapter Unit";
      }
      let subject = "Medicine & Allied";
      const cleanSub = subjectStr.toLowerCase();
      if (cleanSub.includes("anatomy")) subject = "Anatomy";
      else if (cleanSub.includes("physio") || cleanSub.includes("biochem") || cleanSub.includes("tubule") || cleanSub.includes("renal")) subject = "Physiology & Biochemistry";
      else if (cleanSub.includes("patho") || cleanSub.includes("micro")) subject = "Pathology & Microbiology";
      else if (cleanSub.includes("surg") || cleanSub.includes("bailey") || cleanSub.includes("oper")) subject = "Surgery & Allied";
      else if (cleanSub.includes("gyn") || cleanSub.includes("obs") || cleanSub.includes("gynecology") || cleanSub.includes("obstetrics") || cleanSub.includes("gynaec")) subject = "Gynecology & Obstetrics";
      else if (cleanSub.includes("peds") || cleanSub.includes("pedi")) subject = "Pediatrics";
      else if (cleanSub.includes("med") || cleanSub.includes("internal")) subject = "Medicine & Allied";
      else {
        const matched = validSubjects.find((s) => s.toLowerCase() === cleanSub || cleanSub.includes(s.toLowerCase()));
        if (matched) subject = matched;
      }
      const questionTextRaw = getRowValueLocal(row, ["questiontext", "question", "question text", "question_text", "scenario", "clinical scenario"], "No body text supplied.");
      const optA = getRowValueLocal(row, ["optiona", "option a", "option_a", "a"], "");
      const optB = getRowValueLocal(row, ["optionb", "option b", "option_b", "b"], "");
      const optC = getRowValueLocal(row, ["optionc", "option c", "option_c", "c"], "");
      const optD = getRowValueLocal(row, ["optiond", "option d", "option_d", "d"], "");
      const optE = getRowValueLocal(row, ["optione", "option e", "option_e", "e"], "");
      const options = [];
      if (optA) options.push(optA);
      if (optB) options.push(optB);
      if (optC) options.push(optC);
      if (optD) options.push(optD);
      if (optE) options.push(optE);
      while (options.length < 5) {
        options.push(`Prepopulated Option ${String.fromCharCode(65 + options.length)}`);
      }
      const rawCorrect = getRowValueLocal(row, ["correctanswer", "correct", "answer", "correctanswerindex", "correct answer", "correct_answer"], "A");
      let correctAnswerIndex = 0;
      let mtfAnswers = void 0;
      if (type === "MTF") {
        let truthList = [];
        if (rawCorrect.includes(",")) {
          truthList = rawCorrect.split(",").map((s) => s.trim().toUpperCase());
        } else {
          truthList = rawCorrect.split("").map((s) => s.toUpperCase());
        }
        while (truthList.length < 5) {
          truthList.push("F");
        }
        mtfAnswers = truthList.slice(0, 5);
        const firstTrueIdx = truthList.findIndex((t) => t === "T");
        correctAnswerIndex = firstTrueIdx !== -1 ? firstTrueIdx : 0;
      } else {
        const normCorrect = rawCorrect.trim().toUpperCase();
        if (normCorrect === "A" || normCorrect === "1") correctAnswerIndex = 0;
        else if (normCorrect === "B" || normCorrect === "2") correctAnswerIndex = 1;
        else if (normCorrect === "C" || normCorrect === "3") correctAnswerIndex = 2;
        else if (normCorrect === "D" || normCorrect === "4") correctAnswerIndex = 3;
        else if (normCorrect === "E" || normCorrect === "5") correctAnswerIndex = 4;
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
            const matchedIdx = options.findIndex((opt) => opt && opt.trim().toUpperCase() === normCorrect);
            correctAnswerIndex = matchedIdx !== -1 ? matchedIdx : 0;
          }
        }
      }
      const expAndRef = getRowValueLocal(row, ["explanation", "rationale", "explanationtext", "explanation text", "reference text"], "");
      let explanation = expAndRef;
      let reference = "CPSP Syllabus Guideline";
      const refBracketMatch = expAndRef.match(/\[(.*?)\]/);
      if (refBracketMatch) {
        reference = refBracketMatch[1];
        explanation = expAndRef.replace(refBracketMatch[0], "").trim();
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
      if (useFirestore) {
        const db = await getFirestoreWithFallback();
        if (db) {
          const sanitizedQuestions = importedQuestions.map((q) => {
            const cleanQ = {};
            for (const key of Object.keys(q)) {
              const val = q[key];
              if (val !== void 0) {
                cleanQ[key] = val;
              }
            }
            return cleanQ;
          });
          const docRef = (0, import_firestore.doc)(db, "configs", "questions_bank");
          await (0, import_firestore.setDoc)(docRef, {
            questions: sanitizedQuestions,
            lastSynced: (/* @__PURE__ */ new Date()).toISOString()
          });
          console.log(`[Automated Sheets Import] Successfully wrote ${importedQuestions.length} medical questions to Firestore cloud config.`);
        }
      }
      const backupFilePath = path.join(process.cwd(), "database_questions.json");
      fs.writeFileSync(backupFilePath, JSON.stringify(importedQuestions, null, 2), "utf-8");
      console.log(`[Automated Sheets Import] Wrote ${importedQuestions.length} items to local file backup.`);
      return { success: true, count: importedQuestions.length };
    }
    return { success: false, count: 0, error: "Parsed 0 valid questions" };
  } catch (err) {
    console.error(`[Automated Sheets Import Error] Fetching/Parsing/Writing failed:`, err.message);
    return { success: false, count: 0, error: err.message };
  }
}

// server.ts
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "50mb" }));
  app.use(import_express.default.urlencoded({ limit: "50mb", extended: true }));
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      console.log(`[API ${req.method}] ${req.path}`);
    }
    next();
  });
  app.get("/api/auth/firebase-config", (req, res) => {
    try {
      const configPath = import_path.default.join(process.cwd(), "firebase-applet-config.json");
      if (fs2.existsSync(configPath)) {
        const configText = fs2.readFileSync(configPath, "utf-8");
        const config = JSON.parse(configText);
        return res.json(config);
      }
    } catch (e) {
      console.error("Error reading firebase-applet-config.json:", e);
    }
    return res.status(404).json({ error: "Firebase applet config not found on the instance." });
  });
  app.post("/api/auth/verify-mobile", async (req, res) => {
    const { mobile } = req.body;
    if (!mobile) {
      return res.status(400).json({ error: "Mobile number or Email address is required" });
    }
    const isEmail = mobile.includes("@");
    const lookupKey = isEmail ? `email_${mobile.trim().toLowerCase()}` : mobile.trim();
    const user = await getUserByMobile(lookupKey);
    if (user) {
      return res.json({ registered: true, name: user.name });
    }
    return res.json({ registered: false });
  });
  app.post("/api/auth/register", async (req, res) => {
    const { mobile, name, email, bmdcNumber, password } = req.body;
    if (!mobile || !name || !password) {
      return res.status(400).json({ error: "Mobile, Name, and Password are required fields" });
    }
    const isEmail = mobile.includes("@");
    const lookupKey = isEmail ? `email_${mobile.trim().toLowerCase()}` : mobile.trim();
    const existingUser = await getUserByMobile(lookupKey);
    if (existingUser) {
      return res.status(400).json({ error: "This mobile or email contact is already registered" });
    }
    const defaultProfile = {
      name,
      specialty: "FCPS Part-I Medicine Candidate",
      targetDate: "Oct 24, 2026",
      targetSpecialty: "Internal Medicine & Allied",
      hospital: "Dhaka Medical College & Hospital",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200",
      dailyStudyGoal: 40
    };
    const defaultProgress = {
      streakCount: 0,
      completedExamCount: 0,
      questionsSolvedCount: 0,
      averageScorePercentage: 0,
      history: [],
      subjectAverages: {
        "Anatomy": 0,
        "Physiology & Biochemistry": 0,
        "Pathology & Microbiology": 0,
        "Medicine & Allied": 0,
        "Surgery & Allied": 0,
        "Gynecology & Obstetrics": 0,
        "Pediatrics": 0
      }
    };
    const newUser = await registerUser({
      mobile: lookupKey,
      name,
      email: email || (isEmail ? mobile : ""),
      bmdcNumber: bmdcNumber || "",
      passwordHash: password,
      // Simple plain password text for container ease of setup
      profile: defaultProfile,
      progress: defaultProgress,
      mistakes: [],
      customExams: []
    });
    return res.json({
      success: true,
      user: {
        mobile: newUser.mobile,
        name: newUser.name,
        email: newUser.email,
        bmdcNumber: newUser.bmdcNumber,
        profile: newUser.profile,
        progress: newUser.progress,
        mistakes: newUser.mistakes,
        customExams: newUser.customExams
      }
    });
  });
  app.post("/api/auth/login", async (req, res) => {
    const { mobile, password } = req.body;
    if (!mobile || !password) {
      return res.status(400).json({ error: "Mobile/Email and Password are required" });
    }
    const isEmail = mobile.includes("@");
    const lookupKey = isEmail ? `email_${mobile.trim().toLowerCase()}` : mobile.trim();
    const user = await getUserByMobile(lookupKey);
    if (!user) {
      return res.status(404).json({ error: "Account not found with this mobile or email address" });
    }
    if (user.passwordHash !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }
    await saveUserToFirebase(user);
    return res.json({
      success: true,
      user: {
        mobile: user.mobile,
        name: user.name,
        email: user.email,
        bmdcNumber: user.bmdcNumber,
        profile: user.profile,
        progress: user.progress,
        mistakes: user.mistakes,
        customExams: user.customExams
      }
    });
  });
  app.post("/api/auth/forgot-password", async (req, res) => {
    const { mobile } = req.body;
    if (!mobile) {
      return res.status(400).json({ error: "Mobile number or Email address is required" });
    }
    const isEmail = mobile.includes("@");
    const lookupKey = isEmail ? `email_${mobile.trim().toLowerCase()}` : mobile.trim();
    const user = await getUserByMobile(lookupKey);
    if (!user) {
      return res.status(404).json({ error: "No registered account found with this mobile or email" });
    }
    const resetOtp = Math.floor(1e5 + Math.random() * 9e5).toString();
    return res.json({
      success: true,
      otp: resetOtp,
      user: {
        mobile: user.mobile,
        name: user.name,
        email: user.email
      }
    });
  });
  app.post("/api/auth/reset-password", async (req, res) => {
    const { mobile, password } = req.body;
    if (!mobile || !password) {
      return res.status(400).json({ error: "Mobile/Email and new Password are required" });
    }
    const isEmail = mobile.includes("@");
    const lookupKey = isEmail ? `email_${mobile.trim().toLowerCase()}` : mobile.trim();
    const user = await getUserByMobile(lookupKey);
    if (!user) {
      return res.status(404).json({ error: "No account found to reset password" });
    }
    if (password.length < 5) {
      return res.status(400).json({ error: "Password must be at least 5 characters long for security" });
    }
    const success = await updateUserPassword(lookupKey, password);
    if (success) {
      return res.json({
        success: true,
        message: "Your password has been reset successfully. Please log in with your new credential."
      });
    } else {
      return res.status(500).json({ error: "Failed to update password in database" });
    }
  });
  app.post("/api/auth/social", async (req, res) => {
    const { provider, name, email, uid } = req.body;
    if (!name || !uid) {
      return res.status(400).json({ error: "Authentication ID and Name are required" });
    }
    const targetMobile = `social_${uid.slice(0, 8)}`;
    let user = await getUserByMobile(targetMobile);
    if (!user) {
      user = await registerUser({
        mobile: targetMobile,
        name,
        email: email || "",
        bmdcNumber: "",
        passwordHash: "social_oauth_user",
        profile: {
          name,
          specialty: "FCPS Part-I Medicine Candidate",
          targetDate: "Oct 24, 2026",
          targetSpecialty: "Internal Medicine & Allied",
          hospital: "Sign In via " + provider,
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
          dailyStudyGoal: 30
        },
        progress: {
          streakCount: 1,
          completedExamCount: 0,
          questionsSolvedCount: 0,
          averageScorePercentage: 0,
          history: [],
          subjectAverages: {
            "Anatomy": 0,
            "Physiology & Biochemistry": 0,
            "Pathology & Microbiology": 0,
            "Medicine & Allied": 0,
            "Surgery & Allied": 0,
            "Gynecology & Obstetrics": 0,
            "Pediatrics": 0
          }
        },
        mistakes: [],
        customExams: []
      });
    } else {
      await saveUserToFirebase(user);
    }
    return res.json({
      success: true,
      user: {
        mobile: user.mobile,
        name: user.name,
        email: user.email,
        bmdcNumber: user.bmdcNumber,
        profile: user.profile,
        progress: user.progress,
        mistakes: user.mistakes,
        customExams: user.customExams
      }
    });
  });
  app.post("/api/user/sync", async (req, res) => {
    const { mobile, profile, progress, mistakes, customExams } = req.body;
    if (!mobile) {
      return res.status(400).json({ error: "Logged in user identifier (mobile) is required" });
    }
    const checkUser = await getUserByMobile(mobile);
    if (!checkUser) {
      return res.status(404).json({ error: "User account not found on the cloud server" });
    }
    if (profile) await updateUserProfile(mobile, profile);
    if (progress) await updateUserProgress(mobile, progress);
    if (mistakes) await updateUserMistakes(mobile, mistakes);
    if (customExams) await updateUserCustomExams(mobile, customExams);
    return res.json({ success: true, message: "Sync successful" });
  });
  app.post("/api/proxy/webapp", async (req, res) => {
    const { url, payload } = req.body;
    if (!url) {
      return res.status(400).json({ error: "Google Apps Script WebApp URL is required" });
    }
    try {
      console.log(`[Proxy POST] Forwarding payload to Google Apps Script WebApp: ${url}`);
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const responseText = await response.text();
      try {
        const responseJson = JSON.parse(responseText);
        return res.json({ success: true, response: responseJson });
      } catch (err) {
        return res.json({ success: true, response: responseText });
      }
    } catch (err) {
      console.error("[Proxy POST Error] Failed forwarding to Google Sheets:", err);
      return res.json({
        success: false,
        error: err.message || "Failed to communicate with Google Apps Script WebApp",
        simulationFallback: true,
        message: "Triggered simulation response payload because target URL is inaccessible from container sandboxed gateway"
      });
    }
  });
  app.get("/api/user/:mobile", async (req, res) => {
    const { mobile } = req.params;
    const user = await getUserByMobile(mobile);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({
      user: {
        mobile: user.mobile,
        name: user.name,
        email: user.email,
        bmdcNumber: user.bmdcNumber,
        profile: user.profile,
        progress: user.progress,
        mistakes: user.mistakes,
        customExams: user.customExams
      }
    });
  });
  app.get("/api/questions", async (req, res) => {
    try {
      const backupPath = import_path.default.join(process.cwd(), "database_questions.json");
      if (fs2.existsSync(backupPath)) {
        const data = fs2.readFileSync(backupPath, "utf-8");
        return res.json({ success: true, questions: JSON.parse(data) });
      }
      console.log("[API Questions] Questions cache not found. Triggering synchronous sheet import...");
      const importResult = await importQuestionsFromGoogleSheet();
      if (importResult.success && fs2.existsSync(backupPath)) {
        const data = fs2.readFileSync(backupPath, "utf-8");
        return res.json({ success: true, questions: JSON.parse(data), synced: true });
      } else {
        return res.json({ success: false, error: importResult.error || "Sync returned empty questions bank" });
      }
    } catch (err) {
      console.error("[API Questions Error]", err);
      return res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/user/exam_result", async (req, res) => {
    const { candidateName, mobile, bmdcNumber, score, correctCount, totalQuestions } = req.body;
    if (!mobile || score === void 0) {
      return res.status(400).json({ error: "Mobile number and score are required fields." });
    }
    try {
      const resultObj = {
        candidateName: candidateName || "Dr. Anonymous Candidate",
        mobile,
        bmdcNumber: bmdcNumber || "",
        score: Number(score),
        correctCount: Number(correctCount || 0),
        totalQuestions: Number(totalQuestions || 0),
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      await saveExamResult(resultObj);
      return res.json({ success: true, message: "Exam result saved successfully in Firebase." });
    } catch (err) {
      console.error("[API Exam Result Error] Failed saving exam result:", err);
      return res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/user/:mobile/results", async (req, res) => {
    const { mobile } = req.params;
    try {
      const resultsFilePath = import_path.default.join(process.cwd(), "database_results.json");
      let localResults = [];
      if (fs2.existsSync(resultsFilePath)) {
        localResults = JSON.parse(fs2.readFileSync(resultsFilePath, "utf-8"));
      }
      const userResults = localResults.filter((r) => r.mobile === mobile);
      return res.json({ success: true, results: userResults });
    } catch (err) {
      console.error("[API Get Exam Results Error] Failed loading exam results:", err);
      return res.status(500).json({ error: err.message });
    }
  });
  const triggerGoogleSheetsImport = async () => {
    console.log("[Automated Sync Cycle] Executing automated daily Google Sheet question synchronized pull...");
    const result = await importQuestionsFromGoogleSheet();
    if (result.success) {
      console.log(`[Automated Sync Cycle] Successfully synchronized ${result.count} questions from Google Sheet at ${(/* @__PURE__ */ new Date()).toISOString()}`);
    } else {
      console.warn(`[Automated Sync Cycle] Automatic pull was unsuccessful: ${result.error}`);
    }
  };
  setTimeout(() => {
    triggerGoogleSheetsImport().catch((err) => {
      console.error("[Onboot Sheet Sync failed]", err);
    });
  }, 2e3);
  const ONE_DAY_MS = 24 * 60 * 60 * 1e3;
  setInterval(() => {
    triggerGoogleSheetsImport().catch((err) => {
      console.error("[Interval Sheet Sync failed]", err);
    });
  }, ONE_DAY_MS);
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Cloud Server booted successfully and listening on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
