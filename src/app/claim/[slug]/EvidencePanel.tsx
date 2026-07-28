'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  CheckCircle2, FileText, Camera, MapPinned, Globe2, Mail, Phone,
  Share2, Loader2, ChevronRight,
} from 'lucide-react';
import SearchableSelect from '../../../components/SearchableSelect';

interface EvidencePanelProps {
  claimKey: string;
  website: string | null;
  signupUrl: string;
}

const DOCUMENT_TYPES = [
  { value: 'cac_certificate', label: 'CAC Certificate' },
  { value: 'business_registration', label: 'Business Registration Certificate' },
  { value: 'tax_certificate', label: 'Tax Certificate' },
  { value: 'utility_bill', label: 'Utility Bill' },
  { value: 'rent_agreement', label: 'Shop Rent Agreement' },
  { value: 'invoice', label: 'Official Invoice' },
  { value: 'letterhead', label: 'Company Letterhead' },
];

const PHOTO_TYPES = [
  { value: 'selfie_at_shop', label: 'Selfie in front of the shop' },
  { value: 'shop_signage', label: 'Shop signage' },
  { value: 'shop_interior', label: 'Shop interior' },
  { value: 'products_displayed', label: 'Products displayed' },
];

const SOCIAL_PLATFORMS = ['facebook', 'instagram', 'linkedin', 'tiktok'];
const SOCIAL_PLATFORM_OPTIONS = SOCIAL_PLATFORMS.map((p) => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }));

