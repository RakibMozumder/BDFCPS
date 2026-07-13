import React, { useState } from 'react';
import { 
  Download, 
  CheckCircle, 
  ArrowRight 
} from 'lucide-react';

interface PublicLandingPageProps {
  bdfcpsLogo: string;
  appName?: string;
  appDescription?: string;
  apkVersion?: string;
  apkFilename?: string;
}

export default function PublicLandingPage({
  bdfcpsLogo,
  appName = "Bangladesh FCPS Companion",
  appDescription = "The premium clinical case question-bank simulator and adaptive study portal for Bangladeshi doctors preparing for the prestigious FCPS Part I exam.",
  apkVersion = "v2.0",
  apkFilename = "BDFCPS_Companion_v2.0.apk"
}: PublicLandingPageProps) {
  const [downloadTriggered, setDownloadTriggered] = useState<boolean>(false);

  const handleDownload = () => {
    setDownloadTriggered(true);
    // Create a temporary link to trigger the actual APK download from the root
    const link = document.createElement('a');
    link.href = `./${apkFilename}`;
    link.download = apkFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadTriggered(false);
    }, 4000);
  };

  return (
    <div 
      className="min-h-screen flex flex-col font-sans select-none" 
      id="public-landing-container"
      style={{ backgroundImage: 'radial-gradient(circle at 50% 35%, #fdf2f4 0%, #edfafd 100%)' }}
    >
      {/* Main content centering container */}
      <main className="flex-grow flex items-center justify-center py-12 md:py-24 px-6 relative z-10 w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center w-full">
          
          {/* Left Hero Column */}
          <div className="md:col-span-7 space-y-7 text-left">
            {/* Badge */}
            <div>
              <span className="inline-flex items-center gap-1.5 bg-[#fef2f4] border border-rose-100/60 text-[#ea2c59] text-xs font-black px-4 py-1.5 rounded-full tracking-wider uppercase shadow-xs">
                🚀 {apkVersion} Live Release APK
              </span>
            </div>
            
            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-none">
              {appName.split(' ').slice(0, 2).join(' ')} <br/>
              <span className="text-[#ea2c59]">{appName.split(' ').slice(2).join(' ')}</span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg font-medium">
              {appDescription}
            </p>

            {/* Pristine Checkmarks list (strictly styled like the target image) */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3 text-sm sm:text-base text-slate-700 font-semibold">
                <span className="text-[#10b981] font-black text-lg leading-none shrink-0">✓</span>
                <span>Full-Syllabus aligned clinical SBA question pool</span>
              </div>
              <div className="flex items-start gap-3 text-sm sm:text-base text-slate-700 font-semibold">
                <span className="text-[#10b981] font-black text-lg leading-none shrink-0">✓</span>
                <span>Interactive mobile simulation for iOS & Android</span>
              </div>
              <div className="flex items-start gap-3 text-sm sm:text-base text-slate-700 font-semibold">
                <span className="text-[#10b981] font-black text-lg leading-none shrink-0">✓</span>
                <span>Dynamic Cloud database sync via Firebase Firestore</span>
              </div>
            </div>

            {/* Actions Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={handleDownload}
                disabled={downloadTriggered}
                className="bg-[#ea2c59] hover:bg-[#d91b48] text-white font-extrabold px-8 py-4 rounded-2xl shadow-lg shadow-rose-500/20 transition active:scale-95 flex items-center justify-center gap-3 text-sm cursor-pointer disabled:opacity-85"
                id="landing-download-apk-btn"
              >
                <Download className="w-5 h-5" strokeWidth={2.5} />
                <span>{downloadTriggered ? 'Downloading APK...' : `Download Android APK (${apkVersion})`}</span>
              </button>
              
              <div 
                className="border border-slate-200 bg-white text-slate-700 font-bold px-6 py-4 rounded-2xl flex items-center justify-center gap-2.5 text-sm select-none"
              >
                <span>Apple TestFlight Beta</span>
                <span className="text-[10px] bg-slate-150 text-slate-500 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide">iOS</span>
              </div>
            </div>
            
            {/* File info bar */}
            <div className="text-[11px] text-slate-400 font-mono">
              File: <span className="font-bold">{apkFilename}</span> • Size: ~14.2 MB • Required: Android 8.0+
            </div>

            {downloadTriggered && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-xs animate-pulse flex items-center gap-2.5 max-w-md">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Download Started:</strong> Saving <code className="font-mono bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-900">{apkFilename}</code> directly!</span>
              </div>
            )}
          </div>

          {/* Right Smartphone Showcase Column */}
          <div className="md:col-span-5 flex justify-center relative">
            {/* Subtle light glow behind device */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-[520px] bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="w-72 h-[540px] bg-slate-950 rounded-[40px] p-3.5 shadow-2xl border-4 border-slate-900 relative shrink-0">
              {/* Dynamic Island / Notch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-black rounded-full z-20" />
              
              {/* Screen Content */}
              <div className="h-full w-full bg-slate-900 rounded-[28px] overflow-hidden relative flex flex-col justify-between p-6" style={{ background: 'radial-gradient(circle, #1e293b 0%, #0f172a 100%)' }}>
                <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono w-full select-none px-1">
                  <span>08:00 PM</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>LTE</span>
                  </div>
                </div>

                <div className="space-y-5 text-center my-auto">
                  <div className="w-16 h-16 bg-white rounded-2xl mx-auto p-1.5 shadow-md transform hover:rotate-6 transition duration-300">
                    <img 
                      src={bdfcpsLogo} 
                      alt="" 
                      className="w-full h-full object-contain rounded-xl" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <span className="text-base font-extrabold text-white block tracking-tight">BDFCPS Simulator</span>
                    <span className="text-[9px] text-[#10b981] font-mono font-bold tracking-widest uppercase block">Interactive Engine Active</span>
                  </div>
                </div>

                {/* Home Indicator */}
                <div className="w-16 h-1 bg-white/20 rounded-full mx-auto" />
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0f172a] text-slate-400 py-8 text-center text-xs border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 space-y-2">
          <p className="text-slate-500">
            © 2026 Bangladesh College of Physicians and Surgeons (BCPS). All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
