import { useState, useRef, useEffect } from 'react';
import type { FC } from 'react';
import { ChevronDown, Calendar, Search, Edit3 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { EVENTS_2026, FRCEvent } from '../../data/events2026';

interface EventCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const EventCodeSelect: FC<EventCodeSelectProps> = ({ value, onChange }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find current event from list
  const currentEvent = EVENTS_2026.find(e => e.key.toLowerCase() === value.toLowerCase());

  // Filter events by search query
  const filteredEvents = EVENTS_2026.filter(event => {
    const query = searchQuery.toLowerCase();
    return (
      event.key.toLowerCase().includes(query) ||
      event.name.toLowerCase().includes(query) ||
      (event.shortName?.toLowerCase().includes(query) ?? false) ||
      (event.city?.toLowerCase().includes(query) ?? false)
    );
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsCustomMode(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (event: FRCEvent) => {
    onChange(event.key.toUpperCase());
    setIsOpen(false);
    setSearchQuery('');
    setIsCustomMode(false);
  };

  const handleCustomSubmit = () => {
    setIsOpen(false);
    setIsCustomMode(false);
  };

  const handleOpenDropdown = () => {
    setIsOpen(true);
    setSearchQuery('');
    setIsCustomMode(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Selected Value Display / Custom Input */}
      {isCustomMode && isOpen ? (
        <input
          ref={inputRef}
          type="text"
          className="w-full bg-slate-900 border-2 border-brand-500 rounded-xl p-3.5 text-white text-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all font-mono uppercase"
          placeholder="e.g. 2026MSLR"
          value={value}
          onChange={e => onChange(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleCustomSubmit()}
          onBlur={handleCustomSubmit}
          autoFocus
        />
      ) : (
        <button
          type="button"
          onClick={handleOpenDropdown}
          className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-3.5 text-white text-lg text-left flex items-center justify-between hover:border-slate-600 transition-all font-mono"
        >
          <span className={value ? 'text-white' : 'text-slate-500'}>
            {value || t('selectEvent')}
          </span>
          <ChevronDown size={18} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      {/* Dropdown */}
      {isOpen && !isCustomMode && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden max-h-[300px] flex flex-col">
          {/* Search Input */}
          <div className="p-2 border-b border-slate-700">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none"
                placeholder={t('searchEvents')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Event List */}
          <div className="flex-1 overflow-y-auto">
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <button
                  key={event.key}
                  onClick={() => handleSelect(event)}
                  className={`w-full px-3 py-3 text-left hover:bg-slate-700 transition-colors border-b border-slate-700/50 last:border-0 ${
                    value.toLowerCase() === event.key.toLowerCase() ? 'bg-brand-500/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">{event.shortName || event.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{event.key.toUpperCase()}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar size={12} />
                      <span>{event.startDate.slice(5)}</span>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-slate-500 text-sm">
                No events found
              </div>
            )}
          </div>

          {/* Custom Input Option */}
          <button
            onClick={() => {
              setIsCustomMode(true);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            className="p-3 border-t border-slate-700 hover:bg-slate-700 transition-colors flex items-center gap-2 text-brand-400"
          >
            <Edit3 size={16} />
            <span className="text-sm font-medium">{t('customEvent')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
