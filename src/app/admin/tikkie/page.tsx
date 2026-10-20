"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  ExternalLink,
  Users,
  CreditCard,
  TrendingUp,
  Settings,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import TikkiePaymentsView from "@/components/admin/TikkiePaymentsView";

export default function AdminTikkiePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // On mount, check if token exists in localStorage
  useEffect(() => {
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
              Enter your administrator password to view Tikkie transactions.
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
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoFocus
                  required
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-[#6C1D5F] focus:outline-hidden focus:ring-1 focus:ring-[#6C1D5F] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6C1D5F] to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-950/40 hover:from-purple-800 hover:to-indigo-500 active:scale-[0.99] transition cursor-pointer disabled:opacity-50"
            >
              {authLoading ? "Authenticating..." : "Unlock Tikkie Portal"}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500 space-y-2">
            <p className="font-mono text-[11px] text-slate-500 bg-slate-950/50 py-1.5 px-3 rounded-lg border border-slate-800">
              Default password: <strong className="text-purple-400">admin123</strong>
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

  // 2. AUTHENTICATED TIKKIE PAGE VIEW
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
                  Tikkie Portal
                </span>
              </div>
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                ABN AMRO Tikkie API v2 Stream
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 border-t border-slate-800/80 pt-1 overflow-x-auto">
          <Link
            href="/admin?tab=overview"
            className="flex items-center gap-2 py-3 px-4 border-b-2 border-transparent font-bold text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer whitespace-nowrap"
          >
            <TrendingUp className="h-4 w-4" />
            Overview &amp; Analytics
          </Link>

          <Link
            href="/admin?tab=traffic"
            className="flex items-center gap-2 py-3 px-4 border-b-2 border-transparent font-bold text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer whitespace-nowrap"
          >
            <Users className="h-4 w-4" />
            Traffic &amp; Payments
          </Link>

          <div className="flex items-center gap-2 py-3 px-4 border-b-2 border-[#6C1D5F] font-bold text-xs text-purple-400 cursor-pointer whitespace-nowrap">
            <CreditCard className="h-4 w-4" />
            Tikkie Payments
            <span className="ml-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/50 text-[10px] px-1.5 py-0.2">
              API
            </span>
          </div>

          <Link
            href="/admin?tab=settings"
            className="flex items-center gap-2 py-3 px-4 border-b-2 border-transparent font-bold text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer whitespace-nowrap"
          >
            <Settings className="h-4 w-4" />
            Settings &amp; Pricing
          </Link>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        <TikkiePaymentsView token={token} />
      </main>
    </div>
  );
}
