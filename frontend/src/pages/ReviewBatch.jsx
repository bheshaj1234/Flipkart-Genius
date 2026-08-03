import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { ArrowLeft, CheckCircle2, AlertTriangle, Eye, Send, Sparkles, RefreshCw, Trash2, Download } from 'lucide-react';
import { mockProducts, mockBatches } from '../utils/mockData';
import ConfidenceBadge from '../components/ConfidenceBadge';
import ProductGridRow from '../components/ProductGridRow';
import API from '../services/api';

export default function ReviewBatch({ theme }) {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const gridRef = useRef(null);

  const [batchInfo, setBatchInfo] = useState(null);
  const [rowData, setRowData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const isMockBatch = batchId.startsWith('batch_');

    if (isMockBatch) {
      // Find current batch info
      const info = mockBatches.find(b => b._id === batchId);
      setBatchInfo(info || { fileName: 'Unknown Batch', totalRows: 0 });

      // Filter products for this batch
      const products = mockProducts.filter(p => p.batchId === batchId);
      setRowData(products);
    } else {
      const fetchBatchData = async () => {
        try {
          const batchRes = await API.get(`/batches/${batchId}/status`);
          if (batchRes.data.success) {
            setBatchInfo(batchRes.data.batch);
          }

          const productsRes = await API.get(`/batches/${batchId}/products`);
          if (productsRes.data.success) {
            setRowData(productsRes.data.products);
          }
        } catch (err) {
          console.error('Failed to load batch data from API:', err);
        }
      };
      fetchBatchData();
    }
  }, [batchId]);

  // Handle cell edits
  const onCellValueChanged = async (event) => {
    const updatedData = [...rowData];
    const index = updatedData.findIndex(item => item._id === event.data._id);
    if (index > -1) {
      const product = updatedData[index];
      const field = event.colId;
      const val = event.newValue;
      const finalVal = field === 'price' ? Number(val) : val;

      product.finalData = {
        ...product.finalData,
        [field]: finalVal
      };
      setRowData(updatedData);

      // If it's a real batch, sync edit with backend
      if (!batchId.startsWith('batch_')) {
        try {
          await API.put(`/batches/products/${product._id}`, product.finalData);
        } catch (err) {
          console.error('Failed to sync cell update with backend:', err);
        }
      }
    }
  };

  // Thumbnail Renderer
  const ThumbnailCellRenderer = (params) => {
    const url = params.value?.[0] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=80&q=80';
    return (
      <div className="flex items-center justify-center h-full">
        <img
          src={url}
          alt="Product"
          className="w-8 h-8 rounded-lg object-cover border border-slate-100 hover:scale-150 transition-all cursor-pointer shadow-sm"
        />
      </div>
    );
  };

  // Confidence Cell Renderer
  const ConfidenceCellRenderer = (params) => {
    return (
      <div className="flex items-center h-full">
        <ConfidenceBadge score={params.value} />
      </div>
    );
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.finalData?.title || 'this product'}"?`)) {
      return;
    }
    try {
      if (!batchId.startsWith('batch_')) {
        await API.delete(`/batches/products/${product._id}`);
      }
      setRowData(prev => prev.filter(p => p._id !== product._id));
    } catch (err) {
      console.error('Failed to delete product draft:', err);
    }
  };

  // Actions Cell Renderer
  const ActionsCellRenderer = (params) => {
    return (
      <div className="flex items-center gap-2 h-full">
        <button
          onClick={() => setSelectedProduct(params.data)}
          className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2 py-1 rounded text-xs transition-colors"
          title="Compare Raw vs AI Suggestion"
        >
          <Eye size={12} /> Compare
        </button>
        <button
          onClick={() => handleDeleteProduct(params.data)}
          className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold px-2 py-1 rounded text-xs transition-colors border border-rose-100/50"
          title="Delete product draft"
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
    );
  };

  // Grid columns definition
  const columnDefs = useMemo(() => [
    {
      headerName: 'Photo',
      field: 'finalData.imageUrls',
      cellRenderer: ThumbnailCellRenderer,
      width: 80,
      suppressMenu: true,
      sortable: false
    },
    {
      headerName: 'Product Title (Editable)',
      field: 'finalData.title',
      editable: true,
      flex: 2,
      minWidth: 200,
      cellClass: 'font-medium text-slate-800'
    },
    {
      headerName: 'Category (Editable)',
      field: 'finalData.category',
      editable: true,
      width: 130
    },
    {
      headerName: 'Subcategory (Editable)',
      field: 'finalData.subcategory',
      editable: true,
      width: 140
    },
    {
      headerName: 'Price ($)',
      field: 'finalData.price',
      editable: true,
      valueParser: (params) => {
        const val = Number(params.newValue);
        return isNaN(val) ? params.oldValue : val;
      },
      width: 110,
      cellClass: 'font-semibold text-slate-700'
    },
    {
      headerName: 'AI Confidence',
      field: 'aiGenerated.confidenceScore',
      cellRenderer: ConfidenceCellRenderer,
      width: 140,
      sortable: true
    },
    {
      headerName: 'Actions',
      cellRenderer: ActionsCellRenderer,
      width: 190,
      suppressMenu: true,
      sortable: false
    }
  ], [rowData]);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  const handleDiscardBatch = async () => {
    if (!window.confirm("Are you sure you want to discard this entire batch and delete all associated products? This cannot be undone.")) {
      return;
    }

    setIsPublishing(true);
    if (batchId.startsWith('batch_')) {
      setTimeout(() => {
        setIsPublishing(false);
        navigate('/dashboard');
      }, 1000);
    } else {
      try {
        await API.delete(`/batches/${batchId}`);
        setIsPublishing(false);
        navigate('/dashboard');
      } catch (err) {
        console.error('Failed to discard batch:', err);
        setIsPublishing(false);
      }
    }
  };

  const handleBulkPublish = async () => {
    setIsPublishing(true);
    if (batchId.startsWith('batch_')) {
      setTimeout(() => {
        setIsPublishing(false);
        navigate('/dashboard');
      }, 1500);
    } else {
      try {
        await API.post('/batches/products/bulk-publish', { batchId });
        setIsPublishing(false);
        navigate('/dashboard');
      } catch (err) {
        console.error('Failed to bulk publish:', err);
        setIsPublishing(false);
      }
    }
  };

  const lowConfidenceCount = useMemo(() => {
    return rowData.filter(r => r.aiGenerated.confidenceScore < 0.6).length;
  }, [rowData]);

  const handleExportCSV = () => {
    if (rowData.length === 0) return;
    
    const headers = ['Title', 'Description', 'Category', 'Subcategory', 'Price', 'Color', 'Pattern', 'Material', 'Status'];
    
    const csvRows = rowData.map(p => {
      const colorVal = p.finalData?.attributes?.color || p.aiGenerated?.extractedAttributes?.color || '';
      const patternVal = p.finalData?.attributes?.pattern || p.aiGenerated?.extractedAttributes?.pattern || '';
      const materialVal = p.finalData?.attributes?.material || p.aiGenerated?.extractedAttributes?.material || '';
      
      return [
        p.finalData?.title || p.rawInput?.title || '',
        p.finalData?.description || p.aiGenerated?.description || '',
        p.finalData?.category || p.rawInput?.category || '',
        p.finalData?.subcategory || p.aiGenerated?.suggestedSubcategory || '',
        p.finalData?.price || p.rawInput?.price || 0,
        colorVal,
        patternVal,
        materialVal,
        p.status || 'draft'
      ];
    });

    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => 
        row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${batchInfo?.fileName?.replace(/\.[^/.]+$/, "") || 'catalog'}_enriched.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{batchInfo?.fileName}</h1>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 px-2 py-0.5 rounded font-mono">
                {batchId}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Review AI Suggestions and resolve alerts before publishing.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={rowData.length === 0}
            className="inline-flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30 font-bold px-5 py-2.5 rounded-xl text-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <Download size={16} /> Export CSV
          </button>

          <button
            onClick={handleDiscardBatch}
            disabled={isPublishing}
            className="inline-flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100/50 font-bold px-5 py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]"
          >
            <Trash2 size={16} /> Discard Batch
          </button>

          <button
            onClick={handleBulkPublish}
            disabled={isPublishing || rowData.length === 0}
            className="inline-flex items-center justify-center gap-2 bg-[#2874f0] hover:bg-[#1260e2] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md active:scale-[0.98]"
          >
            {isPublishing ? (
              <RefreshCw className="animate-spin" size={16} />
            ) : (
              <>
                <Send size={16} /> Bulk Publish Approved ({rowData.length} Drafts)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Warning banner for Low Confidence Row alerts */}
      {lowConfidenceCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="shrink-0 text-amber-600 mt-0.5" size={18} />
          <div>
            <h4 className="font-semibold text-amber-900">Attention Required</h4>
            <p className="text-amber-700 mt-1 leading-relaxed">
              We flagged <span className="font-bold">{lowConfidenceCount} products</span> with low AI category match confidence (below 0.6). Please check and edit their categories manually.
            </p>
          </div>
        </div>
      )}

      {/* Main ag-grid spreadsheet table container */}
      <div className="theme-card border rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-100 dark:border-slate-900 pb-3">
          <span className="flex items-center gap-1"><Sparkles size={14} className="text-blue-500" /> Double-click on any cell to edit data inline</span>
          <span>Total Drafts loaded: {rowData.length}</span>
        </div>

        <div className={theme === 'dark' ? 'ag-theme-alpine-dark w-full h-[450px]' : 'ag-theme-alpine w-full h-[450px]'}>
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowHeight={48}
            headerHeight={44}
            onCellValueChanged={onCellValueChanged}
            animateRows={true}
          />
        </div>
      </div>

      {/* Sidebar Details Drawer/Comparison Modal */}
      {selectedProduct && (
        <ProductGridRow
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSave={(updatedProduct) => {
            const updated = rowData.map(p => p._id === updatedProduct._id ? updatedProduct : p);
            setRowData(updated);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
