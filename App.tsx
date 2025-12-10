import React, { useState, useEffect } from 'react';
import { MatchPhase, ScoutingData, INITIAL_DATA, MatchLevel } from './types';
import { PreMatchTab, AutonTab, TeleopTab, PostMatchTab } from './components/TabViews';
import { QRCodeTab } from './components/QRCodeTab';
import { Button } from './components/ui/Button';
import { APP_CONFIG } from './constants';
import { ChevronRight, ChevronLeft, QrCode } from 'lucide-react';

const phases: MatchPhase[] = ['PreMatch', 'Auton', 'Teleop', 'PostMatch', 'QRCode'];

export default function App() {
  const [currentPhase, setCurrentPhase] = useState<MatchPhase>('PreMatch');
  const [data, setData] = useState<ScoutingData>(() => {
    // Try to load from local storage to prevent data loss on refresh
    const saved = localStorage.getItem('scoutingData');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('scoutingData', JSON.stringify(data));
  }, [data]);

  const updateData = (fields: Partial<ScoutingData>) => {
    setData(prev => ({ ...prev, ...fields }));
  };

  const handleNext = () => {
    const idx = phases.indexOf(currentPhase);
    if (idx < phases.length - 1) setCurrentPhase(phases[idx + 1]);
  };

  const handlePrev = () => {
    const idx = phases.indexOf(currentPhase);
    if (idx > 0) setCurrentPhase(phases[idx - 1]);
  };

  const handleReset = () => {
    // Preserve scouter name, event code, and increment match number
    const nextMatchNum = data.matchLevel === MatchLevel.Quals ? data.matchNumber + 1 : data.matchNumber;
    
    setData({
      ...INITIAL_DATA,
      scouterName: data.scouterName,
      eventCode: data.eventCode,
      matchLevel: data.matchLevel,
      robotPosition: data.robotPosition,
      matchNumber: nextMatchNum
    });
    setCurrentPhase('PreMatch');
  };

  const phaseIndex = phases.indexOf(currentPhase);
  const progress = ((phaseIndex + 1) / phases.length) * 100;

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="flex-none bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between z-10 shadow-lg">
        <div>
          <h1 className="text-xl font-display font-bold text-white">
            {APP_CONFIG.teamName} <span className="text-slate-500 text-sm font-sans tracking-wide">| {APP_CONFIG.appName}</span>
          </h1>
          <div className="text-xs text-slate-500 font-mono mt-1">
             Match {data.matchNumber} • {data.robotPosition} • {data.teamNumber || "No Team"}
          </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="hidden md:flex gap-1">
              {phases.map(p => (
                <div 
                  key={p} 
                  onClick={() => setCurrentPhase(p)}
                  className={`cursor-pointer h-2 w-8 rounded-full transition-all ${p === currentPhase ? 'bg-brand-500' : 'bg-slate-800 hover:bg-slate-700'}`}
                />
              ))}
           </div>
        </div>
      </header>
      
      {/* Progress Bar */}
      <div className="w-full bg-slate-900 h-1">
        <div className="h-full bg-brand-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 w-full max-w-5xl mx-auto no-scrollbar">
        {currentPhase === 'PreMatch' && <PreMatchTab data={data} update={updateData} />}
        {currentPhase === 'Auton' && <AutonTab data={data} update={updateData} />}
        {currentPhase === 'Teleop' && <TeleopTab data={data} update={updateData} />}
        {currentPhase === 'PostMatch' && <PostMatchTab data={data} update={updateData} />}
        {currentPhase === 'QRCode' && <QRCodeTab data={data} onReset={handleReset} />}
      </main>

      {/* Bottom Navigation */}
      <footer className="flex-none bg-slate-900 border-t border-slate-800 p-3 flex gap-4 z-10">
        <Button 
          variant="secondary" 
          onClick={handlePrev} 
          disabled={phaseIndex === 0}
          className="flex-1"
        >
          <ChevronLeft className="mr-1" /> Prev
        </Button>
        
        {currentPhase !== 'QRCode' ? (
           <Button 
            variant="primary" 
            onClick={handleNext} 
            className="flex-[2]"
          >
            Next <ChevronRight className="ml-1" />
          </Button>
        ) : (
          <div className="flex-[2] text-center text-slate-500 text-sm flex items-center justify-center">
            Scan to Finish
          </div>
        )}
      </footer>
    </div>
  );
}