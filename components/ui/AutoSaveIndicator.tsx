import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Cloud } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface AutoSaveIndicatorProps {
  lastSaveTime: number | null;
}

export const AutoSaveIndicator: FC<AutoSaveIndicatorProps> = ({ lastSaveTime }) => {
  const { t } = useLanguage();
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (!lastSaveTime) {
      setDisplayText('');
      return;
    }

    const updateText = () => {
      const now = Date.now();
      const diff = Math.floor((now - lastSaveTime) / 1000);

      if (diff < 5) {
        setDisplayText(t('savedJustNow'));
      } else if (diff < 60) {
        setDisplayText(t('savedSecondsAgo').replace('{n}', String(diff)));
      } else {
        const minutes = Math.floor(diff / 60);
        setDisplayText(t('savedMinutesAgo').replace('{n}', String(minutes)));
      }
    };

    updateText();
    const interval = setInterval(updateText, 1000);
    return () => clearInterval(interval);
  }, [lastSaveTime, t]);

  if (!lastSaveTime || !displayText) return null;

  return (
    <div className="flex items-center gap-1 text-xs text-slate-500">
      <Cloud size={12} className="text-green-500" />
      <span>{displayText}</span>
    </div>
  );
};
