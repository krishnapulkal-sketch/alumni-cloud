import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import {
  collection, query, where, onSnapshot, addDoc, serverTimestamp,
  orderBy, getDocs, doc, setDoc, updateDoc, getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { Send, Search, ArrowLeft, MessageCircle, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

interface FirestoreMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: any;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantPhoto: string;
  lastMessage: string;
  lastMessageTime: any;
  unread: number;
}


export const Messages: React.FC = () => {
  const { user, profile } = useAuth();
  const { addXP, completeChallenge, trackAction } = useGamification();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [activeParticipant, setActiveParticipant] = useState<any>(null);
  const [messages, setMessages] = useState<FirestoreMessage[]>([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'chat'>('list');
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isGuest = user?.uid === 'guest-123';

  const [demoUsers, setDemoUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const demoRes = await fetch('/api/alumni');
        const demoData = await demoRes.json();
        const demoAlumni = (demoData.alumni || []).slice(0, 15).map((a: any) => ({
          uid: a.id,
          displayName: a.name,
          photoURL: a.photo,
          email: a.email
        }));

        const querySnapshot = await getDocs(collection(db, 'users'));
        const realUsers = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            uid: doc.id,
            displayName: data.displayName || 'Alumni',
            photoURL: data.photoURL || `https://picsum.photos/seed/${doc.id}/64/64`,
            email: data.email
          };
        });

        // Combine and filter out current user
        const combined = [...realUsers];
        demoAlumni.forEach((da: any) => {
          if (!combined.find(u => u.uid === da.uid)) {
            combined.push(da);
          }
        });

        setDemoUsers(combined.filter(u => u.uid !== user?.uid));
      } catch (err) {
        console.error("Error fetching users for messaging:", err);
      }
    };

    fetchUsers();
  }, [user?.uid]);

  // Listen to conversations
  useEffect(() => {
    if (!user?.uid || isGuest) return;
    const q = query(collection(db, 'conversations'), where('participants', 'array-contains', user.uid));
    
    // We need to handle async user fetching without race conditions between snapshots
    let isCancelled = false;
    
    const unsub = onSnapshot(q, async (snap) => {
      const convsPromises = snap.docs.map(async (d) => {
        const data = d.data();
        const otherId = data.participants.find((p: string) => p !== user.uid);
        let otherUser = { displayName: 'Unknown', photoURL: '', uid: otherId };
        
        if (otherId && demoUsers.length > 0) {
          otherUser = demoUsers.find(u => u.uid === otherId) || otherUser as any;
        } else if (otherId) {
          try {
            const uSnap = await getDoc(doc(db, 'users', otherId));
            if (uSnap.exists()) otherUser = { ...uSnap.data(), uid: otherId } as any;
          } catch {}
        }
        
        return {
          id: d.id,
          participantId: otherId,
          participantName: otherUser.displayName,
          participantPhoto: otherUser.photoURL || `https://picsum.photos/seed/${otherId}/64/64`,
          lastMessage: data.lastMessage || '',
          lastMessageTime: data.lastMessageTime,
          unread: data.unread?.[user.uid] || 0
        } as Conversation;
      });

      const convs = await Promise.all(convsPromises);
      if (isCancelled) return;
      
      convs.sort((a, b) => {
        const timeA = a.lastMessageTime?.seconds || 0;
        const timeB = b.lastMessageTime?.seconds || 0;
        return timeB - timeA;
      });
      setConversations(convs);
    }, (error) => {
      console.warn("Conversations listener error:", error.message);
    });
    
    return () => {
      isCancelled = true;
      unsub();
    };
  }, [user?.uid, demoUsers]);

  // Listen to messages in active conversation
  useEffect(() => {
    if (!activeConvId) return;
    const q = query(collection(db, 'conversations', activeConvId, 'messages'), orderBy('timestamp', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) } as FirestoreMessage));
      setMessages(msgs);
    }, (error) => {
      console.warn("Messages listener error:", error.message);
    });
    return () => unsub();
  }, [activeConvId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getConvId = (uid1: string, uid2: string) =>
    [uid1, uid2].sort().join('_');

  const openChat = async (otherUser: any) => {
    if (!user?.uid) return;
    const convId = getConvId(user.uid, otherUser.uid);
    const convRef = doc(db, 'conversations', convId);
    const convSnap = await getDoc(convRef).catch(() => null);
    if (!convSnap?.exists()) {
      await setDoc(convRef, {
        participants: [user.uid, otherUser.uid],
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        unread: {}
      }).catch((err) => {
        console.error("Failed to create conversation document:", err.message);
      });
    }
    setActiveConvId(convId);
    setActiveParticipant(otherUser);
    setView('chat');
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeConvId || !user?.uid) return;
    const text = input.trim();
    setInput('');
    addXP(5, 'Sent a message');
    trackAction('message_sent');

    // Optimistic fallback update (to ensure it visually works even if Firebase errors out)
    const localMsg: FirestoreMessage = {
      id: `local-${Date.now()}`,
      senderId: user.uid,
      text,
      timestamp: { seconds: Date.now() / 1000 }
    };
    setMessages(prev => {
      if (!prev.find(m => m.id === localMsg.id)) return [...prev, localMsg];
      return prev;
    });

    try {
      await addDoc(collection(db, 'conversations', activeConvId, 'messages'), {
        senderId: user.uid,
        text,
        timestamp: serverTimestamp()
      });
      await updateDoc(doc(db, 'conversations', activeConvId), {
        lastMessage: text,
        lastMessageTime: serverTimestamp()
      });
    } catch (err: any) {
      console.warn('Firebase write was rejected, message is only visible locally. Error:', err.message);
      setToast("Failed to save message. Please check connection.");
      setTimeout(() => setToast(null), 4000);
    }
  };

  // Guest mode — show local demo
  if (isGuest) {
    return (
      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <MessageCircle size={40} className="text-primary" />
        </div>
        <h2 className="text-2xl font-headline font-extrabold text-sky-950">Sign in to use Messages</h2>
        <p className="text-slate-500">Firebase Messaging requires a real account. Create one to start chatting with alumni!</p>
      </main>
    );
  }

  const filteredDemoUsers = demoUsers.filter(u => u.displayName.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="pt-20 pb-28 max-w-5xl mx-auto h-screen flex flex-col">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-rose-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-8 duration-300">
          <AlertCircle size={22} />
          <span className="font-bold">{toast}</span>
        </div>
      )}
      <div className="flex-1 flex overflow-hidden rounded-3xl shadow-2xl border border-slate-100 bg-white mx-4">

        {/* Sidebar */}
        <div className={cn(
          "flex flex-col border-r border-slate-100 bg-surface-container-lowest transition-all",
          view === 'chat' ? "hidden md:flex md:w-80" : "flex-1 md:flex md:w-80"
        )}>
          <div className="p-6 border-b border-slate-100">
            <h1 className="text-2xl font-headline font-extrabold text-sky-950 mb-4">Messages</h1>
            <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-200">
              <Search size={16} className="text-slate-400" />
              <input
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm"
                placeholder="Search alumni..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Existing Conversations */}
            {conversations.length > 0 && (
              <div className="px-4 pt-4 pb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 mb-2">Recent</p>
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => openChat({ uid: conv.participantId, displayName: conv.participantName, photoURL: conv.participantPhoto })}
                    className={cn(
                      "w-full flex items-center gap-4 p-3 rounded-2xl transition-all text-left hover:bg-slate-50",
                      activeConvId === conv.id && "bg-primary/5 border border-primary/20"
                    )}
                  >
                    <div className="relative">
                      <img src={conv.participantPhoto} alt={conv.participantName} className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-sm text-sky-950 truncate">{conv.participantName}</p>
                        {conv.unread > 0 && (
                          <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{conv.unread}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{conv.lastMessage || 'Start a conversation'}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Start New Chat */}
            <div className="px-4 pt-2 pb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 mb-2">Alumni Network</p>
              {filteredDemoUsers.map(u => (
                <button
                  key={u.uid}
                  onClick={() => openChat(u)}
                  className="w-full flex items-center gap-4 p-3 rounded-2xl transition-all text-left hover:bg-slate-50"
                >
                  <div className="relative">
                    <img src={u.photoURL} alt={u.displayName} className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-sky-950 truncate">{u.displayName}</p>
                    <p className="text-xs text-slate-400">Click to chat</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className={cn(
          "flex-1 flex flex-col",
          view === 'list' ? "hidden md:flex" : "flex"
        )}>
          {!activeConvId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 p-8">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle size={36} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-sky-950">Select a conversation</h3>
              <p className="text-slate-400 text-sm">Pick an alumni from the list to start chatting.</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 bg-white">
                <button onClick={() => setView('list')} className="md:hidden w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400">
                  <ArrowLeft size={20} />
                </button>
                {activeParticipant && (
                  <>
                    <div className="relative">
                      <img src={activeParticipant.photoURL || `https://picsum.photos/seed/${activeParticipant.uid}/64/64`} alt={activeParticipant.displayName} className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sky-950">{activeParticipant.displayName}</h3>
                      <p className="text-xs text-emerald-500 font-medium">Active now</p>
                    </div>
                  </>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                {messages.length === 0 && (
                  <div className="text-center py-12 text-slate-400 text-sm font-medium">
                    Say hi to {activeParticipant?.displayName}! 👋
                  </div>
                )}
                {messages.map(msg => {
                  const isMe = msg.senderId === user?.uid;
                  return (
                    <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[70%] px-5 py-3 rounded-3xl text-sm leading-relaxed",
                        isMe
                          ? "bg-primary text-white rounded-br-md"
                          : "bg-white text-slate-700 shadow-sm rounded-bl-md border border-slate-100"
                      )}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-100 bg-white">
                <div className="flex items-center gap-3 bg-slate-50 rounded-2xl border border-slate-200 px-5 py-3 focus-within:border-primary transition-colors">
                  <input
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm"
                    placeholder={`Message ${activeParticipant?.displayName || ''}...`}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
};
