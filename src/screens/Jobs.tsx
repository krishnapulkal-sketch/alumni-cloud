import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Building2, MapPin, DollarSign, Search, Plus, ExternalLink, BookmarkPlus, ArrowRight, UserPlus, CheckCircle2, Mic } from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  posterId?: string;
  posterName: string;
  tags: string[];
  createdAt?: any;
  applyUrl?: string;
}

const FALLBACK_JOBS: Job[] = [
  { title: "Senior Product Designer", company: "Stellar Systems", location: "Berlin, Germany (Hybrid)", type: "Full-time", salary: "$120k - $150k", description: "Looking for an alumni to lead our new UX lab focused on aerospace interfaces.", posterId: "demo-julian", posterName: "Julian Thorne", tags: ["UX", "Figma", "Aerospace"] },
  { title: "Frontend Engineer (React)", company: "Lumina", location: "San Francisco, CA (Remote)", type: "Full-time", salary: "$130k - $160k", description: "Join our decentralized grid team. React & Web3 experience preferred.", posterId: "demo-elena", posterName: "Elena Vance", tags: ["React", "Web3", "Frontend"] },
  { title: "Quantum Research Lead", company: "Quantum Leap", location: "Toronto, Canada", type: "Full-time", salary: "$180k - $220k", description: "Lead applied quantum algorithm development.", posterId: "demo-sarah", posterName: "Sarah Chen", tags: ["Quantum", "Research", "Physics"] }
];

