import React, { useState } from 'react';
import { Search, Filter, MapPin, Briefcase, GraduationCap, Mail, MessageCircle, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export interface AlumniData {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  classOf: string;
  industry: string;
  photo: string;
}

const INDUSTRIES = ['All', 'Technology', 'Finance', 'Healthcare', 'Energy', 'Aerospace'];
const LOCATIONS = ['All', 'San Francisco, CA', 'New York, NY', 'Berlin, Germany', 'London, UK', 'Toronto, Canada'];
const CLASS_YEARS = ['All', '2010', '2014', '2016', '2018', '2019', '2021'];

export const Directory: React.FC = () => {
  const navigate = useNavigate();
  const [alumniDb, setAlumniDb] = useState<AlumniData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ industry: 'All', location: 'All', classOf: 'All' });
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  React.useEffect(() => {
    fetch('/api/alumni')
      .then(res => res.json())
      .then(data => { setAlumniDb(data.alumni); setIsLoading(false); })
      .catch(err => { console.error(err); setIsLoading(false); });
  }, []);

  const filteredAlumni = alumniDb.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.company.toLowerCase().includes(search.toLowerCase());
    const matchInd = filters.industry === 'All' || a.industry === filters.industry;
    const matchLoc = filters.location === 'All' || a.location === filters.location;
    const matchClass = filters.classOf === 'All' || a.classOf === filters.classOf;
    return matchSearch && matchInd && matchLoc && matchClass;
  });

  return (
    <main className="pt-28 pb-32 px-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters - Desktop */}
      <div className="hidden md:block w-72 shrink-0 space-y-8">
        <div>
          <h2 className="text-3xl font-headline font-extrabold text-sky-950 mb-2">Directory</h2>
          <p className="text-slate-500 text-sm">Find and connect with over 12,000 alumni globally.</p>
        </div>

        <div className="space-y-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-sky-950 font-bold mb-4 border-b border-slate-100 pb-2">
            <Filter size={18} className="text-primary" /> Filters
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Industry</label>
            <div className="relative">
              <select 
                className="w-full appearance-none bg-surface-container-low px-4 py-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none border-none"
                value={filters.industry}
                onChange={e => setFilters({...filters, industry: e.target.value})}
              >
                {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Location</label>
            <div className="relative">
              <select 
                className="w-full appearance-none bg-surface-container-low px-4 py-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none border-none"
                value={filters.location}
                onChange={e => setFilters({...filters, location: e.target.value})}
              >
                {LOCATIONS.map(i => <option key={i}>{i}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Class Year</label>
            <div className="relative">
              <select 
                className="w-full appearance-none bg-surface-container-low px-4 py-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none border-none"
                value={filters.classOf}
                onChange={e => setFilters({...filters, classOf: e.target.value})}
              >
                {CLASS_YEARS.map(i => <option key={i}>{i}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <button 
            onClick={() => setFilters({ industry: 'All', location: 'All', classOf: 'All' })}
            className="w-full text-center text-xs font-bold text-slate-400 hover:text-primary transition-colors pt-2"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Mobile Header */}
        <div className="md:hidden">
          <h1 className="text-4xl font-headline font-extrabold text-sky-950 tracking-tight">Directory</h1>
          <p className="text-slate-500 mt-2">Find and connect with alumni.</p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-3 bg-white border-2 border-slate-200 rounded-2xl px-5 py-3">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input 
              className="bg-transparent border-none focus:ring-0 text-sm w-full font-medium placeholder:text-slate-400" 
              placeholder="Search by name or company..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="md:hidden bg-surface-container-low px-4 rounded-2xl text-slate-600 border border-slate-200 flex items-center justify-center"
          >
            <Filter size={20} />
          </button>
        </div>

        {/* Results Grid */}
        <div>
          <h2 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
            {isLoading ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : filteredAlumni.length} Alumni Found
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAlumni.map(alumni => (
              <div key={alumni.id} onClick={() => navigate('/profile/' + alumni.id)} className="clay-card bg-white rounded-3xl p-6 group hover:-translate-y-1 transition-transform duration-300 flex flex-col items-center text-center cursor-pointer">
                <img 
                  src={alumni.photo} 
                  alt={alumni.name}  
                  className="w-24 h-24 rounded-full object-cover mb-4 ring-4 ring-slate-50 group-hover:ring-primary/20 transition-all"
                  referrerPolicy="no-referrer"
                />
                <h3 className="text-xl font-bold text-sky-950">{alumni.name}</h3>
                <p className="text-sm font-medium text-primary mb-4">{alumni.role} @ {alumni.company}</p>
                
                <div className="w-full space-y-2 mb-6">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
                    <MapPin size={14} className="text-slate-400" /> {alumni.location}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
                    <GraduationCap size={14} className="text-slate-400" /> Class of {alumni.classOf}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Briefcase size={14} className="text-slate-400" /> {alumni.industry}
                  </div>
                </div>

                <div className="flex gap-2 w-full mt-auto">
                  <button onClick={() => navigate('/messages')} className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-dim transition-colors">
                    <MessageCircle size={16} /> Message
                  </button>
                  <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-surface-container-low text-primary hover:bg-primary/10 transition-colors">
                    <Mail size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredAlumni.length === 0 && (
            <div className="text-center py-24 bg-white rounded-3xl border border-slate-100">
              <Users className="mx-auto text-slate-300 mb-4" size={48} />
              <h3 className="text-xl font-bold text-sky-950">No alumni match your criteria</h3>
              <button 
                onClick={() => { setSearch(''); setFilters({ industry: 'All', location: 'All', classOf: 'All' }); }}
                className="mt-4 text-primary font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
