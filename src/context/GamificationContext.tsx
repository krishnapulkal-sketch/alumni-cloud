import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
}

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  icon: string;
}

interface XPEvent {
  amount: number;
  reason: string;
  timestamp: string;
}

interface GamificationState {
  xp: number;
  level: number;
  tier: string;
  streak: number;
  lastLoginDate: string;
  badges: Badge[];
  dailyChallenges: DailyChallenge[];
  xpHistory: XPEvent[];
  totalMessages: number;
  totalSearches: number;
  totalBoardroomRounds: number;
  totalMentorConnections: number;
  totalJobsApplied: number;
  pagesVisited: string[];
}

interface GamificationContextType extends GamificationState {
  addXP: (amount: number, reason: string) => void;
  completeChallenge: (challengeId: string) => void;
  trackAction: (action: string) => void;
  xpToNextLevel: number;
  xpProgress: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const TIER_THRESHOLDS = [
  { tier: 'Bronze', minXP: 0, color: '#CD7F32' },
  { tier: 'Silver', minXP: 2500, color: '#C0C0C0' },
  { tier: 'Gold', minXP: 5000, color: '#FFD700' },
  { tier: 'Platinum', minXP: 10000, color: '#E5E4E2' },
  { tier: 'Diamond', minXP: 25000, color: '#B9F2FF' },
];

const XP_PER_LEVEL = 500;

const DEFAULT_BADGES: Badge[] = [
  { id: 'first-login', name: 'Welcome Aboard', description: 'Logged in for the first time', icon: '🚀', earned: true, earnedAt: new Date().toISOString() },
  { id: 'connector-10', name: 'Connector', description: 'Sent 10+ messages', icon: '💬', earned: false },
  { id: 'connector-50', name: 'Super Connector', description: 'Sent 50+ messages', icon: '🔗', earned: false },
  { id: 'mentor-5', name: 'Mentor Seeker', description: 'Connected with 5 mentors', icon: '🎓', earned: false },
  { id: 'explorer', name: 'Explorer', description: 'Visited every page', icon: '🧭', earned: false },
  { id: 'boardroom-pro', name: 'Boardroom Pro', description: 'Completed 10 interview rounds', icon: '🏛️', earned: false },
  { id: 'job-hunter', name: 'Job Hunter', description: 'Applied to 5+ jobs', icon: '💼', earned: false },
  { id: 'streak-7', name: 'On Fire', description: '7-day login streak', icon: '🔥', earned: false },
  { id: 'streak-30', name: 'Unstoppable', description: '30-day login streak', icon: '⚡', earned: false },
  { id: 'company-intel', name: 'Intel Analyst', description: 'Searched 10+ companies', icon: '🔍', earned: false },
];

const generateDailyChallenges = (): DailyChallenge[] => [
  { id: 'msg-new', title: 'Send a Message', description: 'Reach out to a new alumni', xpReward: 50, completed: false, icon: '💬' },
  { id: 'search-company', title: 'Research a Company', description: 'Search any company on the feed', xpReward: 25, completed: false, icon: '🔍' },
  { id: 'boardroom-round', title: 'Practice Interview', description: 'Complete a Boardroom round', xpReward: 100, completed: false, icon: '🎤' },
  { id: 'visit-mentor', title: 'Explore Mentors', description: 'Visit the Mentorship page', xpReward: 15, completed: false, icon: '🎓' },
  { id: 'ask-aura', title: 'Ask Aura AI', description: 'Have a conversation with Aura', xpReward: 30, completed: false, icon: '🤖' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const getTier = (xp: number) => {
  let tier = TIER_THRESHOLDS[0];
  for (const t of TIER_THRESHOLDS) {
    if (xp >= t.minXP) tier = t;
  }
  return tier.tier;
};

const getLevel = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;

const getToday = () => new Date().toISOString().split('T')[0];

const STORAGE_KEY = 'alumnicloud_gamification';

const loadState = (): GamificationState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Check if it's a new day — refresh challenges
      const today = getToday();
      if (parsed.lastChallengeDate !== today) {
        parsed.dailyChallenges = generateDailyChallenges();
        parsed.lastChallengeDate = today;
      }
      // Check streak
      const lastLogin = parsed.lastLoginDate;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (lastLogin === yesterday) {
        parsed.streak = (parsed.streak || 0) + 1;
      } else if (lastLogin !== today) {
        parsed.streak = 1;
      }
      parsed.lastLoginDate = today;
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to load gamification state:', e);
  }
  return {
    xp: 150,
    level: 1,
    tier: 'Bronze',
    streak: 1,
    lastLoginDate: getToday(),
    badges: DEFAULT_BADGES,
    dailyChallenges: generateDailyChallenges(),
    xpHistory: [{ amount: 150, reason: 'Welcome bonus', timestamp: new Date().toISOString() }],
    totalMessages: 0,
    totalSearches: 0,
    totalBoardroomRounds: 0,
    totalMentorConnections: 0,
    totalJobsApplied: 0,
    pagesVisited: [],
  };
};

// ─── Context ───────────────────────────────────────────────────────────────────
const GamificationContext = createContext<GamificationContextType | null>(null);

export const useGamification = () => {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error('useGamification must be used within GamificationProvider');
  return ctx;
};

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GamificationState>(loadState);

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addXP = useCallback((amount: number, reason: string) => {
    setState(prev => {
      const newXP = prev.xp + amount;
      const newLevel = getLevel(newXP);
      const newTier = getTier(newXP);
      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        tier: newTier,
        xpHistory: [...prev.xpHistory.slice(-49), { amount, reason, timestamp: new Date().toISOString() }],
      };
    });
  }, []);

  const completeChallenge = useCallback((challengeId: string) => {
    setState(prev => {
      const challenge = prev.dailyChallenges.find(c => c.id === challengeId);
      if (!challenge || challenge.completed) return prev;
      const newXP = prev.xp + challenge.xpReward;
      return {
        ...prev,
        xp: newXP,
        level: getLevel(newXP),
        tier: getTier(newXP),
        dailyChallenges: prev.dailyChallenges.map(c =>
          c.id === challengeId ? { ...c, completed: true } : c
        ),
        xpHistory: [...prev.xpHistory.slice(-49), { amount: challenge.xpReward, reason: `Challenge: ${challenge.title}`, timestamp: new Date().toISOString() }],
      };
    });
  }, []);

  const checkBadges = useCallback((s: GamificationState): Badge[] => {
    return s.badges.map(b => {
      if (b.earned) return b;
      let shouldEarn = false;
      switch (b.id) {
        case 'connector-10': shouldEarn = s.totalMessages >= 10; break;
        case 'connector-50': shouldEarn = s.totalMessages >= 50; break;
        case 'mentor-5': shouldEarn = s.totalMentorConnections >= 5; break;
        case 'boardroom-pro': shouldEarn = s.totalBoardroomRounds >= 10; break;
        case 'job-hunter': shouldEarn = s.totalJobsApplied >= 5; break;
        case 'streak-7': shouldEarn = s.streak >= 7; break;
        case 'streak-30': shouldEarn = s.streak >= 30; break;
        case 'company-intel': shouldEarn = s.totalSearches >= 10; break;
        case 'explorer': shouldEarn = ['/', '/aura', '/jobs', '/messages', '/profile', '/mentorship', '/boardroom', '/events', '/gallery', '/groups', '/directory'].every(p => s.pagesVisited.includes(p)); break;
      }
      if (shouldEarn) return { ...b, earned: true, earnedAt: new Date().toISOString() };
      return b;
    });
  }, []);

  const trackAction = useCallback((action: string) => {
    setState(prev => {
      const updated = { ...prev };
      switch (action) {
        case 'message_sent': updated.totalMessages++; break;
        case 'company_searched': updated.totalSearches++; break;
        case 'boardroom_round': updated.totalBoardroomRounds++; break;
        case 'mentor_connected': updated.totalMentorConnections++; break;
        case 'job_applied': updated.totalJobsApplied++; break;
        default:
          if (action.startsWith('page:')) {
            const page = action.replace('page:', '');
            if (!updated.pagesVisited.includes(page)) {
              updated.pagesVisited = [...updated.pagesVisited, page];
            }
          }
      }
      updated.badges = checkBadges(updated);
      return updated;
    });
  }, [checkBadges]);

  const xpToNextLevel = (state.level) * XP_PER_LEVEL;
  const xpProgress = ((state.xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;

  return (
    <GamificationContext.Provider value={{
      ...state,
      addXP,
      completeChallenge,
      trackAction,
      xpToNextLevel,
      xpProgress,
    }}>
      {children}
    </GamificationContext.Provider>
  );
};
