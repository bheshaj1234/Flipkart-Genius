import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Send, RefreshCw, AlertCircle, UploadCloud, Image, Trash2, FileImage } from 'lucide-react';
import API from '../services/api';

const CATEGORIES = {
  'Apparel': ['Kurtas', 'Trousers', 'Dresses'],
  'Accessories': ['Handbags', 'Watches', 'Sunglasses'],
  'Electronics': ['Mice', 'Keyboards', 'Headphones', 'Laptops']
};

export default function AddProduct() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Apparel');
  const [subcategory, setSubcategory] = useState('Kurtas');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [color, setColor] = useState('');
  const [pattern, setPattern] = useState('');
  const [material, setMaterial] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Drag & drop file states
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please select or drop a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setCategory(cat);
    setSubcategory(CATEGORIES[cat][0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !price || !category || !subcategory) {
      setError('Please fill in all required fields (Title, Price, Category, Subcategory).');
      return;
    }

    if (isNaN(Number(price)) || Number(price) <= 0) {
      setError('Please enter a valid positive number for the price.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await API.post('/batches/products/single', {
        title,
        description,
        category,
        subcategory,
        price: Number(price),
        imageUrl,
        color,
        pattern,
        material
      });

      if (res.data.success) {
        setSuccess('Product listing created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create manual product listing.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative max-w-3xl mx-auto">
      {/* Absolute Theme Spheres */}
      <div className="absolute top-[-10%] left-[-15%] w-[25rem] h-[25rem] rounded-full bg-blue-600/5 blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[30rem] h-[30rem] rounded-full bg-blue-500/5 blur-[110px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard"
          className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Add Product Listing
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Manually list a single product draft into your store inventory
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl p-4 flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl p-4 flex items-center gap-2">
          <Sparkles size={16} className="shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="theme-card border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono border-b border-slate-100 dark:border-slate-900 pb-2">
          Listing Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Product Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              placeholder="e.g. Designer Embroidered Silk Kurta"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Category *</label>
            <select
              value={category}
              onChange={handleCategoryChange}
              className="block w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            >
              {Object.keys(CATEGORIES).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Subcategory *</label>
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="block w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            >
              {CATEGORIES[category].map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Price (INR) *</label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="block w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              placeholder="e.g. 1499"
            />
          </div>

          {/* Product Image drag drop & URL */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Drag & Drop Dropzone */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Upload Product Photo</label>
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer select-none min-h-[140px] ${
                  isDragActive
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-purple-500/30 bg-slate-50 dark:bg-slate-900/30'
                }`}
                onClick={() => document.getElementById('manual-file-input').click()}
              >
                <input
                  id="manual-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
                
                {imageUrl && imageUrl.startsWith('data:') ? (
                  <div className="relative group w-full flex items-center justify-center">
                    <img
                      src={imageUrl}
                      alt="Uploaded Product Preview"
                      className="max-h-24 rounded-lg object-contain border border-slate-700/30"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageUrl('');
                      }}
                      className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <UploadCloud size={24} className="text-slate-400 dark:text-slate-500" />
                    <span className="text-xs text-slate-500 text-center font-medium">
                      Drag & drop image here or <span className="text-purple-400 font-bold">Browse</span>
                    </span>
                    <span className="text-[10px] text-slate-450 dark:text-slate-600 font-mono">PNG, JPG, WEBP (Max 5MB)</span>
                  </>
                )}
              </div>
            </div>

            {/* Direct URL Input */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Or Paste Image URL</label>
                <input
                  type="url"
                  value={imageUrl && !imageUrl.startsWith('data:') ? imageUrl : ''}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="block w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {imageUrl && !imageUrl.startsWith('data:') && (
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl">
                  <img
                    src={imageUrl}
                    alt="URL Preview"
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1594751543129-6701ad444259?auto=format&fit=crop&w=100&q=80';
                    }}
                  />
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap">
                    URL Preview Image Loaded
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Listing Copy / Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              placeholder="Write a professional copy description for your product..."
            />
          </div>
        </div>

        {/* Product Attributes specs */}
        <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono border-b border-slate-100 dark:border-slate-900 pt-4 pb-2">
          Physical Specifications
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Color */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Color</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="block w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              placeholder="e.g. Navy Blue"
            />
          </div>

          {/* Pattern */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Pattern</label>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="block w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              placeholder="e.g. Striped / Solid"
            />
          </div>

          {/* Material */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Material</label>
            <input
              type="text"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="block w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              placeholder="e.g. Organic Cotton"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-900 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#2874f0] hover:bg-[#1260e2] text-white font-bold uppercase tracking-wider text-xs border border-blue-500/20 rounded-xl transition-all active:scale-[0.98] cursor-pointer shadow-md"
          >
            {isLoading ? (
              <>
                <RefreshCw size={16} className="animate-spin" /> Creating Listing...
              </>
            ) : (
              <>
                <Send size={16} /> Submit Listing
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
