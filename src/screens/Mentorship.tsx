import React, { useState } from 'react';
import { Target, Users, MapPin, Briefcase, Zap, CheckCircle2, Star, Clock, MessageSquare, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  matchScore: number;
  expertise: string[];
  photo: string;
}



export const Mentorship: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'suggestions' | 'active' | 'requests'>('suggestions');
  const [toast, setToast] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<Mentor[]>([]);

  React.useEffect(() => {
    fetch('/api/alumni')
      .then(res => res.json())
      .then(data => {
        // Grab a few realistic alumni, skip first 15 used elsewhere, assign match scores
        const mentors = data.alumni.slice(15, 18).map((a: any, i: number) => ({
          id: a.id,
          name: a.name,
          role: a.role,
          company: a.company,
          location: a.location,
          matchScore: 98 - (i * 7),
          expertise: [a.industry, 'Career Growth'],
          photo: a.photo
        }));
        setAiSuggestions(mentors);
      })
      .catch(console.error);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <main className="pt-28 pb-32 px-6 max-w-6xl mx-auto space-y-10">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-8 duration-500">
          <CheckCircle2 size={22} />
          <span className="font-bold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-sky-950 p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500 rounded-full blur-[80px]" />
        </div>
        <div className="relative z-10 space-y-4 max-w-2xl text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-white tracking-tight">Mentorship Hub</h1>
          <p className="text-sky-200 text-lg">AI-powered networking tailored to your career goals.</p>
        </div>
        <div className="relative z-10 mt-8 md:mt-0 flex flex-col items-center bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 text-white">
          <Target size={32} className="text-amber-400 mb-2" />
          <span className="text-3xl font-extrabold">2</span>
          <span className="text-xs uppercase tracking-widest font-bold text-sky-200 mt-1">Active Mentors</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex space-x-2 border-b border-slate-200">
        {['suggestions', 'active', 'requests'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
               "px-6 py-4 font-bold text-sm transition-all relative capitalize",
               activeTab === tab ? "text-primary" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {tab === 'suggestions' ? 'AI Matches' : tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in duration-500">
        {activeTab === 'suggestions' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Zap size={20} className="text-amber-500" />
              <h2 className="text-xl font-bold text-sky-950">Recommended by Aura AI</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {aiSuggestions.map(mentor => (
                <div key={mentor.id} className="clay-card rounded-3xl p-6 hover:-translate-y-1 transition-transform group flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <img src={mentor.photo} alt={mentor.name} className="w-24 h-24 rounded-full object-cover ring-4 ring-slate-50 group-hover:ring-amber-400/30 transition-all border border-slate-100 shadow-sm" referrerPolicy="no-referrer" />
                    <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-1 rounded-full shadow-sm flex items-center gap-1 border-2 border-white">
                      <span>{mentor.matchScore}%</span> Match
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-sky-950">{mentor.name}</h3>
                  <p className="text-sm font-medium text-slate-500 mb-4">{mentor.role} @ {mentor.company}</p>
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {mentor.expertise.map(e => <span key={e} className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg">{e}</span>)}
                  </div>
                  <button onClick={() => showToast('Mentorship request sent!')} className="w-full mt-auto py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dim transition-colors flex items-center justify-center gap-2">
                    Request Mentorship <ChevronRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'active' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="clay-card rounded-3xl p-6 border-l-4 border-emerald-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <img src="https://picsum.photos/seed/sarah/200/200" alt="Sarah" className="w-16 h-16 rounded-full object-cover" referrerPolicy="no-referrer" />
                <div>
                  <h3 className="font-bold text-sky-950 text-lg">Sarah Chen</h3>
                  <p className="text-sm text-slate-500">Senior Engineer • Tech Mentorship</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded-md flex items-center gap-1 max-w-fit">
                    <CheckCircle2 size={12} /> Active Connection
                  </span>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-4 py-3 bg-surface-container-low text-primary font-bold rounded-xl hover:bg-primary/10 flex items-center justify-center gap-2">
                  <Star size={16} /> Log Session
                </button>
                <button className="flex-1 md:flex-none px-4 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dim flex items-center justify-center gap-2">
                  <MessageSquare size={16} /> Message
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Clock className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-xl font-bold text-sky-950 mb-2">No pending requests</h3>
            <p className="text-slate-500">When you request mentorship, their status will appear here.</p>
          </div>
        )}
      </div>
    </main>
  );
};
