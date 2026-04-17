import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic, MicOff, Video, VideoOff, ArrowLeft, Send, Loader2,
  Star, AlertCircle, CheckCircle2, ChevronRight, Volume2,
  BrainCircuit, Users, Trophy, RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
interface JudgeFeedback {
  judge: 'CEO' | 'Tech Lead' | 'Product Manager' | 'HR Director';
  verdict: 'Impressed' | 'Neutral' | 'Concerned';
  score: number;
  feedback: string;
  follow_up: string;
}

interface Round {
  question: string;
  transcript: string;
  feedback: JudgeFeedback[];
  avgScore: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const JUDGES = [
  {
    key: 'CEO',
    name: 'Victoria Hartwell',
    title: 'Chief Executive Officer',
    color: 'from-violet-500 to-purple-700',
    ring: 'ring-violet-400',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    badge: 'bg-violet-100 text-violet-800',
    avatar: 'VH',
  },
  {
    key: 'Tech Lead',
    name: 'Raj Mehta',
    title: 'Head of Engineering',
    color: 'from-sky-500 to-blue-700',
    ring: 'ring-sky-400',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    badge: 'bg-sky-100 text-sky-800',
    avatar: 'RM',
  },
  {
    key: 'Product Manager',
    name: 'Sophia Laurent',
    title: 'VP of Product',
    color: 'from-emerald-500 to-teal-700',
    ring: 'ring-emerald-400',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-800',
    avatar: 'SL',
  },
  {
    key: 'HR Director',
    name: 'Marcus Webb',
    title: 'HR Director',
    color: 'from-amber-500 to-orange-600',
    ring: 'ring-amber-400',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800',
    avatar: 'MW',
  },
];

const INTERVIEW_QUESTIONS: Record<string, string[]> = {
  'Software Engineer': [
    "Tell us about yourself and why you're passionate about software engineering.",
    "Describe a technically challenging project you've led. What was the architecture and what trade-offs did you make?",
    "How do you approach debugging a production issue that is causing data loss for 10% of users?",
    "Where do you see yourself in 5 years and how does this role fit into your growth?",
  ],
  'Product Manager': [
    "Walk us through your product philosophy. How do you decide what to build?",
    "Tell us about a product you launched that failed. What did you learn?",
    "How would you prioritize a backlog of 50 features with limited engineering resources?",
    "Describe how you'd build a roadmap for a brand new B2B SaaS product.",
  ],
  'Data Scientist': [
    "Tell us about yourself and what excites you about data science.",
    "Describe the most technically complex model you've built and deployed to production.",
    "How would you explain a false positive vs false negative trade-off to a non-technical CEO?",
    "How do you stay current with the rapidly evolving AI/ML landscape?",
  ],
  'Designer': [
    "Walk us through your design process. How do you go from a vague idea to a shipped product?",
    "Tell us about a design decision you were wrong about. How did you course-correct?",
    "How do you defend a design decision to engineers who push back on feasibility?",
    "What's a product with terrible UX that you would redesign and how?",
  ],
};

const VERDICT_CONFIG = {
  Impressed: { icon: <CheckCircle2 size={14} />, class: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
  Neutral: { icon: <AlertCircle size={14} />, class: 'bg-amber-100 text-amber-700 border border-amber-200' },
  Concerned: { icon: <AlertCircle size={14} />, class: 'bg-red-100 text-red-700 border border-red-200' },
};

// ─── Main Component ────────────────────────────────────────────────────────────
export const Boardroom: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Setup state
  const [phase, setPhase] = useState<'setup' | 'interview' | 'results'>('setup');
  const [role, setRole] = useState('Software Engineer');
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [cameraError, setCameraError] = useState('');

  // Interview state
  const [round, setRound] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [activeJudge, setActiveJudge] = useState<string | null>(null);
  const [speakingJudge, setSpeakingJudge] = useState<string | null>(null);

  // ── Camera / Mic ────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraOn(true);
      setMicOn(true);
      setCameraError('');
    } catch (e: any) {
      setCameraError('Camera/mic access denied. Please allow permissions and refresh.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOn(false);
    setMicOn(false);
  }, []);

  const toggleCamera = () => {
    if (cameraOn) {
      streamRef.current?.getVideoTracks().forEach(t => t.enabled = !t.enabled);
      setCameraOn(p => !p);
    }
  };

