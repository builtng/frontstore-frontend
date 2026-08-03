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
  Quote, HelpCircle, Timer, Image as ImageIcon, Images, Play, Search, Globe,
  Layers, Lock, EyeOff, Palette, Files, Check,
  ShieldCheck, Building2, BarChart3, Users, BookOpen, Table2, Megaphone, Mail, UtensilsCrossed, Share2, Bookmark, History,
} from 'lucide-react';
import BlockRenderer, { renderBlock, themeVars, SB_CSS, WhatsappLine } from '../../../../components/storefront/BlockRenderer';
import BlockInspector from '../../../../components/storefront/BlockInspector';
import StylePanel from '../../../../components/storefront/StylePanel';
import LayersPanel from '../../../../components/storefront/LayersPanel';
import PagesPanel, { SitePage } from '../../../../components/storefront/PagesPanel';
import SavedSectionsPanel, { SavedSection } from '../../../../components/storefront/SavedSectionsPanel';
import AiAssistPanel from '../../../../components/storefront/AiAssistPanel';
import BlockContextMenu from '../../../../components/storefront/BlockContextMenu';
import ConfirmDialog from '../../../../components/ConfirmDialog';
import { EditorStateProvider, useEditorState } from '../../../../components/storefront/editorState';
import {
  BLOCK_GROUPS, BLOCK_LABELS, BlockType, BlockStyle, BlockVisibility, SiteBlock, Device,
  createDefaultBlock, isBlockHiddenOn,
} from '../../../../components/storefront/blockTypes';

const BLOCK_ICONS: Record<BlockType, React.ComponentType<any>> = {
  section: Rows3, columns: Columns3, spacer: MoveVertical, divider: Minus,
  hero: PanelTop, product_grid: LayoutGrid, featured_product: Star, categories: Tags,
  digital_spotlight: Download, pricing_table: CreditCard,
  booking: Calendar,
  whatsapp_cta: MessageCircle, testimonials: Quote, faq: HelpCircle, countdown: Timer,
  image: ImageIcon, gallery: Images, video: Play,
  trust_badges: ShieldCheck, logos_strip: Building2,
  stats_counters: BarChart3, team: Users, about_story: BookOpen, comparison_table: Table2,
  announcement_bar: Megaphone, newsletter: Mail,
  menu: UtensilsCrossed,
  social_links: Share2,
  popup_trigger: MessageCircle,
};

const DEVICE_WIDTHS: Record<string, number> = { desktop: 920, tablet: 520, mobile: 375 };

interface SiteState {
  id: string; name: string; slug: string; layout: SiteBlock[];
  theme: Record<string, any> | null; is_published: boolean;
  custom_domain: string | null; domain_status: string | null; domain_error: string | null;
}

interface FullSitePage extends SitePage {
  layout: SiteBlock[];
  seo_title: string | null;
  seo_description: string | null;
}

interface SiteThemeOption {
  id: string;
  key: string;
  name: string;
  category: string;
  tokens: Record<string, any>;
  preview_colors: string[];
}

interface PageVersion {
  id: string;
  label: string | null;
  is_publish_snapshot: boolean;
  created_at: string;
  layout: SiteBlock[];
}

interface SiteAnalytics {
  total_views_30d: number;
  pages: { id: string; name: string; slug: string; views_30d: number }[];
}

function isEditableTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

export default function StoreBuildEditorPageWrapper() {
  return (
    <EditorStateProvider>
      <StoreBuildEditorPage />
    </EditorStateProvider>
  );
}

