import React from 'react';
import QRCode from 'react-qr-code';
import { ScoutingData, INITIAL_DATA } from '../types';
import { generateTSV, uploadToGoogleSheets } from '../services/googleSheets';
import { Button } from './ui/Button';
import { Copy, UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
  data: ScoutingData;
  onReset: () => void;
}

export const QRCodeTab: React.FC<Props> = ({ data, onReset }) => {
  const [uploadStatus, setUploadStatus] = React.useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const tsvData = generateTSV(data);

  const handleCopy = () => {
    navigator.clipboard.writeText(tsvData);
    alert('Data copied to clipboard!');
  };

  const handleUpload = async () => {
    setUploadStatus('uploading');
    const success = await uploadToGoogleSheets(data);
    setUploadStatus(success ? 'success' : 'error');
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-300 pb-20">
      <div className="bg-white p-4 rounded-2xl shadow-2xl shadow-brand-500/20">
        <QRCode value={tsvData} size={256} />
      </div>
      
      <div className="text-center text-slate-400 text-sm max-w-md break-all font-mono bg-slate-900 p-2 rounded border border-slate-800">
        {tsvData.substring(0, 50)}...
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        <Button onClick={handleCopy} variant="secondary" className="gap-2">
          <Copy size={20} /> Copy TSV
        </Button>

        <Button 
          onClick={handleUpload} 
          variant={uploadStatus === 'success' ? 'success' : uploadStatus === 'error' ? 'danger' : 'primary'}
          disabled={uploadStatus === 'uploading' || uploadStatus === 'success'}
          className="gap-2"
        >
          {uploadStatus === 'idle' && <><UploadCloud size={20} /> Upload to Sheets</>}
          {uploadStatus === 'uploading' && 'Uploading...'}
          {uploadStatus === 'success' && <><CheckCircle size={20} /> Sent!</>}
          {uploadStatus === 'error' && <><AlertCircle size={20} /> Failed</>}
        </Button>
      </div>

      <div className="w-full max-w-md pt-8 border-t border-slate-800">
        <Button fullWidth variant="danger" onClick={() => {
          if(confirm("Are you sure? This will clear all data.")) onReset();
        }}>
          Reset Form for Next Match
        </Button>
      </div>
    </div>
  );
};