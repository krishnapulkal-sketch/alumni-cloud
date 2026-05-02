import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

type Mode = 'landing' | 'signin' | 'signup';

export const Welcome: React.FC = () => {
  const { signIn, signInWithEmail, createAccount, signInAsGuest, signInError, clearError } = useAuth();
  const [mode, setMode] = useState<Mode>('landing');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSwitch = (m: Mode) => { clearError(); setMode(m); };
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); if (mode === 'signin') await signInWithEmail(email, password); else await createAccount(name, email, password); setLoading(false); };
  const handleGoogle = async () => { setLoading(true); await signIn(); setLoading(false); };

  // Particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    animationDuration: `${8 + Math.random() * 12}s`,
    animationDelay: `${Math.random() * 5}s`,
    size: `${2 + Math.random() * 4}px`,
  }));

  return (
    <div className="min-h-screen flex items-stretch bg-surface overflow-hidden">
      {/* Left Visual Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 xl:p-16 gradient-bg overflow-hidden">
        {/* Particles */}
        <div className="particles-container">
          {particles.map((p, i) => (
            <div key={i} className="particle" style={{ left: p.left, bottom: '-10px', width: p.size, height: p.size, animationDuration: p.animationDuration, animationDelay: p.animationDelay }} />
          ))}
        </div>

        {/* Floating Orbs */}
        <div className="floating-orb w-64 h-64 bg-white/10 blur-[60px] top-20 left-20" style={{ animationDelay: '0s' }} />
        <div className="floating-orb w-80 h-80 bg-sky-400/10 blur-[80px] bottom-20 right-20" style={{ animationDelay: '2s' }} />
        <div className="floating-orb w-40 h-40 bg-violet-400/10 blur-[40px] top-1/2 right-1/3" style={{ animationDelay: '4s' }} />

        <div className="relative z-10">
          <span className="text-white font-headline font-black text-3xl tracking-tighter flex items-center gap-2">
            <Sparkles size={28} className="text-sky-300" /> AlumniCloud
          </span>
        </div>
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl xl:text-5xl font-headline font-extrabold text-white leading-tight">
            <span className="gradient-text">Reconnect.</span><br />
            Grow.<br />
            Inspire.
          </h1>
          <p className="text-sky-200 text-lg xl:text-xl leading-relaxed max-w-sm">
            The alumni network where meaningful connections turn into lifelong opportunities.
          </p>
          <div className="flex items-center gap-4 pt-4">
            {[1,2,3,4].map(i => (
              <img key={i} src={`https://i.pravatar.cc/64?u=av${i}`} alt="" className="w-10 h-10 xl:w-12 xl:h-12 rounded-full ring-4 ring-white/30 object-cover" referrerPolicy="no-referrer" />
            ))}
            <span className="text-sky-200 font-bold text-sm">+12,000 alumni</span>
          </div>
        </div>
        <div className="relative z-10 text-sky-300/60 text-sm">© 2025 AlumniCloud. All rights reserved.</div>
      </div>

      {/* Right Auth Panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-12 sm:py-16 relative">
        <div className="lg:hidden mb-8 sm:mb-10 flex items-center gap-2">
          <Sparkles size={24} className="text-primary" />
          <span className="text-primary font-headline font-black text-2xl tracking-tighter">AlumniCloud</span>
        </div>

        <div className="w-full max-w-md">
          {mode === 'landing' && (
            <div className="space-y-6 sm:space-y-8 fade-in-up">
              <div>
                <h2 className="text-3xl sm:text-4xl font-headline font-extrabold text-sky-950 dark:text-white tracking-tight">Welcome back</h2>
                <p className="text-slate-500 mt-2">Connect with your alumni network today.</p>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <button onClick={() => handleSwitch('signin')} className="w-full py-4 bg-primary text-white font-bold text-base sm:text-lg rounded-2xl clay-button shadow-lg shadow-primary/20 flex items-center justify-center gap-3">
                  <Mail size={20} /> Sign In with Email
                </button>
                <button onClick={handleGoogle} disabled={loading} className="w-full py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-bold text-sm sm:text-base rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary/40 transition-all flex items-center justify-center gap-3 shadow-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Continue with Google
                </button>
                <div className="relative flex items-center gap-4"><div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" /><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">or</span><div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" /></div>
                <button onClick={() => handleSwitch('signup')} className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Create New Account</button>
                <button onClick={signInAsGuest} className="w-full py-2 text-slate-400 font-medium text-sm hover:text-slate-600 transition-colors">Continue as Guest (Preview)</button>
              </div>
              {signInError === 'UNAUTHORIZED_DOMAIN' && (
                <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-5 text-left space-y-2">
                  <p className="font-bold text-amber-800 text-sm">⚠️ Firebase: Domain Not Authorized</p>
                  <p className="text-xs text-amber-700">Go to <strong>Firebase Console → Authentication → Authorized domains</strong> and add <code className="bg-amber-100 px-1 rounded">localhost</code>.</p>
                </div>
              )}
              {signInError && signInError !== 'UNAUTHORIZED_DOMAIN' && <p className="text-center text-sm text-rose-500 font-medium">{signInError}</p>}
            </div>
          )}

          {(mode === 'signin' || mode === 'signup') && (
            <div className="space-y-6 sm:space-y-8 fade-in-up">
              <div>
                <button onClick={() => handleSwitch('landing')} className="text-sm text-slate-400 hover:text-primary mb-4 flex items-center gap-1 font-medium">← Back</button>
                <h2 className="text-3xl sm:text-4xl font-headline font-extrabold text-sky-950 dark:text-white tracking-tight">{mode === 'signin' ? 'Sign In' : 'Create Account'}</h2>
                <p className="text-slate-500 mt-2">{mode === 'signin' ? 'Welcome back to AlumniCloud.' : 'Join the alumni network today.'}</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                    <div className="flex items-center gap-3 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 sm:py-4 focus-within:border-primary transition-colors bg-white dark:bg-slate-800">
                      <User size={18} className="text-slate-400 shrink-0" />
                      <input type="text" required className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-slate-300 dark:text-white" placeholder="Alex Sterling" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Email</label>
                  <div className="flex items-center gap-3 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 sm:py-4 focus-within:border-primary transition-colors bg-white dark:bg-slate-800">
                    <Mail size={18} className="text-slate-400 shrink-0" />
                    <input type="email" required className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-slate-300 dark:text-white" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
                  <div className="flex items-center gap-3 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 sm:py-4 focus-within:border-primary transition-colors bg-white dark:bg-slate-800">
                    <Lock size={18} className="text-slate-400 shrink-0" />
                    <input type={showPass ? 'text' : 'password'} required minLength={6} className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-slate-300 dark:text-white" placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'} value={password} onChange={e => setPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowPass(v => !v)} className="text-slate-400 hover:text-primary">{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                </div>
                {signInError && <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 text-sm text-rose-600 font-medium">{signInError === 'UNAUTHORIZED_DOMAIN' ? 'Domain not authorized.' : signInError}</div>}
                <button type="submit" disabled={loading} className="w-full py-4 sm:py-5 bg-gradient-to-br from-primary to-primary-container text-white font-bold text-base sm:text-lg rounded-2xl clay-button shadow-lg shadow-primary/20 disabled:opacity-60 mt-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : mode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
                <button type="button" onClick={handleGoogle} disabled={loading} className="w-full py-3.5 sm:py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-bold rounded-2xl border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center gap-3 shadow-sm text-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Continue with Google
                </button>
              </form>
              <p className="text-center text-sm text-slate-500">{mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}<button onClick={() => handleSwitch(mode === 'signin' ? 'signup' : 'signin')} className="text-primary font-bold hover:underline">{mode === 'signin' ? 'Create one' : 'Sign in'}</button></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
