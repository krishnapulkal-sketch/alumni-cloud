import React from 'react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export const Welcome: React.FC = () => {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-surface">
      {/* Abstract Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-container/30 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-primary-container/20 blur-[120px] rounded-full" />

      <div className="z-10 w-full max-w-md flex flex-col items-center space-y-12">
        <div className="flex flex-col items-center gap-2">
          <span className="text-primary font-headline font-black text-2xl tracking-tighter">AlumniCloud</span>
          <div className="h-1 w-8 bg-primary rounded-full" />
        </div>

        <div className="relative w-full aspect-square max-w-[320px] flex items-center justify-center">
          <div className="relative w-full h-full rounded-full bg-white/40 backdrop-blur-2xl clay-card border border-white/20 flex items-center justify-center p-8 overflow-hidden">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNxAadaq_FVGg8I68mvDiIsKNLypnxnmme54hIP36IVhL9XQ14aYnBfhz3mFsFmcvHHllU-qtWgXehzIM83txCe13LYbZO5rjswdw83hOimK0igxqDC4swpE7HlQp278kZ9ZMLMqtUGqM6Y_SEDgaougAy0CLrF4mF_54gPphmxD5au-WvX3OHvBYFWKvsv2j5EbOoTv9HQWVSjBY2V-Es2Kwj1DD8xYgK17Dp8Z5uG_9r04dV4_Hr9GEmZTW2Xw5chE7-1Y7v7HQ" 
              alt="Mascot"
              className="w-full h-full object-contain hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -z-10 w-full h-full bg-primary-container/20 blur-3xl rounded-full" />
        </div>

        <div className="text-center space-y-4">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface leading-tight">
            Welcome <br />
            <span className="text-primary">to the Network</span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-xs mx-auto">
            Connect, grow, and rediscover your community in a softer space.
          </p>
        </div>

        <div className="w-full space-y-4 pt-4">
          <button 
            onClick={signIn}
            className="w-full py-5 bg-gradient-to-br from-primary to-primary-container text-white font-headline font-bold text-lg rounded-xl clay-button shadow-lg shadow-primary/20"
          >
            Create Account
          </button>
          <button 
            onClick={signIn}
            className="w-full py-5 bg-surface-container-highest text-primary font-headline font-bold text-lg rounded-xl hover:bg-surface-container-high transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
