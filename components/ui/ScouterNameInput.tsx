import { useState, useRef, useEffect } from 'react';
import type { FC } from 'react';
import { ChevronDown, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRecentScouters } from '../../hooks/useRecentScouters';

interface ScouterNameInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const ScouterNameInput: FC<ScouterNameInputProps> = ({ value, onChange }) => {
  const { t } = useLanguage();
  const { recentScouters, addScouter } = useRecentScouters();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBlur = () => {
    // Delay to allow click on dropdown items
    setTimeout(() => {
      if (value.trim()) {
        addScouter(value);
      }
    }, 200);
  };

  const handleSelect = (name: string) => {
    onChange(name);
    setIsOpen(false);
    addScouter(name);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-3.5 pr-10 text-white text-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-slate-600"
          placeholder="Name"
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={handleBlur}
          onFocus={() => recentScouters.length > 0 && setIsOpen(true)}
        />
        {recentScouters.length > 0 && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white transition-colors"
          >
            <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && recentScouters.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 text-xs text-slate-500 font-bold uppercase tracking-wider border-b border-slate-700 flex items-center gap-1">
            <Clock size={12} />
            {t('recentScouters')}
          </div>
          {recentScouters.map((name, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(name)}
              className="w-full px-3 py-3 text-left text-white hover:bg-slate-700 transition-colors border-b border-slate-700/50 last:border-0"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
