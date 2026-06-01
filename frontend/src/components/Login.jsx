import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export default function Login({ onToggleView, onToast }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Please complete all credential fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      setLocalError('');
      await login(email, password);
      onToast('Successfully logged in!', 'success');
    } catch (err) {
      setLocalError(err.message || 'Verification failed. Please review your details.');
      onToast(err.message || 'Login failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-none p-8 relative">
      <div className="absolute top-0 right-0 p-3 text-[10px] font-mono text-white/20 select-none">
        V1.0.0
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-black font-display text-white uppercase tracking-tight">Account Login</h2>
        <p className="text-sm text-white/50 mt-1">Authenticate to access protected workspace management channels.</p>
      </div>

      {localError && (
        <div className="mb-6 p-4 bg-red-950/40 border border-red-900/50 text-red-400 text-xs flex items-start gap-3 rounded-none font-mono">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{localError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] text-white/60 font-mono uppercase tracking-widest mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] hover:bg-[#222] focus:bg-black text-sm text-white font-mono border border-white/10 focus:border-white rounded-none transition duration-200 outline-none"
              placeholder="name@domain.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-white/60 font-mono uppercase tracking-widest mb-1.5">
            Account Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] hover:bg-[#222] focus:bg-black text-sm text-white font-mono border border-white/10 focus:border-white rounded-none transition duration-200 outline-none"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-white hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider rounded-none transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="h-4 w-4 border-2 border-black/30 border-t-black rounded-none animate-spin" />
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              <span>Verify Access Gateway</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/5 text-center">
        <p className="text-xs text-white/40 font-mono">
          UNAUTHORIZED?{' '}
          <button
            onClick={onToggleView}
            className="text-white font-black hover:text-emerald-400 outline-none uppercase tracking-widest text-xs transition duration-150 underline ml-1"
          >
            Create Credentials
          </button>
        </p>
      </div>
    </div>
  );
}