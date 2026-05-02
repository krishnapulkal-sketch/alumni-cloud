import React, { useState, useEffect } from 'react';
import { Newspaper, TrendingUp, RefreshCw, Briefcase, DollarSign, AlertCircle, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { useGamification } from '../context/GamificationContext';

interface NewsItem {
  headline: string;
  summary: string;
  category: 'Hiring' | 'Layoffs' | 'Funding' | 'Trend';
  time: string;
}

export const MarketNews: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { trackAction } = useGamification();

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/market-news');
      const json = await res.json();
      if (json.news) {
        setNews(json.news);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    trackAction('page:/news');
    fetchNews();

    // Auto-refresh every 2 minutes
    const interval = setInterval(() => {
      fetchNews();
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Hiring': return <Briefcase size={16} className="text-emerald-500" />;
      case 'Funding': return <DollarSign size={16} className="text-amber-500" />;
      case 'Layoffs': return <AlertCircle size={16} className="text-rose-500" />;
      case 'Trend': default: return <TrendingUp size={16} className="text-sky-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Hiring': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Funding': return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Layoffs': return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      case 'Trend': default: return 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400';
    }
  };

  return (
    <main className="pt-24 sm:pt-28 pb-28 sm:pb-32 px-4 sm:px-6 max-w-4xl mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-4">
        <div>
          <h1 className="text-3xl sm:text-5xl font-headline font-extrabold text-sky-950 dark:text-white tracking-tight flex items-center gap-3">
            <Newspaper className="text-primary" size={36} /> Live Market News
          </h1>
          <p className="text-base sm:text-xl text-slate-500 dark:text-slate-400 mt-2">
            Real-time tech and job market updates. Auto-refreshes every 2 minutes.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Last Updated</span>
            <span className="text-sm font-bold text-sky-950 dark:text-white">{lastUpdated.toLocaleTimeString()}</span>
          </div>
          <button 
            onClick={fetchNews}
            disabled={loading}
            className={cn("p-2 rounded-full bg-slate-50 dark:bg-slate-700 text-primary transition-all", loading && "animate-spin text-slate-400")}
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {loading && news.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="clay-card p-6 animate-pulse">
              <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-md mb-4" />
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-md mb-2" />
              <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-800 rounded-md" />
            </div>
          ))
        ) : (
          news.map((item, i) => (
            <div key={i} className="clay-card p-6 sm:p-8 rounded-3xl fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <span className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest", getCategoryColor(item.category))}>
                  {getCategoryIcon(item.category)} {item.category}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                  <Clock size={14} /> {item.time}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-sky-950 dark:text-white mb-3 leading-tight">
                {item.headline}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {item.summary}
              </p>
            </div>
          ))
        )}
      </div>
    </main>
  );
};
