import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, Save, X, MapPin, GraduationCap, Briefcase, Sparkles, CheckCircle2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { cn } from '../lib/utils';

export const ProfileEdit: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    classOf: profile?.classOf || '',
    expertise: Array.isArray(profile?.expertise) ? profile.expertise.join(', ') : ''
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
        expertise: Array.isArray(profile.expertise) ? profile.expertise.join(', ') : ''
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile?.uid) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const docRef = doc(db, 'users', profile.uid);
      const expertiseArray = formData.expertise
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== '');

      await updateDoc(docRef, {
        displayName: formData.displayName,
        bio: formData.bio,
        location: formData.location,
        classOf: formData.classOf,
        expertise: expertiseArray
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onCancel();
      }, 1500);
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
          {/* Avatar Edit */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden clay-card p-1">
                <img 
                  src={profile?.photoURL || "https://picsum.photos/seed/user1/128/128"} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <Camera size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2">Display Name</label>
              <div className="recessed-input flex items-center px-4 py-3 gap-3">
                <Sparkles size={18} className="text-primary" />
                <input 
                  className="bg-transparent border-none focus:ring-0 w-full text-sm font-medium" 
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, classOf: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2">Expertise (comma separated)</label>
              <div className="recessed-input flex items-center px-4 py-3 gap-3">
                <Briefcase size={18} className="text-primary" />
                <input 
                  className="bg-transparent border-none focus:ring-0 w-full text-sm font-medium" 
                  value={formData.expertise}
                  onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2">Bio</label>
            <textarea 
              className="w-full recessed-input p-4 text-sm font-medium min-h-[120px] resize-none"
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
            />
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
              <>
                <CheckCircle2 size={20} />
                Saved!
              </>
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
