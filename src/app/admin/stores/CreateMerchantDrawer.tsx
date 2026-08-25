'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { Field } from '../components';
import SearchableSelect from '../../../components/SearchableSelect';
import { businessPersonas } from '../../../utils/businessPersonas';

interface CreateMerchantDrawerProps {
  onClose: () => void;
  onCreated: () => void;
}

// Mirrors the exact field set collected by the real merchant signup flow
// (AuthController::completeSetup via /signup) — admin-created merchants
// go through no extra fields, just no OTP step.
export default function CreateMerchantDrawer({ onClose, onCreated }: CreateMerchantDrawerProps) {
  const { apiUrl, getHeaders, handleFetchResponse } = useAdmin();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [countryDialCode, setCountryDialCode] = useState('+234');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [storeName, setStoreName] = useState('');
  const [username, setUsername] = useState('');
  const [businessPersona, setBusinessPersona] = useState('general-store');
  const [primaryColor, setPrimaryColor] = useState('#25D366');
  const [submitting, setSubmitting] = useState(false);

  const personaOptions = businessPersonas.map((p) => ({ value: p.id, label: p.name, sublabel: p.persona }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !storeName.trim() || !username.trim()) {
      toast.error('Name, store name, and username are required.');
      return;
    }
    if (!email.trim() && !phoneNumber.trim()) {
      toast.error('Provide at least an email or a WhatsApp phone number.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${apiUrl}/v1/admin/stores`, {
        method: 'POST',
        credentials: 'include',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          country_dial_code: countryDialCode.trim() || undefined,
          phone_number: phoneNumber.trim() || undefined,
          store_name: storeName.trim(),
          username: username.trim().toLowerCase(),
          business_persona: businessPersona,
          primary_color: primaryColor,
        }),
      });
      const json = await handleFetchResponse(res, 'Failed to create merchant.');
      toast.success(json.message || 'Merchant created.');
      onCreated();
      onClose();
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-drawer-overlay" onClick={onClose}>
      <div className="admin-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="admin-drawer__header">
          <div>
            <h2>Create merchant</h2>
            <p>Same fields as merchant signup — no OTP step.</p>
          </div>
          <button className="admin-drawer__close" onClick={onClose} type="button">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-drawer__content">
          <div className="admin-drawer__section">
            <h3>Merchant</h3>
            <div className="admin-drawer__grid admin-drawer__grid--cols-2">
              <Field label="Full name" value={name} onChange={setName} placeholder="Full name" required />
              <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="merchant@example.com" />
              <Field label="Dial code" value={countryDialCode} onChange={setCountryDialCode} placeholder="+234" />
              <Field label="WhatsApp phone" value={phoneNumber} onChange={setPhoneNumber} placeholder="8012345678" />
            </div>
          </div>

          <div className="admin-drawer__section">
            <h3>Store</h3>
            <div className="admin-drawer__grid admin-drawer__grid--cols-2">
              <Field label="Store name" value={storeName} onChange={setStoreName} placeholder="Store name" required />
              <Field label="Username" value={username} onChange={setUsername} placeholder="store-handle" required />
              <label className="admin-field admin-field--full">
                <span>Business type</span>
                <SearchableSelect
                  options={personaOptions}
                  value={businessPersona}
                  onChange={setBusinessPersona}
                  placeholder="Select business type"
                  searchPlaceholder="Search business type..."
                />
              </label>
              <div className="admin-field admin-field--full">
                <span>Storefront Primary Color</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{ width: 44, height: 38, border: '1px solid var(--border-strong, #30303a)', borderRadius: 8, background: 'transparent', cursor: 'pointer', padding: 2 }}
                    aria-label="Store color"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.startsWith('#') && val.length <= 7) setPrimaryColor(val);
                      else if (!val.startsWith('#') && val.length <= 6) setPrimaryColor(`#${val}`);
                    }}
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: 13,
                      background: 'var(--surface-2, #1c1c21)',
                      border: '1px solid var(--border-strong, #30303a)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: 'var(--text, #f2f2f4)',
                      height: 38,
                      flex: 1,
                      boxSizing: 'border-box',
                    }}
                    placeholder="#25D366"
                  />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="admin-action" disabled={submitting} style={{ justifyContent: 'center' }}>
            {submitting ? <Loader2 size={15} className="animate-spin" /> : 'Create merchant'}
          </button>
        </form>
      </div>
    </div>
  );
}
