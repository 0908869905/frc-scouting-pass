import React from 'react';
import { ScoutingData, MatchLevel, RobotPosition, INITIAL_DATA } from '../types';
import { MATCH_LEVEL_OPTIONS, ROBOT_POSITION_OPTIONS, PICKUP_SOURCE_OPTIONS, ENDGAME_OPTIONS } from '../constants';
import { Counter, Toggle, SelectGroup, Stopwatch } from './ui/InputFields';
import { Button } from './ui/Button';
import { Handedness } from '../App';

interface TabProps {
  data: ScoutingData;
  update: (fields: Partial<ScoutingData>) => void;
  handedness?: Handedness;
}

export const PreMatchTab: React.FC<TabProps> = ({ data, update }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 font-bold uppercase mb-1">
            Scouter Name <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
            value={data.scouterName}
            onChange={(e) => update({ scouterName: e.target.value })}
            placeholder="Enter your name"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 font-bold uppercase mb-1">
            Event Code <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
            value={data.eventCode}
            onChange={(e) => update({ eventCode: e.target.value })}
          />
        </div>
        <SelectGroup 
          label="Match Level" 
          value={data.matchLevel} 
          options={MATCH_LEVEL_OPTIONS} 
          onChange={(v) => update({ matchLevel: v as any })} 
        />
        <div>
          <label className="block text-sm text-slate-400 font-bold uppercase mb-1">
            Match Number <span className="text-red-500">*</span>
          </label>
          <input 
            type="number" 
            min="1"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none text-2xl font-display"
            value={data.matchNumber}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              update({ matchNumber: isNaN(val) ? 0 : val })
            }}
          />
        </div>
      </div>
      <div className="space-y-4">
        <SelectGroup 
          label="Robot Position" 
          value={data.robotPosition} 
          options={ROBOT_POSITION_OPTIONS} 
          onChange={(v) => update({ robotPosition: v as any })} 
        />
        <div>
          <label className="block text-sm text-slate-400 font-bold uppercase mb-1">
            Team Number <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            inputMode="numeric"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none text-4xl font-display font-bold tracking-widest text-center"
            value={data.teamNumber}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 5);
              update({ teamNumber: val });
            }}
            placeholder="####"
          />
        </div>
        <Toggle 
          label="Human Player in Processor Area?" 
          value={data.humanPlayerPresent} 
          onChange={(v) => update({ humanPlayerPresent: v })} 
        />
      </div>
    </div>
  );
};

export const AutonTab: React.FC<TabProps> = ({ data, update, handedness }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="grid grid-cols-1">
        <Toggle label="Leave Starting Zone" value={data.autoLeave} onChange={(v) => update({ autoLeave: v })} />
      </div>
      
      <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <h3 className="text-brand-400 font-display mb-4 text-center text-lg">Coral Scoring</h3>
        <div className="grid grid-cols-2 gap-3">
          <Counter handedness={handedness} label="L4 Success" value={data.autoCoralL4Success} onChange={(v) => update({ autoCoralL4Success: v })} />
          <Counter handedness={handedness} label="L4 Fail" value={data.autoCoralL4Fail} onChange={(v) => update({ autoCoralL4Fail: v })} />
          
          <Counter handedness={handedness} label="L3 Success" value={data.autoCoralL3Success} onChange={(v) => update({ autoCoralL3Success: v })} />
          <Counter handedness={handedness} label="L3 Fail" value={data.autoCoralL3Fail} onChange={(v) => update({ autoCoralL3Fail: v })} />
          
          <Counter handedness={handedness} label="L2 Success" value={data.autoCoralL2Success} onChange={(v) => update({ autoCoralL2Success: v })} />
          <Counter handedness={handedness} label="L2 Fail" value={data.autoCoralL2Fail} onChange={(v) => update({ autoCoralL2Fail: v })} />
          
          <Counter handedness={handedness} label="L1 Success" value={data.autoCoralL1Success} onChange={(v) => update({ autoCoralL1Success: v })} />
          <Counter handedness={handedness} label="L1 Fail" value={data.autoCoralL1Fail} onChange={(v) => update({ autoCoralL1Fail: v })} />
        </div>
      </div>

      <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <h3 className="text-brand-400 font-display mb-4 text-center text-lg">Algae Scoring</h3>
        <div className="grid grid-cols-2 gap-3">
          <Counter handedness={handedness} label="Processor Hit" value={data.autoProcessorSuccess} onChange={(v) => update({ autoProcessorSuccess: v })} />
          <Counter handedness={handedness} label="Processor Miss" value={data.autoProcessorFail} onChange={(v) => update({ autoProcessorFail: v })} />
          <Counter handedness={handedness} label="Net Hit" value={data.autoNetSuccess} onChange={(v) => update({ autoNetSuccess: v })} />
          <Counter handedness={handedness} label="Net Miss" value={data.autoNetFail} onChange={(v) => update({ autoNetFail: v })} />
        </div>
      </div>
    </div>
  );
};

