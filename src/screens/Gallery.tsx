import React from 'react';
import { Image, Filter, Heart, MessageCircle, Share2, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

export const Gallery: React.FC = () => {
  const photos = [
    { id: 1, url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAorflrmEpy3OpKjzEfoEEwnBcIH5WnMupSLnjF8kv46_JwEW84aFwmOaxjOR5Qr4rqJGLYHeuQ6PzdWogoyG1175cm3vfSV9C9rNpTQ4t4WxeLhgdjJ96JNg_75bNTqQuA3lo-xHnSA8Ky6B2RE8Ef8Hj5wBqpKJNHZKQxZ2h-sMicDSxkVWg5yQGAhwB6Rouilw_RTa3yjjZjwPtRbi066wgfuYgLEpzUS43szb2LwSTmkKV9lKLako1FW30SINCwx61DFgoQPoE', title: 'Reunion 2023', likes: 124 },
    { id: 2, url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCW0c1i40u1oPro6WHXtqhMCm4hyGLO3LQWg3VMFW7Swy1WshHMJ6fgXs_8ZSwz1xjJJq_JF_0KXt_Vdr2nV2GRORfHfaFFDVbGZBvSoZFYaqjvGmVH2pCTp-y6upi_fAKgd2QP7PC4GJvHT76yk7EPAOB_8wO87Gy1IbgtKELShst5MQSiV2YfhgcOqGXdW-44IXaCFGQVkWq03sihGG6k0T_wfjIrGhJdzKDwlIyRRV0Pb5e8ToMC7APwCjOh4Aq8GV2mhdcYaM8', title: 'Campus Hub', likes: 89 },
    { id: 3, url: 'https://picsum.photos/seed/campus1/800/600', title: 'Library Sunset', likes: 210 },
    { id: 4, url: 'https://picsum.photos/seed/campus2/800/600', title: 'Graduation Day', likes: 542 },
    { id: 5, url: 'https://picsum.photos/seed/campus3/800/600', title: 'Design Lab', likes: 67 },
    { id: 6, url: 'https://picsum.photos/seed/campus4/800/600', title: 'Alumni Dinner', likes: 156 },
  ];

  return (
    <main className="pt-24 pb-32 px-6 max-w-screen-xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-headline font-extrabold text-sky-950 tracking-tight">Community Gallery</h1>
          <p className="text-slate-500 font-medium">Preserving memories, one frame at a time.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none glass-panel px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-primary font-bold shadow-sm">
            <Filter size={18} />
            Filter
          </button>
          <button className="flex-1 md:flex-none bg-primary text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary/20 clay-button">
            <Plus size={18} />
            Upload
          </button>
        </div>
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
        {photos.map((photo) => (
          <div key={photo.id} className="break-inside-avoid group">
            <div className="clay-card overflow-hidden p-2 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
              <div className="relative rounded-xl overflow-hidden mb-4">
                <img 
                  src={photo.url} 
                  alt={photo.title} 
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                  <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/40 transition-colors">
                    <Heart size={24} />
                  </button>
                  <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/40 transition-colors">
                    <MessageCircle size={24} />
                  </button>
                </div>
              </div>
              <div className="px-4 pb-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-on-surface">{photo.title}</h3>
                  <p className="text-xs text-slate-400 font-medium">Shared by Alumni</p>
                </div>
                <div className="flex items-center gap-1 text-primary font-bold text-sm">
                  <Heart size={14} fill="currentColor" />
                  {photo.likes}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};
