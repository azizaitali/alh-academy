"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { PaymentForm } from "@/components/PaymentForm";
import { TikkieModal } from "@/components/TikkieModal";
import { ThankYouCard } from "@/components/ThankYouCard";
import { PaymentFailedCard } from "@/components/PaymentFailedCard";
import { DatabaseInspector } from "@/components/DatabaseInspector";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

interface PaymentData {
  id?: string;
  name: string;
  email: string;
  reference: string;
  createdAt: string | Date;
  amount?: number;
  currency?: string;
  status?: string;
}

export default function Home() {
  const [currentPayment, setCurrentPayment] = useState<PaymentData | null>(null);
  const [tikkieUrl, setTikkieUrl] = useState<string>("");
  const [isTikkieModalOpen, setIsTikkieModalOpen] = useState<boolean>(false);
  const [paymentOutcome, setPaymentOutcome] = useState<
    "none" | "completed" | "failed" | "unconfirmed"
  >("none");
  const [isDbInspectorOpen, setIsDbInspectorOpen] = useState<boolean>(false);
  const [paymentsCount, setPaymentsCount] = useState<number>(0);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Fetch count on load
  const loadPaymentCount = async () => {
    try {
      const res = await fetch("/api/payments");
      const data = await res.json();
      if (data.success && Array.isArray(data.payments)) {
        setPaymentsCount(data.payments.length);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadPaymentCount();
  }, [refreshTrigger]);

  // Update payment status in database
  const updatePaymentStatus = async (status: "completed" | "failed") => {
    if (!currentPayment) return;
    try {
      await fetch("/api/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: currentPayment.reference,
          status,
        }),
      });
    } catch (e) {
      console.warn("Could not update status in DB:", e);
    }
  };

  // Triggered when form successfully saves to MongoDB
  const handlePaymentSuccess = (payment: PaymentData, url: string) => {
    setCurrentPayment(payment);
    setTikkieUrl(url);
    setIsTikkieModalOpen(true);
    setPaymentOutcome("none");
    setRefreshTrigger((prev) => prev + 1);
  };

  // User clicked "Payment completed"
  const handlePaymentCompleted = async () => {
    await updatePaymentStatus("completed");
    setIsTikkieModalOpen(false);
    setPaymentOutcome("completed");
    setRefreshTrigger((prev) => prev + 1);
  };

  // User clicked "Payment failed"
  const handlePaymentFailed = async () => {
    await updatePaymentStatus("failed");
    setIsTikkieModalOpen(false);
    setPaymentOutcome("failed");
    setRefreshTrigger((prev) => prev + 1);
  };

  // Triggered when user closes the modal via 'X' or backdrop
  const handleCloseTikkieModal = () => {
    setIsTikkieModalOpen(false);
    // If the user closed the modal without clicking a status button, prompt them
    if (paymentOutcome === "none" && currentPayment) {
      setPaymentOutcome("unconfirmed");
    }
    setRefreshTrigger((prev) => prev + 1);
  };

  // Reopen the modal to retry payment
  const handleRetryPayment = () => {
    setIsTikkieModalOpen(true);
    setPaymentOutcome("none");
  };

  // Reset back to new payment form
  const handleReset = () => {
    setPaymentOutcome("none");
    setCurrentPayment(null);
    setTikkieUrl("");
    setIsTikkieModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-slate-100 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 selection:bg-purple-600 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        onOpenDbInspector={() => setIsDbInspectorOpen(true)}
        paymentsCount={paymentsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        {/* Dynamic Payment State */}
        <section className="relative">
          {paymentOutcome === "completed" && currentPayment ? (
            <ThankYouCard
              payment={currentPayment}
              onReset={handleReset}
              onOpenDbInspector={() => setIsDbInspectorOpen(true)}
            />
          ) : paymentOutcome === "failed" && currentPayment ? (
            <PaymentFailedCard
              payment={currentPayment}
              onRetry={handleRetryPayment}
              onReset={handleReset}
              onOpenDbInspector={() => setIsDbInspectorOpen(true)}
            />
          ) : paymentOutcome === "unconfirmed" && currentPayment ? (
            /* Card shown if user closed modal and needs to choose outcome */
            <div className="w-full max-w-xl mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-fadeIn">
              <div className="text-center space-y-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950/60 text-[#6C1D5F] dark:text-purple-300 ring-8 ring-purple-50 dark:ring-purple-950/30">
                  <HelpCircle className="h-8 w-8 stroke-[2]" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Did your Tikkie payment succeed?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                    You closed the payment popup for reference{" "}
                    <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                      {currentPayment.reference}
                    </span>
                    . Please confirm the outcome:
                  </p>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  id="confirm-payment-failed-btn"
                  onClick={handlePaymentFailed}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl border-2 border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-sm hover:bg-rose-100 dark:hover:bg-rose-900/60 transition cursor-pointer"
                >
                  <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                  Payment failed
                </button>

                <button
                  id="confirm-payment-completed-btn"
                  onClick={handlePaymentCompleted}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25 transition cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Payment completed
                </button>
              </div>

              {/* Reopen Modal button */}
              <button
                onClick={() => setIsTikkieModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-purple-700 dark:text-purple-400 hover:underline transition cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reopen Official Tikkie Modal
              </button>
            </div>
          ) : (
            <PaymentForm
              onPaymentSuccess={handlePaymentSuccess}
              defaultTikkieUrl={
                process.env.NEXT_PUBLIC_DEFAULT_TIKKIE_URL ||
                "https://tikkie.me/pay/ALHAcademy/course-fee"
              }
            />
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 py-8 px-4 sm:px-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-[#6C1D5F] dark:text-purple-400" />
            <span>ALH Academy • Modern Web &amp; AI Education</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Next.js &amp; MongoDB</span>
            <span>•</span>
            <span>Official Tikkie Payments</span>
          </div>
        </div>
      </footer>

      {/* Official Tikkie Modal */}
      <TikkieModal
        isOpen={isTikkieModalOpen}
        payment={currentPayment}
        tikkieUrl={tikkieUrl}
        onClose={handleCloseTikkieModal}
        onPaymentCompleted={handlePaymentCompleted}
        onPaymentFailed={handlePaymentFailed}
      />

      {/* Database Inspector Modal */}
      <DatabaseInspector
        isOpen={isDbInspectorOpen}
        onClose={() => setIsDbInspectorOpen(false)}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}
