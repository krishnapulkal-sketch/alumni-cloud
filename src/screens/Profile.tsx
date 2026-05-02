import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { Sparkles, School, Users, MessageSquare, LogOut, Edit3, MapPin, Mail, Calendar, Briefcase, Award, QrCode, CreditCard, Star, Trophy, Flame, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { ProfileEdit } from './ProfileEdit';
import { Gemosphere } from '../components/Gemosphere';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const Profile: React.FC = () => {
  const { profile: myProfile, user, logout } = useAuth();
  const { xp, level, tier, streak, badges, xpProgress, xpToNextLevel } = useGamification();
  const { id } = useParams();
  const [targetProfile, setTargetProfile] = useState<any>(null);
  const [loading, setLoading] = useState(!!id);
  const [isEditing, setIsEditing] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const navigate = useNavigate();

  const isMe = !id || id === user?.uid;
  const profile = isMe ? myProfile : targetProfile;

  useEffect(() => {
    if (id && id !== user?.uid) {
      setLoading(true);
      getDoc(doc(db, 'users', id)).then(snap => { if (snap.exists()) setTargetProfile(snap.data()); }).catch(console.error).finally(() => setLoading(false));
    } else { setLoading(false); }
  }, [id, user?.uid]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!profile && !isMe) return <main className="pt-32 px-6 flex flex-col items-center justify-center text-center space-y-4"><Users size={40} className="text-slate-400" /><h2 className="text-2xl font-bold text-sky-950 dark:text-white">Profile not found</h2><button onClick={() => navigate(-1)} className="text-primary font-bold">Go Back</button></main>;

  const earnedBadges = badges.filter(b => b.earned);
  const TIER_COLORS: Record<string, string> = { Bronze: 'from-amber-700 to-amber-500', Silver: 'from-slate-400 to-slate-300', Gold: 'from-amber-400 to-yellow-300', Platinum: 'from-slate-300 to-white', Diamond: 'from-cyan-300 to-blue-200' };

  return (
    <main className="pt-24 px-4 sm:px-6 max-w-4xl mx-auto space-y-6 sm:space-y-10 pb-28 sm:pb-32">
      {isEditing && <ProfileEdit onCancel={() => setIsEditing(false)} />}

      {/* Profile Header */}
      <section className="flex flex-col items-center text-center space-y-4 sm:space-y-6">
        <div className="relative group">
          <div className="w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full p-2 bg-surface-container-lowest clay-card overflow-hidden">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-slate-700">
              <img src={profile?.photoURL || "https://i.pravatar.cc/200?u=user1"} alt="Profile" className="w-full h-full object-cover scale-110 group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
            </div>
          </div>
          {isMe && <button onClick={() => setIsEditing(true)} className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-slate-700 text-primary border-4 border-surface dark:border-slate-900 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"><Edit3 size={18} /></button>}
        </div>
        <div className="space-y-2">
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-sky-950 dark:text-white">{profile?.displayName || 'Alex Sterling'}</h1>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-slate-500 dark:text-slate-400 font-medium text-sm">
            <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-primary/60" /> {profile?.expertise?.[0] || 'Senior Product Designer'}</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary/60" /> {profile?.location || 'Seattle, WA'}</span>
            <span className="flex items-center gap-1.5"><Calendar size={14} className="text-primary/60" /> Class of {profile?.classOf || '2018'}</span>
          </div>
        </div>
        <div className="flex gap-3 sm:gap-4 w-full justify-center">
          {isMe ? (
            <button onClick={logout} className="flex-1 max-w-[160px] h-12 sm:h-14 rounded-xl bg-surface-container-lowest dark:bg-slate-800 text-primary font-bold clay-card flex items-center justify-center gap-2 hover:scale-105 transition-all text-sm"><LogOut size={16} /> Logout</button>
          ) : (
            <button onClick={() => navigate('/messages')} className="flex-1 max-w-[160px] h-12 sm:h-14 rounded-xl bg-primary text-white font-bold clay-card flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-lg text-sm"><MessageSquare size={16} /> Message</button>
          )}
        </div>
      </section>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
        <div className="md:col-span-7 space-y-6 sm:space-y-8">
          {/* Bio */}
          <div className="clay-card p-6 sm:p-8 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 text-sky-800 dark:text-sky-400"><Sparkles size={20} /><h2 className="font-headline text-lg sm:text-xl font-bold">Bio</h2></div>
            <p className="text-on-surface/80 dark:text-slate-400 leading-relaxed text-sm sm:text-lg">{profile?.bio || (isMe ? "Tell us about yourself..." : "No bio yet.")}</p>
            {isMe && <button onClick={() => setIsEditing(true)} className="px-5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-sm flex items-center gap-2"><Edit3 size={14} /> Edit Profile</button>}
          </div>

          {/* Gamification — Real Data */}
          <div className="clay-card p-6 sm:p-8 rounded-3xl space-y-6 relative overflow-hidden">
            <div className="flex justify-between items-center z-10 relative">
              <div><h2 className="font-headline text-lg sm:text-xl font-bold text-sky-900 dark:text-white">Alumni Status</h2><p className="text-sm font-medium text-slate-500">Global Network Rank</p></div>
              <span className={cn("text-sm font-bold px-3 py-1 rounded-full bg-gradient-to-r text-white shadow-sm", TIER_COLORS[tier] || TIER_COLORS.Bronze)}>{tier} Tier</span>
            </div>
            <div className="relative h-48 sm:h-64 w-full rounded-2xl overflow-hidden bg-slate-900 shadow-inner">
              <Gemosphere level={tier} />
              <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
                <div className="flex justify-between text-xs font-bold text-white mb-2 tracking-widest uppercase">
                  <span>Level {level}</span>
                  <span>{xp.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP</span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden backdrop-blur-md">
                  <div className="bg-amber-400 h-full rounded-full shadow-[0_0_10px_rgba(251,191,36,0.8)] transition-all duration-1000" style={{ width: `${xpProgress}%` }} />
                </div>
              </div>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-3 text-center"><p className="text-xs text-slate-400">XP</p><p className="text-lg font-bold text-sky-950 dark:text-white">{xp.toLocaleString()}</p></div>
              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-3 text-center"><p className="text-xs text-slate-400">Streak</p><p className="text-lg font-bold text-orange-500 flex items-center justify-center gap-1"><Flame size={16} />{streak}d</p></div>
              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-3 text-center"><p className="text-xs text-slate-400">Badges</p><p className="text-lg font-bold text-sky-950 dark:text-white">{earnedBadges.length}</p></div>
            </div>
          </div>

          {/* Contact */}
          <div className="clay-card p-6 sm:p-8 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 text-sky-800 dark:text-sky-400"><Mail size={20} /><h2 className="font-headline text-lg sm:text-xl font-bold">Contact</h2></div>
            <p className="text-on-surface/60 dark:text-slate-400 font-medium">{profile?.email || 'alex.sterling@alumni.edu'}</p>
          </div>
        </div>

        <div className="md:col-span-5 space-y-6 sm:space-y-8">
          {/* Digital ID */}
          <div className="clay-card bg-surface-container-low dark:bg-slate-800 p-6 sm:p-8 rounded-3xl space-y-4 perspective-1000">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-headline text-lg sm:text-xl font-bold text-sky-900 dark:text-white flex items-center gap-2"><CreditCard size={18} /> Digital ID</h2>
              <button onClick={() => setIsFlipped(!isFlipped)} className="text-xs font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">Flip</button>
            </div>
            <div className="relative w-full aspect-[1.58] transition-transform duration-700 preserve-3d cursor-pointer" onClick={() => setIsFlipped(!isFlipped)} style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
              <div className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-sky-950 via-primary to-sky-800 p-5 sm:p-6 flex flex-col justify-between shadow-xl border border-white/20 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[30px] -translate-y-1/2 translate-x-1/4" />
                <div className="flex justify-between items-start z-10 relative"><div className="text-white"><h3 className="font-headline font-black text-xl sm:text-2xl tracking-tighter">AlumniCloud</h3><p className="text-[10px] font-bold text-sky-200 uppercase tracking-widest mt-1">Global Network</p></div><School size={28} className="text-white/40" /></div>
                <div className="z-10 relative flex items-end justify-between"><div><p className="text-white font-extrabold text-lg sm:text-xl">{profile?.displayName || 'Alex Sterling'}</p><p className="text-sky-200 text-xs mt-1">Class of {profile?.classOf || '2018'} · {tier}</p></div><div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg p-1"><QrCode className="w-full h-full text-sky-950" /></div></div>
              </div>
              <div className="absolute inset-0 backface-hidden rounded-2xl bg-white dark:bg-slate-700 p-6 shadow-xl border border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center text-center space-y-4" style={{ transform: 'rotateY(180deg)' }}>
                <div className="w-full h-12 bg-slate-100 dark:bg-slate-600 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-500 px-4"><span className="font-mono font-bold tracking-[0.2em] text-slate-500 dark:text-slate-300">AC-{profile?.uid?.substring(0,8) || '2948-5712'}</span></div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Valid Alumni Pass</p>
              </div>
            </div>
          </div>

          {/* Expertise */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2">Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {(profile?.expertise?.length > 0 ? profile.expertise : ['UX Design', 'Figma', 'Mentorship', 'Strategy']).map((skill: string) => (
                <span key={skill} className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-primary text-on-primary text-xs sm:text-sm font-bold shadow-md">{skill}</span>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="clay-card p-6 sm:p-8 rounded-3xl space-y-4 sm:space-y-6">
            <h2 className="font-headline text-lg sm:text-xl font-bold text-sky-900 dark:text-white flex items-center gap-2"><Award size={18} /> Achievements ({earnedBadges.length}/{badges.length})</h2>
            <div className="flex flex-col gap-3">
              {badges.slice(0, 6).map((badge) => (
                <div key={badge.id} className={cn("flex items-center gap-3 p-3 rounded-2xl border transition-all", badge.earned ? "bg-white dark:bg-slate-700 border-slate-100 dark:border-slate-600 shadow-sm" : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 opacity-50")}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-50 dark:bg-slate-600 flex items-center justify-center text-xl shrink-0">{badge.icon}</div>
                  <div><h4 className="font-bold text-sky-950 dark:text-white text-sm">{badge.name}</h4><p className="text-xs text-slate-500 dark:text-slate-400">{badge.description}</p></div>
                  {badge.earned && <Star size={14} className="text-amber-400 ml-auto shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Connections */}
          <div className="clay-card p-6 sm:p-8 rounded-3xl space-y-4 sm:space-y-6">
            <div className="flex justify-between items-center"><h2 className="font-headline text-lg sm:text-xl font-bold text-sky-900 dark:text-white">Connections</h2><span className="text-sm font-bold text-primary px-3 py-1 bg-white dark:bg-slate-700 rounded-full shadow-sm">42 Mutual</span></div>
            <div className="flex -space-x-3 overflow-hidden py-2">
              {[1,2,3].map(i => <img key={i} src={`https://i.pravatar.cc/64?u=conn${i}`} alt="Connection" className="inline-block h-12 w-12 sm:h-14 sm:w-14 rounded-full ring-4 ring-white dark:ring-slate-800" referrerPolicy="no-referrer" />)}
              <div className="inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-surface-container-highest dark:bg-slate-700 ring-4 ring-white dark:ring-slate-800 text-xs font-bold text-slate-500">+39</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
