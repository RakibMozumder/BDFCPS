import React from 'react';
import { Clock, AlertTriangle, FastForward } from 'lucide-react';

interface CountdownTimerProps {
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  isActive: boolean;
  onTimeUp?: () => void;
  totalDuration: number; // in seconds
}

export default function CountdownTimer({
  timeLeft,
  setTimeLeft,
  isActive,
  totalDuration,
}: CountdownTimerProps) {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // Formulate warning thresholds
  const isUrgent = timeLeft <= 60; // Less than 1 minute
  const percentageLeft = (timeLeft / totalDuration) * 105; // provide minor overflow offset

  // Let developer fast forward to 5 seconds to test auto-complete
  const triggerDebugShorten = () => {
    setTimeLeft(5);
  };

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 p-3 text-white flex flex-col gap-2 relative z-10 transition-all">
      <div className="flex items-center justify-between">
        {/* Left Side: Timer info */}
        <div className="flex items-center gap-2 mr-1">
          <div className={`p-1.5 rounded-lg transition-colors ${
            isUrgent ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-teal-500/10 text-teal-400'
          }`}>
            <Clock className={`w-4 h-4 ${isUrgent ? 'animate-pulse' : ''}`} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              CBT Timer Control
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className={`font-mono text-sm sm:text-base font-bold tracking-tight transition-colors ${
                isUrgent ? 'text-red-400 animate-pulse' : 'text-teal-300 font-semibold'
              }`}>
                {formattedTime}
              </span>
              {isUrgent && (
                <span className="text-[8px] text-red-400 font-extrabold animate-pulse uppercase">
                  Time Warning
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Fast-Forward and Warning icons */}
        <div className="flex items-center gap-2 select-none">
          {/* Debug Shortcut to Fast Forward */}
          {timeLeft > 10 && (
            <button
              onClick={triggerDebugShorten}
              className="bg-slate-800 hover:bg-slate-700 hover:text-teal-300 text-[10px] text-slate-300 py-1 px-1.5 rounded-lg border border-slate-700 transition flex items-center gap-0.5 font-mono font-semibold"
              title="Fast forward to last 5 seconds to test automatic completion"
              id="btn-fast-forward-timer"
            >
              <FastForward className="w-3 h-3 text-amber-400" />
              <span>Speed Test</span>
            </button>
          )}

          {isUrgent && (
            <div className="flex items-center gap-1 bg-red-550/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-lg text-[8px] font-extrabold animate-pulse shrink-0">
              <AlertTriangle className="w-3 h-3" />
              <span>AUTO SUBMIT</span>
            </div>
          )}
        </div>
      </div>

      {/* Shrinking bottom progress-line */}
      <div className="h-1 bg-slate-800 rounded-full w-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 origin-left ${
            isUrgent ? 'bg-red-500 animate-pulse' : 'bg-teal-400'
          }`}
          style={{ width: `${Math.max(0, Math.min(100, percentageLeft))}%` }}
        />
      </div>
    </div>
  );
}

