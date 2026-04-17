import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, Chrome } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === 'signin') {
      await signInWithEmail(email, password);
    } else {
      await createAccount(name, email, password);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    await signIn();
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-stretch bg-surface overflow-hidden">
      {/* Left Visual Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 bg-gradient-to-br from-sky-900 via-primary to-sky-600 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-white/20 blur-3xl" />
        </div>
        <div className="relative z-10">
          <span className="text-white font-headline font-black text-3xl tracking-tighter">AlumniCloud</span>
        </div>
        <div className="relative z-10 space-y-6">
          <h1 className="text-5xl font-headline font-extrabold text-white leading-tight">
            Reconnect.<br />Grow.<br />Inspire.
          </h1>
          <p className="text-sky-200 text-xl leading-relaxed max-w-sm">
            The alumni network where meaningful connections turn into lifelong opportunities.
          </p>
          <div className="flex items-center gap-4 pt-4">
            {[1,2,3,4].map(i => (
              <img key={i} src={`https://picsum.photos/seed/av${i}/64/64`} alt="" className="w-12 h-12 rounded-full ring-4 ring-white/30 object-cover" referrerPolicy="no-referrer" />
            ))}
            <span className="text-sky-200 font-bold text-sm">+12,000 alumni</span>
          </div>
        </div>
        <div className="relative z-10 text-sky-300 text-sm">© 2024 AlumniCloud. All rights reserved.</div>
      </div>

      {/* Right Auth Panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-16 relative">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <span className="text-primary font-headline font-black text-2xl tracking-tighter">AlumniCloud</span>
        </div>

        <div className="w-full max-w-md">
          {mode === 'landing' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-4xl font-headline font-extrabold text-sky-950 tracking-tight">Welcome back</h2>
                <p className="text-slate-500 mt-2">Connect with your alumni network today.</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => handleSwitch('signin')}
                  className="w-full py-4 bg-primary text-white font-bold text-lg rounded-2xl clay-button shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
                >
                  <Mail size={20} /> Sign In with Email
                </button>
                <button
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full py-4 bg-white text-slate-700 font-bold text-base rounded-2xl border-2 border-slate-200 hover:border-primary/40 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
                <div className="relative flex items-center gap-4">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <button
                  onClick={() => handleSwitch('signup')}
                  className="w-full py-4 border-2 border-dashed border-slate-300 text-slate-500 font-bold text-base rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  Create New Account
                </button>
                <button
                  onClick={signInAsGuest}
                  className="w-full py-2 text-slate-400 font-medium text-sm hover:text-slate-600 transition-colors"
                >
                  Continue as Guest (Preview)
                </button>
              </div>

              {signInError === 'UNAUTHORIZED_DOMAIN' && (
                <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-5 text-left space-y-2">
                  <p className="font-bold text-amber-800 text-sm">⚠️ Firebase: Domain Not Authorized</p>
                  <p className="text-xs text-amber-700">Go to <strong>Firebase Console → Authentication → Authorized domains</strong> and add <code className="bg-amber-100 px-1 rounded">localhost</code>.</p>
                </div>
              )}
              {signInError && signInError !== 'UNAUTHORIZED_DOMAIN' && (
                <p className="text-center text-sm text-rose-500 font-medium">{signInError}</p>
              )}
            </div>
          )}

          {(mode === 'signin' || mode === 'signup') && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <button onClick={() => handleSwitch('landing')} className="text-sm text-slate-400 hover:text-primary mb-4 flex items-center gap-1 font-medium transition-colors">
                  ← Back
                </button>
                <h2 className="text-4xl font-headline font-extrabold text-sky-950 tracking-tight">
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </h2>
                <p className="text-slate-500 mt-2">
                  {mode === 'signin' ? 'Welcome back to AlumniCloud.' : 'Join the alumni network today.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                    <div className="flex items-center gap-3 border-2 border-slate-200 rounded-2xl px-5 py-4 focus-within:border-primary transition-colors bg-white">
                      <User size={18} className="text-slate-400 shrink-0" />
                      <input
                        type="text"
                        required
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-slate-300"
                        placeholder="Alex Sterling"
                        value={name}
                        onChange={e => setName(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <div className="flex items-center gap-3 border-2 border-slate-200 rounded-2xl px-5 py-4 focus-within:border-primary transition-colors bg-white">
                    <Mail size={18} className="text-slate-400 shrink-0" />
                    <input
                      type="email"
                      required
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-slate-300"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
                  <div className="flex items-center gap-3 border-2 border-slate-200 rounded-2xl px-5 py-4 focus-within:border-primary transition-colors bg-white">
                    <Lock size={18} className="text-slate-400 shrink-0" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      minLength={6}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-slate-300"
                      placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)} className="text-slate-400 hover:text-primary transition-colors">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {signInError && (
                  <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 text-sm text-rose-600 font-medium">
                    {signInError === 'UNAUTHORIZED_DOMAIN'
                      ? 'Domain not authorized. Add localhost to Firebase Console → Authentication → Authorized domains.'
                      : signInError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-gradient-to-br from-primary to-primary-container text-white font-bold text-lg rounded-2xl clay-button shadow-lg shadow-primary/20 disabled:opacity-60 mt-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : mode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>

                <div className="relative flex items-center gap-4">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full py-4 bg-white text-slate-700 font-bold text-base rounded-2xl border-2 border-slate-200 hover:border-primary/40 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </form>

              <p className="text-center text-sm text-slate-500">
                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => handleSwitch(mode === 'signin' ? 'signup' : 'signin')}
                  className="text-primary font-bold hover:underline"
                >
                  {mode === 'signin' ? 'Create one' : 'Sign in'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
