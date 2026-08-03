"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast as sonnerToast } from "sonner";
import { Copy, Check, X, Landmark, Loader2 } from "lucide-react";

const CONFIRM_WINDOW_SECONDS = 60;
const POLL_INTERVAL_MS = 5000;
const MAX_RETRY_WINDOW_MS = 45 * 60 * 1000;

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

type Phase = "idle" | "notifying" | "confirming" | "waiting" | "expired";

export default function BankTransferPaymentModal({ open, onClose, details, currencySymbol, onPaid }: BankTransferPaymentModalProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [countdown, setCountdown] = useState(CONFIRM_WINDOW_SECONDS);

  const firstAttemptAt = useRef<number | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = () => {
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    if (pollTimer.current) clearInterval(pollTimer.current);
    countdownTimer.current = null;
    pollTimer.current = null;
  };

  // Reset on every open/close toggle and whenever the order changes, rather
  // than leaking intervals or stale countdown state from a component that
  // stays mounted (it just renders null when closed) between opens.
  useEffect(() => {
    clearTimers();
    setPhase("idle");
    setCountdown(CONFIRM_WINDOW_SECONDS);
    firstAttemptAt.current = null;
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, details?.order_id]);

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

  const apiUrl = () => (process.env.NEXT_PUBLIC_API_URL || "https://api.frontstore.ng/api").replace(/\/+$/, "");

  const checkPaymentStatus = async (): Promise<boolean> => {
    if (!details?.order_id) return false;
    try {
      const res = await fetch(`${apiUrl()}/v1/public/orders/${details.order_id}`);
      if (!res.ok) return false;
      const json = await res.json();
      return json?.data?.payment_status === "paid";
    } catch {
      return false;
    }
  };

  // Watches for the webhook for CONFIRM_WINDOW_SECONDS. If it lands, we jump
  // straight to the paid state; if the window runs out first, the button
  // re-arms so the buyer can trigger another window rather than being stuck
  // on a dead "notified" state that never checks again.
  const startConfirmCycle = () => {
    clearTimers();
    setPhase("confirming");
    setCountdown(CONFIRM_WINDOW_SECONDS);

    pollTimer.current = setInterval(async () => {
      const paid = await checkPaymentStatus();
      if (paid) {
        clearTimers();
        onPaid?.();
        onClose();
      }
    }, POLL_INTERVAL_MS);

    countdownTimer.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearTimers();
          setPhase("waiting");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleImSent = async () => {
    if (!details.order_id || phase === "notifying" || phase === "confirming") return;

    if (firstAttemptAt.current && Date.now() - firstAttemptAt.current >= MAX_RETRY_WINDOW_MS) {
      setPhase("expired");
      return;
    }

    // Retrying after a timed-out window — just re-check, no need to notify
    // the merchant a second (or fifth) time for the same order.
    if (phase === "waiting") {
      startConfirmCycle();
      return;
    }

    firstAttemptAt.current = Date.now();
    setPhase("notifying");
    try {
      const res = await fetch(`${apiUrl()}/v1/public/orders/${details.order_id}/notify-payment-sent`, {
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
      startConfirmCycle();
    } catch (err: any) {
      sonnerToast.error(err.message || "Could not notify the merchant. Please try again.");
      setPhase("idle");
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

        {details.order_id && phase !== "expired" && (
          <button
            onClick={handleImSent}
            disabled={phase === "notifying" || phase === "confirming"}
            style={{
              width: "100%", marginTop: 16, padding: "13px 20px", borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: phase === "confirming" ? "var(--bg-2, #f1f5f9)" : "var(--brand, #16a34a)",
              color: phase === "confirming" ? "var(--text, #0A192F)" : "#fff",
              border: "none", fontWeight: 700, fontSize: 14.5,
              cursor: phase === "notifying" || phase === "confirming" ? "default" : "pointer",
            }}
          >
            {phase === "confirming" && <Loader2 size={16} className="bt-spin" />}
            {phase === "confirming"
              ? `Confirming your payment… ${countdown}s`
              : phase === "notifying"
              ? "Notifying merchant..."
              : phase === "waiting"
              ? "Still not received? Check again"
              : "I've sent the money"}
          </button>
        )}

        {phase === "expired" && (
          <div style={{
            marginTop: 16, padding: "13px 16px", borderRadius: 10,
            background: "var(--bg-2, #f1f5f9)", color: "var(--muted, #64748b)",
            fontSize: 13, lineHeight: 1.5, textAlign: "center",
          }}>
            We still haven't received confirmation for this transfer. Please contact the merchant directly so they can confirm your payment.
          </div>
        )}
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
