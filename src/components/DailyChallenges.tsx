import React, { useState } from 'react';
import { useGamification } from '../context/GamificationContext';
import { Zap, CheckCircle2, X, ChevronRight, Flame, Star } from 'lucide-react';
import { cn } from '../lib/utils';

export const DailyChallenges: React.FC = () => {
  const { dailyChallenges, completeChallenge, streak, xp, level, xpProgress, tier } = useGamification();
  const [isOpen, setIsOpen] = useState(false);
  const completed = dailyChallenges.filter(c => c.completed).length;
  const total = dailyChallenges.length;

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-28 right-4 sm:right-6 z-[60] w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300",
          completed === total
            ? "bg-emerald-500 text-white shadow-emerald-500/30"
            : "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-orange-500/30 pulse-glow"
        )}
      >
        <div className="relative">
          <Zap size={24} />
          {completed < total && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-orange-500 text-[10px] font-black rounded-full flex items-center justify-center shadow">{total - completed}</span>
          )}
        </div>
      </button>

      {/* Panel */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[70]" onClick={() => setIsOpen(false)} />
          <div className="fixed bottom-28 right-4 sm:right-6 z-[80] w-[340px] max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden slide-up">
            {/* Header */}
            <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-[30px]" />
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <h3 className="text-white font-bold text-lg">Daily Challenges</h3>
                  <p className="text-amber-100 text-xs mt-1">{completed}/{total} completed today</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white"><X size={18} /></button>
              </div>
              <div className="relative z-10 mt-3 flex items-center gap-3">
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${(completed / total) * 100}%` }} />
                </div>
                <span className="text-white text-xs font-bold">{Math.round((completed / total) * 100)}%</span>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="flex justify-around px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <div className="text-center">
                <p className="text-xs text-slate-400">Level</p>
                <p className="font-bold text-sky-950">{level}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400">XP</p>
                <p className="font-bold text-sky-950">{xp.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400">Streak</p>
                <p className="font-bold text-sky-950 flex items-center gap-1"><Flame size={12} className="text-orange-500" />{streak}d</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400">Tier</p>
                <p className="font-bold text-amber-600">{tier}</p>
              </div>
            </div>

            {/* Challenges */}
            <div className="max-h-[300px] overflow-y-auto p-4 space-y-3">
              {dailyChallenges.map(c => (
                <div key={c.id} className={cn("flex items-center gap-3 p-3 rounded-2xl transition-all border", c.completed ? "bg-emerald-50 border-emerald-100" : "bg-white border-slate-100 hover:border-primary/20")}>
                  <span className="text-2xl">{c.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-bold text-sm", c.completed ? "text-emerald-600 line-through" : "text-sky-950")}>{c.title}</p>
                    <p className="text-xs text-slate-400 truncate">{c.description}</p>
                  </div>
                  {c.completed ? (
                    <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                  ) : (
                    <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-full shrink-0">+{c.xpReward} XP</span>
                  )}
                </div>
              ))}
            </div>

            {/* XP Progress */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                <span>Level {level}</span>
                <span>Level {level + 1}</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-sky-400 rounded-full transition-all duration-500" style={{ width: `${xpProgress}%` }} />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
