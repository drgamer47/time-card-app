import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import AuthStatus from './components/AuthStatus';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import { NFCClockModal } from './components/NFCClockModal';
import TodayView from './views/TodayView';
import WeekView from './views/WeekView';
import PayPeriodView from './views/PayPeriodView';
import AddShiftView from './views/AddShiftView';
import HistoryView from './views/HistoryView';

function AppContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showNFCModal, setShowNFCModal] = useState(false);

  useEffect(() => {
    // Check if opened via NFC tag
    if (searchParams.get('nfc') === 'clock') {
      setShowNFCModal(true);
      // Clean up URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('nfc');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <>
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <main className="flex-1 md:ml-0 min-w-0">
          <AuthStatus />
          <Routes>
            <Route path="/" element={<TodayView onOpenNFCModal={() => setShowNFCModal(true)} />} />
            <Route path="/week" element={<WeekView />} />
            <Route path="/pay-period" element={<PayPeriodView />} />
            <Route path="/add" element={<AddShiftView />} />
            <Route path="/history" element={<HistoryView />} />
          </Routes>
          <BottomNav />
        </main>
      </div>
      <NFCClockModal 
        isOpen={showNFCModal} 
        onClose={() => setShowNFCModal(false)} 
      />
    </>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
