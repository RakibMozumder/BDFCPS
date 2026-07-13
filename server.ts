import express from "express";
import path from "path";
import * as fs from "fs";
import { createServer as createViteServer } from "vite";
import { 
  getUserByMobile, 
  registerUser, 
  saveUserToFirebase,
  updateUserPassword,
  updateUserProfile, 
  updateUserProgress, 
  updateUserMistakes, 
  updateUserCustomExams,
  UserAccount,
  saveExamResult,
  importQuestionsFromGoogleSheet,
  ExamResult
} from "./server-db";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON parsing middleware with a higher size limit for custom camera/gallery photographs
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Log API requests for debugging
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      console.log(`[API ${req.method}] ${req.path}`);
    }
    next();
  });

  // --- API Authentication Endpoint ---

  // Endpoint to fetch public firebase configuration safely for standard client authorization popups
  app.get("/api/auth/firebase-config", (req, res) => {
    try {
      const configPath = path.join(process.cwd(), "firebase-applet-config.json");
      if (fs.existsSync(configPath)) {
        const configText = fs.readFileSync(configPath, "utf-8");
        const config = JSON.parse(configText);
        return res.json(config);
      }
    } catch (e) {
      console.error("Error reading firebase-applet-config.json:", e);
    }
    return res.status(404).json({ error: "Firebase applet config not found on the instance." });
  });

  // Check if a mobile number or email identifier is already registered
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

  // Register a new user
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

    // Default initial profile
    const defaultProfile = {
      name,
      specialty: "FCPS Part-I Medicine Candidate",
      targetDate: "Oct 24, 2026",
      targetSpecialty: "Internal Medicine & Allied",
      hospital: "Dhaka Medical College & Hospital",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200",
      dailyStudyGoal: 40
    };

    // Default initial progress statistics
    const defaultProgress = {
      streakCount: 0,
      completedExamCount: 0,
      questionsSolvedCount: 0,
      averageScorePercentage: 0,
      history: [],
      subjectAverages: {
        'Anatomy': 0,
        'Physiology & Biochemistry': 0,
        'Pathology & Microbiology': 0,
        'Medicine & Allied': 0,
        'Surgery & Allied': 0,
        'Gynecology & Obstetrics': 0,
        'Pediatrics': 0
      }
    };

    const newUser = await registerUser({
      mobile: lookupKey,
      name,
      email: email || (isEmail ? mobile : ""),
      bmdcNumber: bmdcNumber || "",
      passwordHash: password, // Simple plain password text for container ease of setup
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

  // Log in existing user
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

    // Always ensure user details are updated/saved in Firestore upon login
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

  // Forgot password request: Checks existence & returns a simulated verification SMS/Email code
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

    // Generate simulated secure 6-digit Reset OTP
    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();

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

  // Reset password: Saves the verified new password to Firestore
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

  // Simulated Social/Facebook/Google Sign In (auto-registers if not registered)
  app.post("/api/auth/social", async (req, res) => {
    const { provider, name, email, uid } = req.body;

    if (!name || !uid) {
      return res.status(400).json({ error: "Authentication ID and Name are required" });
    }

    // Use fake/consistent mobile for social sign-in matching uid
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
            'Anatomy': 0,
            'Physiology & Biochemistry': 0,
            'Pathology & Microbiology': 0,
            'Medicine & Allied': 0,
            'Surgery & Allied': 0,
            'Gynecology & Obstetrics': 0,
            'Pediatrics': 0
          }
        },
        mistakes: [],
        customExams: []
      });
    } else {
      // Sync/save existing social login details to Firestore
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

  // --- User Profile & Database Cloud Sync Endpoints ---

  // Unified cloud sync saves all client-side progress state on backend
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

  // Proxy POST requests to Google Apps Script WebApp to bypass CORS in iframe previews
  app.post("/api/proxy/webapp", async (req, res) => {
    const { url, payload } = req.body;
    if (!url) {
      return res.status(400).json({ error: "Google Apps Script WebApp URL is required" });
    }
    try {
      console.log(`[Proxy POST] Forwarding payload to Google Apps Script WebApp: ${url}`);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const responseText = await response.text();
      try {
        const responseJson = JSON.parse(responseText);
        return res.json({ success: true, response: responseJson });
      } catch (err) {
        return res.json({ success: true, response: responseText });
      }
    } catch (err: any) {
      console.error("[Proxy POST Error] Failed forwarding to Google Sheets:", err);
      // Return a simulated success on connection errors to avoid breaking local preview testing if user is offline
      return res.json({ 
        success: false, 
        error: err.message || "Failed to communicate with Google Apps Script WebApp",
        simulationFallback: true,
        message: "Triggered simulation response payload because target URL is inaccessible from container sandboxed gateway"
      });
    }
  });

  // Fetch complete cloud state for a user
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

  // API route to get daily synchronized questions (avoiding CORS and client limits)
  app.get("/api/questions", async (req, res) => {
    try {
      const backupPath = path.join(process.cwd(), "database_questions.json");
      if (fs.existsSync(backupPath)) {
        const data = fs.readFileSync(backupPath, "utf-8");
        return res.json({ success: true, questions: JSON.parse(data) });
      }
      
      // If there's no cache, force a sync right now
      console.log("[API Questions] Questions cache not found. Triggering synchronous sheet import...");
      const importResult = await importQuestionsFromGoogleSheet();
      if (importResult.success && fs.existsSync(backupPath)) {
        const data = fs.readFileSync(backupPath, "utf-8");
        return res.json({ success: true, questions: JSON.parse(data), synced: true });
      } else {
        return res.json({ success: false, error: importResult.error || "Sync returned empty questions bank" });
      }
    } catch (err: any) {
      console.error("[API Questions Error]", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // API route to save user mock exam result in Firebase (as requested by user)
  app.post("/api/user/exam_result", async (req, res) => {
    const { candidateName, mobile, bmdcNumber, score, correctCount, totalQuestions } = req.body;
    
    if (!mobile || score === undefined) {
      return res.status(400).json({ error: "Mobile number and score are required fields." });
    }
    
    try {
      const resultObj: ExamResult = {
        candidateName: candidateName || "Dr. Anonymous Candidate",
        mobile,
        bmdcNumber: bmdcNumber || "",
        score: Number(score),
        correctCount: Number(correctCount || 0),
        totalQuestions: Number(totalQuestions || 0),
        timestamp: new Date().toISOString()
      };
      
      await saveExamResult(resultObj);
      return res.json({ success: true, message: "Exam result saved successfully in Firebase." });
    } catch (err: any) {
      console.error("[API Exam Result Error] Failed saving exam result:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // API route to get saved exam results for a user's mobile number
  app.get("/api/user/:mobile/results", async (req, res) => {
    const { mobile } = req.params;
    try {
      const resultsFilePath = path.join(process.cwd(), 'database_results.json');
      let localResults: ExamResult[] = [];
      if (fs.existsSync(resultsFilePath)) {
        localResults = JSON.parse(fs.readFileSync(resultsFilePath, 'utf-8'));
      }
      const userResults = localResults.filter(r => r.mobile === mobile);
      return res.json({ success: true, results: userResults });
    } catch (err: any) {
      console.error("[API Get Exam Results Error] Failed loading exam results:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // Trigger silent daily automatic sheet syncs (on startup and then every 24 hours)
  const triggerGoogleSheetsImport = async () => {
    console.log("[Automated Sync Cycle] Executing automated daily Google Sheet question synchronized pull...");
    const result = await importQuestionsFromGoogleSheet();
    if (result.success) {
      console.log(`[Automated Sync Cycle] Successfully synchronized ${result.count} questions from Google Sheet at ${new Date().toISOString()}`);
    } else {
      console.warn(`[Automated Sync Cycle] Automatic pull was unsuccessful: ${result.error}`);
    }
  };

  // Run on startup (with a small 2-second timeout to allow DB fallback parameters to settle cleanly)
  setTimeout(() => {
    triggerGoogleSheetsImport().catch(err => {
      console.error("[Onboot Sheet Sync failed]", err);
    });
  }, 2000);

  // Run every 24 hours (86,400,000 milliseconds)
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  setInterval(() => {
    triggerGoogleSheetsImport().catch(err => {
      console.error("[Interval Sheet Sync failed]", err);
    });
  }, ONE_DAY_MS);


  // --- Vite Dev Server Middleware or Production Static Server ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Cloud Server booted successfully and listening on http://localhost:${PORT}`);
  });
}

startServer();
