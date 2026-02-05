import { useState, useEffect, useCallback, useRef } from 'react';
import type { FC } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface PhaseTimeIndicatorProps {
  phase: 'auto' | 'teleop';
  showTimer?: boolean;
}

const PHASE_TIMES = {
  auto: 15,     // 15 seconds
  teleop: 135   // 2:15 (135 seconds)
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  return `${secs}s`;
};

export const PhaseTimeIndicator: FC<PhaseTimeIndicatorProps> = ({ phase, showTimer = true }) => {
  const { t } = useLanguage();
  const totalTime = PHASE_TIMES[phase];
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleStart = useCallback(() => {
    if (isRunning) {
      // Pause
      clearTimer();
      setIsRunning(false);
    } else {
      // Start
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearTimer();
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [isRunning, clearTimer]);

  const handleReset = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setTimeLeft(totalTime);
  }, [clearTimer, totalTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  // Reset when phase changes
  useEffect(() => {
    handleReset();
  }, [phase, handleReset]);

  const timeLabel = phase === 'auto' ? t('autoTime') : t('teleopTime');
  const isLowTime = timeLeft <= 10 && timeLeft > 0;
  const isZero = timeLeft === 0;

  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border ${
      phase === 'auto'
        ? 'bg-brand-500/10 border-brand-500/30'
        : 'bg-blue-500/10 border-blue-500/30'
    }`}>
      <div className="flex items-center gap-2">
        <Timer size={16} className={phase === 'auto' ? 'text-brand-400' : 'text-blue-400'} />
        <span className="text-sm font-medium text-slate-300">{timeLabel}</span>
      </div>

      {showTimer && (
        <div className="flex items-center gap-2">
          {/* Time Display */}
          <div className={`font-mono font-bold text-lg min-w-[48px] text-center ${
            isZero
              ? 'text-red-500'
              : isLowTime
                ? 'text-orange-400 animate-pulse'
                : isRunning
                  ? 'text-amber-400'
                  : 'text-white'
          }`}>
            {formatTime(timeLeft)}
          </div>

          {/* Control Buttons */}
          <div className="flex gap-1">
            <button
              onClick={handleStart}
              className={`p-2 rounded-lg transition-all active:scale-95 ${
                isRunning
                  ? 'bg-orange-500/20 border border-orange-500/50 text-orange-400 hover:bg-orange-500/30'
                  : 'bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30'
              }`}
              title={isRunning ? t('pauseTimer') : t('startTimer')}
            >
              {isRunning ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button
              onClick={handleReset}
              disabled={timeLeft === totalTime && !isRunning}
              className="p-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              title={t('resetTimer')}
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
