import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { User, Mail, Lock, ShieldCheck, UserPlus, AlertCircle } from 'lucide-react';

export default function Register({ onToggleView, onToast }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setLocalError('Please complete all registration fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      setLocalError('');
      await register(name, email, password, role);
      onToast(`Account created successfully as ${role}!`, 'success');
    } catch (err) {
      setLocalError(err.message || 'Registration failed. Check format rules.');
      onToast(err.message || 'Registration failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-none p-8 relative">
      <div className="absolute top-0 right-0 p-3 text-[10px] font-mono text-white/20 select-none">
        SIGNUP_V1
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-black font-display text-white uppercase tracking-tight">Create Identity</h2>
        <p className="text-sm text-white/50 mt-1">Register a unique client instance profile inside the ecosystem database.</p>
      </div>

      {localError && (
        <div className="mb-6 p-4 bg-red-950/40 border border-red-900/50 text-red-400 text-xs flex items-start gap-3 rounded-none font-mono">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{localError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] text-white/60 font-mono uppercase tracking-widest mb-1.5">
            Full Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 p-3 flex items-center pointer-events-none text-white/30">
              <User className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#1A1A1A] hover:bg-[#222] focus:bg-black text-sm text-white font-mono border border-white/10 focus:border-white rounded-none transition duration-200 outline-none"
              placeholder="Abhishek Chaudhari"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-white/60 font-mono uppercase tracking-widest mb-1.5">
            Email Identity
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 p-3 flex items-center pointer-events-none text-white/30">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#1A1A1A] hover:bg-[#222] focus:bg-black text-sm text-white font-mono border border-white/10 focus:border-white rounded-none transition duration-200 outline-none"
              placeholder="name@domain.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-white/60 font-mono uppercase tracking-widest mb-1.5">
            Passphrase Code
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 p-3 flex items-center pointer-events-none text-white/30">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#1A1A1A] hover:bg-[#222] focus:bg-black text-sm text-white font-mono border border-white/10 focus:border-white rounded-none transition duration-200 outline-none"
              placeholder="Min 6 characters"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-white/60 font-mono uppercase tracking-widest mb-1.5">
            Access Scope Assignment (RBAC Enforced)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 p-3 flex items-center pointer-events-none text-white/30">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#1A1A1A] hover:bg-[#222] focus:bg-black text-sm text-white font-mono border border-white/10 focus:border-white rounded-none transition duration-200 outline-none appearance-none"
            >
              <option value="user" className="bg-[#121212] text-white">Standard User (Individual Scope)</option>
              <option value="admin" className="bg-[#121212] text-white">Admin (Full Collection Clearance)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 bg-white hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider rounded-none transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
        >
          {isSubmitting ? (
            <span className="h-4 w-4 border-2 border-black/30 border-t-black rounded-none animate-spin" />
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              <span>Instantiate Identity</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/5 text-center">
        <p className="text-xs text-white/40 font-mono">
          Already registered?{' '}
          <button
            onClick={onToggleView}
            className="text-white font-black hover:text-emerald-400 outline-none uppercase tracking-widest text-xs transition duration-150 underline ml-1"
          >
            Authenticate Profile
          </button>
        </p>
      </div>
    </div>
  );
}