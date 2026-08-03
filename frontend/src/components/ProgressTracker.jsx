import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import socketService from '../services/socket';

export default function ProgressTracker({ totalRows, onComplete, batchId }) {
  const [processed, setProcessed] = useState(0);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('enqueuing'); // enqueuing | processing | complete

  const mockImageLogs = [
    'Analyzing photo metadata...',
    'Extracting primary colors and fabrics...',
    'Suggested taxonomy category matched.'
  ];

  const mockTextLogs = [
    'Writing SEO-friendly product title...',
    'Composing 4 bulleted highlight copy points...',
    'Generating product search keywords list.'
  ];

  useEffect(() => {
    // If it's a mock sandbox batch, run client-side simulation
    const isMockBatch = batchId.startsWith('batch_');

    if (isMockBatch) {
      console.log('🤖 ProgressTracker running in Local Sandbox Simulation Mode.');
      let currentProcessed = 0;
      setLogs(['[Mock] Initializing BullMQ background queue connection...', '[Mock] Created job batch ID on Redis database.']);

      const interval = setInterval(() => {
        if (currentProcessed < totalRows) {
          currentProcessed += 1;
          setProcessed(currentProcessed);
          
          const isSuccess = Math.random() > 0.15;
          const rowText = `[Row ${currentProcessed}]`;

          setLogs(prev => [
            ...prev,
            `${rowText} Enqueued to BullMQ worker...`,
            `${rowText} ${mockImageLogs[Math.floor(Math.random() * mockImageLogs.length)]}`,
            `${rowText} ${mockTextLogs[Math.floor(Math.random() * mockTextLogs.length)]}`,
            isSuccess 
              ? `✔ ${rowText} Enriched and saved to MongoDB drafts.` 
              : `⚠ ${rowText} Review required: Category confidence score below threshold.`
          ]);

          if (currentProcessed === 1) {
            setStatus('processing');
          }
        } else {
          clearInterval(interval);
          setStatus('complete');
          setLogs(prev => [...prev, '✔ All background worker tasks completed.', 'Bulk job marked: Completed.']);
          if (onComplete) onComplete();
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      // Connect to Real Socket.io Backend
      console.log(`🔌 ProgressTracker connecting to WebSockets for batch ${batchId}...`);
      const socket = socketService.connect();

      setLogs([
        'Connecting to Redis upload queue...',
        'Listening to real-time WebSockets event logs...'
      ]);

      // Progress listener
      const handleProgress = (data) => {
        setProcessed(data.processedRows);
        if (data.status === 'completed' || data.status === 'needs_review') {
          setStatus('complete');
          if (onComplete) onComplete();
        } else {
          setStatus('processing');
        }
      };

      // Logs listener
      const handleLog = (data) => {
        setLogs(prev => [...prev, data.message]);
      };

      socketService.on(`batch-progress-${batchId}`, handleProgress);
      socketService.on(`batch-log-${batchId}`, handleLog);

      return () => {
        socketService.off(`batch-progress-${batchId}`, handleProgress);
        socketService.off(`batch-log-${batchId}`, handleLog);
      };
    }
  }, [batchId, totalRows]);

  const percentage = totalRows > 0 ? Math.round((processed / totalRows) * 100) : 0;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Job Processing Tracker</h3>
            <p className="text-xs text-slate-500 mt-0.5">Enriching catalog listings with AI</p>
          </div>
        </div>

        <div className="text-right">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            status === 'complete'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
              : 'bg-primary-50 text-primary-700 border-primary-100 animate-pulse-slow'
          }`}>
            {status === 'complete' ? (
              <>
                <CheckCircle2 size={12} /> Finished
              </>
            ) : (
              <>
                <RefreshCw size={12} className="animate-spin" /> {status === 'enqueuing' ? 'Enqueuing...' : 'Worker Active'}
              </>
            )}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-slate-500">Progress: {processed} / {totalRows} Items</span>
          <span className="text-primary-600">{percentage}%</span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-primary-500 to-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Real-time Logger Terminal */}
      <div className="bg-slate-900 rounded-2xl p-4 overflow-hidden border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-xs text-slate-500 font-mono">
          <span>Worker Terminal Log</span>
          <span>Redis Active</span>
        </div>
        <div className="h-48 overflow-y-auto font-mono text-xs text-slate-300 space-y-1.5 scrollbar-thin select-text">
          {logs.map((log, index) => (
            <div 
              key={index} 
              className={`flex items-start gap-1 ${
                log.startsWith('✔') || log.includes('✔')
                  ? 'text-emerald-400' 
                  : log.startsWith('⚠') || log.includes('⚠')
                  ? 'text-amber-400' 
                  : 'text-slate-300'
              }`}
            >
              <span className="text-slate-600 select-none shrink-0">$</span>
              <span>{log}</span>
            </div>
          ))}
          {status !== 'complete' && (
            <div className="flex items-center gap-1 text-primary-400 animate-pulse">
              <span className="text-slate-600 select-none">$</span>
              <span className="w-1.5 h-3 bg-primary-400 animate-blink" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
