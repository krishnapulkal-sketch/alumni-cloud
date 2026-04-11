import React, { useState } from 'react';
import { Calendar, MapPin, Users, Ticket, ArrowRight, Filter, Search, X, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const Events: React.FC = () => {
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const events = [
    {
      id: 1,
      title: 'Tech Reunion 2024',
      date: 'June 15, 2024',
      location: 'Main Campus Quad',
      attendees: 450,
      image: 'https://picsum.photos/seed/event1/800/400',
      category: 'Reunion',
      price: '$25'
    },
    {
      id: 2,
      title: 'AI in Design Workshop',
      date: 'July 02, 2024',
      location: 'Innovation Hub',
      attendees: 85,
      image: 'https://picsum.photos/seed/event2/800/400',
      category: 'Workshop',
      price: 'Free'
    },
    {
      id: 3,
      title: 'Alumni Networking Night',
      date: 'August 12, 2024',
      location: 'Downtown Lounge',
      attendees: 120,
      image: 'https://picsum.photos/seed/event3/800/400',
      category: 'Networking',
      price: '$15'
    }
  ];

  const handleBook = () => {
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 3000);
  };

  return (
    <main className="pt-32 pb-32 px-6 max-w-6xl mx-auto">
      {bookingSuccess && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-8 duration-500">
          <CheckCircle2 size={24} />
          <span className="font-bold">Event Booked Successfully!</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div className="space-y-4">
          <h1 className="text-5xl font-headline font-extrabold text-sky-950 tracking-tight">Upcoming Events</h1>
          <p className="text-xl text-slate-500">Reconnect and grow with our global community.</p>
        </div>
        <div className="flex gap-4">
          <div className="recessed-input flex items-center px-6 py-3 gap-3 w-64">
            <Search size={18} className="text-slate-400" />
            <input className="bg-transparent border-none focus:ring-0 w-full text-sm" placeholder="Search events..." />
          </div>
          <button className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary border border-surface-container-high">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {events.map(event => (
          <div key={event.id} className="clay-card overflow-hidden flex flex-col md:flex-row group hover:-translate-y-1 transition-all duration-500">
            <div className="md:w-1/3 h-64 md:h-auto overflow-hidden relative">
              <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest">
                {event.category}
              </div>
            </div>
            <div className="md:w-2/3 p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-3xl font-bold text-sky-950 tracking-tight">{event.title}</h2>
                  <span className="text-2xl font-extrabold text-primary">{event.price}</span>
                </div>
                <div className="flex flex-wrap gap-6 text-slate-500 font-medium">
                  <span className="flex items-center gap-2"><Calendar size={18} className="text-primary/60" /> {event.date}</span>
                  <span className="flex items-center gap-2"><MapPin size={18} className="text-primary/60" /> {event.location}</span>
                  <span className="flex items-center gap-2"><Users size={18} className="text-primary/60" /> {event.attendees} Attending</span>
                </div>
              </div>
              <div className="pt-8 flex gap-4">
                <button 
                  onClick={handleBook}
                  className="flex-1 py-4 rounded-2xl bg-primary text-white font-bold clay-button flex items-center justify-center gap-2"
                >
                  <Ticket size={20} />
                  Book Ticket
                </button>
                <button className="px-6 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};
