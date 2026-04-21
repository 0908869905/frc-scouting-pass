import { useState } from 'react';
import type { FC } from 'react';
import { X, Save, QrCode } from 'lucide-react';
import { ScoutingData, MatchRecord, AutoClimbStatus, TeleClimbStatus, ClimbPosition } from '../types';
import { ALLIANCE_OPTIONS, AUTO_CLIMB_OPTIONS, TELE_CLIMB_OPTIONS, CLIMB_POSITION_OPTIONS } from '../constants';
import { Button } from './ui/Button';
import { useLanguage } from '../contexts/LanguageContext';
import QRCode from 'react-qr-code';
import LZString from 'lz-string';
import { generateTSV } from '../services/googleSheets';

interface HistoryEditFormProps {
  record: MatchRecord;
  onSave: (data: ScoutingData) => void;
  onCancel: () => void;
}

export const HistoryEditForm: FC<HistoryEditFormProps> = ({ record, onSave, onCancel }) => {
  const { t } = useLanguage();
  const [editData, setEditData] = useState<ScoutingData>({ ...record.data });
  const [showQR, setShowQR] = useState(false);

  const updateField = (fields: Partial<ScoutingData>) => {
    setEditData(prev => ({ ...prev, ...fields }));
  };

  const handleSave = () => {
    onSave(editData);
  };

  // Generate QR data
  const tsvData = generateTSV(editData);
  const compressedData = LZString.compressToBase64(tsvData);

  return (
    <div className="bg-slate-900 border border-slate-600 rounded-xl p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700">
        <h3 className="text-lg font-display font-bold text-white">
          {t('editRecord')}: {t('match')} {record.data.matchNumber}
        </h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Basic Info Row */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-slate-500 uppercase font-bold">{t('matchNumber')}</label>
          <input
            type="number"
            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-center font-mono"
            value={editData.matchNumber}
            onChange={e => updateField({ matchNumber: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase font-bold">{t('teamNumber')}</label>
          <input
            type="text"
            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-center font-mono"
            value={editData.teamNumber}
            onChange={e => updateField({ teamNumber: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase font-bold">{t('alliance')}</label>
          <select
            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white"
            value={editData.alliance}
            onChange={e => updateField({ alliance: e.target.value as any })}
          >
            {ALLIANCE_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Counters Row */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-slate-500 uppercase font-bold">{t('bumpCount')}</label>
          <input
            type="number"
            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-center"
            value={editData.bumpCount}
            onChange={e => updateField({ bumpCount: parseInt(e.target.value) || 0 })}
            min={0}
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase font-bold">{t('trenchCount')}</label>
          <input
            type="number"
            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-center"
            value={editData.trenchCount}
            onChange={e => updateField({ trenchCount: parseInt(e.target.value) || 0 })}
            min={0}
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase font-bold">{t('fuelDroppedOnBump')}</label>
          <input
            type="number"
            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-center"
            value={editData.fuelDroppedOnBumpCount}
            onChange={e => updateField({ fuelDroppedOnBumpCount: parseInt(e.target.value) || 0 })}
            min={0}
          />
        </div>
      </div>

      {/* Climb Status Row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-500 uppercase font-bold">{t('autoClimbStatus')}</label>
          <select
            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white"
            value={editData.autoClimbStatus}
            onChange={e => updateField({ autoClimbStatus: e.target.value as AutoClimbStatus })}
          >
            {AUTO_CLIMB_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{t(opt)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase font-bold">{t('teleClimbStatus')}</label>
          <select
            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white"
            value={editData.teleClimbStatus}
            onChange={e => updateField({ teleClimbStatus: e.target.value as TeleClimbStatus })}
          >
            {TELE_CLIMB_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{t(opt)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Penalty Row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-500 uppercase font-bold">{t('minorPenalty')}</label>
          <input
            type="number"
            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-center"
            value={editData.minorPenalty}
            onChange={e => updateField({ minorPenalty: parseInt(e.target.value) || 0 })}
            min={0}
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase font-bold">{t('majorPenalty')}</label>
          <input
            type="number"
            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-center"
            value={editData.majorPenalty}
            onChange={e => updateField({ majorPenalty: parseInt(e.target.value) || 0 })}
            min={0}
          />
        </div>
      </div>

      {/* Comments */}
      <div>
        <label className="text-xs text-slate-500 uppercase font-bold">{t('comments')}</label>
        <textarea
          className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white h-20 resize-none"
          value={editData.comments}
          onChange={e => updateField({ comments: e.target.value })}
        />
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="bg-slate-800 p-4 rounded-xl space-y-3">
          <div className="bg-white p-3 rounded-xl max-w-[200px] mx-auto">
            <QRCode
              size={180}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={compressedData}
              viewBox={`0 0 180 180`}
            />
          </div>
          <button
            onClick={() => setShowQR(false)}
            className="w-full text-center text-sm text-slate-400 hover:text-white"
          >
            {t('cancelEdit')}
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel} className="flex-1 gap-2">
          <X size={16} /> {t('cancelEdit')}
        </Button>
        <Button variant="outline" onClick={() => setShowQR(!showQR)} className="gap-2">
          <QrCode size={16} /> {t('viewQR')}
        </Button>
        <Button variant="primary" onClick={handleSave} className="flex-1 gap-2">
          <Save size={16} /> {t('saveChanges')}
        </Button>
      </div>
    </div>
  );
};
