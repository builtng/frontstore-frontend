"use client";

import React, { useState } from "react";
import { toast as sonnerToast } from "sonner";
import { Copy, Check, X, Landmark } from "lucide-react";

export interface BankTransferDetails {
  order_id?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  amount?: number | string;
  currency_code?: string;
  order_number?: string;
}

interface BankTransferPaymentModalProps {
  open: boolean;
  onClose: () => void;
  details: BankTransferDetails | null;
  currencySymbol?: string;
  onPaid?: () => void;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦", GHS: "GH₵", KES: "KSh", ZAR: "R", USD: "$", GBP: "£", EUR: "€",
};

export default function BankTransferPaymentModal({ open, onClose, details, currencySymbol, onPaid }: BankTransferPaymentModalProps) {
  const [notifying, setNotifying] = useState(false);
  const [notified, setNotified] = useState(false);

  if (!open || !details) return null;

  const symbol = currencySymbol || CURRENCY_SYMBOLS[(details.currency_code || "NGN").toUpperCase()] || `${details.currency_code || ""} `;
  const amountLabel = details.amount !== undefined && details.amount !== null
    ? `${symbol}${Number(details.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : null;

  const copyAccountNumber = () => {
    if (!details.bank_account_number) return;
    navigator.clipboard?.writeText(details.bank_account_number);
    sonnerToast.success("Account number copied");
  };

  const handleImSent = async () => {
    if (!details.order_id || notifying) return;
    setNotifying(true);
    try {
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://api.frontstore.ng/api").replace(/\/+$/, "");
      const res = await fetch(`${API_URL}/v1/public/orders/${details.order_id}/notify-payment-sent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Something went wrong.");
      sonnerToast.success(json.message || "We've let the merchant know.");
      if (json.paid) {
        onPaid?.();
        onClose();
        return;
      }
      setNotified(true);
    } catch (err: any) {
      sonnerToast.error(err.message || "Could not notify the merchant. Please try again.");
    } finally {
      setNotifying(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "rgba(10, 25, 47, 0.55)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        padding: 0,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 440,
          background: "var(--surface, #fff)",
          borderRadius: "20px 20px 0 0",
          padding: "24px 22px 28px",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.25)",
          animation: "bt-modal-up 0.22s ease-out",
        }}
      >
        <style>{`@keyframes bt-modal-up { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } } @media (min-width: 480px) { .bt-modal-backdrop { align-items: center !important; } }`}</style>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "var(--brand, #16a34a)", display: "grid", placeItems: "center", flexShrink: 0,
            }}>
              <Landmark size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text, #0A192F)" }}>Complete Your Payment</div>
              {details.order_number && (
                <div style={{ fontSize: 12, color: "var(--muted, #64748b)" }}>Order #{details.order_number}</div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted, #64748b)", padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{
          background: "linear-gradient(135deg, var(--brand, #16a34a) 0%, color-mix(in srgb, var(--brand, #16a34a) 75%, #000) 100%)",
          borderRadius: 14, padding: "20px 20px", color: "#fff", marginBottom: 16,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.8, marginBottom: 4 }}>Bank</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>{details.bank_name}</div>

          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.8, marginBottom: 4 }}>Account Number</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "0.03em", fontVariantNumeric: "tabular-nums" }}>
              {details.bank_account_number}
            </div>
            <button
              onClick={copyAccountNumber}
              aria-label="Copy account number"
              style={{
                background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8,
                width: 30, height: 30, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0,
              }}
            >
              <Copy size={15} color="#fff" />
            </button>
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.8, marginBottom: 4 }}>Account Name</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{details.bank_account_name}</div>
        </div>

        {amountLabel && (
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 4px", borderTop: "1px solid var(--line, #e2e8f0)", marginBottom: 4,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted, #64748b)" }}>Amount to transfer</span>
            <span style={{ fontSize: 17, fontWeight: 800, color: "var(--text, #0A192F)" }}>{amountLabel}</span>
          </div>
        )}

        <div style={{
          display: "flex", alignItems: "flex-start", gap: 8, marginTop: 8,
          fontSize: 12.5, color: "var(--muted, #64748b)", lineHeight: 1.5,
        }}>
          <Check size={15} style={{ marginTop: 2, flexShrink: 0, color: "var(--brand, #16a34a)" }} />
          <span>Transfer the exact amount above — your payment is matched to this order automatically and you'll be notified the moment it's confirmed.</span>
        </div>

        {details.order_id && (
          <button
            onClick={handleImSent}
            disabled={notifying || notified}
            style={{
              width: "100%", marginTop: 16, padding: "13px 20px", borderRadius: 10,
              background: notified ? "var(--bg-2, #f1f5f9)" : "var(--brand, #16a34a)",
              color: notified ? "var(--muted, #64748b)" : "#fff",
              border: "none", fontWeight: 700, fontSize: 14.5,
              cursor: notifying || notified ? "default" : "pointer",
            }}
          >
            {notified ? "Merchant notified ✓" : notifying ? "Notifying merchant..." : "I've sent the money"}
          </button>
        )}

        <button
          onClick={onClose}
          style={{
            width: "100%", marginTop: 10, padding: "13px 20px", borderRadius: 10,
            background: "none", border: "1px solid var(--line, #e2e8f0)", color: "var(--text, #0A192F)",
            fontWeight: 700, fontSize: 14.5, cursor: "pointer",
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}
