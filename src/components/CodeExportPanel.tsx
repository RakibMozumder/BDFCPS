import React, { useState } from 'react';
import { Copy, Check, Terminal, FileCode, FolderSync, ExternalLink, HelpCircle } from 'lucide-react';
import { EXPO_CODE_FILES } from '../data/expoCode';

export default function CodeExportPanel() {
  const [activeFileIdx, setActiveFileIdx] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const activeFile = EXPO_CODE_FILES[activeFileIdx];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white flex flex-col h-full space-y-4 shadow-xl">
      
      {/* Tech Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="bg-teal-500/10 p-2 rounded-xl border border-teal-500/20">
            <Terminal className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-tight text-white">React Native Expo Codebase</h2>
            <p className="text-[11px] text-slate-400">Production-ready boilerplate generated to user intent</p>
          </div>
        </div>

        <span className="bg-teal-500/20 text-teal-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-teal-500/30">
          SDK 51+
        </span>
      </div>

      {/* Deploy Steps Walkthrough */}
      <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-850 space-y-2.5 text-xs">
        <h3 className="font-bold text-slate-200 flex items-center gap-1">
          <FolderSync className="w-4 h-4 text-teal-400" /> Three-Step Expo Boot Command Set:
        </h3>
        <ol className="list-decimal pl-4 text-[11px] text-slate-400 space-y-1.5 font-medium leading-relaxed">
          <li>
            Open a native console and bootstrap the workspace:
            <code className="block bg-slate-900 text-teal-400 p-2 rounded mt-1 font-mono text-[9.5px]">
              npx create-expo-app fcps-mobile --template blank-typescript
            </code>
          </li>
          <li>
            Change directory, copy the code of files from below, and install dependencies:
            <code className="block bg-slate-900 text-teal-400 p-2 rounded mt-1 font-mono text-[9.5px]">
              npm install @react-navigation/native @react-navigation/bottom-tabs lucide-react-native react-native-safe-area-context react-native-screens react-native-svg
            </code>
          </li>
          <li>
            Launch the development simulator server:
            <code className="block bg-slate-900 text-teal-400 p-2 rounded mt-1 font-mono text-[9.5px]">
              npx expo start
            </code>
          </li>
        </ol>
      </div>

      {/* Explorer / Workspace tab selector */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Simulated Directory Tree</p>
        <div className="flex flex-wrap gap-1.5">
          {EXPO_CODE_FILES.map((file, idx) => {
            const isActive = activeFileIdx === idx;
            return (
              <button
                key={file.name}
                onClick={() => { setActiveFileIdx(idx); setCopied(false); }}
                className={`text-[11px] font-mono font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all ${
                  isActive 
                    ? 'bg-slate-800 border-teal-500 text-white shadow' 
                    : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode className={`w-3.5 h-3.5 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                {file.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic File Info Box */}
      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 text-[11px] text-slate-400 leading-relaxed italic">
        <strong>Description:</strong> {activeFile.description}
      </div>

      {/* Active High-contrast Code Display Block with Copy button */}
      <div className="flex-1 flex flex-col min-h-[220px] max-h-[350px] bg-slate-950 rounded-2xl border border-slate-850 overflow-hidden relative">
        <div className="bg-slate-900 border-b border-slate-850 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-teal-400 text-[11px]">{activeFile.name} (Source Mode)</span>
          <button 
            onClick={handleCopyCode}
            className="bg-slate-850 border border-slate-750 text-slate-200 hover:text-white px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer transition active:scale-95 text-[10px]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Code
              </>
            )}
          </button>
        </div>

        {/* Code Content text-box */}
        <pre className="flex-1 overflow-auto p-4 font-mono text-[10px] text-slate-300 leading-relaxed text-left scrollbar-thin scrollbar-thumb-slate-850">
          <code>{activeFile.code}</code>
        </pre>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <span>Designed block-by-block with strict TS validation</span>
        <span className="flex items-center gap-0.5 text-teal-500">
          Expo SDK Ready <ExternalLink className="w-3 h-3" />
        </span>
      </div>

    </div>
  );
}
