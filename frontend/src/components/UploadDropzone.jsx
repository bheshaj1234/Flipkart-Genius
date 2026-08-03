import React, { useState, useRef } from 'react';
import { FileSpreadsheet, UploadCloud, X, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { parseAndValidateCSV } from '../utils/csvParser';

export default function UploadDropzone({ onFileParsed, onImagesSelected }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [imagesCount, setImagesCount] = useState(0);
  const [parsingResults, setParsingResults] = useState(null);
  const [error, setError] = useState('');

  const csvInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = async (file) => {
    setError('');
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }

    try {
      setCsvFile(file);
      const results = await parseAndValidateCSV(file);
      setParsingResults(results);
      onFileParsed(results, file);
    } catch (err) {
      setError(`Failed to parse CSV: ${err.message}`);
      setCsvFile(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleCsvChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const imageFiles = filesArray.filter(file => file.type.startsWith('image/'));
      setImagesCount(prev => prev + imageFiles.length);
      onImagesSelected(imageFiles);
    }
  };

  const handleClear = () => {
    setCsvFile(null);
    setParsingResults(null);
    setError('');
    if (csvInputRef.current) csvInputRef.current.value = '';
    onFileParsed(null, null);
  };

  const handleClearImages = () => {
    setImagesCount(0);
    if (imageInputRef.current) imageInputRef.current.value = '';
    onImagesSelected([]);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CSV Dropzone */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-2">1. Upload Product CSV File</label>
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => csvInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
              isDragActive
                ? 'border-primary-500 bg-primary-50/50'
                : csvFile
                ? 'border-emerald-500 bg-emerald-50/10'
                : 'border-slate-200 hover:border-primary-500 hover:bg-slate-50/50 bg-white'
            }`}
          >
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv"
              onChange={handleCsvChange}
              className="hidden"
            />
            
            {csvFile ? (
              <div className="space-y-3 w-full">
                <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <FileSpreadsheet size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 break-all">{csvFile.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{(csvFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg transition-colors mt-2"
                >
                  <X size={12} /> Remove File
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <UploadCloud size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Drag & drop your CSV file here, or browse</p>
                  <p className="text-xs text-slate-400 mt-1">Accepts UTF-8 formatted .csv files</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Image Dropzone */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">2. Upload Product Images (Optional)</label>
          <div
            onClick={() => imageInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
              imagesCount > 0
                ? 'border-emerald-500 bg-emerald-50/10'
                : 'border-slate-200 hover:border-primary-500 hover:bg-slate-50/50 bg-white'
            }`}
          >
            <input
              ref={imageInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {imagesCount > 0 ? (
              <div className="space-y-3 w-full">
                <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <ImageIcon size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{imagesCount} Images Selected</p>
                  <p className="text-xs text-slate-400 mt-0.5">Ready for vision analysis matching</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearImages();
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg transition-colors mt-2"
                >
                  <X size={12} /> Clear Images
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <ImageIcon size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Select product photos</p>
                  <p className="text-xs text-slate-400 mt-1">Supports multiple JPEGs, PNGs</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Parse Errors & Status panel */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 text-sm rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="shrink-0 text-rose-500 mt-0.5" size={18} />
          <div>
            <h4 className="font-semibold">Upload Error</h4>
            <p className="text-slate-600 text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      {parsingResults && (
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">CSV Structure Validation Summary</h3>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 border ${
              parsingResults.summary.hasErrors
                ? 'bg-rose-50 text-rose-700 border-rose-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-100'
            }`}>
              {parsingResults.summary.hasErrors ? <AlertCircle size={12} /> : <CheckCircle size={12} />}
              {parsingResults.summary.hasErrors ? 'Validation Issues Found' : 'File Structure Approved'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white p-4 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold uppercase">Total Rows</span>
              <p className="text-xl font-bold text-slate-800 mt-1">{parsingResults.summary.totalRows}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100">
              <span className="text-xs text-emerald-500 font-semibold uppercase">Valid Rows</span>
              <p className="text-xl font-bold text-emerald-600 mt-1">{parsingResults.summary.validCount}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100">
              <span className="text-xs text-rose-500 font-semibold uppercase">Invalid Rows</span>
              <p className="text-xl font-bold text-rose-600 mt-1">{parsingResults.summary.invalidCount}</p>
            </div>
          </div>

          {parsingResults.summary.hasErrors && (
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 bg-slate-100/50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase">
                Row Parsing Errors Breakdown
              </div>
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {parsingResults.rows
                  .filter(r => !r.isValid)
                  .map(row => (
                    <div key={row.rowIndex} className="p-3 text-xs flex gap-3">
                      <span className="font-bold text-rose-600 bg-rose-50 rounded px-1.5 py-0.5 h-fit">
                        Row {row.rowIndex}
                      </span>
                      <div className="space-y-1">
                        {row.errors.map((err, i) => (
                          <div key={i} className="text-slate-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0" />
                            <span>{err}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
