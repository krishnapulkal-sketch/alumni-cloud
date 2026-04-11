import React, { useState } from 'react';
import { Search, SlidersHorizontal, Briefcase, Newspaper, PartyPopper, MessageSquare, ArrowRight, ExternalLink, X, User, MapPin } from 'lucide-react';
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
}

const dummyAlumni: Alumni[] = [
  { id: '1', name: 'Elena Vance', role: 'Founder', company: 'Lumina', location: 'San Francisco, CA', classOf: '2014', photo: 'https://picsum.photos/seed/elena/200/200', bio: 'Building the future of sustainable energy through decentralized grids.' },
  { id: '2', name: 'Julian Thorne', role: 'Design Lead', company: 'Stellar Systems', location: 'Berlin, Germany', classOf: '2016', photo: 'https://picsum.photos/seed/julian/200/200', bio: 'Passionate about aerospace UX and human-computer interaction in zero-G.' },
  { id: '3', name: 'Sarah Chen', role: 'Senior Engineer', company: 'Quantum Leap', location: 'Toronto, Canada', classOf: '2018', photo: 'https://picsum.photos/seed/sarah/200/200', bio: 'Quantum computing enthusiast and open-source contributor.' },
];

export const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlumni, setSelectedAlumni] = useState<Alumni | null>(null);
  const [searchTab, setSearchTab] = useState<'all' | 'alumni' | 'companies'>('all');
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

  return (
    <main className="pt-32 pb-32 px-6 max-w-screen-xl mx-auto">
      {/* Search Anchor */}
      <div className="flex flex-col items-center mb-16 sticky top-24 z-40 gap-4">
        <div className="glass-panel w-full max-w-2xl px-6 py-4 rounded-full flex items-center gap-4 shadow-xl shadow-sky-900/5">
          <Search className="text-primary" size={20} />
          <input 
            className="bg-transparent border-none focus:ring-0 w-full text-on-surface placeholder:text-slate-400 font-medium" 
            placeholder="Search alumni, companies, or news..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-primary">
              <X size={18} />
            </button>
          )}
          <SlidersHorizontal className="text-slate-400 cursor-pointer hover:text-primary transition-colors" size={20} />
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

      {searchQuery && (
        <div className="space-y-12 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
          {(searchTab === 'all' || searchTab === 'companies') && filteredCompanies.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-sky-950 mb-6 px-4 flex items-center gap-2">
                <Briefcase size={20} className="text-primary" />
                Companies
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCompanies.map(company => (
                  <div key={company} className="clay-card p-8 space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold text-sky-950">{company}</h3>
                        <p className="text-sm text-slate-500">Industry Leader • {dummyAlumni.filter(a => a.company === company).length} Alumni</p>
                      </div>
                      <CompanyInsights companyName={company} />
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Alumni at {company}</p>
                      <div className="flex flex-wrap gap-3">
                        {dummyAlumni.filter(a => a.company === company).map(alumni => (
                          <div 
                            key={alumni.id}
                            onClick={() => setSelectedAlumni(alumni)}
                            className="flex items-center gap-2 bg-white/50 p-2 rounded-full pr-4 cursor-pointer hover:bg-white transition-colors border border-slate-100"
                          >
                            <img src={alumni.photo} alt={alumni.name} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                            <span className="text-xs font-bold text-slate-700">{alumni.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(searchTab === 'all' || searchTab === 'alumni') && (
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
                {filteredAlumni.length === 0 && (searchTab === 'alumni' || (searchTab === 'all' && filteredCompanies.length === 0)) && (
                  <p className="col-span-full text-center py-10 text-slate-400 font-medium italic">No alumni found matching your search.</p>
                )}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Floating Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Hero Card: Alumni Spotlight */}
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
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfbLsNyWvHcn_MNhjYX3b-K8nnzcwZXpISXC9c2X2jDA5CaLepBeEYze_X7Lz6j2LPVloX-a-SlOwv5ylEtwyDYAX2ZZq8gBjX--1CvsEG5Tix4Hd4lYAp_396g7IR_j3AOxFQ0p5s4r5eZ2ZYU01hD2pNZg8z0u-ab4FxmI7uS0b5hRKFo4g85GBsBCGeSh9flJQL6mNdqng7XMVDHIbRute-p2SCUomLBVrjCC9SLAFMzffiDNc_DVkxDhrkcHdgDq5RJWtZ7FU" 
                      alt="Elena" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
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
                  Read Interview
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Job Opportunity Card */}
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
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => {
                    setSelectedAlumni(null);
                    navigate('/messages');
                  }}
                  className="flex-1 py-4 rounded-2xl bg-primary text-white font-bold clay-button"
                >
                  Message
                </button>
                <button 
                  onClick={() => {
                    setSelectedAlumni(null);
                    navigate('/profile');
                  }}
                  className="flex-1 py-4 rounded-2xl bg-surface-container text-primary font-bold"
                >
                  View Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
