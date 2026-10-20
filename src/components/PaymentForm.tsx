"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  CreditCard,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Loader2,
  ShieldCheck,
  GraduationCap,
  Settings2,
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

interface PaymentFormProps {
  onPaymentSuccess: (payment: PaymentData, tikkieUrl: string) => void;
  defaultTikkieUrl?: string;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  onPaymentSuccess,
  defaultTikkieUrl = "https://tikkie.me/pay/ALHAcademy/course-fee",
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string>("fullstack");
  const [customTikkieUrl, setCustomTikkieUrl] = useState<string>(defaultTikkieUrl);
  const [showSettings, setShowSettings] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const plans = [
    {
      id: "fullstack",
      title: "Full-Stack Web Development",
      description: "Next.js, React, Node.js & MongoDB Certification",
      amount: 49.0,
      badge: "Most Popular",
    },
    {
      id: "ai-engineer",
      title: "AI & Machine Learning Track",
      description: "LLMs, Python, Prompting & Neural Networks",
      amount: 89.0,
      badge: "Trending",
    },
    {
      id: "cloud-devops",
      title: "Cloud Architecture & DevOps",
      description: "Docker, Kubernetes, AWS & CI/CD Pipelines",
      amount: 69.0,
      badge: null,
    },
  ];

  const currentPlan = plans.find((p) => p.id === selectedPlan) || plans[0];

  const validateForm = () => {
    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return false;
    }
    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      setErrorMessage("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) return;

    // Calculate centered coordinates for dedicated popup window
    const popupWidth = 520;
    const popupHeight = 750;
    const left = typeof window !== "undefined"
      ? Math.round(window.screenX + (window.outerWidth - popupWidth) / 2)
      : 100;
    const top = typeof window !== "undefined"
      ? Math.round(window.screenY + (window.outerHeight - popupHeight) / 2)
      : 100;
    const popupFeatures = `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=yes,resizable=yes,status=yes,toolbar=no,menubar=no,location=yes`;

    // Directly open the popup synchronously on user click so popup blockers allow it
    let paymentWindow: Window | null = null;
    try {
      paymentWindow = window.open("about:blank", "TikkiePaymentPopup", popupFeatures);
    } catch (err) {
      console.warn("Popup blocked or not permitted:", err);
    }

    setLoading(true);

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          amount: currentPlan.amount,
          customTikkieUrl: customTikkieUrl.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (paymentWindow && !paymentWindow.closed) {
          paymentWindow.close();
        }
        throw new Error(data.error || "Failed to process payment");
      }

      // Directly navigate the opened popup window to the official Tikkie URL
      if (paymentWindow && !paymentWindow.closed) {
        paymentWindow.location.href = data.tikkieUrl;
        paymentWindow.focus();
      } else {
        window.open(data.tikkieUrl, "TikkiePaymentPopup", popupFeatures);
      }

      // Successful save to MongoDB
      onPaymentSuccess(data.payment, data.tikkieUrl);
    } catch (err: unknown) {
      if (paymentWindow && !paymentWindow.closed) {
        paymentWindow.close();
      }
      console.error("Submission error:", err);
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Main Form Card */}
      <div className="relative rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Card Header Gradient */}
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 p-6 sm:p-7 text-white">
          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            ALH Academy Checkout
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-indigo-100">
            Enter your details below to proceed with your Tikkie payment.
          </p>
        </div>
        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-6">
          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-start gap-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 p-4 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 animate-fadeIn">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
              <div>
                <p className="font-semibold">Unable to process</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* User Information Inputs */}
          <div className="space-y-4">
            {/* Full Name Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="user-name-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
              >
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="user-name-input"
                  type="text"
                  required
                  placeholder="e.g. Alex van der Beek"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition"
                />
              </div>
            </div>

            {/* Email Address Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="user-email-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
              >
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="user-email-input"
                  type="email"
                  required
                  placeholder="e.g. alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="submit-pay-btn"
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-bold py-4 px-6 text-base shadow-lg shadow-indigo-600/25 hover:shadow-xl hover:shadow-indigo-600/30 active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Saving... &amp; Launching Tikkie...</span>
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                <span>Pay with Tikkie</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
