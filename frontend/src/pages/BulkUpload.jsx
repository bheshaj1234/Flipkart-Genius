import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Sparkles, ChevronRight, HelpCircle, ArrowRight, AlertCircle } from 'lucide-react';
import UploadDropzone from '../components/UploadDropzone';
import ProgressTracker from '../components/ProgressTracker';
import API from '../services/api';

export default function BulkUpload() {
  const [parsedResults, setParsedResults] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const navigate = useNavigate();

  const handleFileParsed = (results, file) => {
    setParsedResults(results);
    setRawFile(file);
  };

  const handleImagesSelected = (images) => {
    setSelectedImages(images);
  };

  const handleStartProcessing = async () => {
    if (!parsedResults || parsedResults.summary.validCount === 0 || !rawFile) return;
    
    setUploadError('');
    setIsProcessing(false);

    try {
      const formData = new FormData();
      formData.append('file', rawFile);
      
      // Append images if selected
      selectedImages.forEach(img => {
        formData.append('images', img);
      });

      const res = await API.post('/batches/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        setActiveBatchId(res.data.batch.id);
        setIsProcessing(true);
      }
    } catch (err) {
      console.error(err);
      setUploadError(err.response?.data?.message || 'Failed to submit batch to backend. Make sure Redis & MongoDB are online!');
    }
  };

  const handleProcessingComplete = () => {
    setIsComplete(true);
  };

  const handleAuditRedirect = () => {
    if (activeBatchId) {
      navigate(`/review/${activeBatchId}`);
    } else {
      navigate('/review/batch_664df08b4efc8942e88a01a2');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">AI Bulk Uploader</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Upload inventory files. Our AI engine will auto-categorize and enrich descriptions.</p>
      </div>

      {/* Steps Visual Tracker */}
      <div className="theme-card p-4 rounded-2xl border shadow-sm flex items-center justify-between overflow-x-auto gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <span className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center ${
            isProcessing || isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-600 text-white'
          }`}>1</span>
          <span className={`text-xs font-semibold ${isProcessing || isComplete ? 'text-emerald-700 font-bold' : 'text-slate-800 dark:text-slate-200'}`}>Upload CSV</span>
        </div>
        <ChevronRight size={16} className="text-slate-300 dark:text-slate-705 shrink-0" />
        <div className="flex items-center gap-2 shrink-0">
          <span className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center ${
            isProcessing && !isComplete ? 'bg-blue-600 text-white animate-pulse-slow' : isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500'
          }`}>2</span>
          <span className={`text-xs font-semibold ${isProcessing && !isComplete ? 'text-blue-700 font-bold' : isComplete ? 'text-emerald-700 font-bold' : 'text-slate-450 dark:text-slate-500'}`}>Queue Processing</span>
        </div>
        <ChevronRight size={16} className="text-slate-300 dark:text-slate-705 shrink-0" />
        <div className="flex items-center gap-2 shrink-0">
          <span className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center ${
            isProcessing && !isComplete ? 'bg-blue-600 text-white' : isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500'
          }`}>3</span>
          <span className={`text-xs font-semibold ${isProcessing && !isComplete ? 'text-blue-700 font-bold' : isComplete ? 'text-emerald-700 font-bold' : 'text-slate-450 dark:text-slate-500'}`}>AI Enrichment</span>
        </div>
        <ChevronRight size={16} className="text-slate-300 dark:text-slate-705 shrink-0" />
        <div className="flex items-center gap-2 shrink-0">
          <span className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center ${
            isComplete ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500'
          }`}>4</span>
          <span className={`text-xs font-semibold ${isComplete ? 'text-blue-700 font-bold' : 'text-slate-450 dark:text-slate-500'}`}>Audit & Publish</span>
        </div>
      </div>

      {isProcessing ? (
        <div className="space-y-6">
          <ProgressTracker
            totalRows={parsedResults.summary.validCount}
            onComplete={handleProcessingComplete}
            batchId={activeBatchId || 'batch_664df08b4efc8942e88a01a2'}
          />

          {isComplete && (
            <div className="theme-card p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-emerald-500 animate-pulse-slow" />
                  AI Enrichment Complete!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-450">
                  Ready to audit raw CSV values alongside AI-generated suggestions inside the data grid.
                </p>
              </div>

              <button
                onClick={handleAuditRedirect}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-[0.98]"
              >
                Go to Audit Grid <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Main Drag-Drop Upload Component */}
          <UploadDropzone
            onFileParsed={handleFileParsed}
            onImagesSelected={handleImagesSelected}
          />

          {uploadError && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 text-sm rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="shrink-0 text-rose-500 mt-0.5" size={18} />
              <div>
                <h4 className="font-semibold">Upload Error</h4>
                <p className="text-slate-600 text-xs mt-1">{uploadError}</p>
              </div>
            </div>
          )}

          {/* Processing controls */}
          {parsedResults && parsedResults.summary.validCount > 0 && (
            <div className="theme-card p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Sparkles size={16} className="text-blue-500 animate-pulse-slow" />
                  Ready for AI Batch Analysis
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  We found <span className="font-bold text-slate-700 dark:text-slate-200">{parsedResults.summary.validCount} valid items</span> to enqueue.
                  {selectedImages.length > 0 && ` We'll match them with the ${selectedImages.length} uploaded photos.`}
                </p>
              </div>

              <button
                onClick={handleStartProcessing}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#2874f0] hover:bg-[#1260e2] text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-[0.98]"
              >
                <Play size={16} /> Start Enqueuing Job
              </button>
            </div>
          )}

          {/* Guideline info cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="theme-card p-6 rounded-2xl border shadow-sm flex items-start gap-4">
              <div className="p-2.5 bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 rounded-xl">
                <HelpCircle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Required CSV Columns</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Your spreadsheet must contain these headers (any order): <code className="bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-800 text-blue-600 dark:text-blue-400 font-mono">title</code>, <code className="bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-800 text-blue-600 dark:text-blue-400 font-mono">price</code>, and <code className="bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-800 text-blue-600 dark:text-blue-400 font-mono">category</code>.
                </p>
              </div>
            </div>

            <div className="theme-card p-6 rounded-2xl border shadow-sm flex items-start gap-4">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-xl">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white text-sm">How AI Enrichment Works</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  We process each row in a background queue using Claude. It validates the category schema, extracts photo properties (color, material, pattern), writes SEO copy, and suggests taxonomy matches.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
