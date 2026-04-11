import React, { useState, useEffect } from 'react';
import { Info, Loader2, ExternalLink, TrendingUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

interface CompanyInsightsProps {
  companyName: string;
  className?: string;
}

export const CompanyInsights: React.FC<CompanyInsightsProps> = ({ companyName, className }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchInsights = async () => {
    if (insights || loading) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/company-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setInsights(data.text);
    } catch (err) {
      setError('Could not load insights');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <button 
        onMouseEnter={() => {
          setIsOpen(true);
          fetchInsights();
        }}
        onMouseLeave={() => setIsOpen(false)}
        className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold hover:bg-primary/20 transition-colors cursor-help"
      >
        <TrendingUp size={12} />
        {companyName}
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-3 w-72 z-[100] animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="clay-card bg-white p-5 shadow-2xl border border-primary/10">
            <div className="flex items-center justify-between mb-3 border-b border-surface-container-high pb-2">
              <h4 className="font-headline font-bold text-sky-900 text-sm flex items-center gap-2">
                <Info size={14} className="text-primary" />
                {companyName} Insights
              </h4>
              <ExternalLink size={12} className="text-slate-400" />
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center py-4 gap-2">
                <Loader2 size={20} className="text-primary animate-spin" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Analyzing with Groq...</span>
              </div>
            ) : error ? (
              <p className="text-xs text-rose-400 font-medium">{error}</p>
            ) : (
              <div className="markdown-body text-xs leading-relaxed text-on-surface-variant">
                <ReactMarkdown>
                  {insights || ''}
                </ReactMarkdown>
              </div>
            )}
            
            <div className="mt-4 pt-2 border-t border-surface-container-high flex justify-between items-center">
              <span className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.2em]">Powered by Groq AI</span>
              <button className="text-[10px] font-bold text-primary hover:underline">View Jobs</button>
            </div>
          </div>
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-6 w-3 h-3 bg-white border-r border-b border-primary/5 rotate-45 -translate-y-1.5" />
        </div>
      )}
    </div>
  );
};
