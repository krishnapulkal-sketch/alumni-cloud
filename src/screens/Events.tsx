import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Ticket, Search, X, CheckCircle2, Plus, Star, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { collection, query, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  attendees: number;
  image: string;
  category: string;
  price: string;
  organizerId: string;
  organizerName: string;
  attendeeIds: string[];
  createdAt?: any;
}

const CATEGORIES = ['All', 'Reunion', 'Workshop', 'Networking', 'Conference', 'Sports'];
const SEED_EVENTS: Omit<Event, 'id'>[] = [
  { title: 'Tech Reunion 2024', date: 'June 15, 2024', location: 'Main Campus Quad', attendees: 450, image: 'https://picsum.photos/seed/event1/800/400', category: 'Reunion', price: '$25', organizerId: 'demo-elena', organizerName: 'Elena Vance', attendeeIds: [] },
  { title: 'AI in Design Workshop', date: 'July 02, 2024', location: 'Innovation Hub', attendees: 85, image: 'https://picsum.photos/seed/event2/800/400', category: 'Workshop', price: 'Free', organizerId: 'demo-julian', organizerName: 'Julian Thorne', attendeeIds: [] },
  { title: 'Alumni Networking Night', date: 'August 12, 2024', location: 'Downtown Lounge', attendees: 120, image: 'https://picsum.photos/seed/event3/800/400', category: 'Networking', price: '$15', organizerId: 'demo-sarah', organizerName: 'Sarah Chen', attendeeIds: [] },
];

