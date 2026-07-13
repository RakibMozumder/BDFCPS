import React, { useState } from 'react';
import { 
  Download, 
  Github, 
  Smartphone, 
  Shield, 
  Activity, 
  CheckCircle, 
  ExternalLink, 
  Copy, 
  Terminal, 
  ArrowRight, 
  FileCode, 
  Star,
  Users,
  Award,
  BookOpen,
  Info,
  Layers,
  Sparkles,
  RefreshCw,
  Sliders,
  Check
} from 'lucide-react';

interface GitHubApkPortalProps {
  bdfcpsLogo: string;
}

export default function GitHubApkPortal({ bdfcpsLogo }: GitHubApkPortalProps) {
  // Customizable State for the website
  const [appName, setAppName] = useState<string>('Bangladesh FCPS Companion');
  const [appDescription, setAppDescription] = useState<string>(
    'The premium clinical case question-bank simulator and adaptive study portal for Bangladeshi doctors preparing for the prestigious FCPS Part I exam.'
  );
  const [apkVersion, setApkVersion] = useState<string>('v2.0');
  const [apkFilename, setApkFilename] = useState<string>('BDFCPS_Companion_v2.0.apk');
  const [githubRepoUrl, setGithubRepoUrl] = useState<string>('https://rakibmozumder.github.io/BDFCPS/');
  const [testFlightUrl, setTestFlightUrl] = useState<string>('#');
  
  // Interface states
  const [activeSubTab, setActiveSubTab] = useState<'preview' | 'actions' | 'capacitor'>('preview');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [simulatedDownload, setSimulatedDownload] = useState<boolean>(false);
  const [downloadCount, setDownloadCount] = useState<number>(438);

  const copyCodeToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  // The generated single-file index.html website for GitHub Pages
  const generatedHtmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${appName} - Download App</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-slate-50 text-slate-800 selection:bg-[#ea2c59] selection:text-white">

    <!-- Header Navigation -->
    <header class="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <img src="https://raw.githubusercontent.com/rakib-muzumder/BDFCPS/main/public/bdfcps_logo.jpg" 
                     onerror="this.src='https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=120&h=120&q=80'" 
                     class="w-10 h-10 rounded-xl shadow-md object-contain" alt="BDFCPS Logo">
                <div>
                    <span class="font-black text-slate-900 tracking-tight text-sm">${appName}</span>
                    <span class="block text-[10px] text-teal-600 font-bold tracking-wider uppercase">BCPS Prep Simulator</span>
                </div>
            </div>
            <a href="${githubRepoUrl}" target="_blank" class="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition">
                <span>View on GitHub</span>
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
        </div>
    </header>

    <!-- Hero Showcase Section -->
    <section class="py-20 relative overflow-hidden" style="background-image: radial-gradient(circle at 50% 30%, #fdf2f4 0%, #edfafd 100%)">
        <div class="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-center relative z-10">
            
            <!-- Left Info Content -->
            <div class="md:col-span-7 space-y-6">
                <span class="bg-rose-100 text-[#ea2c59] text-xs font-black px-3.5 py-1.5 rounded-full tracking-wider uppercase shadow-sm">
                    🚀 ${apkVersion} Live Release APK
                </span>
                <h1 class="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                    Bangladesh FCPS <span class="text-[#ea2c59]">Companion</span>
                </h1>
                <p class="text-base text-slate-600 leading-relaxed max-w-lg">
                    ${appDescription}
                </p>

                <!-- Features list -->
                <div class="space-y-3">
                    <div class="flex items-center gap-2.5 text-sm text-slate-700 font-semibold">
                        <span class="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">✓</span>
                        <span>Full-Syllabus aligned clinical SBA question pool</span>
                    </div>
                    <div class="flex items-center gap-2.5 text-sm text-slate-700 font-semibold">
                        <span class="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">✓</span>
                        <span>Interactive mobile simulation for iOS & Android</span>
                    </div>
                    <div class="flex items-center gap-2.5 text-sm text-slate-700 font-semibold">
                        <span class="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">✓</span>
                        <span>Dynamic Cloud database sync via Firebase Firestore</span>
                    </div>
                </div>

                <!-- Action Button Portal -->
                <div class="flex flex-col sm:flex-row gap-4 pt-4">
                    <a id="downloadBtn" href="${apkFilename}" download class="bg-gradient-to-r from-rose-500 to-pink-600 text-white font-extrabold px-8 py-4 rounded-2xl shadow-lg shadow-rose-500/20 hover:shadow-rose-500/35 transition active:scale-95 flex items-center justify-center gap-3">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        <span>Download Android APK (${apkVersion})</span>
                    </a>
                    <a href="${testFlightUrl}" class="border border-slate-200 bg-white text-slate-700 hover:text-slate-900 font-bold px-6 py-4 rounded-2xl flex items-center justify-center gap-2.5 hover:bg-slate-50 transition">
                        <span>Apple TestFlight Beta</span>
                        <span class="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">iOS</span>
                    </a>
                </div>
                
                <div class="text-[11px] text-slate-400 font-mono">
                    File: ${apkFilename} • Requirements: Android 8.0+ Oreo or Higher
                </div>
            </div>

            <!-- Right Interactive Phone Mockup preview -->
            <div class="md:col-span-5 flex justify-center relative">
                <div class="w-72 h-[540px] bg-slate-950 rounded-[40px] p-3.5 shadow-2xl border-4 border-slate-900 relative">
                    <div class="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-black rounded-full z-20" />
                    <div class="h-full w-full bg-slate-900 rounded-[28px] overflow-hidden relative flex flex-col items-center justify-center text-center p-6" style="background: radial-gradient(circle, #1e293b 0%, #0f172a 100%)">
                        <div class="space-y-4">
                            <div class="w-16 h-16 bg-white rounded-2xl mx-auto p-1.5 shadow-md">
                                <img src="https://raw.githubusercontent.com/rakib-muzumder/BDFCPS/main/public/bdfcps_logo.jpg" 
                                     onerror="this.src='https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=120&h=120&q=80'" 
                                     class="w-full h-full object-contain rounded-xl" alt="BDFCPS Logo">
                            </div>
                            <div class="space-y-1">
                                <span class="text-sm font-bold text-white block">BDFCPS Prep</span>
                                <span class="text-[10px] text-teal-400 font-mono tracking-wider uppercase">Active Live App</span>
                            </div>
                            <div class="bg-slate-800/85 p-3 rounded-xl border border-slate-750 max-w-xs text-[10px] text-slate-300">
                                📚 Complete clinical mock test bank, Google Sheets sync, weak topic alerts.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-slate-900 text-slate-400 py-12 text-center text-xs">
        <div class="max-w-6xl mx-auto px-6">
            <p class="font-bold text-slate-300 mb-2">BDFCPS Companion Download Center</p>
            <p class="mb-4">Designed for medical candidates preparing for the Bangladesh College of Physicians and Surgeons (BCPS) exams.</p>
            <p class="text-slate-600">© 2026 Bangladesh College of Physicians & Surgeons Simulator. All Rights Reserved.</p>
        </div>
    </footer>
</body>
</html>`;

  // GitHub Actions CI yaml file content
  const githubActionsYaml = `# GitHub Actions Workflow to compile APK and release it automatically
name: Build and Release Android APK

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-apk:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'

      - name: Install Web Dependencies
        run: npm ci

      - name: Build Web Application
        run: npm run build

      - name: Setup Java JDK
        uses: actions/setup-java@v3
        with:
          distribution: 'zulu'
          java-version: '17'

      - name: Install Capacitor CLI & Platform
        run: |
          npm install @capacitor/core @capacitor/cli @capacitor/android
          npx cap init "${appName}" "com.rakibmuzumder.bdfcps" --web-dir=dist --confirm
          npx cap add android

      - name: Sync built web assets to Android
        run: |
          npx cap sync android

      - name: Build Android APK Release
        run: |
          cd android
          ./gradlew assembleRelease

      - name: Rename and Move APK for Website download
        run: |
          mv android/app/build/outputs/apk/release/app-release-unsigned.apk ./${apkFilename}

      - name: Commit and Push compiled APK directly back to branch
        run: |
          git config --global user.name "github-actions[bot]"
          git config --global user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add ${apkFilename}
          git commit -m "chore: compiled and updated latest production Android APK [skip ci]" || echo "No changes to commit"
          git push
`;

  // Capacitor config json code
  const capacitorConfigJson = `{
  "appId": "com.rakibmuzumder.bdfcps",
  "appName": "${appName}",
  "webDir": "dist",
  "server": {
    "androidScheme": "https"
  }
}`;

  const downloadHtmlFile = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedHtmlCode], {type: 'text/html'});
    element.href = URL.createObjectURL(file);
    element.download = "index.html";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSimulateApkDownload = () => {
    setSimulatedDownload(true);
    setDownloadCount(prev => prev + 1);

    // Create a real downloadable tiny blank wrapper apk/file representation for feedback
    const element = document.createElement("a");
    const file = new Blob([`Simulated Android APK package binary metadata content for ${appName} v2.0`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = apkFilename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setTimeout(() => {
      setSimulatedDownload(false);
    }, 4000);
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="github-apk-portal-component">
      
      {/* Visual Header Panel with dynamic branding */}
      <div className="bg-gradient-to-r from-slate-900 to-[#1e293b] rounded-3xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -translate-y-12 translate-x-12 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <span className="bg-teal-500/15 text-teal-400 text-[10px] font-black px-3 py-1 rounded-full border border-teal-500/25 uppercase tracking-wider">
              📦 GitHub Pages & APK Compiler Center
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Publish Your App & APK for Everyone!
            </h2>
            <p className="text-slate-300 text-xs max-w-xl leading-relaxed">
              Let doctor-candidates download your android app directly from <strong className="text-rose-400">rakibmozumder.github.io/BDFCPS/</strong>! Customize your landing page below, copy the pre-built GitHub actions, and publish in minutes.
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            <button 
              onClick={downloadHtmlFile}
              className="bg-[#ea2c59] hover:bg-[#d62550] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-rose-500/15 transition flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export index.html</span>
            </button>
          </div>
        </div>

        {/* Configurations Form Panel */}
        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="block text-[10px] uppercase font-bold text-slate-400">App Name Title</label>
            <input 
              type="text" 
              value={appName} 
              onChange={(e) => setAppName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] uppercase font-bold text-slate-400">APK File Version</label>
            <input 
              type="text" 
              value={apkVersion} 
              onChange={(e) => setApkVersion(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] uppercase font-bold text-slate-400">APK Output Filename</label>
            <input 
              type="text" 
              value={apkFilename} 
              onChange={(e) => setApkFilename(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] uppercase font-bold text-slate-400">Your GitHub Pages Link</label>
            <input 
              type="text" 
              value={githubRepoUrl} 
              onChange={(e) => setGithubRepoUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Main navigation tabs for interactive portal content */}
      <div className="space-y-4">
        <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px">
          <button 
            onClick={() => setActiveSubTab('preview')}
            className={`py-2 px-4 text-xs font-bold border-b-2 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'preview' ? 'border-[#ea2c59] text-[#ea2c59]' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" /> Live Website Preview
          </button>
          
          <button 
            onClick={() => setActiveSubTab('actions')}
            className={`py-2 px-4 text-xs font-bold border-b-2 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'actions' ? 'border-[#ea2c59] text-[#ea2c59]' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" /> GitHub Actions APK Compiler
          </button>

          <button 
            onClick={() => setActiveSubTab('capacitor')}
            className={`py-2 px-4 text-xs font-bold border-b-2 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'capacitor' ? 'border-[#ea2c59] text-[#ea2c59]' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" /> Capacitor Mobile Wrapper
          </button>
        </div>

        {/* Tab 1: Live Interactive Browser Mockup for their Website */}
        {activeSubTab === 'preview' && (
          <div className="space-y-6">
            
            {/* Info bar */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 leading-relaxed flex gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>How to test:</strong> Click the <strong>Download Android APK</strong> button in the browser frame below to simulate how medical students will experience downloading your app from your live GitHub URL. Adjust the fields in the configuration form above to immediately watch the preview adapt!
              </div>
            </div>

            {/* Simulated browser window wrapper */}
            <div className="bg-slate-100 rounded-2xl border border-slate-250 p-4 sm:p-8 relative shadow-inner">
              <div className="absolute top-1 right-4 text-[9px] font-mono text-slate-400 select-none">
                WEB BROWSER SIMULATOR
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden max-w-4xl mx-auto">
                
                {/* Browser address bar */}
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-150 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  </div>
                  <div className="flex-1 bg-white border border-slate-200 rounded-md px-3 py-0.5 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                    <span>{githubRepoUrl}</span>
                    <RefreshCw className="w-2.5 h-2.5" />
                  </div>
                </div>

                {/* Simulated landing-page body content (reflects exact design requested) */}
                <div className="bg-white text-slate-800 font-sans">
                  
                  {/* Inside navigation */}
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/80">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#fef2f4] border border-rose-100 p-1 flex items-center justify-center">
                        <img src={bdfcpsLogo} alt="" className="w-full h-full object-contain rounded-md" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 tracking-tight text-xs block leading-none">{appName}</span>
                        <span className="text-[7.5px] text-teal-600 font-bold uppercase tracking-widest">Clinical Prep Simulator</span>
                      </div>
                    </div>

                    <a 
                      href={githubRepoUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="bg-slate-950 text-white hover:bg-slate-850 px-2.5 py-1 rounded-lg text-[9px] font-extrabold flex items-center gap-1 transition"
                    >
                      <Github className="w-2.5 h-2.5" />
                      <span>View Code</span>
                    </a>
                  </div>

                  {/* Inside Hero */}
                  <div 
                    className="px-6 py-12 sm:px-10 text-center sm:text-left grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                    style={{ backgroundImage: 'radial-gradient(circle at 60% 40%, #fdf2f4 0%, #edfafd 100%)' }}
                  >
                    <div className="md:col-span-7 space-y-4">
                      <div className="inline-flex items-center gap-1 bg-rose-50 border border-rose-100 text-[#ea2c59] text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        🚀 {apkVersion} Live release apk
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                        Bangladesh FCPS <span className="text-[#ea2c59]">Companion</span>
                      </h2>

                      <p className="text-slate-600 text-xs leading-relaxed max-w-sm">
                        {appDescription}
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <span className="text-emerald-500 font-bold">✓</span>
                          <span>Full-Syllabus aligned clinical SBA question pool</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <span className="text-emerald-500 font-bold">✓</span>
                          <span>Interactive mobile simulation for iOS & Android</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <span className="text-emerald-500 font-bold">✓</span>
                          <span>Dynamic Cloud database sync via Firebase Firestore</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <button 
                          onClick={handleSimulateApkDownload}
                          disabled={simulatedDownload}
                          className="bg-[#ea2c59] hover:bg-[#d62550] text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-80"
                        >
                          <Download className="w-4 h-4" />
                          <span>{simulatedDownload ? 'Downloading APK...' : `Download Android APK (${apkVersion})`}</span>
                        </button>

                        <button 
                          onClick={() => alert(`Redirects candidate to TestFlight link: ${testFlightUrl}`)}
                          className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                        >
                          <span>Apple TestFlight Beta</span>
                          <span className="text-[8px] bg-slate-100 text-slate-500 px-1 rounded">iOS</span>
                        </button>
                      </div>

                      <div className="text-[10px] text-slate-400 font-mono">
                        File: {apkFilename} • Size: ~14.2 MB • Required: Android 8.0+
                      </div>

                      {simulatedDownload && (
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-2.5 text-[10px] animate-pulse flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span><strong>Download Triggered:</strong> Saving <code className="font-mono bg-emerald-100 px-1 rounded text-emerald-900">{apkFilename}</code> directly!</span>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-5 flex justify-center">
                      <div className="w-44 h-[280px] bg-slate-950 rounded-[24px] p-2 border-2 border-slate-900 relative shadow-lg">
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-2.5 bg-black rounded-full z-10" />
                        <div className="h-full w-full bg-slate-900 rounded-[16px] overflow-hidden flex flex-col justify-between p-3" style={{ background: 'radial-gradient(circle, #1e293b 0%, #0f172a 100%)' }}>
                          <span className="text-[7px] text-slate-500 font-mono">08:00 PM</span>
                          
                          <div className="space-y-2 text-center my-auto">
                            <div className="w-10 h-10 bg-white rounded-lg mx-auto p-1">
                              <img src={bdfcpsLogo} alt="" className="w-full h-full object-contain rounded" referrerPolicy="no-referrer" />
                            </div>
                            <span className="text-[10px] text-white font-extrabold block leading-none">BDFCPS Simulator</span>
                            <span className="text-[6.5px] text-teal-400 font-mono block uppercase">Interactive Engine Active</span>
                          </div>

                          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 text-slate-500 py-6 text-center text-[9px] border-t border-slate-800">
                    <p>© 2026 Bangladesh College of Physicians and Surgeons (BCPS). All Rights Reserved.</p>
                  </div>

                </div>

              </div>
            </div>

          </div>
        )}

        {/* Tab 2: GitHub Actions Automated CI/CD Compiler Script */}
        {activeSubTab === 'actions' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 border border-slate-800 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-teal-400" /> Fully Automated GitHub Actions APK Compiler
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    You do not need an Android SDK locally! Create a file in your GitHub repo called <code className="text-amber-400 font-mono">.github/workflows/build-apk.yml</code> and paste the code below. GitHub will compile the APK and commit it directly to your repository so candidates can download it!
                  </p>
                </div>

                <button 
                  onClick={() => copyCodeToClipboard(githubActionsYaml, 'github-actions')}
                  className="bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedCode === 'github-actions' ? 'Copied Workflow!' : 'Copy Workflow'}</span>
                </button>
              </div>

              <div className="bg-slate-950 rounded-xl p-4 font-mono text-[10px] text-slate-300 max-h-[300px] overflow-y-auto relative border border-slate-850">
                <pre className="whitespace-pre">{githubActionsYaml}</pre>
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
              </div>

              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850 text-[10px] text-slate-400 leading-normal flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-500 shrink-0" />
                <span>
                  <strong>Tip:</strong> Once GitHub Actions runs, the file <code className="text-teal-400">{apkFilename}</code> will appear in the root of your repository. Your landing page's download button is pre-configured to download this exact file directly!
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Capacitor Native Wrapper configurations */}
        {activeSubTab === 'capacitor' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 border border-slate-800 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-teal-400" /> Build Your APK Locally in 2 Minutes with Capacitor
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    If you prefer to compile the APK yourself, you can use Ionic Capacitor to wrap your React/Vite build into a native Android project instantly.
                  </p>
                </div>
              </div>

              {/* Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Local Setup Commands</span>
                  <div className="space-y-2.5 text-[11px] text-slate-300 font-mono">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1">
                      <span className="text-slate-500 text-[9px] uppercase font-bold block">1. Build Web Assets</span>
                      <code className="text-teal-400 block font-semibold">npm run build</code>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1">
                      <span className="text-slate-500 text-[9px] uppercase font-bold block">2. Add Capacitor & Android</span>
                      <code className="text-teal-400 block font-semibold">npm install @capacitor/core @capacitor/cli @capacitor/android</code>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1">
                      <span className="text-slate-500 text-[9px] uppercase font-bold block">3. Initialize & Add Platform</span>
                      <code className="text-teal-400 block font-semibold">npx cap init "{appName}" "com.rakibmuzumder.bdfcps" --web-dir=dist</code>
                      <code className="text-teal-400 block font-semibold mt-1">npx cap add android</code>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1">
                      <span className="text-slate-500 text-[9px] uppercase font-bold block">4. Build and Open APK</span>
                      <code className="text-teal-400 block font-semibold">npx cap sync android</code>
                      <code className="text-teal-400 block font-semibold mt-1">npx cap open android</code>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">capacitor.config.json</span>
                    <button 
                      onClick={() => copyCodeToClipboard(capacitorConfigJson, 'capacitor-json')}
                      className="text-slate-400 hover:text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedCode === 'capacitor-json' ? 'Copied config!' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-[10px] text-slate-300">
                    <pre className="whitespace-pre">{capacitorConfigJson}</pre>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-3 rounded-xl text-[10px] leading-relaxed">
                    Once you open the project in Android Studio via <code className="bg-slate-900 text-amber-200 px-1 rounded">npx cap open android</code>, just click <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK</strong> to output your final production-ready APK package instantly!
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
