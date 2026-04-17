import React, { useState } from 'react';
import { Calendar, Clock, Video, ChevronRight, X, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export const OfficeHours: React.FC = () => {
  const { profile } = useAuth();
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [mentorForm, setMentorForm] = useState({ topic: '', time: '', bio: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sessions, setSessions] = useState([
    { id: 1, mentor: 'Dr. Julian Thorne', topic: 'AI in Creative Arts', time: '14:00 - 15:00', date: 'Today', spots: 2, photo: 'https://picsum.photos/seed/mentor1/64/64' },
    { id: 2, mentor: 'Elena Vance', topic: 'Scaling Your Startup', time: '10:00 - 11:00', date: 'Tomorrow', spots: 0, photo: 'https://picsum.photos/seed/mentor2/64/64' },
    { id: 3, mentor: 'Marcus Miller', topic: 'Fintech Trends 2024', time: '16:00 - 17:00', date: 'Apr 15', spots: 5, photo: 'https://picsum.photos/seed/mentor3/64/64' },
  ]);

  const handleJoin = (id: number) => {
    setSessions(prev => prev.map(s => s.id === id && s.spots > 0 ? { ...s, spots: s.spots - 1 } : s));
  };

  const handleBecomeMentor = () => {
    if (!mentorForm.topic.trim()) return;
    const newSession = {
      id: Date.now(),
      mentor: profile?.displayName || 'You',
      topic: mentorForm.topic,
      time: mentorForm.time || 'TBD',
      date: 'Upcoming',
      spots: 5,
      photo: profile?.photoURL || 'https://picsum.photos/seed/newmentor/64/64'
    };
    setSessions(prev => [...prev, newSession]);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowMentorModal(false);
      setMentorForm({ topic: '', time: '', bio: '' });
    }, 1800);
  };

  return (
    <main className="pt-24 pb-32 px-6 max-w-4xl mx-auto space-y-12">
      <div>
        <h1 className="text-3xl font-headline font-extrabold text-sky-950 tracking-tight">Office Hours</h1>
        <p className="text-slate-500 font-medium">Direct mentorship from industry leaders.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sessions.map(session => (
          <div key={session.id} className="clay-card bg-surface-container-lowest p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group transition-all hover:shadow-xl">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                <img src={session.photo} alt={session.mentor} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
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
                onClick={() => handleJoin(session.id)}
                disabled={session.spots === 0}
                className={cn(
                  "px-8 py-4 rounded-2xl font-bold transition-all clay-button flex items-center gap-2",
                  session.spots > 0 ? "bg-primary text-white shadow-lg shadow-primary/20 hover:opacity-90" : "bg-surface-container-high text-slate-400 cursor-not-allowed"
                )}
              >
                {session.spots > 0 ? 'Join Session' : 'Full'}
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
        <button
          onClick={() => setShowMentorModal(true)}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all clay-button"
        >
          Become a Mentor
        </button>
      </div>

      {/* Become a Mentor Modal */}
      {showMentorModal && (
        <div className="fixed inset-0 z-[100] glass-panel flex items-center justify-center p-6 animate-in fade-in duration-300" onClick={() => setShowMentorModal(false)}>
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in duration-300 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
              <h2 className="text-xl font-headline font-extrabold text-sky-950">Host a Session</h2>
              <button onClick={() => setShowMentorModal(false)} className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-5">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-8 gap-4 animate-in fade-in duration-300">
                  <CheckCircle2 size={56} className="text-emerald-500" />
                  <p className="text-xl font-bold text-sky-950">Session Created!</p>
                  <p className="text-slate-500 text-sm text-center">Your mentor session has been added to Office Hours.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Session Topic *</label>
                    <input
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary"
                      placeholder="e.g. Breaking into Product Management"
                      value={mentorForm.topic}
                      onChange={e => setMentorForm({ ...mentorForm, topic: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Preferred Time</label>
                    <input
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary"
                      placeholder="e.g. 16:00 - 17:00"
                      value={mentorForm.time}
                      onChange={e => setMentorForm({ ...mentorForm, time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">What will you cover?</label>
                    <textarea
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary resize-none min-h-[100px]"
                      placeholder="Describe your session..."
                      value={mentorForm.bio}
                      onChange={e => setMentorForm({ ...mentorForm, bio: e.target.value })}
                    />
                  </div>
                  <button
                    onClick={handleBecomeMentor}
                    disabled={!mentorForm.topic.trim()}
                    className="w-full py-4 rounded-2xl bg-primary text-white font-bold clay-button disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                  >
                    Create My Session
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
