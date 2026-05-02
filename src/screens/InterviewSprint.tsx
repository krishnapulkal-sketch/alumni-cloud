import React, { useState, useEffect } from 'react';
import { Gamepad2, Trophy, Rocket, Brain, Timer, ChevronRight, RotateCcw, AlertCircle, CheckCircle2, Sparkles, Star, Zap, Target } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useGamification } from '../context/GamificationContext';

interface SprintEvaluation {
  overallScore: number;
  verdict: string;
  evaluations: Array<{ score: number; good: string; wrong: string }>;
}

export const InterviewSprint: React.FC = () => {
  const navigate = useNavigate();
  const { addXP, trackAction } = useGamification();
  
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'analyzing' | 'results'>('lobby');
  const [role, setRole] = useState('Software Engineer');
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Array<{ question: string; answer: string }>>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<SprintEvaluation | null>(null);
  const [timer, setTimer] = useState(0);

  // Timer logic for addictive feel
  useEffect(() => {
    let interval: any;
    if (gameState === 'playing') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const startSprint = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/interview-sprint/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      setQuestions(data.questions);
      setAnswers([]);
      setCurrentIdx(0);
      setTimer(0);
      setGameState('playing');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (!currentAnswer.trim()) return;
    
    const newAnswers = [...answers, { question: questions[currentIdx], answer: currentAnswer }];
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      finishSprint(newAnswers);
    }
  };

  const finishSprint = async (finalAnswers: any[]) => {
    setGameState('analyzing');
    setLoading(true);
    try {
      const res = await fetch('/api/interview-sprint/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, answers: finalAnswers })
      });
      const data = await res.json();
      setEvaluation(data.evaluation);
      setGameState('results');
      
      // Gamification rewards
      const score = data.evaluation.overallScore;
      addXP(score, 'Completed Interview Sprint');
      trackAction('interview_completed');
    } catch (e) {
      console.error(e);
      setGameState('lobby');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-32 px-4 sm:px-6 max-w-4xl mx-auto overflow-hidden relative">
      {/* Background Glow Decorations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-violet-500/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        {gameState === 'lobby' && (
          <div className="text-center space-y-10 fade-in-up">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-[0.2em] animate-pulse">
                <Zap size={14} /> New Feature: 5-Question Sprint
              </div>
              <h1 className="text-5xl sm:text-7xl font-headline font-black text-sky-950 dark:text-white tracking-tight leading-none">
                INTERVIEW <span className="text-primary">SPRINT</span>
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                The ultimate gamified interview practice. Answer 5 AI-generated questions under pressure and get a pro-level performance score.
              </p>
            </div>

            <div className="clay-card p-8 sm:p-12 max-w-md mx-auto space-y-6">
              <div className="text-left space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Target Role</label>
                <input 
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Frontend Engineer"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary transition-all text-lg font-bold"
                />
              </div>
              <button 
                onClick={startSprint}
                disabled={loading}
                className="w-full py-5 bg-primary text-white font-black text-xl rounded-[2rem] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
              >
                {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : (
                  <>START GAME <Rocket className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                )}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-10 text-slate-400">
              <div className="flex flex-col items-center gap-2">
                <Timer size={20} /> <span className="text-[10px] font-bold uppercase">Fast Paced</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Brain size={20} /> <span className="text-[10px] font-bold uppercase">AI Questions</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Star size={20} /> <span className="text-[10px] font-bold uppercase">Win XP</span>
              </div>
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="space-y-8 slide-up">
            {/* Progress Header */}
            <div className="flex items-center justify-between gap-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md p-4 rounded-3xl border border-white dark:border-slate-700 sticky top-24 z-20 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                  <Gamepad2 size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Question {currentIdx + 1}/5</p>
                  <p className="font-bold text-sky-950 dark:text-white truncate max-w-[150px] sm:max-w-none">{role}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black uppercase text-slate-400">Timer</p>
                  <p className="font-mono font-black text-primary">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</p>
                </div>
                <div className="h-2 w-24 sm:w-40 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-500" style={{ width: `${((currentIdx + 1) / 5) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Question Card */}
            <div className="clay-card p-8 sm:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles size={120} />
              </div>
              <div className="space-y-8 relative z-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-sky-950 dark:text-white leading-tight">
                  {questions[currentIdx]}
                </h2>
                <textarea 
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your brilliant response here..."
                  className="w-full min-h-[200px] p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border-none focus:ring-4 focus:ring-primary/20 transition-all text-lg leading-relaxed dark:text-white resize-none"
                />
                <button 
                  onClick={nextQuestion}
                  disabled={!currentAnswer.trim()}
                  className="w-full sm:w-auto px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale ml-auto"
                >
                  {currentIdx === 4 ? 'FINISH SPRINT' : 'NEXT QUESTION'} <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 animate-pulse">
            <div className="relative">
              <div className="w-32 h-32 border-8 border-primary/20 border-t-primary rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain size={48} className="text-primary animate-bounce" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-sky-950 dark:text-white">Aura is Grading You...</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium italic">"Analyzing sentiment, structure, and impact..."</p>
            </div>
          </div>
        )}

        {gameState === 'results' && evaluation && (
          <div className="space-y-10 slide-up pb-20">
            {/* Score Card */}
            <div className="clay-card p-10 sm:p-16 text-center space-y-6 relative overflow-hidden bg-gradient-to-br from-white to-sky-50 dark:from-slate-800 dark:to-sky-950/20">
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary via-violet-500 to-emerald-500" />
              <div className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-black uppercase tracking-widest">
                <Trophy size={16} /> SPRINT COMPLETE
              </div>
              <div className="relative inline-block">
                <div className="text-8xl sm:text-9xl font-black text-sky-950 dark:text-white tracking-tighter">
                  {evaluation.overallScore}
                </div>
                <div className="absolute -top-4 -right-8 w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center text-amber-950 font-black rotate-12 shadow-lg border-4 border-white">
                  Score
                </div>
              </div>
              <p className="text-xl font-bold text-slate-600 dark:text-slate-300 max-w-2xl mx-auto italic">
                "{evaluation.verdict}"
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <button 
                  onClick={() => setGameState('lobby')}
                  className="px-8 py-4 bg-white dark:bg-slate-800 text-sky-950 dark:text-white font-bold rounded-2xl border-2 border-slate-100 dark:border-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <RotateCcw size={18} /> PLAY AGAIN
                </button>
                <button 
                  onClick={() => navigate('/boardroom')}
                  className="px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                >
                  <Rocket size={18} /> GO TO BOARDROOM
                </button>
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-sky-950 dark:text-white flex items-center gap-3 px-2">
                <Target size={24} className="text-primary" /> PERFORMANCE ANALYSIS
              </h3>
              <div className="space-y-4">
                {evaluation.evaluations.map((ev, i) => (
                  <div key={i} className="clay-card p-6 sm:p-8 space-y-6 group">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-black text-slate-400">
                          {i + 1}
                        </div>
                        <h4 className="font-bold text-sky-950 dark:text-white text-lg line-clamp-1">{questions[i]}</h4>
                      </div>
                      <div className={cn(
                        "px-4 py-2 rounded-xl font-black text-sm",
                        ev.score >= 80 ? "bg-emerald-100 text-emerald-700" : ev.score >= 50 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                      )}>
                        {ev.score}%
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                        <p className="text-[10px] font-black uppercase text-emerald-600 mb-2 flex items-center gap-1"><CheckCircle2 size={12} /> What went well</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{ev.good}</p>
                      </div>
                      <div className="bg-rose-50 dark:bg-rose-900/10 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/20">
                        <p className="text-[10px] font-black uppercase text-rose-600 mb-2 flex items-center gap-1"><AlertCircle size={12} /> Improvements</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{ev.wrong}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
