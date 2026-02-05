import type { FC } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getMatchTeams, hasSchedule } from '../../data/eventSchedule';
import { Alliance } from '../../types';

interface QuickTeamSelectProps {
  eventCode: string;
  matchNumber: number;
  currentTeamNumber: string;
  currentAlliance: Alliance;
  onSelect: (teamNumber: string, alliance: Alliance) => void;
}

export const QuickTeamSelect: FC<QuickTeamSelectProps> = ({
  eventCode,
  matchNumber,
  currentTeamNumber,
  currentAlliance,
  onSelect
}) => {
  const { t } = useLanguage();

  // Get teams for this match
  const matchTeams = getMatchTeams(eventCode, matchNumber);
  const scheduleExists = hasSchedule(eventCode);

  if (!scheduleExists) {
    return null; // Don't show anything if no schedule for this event
  }

  if (!matchTeams) {
    return (
      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-center">
        <span className="text-sm text-slate-500">{t('matchNotFound')}</span>
      </div>
    );
  }

  const alliancePositions: { team: string; alliance: Alliance }[] = [
    { team: matchTeams.red[0], alliance: 'R1' },
    { team: matchTeams.red[1], alliance: 'R2' },
    { team: matchTeams.red[2], alliance: 'R3' },
    { team: matchTeams.blue[0], alliance: 'B1' },
    { team: matchTeams.blue[1], alliance: 'B2' },
    { team: matchTeams.blue[2], alliance: 'B3' },
  ];

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-500 uppercase">{t('quickTeamSelect')}</label>
      <div className="grid grid-cols-6 gap-2">
        {alliancePositions.map(({ team, alliance }) => {
          const isRed = alliance.startsWith('R');
          const isSelected = currentTeamNumber === team && currentAlliance === alliance;

          return (
            <button
              key={alliance}
              onClick={() => onSelect(team, alliance)}
              className={`p-2 rounded-xl border-2 transition-all active:scale-95 flex flex-col items-center ${
                isSelected
                  ? isRed
                    ? 'bg-red-500/25 border-red-500 shadow-lg'
                    : 'bg-blue-500/25 border-blue-500 shadow-lg'
                  : isRed
                    ? 'bg-slate-900 border-slate-700 hover:border-red-500/50'
                    : 'bg-slate-900 border-slate-700 hover:border-blue-500/50'
              }`}
            >
              <span className={`text-xs font-bold ${isRed ? 'text-red-400' : 'text-blue-400'}`}>
                {alliance}
              </span>
              <span className={`text-lg font-display font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                {team}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
