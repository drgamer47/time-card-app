import { useTimer } from '../contexts/TimerContext';
import { Clock, X } from 'lucide-react';

export function TimerDisplay() {
  const { activeTimer, timeRemaining, stopTimer, isRunning } = useTimer();

  if (!isRunning) return null;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const getTimerLabel = () => {
    switch (activeTimer?.type) {
      case 'break':
        return '15min Break';
      case 'lunch30':
        return '30min Lunch';
      case 'lunch60':
        return '60min Lunch';
      default:
        return 'Timer';
    }
  };

  const getProgressPercentage = () => {
    if (!activeTimer) return 0;
    return ((activeTimer.duration - timeRemaining) / activeTimer.duration) * 100;
  };

  const isUrgent = timeRemaining <= 120; // Under 2 minutes

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
      <div className={`bg-primary text-white rounded-full shadow-2xl px-6 py-3 flex items-center gap-4 min-w-[280px] ${isUrgent ? 'timer-urgent bg-red-500' : ''}`}>
        <div className="relative">
          <Clock className="w-6 h-6" />
          <svg className="absolute -inset-1 w-8 h-8">
            <circle
              cx="16"
              cy="16"
              r="14"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="16"
              cy="16"
              r="14"
              stroke="white"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 14}`}
              strokeDashoffset={`${2 * Math.PI * 14 * (1 - getProgressPercentage() / 100)}`}
              transform="rotate(-90 16 16)"
              className="transition-all duration-1000"
            />
          </svg>
        </div>

        <div className="flex-1">
          <p className="text-xs opacity-90 font-medium">{getTimerLabel()}</p>
          <p className="text-2xl font-bold tabular-nums">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </p>
        </div>

        <button
          onClick={stopTimer}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Stop timer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

