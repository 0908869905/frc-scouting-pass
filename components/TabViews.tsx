import { useState, useRef, useCallback, useEffect } from 'react';
import type { FC } from 'react';
import { ScoutingData, Handedness, AutoClimbStatus, TeleClimbStatus, Alliance } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Plus, Minus, Check, Zap, AlertTriangle, Play, Square, RotateCcw } from 'lucide-react';
import { MATCH_LEVEL_OPTIONS, ALLIANCE_OPTIONS, AUTO_CLIMB_OPTIONS, TELE_CLIMB_OPTIONS } from '../constants';
import { FieldCanvas } from './FieldCanvas';

interface TabProps {
  data: ScoutingData;
  update: (fields: Partial<ScoutingData>) => void;
  handedness?: Handedness;
}

// Team number validation helper (valid range: 1-9999)
function isTeamNumberInvalid(teamNumber: string): boolean {
  if (!teamNumber) return false;
  const num = parseInt(teamNumber, 10);
  return isNaN(num) || num < 1 || num > 9999;
}

// Climb button style helper - eliminates nested ternaries
function getClimbButtonClass(status: string, phase: 'auto' | 'tele'): string {
  if (status.startsWith('Level')) {
    return 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-lg';
  }
  if (status === 'Failed') {
    return 'bg-red-500/20 border-red-500 text-red-400 shadow-lg';
  }
  // Default: None status - use phase-specific color
  if (phase === 'auto') {
    return 'bg-brand-500/20 border-brand-500 text-brand-400 shadow-lg';
  }
  return 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-lg';
}

// -----------------------------------------------------------------------------
// Helper Components - Ergonomic Design
// -----------------------------------------------------------------------------

// Enhanced Counter with larger buttons, pulse animation, and long-press support
const Counter: FC<{
  label: string;
  value: number;
  onChange: (val: number) => void;
  handedness?: Handedness;
  min?: number;
  max?: number;
  accentColor?: string;
}> = ({ label, value, onChange, handedness = 'right', min = 0, max = 99, accentColor = 'brand' }) => {
  const [isPulsing, setIsPulsing] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const rapidInterval = useRef<NodeJS.Timeout | null>(null);
  const valueRef = useRef(value);

  valueRef.current = value;

  const triggerPulse = useCallback(() => {
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 150);
  }, []);

  const handleInc = useCallback(() => {
    if (valueRef.current < max) {
      onChange(valueRef.current + 1);
      triggerPulse();
    }
  }, [max, onChange, triggerPulse]);

  const handleDec = useCallback(() => {
    if (valueRef.current > min) {
      onChange(valueRef.current - 1);
      triggerPulse();
    }
  }, [min, onChange, triggerPulse]);

  const startLongPress = useCallback((isIncrement: boolean) => {
    longPressTimer.current = setTimeout(() => {
      rapidInterval.current = setInterval(() => {
        if (isIncrement && valueRef.current < max) {
          onChange(valueRef.current + 1);
          triggerPulse();
        } else if (!isIncrement && valueRef.current > min) {
          onChange(valueRef.current - 1);
          triggerPulse();
        }
      }, 80);
    }, 400);
  }, [max, min, onChange, triggerPulse]);

  const endLongPress = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (rapidInterval.current) clearInterval(rapidInterval.current);
  }, []);

  const isLeft = handedness === 'left';

  const colorClasses = {
    brand: 'from-brand-500/10 to-transparent border-brand-500/30',
    blue: 'from-blue-500/10 to-transparent border-blue-500/30',
    orange: 'from-orange-500/10 to-transparent border-orange-500/30',
    red: 'from-red-500/10 to-transparent border-red-500/30',
  };

  return (
    <div className={`bg-gradient-to-b ${colorClasses[accentColor as keyof typeof colorClasses] || colorClasses.brand} rounded-2xl p-5 flex flex-col gap-3 shadow-lg border`}>
      <div className="text-slate-300 text-sm font-bold uppercase tracking-wider text-center">{label}</div>
      <div className={`flex items-center justify-between gap-6 ${isLeft ? 'flex-row-reverse' : ''}`}>
        <button
          onClick={handleDec}
          onMouseDown={() => startLongPress(false)}
          onMouseUp={endLongPress}
          onMouseLeave={endLongPress}
          onTouchStart={() => startLongPress(false)}
          onTouchEnd={endLongPress}
          disabled={value <= min}
          className="h-16 w-16 rounded-2xl flex items-center justify-center bg-red-500/20 border-2 border-red-500/50 text-red-400 hover:bg-red-500/30 hover:border-red-500 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Minus size={28} strokeWidth={3} />
        </button>
        <div className={`text-5xl font-display font-black text-white tabular-nums flex-1 text-center transition-transform duration-150 ${isPulsing ? 'scale-110' : 'scale-100'}`}>
          {value}
        </div>
        <button
          onClick={handleInc}
          onMouseDown={() => startLongPress(true)}
          onMouseUp={endLongPress}
          onMouseLeave={endLongPress}
          onTouchStart={() => startLongPress(true)}
          onTouchEnd={endLongPress}
          disabled={value >= max}
          className="h-16 w-16 rounded-2xl flex items-center justify-center bg-green-500/20 border-2 border-green-500/50 text-green-400 hover:bg-green-500/30 hover:border-green-500 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus size={28} strokeWidth={3} />
        </button>
      </div>
      <div className="text-center text-slate-600 text-xs">Hold for rapid input</div>
    </div>
  );
};

