import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Compass, Bot, User, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';

export const BottomNav: React.FC = () => {
  const navItems = [
    { icon: LayoutGrid, path: '/', label: 'Feed' },
    { icon: Compass, path: '/gallery', label: 'Gallery' },
    { icon: Bot, path: '/aura', label: 'Aura', isCenter: true },
    { icon: MessageSquare, path: '/messages', label: 'Messages' },
    { icon: User, path: '/profile', label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-6 left-0 right-0 z-50 flex justify-around items-center h-20 px-4 pointer-events-none">
      <div className="bg-white/60 backdrop-blur-2xl w-[90%] max-w-md rounded-full shadow-[0_20px_50px_rgba(29,100,143,0.1)] flex justify-around items-center h-full px-4 pointer-events-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center justify-center p-4 transition-all duration-300",
              item.isCenter
                ? "bg-primary text-white rounded-full shadow-lg scale-110 -translate-y-2"
                : isActive ? "text-primary scale-110" : "text-slate-400 hover:text-primary"
            )}
          >
            <item.icon size={item.isCenter ? 28 : 24} strokeWidth={item.isCenter ? 2.5 : 2} />
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
