import { useState, useEffect } from 'react';
import { MatchPhase, ScoutingData, INITIAL_DATA, MatchLevel, Handedness } from './types';
import { PreMatchTab, AutonTab, TeleopTab, PostMatchTab } from './components/TabViews';
import { QRCodeTab } from './components/QRCodeTab';
import { HistoryModal } from './components/HistoryModal';
import { Button } from './components/ui/Button';
import { APP_CONFIG, STARTING_ZONE_WIDTH, RED_STARTING_ZONE_OFFSET, BLUE_STARTING_ZONE_OFFSET } from './constants';
import { ChevronRight, ChevronLeft, Settings, X, History as HistoryIcon, Globe } from 'lucide-react';
import { getUnsyncedCount } from './services/storage';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

// 2026 REBUILT: Penalty merged into Teleop
const phases: MatchPhase[] = ['PreMatch', 'Auton', 'Teleop', 'PostMatch', 'QRCode'];

function AppContent() {
  const { t, lang, setLang } = useLanguage();
  const [currentPhase, setCurrentPhase] = useState<MatchPhase>('PreMatch');
  const [data, setData] = useState<ScoutingData>(() => {
    const saved = localStorage.getItem('scoutingData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with INITIAL_DATA to ensure new fields exist
        return { ...INITIAL_DATA, ...parsed };
      } catch (e) {
        console.error("Failed to parse saved data", e);
        return INITIAL_DATA;
      }
    }
    return INITIAL_DATA;
  });

  // Settings & History State
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [handedness, setHandedness] = useState<Handedness>(() => {
    return (localStorage.getItem('handedness') as Handedness) || 'right';
  });

  // Simple poller to update unsynced badge on header
  const [unsyncedCount, setUnsyncedCount] = useState(0);

  useEffect(() => {
    setUnsyncedCount(getUnsyncedCount());
    const interval = setInterval(() => {
      setUnsyncedCount(getUnsyncedCount());
    }, 5000);
    return () => clearInterval(interval);
  }, [showHistory]);

  useEffect(() => {
    localStorage.setItem('scoutingData', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('handedness', handedness);
  }, [handedness]);

  const updateData = (fields: Partial<ScoutingData>) => {
    setData(prev => ({ ...prev, ...fields }));
  };

  const validateRequiredFields = (notify: boolean = true): boolean => {
    const errors: string[] = [];
    if (!data.scouterName.trim()) errors.push(t('scouterName'));
    if (!data.eventCode.trim()) errors.push(t('eventCode'));
    if (!data.teamNumber.trim()) {
      errors.push(t('teamNumber'));
    } else {
      // Validate team number format (1-9999)
      const teamNum = parseInt(data.teamNumber, 10);
      if (isNaN(teamNum) || teamNum < 1 || teamNum > 9999) {
        errors.push(t('teamNumberInvalid'));
      }
    }
    if (!data.matchNumber || data.matchNumber < 1) errors.push(t('matchNumber'));

    if (errors.length > 0) {
      if (notify) {
        alert(`Required fields missing:\n- ${errors.join('\n- ')}`);
      }
      return false;
    }
    return true;
  };

  const validateAutoStartPosition = (notify: boolean = true): boolean => {
    // If no path drawn, it's valid (path is optional)
    if (data.autoPath.length === 0) return true;

    const firstPoint = data.autoPath[0];
    // Use alliance-specific starting zone offset
    const zoneOffset = data.alliance.startsWith('R') ? RED_STARTING_ZONE_OFFSET : BLUE_STARTING_ZONE_OFFSET;
    const zoneStart = zoneOffset;
    const zoneEnd = zoneOffset + STARTING_ZONE_WIDTH;
    const isValid = firstPoint.x >= zoneStart && firstPoint.x <= zoneEnd;

    if (!isValid && notify) {
      alert(t('autoStartWarning'));
    }
    return isValid;
  };

  // Validates and navigates to target phase, returns true if navigation succeeded
  const navigateToPhase = (targetPhase: MatchPhase, fromPhase: MatchPhase): boolean => {
    const targetIdx = phases.indexOf(targetPhase);
    const fromIdx = phases.indexOf(fromPhase);

    // Only validate when moving forward
    if (targetIdx > fromIdx) {
      // Validate PreMatch when leaving it
      if (fromIdx === 0 && !validateRequiredFields()) return false;
      // Validate Auto path when leaving Auton
      if (fromIdx === 1 && !validateAutoStartPosition()) return false;
      // Full validation when going to QRCode
      if (targetPhase === 'QRCode') {
        if (!validateRequiredFields()) {
          setCurrentPhase('PreMatch');
          return false;
        }
        if (!validateAutoStartPosition()) {
          setCurrentPhase('Auton');
          return false;
        }
      }
    }

    setCurrentPhase(targetPhase);
    return true;
  };

  const handleNext = () => {
    const idx = phases.indexOf(currentPhase);
    if (idx < phases.length - 1) {
      navigateToPhase(phases[idx + 1], currentPhase);
    }
  };

  const handlePrev = () => {
    const idx = phases.indexOf(currentPhase);
    if (idx > 0) setCurrentPhase(phases[idx - 1]);
  };

  const handleReset = () => {
    const nextMatchNum = data.matchLevel === MatchLevel.Quals ? data.matchNumber + 1 : data.matchNumber;

    setData({
      ...INITIAL_DATA,
      scouterName: data.scouterName,
      eventCode: data.eventCode,
      matchLevel: data.matchLevel,
      alliance: data.alliance, // 2026: preserve alliance
      matchNumber: nextMatchNum
    });
    setCurrentPhase('PreMatch');
  };

  const phaseIndex = phases.indexOf(currentPhase);
  const progress = ((phaseIndex + 1) / phases.length) * 100;

  const toggleLang = () => {
    setLang(lang === 'en' ? 'zh' : 'en');
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-sans relative">
      <HistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} />

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-display font-bold text-white">{t('settings')}</h2>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm text-slate-400 font-bold uppercase mb-3">{t('oneHanded')}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setHandedness('left')}
                    className={`p-4 rounded-xl border-2 transition-all font-medium ${handedness === 'left' ? 'border-brand-500 bg-brand-900/20 text-white' : 'border-slate-700 bg-slate-800 text-slate-400'}`}
                  >
                    {t('leftHanded')}
                  </button>
                  <button
                    onClick={() => setHandedness('right')}
                    className={`p-4 rounded-xl border-2 transition-all font-medium ${handedness === 'right' ? 'border-brand-500 bg-brand-900/20 text-white' : 'border-slate-700 bg-slate-800 text-slate-400'}`}
                  >
                    {t('rightHanded')}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button fullWidth onClick={() => setShowSettings(false)}>{t('done')}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex-none bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between z-10 shadow-lg">
        <div>
          <h1 className="text-xl font-display font-bold text-white">
            {APP_CONFIG.teamName} <span className="text-slate-500 text-sm font-sans tracking-wide">| {APP_CONFIG.appName}</span>
          </h1>
          <div className="text-xs text-slate-500 font-mono mt-1">
            {t('match')} {data.matchNumber} • <span className={data.alliance === 'Red' ? 'text-red-400' : 'text-blue-400'}>{t(data.alliance)}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title={lang === 'en' ? 'Switch to Traditional Chinese' : '切換至英文'}
          >
            <Globe size={20} />
            <span className="sr-only">Language</span>
          </button>

          <button
            onClick={() => setShowHistory(true)}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors relative"
          >
            <HistoryIcon size={20} />
            {unsyncedCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border border-slate-900"></span>
            )}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <Settings size={20} />
          </button>
          <div className="hidden md:flex gap-1">
            {phases.map(p => (
              <div
                key={p}
                onClick={() => navigateToPhase(p, currentPhase)}
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
        {currentPhase === 'PreMatch' && <PreMatchTab data={data} update={updateData} handedness={handedness} />}
        {currentPhase === 'Auton' && <AutonTab data={data} update={updateData} handedness={handedness} />}
        {currentPhase === 'Teleop' && <TeleopTab data={data} update={updateData} handedness={handedness} />}
        {currentPhase === 'PostMatch' && <PostMatchTab data={data} update={updateData} handedness={handedness} />}
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
          <ChevronLeft className="mr-1" /> {t('prev')}
        </Button>

        {currentPhase !== 'QRCode' ? (
          <Button
            variant="primary"
            onClick={handleNext}
            className="flex-[2]"
          >
            {t('next')} <ChevronRight className="ml-1" />
          </Button>
        ) : (
          <div className="flex-[2] text-center text-slate-500 text-sm flex items-center justify-center">
            {t('scanFinish')}
          </div>
        )}
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