// Enhanced Toggle with larger touch target
const Toggle: FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'normal' | 'large';
  variant?: 'default' | 'warning' | 'danger';
}> = ({ label, checked, onChange, size = 'normal', variant = 'default' }) => {
  const sizeClasses = size === 'large' ? 'p-5 min-h-[64px]' : 'p-4 min-h-[56px]';

  const variantClasses = {
    default: checked
      ? 'bg-brand-500/20 border-brand-500 shadow-[0_0_25px_rgba(34,197,94,0.15)]'
      : 'bg-slate-900/80 border-slate-700 hover:border-slate-600 hover:bg-slate-800/80',
    warning: checked
      ? 'bg-yellow-500/20 border-yellow-500 shadow-[0_0_25px_rgba(234,179,8,0.15)]'
      : 'bg-slate-900/80 border-slate-700 hover:border-yellow-500/50 hover:bg-slate-800/80',
    danger: checked
      ? 'bg-red-500/20 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.15)]'
      : 'bg-slate-900/80 border-slate-700 hover:border-red-500/50 hover:bg-slate-800/80',
  };

  const iconClasses = {
    default: checked ? 'bg-brand-500 text-slate-950' : 'bg-slate-700 text-slate-500',
    warning: checked ? 'bg-yellow-500 text-slate-950' : 'bg-slate-700 text-slate-500',
    danger: checked ? 'bg-red-500 text-slate-950' : 'bg-slate-700 text-slate-500',
  };

  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-full ${sizeClasses} rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group active:scale-[0.98] ${variantClasses[variant]}`}
    >
      <span className={`font-semibold text-base ${checked ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
        {label}
      </span>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${iconClasses[variant]} ${checked ? 'scale-110' : ''}`}>
        {checked && <Check size={18} strokeWidth={3} />}
      </div>
    </button>
  );
};

// Stopwatch for timing climb (displays to 2 decimal places)
const Stopwatch: FC<{
  label: string;
  value: number;
  onChange: (val: number) => void;
  accentColor?: 'brand' | 'blue' | 'amber';
}> = ({ label, value, onChange, accentColor = 'brand' }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [displayTime, setDisplayTime] = useState(value);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync display with external value when not running
  useEffect(() => {
    if (!isRunning) {
      setDisplayTime(value);
    }
  }, [value, isRunning]);

  const startStop = useCallback(() => {
    if (isRunning) {
      // Stop - round to 2 decimal places
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const rounded = Math.round(displayTime * 100) / 100;
      onChange(rounded);
      setDisplayTime(rounded);
      setIsRunning(false);
    } else {
      // Start
      startTimeRef.current = Date.now() - displayTime * 1000;
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setDisplayTime(elapsed);
      }, 10); // Update every 10ms for smooth display
      setIsRunning(true);
    }
  }, [isRunning, displayTime, onChange]);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setDisplayTime(0);
    onChange(0);
  }, [onChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Format time as seconds with 2 decimal places (e.g., "12.34")
  const formatTime = (seconds: number): string => {
    return seconds.toFixed(2);
  };

  const colorClasses = {
    brand: {
      bg: 'from-brand-500/10 to-transparent border-brand-500/30',
      btn: isRunning ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-brand-500/20 border-brand-500 text-brand-400',
    },
    blue: {
      bg: 'from-blue-500/10 to-transparent border-blue-500/30',
      btn: isRunning ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-blue-500/20 border-blue-500 text-blue-400',
    },
    amber: {
      bg: 'from-amber-500/10 to-transparent border-amber-500/30',
      btn: isRunning ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-amber-500/20 border-amber-500 text-amber-400',
    },
  };

  const colors = colorClasses[accentColor];

  return (
    <div className={`bg-gradient-to-b ${colors.bg} rounded-2xl p-5 flex flex-col gap-3 shadow-lg border`}>
      <div className="text-slate-300 text-sm font-bold uppercase tracking-wider text-center">{label}</div>
      <div className="flex items-center justify-center gap-4">
        {/* Time Display */}
        <div className={`text-5xl font-display font-black tabular-nums text-center min-w-[120px] ${isRunning ? 'text-amber-400 animate-pulse' : 'text-white'}`}>
          {formatTime(displayTime)}
        </div>
      </div>
      <div className="flex gap-3">
        {/* Start/Stop Button */}
        <button
          onClick={startStop}
          className={`flex-1 p-4 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${colors.btn}`}
        >
          {isRunning ? (
            <>
              <Square size={20} fill="currentColor" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Play size={20} fill="currentColor" />
              <span>Start</span>
            </>
          )}
        </button>
        {/* Reset Button */}
        <button
          onClick={reset}
          disabled={displayTime === 0 && !isRunning}
          className="p-4 rounded-xl border-2 border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600 hover:text-white transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Pre-Match Tab
// -----------------------------------------------------------------------------

export const PreMatchTab: FC<TabProps> = ({ data, update }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Scouter & Event Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">{t('scouterName')}</label>
          <input
            type="text"
            className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-3.5 text-white text-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-slate-600"
            placeholder="Name"
            value={data.scouterName}
            onChange={e => update({ scouterName: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">{t('eventCode')}</label>
          <input
            type="text"
            className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-3.5 text-white text-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all font-mono"
            value={data.eventCode}
            onChange={e => update({ eventCode: e.target.value })}
          />
        </div>
      </div>

      {/* Match Info Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">{t('matchLevel')}</label>
          <select
            className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-3.5 text-white text-lg focus:ring-2 focus:ring-brand-500 outline-none appearance-none cursor-pointer"
            value={data.matchLevel}
            onChange={e => update({ matchLevel: e.target.value as any })}
          >
            {MATCH_LEVEL_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{t(opt)}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">{t('matchNumber')}</label>
          <input
            type="number"
            className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-3.5 text-white text-xl font-bold focus:ring-2 focus:ring-brand-500 outline-none transition-all text-center font-mono"
            min={1}
            value={data.matchNumber}
            onChange={e => update({ matchNumber: parseInt(e.target.value) || 0 })}
            onFocus={e => e.target.select()}
          />
        </div>
      </div>

      {/* Alliance Selection - 2026 REBUILT: Red or Blue only */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase">{t('alliance')}</label>
        <div className="grid grid-cols-2 gap-4">
          {ALLIANCE_OPTIONS.map((alliance: Alliance) => {
            const isSelected = data.alliance === alliance;
            const isRed = alliance === 'Red';
            return (
              <button
                key={alliance}
                onClick={() => update({ alliance })}
                className={`p-6 rounded-2xl text-2xl font-bold border-2 transition-all active:scale-[0.97] ${
                  isSelected
                    ? isRed
                      ? 'bg-red-500/25 border-red-500 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
                      : 'bg-blue-500/25 border-blue-500 text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                    : isRed
                      ? 'bg-slate-900 border-slate-700 text-slate-400 hover:border-red-500/50 hover:text-red-400'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-blue-500/50 hover:text-blue-400'
                }`}
              >
                {t(alliance)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Team Number - Large & Prominent with Validation */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase">{t('teamNumber')}</label>
        <input
          type="number"
          className={`w-full bg-gradient-to-b from-slate-800 to-slate-900 border-2 rounded-2xl p-5 text-5xl font-display font-black text-center text-white focus:ring-2 outline-none transition-all placeholder:text-slate-700 tracking-wider ${
            isTeamNumberInvalid(data.teamNumber)
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-slate-600 focus:ring-brand-500 focus:border-brand-500'
          }`}
          placeholder="0000"
          value={data.teamNumber}
          onChange={e => update({ teamNumber: e.target.value })}
          onFocus={e => e.target.select()}
        />
        {isTeamNumberInvalid(data.teamNumber) && (
          <p className="text-red-400 text-xs font-medium">{t('teamNumberInvalid')}</p>
        )}
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Auton Tab - Green Theme
// -----------------------------------------------------------------------------

export const AutonTab: FC<TabProps> = ({ data, update, handedness }) => {
  const { t } = useLanguage();

  const alliance: 'red' | 'blue' = data.alliance === 'Red' ? 'red' : 'blue';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
      {/* Phase Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-brand-500/30">
        <div className="w-3 h-3 rounded-full bg-brand-500 animate-pulse"></div>
        <h2 className="text-2xl font-display font-bold text-brand-400">{t('autoHeader')}</h2>
        <Zap className="text-brand-500" size={20} />
      </div>

      {/* Field Canvas for Path Drawing */}
      <FieldCanvas
        path={data.autoPath}
        onPathChange={(path) => update({ autoPath: path })}
        alliance={alliance}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-5">
        {/* Fuel Counter */}
        <Counter
          label={t('autoFuel')}
          value={data.autoFuel}
          onChange={val => update({ autoFuel: val })}
          handedness={handedness}
          accentColor="brand"
        />

        {/* Auto Climb Status Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase">{t('autoClimbStatus')}</label>
          <div className="grid grid-cols-3 gap-2">
            {AUTO_CLIMB_OPTIONS.map(status => {
              const isSelected = data.autoClimbStatus === status;
              const selectedClass = getClimbButtonClass(status, 'auto');
              return (
                <button
                  key={status}
                  onClick={() => update({ autoClimbStatus: status as AutoClimbStatus })}
                  className={`p-4 rounded-xl text-sm font-bold border-2 transition-all active:scale-[0.97] ${
                    isSelected
                      ? selectedClass
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {t(status)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Auto Climb Time Stopwatch - Only show if climbing */}
        {data.autoClimbStatus === AutoClimbStatus.Level1 && (
          <Stopwatch
            label={t('autoClimbTime')}
            value={data.autoClimbTime}
            onChange={val => update({ autoClimbTime: val })}
            accentColor="amber"
          />
        )}
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Teleop Tab - Blue Theme
// -----------------------------------------------------------------------------

export const TeleopTab: FC<TabProps> = ({ data, update, handedness }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
      {/* Phase Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-blue-500/30">
        <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
        <h2 className="text-2xl font-display font-bold text-blue-400">{t('teleopHeader')}</h2>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-5">
        {/* Fuel Counter */}
        <Counter
          label={t('teleFuel')}
          value={data.teleFuel}
          onChange={val => update({ teleFuel: val })}
          handedness={handedness}
          accentColor="blue"
        />

        {/* Teleop Climb Status Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase">{t('teleClimbStatus')}</label>
          <div className="grid grid-cols-3 gap-2">
            {TELE_CLIMB_OPTIONS.map(status => {
              const isSelected = data.teleClimbStatus === status;
              const selectedClass = getClimbButtonClass(status, 'tele');
              return (
                <button
                  key={status}
                  onClick={() => update({ teleClimbStatus: status as TeleClimbStatus })}
                  className={`p-4 rounded-xl text-sm font-bold border-2 transition-all active:scale-[0.97] ${
                    isSelected
                      ? selectedClass
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {t(status)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Teleop Climb Time Stopwatch - Only show if climbing */}
        {data.teleClimbStatus !== TeleClimbStatus.None &&
          data.teleClimbStatus !== TeleClimbStatus.Failed && (
          <Stopwatch
            label={t('teleClimbTime')}
            value={data.teleClimbTime}
            onChange={val => update({ teleClimbTime: val })}
            accentColor="amber"
          />
        )}

        {/* Bump & Trench Section */}
        <Counter
          label={t('bumpTrenchCount')}
          value={data.bumpTrenchCount}
          onChange={val => update({ bumpTrenchCount: val })}
          handedness={handedness}
          accentColor="blue"
          max={20}
        />

        <Toggle
          label={t('fuelDroppedOnBump')}
          checked={data.fuelDroppedOnBump}
          onChange={val => update({ fuelDroppedOnBump: val })}
          size="large"
          variant="warning"
        />
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Penalty Tab - Red Theme (NEW)
// -----------------------------------------------------------------------------

export const PenaltyTab: FC<TabProps> = ({ data, update, handedness }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
      {/* Phase Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-red-500/30">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <h2 className="text-2xl font-display font-bold text-red-400">{t('penaltyHeader')}</h2>
        <AlertTriangle className="text-red-500" size={20} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-5">
        {/* Penalty Counter */}
        <Counter
          label={t('penaltyCount')}
          value={data.penaltyCount}
          onChange={val => update({ penaltyCount: val })}
          handedness={handedness}
          accentColor="red"
          max={20}
        />

        {/* Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Toggle
            label={t('yellowCard')}
            checked={data.yellowCard}
            onChange={val => update({ yellowCard: val })}
            size="large"
            variant="warning"
          />
          <Toggle
            label={t('redCard')}
            checked={data.redCard}
            onChange={val => update({ redCard: val })}
            size="large"
            variant="danger"
          />
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Post Match Tab - Orange Theme
// -----------------------------------------------------------------------------

export const PostMatchTab: FC<TabProps> = ({ data, update }) => {
  const { t } = useLanguage();

  // Inline Rating Component
  const Rating: FC<{ label: string; value: number; onChange: (v: number) => void }> = ({ label, value, onChange }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-slate-400 uppercase">{label}</label>
        <span className={`text-base font-black tabular-nums ${value >= 4 ? 'text-green-400' : value >= 3 ? 'text-blue-400' : value >= 1 ? 'text-orange-400' : 'text-slate-600'}`}>
          {value}/5
        </span>
      </div>
      <div className="flex gap-1.5 h-14">
        {[1, 2, 3, 4, 5].map(v => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`flex-1 rounded-xl transition-all active:scale-95 font-bold text-lg ${
              v <= value
                ? v >= 4 ? 'bg-green-500/80 text-green-950' : v >= 3 ? 'bg-blue-500/80 text-blue-950' : 'bg-orange-500/80 text-orange-950'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-600'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-500 pb-20">
      {/* Phase Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-orange-500/30">
        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
        <h2 className="text-2xl font-display font-bold text-orange-400">{t('postMatchHeader')}</h2>
      </div>

      {/* Ratings */}
      <div className="space-y-4">
        <Rating label={t('driverSkill')} value={data.driverSkill} onChange={v => update({ driverSkill: v })} />
        <Rating label={t('defenseRating')} value={data.defenseRating} onChange={v => update({ defenseRating: v })} />
        <Rating label={t('speedRating')} value={data.speedRating} onChange={v => update({ speedRating: v })} />
      </div>

      {/* Quick Flags */}
      <div className="grid grid-cols-1 gap-3">
        <Toggle label={t('robotDied')} checked={data.robotDied} onChange={v => update({ robotDied: v })} variant="danger" />
        <Toggle label={t('almostTipped')} checked={data.almostTipped} onChange={v => update({ almostTipped: v })} variant="warning" />
        <Toggle label={t('ridingOnBall')} checked={data.ridingOnBall} onChange={v => update({ ridingOnBall: v })} variant="warning" />
      </div>

      {/* Comments */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-400 uppercase">{t('comments')}</label>
        <textarea
          className="w-full h-24 bg-slate-900 border-2 border-slate-700 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-orange-500 outline-none resize-none"
          placeholder={t('commentsPlaceholder')}
          value={data.comments}
          onChange={e => update({ comments: e.target.value })}
        />
      </div>

      {/* Subjective Notes */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-400 uppercase">{t('subjectiveNotes')}</label>
        <textarea
          className="w-full h-24 bg-slate-900 border-2 border-slate-700 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-orange-500 outline-none resize-none"
          placeholder={t('subjectiveNotesPlaceholder')}
          value={data.subjectiveNotes}
          onChange={e => update({ subjectiveNotes: e.target.value })}
        />
      </div>
    </div>
  );
};
