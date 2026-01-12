import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { showNotification, playAlertSound } from '../lib/notifications';

type TimerType = 'break' | 'lunch30' | 'lunch60';

interface Timer {
  type: TimerType;
  startTime: number;
  duration: number; // in seconds
  warningTime: number; // seconds before end to show warning
}

interface TimerContextType {
  activeTimer: Timer | null;
  timeRemaining: number;
  startTimer: (type: TimerType) => void;
  stopTimer: () => void;
  isRunning: boolean;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const TIMER_CONFIGS = {
  break: { duration: 15 * 60, warningTime: 13 * 60, label: 'Break' },
  lunch30: { duration: 30 * 60, warningTime: 28 * 60, label: '30min Lunch' },
  lunch60: { duration: 60 * 60, warningTime: 58 * 60, label: '60min Lunch' },
};

export function TimerProvider({ children }: { children: ReactNode }) {
  const [activeTimer, setActiveTimer] = useState<Timer | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [hasShownWarning, setHasShownWarning] = useState(false);

  // Load timer from localStorage on mount (in case of page refresh)
  useEffect(() => {
    const savedTimer = localStorage.getItem('activeTimer');
    if (savedTimer) {
      try {
        const timer = JSON.parse(savedTimer);
        const elapsed = Math.floor((Date.now() - timer.startTime) / 1000);
        const remaining = timer.duration - elapsed;

        if (remaining > 0) {
          setActiveTimer(timer);
          setTimeRemaining(remaining);
          // Check if warning should have already been shown
          if (remaining <= (timer.duration - timer.warningTime)) {
            setHasShownWarning(true);
          }
        } else {
          localStorage.removeItem('activeTimer');
        }
      } catch (error) {
        console.error('Error loading timer from localStorage:', error);
        localStorage.removeItem('activeTimer');
      }
    }
  }, []);

  const stopTimer = useCallback(() => {
    setActiveTimer(null);
    setTimeRemaining(0);
    setHasShownWarning(false);
    localStorage.removeItem('activeTimer');
  }, []);

  // Countdown effect
  useEffect(() => {
    if (!activeTimer) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - activeTimer.startTime) / 1000);
      const remaining = activeTimer.duration - elapsed;

      if (remaining <= 0) {
        // Timer complete
        const config = TIMER_CONFIGS[activeTimer.type];
        showNotification(`${config.label} Complete!`, 'Time to get back to work');
        playAlertSound();
        stopTimer();
      } else {
        setTimeRemaining(remaining);

        // Show warning at configured time
        if (!hasShownWarning && remaining <= (activeTimer.duration - activeTimer.warningTime)) {
          const config = TIMER_CONFIGS[activeTimer.type];
          const minutesLeft = Math.floor((activeTimer.duration - activeTimer.warningTime) / 60);
          showNotification(
            `${config.label} Warning`,
            `${minutesLeft} minutes left`
          );
          playAlertSound();
          setHasShownWarning(true);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer, hasShownWarning, stopTimer]);

  const startTimer = (type: TimerType) => {
    const config = TIMER_CONFIGS[type];
    const timer: Timer = {
      type,
      startTime: Date.now(),
      duration: config.duration,
      warningTime: config.warningTime,
    };

    setActiveTimer(timer);
    setTimeRemaining(config.duration);
    setHasShownWarning(false);
    localStorage.setItem('activeTimer', JSON.stringify(timer));
  };

  return (
    <TimerContext.Provider
      value={{
        activeTimer,
        timeRemaining,
        startTimer,
        stopTimer,
        isRunning: activeTimer !== null,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}

