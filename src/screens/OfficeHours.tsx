import React from 'react';
import { Calendar, Clock, Video, Users, ArrowLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export const OfficeHours: React.FC = () => {
  const sessions = [
    { id: 1, mentor: 'Dr. Julian Thorne', topic: 'AI in Creative Arts', time: '14:00 - 15:00', date: 'Today', spots: 2 },
    { id: 2, mentor: 'Elena Vance', topic: 'Scaling Your Startup', time: '10:00 - 11:00', date: 'Tomorrow', spots: 0 },
    { id: 3, mentor: 'Marcus Miller', topic: 'Fintech Trends 2024', time: '16:00 - 17:00', date: 'Apr 15', spots: 5 },
  ];

  return (
    <main className="pt-24 pb-32 px-6 max-w-4xl mx-auto space-y-12">
      <div className="flex items-center gap-4">
        <button className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-headline font-extrabold text-sky-950 tracking-tight">Office Hours</h1>
          <p className="text-slate-500 font-medium">Direct mentorship from industry leaders.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sessions.map(session => (
          <div key={session.id} className="clay-card bg-surface-container-lowest p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group transition-all hover:shadow-xl">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                <img src={`https://picsum.photos/seed/mentor${session.id}/64/64`} alt={session.mentor} referrerPolicy="no-referrer" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface mb-1">{session.topic}</h3>
                <p className="text-sm text-slate-500 font-medium mb-2">with {session.mentor}</p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-widest bg-primary-container/20 px-3 py-1 rounded-full">
                    <Calendar size={12} />
                    {session.date}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-surface-container-high px-3 py-1 rounded-full">
                    <Clock size={12} />
                    {session.time}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-6">
              <div className="text-right">
                <p className={cn(
                  "text-xs font-bold uppercase tracking-widest",
                  session.spots > 0 ? "text-emerald-500" : "text-rose-400"
                )}>
                  {session.spots > 0 ? `${session.spots} Spots Left` : 'Fully Booked'}
                </p>
              </div>
              <button 
                disabled={session.spots === 0}
                className={cn(
                  "px-8 py-4 rounded-2xl font-bold transition-all clay-button flex items-center gap-2",
                  session.spots > 0 ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-surface-container-high text-slate-400 cursor-not-allowed"
                )}
              >
                Join Session
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 flex flex-col md:flex-row items-center gap-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Video size={32} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-bold text-sky-900 mb-2">Host your own session?</h3>
          <p className="text-slate-600">Share your expertise with the next generation of alumni. It only takes 2 minutes to set up.</p>
        </div>
        <button className="bg-white text-primary px-8 py-4 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all">
          Become a Mentor
        </button>
      </div>
    </main>
  );
};
