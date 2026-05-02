import React, { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, Briefcase, ArrowRight, X, User, MapPin, Mail, Phone, Building2, TrendingUp, Users, Globe, Cpu, Sparkles, AlertCircle, Trophy, Flame, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { CompanyInsights } from '../components/CompanyInsights';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';

interface Alumni { id: string; name: string; role: string; company: string; location: string; bio: string; photo: string; classOf: string; email: string; phone: string; }
interface CompanyData { name: string; tagline: string; industry: string; founded: string; headquarters: string; employees: string; revenue: string; ceo: string; highlights: string[]; hiringStatus: string; techStack: string[]; sentiment: 'positive' | 'neutral' | 'negative'; score: number; }

const dummyAlumni: Alumni[] = [
  { id: '1', name: 'Elena Vance', role: 'Founder', company: 'Lumina', location: 'San Francisco, CA', classOf: '2014', photo: 'https://i.pravatar.cc/150?u=elena', bio: 'Building the future of sustainable energy.', email: 'elena@lumina.com', phone: '+1 555-123-4567' },
  { id: '2', name: 'Julian Thorne', role: 'Design Lead', company: 'Stellar Systems', location: 'Berlin, Germany', classOf: '2016', photo: 'https://i.pravatar.cc/150?u=julian', bio: 'Passionate about aerospace UX.', email: 'j.thorne@stellar.systems', phone: '+49 151 2345' },
  { id: '3', name: 'Sarah Chen', role: 'Senior Engineer', company: 'Quantum Leap', location: 'Toronto, Canada', classOf: '2018', photo: 'https://i.pravatar.cc/150?u=sarah2', bio: 'Quantum computing enthusiast.', email: 'sarah@quantum.ca', phone: '+1 416-555-0198' },
];

const TRENDING_COMPANIES = ['Google', 'OpenAI', 'Stripe', 'Figma', 'Vercel'];
const hiringColors: Record<string, string> = { 'Actively Hiring': 'bg-emerald-100 text-emerald-700', 'Selective': 'bg-amber-100 text-amber-700', 'Paused': 'bg-rose-100 text-rose-600' };

export const Home: React.FC = () => {
  const { profile } = useAuth();
  const { xp, level, tier, streak, addXP, completeChallenge, trackAction } = useGamification();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlumni, setSelectedAlumni] = useState<Alumni | null>(null);
  const [searchTab, setSearchTab] = useState<'all' | 'alumni' | 'companies'>('all');
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [trendingData, setTrendingData] = useState<Record<string, CompanyData>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSearched = useRef<string>('');
  const navigate = useNavigate();

  useEffect(() => { trackAction('page:/'); }, []);

  const filteredAlumni = dummyAlumni.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.company.toLowerCase().includes(searchQuery.toLowerCase()));

  // Debounced AI search
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) { setCompanyData(null); setCompanyError(null); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (query === lastSearched.current) return;
      lastSearched.current = query;
      setCompanyLoading(true); setCompanyError(null); setCompanyData(null);
      trackAction('company_searched'); completeChallenge('search-company');
      try {
        const res = await fetch('/api/company-search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ companyName: query }) });
        if (!res.ok) throw new Error('Server error');
        const json = await res.json();
        setCompanyData(json.data);
      } catch { setCompanyError('Could not load company data.'); }
      finally { setCompanyLoading(false); }
    }, 700);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  // Fetch trending companies
  useEffect(() => {
    TRENDING_COMPANIES.slice(0, 3).forEach(async (name) => {
      try {
        const res = await fetch('/api/company-search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ companyName: name }) });
        const json = await res.json();
        if (json.data) setTrendingData(prev => ({ ...prev, [name]: json.data }));
      } catch {}
    });
  }, []);

  const handleClear = () => { setSearchQuery(''); setCompanyData(null); setCompanyError(null); lastSearched.current = ''; };
  const firstName = profile?.displayName?.split(' ')[0] || 'Alumni';

  return (
    <main className="pt-28 sm:pt-32 pb-28 sm:pb-32 px-4 sm:px-6 max-w-screen-xl mx-auto">
      {/* Personalized Greeting */}
      <div className="mb-6 sm:mb-8 fade-in-up">
        <h1 className="text-2xl sm:text-4xl font-headline font-extrabold text-sky-950 dark:text-white tracking-tight">
          Welcome back, <span className="gradient-text">{firstName}</span> 👋
        </h1>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5 font-bold text-amber-600"><Trophy size={14} /> Level {level} · {tier}</span>
          <span className="flex items-center gap-1.5"><Zap size={14} className="text-primary" /> {xp.toLocaleString()} XP</span>
          <span className="flex items-center gap-1.5"><Flame size={14} className="text-orange-500" /> {streak} day streak</span>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col items-center mb-8 sm:mb-10 sticky top-20 sm:top-24 z-40 gap-3 sm:gap-4">
        <div className="glass-panel w-full max-w-2xl px-4 sm:px-6 py-3 sm:py-4 rounded-full flex items-center gap-3 sm:gap-4 shadow-xl shadow-sky-900/5">
          <Search className={cn("transition-colors shrink-0", companyLoading ? "text-amber-500 animate-pulse" : "text-primary")} size={18} />
          <input className="bg-transparent border-none focus:ring-0 w-full text-on-surface dark:text-white placeholder:text-slate-400 font-medium text-sm sm:text-base" placeholder="Search any company, alumni, or keyword..." type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          {companyLoading && <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />}
          {searchQuery && !companyLoading && <button onClick={handleClear} className="text-slate-400 hover:text-primary shrink-0"><X size={18} /></button>}
        </div>
        {searchQuery && (
          <div className="flex gap-2 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md p-1 rounded-full border border-white/20 dark:border-slate-700/50 shadow-sm">
            {(['all', 'alumni', 'companies'] as const).map(tab => (
              <button key={tab} onClick={() => setSearchTab(tab)} className={cn("px-4 sm:px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all", searchTab === tab ? "bg-primary text-white shadow-md" : "text-slate-500 hover:bg-white/50")}>{tab}</button>
            ))}
          </div>
        )}
      </div>

      {/* Search Results — Company Intelligence */}
      {searchQuery && (searchTab === 'all' || searchTab === 'companies') && (
        <div className="mb-8 fade-in-up">
          <h2 className="text-lg sm:text-xl font-bold text-sky-950 dark:text-white mb-4 flex items-center gap-2"><Sparkles size={18} className="text-amber-500" /> AI Company Intelligence</h2>
          {companyLoading && <div className="clay-card p-8 animate-pulse space-y-4"><div className="flex gap-4"><div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-700" /><div className="flex-1 space-y-2"><div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-1/3" /><div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full w-2/3" /></div></div></div>}
          {companyError && <div className="clay-card p-6 flex items-center gap-4 text-rose-500"><AlertCircle size={24} /><div><p className="font-bold">Couldn't load data</p><p className="text-sm text-rose-400">{companyError}</p></div></div>}
          {companyData && !companyLoading && (
            <div className="clay-card p-5 sm:p-8 space-y-5 sm:space-y-6 slide-up">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-sky-200 flex items-center justify-center text-primary font-black text-xl sm:text-2xl shrink-0">{companyData.name?.charAt(0) || '?'}</div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-sky-950 dark:text-white">{companyData.name}</h3>
                    <p className="text-slate-500 font-medium text-sm">{companyData.tagline}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">{companyData.industry}</span>
                      {companyData.hiringStatus && <span className={cn("text-xs px-3 py-1 rounded-full font-bold", hiringColors[companyData.hiringStatus] || 'bg-slate-100 text-slate-600')}>{companyData.hiringStatus}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center shrink-0">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="#e2e8f0" strokeWidth="6" /><circle cx="32" cy="32" r="26" fill="none" stroke={companyData.sentiment === 'positive' ? '#10b981' : companyData.sentiment === 'negative' ? '#f43f5e' : '#f59e0b'} strokeWidth="6" strokeDasharray={`${(companyData.score / 100) * 163} 163`} strokeLinecap="round" /></svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-sky-950 dark:text-white">{companyData.score}</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">AI Score</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[{ icon: Building2, label: 'Founded', value: companyData.founded }, { icon: Globe, label: 'HQ', value: companyData.headquarters }, { icon: Users, label: 'Employees', value: companyData.employees }, { icon: TrendingUp, label: 'Revenue', value: companyData.revenue }].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-3 sm:p-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400"><Icon size={12} /><span className="text-[10px] font-bold uppercase tracking-widest">{label}</span></div>
                    <p className="text-sm font-bold text-sky-950 dark:text-white">{value || '—'}</p>
                  </div>
                ))}
              </div>
              {companyData.techStack?.length > 0 && (
                <div className="flex flex-wrap gap-2">{companyData.techStack.map(t => <span key={t} className="px-3 py-1.5 rounded-full bg-sky-950 dark:bg-sky-700 text-white text-xs font-bold">{t}</span>)}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Search Results — Alumni */}
      {searchQuery && (searchTab === 'all' || searchTab === 'alumni') && filteredAlumni.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-sky-950 dark:text-white mb-4 flex items-center gap-2"><User size={18} className="text-primary" /> Alumni</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredAlumni.map(alumni => (
              <div key={alumni.id} onClick={() => setSelectedAlumni(alumni)} className="clay-card p-4 sm:p-6 cursor-pointer hover:-translate-y-1 transition-all flex items-center gap-4">
                <img src={alumni.photo} alt={alumni.name} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover" referrerPolicy="no-referrer" />
                <div><h3 className="font-bold text-on-surface dark:text-white">{alumni.name}</h3><p className="text-xs text-slate-400">{alumni.role} @ {alumni.company}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Feed (shown when not searching) */}
      {!searchQuery && (
        <>
          {/* Trending Companies */}
          <div className="mb-8 sm:mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-sky-950 dark:text-white flex items-center gap-2"><TrendingUp size={18} className="text-emerald-500" /> Trending Companies</h2>
              <button className="text-xs font-bold text-primary">View All</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {TRENDING_COMPANIES.slice(0, 3).map((name, i) => {
                const data = trendingData[name];
                return (
                  <div key={name} className="clay-card p-5 rounded-2xl hover:-translate-y-1 transition-all cursor-pointer fade-in-up" style={{ animationDelay: `${i * 100}ms` }} onClick={() => setSearchQuery(name)}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-sky-100 dark:from-primary/30 dark:to-sky-900 flex items-center justify-center text-primary font-black">{name[0]}</div>
                      <div>
                        <p className="font-bold text-sky-950 dark:text-white text-sm">{name}</p>
                        <p className="text-[10px] text-slate-400">{data?.industry || 'Technology'}</p>
                      </div>
                    </div>
                    {data ? (
                      <div className="flex items-center justify-between">
                        <span className={cn("text-xs px-2 py-1 rounded-full font-bold", hiringColors[data.hiringStatus] || 'bg-slate-100 text-slate-600')}>{data.hiringStatus || 'Loading...'}</span>
                        <span className="text-xs font-bold text-slate-400">{data.employees || '—'} employees</span>
                      </div>
                    ) : (
                      <div className="h-6 bg-slate-100 dark:bg-slate-700 rounded-full animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spotlight + Job */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
            <div className="md:col-span-8">
              <div className="clay-card overflow-hidden p-2 transition-transform duration-500 hover:-translate-y-1">
                <div className="relative h-48 sm:h-80 rounded-lg overflow-hidden mb-4 sm:mb-6">
                  <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80" alt="Spotlight" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-sky-900/60 to-transparent" />
                  <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 text-white">
                    <span className="px-3 py-1 rounded-full bg-primary/80 backdrop-blur-md text-xs font-bold uppercase tracking-widest mb-2 sm:mb-3 inline-block">Alumni Spotlight</span>
                    <h2 className="text-xl sm:text-3xl font-bold tracking-tight">Elena Vance on Scaling Series B</h2>
                  </div>
                </div>
                <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                  <p className="text-on-surface-variant dark:text-slate-400 leading-relaxed text-sm sm:text-lg mb-4 sm:mb-6">"The foundation I built at AlumniCloud was the catalyst for our $40M round."</p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img src="https://i.pravatar.cc/150?u=elena" alt="Elena" className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                      <div><p className="font-bold text-sm dark:text-white">Elena Vance</p><div className="text-xs text-slate-400">Class of '14 · Founder at <CompanyInsights companyName="Lumina" /></div></div>
                    </div>
                    <button onClick={() => setSelectedAlumni(dummyAlumni[0])} className="clay-button bg-gradient-to-br from-primary to-primary-container text-white px-5 sm:px-6 py-2.5 sm:py-3 flex items-center gap-2 font-bold text-sm w-full sm:w-auto justify-center">Read More <ArrowRight size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-4 space-y-6">
              <div className="bg-sky-950 text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary blur-[80px] rounded-full opacity-50 pointer-events-none" />
                <Briefcase size={24} className="mb-3 relative z-10 text-sky-200" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-sky-300 mb-2 block relative z-10">Career Opportunity</span>
                <h3 className="text-lg sm:text-xl font-bold mb-3 relative z-10">Senior Product Designer</h3>
                <p className="text-sky-200 text-sm mb-4 relative z-10">Stellar Systems is looking for a design lead from our alumni pool.</p>
                <button onClick={() => navigate('/jobs')} className="w-full py-3 rounded-xl bg-white text-sky-950 font-bold relative z-10 hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2">View Jobs <ArrowRight size={16} /></button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Alumni Modal */}
      {selectedAlumni && (
        <div className="fixed inset-0 z-[100] glass-panel flex items-center justify-center p-4 sm:p-6 fade-in-up">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative">
            <button onClick={() => setSelectedAlumni(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 dark:bg-slate-700 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-primary z-10"><X size={24} /></button>
            <div className="h-32 sm:h-40 bg-gradient-to-br from-primary to-primary-container relative">
              <div className="absolute -bottom-10 sm:-bottom-12 left-6 sm:left-8"><div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-1 bg-white shadow-xl"><img src={selectedAlumni.photo} alt={selectedAlumni.name} className="w-full h-full rounded-xl object-cover" referrerPolicy="no-referrer" /></div></div>
            </div>
            <div className="pt-14 sm:pt-16 px-6 sm:px-8 pb-6 sm:pb-8 space-y-4 sm:space-y-6">
              <div><h2 className="text-2xl sm:text-3xl font-headline font-extrabold text-sky-950 dark:text-white">{selectedAlumni.name}</h2><p className="text-primary font-bold">{selectedAlumni.role} @ {selectedAlumni.company}</p></div>
              <div className="flex flex-wrap gap-3 sm:gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><MapPin size={14} /> {selectedAlumni.location}</span>
                <span className="flex items-center gap-1.5"><User size={14} /> Class of {selectedAlumni.classOf}</span>
              </div>
              <p className="text-on-surface-variant dark:text-slate-400 leading-relaxed italic">"{selectedAlumni.bio}"</p>
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between bg-surface-container-lowest dark:bg-slate-700 p-3 rounded-xl"><span className="font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2 text-sm"><Mail size={14} /> Email</span><a href={`mailto:${selectedAlumni.email}`} className="text-primary font-bold text-sm hover:underline">{selectedAlumni.email}</a></div>
              </div>
              <div className="flex gap-3">
                <a href={`mailto:${selectedAlumni.email}`} className="flex-1 py-3 sm:py-4 rounded-2xl bg-primary text-white font-bold clay-button flex items-center justify-center gap-2 text-sm">Email</a>
                <button onClick={() => navigate('/messages')} className="flex-1 py-3 sm:py-4 rounded-2xl bg-surface-container dark:bg-slate-700 text-primary font-bold flex items-center justify-center gap-2 text-sm">Message</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
