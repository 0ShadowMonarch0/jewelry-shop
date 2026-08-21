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
    <div className="min-h-screen bg-[#1C1C1C] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-[#F4F4F3]">
      
      {/* Return to Storefront button */}
      <div className="max-w-md mx-auto w-full mb-6">
        <button
          onClick={onBackToStore}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#8C8C8C] hover:text-[#F4F4F3] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Storefront</span>
        </button>
      </div>

      <div className="max-w-md mx-auto w-full bg-[#2A2A2A] p-8 sm:p-10 border border-[#3D3D3D] shadow-2xl space-y-8">
        
        {/* Brand Monogram */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#1C1C1C] border border-[#8A9099]/40 flex items-center justify-center mx-auto text-[#8A9099] shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-3xl font-light italic tracking-tight text-[#F4F4F3]">
            Admin Portal
          </h2>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#8C8C8C]">
            mini2k Store & Inventory Suite
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-start gap-2.5">
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
              <Mail className="w-4 h-4 text-[#757575] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mini2k.com"
                className="w-full pl-10 pr-4 py-3 bg-[#1C1C1C] border border-[#3D3D3D] text-sm text-[#F4F4F3] placeholder-[#666] focus:outline-none focus:border-[#8A9099] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider font-semibold text-[#CCC]">
              Security Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#757575] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[#1C1C1C] border border-[#3D3D3D] text-sm text-[#F4F4F3] placeholder-[#666] focus:outline-none focus:border-[#8A9099] transition-colors"
              />
            </div>
          </div>

          <button
            id="admin-login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#8A9099] hover:bg-[#7D828A] text-[#1C1C1C] font-semibold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Enter</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
