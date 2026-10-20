"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  RefreshCw,
  Search,
  ExternalLink,
  Users,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Settings,
  Sliders,
  DollarSign,
  Smartphone,
  Laptop,
  Tablet,
  Globe,
  ArrowLeft,
  Check,
  AlertCircle,
  Save,
  Radio,
  FileText,
} from "lucide-react";
import { AppSettings, defaultSettings, CoursePlan } from "@/lib/settings-types";
import TikkiePaymentsView from "@/components/admin/TikkiePaymentsView";

interface TrafficItem {
  id: string;
  path: string;
  referrer: string;
  ip: string;
  device: string;
  browser: string;
  timestamp: string;
}

interface PaymentItem {
  id: string;
  name: string;
  email: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface Metrics {
  totalVisits: number;
  totalPayments: number;
  completedCount: number;
  failedCount: number;
  pendingCount: number;
  totalRevenue: number;
  conversionRate: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<"overview" | "traffic" | "tikkie" | "settings">("overview");
  const [metrics, setMetrics] = useState<Metrics>({
    totalVisits: 0,
    totalPayments: 0,
    completedCount: 0,
    failedCount: 0,
    pendingCount: 0,
    totalRevenue: 0,
    conversionRate: "0.0",
  });
  const [trafficList, setTrafficList] = useState<TrafficItem[]>([]);
  const [paymentsList, setPaymentsList] = useState<PaymentItem[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "failed" | "pending" | "visits">("all");

  // Settings State
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [settingsLoading, setSettingsLoading] = useState<boolean>(false);
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState<boolean>(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // On mount, check if token exists in localStorage and inspect ?tab=... query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    if (tabParam === "tikkie" || tabParam === "traffic" || tabParam === "settings" || tabParam === "overview") {
      setActiveTab(tabParam);
    }

    const savedToken = localStorage.getItem("alh_admin_token");
    if (savedToken) {
      setToken(savedToken);
      verifyToken(savedToken);
    }
  }, []);

