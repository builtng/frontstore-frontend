'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  X, Loader2, ShoppingBag, Laptop, Bell, Package, Ticket, ExternalLink,
  Clock, Edit2, Trash2,
} from 'lucide-react';
import SearchableSelect from '../../SearchableSelect';
import FileUpload from '../../FileUpload';
import Toggle from '../../Toggle';
import { getApiUrl } from '@/lib/api';
import { resilientFetch } from '@/utils/resilientFetch';
import { getCurrencySymbol } from '@/utils/currency';
import { getServiceFactPresets } from '@/utils/serviceFactPresets';
import { businessPersonas } from '@/utils/businessPersonas';
import type { StoreInfo, Category, Product, UserInfo } from '@/types/dashboard';

const authHeaders = { 'Content-Type': 'application/json', 'Accept': 'application/json' };

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  store: StoreInfo | null;
  categories: Category[];
  products: Product[];
  selectedProduct: Product | null;
  isPro: boolean;
  isLegend: boolean;
  user: UserInfo | null;
  setUser: React.Dispatch<React.SetStateAction<UserInfo | null>>;
  openUpgradePrompt: (title: string, description: string) => void;
  selectedPersona: string;
  refreshProducts: () => void;
}

export default function AddProductModal({
  open, onClose, store, categories, products, selectedProduct, isPro, isLegend, user, setUser,
  openUpgradePrompt, selectedPersona, refreshProducts,
}: AddProductModalProps) {
  const apiUrl = getApiUrl();

  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodComparePrice, setProdComparePrice] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodStock, setProdStock] = useState('in_stock');
  const [prodImageUrls, setProdImageUrls] = useState<string[]>([]);
  const [prodImageUploading, setProdImageUploading] = useState(false);
  const [prodTags, setProdTags] = useState<string[]>([]);
  const [prodTagInput, setProdTagInput] = useState('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [productPublishing, setProductPublishing] = useState(false);
  const [prodIsDigital, setProdIsDigital] = useState(false);
  const [prodDigitalFileUrl, setProdDigitalFileUrl] = useState('');
  const [prodDigitalLink, setProdDigitalLink] = useState('');
  const [prodDigitalUploading, setProdDigitalUploading] = useState(false);
  const [prodDigitalFiles, setProdDigitalFiles] = useState<{ path: string; name: string }[]>([]);
  const [prodDownloadLimit, setProdDownloadLimit] = useState('');
  const [prodReadOnlineOnly, setProdReadOnlineOnly] = useState(false);
  const [prodType, setProdType] = useState<'product' | 'service' | 'bundle' | 'ticket'>('product');
  const [prodDurationMinutes, setProdDurationMinutes] = useState('');
  const [prodServiceFacts, setProdServiceFacts] = useState<string[]>([]);
  const [prodMobileFee, setProdMobileFee] = useState('');
  const [prodMobileFeeLabel, setProdMobileFeeLabel] = useState('');
  const [prodCustomFact, setProdCustomFact] = useState('');
  const [prodExpectedAvailabilityDate, setProdExpectedAvailabilityDate] = useState('');
  const [prodVariants, setProdVariants] = useState<{ id?: string; size: string; color: string; price: string; inventory_quantity: string }[]>([]);
  const [prodBundleItems, setProdBundleItems] = useState<{ product_id: string; quantity: number }[]>([]);
  const [prodRelatedProductIds, setProdRelatedProductIds] = useState<string[]>([]);
  const [prodEventDate, setProdEventDate] = useState('');
  const [prodEventLocation, setProdEventLocation] = useState('');

  // Reset the form to a blank slate every time the modal is opened, mirroring
  // the previous openAddProductModal reset (the free-plan product-limit gate
  // that used to live alongside this reset now happens before `open` flips
  // true, in the page-level onAddProduct handler).
  useEffect(() => {
    if (!open) return;
    setProdName('');
    setProdPrice('');
    setProdComparePrice('');
    setProdCategory(categories[0]?.id || '');
    setProdDesc('');
    setProdStock('in_stock');
    setProdImageUrls([]);
    setProdTags([]);
    setProdTagInput('');
    setAiAnalyzing(false);
    setProdIsDigital(false);
    setProdDigitalFileUrl('');
    setProdDigitalLink('');
    setProdType('product');
    setProdDurationMinutes('');
    setProdServiceFacts([]);
    setProdCustomFact('');
    setProdExpectedAvailabilityDate('');
    setProdBundleItems([]);
    setProdRelatedProductIds([]);
    setProdDigitalFiles([]);
    setProdDownloadLimit('');
    setProdReadOnlineOnly(false);
    setProdEventDate('');
    setProdEventLocation('');
    setProdVariants([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const getSelectedPersonaPreset = () => businessPersonas.find(item => item.id === selectedPersona);

  const handleGenerateAIDescription = async () => {
    if (user?.plan === 'free' || !user?.plan) {
      openUpgradePrompt(
        'AI product writing requires Pro',
        'Generate richer product descriptions automatically with AI. You can keep editing manually on Free, or upgrade when you want AI assistance.'
      );
      return;
    }

    if (!prodName.trim()) {
      toast.warning('Enter a product name first to generate details!');
      return;
    }

    try {
      setAiGenerating(true);
      const activeCat = categories.find(c => c.id === prodCategory);

      const res = await fetch(`${apiUrl}/v1/ai/generate-description`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders,
        body: JSON.stringify({
          product_name: prodName,
          category_hint: activeCat ? activeCat.name : 'General',
          description_context: prodDesc
        })
      });

      const json = await res.json();
      if (res.ok && json.data?.description) {
        setProdDesc(json.data.description);
        toast.success('Description written by AI! 🧠✨');
      } else {
        throw new Error(json.message || 'Description generation failed.');
      }
    } catch (e: any) {
      console.error(e);
      // Fallback description in case of server failure
      const fallback = `Premium quality ${prodName}.\n\nHandcrafted design, breathable materials, perfect for all occasions.\nHandcrafted local inventory. Available now!`;
      setProdDesc(fallback);
      toast.info('Loaded visual fallback description outline.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAutoAnalyzeImage = async (file: File) => {
    // Available to all merchants — AI pre-fill on first image upload with client-side compression for speed
    try {
      setAiAnalyzing(true);

      // Client-side image compression to speed up transfer & processing
      const compressed: { base64: string; mime: string } = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1024; // higher res so brand/model text on the item or box stays legible to the vision model
            const MAX_HEIGHT = 1024;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
              resolve({ base64: compressedBase64, mime: 'image/jpeg' });
            } else {
              resolve({ base64: e.target?.result as string, mime: file.type });
            }
          };
          img.onerror = () => {
            resolve({ base64: e.target?.result as string, mime: file.type });
          };
          img.src = e.target?.result as string;
        };
        reader.onerror = () => {
          resolve({ base64: '', mime: file.type });
        };
        reader.readAsDataURL(file);
      });

      if (!compressed.base64) {
        throw new Error('Could not read image file.');
      }

      const res = await fetch(`${apiUrl}/v1/ai/generate-description`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders,
        body: JSON.stringify({
          image_base64: compressed.base64,
          image_mime: compressed.mime,
        })
      });
      const json = await res.json();
      if (res.ok && json.data) {
        const data = json.data;
        if (data.name) setProdName(data.name);
        if (data.description) setProdDesc(data.description);
        if (data.recommended_price) setProdPrice(String(data.recommended_price));
        if (Array.isArray(data.tags) && data.tags.length > 0) setProdTags(data.tags.slice(0, 10));
        if (data.listing_type === 'digital') {
          setProdIsDigital(true);
          setProdType('product');
          setProdStock('in_stock');
        } else if (data.listing_type === 'service') {
          setProdIsDigital(false);
          setProdType('service');
        } else if (data.listing_type === 'physical') {
          setProdIsDigital(false);
          setProdType('product');
        }

        // Update user state with the new quota used counter
        if (typeof json.quota_used !== 'undefined') {
          setUser(prev => prev ? { ...prev, ai_analyses_used: json.quota_used } : null);
        }

        toast.success('AI analyzed your photo! Fields pre-filled ✨');
      } else {
        toast.error(json.message || 'AI image analysis failed.');
      }
    } catch (err: any) {
      console.warn('AI image analysis failed:', err);
      toast.error(err.message || 'Failed to analyze product image.');
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice) {
      toast.error('Product name and price are required.');
      return;
    }
    if (prodImageUrls.length === 0) {
      toast.error('Add at least one product image before publishing.');
      return;
    }

    try {
      setProductPublishing(true);
      const payload = {
        name: prodName,
        price: parseFloat(prodPrice),
        compare_at_price: prodComparePrice ? parseFloat(prodComparePrice) : null,
        category_id: prodCategory || null,
        description: prodDesc || null,
        stock_status: prodIsDigital ? 'in_stock' : prodStock,
        expected_availability_date: prodStock === 'preorder' && prodExpectedAvailabilityDate ? prodExpectedAvailabilityDate : null,
        is_draft: false,
        image_urls: prodImageUrls,
        is_digital: prodIsDigital,
        digital_file_url: prodIsDigital ? (prodDigitalFileUrl || null) : null,
        digital_link: prodIsDigital ? (prodDigitalLink || null) : null,
        type: prodType,
        duration_minutes: prodType === 'service' && prodDurationMinutes ? parseInt(prodDurationMinutes, 10) : null,
        service_facts: prodType === 'service' && prodServiceFacts.length > 0 ? prodServiceFacts : null,
        mobile_fee: prodType === 'service' && prodMobileFee ? parseFloat(prodMobileFee) : null,
        mobile_fee_label: prodType === 'service' && prodMobileFeeLabel ? prodMobileFeeLabel.trim() : null,
        tags: prodTags.length > 0 ? prodTags : null,
        bundle_items: prodType === 'bundle' ? prodBundleItems : undefined,
        related_product_ids: prodRelatedProductIds.length > 0 ? prodRelatedProductIds : null,
        digital_files: prodDigitalFiles.length > 0 ? prodDigitalFiles : null,
        download_limit: prodDigitalFiles.length > 0 && prodDownloadLimit ? parseInt(prodDownloadLimit, 10) : null,
        read_online_only: prodDigitalFiles.length > 0 ? prodReadOnlineOnly : false,
        event_date: prodType === 'ticket' ? (prodEventDate || null) : null,
        event_location: prodType === 'ticket' ? (prodEventLocation || null) : null,
        variants: prodVariants.length > 0 ? prodVariants.map(v => ({
          size: v.size.trim() || null,
          color: v.color.trim() || null,
          price: v.price ? parseFloat(v.price) : null,
          inventory_quantity: parseInt(v.inventory_quantity, 10) || 0,
        })) : undefined,
      };

      const res = await resilientFetch(`${apiUrl}/v1/products`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (res.ok) {
        toast.success('Product published to storefront! 🚀');
        onClose();
        refreshProducts();
      } else {
        throw new Error(json.message || 'Failed to publish product');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error occurred publishing product.');
    } finally {
      setProductPublishing(false);
    }
  };

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} className="responsive-modal-overlay" />
      <div className="card glass animate-scale-in responsive-modal-container" style={{ position: 'relative', width: '100%', maxWidth: 820, padding: 28, zIndex: 10, maxHeight: '90vh', overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900 }}>Create Store Product</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }}><X size={18} /></button>
        </div>

        <form onSubmit={handleCreateProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── STEP 1: Primary Image Upload (Full-width, prominent) ── */}
          <div style={{ background: 'linear-gradient(135deg, rgba(37,211,102,0.05), rgba(37,211,102,0.02))', border: '2px dashed rgba(37,211,102,0.3)', borderRadius: 'var(--r-lg)', padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase' }}>Product Photo</div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                  Upload your main image — AI will auto-fill title, description & tags.
                  <span style={{ color: '#25D366', fontWeight: 700, marginLeft: 4 }}>
                    ({(user?.plan === 'pro_yearly' || isLegend)
                      ? 'Unlimited AI credits'
                      : `${Math.max(0, (user?.plan === 'pro_monthly' ? 15 : 3) - (user?.ai_analyses_used ?? 0))} AI credit(s) remaining`})
                  </span>
                </div>
              </div>
              {aiAnalyzing && (
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: 'var(--r-full)', padding: '4px 10px' }}>
                  <Loader2 size={12} className="spinner" style={{ color: '#25D366' }} />
                  <span style={{ fontSize: 11, color: '#25D366', fontWeight: 700 }}>AI analyzing...</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: prodImageUrls.length === 0 ? 'center' : 'flex-start' }}>
              {prodImageUrls.map((url, idx) => (
                <div key={idx} className="fu-tile-img" style={{ position: 'relative', width: idx === 0 ? 120 : 80, height: idx === 0 ? 120 : 80 }}>
                  <img src={url} alt={`Product image ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--r-md)' }} />
                  {idx === 0 && <span style={{ position: 'absolute', top: 4, left: 4, fontSize: 9, fontWeight: 900, background: '#25D366', color: '#fff', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>Main</span>}
                  <button
                    type="button"
                    onClick={() => setProdImageUrls(prev => prev.filter((_, i) => i !== idx))}
                    className="fu-tile-img__remove"
                    title="Remove image"
                  >✕</button>
                </div>
              ))}
              {prodImageUrls.length < 3 && (
                <FileUpload
                  variant="tile"
                  accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                  uploading={prodImageUploading}
                  disabled={prodImageUploading}
                  onFile={async (file) => {
                    try {
                      setProdImageUploading(true);
                      const fd = new FormData();
                      fd.append('image', file);
                      const res = await fetch(`${apiUrl}/v1/products/upload-image`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Accept': 'application/json' },
                        body: fd
                      });
                      const json = await res.json();
                      if (res.ok && json.url) {
                        const isFirstImage = prodImageUrls.length === 0;
                        setProdImageUrls(prev => [...prev, json.url].slice(0, 3));
                        toast.success('Image uploaded!');
                        if (isFirstImage) {
                          handleAutoAnalyzeImage(file);
                        }
                      } else throw new Error(json.message || 'Upload failed');
                    } catch (err: any) {
                      toast.error(err.message || 'Image upload error');
                    } finally {
                      setProdImageUploading(false);
                    }
                  }}
                />
              )}
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 8 }}>
              {prodImageUrls.length === 0
                ? 'Add your first photo to unlock AI auto-fill for title, price, description & tags.'
                : `${prodImageUrls.length}/3 photos added. ${prodImageUrls.length < 3 ? 'You can add ' + (3 - prodImageUrls.length) + ' more.' : 'All slots filled.'}`
              }
            </p>
          </div>

          {/* ── STEP 2+: Rest of the form — revealed once the main image is uploaded & analyzed ── */}
          {prodImageUrls.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text-faint)', textAlign: 'center', padding: '4px 0' }}>
              Upload a product photo above to continue.
            </p>
          ) : aiAnalyzing ? null : (
          <>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 8 }}>What are you selling?</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { id: 'physical', icon: ShoppingBag, label: 'Physical', sublabel: 'Shipped or handed over', active: !prodIsDigital && prodType !== 'service' && prodType !== 'bundle' && prodType !== 'ticket' },
                { id: 'digital', icon: Laptop, label: 'Digital', sublabel: 'Downloads, files, links', active: prodIsDigital },
                { id: 'service', icon: Bell, label: 'Service', sublabel: 'Sessions, bookings, jobs', active: prodType === 'service' },
                { id: 'bundle', icon: Package, label: 'Bundle', sublabel: 'Combo of other products', active: prodType === 'bundle' },
                { id: 'ticket', icon: Ticket, label: 'Ticket', sublabel: 'Event with check-in', active: prodType === 'ticket' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    if (opt.id === 'physical') { setProdIsDigital(false); setProdType('product'); }
                    if (opt.id === 'digital') { setProdIsDigital(true); setProdType('product'); setProdStock('in_stock'); }
                    if (opt.id === 'service') { setProdIsDigital(false); setProdType('service'); }
                    if (opt.id === 'bundle') { setProdIsDigital(false); setProdType('bundle'); setProdStock('in_stock'); }
                    if (opt.id === 'ticket') { setProdIsDigital(false); setProdType('ticket'); }
                  }}
                  style={{
                    padding: '12px 8px',
                    border: opt.active ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                    borderRadius: 'var(--r-md)',
                    background: opt.active ? 'var(--primary-light)' : 'var(--surface)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all var(--t-fast)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
                  }}
                >
                  <opt.icon size={22} strokeWidth={2} color={opt.active ? 'var(--primary)' : 'var(--text-faint)'} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: opt.active ? 'var(--primary)' : 'var(--text)' }}>{opt.label}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-faint)', lineHeight: 1.3 }}>{opt.sublabel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── STEP 3: Pre-filled fields (AI fills these) ── */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Product Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Ankara Loose Kaftan"
              value={prodName}
              onChange={e => setProdName(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="responsive-form-row">
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Sales Price ({getCurrencySymbol(store?.currency_code)})</label>
              <input
                type="number"
                required
                placeholder="8500"
                value={prodPrice}
                onChange={e => setProdPrice(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Compare Price (Optional)</label>
              <input
                type="number"
                placeholder="10000"
                value={prodComparePrice}
                onChange={e => setProdComparePrice(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="responsive-form-row">
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Category</label>
              <SearchableSelect
                options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                value={prodCategory}
                onChange={val => setProdCategory(val)}
                placeholder="Select Category"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Inventory Status</label>
              <SearchableSelect
                options={[
                  { value: 'in_stock', label: `In Stock ${prodIsDigital ? '(Auto-Managed)' : ''}` },
                  { value: 'out_of_stock', label: 'Out of Stock' },
                  { value: 'low_stock', label: 'Low Stock' },
                  { value: 'preorder', label: 'Pre-order' },
                ]}
                value={prodStock}
                onChange={val => setProdStock(val)}
                disabled={prodIsDigital || prodType === 'bundle'}
                placeholder="Select Status"
              />
            </div>
          </div>

          {prodStock === 'preorder' && (
            <div className="animate-fade-in">
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Expected Availability Date</label>
              <input
                type="date"
                value={prodExpectedAvailabilityDate}
                onChange={e => setProdExpectedAvailabilityDate(e.target.value)}
                className="input-field"
              />
            </div>
          )}

          {/* Variants — size / colour options for physical products */}
          {prodType === 'product' && !prodIsDigital && (
            <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1.5px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--r-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }} className="animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)' }}>🎨 Variants (Size / Colour)</div>
                <button
                  type="button"
                  className="btn clickable"
                  onClick={() => setProdVariants(prev => [...prev, { size: '', color: '', price: '', inventory_quantity: '0' }])}
                  style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700, borderRadius: 8, background: 'var(--primary)', color: '#fff', border: 'none' }}
                >
                  + Add Variant
                </button>
              </div>
              <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: 0 }}>Let buyers pick a size and/or colour before adding to cart. Leave empty if this product has no options.</p>
              {prodVariants.map((v, i) => (
                <div key={i} className="pv-variant-row">
                  <input className="input-field" placeholder="Size (e.g. M)" value={v.size} onChange={e => setProdVariants(prev => prev.map((row, ri) => ri === i ? { ...row, size: e.target.value } : row))} />
                  <input className="input-field" placeholder="Colour (e.g. Red)" value={v.color} onChange={e => setProdVariants(prev => prev.map((row, ri) => ri === i ? { ...row, color: e.target.value } : row))} />
                  <input className="input-field" type="number" min={0} step="0.01" placeholder="Price override" value={v.price} onChange={e => setProdVariants(prev => prev.map((row, ri) => ri === i ? { ...row, price: e.target.value } : row))} />
                  <input className="input-field" type="number" min={0} placeholder="Stock qty" value={v.inventory_quantity} onChange={e => setProdVariants(prev => prev.map((row, ri) => ri === i ? { ...row, inventory_quantity: e.target.value } : row))} />
                  <button type="button" className="pv-variant-remove" onClick={() => setProdVariants(prev => prev.filter((_, ri) => ri !== i))}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bundle Extras — shown when Bundle type is selected */}
          {prodType === 'bundle' && (
            <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1.5px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--r-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }} className="animate-fade-in">
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)' }}>📦 Bundle Components</div>
              <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: 0 }}>Pick the products included in this bundle and how many of each.</p>
              {products.filter(p => p.type !== 'bundle').map(p => {
                const selected = prodBundleItems.find(bi => bi.product_id === p.id);
                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="checkbox"
                      checked={!!selected}
                      onChange={e => {
                        if (e.target.checked) {
                          setProdBundleItems(prev => [...prev, { product_id: p.id, quantity: 1 }]);
                        } else {
                          setProdBundleItems(prev => prev.filter(bi => bi.product_id !== p.id));
                        }
                      }}
                    />
                    <span style={{ fontSize: 13, flex: 1 }}>{p.name}</span>
                    {selected && (
                      <input
                        type="number"
                        min={1}
                        value={selected.quantity}
                        onChange={e => {
                          const qty = Math.max(1, parseInt(e.target.value, 10) || 1);
                          setProdBundleItems(prev => prev.map(bi => bi.product_id === p.id ? { ...bi, quantity: qty } : bi));
                        }}
                        className="input-field"
                        style={{ width: 60, padding: '4px 8px' }}
                      />
                    )}
                  </div>
                );
              })}
              {products.filter(p => p.type !== 'bundle').length === 0 && (
                <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>Add other products first, then come back to bundle them.</p>
              )}
            </div>
          )}

          {/* Ticket Extras — shown when Ticket type is selected */}
          {prodType === 'ticket' && (
            <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1.5px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--r-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }} className="animate-fade-in">
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)' }}>🎫 Event Details</div>
              <div>
                <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Event Date & Time</label>
                <input
                  type="datetime-local"
                  value={prodEventDate}
                  onChange={e => setProdEventDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Event Location</label>
                <input
                  type="text"
                  placeholder="e.g. The Zone, Gbagada, Lagos or 'Online'"
                  value={prodEventLocation}
                  onChange={e => setProdEventLocation(e.target.value)}
                  className="input-field"
                />
              </div>
              <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: 0 }}>Turn on inventory tracking below to cap how many tickets can be sold.</p>
            </div>
          )}

          {/* Digital Product Extras — shown when Digital type is selected */}
          {prodIsDigital && (
            <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1.5px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--r-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }} className="animate-fade-in">
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)' }}>💻 Digital Product Details</div>

              {/* File Upload Slot */}
              <div>
                <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Digital File (Optional, max 20MB)
                </label>
                <FileUpload
                  variant="default"
                  accept="*"
                  label="Upload Product File"
                  hint="eBooks, courses, templates, music, PDFs, etc. (max 20MB)"
                  previewUrl={prodDigitalFileUrl || undefined}
                  uploading={prodDigitalUploading}
                  onRemove={() => setProdDigitalFileUrl('')}
                  maxSize={20 * 1024 * 1024}
                  onFile={async (file) => {
                    try {
                      setProdDigitalUploading(true);
                      const fd = new FormData();
                      fd.append('file', file);
                      const res = await fetch(`${apiUrl}/v1/products/upload-file`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Accept': 'application/json' },
                        body: fd
                      });
                      const json = await res.json();
                      if (res.ok && json.url) {
                        setProdDigitalFileUrl(json.url);
                        toast.success('Digital file uploaded successfully! 📁');
                      } else throw new Error(json.message || 'File upload failed');
                    } catch (err: any) {
                      toast.error(err.message || 'File upload error');
                    } finally {
                      setProdDigitalUploading(false);
                    }
                  }}
                />
              </div>

              {/* External Link */}
              <div>
                <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Download / Access Link (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="url"
                    placeholder="e.g. https://drive.google.com/..."
                    value={prodDigitalLink}
                    onChange={e => setProdDigitalLink(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: 34 }}
                  />
                  <ExternalLink size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>
                  Or provide a URL to a Google Drive folder, Notion page, private video, etc.
                </p>
              </div>

              {/* Extra files (multi-file delivery) */}
              <div>
                <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Extra Files (Optional — e.g. bonus chapters, workbook)
                </label>
                {prodDigitalFiles.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 12.5, flex: 1, wordBreak: 'break-all' }}>{f.name}</span>
                    <button type="button" onClick={() => setProdDigitalFiles(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <FileUpload
                  variant="default"
                  accept="*"
                  label="Add another file"
                  hint="Uploads here are added to the list above, not replaced."
                  uploading={prodDigitalUploading}
                  maxSize={20 * 1024 * 1024}
                  onFile={async (file) => {
                    try {
                      setProdDigitalUploading(true);
                      const fd = new FormData();
                      fd.append('file', file);
                      const res = await fetch(`${apiUrl}/v1/products/upload-file`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Accept': 'application/json' },
                        body: fd
                      });
                      const json = await res.json();
                      if (res.ok && json.path) {
                        setProdDigitalFiles(prev => [...prev, { path: json.path, name: file.name }]);
                        toast.success('File added! 📁');
                      } else throw new Error(json.message || 'File upload failed');
                    } catch (err: any) {
                      toast.error(err.message || 'File upload error');
                    } finally {
                      setProdDigitalUploading(false);
                    }
                  }}
                />
              </div>

              {prodDigitalFiles.length > 0 && (
                <div className="responsive-form-row">
                  <div>
                    <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Download Limit (Optional)</label>
                    <input
                      type="number"
                      min={1}
                      placeholder="Unlimited"
                      value={prodDownloadLimit}
                      onChange={e => setProdDownloadLimit(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 20 }}>
                    <input type="checkbox" id="prodReadOnlineOnly" checked={prodReadOnlineOnly} onChange={e => setProdReadOnlineOnly(e.target.checked)} />
                    <label htmlFor="prodReadOnlineOnly" style={{ fontSize: 12.5, fontWeight: 600 }}>Read online only (no download link, e.g. for ebooks)</label>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* Service Extras — shown when Service type is selected */}
          {prodType === 'service' && (
            <div style={{ background: 'rgba(129, 0, 209, 0.04)', border: '1.5px solid rgba(129, 0, 209, 0.2)', borderRadius: 'var(--r-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }} className="animate-fade-in">
              <div style={{ fontSize: 12, fontWeight: 800, color: '#8100d1' }}>🛎️ Service Details</div>
              <div>
                  <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Duration (Optional)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      min={0}
                      placeholder="e.g. 90"
                      value={prodDurationMinutes}
                      onChange={e => setProdDurationMinutes(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: 34 }}
                    />
                    <Clock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>How long this service typically takes, in minutes.</p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Service Details (Optional)
                  </label>
                  <p style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 8 }}>
                    Pick a few quick facts to show customers on this service&apos;s page{getSelectedPersonaPreset() ? ` — suggested for ${getSelectedPersonaPreset()?.name} stores` : ''}.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {getServiceFactPresets(selectedPersona).map(preset => {
                      const checked = prodServiceFacts.includes(preset.label);
                      return (
                        <Toggle
                          key={preset.label}
                          checked={checked}
                          onChange={(next) => {
                            if (next) {
                              setProdServiceFacts(prev => [...prev, preset.label]);
                            } else {
                              setProdServiceFacts(prev => prev.filter(f => f !== preset.label));
                            }
                          }}
                          label={<span style={{ fontSize: 12.5, color: 'var(--text)', fontWeight: 600 }}>{preset.label}</span>}
                        />
                      );
                    })}
                  </div>

                  {/* Custom facts the merchant typed in */}
                  {prodServiceFacts.filter(f => !getServiceFactPresets(selectedPersona).some(p => p.label === f)).length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                      {prodServiceFacts.filter(f => !getServiceFactPresets(selectedPersona).some(p => p.label === f)).map(fact => (
                        <div key={fact} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: 'var(--bg-2)', borderRadius: 'var(--r-sm)', padding: '8px 10px' }}>
                          <span style={{ fontSize: 12.5, color: 'var(--text)', fontWeight: 600 }}>{fact}</span>
                          <button
                            type="button"
                            onClick={() => setProdServiceFacts(prev => prev.filter(f2 => f2 !== fact))}
                            style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--danger)', border: 'none', color: '#fff', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, flexShrink: 0 }}
                            title="Remove"
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <input
                      type="text"
                      placeholder="Write your own detail…"
                      value={prodCustomFact}
                      onChange={e => setProdCustomFact(e.target.value)}
                      className="input-field"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const text = prodCustomFact.trim();
                        if (!text) return;
                        if (prodServiceFacts.includes(text)) { setProdCustomFact(''); return; }
                        setProdServiceFacts(prev => [...prev, text]);
                        setProdCustomFact('');
                      }}
                      className="btn btn-secondary"
                      style={{ flexShrink: 0 }}
                    >Add</button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Mobile Service Fee (Optional)
                  </label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input
                      type="number"
                      min={0}
                      placeholder="e.g. 2000"
                      value={prodMobileFee}
                      onChange={e => setProdMobileFee(e.target.value)}
                      className="input-field"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      placeholder='Label, e.g. "Bike Fee"'
                      value={prodMobileFeeLabel}
                      onChange={e => setProdMobileFeeLabel(e.target.value)}
                      className="input-field"
                      style={{ flex: 1 }}
                    />
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>Extra charge added when a customer selects Mobile Session. Give it a name so they know what it covers (e.g. &ldquo;Bike Fee&rdquo;, &ldquo;Travel Fee&rdquo;).</p>
                </div>

              </div>
          )}




          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase' }}>Description & Details</label>
              <button
                type="button"
                onClick={handleGenerateAIDescription}
                disabled={aiGenerating}
                className="btn btn-outline"
                style={{
                  padding: '4px 10px', fontSize: 10.5, borderRadius: 'var(--r-sm)',
                  color: '#d97706', borderColor: '#d97706',
                  display: 'inline-flex', alignItems: 'center', gap: 4
                }}
              >
                {aiGenerating ? <><Loader2 size={11} className="spinner" /> Generating...</> : <><Edit2 size={11} /> AI Auto-Write</>}
                {(user?.plan === 'free' || !user?.plan) && (
                  <span style={{ fontSize: 8, fontWeight: 900, background: '#d97706', color: '#fff', padding: '1px 4px', borderRadius: 2 }}>PRO</span>
                )}
              </button>
            </div>
            <textarea
              rows={4}
              required
              placeholder="Describe your item sizes, materials, colors..."
              value={prodDesc}
              onChange={e => setProdDesc(e.target.value)}
              className="input-field"
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Tags editor */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase' }}>Product Tags</label>
              {isPro ? (
                <span style={{ fontSize: 9, fontWeight: 900, background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#fff', padding: '2px 6px', borderRadius: 3 }}>AI-SUGGESTED</span>
              ) : (
                <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: 'var(--danger)', padding: '2px 7px', borderRadius: 'var(--r-full)' }}>Pro</span>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {prodTags.map((tag, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 20, background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.35)', fontSize: 12, fontWeight: 600, color: '#d97706' }}>
                  {tag}
                  <button type="button" onClick={() => setProdTags(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#d97706', lineHeight: 1, display: 'flex', alignItems: 'center' }} aria-label={`Remove tag ${tag}`}>
                    <X size={11} />
                  </button>
                </span>
              ))}
              {prodTags.length === 0 && (
                <span style={{ fontSize: 11, color: 'var(--text-faint)', fontStyle: 'italic' }}>{isPro ? 'Upload a photo and AI will suggest tags automatically.' : 'Add up to 10 tags to help buyers find your product.'}</span>
              )}
            </div>
            {prodTags.length < 10 && (
              <input
                type="text"
                placeholder="Type a tag and press Enter..."
                value={prodTagInput}
                onChange={e => setProdTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const t = prodTagInput.trim();
                    if (t && !prodTags.includes(t) && prodTags.length < 10) {
                      setProdTags(prev => [...prev, t]);
                      setProdTagInput('');
                    }
                  }
                }}
                className="input-field"
                style={{ fontSize: 13 }}
              />
            )}
          </div>

          {/* Cross-sell picker — optional, storefront falls back to same-category automatically */}
          {products.filter(p => p.id !== selectedProduct?.id).length > 0 && (
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
                "You May Also Like" Picks (Optional, up to 8)
              </label>
              <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 8 }}>Leave unchecked and we'll auto-suggest same-category products instead.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: 140, overflowY: 'auto' }}>
                {products.filter(p => p.id !== selectedProduct?.id).map(p => {
                  const checked = prodRelatedProductIds.includes(p.id);
                  return (
                    <label key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, border: checked ? '1.5px solid var(--primary)' : '1px solid var(--border)', background: checked ? 'var(--primary-light)' : 'var(--surface)', fontSize: 12, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={e => {
                          if (e.target.checked) {
                            if (prodRelatedProductIds.length >= 8) return;
                            setProdRelatedProductIds(prev => [...prev, p.id]);
                          } else {
                            setProdRelatedProductIds(prev => prev.filter(id => id !== p.id));
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                      {p.name}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
          </>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button type="button" onClick={onClose} className="btn btn-outline clickable" style={{ flex: 1, padding: 12 }}>Cancel</button>
            <button type="submit" disabled={productPublishing} className="btn btn-primary clickable" style={{ flex: 1, padding: 12 }}>
              {productPublishing ? <><Loader2 size={14} className="spinner" /> Publishing...</> : 'Publish Product'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
