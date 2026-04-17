import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, School, Users, MessageSquare, LogOut, Edit3, MapPin, Mail, Calendar, Briefcase, Award, QrCode, CreditCard, Ticket, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { ProfileEdit } from './ProfileEdit';
import { Gemosphere } from '../components/Gemosphere';
import { useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
  const { profile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const navigate = useNavigate();

  const badges = [
    { icon: <Star size={20} className="text-amber-500" />, name: 'Top Mentor', desc: '10+ Sessions' },
    { icon: <Ticket size={20} className="text-emerald-500" />, name: 'Event Pro', desc: 'Hosted 5 events' },
    { icon: <MessageSquare size={20} className="text-primary" />, name: 'Connector', desc: '50+ mutuals' },
  ];

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
            <div className="pt-6 mt-4 border-t border-slate-100 flex flex-wrap gap-4">
              <button 
                onClick={() => setIsEditing(true)} 
                className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <Edit3 size={18} /> Edit Profile
              </button>
              {profile?.resumeUrl && (
                <button 
                  onClick={() => window.open(profile.resumeUrl.startsWith('http') ? profile.resumeUrl : `https://${profile.resumeUrl}`, '_blank')} 
                  className="px-6 py-3 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors flex items-center gap-2 shadow-sm"
                >
                  View Resume
                </button>
              )}
            </div>
          </div>

          {/* Gamification Stats */}
          <div className="clay-card bg-surface-container-lowest p-8 rounded-3xl space-y-6 relative overflow-hidden group">
            <div className="flex justify-between items-center z-10 relative pointer-events-none">
              <div>
                <h2 className="font-headline text-xl font-bold text-sky-900">Alumni Status</h2>
                <p className="text-sm font-medium text-slate-500">Global Network Rank</p>
              </div>
              <span className="text-sm font-bold text-amber-600 px-3 py-1 bg-amber-100/80 backdrop-blur-md border border-amber-200 rounded-full shadow-sm">Gold Tier</span>
            </div>
            
            <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-slate-900 shadow-inner">
              <Gemosphere level="Gold" />
              <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
                <div className="flex justify-between text-xs font-bold text-white mb-2 tracking-widest uppercase">
                  <span>Level 42</span>
                  <span>8,450 / 10,000 XP</span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden backdrop-blur-md">
                  <div className="bg-amber-400 w-[84.5%] h-full rounded-full shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                </div>
              </div>
            </div>
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
          {/* Digital Alumni ID */}
          <div className="clay-card bg-surface-container-low p-8 rounded-3xl space-y-4 perspective-1000">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-headline text-xl font-bold text-sky-900 flex items-center gap-2">
                <CreditCard size={20} /> Digital ID
              </h2>
              <button 
                onClick={() => setIsFlipped(!isFlipped)} 
                className="text-xs font-bold text-primary px-3 py-1 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"
              >
                Flip Card
              </button>
            </div>
            
            <div className="relative w-full aspect-[1.58] transition-transform duration-700 preserve-3d cursor-pointer" onClick={() => setIsFlipped(!isFlipped)} style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
              {/* Front Side */}
              <div className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-sky-950 via-primary to-sky-800 p-6 flex flex-col justify-between shadow-xl border border-white/20 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[30px] -translate-y-1/2 translate-x-1/4" />
                <div className="flex justify-between items-start z-10 relative">
                  <div className="text-white">
                    <h3 className="font-headline font-black text-2xl tracking-tighter">AlumniCloud</h3>
                    <p className="text-[10px] font-bold text-sky-200 uppercase tracking-widest mt-1">Global Network</p>
                  </div>
                  <School size={32} className="text-white/40" />
                </div>
                <div className="z-10 relative flex items-end justify-between">
                  <div>
                    <p className="text-white font-extrabold text-xl">{profile?.displayName || 'Alex Sterling'}</p>
                    <p className="text-sky-200 text-xs font-medium mt-1">Class of {profile?.classOf || '2018'}</p>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-lg p-1">
                    <QrCode className="w-full h-full text-sky-950" />
                  </div>
                </div>
              </div>

              {/* Back Side */}
              <div className="absolute inset-0 backface-hidden rounded-2xl bg-white p-6 shadow-xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-4" style={{ transform: 'rotateY(180deg)' }}>
                <div className="w-full h-12 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 px-4 mt-2">
                  <span className="font-mono font-bold tracking-[0.2em] text-slate-500">AC-{profile?.uid?.substring(0,8) || '2948-5712'}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Valid Alumni Pass</p>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 w-full transition-colors">Add to Apple Wallet</button>
                </div>
              </div>
            </div>
          </div>

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

          {/* Badges */}
          <div className="clay-card bg-surface-container-low p-8 rounded-3xl space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-headline text-xl font-bold text-sky-900 flex items-center gap-2">
                <Award size={20} /> Achievements
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              {badges.map((badge, i) => (
                <div key={i} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                    {badge.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-sky-950 text-sm">{badge.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