function StoreBuildEditorPage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params?.siteId as string;
  const apiUrl = (typeof window !== 'undefined' && localStorage.getItem('dev_api_url')) || process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';

  const {
    device, setDevice, selectedId, setSelectedId, leftTab, setLeftTab, rightTab, setRightTab,
    clipboard, setClipboard, contextMenu, openContextMenu, closeContextMenu,
  } = useEditorState();

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [site, setSite] = useState<SiteState | null>(null);
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [whatsappLines, setWhatsappLines] = useState<WhatsappLine[]>([]);

  const [layout, setLayout] = useState<SiteBlock[]>([]);
  const [pages, setPages] = useState<FullSitePage[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [publishing, setPublishing] = useState(false);
  const [activeDragType, setActiveDragType] = useState<BlockType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deletePageTarget, setDeletePageTarget] = useState<string | null>(null);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [domainInput, setDomainInput] = useState('');
  const [domainSaving, setDomainSaving] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [themes, setThemes] = useState<SiteThemeOption[]>([]);
  const [themesLoading, setThemesLoading] = useState(false);
  const [applyingThemeKey, setApplyingThemeKey] = useState<string | null>(null);
  const [savedSections, setSavedSections] = useState<SavedSection[]>([]);
  const [savedSectionsLoading, setSavedSectionsLoading] = useState(false);
  const [savedSectionsLoaded, setSavedSectionsLoaded] = useState(false);
  const [saveSectionTarget, setSaveSectionTarget] = useState<string | null>(null);
  const [saveSectionName, setSaveSectionName] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiQuotaRemaining, setAiQuotaRemaining] = useState<number | null>(null);
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [newLineLabel, setNewLineLabel] = useState('');
  const [newLinePhone, setNewLinePhone] = useState('');
  const [newLineDepartment, setNewLineDepartment] = useState('');
  const [addingLine, setAddingLine] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showSeoModal, setShowSeoModal] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoSaving, setSeoSaving] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [versions, setVersions] = useState<PageVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [restoringVersionId, setRestoringVersionId] = useState<string | null>(null);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [insights, setInsights] = useState<SiteAnalytics | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

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
        const [storeRes, siteRes, pagesRes, productsRes, categoriesRes, faqsRes, reviewsRes, whatsappLinesRes] = await Promise.all([
          fetch(`${apiUrl}/v1/store`, { headers: authHeaders(storedToken) }),
          fetch(`${apiUrl}/v1/store/sites/${siteId}`, { headers: authHeaders(storedToken) }),
          fetch(`${apiUrl}/v1/store/sites/${siteId}/pages`, { headers: authHeaders(storedToken) }),
          fetch(`${apiUrl}/v1/products?limit=200`, { headers: authHeaders(storedToken) }),
          fetch(`${apiUrl}/v1/categories`, { headers: authHeaders(storedToken) }),
          fetch(`${apiUrl}/v1/faqs`, { headers: authHeaders(storedToken) }),
          fetch(`${apiUrl}/v1/store/reviews`, { headers: authHeaders(storedToken) }),
          fetch(`${apiUrl}/v1/store/whatsapp-lines`, { headers: authHeaders(storedToken) }),
        ]);

        const storeJson = await storeRes.json();
        const siteJson = await siteRes.json();
        const pagesJson = await pagesRes.json().catch(() => null);

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

        const fetchedPages: FullSitePage[] = pagesJson?.data || [];
        const homePage = fetchedPages.find((p) => p.is_home) || fetchedPages[0];
        setPages(fetchedPages);

        const initialLayout = homePage?.layout || siteJson.data.layout || [];
        setActivePageId(homePage?.id || null);
        skipHistoryPush.current = true;
        setLayout(initialLayout);
        history.current = [initialLayout];
        historyIndex.current = 0;

        const productsJson = await productsRes.json().catch(() => null);
        const categoriesJson = await categoriesRes.json().catch(() => null);
        const faqsJson = await faqsRes.json().catch(() => null);
        const reviewsJson = await reviewsRes.json().catch(() => null);
        const whatsappLinesJson = await whatsappLinesRes.json().catch(() => null);

        if (cancelled) return;

        setProducts(productsJson?.data?.data || []);
        setCategories(categoriesJson?.data || []);
        setFaqs(faqsJson?.data || []);
        setReviews((reviewsJson?.data || []).map((r: any) => ({
          reviewer_name: r.customer_name || 'Anonymous', body: r.comment || '', rating: r.rating,
        })));
        setWhatsappLines(whatsappLinesJson?.data || []);
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

  // Autosave the active page's draft layout 1.2s after the last edit.
  useEffect(() => {
    if (!token || !site || loading || !activePageId) return;
    setSaveState('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`${apiUrl}/v1/store/sites/${siteId}/pages/${activePageId}`, {
          method: 'PUT', headers: authHeaders(token), body: JSON.stringify({ layout }),
        });
        setSaveState(res.ok ? 'saved' : 'idle');
        if (res.ok) {
          setPages((prev) => prev.map((p) => (p.id === activePageId ? { ...p, layout } : p)));
        }
      } catch {
        setSaveState('idle');
      }
    }, 1200);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, activePageId]);

  const activatePage = useCallback((page: FullSitePage) => {
    setActivePageId(page.id);
    skipHistoryPush.current = true;
    setLayout(page.layout || []);
    history.current = [page.layout || []];
    historyIndex.current = 0;
    setSelectedId(null);
  }, [setSelectedId]);

  const switchToPage = (pageId: string) => {
    if (pageId === activePageId) return;
    const target = pages.find((p) => p.id === pageId);
    if (!target) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    activatePage(target);
  };

  const addPage = async (name: string) => {
    if (!token) return;
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `page-${Date.now()}`;
    try {
      const res = await fetch(`${apiUrl}/v1/store/sites/${siteId}/pages`, {
        method: 'POST', headers: authHeaders(token), body: JSON.stringify({ name, slug }),
      });
      const json = await res.json();
      if (res.ok) {
        const newPage: FullSitePage = { ...json.data, layout: json.data.layout || [] };
        setPages((prev) => [...prev, newPage]);
        activatePage(newPage);
        setLeftTab('pages');
      } else {
        toast.error(json.message || 'Could not create this page.');
      }
    } catch {
      toast.error('Network error creating page.');
    }
  };

  const duplicatePage = async (pageId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/v1/store/sites/${siteId}/pages/${pageId}/duplicate`, {
        method: 'POST', headers: authHeaders(token),
      });
      const json = await res.json();
      if (res.ok) {
        const newPage: FullSitePage = { ...json.data, layout: json.data.layout || [] };
        setPages((prev) => [...prev, newPage]);
        activatePage(newPage);
      } else {
        toast.error(json.message || 'Could not duplicate this page.');
      }
    } catch {
      toast.error('Network error duplicating page.');
    }
  };

  const deletePage = async (pageId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/v1/store/sites/${siteId}/pages/${pageId}`, {
        method: 'DELETE', headers: authHeaders(token),
      });
      if (res.ok) {
        const remaining = pages.filter((p) => p.id !== pageId);
        setPages(remaining);
        if (activePageId === pageId) {
          const fallback = remaining.find((p) => p.is_home) || remaining[0];
          if (fallback) activatePage(fallback);
        }
      } else {
        const json = await res.json().catch(() => null);
        toast.error(json?.message || 'Could not delete this page.');
      }
    } catch {
      toast.error('Network error deleting page.');
    }
  };

  const movePage = (pageId: string, direction: 'up' | 'down') => {
    const sorted = [...pages].sort((a, b) => a.position - b.position);
    const idx = sorted.findIndex((p) => p.id === pageId);
    const swapWith = direction === 'up' ? idx - 1 : idx + 1;
    if (idx === -1 || swapWith < 0 || swapWith >= sorted.length) return;
    [sorted[idx], sorted[swapWith]] = [sorted[swapWith], sorted[idx]];
    const reordered = sorted.map((p, i) => ({ ...p, position: i }));
    setPages(reordered);
    if (token) {
      fetch(`${apiUrl}/v1/store/sites/${siteId}/pages/reorder`, {
        method: 'POST', headers: authHeaders(token), body: JSON.stringify({ page_ids: reordered.map((p) => p.id) }),
      }).catch(() => toast.error('Network error saving page order.'));
    }
  };

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

  const updateBlockStyle = useCallback((id: string, patch: Partial<BlockStyle>) => {
    applyLayout((prev) => prev.map((b) => {
      if (b.id !== id) return b;
      if (device === 'desktop') return { ...b, style: { ...(b.style || {}), ...patch } };
      return {
        ...b,
        responsiveStyle: { ...(b.responsiveStyle || {}), [device]: { ...(b.responsiveStyle?.[device] || {}), ...patch } },
      };
    }));
  }, [applyLayout, device]);

  const updateBlockVisibility = useCallback((id: string, visibility: BlockVisibility) => {
    applyLayout((prev) => prev.map((b) => (b.id === id ? { ...b, visibility } : b)));
  }, [applyLayout]);

  // Layers panel eye icon: toggles visibility for the device currently being previewed.
  const toggleBlockVisibilityForDevice = useCallback((id: string) => {
    applyLayout((prev) => prev.map((b) => {
      if (b.id !== id) return b;
      const currentlyVisible = b.visibility?.[device] !== false;
      return { ...b, visibility: { ...b.visibility, [device]: !currentlyVisible } };
    }));
  }, [applyLayout, device]);

  // Context menu Hide/Show: hides or shows the block on every device at once.
  const toggleBlockFullyHidden = (id: string) => {
    applyLayout((prev) => prev.map((b) => {
      if (b.id !== id) return b;
      const fullyHidden = b.visibility?.desktop === false && b.visibility?.tablet === false && b.visibility?.mobile === false;
      return { ...b, visibility: fullyHidden ? undefined : { desktop: false, tablet: false, mobile: false } };
    }));
  };

  const toggleBlockLock = (id: string) => {
    applyLayout((prev) => prev.map((b) => (b.id === id ? { ...b, locked: !b.locked } : b)));
  };

  const duplicateBlock = (id: string) => {
    applyLayout((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const copy = createDefaultBlock(prev[idx].type);
      copy.data = JSON.parse(JSON.stringify(prev[idx].data));
      if (prev[idx].style) copy.style = JSON.parse(JSON.stringify(prev[idx].style));
      if (prev[idx].responsiveStyle) copy.responsiveStyle = JSON.parse(JSON.stringify(prev[idx].responsiveStyle));
      if (prev[idx].visibility) copy.visibility = { ...prev[idx].visibility };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  };

  const copyBlock = (id: string) => {
    const block = layout.find((b) => b.id === id);
    if (block) setClipboard(JSON.parse(JSON.stringify(block)));
  };

  const pasteBlock = (afterId?: string | null) => {
    if (!clipboard) return;
    const copy = createDefaultBlock(clipboard.type);
    copy.data = JSON.parse(JSON.stringify(clipboard.data));
    if (clipboard.style) copy.style = JSON.parse(JSON.stringify(clipboard.style));
    if (clipboard.responsiveStyle) copy.responsiveStyle = JSON.parse(JSON.stringify(clipboard.responsiveStyle));
    if (clipboard.visibility) copy.visibility = { ...clipboard.visibility };
    const targetId = afterId ?? selectedId;
    applyLayout((prev) => {
      const idx = targetId ? prev.findIndex((b) => b.id === targetId) : prev.length - 1;
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    setSelectedId(copy.id);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    applyLayout((prev) => prev.filter((b) => b.id !== deleteTarget));
    if (selectedId === deleteTarget) setSelectedId(null);
    setDeleteTarget(null);
  };

  const confirmDeletePage = () => {
    if (!deletePageTarget) return;
    deletePage(deletePageTarget);
    setDeletePageTarget(null);
  };

  // Keyboard shortcuts — ignored while typing in a field so Cmd+C/V etc. keep
  // their native text-editing behaviour inside inspector inputs.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (isEditableTarget(e.target)) return;

      if (meta && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
        return;
      }
      if (!selectedId) return;
      const selectedBlock = layout.find((b) => b.id === selectedId);
      if (meta && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateBlock(selectedId);
        return;
      }
      if (meta && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        copyBlock(selectedId);
        return;
      }
      if (meta && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        pasteBlock(selectedId);
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBlock && !selectedBlock.locked) {
        e.preventDefault();
        setDeleteTarget(selectedId);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, layout, clipboard]);

  const handlePublish = async () => {
    if (!token || !activePageId) return;
    setPublishing(true);
    try {
      await fetch(`${apiUrl}/v1/store/sites/${siteId}/pages/${activePageId}`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify({ layout }) });
      const res = await fetch(`${apiUrl}/v1/store/sites/${siteId}/pages/${activePageId}/publish`, { method: 'POST', headers: authHeaders(token) });
      const json = await res.json();
      if (res.ok) {
        setPages((prev) => prev.map((p) => (p.id === activePageId ? { ...p, is_published: true } : p)));
        toast.success('Page published!');
      } else {
        toast.error(json.message || 'Could not publish this page.');
      }
    } catch {
      toast.error('Network error publishing this page.');
    } finally {
      setPublishing(false);
    }
  };

  const openThemeModal = async () => {
    setShowThemeModal(true);
    if (themes.length > 0 || !token) return;
    setThemesLoading(true);
    try {
      const res = await fetch(`${apiUrl}/v1/store/themes`, { headers: authHeaders(token) });
      const json = await res.json();
      if (res.ok) setThemes(json.data || []);
      else toast.error(json.message || 'Could not load themes.');
    } catch {
      toast.error('Network error loading themes.');
    } finally {
      setThemesLoading(false);
    }
  };

  const applyTheme = async (theme: SiteThemeOption) => {
    if (!token) return;
    setApplyingThemeKey(theme.key);
    try {
      const nextTheme = { ...theme.tokens, appliedThemeKey: theme.key };
      const res = await fetch(`${apiUrl}/v1/store/sites/${siteId}`, {
        method: 'PUT', headers: authHeaders(token), body: JSON.stringify({ theme: nextTheme }),
      });
      const json = await res.json();
      if (res.ok) {
        setSite((prev) => (prev ? { ...prev, theme: json.data.theme } : prev));
        toast.success(`${theme.name} theme applied.`);
      } else {
        toast.error(json.message || 'Could not apply this theme.');
      }
    } catch {
      toast.error('Network error applying theme.');
    } finally {
      setApplyingThemeKey(null);
    }
  };

  const addWhatsappLine = async () => {
    if (!token || !newLineLabel.trim() || !newLinePhone.trim()) return;
    setAddingLine(true);
    try {
      const res = await fetch(`${apiUrl}/v1/store/whatsapp-lines`, {
        method: 'POST', headers: authHeaders(token),
        body: JSON.stringify({ label: newLineLabel.trim(), phone: newLinePhone.trim(), department: newLineDepartment.trim() || undefined }),
      });
      const json = await res.json();
      if (res.ok) {
        setWhatsappLines((prev) => [...prev, json.data]);
        setNewLineLabel(''); setNewLinePhone(''); setNewLineDepartment('');
        toast.success('WhatsApp line added.');
      } else {
        toast.error(json.message || 'Could not add this line.');
      }
    } catch {
      toast.error('Network error adding WhatsApp line.');
    } finally {
      setAddingLine(false);
    }
  };

  const deleteWhatsappLine = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/v1/store/whatsapp-lines/${id}`, { method: 'DELETE', headers: authHeaders(token) });
      if (res.ok) setWhatsappLines((prev) => prev.filter((l) => l.id !== id));
      else toast.error('Could not delete this line.');
    } catch {
      toast.error('Network error deleting WhatsApp line.');
    }
  };

  const openSeoModal = () => {
    setSeoTitle(activePage?.seo_title || '');
    setSeoDescription(activePage?.seo_description || '');
    setShowSeoModal(true);
  };

  const saveSeo = async () => {
    if (!token || !activePageId) return;
    setSeoSaving(true);
    try {
      const res = await fetch(`${apiUrl}/v1/store/sites/${siteId}/pages/${activePageId}`, {
        method: 'PUT', headers: authHeaders(token),
        body: JSON.stringify({ seo_title: seoTitle || null, seo_description: seoDescription || null }),
      });
      const json = await res.json();
      if (res.ok) {
        setPages((prev) => prev.map((p) => (p.id === activePageId ? { ...p, seo_title: json.data.seo_title, seo_description: json.data.seo_description } : p)));
        toast.success('SEO details saved.');
        setShowSeoModal(false);
      } else {
        toast.error(json.message || 'Could not save SEO details.');
      }
    } catch {
      toast.error('Network error saving SEO details.');
    } finally {
      setSeoSaving(false);
    }
  };

  const openHistoryModal = async () => {
    setShowHistoryModal(true);
    if (!token || !activePageId) return;
    setVersionsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/v1/store/sites/${siteId}/pages/${activePageId}/versions`, { headers: authHeaders(token) });
      const json = await res.json();
      if (res.ok) setVersions(json.data || []);
      else toast.error(json.message || 'Could not load version history.');
    } catch {
      toast.error('Network error loading version history.');
    } finally {
      setVersionsLoading(false);
    }
  };

  const saveVersionSnapshot = async () => {
    if (!token || !activePageId) return;
    try {
      const res = await fetch(`${apiUrl}/v1/store/sites/${siteId}/pages/${activePageId}/versions`, {
        method: 'POST', headers: authHeaders(token), body: JSON.stringify({}),
      });
      const json = await res.json();
      if (res.ok) {
        setVersions((prev) => [json.data, ...prev]);
        toast.success('Version saved.');
      } else {
        toast.error(json.message || 'Could not save this version.');
      }
    } catch {
      toast.error('Network error saving version.');
    }
  };

  const restoreVersion = async (versionId: string) => {
    if (!token || !activePageId) return;
    setRestoringVersionId(versionId);
    try {
      const res = await fetch(`${apiUrl}/v1/store/sites/${siteId}/pages/${activePageId}/versions/${versionId}/restore`, {
        method: 'POST', headers: authHeaders(token),
      });
      const json = await res.json();
      if (res.ok) {
        const restoredLayout = json.data.layout || [];
        skipHistoryPush.current = true;
        setLayout(restoredLayout);
        history.current = [...history.current.slice(0, historyIndex.current + 1), restoredLayout];
        historyIndex.current = history.current.length - 1;
        setPages((prev) => prev.map((p) => (p.id === activePageId ? { ...p, layout: restoredLayout } : p)));
        toast.success('Version restored to your draft — publish when ready.');
        setShowHistoryModal(false);
      } else {
        toast.error(json.message || 'Could not restore this version.');
      }
    } catch {
      toast.error('Network error restoring version.');
    } finally {
      setRestoringVersionId(null);
    }
  };

  const openInsightsModal = async () => {
    setShowInsightsModal(true);
    if (!token) return;
    setInsightsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/v1/store/sites/${siteId}/analytics`, { headers: authHeaders(token) });
      const json = await res.json();
      if (res.ok) setInsights(json.data);
      else toast.error(json.message || 'Could not load insights.');
    } catch {
      toast.error('Network error loading insights.');
    } finally {
      setInsightsLoading(false);
    }
  };

  const loadSavedSections = async () => {
    if (savedSectionsLoaded || !token) return;
    setSavedSectionsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/v1/store/sections`, { headers: authHeaders(token) });
      const json = await res.json();
      if (res.ok) { setSavedSections(json.data || []); setSavedSectionsLoaded(true); }
      else toast.error(json.message || 'Could not load saved sections.');
    } catch {
      toast.error('Network error loading saved sections.');
    } finally {
      setSavedSectionsLoading(false);
    }
  };

  const generateWithAi = async (prompt: string, scope: 'section' | 'page') => {
    if (!token || !activePageId) return;
    setAiGenerating(true);
    try {
      const res = await fetch(`${apiUrl}/v1/store/sites/${siteId}/pages/${activePageId}/ai/generate`, {
        method: 'POST', headers: authHeaders(token), body: JSON.stringify({ prompt, scope }),
      });
      const json = await res.json();
      if (typeof json.quota_remaining === 'number' || json.quota_remaining === null) {
        setAiQuotaRemaining(json.quota_remaining);
      }
      if (res.ok) {
        const newBlocks: SiteBlock[] = (json.data?.blocks || []).map((b: any) => {
          const block = createDefaultBlock(b.type as BlockType);
          block.data = { ...block.data, ...(b.data || {}) };
          return block;
        });
        if (newBlocks.length === 0) {
          toast.error('AI could not generate a usable result. Try rephrasing your prompt.');
          return;
        }
        applyLayout((prev) => [...prev, ...newBlocks]);
        setSelectedId(newBlocks[newBlocks.length - 1].id);
        toast.success(scope === 'page' ? 'Page generated!' : 'Section added!');
      } else {
        toast.error(json.message || 'Could not generate this right now.');
      }
    } catch {
      toast.error('Network error generating with AI.');
    } finally {
      setAiGenerating(false);
    }
  };

  const insertSavedSection = (section: SavedSection) => {
    const copy = createDefaultBlock(section.block.type);
    copy.data = JSON.parse(JSON.stringify(section.block.data || {}));
    if (section.block.style) copy.style = JSON.parse(JSON.stringify(section.block.style));
    if (section.block.responsiveStyle) copy.responsiveStyle = JSON.parse(JSON.stringify(section.block.responsiveStyle));
    if (section.block.visibility) copy.visibility = { ...section.block.visibility };
    applyLayout((prev) => [...prev, copy]);
    setSelectedId(copy.id);
  };

  const deleteSavedSection = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/v1/store/sections/${id}`, { method: 'DELETE', headers: authHeaders(token) });
      if (res.ok) setSavedSections((prev) => prev.filter((s) => s.id !== id));
      else toast.error('Could not delete this section.');
    } catch {
      toast.error('Network error deleting section.');
    }
  };

  const submitSaveSection = async () => {
    if (!token || !saveSectionTarget || !saveSectionName.trim()) return;
    const block = layout.find((b) => b.id === saveSectionTarget);
    if (!block) { setSaveSectionTarget(null); return; }
    try {
      const res = await fetch(`${apiUrl}/v1/store/sections`, {
        method: 'POST', headers: authHeaders(token), body: JSON.stringify({ name: saveSectionName.trim(), block }),
      });
      const json = await res.json();
      if (res.ok) {
        setSavedSections((prev) => [json.data, ...prev]);
        setSavedSectionsLoaded(true);
        toast.success('Section saved.');
        setSaveSectionTarget(null);
        setSaveSectionName('');
      } else {
        toast.error(json.message || 'Could not save this section.');
      }
    } catch {
      toast.error('Network error saving section.');
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

  const generateCopy = async (kind: string, context: string): Promise<string | null> => {
    if (!token) return null;
    try {
      const res = await fetch(`${apiUrl}/v1/store/ai/copy`, {
        method: 'POST', headers: authHeaders(token), body: JSON.stringify({ kind, context }),
      });
      const json = await res.json();
      if (typeof json.quota_remaining === 'number' || json.quota_remaining === null) {
        setAiQuotaRemaining(json.quota_remaining);
      }
      if (res.ok) return json.data?.text || null;
      toast.error(json.message || 'Could not generate text.');
      return null;
    } catch {
      toast.error('Network error generating text.');
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

  const inspectorCtx = useMemo(() => ({ products, categories, whatsappLines, onUploadImage: uploadImage, onGenerateCopy: generateCopy }), [products, categories, whatsappLines]);
  const renderCtx = useMemo(() => ({
    store: store || {}, products, categories, faqs, reviews, apiUrl, editable: true, siteTheme: site?.theme, whatsappLines,
  }), [store, products, categories, faqs, reviews, apiUrl, site?.theme, whatsappLines]);

  const selectedBlock = layout.find((b) => b.id === selectedId) || null;
  const activePage = pages.find((p) => p.id === activePageId) || null;
  const contextMenuBlock = contextMenu ? layout.find((b) => b.id === contextMenu.blockId) || null : null;

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
            <button className="sbld-icon-btn" onClick={() => router.push('/dashboard/store-build')} title="Back to stores"><ArrowLeft size={15} /></button>
            <div className="sbld-crumb">
              <span className="sbld-store">{store.store_name || store.username}</span>
              <span className="sbld-tool">{site.name}</span>
            </div>

            {/* Page Selector Dropdown */}
            <div className="sbld-page-selector" style={{ marginLeft: 12, position: 'relative' }}>
              <select
                value={activePageId || ''}
                onChange={(e) => switchToPage(e.target.value)}
                style={{
                  background: '#0D2036', border: '1px solid #1E3350', color: '#EAF1F8',
                  borderRadius: 8, padding: '5px 24px 5px 10px', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', outline: 'none'
                }}
              >
                {pages.map((p) => (
                  <option key={p.id} value={p.id}>Page: {p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="sbld-center-controls" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Width Indicator */}
            <span style={{ fontSize: 11.5, color: '#7E93AE', fontWeight: 600, background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)' }}>
              Width: <strong style={{ color: '#64FFDA' }}>{DEVICE_WIDTHS[device]}px</strong>
            </span>

            {/* Responsive Breakpoints */}
            <div className="sbld-devices">
              {([['desktop', 'xxl', Monitor], ['desktop', 'xl', Monitor], ['tablet', 'lg', Tablet], ['tablet', 'md', Tablet], ['mobile', 'sm', Smartphone]] as const).map(([devKey, bpLabel, Icon], idx) => (
                <button
                  key={`${devKey}-${bpLabel}-${idx}`}
                  className={`sbld-device-btn${device === devKey ? ' active' : ''}`}
                  onClick={() => setDevice(devKey as Device)}
                  title={`Breakpoint ${bpLabel.toUpperCase()}`}
                  style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', padding: '4px 7px' }}
                >
                  {bpLabel}
                </button>
              ))}
            </div>

            {/* Zoom Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#0D2036', border: '1px solid #1E3350', borderRadius: 6, padding: '2px 6px' }}>
              <button style={{ background: 'none', border: 'none', color: '#7E93AE', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>-</button>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#EAF1F8' }}>100%</span>
              <button style={{ background: 'none', border: 'none', color: '#7E93AE', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>+</button>
            </div>
          </div>

          <div className="sbld-topbar-right">
            <span className="sbld-save-indicator" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#64FFDA', fontSize: 11, fontWeight: 600 }}>
              ☁ {saveState === 'saving' ? 'Saving…' : 'Synced'}
            </span>
            <button className="sbld-icon-btn" disabled={historyIndex.current <= 0} onClick={undo} title="Undo (⌘Z)"><Undo2 size={15} /></button>
            <button className="sbld-icon-btn" disabled={historyIndex.current >= history.current.length - 1} onClick={redo} title="Redo (⌘⇧Z)"><Redo2 size={15} /></button>
            <div className="sbld-divider-v" />
            <div className="sbld-more-wrap">
              <button className="sbld-btn ghost" onClick={() => setShowMoreMenu((v) => !v)}><Settings2 size={13} /> Settings</button>
              {showMoreMenu && (
                <div className="sbld-more-menu" onMouseLeave={() => setShowMoreMenu(false)}>
                  <button onClick={() => { setShowMoreMenu(false); openThemeModal(); }}><Palette size={13} /> Theme</button>
                  <button onClick={() => { setShowMoreMenu(false); setShowWhatsappModal(true); }}><MessageCircle size={13} /> WhatsApp lines</button>
                  <button onClick={() => { setShowMoreMenu(false); setShowDomainModal(true); }}><Globe size={13} /> Domain</button>
                  <button onClick={() => { setShowMoreMenu(false); openSeoModal(); }}><Search size={13} /> SEO</button>
                  <button onClick={() => { setShowMoreMenu(false); openHistoryModal(); }}><History size={13} /> Version history</button>
                  <button onClick={() => { setShowMoreMenu(false); openInsightsModal(); }}><BarChart3 size={13} /> Insights</button>
                </div>
              )}
            </div>
            <button className="sbld-btn ghost" onClick={() => setShowPreview(true)}><Eye size={13} /> Preview</button>
            <button
              className="sbld-btn primary"
              onClick={handlePublish}
              disabled={publishing || !activePageId}
              style={{ background: 'linear-gradient(135deg, #128C7E, #25D366)', color: '#fff', fontWeight: 800, borderRadius: 8, padding: '7px 18px', boxShadow: '0 4px 14px rgba(37,211,102,0.35)' }}
            >
              {publishing ? 'Publishing…' : activePage?.is_published ? 'Republish' : 'Publish'}
            </button>
          </div>
        </div>

        <div className="sbld-body">
          {/* Left rail: block library / layers */}
          <div className="sbld-rail-left">
            <div className="sbld-rail-tabs">
              <button className={`sbld-rail-tab${leftTab === 'blocks' ? ' active' : ''}`} onClick={() => setLeftTab('blocks')}>
                <LayoutGrid size={13} /> Blocks
              </button>
              <button className={`sbld-rail-tab${leftTab === 'layers' ? ' active' : ''}`} onClick={() => setLeftTab('layers')}>
                <Layers size={13} /> Layers
              </button>
              <button className={`sbld-rail-tab${leftTab === 'pages' ? ' active' : ''}`} onClick={() => setLeftTab('pages')}>
                <Files size={13} /> Pages
              </button>
              <button className={`sbld-rail-tab${leftTab === 'saved' ? ' active' : ''}`} onClick={() => { setLeftTab('saved'); loadSavedSections(); }}>
                <Bookmark size={13} /> Saved
              </button>
            </div>

            {leftTab === 'blocks' && (
              <div className="sbld-rail-scroll">
                {BLOCK_GROUPS.map((group) => (
                  <div key={group.label} className="sbld-block-group">
                    <h4>{group.label}</h4>
                    {group.types.map((type) => (
                      <LibraryBlock key={type} type={type} onClick={() => insertBlock(type, layout.length)} />
                    ))}
                  </div>
                ))}
              </div>
            )}

            {leftTab === 'layers' && (
              <div className="sbld-rail-scroll">
                <LayersPanel
                  layout={layout}
                  selectedId={selectedId}
                  device={device}
                  onSelect={setSelectedId}
                  onToggleVisibility={toggleBlockVisibilityForDevice}
                  onToggleLock={toggleBlockLock}
                  onDuplicate={duplicateBlock}
                  onDelete={setDeleteTarget}
                />
              </div>
            )}

            {leftTab === 'pages' && (
              <div className="sbld-rail-scroll">
                <PagesPanel
                  pages={pages}
                  activePageId={activePageId}
                  onSelect={switchToPage}
                  onAdd={addPage}
                  onDuplicate={duplicatePage}
                  onDelete={setDeletePageTarget}
                  onMove={movePage}
                />
              </div>
            )}

            {leftTab === 'saved' && (
              <div className="sbld-rail-scroll">
                <SavedSectionsPanel
                  sections={savedSections}
                  loading={savedSectionsLoading}
                  onInsert={insertSavedSection}
                  onDelete={deleteSavedSection}
                />
              </div>
            )}
          </div>

          {/* Center: canvas */}
          <div className="sbld-canvas-wrap">
            <div className="sbld-canvas" style={{ maxWidth: DEVICE_WIDTHS[device], ...themeVars(store, site.theme) }}>
              <SortableContext items={layout.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                {layout.map((block) => (
                  <CanvasBlock
                    key={block.id}
                    block={block}
                    device={device}
                    selected={selectedId === block.id}
                    onSelect={() => setSelectedId(block.id)}
                    onDuplicate={() => duplicateBlock(block.id)}
                    onDelete={() => setDeleteTarget(block.id)}
                    onContextMenu={(x, y) => { setSelectedId(block.id); openContextMenu({ x, y, blockId: block.id }); }}
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
              {selectedBlock && (
                <div className="sbld-inspector-tabs">
                  <button className={`sbld-rail-tab${rightTab === 'content' ? ' active' : ''}`} onClick={() => setRightTab('content')}>Content</button>
                  <button className={`sbld-rail-tab${rightTab === 'style' ? ' active' : ''}`} onClick={() => setRightTab('style')}>
                    <Palette size={12} /> Style
                  </button>
                </div>
              )}
            </div>
            <div className="sbld-inspector-body">
              {selectedBlock ? (
                rightTab === 'content' ? (
                  <BlockInspector block={selectedBlock} onChange={(data) => updateBlockData(selectedBlock.id, data)} ctx={inspectorCtx} />
                ) : (
                  <StylePanel
                    block={selectedBlock}
                    device={device}
                    onChange={(patch) => updateBlockStyle(selectedBlock.id, patch)}
                    onVisibilityChange={(v) => updateBlockVisibility(selectedBlock.id, v)}
                  />
                )
              ) : (
                <AiAssistPanel generating={aiGenerating} quotaRemaining={aiQuotaRemaining} onGenerate={generateWithAi} />
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

      {contextMenu && contextMenuBlock && (
        <BlockContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          hidden={contextMenuBlock.visibility?.desktop === false && contextMenuBlock.visibility?.tablet === false && contextMenuBlock.visibility?.mobile === false}
          locked={!!contextMenuBlock.locked}
          canPaste={!!clipboard}
          onDuplicate={() => duplicateBlock(contextMenu.blockId)}
          onCopy={() => copyBlock(contextMenu.blockId)}
          onPaste={() => pasteBlock(contextMenu.blockId)}
          onToggleVisibility={() => toggleBlockFullyHidden(contextMenu.blockId)}
          onToggleLock={() => toggleBlockLock(contextMenu.blockId)}
          onSaveAsSection={() => { setSaveSectionTarget(contextMenu.blockId); setSaveSectionName(BLOCK_LABELS[contextMenuBlock.type]); }}
          onDelete={() => setDeleteTarget(contextMenu.blockId)}
          onClose={closeContextMenu}
        />
      )}

      {showPreview && (
        <div className="sbld-preview-overlay">
          <button className="sbld-preview-close" onClick={() => setShowPreview(false)}><X size={18} /></button>
          <div className="sbld-preview-frame">
            <BlockRenderer layout={layout} {...renderCtx} editable={false} />
          </div>
        </div>
      )}

      {saveSectionTarget && (
        <div className="sbld-modal-overlay" onClick={() => setSaveSectionTarget(null)}>
          <div className="sbld-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Save as reusable section</h2>
            <p>Insert this block into any page or site from the Saved tab.</p>
            <input
              className="sbld-modal-input"
              autoFocus
              value={saveSectionName}
              onChange={(e) => setSaveSectionName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitSaveSection(); }}
            />
            <div className="sbld-modal-actions">
              <button onClick={() => setSaveSectionTarget(null)}>Cancel</button>
              <button className="primary" onClick={submitSaveSection} disabled={!saveSectionName.trim()}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showSeoModal && (
        <div className="sbld-modal-overlay" onClick={() => setShowSeoModal(false)}>
          <div className="sbld-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Page SEO</h2>
            <p>How this page — {activePage?.name} — appears in search results and link previews.</p>

            <div className="sbld-seo-score">
              <div className="sbld-seo-score-item">
                <div className={`n ${seoTitle.length >= 30 && seoTitle.length <= 60 ? 'good' : 'warn'}`}>{seoTitle.length}</div>
                <div className="l">Title chars (30-60)</div>
              </div>
              <div className="sbld-seo-score-item">
                <div className={`n ${seoDescription.length >= 70 && seoDescription.length <= 160 ? 'good' : 'warn'}`}>{seoDescription.length}</div>
                <div className="l">Description chars (70-160)</div>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: '#7E93AE', display: 'block', marginBottom: 6 }}>Page title</label>
              <input className="sbld-modal-input" style={{ marginBottom: 0 }} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={`${activePage?.name || ''} | ${store?.store_name || ''}`} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: '#7E93AE', display: 'block', marginBottom: 6 }}>Meta description</label>
              <textarea className="sbld-modal-input" style={{ marginBottom: 0, minHeight: 80, resize: 'vertical' }} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
            </div>

            <div className="sbld-modal-actions">
              <button onClick={() => setShowSeoModal(false)}>Close</button>
              <button className="primary" onClick={saveSeo} disabled={seoSaving}>{seoSaving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {showHistoryModal && (
        <div className="sbld-modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="sbld-modal sbld-theme-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Version history</h2>
            <p>Every publish is saved automatically. Restore any version into your draft, then republish when you're happy with it.</p>

            {versionsLoading ? (
              <div className="sbld-theme-loading"><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /></div>
            ) : (
              <div className="sbld-version-list">
                {versions.length === 0 && <p className="sbld-layers-empty">No versions yet — publish this page or save one manually.</p>}
                {versions.map((v) => (
                  <div key={v.id} className="sbld-version-row">
                    <div>
                      <div className="label">
                        {v.label}
                        {v.is_publish_snapshot && <span className="pub">Published</span>}
                      </div>
                      <div className="time">{new Date(v.created_at).toLocaleString()}</div>
                    </div>
                    <button onClick={() => restoreVersion(v.id)} disabled={restoringVersionId === v.id}>
                      {restoringVersionId === v.id ? 'Restoring…' : 'Restore'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="sbld-modal-actions">
              <button onClick={() => setShowHistoryModal(false)}>Close</button>
              <button className="primary" onClick={saveVersionSnapshot}>Save current as version</button>
            </div>
          </div>
        </div>
      )}

      {showInsightsModal && (
        <div className="sbld-modal-overlay" onClick={() => setShowInsightsModal(false)}>
          <div className="sbld-modal sbld-theme-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Insights</h2>
            <p>Page views across this site over the last 30 days.</p>

            {insightsLoading ? (
              <div className="sbld-theme-loading"><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /></div>
            ) : (
              <>
                <div className="sbld-insights-total">
                  <b>{insights?.total_views_30d ?? 0}</b>
                  <span>Total views, last 30 days</span>
                </div>
                <div className="sbld-insights-list">
                  {(insights?.pages || []).length === 0 && <p className="sbld-layers-empty">No views recorded yet.</p>}
                  {(insights?.pages || []).map((p) => {
                    const max = Math.max(1, ...(insights?.pages || []).map((x) => x.views_30d));
                    return (
                      <div key={p.id} className="sbld-insights-row">
                        <span className="name">{p.name}</span>
                        <div className="sbld-insights-bar-track"><div className="sbld-insights-bar-fill" style={{ width: `${(p.views_30d / max) * 100}%` }} /></div>
                        <span className="count">{p.views_30d}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div className="sbld-modal-actions">
              <button onClick={() => setShowInsightsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showWhatsappModal && (
        <div className="sbld-modal-overlay" onClick={() => setShowWhatsappModal(false)}>
          <div className="sbld-modal sbld-theme-modal" onClick={(e) => e.stopPropagation()}>
            <h2>WhatsApp lines</h2>
            <p>Route your WhatsApp CTA block to different numbers or departments — sales, support, a specific branch.</p>

            <div className="sbld-wa-lines">
              {whatsappLines.length === 0 && <p className="sbld-layers-empty">No extra lines yet — the WhatsApp CTA block uses your main store number until you add one.</p>}
              {whatsappLines.map((line) => (
                <div key={line.id} className="sbld-wa-line-row">
                  <div>
                    <b>{line.label}</b>
                    <span>{line.phone}{line.department ? ` · ${line.department}` : ''}</span>
                  </div>
                  <button onClick={() => deleteWhatsappLine(line.id)}><Trash2 size={13} /></button>
                </div>
              ))}
            </div>

            <div className="sbld-wa-add-form">
              <input className="sbld-modal-input" placeholder="Label, e.g. Sales" value={newLineLabel} onChange={(e) => setNewLineLabel(e.target.value)} style={{ marginBottom: 8 }} />
              <input className="sbld-modal-input" placeholder="Phone, e.g. 2348012345678" value={newLinePhone} onChange={(e) => setNewLinePhone(e.target.value)} style={{ marginBottom: 8 }} />
              <input className="sbld-modal-input" placeholder="Department (optional)" value={newLineDepartment} onChange={(e) => setNewLineDepartment(e.target.value)} />
            </div>

            <div className="sbld-modal-actions">
              <button onClick={() => setShowWhatsappModal(false)}>Close</button>
              <button className="primary" onClick={addWhatsappLine} disabled={addingLine || !newLineLabel.trim() || !newLinePhone.trim()}>
                {addingLine ? 'Adding…' : 'Add line'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showThemeModal && (
        <div className="sbld-modal-overlay" onClick={() => setShowThemeModal(false)}>
          <div className="sbld-modal sbld-theme-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Choose a theme</h2>
            <p>Switches your site's colors, fonts, buttons and cards instantly. You can still fine-tune anything per block afterwards.</p>
            {themesLoading ? (
              <div className="sbld-theme-loading"><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /></div>
            ) : (
              <div className="sbld-theme-grid">
                {themes.map((theme) => {
                  const active = site.theme?.appliedThemeKey === theme.key;
                  return (
                    <button
                      key={theme.id}
                      className={`sbld-theme-card${active ? ' active' : ''}`}
                      onClick={() => applyTheme(theme)}
                      disabled={applyingThemeKey === theme.key}
                    >
                      <div className="swatches">
                        {(theme.preview_colors || []).map((c, i) => <span key={i} style={{ background: c }} />)}
                      </div>
                      <div className="name">{theme.name}</div>
                      {active && <div className="badge"><Check size={11} /> Active</div>}
                      {applyingThemeKey === theme.key && <div className="badge">Applying…</div>}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="sbld-modal-actions">
              <button onClick={() => setShowThemeModal(false)}>Close</button>
            </div>
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

      <ConfirmDialog
        open={!!deletePageTarget}
        title="Delete this page?"
        description="This page and everything on it will be removed. This can't be undone."
        confirmLabel="Delete page"
        onConfirm={confirmDeletePage}
        onCancel={() => setDeletePageTarget(null)}
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

function CanvasBlock({ block, device, selected, onSelect, onDuplicate, onDelete, onContextMenu, renderCtx }: {
  block: SiteBlock; device: 'desktop' | 'tablet' | 'mobile'; selected: boolean; onSelect: () => void;
  onDuplicate: () => void; onDelete: () => void; onContextMenu: (x: number, y: number) => void; renderCtx: any;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id, disabled: block.locked });
  const hiddenOnThisDevice = isBlockHiddenOn(block, device);
  return (
    <div
      ref={setNodeRef}
      onClick={onSelect}
      onContextMenu={(e) => { e.preventDefault(); onContextMenu(e.clientX, e.clientY); }}
      className={`sbld-canvas-block${selected ? ' selected' : ''}${hiddenOnThisDevice ? ' sbld-hidden-here' : ''}`}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
    >
      {selected && (
        <div className="sbld-float-toolbar">
          <span className="ft-label">{BLOCK_LABELS[block.type]}</span>
          {block.locked && <Lock size={11} className="ft-badge" />}
          {hiddenOnThisDevice && <EyeOff size={11} className="ft-badge" />}
          <div className="ft-sep" />
          {!block.locked && <button className="ft-btn" {...attributes} {...listeners}><GripVertical size={13} /></button>}
          <button className="ft-btn" onClick={(e) => { e.stopPropagation(); onDuplicate(); }}><Copy size={13} /></button>
          <button className="ft-btn" onClick={(e) => { e.stopPropagation(); onSelect(); }}><Settings2 size={13} /></button>
          {!block.locked && <button className="ft-btn danger" onClick={(e) => { e.stopPropagation(); onDelete(); }}><Trash2 size={13} /></button>}
        </div>
      )}
      <div style={{ pointerEvents: 'none' }}>
        {renderBlock(block, renderCtx)}
      </div>
    </div>
  );
}

const SBLD_CSS = `
@keyframes sbld-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes sbld-modal-in { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes sbld-menu-in { from { opacity: 0; transform: translateY(-4px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes sbld-pop-in { from { opacity: 0; transform: translate(-50%, 4px) scale(0.92); } to { opacity: 1; transform: translate(-50%, 0) scale(1); } }
@keyframes sbld-pulse-glow { 0%, 100% { box-shadow: 0 0 0 2px #25D366, 0 0 0 6px rgba(37,211,102,0.14); } 50% { box-shadow: 0 0 0 2px #25D366, 0 0 0 9px rgba(37,211,102,0.05); } }

.sbld-shell { --s-bg: #080f1f; --s-bg-2: rgba(255,255,255,0.045); --s-bg-3: rgba(255,255,255,0.08); --s-border: rgba(255,255,255,0.09);
  --s-text: #F3F7FB; --s-text-dim: #8496B0; --s-glow: rgba(37,211,102,0.16);
  background:
    radial-gradient(1200px 480px at 14% -12%, rgba(37,211,102,0.10), transparent 60%),
    radial-gradient(900px 420px at 100% 0%, rgba(100,255,218,0.07), transparent 55%),
    linear-gradient(180deg, #0A1526 0%, #070d1a 55%, #060a15 100%);
  font-family: var(--font-sans, 'Inter'), -apple-system, sans-serif; -webkit-font-smoothing: antialiased;
  display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

.sbld-shell *::-webkit-scrollbar { width: 8px; height: 8px; }
.sbld-shell *::-webkit-scrollbar-track { background: transparent; }
.sbld-shell *::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 999px; border: 2px solid transparent; background-clip: padding-box; }
.sbld-shell *::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.22); background-clip: padding-box; }

.sbld-topbar { height: 60px; flex-shrink: 0; background: rgba(8,15,31,0.72); backdrop-filter: blur(20px) saturate(160%); -webkit-backdrop-filter: blur(20px) saturate(160%);
  border-bottom: 1px solid var(--s-border); display: flex; align-items: center; justify-content: space-between; padding: 0 18px; gap: 16px; position: relative; z-index: 40; }
.sbld-topbar-left { display: flex; align-items: center; gap: 14px; min-width: 0; }
.sbld-crumb { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.sbld-crumb .sbld-store { font-size: 11.5px; color: var(--s-text-dim); font-weight: 600; letter-spacing: 0.01em; }
.sbld-crumb .sbld-tool { font-family: var(--font-heading), sans-serif; font-size: 15px; font-weight: 700; letter-spacing: -0.01em; color: var(--s-text); display: flex; align-items: center; gap: 8px; }
.sbld-legend-badge { display: inline-flex; align-items: center; gap: 4px; background: linear-gradient(135deg, #FFC978, #F0A554 55%, #E07A2E); color: #2B1505; font-size: 9.5px; font-weight: 800; letter-spacing: 0.06em; padding: 3px 8px; border-radius: 999px; text-transform: uppercase; box-shadow: 0 2px 10px -2px rgba(240,165,84,0.55), inset 0 1px 0 rgba(255,255,255,0.35); }

.sbld-devices { display: flex; align-items: center; gap: 2px; background: rgba(255,255,255,0.04); border: 1px solid var(--s-border); border-radius: 11px; padding: 3px; }
.sbld-device-btn { width: 32px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--s-text-dim); background: none; border: none; cursor: pointer; transition: color 0.15s ease, background 0.15s ease, transform 0.15s ease; }
.sbld-device-btn:hover:not(.active) { color: var(--s-text); }
.sbld-device-btn.active { background: rgba(255,255,255,0.1); color: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.06); }
.sbld-device-btn:active { transform: scale(0.92); }

.sbld-topbar-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.sbld-save-indicator { font-size: 11px; color: var(--s-text-dim); min-width: 48px; display: inline-flex; align-items: center; gap: 5px; }
.sbld-icon-btn { width: 30px; height: 30px; border-radius: 9px; display: flex; align-items: center; justify-content: center; color: var(--s-text-dim); background: none; border: none; cursor: pointer; transition: background 0.15s ease, color 0.15s ease; }
.sbld-icon-btn:hover:not(:disabled) { background: rgba(255,255,255,0.07); color: var(--s-text); }
.sbld-icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.sbld-divider-v { width: 1px; height: 22px; background: var(--s-border); margin: 0 4px; }

.sbld-btn { font-family: inherit; font-size: 12.5px; font-weight: 600; padding: 8px 14px; border-radius: 9px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease, filter 0.15s ease; }
.sbld-btn:active { transform: translateY(1px); }
.sbld-btn.ghost { color: var(--s-text); background: rgba(255,255,255,0.05); border: 1px solid var(--s-border); }
.sbld-btn.ghost:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.16); }
.sbld-btn.primary { color: #06231D; background: linear-gradient(135deg, #37E37E, #17B87F); box-shadow: 0 1px 2px rgba(0,0,0,0.2), 0 6px 18px -6px rgba(37,211,102,0.65), inset 0 1px 0 rgba(255,255,255,0.3); }
.sbld-btn.primary:hover:not(:disabled) { filter: brightness(1.06); box-shadow: 0 1px 2px rgba(0,0,0,0.2), 0 8px 22px -6px rgba(37,211,102,0.8), inset 0 1px 0 rgba(255,255,255,0.35); }
.sbld-btn.primary:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }

.sbld-body { flex: 1; display: grid; grid-template-columns: 224px 1fr 308px; min-height: 0; }

.sbld-rail-left { background: rgba(255,255,255,0.015); border-right: 1px solid var(--s-border); display: flex; flex-direction: column; min-height: 0; }
.sbld-rail-tabs { display: flex; gap: 3px; padding: 14px 12px 0; flex-shrink: 0; }
.sbld-rail-tab { display: flex; align-items: center; gap: 5px; flex: 1; justify-content: center; padding: 7px 6px; border-radius: 8px; border: none; background: none; color: var(--s-text-dim); font-size: 11px; font-weight: 700; letter-spacing: 0.01em; cursor: pointer; transition: color 0.15s ease, background 0.15s ease; white-space: nowrap; }
.sbld-rail-tab:hover:not(.active) { color: var(--s-text); background: rgba(255,255,255,0.04); }
.sbld-rail-tab.active { color: #fff; background: rgba(255,255,255,0.09); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.07); }
.sbld-rail-scroll { padding: 14px 12px; overflow-y: auto; display: flex; flex-direction: column; gap: 18px; flex: 1; min-height: 0; animation: sbld-fade-in 0.2s ease; }
.sbld-block-group h4 { font-size: 10px; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; color: var(--s-text-dim); opacity: 0.75; margin: 0 0 7px 4px; }
.sbld-block-item { display: flex; align-items: center; gap: 9px; padding: 8px 9px; border-radius: 9px; color: var(--s-text); font-size: 12.5px; font-weight: 600; background: none; border: 1px solid transparent; cursor: grab; width: 100%; text-align: left; transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease; }
.sbld-block-item:hover { background: rgba(255,255,255,0.055); border-color: var(--s-border); transform: translateX(1px); }
.sbld-block-item:active { cursor: grabbing; }
.sbld-block-item .ic { color: var(--s-text-dim); flex-shrink: 0; transition: color 0.15s ease; }
.sbld-block-item:hover .ic { color: #64FFDA; }
.sbld-block-item .grip { margin-left: auto; color: var(--s-text-dim); opacity: 0.4; flex-shrink: 0; }

.sbld-pages-list, .sbld-saved-list, .sbld-layers-list { display: flex; flex-direction: column; gap: 2px; }
.sbld-page-row, .sbld-saved-row, .sbld-layer-row { display: flex; align-items: center; gap: 7px; padding: 8px 9px; border-radius: 9px; cursor: pointer; color: var(--s-text); border: 1px solid transparent; transition: background 0.15s ease, border-color 0.15s ease; }
.sbld-page-row:hover, .sbld-saved-row:hover, .sbld-layer-row:hover { background: rgba(255,255,255,0.05); }
.sbld-page-row.selected, .sbld-layer-row.selected { background: rgba(37,211,102,0.1); border-color: rgba(37,211,102,0.35); }
.sbld-page-row .ic { color: var(--s-text-dim); flex-shrink: 0; }
.sbld-page-row .ic-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--s-text-dim); flex-shrink: 0; margin: 0 4px; }
.sbld-page-name { font-size: 12.5px; font-weight: 600; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sbld-page-live { width: 15px; height: 15px; border-radius: 50%; background: rgba(37,211,102,0.18); color: #25D366; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.sbld-page-actions, .sbld-saved-actions, .sbld-layer-actions { display: flex; gap: 1px; flex-shrink: 0; opacity: 0; transform: translateX(2px); transition: opacity 0.15s ease, transform 0.15s ease; }
.sbld-page-row:hover .sbld-page-actions, .sbld-saved-row:hover .sbld-saved-actions, .sbld-layer-row:hover .sbld-layer-actions { opacity: 1; transform: translateX(0); }
.sbld-page-actions button, .sbld-saved-actions button, .sbld-layer-actions button { width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: var(--s-text-dim); background: none; border: none; cursor: pointer; transition: background 0.15s ease, color 0.15s ease; }
.sbld-page-actions button:hover:not(:disabled), .sbld-saved-actions button:hover, .sbld-layer-actions button:hover { background: rgba(255,255,255,0.1); color: var(--s-text); }
.sbld-page-actions button:disabled { opacity: 0.3; cursor: not-allowed; }
.sbld-page-actions button.danger:hover, .sbld-saved-actions button.danger:hover, .sbld-layer-actions button.danger:hover { color: #ff8080; background: rgba(255,90,90,0.12); }
.sbld-page-add-btn { display: flex; align-items: center; gap: 6px; background: none; border: 1px dashed var(--s-border); color: var(--s-text-dim); border-radius: 9px; padding: 9px; cursor: pointer; font-size: 12px; margin-top: 4px; transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease; }
.sbld-page-add-btn:hover { color: var(--s-text); border-color: rgba(37,211,102,0.5); background: rgba(37,211,102,0.06); }
.sbld-page-add-form { margin-top: 4px; }

.sbld-saved-info { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.sbld-saved-info .name { font-size: 12.5px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sbld-saved-info .type { font-size: 10.5px; color: var(--s-text-dim); }

.sbld-layers-empty { font-size: 12.5px; color: var(--s-text-dim); padding: 10px 6px; line-height: 1.6; }
.sbld-layer-row.hidden { opacity: 0.45; }
.sbld-layer-index { font-size: 10px; color: var(--s-text-dim); width: 14px; flex-shrink: 0; font-variant-numeric: tabular-nums; }
.sbld-layer-name { font-size: 12px; font-weight: 600; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.sbld-canvas-wrap { position: relative; display: flex; justify-content: center; padding: 32px; overflow-y: auto;
  background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 22px 22px; background-position: -11px -11px; }
.sbld-canvas-wrap::before { content: ''; position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(600px 300px at 50% 0%, rgba(37,211,102,0.05), transparent 70%); }
.sbld-canvas { position: relative; width: 100%; background: #fff; color: #0A192F; border-radius: 22px; overflow: hidden; height: fit-content; min-height: 200px;
  box-shadow: 0 0 0 1px rgba(255,255,255,0.06), 0 30px 60px -24px rgba(0,0,0,0.65), 0 12px 24px -12px rgba(0,0,0,0.45);
  transition: max-width 0.28s cubic-bezier(0.4,0,0.2,1); }
.sbld-empty-canvas { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 70px 20px; color: #94a3b8; border: 2px dashed #e2e8f0; margin: 20px; border-radius: 18px; text-align: center; font-size: 13px; transition: border-color 0.15s ease, background 0.15s ease; }

.sbld-canvas-block { position: relative; cursor: pointer; transition: box-shadow 0.15s ease; }
.sbld-canvas-block.selected { box-shadow: 0 0 0 2px #25D366, 0 0 22px -6px rgba(37,211,102,0.55); border-radius: 2px; }
.sbld-canvas-block:not(.selected):hover { box-shadow: 0 0 0 1px rgba(37,211,102,0.4); }
.sbld-canvas-block.sbld-hidden-here { opacity: 0.35; }
.sbld-float-toolbar { position: absolute; top: -18px; left: 50%; transform: translate(-50%, 0); display: flex; align-items: center; gap: 2px;
  background: rgba(10,20,40,0.85); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 4px; box-shadow: 0 12px 28px -10px rgba(0,0,0,0.6); z-index: 5;
  animation: sbld-pop-in 0.15s cubic-bezier(0.34,1.56,0.64,1); }
.sbld-float-toolbar .ft-label { font-size: 10px; font-weight: 700; color: #fff; padding: 0 8px 0 4px; white-space: nowrap; }
.sbld-float-toolbar .ft-badge { color: #F0A554; margin-right: 4px; }
.sbld-float-toolbar .ft-sep { width: 1px; height: 16px; background: rgba(255,255,255,0.12); margin: 0 2px; }
.sbld-float-toolbar .ft-btn { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #A9BBD4; background: none; border: none; cursor: pointer; transition: background 0.15s ease, color 0.15s ease; }
.sbld-float-toolbar .ft-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
.sbld-float-toolbar .ft-btn.danger:hover { color: #ff8080; background: rgba(255,90,90,0.16); }

.sbld-rail-right { background: rgba(255,255,255,0.015); border-left: 1px solid var(--s-border); display: flex; flex-direction: column; min-height: 0; }
.sbld-inspector-head { padding: 16px 16px 0; flex-shrink: 0; }
.sbld-inspector-head .title { font-family: var(--font-heading), sans-serif; font-size: 14.5px; font-weight: 700; letter-spacing: -0.01em; color: var(--s-text); }
.sbld-inspector-head .sub { font-size: 11px; color: var(--s-text-dim); margin-top: 2px; padding-bottom: 14px; }
.sbld-inspector-tabs { display: flex; gap: 3px; border-top: 1px solid var(--s-border); border-bottom: 1px solid var(--s-border); margin: 0 -16px; padding: 8px 16px 8px; }
.sbld-inspector-tabs .sbld-rail-tab { display: flex; align-items: center; gap: 5px; }
.sbld-inspector-body { padding: 16px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; animation: sbld-fade-in 0.2s ease; }
.sbld-ai-chip { display: flex; align-items: center; gap: 10px; padding: 14px; border-radius: 14px;
  background: linear-gradient(160deg, rgba(100,255,218,0.12), rgba(37,211,102,0.04)); border: 1px solid rgba(100,255,218,0.22); }
.sbld-ai-chip svg { color: #64FFDA; flex-shrink: 0; }
.sbld-ai-chip .t { font-size: 12.5px; font-weight: 700; color: var(--s-text); font-family: var(--font-heading), sans-serif; }
.sbld-ai-chip .d { font-size: 11.5px; color: var(--s-text-dim); margin-top: 3px; line-height: 1.5; }

.sbld-drag-ghost { background: rgba(10,20,40,0.92); backdrop-filter: blur(10px); border: 1px solid rgba(37,211,102,0.5); color: #fff; padding: 9px 16px; border-radius: 10px; font-size: 12.5px; font-weight: 700; box-shadow: 0 12px 28px -8px rgba(0,0,0,0.6); }

.sbld-ctx-menu, .sbld-more-menu { position: fixed; z-index: 4000; width: 194px; background: rgba(11,20,38,0.88); backdrop-filter: blur(18px) saturate(160%); -webkit-backdrop-filter: blur(18px) saturate(160%);
  border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 6px; box-shadow: 0 24px 48px -16px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04);
  display: flex; flex-direction: column; gap: 1px; animation: sbld-menu-in 0.14s cubic-bezier(0.34,1.56,0.64,1); }
.sbld-ctx-item, .sbld-more-menu button { display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: 8px; background: none; border: none; color: var(--s-text, #F3F7FB); font-size: 12.5px; font-weight: 600; cursor: pointer; text-align: left; transition: background 0.12s ease; }
.sbld-ctx-item:hover, .sbld-more-menu button:hover { background: rgba(255,255,255,0.08); }
.sbld-ctx-item.danger { color: #ff8080; }
.sbld-ctx-sep { height: 1px; background: rgba(255,255,255,0.08); margin: 4px 2px; }

.sbld-more-wrap { position: relative; }
.sbld-more-menu { position: absolute; top: calc(100% + 8px); right: 0; }

.sbld-seo-score { display: flex; gap: 10px; margin-bottom: 16px; }
.sbld-seo-score-item { flex: 1; padding: 12px; border-radius: 12px; background: rgba(255,255,255,0.045); border: 1px solid var(--s-border); text-align: center; }
.sbld-seo-score-item .n { font-size: 19px; font-weight: 800; font-family: var(--font-heading), sans-serif; }
.sbld-seo-score-item .n.good { color: #25D366; }
.sbld-seo-score-item .n.warn { color: #F0A554; }
.sbld-seo-score-item .l { font-size: 9.5px; color: var(--s-text-dim); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 3px; }

.sbld-version-list { display: flex; flex-direction: column; gap: 7px; margin-bottom: 16px; max-height: 320px; overflow-y: auto; }
.sbld-version-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 11px 12px; background: rgba(255,255,255,0.045); border: 1px solid var(--s-border); border-radius: 10px; transition: background 0.15s ease; }
.sbld-version-row:hover { background: rgba(255,255,255,0.07); }
.sbld-version-row .label { font-size: 12.5px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
.sbld-version-row .label .pub { font-size: 9.5px; font-weight: 800; text-transform: uppercase; color: #25D366; background: rgba(37,211,102,0.15); padding: 2px 6px; border-radius: 999px; }
.sbld-version-row .time { font-size: 10.5px; color: var(--s-text-dim); margin-top: 3px; }
.sbld-version-row button { flex-shrink: 0; font-size: 11.5px; font-weight: 700; color: #64FFDA; background: rgba(100,255,218,0.06); border: 1px solid rgba(100,255,218,0.3); border-radius: 8px; padding: 6px 11px; cursor: pointer; transition: background 0.15s ease; }
.sbld-version-row button:hover:not(:disabled) { background: rgba(100,255,218,0.14); }
.sbld-version-row button:disabled { opacity: 0.5; cursor: wait; }

.sbld-insights-total { text-align: center; padding: 18px; background: linear-gradient(160deg, rgba(37,211,102,0.1), rgba(255,255,255,0.03)); border: 1px solid rgba(37,211,102,0.2); border-radius: 14px; margin-bottom: 16px; }
.sbld-insights-total b { display: block; font-size: 30px; font-weight: 800; color: #25D366; font-family: var(--font-heading), sans-serif; }
.sbld-insights-total span { font-size: 11px; color: var(--s-text-dim); }
.sbld-insights-list { display: flex; flex-direction: column; gap: 7px; max-height: 260px; overflow-y: auto; margin-bottom: 8px; }
.sbld-insights-row { display: flex; align-items: center; gap: 10px; padding: 10px 11px; background: rgba(255,255,255,0.045); border: 1px solid var(--s-border); border-radius: 10px; }
.sbld-insights-row .name { flex: 1; font-size: 12.5px; font-weight: 600; }
.sbld-insights-bar-track { flex: 2; height: 6px; background: rgba(255,255,255,0.08); border-radius: 999px; overflow: hidden; }
.sbld-insights-bar-fill { height: 100%; background: linear-gradient(90deg, #25D366, #64FFDA); border-radius: 999px; transition: width 0.4s cubic-bezier(0.4,0,0.2,1); }
.sbld-insights-row .count { font-size: 12px; font-weight: 700; width: 34px; text-align: right; flex-shrink: 0; font-variant-numeric: tabular-nums; }

.sbld-preview-overlay { position: fixed; inset: 0; z-index: 3000; background: #f3f5f8; display: flex; flex-direction: column; animation: sbld-fade-in 0.2s ease; }
.sbld-preview-close { position: fixed; top: 18px; right: 18px; z-index: 3001; width: 38px; height: 38px; border-radius: 999px; background: #0A192F; color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px -6px rgba(0,0,0,0.5); transition: transform 0.15s ease; }
.sbld-preview-close:hover { transform: scale(1.06); }
.sbld-preview-frame { flex: 1; overflow-y: auto; }

.sbld-modal-overlay { position: fixed; inset: 0; z-index: 3000; background: rgba(4,8,16,0.6); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 24px; animation: sbld-fade-in 0.15s ease; }
.sbld-modal { width: min(100%, 420px); background: linear-gradient(165deg, #0d1a30, #0a1424); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 26px; color: var(--s-text, #F3F7FB);
  box-shadow: 0 40px 80px -24px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05); animation: sbld-modal-in 0.22s cubic-bezier(0.16,1,0.3,1); }
.sbld-modal h2 { margin: 0 0 6px; font-size: 18px; font-weight: 800; font-family: var(--font-heading), sans-serif; letter-spacing: -0.01em; }
.sbld-modal p { margin: 0 0 18px; font-size: 12.5px; color: var(--s-text-dim); line-height: 1.55; }
.sbld-modal-input { width: 100%; padding: 11px 13px; border-radius: 10px; border: 1px solid var(--s-border); background: rgba(255,255,255,0.045); color: var(--s-text); font-size: 13px; margin-bottom: 16px; font-family: inherit; transition: border-color 0.15s ease, background 0.15s ease; }
.sbld-modal-input:focus { outline: none; border-color: rgba(37,211,102,0.55); background: rgba(255,255,255,0.06); }
.sbld-domain-current { display: flex; align-items: center; gap: 8px; padding: 11px 12px; background: rgba(255,255,255,0.045); border: 1px solid var(--s-border); border-radius: 10px; font-size: 13px; margin-bottom: 16px; }
.sbld-domain-status { margin-left: auto; font-size: 10px; text-transform: uppercase; font-weight: 700; padding: 2px 8px; border-radius: 999px; background: rgba(255,255,255,0.08); color: var(--s-text-dim); }
.sbld-domain-status.active { background: rgba(37,211,102,0.18); color: #25D366; }
.sbld-modal-actions { display: flex; justify-content: flex-end; gap: 10px; }
.sbld-modal-actions button { padding: 10px 17px; border-radius: 10px; border: 1px solid var(--s-border); background: rgba(255,255,255,0.03); color: var(--s-text); cursor: pointer; font-size: 13px; font-weight: 600; transition: background 0.15s ease, transform 0.1s ease; }
.sbld-modal-actions button:hover:not(:disabled) { background: rgba(255,255,255,0.08); }
.sbld-modal-actions button:active { transform: translateY(1px); }
.sbld-modal-actions button.primary { background: linear-gradient(135deg, #37E37E, #17B87F); color: #06231D; font-weight: 700; border: none; box-shadow: 0 6px 18px -6px rgba(37,211,102,0.6); }
.sbld-modal-actions button.primary:hover:not(:disabled) { filter: brightness(1.06); }
.sbld-modal-actions button:disabled { opacity: 0.55; cursor: not-allowed; }

.sbld-theme-modal { width: min(100%, 560px); }
.sbld-theme-loading { display: flex; justify-content: center; padding: 30px; color: var(--s-text-dim); }
.sbld-theme-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; margin-bottom: 18px; max-height: 360px; overflow-y: auto; }
.sbld-theme-card { display: flex; flex-direction: column; gap: 9px; align-items: flex-start; padding: 13px; border-radius: 13px; border: 1px solid var(--s-border); background: rgba(255,255,255,0.04); cursor: pointer; text-align: left; position: relative; transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease; }
.sbld-theme-card:hover:not(:disabled) { border-color: rgba(37,211,102,0.55); background: rgba(255,255,255,0.06); transform: translateY(-1px); }
.sbld-theme-card.active { border-color: #25D366; box-shadow: 0 0 0 1px #25D366, 0 8px 20px -8px rgba(37,211,102,0.4); }
.sbld-theme-card:disabled { opacity: 0.7; cursor: wait; }
.sbld-theme-card .swatches { display: flex; gap: 5px; }
.sbld-theme-card .swatches span { width: 18px; height: 18px; border-radius: 50%; box-shadow: 0 0 0 1px rgba(255,255,255,0.18), 0 2px 6px rgba(0,0,0,0.3); }
.sbld-theme-card .name { font-size: 12.5px; font-weight: 700; color: var(--s-text); }
.sbld-theme-card .badge { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; color: #25D366; }

.sbld-wa-lines { display: flex; flex-direction: column; gap: 7px; margin-bottom: 14px; max-height: 180px; overflow-y: auto; }
.sbld-wa-line-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 11px; background: rgba(255,255,255,0.045); border: 1px solid var(--s-border); border-radius: 10px; }
.sbld-wa-line-row b { display: block; font-size: 12.5px; }
.sbld-wa-line-row span { font-size: 11px; color: var(--s-text-dim); }
.sbld-wa-line-row button { background: none; border: none; color: var(--s-text-dim); cursor: pointer; padding: 5px; border-radius: 6px; transition: background 0.15s ease, color 0.15s ease; }
.sbld-wa-line-row button:hover { color: #ff8080; background: rgba(255,90,90,0.12); }
.sbld-wa-add-form { border-top: 1px solid var(--s-border); padding-top: 14px; margin-bottom: 14px; }

${SB_CSS}
`;
