import React, { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, Briefcase, ArrowRight, X, User, MapPin, Mail, Phone, Building2, TrendingUp, Users, Globe, Cpu, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { CompanyInsights } from '../components/CompanyInsights';
import { useNavigate } from 'react-router-dom';

interface Alumni {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  bio: string;
  photo: string;
  classOf: string;
  email: string;
  phone: string;
}

interface CompanyData {
  name: string;
  tagline: string;
  industry: string;
  founded: string;
  headquarters: string;
  employees: string;
  revenue: string;
  ceo: string;
  highlights: string[];
  hiringStatus: string;
  techStack: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
}

const dummyAlumni: Alumni[] = [
  { id: '1', name: 'Elena Vance', role: 'Founder', company: 'Lumina', location: 'San Francisco, CA', classOf: '2014', photo: 'https://picsum.photos/seed/elena/200/200', bio: 'Building the future of sustainable energy through decentralized grids.', email: 'elena.vance@lumina.com', phone: '+1 (555) 123-4567' },
  { id: '2', name: 'Julian Thorne', role: 'Design Lead', company: 'Stellar Systems', location: 'Berlin, Germany', classOf: '2016', photo: 'https://picsum.photos/seed/julian/200/200', bio: 'Passionate about aerospace UX and human-computer interaction in zero-G.', email: 'j.thorne@stellar.systems', phone: '+49 151 2345 6789' },
  { id: '3', name: 'Sarah Chen', role: 'Senior Engineer', company: 'Quantum Leap', location: 'Toronto, Canada', classOf: '2018', photo: 'https://picsum.photos/seed/sarah/200/200', bio: 'Quantum computing enthusiast and open-source contributor.', email: 'sarah.chen@quantum.ca', phone: '+1 (416) 555-0198' },
];

const hiringColors: Record<string, string> = {
  'Actively Hiring': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Selective': 'bg-amber-100 text-amber-700 border-amber-200',
  'Paused': 'bg-rose-100 text-rose-600 border-rose-200',
};

const sentimentColors: Record<string, string> = {
  positive: 'text-emerald-600',
  neutral: 'text-amber-500',
  negative: 'text-rose-500',
};

export const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlumni, setSelectedAlumni] = useState<Alumni | null>(null);
  const [searchTab, setSearchTab] = useState<'all' | 'alumni' | 'companies'>('all');

  // AI company search state
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSearched = useRef<string>('');

  const navigate = useNavigate();

  const filteredAlumni = dummyAlumni.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allCompanies = Array.from(new Set(dummyAlumni.map(a => a.company)));
  const filteredCompanies = allCompanies.filter(c =>
    c.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Debounced AI search — fires when user stops typing for 700ms
  useEffect(() => {
    const query = searchQuery.trim();

    if (!query) {
      setCompanyData(null);
      setCompanyError(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (query === lastSearched.current) return;
      lastSearched.current = query;

      setCompanyLoading(true);
      setCompanyError(null);
      setCompanyData(null);

      try {
        const res = await fetch('/api/company-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName: query })
        });
        if (!res.ok) throw new Error('Server error');
        const json = await res.json();
        setCompanyData(json.data);
      } catch (err) {
        setCompanyError('Could not load company data. Please try again.');
      } finally {
        setCompanyLoading(false);
      }
    }, 700);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  const handleClear = () => {
    setSearchQuery('');
    setCompanyData(null);
    setCompanyError(null);
    lastSearched.current = '';
  };

  return (
    <main className="pt-32 pb-32 px-6 max-w-screen-xl mx-auto">
      {/* Search */}
      <div className="flex flex-col items-center mb-10 sticky top-24 z-40 gap-4">
        <div className="glass-panel w-full max-w-2xl px-6 py-4 rounded-full flex items-center gap-4 shadow-xl shadow-sky-900/5">
          <Search className={cn("transition-colors", companyLoading ? "text-amber-500 animate-pulse" : "text-primary")} size={20} />
          <input
            className="bg-transparent border-none focus:ring-0 w-full text-on-surface placeholder:text-slate-400 font-medium"
            placeholder="Search any company, alumni, or keyword..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {companyLoading && (
            <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
          )}
          {searchQuery && !companyLoading && (
            <button onClick={handleClear} className="text-slate-400 hover:text-primary shrink-0">
              <X size={18} />
            </button>
          )}
          <SlidersHorizontal className="text-slate-400 cursor-pointer hover:text-primary transition-colors shrink-0" size={20} />
        </div>

        {searchQuery && (
          <div className="flex gap-2 bg-white/40 backdrop-blur-md p-1 rounded-full border border-white/20 shadow-sm">
            {(['all', 'alumni', 'companies'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSearchTab(tab)}
                className={cn(
                  "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                  searchTab === tab ? "bg-primary text-white shadow-md" : "text-slate-500 hover:bg-white/50"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="space-y-10 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">

          {/* ── AI Company Intelligence Card ── */}
          {(searchTab === 'all' || searchTab === 'companies') && (
            <section>
              <h2 className="text-xl font-bold text-sky-950 mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-amber-500" />
                AI Company Intelligence
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full ml-1">Powered by Groq</span>
              </h2>

              {companyLoading && (
                <div className="clay-card p-8 space-y-4 animate-pulse">
                  <div className="flex gap-4 items-start">
                    <div className="w-14 h-14 rounded-2xl bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-slate-200 rounded-full w-1/3" />
                      <div className="h-3 bg-slate-100 rounded-full w-2/3" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
                  </div>
                  <div className="space-y-2">
                    {[1,2,3].map(i => <div key={i} className="h-3 bg-slate-100 rounded-full" style={{ width: `${70 + i * 10}%` }} />)}
                  </div>
                  <p className="text-center text-xs text-slate-400 font-medium pt-2">Fetching real-time intelligence for <strong>"{searchQuery}"</strong>...</p>
                </div>
              )}

              {companyError && (
                <div className="clay-card p-6 flex items-center gap-4 text-rose-500">
                  <AlertCircle size={24} />
                  <div>
                    <p className="font-bold">Couldn't load company data</p>
                    <p className="text-sm text-rose-400">{companyError}</p>
                  </div>
                </div>
              )}

              {companyData && !companyLoading && (
                <div className="clay-card p-8 space-y-6 animate-in fade-in zoom-in-95 duration-500">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-sky-200 flex items-center justify-center text-primary font-black text-2xl shrink-0">
                        {companyData.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="text-2xl font-extrabold text-sky-950">{companyData.name}</h3>
                        <p className="text-slate-500 font-medium">{companyData.tagline}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">{companyData.industry}</span>
                          {companyData.hiringStatus && (
                            <span className={cn("text-xs px-3 py-1 rounded-full font-bold border", hiringColors[companyData.hiringStatus] || 'bg-slate-100 text-slate-600')}>{companyData.hiringStatus}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Score ring */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="26" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                          <circle
                            cx="32" cy="32" r="26" fill="none"
                            stroke={companyData.sentiment === 'positive' ? '#10b981' : companyData.sentiment === 'negative' ? '#f43f5e' : '#f59e0b'}
                            strokeWidth="6"
                            strokeDasharray={`${(companyData.score / 100) * 163} 163`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-sky-950">{companyData.score}</span>
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">AI Score</p>
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { icon: Building2, label: 'Founded', value: companyData.founded },
                      { icon: Globe, label: 'HQ', value: companyData.headquarters },
                      { icon: Users, label: 'Employees', value: companyData.employees },
                      { icon: TrendingUp, label: 'Revenue', value: companyData.revenue },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Icon size={13} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
                        </div>
                        <p className="text-sm font-bold text-sky-950">{value || '—'}</p>
                      </div>
                    ))}
                  </div>

                  {/* CEO */}
                  {companyData.ceo && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm shrink-0">
                        {companyData.ceo.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">CEO</p>
                        <p className="font-bold text-sky-950 text-sm">{companyData.ceo}</p>
                      </div>
                    </div>
                  )}

                  {/* Highlights */}
                  {companyData.highlights?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Key Highlights</p>
                      <ul className="space-y-2">
                        {companyData.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                            <span className="text-primary mt-0.5 shrink-0">▸</span>
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tech Stack */}
                  {companyData.techStack?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Cpu size={12} /> Tech Stack</p>
                      <div className="flex flex-wrap gap-2">
                        {companyData.techStack.map(t => (
                          <span key={t} className="px-3 py-1.5 rounded-full bg-sky-950 text-white text-xs font-bold">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Alumni at this company */}
                  {dummyAlumni.filter(a => a.company.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Alumni at this company</p>
                      <div className="flex flex-wrap gap-3">
                        {dummyAlumni.filter(a => a.company.toLowerCase().includes(searchQuery.toLowerCase())).map(alumni => (
                          <div
                            key={alumni.id}
                            onClick={() => setSelectedAlumni(alumni)}
                            className="flex items-center gap-2 bg-white p-2 rounded-full pr-4 cursor-pointer hover:shadow-md transition-all border border-slate-100"
                          >
                            <img src={alumni.photo} alt={alumni.name} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                            <span className="text-xs font-bold text-slate-700">{alumni.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Alumni section */}
          {(searchTab === 'all' || searchTab === 'alumni') && filteredAlumni.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-sky-950 mb-6 px-4 flex items-center gap-2">
                <User size={20} className="text-primary" />
                Alumni
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredAlumni.map(alumni => (
                  <div
                    key={alumni.id}
                    onClick={() => setSelectedAlumni(alumni)}
                    className="clay-card p-6 cursor-pointer hover:-translate-y-1 transition-all flex items-center gap-4"
                  >
                    <img src={alumni.photo} alt={alumni.name} className="w-16 h-16 rounded-full object-cover" referrerPolicy="no-referrer" />
                    <div>
                      <h3 className="font-bold text-on-surface">{alumni.name}</h3>
                      <p className="text-xs text-slate-400">{alumni.role} @ {alumni.company}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Main Feed (shown when not searching) */}
      {!searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-8 group">
            <div className="clay-card overflow-hidden p-2 transition-transform duration-500 hover:-translate-y-2">
              <div className="relative h-80 rounded-lg overflow-hidden mb-6">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCW0c1i40u1oPro6WHXtqhMCm4hyGLO3LQWg3VMFW7Swy1WshHMJ6fgXs_8ZSwz1xjJJq_JF_0KXt_Vdr2nV2GRORfHfaFFDVbGZBvSoZFYaqjvGmVH2pCTp-y6upi_fAKgd2QP7PC4GJvHT76yk7EPAOB_8wO87Gy1IbgtKELShst5MQSiV2YfhgcOqGXdW-44IXaCFGQVkWq03sihGG6k0T_wfjIrGhJdzKDwlIyRRV0Pb5e8ToMC7APwCjOh4Aq8GV2mhdcYaM8"
                  alt="Spotlight"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sky-900/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <span className="px-3 py-1 rounded-full bg-primary/80 backdrop-blur-md text-xs font-bold uppercase tracking-widest mb-3 inline-block">Alumni Spotlight</span>
                  <h2 className="text-3xl font-bold tracking-tight">Elena Vance on Scaling Series B</h2>
                </div>
              </div>
              <div className="px-6 pb-6">
                <p className="text-on-surface-variant leading-relaxed text-lg mb-6">
                  "The foundation I built at AlumniCloud's network was the catalyst for our latest $40M round. It's about authentic connection over transaction."
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden">
                      <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfbLsNyWvHcn_MNhjYX3b-K8nnzcwZXpISXC9c2X2jDA5CaLepBeEYze_X7Lz6j2LPVloX-a-SlOwv5ylEtwyDYAX2ZZq8gBjX--1CvsEG5Tix4Hd4lYAp_396g7IR_j3AOxFQ0p5s4r5eZ2ZYU01hD2pNZg8z0u-ab4FxmI7uS0b5hRKFo4g85GBsBCGeSh9flJQL6mNdqng7XMVDHIbRute-p2SCUomLBVrjCC9SLAFMzffiDNc_DVkxDhrkcHdgDq5RJWtZ7FU" alt="Elena" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Elena Vance</p>
                      <div className="text-xs text-slate-400">Class of '14 • Founder at <CompanyInsights companyName="Lumina" /></div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAlumni(dummyAlumni[0])}
                    className="clay-button bg-gradient-to-br from-primary to-primary-container text-white px-6 py-3 flex items-center gap-2 font-bold text-sm"
                  >
                    Read Interview <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-4">
            <div className="bg-surface-container clay-card p-8 transition-transform duration-500 hover:-translate-y-2">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6">
                <Briefcase className="text-primary" size={24} />
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary mb-2 block">Career Opportunity</span>
              <h3 className="text-xl font-bold mb-4 text-on-surface">Senior Product Designer</h3>
              <div className="text-on-surface-variant text-sm mb-6 leading-relaxed">
                <CompanyInsights companyName="Stellar Systems" /> is looking for a design lead from our alumni pool to head the new UX lab in Berlin.
              </div>
              <button
                onClick={() => setSelectedAlumni(dummyAlumni[1])}
                className="w-full py-4 rounded-xl bg-surface-container-lowest text-primary font-bold shadow-sm hover:bg-white transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alumni Detail Modal */}
      {selectedAlumni && (
        <div className="fixed inset-0 z-[100] glass-panel flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative animate-in zoom-in duration-300">
            <button
              onClick={() => setSelectedAlumni(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-primary transition-all z-10"
            >
              <X size={24} />
            </button>
            <div className="h-40 bg-gradient-to-br from-primary to-primary-container relative">
              <div className="absolute -bottom-12 left-8">
                <div className="w-24 h-24 rounded-2xl p-1 bg-white shadow-xl">
                  <img src={selectedAlumni.photo} alt={selectedAlumni.name} className="w-full h-full rounded-xl object-cover" referrerPolicy="no-referrer" />
                </div>
              </div>
            </div>
            <div className="pt-16 px-8 pb-8 space-y-6">
              <div>
                <h2 className="text-3xl font-headline font-extrabold text-sky-950">{selectedAlumni.name}</h2>
                <p className="text-primary font-bold">{selectedAlumni.role} @ {selectedAlumni.company}</p>
              </div>
              <div className="flex gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><MapPin size={14} /> {selectedAlumni.location}</span>
                <span className="flex items-center gap-1.5"><User size={14} /> Class of {selectedAlumni.classOf}</span>
              </div>
              <p className="text-on-surface-variant leading-relaxed italic">"{selectedAlumni.bio}"</p>
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Contact Details</h3>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center justify-between bg-surface-container-lowest p-3 rounded-xl border border-slate-100">
                    <span className="font-medium text-slate-600 flex items-center gap-2"><Mail size={16} /> Email</span>
                    <a href={`mailto:${selectedAlumni.email}`} className="text-primary font-bold hover:underline">{selectedAlumni.email}</a>
                  </div>
                  <div className="flex items-center justify-between bg-surface-container-lowest p-3 rounded-xl border border-slate-100">
                    <span className="font-medium text-slate-600 flex items-center gap-2"><Phone size={16} /> Phone</span>
                    <a href={`tel:${selectedAlumni.phone}`} className="text-primary font-bold hover:underline">{selectedAlumni.phone}</a>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-2">
                <a href={`mailto:${selectedAlumni.email}`} className="flex-1 py-4 rounded-2xl bg-primary text-white font-bold clay-button flex items-center justify-center gap-2">
                  Email {selectedAlumni.name.split(' ')[0]}
                </a>
                <a href={`tel:${selectedAlumni.phone}`} className="flex-1 py-4 rounded-2xl bg-surface-container text-primary font-bold flex items-center justify-center gap-2 hover:bg-white transition-colors">
                  Call
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
