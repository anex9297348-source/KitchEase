import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, Phone, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import type { UserRole } from '../../types.ts';

export const AuthModal: React.FC = () => {
  const { authModalOpen, authModalMode, authModalRole, closeAuthModal, login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMode(authModalMode);
    setRole(authModalRole);
    setError(null);
  }, [authModalMode, authModalRole, authModalOpen]);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password, phone, role);
      }
      closeAuthModal();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFillAdmin = () => {
    setMode('login');
    setEmail('admin@kitchease.com');
    setPassword('admin123');
    setError(null);
  };

  const handleQuickFillCustomer = () => {
    setMode('login');
    setEmail('sarah.cooks@example.com');
    setPassword('customer123');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#151515] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-white/10 shadow-2xl relative space-y-6 animate-in fade-in zoom-in-95 duration-200 text-[#EAEAEA]">
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 text-white/40 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center mx-auto mb-1 shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-display text-2xl font-normal text-[#EAEAEA]">
            {mode === 'login' ? 'Sign In to KitchEase' : 'Create an Account'}
          </h2>
          <p className="text-xs text-white/50 font-light">
            {mode === 'login'
              ? 'Access your orders, track deliveries, or manage the store'
              : 'Join to track orders and save shipping preferences'}
          </p>
        </div>

        {/* Quick Demo Fill Pills */}
        <div className="p-3 bg-[#1A1A1A] rounded-2xl border border-white/10 space-y-2">
          <span className="text-[10px] font-semibold text-[#D4AF37] uppercase tracking-wider block text-center">
            ⚡ Demo Credentials Quick Fill:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleQuickFillAdmin}
              className="px-2.5 py-1.5 bg-[#121212] border border-white/15 rounded-xl text-[11px] font-medium text-white/90 hover:bg-[#D4AF37] hover:text-black transition-colors cursor-pointer"
            >
              👑 Owner Admin
            </button>
            <button
              type="button"
              onClick={handleQuickFillCustomer}
              className="px-2.5 py-1.5 bg-[#121212] border border-white/15 rounded-xl text-[11px] font-medium text-white/90 hover:bg-[#D4AF37] hover:text-black transition-colors cursor-pointer"
            >
              🛒 Demo Customer
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Phone (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-md bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#E5C158] transition-colors shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center pt-2">
          {mode === 'login' ? (
            <p className="text-xs text-white/50 font-light">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-medium text-[#D4AF37] hover:underline cursor-pointer ml-1"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p className="text-xs text-white/50 font-light">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-medium text-[#D4AF37] hover:underline cursor-pointer ml-1"
              >
                Log In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
