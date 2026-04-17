import React, { useState, useEffect } from 'react';
import { Users, Hash, MessageSquare, ArrowRight, X, UserPlus, CheckCircle2, Search, Flame } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

interface Group {
  id: string;
  name: string;
  description: string;
  membersCount: number;
  tags: string[];
  image: string;
  isJoined?: boolean;
}

const SEED_GROUPS: Group[] = [
  { id: '1', name: 'Founders & VC Hub', description: 'Connect with fellow student founders, get pitch feedback, and meet alumni venture capitalists.', membersCount: 1240, tags: ['Startups', 'Venture Capital', 'Networking'], image: 'https://picsum.photos/seed/groups1/400/200' },
  { id: '2', name: 'Design Innovators', description: 'UX/UI, Graphic Design, and Product Strategy discussions.', membersCount: 840, tags: ['UX', 'Figma', 'Product'], image: 'https://picsum.photos/seed/groups2/400/200' },
  { id: '3', name: 'Web3 Builders', description: 'Smart contracts, AI agents, and cryptography enthusiasts.', membersCount: 350, tags: ['Crypto', 'Web3', 'Blockchain'], image: 'https://picsum.photos/seed/groups3/400/200' },
  { id: '4', name: 'London Chapter', description: 'Official global hub for Alumni situated in London, UK.', membersCount: 2200, tags: ['London', 'Events', 'Chapter'], image: 'https://picsum.photos/seed/groups4/400/200' }
];

export const Groups: React.FC = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>(SEED_GROUPS);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [feedInput, setFeedInput] = useState('');
  const [realMembers, setRealMembers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/alumni')
      .then(res => res.json())
      .then(data => setRealMembers(data.alumni || []))
      .catch(console.error);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleJoin = (id: string) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, isJoined: true, membersCount: g.membersCount + 1 } : g));
    showToast('Successfully joined the group!');
  };

  const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || g.tags.some(t => t.toLowerCase().includes(search.toLowerCase())));
  const joinedGroups = filteredGroups.filter(g => g.isJoined);
  const discoverGroups = filteredGroups.filter(g => !g.isJoined);

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
          <h1 className="text-5xl font-headline font-extrabold text-sky-950 tracking-tight">Communities</h1>
          <p className="text-xl text-slate-500 mt-2">Find your niche and connect deeply.</p>
        </div>
        <div className="flex items-center gap-3 bg-white border-2 border-slate-200 rounded-2xl px-5 py-3 w-full md:w-auto">
          <Search size={16} className="text-slate-400" />
          <input className="bg-transparent border-none focus:ring-0 text-sm w-full md:w-64 font-medium placeholder:text-slate-400" placeholder="Search communities..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="space-y-12">
        {joinedGroups.length > 0 && (
          <section>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Flame size={20} className="text-primary" /> Your Communities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {joinedGroups.map(g => (
                <div key={g.id} onClick={() => setActiveGroup(g)} className="clay-card rounded-3xl overflow-hidden cursor-pointer group hover:-translate-y-1 transition-transform duration-300">
                  <div className="h-32 relative overflow-hidden">
                    <img src={g.image} alt={g.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-sky-950/80 to-transparent" />
                    <h3 className="absolute bottom-4 left-4 text-white font-bold text-xl">{g.name}</h3>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">{g.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
                        <Users size={14} /> {g.membersCount} Members
                      </span>
                      <button className="text-sm font-bold text-primary flex items-center gap-1 group-hover:underline">
                        Enter <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-sky-950">
            <Hash size={20} className="text-slate-400" /> Discover Communities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {discoverGroups.map(g => (
              <div key={g.id} className="clay-card rounded-3xl overflow-hidden group">
                <div className="h-32 relative overflow-hidden">
                  <img src={g.image} alt={g.name} className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-sky-950 uppercase">
                    {g.tags[0]}
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <h3 className="font-bold text-xl text-sky-950">{g.name}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2">{g.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Users size={14} /> {g.membersCount} Members</span>
                    <button onClick={() => handleJoin(g.id)} className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-primary-dim transition-colors flex items-center gap-1">
                      <UserPlus size={14} /> Join Hub
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {discoverGroups.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
              <p className="text-slate-400 font-medium">No communities found. Try a different search.</p>
            </div>
          )}
        </section>
      </div>

      {activeGroup && (
        <div className="fixed inset-0 z-[100] glass-panel flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300" onClick={() => setActiveGroup(null)}>
          <div className="bg-white w-full max-w-4xl h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 relative border border-slate-100" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="h-48 relative shrink-0">
              <img src={activeGroup.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-sky-950 via-sky-950/40 to-transparent" />
              <button onClick={() => setActiveGroup(null)} className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-sky-950 transition-colors z-10">
                <X size={20} />
              </button>
              <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end">
                <div className="text-white space-y-2">
                  <h2 className="text-4xl font-headline font-extrabold">{activeGroup.name}</h2>
                  <p className="text-sky-100 max-w-xl text-sm leading-relaxed">{activeGroup.description}</p>
                </div>
                <div className="flex -space-x-3">
                  {realMembers.slice(parseInt(activeGroup.id)*4, parseInt(activeGroup.id)*4 + 4).map((member: any) => (
                    <img key={member.id} src={member.photo} className="w-10 h-10 rounded-full border-2 border-sky-950 object-cover" referrerPolicy="no-referrer" title={member.name} />
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-sky-950 bg-primary flex items-center justify-center text-xs font-bold text-white">+{activeGroup.membersCount - 4}</div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 flex bg-slate-50/50 overflow-hidden">
              <div className="flex-1 flex flex-col overflow-y-auto w-full">
                <div className="flex-1 p-8 space-y-6">
                  {/* Demo Post */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <img src={realMembers[parseInt(activeGroup.id)]?.photo || "https://picsum.photos/seed/leader/64/64"} className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <h4 className="font-bold text-sm text-sky-950">{realMembers[parseInt(activeGroup.id)]?.name || "Community Leader"}</h4>
                        <p className="text-xs text-slate-400">2 hours ago</p>
                      </div>
                    </div>
                    <p className="text-slate-600 font-medium leading-relaxed mb-4">
                      Welcome everyone to {activeGroup.name}! Let's keep the discussions focused and helpful. Feel free to introduce yourselves below!
                    </p>
                    <div className="flex gap-4 pt-4 border-t border-slate-50">
                      <button className="flex items-center gap-1.5 text-slate-400 hover:text-primary transition-colors text-sm font-bold">
                        <Flame size={16} /> 24 Kudos
                      </button>
                      <button className="flex items-center gap-1.5 text-slate-400 hover:text-primary transition-colors text-sm font-bold">
                        <MessageSquare size={16} /> 5 Comments
                      </button>
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className="p-6 bg-white border-t border-slate-100 shrink-0">
                  <div className="flex gap-3">
                    <input 
                      placeholder={`Post to ${activeGroup.name}...`}
                      className="flex-1 bg-surface-container-low rounded-2xl px-5 py-4 border-none focus:ring-2 focus:ring-primary/20 transition-shadow text-sm font-medium"
                      value={feedInput}
                      onChange={e => setFeedInput(e.target.value)}
                    />
                    <button onClick={() => { if(feedInput) { showToast('Posted!'); setFeedInput(''); } }} className="px-8 rounded-2xl bg-primary text-white font-bold hover:bg-primary-dim transition-colors">
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
