import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Welcome } from './screens/Welcome';
import { Home } from './screens/Home';
import { Aura } from './screens/Aura';
import { CampusMap } from './screens/CampusMap';
import { Profile } from './screens/Profile';
import { Gallery } from './screens/Gallery';
import { Messages } from './screens/Messages';
import { OfficeHours } from './screens/OfficeHours';
import { VoiceCall } from './screens/VoiceCall';
import { Events } from './screens/Events';
import { Membership } from './screens/Membership';
import { TopAppBar } from './components/TopAppBar';
import { BottomNav } from './components/BottomNav';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Welcome />;
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/aura" element={<Aura />} />
        <Route path="/map" element={<CampusMap />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/office-hours" element={<OfficeHours />} />
        <Route path="/call" element={<VoiceCall />} />
        <Route path="/events" element={<Events />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <BottomNav />
    </div>
  );
};

export default App;
