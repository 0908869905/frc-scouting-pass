import React, { useRef, useState, useEffect } from 'react';
import { Button } from './Button';
import { Minus, Plus, RefreshCw } from 'lucide-react';

type Handedness = 'right' | 'left';

// --- Custom Hook for Long Press ---
function useLongPress(callback: () => void, delay = 200, repeat = 100) {
  const [startLongPress, setStartLongPress] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (startLongPress) {
      timeoutRef.current = window.setTimeout(() => {
        intervalRef.current = window.setInterval(() => {
          callback();
        }, repeat);
      }, delay);
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startLongPress, callback, delay, repeat]);

  return {
    onMouseDown: () => setStartLongPress(true),
    onMouseUp: () => setStartLongPress(false),
    onMouseLeave: () => setStartLongPress(false),
    onTouchStart: () => setStartLongPress(true),
    onTouchEnd: () => setStartLongPress(false),
  };
}

// --- Counter ---
interface CounterProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  handedness?: Handedness;
}

export const Counter: React.FC<CounterProps> = ({ label, value, onChange, min = 0, handedness = 'right' }) => {
  const handleIncrement = () => onChange(value + 1);
  const longPressProps = useLongPress(handleIncrement, 300, 100);

  // Layout direction: If right handed, Plus is on the Right. If left handed, Plus is on the Left.
  const isRightHanded = handedness === 'right';

  return (
    <div className="bg-slate-800/50 p-2 rounded-xl flex flex-col items-center justify-between gap-1 border border-slate-700 h-full min-h-[100px]">
      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider text-center h-6 flex items-center leading-none">
        {label}
      </span>
      <div className={`flex items-stretch gap-2 w-full flex-1 ${!isRightHanded ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Minus Button: Smaller, acts as secondary */}
        <Button 
          variant="danger" 
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-10 flex-none rounded-lg opacity-80 hover:opacity-100 active:scale-95 transition-transform"
        >
          <Minus size={20} />
        </Button>

        {/* Value Display: Double tap to reset */}
        <div 
          className="flex-1 bg-slate-900/80 rounded-lg flex items-center justify-center cursor-pointer select-none active:bg-slate-800 transition-colors border border-slate-700/50"
          onDoubleClick={() => onChange(min)}
          title="Double tap to reset"
        >
          <span className="text-3xl font-display font-bold text-white">{value}</span>
        </div>

        {/* Plus Button: Larger, Primary Action, Supports Long Press */}
        <button 
          className="w-16 flex-none bg-green-600 hover:bg-green-500 active:bg-green-700 text-white rounded-lg shadow-lg shadow-green-900/40 flex items-center justify-center transition-all active:scale-95"
          onClick={handleIncrement}
          {...longPressProps}
        >
          <Plus size={32} strokeWidth={3} />
        </button>
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
        cursor-pointer p-3 rounded-xl border transition-all duration-200 flex items-center justify-between min-h-[3.5rem]
        ${value 
          ? 'bg-brand-900/30 border-brand-500 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
          : 'bg-slate-800 border-slate-700 hover:border-slate-600'}
      `}
    >
      <span className={`font-medium text-sm md:text-base ${value ? 'text-brand-400' : 'text-slate-300'}`}>{label}</span>
      <div className={`w-12 h-6 rounded-full relative transition-colors flex-none ml-2 ${value ? 'bg-brand-500' : 'bg-slate-600'}`}>
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
              p-3 rounded-lg text-sm font-medium transition-all text-center min-h-[3rem] flex items-center justify-center
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
      <div className="flex gap-2 w-full h-12">
        <Button 
          fullWidth 
          variant={isRunning ? 'secondary' : 'success'} 
          onClick={() => setIsRunning(!isRunning)}
          className="text-lg"
        >
          {isRunning ? 'Stop' : 'Start'}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => {
            setIsRunning(false);
            onChange(0);
          }}
          className="w-16"
        >
          <RefreshCw size={24} />
        </Button>
      </div>
    </div>
  );
};