"use client";

import React from "react";
import {
  XCircle,
  RotateCcw,
  RefreshCw,
  Hash,
  Mail,
  User,
  ShieldAlert,
  ArrowRight,
  Database,
} from "lucide-react";

interface PaymentData {
  id?: string;
  name: string;
  email: string;
  reference: string;
  createdAt: string | Date;
  amount?: number;
  currency?: string;
}

interface PaymentFailedCardProps {
  payment: PaymentData;
  onRetry: () => void;
  onReset: () => void;
  onOpenDbInspector?: () => void;
}

export const PaymentFailedCard: React.FC<PaymentFailedCardProps> = ({
  payment,
  onRetry,
  onReset,
  onOpenDbInspector,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/40 shadow-2xl p-6 sm:p-8 space-y-6 animate-fadeIn">
      {/* Failed Badge & Header */}
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-red-600 text-white shadow-xl shadow-rose-500/25 ring-8 ring-rose-50 dark:ring-rose-950/40">
          <XCircle className="h-10 w-10 text-white stroke-[2.2]" />
        </div>

        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 dark:bg-rose-950/60 px-3 py-1 text-xs font-bold text-rose-800 dark:text-rose-300 border border-rose-300/50 dark:border-rose-800">
            <ShieldAlert className="h-3.5 w-3.5" /> Payment Status: Failed / Uncompleted
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white pt-1">
            Payment Not Completed
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            You indicated that the Tikkie payment was not completed or failed. No worries — you can retry right away or submit new details.
          </p>
        </div>
      </div>

      {/* Payment Reference Summary */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-5 space-y-4 shadow-inner">
        {/* User Info Breakdown */}
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <User className="h-3.5 w-3.5" /> Name
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">{payment.name}</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Mail className="h-3.5 w-3.5" /> Email
            </span>
            <span className="font-mono text-slate-700 dark:text-slate-300">{payment.email}</span>
          </div>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="space-y-3 pt-2">
        <button
          onClick={onRetry}
          id="retry-tikkie-payment-btn"
          className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#6C1D5F] via-[#852375] to-[#4F1345] py-3.5 px-6 font-bold text-white shadow-lg shadow-purple-900/20 hover:brightness-110 active:scale-[0.99] transition cursor-pointer text-sm"
        >
          <RotateCcw className="h-4 w-4" />
          Retry Tikkie Payment
        </button>

        <button
          onClick={onReset}
          id="start-over-payment-btn"
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 py-3 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Edit Details &amp; Start Over
        </button>

      </div>
    </div>
  );
};
