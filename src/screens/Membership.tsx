import React from 'react';
import { Check, Zap, Shield, Globe, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

const plans = [
  {
    name: 'Basic',
    price: 'Free',
    description: 'Essential features for staying connected.',
    features: ['Access to Alumni Directory', 'Basic Job Board', 'Public Events Access', 'Community Forums'],
    cta: 'Current Plan',
    featured: false,
    color: 'bg-slate-100 text-slate-600'
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/mo',
    description: 'Advanced tools for career growth and networking.',
    features: ['Priority Mentorship Access', 'Exclusive Pro Events', 'Advanced Search Filters', 'Unlimited Messaging', 'Campus Space Booking'],
    cta: 'Upgrade to Pro',
    featured: true,
    color: 'bg-primary text-white'
  },
  {
    name: 'Elite',
    price: '$29',
    period: '/mo',
    description: 'The ultimate experience for industry leaders.',
    features: ['All Pro Features', 'VIP Event Access', 'Executive Coaching', 'Private Lounge Access', 'Global Network Verification'],
    cta: 'Go Elite',
    featured: false,
    color: 'bg-sky-950 text-white'
  }
];

export const Membership: React.FC = () => {
  return (
    <main className="pt-32 pb-32 px-6 max-w-7xl mx-auto">
      <div className="text-center space-y-4 mb-20">
        <h1 className="text-6xl font-headline font-extrabold text-sky-950 tracking-tight">Elevate Your Journey</h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">Choose the tier that fits your professional goals and stay connected with the best in the industry.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.name} 
            className={cn(
              "clay-card p-10 rounded-[40px] flex flex-col justify-between relative transition-all duration-500 hover:-translate-y-2",
              plan.featured ? "ring-4 ring-primary/20 scale-105 z-10" : ""
            )}
          >
            {plan.featured && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                Most Popular
              </div>
            )}
            
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-sky-950">{plan.name}</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-sky-950">{plan.price}</span>
                  {plan.period && <span className="text-slate-400 font-bold">{plan.period}</span>}
                </div>
                <p className="text-slate-500 font-medium leading-relaxed">{plan.description}</p>
              </div>

              <div className="space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0", plan.featured ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400")}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-semibold text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className={cn(
              "w-full py-5 rounded-2xl font-bold mt-12 clay-button flex items-center justify-center gap-2 transition-all",
              plan.featured ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
            )}>
              {plan.cta}
              <ArrowRight size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
            <Shield size={32} />
          </div>
          <h3 className="text-xl font-bold text-sky-950">Verified Network</h3>
          <p className="text-slate-500 font-medium">Every member is manually verified to ensure a high-quality, professional community.</p>
        </div>
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Zap size={32} />
          </div>
          <h3 className="text-xl font-bold text-sky-950">Instant Access</h3>
          <p className="text-slate-500 font-medium">Get immediate access to job boards, events, and mentorship opportunities upon approval.</p>
        </div>
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Globe size={32} />
          </div>
          <h3 className="text-xl font-bold text-sky-950">Global Reach</h3>
          <p className="text-slate-500 font-medium">Connect with alumni across 50+ countries and diverse industries worldwide.</p>
        </div>
      </div>
    </main>
  );
};