export const TeleopTab: React.FC<TabProps> = ({ data, update, handedness }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-20">
      
      <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <h3 className="text-brand-400 font-display mb-4 text-center text-lg">Coral Scoring</h3>
        <div className="grid grid-cols-2 gap-3">
          <Counter handedness={handedness} label="L4 Success" value={data.teleCoralL4Success} onChange={(v) => update({ teleCoralL4Success: v })} />
          <Counter handedness={handedness} label="L4 Fail" value={data.teleCoralL4Fail} onChange={(v) => update({ teleCoralL4Fail: v })} />
          
          <Counter handedness={handedness} label="L3 Success" value={data.teleCoralL3Success} onChange={(v) => update({ teleCoralL3Success: v })} />
          <Counter handedness={handedness} label="L3 Fail" value={data.teleCoralL3Fail} onChange={(v) => update({ teleCoralL3Fail: v })} />
          
          <Counter handedness={handedness} label="L2 Success" value={data.teleCoralL2Success} onChange={(v) => update({ teleCoralL2Success: v })} />
          <Counter handedness={handedness} label="L2 Fail" value={data.teleCoralL2Fail} onChange={(v) => update({ teleCoralL2Fail: v })} />
          
          <Counter handedness={handedness} label="L1 Success" value={data.teleCoralL1Success} onChange={(v) => update({ teleCoralL1Success: v })} />
          <Counter handedness={handedness} label="L1 Fail" value={data.teleCoralL1Fail} onChange={(v) => update({ teleCoralL1Fail: v })} />
        </div>
      </div>

      <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <h3 className="text-brand-400 font-display mb-4 text-center text-lg">Algae Scoring</h3>
        <div className="grid grid-cols-2 gap-3">
          <Counter handedness={handedness} label="Processor Hit" value={data.teleProcessorSuccess} onChange={(v) => update({ teleProcessorSuccess: v })} />
          <Counter handedness={handedness} label="Processor Miss" value={data.teleProcessorFail} onChange={(v) => update({ teleProcessorFail: v })} />
          <Counter handedness={handedness} label="Net Hit" value={data.teleNetSuccess} onChange={(v) => update({ teleNetSuccess: v })} />
          <Counter handedness={handedness} label="Net Miss" value={data.teleNetFail} onChange={(v) => update({ teleNetFail: v })} />
        </div>
      </div>

      {/* Strategy / Info Moved Here */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectGroup 
          label="Pickup Source" 
          value={data.telePickupSource} 
          options={PICKUP_SOURCE_OPTIONS} 
          onChange={(v) => update({ telePickupSource: v as any })} 
        />
        <div className="flex flex-col justify-end">
           <Toggle label="Opponent Processor Shot?" value={data.teleOpponentProcessor} onChange={(v) => update({ teleOpponentProcessor: v })} />
        </div>
      </div>

      <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <h3 className="text-brand-400 font-display mb-4 text-center text-lg">End Game</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-slate-400 text-sm font-bold uppercase mb-2 block">Barge Timer</label>
            <Stopwatch value={data.teleBargeTime} onChange={(v) => update({ teleBargeTime: v })} />
          </div>
          <SelectGroup 
            label="Final Status" 
            value={data.teleEndGame} 
            options={ENDGAME_OPTIONS} 
            onChange={(v) => update({ teleEndGame: v as any })} 
          />
        </div>
      </div>
    </div>
  );
};

export const PostMatchTab: React.FC<TabProps> = ({ data, update }) => {
  const MAX_COMMENTS = 150;
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
         <div>
            <label className="block text-sm text-slate-400 font-bold uppercase mb-2">Driver Skill (0-5)</label>
            <input type="range" min="0" max="5" step="1" className="w-full accent-brand-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" 
              value={data.driverRating} onChange={(e) => update({ driverRating: parseInt(e.target.value) })} 
            />
            <div className="text-center font-display text-2xl mt-2">{data.driverRating}</div>
         </div>
         <div>
            <label className="block text-sm text-slate-400 font-bold uppercase mb-2">Defense Rating (0-5)</label>
            <input type="range" min="0" max="5" step="1" className="w-full accent-brand-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" 
              value={data.defenseRating} onChange={(e) => update({ defenseRating: parseInt(e.target.value) })} 
            />
            <div className="text-center font-display text-2xl mt-2">{data.defenseRating}</div>
         </div>
          <div>
            <label className="block text-sm text-slate-400 font-bold uppercase mb-2">Speed Rating (0-5)</label>
            <input type="range" min="0" max="5" step="1" className="w-full accent-brand-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" 
              value={data.speedRating} onChange={(e) => update({ speedRating: parseInt(e.target.value) })} 
            />
            <div className="text-center font-display text-2xl mt-2">{data.speedRating}</div>
         </div>
         <div className="space-y-4">
            <Toggle label="Coop Bonus Met?" value={data.coopBonus} onChange={(v) => update({ coopBonus: v })} />
            <input 
              type="text" 
              placeholder="Defended By (Team #)" 
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
              value={data.defendedBy}
              onChange={(e) => update({ defendedBy: e.target.value })}
            />
         </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Toggle label="Robot Died/Disabled" value={data.robotDied} onChange={(v) => update({ robotDied: v })} />
        <Toggle label="Tipped Over" value={data.tippedOver} onChange={(v) => update({ tippedOver: v })} />
        <Toggle label="Dropped Coral (2+)" value={data.droppedCoral} onChange={(v) => update({ droppedCoral: v })} />
        <Toggle label="Dropped Algae (2+)" value={data.droppedAlgae} onChange={(v) => update({ droppedAlgae: v })} />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm text-slate-400 font-bold uppercase">Comments</label>
          <span className={`text-xs ${data.comments.length >= MAX_COMMENTS ? 'text-red-500' : 'text-slate-500'}`}>
            {MAX_COMMENTS - data.comments.length} left
          </span>
        </div>
        <textarea 
          rows={4}
          maxLength={MAX_COMMENTS}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none resize-none"
          value={data.comments}
          onChange={(e) => update({ comments: e.target.value })}
          placeholder="Strategy, strengths, weaknesses..."
        />
      </div>
    </div>
  );
};