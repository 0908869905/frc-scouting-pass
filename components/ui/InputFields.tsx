import React from 'react';
import { Button } from './Button';
import { Minus, Plus, RefreshCw, Undo2 } from 'lucide-react';

// --- Counter ---
interface CounterProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
}

export const Counter: React.FC<CounterProps> = ({ label, value, onChange, min = 0 }) => {
  return (
    <div className="bg-slate-800/50 p-2 rounded-xl flex flex-col items-center justify-between gap-2 border border-slate-700">
      <span className="text-slate-400 text-xs font-bold uppercase tracking-wider text-center h-8 flex items-center">{label}</span>
      <div className="flex items-center gap-3 w-full justify-between">
        <Button 
          variant="danger" 
          size="lg" 
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-12 h-12 !p-0"
        >
          <Minus size={24} />
        </Button>
        <span className="text-3xl font-display font-bold text-white w-12 text-center">{value}</span>
        <Button 
          variant="success" 
          size="lg" 
          onClick={() => onChange(value + 1)}
          className="w-12 h-12 !p-0"
        >
          <Plus size={24} />
        </Button>
      </div>
    </div>
  );
};

// --- Toggle / Boolean ---
interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (val: boolean) => void;
}

export const Toggle: React.FC<ToggleProps> = ({ label, value, onChange }) => {
  return (
    <div 
      onClick={() => onChange(!value)}
      className={`
        cursor-pointer p-3 rounded-xl border transition-all duration-200 flex items-center justify-between
        ${value 
          ? 'bg-brand-900/30 border-brand-500 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
          : 'bg-slate-800 border-slate-700 hover:border-slate-600'}
      `}
    >
      <span className={`font-medium ${value ? 'text-brand-400' : 'text-slate-300'}`}>{label}</span>
      <div className={`w-12 h-6 rounded-full relative transition-colors ${value ? 'bg-brand-500' : 'bg-slate-600'}`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${value ? 'left-7' : 'left-1'}`} />
      </div>
    </div>
  );
};

// --- Select / Radio Group ---
interface SelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

export const SelectGroup: React.FC<SelectProps> = ({ label, value, options, onChange }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-slate-400 text-sm font-bold uppercase">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`
              p-3 rounded-lg text-sm font-medium transition-all text-center
              ${value === opt 
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}
            `}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Stopwatch ---
interface StopwatchProps {
  value: number; // in seconds
  onChange: (val: number) => void;
}

export const Stopwatch: React.FC<StopwatchProps> = ({ value, onChange }) => {
  const [isRunning, setIsRunning] = React.useState(false);
  const intervalRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        onChange(Number((value + 0.1).toFixed(1))); // Increment by 0.1s
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, value]);

  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center gap-4">
      <div className="text-5xl font-display font-bold text-brand-400 tracking-wider">
        {value.toFixed(1)}<span className="text-lg text-slate-500 ml-1">s</span>
      </div>
      <div className="flex gap-2 w-full">
        <Button 
          fullWidth 
          variant={isRunning ? 'secondary' : 'success'} 
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? 'Stop' : 'Start'}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => {
            setIsRunning(false);
            onChange(0);
          }}
        >
          <RefreshCw size={20} />
        </Button>
      </div>
    </div>
  );
};
