import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { Bot, Bell, Sun, Moon, Menu, X, Trophy, Flame } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export const TopAppBar: React.FC = () => {
  const { profile } = useAuth();
  const { xp, level, tier, streak } = useGamification();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('alumnicloud_dark');
    if (saved === 'true') { setIsDark(true); document.documentElement.classList.add('dark'); }
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('alumnicloud_dark', String(next));
  };

  const notifications = [
    { id: 1, title: 'New Job Match', desc: 'A Senior PM role at Lumina matches your profile.', time: '2h ago' },
    { id: 2, title: 'Connection Request', desc: 'David Kim requests to connect.', time: '5h ago' },
    { id: 3, title: 'Event Reminder', desc: 'Alumni Dinner starts in 2 hours.', time: '2h ago' },
    { id: 4, title: '🔥 Streak Alert', desc: `You're on a ${streak}-day streak! Keep going!`, time: 'Now' },
  ];

  const navLinks = [
    { to: '/events', label: 'Events' },
    { to: '/office-hours', label: 'Office Hours' },
    { to: '/jobs', label: 'Jobs' },
    { to: '/groups', label: 'Groups' },
    { to: '/directory', label: 'Directory' },
    { to: '/mentorship', label: 'Mentorship' },
    { to: '/news', label: 'Market News' },
    { to: '/guide', label: 'Career Guide' },
  ];

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-white/40 dark:bg-slate-900/60 backdrop-blur-3xl shadow-sm dark:shadow-slate-800/20 transition-colors duration-300">
        <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 w-full max-w-screen-2xl mx-auto">
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
            <div>
              <span className="text-lg sm:text-xl font-bold tracking-tighter text-sky-900 dark:text-white">AlumniCloud</span>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <span className="text-amber-500">Lv.{level}</span>
                <span>·</span>
                <span>{xp.toLocaleString()} XP</span>
                <span className="flex items-center gap-0.5 text-orange-500"><Flame size={10} />{streak}</span>
              </div>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            <nav className="flex gap-1 text-slate-500 dark:text-slate-400 font-medium text-sm">
              {navLinks.map(link => (
                <NavLink key={link.to} to={link.to} className={({ isActive }) => cn("hover:bg-sky-50/50 dark:hover:bg-white/5 transition-colors px-3 py-1.5 rounded-lg", isActive && "text-primary dark:text-sky-400 font-bold")}>{link.label}</NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 relative">
            {/* Dark mode toggle */}
            <button onClick={toggleDark} className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-sky-50/50 dark:hover:bg-white/5 transition-colors">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications */}
            <button onClick={() => setShowNotifications(!showNotifications)} className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-sky-50/50 dark:hover:bg-white/5 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-slate-900" />
            </button>

            {showNotifications && (
              <div className="absolute top-12 right-0 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden slide-up z-50">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                  <span className="font-bold text-sky-950 dark:text-white">Notifications</span>
                  <span className="text-xs text-primary font-bold cursor-pointer">Mark all read</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                      <p className="text-sm font-bold text-sky-950 dark:text-white">{n.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{n.desc}</p>
                      <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">{n.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aura button */}
            <button onClick={() => navigate('/aura')} className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-sky-800 dark:text-sky-400 hover:bg-sky-50/50 dark:hover:bg-white/5 transition-colors" title="Open Aura AI">
              <Bot size={20} />
            </button>

            {/* Mobile hamburger */}
            <button onClick={() => setShowMobileMenu(true)} className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-sky-50/50 dark:hover:bg-white/5 transition-colors">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {showMobileMenu && (
        <>
          <div className="drawer-overlay" onClick={() => setShowMobileMenu(false)} />
          <div className="drawer-content dark:bg-slate-900">
            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-bold text-sky-900 dark:text-white">Menu</span>
              <button onClick={() => setShowMobileMenu(false)} className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400"><X size={20} /></button>
            </div>

            {/* XP Card in drawer */}
            <div className="bg-gradient-to-br from-primary to-sky-600 rounded-2xl p-4 mb-6 text-white">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-sky-200">Level {level} · {tier}</span>
                <span className="flex items-center gap-1 text-xs font-bold text-amber-300"><Flame size={12} />{streak}d</span>
              </div>
              <p className="text-2xl font-extrabold">{xp.toLocaleString()} XP</p>
            </div>

            <nav className="space-y-1">
              {navLinks.map(link => (
                <NavLink key={link.to} to={link.to} onClick={() => setShowMobileMenu(false)} className={({ isActive }) => cn("block px-4 py-3 rounded-xl font-medium transition-colors", isActive ? "bg-primary/10 text-primary font-bold" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800")}>
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
};
