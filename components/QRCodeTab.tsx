import { Fragment, useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import QRCode from 'react-qr-code';
import { ScoutingData } from '../types';
import { generateTSV, generatePathTSV, uploadToGoogleSheets } from '../services/googleSheets';
import { saveMatchToHistory, markAsSynced } from '../services/storage';
import { Button } from './ui/Button';
import { Copy, CheckCircle, AlertCircle, Save, WifiOff, Zap, Info, Map } from 'lucide-react';
import LZString from 'lz-string';
import { TSV_SCHEMA_MATCH, TSV_SCHEMA_PIT, TSV_SCHEMA_PATH } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { HapticFeedback } from '../utils/haptics';

interface Props {
  data: ScoutingData;
  onReset: () => void;
}

export const QRCodeTab: FC<Props> = ({ data, onReset }) => {
  const { t } = useLanguage();
  const [status, setStatus] = useState<'idle' | 'saving' | 'uploaded' | 'offline_saved' | 'error'>('idle');
  const [isSavedLocally, setIsSavedLocally] = useState(false);
  const [showSchema, setShowSchema] = useState(false);
  const [showPathSchema, setShowPathSchema] = useState(false);
  const prevStatusRef = useRef(status);

  // Trigger haptic feedback when status changes
  useEffect(() => {
    if (prevStatusRef.current !== status) {
      if (status === 'uploaded') {
        HapticFeedback.success();
      } else if (status === 'offline_saved') {
        HapticFeedback.warning();
      } else if (status === 'error') {
        HapticFeedback.error();
      }
      prevStatusRef.current = status;
    }
  }, [status]);

  // Main data (without path)
  const tsvData = generateTSV(data);
  const schema = data.mode === 'Pit' ? TSV_SCHEMA_PIT : TSV_SCHEMA_MATCH;
  const rawValues = tsvData.split('\t');

  // Path data (separate QR)
  const pathTsvData = generatePathTSV(data);
  const pathRawValues = pathTsvData.split('\t');
  const hasPath = data.autoPath && data.autoPath.length > 0;

  // LZ-String compression
  const compressedData = LZString.compressToBase64(tsvData);
  const compressedPathData = LZString.compressToBase64(pathTsvData);

  const handleCopy = () => {
    navigator.clipboard.writeText(tsvData);
    alert('Raw TSV copied to clipboard!');
  };

  const handleCopyPath = () => {
    navigator.clipboard.writeText(pathTsvData);
    alert('Path TSV copied to clipboard!');
  };

  const handleSaveAndUpload = async () => {
    setStatus('saving');

    // 1. Save locally first (Offline Queue)
    const record = saveMatchToHistory(data, false);
    setIsSavedLocally(true);

    // 2. Attempt Upload
    try {
      const success = await uploadToGoogleSheets(data);
      if (success) {
        markAsSynced(record.id);
        setStatus('uploaded');
      } else {
        setStatus('offline_saved');
      }
    } catch (e) {
      setStatus('offline_saved');
    }
  };

  const handleResetClick = () => {
    if (!isSavedLocally) {
      if (!confirm("⚠️ WARNING: You haven't saved this match to history yet!\n\nAre you sure you want to discard it?")) {
        return;
      }
    } else {
      if (!confirm("Start next match?")) return;
    }
    onReset();
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in duration-300 pb-20 w-full">

      {/* Main Data QR Code */}
      <div className="w-full max-w-md px-4 space-y-4">
        <div className="flex items-center justify-center gap-2 text-brand-400">
          <Zap size={20} />
          <span className="text-sm font-bold uppercase tracking-wider">Match Data QR</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-2xl shadow-brand-500/20 w-full max-w-[280px] aspect-square flex items-center justify-center mx-auto">
          <div style={{ height: "auto", margin: "0 auto", maxWidth: "100%", width: "100%" }}>
            <QRCode
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={compressedData}
              viewBox={`0 0 256 256`}
            />
          </div>
        </div>

        {/* Raw TSV Preview */}
        <div className="text-center space-y-2">
          <div className="text-left text-slate-500 text-[10px] font-mono bg-slate-900 p-2 rounded border border-slate-800 w-full break-all max-h-24 overflow-y-auto">
            {tsvData}
          </div>

          <button
            onClick={() => setShowSchema(!showSchema)}
            className="text-xs text-brand-400 hover:text-brand-300 flex items-center justify-center gap-1 mx-auto"
          >
            <Info size={12} /> {showSchema ? t('hideLabels') : t('showLabels')}
          </button>

          {showSchema && (
            <div className="grid grid-cols-[1fr,auto] gap-x-2 gap-y-1 text-[10px] text-left bg-slate-900/50 p-3 rounded border border-slate-800 w-full max-h-40 overflow-y-auto">
              {schema.map((key, i) => (
                <Fragment key={key}>
                  <div className="text-slate-500 font-mono truncate border-b border-slate-800/50 py-1">{key}</div>
                  <div className="text-brand-400 font-mono font-bold border-b border-slate-800/50 py-1">{rawValues[i]}</div>
                </Fragment>
              ))}
            </div>
          )}

          <Button onClick={handleCopy} variant="secondary" size="sm" className="gap-2">
            <Copy size={16} /> {t('copyTSV')}
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full max-w-md px-4">
        <div className="border-t border-slate-800"></div>
      </div>

      {/* Path Data QR Code */}
      <div className="w-full max-w-md px-4 space-y-4">
        <div className="flex items-center justify-center gap-2 text-amber-400">
          <Map size={20} />
          <span className="text-sm font-bold uppercase tracking-wider">Auto Path QR</span>
        </div>

        {hasPath ? (
          <>
            <div className="bg-white p-4 rounded-2xl shadow-2xl shadow-amber-500/20 w-full max-w-[280px] aspect-square flex items-center justify-center mx-auto">
              <div style={{ height: "auto", margin: "0 auto", maxWidth: "100%", width: "100%" }}>
                <QRCode
                  size={256}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  value={compressedPathData}
                  viewBox={`0 0 256 256`}
                  fgColor="#d97706"
                />
              </div>
            </div>

            {/* Path TSV Preview */}
            <div className="text-center space-y-2">
              <div className="text-left text-slate-500 text-[10px] font-mono bg-slate-900 p-2 rounded border border-slate-800 w-full break-all max-h-24 overflow-y-auto">
                {pathTsvData}
              </div>

              <button
                onClick={() => setShowPathSchema(!showPathSchema)}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center justify-center gap-1 mx-auto"
              >
                <Info size={12} /> {showPathSchema ? t('hideLabels') : t('showLabels')}
              </button>

              {showPathSchema && (
                <div className="grid grid-cols-[1fr,auto] gap-x-2 gap-y-1 text-[10px] text-left bg-slate-900/50 p-3 rounded border border-slate-800 w-full max-h-40 overflow-y-auto">
                  {TSV_SCHEMA_PATH.map((key, i) => (
                    <Fragment key={key}>
                      <div className="text-slate-500 font-mono truncate border-b border-slate-800/50 py-1">{key}</div>
                      <div className="text-amber-400 font-mono font-bold border-b border-slate-800/50 py-1 break-all">{pathRawValues[i]}</div>
                    </Fragment>
                  ))}
                </div>
              )}

              <Button onClick={handleCopyPath} variant="secondary" size="sm" className="gap-2">
                <Copy size={16} /> Copy Path TSV
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center text-slate-500 text-sm py-8 bg-slate-900/50 rounded-xl border border-slate-800">
            No path drawn
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-full max-w-md px-4">
        <div className="border-t border-slate-800"></div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md px-4">
        <Button
          onClick={handleSaveAndUpload}
          variant={status === 'uploaded' ? 'success' : 'primary'}
          disabled={status === 'saving' || status === 'uploaded'}
          fullWidth
          className={`gap-2 ${status === 'offline_saved' ? 'bg-orange-600 hover:bg-orange-500' : ''}`}
        >
          {status === 'idle' && <><Save size={20} /> {t('saveSubmit')}</>}
          {status === 'saving' && t('saving')}
          {status === 'uploaded' && <><CheckCircle size={20} /> {t('savedSent')}</>}
          {status === 'offline_saved' && <><WifiOff size={20} /> {t('savedOffline')}</>}
          {status === 'error' && <><AlertCircle size={20} /> {t('error')}</>}
        </Button>
      </div>

      {status === 'offline_saved' && (
        <div className="text-orange-400 text-sm text-center bg-orange-950/30 p-2 rounded-lg border border-orange-900/50 mx-4">
          Data saved to device. Upload in "History" when online.
        </div>
      )}

      <div className="w-full max-w-md pt-6 border-t border-slate-800 px-4">
        <Button fullWidth variant="danger" onClick={handleResetClick}>
          {t('reset')}
        </Button>
        <p className="text-center text-xs text-slate-600 mt-2">
          {t('resetWarning')}
        </p>
      </div>
    </div>
  );
};
