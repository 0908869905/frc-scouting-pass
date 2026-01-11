
import React from 'react';
import { ScoutingData, Handedness, EndGameStatus } from '../types';
import { Button } from './ui/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { Plus, Minus, Check, X } from 'lucide-react';
import { MATCH_LEVEL_OPTIONS, ROBOT_POSITION_OPTIONS, ENDGAME_OPTIONS } from '../constants';

interface TabProps {
  data: ScoutingData;
  update: (fields: Partial<ScoutingData>) => void;
  handedness?: Handedness;
}

// -----------------------------------------------------------------------------
// Helper Components
// -----------------------------------------------------------------------------

const Counter: React.FC<{
  label: string;
  value: number;
  onChange: (val: number) => void;
  handedness?: Handedness;
  min?: number;
  max?: number;
}> = ({ label, value, onChange, handedness = 'right', min = 0, max = 99 }) => {
  const handleInc = () => {
    if (value < max) onChange(value + 1);
  };
  const handleDec = () => {
    if (value > min) onChange(value - 1);
  };

  const isLeft = handedness === 'left';

  return (
    <div className="bg-slate-900 rounded-xl p-4 flex flex-col gap-2 shadow-sm border border-slate-800">
      <div className="text-slate-400 text-sm font-bold uppercase tracking-wider text-center">{label}</div>
      <div className={`flex items-center justify-between gap-4 ${isLeft ? 'flex-row-reverse' : ''}`}>
        <Button 
          variant="danger" 
          onClick={handleDec} 
          disabled={value <= min}
          className="h-14 w-14 rounded-xl flex items-center justify-center"
        >
          <Minus size={24} />
        </Button>
        <div className="text-4xl font-display font-bold text-white tabular-nums flex-1 text-center">
          {value}
        </div>
        <Button 
          variant="success" 
          onClick={handleInc} 
          disabled={value >= max}
          className="h-14 w-14 rounded-xl flex items-center justify-center"
        >
          <Plus size={24} />
        </Button>
      </div>
    </div>
  );
};

