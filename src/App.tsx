import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import { TimerProvider } from './contexts/TimerContext';
import { UserPicker } from './components/UserPicker';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import { NFCClockModal } from './components/NFCClockModal';
import { TimerDisplay } from './components/TimerDisplay';
import TodayView from './views/TodayView';
import WeekView from './views/WeekView';
import PayPeriodView from './views/PayPeriodView';
import AddShiftView from './views/AddShiftView';
import HistoryView from './views/HistoryView';
import SettingsView from './views/SettingsView';
import StatsView from './views/StatsView';

function AppContent() {
  const { currentUser } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showNFCModal, setShowNFCModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!currentUser) {
    return <UserPicker />;
  }

  return (
    <>
      <TimerDisplay />
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <MobileHeader />
        <main className="flex-1 md:ml-0 min-w-0" style={{ paddingTop: isMobile ? '56px' : '0px' }}>
          <Routes>
            <Route path="/" element={<TodayView onOpenNFCModal={() => setShowNFCModal(true)} />} />
            <Route path="/week" element={<WeekView />} />
            <Route path="/pay-period" element={<PayPeriodView />} />
            <Route path="/add" element={<AddShiftView />} />
            <Route path="/history" element={<HistoryView />} />
            <Route path="/stats" element={<StatsView />} />
            <Route path="/settings" element={<SettingsView />} />
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
  return (
    <UserProvider>
      <TimerProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TimerProvider>
    </UserProvider>
  );
}

export default App;
