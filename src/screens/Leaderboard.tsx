import React, { useState, useEffect } from 'react';
import { useGamification } from '../context/GamificationContext';
import { Trophy, Flame, Medal, Crown, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const TIER_COLORS: Record<string, string> = {
  Bronze: 'from-amber-700 to-amber-500', Silver: 'from-slate-400 to-slate-300',
  Gold: 'from-amber-400 to-yellow-300', Platinum: 'from-slate-300 to-white',
  Diamond: 'from-cyan-300 to-blue-200',
};

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Elena Vance', xp: 28450, tier: 'Diamond', photo: 'https://i.pravatar.cc/150?u=elena', streak: 42 },
  { rank: 2, name: 'Julian Thorne', xp: 22100, tier: 'Platinum', photo: 'https://i.pravatar.cc/150?u=julian', streak: 31 },
  { rank: 3, name: 'Sarah Chen', xp: 18750, tier: 'Platinum', photo: 'https://i.pravatar.cc/150?u=sarah2', streak: 28 },
  { rank: 4, name: 'Marcus Webb', xp: 15200, tier: 'Gold', photo: 'https://i.pravatar.cc/150?u=marcus', streak: 19 },
  { rank: 5, name: 'Aria Dubois', xp: 12800, tier: 'Gold', photo: 'https://i.pravatar.cc/150?u=aria', streak: 15 },
  { rank: 6, name: 'David Kim', xp: 9400, tier: 'Gold', photo: 'https://i.pravatar.cc/150?u=david2', streak: 12 },
  { rank: 7, name: 'Priya Sharma', xp: 7200, tier: 'Silver', photo: 'https://i.pravatar.cc/150?u=priya', streak: 8 },
  { rank: 8, name: 'James Wilson', xp: 5100, tier: 'Silver', photo: 'https://i.pravatar.cc/150?u=james', streak: 5 },
];

export const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const { xp, tier, streak } = useGamification();
  const [activeTab, setActiveTab] = useState<'weekly' | 'alltime'>('alltime');
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => { setTimeout(() => setAnimateIn(true), 100); }, []);

  const fullBoard = [...MOCK_LEADERBOARD, { rank: 0, name: 'You', xp, tier, photo: '', streak }]
    .sort((a, b) => b.xp - a.xp)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  return (
    <main className="pt-24 pb-32 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-8 sm:p-12 mb-8 shadow-2xl">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full blur-[60px]" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white"><ArrowLeft size={20} /></button>
              <Trophy size={32} className="text-yellow-200" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-headline font-extrabold text-white">Leaderboard</h1>
            <p className="text-amber-100 mt-1">Compete, earn XP, climb the ranks</p>
          </div>
          <div className="text-center bg-white/10 backdrop-blur-xl rounded-2xl px-8 py-5 border border-white/20">
            <p className="text-amber-100 text-xs font-bold uppercase tracking-widest mb-1">Your Rank</p>
            <p className="text-5xl font-extrabold text-white">#{fullBoard.find(e => e.name === 'You')?.rank || '?'}</p>
            <div className="flex items-center gap-2 mt-2 text-amber-200 text-sm font-bold"><Flame size={14} /> {streak}d streak</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(['alltime', 'weekly'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-6 py-2.5 rounded-xl text-sm font-bold transition-all", activeTab === tab ? "bg-sky-950 text-white shadow-md" : "bg-white text-slate-500 border border-slate-200")}>{tab === 'alltime' ? 'All Time' : 'This Week'}</button>
        ))}
      </div>

      <div className="flex items-end justify-center gap-3 mb-8">
        {[1, 0, 2].map(pi => {
          const e = fullBoard[pi]; if (!e) return null;
          const isFirst = pi === 0;
          return (
            <div key={e.rank} className={cn("flex flex-col items-center transition-all duration-500", animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8", isFirst ? "order-2" : pi === 1 ? "order-1" : "order-3")} style={{ transitionDelay: `${pi * 150}ms` }}>
              <div className={cn("relative mb-3", isFirst ? "w-20 h-20" : "w-16 h-16")}>
                <img src={e.photo || 'https://i.pravatar.cc/150?u=you'} alt={e.name} className={cn("w-full h-full rounded-full object-cover ring-4", isFirst ? "ring-amber-400 shadow-lg shadow-amber-400/30" : "ring-slate-300")} referrerPolicy="no-referrer" />
                <div className={cn("absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-black text-white", isFirst ? "bg-amber-400" : "bg-slate-400")}>#{e.rank}</div>
              </div>
              <p className={cn("font-bold text-sky-950 text-center", isFirst ? "text-base" : "text-sm")}>{e.name}</p>
              <p className="text-xs text-slate-400">{e.xp.toLocaleString()} XP</p>
              <div className={cn("mt-2 rounded-t-2xl w-full", isFirst ? "h-28 bg-gradient-to-t from-amber-100 to-amber-50 min-w-[100px]" : "h-20 bg-gradient-to-t from-slate-100 to-slate-50 min-w-[90px]")} />
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        {fullBoard.slice(3).map((e, i) => {
          const isYou = e.name === 'You';
          return (
            <div key={e.rank} className={cn("clay-card p-4 rounded-2xl flex items-center gap-4 transition-all duration-500", isYou && "ring-2 ring-primary/30 bg-primary/5", animateIn ? "opacity-100" : "opacity-0")} style={{ transitionDelay: `${(i+3)*80}ms` }}>
              <span className={cn("text-lg font-black w-8 text-center", isYou ? "text-primary" : "text-slate-300")}>{e.rank}</span>
              <img src={e.photo || 'https://i.pravatar.cc/150?u=you'} alt={e.name} className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
              <div className="flex-1 min-w-0">
                <p className={cn("font-bold text-sky-950 truncate", isYou && "text-primary")}>{e.name}{isYou && ' (You)'}</p>
                <span className={cn("px-2 py-0.5 rounded-full font-bold text-[10px] bg-gradient-to-r text-white inline-block", TIER_COLORS[e.tier] || TIER_COLORS.Bronze)}>{e.tier}</span>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-sky-950 text-lg">{e.xp.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">XP</p>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};
