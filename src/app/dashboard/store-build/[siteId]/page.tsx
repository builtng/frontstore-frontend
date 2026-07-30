'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  useDraggable, useDroppable, closestCenter, DragEndEvent, DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowLeft, Loader2, Monitor, Tablet, Smartphone, Undo2, Redo2, Eye, X,
  GripVertical, Copy, Trash2, Settings2, Columns3, Rows3, MoveVertical, Minus,
  PanelTop, LayoutGrid, Star, Tags, Download, CreditCard, Calendar, MessageCircle,
  Quote, HelpCircle, Timer, Image as ImageIcon, Images, Play, Search, Globe, Sparkles,
} from 'lucide-react';
import BlockRenderer, { renderBlock, themeVars, SB_CSS } from '../../../../components/storefront/BlockRenderer';
import BlockInspector from '../../../../components/storefront/BlockInspector';
import ConfirmDialog from '../../../../components/ConfirmDialog';
import { BLOCK_GROUPS, BLOCK_LABELS, BlockType, SiteBlock, createDefaultBlock } from '../../../../components/storefront/blockTypes';

const BLOCK_ICONS: Record<BlockType, React.ComponentType<any>> = {
  section: Rows3, columns: Columns3, spacer: MoveVertical, divider: Minus,
  hero: PanelTop, product_grid: LayoutGrid, featured_product: Star, categories: Tags,
  digital_spotlight: Download, pricing_table: CreditCard,
  booking: Calendar,
  whatsapp_cta: MessageCircle, testimonials: Quote, faq: HelpCircle, countdown: Timer,
  image: ImageIcon, gallery: Images, video: Play,
};

const DEVICE_WIDTHS: Record<string, number> = { desktop: 920, tablet: 520, mobile: 375 };

interface SiteState {
  id: string; name: string; slug: string; layout: SiteBlock[];
  theme: Record<string, any> | null; is_published: boolean;
  custom_domain: string | null; domain_status: string | null; domain_error: string | null;
}

