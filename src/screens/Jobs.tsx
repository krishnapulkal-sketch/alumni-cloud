import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Building2, MapPin, DollarSign, Search, Plus, ExternalLink, BookmarkPlus, ArrowRight, UserPlus, CheckCircle2, Mic, Bookmark, Star, Sparkles, Heart, Target, X, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface Job { id: string; title: string; company: string; location: string; type: string; salary: string; description: string; posterId?: string; posterName: string; tags: string[]; createdAt?: any; applyUrl?: string; matchScore?: number; matchReasons?: string[]; }

export const Jobs: React.FC = () => {
  const { user, profile } = useAuth();
  const { addXP, completeChallenge, trackAction } = useGamification();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [forYouJobs, setForYouJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [activeTab, setActiveTab] = useState<'all' | 'foryou' | 'saved'>('all');
  const [savedJobs, setSavedJobs] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('saved_jobs') || '[]'); } catch { return []; } });
  const [showPostJob, setShowPostJob] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ title: '', company: '', location: '', type: 'Full-time', salary: '', description: '', tags: '' });

  const [selectedJobForRoadmap, setSelectedJobForRoadmap] = useState<Job | null>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapData, setRoadmapData] = useState<any>(null);

  useEffect(() => { trackAction('page:/jobs'); }, []);

  const fetchJobs = async (queryStr = '') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: queryStr }) });
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch { setJobs([]); }
    finally { setIsLoading(false); }
  };

  const fetchForYou = async () => {
    try {
      const skills = profile?.expertise?.join(', ') || 'React, Node.js, Design';
      const res = await fetch('/api/job-match', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userSkills: skills, userLocation: profile?.location || 'Remote', userExperience: '3 years' }) });
      const data = await res.json();
      setForYouJobs(data.jobs?.length > 0 ? data.jobs : []);
    } catch { setForYouJobs([]); }
  };

  useEffect(() => { fetchJobs('tech jobs or startups'); fetchForYou(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const toggleSave = (jobId: string) => {
    const next = savedJobs.includes(jobId) ? savedJobs.filter(id => id !== jobId) : [...savedJobs, jobId];
    setSavedJobs(next);
    localStorage.setItem('saved_jobs', JSON.stringify(next));
    if (!savedJobs.includes(jobId)) { addXP(5, 'Saved a job'); showToast('💾 Job saved! +5 XP'); }
  };

  const handleApply = (job: Job) => {
    if (job.applyUrl) window.open(job.applyUrl.startsWith('http') ? job.applyUrl : `https://${job.applyUrl}`, '_blank');
    addXP(15, 'Applied to a job'); trackAction('job_applied'); showToast('🎉 Application tracked! +15 XP');
  };

  const handlePostJob = async () => {
    if (!form.title || !form.company || !user?.uid) return;
    try {
      await addDoc(collection(db, 'jobs'), { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), posterId: user.uid, posterName: profile?.displayName || 'Alumni', createdAt: serverTimestamp() });
      showToast('🎉 Job posted! +50 XP'); addXP(50, 'Posted a job'); setShowPostJob(false);
      setForm({ title: '', company: '', location: '', type: 'Full-time', salary: '', description: '', tags: '' });
    } catch { showToast('Error posting job'); }
  };

  const fetchRoadmap = async (job: Job) => {
    setSelectedJobForRoadmap(job);
    setRoadmapLoading(true);
    setRoadmapData(null);
    try {
      const res = await fetch('/api/job-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle: job.title, company: job.company, userProfile: profile })
      });
      const data = await res.json();
      setRoadmapData(data.roadmap);
    } catch {
      showToast('Error generating roadmap');
    } finally {
      setRoadmapLoading(false);
    }
  };

  const allJobs = jobs.filter((j, i, arr) => arr.findIndex(a => a.title === j.title && a.company === j.company) === i);
  const displayJobs = activeTab === 'foryou' ? forYouJobs : activeTab === 'saved' ? allJobs.filter(j => savedJobs.includes(j.id)) : allJobs;
  const filteredJobs = displayJobs.filter(j => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'All' || j.type === filterType;
    return matchSearch && matchType;
  });

  const getMatchLabel = (score?: number) => {
    if (!score) return null;
    if (score >= 85) return { text: 'Strong Match', color: 'bg-emerald-100 text-emerald-700' };
    if (score >= 65) return { text: 'Good Match', color: 'bg-sky-100 text-sky-700' };
    return { text: 'Explore', color: 'bg-slate-100 text-slate-600' };
  };

  return (
    <main className="pt-24 sm:pt-28 pb-28 sm:pb-32 px-4 sm:px-6 max-w-6xl mx-auto">
      {toast && <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-6 sm:px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 slide-up"><CheckCircle2 size={22} /><span className="font-bold text-sm">{toast}</span></div>}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-10 gap-4 sm:gap-6">
        <div>
          <h1 className="text-3xl sm:text-5xl font-headline font-extrabold text-sky-950 dark:text-white tracking-tight flex items-center gap-3 sm:gap-4">
            Job Board {isLoading && <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />}
          </h1>
          <p className="text-base sm:text-xl text-slate-500 dark:text-slate-400 mt-2">AI-curated career opportunities in real-time.</p>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <form onSubmit={e => { e.preventDefault(); fetchJobs(search); }} className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3 flex-1 sm:flex-none">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input className="bg-transparent border-none focus:ring-0 text-sm w-full sm:w-48 text-slate-900 dark:text-white" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </form>
          <button onClick={() => setShowPostJob(true)} className="bg-primary text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-bold clay-button flex items-center gap-2 shadow-lg shadow-primary/20 whitespace-nowrap text-sm">
            <Plus size={16} /> <span className="hidden sm:inline">Post a Job</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
        {([{ id: 'all', label: 'All Jobs' }, { id: 'foryou', label: '✨ For You' }, { id: 'saved', label: '💾 Saved' }] as const).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap", activeTab === tab.id ? "bg-sky-950 text-white shadow-md" : "bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700")}>{tab.label}</button>
        ))}
      </div>

      {/* Type Filters */}
      <div className="flex gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2">
        {['All', 'Full-time', 'Contract', 'Internship'].map(t => (
          <button key={t} onClick={() => setFilterType(t)} className={cn("px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap", filterType === t ? "bg-primary/10 text-primary" : "bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700")}>{t}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
        <div className="md:col-span-8 space-y-4 sm:space-y-6">
          {filteredJobs.map((job, i) => {
            const match = getMatchLabel(job.matchScore);
            const isSaved = savedJobs.includes(job.id);
            return (
              <div key={job.id || i} className="clay-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl transition-transform duration-300 hover:shadow-xl fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-sky-100 dark:from-primary/30 dark:to-sky-900 flex items-center justify-center shrink-0 shadow-inner"><Building2 className="text-primary" size={22} /></div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg sm:text-2xl font-bold text-sky-950 dark:text-white">{job.title}</h3>
                        {match && <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold", match.color)}>{match.text}</span>}
                        {job.matchScore && <span className="text-[10px] font-bold text-primary">{job.matchScore}%</span>}
                      </div>
                      <p className="text-primary font-bold text-sm">{job.company}</p>
                      <div className="flex flex-wrap gap-2 sm:gap-4 mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-500 font-medium">
                        <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                        <span className="flex items-center gap-1"><Briefcase size={12} /> {job.type}</span>
                        {job.salary && <span className="flex items-center gap-1"><DollarSign size={12} /> {job.salary}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => toggleSave(job.id)} className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center transition-colors", isSaved ? "bg-primary/10 border-primary/20 text-primary" : "border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700")}>
                      {isSaved ? <Bookmark size={18} className="fill-primary" /> : <BookmarkPlus size={18} />}
                    </button>
                    <button onClick={() => fetchRoadmap(job)} className="px-4 h-10 sm:h-12 bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 font-bold rounded-xl flex items-center gap-2 hover:bg-sky-200 dark:hover:bg-sky-900/50 whitespace-nowrap text-sm">
                      Roadmap
                    </button>
                    <button onClick={() => handleApply(job)} className="px-4 sm:px-6 h-10 sm:h-12 bg-primary text-white font-bold rounded-xl flex items-center gap-2 hover:opacity-90 whitespace-nowrap text-sm">Apply <ExternalLink size={14} /></button>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-3 sm:mb-4 line-clamp-2 text-sm">{job.description}</p>
                {job.matchReasons && <div className="flex flex-wrap gap-1.5 mb-3">{job.matchReasons.map((r, j) => <span key={j} className="text-[10px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-lg font-medium">✓ {r}</span>)}</div>}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-700 gap-2">
                  <div className="flex gap-2 flex-wrap">{job.tags?.slice(0, 3).map(tag => <span key={tag} className="px-2 sm:px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg">{tag}</span>)}</div>
                  <button onClick={() => { showToast('Referral requested!'); addXP(10, 'Requested referral'); }} className="text-xs font-bold text-sky-600 bg-sky-50 dark:bg-sky-900/30 px-3 py-1.5 rounded-lg flex items-center gap-1"><UserPlus size={12} /> Ask Referral</button>
                </div>
              </div>
            );
          })}
          {filteredJobs.length === 0 && !isLoading && (
            <div className="text-center py-16 sm:py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
              <Briefcase size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-sky-950 dark:text-white mb-2">{activeTab === 'saved' ? 'No saved jobs yet' : 'No jobs found'}</h3>
              <p className="text-slate-500">{activeTab === 'saved' ? 'Save jobs you like by clicking the bookmark icon' : 'Try adjusting your search criteria'}</p>
            </div>
          )}
        </div>

        <div className="md:col-span-4 space-y-4 sm:space-y-6">
          <div className="bg-sky-950 text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary blur-[80px] rounded-full opacity-50 pointer-events-none" />
            <Sparkles size={24} className="mb-3 relative z-10 text-sky-200" />
            <h2 className="text-xl sm:text-2xl font-headline font-bold mb-3 relative z-10">AI Career Coach</h2>
            <p className="text-sky-200 text-sm leading-relaxed mb-4 sm:mb-6 relative z-10">Ask Aura to review your profile and suggest improvements.</p>
            <button onClick={() => navigate('/aura')} className="w-full bg-white text-sky-950 font-bold py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 relative z-10 hover:scale-105 transition-transform shadow-lg text-sm">Analyze Profile <ArrowRight size={16} /></button>
          </div>
          <div className="bg-gradient-to-br from-violet-600 to-sky-700 text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden">
            <Mic size={24} className="mb-3 relative z-10 text-violet-200" />
            <h2 className="text-xl sm:text-2xl font-headline font-bold mb-3 relative z-10">AI Boardroom</h2>
            <p className="text-violet-100 text-sm leading-relaxed mb-4 sm:mb-6 relative z-10">Practice interviews with 4 AI executives.</p>
            <button onClick={() => navigate('/boardroom')} className="w-full bg-white text-violet-900 font-bold py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 relative z-10 hover:scale-105 transition-transform shadow-lg text-sm">Enter Boardroom <ArrowRight size={16} /></button>
          </div>
          <div className="clay-card p-5 sm:p-6 rounded-3xl">
            <h3 className="font-bold text-sky-950 dark:text-white mb-4">Top Hiring</h3>
            <div className="space-y-3">
              {['Stellar Systems', 'Lumina', 'Quantum Leap', 'Nexus Tech'].map(c => (
                <div key={c} className="flex items-center justify-between">
                  <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-primary font-bold text-xs">{c[0]}</div><span className="font-medium text-sm dark:text-white">{c}</span></div>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">Hiring</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Post Job Modal */}
      {showPostJob && (
        <div className="fixed inset-0 z-[100] glass-panel flex items-center justify-center p-4 sm:p-6" onClick={() => setShowPostJob(false)}>
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl sm:text-2xl font-headline font-bold text-sky-950 dark:text-white mb-6">Post an Opportunity</h2>
            <div className="space-y-3 sm:space-y-4">
              <input className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-900 dark:text-white" placeholder="Job Title *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-900 dark:text-white" placeholder="Company *" value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
                <input className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-900 dark:text-white" placeholder="Location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
              </div>
              <textarea className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm font-medium h-20 resize-none text-slate-900 dark:text-white" placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              <button onClick={handlePostJob} disabled={!form.title || !form.company} className="w-full py-3 sm:py-4 bg-primary text-white font-bold rounded-xl clay-button disabled:opacity-50 text-sm">Publish Opportunity</button>
            </div>
          </div>
        </div>
      )}

      {/* Job Roadmap Modal */}
      {selectedJobForRoadmap && (
        <div className="fixed inset-0 z-[100] glass-panel flex items-center justify-center p-4 sm:p-6" onClick={() => setSelectedJobForRoadmap(null)}>
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-headline font-bold text-sky-950 dark:text-white flex items-center gap-2">
                  <Sparkles className="text-primary" size={24} /> Application Roadmap
                </h2>
                <p className="text-sm text-slate-500">{selectedJobForRoadmap.title} @ {selectedJobForRoadmap.company}</p>
              </div>
              <button onClick={() => setSelectedJobForRoadmap(null)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
                 <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {roadmapLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                   <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                   <p className="font-bold text-sky-950 dark:text-white">Aura is generating your custom roadmap...</p>
                   <p className="text-sm text-slate-500">Analyzing your skills vs job requirements.</p>
                </div>
              ) : roadmapData ? (
                <div className="space-y-8">
                  {roadmapData.prep && (
                    <div>
                      <h3 className="font-bold text-lg text-sky-950 dark:text-white mb-3 flex items-center gap-2"><Target className="text-emerald-500" size={18} /> Preparation</h3>
                      <ul className="space-y-2">
                        {roadmapData.prep.map((s: string, i: number) => (
                          <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
                             <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" /> <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {roadmapData.resume && (
                    <div>
                      <h3 className="font-bold text-lg text-sky-950 dark:text-white mb-3 flex items-center gap-2"><Briefcase className="text-amber-500" size={18} /> Resume Tailoring</h3>
                      <ul className="space-y-2">
                        {roadmapData.resume.map((s: string, i: number) => (
                          <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
                             <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" /> <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {roadmapData.interview && (
                    <div>
                      <h3 className="font-bold text-lg text-sky-950 dark:text-white mb-3 flex items-center gap-2"><MessageSquare className="text-violet-500" size={18} /> Interview Focus</h3>
                      <ul className="space-y-2">
                        {roadmapData.interview.map((s: string, i: number) => (
                          <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
                             <CheckCircle2 size={16} className="text-violet-500 shrink-0 mt-0.5" /> <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                 <p className="text-center text-slate-500">Could not load roadmap.</p>
              )}
            </div>
            
            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-700">
               <button onClick={() => { setSelectedJobForRoadmap(null); handleApply(selectedJobForRoadmap); }} className="w-full py-4 bg-primary text-white font-bold rounded-xl clay-button shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                 Proceed to Apply <ExternalLink size={18} />
               </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