const Toggle: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, checked, onChange }) => {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${
        checked 
          ? 'bg-brand-900/20 border-brand-500 shadow-[0_0_20px_rgba(34,197,94,0.1)]' 
          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
      }`}
    >
      <span className={`font-medium ${checked ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
        {label}
      </span>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
        checked ? 'bg-brand-500 text-slate-950' : 'bg-slate-800 text-slate-600'
      }`}>
        {checked && <Check size={14} strokeWidth={3} />}
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scouter Name */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">{t('scouterName')}</label>
          <input
            type="text"
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
            placeholder="Name"
            value={data.scouterName}
            onChange={e => update({ scouterName: e.target.value })}
          />
        </div>

        {/* Event Code */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">{t('eventCode')}</label>
          <input
            type="text"
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600 font-mono"
            value={data.eventCode}
            onChange={e => update({ eventCode: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Match Level */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">{t('matchLevel')}</label>
          <select
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none appearance-none"
            value={data.matchLevel}
            onChange={e => update({ matchLevel: e.target.value as any })}
          >
            {MATCH_LEVEL_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{t(opt)}</option>
            ))}
          </select>
        </div>

        {/* Match Number */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">{t('matchNumber')}</label>
          <input
            type="number"
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600 font-mono text-center"
            min={1}
            value={data.matchNumber}
            onChange={e => update({ matchNumber: parseInt(e.target.value) || 0 })}
            onFocus={e => e.target.select()}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase">{t('robotPosition')}</label>
        <div className="grid grid-cols-3 gap-2">
          {ROBOT_POSITION_OPTIONS.map(pos => {
            const isRed = pos.startsWith('Red');
            const isSelected = data.robotPosition === pos;
            return (
              <button
                key={pos}
                onClick={() => update({ robotPosition: pos as any })}
                className={`p-3 rounded-lg text-sm font-bold border-2 transition-all ${
                  isSelected
                    ? isRed 
                      ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                      : 'bg-blue-500/20 border-blue-500 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                {t(pos)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Team Number */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase">{t('teamNumber')}</label>
        <input
          type="number"
          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-4xl font-display font-bold text-center text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder:text-slate-700 tracking-wider"
          placeholder="0000"
          value={data.teamNumber}
          onChange={e => update({ teamNumber: e.target.value })}
        />
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Auton Tab
// -----------------------------------------------------------------------------

export const AutonTab: React.FC<TabProps> = ({ data, update, handedness }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-display font-bold text-brand-400">{t('autoHeader')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
           {/* Mobility */}
           <Toggle
            label={t('leaveZone')}
            checked={data.autoLeave}
            onChange={val => update({ autoLeave: val })}
          />

          {/* Tower Level 1 */}
          <Toggle
            label={t('towerLevel1')}
            checked={data.autoTowerLevel1}
            onChange={val => update({ autoTowerLevel1: val })}
          />
        </div>

        <div className="space-y-4">
          {/* Fuel */}
          <Counter
            label={t('autoFuel')}
            value={data.autoFuel}
            onChange={val => update({ autoFuel: val })}
            handedness={handedness}
          />
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Teleop Tab
// -----------------------------------------------------------------------------

export const TeleopTab: React.FC<TabProps> = ({ data, update, handedness }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-display font-bold text-blue-400">{t('teleopHeader')}</h2>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Fuel Counter */}
        <Counter
          label={t('teleFuel')}
          value={data.teleFuel}
          onChange={val => update({ teleFuel: val })}
          handedness={handedness}
        />

        {/* End Game / Tower */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">{t('teleTower')}</label>
          <div className="grid grid-cols-2 gap-2">
            {ENDGAME_OPTIONS.map(status => (
              <button
                key={status}
                onClick={() => update({ teleTower: status as EndGameStatus })}
                className={`p-4 rounded-xl text-sm font-bold border-2 transition-all ${
                  data.teleTower === status
                    ? 'bg-brand-900/20 border-brand-500 text-white shadow-lg'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {t(status)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Post Match Tab
// -----------------------------------------------------------------------------

export const PostMatchTab: React.FC<TabProps> = ({ data, update }) => {
  const { t } = useLanguage();

  const Rating: React.FC<{ label: string, value: number, onChange: (v: number) => void }> = ({ label, value, onChange }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-slate-500 uppercase">{label}</label>
        <span className={`text-sm font-bold ${value >= 4 ? 'text-green-500' : value >= 3 ? 'text-blue-400' : 'text-slate-400'}`}>
          {value}/5
        </span>
      </div>
      <div className="flex gap-1 h-12">
        {[1, 2, 3, 4, 5].map(v => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`flex-1 rounded-md transition-all ${
              v <= value 
                ? 'bg-brand-500/80 hover:bg-brand-500' 
                : 'bg-slate-800 hover:bg-slate-700'
            }`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
            <Rating 
                label={t('defenseRating')} 
                value={data.defenseRating} 
                onChange={v => update({ defenseRating: v })} 
            />
            <Rating 
                label={t('driverRating')} 
                value={data.driverRating} 
                onChange={v => update({ driverRating: v })} 
            />
            <Rating 
                label={t('speedRating')} 
                value={data.speedRating} 
                onChange={v => update({ speedRating: v })} 
            />
        </div>
        
        <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">{t('defendedBy')}</label>
                <input
                    type="text"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="Team #"
                    value={data.defendedBy}
                    onChange={e => update({ defendedBy: e.target.value })}
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                 <Toggle 
                    label={t('robotDied')} 
                    checked={data.robotDied} 
                    onChange={v => update({ robotDied: v })} 
                />
                <Toggle 
                    label={t('tippedOver')} 
                    checked={data.tippedOver} 
                    onChange={v => update({ tippedOver: v })} 
                />
            </div>
            
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">{t('comments')}</label>
                <textarea
                    className="w-full h-32 bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                    placeholder={t('commentsPlaceholder')}
                    value={data.comments}
                    onChange={e => update({ comments: e.target.value })}
                />
            </div>
        </div>
      </div>
    </div>
  );
};
