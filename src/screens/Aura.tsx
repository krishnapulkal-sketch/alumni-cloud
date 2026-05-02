import React, { useState, useRef, useEffect } from 'react';
import { Send, Globe, Compass, Target, FileText, Mic, Sparkles, ChevronRight, ArrowRight } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { AuraSphere } from '../components/AuraSphere';
import { useGamification } from '../context/GamificationContext';
import { useAuth } from '../context/AuthContext';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message { role: 'user' | 'model'; text: string; timestamp: Date; isSearch?: boolean; }

const CAREER_TOOLS = [
  { id: 'career-path', icon: <Compass size={18} />, label: 'Career Path', desc: 'AI-powered career trajectory analysis', color: 'from-violet-500 to-purple-600' },
  { id: 'skill-gap', icon: <Target size={18} />, label: 'Skill Gap Finder', desc: 'Identify gaps and growth areas', color: 'from-emerald-500 to-teal-600' },
  { id: 'resume-review', icon: <FileText size={18} />, label: 'Resume Review', desc: 'AI profile & resume analysis', color: 'from-amber-500 to-orange-600' },
  { id: 'interview-coach', icon: <Mic size={18} />, label: 'Interview Coach', desc: 'Prep materials & practice tips', color: 'from-sky-500 to-blue-600' },
];