export const Jobs: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [showPostJob, setShowPostJob] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({ title: '', company: '', location: '', type: 'Full-time', salary: '', description: '', tags: '' });

  const fetchJobs = async (queryStr = '') => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryStr })
      });
      const data = await response.json();
      if (data.jobs && data.jobs.length > 0) {
        setJobs(data.jobs);
      } else {
        setJobs(FALLBACK_JOBS as Job[]);
      }
    } catch (e) {
      console.error(e);
      setJobs(FALLBACK_JOBS as Job[]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs('tech jobs or startups');
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handlePostJob = async () => {
    if (!form.title || !form.company || !user?.uid) return;
    try {
      await addDoc(collection(db, 'jobs'), {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        posterId: user.uid,
        posterName: profile?.displayName || 'Alumni',
        createdAt: serverTimestamp()
      });
      showToast('🎉 Job posted successfully!');
      setShowPostJob(false);
      setForm({ title: '', company: '', location: '', type: 'Full-time', salary: '', description: '', tags: '' });
    } catch {
      showToast('Error posting job');
    }
  };

  const filteredJobs = jobs.filter(j => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'All' || j.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <main className="pt-28 pb-32 px-6 max-w-6xl mx-auto">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-8 duration-500">
          <CheckCircle2 size={22} />
          <span className="font-bold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-5xl font-headline font-extrabold text-sky-950 tracking-tight flex items-center gap-4">
            Job Board {isLoading && <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />}
          </h1>
          <p className="text-xl text-slate-500 mt-2">Exclusive AI-curated career opportunities in real-time.</p>
        </div>
        <div className="flex gap-3">
          <form 
            onSubmit={e => { e.preventDefault(); fetchJobs(search); }}
            className="flex items-center gap-3 bg-white border-2 border-slate-200 rounded-2xl px-5 py-3"
          >
            <Search size={16} className="text-slate-400" />
            <input className="bg-transparent border-none focus:ring-0 text-sm w-48" placeholder="Search parameters..." value={search} onChange={e => setSearch(e.target.value)} />
            <button type="submit" disabled={isLoading} className="text-xs font-bold text-primary hover:text-primary-dim">Find</button>
          </form>
          <button onClick={() => setShowPostJob(true)} className="bg-primary text-white px-6 py-3 rounded-2xl font-bold clay-button flex items-center gap-2 shadow-lg shadow-primary/20">
            <Plus size={18} /> Post a Job
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
        {['All', 'Full-time', 'Contract', 'Internship'].map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={cn("px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap", filterType === t ? "bg-sky-950 text-white shadow-md" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200")}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 space-y-6">
          {filteredJobs.map(job => (
            <div key={job.id} className="clay-card p-6 rounded-3xl transition-transform duration-300 hover:shadow-xl group">
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-sky-100 flex items-center justify-center shrink-0 shadow-inner">
                    <Building2 className="text-primary" size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-sky-950">{job.title}</h3>
                    <p className="text-primary font-bold">{job.company}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5"><MapPin size={14} /> {job.location}</span>
                      <span className="flex items-center gap-1.5"><Briefcase size={14} /> {job.type}</span>
                      {job.salary && <span className="flex items-center gap-1"><DollarSign size={14} /> {job.salary}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => showToast('Saved to your profile!')} className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
                    <BookmarkPlus size={20} />
                  </button>
                  <button onClick={() => { 
                    if (job.applyUrl) window.open(job.applyUrl.startsWith('http') ? job.applyUrl : `https://${job.applyUrl}`, '_blank');
                    else showToast('No external link provided');
                  }} className="px-6 h-12 bg-primary text-white font-bold rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap">
                    Apply <ExternalLink size={16} />
                  </button>
                </div>
              </div>
              <p className="text-slate-600 mb-4 line-clamp-2">{job.description}</p>
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <div className="flex gap-2">
                  {job.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-medium">Point of Contact: <strong>{job.posterName || 'External App'}</strong></span>
                  <button onClick={() => showToast('Referral requested via Network!')} className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-sky-100 transition-colors">
                    <UserPlus size={14} /> Ask for Referral
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredJobs.length === 0 && !isLoading && (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
              <Briefcase size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-sky-950 mb-2">No jobs found</h3>
              <p className="text-slate-500">Try adjusting your search criteria</p>
            </div>
          )}
        </div>

        <div className="md:col-span-4 space-y-6">
          <div className="bg-sky-950 text-white p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary blur-[80px] rounded-full opacity-50 pointer-events-none" />
            <h2 className="text-2xl font-headline font-bold mb-4 relative z-10">AI Career Coach</h2>
            <p className="text-sky-200 text-sm leading-relaxed mb-6 relative z-10">
              Boost your chances of landing these roles. Ask Aura to review your profile and suggest skill improvements.
            </p>
            <button className="w-full bg-white text-sky-950 font-bold py-4 rounded-xl flex items-center justify-center gap-2 relative z-10 transform hover:scale-105 transition-transform shadow-lg">
              Analyze My Profile <ArrowRight size={18} />
            </button>
          </div>

          {/* Practice Boardroom */}
          <div className="bg-gradient-to-br from-violet-600 to-sky-700 text-white p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-violet-400 blur-[80px] rounded-full opacity-40 pointer-events-none" />
            <Mic size={28} className="mb-4 relative z-10 text-violet-200" />
            <h2 className="text-2xl font-headline font-bold mb-3 relative z-10">AI Boardroom</h2>
            <p className="text-violet-100 text-sm leading-relaxed mb-6 relative z-10">
              Practice with 4 AI executives — CEO, Tech Lead, PM & HR — using your real camera and microphone.
            </p>
            <button
              onClick={() => navigate('/boardroom')}
              className="w-full bg-white text-violet-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 relative z-10 transform hover:scale-105 transition-transform shadow-lg"
            >
              Enter Boardroom <ArrowRight size={18} />
            </button>
          </div>

          <div className="clay-card p-6 rounded-3xl bg-surface-container-lowest">
            <h3 className="font-bold text-sky-950 mb-4">Top Hiring Companies</h3>
            <div className="space-y-4">
              {['Stellar Systems', 'Lumina', 'Quantum Leap', 'Nexus Tech'].map(c => (
                <div key={c} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-primary font-bold text-xs">{c[0]}</div>
                    <span className="font-medium text-sm">{c}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">Hiring</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showPostJob && (
        <div className="fixed inset-0 z-[100] glass-panel flex items-center justify-center p-6" onClick={() => setShowPostJob(false)}>
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-headline font-bold text-sky-950 mb-6">Post an Opportunity</h2>
            <div className="space-y-4">
              <input className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium" placeholder="Job Title *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium" placeholder="Company *" value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
                <input className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium" placeholder="Location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option>Full-time</option><option>Contract</option><option>Internship</option>
                </select>
                <input className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium" placeholder="Salary Range" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} />
              </div>
              <textarea className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium h-24 resize-none" placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              <input className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium" placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} />
              <button onClick={handlePostJob} disabled={!form.title || !form.company} className="w-full py-4 bg-primary text-white font-bold rounded-xl clay-button mt-4 disabled:opacity-50">
                Publish Opportunity
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
