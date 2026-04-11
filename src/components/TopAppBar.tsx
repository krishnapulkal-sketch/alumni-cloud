import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bot } from 'lucide-react';

export const TopAppBar: React.FC = () => {
  const { profile } = useAuth();

  return (
    <header className="fixed top-0 w-full z-50 bg-white/40 backdrop-blur-3xl shadow-sm">
      <div className="flex justify-between items-center px-6 py-4 w-full max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {profile?.displayName?.charAt(0) || 'A'}
              </div>
            )}
          </div>
          <span className="text-xl font-bold tracking-tighter text-sky-900">AlumniCloud</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex gap-6 text-slate-500 font-medium">
            <a className="hover:bg-sky-50/50 transition-colors px-3 py-1 rounded-lg" href="#">Membership</a>
            <a className="hover:bg-sky-50/50 transition-colors px-3 py-1 rounded-lg" href="#">Events</a>
            <a className="hover:bg-sky-50/50 transition-colors px-3 py-1 rounded-lg" href="#">Directory</a>
          </nav>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full text-sky-800 hover:bg-sky-50/50 transition-colors">
          <Bot size={24} />
        </button>
      </div>
    </header>
  );
};