export const Aura: React.FC = () => {
  const { profile } = useAuth();
  const { addXP, completeChallenge, trackAction } = useGamification();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! I'm **Aura**, your AI career mentor. I can help you with:\n\n🧭 **Career Path Analysis** — Map your trajectory\n🎯 **Skill Gap Detection** — Find what to learn next\n📄 **Resume Review** — Optimize your profile\n🎤 **Interview Prep** — Practice with AI coaching\n\nUse the tools below or just ask me anything!", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [careerData, setCareerData] = useState<any>(null);
  const [careerLoading, setCareerLoading] = useState(false);
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, careerData]);
  useEffect(() => { trackAction('page:/aura'); }, []);

  const handleSend = async (isSearchRequest = false) => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', text: input, timestamp: new Date(), isSearch: isSearchRequest };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    addXP(10, 'Asked Aura AI');
    completeChallenge('ask-aura');

    try {
      let responseText = "";
      if (isSearchRequest) {
        const result = await ai.models.generateContent({
          model: 'gemini-2.0-flash', contents: input,
          config: { systemInstruction: "You are a career search assistant. Use Google Search to find real-time information about companies, hiring trends, and alumni opportunities.", tools: [{ googleSearch: {} }] }
        });
        responseText = result.text || "I couldn't find any real-time information for that query.";
      } else {
        const response = await fetch('/api/aura', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: messages.concat(userMsg).filter(m => m.role !== 'system' as any).map(m => ({ role: m.role === 'model' ? 'assistant' : m.role, content: m.text })) })
        });
        const data = await response.json();
        responseText = data.text;
      }
      setMessages(prev => [...prev, { role: 'model', text: responseText || "I'm sorry, I couldn't process that.", timestamp: new Date() }]);
    } catch (error) { console.error('Aura Error:', error); }
    finally { setIsTyping(false); }
  };

  const handleCareerTool = async (toolId: string) => {
    setActiveToolId(toolId);
    setCareerLoading(true);
    setCareerData(null);
    addXP(25, `Used career tool: ${toolId}`);
    try {
      const res = await fetch('/api/career-guidance', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: toolId,
          userProfile: { name: profile?.displayName, expertise: profile?.expertise, location: profile?.location, bio: profile?.bio },
          query: `Analyze for ${profile?.displayName || 'an alumni'} with expertise in ${profile?.expertise?.join(', ') || 'technology'}`
        })
      });
      const data = await res.json();
      setCareerData(data.data);
    } catch (e) { console.error(e); }
    finally { setCareerLoading(false); }
  };

  return (
    <main className="pt-24 pb-32 px-4 max-w-5xl mx-auto min-h-screen flex flex-col items-center">
      {/* Aura Header */}
      <div className="relative w-full flex flex-col items-center justify-center mb-8 py-8 sm:py-12 h-[250px] sm:h-[350px]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-sky-200/20 dark:bg-sky-900/20 blur-[120px] rounded-full pointer-events-none" />
        <AuraSphere />
        <div className="absolute bottom-0 text-center max-w-md z-10 pointer-events-none bg-white/40 dark:bg-slate-900/40 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/50 dark:border-slate-700/50 shadow-xl">
          <h2 className="text-lg sm:text-xl font-bold text-sky-950 dark:text-white mb-1">AI Career Mentor</h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Powered by Mistral & Gemini • Earn XP</p>
        </div>
      </div>

      {/* Career Tools Grid */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {CAREER_TOOLS.map(tool => (
          <button key={tool.id} onClick={() => handleCareerTool(tool.id)} className={cn("p-4 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1 group border", activeToolId === tool.id ? "ring-2 ring-primary border-primary/20 bg-primary/5 dark:bg-primary/10" : "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-lg")}>
            <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform shadow-md", tool.color)}>{tool.icon}</div>
            <p className="font-bold text-sm text-sky-950 dark:text-white">{tool.label}</p>
            <p className="text-[11px] text-slate-400 mt-1">{tool.desc}</p>
          </button>
        ))}
      </div>

      {/* Career Tool Results */}
      {(careerLoading || careerData) && (
        <div className="w-full mb-8 clay-card p-6 sm:p-8 rounded-2xl slide-up">
          {careerLoading ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-bold text-slate-400">Analyzing your career profile...</p>
            </div>
          ) : careerData && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles size={20} className="text-amber-500" />
                <h3 className="text-xl font-bold text-sky-950 dark:text-white">{CAREER_TOOLS.find(t => t.id === activeToolId)?.label} Results</h3>
              </div>

              {/* Career Path View */}
              {activeToolId === 'career-path' && careerData.steps && (
                <div className="space-y-4">
                  {careerData.salary && (
                    <div className="flex gap-4 flex-wrap">
                      {[{ l: 'Current', v: careerData.salary.current }, { l: 'Target', v: careerData.salary.target }, { l: 'Growth', v: careerData.salary.growth }].map(s => (
                        <div key={s.l} className="bg-slate-50 dark:bg-slate-700 rounded-xl px-4 py-3 flex-1 min-w-[100px]">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.l}</p>
                          <p className="text-lg font-bold text-sky-950 dark:text-white">{s.v || '—'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-3">
                    {careerData.steps?.map((step: any, i: number) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">{i+1}</div>
                          {i < careerData.steps.length - 1 && <div className="w-0.5 h-full bg-primary/20 mt-1" />}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-bold text-sky-950 dark:text-white">{step.phase}</p>
                          <p className="text-xs text-slate-400 mb-2">{step.duration}</p>
                          <div className="flex flex-wrap gap-1.5">{step.skills?.map((s: string) => <span key={s} className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-lg">{s}</span>)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {careerData.insights && <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-700 p-4 rounded-xl">{careerData.insights}</p>}
                </div>
              )}

              {/* Skill Gap View */}
              {activeToolId === 'skill-gap' && (
                <div className="space-y-4">
                  {careerData.overallReadiness != null && (
                    <div className="text-center">
                      <p className="text-4xl font-extrabold text-sky-950 dark:text-white">{careerData.overallReadiness}%</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Overall Readiness</p>
                    </div>
                  )}
                  {careerData.strongSkills?.map((s: any) => (
                    <div key={s.name} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-sky-950 dark:text-white w-24 truncate">{s.name}</span>
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.level}%` }} /></div>
                      <span className="text-xs font-bold text-emerald-500">{s.level}%</span>
                    </div>
                  ))}
                  {careerData.gapSkills?.map((s: any) => (
                    <div key={s.name} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-sky-950 dark:text-white w-24 truncate">{s.name}</span>
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-amber-500 rounded-full" style={{ width: `${s.level}%` }} /></div>
                      <span className="text-xs font-bold text-amber-500">{s.level}%</span>
                    </div>
                  ))}
                  {careerData.summary && <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-700 p-4 rounded-xl">{careerData.summary}</p>}
                </div>
              )}

              {/* Resume Review */}
              {activeToolId === 'resume-review' && (
                <div className="space-y-4">
                  {careerData.score != null && (
                    <div className="text-center">
                      <p className="text-4xl font-extrabold text-sky-950 dark:text-white">{careerData.score}/100</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Profile Score</p>
                    </div>
                  )}
                  {careerData.improvements?.map((imp: any, i: number) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 border-l-4 border-amber-400">
                      <p className="font-bold text-sm text-sky-950 dark:text-white">{imp.area}</p>
                      <p className="text-xs text-slate-500 mt-1">{imp.suggested}</p>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full mt-2 inline-block", imp.impact === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600')}>{imp.impact} impact</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Interview Coach */}
              {activeToolId === 'interview-coach' && (
                <div className="space-y-4">
                  {careerData.commonQuestions?.map((q: any, i: number) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                      <p className="font-bold text-sm text-sky-950 dark:text-white mb-1">Q: {q.question}</p>
                      <p className="text-xs text-slate-500">💡 {q.tip}</p>
                      {q.framework && <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-2 inline-block">{q.framework}</span>}
                    </div>
                  ))}
                  {careerData.elevatorPitch && (
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                      <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Elevator Pitch Template</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{careerData.elevatorPitch}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Chat Messages */}
      <div className="w-full space-y-6 sm:space-y-8 mb-12">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex flex-col", msg.role === 'user' ? "items-end self-end max-w-[90%] sm:max-w-[70%]" : "items-start max-w-[90%] sm:max-w-[70%]")}>
            <div className={cn("clay-card p-4 sm:p-6 leading-relaxed", msg.role === 'user' ? "bg-primary text-white rounded-tl-xl rounded-bl-xl rounded-br-xl shadow-lg" : "bg-surface-container-lowest dark:bg-slate-800 rounded-tr-xl rounded-br-xl rounded-bl-xl text-on-surface-variant")}>
              <div className="markdown-body"><ReactMarkdown>{msg.text}</ReactMarkdown></div>
            </div>
            <span className={cn("mt-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase", msg.role === 'user' ? "mr-4" : "ml-4")}>
              {msg.role === 'user' ? 'You' : 'Aura'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isTyping && (
          <div className="flex flex-col items-start max-w-[85%]">
            <div className="clay-card bg-surface-container-lowest dark:bg-slate-800 rounded-tr-xl rounded-br-xl rounded-bl-xl p-6 flex gap-1">
              <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-20 sm:bottom-28 left-0 right-0 z-40 px-4 sm:px-6 pointer-events-none">
        <div className="max-w-2xl mx-auto w-full pointer-events-auto">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl p-2 rounded-full shadow-xl flex items-center gap-2 border border-white/20 dark:border-slate-700/50">
            <button onClick={() => handleSend(true)} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-slate-400 hover:text-primary transition-colors group" title="Search Web">
              <Globe size={20} className="group-hover:scale-110 transition-transform" />
            </button>
            <input className="flex-1 bg-surface-container-highest dark:bg-slate-800 recessed-input border-none focus:ring-0 rounded-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm text-on-surface dark:text-white placeholder:text-slate-400" placeholder="Ask anything or use career tools..." type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend(false)} />
            <button onClick={() => handleSend(false)} className="w-10 h-10 sm:w-12 sm:h-12 bg-primary text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};
