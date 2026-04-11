import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, MoreHorizontal, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';

export const VoiceCall: React.FC = () => {
  const [transcript, setTranscript] = useState<string>("Connecting to Elena...");
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const simulateCall = async () => {
      try {
        const response = await fetch('/api/mentor-call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: "You are Elena Vance, a mentor on AlumniCloud. You are currently in a voice call with an alumnus. Greet them warmly and ask how their career journey is going. Keep it short (1-2 sentences)." })
        });
        const data = await response.json();
        setTranscript(data.text);
      } catch (error) {
        console.error("Mistral Call Error:", error);
        setTranscript("Hey Alex! Great to connect. How's everything going with your career?");
      }
    };

    const timer = setTimeout(simulateCall, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="fixed inset-0 z-[100] bg-sky-950 flex flex-col items-center justify-between py-20 px-6">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-primary-container/10 blur-[150px] rounded-full animate-pulse [animation-delay:2s]" />
      </div>

      <div className="z-10 flex flex-col items-center text-center space-y-8">
        <div className="relative">
          <div className="w-48 h-48 rounded-full p-1 bg-white/10 backdrop-blur-md flex items-center justify-center relative">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white/20">
              <img src="https://picsum.photos/seed/user1/200/200" alt="Elena" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            {/* Pulsing Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20" />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-400 px-4 py-1 rounded-full shadow-lg">
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Connected</span>
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-headline font-extrabold text-white tracking-tight mb-2">Elena Vance</h1>
          <p className="text-sky-200/60 font-medium tracking-widest uppercase text-xs">04:22 • Alumni Lounge</p>
          <div className="mt-6 max-w-xs mx-auto">
            <p className="text-white/80 italic text-sm">"{transcript}"</p>
          </div>
        </div>
      </div>

      <div className="z-10 w-full max-w-md space-y-12">
        <div className="flex justify-center gap-6">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              "w-16 h-16 rounded-full backdrop-blur-md text-white flex items-center justify-center transition-all active:scale-90",
              isMuted ? "bg-rose-500/40" : "bg-white/10 hover:bg-white/20"
            )}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          <button className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-90">
            <VideoOff size={24} />
          </button>
          <button className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-90">
            <MessageSquare size={24} />
          </button>
          <button className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-90">
            <MoreHorizontal size={24} />
          </button>
        </div>

        <button 
          onClick={() => window.history.back()}
          className="w-full h-20 rounded-3xl bg-rose-500 text-white flex items-center justify-center gap-4 shadow-2xl shadow-rose-500/40 hover:bg-rose-600 transition-all active:scale-95"
        >
          <PhoneOff size={28} />
          <span className="text-xl font-bold font-headline">End Call</span>
        </button>
      </div>
    </main>
  );
};
