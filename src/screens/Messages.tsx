import React from 'react';
import { Search, MoreVertical, Send, Phone, Video, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export const Messages: React.FC = () => {
  const chats = [
    { id: 1, name: 'Elena Vance', lastMsg: 'The portfolio looks great!', time: '2m', active: true, online: true },
    { id: 2, name: 'Julian Thorne', lastMsg: 'See you at the Hub?', time: '1h', online: false },
    { id: 3, name: 'Sarah Chen', lastMsg: 'Thanks for the intro!', time: '3h', online: true },
    { id: 4, name: 'Marcus Miller', lastMsg: 'Sent you the PDF.', time: '1d', online: false },
  ];

  return (
    <main className="pt-20 h-screen flex overflow-hidden bg-surface">
      {/* Chat Sidebar */}
      <div className="w-full md:w-96 border-r border-surface-container-high flex flex-col bg-surface-container-low">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-headline font-extrabold text-sky-950">Messages</h1>
            <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-primary">
              <PlusCircle size={20} />
            </button>
          </div>
          <div className="recessed-input flex items-center px-4 py-3 gap-3">
            <Search size={18} className="text-slate-400" />
            <input className="bg-transparent border-none focus:ring-0 w-full text-sm" placeholder="Search chats..." />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 space-y-2">
          {chats.map(chat => (
            <div key={chat.id} className={cn(
              "p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all",
              chat.active ? "bg-white shadow-md" : "hover:bg-white/40"
            )}>
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                  <img src={`https://picsum.photos/seed/user${chat.id}/48/48`} alt={chat.name} referrerPolicy="no-referrer" />
                </div>
                {chat.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-sm text-on-surface truncate">{chat.name}</h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{chat.time}</span>
                </div>
                <p className="text-xs text-slate-500 truncate">{chat.lastMsg}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window (Desktop) */}
      <div className="hidden md:flex flex-1 flex-col">
        <div className="px-8 py-4 border-b border-surface-container-high flex justify-between items-center bg-white/40 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
              <img src="https://picsum.photos/seed/user1/40/40" alt="Elena" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h3 className="font-bold text-on-surface">Elena Vance</h3>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Online Now</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center text-slate-500 transition-colors">
              <Phone size={20} />
            </button>
            <button className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center text-slate-500 transition-colors">
              <Video size={20} />
            </button>
            <button className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center text-slate-500 transition-colors">
              <Info size={20} />
            </button>
          </div>
        </div>
        <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-surface-container-lowest">
          <div className="flex justify-center">
            <span className="px-4 py-1 rounded-full bg-surface-container-high text-[10px] font-bold text-slate-500 uppercase tracking-widest">Today</span>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0">
              <img src="https://picsum.photos/seed/user1/32/32" alt="Elena" referrerPolicy="no-referrer" />
            </div>
            <div className="clay-card bg-white p-4 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl max-w-md">
              <p className="text-sm text-on-surface-variant leading-relaxed">Hey Alex! Just saw your latest post about the design hub. I'd love to chat about some collaboration opportunities.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-primary shrink-0 flex items-center justify-center text-white text-[10px] font-bold">AS</div>
            <div className="clay-card bg-primary p-4 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl max-w-md text-white">
              <p className="text-sm leading-relaxed">That sounds amazing, Elena! I'm free tomorrow afternoon if you want to hop on a quick call?</p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-white/40 backdrop-blur-md">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <div className="flex-1 recessed-input flex items-center px-6 py-3">
              <input className="bg-transparent border-none focus:ring-0 w-full text-sm" placeholder="Write a message..." />
            </div>
            <button className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg clay-button">
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

import { PlusCircle } from 'lucide-react';
