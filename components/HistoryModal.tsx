
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, CloudUpload, Trash2, RefreshCw } from 'lucide-react';
import { MatchRecord } from '../types';
import { getHistory, deleteMatchRecord, markAsSynced } from '../services/storage';
import { uploadToGoogleSheets } from '../services/googleSheets';
import { Button } from './ui/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState<MatchRecord[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadHistory = () => {
    setHistory(getHistory());
  };

  useEffect(() => {
    if (isOpen) loadHistory();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this record? This cannot be undone.")) {
      deleteMatchRecord(id);
      loadHistory();
    }
  };

  const handleSyncAll = async () => {
    const unsynced = history.filter(r => !r.synced);
    if (unsynced.length === 0) return;

    setIsSyncing(true);
    let successCount = 0;

    for (const record of unsynced) {
      const success = await uploadToGoogleSheets(record.data);
      if (success) {
        markAsSynced(record.id);
        successCount++;
      }
    }

    setIsSyncing(false);
    loadHistory();
    alert(`Batch Sync Complete.\nSuccessfully uploaded: ${successCount}/${unsynced.length}`);
  };

  const handleSingleSync = async (record: MatchRecord) => {
    setIsSyncing(true);
    const success = await uploadToGoogleSheets(record.data);
    if (success) {
      markAsSynced(record.id);
    } else {
      alert("Upload failed. Check internet connection.");
    }
    setIsSyncing(false);
    loadHistory();
  };

  const unsyncedCount = history.filter(r => !r.synced).length;

  return (
    <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              Match History
              <span className="text-sm font-sans font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                {history.length} records
              </span>
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center gap-4">
            <div className="text-sm text-slate-400">
                {unsyncedCount > 0 ? (
                    <span className="text-orange-400 font-bold flex items-center gap-1">
                        <AlertCircle size={16} /> {unsyncedCount} Pending Uploads
                    </span>
                ) : (
                    <span className="text-green-500 font-bold flex items-center gap-1">
                        <CheckCircle size={16} /> All Synced
                    </span>
                )}
            </div>
            <Button 
                size="sm" 
                variant={unsyncedCount > 0 ? "primary" : "secondary"}
                onClick={handleSyncAll}
                disabled={unsyncedCount === 0 || isSyncing}
                className="gap-2"
            >
                {isSyncing ? <RefreshCw className="animate-spin" size={16} /> : <CloudUpload size={16} />}
                {isSyncing ? 'Syncing...' : 'Sync Pending'}
            </Button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {history.length === 0 ? (
            <div className="text-center text-slate-500 py-10">No match records found.</div>
          ) : (
            history.map((record) => (
              <div key={record.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-800 transition-colors">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-display font-bold text-lg text-white">Match {record.data.matchNumber}</span>
                        <span className="text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                            {record.data.teamNumber}
                        </span>
                        <span className="text-xs text-slate-500 uppercase tracking-wider">{record.data.matchLevel}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                        {new Date(record.timestamp).toLocaleString()} • {record.data.scouterName}
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {record.synced ? (
                        <div className="px-3 py-1.5 bg-green-900/20 text-green-500 text-xs font-bold rounded-lg border border-green-900/50 flex items-center gap-1.5 flex-1 sm:flex-none justify-center">
                            <CheckCircle size={14} /> Synced
                        </div>
                    ) : (
                        <Button 
                            size="sm" 
                            variant="primary" 
                            className="bg-orange-600 hover:bg-orange-500 text-xs flex-1 sm:flex-none"
                            onClick={() => handleSingleSync(record)}
                            disabled={isSyncing}
                        >
                            <CloudUpload size={14} className="mr-1" /> Retry
                        </Button>
                    )}
                    
                    <button 
                        onClick={() => handleDelete(record.id)}
                        className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-950/30 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
