import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, Save, X, MapPin, GraduationCap, Briefcase, Sparkles, CheckCircle2, Plus } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { cn } from '../lib/utils';

const EXPERTISE_SUGGESTIONS = [
  'UX Design', 'Product Management', 'Software Engineering', 'Data Science',
  'Marketing', 'Finance', 'Entrepreneurship', 'Machine Learning', 'DevOps',
  'Cybersecurity', 'Cloud Computing', 'Consulting', 'Research', 'Mentorship'
];

export const ProfileEdit: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
  const { profile, updateProfilePhoto } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(profile?.photoURL || '');
  const [expertiseList, setExpertiseList] = useState<string[]>(
    Array.isArray(profile?.expertise) ? profile.expertise : []
  );
  const [expertiseInput, setExpertiseInput] = useState('');
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    classOf: profile?.classOf || '',
    resumeUrl: profile?.resumeUrl || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        location: profile.location || '',
        classOf: profile.classOf || '',
        resumeUrl: profile.resumeUrl || '',
      });
      setExpertiseList(Array.isArray(profile.expertise) ? profile.expertise : []);
      setPhotoPreview(profile.photoURL || '');
    }
  }, [profile]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setPhotoPreview(url);
    };
    reader.readAsDataURL(file);
  };

  const addExpertise = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !expertiseList.includes(trimmed)) {
      setExpertiseList(prev => [...prev, trimmed]);
    }
    setExpertiseInput('');
  };

  const removeExpertise = (tag: string) => {
    setExpertiseList(prev => prev.filter(t => t !== tag));
  };

  const handleSave = async () => {
    if (!profile?.uid) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      // Update local photo state immediately
      if (photoPreview && photoPreview !== profile.photoURL) {
        updateProfilePhoto(photoPreview);
      }

      // Guest users — save locally only
      if (profile.uid === 'guest-123') {
        setSuccess(true);
        setTimeout(() => { setSuccess(false); onCancel(); }, 1500);
        return;
      }

      const docRef = doc(db, 'users', profile.uid);
      await updateDoc(docRef, {
        displayName: formData.displayName,
        bio: formData.bio,
        location: formData.location,
        classOf: formData.classOf,
        resumeUrl: formData.resumeUrl,
        expertise: expertiseList,
        ...(photoPreview !== profile.photoURL ? { photoURL: photoPreview } : {})
      });

      setSuccess(true);
      setTimeout(() => { setSuccess(false); onCancel(); }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] glass-panel flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-8 py-6 border-b border-surface-container-high flex justify-between items-center bg-surface-container-low">
          <h2 className="text-2xl font-headline font-extrabold text-sky-950">Edit Profile</h2>
          <button onClick={onCancel} className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-6 py-4 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}

          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-32 h-32 rounded-full overflow-hidden clay-card p-1 ring-4 ring-primary/20 group-hover:ring-primary/50 transition-all">
                <img
                  src={photoPreview || 'https://picsum.photos/seed/user1/128/128'}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover group-hover:opacity-70 transition-opacity"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-primary/80 text-white rounded-full p-3 shadow-lg">
                  <Camera size={22} />
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium">Click photo to change</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2">Display Name</label>
              <div className="recessed-input flex items-center px-4 py-3 gap-3">
                <Sparkles size={18} className="text-primary" />
                <input
                  className="bg-transparent border-none focus:ring-0 w-full text-sm font-medium"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2">Location</label>
              <div className="recessed-input flex items-center px-4 py-3 gap-3">
                <MapPin size={18} className="text-primary" />
                <input
                  className="bg-transparent border-none focus:ring-0 w-full text-sm font-medium"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2">Class Of</label>
              <div className="recessed-input flex items-center px-4 py-3 gap-3">
                <GraduationCap size={18} className="text-primary" />
                <input
                  className="bg-transparent border-none focus:ring-0 w-full text-sm font-medium"
                  value={formData.classOf}
                  onChange={(e) => setFormData({ ...formData, classOf: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Expertise Tag Builder */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2 flex items-center gap-2">
              <Briefcase size={14} /> Expertise
            </label>
            <div className="flex flex-wrap gap-2 min-h-[40px]">
              {expertiseList.map(tag => (
                <span key={tag} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-sm font-bold shadow-md">
                  {tag}
                  <button onClick={() => removeExpertise(tag)} className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="recessed-input flex items-center px-4 py-3 gap-3">
              <input
                className="bg-transparent border-none focus:ring-0 w-full text-sm font-medium"
                placeholder="Type a skill and press Enter..."
                value={expertiseInput}
                onChange={(e) => setExpertiseInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addExpertise(expertiseInput); } }}
              />
              <button onClick={() => addExpertise(expertiseInput)} className="text-primary hover:scale-110 transition-transform">
                <Plus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <p className="text-xs text-slate-400 font-medium w-full mb-1">Suggestions:</p>
              {EXPERTISE_SUGGESTIONS.filter(s => !expertiseList.includes(s)).slice(0, 8).map(s => (
                <button
                  key={s}
                  onClick={() => addExpertise(s)}
                  className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2">Bio</label>
            <textarea
              className="w-full recessed-input p-4 text-sm font-medium min-h-[120px] resize-none"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2">Resume / CV Link</label>
            <input
              className="w-full recessed-input p-4 text-sm font-medium"
              placeholder="e.g. Google Drive link or Portfolio URL"
              value={formData.resumeUrl}
              onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
            />
            <p className="text-[10px] text-slate-400 ml-2 font-medium">Providing a resume makes it easier to refer you for Jobs.</p>
          </div>
        </div>

        <div className="p-8 bg-surface-container-low flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 py-4 rounded-2xl bg-white text-slate-500 font-bold hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || success}
            className={cn(
              "flex-1 py-4 rounded-2xl font-bold shadow-lg transition-all clay-button flex items-center justify-center gap-2",
              success ? "bg-emerald-500 text-white" : "bg-primary text-white shadow-primary/20"
            )}
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : success ? (
              <><CheckCircle2 size={20} /> Saved!</>
            ) : (
              <><Save size={20} /> Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
