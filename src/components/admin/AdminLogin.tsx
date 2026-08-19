import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { api, setAuthToken } from '../../lib/api';
import type { AdminUser } from '../../types';

interface AdminLoginProps {
  onSuccess: (user: AdminUser) => void;
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBackToStore }) => {
  const [email, setEmail] = useState('admin@mini2k.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      if (res.success && res.user) {
        setAuthToken(res.token);
        onSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1C1C1C] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-[#FAF9F6]">
      
      {/* Return to Storefront button */}
      <div className="max-w-md mx-auto w-full mb-6">
        <button
          onClick={onBackToStore}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#999] hover:text-[#FAF9F6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Storefront</span>
        </button>
      </div>

      <div className="max-w-md mx-auto w-full bg-[#2A2A2A] rounded-3xl p-8 sm:p-10 border border-[#3D3D3D] shadow-2xl space-y-8">
        
        {/* Brand Monogram */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#1C1C1C] border border-[#C5A059]/40 flex items-center justify-center mx-auto text-[#C5A059] shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-3xl font-light italic tracking-tight text-[#FAF9F6]">
            Atelier Portal
          </h2>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#999]">
            mini2k Store & Inventory Suite
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider font-semibold text-[#CCC]">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#777] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mini2k.com"
                className="w-full pl-10 pr-4 py-3 bg-[#1C1C1C] border border-[#3D3D3D] rounded-xl text-sm text-[#FAF9F6] placeholder-[#666] focus:outline-none focus:border-[#C5A059] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider font-semibold text-[#CCC]">
              Security Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#777] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[#1C1C1C] border border-[#3D3D3D] rounded-xl text-sm text-[#FAF9F6] placeholder-[#666] focus:outline-none focus:border-[#C5A059] transition-colors"
              />
            </div>
          </div>

          <button
            id="admin-login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#C5A059] hover:bg-[#B59049] text-[#1C1C1C] rounded-full font-semibold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Enter Atelier Suite</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="p-4 rounded-xl bg-[#1C1C1C] border border-[#3D3D3D] text-[11px] text-[#999] space-y-1">
          <div className="text-[#C5A059] font-semibold uppercase tracking-wider">Default Seed Credentials:</div>
          <div>Email: <code className="text-[#FAF9F6]">admin@mini2k.com</code></div>
          <div>Password: <code className="text-[#FAF9F6]">admin123</code></div>
        </div>

      </div>
    </div>
  );
};
