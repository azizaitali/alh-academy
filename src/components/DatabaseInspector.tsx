"use client";

import React, { useEffect, useState } from "react";
import {
  Database,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Code,
  Table as TableIcon,
} from "lucide-react";

interface PaymentRecord {
  id: string;
  name: string;
  email: string;
  reference: string;
  createdAt: string;
  amount?: number;
  currency?: string;
  status?: string;
}

interface DatabaseInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  refreshTrigger?: number;
}

export const DatabaseInspector: React.FC<DatabaseInspectorProps> = ({
  isOpen,
  onClose,
  refreshTrigger = 0,
}) => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "json">("table");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [dbStatus, setDbStatus] = useState<string>("unknown");

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments");
      const data = await res.json();
      if (data.success && Array.isArray(data.payments)) {
        setPayments(data.payments);
        setDbStatus(data.source === "mongodb" ? "Connected to MongoDB" : "Memory Fallback");
      }
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPayments();
    }
  }, [isOpen, refreshTrigger]);

  if (!isOpen) return null;

  const handleCopyJSON = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  MongoDB Collection: <span className="font-mono text-indigo-600 dark:text-indigo-400">payments</span>
                </h3>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 border border-emerald-300 dark:border-emerald-800">
                  {payments.length} {payments.length === 1 ? "document" : "documents"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {dbStatus} • Showing recent documents saved upon user checkout
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex rounded-lg bg-slate-200/70 dark:bg-slate-800 p-0.5 text-xs font-medium">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <TableIcon className="h-3.5 w-3.5" />
                Table
              </button>
              <button
                onClick={() => setViewMode("json")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                  viewMode === "json"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <Code className="h-3.5 w-3.5" />
                JSON
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={fetchPayments}
              disabled={loading}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
              title="Refresh MongoDB data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-indigo-500" : ""}`} />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content View */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">
          {loading && payments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
              <span>Querying MongoDB collection...</span>
            </div>
          ) : payments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <AlertCircle className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No payment documents found yet.</p>
              <p className="text-xs max-w-sm mx-auto">
                Fill in the public payment form and click &quot;Pay with Tikkie&quot; to save your first document to the MongoDB <code className="font-mono text-indigo-500">payments</code> collection.
              </p>
            </div>
          ) : viewMode === "table" ? (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Creation Date &amp; Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {payments.map((p) => (
                    <tr key={p.id || p.reference} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {p.reference}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            p.status === "failed"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                              : p.status === "pending"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                          }`}
                        >
                          {p.status || "completed"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-white font-semibold">
                        {p.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono">
                        {p.email}
                      </td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-bold">
                        € {(p.amount || 49.0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {new Date(p.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((p, idx) => {
                const jsonString = JSON.stringify(
                  {
                    _id: p.id,
                    name: p.name,
                    email: p.email,
                    reference: p.reference,
                    createdAt: p.createdAt,
                    amount: p.amount || 49.0,
                    currency: p.currency || "EUR",
                    status: p.status || "completed",
                  },
                  null,
                  2
                );

                return (
                  <div
                    key={p.id || p.reference}
                    className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto shadow-inner"
                  >
                    <button
                      onClick={() => handleCopyJSON(jsonString, idx)}
                      className="absolute top-3 right-3 flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[10px] text-slate-300 hover:bg-slate-700 transition cursor-pointer"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Copy Doc
                        </>
                      )}
                    </button>
                    <pre className="text-slate-100">{jsonString}</pre>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            MongoDB Collection Schema: <code>&#123; name, email, reference, createdAt &#125;</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