  const verifyToken = async (t: string) => {
    try {
      const res = await fetch("/api/admin/auth", {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem("alh_admin_token");
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed.");
      }

      setToken(data.token);
      localStorage.setItem("alh_admin_token", data.token);
      setIsAuthenticated(true);
      setPassword("");
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Invalid password.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("alh_admin_token");
    setToken(null);
    setIsAuthenticated(false);
  };

  // Load Traffic & Payments Data
  const loadDashboardData = async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      const res = await fetch("/api/admin/traffic", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics || metrics);
        setTrafficList(data.traffic || []);
        setPaymentsList(data.payments || []);
      }
    } catch (err) {
      console.error("Failed to load traffic data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  // Load Settings Data
  const loadSettingsData = async () => {
    if (!token) return;
    setSettingsLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      loadDashboardData();
      loadSettingsData();
    }
  }, [isAuthenticated, token]);

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSettingsLoading(true);
    setSettingsError(null);
    setSettingsSaveSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update settings.");
      }

      setSettings(data.settings);
      setSettingsSaveSuccess(true);
      setTimeout(() => setSettingsSaveSuccess(false), 3000);
    } catch (err: unknown) {
      setSettingsError(err instanceof Error ? err.message : "Failed to save settings.");
    } finally {
      setSettingsLoading(false);
    }
  };

  // Filtered Payments and Traffic lists
  const filteredPayments = paymentsList.filter((p) => {
    const matchesSearch =
      p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === "all") return true;
    if (statusFilter === "visits") return false;
    return p.status === statusFilter;
  });

  const filteredTraffic = trafficList.filter((t) => {
    if (statusFilter !== "all" && statusFilter !== "visits") return false;
    return (
      t.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.browser.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.device.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Calculate device distribution
  const deviceCounts = trafficList.reduce(
    (acc, t) => {
      const dev = t.device || "Desktop";
      acc[dev] = (acc[dev] || 0) + 1;
      return acc;
    },
    { Desktop: 0, Mobile: 0, Tablet: 0 } as Record<string, number>
  );

  const totalDeviceVisits = trafficList.length || 1;

  // 1. LOGIN VIEW IF NOT AUTHENTICATED
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4 text-slate-100">
        <div className="w-full max-w-md rounded-3xl bg-slate-900/90 border border-slate-800 p-7 sm:p-9 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#6C1D5F] to-indigo-600 text-white shadow-xl shadow-purple-950/50 ring-4 ring-purple-500/20">
              <Lock className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white pt-2">
              ALH Academy Admin
            </h1>
            <p className="text-xs text-slate-400">
              Enter your administrator password to view traffic and manage settings.
            </p>
          </div>

          {authError && (
            <div className="flex items-center gap-2.5 rounded-xl bg-rose-950/60 border border-rose-900 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 pr-10 text-sm text-white placeholder-slate-500 focus:border-[#6C1D5F] focus:ring-2 focus:ring-[#6C1D5F]/30 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6C1D5F] via-purple-700 to-indigo-600 py-3.5 px-4 font-bold text-white shadow-lg shadow-purple-900/30 hover:brightness-110 active:scale-[0.99] transition cursor-pointer disabled:opacity-50 text-sm"
            >
              {authLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Sign In to Admin Portal</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500 space-y-2">
            <p className="font-mono text-[11px] text-slate-500 bg-slate-950/50 py-1.5 px-3 rounded-lg border border-slate-800">
              Default demo password: <strong className="text-purple-400">admin123</strong>
            </p>
            <div>
              <Link href="/" className="hover:text-slate-300 transition underline">
                Return to Public Website
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED DASHBOARD VIEW
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-purple-600 selection:text-white">
      {/* Top Admin Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#6C1D5F] to-indigo-600 text-white font-black shadow-md shadow-purple-900/30">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">
                  ALH Academy
                </span>
                <span className="rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 border border-purple-500/30">
                  Admin Portal
                </span>
              </div>
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Monitoring &amp; Settings
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Public Site
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-900/50 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 text-xs font-semibold transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 border-t border-slate-800/80 pt-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-xs transition cursor-pointer ${activeTab === "overview"
              ? "border-[#6C1D5F] text-purple-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
          >
            <TrendingUp className="h-4 w-4" />
            Overview &amp; Analytics
          </button>

          <button
            onClick={() => setActiveTab("traffic")}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-xs transition cursor-pointer ${activeTab === "traffic"
              ? "border-[#6C1D5F] text-purple-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
          >
            <Users className="h-4 w-4" />
            Traffic &amp; Payments
            <span className="ml-1 rounded-full bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.2">
              {paymentsList.length + trafficList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("tikkie")}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-xs transition cursor-pointer whitespace-nowrap ${activeTab === "tikkie"
              ? "border-[#6C1D5F] text-purple-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
          >
            <CreditCard className="h-4 w-4" />
            Tikkie Payments
            <span className="ml-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/50 text-[10px] px-1.5 py-0.2">
              API
            </span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-xs transition cursor-pointer whitespace-nowrap ${activeTab === "settings"
              ? "border-[#6C1D5F] text-purple-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
          >
            <Settings className="h-4 w-4" />
            Settings &amp; Pricing
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Stat Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Visits */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Traffic</span>
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                    <Globe className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {metrics.totalVisits}
                </div>
                <p className="text-[11px] text-slate-400">Tracked pageviews &amp; visits</p>
              </div>

              {/* Total Revenue */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                  € {metrics.totalRevenue.toFixed(2)}
                </div>
                <p className="text-[11px] text-slate-400">From {metrics.completedCount} completed payments</p>
              </div>

              {/* Completed Payments */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {metrics.completedCount}
                </div>
                <p className="text-[11px] text-slate-400">
                  {metrics.failedCount} failed • {metrics.pendingCount} pending
                </p>
              </div>

              {/* Conversion Rate */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Conversion</span>
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">
                  {metrics.conversionRate}%
                </div>
                <p className="text-[11px] text-slate-400">Completed payments / visitors</p>
              </div>
            </div>

            {/* Middle Section: Device Distribution & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
              {/* Recent Payments Quick Overview */}
              <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-purple-400" />
                    Recent Payment Transactions
                  </h3>
                  <button
                    onClick={() => setActiveTab("traffic")}
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition"
                  >
                    View All ({paymentsList.length}) →
                  </button>
                </div>

                {paymentsList.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    No transactions recorded yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                          <th className="py-2.5 px-3">Reference</th>
                          <th className="py-2.5 px-3">Name</th>

                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {paymentsList.slice(0, 5).map((p) => (
                          <tr key={p.id} className="hover:bg-slate-800/30 transition">
                            <td className="py-2.5 px-3 font-mono font-bold text-purple-400">
                              {p.reference}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-white">{p.name}</td>

                            <td className="py-2.5 px-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${p.status === "completed"
                                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                  : p.status === "failed"
                                    ? "bg-rose-950 text-rose-300 border border-rose-800"
                                    : "bg-amber-950 text-amber-300 border border-amber-800"
                                  }`}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-400">
                              {new Date(p.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ALL TRAFFIC & PAYMENTS */}
        {activeTab === "traffic" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search reference, name, email, IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-[#6C1D5F]"
                />
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto text-xs">
                {(["all", "completed", "failed", "pending", "visits"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition cursor-pointer ${statusFilter === filter
                      ? "bg-[#6C1D5F] text-white"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                  >
                    {filter}
                  </button>
                ))}

                <button
                  onClick={loadDashboardData}
                  disabled={loadingData}
                  className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Refresh Traffic Data"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingData ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Payments Table */}
            {statusFilter !== "visits" && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
                <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-purple-400" />
                    Payment Checkout Records ({filteredPayments.length})
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-950/60 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Reference</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Email</th>

                        <th className="py-3 px-4">Date &amp; Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {filteredPayments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500">
                            No payment records matching your filter.
                          </td>
                        </tr>
                      ) : (
                        filteredPayments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-800/30 transition">
                            <td className="py-3 px-4 font-mono font-bold text-purple-400">
                              {p.reference}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${p.status === "completed"
                                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                  : p.status === "failed"
                                    ? "bg-rose-950 text-rose-300 border border-rose-800"
                                    : "bg-amber-950 text-amber-300 border border-amber-800"
                                  }`}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-white font-semibold">{p.name}</td>
                            <td className="py-3 px-4 font-mono text-slate-300">{p.email}</td>

                            <td className="py-3 px-4 text-slate-400">
                              {new Date(p.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Page Visits & Visitor Traffic Table */}
            {(statusFilter === "all" || statusFilter === "visits") && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
                <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-400" />
                    Visitor Pageviews &amp; Traffic Logs ({filteredTraffic.length})
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-950/60 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Path</th>
                        <th className="py-3 px-4">Device</th>
                        <th className="py-3 px-4">Browser</th>
                        <th className="py-3 px-4">Referrer</th>
                        <th className="py-3 px-4">IP Address</th>
                        <th className="py-3 px-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {filteredTraffic.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500">
                            No visitor logs recorded yet.
                          </td>
                        </tr>
                      ) : (
                        filteredTraffic.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-800/30 transition">
                            <td className="py-3 px-4 font-mono text-indigo-400 font-semibold">
                              {t.path}
                            </td>
                            <td className="py-3 px-4 text-slate-300">{t.device}</td>
                            <td className="py-3 px-4 text-slate-300">{t.browser}</td>
                            <td className="py-3 px-4 text-slate-400">{t.referrer}</td>
                            <td className="py-3 px-4 font-mono text-slate-500">{t.ip}</td>
                            <td className="py-3 px-4 text-slate-400">
                              {new Date(t.timestamp).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SETTINGS & PRICING EDITOR */}
        {activeTab === "settings" && (
          <div className="max-w-3xl space-y-6 animate-fadeIn">
            {settingsSaveSuccess && (
              <div className="flex items-center gap-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800 p-4 text-xs font-semibold text-emerald-300 animate-fadeIn">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Settings have been updated and saved to the database successfully!</span>
              </div>
            )}

            {settingsError && (
              <div className="flex items-center gap-2.5 rounded-xl bg-rose-950/80 border border-rose-800 p-4 text-xs font-semibold text-rose-300 animate-fadeIn">
                <AlertCircle className="h-4 w-4 text-rose-400" />
                <span>{settingsError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Payment URL Section */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-lg">
                <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                  <CreditCard className="h-5 w-5 text-purple-400" />
                  <div>
                    <h3 className="font-bold text-white text-base">Tikkie Payment Configuration</h3>
                    <p className="text-xs text-slate-400">
                      Configure the default Tikkie payment link opened upon customer checkout.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Default Tikkie Payment URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      required
                      value={settings.defaultTikkieUrl}
                      onChange={(e) =>
                        setSettings({ ...settings, defaultTikkieUrl: e.target.value })
                      }
                      className="w-full font-mono text-xs bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#6C1D5F] focus:outline-hidden"
                      placeholder="https://tikkie.me/pay/..."
                    />
                    <a
                      href={settings.defaultTikkieUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Test Link
                    </a>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-300 block">
                      Allow Custom Tikkie URL in Form
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Allow advanced users or testers to override payment link from the public form.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.allowCustomTikkieUrl}
                    onChange={(e) =>
                      setSettings({ ...settings, allowCustomTikkieUrl: e.target.checked })
                    }
                    className="h-5 w-5 rounded-md border-slate-700 bg-slate-950 text-[#6C1D5F] focus:ring-purple-500 cursor-pointer"
                  />
                </div>
              </div>



              {/* Academy & General Info */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-lg">
                <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                  <Sliders className="h-5 w-5 text-indigo-400" />
                  <div>
                    <h3 className="font-bold text-white text-base">General Academy Details</h3>
                    <p className="text-xs text-slate-400">
                      Configure academy name, support email, and operational flags.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Academy Name</label>
                    <input
                      type="text"
                      value={settings.academyName}
                      onChange={(e) => setSettings({ ...settings, academyName: e.target.value })}
                      className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Support Email</label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                      className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-300 block">
                      Maintenance Mode
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Temporarily pause checkout for maintenance and system updates.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) =>
                      setSettings({ ...settings, maintenanceMode: e.target.checked })
                    }
                    className="h-5 w-5 rounded-md border-slate-700 bg-slate-950 text-[#6C1D5F] focus:ring-purple-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Submit Save Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={settingsLoading}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#6C1D5F] via-purple-700 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-900/30 hover:brightness-110 active:scale-[0.99] transition cursor-pointer disabled:opacity-50"
                >
                  {settingsLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Saving to MongoDB...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save All Settings</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: TIKKIE PAYMENTS API */}
        {activeTab === "tikkie" && <TikkiePaymentsView token={token} />}
      </main>
    </div>
  );
}
