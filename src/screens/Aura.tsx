import React, { useState, useRef, useEffect } from 'react';
import { Send, PlusCircle, Bot, Search, Globe } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
  isSearch?: boolean;
}

export const Aura: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "Hello! I'm Aura, your AI career mentor. I'm now powered by **Groq** for lightning-fast insights. I can also perform real-time web searches for companies and trends using **Gemini Search Grounding**. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (isSearchRequest = false) => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', text: input, timestamp: new Date(), isSearch: isSearchRequest };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      let responseText = "";

      if (isSearchRequest) {
        // Use Gemini for real-time search grounding
        const result = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: input,
          config: {
            systemInstruction: "You are a career search assistant. Use Google Search to find real-time information about companies, hiring trends, and alumni opportunities. Provide a detailed report with links if possible.",
            tools: [{ googleSearch: {} }]
          }
        });
        responseText = result.text || "I couldn't find any real-time information for that query.";
      } else {
        // Use Groq for general career mentorship
        const response = await fetch('/api/aura', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messages.concat(userMsg).map(m => ({
              role: m.role === 'model' ? 'assistant' : m.role,
              content: m.text
            }))
          })
        });
        const data = await response.json();
        responseText = data.text;
      }

      const modelMsg: Message = {
        role: 'model',
        text: responseText || "I'm sorry, I couldn't process that.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error('Aura Error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <main className="pt-24 pb-32 px-4 max-w-5xl mx-auto min-h-screen flex flex-col items-center">
      {/* The Aura Section */}
      <div className="relative w-full flex flex-col items-center justify-center mb-16 py-12">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-200/20 blur-[120px] rounded-full" />
        <div className="aura-sphere w-64 h-64 md:w-80 md:h-80 rounded-full backdrop-blur-md flex items-center justify-center relative z-10 transition-transform hover:scale-105 duration-700 bg-gradient-to-br from-primary-container/40 via-purple-200/40 to-emerald-100/40 shadow-[inset_0_0_50px_rgba(255,255,255,0.8),0_0_80px_rgba(144,205,253,0.3)]">
          <div className="text-center p-8">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary mb-2">The Aura</h1>
            <p className="text-xs font-bold tracking-[0.2em] text-primary/60 uppercase">System Active</p>
          </div>
        </div>
        <div className="mt-8 text-center max-w-md z-10">
          <h2 className="text-2xl font-bold text-on-surface mb-2">Ask your AI mentor for career advice or campus info</h2>
          <p className="text-on-surface-variant leading-relaxed">Personalized guidance powered by the AlumniCloud network intelligence.</p>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="w-full space-y-8 mb-12">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex flex-col max-w-[85%] md:max-w-[70%]", msg.role === 'user' ? "items-end self-end" : "items-start")}>
            <div className={cn(
              "clay-card p-6 leading-relaxed",
              msg.role === 'user' ? "bg-primary text-white rounded-tl-xl rounded-bl-xl rounded-br-xl shadow-lg" : "bg-surface-container-lowest rounded-tr-xl rounded-br-xl rounded-bl-xl text-on-surface-variant"
            )}>
              <div className="markdown-body">
                <ReactMarkdown>
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
            <span className={cn("mt-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase", msg.role === 'user' ? "mr-4" : "ml-4")}>
              {msg.role === 'user' ? 'You' : 'Aura'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isTyping && (
          <div className="flex flex-col items-start max-w-[85%] md:max-w-[70%]">
            <div className="clay-card bg-surface-container-lowest rounded-tr-xl rounded-br-xl rounded-bl-xl p-6 flex gap-1">
              <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Sticky Input Area */}
      <div className="fixed bottom-28 left-0 right-0 z-40 px-6 pointer-events-none">
        <div className="max-w-2xl mx-auto w-full pointer-events-auto">
          <div className="bg-white/60 backdrop-blur-2xl p-2 rounded-full shadow-xl flex items-center gap-2 border border-white/20">
            <button 
              onClick={() => handleSend(true)}
              className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-primary transition-colors group"
              title="Search Web"
            >
              <Globe size={24} className="group-hover:scale-110 transition-transform" />
            </button>
            <input 
              className="flex-1 bg-surface-container-highest recessed-input border-none focus:ring-0 rounded-full px-6 py-3 text-on-surface placeholder:text-slate-400" 
              placeholder="Ask anything or search companies..." 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(false)}
            />
            <button 
              onClick={() => handleSend(false)}
              className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};
