import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Sparkles, Image, CheckCircle, Database, Layers, ShieldAlert, Cpu, Sun, Moon } from 'lucide-react';
import FlipkartLogo from '../components/FlipkartLogo';
import { SparklesCore } from '../components/ui/sparkles';

export default function Landing({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const isLoggedIn = !!sessionStorage.getItem('seller_token');
  const storeName = sessionStorage.getItem('seller_store') || 'Seller Portal';

  const handleSignOut = () => {
    sessionStorage.removeItem('seller_token');
    sessionStorage.removeItem('seller_store');
    window.location.reload();
  };

  const partners = [
    { name: "Flipkart" },
    { name: "Amazon" },
    { name: "Meesho" },
    { name: "Myntra" },
    { name: "Nykaa" }
  ];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 flex flex-col justify-between relative overflow-hidden dot-grid ${
      theme === 'dark' 
        ? 'bg-black text-slate-100' 
        : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Space Theme Background Image */}
      <img
        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920"
        alt=""
        className="w-full h-full object-cover absolute top-0 right-0 bottom-0 left-0 -z-20 opacity-[0.18] dark:opacity-[0.25] pointer-events-none"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#000] -z-20" />
      
      {/* Background Brand Blue Glow Spheres (Dark Mode Only) */}
      {theme === 'dark' && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-blue-600/5 blur-[130px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[45rem] h-[45rem] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none" />
        </>
      )}

      {/* Navigation Header */}
      <header className={`border-b sticky top-0 z-50 transition-colors duration-350 backdrop-blur-md ${
        theme === 'dark' 
          ? 'border-slate-900 bg-black/60' 
          : 'border-slate-200 bg-white/70'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-2">
            <FlipkartLogo theme={theme} className="h-7 w-7" textClass="text-2xl" />
            <span className="text-[#2874F0] font-black text-lg ml-1 tracking-wider">
              GENIUS
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider">
            <Link to="/" className={theme === 'dark' ? 'text-white' : 'text-slate-950'}>Home</Link>
            {isLoggedIn && (
              <>
                <Link to="/dashboard" className="hover:text-blue-500 transition-colors">Dashboard</Link>
                <Link to="/upload" className="hover:text-blue-500 transition-colors">Bulk Upload</Link>
              </>
            )}
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-4">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all ${
                theme === 'dark' 
                  ? 'border-slate-800 hover:bg-slate-900 text-yellow-400' 
                  : 'border-slate-200 hover:bg-slate-100 text-blue-600'
              }`}
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <span className={`hidden sm:inline-block text-xs font-mono ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Store: <strong className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>{storeName}</strong>
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-xs font-bold uppercase tracking-wider text-rose-500 hover:text-rose-400 transition-colors border border-rose-950/40 bg-rose-950/10 rounded-xl px-4 py-2"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                  theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}>
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-4 py-2 border transition-all active:scale-[0.98] btn-classy btn-classy-primary"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        
        {/* Pulsing, animated fade-slide-in badge */}
        <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-[#2874f0]/10 dark:bg-blue-500/10 px-2.5 py-2 ring-1 ring-blue-500/20 backdrop-blur animate-fade-slide-in-1">
          <span className="inline-flex items-center text-[10px] font-extrabold text-white bg-[#2874f0] rounded-full py-0.5 px-2.5 font-mono uppercase tracking-wider">
            v1.1 RELEASE
          </span>
          <span className="text-xs font-semibold text-[#2874f0] dark:text-blue-400 font-sans">
            AI Dynamic Pricing Engine & Gemini 1.5 Flash Vision
          </span>
        </div>

        {/* Space-age title banner */}
        <div className="relative w-full max-w-4xl flex flex-col items-center justify-center">
          <h1 className="sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-4xl font-extrabold tracking-tight animate-fade-slide-in-2 font-sans relative z-20">
            <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>Enrich Your Catalog</span>
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Into the Future</span>
          </h1>

          {/* Sparkles Canvas Panel */}
          <div className="w-[40rem] max-w-full h-24 relative -mt-4 z-10 overflow-hidden">
            {/* Gradients */}
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent h-[2px] w-3/4 blur-sm" />
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px w-3/4" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

            {/* Sparkles Core */}
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1.2}
              particleDensity={800}
              className="w-full h-full"
              particleColor={theme === 'dark' ? '#FFFFFF' : '#2874F0'}
            />

            {/* Radial Gradient mask */}
            <div className={`absolute inset-0 w-full h-full [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)] ${
              theme === 'dark' ? 'bg-black' : 'bg-slate-50'
            }`}></div>
          </div>
        </div>

        {/* Prompt Slogan */}
        <p className={`sm:text-lg animate-fade-slide-in-3 text-base max-w-2xl mt-6 mx-auto ${
          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
        }`}>
          India's first MERN-stack seller dashboard that automates bulk inventory ingestion.
          Extract image attributes via Multimodal Vision, auto-generate SEO copy, and optimize pricing in real-time.
        </p>

        {/* User Badges Group & Live Stats */}
        <div className="flex flex-col items-center gap-3.5 mt-8 animate-fade-slide-in-3">
          <div className="flex -space-x-2">
            <img className="w-8 h-8 rounded-full border-2 border-black object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Seller 1" />
            <img className="w-8 h-8 rounded-full border-2 border-black object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Seller 2" />
            <img className="w-8 h-8 rounded-full border-2 border-black object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Seller 3" />
            <img className="w-8 h-8 rounded-full border-2 border-black object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" alt="Seller 4" />
          </div>
          <div className={`text-[11px] font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Catalog Views: <strong className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>8,98,012</strong> | Enriched Drafts: <strong className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>1,65,730</strong>
          </div>
          {/* Glowing Status Badge */}
          <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-[10px] font-mono font-bold tracking-wider uppercase shadow-sm mt-1 ${
            theme === 'dark' 
              ? 'border-sky-500/20 bg-sky-950/10 text-sky-400' 
              : 'border-sky-200 bg-sky-50 text-sky-600'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
            Background Workers Active
          </div>
        </div>

        {/* Queue Configs Grid */}
        <div className={`flex items-center gap-8 justify-center border-y py-5 my-10 font-mono text-xs w-full max-w-md animate-fade-slide-in-4 ${
          theme === 'dark' ? 'border-slate-900' : 'border-slate-200'
        }`}>
          <div className="text-left">
            <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-0.5">QUEUE CONCURRENCY</span>
            <span className="text-emerald-500 font-bold">BULLMQ ACTIVE</span>
          </div>
          <div className={`h-8 w-px ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-200'}`} />
          <div className="text-left">
            <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-0.5">DATA BUFFERING</span>
            <span className="text-sky-500 font-bold">REDIS MEMORY</span>
          </div>
        </div>

        {/* Action CTAs - Restored Side-by-Side buttons! */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto animate-fade-slide-in-4">
          {isLoggedIn ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 btn-classy btn-classy-primary text-xs"
            >
              Go to Dashboard <ArrowRight size={14} className="ml-1" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 btn-classy btn-classy-primary text-xs animate-pulse-slow"
              >
                Register Store <ArrowRight size={14} className="ml-1" />
              </Link>
              <Link
                to="/login"
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-xs border rounded-xl transition-all active:scale-[0.98] btn-classy ${
                  theme === 'dark' 
                    ? 'bg-slate-950/60 border-slate-800 hover:bg-slate-900 text-slate-350 hover:text-white' 
                    : 'bg-white border-slate-205 hover:bg-slate-50 text-slate-700 shadow-sm'
                }`}
              >
                Seller Sign In
              </Link>
            </>
          )}
        </div>
        {/* Partners Integration Grid */}
        <div className="mx-auto mt-16 max-w-5xl w-full">
          <p className="animate-fade-slide-in-1 text-[10px] font-bold font-mono tracking-widest text-[#2874f0] dark:text-blue-450 uppercase text-center opacity-80">
            OPTIMIZED FOR LEADING E-COMMERCE CHANNELS
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 animate-fade-slide-in-2 mt-6 items-center justify-items-center gap-4">
            {partners.map((partner, index) => (
              <div
                key={index}
                className={`px-5 py-2.5 rounded-xl border text-[11px] font-mono font-bold tracking-widest uppercase transition-all duration-300 opacity-70 hover:opacity-100 hover:scale-[1.03] cursor-default bg-slate-900/40 backdrop-blur-md ${
                  theme === 'dark' 
                    ? 'border-slate-800 text-slate-300' 
                    : 'border-slate-200 text-slate-600 shadow-sm'
                }`}
              >
                {partner.name}
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Cyber Waveforms Overlay - Custom SVG mesh wireframe waves */}
      <div className={`w-full h-40 absolute bottom-0 left-0 right-0 pointer-events-none select-none overflow-hidden z-0 transition-opacity duration-500 ${
        theme === 'dark' ? 'opacity-35' : 'opacity-15'
      }`}>
        <svg className="w-full h-full text-purple-600/40" viewBox="0 0 1440 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-100,100 C150,150 250,50 500,120 C750,190 850,80 1100,140 C1350,200 1450,110 1600,150 L1600,250 L-100,250 Z" stroke="url(#purpleGrad)" strokeWidth="2" />
          <path d="M-100,130 C180,180 280,30 480,140 C680,250 820,30 1120,160 C1420,290 1480,80 1600,120 L1600,250 L-100,250 Z" stroke="url(#blueGrad)" strokeWidth="1.5" />
          <defs>
            <linearGradient id="purpleGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="blueGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Features Detail cards */}
      <section className={`relative border-t py-16 px-6 z-10 transition-colors duration-500 ${
        theme === 'dark' ? 'bg-black/90 border-slate-950' : 'bg-slate-100/50 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h3 className={`text-xl font-bold font-mono tracking-tight uppercase ${
              theme === 'dark' ? 'text-white neon-glow-text-blue' : 'text-slate-900'
            }`}>
              &lt;Engine: Capabilities&gt;
            </h3>
            <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">High throughput async validation specs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className={`border p-8 rounded-2xl space-y-4 hover:border-purple-500/20 hover:shadow-[0_0_15px_rgba(168,85,247,0.05)] transition-all ${
              theme === 'dark' 
                ? 'bg-[#030712]/90 border-slate-900' 
                : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center">
                <Cpu size={18} />
              </div>
              <h4 className={`font-bold text-sm font-mono uppercase tracking-wider ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>AI SEO Copywriter</h4>
              <p className="text-slate-500 text-xs leading-relaxed font-mono">
                Leverages Gemini/Claude APIs to automatically compose high-impact titles, search keywords, and 4 bullet description copy points.
              </p>
            </div>

            {/* Feature 2 */}
            <div className={`border p-8 rounded-2xl space-y-4 hover:border-blue-500/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.05)] transition-all ${
              theme === 'dark' 
                ? 'bg-[#030712]/90 border-slate-900' 
                : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center">
                <Image size={18} />
              </div>
              <h4 className={`font-bold text-sm font-mono uppercase tracking-wider ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>Vision Attribute Parser</h4>
              <p className="text-slate-500 text-xs leading-relaxed font-mono">
                Analyzes item photographs on worker threads to extract color matching, fabric textures, and category patterns automatically.
              </p>
            </div>

            {/* Feature 3 */}
            <div className={`border p-8 rounded-2xl space-y-4 hover:border-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.05)] transition-all ${
              theme === 'dark' 
                ? 'bg-[#030712]/90 border-slate-900' 
                : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <ShieldAlert size={18} />
              </div>
              <h4 className={`font-bold text-sm font-mono uppercase tracking-wider ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>Confidence Thresholds</h4>
              <p className="text-slate-500 text-xs leading-relaxed font-mono">
                Enforces a 60% confidence gate. Anything flagged sits in a premium AG Grid audit dashboard awaiting seller review before publishing.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t py-8 text-center text-[10px] font-mono tracking-widest z-10 transition-colors duration-500 ${
        theme === 'dark' ? 'bg-black border-slate-950 text-slate-600' : 'bg-slate-200/50 border-slate-200 text-slate-500'
      }`}>
        <p>© 2026 FLIPKART-GENIUS SELLER CATALOG PIPELINE. DEMO AND INTERVIEW SANDBOX ONLINE.</p>
      </footer>

    </div>
  );
}
