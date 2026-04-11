import React, { useState } from 'react';
import { Map as MapIcon, Clock, Users, School, Coffee, Library, Calendar, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

interface Space {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  capacity: number;
  duration: string;
  top: string;
  left: string;
}

const spaces: Space[] = [
  { id: 'founders', name: 'Hall of Founders', icon: <School size={20} />, color: 'bg-primary', capacity: 20, duration: '4 Hours', top: '40%', left: '35%' },
  { id: 'library', name: 'Library Oasis', icon: <Library size={20} />, color: 'bg-secondary', capacity: 8, duration: '3 Hours', top: '30%', left: '60%' },
  { id: 'lounge', name: 'Alumni Lounge', icon: <Coffee size={24} />, color: 'bg-primary-dim', capacity: 4, duration: '2 Hours', top: '65%', left: '50%' },
];

export const CampusMap: React.FC = () => {
  const { user } = useAuth();
  const [selectedSpace, setSelectedSpace] = useState<Space>(spaces[2]);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('14:00');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleBook = async () => {
    if (!user) return;
    setIsBooking(true);
    try {
      await addDoc(collection(db, 'bookings'), {
        userId: user.uid,
        spaceId: selectedSpace.id,
        spaceName: selectedSpace.name,
        date: bookingDate,
        time: bookingTime,
        createdAt: serverTimestamp(),
        status: 'confirmed'
      });
      setBookingSuccess(true);
      setTimeout(() => setBookingSuccess(false), 3000);
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <main className="relative w-full h-screen pt-20 pb-24 overflow-hidden bg-surface-container">
      {/* 3D Soft Map Background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
        <div className="relative w-[140%] h-[140%] rotate-[-15deg] scale-110">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAW27KPzQpA7WoyaexEWVIXSTapN8P325KsO5bb8q4yL31brhoinp3Hyrpnf4BxqTQYJe-uajHES0HR3TC37UW-1Ij78Zx9oP1XXohzmOUfkNkgKpMLci0RDRdUk1merQgKtUZOkfgEKt9kmPbfpRTMJrV9oNVgE-WEkggZYYrinUkxX61zA6m0uvmYx8NUJmTqA_ZUWtEUwUCalyXKGXfz4GXSLdDj4Tqlc9pT_-MkB6_ghoXckxb1pTVLK9zwS-tpw51b8vm8UMI" 
            alt="Campus Map" 
            className="w-full h-full object-cover blur-[2px]"
            referrerPolicy="no-referrer"
          />
          
          {/* Map Pins */}
          {spaces.map((space) => (
            <div 
              key={space.id}
              className="absolute z-10 group"
              style={{ top: space.top, left: space.left }}
            >
              <div className="flex flex-col items-center">
                <div className={cn(
                  "mb-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg transition-all",
                  selectedSpace.id === space.id ? "scale-110 border-2 border-primary" : "scale-90 group-hover:scale-100"
                )}>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-primary">{space.name}</p>
                </div>
                <button 
                  onClick={() => setSelectedSpace(space)}
                  className={cn(
                    "rounded-full flex items-center justify-center text-white clay-card transition-all",
                    space.id === 'lounge' ? "w-14 h-14" : "w-12 h-12",
                    space.color,
                    selectedSpace.id === space.id ? "ring-4 ring-white scale-110" : "hover:scale-110"
                  )}
                >
                  {space.icon}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Glassmorphic Booking Detail Sheet */}
      <div className="absolute bottom-28 left-6 right-6 md:left-auto md:right-10 md:w-96 z-40">
        <div className="bg-white/60 backdrop-blur-2xl rounded-3xl p-6 shadow-[0_20px_50px_rgba(29,100,143,0.1)] border border-white/40">
          {bookingSuccess ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-sky-950">Booking Confirmed!</h3>
                <p className="text-sm text-slate-500">See you at the {selectedSpace.name}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Space Selection</span>
                  <h2 className="text-2xl font-headline font-extrabold text-on-surface tracking-tight">{selectedSpace.name}</h2>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-primary-dim">
                  <MapIcon size={24} />
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-4 bg-surface-container-low p-3 rounded-2xl">
                  <Calendar className="text-primary" size={18} />
                  <input 
                    type="date" 
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-sm font-semibold w-full"
                  />
                </div>
                <div className="flex items-center gap-4 bg-surface-container-low p-3 rounded-2xl">
                  <Clock className="text-primary" size={18} />
                  <input 
                    type="time" 
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-sm font-semibold w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 bg-surface-container-low p-3 rounded-2xl">
                    <Users className="text-primary" size={18} />
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">Capacity</span>
                      <span className="text-xs font-semibold">{selectedSpace.capacity} Max</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-surface-container-low p-3 rounded-2xl">
                    <Clock className="text-primary" size={18} />
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">Duration</span>
                      <span className="text-xs font-semibold">{selectedSpace.duration}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleBook}
                disabled={isBooking}
                className="w-full bg-gradient-to-br from-primary to-primary-container text-white font-headline font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform clay-button flex items-center justify-center gap-2"
              >
                {isBooking ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Confirm Booking'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Floating UI: Current Stats */}
      <div className="absolute top-24 right-6 flex flex-col gap-3 z-40">
        <div className="bg-white/80 backdrop-blur-xl rounded-full px-4 py-2 flex items-center gap-2 shadow-sm border border-white/20">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold tracking-wide text-slate-600">Live Availability</span>
        </div>
      </div>
    </main>
  );
};
