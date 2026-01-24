
import React, { useState, useRef, useCallback } from 'react';
import { ScoutingData, Handedness, EndGameStatus } from '../types';
import { Button } from './ui/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { Plus, Minus, Check, Zap } from 'lucide-react';
import { MATCH_LEVEL_OPTIONS, ROBOT_POSITION_OPTIONS, ENDGAME_OPTIONS } from '../constants';
import { FieldCanvas } from './FieldCanvas';

interface TabProps {
  data: ScoutingData;
  update: (fields: Partial<ScoutingData>) => void;
  handedness?: Handedness;
}

// -----------------------------------------------------------------------------
// Helper Components - Ergonomic Design
// -----------------------------------------------------------------------------

// Enhanced Counter with larger buttons, pulse animation, and long-press support
const Counter: React.FC<{
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
  const valueRef = useRef(value); // Track current value for interval callbacks

  // Keep ref in sync with prop
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

  // Long press for rapid increment
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
const Toggle: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'normal' | 'large';
}> = ({ label, checked, onChange, size = 'normal' }) => {
  const sizeClasses = size === 'large' ? 'p-5 min-h-[64px]' : 'p-4 min-h-[56px]';
  
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-full ${sizeClasses} rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group active:scale-[0.98] ${
        checked 
          ? 'bg-brand-500/20 border-brand-500 shadow-[0_0_25px_rgba(34,197,94,0.15)]' 
          : 'bg-slate-900/80 border-slate-700 hover:border-slate-600 hover:bg-slate-800/80'
      }`}
    >
      <span className={`font-semibold text-base ${checked ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
        {label}
      </span>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
        checked ? 'bg-brand-500 text-slate-950 scale-110' : 'bg-slate-700 text-slate-500'
      }`}>
        {checked && <Check size={18} strokeWidth={3} />}
      </div>
    </button>
  );
};

// -----------------------------------------------------------------------------
// Pre-Match Tab
// -----------------------------------------------------------------------------

export const PreMatchTab: React.FC<TabProps> = ({ data, update }) => {
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

      {/* Robot Position - Clear Red/Blue Separation */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase">{t('robotPosition')}</label>
        <div className="grid grid-cols-2 gap-4">
          {/* Red Alliance */}
          <div className="space-y-2">
            <div className="text-center text-red-400 font-bold text-xs uppercase tracking-widest py-1 bg-red-500/10 rounded-lg">Red</div>
            {ROBOT_POSITION_OPTIONS.filter(p => p.startsWith('Red')).map(pos => (
              <button
                key={pos}
                onClick={() => update({ robotPosition: pos as any })}
                className={`w-full p-4 rounded-xl text-lg font-bold border-2 transition-all active:scale-[0.97] ${
                  data.robotPosition === pos
                    ? 'bg-red-500/25 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-red-500/50 hover:text-red-400'
                }`}
              >
                {pos.replace('Red ', '')}
              </button>
            ))}
          </div>
          {/* Blue Alliance */}
          <div className="space-y-2">
            <div className="text-center text-blue-400 font-bold text-xs uppercase tracking-widest py-1 bg-blue-500/10 rounded-lg">Blue</div>
            {ROBOT_POSITION_OPTIONS.filter(p => p.startsWith('Blue')).map(pos => (
              <button
                key={pos}
                onClick={() => update({ robotPosition: pos as any })}
                className={`w-full p-4 rounded-xl text-lg font-bold border-2 transition-all active:scale-[0.97] ${
                  data.robotPosition === pos
                    ? 'bg-blue-500/25 border-blue-500 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-blue-500/50 hover:text-blue-400'
                }`}
              >
                {pos.replace('Blue ', '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Team Number - Large & Prominent */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase">{t('teamNumber')}</label>
        <input
          type="number"
          className="w-full bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-600 rounded-2xl p-5 text-5xl font-display font-black text-center text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-slate-700 tracking-wider"
          placeholder="0000"
          value={data.teamNumber}
          onChange={e => update({ teamNumber: e.target.value })}
          onFocus={e => e.target.select()}
        />
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Auton Tab - Green Theme
// -----------------------------------------------------------------------------

export const AutonTab: React.FC<TabProps> = ({ data, update, handedness }) => {
  const { t } = useLanguage();

  // Derive alliance from robot position
  const alliance = data.robotPosition.startsWith('Red') ? 'red' : 'blue';

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
        alliance={alliance as 'red' | 'blue'}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-5">
        {/* Fuel Counter - Most Important */}
        <Counter
          label={t('autoFuel')}
          value={data.autoFuel}
          onChange={val => update({ autoFuel: val })}
          handedness={handedness}
          accentColor="brand"
        />

        {/* Toggles Row */}
        <div className="grid grid-cols-2 gap-3">
          <Toggle
            label={t('leaveZone')}
            checked={data.autoLeave}
            onChange={val => update({ autoLeave: val })}
            size="large"
          />
          <Toggle
            label={t('towerLevel1')}
            checked={data.autoTowerLevel1}
            onChange={val => update({ autoTowerLevel1: val })}
            size="large"
          />
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Teleop Tab - Blue Theme
// -----------------------------------------------------------------------------

export const TeleopTab: React.FC<TabProps> = ({ data, update, handedness }) => {
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

        {/* End Game Tower Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase">{t('teleTower')}</label>
          <div className="grid grid-cols-3 gap-2">
            {ENDGAME_OPTIONS.map(status => {
              const isSelected = data.teleTower === status;
              const isClimb = status.includes('Level');
              return (
                <button
                  key={status}
                  onClick={() => update({ teleTower: status as EndGameStatus })}
                  className={`p-4 rounded-xl text-sm font-bold border-2 transition-all active:scale-[0.97] ${
                    isSelected
                      ? isClimb 
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-lg'
                        : 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-lg'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {t(status)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Post Match Tab - Orange Theme
// -----------------------------------------------------------------------------

export const PostMatchTab: React.FC<TabProps> = ({ data, update }) => {
  const { t } = useLanguage();

  // Inline Rating Component
  const Rating: React.FC<{ label: string; value: number; onChange: (v: number) => void }> = ({ label, value, onChange }) => (
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
        <h2 className="text-2xl font-display font-bold text-orange-400">Post Match</h2>
      </div>

      {/* Ratings */}
      <div className="space-y-4">
        <Rating label={t('driverRating')} value={data.driverRating} onChange={v => update({ driverRating: v })} />
        <Rating label={t('defenseRating')} value={data.defenseRating} onChange={v => update({ defenseRating: v })} />
        <Rating label={t('speedRating')} value={data.speedRating} onChange={v => update({ speedRating: v })} />
      </div>

      {/* Quick Flags */}
      <div className="grid grid-cols-2 gap-3">
        <Toggle label={t('robotDied')} checked={data.robotDied} onChange={v => update({ robotDied: v })} />
        <Toggle label={t('tippedOver')} checked={data.tippedOver} onChange={v => update({ tippedOver: v })} />
      </div>

      {/* Defended By */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-400 uppercase">{t('defendedBy')}</label>
        <input
          type="text"
          className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-3.5 text-white text-lg focus:ring-2 focus:ring-orange-500 outline-none"
          placeholder="Team #"
          value={data.defendedBy}
          onChange={e => update({ defendedBy: e.target.value })}
        />
      </div>

      {/* Comments */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-400 uppercase">{t('comments')}</label>
        <textarea
          className="w-full h-28 bg-slate-900 border-2 border-slate-700 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-orange-500 outline-none resize-none"
          placeholder={t('commentsPlaceholder')}
          value={data.comments}
          onChange={e => update({ comments: e.target.value })}
        />
      </div>
    </div>
  );
};
