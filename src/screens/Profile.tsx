import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, School, Users, MessageSquare, LogOut, Edit3, MapPin, Mail, Calendar, Briefcase } from 'lucide-react';
import { cn } from '../lib/utils';
import { ProfileEdit } from './ProfileEdit';
import { useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
  const { profile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  return (
    <main className="pt-24 px-6 max-w-4xl mx-auto space-y-10 pb-32">
      {isEditing && <ProfileEdit onCancel={() => setIsEditing(false)} />}
      {/* Profile Header Section */}
      <section className="flex flex-col items-center text-center space-y-6">
        <div className="relative group">
          <div className="w-48 h-48 md:w-56 md:h-56 rounded-full p-2 bg-surface-container-lowest clay-card overflow-hidden">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white">
              <img 
                src={profile?.photoURL || "https://picsum.photos/seed/user1/200/200"} 
                alt="Profile" 
                className="w-full h-full object-cover scale-110 group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute bottom-4 right-4 w-12 h-12 bg-white text-primary border-4 border-surface rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Edit3 size={20} />
          </button>
        </div>
        <div className="space-y-2">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-sky-950">
            {profile?.displayName || 'Alex Sterling'}
          </h1>
          <div className="flex flex-wrap justify-center gap-4 text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><Briefcase size={16} className="text-primary/60" /> {profile?.expertise?.[0] || 'Senior Product Designer'}</span>
            <span className="flex items-center gap-1.5"><MapPin size={16} className="text-primary/60" /> {profile?.location || 'Seattle, WA'}</span>
            <span className="flex items-center gap-1.5"><Calendar size={16} className="text-primary/60" /> Class of {profile?.classOf || '2018'}</span>
          </div>
        </div>
        <div className="flex gap-4 w-full justify-center">
          <button 
            onClick={() => navigate('/messages')}
            className="flex-1 max-w-[160px] h-14 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white font-bold tracking-wide clay-button hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare size={18} />
            Message
          </button>
          <button 
            onClick={logout}
            className="flex-1 max-w-[160px] h-14 rounded-xl bg-surface-container-lowest text-primary font-bold tracking-wide clay-card flex items-center justify-center gap-2 hover:scale-105 transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </section>

      {/* Asymmetric Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7 space-y-8">
          {/* Bio Card */}
          <div className="clay-card bg-surface-container-lowest p-8 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 text-sky-800">
              <Sparkles size={24} />
              <h2 className="font-headline text-xl font-bold">Bio</h2>
            </div>
            <p className="text-on-surface/80 leading-relaxed text-lg tracking-wide">
              {profile?.bio || "Passionate about creating human-centric digital experiences. Alumni mentor for the Design Hub. I believe in the power of networking to foster innovation and sustainable design practices."}
            </p>
          </div>

          {/* Contact Info */}
          <div className="clay-card bg-surface-container-lowest p-8 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 text-sky-800">
              <Mail size={24} />
              <h2 className="font-headline text-xl font-bold">Contact</h2>
            </div>
            <p className="text-on-surface/60 font-medium">{profile?.email || 'alex.sterling@alumni.edu'}</p>
          </div>
        </div>

        <div className="md:col-span-5 space-y-8">
          {/* Connections Card */}
          <div className="clay-card bg-surface-container-low p-8 rounded-3xl space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-headline text-xl font-bold text-sky-900">Connections</h2>
              <span className="text-sm font-bold text-primary px-3 py-1 bg-white rounded-full shadow-sm">42 Mutual</span>
            </div>
            <div className="flex -space-x-4 overflow-hidden py-2">
              {[1, 2, 3].map(i => (
                <img 
                  key={i}
                  src={`https://picsum.photos/seed/conn${i}/64/64`} 
                  alt="Connection" 
                  className="inline-block h-14 w-14 rounded-full ring-4 ring-white"
                  referrerPolicy="no-referrer"
                />
              ))}
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-highest ring-4 ring-white text-xs font-bold text-slate-500">
                +39
              </div>
            </div>
            <button className="w-full py-4 text-primary font-bold text-sm tracking-widest uppercase hover:text-primary-dim transition-colors">
              View All Network
            </button>
          </div>

          {/* Expertise Pebble Chips */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2">Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {(profile?.expertise?.length > 0 ? profile.expertise : ['UX Design', 'Figma', 'Mentorship', 'Strategy']).map(skill => (
                <span key={skill} className="px-5 py-2.5 rounded-full bg-primary text-on-primary text-sm font-bold shadow-md">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
