import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Compass, Target, FileText, MessageSquare, ArrowRight, X, CheckCircle2, AlertCircle, TrendingUp, Sparkles, Zap, ChevronLeft, GraduationCap, Award, Briefcase, Cpu, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

type GuideType = 'career-path' | 'skill-gap' | 'resume-review' | 'interview-coach' | 'resume-architect';

const GUIDES = [
  { id: 'career-path', title: 'Career Path Analyzer', icon: Compass, color: 'text-sky-500', bg: 'bg-sky-500', desc: 'Map out your next 3-5 years based on your goals.' },
  { id: 'skill-gap', title: 'Skill Gap Analysis', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500', desc: 'Identify what you need to learn to land your dream role.' },
  { id: 'resume-review', title: 'Resume Review', icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-500', desc: 'Get actionable feedback on your profile and experience.' },
  { id: 'resume-architect', title: 'Resume Architect', icon: Sparkles, color: 'text-indigo-500', bg: 'bg-indigo-500', desc: 'Step-by-step masterclass to building a high-impact resume.' },
  { id: 'interview-coach', title: 'Interview Prep', icon: MessageSquare, color: 'text-violet-500', bg: 'bg-violet-500', desc: 'Practice frameworks and behavioral questions.' }
];

export const CareerGuide: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [activeGuide, setActiveGuide] = useState<GuideType | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async (type: GuideType) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/career-guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, userProfile: profile, query })
      });
      const json = await res.json();
      setResult(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    if (activeGuide === 'career-path') {
      return (
        <div className="space-y-6 slide-up">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-2xl">
              <p className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400">Current Role</p>
              <p className="font-bold text-sky-950 dark:text-white">{result.currentRole}</p>
            </div>
            <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-2xl">
              <p className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400">Target Role</p>
              <p className="font-bold text-sky-950 dark:text-white">{result.targetRole}</p>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 italic">"{result.insights}"</p>
          
          <div className="space-y-4">
            <h3 className="font-bold text-sky-950 dark:text-white flex items-center gap-2"><TrendingUp size={18} className="text-primary"/> Timeline ({result.timeline})</h3>
            {result.steps?.map((step: any, i: number) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center font-bold text-sky-600 shrink-0">{i+1}</div>
                <div className="clay-card p-5 w-full">
                  <h4 className="font-bold text-sky-950 dark:text-white">{step.phase} <span className="text-xs font-normal text-slate-400 ml-2">{step.duration}</span></h4>
                  <ul className="mt-2 space-y-1">
                    {step.actions?.map((a: string, j: number) => <li key={j} className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500"/> {a}</li>)}
                  </ul>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {step.skills?.map((s: string, j: number) => <span key={j} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-1 rounded-md">{s}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeGuide === 'skill-gap') {
      return (
        <div className="space-y-6 slide-up">
          <div className="flex items-center justify-between p-6 bg-amber-50 dark:bg-amber-900/20 rounded-3xl border border-amber-100 dark:border-amber-900/30">
            <div>
              <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">{result.overallReadiness}%</h3>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-500">Overall Readiness</p>
            </div>
            <p className="text-sm text-amber-800 dark:text-amber-200 max-w-xs text-right font-medium">{result.summary}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-sky-950 dark:text-white flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-500"/> Strong Skills</h3>
              {result.strongSkills?.map((s: any, i: number) => (
                <div key={i} className="clay-card p-4 flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{s.name}</span>
                  <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{width: `${s.level}%`}}/>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-sky-950 dark:text-white flex items-center gap-2"><AlertCircle size={18} className="text-rose-500"/> Gaps to Fill</h3>
              {result.gapSkills?.map((s: any, i: number) => (
                <div key={i} className="clay-card p-4 border-l-4 border-rose-500">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{s.name}</span>
                    <span className="text-[10px] uppercase font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-sm">{s.priority} Priority</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {s.resources?.map((r: string, j: number) => <span key={j} className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-1 rounded-md">{r}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {result.recommendedCourses?.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-700 mt-6">
              <h3 className="font-bold text-sky-950 dark:text-white flex items-center gap-2">
                <Target size={18} className="text-primary"/> Recommended Courses (Real-Time)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.recommendedCourses.map((c: any, i: number) => (
                  <a key={i} href={c.link} target="_blank" rel="noreferrer" className="clay-card p-4 hover:-translate-y-1 transition-transform group block cursor-pointer">
                    <h4 className="font-bold text-sky-950 dark:text-white text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2">{c.title}</h4>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600">{c.platform}</span>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Compass size={12} /> {c.duration}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeGuide === 'resume-review') {
      return (
        <div className="space-y-6 slide-up">
          <div className="flex items-center gap-6 p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
            <div className="w-20 h-20 rounded-full border-4 border-emerald-500 flex items-center justify-center text-2xl font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
              {result.score}
            </div>
            <p className="text-sm text-emerald-800 dark:text-emerald-200 font-medium">{result.summary}</p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-bold text-sky-950 dark:text-white flex items-center gap-2"><Target size={18} className="text-primary"/> Suggested Improvements</h3>
            {result.improvements?.map((imp: any, i: number) => (
              <div key={i} className="clay-card p-5">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-sky-950 dark:text-white">{imp.area}</h4>
                  <span className={cn("text-[10px] font-bold uppercase px-2 py-1 rounded-md", imp.impact === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600')}>{imp.impact} Impact</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-rose-50 dark:bg-rose-900/10 p-3 rounded-xl">
                    <p className="text-[10px] uppercase font-bold text-rose-500 mb-1">Current</p>
                    <p className="text-slate-600 dark:text-slate-300 line-through opacity-70">{imp.current}</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl">
                    <p className="text-[10px] uppercase font-bold text-emerald-500 mb-1">Suggested</p>
                    <p className="text-emerald-700 dark:text-emerald-300 font-medium">{imp.suggested}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeGuide === 'resume-architect') {
      const getStepIcon = (iconName: string) => {
        switch (iconName) {
          case 'Users': return <Users size={20} />;
          case 'FileText': return <FileText size={20} />;
          case 'Briefcase': return <Briefcase size={20} />;
          case 'GraduationCap': return <GraduationCap size={20} />;
          case 'Cpu': return <Cpu size={20} />;
          case 'Award': return <Award size={20} />;
          default: return <Sparkles size={20} />;
        }
      };

      return (
        <div className="space-y-8 slide-up">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 text-center">
            <h3 className="text-xl font-bold text-indigo-950 dark:text-white mb-2">Resume Architect Masterclass</h3>
            <p className="text-sm text-indigo-700 dark:text-indigo-300">Targeting: <span className="font-bold">{result.goal}</span></p>
          </div>

          <div className="relative space-y-10 before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-700">
            {result.steps?.map((step: any, i: number) => (
              <div key={i} className="relative pl-14 group">
                <div className="absolute left-0 top-0 w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center text-primary group-hover:scale-110 transition-transform z-10">
                  {getStepIcon(step.icon)}
                </div>
                <div className="clay-card p-6 sm:p-8">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Step {i + 1}</span>
                  <h4 className="text-xl font-bold text-sky-950 dark:text-white mb-3">{step.title}</h4>
                  
                  <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border-l-4 border-amber-400 mb-6">
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase mb-1 flex items-center gap-2">
                      <Sparkles size={12} /> Expert Tip
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 italic">{step.tip}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-widest">AI Sample for You</p>
                    <div className="text-sm text-slate-700 dark:text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                      {step.example}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
            <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-4 flex items-center gap-2">
              <CheckCircle2 size={20} /> Final Polish Checklist
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.finalTips?.map((tip: string, i: number) => (
                <li key={i} className="text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2 bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    if (activeGuide === 'interview-coach') {
      return (
        <div className="space-y-6 slide-up">
          <div className="bg-violet-50 dark:bg-violet-900/20 p-6 rounded-3xl border border-violet-100 dark:border-violet-900/30">
            <p className="text-xs uppercase font-bold text-violet-600 dark:text-violet-400 mb-2">Your Elevator Pitch</p>
            <p className="font-medium text-violet-900 dark:text-violet-100 italic">"{result.elevatorPitch}"</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-sky-950 dark:text-white">Common Questions</h3>
              {result.commonQuestions?.map((q: any, i: number) => (
                <div key={i} className="clay-card p-4">
                  <p className="font-bold text-sm text-sky-950 dark:text-white mb-2">{q.question}</p>
                  <div className="flex justify-between items-end">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{q.tip}</p>
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-md">{q.framework}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              <div className="clay-card p-5 border-t-4 border-emerald-500">
                <h3 className="font-bold text-emerald-600 mb-3 flex items-center gap-2"><CheckCircle2 size={16}/> Do's</h3>
                <ul className="space-y-2">
                  {result.doList?.map((d: string, i: number) => <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex gap-2"><span className="text-emerald-500 mt-0.5">•</span> {d}</li>)}
                </ul>
              </div>
              <div className="clay-card p-5 border-t-4 border-rose-500">
                <h3 className="font-bold text-rose-600 mb-3 flex items-center gap-2"><AlertCircle size={16}/> Don'ts</h3>
                <ul className="space-y-2">
                  {result.dontList?.map((d: string, i: number) => <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex gap-2"><span className="text-rose-500 mt-0.5">•</span> {d}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <main className="pt-24 pb-32 px-4 sm:px-6 max-w-5xl mx-auto">
      <button onClick={() => navigate('/jobs')} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary transition-colors mb-6">
        <ChevronLeft size={16} /> Back to Jobs
      </button>

      <div className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-headline font-extrabold text-sky-950 dark:text-white flex items-center gap-4">
          <Compass className="text-primary" size={40} /> Career Guide
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 mt-3 max-w-2xl">
          Get personalized AI-driven guidance on your career path, resume, and interview skills based on your profile.
        </p>
      </div>

      {!activeGuide ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 fade-in-up">
          {GUIDES.map(g => (
            <div 
              key={g.id} 
              onClick={() => setActiveGuide(g.id as GuideType)}
              className="clay-card p-6 sm:p-8 rounded-3xl cursor-pointer hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden"
            >
              <div className={cn("absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity", g.bg)} />
              <g.icon className={cn("mb-4", g.color)} size={32} />
              <h2 className="text-2xl font-bold text-sky-950 dark:text-white mb-2">{g.title}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{g.desc}</p>
              <div className="flex items-center gap-2 text-sm font-bold text-primary group-hover:translate-x-2 transition-transform">
                Start Guide <ArrowRight size={16} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="slide-up">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold text-sky-950 dark:text-white flex items-center gap-3">
                {React.createElement(GUIDES.find(g => g.id === activeGuide)?.icon || Compass, { size: 24, className: 'text-primary' })}
                {GUIDES.find(g => g.id === activeGuide)?.title}
              </h2>
              <button onClick={() => { setActiveGuide(null); setResult(null); setQuery(''); }} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            
            <div className="p-6 sm:p-8">
              {!result && !loading && (
                <div className="max-w-xl mx-auto space-y-6">
                  <p className="text-center text-slate-500 dark:text-slate-400">What specific role or goal are you aiming for? (Optional)</p>
                  <input 
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="e.g. Senior Frontend Engineer at a Fintech Startup"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                  />
                  <button onClick={() => handleGenerate(activeGuide)} className="w-full py-4 bg-primary text-white font-bold rounded-2xl clay-button shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                    <Sparkles size={18} /> Generate Guide
                  </button>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
                  <h3 className="text-xl font-bold text-sky-950 dark:text-white mb-2">Analyzing Your Profile...</h3>
                  <p className="text-slate-500 dark:text-slate-400">Aura is consulting industry data for the best insights.</p>
                </div>
              )}

              {result && renderResult()}
              
              {result && (
                <div className="mt-10 flex justify-center">
                  <button onClick={() => { setResult(null); setQuery(''); }} className="text-sm font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-2">
                    <ChevronLeft size={16} /> Start Over
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