function Section({ icon, title, description, done, children }: { icon: React.ReactNode; title: string; description: string; done: boolean; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: 18, marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
        <span style={{ color: done ? 'var(--primary)' : 'var(--text-faint)', flexShrink: 0, marginTop: 2 }}>
          {done ? <CheckCircle2 size={16} /> : icon}
        </span>
        <div>
          <h4 style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>{title}</h4>
          <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function EvidencePanel({ claimKey, website, signupUrl }: EvidencePanelProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
  const router = useRouter();

  const [docsSubmitted, setDocsSubmitted] = useState<string[]>([]);
  const [photosSubmitted, setPhotosSubmitted] = useState<string[]>([]);
  const [gpsDone, setGpsDone] = useState(false);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [socialDone, setSocialDone] = useState(false);

  const [docType, setDocType] = useState(DOCUMENT_TYPES[0].value);
  const [docBusy, setDocBusy] = useState(false);
  const [photoType, setPhotoType] = useState(PHOTO_TYPES[0].value);
  const [photoBusy, setPhotoBusy] = useState(false);

  const [emailValue, setEmailValue] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailBusy, setEmailBusy] = useState(false);

  const [phoneValue, setPhoneValue] = useState('');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneBusy, setPhoneBusy] = useState(false);

  const [socialPlatform, setSocialPlatform] = useState(SOCIAL_PLATFORMS[0]);
  const [socialUrl, setSocialUrl] = useState('');
  const [socialBusy, setSocialBusy] = useState(false);

  const [websiteInstructions, setWebsiteInstructions] = useState<{ html_file: { filename: string; content: string; url: string }; meta_tag: string; dns_txt: { host: string; record: string } } | null>(null);
  const [websiteBusy, setWebsiteBusy] = useState(false);
  const [websiteMethod, setWebsiteMethod] = useState<'html' | 'meta' | 'dns'>('meta');

  const evidenceCount = docsSubmitted.length + photosSubmitted.length + (gpsDone ? 1 : 0) + (emailVerified ? 1 : 0) + (phoneVerified ? 1 : 0) + (socialDone ? 1 : 0);

  const post = async (path: string, body: BodyInit, isJson = true) => {
    const res = await fetch(`${API_URL}/v1/public/frontstore-stores/${claimKey}${path}`, {
      method: 'POST',
      headers: isJson ? { 'Content-Type': 'application/json', Accept: 'application/json' } : { Accept: 'application/json' },
      body,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Something went wrong.');
    return json;
  };

  const handleDocSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const file = (e.currentTarget.elements.namedItem('file') as HTMLInputElement)?.files?.[0];
    if (!file) { toast.error('Choose a file first.'); return; }
    const form = new FormData();
    form.append('subtype', docType);
    form.append('file', file);
    try {
      setDocBusy(true);
      await post('/evidence/document', form, false);
      setDocsSubmitted((d) => [...d, docType]);
      toast.success('Document uploaded.');
      e.currentTarget.reset();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDocBusy(false);
    }
  };

  const handlePhotoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const file = (e.currentTarget.elements.namedItem('file') as HTMLInputElement)?.files?.[0];
    if (!file) { toast.error('Choose a photo first.'); return; }
    const form = new FormData();
    form.append('subtype', photoType);
    form.append('file', file);
    try {
      setPhotoBusy(true);
      await post('/evidence/photo', form, false);
      setPhotosSubmitted((p) => [...p, photoType]);
      toast.success('Photo uploaded.');
      e.currentTarget.reset();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPhotoBusy(false);
    }
  };

  const handleGps = () => {
    if (!navigator.geolocation) { toast.error('Location isn\'t available in this browser.'); return; }
    setGpsBusy(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const json = await post('/evidence/gps', JSON.stringify({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
          toast[json.data?.meta?.within_radius ? 'success' : 'error'](json.message);
          setGpsDone(true);
        } catch (err: any) {
          toast.error(err.message);
        } finally {
          setGpsBusy(false);
        }
      },
      () => { toast.error('Could not read your location.'); setGpsBusy(false); },
    );
  };

  const handleSendEmailOtp = async () => {
    if (!emailValue.trim()) { toast.error('Enter your email first.'); return; }
    try {
      setEmailBusy(true);
      await post('/evidence/email/send-otp', JSON.stringify({ email: emailValue.trim() }));
      setEmailOtpSent(true);
      toast.success('Code sent — check your inbox.');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setEmailBusy(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    try {
      setEmailBusy(true);
      await post('/evidence/email/verify-otp', JSON.stringify({ otp: emailOtp.trim() }));
      setEmailVerified(true);
      toast.success('Email verified.');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setEmailBusy(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    if (!phoneValue.trim()) { toast.error('Enter your WhatsApp number first.'); return; }
    try {
      setPhoneBusy(true);
      await post('/evidence/phone/send-otp', JSON.stringify({ phone: phoneValue.trim() }));
      setPhoneOtpSent(true);
      toast.success('Code sent via WhatsApp.');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPhoneBusy(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    try {
      setPhoneBusy(true);
      await post('/evidence/phone/verify-otp', JSON.stringify({ otp: phoneOtp.trim() }));
      setPhoneVerified(true);
      toast.success('Phone verified.');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPhoneBusy(false);
    }
  };

  const handleSocialSubmit = async () => {
    if (!socialUrl.trim()) { toast.error('Paste the profile URL first.'); return; }
    try {
      setSocialBusy(true);
      await post('/evidence/social', JSON.stringify({ platform: socialPlatform, url: socialUrl.trim() }));
      setSocialDone(true);
      toast.success('Social link recorded.');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSocialBusy(false);
    }
  };

  const handleStartWebsiteVerification = async () => {
    try {
      setWebsiteBusy(true);
      const json = await post('/evidence/website/start', JSON.stringify({}));
      setWebsiteInstructions(json.data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setWebsiteBusy(false);
    }
  };

  const handleCheckWebsiteVerification = async () => {
    try {
      setWebsiteBusy(true);
      const json = await post('/evidence/website/check', JSON.stringify({}));
      toast.success('Website ownership verified — taking you to finish your store.');
      const url = new URL(signupUrl, window.location.origin);
      url.searchParams.set('setup_token', json.data.setup_token);
      router.push(url.pathname + url.search);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setWebsiteBusy(false);
    }
  };

  return (
    <div>
      <div className="card" style={{ padding: '16px 18px', marginBottom: 18, background: 'var(--surface)' }}>
        <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          No phone or email is on file for this listing, so ownership needs to be verified another way.
          Submit as much of the below as you can — a Frontstore admin reviews everything before approving.
          {evidenceCount > 0 && <strong style={{ color: 'var(--primary)' }}> {evidenceCount} item{evidenceCount === 1 ? '' : 's'} submitted so far.</strong>}
        </p>
      </div>

      {website && (
        <Section icon={<Globe2 size={16} />} title="Verify website ownership (fastest)" description={`Prove you control ${website} and get approved instantly.`} done={false}>
          {!websiteInstructions ? (
            <button type="button" className="btn btn-outline clickable" style={{ fontSize: 12.5, padding: '8px 14px' }} onClick={handleStartWebsiteVerification} disabled={websiteBusy}>
              {websiteBusy ? <Loader2 size={14} className="animate-spin" /> : 'Start website verification'}
            </button>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                {(['meta', 'html', 'dns'] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setWebsiteMethod(m)} className={`category-chip${websiteMethod === m ? ' active' : ''}`}>
                    {m === 'meta' ? 'Meta tag' : m === 'html' ? 'HTML file' : 'DNS TXT'}
                  </button>
                ))}
              </div>
              {websiteMethod === 'meta' && (
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Add this to your homepage&apos;s <code>&lt;head&gt;</code>:</p>
                  <code style={{ display: 'block', background: 'var(--surface-2)', padding: 10, borderRadius: 8, fontSize: 11, wordBreak: 'break-all' }}>{websiteInstructions.meta_tag}</code>
                </div>
              )}
              {websiteMethod === 'html' && (
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Upload a file at this exact URL containing this text:</p>
                  <code style={{ display: 'block', background: 'var(--surface-2)', padding: 10, borderRadius: 8, fontSize: 11, wordBreak: 'break-all', marginBottom: 6 }}>{websiteInstructions.html_file.url}</code>
                  <p style={{ fontSize: 11, color: 'var(--text-faint)' }}>File content: <code>{websiteInstructions.html_file.content}</code></p>
                </div>
              )}
              {websiteMethod === 'dns' && (
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Add this TXT record to {websiteInstructions.dns_txt.host}:</p>
                  <code style={{ display: 'block', background: 'var(--surface-2)', padding: 10, borderRadius: 8, fontSize: 11, wordBreak: 'break-all' }}>{websiteInstructions.dns_txt.record}</code>
                </div>
              )}
              <button type="button" className="btn btn-primary clickable" style={{ fontSize: 12.5, padding: '8px 14px', marginTop: 10 }} onClick={handleCheckWebsiteVerification} disabled={websiteBusy}>
                {websiteBusy ? <Loader2 size={14} className="animate-spin" /> : <>I&apos;ve added it — check now <ChevronRight size={12} /></>}
              </button>
            </div>
          )}
        </Section>
      )}

      <Section icon={<Mail size={16} />} title="Verify a business email" description="We'll send a 6-digit code." done={emailVerified}>
        {emailVerified ? (
          <p style={{ fontSize: 12.5, color: 'var(--primary)', fontWeight: 600 }}>{emailValue} verified</p>
        ) : (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input type="email" value={emailValue} onChange={(e) => setEmailValue(e.target.value)} placeholder="you@business.com" style={{ flex: 1, minWidth: 160, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12.5 }} disabled={emailOtpSent} />
            {!emailOtpSent ? (
              <button type="button" className="btn btn-outline clickable" style={{ fontSize: 12, padding: '8px 12px' }} onClick={handleSendEmailOtp} disabled={emailBusy}>
                {emailBusy ? <Loader2 size={13} className="animate-spin" /> : 'Send code'}
              </button>
            ) : (
              <>
                <input value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} placeholder="6-digit code" style={{ width: 100, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12.5 }} />
                <button type="button" className="btn btn-primary clickable" style={{ fontSize: 12, padding: '8px 12px' }} onClick={handleVerifyEmailOtp} disabled={emailBusy}>
                  {emailBusy ? <Loader2 size={13} className="animate-spin" /> : 'Verify'}
                </button>
              </>
            )}
          </div>
        )}
      </Section>

      <Section icon={<Phone size={16} />} title="Verify a business phone" description="Code sent via WhatsApp." done={phoneVerified}>
        {phoneVerified ? (
          <p style={{ fontSize: 12.5, color: 'var(--primary)', fontWeight: 600 }}>{phoneValue} verified</p>
        ) : (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input value={phoneValue} onChange={(e) => setPhoneValue(e.target.value)} placeholder="+2348012345678" style={{ flex: 1, minWidth: 160, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12.5 }} disabled={phoneOtpSent} />
            {!phoneOtpSent ? (
              <button type="button" className="btn btn-outline clickable" style={{ fontSize: 12, padding: '8px 12px' }} onClick={handleSendPhoneOtp} disabled={phoneBusy}>
                {phoneBusy ? <Loader2 size={13} className="animate-spin" /> : 'Send code'}
              </button>
            ) : (
              <>
                <input value={phoneOtp} onChange={(e) => setPhoneOtp(e.target.value)} placeholder="6-digit code" style={{ width: 100, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12.5 }} />
                <button type="button" className="btn btn-primary clickable" style={{ fontSize: 12, padding: '8px 12px' }} onClick={handleVerifyPhoneOtp} disabled={phoneBusy}>
                  {phoneBusy ? <Loader2 size={13} className="animate-spin" /> : 'Verify'}
                </button>
              </>
            )}
          </div>
        )}
      </Section>

      <Section icon={<FileText size={16} />} title="Upload a business document" description="CAC, tax certificate, utility bill, rent agreement, invoice, or letterhead." done={docsSubmitted.length > 0}>
        <form onSubmit={handleDocSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ minWidth: 220 }}>
            <SearchableSelect options={DOCUMENT_TYPES} value={docType} onChange={setDocType} placeholder="Document type" searchPlaceholder="Search document type..." />
          </div>
          <input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png" style={{ fontSize: 12 }} />
          <button type="submit" className="btn btn-outline clickable" style={{ fontSize: 12, padding: '8px 12px' }} disabled={docBusy}>
            {docBusy ? <Loader2 size={13} className="animate-spin" /> : 'Upload'}
          </button>
        </form>
        {docsSubmitted.length > 0 && <p style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 8 }}>{docsSubmitted.length} document(s) submitted.</p>}
      </Section>

      <Section icon={<Camera size={16} />} title="Upload a photo" description="Selfie at the shop, signage, interior, or products." done={photosSubmitted.length > 0}>
        <form onSubmit={handlePhotoSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ minWidth: 200 }}>
            <SearchableSelect options={PHOTO_TYPES} value={photoType} onChange={setPhotoType} placeholder="Photo type" searchPlaceholder="Search photo type..." />
          </div>
          <input type="file" name="file" accept=".jpg,.jpeg,.png,.webp" style={{ fontSize: 12 }} />
          <button type="submit" className="btn btn-outline clickable" style={{ fontSize: 12, padding: '8px 12px' }} disabled={photoBusy}>
            {photoBusy ? <Loader2 size={13} className="animate-spin" /> : 'Upload'}
          </button>
        </form>
        {photosSubmitted.length > 0 && <p style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 8 }}>{photosSubmitted.length} photo(s) submitted.</p>}
      </Section>

      <Section icon={<MapPinned size={16} />} title="Verify your location" description="Confirm you're physically at the business (supporting evidence only)." done={gpsDone}>
        <button type="button" className="btn btn-outline clickable" style={{ fontSize: 12.5, padding: '8px 14px' }} onClick={handleGps} disabled={gpsBusy}>
          {gpsBusy ? <Loader2 size={14} className="animate-spin" /> : 'Check my location'}
        </button>
      </Section>

      <Section icon={<Share2 size={16} />} title="Link a social media page" description="Weak supporting evidence, manually reviewed." done={socialDone}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 160 }}>
            <SearchableSelect options={SOCIAL_PLATFORM_OPTIONS} value={socialPlatform} onChange={setSocialPlatform} placeholder="Platform" searchPlaceholder="Search platform..." />
          </div>
          <input value={socialUrl} onChange={(e) => setSocialUrl(e.target.value)} placeholder="https://..." style={{ flex: 1, minWidth: 160, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12.5 }} />
          <button type="button" className="btn btn-outline clickable" style={{ fontSize: 12, padding: '8px 12px' }} onClick={handleSocialSubmit} disabled={socialBusy}>
            {socialBusy ? <Loader2 size={13} className="animate-spin" /> : 'Add'}
          </button>
        </div>
      </Section>
    </div>
  );
}
