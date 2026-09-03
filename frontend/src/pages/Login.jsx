import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import API from '../services/api';
import FlipkartLogo from '../components/FlipkartLogo';
import Navbar from '../components/Navbar';

export default function Login({ theme, toggleTheme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.success) {
        sessionStorage.setItem('seller_token', res.data.token);
        sessionStorage.setItem('seller_store', res.data.seller.storeName);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-black relative overflow-hidden transition-colors duration-500">
      {/* Top Navbar */}
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10 py-12">
        {/* Decorative Blur Spheres */}
        <div className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-blue-600/5 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45rem] h-[45rem] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none" />

        <div className="max-w-md w-full space-y-8 glass p-6 sm:p-10 rounded-3xl shadow-2xl relative z-10">
          
          {/* Flipkart GENIUS Logo Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <FlipkartLogo theme={theme} className="h-7 w-7" textClass="text-2xl" />
              <span className="text-[#2874F0] font-black text-lg ml-1 font-mono tracking-wider animate-pulse-slow">
                GENIUS
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
              Seller Sign In
            </h2>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">AI-Powered Bulk Product Uploads</p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl p-3 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    placeholder="seller@store.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <label className="flex items-center text-slate-400 cursor-pointer select-none">
                <input type="checkbox" className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-blue-500/30 mr-2" />
                Remember me
              </label>
              <a href="#" className="font-semibold text-blue-500 hover:text-blue-400 transition-colors">Forgot password?</a>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-blue-500/20 text-sm font-bold uppercase tracking-wider rounded-xl text-white bg-[#2874f0] hover:bg-[#1260e2] transition-all active:scale-[0.98] cursor-pointer shadow-md"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="text-center text-xs text-slate-400 mt-4 font-mono">
            <span>Don't have an account? </span>
            <Link to="/register" className="font-semibold text-blue-500 hover:text-blue-400 transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
