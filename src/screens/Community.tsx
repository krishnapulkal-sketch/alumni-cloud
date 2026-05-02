import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { MessageSquare, ThumbsUp, Share2, Send, TrendingUp, Users, Briefcase, HelpCircle, Plus, Image, BarChart3, Award, Filter, X, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

type PostType = 'text' | 'poll' | 'achievement' | 'referral';
type Category = 'all' | 'general' | 'career' | 'tech' | 'events' | 'opportunities';

interface Post {
  id: string;
  author: { name: string; photo: string; role: string; };
  type: PostType;
  category: Category;
  content: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  liked: boolean;
  pollOptions?: { text: string; votes: number; }[];
  badge?: string;
}

const MOCK_POSTS: Post[] = [
  { id: '1', author: { name: 'Elena Vance', photo: 'https://i.pravatar.cc/150?u=elena', role: 'Founder at Lumina' }, type: 'text', category: 'career', content: "Just closed our Series B! 🎉 The alumni network here was instrumental in connecting us with the right investors. If you're looking to fundraise, happy to share our pitch deck framework.", likes: 42, comments: 12, shares: 8, timestamp: '2h ago', liked: false },
  { id: '2', author: { name: 'Raj Mehta', photo: 'https://i.pravatar.cc/150?u=raj', role: 'Head of Engineering at Scale AI' }, type: 'poll', category: 'tech', content: "What's your primary programming language in 2025?", likes: 28, comments: 5, shares: 3, timestamp: '4h ago', liked: false, pollOptions: [{ text: 'TypeScript', votes: 45 }, { text: 'Python', votes: 38 }, { text: 'Rust', votes: 22 }, { text: 'Go', votes: 15 }] },
  { id: '3', author: { name: 'Priya Sharma', photo: 'https://i.pravatar.cc/150?u=priya', role: 'Senior Designer at Figma' }, type: 'achievement', category: 'general', content: "Just hit Diamond tier on AlumniCloud! 💎 Thanks to everyone who's been part of this journey. The mentorship program here changed my career trajectory.", likes: 56, comments: 18, shares: 4, timestamp: '6h ago', liked: false, badge: '💎 Diamond Tier' },
  { id: '4', author: { name: 'David Kim', photo: 'https://i.pravatar.cc/150?u=david2', role: 'Engineering Manager at Databricks' }, type: 'referral', category: 'opportunities', content: "We're hiring Senior Data Engineers at Databricks! Remote-friendly. If you're interested, I can refer you directly. DM me with your resume.", likes: 34, comments: 22, shares: 15, timestamp: '8h ago', liked: false },
  { id: '5', author: { name: 'Sarah Chen', photo: 'https://i.pravatar.cc/150?u=sarah2', role: 'Quantum Research Lead' }, type: 'text', category: 'events', content: "Hosting a virtual workshop on 'Quantum Computing for Engineers' next Friday. Open to all alumni. Link in comments!", likes: 19, comments: 8, shares: 6, timestamp: '12h ago', liked: false },
];

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  all: <TrendingUp size={14} />, general: <Users size={14} />, career: <Briefcase size={14} />,
  tech: <BarChart3 size={14} />, events: <Award size={14} />, opportunities: <HelpCircle size={14} />,
};

