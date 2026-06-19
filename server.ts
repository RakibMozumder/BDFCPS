import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { 
  getUserByMobile, 
  registerUser, 
  updateUserProfile, 
  updateUserProgress, 
  updateUserMistakes, 
  updateUserCustomExams,
  UserAccount 
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

  // Check if a mobile number is already registered
  app.post("/api/auth/verify-mobile", async (req, res) => {
    const { mobile } = req.body;
    if (!mobile) {
      return res.status(400).json({ error: "Mobile number is required" });
    }
    
    const user = await getUserByMobile(mobile);
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

    const existingUser = await getUserByMobile(mobile);
    if (existingUser) {
      return res.status(400).json({ error: "This mobile number is already registered" });
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
      mobile,
      name,
      email: email || "",
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
      return res.status(400).json({ error: "Mobile number and Password are required" });
    }

    const user = await getUserByMobile(mobile);
    if (!user) {
      return res.status(404).json({ error: "Account not found with this mobile number" });
    }

    if (user.passwordHash !== password) {
      return res.status(401).json({ error: "Invalid password" });
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
