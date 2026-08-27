import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { UploadCloud, LayoutDashboard, ShoppingBag, LogOut, User, Sun, Moon, PlusCircle, Menu, X } from 'lucide-react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BulkUpload from './pages/BulkUpload';
import ReviewBatch from './pages/ReviewBatch';
import Register from './pages/Register';
import Landing from './pages/Landing';
import AddProduct from './pages/AddProduct';
import FlipkartLogo from './components/FlipkartLogo';
import HeroDemo from './components/ui/demo';

// Layout wrapper for authenticated pages
const DashboardLayout = ({ children, theme, toggleTheme }) => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem('seller_token');
  const storeName = sessionStorage.getItem('seller_store') || 'FashionCart Store';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  const handleSignOut = () => {
    sessionStorage.removeItem('seller_token');
    sessionStorage.removeItem('seller_store');
    navigate('/');
  };

  if (!token) {
    return null;
  }

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${
      theme === 'dark' ? 'bg-black text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Mobile Sidebar Slide-in Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className={`relative w-64 h-full flex flex-col justify-between p-0 shadow-2xl z-10 transition-colors duration-300 ${
            theme === 'dark' ? 'bg-[#0b0f19] text-slate-100' : 'bg-white text-slate-800'
          }`}>
            <div>
              <div className={`h-16 flex items-center justify-between px-6 border-b transition-colors ${
                theme === 'dark' ? 'border-slate-900' : 'border-slate-100'
              }`}>
                <div className="flex items-center gap-2">
                  <FlipkartLogo theme={theme} className="h-6 w-6" textClass="text-lg" />
                  <span className="text-[10px] font-black tracking-widest text-[#2874F0] font-mono uppercase bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">GENIUS</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 rounded-lg transition-all"
                >
                  <X size={16} />
                </button>
              </div>
              <nav className="mt-6 px-4 space-y-1">
                <Link 
                  to="/dashboard" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    theme === 'dark' 
                      ? 'text-slate-400 hover:bg-slate-900 hover:text-white' 
                      : 'text-slate-650 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                <Link 
                  to="/upload" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    theme === 'dark' 
                      ? 'text-slate-400 hover:bg-slate-900 hover:text-white' 
                      : 'text-slate-650 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  <UploadCloud size={18} />
                  Bulk Upload
                </Link>
                <Link 
                  to="/add-product" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    theme === 'dark' 
                      ? 'text-slate-400 hover:bg-slate-900 hover:text-white' 
                      : 'text-slate-650 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  <PlusCircle size={18} />
                  Add Listing
                </Link>
              </nav>
            </div>
            
            <div className={`p-4 border-t space-y-2 transition-colors ${
              theme === 'dark' ? 'border-slate-900' : 'border-slate-100'
            }`}>
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <User size={16} />
                </div>
                <div className="text-left">
                  <p className={`text-xs font-semibold ${
                    theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                  }`}>{storeName}</p>
                  <p className="text-[10px] text-slate-400">Pro Seller</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-955 rounded-xl transition-colors w-full text-left"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar Navigation */}
      <aside className={`hidden lg:flex lg:flex-col lg:w-64 shrink-0 border-r justify-between transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#0b0f19] border-slate-900 text-slate-100' : 'bg-white border-slate-100 text-slate-800'
      }`}>
        <div>
          <div className={`h-16 flex items-center px-6 border-b transition-colors ${
            theme === 'dark' ? 'border-slate-900' : 'border-slate-100'
          }`}>
            <div className="flex items-center gap-2">
              <FlipkartLogo theme={theme} className="h-6 w-6" textClass="text-lg" />
              <span className="text-[10px] font-black tracking-widest text-[#2874F0] font-mono uppercase bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded animate-pulse-slow">GENIUS</span>
            </div>
          </div>
          <nav className="mt-6 px-4 space-y-1">
            <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
              theme === 'dark' 
                ? 'text-slate-400 hover:bg-slate-900 hover:text-white' 
                : 'text-slate-650 hover:bg-slate-100 hover:text-slate-950'
            }`}>
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            <Link to="/upload" className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
              theme === 'dark' 
                ? 'text-slate-400 hover:bg-slate-900 hover:text-white' 
                : 'text-slate-650 hover:bg-slate-100 hover:text-slate-950'
            }`}>
              <UploadCloud size={18} />
              Bulk Upload
            </Link>
            <Link to="/add-product" className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
              theme === 'dark' 
                ? 'text-slate-400 hover:bg-slate-900 hover:text-white' 
                : 'text-slate-650 hover:bg-slate-100 hover:text-slate-950'
            }`}>
              <PlusCircle size={18} />
              Add Listing
            </Link>
          </nav>
        </div>
        
        {/* Sidebar Footer / User Info */}
        <div className={`p-4 border-t space-y-2 transition-colors ${
          theme === 'dark' ? 'border-slate-900' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <User size={16} />
            </div>
            <div className="text-left">
              <p className={`text-xs font-semibold ${
                theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
              }`}>{storeName}</p>
              <p className="text-[10px] text-slate-400">Pro Seller</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors w-full text-left"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <header className={`h-16 border-b flex items-center justify-between px-4 sm:px-8 transition-colors ${
          theme === 'dark' ? 'bg-[#0b0f19] border-slate-900' : 'bg-white border-slate-100'
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 lg:hidden border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 transition-all cursor-pointer bg-white dark:bg-slate-950"
            >
              <Menu size={16} />
            </button>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all ${
                theme === 'dark' 
                  ? 'border-slate-800 hover:bg-slate-900 text-yellow-400 bg-slate-950/20' 
                  : 'border-slate-200 hover:bg-slate-100 text-blue-600 bg-slate-50'
              }`}
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <div className={`flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider uppercase rounded-full px-3 py-1 border transition-colors ${
              theme === 'dark' 
                ? 'text-emerald-400 bg-emerald-950/10 border-emerald-500/20' 
                : 'text-emerald-700 bg-emerald-50 border-emerald-200'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-slow" />
              Engine Online
            </div>
          </div>
        </header>
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<Login theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/register" element={<Register theme={theme} toggleTheme={toggleTheme} />} />
        
        {/* Authenticated Dashboard Routes */}
        <Route path="/dashboard" element={
          <DashboardLayout theme={theme} toggleTheme={toggleTheme}>
            <Dashboard theme={theme} />
          </DashboardLayout>
        } />
        <Route path="/upload" element={
          <DashboardLayout theme={theme} toggleTheme={toggleTheme}>
            <BulkUpload />
          </DashboardLayout>
        } />
        <Route path="/add-product" element={
          <DashboardLayout theme={theme} toggleTheme={toggleTheme}>
            <AddProduct />
          </DashboardLayout>
        } />
        <Route path="/review/:batchId" element={
          <DashboardLayout theme={theme} toggleTheme={toggleTheme}>
            <ReviewBatch theme={theme} />
          </DashboardLayout>
        } />

        {/* Landing Page */}
        <Route path="/" element={<Landing theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/demo" element={<HeroDemo />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
