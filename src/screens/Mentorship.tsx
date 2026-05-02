import React, { useState, useEffect } from 'react';
import { Target, Users, MapPin, Briefcase, Zap, CheckCircle2, Star, Clock, MessageSquare, ChevronRight, Check, X, Send, Calendar, Plus, Users as UsersIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  matchScore: number;
  expertise: string[];
  photo: string;
}



export const Mentorship: React.FC = () => {
  const { user, profile } = useAuth();
  const { addXP, trackAction } = useGamification();
  const [activeTab, setActiveTab] = useState<'suggestions' | 'sessions' | 'active' | 'requests'>('suggestions');
  const [toast, setToast] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<Mentor[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [activeConnections, setActiveConnections] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [manageSessionId, setManageSessionId] = useState<string | null>(null);
  const [newSession, setNewSession] = useState({ title: '', description: '', date: '', capacity: 10 });

  React.useEffect(() => {
    fetch('/api/alumni')
      .then(res => res.json())
      .then(data => {
        // Grab a few realistic alumni, skip first 15 used elsewhere, assign match scores
        const mentors = data.alumni.slice(15, 18).map((a: any, i: number) => ({
          id: a.id,
          name: a.name,
          role: a.role,
          company: a.company,
          location: a.location,
          matchScore: 98 - (i * 7),
          expertise: [a.industry, 'Career Growth'],
          photo: a.photo
        }));
        setAiSuggestions(mentors);
      })
      .catch(console.error);
  }, []);

  // Listen for incoming and outgoing requests
  useEffect(() => {
    if (!user?.uid) return;
    
    // Incoming requests (where user is recipient)
    const qIncoming = query(collection(db, 'mentorship_requests'), where('recipientId', '==', user.uid));
    const unsub1 = onSnapshot(qIncoming, (snapshot) => {
      const incoming: any[] = [];
      const active: any[] = [];
      snapshot.forEach(doc => {
        const data = { id: doc.id, ...doc.data() };
        if (data.status === 'pending') incoming.push(data);
        else if (data.status === 'accepted') active.push(data);
      });
      setIncomingRequests(incoming);
      setActiveConnections(prev => {
        const others = prev.filter(p => p.recipientId !== user.uid);
        return [...others, ...active];
      });
    });

    // Sent requests (where user is sender)
    const qSent = query(collection(db, 'mentorship_requests'), where('senderId', '==', user.uid));
    const unsub2 = onSnapshot(qSent, (snapshot) => {
      const sent: any[] = [];
      const active: any[] = [];
      snapshot.forEach(doc => {
        const data = { id: doc.id, ...doc.data() };
        // We want to see sent requests even if they were rejected, to know the status
        if (data.status === 'pending' || data.status === 'rejected') sent.push(data);
        else if (data.status === 'accepted') active.push(data);
      });
      setSentRequests(sent);
      setActiveConnections(prev => {
        const others = prev.filter(p => p.senderId !== user.uid);
        return [...others, ...active];
      });
    });

    // Public Sessions
    const qSessions = query(collection(db, 'mentor_sessions'));
    const unsub3 = onSnapshot(qSessions, (snapshot) => {
      const s: any[] = [];
      snapshot.forEach(doc => s.push({ id: doc.id, ...doc.data() }));
      setSessions(s);
    });

    return () => { unsub1(); unsub2(); unsub3(); };
  }, [user?.uid]);

  const handleRequestMentorship = async (mentor: Mentor) => {
    if (!user?.uid) return;
    try {
      await addDoc(collection(db, 'mentorship_requests'), {
        senderId: user.uid,
        senderName: profile?.displayName || 'Alumni',
        senderRole: profile?.expertise?.[0] || 'Member',
        recipientId: mentor.id, // Mock ID for now, real implementation would use real UID
        status: 'pending',
        timestamp: serverTimestamp()
      });
      showToast('Mentorship request sent! +20 XP');
      addXP(20, 'Requested mentorship');
      trackAction('mentor_connected');
    } catch (error) {
      console.error(error);
      showToast('Failed to send request');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, 'mentorship_requests', requestId), { status: 'accepted' });
      showToast('Mentorship accepted! +50 XP');
      addXP(50, 'Accepted a mentee');
    } catch (error) {
      showToast('Error accepting request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, 'mentorship_requests', requestId), { status: 'rejected' });
      showToast('Mentorship request declined.');
    } catch (error) {
      showToast('Error declining request');
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    try {
      await addDoc(collection(db, 'mentor_sessions'), {
        ...newSession,
        hostId: user.uid,
        hostName: profile?.displayName || 'Alumni',
        hostRole: profile?.expertise?.[0] || 'Mentor',
        pendingRequests: [],
        approvedAttendees: [],
        timestamp: serverTimestamp()
      });
      setShowCreateSession(false);
      showToast('Session created!');
    } catch (error) {
      showToast('Failed to create session');
    }
  };

  const handleRequestJoinSession = async (session: any) => {
    if (!user?.uid) return;
    try {
      const reqData = { uid: user.uid, name: profile?.displayName || 'Alumni', role: profile?.expertise?.[0] || 'Member' };
      const updatedPending = [...(session.pendingRequests || []), reqData];
      await updateDoc(doc(db, 'mentor_sessions', session.id), { pendingRequests: updatedPending });
      showToast('Join request sent!');
    } catch (error) {
      console.error(error);
      showToast('Failed to send join request');
    }
  };

  const handleAcceptSessionRequest = async (session: any, reqUser: any) => {
    const updatedPending = session.pendingRequests.filter((r: any) => r.uid !== reqUser.uid);
    const updatedApproved = [...(session.approvedAttendees || []), reqUser];
    await updateDoc(doc(db, 'mentor_sessions', session.id), { pendingRequests: updatedPending, approvedAttendees: updatedApproved });
    showToast('Attendee accepted!');
  };

  const handleDenySessionRequest = async (session: any, reqUser: any) => {
    const updatedPending = session.pendingRequests.filter((r: any) => r.uid !== reqUser.uid);
    await updateDoc(doc(db, 'mentor_sessions', session.id), { pendingRequests: updatedPending });
    showToast('Attendee denied.');
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <main className="pt-24 sm:pt-28 pb-28 sm:pb-32 px-4 sm:px-6 max-w-6xl mx-auto space-y-8 sm:space-y-10">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-8 duration-500">
          <CheckCircle2 size={22} />
          <span className="font-bold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-sky-950 p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500 rounded-full blur-[80px]" />
        </div>
        <div className="relative z-10 space-y-4 max-w-2xl text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-white tracking-tight">Mentorship Hub</h1>
          <p className="text-sky-200 text-lg">AI-powered networking tailored to your career goals.</p>
        </div>
        <div className="relative z-10 mt-8 md:mt-0 flex flex-col items-center bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 text-white">
          <Target size={32} className="text-amber-400 mb-2" />
          <span className="text-3xl font-extrabold">2</span>
          <span className="text-xs uppercase tracking-widest font-bold text-sky-200 mt-1">Active Mentors</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex space-x-2 border-b border-slate-200">
        {['suggestions', 'sessions', 'active', 'requests'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
               "px-6 py-4 font-bold text-sm transition-all relative capitalize",
               activeTab === tab ? "text-primary" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {tab === 'suggestions' ? 'AI Matches' : tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in duration-500">
        {activeTab === 'suggestions' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Zap size={20} className="text-amber-500" />
              <h2 className="text-xl font-bold text-sky-950">Recommended by Aura AI</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {aiSuggestions.map(mentor => (
                <div key={mentor.id} className="clay-card rounded-3xl p-6 hover:-translate-y-1 transition-transform group flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <img src={mentor.photo} alt={mentor.name} className="w-24 h-24 rounded-full object-cover ring-4 ring-slate-50 group-hover:ring-amber-400/30 transition-all border border-slate-100 shadow-sm" referrerPolicy="no-referrer" />
                    <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-1 rounded-full shadow-sm flex items-center gap-1 border-2 border-white">
                      <span>{mentor.matchScore}%</span> Match
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-sky-950">{mentor.name}</h3>
                  <p className="text-sm font-medium text-slate-500 mb-4">{mentor.role} @ {mentor.company}</p>
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {mentor.expertise.map(e => <span key={e} className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg">{e}</span>)}
                  </div>
                  <button onClick={() => handleRequestMentorship(mentor)} className="w-full mt-auto py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dim transition-colors flex items-center justify-center gap-2">
                    Request Mentorship <ChevronRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-primary" />
                <h2 className="text-xl font-bold text-sky-950">Public Masterclasses & Sessions</h2>
              </div>
              <button onClick={() => setShowCreateSession(true)} className="bg-primary text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary-dim">
                <Plus size={16} /> Host Session
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map(s => {
                const isHost = s.hostId === user?.uid;
                const hasRequested = s.pendingRequests?.some((r: any) => r.uid === user?.uid);
                const isApproved = s.approvedAttendees?.some((r: any) => r.uid === user?.uid);
                
                return (
                  <div key={s.id} className="clay-card rounded-3xl p-6 flex flex-col">
                    <div className="mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-md">{new Date(s.date).toLocaleDateString()}</span>
                      <h3 className="text-xl font-bold text-sky-950 mt-2">{s.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">By {s.hostName} ({s.hostRole})</p>
                    </div>
                    <p className="text-slate-600 text-sm mb-6 flex-1">{s.description}</p>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-4">
                      <span className="flex items-center gap-1"><UsersIcon size={14} /> {s.approvedAttendees?.length || 0} / {s.capacity} Joined</span>
                    </div>
                    
                    {isHost ? (
                      <button onClick={() => setManageSessionId(s.id)} className="w-full py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 flex items-center justify-center gap-2">
                        Manage Requests ({s.pendingRequests?.length || 0})
                      </button>
                    ) : isApproved ? (
                      <button className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-default">
                        <CheckCircle2 size={16} /> Joined
                      </button>
                    ) : hasRequested ? (
                      <button className="w-full py-3 bg-slate-100 text-slate-400 font-bold rounded-xl flex items-center justify-center gap-2 cursor-default">
                        <Clock size={16} /> Request Pending
                      </button>
                    ) : (
                      <button onClick={() => handleRequestJoinSession(s)} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dim flex items-center justify-center gap-2">
                        Request to Join
                      </button>
                    )}
                  </div>
                )
              })}
              {sessions.length === 0 && (
                <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-slate-100">
                  <p className="text-slate-400 font-medium">No active sessions right now. Be the first to host one!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'active' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="clay-card rounded-3xl p-6 border-l-4 border-emerald-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <img src="https://picsum.photos/seed/sarah/200/200" alt="Sarah" className="w-16 h-16 rounded-full object-cover" referrerPolicy="no-referrer" />
                <div>
                  <h3 className="font-bold text-sky-950 text-lg">Sarah Chen</h3>
                  <p className="text-sm text-slate-500">Senior Engineer • Tech Mentorship</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded-md flex items-center gap-1 max-w-fit">
                    <CheckCircle2 size={12} /> Active Connection
                  </span>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-4 py-3 bg-surface-container-low text-primary font-bold rounded-xl hover:bg-primary/10 flex items-center justify-center gap-2">
                  <Star size={16} /> Log Session
                </button>
                <button className="flex-1 md:flex-none px-4 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dim flex items-center justify-center gap-2">
                  <MessageSquare size={16} /> Message
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-12">
            
            {/* INCOMING REQUESTS */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-sky-950 dark:text-white flex items-center gap-2">
                <Clock size={20} className="text-primary" /> Incoming Requests
              </h2>
              
              {incomingRequests.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                  <Clock className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
                  <h3 className="text-xl font-bold text-sky-950 dark:text-white mb-2">No incoming requests</h3>
                  <p className="text-slate-500 dark:text-slate-400">When someone requests mentorship from you, it will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {incomingRequests.map(req => (
                    <div key={req.id} className="clay-card rounded-3xl p-6 border-l-4 border-amber-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl font-bold text-slate-400 dark:text-slate-300">
                          {req.senderName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <h3 className="font-bold text-sky-950 dark:text-white text-lg">{req.senderName}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{req.senderRole}</p>
                          <span className="inline-block mt-2 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase rounded-md flex items-center gap-1 max-w-fit">
                            <Clock size={12} /> Pending Response
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                        <button onClick={() => handleRejectRequest(req.id)} className="flex-1 md:flex-none p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-bold rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 flex items-center justify-center transition-colors">
                          <X size={20} />
                        </button>
                        <button onClick={() => handleAcceptRequest(req.id)} className="flex-1 md:flex-none px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20">
                          <Check size={18} /> Accept
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SENT REQUESTS */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-sky-950 dark:text-white flex items-center gap-2">
                <Send size={20} className="text-primary" /> Sent Requests
              </h2>
              
              {sentRequests.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                  <Send className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
                  <h3 className="text-xl font-bold text-sky-950 dark:text-white mb-2">No sent requests</h3>
                  <p className="text-slate-500 dark:text-slate-400">Explore AI matches and send mentorship requests to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sentRequests.map(req => (
                    <div key={req.id} className={cn(
                      "clay-card rounded-3xl p-6 border-l-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-6",
                      req.status === 'rejected' ? 'border-rose-500 opacity-70' : 'border-sky-500'
                    )}>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl font-bold text-slate-400 dark:text-slate-300">
                          ?
                        </div>
                        <div>
                          <h3 className="font-bold text-sky-950 dark:text-white text-lg">Mentor Request</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Sent on {req.timestamp?.toDate()?.toLocaleDateString() || 'Recently'}</p>
                          <span className={cn(
                            "inline-block mt-2 px-2 py-1 text-[10px] font-bold uppercase rounded-md flex items-center gap-1 max-w-fit",
                            req.status === 'rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
                          )}>
                            {req.status === 'rejected' ? <X size={12} /> : <Clock size={12} />} 
                            {req.status === 'rejected' ? 'Declined' : 'Awaiting Reply'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateSession && (
        <div className="fixed inset-0 z-[100] glass-panel flex items-center justify-center p-4">
          <form onSubmit={handleCreateSession} className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button type="button" onClick={() => setShowCreateSession(false)} className="absolute top-4 right-4 text-slate-400 hover:text-primary"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-sky-950 mb-6">Host a Mentor Session</h2>
            <div className="space-y-4">
              <div><label className="text-xs font-bold text-slate-500 uppercase">Title</label><input required value={newSession.title} onChange={e => setNewSession({...newSession, title: e.target.value})} className="w-full p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary mt-1" /></div>
              <div><label className="text-xs font-bold text-slate-500 uppercase">Description</label><textarea required value={newSession.description} onChange={e => setNewSession({...newSession, description: e.target.value})} className="w-full p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary mt-1 h-24" /></div>
              <div><label className="text-xs font-bold text-slate-500 uppercase">Date</label><input required type="date" value={newSession.date} onChange={e => setNewSession({...newSession, date: e.target.value})} className="w-full p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary mt-1" /></div>
              <div><label className="text-xs font-bold text-slate-500 uppercase">Max Capacity</label><input required type="number" min="1" value={newSession.capacity} onChange={e => setNewSession({...newSession, capacity: parseInt(e.target.value)})} className="w-full p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary mt-1" /></div>
            </div>
            <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-xl mt-8 hover:bg-primary-dim">Create Session</button>
          </form>
        </div>
      )}

      {/* Manage Session Modal */}
      {manageSessionId && (
        <div className="fixed inset-0 z-[100] glass-panel flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative max-h-[80vh] flex flex-col">
            <button onClick={() => setManageSessionId(null)} className="absolute top-4 right-4 text-slate-400 hover:text-primary"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-sky-950 mb-6">Manage Requests</h2>
            <div className="overflow-y-auto flex-1 space-y-4">
              {sessions.find(s => s.id === manageSessionId)?.pendingRequests?.length === 0 ? (
                <p className="text-slate-400 text-center py-8 font-medium">No pending requests right now.</p>
              ) : (
                sessions.find(s => s.id === manageSessionId)?.pendingRequests?.map((reqUser: any) => (
                  <div key={reqUser.uid} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div><p className="font-bold text-sky-950">{reqUser.name}</p><p className="text-xs text-slate-500">{reqUser.role}</p></div>
                    <div className="flex gap-2">
                      <button onClick={() => handleDenySessionRequest(sessions.find(s => s.id === manageSessionId), reqUser)} className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center hover:bg-rose-200"><X size={14} /></button>
                      <button onClick={() => handleAcceptSessionRequest(sessions.find(s => s.id === manageSessionId), reqUser)} className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-200"><Check size={14} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
