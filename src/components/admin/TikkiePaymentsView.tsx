"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  CreditCard,
  RefreshCw,
  Search,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User,
  ArrowUpDown,
  Download,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Send,
  Building2,
} from "lucide-react";
import { TikkiePayment, TikkiePaymentRequest, TikkieCredentialsStatus } from "@/lib/tikkie-api";

interface TikkiePaymentsViewProps {
  token: string | null;
}

export default function TikkiePaymentsView({ token }: TikkiePaymentsViewProps) {
  const [, startTransition] = useTransition();

  // Data state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [credentialsStatus, setCredentialsStatus] = useState<TikkieCredentialsStatus | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<TikkiePaymentRequest | null>(null);
  const [payments, setPayments] = useState<TikkiePayment[]>([]);
  const [isMock, setIsMock] = useState<boolean>(false);

  // Input token state
  const [inputToken, setInputToken] = useState<string>("");
  const [activeToken, setActiveToken] = useState<string>("");
  const [showConfigHelp, setShowConfigHelp] = useState<boolean>(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Load data function
  const loadTikkieData = async (reqToken?: string, forceMock = false) => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (reqToken) {
        params.append("paymentRequestToken", reqToken);
      }
      if (forceMock) {
        params.append("mock", "true");
      }

      const url = `/api/admin/tikkie${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.credentialsStatus) {
        setCredentialsStatus(data.credentialsStatus);
        if (!reqToken && data.credentialsStatus.defaultPaymentRequestToken) {
          setInputToken(data.credentialsStatus.defaultPaymentRequestToken);
          setActiveToken(data.credentialsStatus.defaultPaymentRequestToken);
        }
      }

      if (!res.ok || (!data.success && !data.paymentRequest)) {
        throw new Error(data.error || "Failed to load Tikkie payments data.");
      }

      if (data.error) {
        setError(data.error);
      }

      setPaymentRequest(data.paymentRequest || null);
      setPayments(data.payments || []);
      setIsMock(Boolean(data.isMock));

      if (data.paymentRequest?.paymentRequestToken) {
        setActiveToken(data.paymentRequest.paymentRequestToken);
        if (!inputToken) {
          setInputToken(data.paymentRequest.paymentRequestToken);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error connecting to Tikkie API.");
      setPayments([]);
      setPaymentRequest(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadTikkieData();
    }
  }, [token]);

  // Form submit to fetch specific payment request token
  const handleFetchCustomToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputToken.trim()) return;
    loadTikkieData(inputToken.trim(), false);
  };

  const handleResetToEnv = () => {
    const envToken = credentialsStatus?.defaultPaymentRequestToken || "";
    setInputToken(envToken);
    loadTikkieData(envToken || undefined, false);
  };

  const handleToggleMock = () => {
    loadTikkieData(inputToken || undefined, !isMock);
  };

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // Export payments to CSV
  const handleExportCSV = () => {
    if (payments.length === 0) return;

    const headers = [
      "Date",
      "Time",
      "Payer Name",
      "Account IBAN",
      "Amount EUR",
      "Description",
      "Payment Token",
      "Status",
    ];

    const rows = payments.map((p) => {
      const d = new Date(p.createdDateTime);
      const isRefunded = p.refunds && p.refunds.length > 0;
      return [
        `"${d.toISOString().split("T")[0]}"`,
        `"${d.toLocaleTimeString()}"`,
        `"${(p.counterPartyName || "Anonymous").replace(/"/g, '""')}"`,
        `"${(p.counterPartyAccountNumber || "N/A").replace(/"/g, '""')}"`,
        (p.amountInCents / 100).toFixed(2),
        `"${(p.description || paymentRequest?.description || "Tuition").replace(/"/g, '""')}"`,
        `"${p.paymentToken}"`,
        `"${isRefunded ? "Refunded" : "Paid"}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `tikkie_payments_${activeToken || "export"}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & sort payments
  const filteredPayments = payments
    .filter((p) => {
      const term = searchTerm.toLowerCase();
      const name = (p.counterPartyName || "").toLowerCase();
      const iban = (p.counterPartyAccountNumber || "").toLowerCase();
      const tokenStr = (p.paymentToken || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      return (
        name.includes(term) ||
        iban.includes(term) ||
        tokenStr.includes(term) ||
        desc.includes(term)
      );
    })
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.createdDateTime).getTime() - new Date(a.createdDateTime).getTime();
      }
      if (sortOrder === "oldest") {
        return new Date(a.createdDateTime).getTime() - new Date(b.createdDateTime).getTime();
      }
      if (sortOrder === "highest") {
        return b.amountInCents - a.amountInCents;
      }
      if (sortOrder === "lowest") {
        return a.amountInCents - b.amountInCents;
      }
      return 0;
    });

  // Calculate stats
  const totalAmount =
    paymentRequest?.totalAmountPaidInCents != null
      ? paymentRequest.totalAmountPaidInCents
      : payments.reduce((sum, p) => sum + p.amountInCents, 0);

  const totalCount =
    paymentRequest?.numberOfPayments != null && paymentRequest.numberOfPayments > 0
      ? paymentRequest.numberOfPayments
      : payments.length;

  const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0;

  return (
    <div className="space-y-6 animate-fadeIn text-slate-100">
      {/* 1. Header Banner & Diagnostics */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6C1D5F] text-white shadow-md shadow-purple-900/50">
                <CreditCard className="h-4 w-4" />
              </span>
              <h2 className="text-xl font-black text-white tracking-tight">
                Tikkie Payment Requests &amp; Transactions
              </h2>
              {isMock && (
                <span className="rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 border border-amber-500/30">
                  Preview Sample Data
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Inspect all completed Tikkie transactions for your active payment request directly from the
              official ABN AMRO Tikkie API v2.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => loadTikkieData(activeToken || undefined, isMock)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh Tikkie Data
            </button>

            {credentialsStatus?.hasApiKey && credentialsStatus?.hasAppToken ? (
              <button
                onClick={handleToggleMock}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  isMock
                    ? "bg-purple-950/60 border-purple-800 text-purple-300 hover:bg-purple-900"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                }`}
                title="Toggle between live ABN AMRO API and Preview Sample Data"
              >
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                {isMock ? "Switch to Live API" : "Preview Sample Data"}
              </button>
            ) : null}
          </div>
        </div>

        {/* Credentials Diagnostics Status Pills */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Environment Config:
            </span>

            {/* Api-Key Status */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium ${
                credentialsStatus?.hasApiKey
                  ? "bg-emerald-950/50 border-emerald-800/60 text-emerald-300"
                  : "bg-amber-950/50 border-amber-800/60 text-amber-300"
              }`}
            >
              {credentialsStatus?.hasApiKey ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-3 w-3 text-amber-400" />
              )}
              <span>Api-Key:</span>
              <strong className="font-mono">
                {credentialsStatus?.hasApiKey ? "Configured ✓" : "Missing in env"}
              </strong>
            </div>

            {/* X-App-Token Status */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium ${
                credentialsStatus?.hasAppToken
                  ? "bg-emerald-950/50 border-emerald-800/60 text-emerald-300"
                  : "bg-amber-950/50 border-amber-800/60 text-amber-300"
              }`}
            >
              {credentialsStatus?.hasAppToken ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-3 w-3 text-amber-400" />
              )}
              <span>X-App-Token:</span>
              <strong className="font-mono">
                {credentialsStatus?.hasAppToken ? "Configured ✓" : "Missing in env"}
              </strong>
            </div>

            {/* PaymentRequestToken Status */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium ${
                credentialsStatus?.hasPaymentRequestToken
                  ? "bg-purple-950/50 border-purple-800/60 text-purple-300"
                  : "bg-slate-900 border-slate-800 text-slate-400"
              }`}
            >
              <CreditCard className="h-3 w-3 text-purple-400" />
              <span>PaymentRequestToken:</span>
              <strong className="font-mono text-white">
                {credentialsStatus?.defaultPaymentRequestToken
                  ? `${credentialsStatus.defaultPaymentRequestToken.slice(0, 10)}...`
                  : "Not set in env"}
              </strong>
            </div>

            {/* Environment: Sandbox vs Production */}
            <span className="text-[10px] text-slate-500 font-mono">
              API: {credentialsStatus?.isSandbox ? "Sandbox" : "Production"}
            </span>
          </div>

          <button
            onClick={() => setShowConfigHelp(!showConfigHelp)}
            className="text-purple-400 hover:text-purple-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
          >
            <Info className="h-3.5 w-3.5" />
            <span>Setup Guide</span>
            {showConfigHelp ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Expandable Setup Guide */}
        {showConfigHelp && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-3">
            <h4 className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-purple-400" />
              ABN AMRO Tikkie API v2 Setup Instructions
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Add your ABN AMRO Developer Portal credentials to your{" "}
              <code className="text-purple-300 bg-slate-900 px-1 py-0.5 rounded">.env.local</code>{" "}
              file. The system automatically reads these keys:
            </p>
            <pre className="p-3 rounded-lg bg-slate-900 font-mono text-[11px] text-slate-200 overflow-x-auto border border-slate-800">
{`# ABN AMRO Tikkie API v2 Credentials
Api-Key=your_abn_amro_api_key_here
X-App-Token=your_tikkie_app_token_uuid_here
PaymentRequestToken=your_payment_request_token_here`}
            </pre>
            <p className="text-slate-400 text-[11px]">
              Note: The API token can also be entered directly in the Token field below to query any
              payment request on the fly.
            </p>
          </div>
        )}
      </div>

      {/* 2. Error Display Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-900 flex items-start gap-3 text-xs text-rose-200">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-rose-100">Notice while querying Tikkie API</h4>
            <p>{error}</p>
            {(!credentialsStatus?.hasApiKey || !credentialsStatus?.hasAppToken) && (
              <p className="text-[11px] text-rose-300 pt-1">
                Tip: Configure <code className="bg-rose-900/50 px-1 rounded">Api-Key</code> and{" "}
                <code className="bg-rose-900/50 px-1 rounded">X-App-Token</code> in your{" "}
                <code className="bg-rose-900/50 px-1 rounded">.env.local</code> file. You can also
                click &quot;Preview Sample Data&quot; to test the interface layout.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 3. Token Search & Selection Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg space-y-4">
        <form
          onSubmit={handleFetchCustomToken}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <div className="flex-1 relative">
            <span className="absolute left-3.5 top-3 text-slate-500 font-mono text-xs">Token:</span>
            <input
              type="text"
              placeholder="e.g. fUKzY6Fc7DCaCYwSwfu38H (or your PaymentRequestToken)"
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-16 pr-4 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-hidden focus:border-[#6C1D5F]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={loading || !inputToken.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6C1D5F] to-indigo-600 hover:from-purple-800 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-purple-950/40 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              Fetch Tikkies
            </button>

            {credentialsStatus?.defaultPaymentRequestToken && (
              <button
                type="button"
                onClick={handleResetToEnv}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                title="Reset to default PaymentRequestToken from .env"
              >
                Reset to Env
              </button>
            )}
          </div>
        </form>

        {/* Active Payment Request Metadata Card */}
        {paymentRequest && (
          <div className="pt-3 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white text-sm">
                  {paymentRequest.description || "Tikkie Payment Request"}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    paymentRequest.status === "OPEN"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      paymentRequest.status === "OPEN"
                        ? "bg-emerald-400 animate-pulse"
                        : "bg-slate-400"
                    }`}
                  />
                  {paymentRequest.status}
                </span>

                <div className="flex items-center gap-1 font-mono text-[11px] text-purple-300 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-800/40">
                  <span>{paymentRequest.paymentRequestToken}</span>
                  <button
                    onClick={() =>
                      handleCopy(paymentRequest.paymentRequestToken, "req_token")
                    }
                    className="hover:text-white transition cursor-pointer"
                    title="Copy token"
                  >
                    {copiedToken === "req_token" ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
                {paymentRequest.createdDateTime && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-500" />
                    Created: {new Date(paymentRequest.createdDateTime).toLocaleDateString()}
                  </span>
                )}
                {paymentRequest.expiryDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-500" />
                    Expires: {paymentRequest.expiryDate}
                  </span>
                )}
                {paymentRequest.amountInCents != null ? (
                  <span className="text-emerald-400 font-semibold">
                    Fixed Amount: € {(paymentRequest.amountInCents / 100).toFixed(2)}
                  </span>
                ) : (
                  <span className="text-indigo-400 font-semibold">Open Amount Request</span>
                )}
              </div>
            </div>

            {paymentRequest.url && (
              <a
                href={paymentRequest.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 font-semibold text-xs transition cursor-pointer shrink-0"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open Tikkie Link
              </a>
            )}
          </div>
        )}
      </div>

      {/* 4. Stat Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Collected</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            € {(totalAmount / 100).toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400">
            Across {totalCount} successful payment{totalCount === 1 ? "" : "s"}
          </p>
        </div>

        {/* Total Payments */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tikkies Paid</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{totalCount}</div>
          <p className="text-[11px] text-slate-400">Verified through ABN AMRO</p>
        </div>

        {/* Average Transaction */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Paid</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-400">
            € {(avgAmount / 100).toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400">Average transaction size</p>
        </div>

        {/* Payment Request Status */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Request Status</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {paymentRequest?.status || (payments.length > 0 ? "OPEN" : "N/A")}
          </div>
          <p className="text-[11px] text-slate-400">
            {paymentRequest?.expiryDate
              ? `Valid until ${paymentRequest.expiryDate}`
              : "Active payment link"}
          </p>
        </div>
      </div>

      {/* 5. Payments List / Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg space-y-0">
        {/* Table Search & Controls Bar */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-purple-400" />
              Completed Tikkies ({filteredPayments.length})
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search payer, IBAN, token..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-[#6C1D5F]"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(
                    e.target.value as "newest" | "oldest" | "highest" | "lowest"
                  )
                }
                className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:border-[#6C1D5F] cursor-pointer"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="highest">Highest amount</option>
                <option value="lowest">Lowest amount</option>
              </select>
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              disabled={payments.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-300 border border-slate-700 transition cursor-pointer"
              title="Export all fetched payments to CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span> CSV
            </button>
          </div>
        </div>

        {/* Table View (Desktop & Tablet) */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Payment Date &amp; Time</th>
                <th className="py-3 px-4">Payer Name</th>
                <th className="py-3 px-4">Account IBAN</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Token</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 space-y-2">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-purple-400" />
                    <p>Loading Tikkie transactions...</p>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 space-y-2">
                    <AlertCircle className="h-6 w-6 mx-auto text-slate-500" />
                    <p className="font-semibold text-slate-300">No payments found</p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      {searchTerm
                        ? "No transactions match your current search query."
                        : "No payments have been completed yet under this Payment Request."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const hasRefund = p.refunds && p.refunds.length > 0;
                  return (
                    <tr
                      key={p.paymentToken}
                      className="hover:bg-slate-800/30 transition group"
                    >
                      {/* Date & Time */}
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                        {new Date(p.createdDateTime).toLocaleString()}
                      </td>

                      {/* Payer Name */}
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                          <span>{p.counterPartyName || "Anonymous Payer"}</span>
                        </div>
                      </td>

                      {/* Account IBAN */}
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                          <span>{p.counterPartyAccountNumber || "N/A"}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-bold text-emerald-400 text-sm whitespace-nowrap">
                        € {(p.amountInCents / 100).toFixed(2)}
                      </td>

                      {/* Payment Token */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[130px]" title={p.paymentToken}>
                            {p.paymentToken}
                          </span>
                          <button
                            onClick={() => handleCopy(p.paymentToken, p.paymentToken)}
                            className="p-1 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
                            title="Copy full payment token"
                          >
                            {copiedToken === p.paymentToken ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 text-slate-300 max-w-[180px] truncate" title={p.description}>
                        {p.description || paymentRequest?.description || "—"}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            hasRefund
                              ? "bg-amber-950 text-amber-300 border border-amber-800"
                              : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          }`}
                        >
                          {hasRefund ? "Refunded" : "Paid ✓"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Card View (Mobile) */}
        <div className="block md:hidden divide-y divide-slate-800">
          {loading ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-purple-400" />
              <p className="text-xs">Loading Tikkie transactions...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2 p-4">
              <AlertCircle className="h-6 w-6 mx-auto text-slate-500" />
              <p className="font-semibold text-slate-300 text-xs">No payments found</p>
              <p className="text-[11px] text-slate-500">
                {searchTerm
                  ? "No payments match your search term."
                  : "No payments recorded for this token."}
              </p>
            </div>
          ) : (
            filteredPayments.map((p) => {
              const hasRefund = p.refunds && p.refunds.length > 0;
              return (
                <div key={p.paymentToken} className="p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-purple-400" />
                      {p.counterPartyName || "Anonymous Payer"}
                    </span>
                    <span className="font-black text-emerald-400 text-sm">
                      € {(p.amountInCents / 100).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono">{p.counterPartyAccountNumber || "IBAN: N/A"}</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        hasRefund
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      }`}
                    >
                      {hasRefund ? "Refunded" : "Paid ✓"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 border-t border-slate-800/50">
                    <span className="font-mono">
                      {new Date(p.createdDateTime).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-1 font-mono text-slate-400">
                      <span>{p.paymentToken.slice(0, 12)}...</span>
                      <button
                        onClick={() => handleCopy(p.paymentToken, p.paymentToken)}
                        className="hover:text-white"
                      >
                        {copiedToken === p.paymentToken ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
