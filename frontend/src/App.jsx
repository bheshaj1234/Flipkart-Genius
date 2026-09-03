import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { UploadCloud, LayoutDashboard, LogOut, User, PlusCircle, Home } from 'lucide-react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BulkUpload from './pages/BulkUpload';
import ReviewBatch from './pages/ReviewBatch';
import Register from './pages/Register';
import Landing from './pages/Landing';
import AddProduct from './pages/AddProduct';
import Navbar from './components/Navbar';

// Layout wrapper for authenticated pages
const DashboardLayout = ({ children, theme, toggleTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = sessionStorage.getItem('seller_token');
  const storeName = sessionStorage.getItem('seller_store') || 'FashionCart Store';

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

  const sidebarLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Bulk Upload', path: '/upload', icon: UploadCloud },
    { label: 'Add Listing', path: '/add-product', icon: PlusCircle },
  ];

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      theme === 'dark' ? 'bg-black text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Top Functional Navigation Bar */}
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <div className="flex-1 flex min-h-[calc(100vh-4rem)] overflow-x-hidden">
        {/* Desktop Sidebar Navigation */}
        <aside className={`hidden lg:flex lg:flex-col lg:w-64 shrink-0 border-r justify-between transition-colors duration-300 ${
          theme === 'dark' ? 'bg-[#0b0f19] border-slate-900 text-slate-100' : 'bg-white border-slate-100 text-slate-800'
        }`}>
          <div>
            <div className="p-4 border-b border-slate-800/50">
              <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
                SELLER DASHBOARD MENU
              </span>
            </div>
            <nav className="mt-4 px-3 space-y-1.5">
              {sidebarLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#2874F0] text-white shadow-md font-bold'
                        : theme === 'dark'
                        ? 'text-slate-400 hover:bg-slate-900 hover:text-white'
                        : 'text-slate-650 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* Sidebar Footer / User Info */}
          <div className={`p-4 border-t space-y-2 transition-colors ${
            theme === 'dark' ? 'border-slate-900' : 'border-slate-100'
          }`}>
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 rounded-full bg-[#2874F0] text-white flex items-center justify-center font-bold text-xs">
                {storeName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className={`text-xs font-semibold truncate max-w-[130px] ${
                  theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                }`}>{storeName}</p>
                <p className="text-[10px] text-blue-500 font-mono">Pro Seller</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-955 rounded-xl transition-colors w-full text-left cursor-pointer"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

