'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Delete,
  LogOut,
  Coffee,
} from 'lucide-react';
import { StaffRole } from '@/lib/security/rbac';

interface StaffSessionData {
  token: string;
  staff: {
    id: string;
    name: string;
    role: StaffRole;
    restaurantId: string;
  };
}

interface StaffAuthGuardProps {
  requiredRoles: StaffRole[];
  terminalTitle: string;
  children: React.ReactNode;
}

export const StaffAuthGuard: React.FC<StaffAuthGuardProps> = ({
  requiredRoles,
  terminalTitle,
  children,
}) => {
  const [session, setSession] = useState<StaffSessionData | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const storageKey = `brew_studio_staff_session`;
  const [authMode, setAuthMode] = useState<'pin' | 'developer'>('pin');
  const [devEmail, setDevEmail] = useState<string>('Vaibhavgupta1148@gmail.com');
  const [devPassword, setDevPassword] = useState<string>('');

  // Check existing session or auto-unlock
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed: StaffSessionData = JSON.parse(saved);
        if (
          parsed?.token &&
          parsed?.staff?.role &&
          (requiredRoles.includes(parsed.staff.role) || parsed.staff.role === 'platform_operator')
        ) {
          setSession(parsed);
          setIsChecking(false);
          return;
        }
      }

      // Check if URL specifies auto-unlock for seamless demo inspection
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('unlock') === 'true' || params.get('demo') === 'true' || params.get('role') === 'chef') {
          handleVerifyPin('1234');
          return;
        }
      }
    } catch {
      // Ignore
    } finally {
      setIsChecking(false);
    }
  }, [requiredRoles]);

  // Submit Developer Email & Password
  const handleDeveloperLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devEmail || !devPassword) {
      setError('Please provide developer email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/developer-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: devEmail,
          password: devPassword,
        }),
      });

      const data = await res.json();

      if (data.success && data.developer) {
        const sessionData: StaffSessionData = {
          token: data.token,
          staff: {
            id: data.developer.id,
            name: data.developer.name,
            role: data.developer.role,
            restaurantId: 'a0000000-0000-0000-0000-000000000001',
          },
        };
        sessionStorage.setItem(storageKey, JSON.stringify(sessionData));
        setSession(sessionData);
        setDevPassword('');
      } else {
        setError(data.error || 'Invalid developer credentials.');
      }
    } catch {
      setError('Failed to reach authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit PIN
  const handleVerifyPin = async (inputPin: string) => {
    if (inputPin.length < 4) return;
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/staff-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: 'a0000000-0000-0000-0000-000000000001',
          pin: inputPin,
        }),
      });

      const data = await res.json();

      if (data.success && data.staff) {
        if (!requiredRoles.includes(data.staff.role) && data.staff.role !== 'platform_operator') {
          setError(
            `Access Denied: Your role (${data.staff.role}) is not authorized for this terminal.`
          );
          setPin('');
          return;
        }

        const sessionData: StaffSessionData = {
          token: data.token,
          staff: data.staff,
        };
        sessionStorage.setItem(storageKey, JSON.stringify(sessionData));
        setSession(sessionData);
        setPin('');
      } else {
        setError(data.error || 'Invalid 4-digit PIN.');
        setPin('');
      }
    } catch {
      setError('Connection failed. Please check network.');
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 4 && !isLoading) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        handleVerifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleLockTerminal = () => {
    sessionStorage.removeItem(storageKey);
    setSession(null);
    setPin('');
    setDevPassword('');
  };

  // Keyboard support for physical keyboards
  useEffect(() => {
    if (session || authMode === 'developer') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, session, isLoading, authMode]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#140F0D] flex items-center justify-center p-4">
        <div className="w-8 h-8 rounded-full border-2 border-[#C87D4B] border-t-transparent animate-spin" />
      </div>
    );
  }

  // If unlocked, render children with a compact security header
  if (session) {
    return (
      <div>
        {/* Terminal Header Bar */}
        <div className="bg-[#1C1613] border-b border-white/10 px-4 py-1.5 flex items-center justify-between text-xs font-mono no-print">
          <div className="flex items-center gap-2 text-[#4ADE80]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              Authenticated: <strong>{session.staff.name}</strong> ({session.staff.role.toUpperCase()})
            </span>
          </div>

          <button
            onClick={handleLockTerminal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 hover:text-red-300 transition-colors"
            title="Lock terminal and require PIN to re-enter"
          >
            <Lock className="w-3 h-3" />
            <span>Lock Terminal</span>
          </button>
        </div>

        {children}
      </div>
    );
  }

  // Render Security Lock Screen
  return (
    <div className="min-h-screen bg-[#140F0D] text-[#F8F4ED] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl bg-[#1C1613] border border-[#C87D4B]/30 p-6 sm:p-8 shadow-2xl space-y-5 text-center">
        {/* Lock Icon */}
        <div className="mx-auto w-16 h-16 rounded-3xl bg-[#C87D4B]/15 border border-[#C87D4B]/30 flex items-center justify-center text-[#D49A6A] shadow-inner">
          <Lock className="w-8 h-8 animate-pulse" />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold font-editorial text-[#FAF6F0]">
            {terminalTitle}
          </h1>
          <p className="text-xs text-[#8C7E74] font-mono">
            {authMode === 'pin' ? 'Staff Terminal PIN Pad' : 'Developer & Operator Portal'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-1 bg-white/5 rounded-2xl border border-white/10 text-xs font-mono">
          <button
            onClick={() => {
              setAuthMode('pin');
              setError('');
            }}
            className={`py-1.5 rounded-xl transition-all font-medium ${
              authMode === 'pin'
                ? 'bg-[#C97943] text-white shadow-sm'
                : 'text-[#8C7E74] hover:text-[#FAF6F0]'
            }`}
          >
            Staff PIN
          </button>
          <button
            onClick={() => {
              setAuthMode('developer');
              setError('');
            }}
            className={`py-1.5 rounded-xl transition-all font-medium ${
              authMode === 'developer'
                ? 'bg-[#C97943] text-white shadow-sm'
                : 'text-[#8C7E74] hover:text-[#FAF6F0]'
            }`}
          >
            Developer Login
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-mono flex items-center justify-center gap-1.5 animate-shake">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {authMode === 'pin' ? (
          <>
            {/* 1-Click Instant Demo Unlock */}
            <button
              type="button"
              onClick={() => handleVerifyPin('1234')}
              disabled={isLoading}
              className="w-full py-2.5 px-3 rounded-xl bg-[#C97943] hover:bg-[#B86B36] active:scale-98 text-white text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Unlocking...' : '1-Click Demo Unlock (PIN: 1234)'}</span>
            </button>

            {/* PIN Dots Display */}
            <div className="flex items-center justify-center gap-4 py-1">
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = pin.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      isFilled
                        ? 'bg-[#C87D4B] scale-125 shadow-md shadow-[#C87D4B]/50'
                        : 'bg-white/10 border border-white/20'
                    }`}
                  />
                );
              })}
            </div>

            {/* Numeric Touch Keypad */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleKeyPress(digit)}
                  disabled={isLoading}
                  className="h-14 rounded-2xl bg-white/5 hover:bg-[#C87D4B]/20 active:bg-[#C87D4B]/40 border border-white/10 hover:border-[#C87D4B]/40 text-lg font-mono font-bold text-[#FAF6F0] transition-all flex items-center justify-center active:scale-95 disabled:opacity-50"
                >
                  {digit}
                </button>
              ))}

              <button
                onClick={handleClear}
                disabled={isLoading}
                className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#8C7E74] hover:text-white transition-all flex items-center justify-center"
              >
                Clear
              </button>

              <button
                onClick={() => handleKeyPress('0')}
                disabled={isLoading}
                className="h-14 rounded-2xl bg-white/5 hover:bg-[#C87D4B]/20 active:bg-[#C87D4B]/40 border border-white/10 hover:border-[#C87D4B]/40 text-lg font-mono font-bold text-[#FAF6F0] transition-all flex items-center justify-center active:scale-95 disabled:opacity-50"
              >
                0
              </button>

              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#8C7E74] hover:text-white transition-all flex items-center justify-center"
                title="Backspace"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          /* Developer Email & Encrypted Password Login Form */
          <form onSubmit={handleDeveloperLogin} className="space-y-3.5 text-left pt-2">
            <div>
              <label className="block text-[11px] font-mono text-[#8C7E74] uppercase tracking-wider mb-1">
                Developer Email
              </label>
              <input
                type="email"
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#C97943] text-sm text-[#FAF6F0] font-mono outline-none transition-colors"
                placeholder="developer@domain.com"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#8C7E74] uppercase tracking-wider mb-1">
                Encrypted Password
              </label>
              <input
                type="password"
                value={devPassword}
                onChange={(e) => setDevPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#C97943] text-sm text-[#FAF6F0] font-mono outline-none transition-colors"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#C97943] hover:bg-[#D49A6A] active:scale-[0.99] text-[#140F0D] font-mono font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg shadow-[#C97943]/20 mt-2"
            >
              {isLoading ? 'Verifying Encrypted Credentials...' : 'Sign In as Developer'}
            </button>
          </form>
        )}

        {/* Demo Credentials Hint & Return Link */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          <div className="text-[11px] font-mono text-[#D49A6A] bg-[#C87D4B]/10 py-1.5 px-3 rounded-xl border border-[#C87D4B]/20">
            {authMode === 'pin' ? (
              <span>Staff PIN: <strong>1234</strong> • Dev PIN: <strong>2512</strong></span>
            ) : (
              <span>Dev: <strong>Vaibhavgupta1148@gmail.com</strong></span>
            )}
          </div>

          <div>
            <Link
              href="/menu?table=04"
              className="inline-flex items-center gap-1.5 text-xs text-[#8C7E74] hover:text-[#FAF6F0] transition-colors font-mono"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Customer Menu</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

