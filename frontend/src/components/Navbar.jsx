import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UploadCloud, 
  PlusCircle, 
  LogOut, 
  User, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Search, 
  Bell, 
  ChevronDown, 
  Activity, 
  Command,
  ArrowRight
} from 'lucide-react';
import FlipkartLogo from './FlipkartLogo';

export default function Navbar({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = sessionStorage.getItem('seller_token');
  const storeName = sessionStorage.getItem('seller_store') || 'FashionCart Store';
  const isLoggedIn = !!token;

  // Dropdown & Modal States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Refs for click outside
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
    setIsSearchModalOpen(false);
  }, [location.pathname]);

  // Keyboard shortcut for Cmd/Ctrl+K search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchModalOpen(false);
        setIsDiagnosticsOpen(false);
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle Outside Clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    sessionStorage.removeItem('seller_token');
    sessionStorage.removeItem('seller_store');
    navigate('/');
    window.location.reload();
  };

  // Quick Navigation Items (Simple Plain Text Labels)
  const navItems = isLoggedIn ? [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Bulk Upload', path: '/upload' },
    { label: 'Add Listing', path: '/add-product' },
  ] : [
    { label: 'Home', path: '/' },
    { label: 'Features', path: '/#features' },
    { label: 'Architecture', path: '/#architecture' },
  ];

  // Simulated System Notifications
  const notifications = [
    {
      id: 1,
      title: 'Confidence Guardrail Triggered',
      desc: '2 items in recent batch scored < 60% confidence and require review.',
      time: '10m ago',
      type: 'warning',
      action: '/dashboard'
    },
    {
      id: 2,
      title: 'Gemini Vision AI Processed',
      desc: 'Image attributes auto-extracted for 12 new apparel catalog items.',
      time: '35m ago',
      type: 'success',
      action: '/dashboard'
    },
    {
      id: 3,
      title: 'Dynamic Pricing Engine Active',
      desc: 'Undercut competitor pricing by ₹15 on 4 electronic listings.',
      time: '1h ago',
      type: 'info',
      action: '/dashboard'
    }
  ];

  // Quick Command Options for Modal Search
  const quickActions = [
    { title: 'Go to Dashboard', icon: LayoutDashboard, path: '/dashboard', category: 'Navigation' },
    { title: 'Upload Bulk CSV / Excel File', icon: UploadCloud, path: '/upload', category: 'Inventory' },
    { title: 'Add Single Product Listing', icon: PlusCircle, path: '/add-product', category: 'Inventory' },
    { title: 'Toggle Theme (Dark / Light)', icon: Sun, action: toggleTheme, category: 'Preferences' },
    { title: 'View API & Queue System Status', icon: Activity, action: () => setIsDiagnosticsOpen(true), category: 'Diagnostics' },
  ];

  const filteredActions = quickActions.filter(action => 
    action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    action.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNavClick = (e, path) => {
    if (path.startsWith('/#')) {
      const id = path.replace('/#', '');
      if (location.pathname === '/') {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <>
      {/* Main Top Header Navbar - Minimal Clean Style */}
      <header className={`border-b sticky top-0 z-40 transition-colors duration-300 backdrop-blur-xl ${
        theme === 'dark' 
          ? 'border-slate-900 bg-black/90 text-slate-100' 
          : 'border-slate-200 bg-white/90 text-slate-800 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
          
          {/* Left Section: Mobile Menu Button & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 lg:hidden border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
              title="Open Navigation Drawer"
            >
              <Menu size={18} />
            </button>

            {/* Brand Logo & Genius Badge */}
            <Link to={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2 group">
              <FlipkartLogo theme={theme} className="h-6 w-6 sm:h-7 sm:w-7" textClass="text-lg sm:text-xl font-bold" />
              <span className="text-xs font-black tracking-widest text-[#2874F0] font-mono uppercase">
                GENIUS
              </span>
            </Link>
          </div>

          {/* Center Navigation Links (Simple Plain Text Navigation - No Pills/Borders/Icons) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wide">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={(e) => handleNavClick(e, item.path)}
                  className={`transition-colors py-1 ${
                    isActive
                      ? 'text-[#2874F0] font-bold'
                      : theme === 'dark'
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Search, Notifications, Theme, Profile */}
          <div className="flex items-center gap-3">

            {/* Cmd+K Quick Search Trigger */}
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  : 'border-slate-200 bg-slate-100/70 text-slate-500 hover:border-slate-300 hover:text-slate-800'
              }`}
            >
              <Search size={14} className="text-slate-400" />
              <span className="text-xs font-sans">Quick Command...</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-700/50 bg-slate-800/40 text-slate-400">
                <Command size={10} /> K
              </kbd>
            </button>

            {/* Notifications Bell Dropdown */}
            {isLoggedIn && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotificationsOpen(prev => !prev)}
                  className={`p-2 rounded-lg border relative transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'border-slate-800 hover:bg-slate-900 text-slate-300'
                      : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                  title="Notifications"
                >
                  <Bell size={16} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
                </button>

                {/* Notifications Dropdown Panel */}
                {isNotificationsOpen && (
                  <div className={`absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border shadow-2xl p-4 z-50 transition-all ${
                    theme === 'dark' ? 'bg-[#0d1322] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800/50">
                      <div className="flex items-center gap-2">
                        <Bell size={16} className="text-blue-500" />
                        <h4 className="text-xs font-bold font-mono uppercase tracking-wider">System Notifications</h4>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                        {notifications.length} NEW
                      </span>
                    </div>

                    <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {notifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setIsNotificationsOpen(false);
                            if (item.action) navigate(item.action);
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                            theme === 'dark'
                              ? 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/90'
                              : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-bold ${
                              item.type === 'warning' ? 'text-amber-400' : item.type === 'success' ? 'text-emerald-400' : 'text-blue-400'
                            }`}>
                              {item.title}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                          </div>
                          <p className="text-xs text-slate-400 leading-snug">{item.desc}</p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-800/50 text-center">
                      <Link
                        to="/dashboard"
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors inline-flex items-center gap-1"
                      >
                        View Dashboard Audit Logs <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                theme === 'dark' 
                  ? 'border-slate-800 hover:bg-slate-900 text-yellow-400 bg-slate-950/20' 
                  : 'border-slate-200 hover:bg-slate-100 text-blue-600 bg-slate-50'
              }`}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* User Account / Auth Buttons */}
            {isLoggedIn ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(prev => !prev)}
                  className={`flex items-center gap-2 p-1.5 pl-2.5 rounded-lg border transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'border-slate-800 hover:bg-slate-900 text-slate-200'
                      : 'border-slate-200 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-[#2874F0] text-white flex items-center justify-center text-xs font-bold">
                    {storeName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline-block text-xs font-semibold max-w-[100px] truncate">
                    {storeName}
                  </span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className={`absolute right-0 mt-3 w-60 rounded-2xl border shadow-2xl p-2 z-50 transition-all ${
                    theme === 'dark' ? 'bg-[#0d1322] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    <div className="px-3 py-2.5 border-b border-slate-800/50 mb-1">
                      <p className="text-xs font-bold truncate">{storeName}</p>
                      <p className="text-[10px] text-blue-500 font-mono font-semibold uppercase">Pro Seller Tier</p>
                    </div>

                    <Link
                      to="/dashboard"
                      className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                        theme === 'dark' ? 'hover:bg-slate-900 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <LayoutDashboard size={15} className="text-blue-500" />
                      Dashboard
                    </Link>

                    <Link
                      to="/upload"
                      className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                        theme === 'dark' ? 'hover:bg-slate-900 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <UploadCloud size={15} className="text-sky-500" />
                      Bulk Upload
                    </Link>

                    <Link
                      to="/add-product"
                      className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                        theme === 'dark' ? 'hover:bg-slate-900 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <PlusCircle size={15} className="text-emerald-500" />
                      Add Listing
                    </Link>

                    <div className="my-1 border-t border-slate-800/50" />

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors text-left cursor-pointer"
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 text-xs font-semibold">
                <Link
                  to="/login"
                  className={`transition-colors ${
                    theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#2874F0] hover:bg-[#1260e2] rounded-lg transition-all shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}

          </div>

        </div>
      </header>

      {/* Mobile Slide-Over Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className={`relative w-72 h-full flex flex-col justify-between p-6 shadow-2xl z-10 transition-colors duration-300 ${
            theme === 'dark' ? 'bg-[#0b0f19] text-slate-100 border-r border-slate-900' : 'bg-white text-slate-800 border-r border-slate-200'
          }`}>
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-800/50">
                <div className="flex items-center gap-2">
                  <FlipkartLogo theme={theme} className="h-6 w-6" textClass="text-lg" />
                  <span className="text-[10px] font-black tracking-widest text-[#2874F0] font-mono uppercase bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">GENIUS</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mobile Search Button */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSearchModalOpen(true);
                }}
                className={`w-full mt-4 flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs transition-all ${
                  theme === 'dark' ? 'border-slate-800 bg-slate-900/50 text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-600'
                }`}
              >
                <Search size={15} />
                <span>Search Commands...</span>
              </button>

              <nav className="mt-6 space-y-3">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={(e) => {
                        setIsMobileMenuOpen(false);
                        handleNavClick(e, item.path);
                      }}
                      className={`block text-sm font-semibold transition-all ${
                        isActive
                          ? 'text-[#2874F0] font-bold'
                          : theme === 'dark'
                          ? 'text-slate-400 hover:text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer */}
            <div className="pt-4 border-t border-slate-800/50 space-y-3">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-3 px-2 py-1">
                    <div className="w-8 h-8 rounded-full bg-[#2874F0] text-white flex items-center justify-center font-bold text-sm">
                      {storeName.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold">{storeName}</p>
                      <p className="text-[10px] text-blue-500 font-mono">Pro Seller Account</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors w-full text-left"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-center py-2.5 text-xs font-bold uppercase tracking-wider text-slate-300 border border-slate-800 rounded-xl"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-center py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#2874F0] rounded-xl"
                  >
                    Register Store
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Command Search Modal Overlay */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSearchModalOpen(false)}
          />
          <div className={`relative w-full max-w-lg rounded-2xl border shadow-2xl p-4 z-10 transition-all ${
            theme === 'dark' ? 'bg-[#0b0f19] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800/50">
              <Search size={18} className="text-blue-500" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type a command or search feature..."
                className="w-full bg-transparent focus:outline-none text-xs sm:text-sm font-sans"
              />
              <button 
                onClick={() => setIsSearchModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-3 max-h-64 overflow-y-auto space-y-1.5">
              {filteredActions.length > 0 ? (
                filteredActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setIsSearchModalOpen(false);
                        if (action.path) navigate(action.path);
                        if (action.action) action.action();
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all cursor-pointer text-left ${
                        theme === 'dark' 
                          ? 'border-slate-800/60 bg-slate-900/40 hover:bg-blue-600/20 hover:border-blue-500/30' 
                          : 'border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} className="text-blue-500" />
                        <span className="font-semibold">{action.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{action.category}</span>
                    </button>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  No matching commands found for "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* System Integrity Diagnostics Modal Overlay */}
      {isDiagnosticsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDiagnosticsOpen(false)}
          />
          <div className={`relative w-full max-w-md rounded-3xl border shadow-2xl p-6 z-10 transition-all ${
            theme === 'dark' ? 'bg-[#0b0f19] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/50">
              <div className="flex items-center gap-2.5">
                <Activity size={20} className="text-emerald-500" />
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider">System Integrity Status</h3>
              </div>
              <button 
                onClick={() => setIsDiagnosticsOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-950/10 flex items-center justify-between">
                <span className="text-slate-300">MongoDB Atlas Cluster</span>
                <span className="text-emerald-400 font-bold font-mono">ONLINE</span>
              </div>

              <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-950/10 flex items-center justify-between">
                <span className="text-slate-300">Upstash Redis Caching</span>
                <span className="text-emerald-400 font-bold font-mono">ACTIVE</span>
              </div>

              <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-950/10 flex items-center justify-between">
                <span className="text-slate-300">BullMQ Background Queue</span>
                <span className="text-emerald-400 font-bold font-mono">RUNNING</span>
              </div>

              <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-950/10 flex items-center justify-between">
                <span className="text-slate-300">Gemini 1.5 Flash Vision AI</span>
                <span className="text-emerald-400 font-bold font-mono">CONNECTED</span>
              </div>

              <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-950/10 flex items-center justify-between">
                <span className="text-slate-300">Socket.io WebSockets</span>
                <span className="text-emerald-400 font-bold font-mono">STREAMING</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/50 text-right">
              <button
                onClick={() => setIsDiagnosticsOpen(false)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#2874F0] rounded-xl hover:bg-blue-600 transition-colors"
              >
                Close Status
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
