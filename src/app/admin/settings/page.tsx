'use client';

import React, { useEffect, useState } from 'react';
import { useAdmin } from '../AdminContext';
import { toast } from 'sonner';
import {
  Check,
  Globe,
  Loader2,
  Mail,
  MessageSquare,
  Power,
  RefreshCw,
  Settings,
  Shield,
  Smartphone,
  Users,
  DollarSign,
  LayoutDashboard,
} from 'lucide-react';
import { SkeletonGrid, Field, TextAreaField, SelectField, SettingsGroup } from '../components';

const MODULE_LABELS: Record<string, string> = {
  qr_code: 'My QR Code',
  whatsapp_inbox: 'WhatsApp Inbox',
  whatsapp_order_alerts: 'WhatsApp Order Alerts',
  whatsapp_order: 'WhatsApp Order',
};

export default function AdminSettingsPage() {
  const {
    token,
    apiUrl,
    getHeaders,
    handleFetchResponse,
    settings,
    setSettings,
    settingsLoading,
    loadSettings,
  } = useAdmin();

  const [settingsSaving, setSettingsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('branding');

  // Visual helper states for homepage_content and mobile_hero JSON configs
  const [visualHomeHeroPrefix, setVisualHomeHeroPrefix] = useState('');
  const [visualHomeHeroHighlight, setVisualHomeHeroHighlight] = useState('');
  const [visualHomeHeroDesc, setVisualHomeHeroDesc] = useState('');
  const [visualHomeStatsCount, setVisualHomeStatsCount] = useState('');
  const [visualHomeStatsText, setVisualHomeStatsText] = useState('');
  const [visualHomeVisionQuote, setVisualHomeVisionQuote] = useState('');
  const [visualHomeVisionCite, setVisualHomeVisionCite] = useState('');

  const [visualMobileBadge, setVisualMobileBadge] = useState('');
  const [visualMobileTitle, setVisualMobileTitle] = useState('');
  const [visualMobileSubtitle, setVisualMobileSubtitle] = useState('');
  const [visualMobileGradStart, setVisualMobileGradStart] = useState('');
  const [visualMobileGradEnd, setVisualMobileGradEnd] = useState('');

  useEffect(() => {
    if (token) {
      loadSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (settings) {
      // Parse homepage content
      try {
        const homeObj = settings.homepage_content ? JSON.parse(settings.homepage_content) : {};
        setVisualHomeHeroPrefix(homeObj.hero?.titlePrefix || '');
        setVisualHomeHeroHighlight(homeObj.hero?.titleHighlight || '');
        setVisualHomeHeroDesc(homeObj.hero?.description || '');
        setVisualHomeStatsCount(homeObj.stats?.sellerCount || '');
        setVisualHomeStatsText(homeObj.stats?.text || '');
        setVisualHomeVisionQuote(homeObj.vision?.quote || '');
        setVisualHomeVisionCite(homeObj.vision?.cite || '');
      } catch (err) {
        console.error('Could not parse homepage_content JSON:', err);
      }

      // Parse mobile hero
      try {
        const mobObj = settings.mobile_hero ? JSON.parse(settings.mobile_hero) : {};
        setVisualMobileBadge(mobObj.badge || '');
        setVisualMobileTitle(mobObj.title || '');
        setVisualMobileSubtitle(mobObj.subtitle || '');
        setVisualMobileGradStart(mobObj.gradient_start || '');
        setVisualMobileGradEnd(mobObj.gradient_end || '');
      } catch (err) {
        console.error('Could not parse mobile_hero JSON:', err);
      }
    }
  }, [settings]);

  const handleSaveSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSettingsSaving(true);

      // Serialize home content JSON
      let homeObj = {};
      try {
        homeObj = settings.homepage_content ? JSON.parse(settings.homepage_content) : {};
      } catch {}
      const finalHomeContent = {
        ...homeObj,
        hero: {
          ...(homeObj as any).hero,
          titlePrefix: visualHomeHeroPrefix,
          titleHighlight: visualHomeHeroHighlight,
          description: visualHomeHeroDesc,
        },
        stats: {
          ...(homeObj as any).stats,
          sellerCount: visualHomeStatsCount,
          text: visualHomeStatsText,
        },
        vision: {
          ...(homeObj as any).vision,
          quote: visualHomeVisionQuote,
          cite: visualHomeVisionCite,
        },
      };

      // Serialize mobile hero JSON
      let mobObj = {};
      try {
        mobObj = settings.mobile_hero ? JSON.parse(settings.mobile_hero) : {};
      } catch {}
      const finalMobileHero = {
        ...mobObj,
        badge: visualMobileBadge,
        title: visualMobileTitle,
        subtitle: visualMobileSubtitle,
        gradient_start: visualMobileGradStart,
        gradient_end: visualMobileGradEnd,
      };

      const payload = {
        ...settings,
        homepage_content: JSON.stringify(finalHomeContent),
        mobile_hero: JSON.stringify(finalMobileHero),
      };

      const res = await fetch(`${apiUrl}/v1/admin/settings`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      await handleFetchResponse(res, 'Could not save settings.');
      setSettings(payload);
      toast.success('Settings saved.');
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setSettingsSaving(false);
    }
  };

  return (
    <section className="admin-section animate-fade-in">
      <div className="admin-section-heading">
        <div>
          <h2>System settings</h2>
          <p>Platform branding, registration, KYC, mail, integrations, and homepage configuration.</p>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          onClick={loadSettings}
          disabled={settingsLoading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={16} className={settingsLoading ? 'admin-spin' : ''} /> Reload
        </button>
      </div>

      {settingsLoading ? (
        <SkeletonGrid />
      ) : (
        <form className="admin-settings-form admin-settings-layout" onSubmit={handleSaveSettings}>
          <div className="admin-settings-nav">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'branding'}
              onClick={() => setActiveTab('branding')}
              className={`admin-settings-nav-item ${activeTab === 'branding' ? 'is-active' : ''}`}
            >
              <Globe size={15} />
              Branding
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'pricing'}
              onClick={() => setActiveTab('pricing')}
              className={`admin-settings-nav-item ${activeTab === 'pricing' ? 'is-active' : ''}`}
            >
              <DollarSign size={15} />
              Pricing
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'modules'}
              onClick={() => setActiveTab('modules')}
              className={`admin-settings-nav-item ${activeTab === 'modules' ? 'is-active' : ''}`}
            >
              <Power size={15} />
              Modules
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'registration'}
              onClick={() => setActiveTab('registration')}
              className={`admin-settings-nav-item ${activeTab === 'registration' ? 'is-active' : ''}`}
            >
              <Users size={15} />
              Registration
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'kyc'}
              onClick={() => setActiveTab('kyc')}
              className={`admin-settings-nav-item ${activeTab === 'kyc' ? 'is-active' : ''}`}
            >
              <Shield size={15} />
              KYC / Identity
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'mobile'}
              onClick={() => setActiveTab('mobile')}
              className={`admin-settings-nav-item ${activeTab === 'mobile' ? 'is-active' : ''}`}
            >
              <Smartphone size={15} />
              Mobile App
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'smtp'}
              onClick={() => setActiveTab('smtp')}
              className={`admin-settings-nav-item ${activeTab === 'smtp' ? 'is-active' : ''}`}
            >
              <Mail size={15} />
              SMTP Mail
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'twilio'}
              onClick={() => setActiveTab('twilio')}
              className={`admin-settings-nav-item ${activeTab === 'twilio' ? 'is-active' : ''}`}
            >
              <MessageSquare size={15} />
              Twilio
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'socials'}
              onClick={() => setActiveTab('socials')}
              className={`admin-settings-nav-item ${activeTab === 'socials' ? 'is-active' : ''}`}
            >
              <MessageSquare size={15} />
              Socials
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'homepage'}
              onClick={() => setActiveTab('homepage')}
              className={`admin-settings-nav-item ${activeTab === 'homepage' ? 'is-active' : ''}`}
            >
              <LayoutDashboard size={15} />
              Homepage
            </button>
            <div className="admin-settings-nav-footer">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={settingsSaving}
                style={{ width: '100%', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                {settingsSaving ? <Loader2 className="admin-spin" size={17} /> : <Check size={17} />}
                Save all settings
              </button>
            </div>
          </div>

          <div className="admin-settings-content">
            {activeTab === 'branding' && (
              <SettingsGroup icon={<Globe size={17} />} title="Branding & Domain settings" id="settings-branding">
                <Field
                  label="App name"
                  value={settings.app_name}
                  onChange={(value) => setSettings({ ...settings, app_name: value })}
                  required
                />
                <Field
                  label="Logo URL"
                  value={settings.logo_url}
                  onChange={(value) => setSettings({ ...settings, logo_url: value })}
                />
                <Field
                  label="System Domain"
                  value={settings.system_domain}
                  onChange={(value) => setSettings({ ...settings, system_domain: value })}
                  placeholder="e.g. frontstore.app"
                  description="The main platform domain used for link generation and routing."
                  required
                />
                <Field
                  label="Support Email"
                  value={settings.support_email}
                  onChange={(value) => setSettings({ ...settings, support_email: value })}
                  placeholder="e.g. hello@frontstore.app"
                  description="Support email address displayed on error/help screens."
                  type="email"
                />
                <Field
                  label="Global Storefront Disclaimer"
                  value={settings.store_disclaimer}
                  onChange={(value) => setSettings({ ...settings, store_disclaimer: value })}
                  placeholder="e.g. Ensure you verify product quality before checkout"
                  description="The disclaimer message shown to buyers across storefronts."
                  full={true}
                />
              </SettingsGroup>
            )}

            {activeTab === 'pricing' && (
              <SettingsGroup icon={<DollarSign size={17} />} title="Subscription Pricing" id="settings-pricing">
                <Field
                  label="Pro Monthly Price (NGN)"
                  type="number"
                  value={String(settings.pro_monthly_price)}
                  onChange={(value) => setSettings({ ...settings, pro_monthly_price: value })}
                  placeholder="e.g. 1500"
                  description="Price charged for the Pro Monthly plan, in Naira."
                  required
                />
                <Field
                  label="Pro Yearly Price (NGN)"
                  type="number"
                  value={String(settings.pro_yearly_price)}
                  onChange={(value) => setSettings({ ...settings, pro_yearly_price: value })}
                  placeholder="e.g. 15000"
                  description="Price charged for the Pro Yearly plan, in Naira."
                  required
                />
              </SettingsGroup>
            )}

            {activeTab === 'modules' && (
              <SettingsGroup icon={<Power size={17} />} title="Modules — Live / Coming Soon" id="settings-modules">
                {Object.entries(MODULE_LABELS).map(([key, label]) => (
                  <SelectField
                    key={key}
                    label={`${label} status`}
                    value={settings.modules[key] ?? 'live'}
                    onChange={(value) => setSettings({ ...settings, modules: { ...settings.modules, [key]: value } })}
                    options={[
                      { value: 'live', label: 'Live' },
                      { value: 'coming_soon', label: 'Coming Soon' },
                    ]}
                    description={`Controls whether merchants can access ${label} in the mobile app.`}
                  />
                ))}
              </SettingsGroup>
            )}

            {activeTab === 'registration' && (
              <SettingsGroup icon={<Users size={17} />} title="Merchant Registration Settings" id="settings-registration">
                <SelectField
                  label="Registration Method"
                  value={settings.registration_method}
                  onChange={(value) => setSettings({ ...settings, registration_method: value as any })}
                  options={[
                    { value: 'email', label: 'Email Address Only (Default)' },
                    { value: 'whatsapp', label: 'WhatsApp Phone Number Only' },
                    { value: 'both', label: 'Both Email and WhatsApp Phone Number' },
                  ]}
                  description="Choose credentials required for merchant storefront registration."
                  full={true}
                />
              </SettingsGroup>
            )}

            {activeTab === 'mobile' && (
              <SettingsGroup icon={<Smartphone size={17} />} title="Mobile App Settings" id="settings-mobile">
                <Field
                  label="App Banner Text"
                  value={visualMobileBadge}
                  onChange={setVisualMobileBadge}
                  placeholder="e.g. 10,000+ merchants"
                  description="Small badge text shown at the top of the mobile homepage."
                />
                <Field
                  label="App Title"
                  value={visualMobileTitle}
                  onChange={setVisualMobileTitle}
                  placeholder="e.g. Africa's Commerce Platform"
                  description="Primary headline text for mobile homepage."
                />
                <Field
                  label="App Subtitle"
                  value={visualMobileSubtitle}
                  onChange={setVisualMobileSubtitle}
                  placeholder="e.g. Browse thousands of verified stores"
                  description="Secondary sub-headline text."
                  full={true}
                />
                <Field
                  label="Hero Gradient Start Color"
                  value={visualMobileGradStart}
                  onChange={setVisualMobileGradStart}
                  placeholder="e.g. #022C22"
                  description="HEX color code for the mobile hero gradient start."
                />
                <Field
                  label="Hero Gradient End Color"
                  value={visualMobileGradEnd}
                  onChange={setVisualMobileGradEnd}
                  placeholder="e.g. #25D366"
                  description="HEX color code for the mobile hero gradient end."
                />
              </SettingsGroup>
            )}

            {activeTab === 'kyc' && (
              <SettingsGroup icon={<Shield size={17} />} title="Identity Verification (KYC)" id="settings-kyc">
                <SelectField
                  label="KYC Provider"
                  value={settings.verification_provider}
                  onChange={(value) => setSettings({ ...settings, verification_provider: value as any })}
                  options={[
                    { value: 'manual', label: 'Manual Admin Verification (Default)' },
                    { value: 'idenverify', label: 'Idenverify API Check' },
                    { value: 'idanalyzer', label: 'ID Analyzer AI Scan' },
                    { value: 'didit', label: 'Didit.me OAuth Session' },
                  ]}
                  description="Method used to verify merchant identities."
                  full={true}
                />

                {settings.verification_provider === 'idenverify' && (
                  <Field
                    label="Idenverify API Key"
                    value={settings.idenverify_api_key}
                    onChange={(value) => setSettings({ ...settings, idenverify_api_key: value })}
                    type="password"
                    placeholder="sk_live_..."
                    full={true}
                  />
                )}

                {settings.verification_provider === 'idanalyzer' && (
                  <>
                    <Field
                      label="ID Analyzer API Key"
                      value={settings.idanalyzer_api_key}
                      onChange={(value) => setSettings({ ...settings, idanalyzer_api_key: value })}
                      type="password"
                      placeholder="Enter your idanalyzer.com key"
                    />
                    <Field
                      label="Confidence Threshold"
                      value={String(settings.idanalyzer_confidence_threshold)}
                      onChange={(value) => setSettings({ ...settings, idanalyzer_confidence_threshold: value })}
                      placeholder="0.7"
                      description="Minimum accuracy/confidence score (0 to 1) required to automatically verify."
                    />
                    <Field
                      label="Region Code"
                      value={settings.idanalyzer_region}
                      onChange={(value) => setSettings({ ...settings, idanalyzer_region: value })}
                      placeholder="US"
                      description="Region hint passed to ID Analyzer API."
                    />
                  </>
                )}

                {settings.verification_provider === 'didit' && (
                  <>
                    <Field
                      label="Didit Client ID"
                      value={settings.didit_client_id}
                      onChange={(value) => setSettings({ ...settings, didit_client_id: value })}
                    />
                    <Field
                      label="Didit Client Secret"
                      value={settings.didit_client_secret}
                      onChange={(value) => setSettings({ ...settings, didit_client_secret: value })}
                      type="password"
                    />
                    <Field
                      label="Didit Callback URL"
                      value={settings.didit_callback_url}
                      onChange={(value) => setSettings({ ...settings, didit_callback_url: value })}
                      placeholder="https://api.yourdomain.com/v1/verifications/didit/callback"
                      full={true}
                    />
                  </>
                )}
              </SettingsGroup>
            )}

            {activeTab === 'smtp' && (
              <SettingsGroup icon={<Mail size={17} />} title="SMTP Mail" id="settings-smtp">
                <Field
                  label="Host"
                  value={settings.smtp_host}
                  onChange={(value) => setSettings({ ...settings, smtp_host: value })}
                />
                <Field
                  label="Port"
                  value={settings.smtp_port}
                  onChange={(value) => setSettings({ ...settings, smtp_port: value })}
                />
                <Field
                  label="Username"
                  value={settings.smtp_username}
                  onChange={(value) => setSettings({ ...settings, smtp_username: value })}
                />
                <Field
                  label="Password"
                  type="password"
                  value={settings.smtp_password}
                  onChange={(value) => setSettings({ ...settings, smtp_password: value })}
                />
              </SettingsGroup>
            )}

            {activeTab === 'twilio' && (
              <SettingsGroup icon={<Smartphone size={17} />} title="Twilio (WhatsApp)" id="settings-twilio">
                <Field
                  label="Account SID"
                  value={settings.twilio_sid}
                  onChange={(value) => setSettings({ ...settings, twilio_sid: value })}
                />
                <Field
                  label="Auth Token"
                  type="password"
                  value={settings.twilio_auth_token}
                  onChange={(value) => setSettings({ ...settings, twilio_auth_token: value })}
                />
                <Field
                  label="WhatsApp Sender Number"
                  value={settings.twilio_whatsapp_from}
                  onChange={(value) => setSettings({ ...settings, twilio_whatsapp_from: value })}
                  full={true}
                />
              </SettingsGroup>
            )}

            {activeTab === 'socials' && (
              <SettingsGroup icon={<MessageSquare size={17} />} title="Social Media Links" id="settings-socials">
                <Field
                  label="Instagram Handle"
                  value={settings.social_instagram}
                  onChange={(value) => setSettings({ ...settings, social_instagram: value })}
                />
                <Field
                  label="Twitter / X Handle"
                  value={settings.social_twitter}
                  onChange={(value) => setSettings({ ...settings, social_twitter: value })}
                />
                <Field
                  label="TikTok Handle"
                  value={settings.social_tiktok}
                  onChange={(value) => setSettings({ ...settings, social_tiktok: value })}
                />
              </SettingsGroup>
            )}

            {activeTab === 'homepage' && (
              <SettingsGroup icon={<LayoutDashboard size={17} />} title="Homepage Content (Hero & Vision)" id="settings-homepage">
                <Field
                  label="Hero Title Prefix"
                  value={visualHomeHeroPrefix}
                  onChange={setVisualHomeHeroPrefix}
                  placeholder="e.g. Turn WhatsApp Conversations Into"
                  description="Text preceding the highlighted title on the homepage."
                />
                <Field
                  label="Hero Title Highlight"
                  value={visualHomeHeroHighlight}
                  onChange={setVisualHomeHeroHighlight}
                  placeholder="e.g. Sales"
                  description="Bold highlighted title keyword (primary brand color)."
                />
                <TextAreaField
                  label="Hero Description"
                  value={visualHomeHeroDesc}
                  onChange={setVisualHomeHeroDesc}
                  placeholder="Describe your platform details..."
                  description="Paragraph text under the main homepage hero title."
                  rows={4}
                  full={true}
                />
                <Field
                  label="Sellers Count Stat"
                  value={visualHomeStatsCount}
                  onChange={setVisualHomeStatsCount}
                  placeholder="e.g. 1,200+ sellers"
                  description="Prominent statistic shown on the homepage hero."
                />
                <Field
                  label="Sellers Stat Text Label"
                  value={visualHomeStatsText}
                  onChange={setVisualHomeStatsText}
                  placeholder="e.g. already selling on Frontstore"
                  description="Description label below the seller statistic count."
                />
                <TextAreaField
                  label="Platform Vision Statement"
                  value={visualHomeVisionQuote}
                  onChange={setVisualHomeVisionQuote}
                  placeholder="Input our brand vision..."
                  description="Strategic quote displayed at the bottom of the homepage."
                  rows={3}
                  full={true}
                />
                <Field
                  label="Vision Quote Citation"
                  value={visualHomeVisionCite}
                  onChange={setVisualHomeVisionCite}
                  placeholder="e.g. — The Frontstore Mission for African Commerce"
                  description="Signature/citation line for the vision quote."
                  full={true}
                />
              </SettingsGroup>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
