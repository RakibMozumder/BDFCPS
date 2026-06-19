import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { BarChart2, TrendingUp, HelpCircle, Target, Trophy, Award, Clock, Sparkles } from 'lucide-react';
import { UserProgress } from '../types';
import FlatList from './FlatList';

interface AnalyticsTabProps {
  progress: UserProgress;
  doctorName?: string;
}

export default function AnalyticsTab({ progress, doctorName = 'Dr. Sarah Ahmed' }: AnalyticsTabProps) {
  // Map subject ratings scores for graph
  const subjectChartData = Object.entries(progress.subjectAverages).map(([subject, score]) => {
    let shortName = subject;
    if (subject === 'Physiology & Biochemistry') shortName = 'Physiol';
    else if (subject === 'Anatomy') shortName = 'Anat';
    else if (subject === 'Pathology & Microbiology') shortName = 'Path';
    else if (subject === 'Medicine & Allied') shortName = 'Medicine';
    else if (subject === 'Surgery & Allied') shortName = 'Surgery';
    else if (subject === 'Gynecology & Obstetrics') shortName = 'Gyne';
    else if (subject === 'Pediatrics') shortName = 'Peds';

    return {
      name: shortName,
      Score: score,
    };
  });

  const weeklyLoadData = [
    { week: 'Wk 1', Minutes: 120, Targets: 80 },
    { week: 'Wk 2', Minutes: 220, Targets: 110 },
    { week: 'Wk 3', Minutes: 180, Targets: 120 },
    { week: 'Wk 4', Minutes: 310, Targets: 150 },
    { week: 'Wk 5', Minutes: 290, Targets: 180 },
    { week: 'Wk 6', Minutes: 420, Targets: 220 },
    { week: 'Wk 7', Minutes: 490, Targets: 250 },
  ];

  // Participating doctors leaderboard data
  const baseLeaderboard = [
    { name: 'Dr. Arshad Malik', specialty: 'Surgery Candidate', score: 92, submissionTime: '07:05 AM', isCurrentUser: false },
    { name: 'Dr. Zainab Bilal', specialty: 'Medicine Candidate', score: 88, submissionTime: '07:11 AM', isCurrentUser: false },
    { name: 'Dr. Usman Tariq', specialty: 'Pediatrics Candidate', score: 78, submissionTime: '06:45 AM', isCurrentUser: false },
    { name: 'Dr. Maria Khan', specialty: 'Gyne Candidate', score: 75, submissionTime: '06:58 AM', isCurrentUser: false },
    { name: 'Dr. Ali Naqvi', specialty: 'Pathology Candidate', score: 71, submissionTime: '06:12 AM', isCurrentUser: false },
    { name: 'Dr. Hina Fatima', specialty: 'Anatomy Candidate', score: 68, submissionTime: '05:30 AM', isCurrentUser: false }
  ];

  const userRow = {
    name: doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`,
    specialty: 'You (BCPS Candidate)',
    score: progress.averageScorePercentage,
    submissionTime: '07:13 AM',
    isCurrentUser: true
  };

  const sortedLeaderboard = [...baseLeaderboard, userRow].sort((a, b) => b.score - a.score);

  // Extract Top 3 for prestigious display bento
  const top3 = sortedLeaderboard.slice(0, 3);
  const remainingList = sortedLeaderboard.slice(3);

  // Chorcha Special Prize Payout Tiers Map
  const PAYOUT_TIERS: Record<number, { tier: string; prize: string; badgeColor: string }> = {
    1: { tier: 'Scholar Tier', prize: '৳5,000 Payout pool', badgeColor: 'bg-amber-100 text-amber-900 border-amber-300' },
    2: { tier: 'Specialist Tier', prize: '৳3,000 Payout pool', badgeColor: 'bg-slate-150 text-slate-900 border-slate-350' },
    3: { tier: 'Resident Tier', prize: '৳1,500 Payout pool', badgeColor: 'bg-orange-100 text-orange-900 border-orange-350' },
  };

  return (
    <div className="flex flex-col overflow-y-auto max-h-[580px] p-4 space-y-5 pb-20 scrollbar-thin scrollbar-thumb-slate-300" id="analytics-studio-tab">
      
      <div className="space-y-1">
        <h2 className="text-base font-bold text-slate-800">BCPS Diagnostic Studio</h2>
        <p className="text-xs text-slate-500">
          Real-time analytics of your preparation strengths, mock pacing, and focus indicators.
        </p>
      </div>

      {/* Dynamic Key Performance Cards Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <Target className="w-3.5 h-3.5 text-teal-600 font-bold" /> Success Index
          </div>
          <p className="text-2xl font-bold font-mono text-slate-800 mt-1">{progress.averageScorePercentage}%</p>
          <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded mt-1.5 inline-block">
            +4.2% accuracy shift
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-slate-600" /> Solved items
          </div>
          <p className="text-2xl font-bold font-mono text-slate-800 mt-1">{progress.questionsSolvedCount}</p>
          <span className="text-[9px] text-teal-600 font-bold bg-teal-50 px-1.5 py-0.5 rounded mt-1.5 inline-block">
            Syllabus Coverage: 64%
          </span>
        </div>
      </div>

      {/* Recharts - Specialty Mastery Bar Chart */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1">
            <BarChart2 className="w-4 h-4 text-teal-600" /> Specialty Mastery Profile
          </h3>
          <span className="text-[9px] text-slate-400 uppercase font-mono font-semibold">Pass mark: 75%</span>
        </div>

        <div className="w-full text-xs">
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={subjectChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 8, fill: '#64748b' }} domain={[0, 100]} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ fontSize: '10px', background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="Score" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BDFCPS-style Live Rank & Payout Tiers Leaderboard */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-4" id="bdfcps-leaderboard-premium">
        
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
          <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
            <Trophy className="w-4.5 h-4.5 text-amber-500 fill-amber-300 animate-bounce" />
            <span>Nationwide Peer Live Rankings</span>
          </h3>
          <span className="text-[8px] uppercase font-mono font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
            BDFCPS Cash Pool Active
          </span>
        </div>

        {/* Prestigious "Top 3 Doctors" Apex Bento Deck */}
        <div className="grid grid-cols-3 gap-2 pt-1" id="leaderboard-top-3-apex">
          {top3.map((doctorItem, index) => {
            const rank = index + 1;
            const payout = PAYOUT_TIERS[rank];
            const isSelf = doctorItem.isCurrentUser;

            // Visual attributes
            let bgGlow = 'bg-slate-50 border-slate-200/60';
            let crown = '🥇';
            if (rank === 1) {
              bgGlow = 'bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-white border-amber-300 ring-2 ring-amber-500/10 shadow-sm';
              crown = '👑 1st';
            } else if (rank === 2) {
              bgGlow = 'bg-gradient-to-b from-slate-300/15 via-slate-150/5 to-white border-slate-300';
              crown = '🥈 2nd';
            } else if (rank === 3) {
              bgGlow = 'bg-gradient-to-b from-orange-400/10 via-orange-350/5 to-white border-orange-250';
              crown = '🥉 3rd';
            }

            return (
              <div 
                key={`apex-${rank}`}
                className={`rounded-xl p-2.5 border text-center flex flex-col justify-between space-y-1.5 relative ${bgGlow} animate-bouncy-entrance transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md cursor-pointer`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {isSelf && (
                  <span className="absolute top-1 left-1.5 w-1.5 h-1.5 bg-teal-500 rounded-full animate-ping" />
                )}
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-orange-950 block tracking-tight font-sans">
                    {crown}
                  </span>
                  <div className="text-[10px] font-bold text-slate-800 leading-tight truncate px-0.5" title={doctorItem.name}>
                    {doctorItem.name.replace('Dr. ', '')}
                  </div>
                  <span className="text-[8px] text-slate-400 font-semibold block uppercase truncate leading-none">
                    {doctorItem.specialty.replace(' Candidate', '')}
                  </span>
                </div>

                <div className="pt-1.5 border-t border-slate-100 space-y-1">
                  <div className="text-xs font-mono font-black text-slate-850">
                    {doctorItem.score}%
                  </div>
                  <div className="text-[7.5px] font-mono leading-relaxed font-bold bg-slate-900 text-teal-400 px-1 py-0.5 rounded-sm line-clamp-2 uppercase min-h-[22px]">
                    {payout.prize}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Regular list rankings rendered via <FlatList> */}
        <div className="pt-2 border-t border-slate-100">
          <h4 className="text-[9px] uppercase font-mono font-black tracking-widest text-slate-400 mb-2">Competing Physicians</h4>
          <FlatList
            data={remainingList}
            keyExtractor={(item, index) => `competing-doctor-${item.name}-${index}`}
            className="max-h-[160px]"
            contentContainerClassName="divide-y divide-slate-100"
            renderItem={({ item, index }) => {
              const rank = index + 4;
              const isCurrentUser = item.isCurrentUser;
              
              return (
                <div 
                  className={`py-2 px-2 flex items-center justify-between rounded-lg transition-all ${
                    isCurrentUser 
                      ? 'bg-gradient-to-r from-teal-500/10 via-transparent to-transparent border border-teal-500/10' 
                      : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-mono font-black text-slate-400 bg-slate-100">
                      {rank}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-xs truncate font-sans leading-none ${isCurrentUser ? 'text-teal-900 font-extrabold' : 'text-slate-800 font-semibold'}`}>
                        {item.name}
                      </p>
                      <span className="text-[8px] text-slate-400 font-medium">
                        {item.specialty}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div className="flex flex-col items-end">
                      <span className={`text-xs font-mono font-bold ${isCurrentUser ? 'text-teal-600 font-extrabold text-sm' : 'text-slate-700'}`}>
                        {item.score}%
                      </span>
                      <span className="text-[7.5px] font-mono text-slate-400 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5 text-slate-300" /> {item.submissionTime}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </div>

        <p className="text-[8.5px] text-slate-400 text-center flex items-center justify-center gap-1 leading-normal font-medium">
          <Award className="w-3.5 h-3.5 text-teal-600" />
          Scholarship pay outs are distributed automatically to registered doctors at the end of each weekly Grand Mock.
        </p>
      </div>

      {/* Study load performance Chart */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1">
          <TrendingUp className="w-4 h-4 text-emerald-600" /> Practice Time progression
        </h3>

        <div className="w-full text-xs">
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={weeklyLoadData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: '10px', background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Area type="monotone" dataKey="Minutes" stroke="#0d9488" strokeWidth={1.5} fillOpacity={1} fill="url(#colorMinutes)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[9px] text-slate-400 text-center">
          Weekly study minutes logged has increased by <strong>62%</strong> over the streak period.
        </p>
      </div>

    </div>
  );
}
