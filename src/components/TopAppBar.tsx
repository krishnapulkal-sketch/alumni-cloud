import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bot, Bell } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

export const TopAppBar: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'New Job Match', desc: 'A Senior PM role at Lumina matches your profile.', time: '2h ago' },
    { id: 2, title: 'Connection Request', desc: 'David Kim requests to connect.', time: '5h ago' },
    { id: 3, title: 'Event Reminder', desc: 'Alumni Dinner starts in 2 hours.', time: '2h ago' }
  ];

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
            <NavLink
              to="/events"
              className={({ isActive }) =>
                `hover:bg-sky-50/50 transition-colors px-3 py-1 rounded-lg ${isActive ? 'text-primary' : ''}`
              }
            >
              Events
            </NavLink>
            <NavLink
              to="/office-hours"
              className={({ isActive }) =>
                `hover:bg-sky-50/50 transition-colors px-3 py-1 rounded-lg ${isActive ? 'text-primary' : ''}`
              }
            >
              Office Hours
            </NavLink>
            <NavLink
              to="/jobs"
              className={({ isActive }) =>
                `hover:bg-sky-50/50 transition-colors px-3 py-1 rounded-lg ${isActive ? 'text-primary' : ''}`
              }
            >
              Jobs
            </NavLink>
            <NavLink
              to="/groups"
              className={({ isActive }) =>
                `hover:bg-sky-50/50 transition-colors px-3 py-1 rounded-lg ${isActive ? 'text-primary' : ''}`
              }
            >
              Groups
            </NavLink>
            <NavLink
              to="/directory"
              className={({ isActive }) =>
                `hover:bg-sky-50/50 transition-colors px-3 py-1 rounded-lg ${isActive ? 'text-primary' : ''}`
              }
            >
              Directory
            </NavLink>
            <NavLink
              to="/mentorship"
              className={({ isActive }) =>
                `hover:bg-sky-50/50 transition-colors px-3 py-1 rounded-lg ${isActive ? 'text-primary' : ''}`
              }
            >
              Mentorship
            </NavLink>
          </nav>
        </div>
        <div className="flex gap-2 relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-sky-50/50 transition-colors relative"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white" />
          </button>

          {showNotifications && (
            <div className="absolute top-12 right-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="font-bold text-sky-950">Notifications</span>
                <span className="text-xs text-primary font-bold cursor-pointer">Mark all read</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors">
                    <p className="text-sm font-bold text-sky-950">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{n.desc}</p>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">{n.time}</p>
                  </div>
                ))}
              </div>
              <button className="w-full p-3 text-xs font-bold text-slate-500 hover:text-primary transition-colors hover:bg-slate-50">
                View All
              </button>
            </div>
          )}

          <button
            onClick={() => navigate('/aura')}
            className="w-10 h-10 flex items-center justify-center rounded-full text-sky-800 hover:bg-sky-50/50 transition-colors"
            title="Open Aura AI"
          >
            <Bot size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};
