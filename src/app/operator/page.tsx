'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Building2,
  PlusCircle,
  Power,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Activity,
  Lock,
  LogOut,
  KeyRound,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

interface Tenant {
  id: string;
  slug: string;
  name: string;
  upiVpa: string;
  phone: string;
  address: string;
  subscriptionStatus: 'active' | 'suspended' | 'expired';
  subscriptionExpiresAt: string;
  taxRate: number;
}

export default function OperatorConsole() {
  const [session, setSession] = useState<{ name: string; email: string; role: string } | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loginEmail, setLoginEmail] = useState('Vaibhavgupta1148@gmail.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    upiVpa: '',
    phone: '',
    address: '',
    gstin: '',
    fssai: '',
    taxRate: '5.0',
  });

  const storageKey = 'brew_studio_staff_session';

  // Check developer session
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.staff?.role === 'platform_operator') {
          setSession({
            name: parsed.staff.name,
            email: 'Vaibhavgupta1148@gmail.com',
            role: parsed.staff.role,
          });
        }
      }
    } catch {
      // Ignore
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  const handleDeveloperLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch('/api/auth/developer-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (data.success && data.developer) {
        const sessionData = {
          token: data.token,
          staff: {
            id: data.developer.id,
            name: data.developer.name,
            role: data.developer.role,
            restaurantId: 'a0000000-0000-0000-0000-000000000001',
          },
        };
        sessionStorage.setItem(storageKey, JSON.stringify(sessionData));
        setSession({
          name: data.developer.name,
          email: data.developer.email,
          role: data.developer.role,
        });
        setLoginPassword('');
      } else {
        setLoginError(data.error || 'Invalid developer credentials.');
      }
    } catch {
      setLoginError('Authentication service unreachable.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = () => {
    sessionStorage.removeItem(storageKey);
    setSession(null);
    setLoginPassword('');
  };

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/operator/tenants');
      const data = await res.json();
      if (data.success) {
        setTenants(data.tenants);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchTenants();
    }
  }, [session]);

  const handleAction = async (tenantId: string, action: 'suspend' | 'activate' | 'renew') => {
    try {
      const res = await fetch('/api/operator/tenants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, action }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(data.message);
        fetchTenants();
      }
    } catch {
      setFeedback('Failed to update tenant status.');
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/operator/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Tenant "${formData.name}" onboarded successfully.`);
        setShowAddModal(false);
        setFormData({
          name: '',
          slug: '',
          upiVpa: '',
          phone: '',
          address: '',
          gstin: '',
          fssai: '',
          taxRate: '5.0',
        });
        fetchTenants();
      } else {
        setFeedback(data.error || 'Failed to onboard tenant.');
      }
    } catch {
      setFeedback('Network error while onboarding tenant.');
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#140F0D] flex items-center justify-center p-4">
        <div className="w-8 h-8 rounded-full border-2 border-[#C87D4B] border-t-transparent animate-spin" />
      </div>
    );
  }

  // Developer Login Screen if unauthenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-[#140F0D] text-[#F8F4ED] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl bg-[#1C1613] border border-[#C87D4B]/30 p-6 sm:p-8 shadow-2xl space-y-6 text-center">
          {/* Superuser Lock Badge */}
          <div className="mx-auto w-16 h-16 rounded-3xl bg-[#C87D4B]/15 border border-[#C87D4B]/30 flex items-center justify-center text-[#D49A6A] shadow-inner">
            <KeyRound className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4ADE80]/15 text-[#4ADE80] font-mono text-[11px] font-bold border border-[#4ADE80]/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Platform Operator Node</span>
            </div>
            <h1 className="text-2xl font-bold font-editorial text-[#FAF6F0]">
              Developer Master Gateway
            </h1>
            <p className="text-xs text-[#8C7E74] font-mono">
              Restricted Area • Requires Developer Credentials
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-mono flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleDeveloperLogin} className="space-y-4 text-left pt-1">
            <div>
              <label className="block text-[11px] font-mono text-[#8C7E74] uppercase tracking-wider mb-1">
                Lead Developer Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#C97943] text-sm text-[#FAF6F0] font-mono outline-none transition-colors"
                placeholder="developer@domain.com"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#8C7E74] uppercase tracking-wider mb-1">
                Encrypted Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#C97943] text-sm text-[#FAF6F0] font-mono outline-none transition-colors"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-xl bg-[#C97943] hover:bg-[#D49A6A] active:scale-[0.99] text-[#140F0D] font-mono font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg shadow-[#C97943]/20 mt-2"
            >
              {isLoggingIn ? 'Verifying Encrypted Credentials...' : 'Sign In to Master Node'}
            </button>
          </form>

          {/* Credentials Info & Security Protocol */}
          <div className="pt-3 border-t border-white/10 space-y-2 text-left">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="text-[11px] font-mono text-[#D49A6A]">
                Configured Developer: <strong>Vaibhavgupta1148@gmail.com</strong>
              </div>
              <div className="text-[10px] font-mono text-[#8C7E74]">
                Encryption: <strong>Node.js Scrypt + 128-bit Salt</strong> (Zero Plaintext Storage)
              </div>
            </div>

            <div className="text-center pt-1">
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
  }

  return (
    <div className="min-h-screen bg-[#140F0D] text-[#F8F4ED] p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="rounded-3xl bg-[#1C1613] border border-[#C87D4B]/30 p-6 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#C87D4B]/20 border border-[#C87D4B]/40 flex items-center justify-center text-[#D49A6A]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-editorial text-[#FAF6F0]">
                  Platform Operator Console
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#4ADE80]/15 text-[#4ADE80] font-mono text-[10px] font-bold border border-[#4ADE80]/30">
                  SaaS Master Node
                </span>
              </div>
              <p className="text-xs text-[#8C7E74] font-mono mt-0.5">
                Developer: <strong className="text-[#FAF6F0]">{session.name}</strong> ({session.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-mono transition-colors border border-red-500/30"
              title="Sign out of developer console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            <a
              href="/api/health"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-mono transition-colors border border-white/10"
            >
              <Activity className="w-3.5 h-3.5 text-[#4ADE80]" />
              <span>Health Check</span>
            </a>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C97943] hover:bg-[#D49A6A] text-[#140F0D] text-xs font-mono font-bold transition-all shadow-md shadow-[#C97943]/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Onboard Restaurant</span>
            </button>
          </div>
        </header>

        {/* Feedback Alert */}
        {feedback && (
          <div className="p-4 rounded-2xl bg-[#C87D4B]/15 border border-[#C87D4B]/40 text-[#D49A6A] text-xs font-mono flex items-center justify-between">
            <span>{feedback}</span>
            <button onClick={() => setFeedback(null)} className="text-white/60 hover:text-white">✕</button>
          </div>
        )}

        {/* SaaS Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#1C1613] border border-white/10 space-y-1">
            <div className="text-[11px] font-mono text-[#8C7E74] uppercase tracking-wider">Active Restaurants</div>
            <div className="text-3xl font-bold font-editorial text-[#4ADE80]">
              {tenants.filter((t) => t.subscriptionStatus === 'active').length}
            </div>
            <div className="text-[11px] text-[#8C7E74]">Paying commercial accounts</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#1C1613] border border-white/10 space-y-1">
            <div className="text-[11px] font-mono text-[#8C7E74] uppercase tracking-wider">Annualized Run Rate</div>
            <div className="text-3xl font-bold font-editorial text-[#D49A6A]">
              ₹{(tenants.filter((t) => t.subscriptionStatus === 'active').length * 9000).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#8C7E74]">Based on ₹9,000/yr plan</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#1C1613] border border-white/10 space-y-1">
            <div className="text-[11px] font-mono text-[#8C7E74] uppercase tracking-wider">Avg Cloud Cost / Tenant</div>
            <div className="text-3xl font-bold font-editorial text-[#FAF6F0]">
              &lt; ₹300 / yr
            </div>
            <div className="text-[11px] text-[#4ADE80] font-mono">&gt; 96% Gross Profit Margin</div>
          </div>
        </div>

        {/* Tenant Table */}
        <div className="rounded-3xl bg-[#1C1613] border border-white/10 overflow-hidden shadow-xl">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#C87D4B]" />
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-[#FAF6F0]">
                Onboarded Restaurant Portfolio
              </h2>
            </div>
            <span className="text-xs font-mono text-[#8C7E74]">
              Total: {tenants.length} tenants
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/5 text-[#8C7E74] border-b border-white/5">
                <tr>
                  <th className="p-4">Restaurant &amp; Slug</th>
                  <th className="p-4">UPI VPA</th>
                  <th className="p-4">Phone / City</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Expiry Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#8C7E74]">
                      Loading tenant database...
                    </td>
                  </tr>
                ) : tenants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#8C7E74]">
                      No restaurants onboarded yet.
                    </td>
                  </tr>
                ) : (
                  tenants.map((t) => (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-[#FAF6F0]">{t.name}</div>
                        <div className="text-[11px] text-[#C87D4B]">slug: /{t.slug}</div>
                      </td>
                      <td className="p-4 text-white/90">{t.upiVpa}</td>
                      <td className="p-4 text-[#8C7E74]">{t.phone}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            t.subscriptionStatus === 'active'
                              ? 'bg-[#4ADE80]/15 text-[#4ADE80] border border-[#4ADE80]/30'
                              : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {t.subscriptionStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-[#8C7E74]">
                        {new Date(t.subscriptionExpiresAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {t.subscriptionStatus === 'active' ? (
                          <button
                            onClick={() => handleAction(t.id, 'suspend')}
                            className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-[10px] transition-colors"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction(t.id, 'activate')}
                            className="px-2.5 py-1 rounded-lg bg-[#4ADE80]/20 hover:bg-[#4ADE80]/30 text-[#4ADE80] text-[10px] transition-colors"
                          >
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => handleAction(t.id, 'renew')}
                          className="px-2.5 py-1 rounded-lg bg-[#C87D4B]/20 hover:bg-[#C87D4B]/30 text-[#D49A6A] text-[10px] transition-colors"
                        >
                          Renew +1 Yr
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Onboard Restaurant */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-3xl bg-[#1C1613] border border-[#C87D4B]/30 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold font-editorial text-[#FAF6F0]">
                  Onboard New Paying Restaurant
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-white/60 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateTenant} className="space-y-3 text-xs font-mono">
                <div>
                  <label className="block text-[#8C7E74] mb-1">Restaurant Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Third Wave Coffee Roasters"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-[#C87D4B]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#8C7E74] mb-1">URL Slug *</label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="e.g. third-wave"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-[#C87D4B]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8C7E74] mb-1">UPI VPA (0% Cut) *</label>
                    <input
                      type="text"
                      required
                      value={formData.upiVpa}
                      onChange={(e) => setFormData({ ...formData, upiVpa: e.target.value })}
                      placeholder="e.g. cafe@icici"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-[#C87D4B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#8C7E74] mb-1">Mobile Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 00000"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-[#C87D4B]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8C7E74] mb-1">GSTIN (Optional)</label>
                    <input
                      type="text"
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                      placeholder="29AABCU9603R1ZM"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-[#C87D4B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#8C7E74] mb-1">Physical Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Shop 4, 12th Main, Indiranagar, Bengaluru"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-[#C87D4B]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#C97943] hover:bg-[#D49A6A] text-[#140F0D] font-bold"
                  >
                    Confirm &amp; Provision (₹9,000/yr)
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