export default function StoreBuildEditorPage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params?.siteId as string;
  const apiUrl = (typeof window !== 'undefined' && localStorage.getItem('dev_api_url')) || process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [site, setSite] = useState<SiteState | null>(null);
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  const [layout, setLayout] = useState<SiteBlock[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [publishing, setPublishing] = useState(false);
  const [activeDragType, setActiveDragType] = useState<BlockType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [domainInput, setDomainInput] = useState('');
  const [domainSaving, setDomainSaving] = useState(false);

  const history = useRef<SiteBlock[][]>([]);
  const historyIndex = useRef(-1);
  const skipHistoryPush = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const authHeaders = useCallback((t: string | null) => ({
    'Authorization': `Bearer ${t}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }), []);

  useEffect(() => {
    let cancelled = false;
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    if (!storedToken || !siteId) { setLoading(false); return; }

    (async () => {
      try {
        const [storeRes, siteRes, productsRes, categoriesRes, faqsRes, reviewsRes] = await Promise.all([
          fetch(`${apiUrl}/v1/store`, { headers: authHeaders(storedToken) }),
          fetch(`${apiUrl}/v1/store/sites/${siteId}`, { headers: authHeaders(storedToken) }),
          fetch(`${apiUrl}/v1/products?limit=200`, { headers: authHeaders(storedToken) }),
          fetch(`${apiUrl}/v1/categories`, { headers: authHeaders(storedToken) }),
          fetch(`${apiUrl}/v1/faqs`, { headers: authHeaders(storedToken) }),
          fetch(`${apiUrl}/v1/store/reviews`, { headers: authHeaders(storedToken) }),
        ]);

        const storeJson = await storeRes.json();
        const siteJson = await siteRes.json();

        if (cancelled) return;

        if (!storeRes.ok || !siteRes.ok) {
          toast.error('Could not load this site.');
          router.push('/dashboard/store-build');
          return;
        }

        if (!(storeJson.data?.plan_features || []).includes('store_build')) {
          router.push('/dashboard/store-build');
          return;
        }

        setStore(storeJson.data);
        setSite(siteJson.data);
        skipHistoryPush.current = true;
        setLayout(siteJson.data.layout || []);
        history.current = [siteJson.data.layout || []];
        historyIndex.current = 0;

        const productsJson = await productsRes.json().catch(() => null);
        const categoriesJson = await categoriesRes.json().catch(() => null);
        const faqsJson = await faqsRes.json().catch(() => null);
        const reviewsJson = await reviewsRes.json().catch(() => null);

        if (cancelled) return;

        setProducts(productsJson?.data?.data || []);
        setCategories(categoriesJson?.data || []);
        setFaqs(faqsJson?.data || []);
        setReviews((reviewsJson?.data || []).map((r: any) => ({
          reviewer_name: r.customer_name || 'Anonymous', body: r.comment || '', rating: r.rating,
        })));
      } catch {
        if (!cancelled) toast.error('Network error loading Store Build.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl, siteId]);

  const isFirstLayoutRender = useRef(true);

  // Record layout snapshots for undo/redo. Deliberately a separate effect (not
  // a mutation inside the setLayout updater) because React's dev-mode Strict
  // Mode double-invokes setState updater functions to check purity — doing the
  // ref mutation there would double-push every entry.
  useEffect(() => {
    if (isFirstLayoutRender.current) { isFirstLayoutRender.current = false; return; }
    if (skipHistoryPush.current) { skipHistoryPush.current = false; return; }
    const truncated = history.current.slice(0, historyIndex.current + 1);
    truncated.push(layout);
    if (truncated.length > 30) truncated.shift();
    history.current = truncated;
    historyIndex.current = truncated.length - 1;
  }, [layout]);

  const applyLayout = useCallback((updater: (prev: SiteBlock[]) => SiteBlock[]) => {
    setLayout((prev) => updater(prev));
  }, []);

  const undo = () => {
    if (historyIndex.current <= 0) return;
    historyIndex.current -= 1;
    skipHistoryPush.current = true;
    setLayout(history.current[historyIndex.current]);
  };

  const redo = () => {
    if (historyIndex.current >= history.current.length - 1) return;
    historyIndex.current += 1;
    skipHistoryPush.current = true;
    setLayout(history.current[historyIndex.current]);
  };

  // Autosave draft layout 1.2s after the last edit.
  useEffect(() => {
    if (!token || !site || loading) return;
    setSaveState('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`${apiUrl}/v1/store/sites/${siteId}`, {
          method: 'PUT', headers: authHeaders(token), body: JSON.stringify({ layout }),
        });
        setSaveState(res.ok ? 'saved' : 'idle');
      } catch {
        setSaveState('idle');
      }
    }, 1200);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  const insertBlock = (type: BlockType, index: number) => {
    const block = createDefaultBlock(type);
    applyLayout((prev) => {
      const next = [...prev];
      next.splice(index, 0, block);
      return next;
    });
    setSelectedId(block.id);
  };

  const updateBlockData = (id: string, data: Record<string, any>) => {
    applyLayout((prev) => prev.map((b) => (b.id === id ? { ...b, data } : b)));
  };

  const duplicateBlock = (id: string) => {
    applyLayout((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const copy = createDefaultBlock(prev[idx].type);
      copy.data = JSON.parse(JSON.stringify(prev[idx].data));
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    applyLayout((prev) => prev.filter((b) => b.id !== deleteTarget));
    if (selectedId === deleteTarget) setSelectedId(null);
    setDeleteTarget(null);
  };

  const handlePublish = async () => {
    if (!token) return;
    setPublishing(true);
    try {
      await fetch(`${apiUrl}/v1/store/sites/${siteId}`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify({ layout }) });
      const res = await fetch(`${apiUrl}/v1/store/sites/${siteId}/publish`, { method: 'POST', headers: authHeaders(token) });
      const json = await res.json();
      if (res.ok) {
        setSite((prev) => (prev ? { ...prev, is_published: true } : prev));
        toast.success('Site published!');
      } else {
        toast.error(json.message || 'Could not publish this site.');
      }
    } catch {
      toast.error('Network error publishing this site.');
    } finally {
      setPublishing(false);
    }
  };

  const handleAttachDomain = async () => {
    if (!token || !domainInput.trim()) return;
    setDomainSaving(true);
    try {
      const res = await fetch(`${apiUrl}/v1/store/sites/${siteId}/domain`, {
        method: 'POST', headers: authHeaders(token), body: JSON.stringify({ custom_domain: domainInput.trim() }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success('Domain linked! It may take a few minutes to go live.');
        setSite((prev) => (prev ? { ...prev, custom_domain: json.data.custom_domain, domain_status: json.data.domain_status } : prev));
        setShowDomainModal(false);
        setDomainInput('');
      } else {
        toast.error(json.message || 'Could not link this domain.');
      }
    } catch {
      toast.error('Network error linking domain.');
    } finally {
      setDomainSaving(false);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!token) return null;
    const form = new FormData();
    form.append('image', file);
    try {
      const res = await fetch(`${apiUrl}/v1/products/upload-image`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form,
      });
      const json = await res.json();
      if (res.ok) return json.url;
      toast.error('Image upload failed.');
      return null;
    } catch {
      toast.error('Network error uploading image.');
      return null;
    }
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    if (id.startsWith('lib:')) setActiveDragType(id.slice(4) as BlockType);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragType(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId.startsWith('lib:')) {
      const type = activeId.slice(4) as BlockType;
      if (overId === 'canvas-end') {
        insertBlock(type, layout.length);
        return;
      }
      const overIndex = layout.findIndex((b) => b.id === overId);
      insertBlock(type, overIndex === -1 ? layout.length : overIndex + 1);
      return;
    }

    if (activeId !== overId) {
      const oldIndex = layout.findIndex((b) => b.id === activeId);
      if (oldIndex === -1) return;
      const newIndex = overId === 'canvas-end' ? layout.length - 1 : layout.findIndex((b) => b.id === overId);
      if (newIndex === -1) return;
      applyLayout((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  };

  const inspectorCtx = useMemo(() => ({ products, categories, onUploadImage: uploadImage }), [products, categories]);
  const renderCtx = useMemo(() => ({
    store: store || {}, products, categories, faqs, reviews, apiUrl, editable: true,
  }), [store, products, categories, faqs, reviews, apiUrl]);

  const selectedBlock = layout.find((b) => b.id === selectedId) || null;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020C1B' }}>
        <Loader2 size={28} style={{ color: '#25D366', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!site || !store) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020C1B', color: '#EAF1F8', flexDirection: 'column', gap: 12 }}>
        <p>This site couldn't be loaded.</p>
        <button onClick={() => router.push('/dashboard/store-build')} style={{ color: '#25D366', background: 'none', border: 'none', cursor: 'pointer' }}>Back to Store Build</button>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="sbld-shell">
        {/* Top bar */}
        <div className="sbld-topbar">
          <div className="sbld-topbar-left">
            <button className="sbld-icon-btn" onClick={() => router.push('/dashboard/store-build')}><ArrowLeft size={15} /></button>
            <div className="sbld-crumb">
              <span className="sbld-store">{store.store_name || store.username}</span>
              <span className="sbld-tool">{site.name} <span className="sbld-legend-badge">★ Legend</span></span>
            </div>
          </div>

          <div className="sbld-devices">
            <button className={`sbld-device-btn${device === 'desktop' ? ' active' : ''}`} onClick={() => setDevice('desktop')}><Monitor size={15} /></button>
            <button className={`sbld-device-btn${device === 'tablet' ? ' active' : ''}`} onClick={() => setDevice('tablet')}><Tablet size={14} /></button>
            <button className={`sbld-device-btn${device === 'mobile' ? ' active' : ''}`} onClick={() => setDevice('mobile')}><Smartphone size={12} /></button>
          </div>

          <div className="sbld-topbar-right">
            <span className="sbld-save-indicator">{saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : ''}</span>
            <button className="sbld-icon-btn" disabled={historyIndex.current <= 0} onClick={undo}><Undo2 size={15} /></button>
            <button className="sbld-icon-btn" disabled={historyIndex.current >= history.current.length - 1} onClick={redo}><Redo2 size={15} /></button>
            <div className="sbld-divider-v" />
            <button className="sbld-btn ghost" onClick={() => setShowDomainModal(true)}><Globe size={13} /> Domain</button>
            <button className="sbld-btn ghost" onClick={() => setShowPreview(true)}><Eye size={13} /> Preview</button>
            <button className="sbld-btn primary" onClick={handlePublish} disabled={publishing}>{publishing ? 'Publishing…' : site.is_published ? 'Republish' : 'Publish'}</button>
          </div>
        </div>

        <div className="sbld-body">
          {/* Left rail: block library */}
          <div className="sbld-rail-left">
            {BLOCK_GROUPS.map((group) => (
              <div key={group.label} className="sbld-block-group">
                <h4>{group.label}</h4>
                {group.types.map((type) => (
                  <LibraryBlock key={type} type={type} onClick={() => insertBlock(type, layout.length)} />
                ))}
              </div>
            ))}
          </div>

          {/* Center: canvas */}
          <div className="sbld-canvas-wrap">
            <div className="sbld-canvas" style={{ maxWidth: DEVICE_WIDTHS[device], ...themeVars(store) }}>
              <SortableContext items={layout.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                {layout.map((block) => (
                  <CanvasBlock
                    key={block.id}
                    block={block}
                    selected={selectedId === block.id}
                    onSelect={() => setSelectedId(block.id)}
                    onDuplicate={() => duplicateBlock(block.id)}
                    onDelete={() => setDeleteTarget(block.id)}
                    renderCtx={renderCtx}
                  />
                ))}
              </SortableContext>
              <CanvasEndDropZone empty={layout.length === 0} />
            </div>
          </div>

          {/* Right rail: inspector */}
          <div className="sbld-rail-right">
            <div className="sbld-inspector-head">
              <div className="title">{selectedBlock ? BLOCK_LABELS[selectedBlock.type] : 'No block selected'}</div>
              <div className="sub">{selectedBlock ? 'Editing selected block' : 'Click a block on the canvas to edit it'}</div>
            </div>
            <div className="sbld-inspector-body">
              {selectedBlock ? (
                <BlockInspector block={selectedBlock} onChange={(data) => updateBlockData(selectedBlock.id, data)} ctx={inspectorCtx} />
              ) : (
                <div className="sbld-ai-chip">
                  <Sparkles size={16} />
                  <div>
                    <div className="t">Aura layout assist</div>
                    <div className="d">Coming soon — suggest a layout from your products</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeDragType && (
          <div className="sbld-drag-ghost">{BLOCK_LABELS[activeDragType]}</div>
        )}
      </DragOverlay>

      {showPreview && (
        <div className="sbld-preview-overlay">
          <button className="sbld-preview-close" onClick={() => setShowPreview(false)}><X size={18} /></button>
          <div className="sbld-preview-frame">
            <BlockRenderer layout={layout} {...renderCtx} editable={false} />
          </div>
        </div>
      )}

      {showDomainModal && (
        <div className="sbld-modal-overlay">
          <div className="sbld-modal">
            <h2>Connect a custom domain</h2>
            <p>Point a domain you own at this site. We'll verify DNS automatically.</p>
            {site.custom_domain ? (
              <div className="sbld-domain-current">
                <Globe size={14} /> {site.custom_domain}
                <span className={`sbld-domain-status ${site.domain_status}`}>{site.domain_status}</span>
              </div>
            ) : (
              <input className="sbld-modal-input" placeholder="e.g. shop.mybrand.com" value={domainInput} onChange={(e) => setDomainInput(e.target.value)} />
            )}
            <div className="sbld-modal-actions">
              <button onClick={() => setShowDomainModal(false)}>Close</button>
              {!site.custom_domain && (
                <button className="primary" onClick={handleAttachDomain} disabled={domainSaving || !domainInput.trim()}>
                  {domainSaving ? 'Linking…' : 'Link domain'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this block?"
        description="This block will be removed from the page. You can undo this with the undo button."
        confirmLabel="Delete block"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <style jsx global>{SBLD_CSS}</style>
    </DndContext>
  );
}

function LibraryBlock({ type, onClick }: { type: BlockType; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `lib:${type}` });
  const Icon = BLOCK_ICONS[type];
  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className="sbld-block-item"
      style={{ opacity: isDragging ? 0.4 : 1, transform: transform ? CSS.Translate.toString(transform) : undefined }}
    >
      <Icon size={15} className="ic" />
      <span>{BLOCK_LABELS[type]}</span>
      <GripVertical size={13} className="grip" />
    </button>
  );
}

function CanvasEndDropZone({ empty }: { empty: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-end' });
  if (empty) {
    return (
      <div ref={setNodeRef} className="sbld-empty-canvas" style={{ borderColor: isOver ? '#25D366' : undefined }}>
        <Search size={20} />
        <p>Drag a block here, or click one in the library to get started.</p>
      </div>
    );
  }
  return <div ref={setNodeRef} style={{ height: isOver ? 48 : 20, transition: 'height 0.15s ease', background: isOver ? 'rgba(37,211,102,0.08)' : 'transparent' }} />;
}

function CanvasBlock({ block, selected, onSelect, onDuplicate, onDelete, renderCtx }: {
  block: SiteBlock; selected: boolean; onSelect: () => void; onDuplicate: () => void; onDelete: () => void; renderCtx: any;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  return (
    <div
      ref={setNodeRef}
      onClick={onSelect}
      className={`sbld-canvas-block${selected ? ' selected' : ''}`}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
    >
      {selected && (
        <div className="sbld-float-toolbar">
          <span className="ft-label">{BLOCK_LABELS[block.type]}</span>
          <div className="ft-sep" />
          <button className="ft-btn" {...attributes} {...listeners}><GripVertical size={13} /></button>
          <button className="ft-btn" onClick={(e) => { e.stopPropagation(); onDuplicate(); }}><Copy size={13} /></button>
          <button className="ft-btn" onClick={(e) => { e.stopPropagation(); onSelect(); }}><Settings2 size={13} /></button>
          <button className="ft-btn danger" onClick={(e) => { e.stopPropagation(); onDelete(); }}><Trash2 size={13} /></button>
        </div>
      )}
      <div style={{ pointerEvents: 'none' }}>
        {renderBlock(block, renderCtx)}
      </div>
    </div>
  );
}

const SBLD_CSS = `
.sbld-shell { --s-bg: #0A192F; --s-bg-2: #112640; --s-bg-3: #0D2036; --s-border: #1E3350; --s-text: #EAF1F8; --s-text-dim: #7E93AE;
  background: var(--s-bg); font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

.sbld-topbar { height: 56px; flex-shrink: 0; background: var(--s-bg); border-bottom: 1px solid var(--s-border); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; gap: 16px; }
.sbld-topbar-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.sbld-crumb { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.sbld-crumb .sbld-store { font-size: 12px; color: var(--s-text-dim); font-weight: 600; }
.sbld-crumb .sbld-tool { font-family: var(--font-heading, 'Outfit'), sans-serif; font-size: 14.5px; font-weight: 700; color: var(--s-text); display: flex; align-items: center; gap: 8px; }
.sbld-legend-badge { display: inline-flex; align-items: center; gap: 4px; background: linear-gradient(135deg, #F0A554, #E88A2E); color: #2B1A05; font-size: 9.5px; font-weight: 800; letter-spacing: 0.05em; padding: 3px 7px; border-radius: 999px; text-transform: uppercase; }
.sbld-devices { display: flex; align-items: center; gap: 2px; background: var(--s-bg-2); border-radius: 9px; padding: 3px; }
.sbld-device-btn { width: 30px; height: 26px; border-radius: 7px; display: flex; align-items: center; justify-content: center; color: var(--s-text-dim); background: none; border: none; cursor: pointer; }
.sbld-device-btn.active { background: var(--s-bg-3); color: var(--s-text); box-shadow: inset 0 0 0 1px var(--s-border); }
.sbld-topbar-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.sbld-save-indicator { font-size: 11px; color: var(--s-text-dim); min-width: 48px; }
.sbld-icon-btn { width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center; justify-content: center; color: var(--s-text-dim); background: none; border: none; cursor: pointer; }
.sbld-icon-btn:hover:not(:disabled) { background: var(--s-bg-2); color: var(--s-text); }
.sbld-icon-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.sbld-divider-v { width: 1px; height: 20px; background: var(--s-border); margin: 0 2px; }
.sbld-btn { font-family: inherit; font-size: 12.5px; font-weight: 600; padding: 7px 13px; border-radius: 8px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
.sbld-btn.ghost { color: var(--s-text); background: var(--s-bg-2); }
.sbld-btn.ghost:hover { background: var(--s-bg-3); }
.sbld-btn.primary { color: #06231D; background: linear-gradient(135deg, #25D366, #1FB88E); }
.sbld-btn.primary:disabled { opacity: 0.6; cursor: not-allowed; }

.sbld-body { flex: 1; display: grid; grid-template-columns: 216px 1fr 300px; min-height: 0; }

.sbld-rail-left { background: var(--s-bg); border-right: 1px solid var(--s-border); padding: 16px 12px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
.sbld-block-group h4 { font-size: 10.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--s-text-dim); margin: 0 0 6px 4px; }
.sbld-block-item { display: flex; align-items: center; gap: 9px; padding: 8px; border-radius: 8px; color: var(--s-text); font-size: 12.5px; font-weight: 600; background: none; border: none; cursor: grab; width: 100%; text-align: left; }
.sbld-block-item:hover { background: var(--s-bg-2); }
.sbld-block-item .ic { color: var(--s-text-dim); flex-shrink: 0; }
.sbld-block-item .grip { margin-left: auto; color: var(--s-text-dim); opacity: 0.5; flex-shrink: 0; }

.sbld-canvas-wrap { background: var(--s-bg-3); display: flex; justify-content: center; padding: 24px; overflow-y: auto; }
.sbld-canvas { width: 100%; background: #fff; color: #0A192F; border-radius: 14px; box-shadow: 0 0 0 1px var(--s-border), 0 20px 40px -20px rgba(0,0,0,0.5); overflow: hidden; height: fit-content; min-height: 200px; transition: max-width 0.2s ease; }
.sbld-empty-canvas { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 60px 20px; color: #94a3b8; border: 2px dashed #e2e8f0; margin: 20px; border-radius: 14px; text-align: center; font-size: 13px; }

.sbld-canvas-block { position: relative; cursor: pointer; }
.sbld-canvas-block.selected { outline: 2px dashed #25D366; outline-offset: -2px; }
.sbld-float-toolbar { position: absolute; top: -16px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 2px; background: var(--s-bg); border: 1px solid var(--s-border); border-radius: 8px; padding: 4px; box-shadow: 0 8px 20px -8px rgba(0,0,0,0.5); z-index: 5; }
.sbld-float-toolbar .ft-label { font-size: 10px; font-weight: 700; color: var(--s-text); padding: 0 8px 0 4px; white-space: nowrap; }
.sbld-float-toolbar .ft-sep { width: 1px; height: 16px; background: var(--s-border); margin: 0 2px; }
.sbld-float-toolbar .ft-btn { width: 24px; height: 24px; border-radius: 5px; display: flex; align-items: center; justify-content: center; color: var(--s-text-dim); background: none; border: none; cursor: pointer; }
.sbld-float-toolbar .ft-btn:hover { background: var(--s-bg-2); color: var(--s-text); }
.sbld-float-toolbar .ft-btn.danger:hover { color: #f87171; }

.sbld-rail-right { background: var(--s-bg); border-left: 1px solid var(--s-border); display: flex; flex-direction: column; min-height: 0; }
.sbld-inspector-head { padding: 16px 16px 0; }
.sbld-inspector-head .title { font-family: var(--font-heading, 'Outfit'), sans-serif; font-size: 14px; font-weight: 700; color: var(--s-text); }
.sbld-inspector-head .sub { font-size: 11px; color: var(--s-text-dim); margin-top: 2px; padding-bottom: 14px; border-bottom: 1px solid var(--s-border); }
.sbld-inspector-body { padding: 16px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; }
.sbld-ai-chip { display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 10px; background: linear-gradient(135deg, rgba(100,255,218,0.14), rgba(100,255,218,0.04)); border: 1px solid rgba(100,255,218,0.3); }
.sbld-ai-chip svg { color: #64FFDA; flex-shrink: 0; }
.sbld-ai-chip .t { font-size: 12.5px; font-weight: 700; color: var(--s-text); }
.sbld-ai-chip .d { font-size: 11px; color: var(--s-text-dim); margin-top: 2px; }

.sbld-drag-ghost { background: var(--s-bg-2, #112640); border: 1px solid #25D366; color: #fff; padding: 8px 14px; border-radius: 8px; font-size: 12.5px; font-weight: 700; }

.sbld-preview-overlay { position: fixed; inset: 0; z-index: 3000; background: #f3f5f8; display: flex; flex-direction: column; }
.sbld-preview-close { position: fixed; top: 16px; right: 16px; z-index: 3001; width: 36px; height: 36px; border-radius: 999px; background: #0A192F; color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.sbld-preview-frame { flex: 1; overflow-y: auto; }

.sbld-modal-overlay { position: fixed; inset: 0; z-index: 3000; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; padding: 24px; }
.sbld-modal { width: min(100%, 420px); background: #0A192F; border: 1px solid #1E3350; border-radius: 18px; padding: 24px; color: #EAF1F8; }
.sbld-modal h2 { margin: 0 0 6px; font-size: 17px; font-weight: 800; }
.sbld-modal p { margin: 0 0 16px; font-size: 12.5px; color: #7E93AE; }
.sbld-modal-input { width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #1E3350; background: #112640; color: #EAF1F8; font-size: 13px; margin-bottom: 16px; }
.sbld-domain-current { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: #112640; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
.sbld-domain-status { margin-left: auto; font-size: 10px; text-transform: uppercase; font-weight: 700; padding: 2px 8px; border-radius: 999px; background: #1E3350; color: #7E93AE; }
.sbld-domain-status.active { background: rgba(37,211,102,0.18); color: #25D366; }
.sbld-modal-actions { display: flex; justify-content: flex-end; gap: 10px; }
.sbld-modal-actions button { padding: 9px 16px; border-radius: 8px; border: 1px solid #1E3350; background: transparent; color: #EAF1F8; cursor: pointer; font-size: 13px; }
.sbld-modal-actions button.primary { background: linear-gradient(135deg, #25D366, #1FB88E); color: #06231D; font-weight: 700; border: none; }
.sbld-modal-actions button:disabled { opacity: 0.6; cursor: not-allowed; }

${SB_CSS}
`;