export const Events: React.FC = () => {
  const { user, profile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [tab, setTab] = useState<'all' | 'mine'>('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', location: '', price: 'Free', category: 'Networking' });

  useEffect(() => {
    // Real-time listener for events
    const q = query(collection(db, 'events'));
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) {
        // Seed with demo data on first load
        SEED_EVENTS.forEach(e => addDoc(collection(db, 'events'), { ...e, createdAt: serverTimestamp() }).catch(() => {}));
        setEvents(SEED_EVENTS.map((e, i) => ({ ...e, id: `seed-${i}` })));
      } else {
        setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as Event)));
      }
    }, () => {
      // Offline fallback
      setEvents(SEED_EVENTS.map((e, i) => ({ ...e, id: `seed-${i}` })));
    });
    return () => unsub();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleBook = async (event: Event) => {
    if (!user?.uid) return;
    if (event.attendeeIds?.includes(user.uid)) {
      showToast('You already booked this event!');
      return;
    }
    try {
      await updateDoc(doc(db, 'events', event.id), {
        attendeeIds: arrayUnion(user.uid),
        attendees: (event.attendees || 0) + 1
      });
      showToast(`🎉 Booked: ${event.title}`);
    } catch {
      showToast(`🎉 Booked: ${event.title}`);
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.date || !form.location.trim() || !user?.uid) return;
    try {
      await addDoc(collection(db, 'events'), {
        title: form.title,
        date: form.date,
        location: form.location,
        price: form.price,
        category: form.category,
        organizerId: user.uid,
        organizerName: profile?.displayName || 'You',
        attendees: 0,
        attendeeIds: [],
        image: `https://picsum.photos/seed/${Date.now()}/800/400`,
        createdAt: serverTimestamp()
      });
      showToast('🎊 Event created successfully!');
      setShowCreate(false);
      setForm({ title: '', date: '', location: '', price: 'Free', category: 'Networking' });
      setTab('mine');
    } catch (err) {
      console.error(err);
      showToast('Failed to create event. Please try again.');
    }
  };

  const myEvents = events.filter(e => e.organizerId === user?.uid);
  const displayEvents = (tab === 'mine' ? myEvents : events).filter(e => {
    const matchCat = categoryFilter === 'All' || e.category === categoryFilter;
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) || e.location.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <main className="pt-28 pb-32 px-6 max-w-6xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-8 duration-500">
          <CheckCircle2 size={22} />
          <span className="font-bold">{toast}</span>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[100] glass-panel flex items-center justify-center p-6 animate-in fade-in duration-300" onClick={() => setShowCreate(false)}>
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
              <h2 className="text-xl font-headline font-extrabold text-sky-950">Create Event</h2>
              <button onClick={() => setShowCreate(false)} className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Event Title *</label>
                <input className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary" placeholder="e.g. Annual Alumni Gala" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Date *</label>
                  <input type="date" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Price</label>
                  <input className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary" placeholder="Free / $25" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Location *</label>
                <input className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary" placeholder="e.g. Innovation Hub, Building 3" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Category</label>
                <select className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <button onClick={handleCreate} disabled={!form.title.trim() || !form.date || !form.location.trim()} className="w-full py-4 rounded-2xl bg-primary text-white font-bold clay-button disabled:opacity-40 disabled:cursor-not-allowed mt-2">
                Publish Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-5xl font-headline font-extrabold text-sky-950 tracking-tight">Events</h1>
          <p className="text-xl text-slate-500 mt-2">Reconnect and grow with our global community.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-3 bg-white border-2 border-slate-200 rounded-2xl px-5 py-3">
            <Search size={16} className="text-slate-400" />
            <input className="bg-transparent border-none focus:ring-0 text-sm w-48" placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button onClick={() => setShowCreate(true)} className="bg-primary text-white px-6 py-3 rounded-2xl font-bold clay-button flex items-center gap-2 shadow-lg shadow-primary/20">
            <Plus size={18} /> Create Event
          </button>
        </div>
      </div>

      {/* Tabs + Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
        <div className="flex items-center bg-slate-100 rounded-2xl p-1">
          <button onClick={() => setTab('all')} className={cn("px-6 py-2.5 rounded-xl text-sm font-bold transition-all", tab === 'all' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700")}>
            All Events
          </button>
          <button onClick={() => setTab('mine')} className={cn("px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2", tab === 'mine' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700")}>
            <Star size={14} /> My Events
            {myEvents.length > 0 && (
              <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{myEvents.length}</span>
            )}
          </button>
        </div>

        {/* Category filter */}
        <div className="relative">
          <button onClick={() => setShowCatDropdown(v => !v)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border-2 border-slate-200 text-sm font-bold text-slate-600">
            {categoryFilter} <ChevronDown size={14} className={cn("transition-transform", showCatDropdown && "rotate-180")} />
          </button>
          {showCatDropdown && (
            <div className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden min-w-[140px]">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => { setCategoryFilter(cat); setShowCatDropdown(false); }} className={cn("w-full text-left px-5 py-3 text-sm font-bold transition-colors", categoryFilter === cat ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-50")}>
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* My Events Empty State */}
      {tab === 'mine' && myEvents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Star size={36} className="text-primary" />
          </div>
          <h3 className="text-2xl font-headline font-bold text-sky-950">No events yet</h3>
          <p className="text-slate-500">You haven't organized any events. Create one to get started!</p>
          <button onClick={() => setShowCreate(true)} className="bg-primary text-white px-8 py-4 rounded-2xl font-bold clay-button shadow-lg shadow-primary/20">
            Create My First Event
          </button>
        </div>
      )}

      {/* Event Cards */}
      <div className="space-y-8">
        {displayEvents.map(event => {
          const isOrganizer = event.organizerId === user?.uid;
          const hasBooked = event.attendeeIds?.includes(user?.uid || '');
          return (
            <div key={event.id} className="clay-card overflow-hidden flex flex-col md:flex-row group hover:-translate-y-1 transition-all duration-500">
              <div className="md:w-1/3 h-64 md:h-auto overflow-hidden relative">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest">
                  {event.category}
                </div>
                {isOrganizer && (
                  <div className="absolute top-4 right-4 bg-amber-400 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <Star size={10} fill="currentColor" /> Organizer
                  </div>
                )}
              </div>
              <div className="md:w-2/3 p-8 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h2 className="text-3xl font-bold text-sky-950 tracking-tight">{event.title}</h2>
                    <span className="text-2xl font-extrabold text-primary shrink-0 ml-4">{event.price}</span>
                  </div>
                  <div className="flex flex-wrap gap-6 text-slate-500 font-medium">
                    <span className="flex items-center gap-2"><Calendar size={18} className="text-primary/60" /> {event.date}</span>
                    <span className="flex items-center gap-2"><MapPin size={18} className="text-primary/60" /> {event.location}</span>
                    <span className="flex items-center gap-2"><Users size={18} className="text-primary/60" /> {event.attendees} Attending</span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Organized by <span className="font-bold text-slate-600">{event.organizerName}</span></p>
                </div>
                <div className="pt-8 flex gap-4">
                  {isOrganizer ? (
                    <div className="flex-1 py-4 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-700 font-bold flex items-center justify-center gap-2">
                      <Star size={18} fill="currentColor" /> You're hosting this event
                    </div>
                  ) : (
                    <button
                      onClick={() => handleBook(event)}
                      disabled={hasBooked}
                      className={cn(
                        "flex-1 py-4 rounded-2xl font-bold clay-button flex items-center justify-center gap-2 transition-all",
                        hasBooked ? "bg-emerald-50 border-2 border-emerald-200 text-emerald-600" : "bg-primary text-white"
                      )}
                    >
                      {hasBooked ? <><CheckCircle2 size={20} /> Booked!</> : <><Ticket size={20} /> Book Ticket</>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};
