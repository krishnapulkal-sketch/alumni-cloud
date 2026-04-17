import React, { useState, useRef } from 'react';
import { Image, Filter, Heart, MessageCircle, Share2, Plus, X, Upload, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

interface Photo {
  id: number;
  url: string;
  title: string;
  likes: number;
  liked: boolean;
  comments: string[];
  category: string;
  uploader: string;
}

const CATEGORIES = ['All', 'Campus', 'Events', 'Reunions', 'Labs', 'My Uploads'];

const initialPhotos: Photo[] = [
  { id: 1, url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAorflrmEpy3OpKjzEfoEEwnBcIH5WnMupSLnjF8kv46_JwEW84aFwmOaxjOR5Qr4rqJGLYHeuQ6PzdWogoyG1175cm3vfSV9C9rNpTQ4t4WxeLhgdjJ96JNg_75bNTqQuA3lo-xHnSA8Ky6B2RE8Ef8Hj5wBqpKJNHZKQxZ2h-sMicDSxkVWg5yQGAhwB6Rouilw_RTa3yjjZjwPtRbi066wgfuYgLEpzUS43szb2LwSTmkKV9lKLako1FW30SINCwx61DFgoQPoE', title: 'Reunion 2023', likes: 124, liked: false, comments: ['Amazing memories!'], category: 'Reunions', uploader: 'Alumni' },
  { id: 2, url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCW0c1i40u1oPro6WHXtqhMCm4hyGLO3LQWg3VMFW7Swy1WshHMJ6fgXs_8ZSwz1xjJJq_JF_0KXt_Vdr2nV2GRORfHfaFFDVbGZBvSoZFYaqjvGmVH2pCTp-y6upi_fAKgd2QP7PC4GJvHT76yk7EPAOB_8wO87Gy1IbgtKELShst5MQSiV2YfhgcOqGXdW-44IXaCFGQVkWq03sihGG6k0T_wfjIrGhJdzKDwlIyRRV0Pb5e8ToMC7APwCjOh4Aq8GV2mhdcYaM8', title: 'Campus Hub', likes: 89, liked: false, comments: [], category: 'Campus', uploader: 'Alumni' },
  { id: 3, url: 'https://picsum.photos/seed/campus1/800/600', title: 'Library Sunset', likes: 210, liked: false, comments: ['Love this spot!'], category: 'Campus', uploader: 'Alumni' },
  { id: 4, url: 'https://picsum.photos/seed/campus2/800/600', title: 'Graduation Day', likes: 542, liked: false, comments: [], category: 'Events', uploader: 'Alumni' },
  { id: 5, url: 'https://picsum.photos/seed/campus3/800/600', title: 'Design Lab', likes: 67, liked: false, comments: [], category: 'Labs', uploader: 'Alumni' },
  { id: 6, url: 'https://picsum.photos/seed/campus4/800/600', title: 'Alumni Dinner', likes: 156, liked: false, comments: ['Best night!'], category: 'Events', uploader: 'Alumni' },
];

export const Gallery: React.FC = () => {
  const { profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [activeFilter, setActiveFilter] = useState('All');
  const [showFilter, setShowFilter] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Campus');
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [commentingId, setCommentingId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');

  const filteredPhotos = photos.filter(p => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'My Uploads') return p.uploader === (profile?.displayName || 'You');
    return p.category === activeFilter;
  });

  const toggleLike = (id: number) => {
    setPhotos(prev => prev.map(p =>
      p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };

  const submitComment = (id: number) => {
    if (!commentText.trim()) return;
    setPhotos(prev => prev.map(p =>
      p.id === id ? { ...p, comments: [...p.comments, commentText.trim()] } : p
    ));
    setCommentText('');
    setCommentingId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setUploadPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!uploadPreview || !uploadTitle.trim()) return;
    const newPhoto: Photo = {
      id: Date.now(),
      url: uploadPreview,
      title: uploadTitle,
      likes: 0,
      liked: false,
      comments: [],
      category: uploadCategory,
      uploader: profile?.displayName || 'You'
    };
    setPhotos(prev => [newPhoto, ...prev]);
    setShowUpload(false);
    setUploadPreview(null);
    setUploadTitle('');
    setUploadCategory('Campus');
  };

  return (
    <main className="pt-24 pb-32 px-6 max-w-screen-xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-headline font-extrabold text-sky-950 tracking-tight">Community Gallery</h1>
          <p className="text-slate-500 font-medium">Preserving memories, one frame at a time.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto relative">
          <div className="relative">
            <button
              onClick={() => setShowFilter(v => !v)}
              className="flex-1 md:flex-none glass-panel px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-primary font-bold shadow-sm"
            >
              <Filter size={18} />
              {activeFilter}
              <ChevronDown size={14} className={cn("transition-transform", showFilter && "rotate-180")} />
            </button>
            {showFilter && (
              <div className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden min-w-[160px] animate-in fade-in slide-in-from-top-2 duration-200">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setActiveFilter(cat); setShowFilter(false); }}
                    className={cn(
                      "w-full text-left px-5 py-3 text-sm font-bold transition-colors",
                      activeFilter === cat ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex-1 md:flex-none bg-primary text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary/20 clay-button"
          >
            <Plus size={18} />
            Upload
          </button>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-[100] glass-panel flex items-center justify-center p-6 animate-in fade-in duration-300" onClick={() => setShowUpload(false)}>
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
              <h2 className="text-xl font-headline font-extrabold text-sky-950">Upload to Gallery</h2>
              <button onClick={() => setShowUpload(false)} className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              {/* Image Picker */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "w-full h-48 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden",
                  uploadPreview ? "border-none p-0" : "bg-slate-50"
                )}
              >
                {uploadPreview ? (
                  <img src={uploadPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Upload size={32} className="text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-400">Click to select image</p>
                  </>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Title</label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary"
                  placeholder="Enter a title..."
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Category</label>
                <select
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary"
                  value={uploadCategory}
                  onChange={e => setUploadCategory(e.target.value)}
                >
                  {CATEGORIES.filter(c => c !== 'All' && c !== 'My Uploads').map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleUpload}
                disabled={!uploadPreview || !uploadTitle.trim()}
                className="w-full py-4 rounded-2xl bg-primary text-white font-bold clay-button disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Publish to Gallery
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
        {filteredPhotos.length === 0 && (
          <p className="col-span-full text-center py-20 text-slate-400 font-medium italic">No photos found in this category.</p>
        )}
        {filteredPhotos.map((photo) => (
          <div key={photo.id} className="break-inside-avoid group">
            <div className="clay-card overflow-hidden p-2 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
              <div className="relative rounded-xl overflow-hidden mb-4">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                  <button
                    onClick={() => toggleLike(photo.id)}
                    className={cn(
                      "w-12 h-12 rounded-full backdrop-blur-md text-white flex items-center justify-center transition-colors",
                      photo.liked ? "bg-rose-500/80 hover:bg-rose-600/80" : "bg-white/20 hover:bg-white/40"
                    )}
                  >
                    <Heart size={22} fill={photo.liked ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={() => setCommentingId(commentingId === photo.id ? null : photo.id)}
                    className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/40 transition-colors"
                  >
                    <MessageCircle size={22} />
                  </button>
                </div>
              </div>

              <div className="px-4 pb-2 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-on-surface">{photo.title}</h3>
                  <p className="text-xs text-slate-400 font-medium">by {photo.uploader} • {photo.category}</p>
                </div>
                <button
                  onClick={() => toggleLike(photo.id)}
                  className="flex items-center gap-1.5 text-sm font-bold transition-colors"
                >
                  <Heart
                    size={16}
                    fill={photo.liked ? "currentColor" : "none"}
                    className={photo.liked ? "text-rose-500" : "text-primary"}
                  />
                  <span className={photo.liked ? "text-rose-500" : "text-primary"}>{photo.likes}</span>
                </button>
              </div>

              {/* Comments */}
              {photo.comments.length > 0 && (
                <div className="px-4 pb-2 space-y-1">
                  {photo.comments.slice(-2).map((c, i) => (
                    <p key={i} className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-1.5">"{c}"</p>
                  ))}
                </div>
              )}

              {commentingId === photo.id && (
                <div className="px-4 pb-4 flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <input
                    className="flex-1 text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submitComment(photo.id)}
                    autoFocus
                  />
                  <button
                    onClick={() => submitComment(photo.id)}
                    className="px-3 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90"
                  >
                    Post
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};
