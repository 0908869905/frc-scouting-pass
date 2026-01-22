import React from 'react';
import { Download, Upload } from 'lucide-react';
import type { AnalysisResult, TeamStats } from './types';

interface AnalysisResultsProps {
  result: AnalysisResult | null;
  isAnalyzing: boolean;
  progress?: number;
  onExportTSV?: () => void;
  onUploadToSheets?: () => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  result,
  isAnalyzing,
  progress = 0,
  onExportTSV,
  onUploadToSheets,
}) => {
  if (isAnalyzing) {
    return (
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Analyzing...</h3>
        <div className="space-y-2">
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div
              className="bg-cyan-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-slate-400 text-center">{progress.toFixed(1)}%</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Analysis Results</h3>
        <p className="text-slate-400 text-sm">
          No results yet. Load a video, annotate objects, and start analysis.
        </p>
      </div>
    );
  }

  const redTeams = result.teamStats.filter((t) => t.alliance === 'red');
  const blueTeams = result.teamStats.filter((t) => t.alliance === 'blue');

  return (
    <div className="bg-slate-800 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Analysis Results</h3>
        <div className="text-xs text-slate-400">
          {result.matchInfo.eventCode} {result.matchInfo.matchLevel[0].toUpperCase()}
          {result.matchInfo.matchNumber}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-700 rounded p-2">
          <div className="text-2xl font-bold text-cyan-400">{result.shotsDetected}</div>
          <div className="text-xs text-slate-400">Shots Detected</div>
        </div>
        <div className="bg-slate-700 rounded p-2">
          <div className="text-2xl font-bold text-green-400">
            {result.teamStats.reduce((sum, t) => sum + t.autoScored + t.teleopScored, 0)}
          </div>
          <div className="text-xs text-slate-400">Total Scored</div>
        </div>
        <div className="bg-slate-700 rounded p-2">
          <div className="text-2xl font-bold text-red-400">
            {result.teamStats.reduce((sum, t) => sum + t.autoMissed + t.teleopMissed, 0)}
          </div>
          <div className="text-xs text-slate-400">Total Missed</div>
        </div>
      </div>

      {/* Team Stats Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 border-b border-slate-700">
              <th className="py-2 text-left">Team</th>
              <th className="py-2 text-center">Auto</th>
              <th className="py-2 text-center">Teleop</th>
              <th className="py-2 text-center">Total</th>
              <th className="py-2 text-right">Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {/* Red Alliance */}
            {redTeams.map((stats) => (
              <TeamRow key={stats.teamNumber} stats={stats} />
            ))}
            {/* Separator */}
            {redTeams.length > 0 && blueTeams.length > 0 && (
              <tr>
                <td colSpan={5} className="py-1">
                  <div className="border-t border-slate-600" />
                </td>
              </tr>
            )}
            {/* Blue Alliance */}
            {blueTeams.map((stats) => (
              <TeamRow key={stats.teamNumber} stats={stats} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onExportTSV}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export TSV</span>
        </button>
        <button
          onClick={onUploadToSheets}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Upload to Sheets</span>
        </button>
      </div>

      {/* Analysis Info */}
      <div className="text-xs text-slate-400 text-center">
        Analyzed {result.frameCount} frames in {result.analysisDurationSeconds.toFixed(1)}s
      </div>
    </div>
  );
};

// Team row sub-component
const TeamRow: React.FC<{ stats: TeamStats }> = ({ stats }) => {
  const total = stats.autoScored + stats.autoMissed + stats.teleopScored + stats.teleopMissed;
  const scored = stats.autoScored + stats.teleopScored;
  const accuracy = total > 0 ? (scored / total) * 100 : 0;

  const allianceColor = stats.alliance === 'red' ? 'text-red-400' : 'text-blue-400';

  return (
    <tr className="border-b border-slate-700/50 hover:bg-slate-700/30">
      <td className={`py-2 font-mono font-bold ${allianceColor}`}>
        {stats.teamNumber}
      </td>
      <td className="py-2 text-center">
        <span className="text-green-400">{stats.autoScored}</span>
        <span className="text-slate-500">/</span>
        <span className="text-red-400">{stats.autoMissed}</span>
      </td>
      <td className="py-2 text-center">
        <span className="text-green-400">{stats.teleopScored}</span>
        <span className="text-slate-500">/</span>
        <span className="text-red-400">{stats.teleopMissed}</span>
      </td>
      <td className="py-2 text-center font-semibold">
        {scored}
      </td>
      <td className="py-2 text-right">
        <span className={accuracy >= 70 ? 'text-green-400' : accuracy >= 50 ? 'text-yellow-400' : 'text-red-400'}>
          {accuracy.toFixed(0)}%
        </span>
      </td>
    </tr>
  );
};
