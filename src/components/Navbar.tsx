"use client";

import React, { useEffect, useState } from "react";
import { GraduationCap, Database, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface NavbarProps {
  onOpenDbInspector?: () => void;
  paymentsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDbInspector, paymentsCount = 0 }) => {
  const [dbStatus, setDbStatus] = useState<"connected" | "disconnected" | "checking">("checking");
  const [dbName, setDbName] = useState<string>("alh_academy");

  const checkHealth = async () => {
    setDbStatus("checking");
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      if (res.ok && data.status === "connected") {
        setDbStatus("connected");
        setDbName(data.database || "alh_academy");
      } else {
        setDbStatus("disconnected");
      }
    } catch {
      setDbStatus("disconnected");
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/85 transition-all">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 shadow-md shadow-indigo-500/20 text-white font-bold">
            <GraduationCap className="h-6 w-6 text-white" />
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                ALH Academy
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
