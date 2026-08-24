'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Sparkles, ShoppingCart, MessageSquare, Gift, RotateCcw } from 'lucide-react';
import { api } from '@/lib/api';
import Toggle from '@/components/Toggle';
import ProFeatureGate from '@/components/dashboard/ProFeatureGate';

interface AutomationSetting {
  cart_recovery_enabled: boolean;
  order_confirmation_enabled: boolean;
  receipt_delivery_enabled: boolean;
  thank_you_enabled: boolean;
  review_request_enabled: boolean;
  win_back_enabled: boolean;
  win_back_days: number;
  win_back_coupon_code: string;
  channels: string[];
}

interface AutomationsTabProps {
  isPro: boolean;
  navigateDashboardTab: (tab: 'billing') => void;
}

const DEFAULT_AUTOMATION_SETTING: AutomationSetting = {
  cart_recovery_enabled: false,
  order_confirmation_enabled: false,
  receipt_delivery_enabled: false,
  thank_you_enabled: false,
  review_request_enabled: false,
  win_back_enabled: false,
  win_back_days: 30,
  win_back_coupon_code: '',
  channels: ['email', 'whatsapp'],
};

export default function AutomationsTab({ isPro, navigateDashboardTab }: AutomationsTabProps) {
  const [automationSetting, setAutomationSetting] = useState<AutomationSetting>(DEFAULT_AUTOMATION_SETTING);
  const [automationLoading, setAutomationLoading] = useState(false);

  const fetchAutomationSettingsData = async () => {
    if (!isPro) return;
    try {
      setAutomationLoading(true);
      const data = await api.get<AutomationSetting>('/v1/store/automations');
      setAutomationSetting(data);
    } catch {
      toast.error('Failed to load growth automation settings.');
    } finally {
      setAutomationLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomationSettingsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro]);

  const handleSaveAutomationSettings = async () => {
    try {
      setAutomationLoading(true);
      await api.put('/v1/store/automations', automationSetting);
      toast.success('Automation settings saved successfully.');
    } catch {
      toast.error('Failed to save settings.');
    } finally {
      setAutomationLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--r-md)',
            background: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(236, 72, 153, 0.3)', flexShrink: 0
          }}>
            <Sparkles size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900, lineHeight: 1.2 }}>
              Growth Automations
            </h2>
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
              Configure triggers, channels, and campaigns to automatically recover lost sales.
            </p>
          </div>
        </div>
        {isPro && (
          <button
            onClick={handleSaveAutomationSettings}
            className="btn btn-primary clickable"
            style={{ padding: '8px 16px', fontSize: 13.5 }}
          >
            Save Settings
          </button>
        )}
      </div>

      {!isPro ? (
        <ProFeatureGate
          title="Growth & Marketing Journeys"
          subtitle="Launch automated multi-channel buyer flows. Recover abandoned carts, dispatch instant WhatsApp receipts, and trigger win-back coupon offers."
          icon={Sparkles}
          badgeText="PRO MARKETING AUTOMATION"
          onUpgrade={() => navigateDashboardTab('billing')}
          features={[
            {
              icon: ShoppingCart,
              title: 'Cart Recovery Flows',
              description: 'Automatically follow up on abandoned checkouts via WhatsApp & Email.',
            },
            {
              icon: MessageSquare,
              title: 'WhatsApp Receipts',
              description: 'Send instant automated WhatsApp order confirmations & payment receipts.',
            },
            {
              icon: Gift,
              title: 'Automated Coupons',
              description: 'Trigger thank-you gifts and post-purchase discount codes automatically.',
            },
            {
              icon: RotateCcw,
              title: 'Customer Win-Backs',
              description: 'Re-engage inactive buyers with scheduled automated promo campaigns.',
            },
          ]}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Channels selector */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14.5, fontWeight: 800 }}>Enabled Notification Channels</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Select the multi-channel notification destinations for automated flows.</p>
            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              {['email', 'whatsapp'].map(ch => {
                const active = automationSetting.channels?.includes(ch);
                return (
                  <label key={ch} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, cursor: 'pointer', fontWeight: 700 }}>
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={e => {
                        const nextChs = e.target.checked
                          ? [...(automationSetting.channels || []), ch]
                          : (automationSetting.channels || []).filter((x: string) => x !== ch);
                        setAutomationSetting({ ...automationSetting, channels: nextChs });
                      }}
                    />
                    {ch.toUpperCase()}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Automations list */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            {/* Cart Recovery */}
            <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 850 }}>Abandoned Cart Recovery</h3>
                  <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>Automatically recovers shoppers who dropped off during checkout without completing payment.</p>
                </div>
                <Toggle
                  checked={automationSetting.cart_recovery_enabled}
                  onChange={val => setAutomationSetting({ ...automationSetting, cart_recovery_enabled: val })}
                />
              </div>
            </div>

            {/* Order Confirmation */}
            <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 850 }}>Immediate Order Confirmation</h3>
                  <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>Sends immediate, rich order alerts with tracking links upon verified customer purchase.</p>
                </div>
                <Toggle
                  checked={automationSetting.order_confirmation_enabled}
                  onChange={val => setAutomationSetting({ ...automationSetting, order_confirmation_enabled: val })}
                />
              </div>
            </div>

            {/* Receipt Delivery */}
            <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 850 }}>Instant Receipt PDF Dispatch</h3>
                  <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>Generates and delivers printable receipts right to customer inbox instantly.</p>
                </div>
                <Toggle
                  checked={automationSetting.receipt_delivery_enabled}
                  onChange={val => setAutomationSetting({ ...automationSetting, receipt_delivery_enabled: val })}
                />
              </div>
            </div>

            {/* Thank You Coupon */}
            <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 850 }}>Customer Appreciation & Coupons</h3>
                  <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>Delivers a special thank you appreciation note along with an active coupon discount code.</p>
                </div>
                <Toggle
                  checked={automationSetting.thank_you_enabled}
                  onChange={val => setAutomationSetting({ ...automationSetting, thank_you_enabled: val })}
                />
              </div>
            </div>

            {/* Review Request */}
            <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 850 }}>Delayed Review Requests</h3>
                  <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>Triggers review feedback prompts 3 days after payment to build storefront social proof.</p>
                </div>
                <Toggle
                  checked={automationSetting.review_request_enabled}
                  onChange={val => setAutomationSetting({ ...automationSetting, review_request_enabled: val })}
                />
              </div>
            </div>

            {/* Win-back campaign */}
            <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 850 }}>Merchant Win-back Campaigns</h3>
                  <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>Nudges inactive customers who haven't made a purchase within a configured amount of days.</p>
                </div>
                <Toggle
                  checked={automationSetting.win_back_enabled}
                  onChange={val => setAutomationSetting({ ...automationSetting, win_back_enabled: val })}
                />
              </div>
              {automationSetting.win_back_enabled && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Inactive Days Trigger</label>
                    <input
                      type="number"
                      value={automationSetting.win_back_days}
                      onChange={e => setAutomationSetting({ ...automationSetting, win_back_days: parseInt(e.target.value) || 30 })}
                      className="form-control"
                      style={{ marginTop: 6 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Discount Coupon Code</label>
                    <input
                      type="text"
                      value={automationSetting.win_back_coupon_code}
                      onChange={e => setAutomationSetting({ ...automationSetting, win_back_coupon_code: e.target.value })}
                      placeholder="e.g. WELCOMEBACK"
                      className="form-control"
                      style={{ marginTop: 6 }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
