import React, { useState, useEffect } from 'react';
import { 
  Database, RefreshCw, Key, FileSpreadsheet, CheckCircle2, 
  AlertCircle, Table, Trash2, ArrowUpRight, HelpCircle, 
  Sparkles, Check, ChevronDown, ChevronUp, Copy, BookOpen, AlertTriangle, Search, Undo2, Info
} from 'lucide-react';
import { Question, SubjectCategory } from '../types';

interface DatabaseManagementProps {
  questions: Question[];
  onUpdateQuestions: (qs: Question[]) => void;
}

export function getGoogleSheetsCsvUrl(idOrUrl: string): string {
  const clean = idOrUrl.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    if (clean.includes('docs.google.com/spreadsheets')) {
      const matchD = clean.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (matchD) {
        const id = matchD[1];
        if (clean.includes('/d/e/')) {
          return `https://docs.google.com/spreadsheets/d/e/${id}/pub?output=csv`;
        }
        return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;
      }
    }
    return clean;
  }
  
  if (clean.startsWith('2PACX-')) {
    return `https://docs.google.com/spreadsheets/d/e/${clean}/pub?output=csv`;
  }
  
  return `https://docs.google.com/spreadsheets/d/${clean}/export?format=csv`;
}

export default function DatabaseManagement({ questions, onUpdateQuestions }: DatabaseManagementProps) {
  // Load initial settings from localStorage
  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => {
    const stored = localStorage.getItem('fcps_sheet_id');
    if (!stored || stored === '2PACX-1vS_gZ448jpxmCH8m47V4Y18k4DsdbyOon3qK3Hn5Lz_16Y_mY-gOP-uR7uR66-Ior1x_gOH4L9_Q2R') {
      return '1OvzxOaT5cGZWKjkdcQ25uOFYDs5glgc_xTwGZs-jCUM';
    }
    return stored;
  });
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('fcps_sheets_api_key') || '';
  });
  const [rangeName, setRangeName] = useState<string>(() => {
    return localStorage.getItem('fcps_sheet_range') || 'Sheet1!A1:K300';
  });
  const [syncMethod, setSyncMethod] = useState<'api' | 'csv'>(() => {
    return (localStorage.getItem('fcps_sync_method') as 'api' | 'csv') || 'csv';
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [parsedPool, setParsedPool] = useState<Question[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [expandedQId, setExpandedQId] = useState<string | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('fcps_sheet_id', spreadsheetId);
    localStorage.setItem('fcps_sheets_api_key', apiKey);
    localStorage.setItem('fcps_sheet_range', rangeName);
    localStorage.setItem('fcps_sync_method', syncMethod);
  }, [spreadsheetId, apiKey, rangeName, syncMethod]);

  // Fallback preset configuration for showcase
  const handleLoadDemoValues = () => {
    setSpreadsheetId('1S_gZ448jpxmCH8m47V4Y18k4DsdbyOon3qK3Hn5Lz_16Y_mY-gOP-uR7uR66');
    setRangeName('Sheet1!A1:K200');
    setSyncMethod('csv');
    setSuccessMessage('Loaded responsive parameters! You can now pull public CSV directly.');
  };

  // CSV Splitting helper
  const splitRow = (line: string): string[] => {
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
  };

  // CSV Line Parser taking care of quotes
  const parseCSV = (text: string): Record<string, string>[] => {
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

    if (lines.length === 0) return [];

    const headers = splitRow(lines[0]).map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());
    const result: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = splitRow(lines[i]);
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        const val = values[index];
        obj[header] = val ? val.replace(/^"|"$/g, '').trim() : '';
      });
      result.push(obj);
    }
    return result;
  };

  const handleSync = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const cleanSpreadsheetId = spreadsheetId.trim();

    if (!cleanSpreadsheetId) {
      setError('A Spreadsheet ID is required.');
      setIsLoading(false);
      return;
    }

    try {
      let incomingQuestions: Question[] = [];

      if (syncMethod === 'api') {
        if (!apiKey.trim()) {
          throw new Error('Google Cloud API Key is required for API method. Or use "Public CSV Method" instead.');
        }

        // Fetch using official Google Sheets v4 API
        const encodedRange = encodeURIComponent(rangeName);
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanSpreadsheetId}/values/${encodedRange}?key=${apiKey.trim()}`;
        
        const res = await fetch(url);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData?.error?.message || `Google API returned status ${res.status}`;
          throw new Error(errMsg);
        }

        const data = await res.json();
        const rows: string[][] = data.values;

        if (!rows || rows.length < 2) {
          throw new Error('Spreadsheet returned empty or insufficient rows. Your first row must hold headers.');
        }

        // Parse JSON Values Array
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
          }
          return defaultVal;
        };

        incomingQuestions = rows.slice(1).map((row: string[], index: number) => {
          const id = getVal(row, ['id', 'questionid'], `sheets-api-${index}-${Date.now()}`);
          const typeStr = getVal(row, ['type'], 'SBA').toUpperCase();
          const type: 'SBA' | 'MTF' = typeStr.includes('MTF') ? 'MTF' : 'SBA';
          const tagsRaw = getVal(row, ['tags', 'tag', 'subject'], '[Medicine & Allied]');
          
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
          else if (cleanSub.includes('physio') || cleanSub.includes('biochem')) subject = 'Physiology & Biochemistry';
          else if (cleanSub.includes('patho') || cleanSub.includes('micro')) subject = 'Pathology & Microbiology';
          else if (cleanSub.includes('surg') || cleanSub.includes(' bailey')) subject = 'Surgery & Allied';
          else if (cleanSub.includes('gyn') || cleanSub.includes('obs')) subject = 'Gynecology & Obstetrics';
          else if (cleanSub.includes('peds') || cleanSub.includes('pedi')) subject = 'Pediatrics';
          else {
            const matched = validSubjects.find(s => s.toLowerCase() === cleanSub);
            if (matched) subject = matched;
          }

          const questionTextRaw = getVal(row, ['questiontext', 'question', 'question text'], 'No body text supplied.');
          
          const optA = getVal(row, ['optiona', 'option a', 'a'], '');
          const optB = getVal(row, ['optionb', 'option b', 'b'], '');
          const optC = getVal(row, ['optionc', 'option c', 'c'], '');
          const optD = getVal(row, ['optiond', 'option d', 'd'], '');
          const optE = getVal(row, ['optione', 'option e', 'e'], '');

          const options: string[] = [];
          if (optA) options.push(optA);
          if (optB) options.push(optB);
          if (optC) options.push(optC);
          if (optD) options.push(optD);
          if (optE) options.push(optE);

          while (options.length < 5) {
            options.push(`Prepopulated Option ${String.fromCharCode(65 + options.length)}`);
          }

          const rawCorrect = getVal(row, ['correctanswer', 'correct', 'answer', 'correctanswerindex'], 'A');
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
              correctAnswerIndex = isNaN(parsedNum) ? 0 : Math.max(0, Math.min(4, parsedNum));
            }
          }

          const expAndRef = getVal(row, ['explanation', 'rationale', 'explanationtext'], '');
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

      } else {
        // Public CSV Synchronisation Method (requires no Google Developer Keys)
        const csvUrl = getGoogleSheetsCsvUrl(cleanSpreadsheetId);

        const res = await fetch(csvUrl);
        if (!res.ok) {
          throw new Error(`Google CSV export responded with HTTP status ${res.status}`);
        }
        const text = await res.text();
        const rows = parseCSV(text);

        if (rows.length === 0) {
          throw new Error('Table parsed empty. Double check your CSV spreadsheet headers.');
        }

        incomingQuestions = rows.map((row, index) => {
          const id = row['id'] || `sheets-csv-${index}-${Date.now()}`;
          const typeStr = (row['type'] || 'SBA').toUpperCase();
          const type: 'SBA' | 'MTF' = typeStr.includes('MTF') ? 'MTF' : 'SBA';
          
          let tagsRaw = row['tags'] || row['subject'] || '[Medicine & Allied] General chapter';
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
          else if (cleanSub.includes('physio') || cleanSub.includes('biochem')) subject = 'Physiology & Biochemistry';
          else if (cleanSub.includes('patho') || cleanSub.includes('micro')) subject = 'Pathology & Microbiology';
          else if (cleanSub.includes('surg') || cleanSub.includes(' bailey')) subject = 'Surgery & Allied';
          else if (cleanSub.includes('gyn') || cleanSub.includes('obs')) subject = 'Gynecology & Obstetrics';
          else if (cleanSub.includes('peds') || cleanSub.includes('pedi')) subject = 'Pediatrics';
          else {
            const matched = validSubjects.find(s => s.toLowerCase() === cleanSub);
            if (matched) subject = matched;
          }

          const questionTextRaw = row['questiontext'] || row['question'] || 'No body text supplied.';
          
          const optA = row['optiona'] || row['a'] || '';
          const optB = row['optionb'] || row['b'] || '';
          const optC = row['optionc'] || row['c'] || '';
          const optD = row['optiond'] || row['d'] || '';
          const optE = row['optione'] || row['e'] || '';

          const options: string[] = [];
          if (optA) options.push(optA);
          if (optB) options.push(optB);
          if (optC) options.push(optC);
          if (optD) options.push(optD);
          if (optE) options.push(optE);

          while (options.length < 5) {
            options.push(`Prepopulated Option ${String.fromCharCode(65 + options.length)}`);
          }

          const rawCorrect = row['correctanswer'] || row['correct'] || row['correctanswerindex'] || 'A';
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
              correctAnswerIndex = isNaN(parsedNum) ? 0 : Math.max(0, Math.min(4, parsedNum));
            }
          }

          const expAndRef = row['explanation'] || row['explanations'] || '';
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

      setParsedPool(incomingQuestions);
      setSuccessMessage(`Successfully parsed ${incomingQuestions.length} medical items from the cloud Spreadsheet! Click "Replace Active Database" to finalize updates.`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unexpected parse or networking issue occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToAppDatabase = () => {
    if (parsedPool.length === 0) {
      setError('Please pull and preview database items from the spreadsheet first.');
      return;
    }

    onUpdateQuestions(parsedPool);
    setSuccessMessage(`Active application questions successfully updated! Total bank size: ${parsedPool.length} Qs.`);
    setParsedPool([]);
  };

  const filteredQuestions = parsedPool.filter(q => {
    const term = filterQuery.toLowerCase();
    return (
      q.question.toLowerCase().includes(term) ||
      q.subject.toLowerCase().includes(term) ||
      q.topic.toLowerCase().includes(term) ||
      q.reference.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6" id="database-management-panel">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="bg-teal-50 text-teal-600 p-2.5 rounded-2xl">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Cloud Database Management</h2>
            <p className="text-xs text-slate-500">Synchronize the exam questions app bank using official Google Sheet links.</p>
          </div>
        </div>
        <button 
          onClick={handleLoadDemoValues}
          className="text-[10px] text-teal-600 font-bold bg-teal-50 px-2.5 py-1.5 rounded-xl hover:bg-teal-100 active:scale-95 transition"
          title="Instant Sandbox pre-sets"
          id="load-preset-sheet-btn"
        >
          ✨ Auto Preset Link
        </button>
      </div>

      {/* BDFCPS Auto-Sync Guide Card */}
      <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 rounded-3xl p-5 space-y-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="bg-teal-600 text-white p-2 rounded-2xl shrink-0">
            <FileSpreadsheet className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-teal-900">How to Auto-Sync "BDFCPS" Everyday</h3>
            <p className="text-xs text-teal-800/80 leading-relaxed">
              The application features a secure, automated, atomic daily background synchronization engine. It attempts to load fresh question items silently when you open the application each day from your custom spreadsheet configurations.
            </p>
          </div>
        </div>

        <div className="bg-white/80 rounded-2xl p-4 border border-teal-100/50 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>4-Step Quick Setup Guide for "BDFCPS" Sheet:</span>
          </h4>
          <ol className="text-xs text-slate-650 space-y-2 list-decimal list-inside pl-1 leading-relaxed">
            <li>
              <strong className="text-slate-800">Publish your BDFCPS Sheet:</strong> Open your Google Sheet named <code className="bg-slate-100 font-mono text-xs px-1 rounded text-teal-800">BDFCPS</code>. Go to <strong className="text-slate-800">File &gt; Share &gt; Publish to the Web</strong>.
            </li>
            <li>
              <strong className="text-slate-800">Select Link Type:</strong> Choose <strong className="text-slate-800">"Entire Document"</strong> and change the format dropdown from "Web page" to <strong className="text-slate-800">"Comma-separated values (.csv)"</strong>, then click <strong className="text-slate-800">Publish</strong>.
            </li>
            <li>
              <strong className="text-slate-800">Copy the link:</strong> Copy that generated URL (it will start with <code className="bg-slate-100 font-mono text-[10px] px-1 rounded">https://docs.google.com/spreadsheets/d/e/...</code> and end with <code className="bg-slate-100 font-mono text-[10px] px-1 rounded">f?output=csv</code>).
            </li>
            <li>
              <strong className="text-slate-800">Paste & Verify:</strong> Choose <strong className="text-teal-700">"Public Web CSV Link"</strong> method below, paste the copied link or spreadsheet ID in the field box, click <strong className="text-slate-900">"Verify & Fetch From Cloud"</strong>, and click <strong className="text-teal-700">"Replace Active Database"</strong> when successful! Let the automatic daily sync handle the rest.
            </li>
          </ol>
        </div>
      </div>

      {/* Selector settings */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/50 space-y-4">
        
        {/* Method Tab */}
        <div className="flex gap-2 p-1 bg-slate-200/60 rounded-xl">
          <button
            onClick={() => setSyncMethod('csv')}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
              syncMethod === 'csv' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            📋 Public Web CSV Link
          </button>
          <button
            onClick={() => setSyncMethod('api')}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
              syncMethod === 'api' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🔑 Google Cloud JSON API
          </button>
        </div>

        {/* Inputs stack */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              {syncMethod === 'api' ? 'Spreadsheet ID' : 'Spreadsheet ID / Published URL'}
            </label>
            <input 
              type="text"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
              placeholder={syncMethod === 'api' ? 'e.g. 1S_gZ448jpxmCH8m47V4Y1...' : 'Spreadsheet link or ID'}
              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              id="sheet-id-input"
            />
          </div>

          {syncMethod === 'api' ? (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-slate-500" />
                Google API Key
              </label>
              <input 
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste AIzaSy... developer key"
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                id="api-key-input"
              />
            </div>
          ) : (
            <div className="space-y-1.5 opacity-60">
              <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                Auth requirements
              </label>
              <input 
                type="text"
                disabled
                value="No API Key Required (Public Sheets)"
                className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-xl py-2 px-3 text-xs outline-none cursor-not-allowed"
              />
            </div>
          )}

          {syncMethod === 'api' && (
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Table className="w-3.5 h-3.5 text-slate-500" />
                Sheet Name & Range Range
              </label>
              <input 
                type="text"
                value={rangeName}
                onChange={(e) => setRangeName(e.target.value)}
                placeholder="e.g. Sheet1!A1:K300"
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                id="range-input"
              />
            </div>
          )}

        </div>

        {/* Action button trigger */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSync}
            disabled={isLoading}
            className="flex-1 bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            id="sync-pull-action"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Pulling Cloud data...' : 'Verify & Fetch From Cloud'}</span>
          </button>
          
          {parsedPool.length > 0 && (
            <button
              onClick={handleApplyToAppDatabase}
              className="bg-teal-600 text-white hover:bg-teal-500 font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow active:scale-95 shrink-0"
              id="apply-sheet-db-btn"
            >
              <CheckCircle2 className="w-4 h-4 text-teal-200" />
              <span>Replace Active Database ({parsedPool.length})</span>
            </button>
          )}
        </div>

      </div>

      {/* Notifications status messages */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-4 flex gap-3 shadow-xs animate-fadeIn" id="success-log-banner">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-xs">Synchronization Complete</h4>
            <p className="text-[11px] leading-relaxed text-emerald-800">{successMessage}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl p-4 flex gap-3 shadow-xs animate-fadeIn" id="error-log-banner">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-xs">Synchronization Error</h4>
            <p className="text-[11px] leading-relaxed text-rose-800">{error}</p>
            <div className="pt-2 text-[10px] text-rose-700/80 flex flex-col gap-1">
              <span>💡 Suggestions to troubleshoot:</span>
              <span>1. For CSV method, go to file {`->`} Share {`->`} Publish to the web {`->`} entire document as .CSV comma-separated.</span>
              <span>2. For API method, verify Google API Key permissions & Spreadsheet sharing settings are set to "Anyone with the link can view".</span>
            </div>
          </div>
        </div>
      )}

      {/* Guide layout with schema definitions */}
      <div className="text-slate-500 leading-relaxed text-xs border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Sparkles className="w-4 h-4 text-teal-500" />
          <span>Google Sheet CSV Column Headers Blueprint</span>
        </div>
        <p className="text-[11px]">
          Your sheet must contain the following table columns to synchronize successfully. Keep row 1 as the column names:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px] font-mono border-collapse" id="blueprint-headers-table">
            <thead>
              <tr className="border-b border-slate-205 text-slate-700 bg-slate-100">
                <th className="py-1 px-2">Header Name</th>
                <th className="py-1 px-2">Type</th>
                <th className="py-1 px-2">Requirement</th>
                <th className="py-1 px-2">Explanation / Format</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-1 px-2 font-bold text-teal-700">ID</td>
                <td className="py-1 px-2">String</td>
                <td className="py-1 px-2 text-rose-500">Optional</td>
                <td className="py-1 px-2">E.g., "q88" or unique text</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1 px-2 font-bold text-teal-700">Type</td>
                <td className="py-1 px-2">"SBA" | "MTF"</td>
                <td className="py-1 px-2 text-teal-600">Recommended</td>
                <td className="py-1 px-2">Determines answer assessment rule (SBA or True/False set)</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1 px-2 font-bold text-teal-700">Tags</td>
                <td className="py-1 px-2">String</td>
                <td className="py-1 px-2 text-emerald-600">Required</td>
                <td className="py-1 px-2">Subject category inside brackets. (e.g. `[Anatomy] Thorax Plexus`)</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1 px-2 font-bold text-teal-700">QuestionText</td>
                <td className="py-1 px-2">String</td>
                <td className="py-1 px-2 text-emerald-600">Required</td>
                <td className="py-1 px-2">Primary clinical scenario scenario</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1 px-2 font-bold text-teal-700">OptionA..E</td>
                <td className="py-1 px-2">String</td>
                <td className="py-1 px-2 text-emerald-600">Required</td>
                <td className="py-1 px-2">Divided separately under columns OptionA, OptionB.. OptionE</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1 px-2 font-bold text-teal-700">CorrectAnswer</td>
                <td className="py-1 px-2">String</td>
                <td className="py-1 px-2 text-emerald-600">Required</td>
                <td className="py-1 px-2">SBA letter (e.g. `D`) or MTF comma-separated answers (e.g. `T,T,F,T,F`)</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1 px-2 font-bold text-teal-700">Explanation</td>
                <td className="py-1 px-2">String</td>
                <td className="py-1 px-2 text-rose-500">Optional</td>
                <td className="py-1 px-2">Explanation with reference in brackets. (e.g. `[Harrison pg 5] Explanation body`)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Parsed question preview lists */}
      {parsedPool.length > 0 && (
        <div className="space-y-3 animate-fadeIn" id="sheets-preview-container">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <Table className="w-4 h-4 text-teal-500" />
              <span>Table Preview of Fetched Questions ({filteredQuestions.length} visible)</span>
            </h3>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input 
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Search pulled bank..."
                className="bg-slate-100 text-[10px] pl-8 pr-3 py-1 rounded-lg border border-transparent outline-none focus:border-slate-300 w-44"
              />
            </div>
          </div>

          <div className="border border-slate-150/80 rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto font-sans">
            <div className="divide-y divide-slate-100 bg-white">
              {filteredQuestions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No questions match your filter query.
                </div>
              ) : (
                filteredQuestions.map((q) => {
                  const isExpanded = expandedQId === q.id;
                  return (
                    <div key={q.id} className="p-3 hover:bg-slate-50 transition">
                      <div 
                        className="flex items-start justify-between cursor-pointer" 
                        onClick={() => setExpandedQId(isExpanded ? null : q.id)}
                      >
                        <div className="space-y-1 max-w-[85%]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] bg-slate-900 text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wide">
                              {q.type || 'SBA'}
                            </span>
                            <span className="text-[9px] bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded-md font-medium">
                              🏷️ {q.subject}
                            </span>
                            <span className="text-[9px] text-slate-505 font-mono">
                              📍 {q.topic}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 line-clamp-2 md:line-clamp-1">
                            {q.question}
                          </p>
                        </div>
                        <div className="text-slate-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-dashed border-slate-201/80 space-y-2.5 text-[11px] text-slate-600 animate-fadeIn">
                          <div className="bg-slate-50 p-2.5 rounded-xl space-y-1 font-mono">
                            <span className="font-bold text-slate-850 block text-[9px] uppercase">Options list:</span>
                            {q.options.map((opt, i) => {
                              const isMtf = q.type === 'MTF';
                              const letter = String.fromCharCode(65 + i);
                              const isSbaCorrect = !isMtf && i === q.correctAnswerIndex;
                              const isMtfTrue = isMtf && q.mtfAnswers && q.mtfAnswers[i] === 'T';
                              return (
                                <div key={i} className="flex gap-1.5">
                                  <span>{letter}.</span>
                                  <span className={isSbaCorrect || isMtfTrue ? "text-emerald-700 font-bold" : "text-slate-600"}>
                                    {opt}
                                  </span>
                                  {isSbaCorrect && <span className="text-emerald-600 font-bold text-[9px]">[Correct SBA]</span>}
                                  {isMtf && (
                                    <span className={`text-[8px] font-bold px-1 rounded ${isMtfTrue ? 'bg-emerald-150 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                                      {isMtfTrue ? 'TRUE' : 'FALSE'}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block uppercase text-[9px] tracking-wider">Clinical Explanation:</span>
                            <p className="leading-relaxed bg-amber-50/50 p-2 rounded-xl text-[10px] text-amber-900 border border-amber-100/50">
                              {q.explanation || 'No explanation provided.'}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-[9px] text-emerald-800 bg-emerald-50/40 py-1 px-2.5 rounded-lg font-mono">
                            <span>📚 SOURCE REFERENCE:</span>
                            <span className="font-bold text-teal-800">{q.reference}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