export const Community: React.FC = () => {
  const { profile } = useAuth();
  const { addXP, completeChallenge } = useGamification();
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [newPostType, setNewPostType] = useState<PostType>('text');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked } : p));
  };

  const handleCreatePost = () => {
    if (!newPost.trim()) return;
    const post: Post = {
      id: `new-${Date.now()}`, author: { name: profile?.displayName || 'You', photo: profile?.photoURL || '', role: 'Alumni' },
      type: newPostType, category: 'general', content: newPost, likes: 0, comments: 0, shares: 0, timestamp: 'Just now', liked: false,
    };
    setPosts([post, ...posts]);
    setNewPost('');
    setShowCreate(false);
    addXP(25, 'Created a community post');
    showToast('🎉 Post published! +25 XP');
  };

  const filtered = activeCategory === 'all' ? posts : posts.filter(p => p.category === activeCategory);

  return (
    <main className="pt-24 pb-32 px-4 sm:px-6 max-w-3xl mx-auto">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 slide-up">
          <CheckCircle2 size={22} /><span className="font-bold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-headline font-extrabold text-sky-950 tracking-tight">Community</h1>
        <p className="text-slate-500 mt-1">Connect, share, and grow with fellow alumni</p>
      </div>

      {/* Create Post */}
      <div className="clay-card p-4 sm:p-6 rounded-2xl mb-6">
        {!showCreate ? (
          <button onClick={() => setShowCreate(true)} className="w-full flex items-center gap-4 text-left">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              {profile?.photoURL ? <img src={profile.photoURL} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" /> : <Users size={18} className="text-primary" />}
            </div>
            <span className="text-slate-400 font-medium">Share something with the community...</span>
            <Plus size={20} className="text-primary ml-auto shrink-0" />
          </button>
        ) : (
          <div className="space-y-4">
            <textarea className="w-full bg-slate-50 rounded-xl p-4 border border-slate-200 text-sm resize-none h-24 focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="What's on your mind?" value={newPost} onChange={e => setNewPost(e.target.value)} autoFocus />
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {(['text', 'poll', 'achievement', 'referral'] as PostType[]).map(t => (
                  <button key={t} onClick={() => setNewPostType(t)} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize", newPostType === t ? "bg-primary text-white" : "bg-slate-100 text-slate-500")}>{t}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-slate-400 font-bold">Cancel</button>
                <button onClick={handleCreatePost} disabled={!newPost.trim()} className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold disabled:opacity-40"><Send size={14} className="inline mr-1" /> Post</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['all', 'general', 'career', 'tech', 'events', 'opportunities'] as Category[]).map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 capitalize", activeCategory === cat ? "bg-sky-950 text-white shadow-md" : "bg-white text-slate-500 border border-slate-200")}>
            {CATEGORY_ICONS[cat]} {cat}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {filtered.map((post, i) => (
          <div key={post.id} className="clay-card p-5 sm:p-6 rounded-2xl space-y-4 fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
            {/* Author */}
            <div className="flex items-center gap-3">
              <img src={post.author.photo} alt={post.author.name} className="w-11 h-11 rounded-full object-cover" referrerPolicy="no-referrer" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sky-950 text-sm">{post.author.name}</p>
                <p className="text-xs text-slate-400">{post.author.role} · {post.timestamp}</p>
              </div>
              {post.type !== 'text' && (
                <span className={cn("px-2 py-1 rounded-lg text-[10px] font-bold uppercase", post.type === 'referral' ? "bg-emerald-100 text-emerald-700" : post.type === 'achievement' ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary")}>{post.type}</span>
              )}
            </div>

            {/* Content */}
            <p className="text-sm text-slate-700 leading-relaxed">{post.content}</p>

            {/* Badge */}
            {post.badge && (
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="text-2xl">{post.badge.split(' ')[0]}</span>
                <span className="text-sm font-bold text-amber-800">{post.badge}</span>
              </div>
            )}

            {/* Poll */}
            {post.pollOptions && (
              <div className="space-y-2">
                {post.pollOptions.map((opt, j) => {
                  const totalVotes = post.pollOptions!.reduce((s, o) => s + o.votes, 0);
                  const pct = Math.round((opt.votes / totalVotes) * 100);
                  return (
                    <div key={j} className="relative bg-slate-50 rounded-xl overflow-hidden border border-slate-100 cursor-pointer hover:border-primary/20 transition-colors">
                      <div className="absolute inset-y-0 left-0 bg-primary/10 rounded-xl" style={{ width: `${pct}%` }} />
                      <div className="relative px-4 py-3 flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-700">{opt.text}</span>
                        <span className="text-xs font-bold text-slate-400">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1 pt-2 border-t border-slate-100">
              <button onClick={() => handleLike(post.id)} className={cn("flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all", post.liked ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-slate-50")}>
                <ThumbsUp size={14} /> {post.likes}
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-50"><MessageSquare size={14} /> {post.comments}</button>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-50"><Share2 size={14} /> {post.shares}</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};