  const toggleMic = () => {
    streamRef.current?.getAudioTracks().forEach(t => t.enabled = !t.enabled);
    setMicOn(p => !p);
  };

  useEffect(() => {
    return () => { stopCamera(); recognitionRef.current?.stop(); };
  }, [stopCamera]);

  // ── Speech Recognition ──────────────────────────────────────────────────────
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }
    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = 'en-US';

    let finalText = '';
    recog.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalText += e.results[i][0].transcript + ' ';
        } else {
          interim = e.results[i][0].transcript;
        }
      }
      setTranscript(finalText + interim);
    };
    recog.onerror = () => setIsListening(false);
    recog.onend = () => setIsListening(false);

    recognitionRef.current = recog;
    recog.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  // ── AI Evaluation ───────────────────────────────────────────────────────────
  const submitAnswer = async () => {
    if (!transcript.trim() || transcript.trim().length < 10) return;
    stopListening();
    setIsEvaluating(true);

    const questions = INTERVIEW_QUESTIONS[role] || INTERVIEW_QUESTIONS['Software Engineer'];
    const currentQ = questions[round];

    try {
      const res = await fetch('/api/boardroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, role, round: round + 1 }),
      });
      const data = await res.json();
      const feedback: JudgeFeedback[] = data.feedback || [];
      const avgScore = feedback.length > 0
        ? Math.round(feedback.reduce((s, j) => s + j.score, 0) / feedback.length)
        : 0;

      const newRound: Round = { question: currentQ, transcript, feedback, avgScore };
      setRounds(prev => [...prev, newRound]);

      // Animate judges speaking one by one
      setActiveJudge(null);
      let delay = 0;
      feedback.forEach((j, i) => {
        setTimeout(() => setSpeakingJudge(j.judge), delay);
        delay += 1800;
        setTimeout(() => setSpeakingJudge(null), delay - 100);
      });

      setTranscript('');
      if (round + 1 >= questions.length) {
        setTimeout(() => setPhase('results'), delay + 500);
      } else {
        setRound(prev => prev + 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsEvaluating(false), 1000);
    }
  };

  const restart = () => {
    setPhase('setup'); setRound(0); setTranscript('');
    setRounds([]); setIsEvaluating(false); setIsListening(false);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  const questions = INTERVIEW_QUESTIONS[role] || INTERVIEW_QUESTIONS['Software Engineer'];
  const currentQuestion = questions[round];
  const overallScore = rounds.length > 0
    ? Math.round(rounds.reduce((s, r) => s + r.avgScore, 0) / rounds.length)
    : 0;

  // SETUP PHASE
  if (phase === 'setup') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <button onClick={() => navigate('/jobs')} className="flex items-center gap-2 text-sky-300 hover:text-white mb-8 font-bold transition-colors">
            <ArrowLeft size={18} /> Back to Jobs
          </button>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-sky-600 flex items-center justify-center shadow-lg">
                <Users size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-headline font-extrabold text-white">AI Boardroom</h1>
                <p className="text-sky-300 font-medium">Interview Simulation with 4 AI Judges</p>
              </div>
            </div>

            {/* Judge Preview */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {JUDGES.map(j => (
                <div key={j.key} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-xs font-black shrink-0', j.color)}>
                    {j.avatar}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{j.name}</p>
                    <p className="text-sky-300/70 text-xs">{j.title}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Role Selection */}
            <div className="mb-6 space-y-2">
              <label className="text-sky-300 text-xs font-bold uppercase tracking-widest">Practicing for role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {Object.keys(INTERVIEW_QUESTIONS).map(r => (
                  <option key={r} value={r} className="text-slate-900">{r}</option>
                ))}
              </select>
            </div>

            {cameraError && (
              <div className="mb-4 px-4 py-3 bg-red-500/20 border border-red-400/30 rounded-xl text-red-300 text-sm font-medium flex items-center gap-2">
                <AlertCircle size={16} /> {cameraError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={startCamera}
                disabled={cameraOn}
                className="flex-1 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                <Video size={18} /> {cameraOn ? 'Camera Ready ✓' : 'Enable Camera & Mic'}
              </button>
              <button
                onClick={() => { setPhase('interview'); if (!cameraOn) startCamera(); }}
                className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/30"
              >
                Enter Boardroom <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // RESULTS PHASE
  if (phase === 'results') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 pt-8 pb-16 px-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <Trophy size={48} className="text-amber-400 mx-auto mb-4" />
            <h1 className="text-4xl font-headline font-extrabold text-white mb-2">Interview Complete!</h1>
            <p className="text-sky-300 text-lg">Here's what the board thinks…</p>
          </div>

          {/* Overall Score */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center backdrop-blur-xl">
            <p className="text-sky-300 text-sm font-bold uppercase tracking-widest mb-3">Overall Board Score</p>
            <div className={cn(
              'text-7xl font-black mb-3',
              overallScore >= 75 ? 'text-emerald-400' : overallScore >= 50 ? 'text-amber-400' : 'text-red-400'
            )}>
              {overallScore}<span className="text-3xl text-white/40">/100</span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-1000', overallScore >= 75 ? 'bg-emerald-400' : overallScore >= 50 ? 'bg-amber-400' : 'bg-red-400')}
                style={{ width: `${overallScore}%` }}
              />
            </div>
          </div>

          {/* Per-round feedback */}
          {rounds.map((r, ri) => (
            <div key={ri} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-sky-400 bg-sky-400/10 px-3 py-1 rounded-full">Round {ri + 1}</span>
                <p className="text-white font-bold">{r.question}</p>
              </div>
              <div className="bg-white/5 rounded-2xl px-4 py-3 text-sky-200/80 text-sm italic leading-relaxed border border-white/5">
                "{r.transcript.slice(0, 200)}{r.transcript.length > 200 ? '…' : ''}"
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {r.feedback.map(f => {
                  const judge = JUDGES.find(j => j.key === f.judge);
                  return (
                    <div key={f.judge} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-[10px] font-black', judge?.color)}>
                            {judge?.avatar}
                          </div>
                          <span className="text-white text-sm font-bold">{f.judge}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1', VERDICT_CONFIG[f.verdict]?.class)}>
                            {VERDICT_CONFIG[f.verdict]?.icon} {f.verdict}
                          </span>
                          <span className="text-white font-black text-sm">{f.score}</span>
                        </div>
                      </div>
                      <p className="text-sky-200/80 text-xs leading-relaxed mb-2">{f.feedback}</p>
                      <p className="text-amber-300/80 text-xs italic">↳ "{f.follow_up}"</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex gap-4">
            <button onClick={restart} className="flex-1 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-white/20 transition-colors">
              <RefreshCw size={18} /> Try Again
            </button>
            <button onClick={() => navigate('/jobs')} className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              Back to Jobs <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </main>
    );
  }

  // INTERVIEW PHASE
  const lastRound = rounds[rounds.length - 1];

  return (
    <main className="h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => { stopCamera(); navigate('/jobs'); }} className="text-sky-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-white font-bold text-sm">AI Boardroom</h2>
            <p className="text-sky-400 text-xs">{role} Interview</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sky-300 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-full">
            Round {round + 1} / {questions.length}
          </span>
          {rounds.length > 0 && (
            <span className="text-amber-300 text-xs font-bold bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-full flex items-center gap-1">
              <Star size={12} /> Avg {Math.round(rounds.reduce((s, r) => s + r.avgScore, 0) / rounds.length)}/100
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Camera + Input */}
        <div className="flex flex-col w-80 shrink-0 border-r border-white/10 p-4 gap-4">
          {/* Camera Feed */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-800 aspect-video">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={cn('w-full h-full object-cover', !cameraOn && 'opacity-0')}
            />
            {!cameraOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2">
                <VideoOff size={32} />
                <span className="text-xs">Camera off</span>
              </div>
            )}
            <div className="absolute bottom-3 right-3 flex gap-2">
              <button
                onClick={toggleCamera}
                className={cn('w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-colors', cameraOn ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-500/80 text-white')}
              >
                {cameraOn ? <Video size={16} /> : <VideoOff size={16} />}
              </button>
              <button
                onClick={toggleMic}
                className={cn('w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-colors', micOn ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-500/80 text-white')}
              >
                {micOn ? <Mic size={16} /> : <MicOff size={16} />}
              </button>
            </div>
            {isListening && (
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-500/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> REC
              </div>
            )}
          </div>

          {/* Current Question */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex-1">
            <p className="text-sky-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
              <BrainCircuit size={12} /> Question {round + 1}
            </p>
            <p className="text-white font-semibold text-sm leading-relaxed">{currentQuestion}</p>
          </div>

          {/* Transcript Box */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 min-h-[80px] max-h-[120px] overflow-y-auto">
            <p className="text-xs text-sky-400 font-bold mb-1 uppercase tracking-widest">Your Answer</p>
            <p className="text-sky-200/80 text-sm leading-relaxed">
              {transcript || (
                <span className="text-white/20 italic">
                  {isListening ? 'Listening… speak your answer' : 'Press Speak to start recording'}
                </span>
              )}
            </p>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isEvaluating}
              className={cn(
                'flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all',
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                  : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
              )}
            >
              {isListening ? <><MicOff size={16} /> Stop</> : <><Mic size={16} /> Speak</>}
            </button>
            <button
              onClick={submitAnswer}
              disabled={isEvaluating || !transcript.trim() || transcript.trim().length < 10}
              className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 shadow-lg shadow-primary/20"
            >
              {isEvaluating ? <><Loader2 size={16} className="animate-spin" /> Judging…</> : <><Send size={16} /> Submit</>}
            </button>
          </div>
        </div>

        {/* Right: Judges Panel */}
        <div className="flex-1 grid grid-cols-2 gap-0 overflow-hidden">
          {JUDGES.map((judge) => {
            const isSpeaking = speakingJudge === judge.key;
            const lastFeedback = lastRound?.feedback.find(f => f.judge === judge.key);

            return (
              <div
                key={judge.key}
                onClick={() => setActiveJudge(activeJudge === judge.key ? null : judge.key)}
                className={cn(
                  'flex flex-col p-6 border-b border-r border-white/10 cursor-pointer transition-all duration-300 overflow-hidden relative',
                  isSpeaking ? 'bg-white/10' : 'bg-transparent hover:bg-white/5'
                )}
              >
                {/* Speaking pulse ring */}
                {isSpeaking && (
                  <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                )}

                {/* Judge Identity */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    'w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-black text-lg shrink-0 shadow-lg transition-all duration-300',
                    judge.color, isSpeaking ? `ring-2 ${judge.ring} ring-offset-2 ring-offset-slate-900 scale-110` : ''
                  )}>
                    {judge.avatar}
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{judge.name}</h3>
                    <p className="text-sky-300/70 text-xs">{judge.title}</p>
                  </div>
                </div>

                {/* State: Idle / Evaluating / Feedback */}
                {isEvaluating && !lastFeedback ? (
                  <div className="flex items-center gap-2 text-sky-300/60 text-sm mt-2">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Deliberating…</span>
                  </div>
                ) : lastFeedback ? (
                  <div className="space-y-2 text-sm animate-in fade-in duration-500">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1', VERDICT_CONFIG[lastFeedback.verdict]?.class)}>
                        {VERDICT_CONFIG[lastFeedback.verdict]?.icon} {lastFeedback.verdict}
                      </span>
                      <span className="text-white font-black">{lastFeedback.score}<span className="text-white/30 font-normal text-xs">/100</span></span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', lastFeedback.score >= 75 ? 'bg-emerald-400' : lastFeedback.score >= 50 ? 'bg-amber-400' : 'bg-red-400')}
                        style={{ width: `${lastFeedback.score}%` }}
                      />
                    </div>
                    <p className="text-sky-200/80 text-xs leading-relaxed line-clamp-3">{lastFeedback.feedback}</p>
                    {activeJudge === judge.key && (
                      <div className="mt-2 pt-2 border-t border-white/10 animate-in slide-in-from-top-2 duration-300">
                        <p className="text-xs text-amber-300/80 italic">↳ "{lastFeedback.follow_up}"</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-2">
                    <p className="text-white/20 text-xs italic">Waiting for your answer…</p>
                    <div className="flex items-center gap-1 mt-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={cn('w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce')} style={{ animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Volume indicator when speaking */}
                {isSpeaking && (
                  <div className="absolute bottom-4 right-4 flex items-center gap-1 text-emerald-400">
                    <Volume2 size={14} />
                    <div className="flex gap-0.5 items-end h-4">
                      {[3, 5, 4, 6, 3, 5, 4].map((h, i) => (
                        <div key={i} className="w-0.5 bg-emerald-400 rounded-full animate-pulse" style={{ height: `${h * 2}px`, animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};
