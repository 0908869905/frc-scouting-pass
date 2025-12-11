
import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { ScoutingData } from '../types';
import { generateTSV, uploadToGoogleSheets } from '../services/googleSheets';
import { saveMatchToHistory, markAsSynced } from '../services/storage';
import { Button } from './ui/Button';
import { Copy, UploadCloud, CheckCircle, AlertCircle, Save, WifiOff, FileText, Zap } from 'lucide-react';
import LZString from 'lz-string';

interface Props {
  data: ScoutingData;
  onReset: () => void;
}

export const QRCodeTab: React.FC<Props> = ({ data, onReset }) => {
  const [status, setStatus] = useState<'idle' | 'saving' | 'uploaded' | 'offline_saved' | 'error'>('idle');
  const [isSavedLocally, setIsSavedLocally] = useState(false);
  const [qrMode, setQrMode] = useState<'compressed' | 'raw'>('compressed');
  
  const tsvData = generateTSV(data);
  
  // LZ-String compression to Base64 to make QR less dense
  const compressedData = LZString.compressToBase64(tsvData);
  
  const displayValue = qrMode === 'compressed' ? compressedData : tsvData;

  const handleCopy = () => {
    // Usually humans want the raw TSV when copying to clipboard, even if QR is compressed
    navigator.clipboard.writeText(tsvData);
    alert('Raw TSV copied to clipboard!');
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
      
      {/* QR Mode Toggle */}
      <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
        <button
            onClick={() => setQrMode('raw')}
            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${qrMode === 'raw' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
            <FileText size={16} /> Raw TSV
        </button>
        <button
            onClick={() => setQrMode('compressed')}
            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${qrMode === 'compressed' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
            <Zap size={16} /> Compressed
        </button>
      </div>

      {/* QR Code Container */}
      <div className="bg-white p-4 rounded-2xl shadow-2xl shadow-brand-500/20 w-full max-w-[300px] aspect-square flex items-center justify-center">
        <div style={{ height: "auto", margin: "0 auto", maxWidth: "100%", width: "100%" }}>
            <QRCode
                size={256}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                value={displayValue}
                viewBox={`0 0 256 256`}
            />
        </div>
      </div>
      
      {/* Helper Text */}
      <div className="text-center space-y-1 w-full max-w-md px-4">
          <p className="text-slate-400 text-xs">
              {qrMode === 'compressed' ? 'LZ-String Base64 Encoded' : 'Plain Text Tab Separated Values'}
          </p>
          <div className="text-left text-slate-500 text-[10px] font-mono bg-slate-900 p-2 rounded border border-slate-800 w-full break-all">
            {displayValue}
          </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md px-4">
        <Button onClick={handleCopy} variant="secondary" className="gap-2">
          <Copy size={20} /> Copy TSV
        </Button>

        <Button 
          onClick={handleSaveAndUpload} 
          variant={status === 'uploaded' ? 'success' : status === 'offline_saved' ? 'primary' : 'primary'}
          disabled={status === 'saving' || status === 'uploaded'}
          className={`gap-2 ${status === 'offline_saved' ? 'bg-orange-600 hover:bg-orange-500' : ''}`}
        >
          {status === 'idle' && <><Save size={20} /> Save & Submit</>}
          {status === 'saving' && 'Saving...'}
          {status === 'uploaded' && <><CheckCircle size={20} /> Saved & Sent!</>}
          {status === 'offline_saved' && <><WifiOff size={20} /> Saved (Offline)</>}
          {status === 'error' && <><AlertCircle size={20} /> Error</>}
        </Button>
      </div>

      {status === 'offline_saved' && (
          <div className="text-orange-400 text-sm text-center bg-orange-950/30 p-2 rounded-lg border border-orange-900/50 mx-4">
              Data saved to device. Upload in "History" when online.
          </div>
      )}

      <div className="w-full max-w-md pt-6 border-t border-slate-800 px-4">
        <Button fullWidth variant="danger" onClick={handleResetClick}>
          Reset Form for Next Match
        </Button>
        <p className="text-center text-xs text-slate-600 mt-2">
            Resetting creates a new form. Previous data is kept in History.
        </p>
      </div>
    </div>
  );
};
