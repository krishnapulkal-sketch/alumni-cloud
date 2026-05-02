import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid, Newspaper, Bot, MessageSquare, User } from 'lucide-react';
import { cn } from '../lib/utils';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navItems = [
    { icon: LayoutGrid, path: '/', label: 'Feed' },
    { icon: Newspaper, path: '/news', label: 'News' },
    { icon: Bot, path: '/aura', label: 'Aura', isCenter: true },
    { icon: MessageSquare, path: '/messages', label: 'Messages' },
    { icon: User, path: '/profile', label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 sm:bottom-4 left-0 right-0 z-50 flex justify-around items-center px-4 pointer-events-none pb-safe">
      <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl w-full sm:w-[90%] max-w-md rounded-t-2xl sm:rounded-full shadow-[0_-4px_30px_rgba(29,100,143,0.08)] dark:shadow-[0_-4px_30px_rgba(0,0,0,0.3)] flex justify-around items-center h-16 sm:h-20 px-2 sm:px-4 pointer-events-auto border-t sm:border border-slate-100/50 dark:border-slate-700/50">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex flex-col items-center justify-center p-2 sm:p-4 transition-all duration-300",
                item.isCenter
                  ? "bg-primary text-white rounded-full shadow-lg shadow-primary/30 scale-100 sm:scale-110 -translate-y-1 sm:-translate-y-2 w-12 h-12 sm:w-14 sm:h-14"
                  : isActive ? "text-primary scale-105" : "text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-sky-400"
              )}
            >
              <item.icon size={item.isCenter ? 22 : 20} strokeWidth={item.isCenter ? 2.5 : 2} />
              {!item.isCenter && (
                <span className="text-[9px] sm:text-[10px] font-bold mt-0.5 sm:mt-1">{item.label}</span>
              )}
              {isActive && !item.isCenter && <div className="nav-active-dot" />}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
