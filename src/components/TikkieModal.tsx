"use client";

import React from "react";
import {
  ExternalLink,
  X,
  CheckCircle2,
  XCircle,
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

interface TikkieModalProps {
  isOpen: boolean;
  payment: PaymentData | null;
  tikkieUrl: string;
  onClose: () => void;
  onPaymentCompleted: () => void;
  onPaymentFailed: () => void;
}

export const TikkieModal: React.FC<TikkieModalProps> = ({
  isOpen,
  payment,
  tikkieUrl,
  onClose,
  onPaymentCompleted,
  onPaymentFailed,
}) => {
  if (!isOpen || !payment) return null;

  const formattedAmount = (payment.amount || 49.0).toFixed(2);

  const handleOpenPopup = () => {
    const popupWidth = 520;
    const popupHeight = 750;
    const left =
      typeof window !== "undefined"
        ? Math.round(window.screenX + (window.outerWidth - popupWidth) / 2)
        : 100;
    const top =
      typeof window !== "undefined"
        ? Math.round(window.screenY + (window.outerHeight - popupHeight) / 2)
        : 100;
    const popupFeatures = `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=yes,resizable=yes,status=yes,toolbar=no,menubar=no,location=yes`;
    window.open(tikkieUrl, "TikkiePaymentPopup", popupFeatures);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md transition-all animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tikkie-modal-title"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden transform transition-all animate-scaleUp">
        {/* Official Tikkie Header */}


        {/* Modal Body: Only the three requested buttons */}
        <div className="p-6 space-y-3">
          {/* Payment completed */}
          <button
            id="btn-payment-completed"
            type="button"
            onClick={onPaymentCompleted}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25 active:scale-[0.99] transition cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Payment completed
          </button>

          {/* Reopen Tikkie Button */}
          <button
            id="btn-reopen-tikkie"
            type="button"
            onClick={handleOpenPopup}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-[#6C1D5F] dark:text-purple-300 font-bold text-sm border-2 border-purple-200 dark:border-purple-800/80 transition cursor-pointer active:scale-[0.99]"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            Reopen Tikkie
          </button>

          {/* Outcome Buttons: Payment completed & Payment failed */}
          <div className="grid grid-cols-1 gap-3 pt-1">
            {/* Payment failed */}
            <button
              id="btn-payment-failed"
              type="button"
              onClick={onPaymentFailed}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl border-2 border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-sm hover:bg-rose-100 dark:hover:bg-rose-900/60 active:scale-[0.99] transition cursor-pointer"
            >
              <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
              Payment failed
            </button>


          </div>
        </div>
      </div>
    </div>
  );
};
