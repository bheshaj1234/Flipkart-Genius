import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  RefreshCw, 
  BarChart3, 
  Trash2, 
  Layers, 
  Database, 
  Cpu, 
  Activity, 
  PlusCircle, 
  ChevronRight, 
  FileText,
  Clock
} from 'lucide-react';
import { mockBatches } from '../utils/mockData';
import API from '../services/api';

export default function Dashboard({ theme }) {
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const storeName = sessionStorage.getItem('seller_store') || 'Seller Store';

  const fetchBatches = async () => {
    try {
      const res = await API.get('/batches');
      if (res.data.success) {
        setBatches(res.data.batches);
      }
    } catch (err) {
      console.error('Failed to fetch batches from backend API:', err);
      setBatches(mockBatches);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBatches();
    setIsRefreshing(false);
  };

  const handleDeleteBatch = async (batchId) => {
    if (!window.confirm("Are you sure you want to delete this batch and all its products? This action cannot be undone.")) {
      return;
    }

    try {
      if (!batchId.startsWith('batch_')) {
        await API.delete(`/batches/${batchId}`);
      }
      setBatches(prev => prev.filter(b => b._id !== batchId));
    } catch (err) {
      console.error('Failed to delete batch:', err);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
          label: 'Completed',
          icon: <CheckCircle2 size={12} />
        };
      case 'processing':
        return {
          bg: 'bg-blue-500/10 dark:bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 animate-pulse-slow',
          label: 'Processing',
          icon: <RefreshCw size={12} className="animate-spin" />
        };
      case 'failed':
        return {
          bg: 'bg-rose-500/10 dark:bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400',
          label: 'Failed',
          icon: <AlertTriangle size={12} />
        };
      default:
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
          label: 'Needs Review',
          icon: <AlertTriangle size={12} />
        };
    }
  };

  // Compute overall summary stats
  const totalUploadedRows = batches.reduce((acc, b) => acc + (b.totalRows || 0), 0);
  const enrichedProducts = batches.reduce((acc, b) => acc + ((b.processedRows || 0) - (b.failedRows || 0)), 0);
  const totalFailedRows = batches.reduce((acc, b) => acc + (b.failedRows || 0), 0);
  const successPercentage = totalUploadedRows > 0 
    ? Math.round(((totalUploadedRows - totalFailedRows) / totalUploadedRows) * 100) 
    : 100;

  return (
    <div className="space-y-8 relative dot-grid p-4 md:p-8 rounded-3xl min-h-screen">
      {/* Dynamic Background Blur Glows */}
      <div className="absolute top-[-10%] left-[-20%] w-[35rem] h-[35rem] rounded-full bg-blue-600/5 dark:bg-blue-500/10 blur-[130px] pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[40rem] h-[40rem] rounded-full bg-[#2874f0]/5 dark:bg-emerald-500/5 blur-[150px] pointer-events-none -z-10" />

      {/* Welcome Banner Card (Premium Dark Glassmorphic Style with Sleek Gradient Accents) */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800/60 bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl p-6 md:p-8 text-slate-800 dark:text-slate-100 shadow-xl shadow-slate-100/50 dark:shadow-none transition-all duration-300">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-blue-500/10 dark:bg-blue-400/5 blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
        <div className="absolute right-0 bottom-0 opacity-5 dark:opacity-[0.03] pointer-events-none translate-x-10 translate-y-10 text-slate-900 dark:text-white">
          <Layers size={300} />
        </div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/20 dark:border-blue-400/20 text-blue-600 dark:text-blue-400 font-mono">
            Flipkart Genius v1.1
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
            Welcome back, <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">{storeName}</span> 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed font-medium">
            The AI engine is running in real-time. Drag & drop catalog sheets to enrich product copy instantly, or manually audit listing violations.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 btn-classy btn-classy-primary px-5 py-3.5 transition-all text-xs"
            >
              <UploadCloud size={16} /> Upload Bulk Catalog
            </Link>
            <Link
              to="/add-product"
              className={`inline-flex items-center gap-2 px-5 py-3.5 transition-all text-xs border rounded-xl active:scale-[0.98] btn-classy ${
                theme === 'dark'
                  ? 'bg-slate-950/60 border-slate-800 hover:bg-slate-900 text-slate-350 hover:text-white'
                  : 'bg-white border-slate-205 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <PlusCircle size={16} /> Quick Add Product
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="theme-card relative overflow-hidden p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Batches</h3>
              {isLoading ? (
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mt-2" />
              ) : (
                <p className="text-3xl font-bold font-mono text-slate-900 dark:text-white mt-2">{batches.length}</p>
              )}
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 rounded-2xl transition-all group-hover:scale-110">
              <BarChart3 size={20} />
            </div>
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-4 flex items-center gap-1">
            <Clock size={12} /> Last updated: Just now
          </div>
        </div>

        {/* Metric 2 */}
        <div className="theme-card relative overflow-hidden p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Enriched Drafts</h3>
              {isLoading ? (
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mt-2" />
              ) : (
                <p className="text-3xl font-bold font-mono text-slate-900 dark:text-white mt-2">{enrichedProducts}</p>
              )}
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-2xl transition-all group-hover:scale-110">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-4">
            Total items optimized by AI
          </div>
        </div>

        {/* Metric 3 */}
        <div className="theme-card relative overflow-hidden p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Flagged Audit Review</h3>
              {isLoading ? (
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mt-2" />
              ) : (
                <p className="text-3xl font-bold font-mono text-rose-500 dark:text-rose-400 mt-2">{totalFailedRows}</p>
              )}
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 rounded-2xl transition-all group-hover:scale-110">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="text-[10px] text-rose-600 dark:text-rose-450 mt-4 font-semibold">
            Needs category/image validation
          </div>
        </div>

        {/* Metric 4 */}
        <div className="theme-card relative overflow-hidden p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Enrichment Success</h3>
              {isLoading ? (
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mt-2" />
              ) : (
                <p className="text-3xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-2">{successPercentage}%</p>
              )}
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 rounded-2xl transition-all group-hover:scale-110">
              <Activity size={20} />
            </div>
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-4">
            Auto-compliance approval rate
          </div>
        </div>
      </div>

      {/* Main Grid: Lists and Status widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Batches list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="theme-card border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
              <div>
                <h2 className="font-bold text-slate-800 dark:text-white text-sm">Recent Catalog Imports</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">List of uploaded files and background queue progress</p>
              </div>
              <button
                onClick={handleRefresh}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shadow-sm"
                title="Refresh logs"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {isLoading ? (
                [1, 2, 3].map((n) => (
                  <div key={n} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-pulse">
                    <div className="space-y-3.5 flex-1">
                      <div className="h-5 bg-slate-200 dark:bg-slate-800/80 rounded-lg w-1/3" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-1/2" />
                      <div className="space-y-1.5 max-w-md pt-2">
                        <div className="h-2 bg-slate-100 dark:bg-slate-850 rounded w-1/4" />
                        <div className="h-2 bg-slate-100 dark:bg-slate-850 rounded w-full" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                      <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                      <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    </div>
                  </div>
                ))
              ) : batches.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-medium">
                  <FileText className="mx-auto text-slate-300 dark:text-slate-700 mb-3" size={36} />
                  No upload batches found. Click "Upload Bulk Catalog" to begin.
                </div>
              ) : (
                batches.map((batch) => {
                  const statusInfo = getStatusConfig(batch.status);
                  const progressPct = batch.totalRows > 0 
                    ? Math.round((batch.processedRows / batch.totalRows) * 100) 
                    : 0;

                  return (
                    <div key={batch._id} className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-950/5 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-800 dark:text-white text-sm">{batch.fileName}</h3>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusInfo.bg}`}>
                            {statusInfo.icon} {statusInfo.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-450 dark:text-slate-500 font-mono">
                          <span>ID: {batch._id}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                          <span>{new Date(batch.createdAt).toLocaleDateString()} {new Date(batch.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="space-y-1 max-w-md pt-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                            <span>ENRICHMENT PROGRESS</span>
                            <span>{progressPct}% ({batch.processedRows}/{batch.totalRows} items)</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                batch.status === 'completed' 
                                  ? 'bg-emerald-500' 
                                  : batch.status === 'processing'
                                  ? 'bg-blue-500 animate-pulse-slow'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                        {/* Summary breakdown badge */}
                        <div className="flex gap-3 text-xs">
                          <div className="text-center bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/40 rounded-lg px-2.5 py-1 min-w-[3.5rem]">
                            <div className="text-[10px] text-slate-400 uppercase font-bold font-mono">Enriched</div>
                            <div className="font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{(batch.processedRows || 0) - (batch.failedRows || 0)}</div>
                          </div>
                          <div className="text-center bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/40 rounded-lg px-2.5 py-1 min-w-[3.5rem]">
                            <div className="text-[10px] text-slate-400 uppercase font-bold font-mono">Flagged</div>
                            <div className="font-extrabold text-rose-500 dark:text-rose-400 mt-0.5">{batch.failedRows}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            to={`/review/${batch._id}`}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs transition-all btn-classy ${
                              batch.status === 'processing'
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed pointer-events-none'
                                : 'btn-classy-primary border-blue-600/10'
                            }`}
                          >
                            <Play size={12} fill="currentColor" /> Audit Catalog
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBatch(batch._id);
                            }}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/10 transition-colors cursor-pointer"
                            title="Delete import history"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Engine health status monitor & quick actions */}
        <div className="space-y-6">
          
          {/* Engine Integrity Monitor Widget */}
          <div className="theme-card border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl shadow-sm space-y-5">
            <div>
              <h2 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                <Cpu size={16} className="text-blue-500" />
                AI System Integrity
              </h2>
              <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">Real-time status of backend service layers</p>
            </div>

            <div className="space-y-3.5">
              {/* Row 1 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/30">
                <div className="flex items-center gap-2.5">
                  <Database size={16} className="text-slate-400 dark:text-slate-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">MongoDB Atlas Cluster</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/25 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900/20 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-slow" />
                  ONLINE
                </div>
              </div>

              {/* Row 2 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/30">
                <div className="flex items-center gap-2.5">
                  <Activity size={16} className="text-slate-400 dark:text-slate-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Upstash Redis Cache</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/25 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/20 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse-slow" />
                  ACTIVE
                </div>
              </div>

              {/* Row 3 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/30">
                <div className="flex items-center gap-2.5">
                  <Cpu size={16} className="text-slate-400 dark:text-slate-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Gemini 1.5 Flash API</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-yellow-600 bg-yellow-50 dark:bg-yellow-950/25 px-2 py-0.5 rounded-md border border-yellow-100 dark:border-yellow-900/20 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse-slow" />
                  READY
                </div>
              </div>

              {/* Row 4 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/30">
                <div className="flex items-center gap-2.5">
                  <Layers size={16} className="text-slate-400 dark:text-slate-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">BullMQ Background Queue</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/25 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/20 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse-slow" />
                  RUNNING
                </div>
              </div>
            </div>
          </div>

          {/* Quick Upload CTA Box */}
          <div className="relative overflow-hidden rounded-2xl border border-blue-200/50 dark:border-blue-900/20 bg-blue-50/30 dark:bg-blue-950/5 p-6 space-y-4">
            <div className="absolute right-0 top-0 text-blue-500/10 pointer-events-none translate-x-5 -translate-y-5">
              <UploadCloud size={120} />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-blue-800 dark:text-blue-400 text-sm">Need to onboard products?</h3>
              <p className="text-xs text-blue-600/90 dark:text-blue-400/80 leading-relaxed font-medium">
                Upload your CSV list to instantly run image recognition audits, title enhancements, and auto-categorization.
              </p>
            </div>
            <Link
              to="/upload"
              className="inline-flex items-center justify-center gap-1.5 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl py-3 transition-all active:scale-[0.98] shadow-sm shadow-blue-500/10"
            >
              Start Bulk Import <ChevronRight size={14} />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
