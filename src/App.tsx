import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Welcome } from './screens/Welcome';
import { Home } from './screens/Home';
import { Aura } from './screens/Aura';
import { CampusMap } from './screens/CampusMap';
import { Profile } from './screens/Profile';
import { Gallery } from './screens/Gallery';
import { OfficeHours } from './screens/OfficeHours';
import { VoiceCall } from './screens/VoiceCall';
import { Events } from './screens/Events';
import { Messages } from './screens/Messages';
import { TopAppBar } from './components/TopAppBar';
import { BottomNav } from './components/BottomNav';
import { Jobs } from './screens/Jobs';
import { Groups } from './screens/Groups';
import { Directory } from './screens/Directory';
import { Mentorship } from './screens/Mentorship';
import { Boardroom } from './screens/Boardroom';
import { MarketNews } from './screens/MarketNews';
import { CareerGuide } from './screens/CareerGuide';
import { InterviewSprint } from './screens/InterviewSprint';
import { DailyChallenges } from './components/DailyChallenges';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading AlumniCloud...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Welcome />;
  }

  return (
    <div className="min-h-screen bg-surface transition-colors duration-300">
      <TopAppBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/aura" element={<Aura />} />
        <Route path="/map" element={<CampusMap />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/office-hours" element={<OfficeHours />} />
        <Route path="/call" element={<VoiceCall />} />
        <Route path="/events" element={<Events />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/directory" element={<Directory />} />
        <Route path="/mentorship" element={<Mentorship />} />
        <Route path="/boardroom" element={<Boardroom />} />
        <Route path="/news" element={<MarketNews />} />
        <Route path="/guide" element={<CareerGuide />} />
        <Route path="/sprint" element={<InterviewSprint />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <BottomNav />
      <DailyChallenges />
    </div>
  );
};

export default App;
