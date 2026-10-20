"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Copy,
  Check,
  Calendar,
  Mail,
  User,
  Hash,
  ArrowRight,
  Printer,
  Database,
  ShieldCheck,
  Receipt,
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

interface ThankYouCardProps {
  payment: PaymentData;
  onReset: () => void;
  onOpenDbInspector?: () => void;
}

export const ThankYouCard: React.FC<ThankYouCardProps> = ({
  payment,
  onReset,
  onOpenDbInspector,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyRef = () => {
    navigator.clipboard.writeText(payment.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(payment.createdAt).toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });

  return (
    <div className="w-full max-w-xl mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-fadeIn">
      {/* Success Badge & Header */}
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-500/25 ring-8 ring-emerald-50 dark:ring-emerald-950/40 animate-bounce">
          <CheckCircle2 className="h-10 w-10 text-white stroke-[2.5]" />
        </div>

        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300/50 dark:border-emerald-800">
            <ShieldCheck className="h-3.5 w-3.5" /> Payment Recorded &amp; Completed
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white pt-1">
            Thank You, {payment.name}!
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Your payment session has finished and your registration details have been saved.
          </p>
        </div>
      </div>

      {/* Payment Receipt / MongoDB Document Details */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-5 space-y-4 shadow-inner">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Receipt className="h-4 w-4 text-indigo-500" />
            <span>Payment Summary</span>
          </div>
        </div>

        {/* Reference Highlight */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-white dark:bg-slate-900 p-3.5 border border-indigo-100 dark:border-indigo-950 shadow-xs">
          <div className="space-y-0.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
              Payment Reference
            </span>
            <div className="font-mono text-base sm:text-lg font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
              <Hash className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>{payment.reference}</span>
            </div>
          </div>
          <button
            onClick={handleCopyRef}
            className="flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy Ref
              </>
            )}
          </button>
        </div>

        {/* Document Attributes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80">
            <User className="h-4 w-4 text-slate-400 mt-0.5" />
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Customer Name</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">{payment.name}</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80">
            <Mail className="h-4 w-4 text-slate-400 mt-0.5" />
            <div className="overflow-hidden">
              <div className="text-[11px] text-slate-400 font-medium">Email Address</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                {payment.email}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 sm:col-span-2">
            <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Creation Date &amp; Time</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {formattedDate}
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};
