'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  MessageSquare, Sparkles, Zap, Link, BarChart3, Globe,
  Store, Star, ArrowRight, CheckCircle2, User, LogOut,
  Package, ShoppingBag, Settings, Share2, Copy, Plus,
  Trash2, Edit2, AlertCircle, Check, Loader2, Phone,
  DollarSign, Calendar, MapPin, Receipt, Menu, X, ArrowUpRight,
  TrendingUp, RefreshCw, Smartphone
} from 'lucide-react';

// --- Type Definitions ---
interface UserInfo {
  id: string;
  name: string;
  phone_number: string;
  email?: string | null;
}

interface StoreInfo {
  id: string;
  store_name: string;
  store_bio: string | null;
  currency_code: string;
  whatsapp_phone: string;
  username: string;
  logo_url?: string | null;
  instagram_handle?: string | null;
  tiktok_handle?: string | null;
  is_active?: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  price: number | string;
  compare_at_price?: number | string | null;
  stock_status: string;
  category_id?: string | null;
  category?: Category | null;
  description: string | null;
  image_urls?: string[];
  views_count?: number;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number | string;
  quantity: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_whatsapp?: string | null;
  delivery_method?: string | null;
  delivery_address?: string | null;
  total_amount: number | string;
  payment_status: string;
  order_status: string;
  created_at: string;
  items?: OrderItem[];
}

interface DashboardStats {
  revenue: number;
  counts: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  top_products: Array<{
    product_name: string;
    total_sold: number;
    orders_count: number;
  }>;
  metrics: {
    total_views: number;
    whatsapp_redirects: number;
    conversion_rate: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();

  // --- Auth & API Settings State ---
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [apiUrl, setApiUrl] = useState('http://localhost:8000/api');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // --- Dashboard Data State ---
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'whatsapp' | 'share' | 'settings'>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Loading states
  const [dataLoading, setDataLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mobile navigation overlay
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- Active Dialog/Modal States ---
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  // Quick discount campaign modal
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [discountPercent, setDiscountPercent] = useState('10');

  // --- Form Input States ---
  // Add/Edit Product Form
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodComparePrice, setProdComparePrice] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodStock, setProdStock] = useState('in_stock');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [productPublishing, setProductPublishing] = useState(false);

  // Settings Form
  const [setStoreName, setSetStoreName] = useState('');
  const [setStoreBio, setSetStoreBio] = useState('');
  const [setWhatsapp, setSetWhatsapp] = useState('');
  const [setInstagram, setSetInstagram] = useState('');
  const [setTiktok, setSetTiktok] = useState('');
  const [setCurrency, setSetCurrency] = useState('NGN');
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Developer Endpoint Form
  const [devApiInput, setDevApiInput] = useState('');

  // --- AI Command Bar State ---
  const [aiCommand, setAiCommand] = useState('');
  const [aiResponseBubble, setAiResponseBubble] = useState<string | null>(null);

  // --- WhatsApp Simulator Chat State ---
  const [waMessages, setWaMessages] = useState([
    { sender: 'buyer', text: 'Hi! I saw your Adire Dashiki Shirt. Is it still available?', time: '10:02 AM' },
    { sender: 'merchant', text: 'Yes, it is! We have it in stock. What size are you looking for?', time: '10:04 AM' },
    { sender: 'buyer', text: 'I need size L. Can you ship to Lagos? Also, how much is the total with shipping?', time: '10:05 AM' }
  ]);
  const [waAiSuggestion, setWaAiSuggestion] = useState('₦8,500. Standard shipping to Lagos is ₦2,500. Total: ₦11,000. Should I set it aside for you?');
  const [waCustomText, setWaCustomText] = useState('');
  const [waChatLabels, setWaChatLabels] = useState(['High intent buyer', 'Negotiation active']);
  const [waCloseSaleLoading, setWaCloseSaleLoading] = useState(false);

  // Sample stock images for products
  const STOCK_IMAGE_OPTIONS = [
    { name: 'Dashiki Shirt', url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=600' },
    { name: 'Leather Shoes', url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=600' },
    { name: 'Royal Bracelet', url: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=600' },
    { name: 'Fashion Dress', url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600' },
    { name: 'Ankara Bag', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600' }
  ];

  // --- Auth verification & Initial load ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedStore = localStorage.getItem('store');
      const savedApiUrl = localStorage.getItem('dev_api_url') || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

      setApiUrl(savedApiUrl);
      setDevApiInput(savedApiUrl);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        if (storedStore && storedStore !== 'undefined') {
          const parsedStore = JSON.parse(storedStore);
          setStore(parsedStore);
          // Prefill settings form
          setSetStoreName(parsedStore.store_name || '');
          setSetStoreBio(parsedStore.store_bio || '');
          setSetWhatsapp(parsedStore.whatsapp_phone || '');
          setSetInstagram(parsedStore.instagram_handle || '');
          setSetTiktok(parsedStore.tiktok_handle || '');
          setSetCurrency(parsedStore.currency_code || 'NGN');
        }
        setIsAuthenticated(true);
      } else {
        router.push('/login');
      }
      setIsAuthChecking(false);
    }
  }, [router]);

  // Headers helper
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  // Fetch metrics, orders, products
  const loadAllData = async (silent = false) => {
    if (!token) return;
    try {
      if (!silent) setDataLoading(true);
      else setIsRefreshing(true);

      const [statsRes, productsRes, ordersRes, categoriesRes] = await Promise.all([
        fetch(`${apiUrl}/v1/orders/stats`, { headers: getAuthHeaders() }),
        fetch(`${apiUrl}/v1/products`, { headers: getAuthHeaders() }),
        fetch(`${apiUrl}/v1/orders`, { headers: getAuthHeaders() }),
        fetch(`${apiUrl}/v1/categories`, { headers: getAuthHeaders() })
      ]);

      const statsJson = await statsRes.json();
      const productsJson = await productsRes.json();
      const ordersJson = await ordersRes.json();
      const categoriesJson = await categoriesRes.json();

      if (statsRes.ok) setStats(statsJson.data);
      if (productsRes.ok) setProducts(productsJson.data?.data || productsJson.data || []);
      if (ordersRes.ok) setOrders(ordersJson.data?.data || ordersJson.data || []);
      if (categoriesRes.ok) setCategories(categoriesJson.data || []);

    } catch (e) {
      console.error(e);
      toast.error('Failed to load live data. Please check your backend connection.');
    } finally {
      setDataLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated, apiUrl]);

  // --- AI Command Bar Submit handler ---
  const handleAiCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiCommand.trim()) return;

    const text = aiCommand.toLowerCase().trim();
    setAiCommand('');

    if (text.includes('add') || text.includes('product') || text.includes('sell') || text.includes('list') || text.includes('create product')) {
      setAiResponseBubble(`✨ AI Assistant: Opening product creation forms for you...`);
      setTimeout(() => {
        setAiResponseBubble(null);
        openAddProductModal();
      }, 1200);
    } else if (text.includes('discount') || text.includes('coupon') || text.includes('promo')) {
      setAiResponseBubble(`✨ AI Assistant: Launching discount campaign helper...`);
      setTimeout(() => {
        setAiResponseBubble(null);
        setIsDiscountModalOpen(true);
      }, 1000);
    } else if (text.includes('order') || text.includes('sale') || text.includes('shipping')) {
      setAiResponseBubble(`✨ AI Assistant: Redirecting to Orders section...`);
      setTimeout(() => {
        setAiResponseBubble(null);
        setActiveTab('orders');
      }, 1000);
    } else if (text.includes('chat') || text.includes('whatsapp') || text.includes('simulator') || text.includes('message')) {
      setAiResponseBubble(`✨ AI Assistant: Opening simulated WhatsApp Chat panel...`);
      setTimeout(() => {
        setAiResponseBubble(null);
        setActiveTab('whatsapp');
      }, 1000);
    } else if (text.includes('setting') || text.includes('bio') || text.includes('phone')) {
      setAiResponseBubble(`✨ AI Assistant: Navigating to settings...`);
      setTimeout(() => {
        setAiResponseBubble(null);
        setActiveTab('settings');
      }, 1000);
    } else {
      setAiResponseBubble(`💡 AI Coach: I can help you add products, launch discounts, inspect orders, or update settings. Try typing "Add product" or "view orders".`);
      setTimeout(() => setAiResponseBubble(null), 5500);
    }
  };

  // Quick 10% discount handler
  const handleApplyQuickDiscount = () => {
    setIsDiscountModalOpen(false);
    toast.success(`Discount of ${discountPercent}% applied! 🏷️`);
    
    // Simulate updating conversion stats
    if (stats) {
      setStats({
        ...stats,
        metrics: {
          ...stats.metrics,
          conversion_rate: parseFloat((stats.metrics.conversion_rate * 1.2).toFixed(1))
        }
      });
    }
  };

  // --- Add / Edit Product CRUD Handlers ---
  const openAddProductModal = () => {
    setProdName('');
    setProdPrice('');
    setProdComparePrice('');
    setProdCategory(categories[0]?.id || '');
    setProdDesc('');
    setProdStock('in_stock');
    setProdImageUrl(STOCK_IMAGE_OPTIONS[0].url);
    setIsAddProductOpen(true);
  };

  const handleGenerateAIDescription = async () => {
    if (!prodName.trim()) {
      toast.warning('Enter a product name first to generate details!');
      return;
    }

    try {
      setAiGenerating(true);
      const activeCat = categories.find(c => c.id === prodCategory);
      
      const res = await fetch(`${apiUrl}/v1/ai/generate-description`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          product_name: prodName,
          category_hint: activeCat ? activeCat.name : 'General'
        })
      });

      const json = await res.json();
      if (res.ok && json.data?.description) {
        setProdDesc(json.data.description);
        toast.success('Description written by Gemini AI! 🧠✨');
      } else {
        throw new Error(json.message || 'Description generation failed.');
      }
    } catch (e: any) {
      console.error(e);
      // Fallback description in case of server failure
      const fallback = `✨ Premium quality ${prodName}.\n\n🔥 Handcrafted design, breathable materials, perfect for all occasions.\n🇳🇬 Handcrafted local inventory. Available now!`;
      setProdDesc(fallback);
      toast.info('Loaded visual fallback description outline.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice) {
      toast.error('Product name and price are required.');
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
        stock_status: prodStock,
        is_draft: false,
        image_url: prodImageUrl || undefined
      };

      const res = await fetch(`${apiUrl}/v1/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (res.ok) {
        toast.success('Product published to storefront! 🚀');
        setIsAddProductOpen(false);
        loadAllData(true);
      } else {
        throw new Error(json.message || 'Failed to publish product');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error occurred publishing product.');
    } finally {
      setProductPublishing(false);
    }
  };

  const handleEditProductClick = (product: Product) => {
    setSelectedProduct(product);
    setProdName(product.name);
    setProdPrice(product.price.toString());
    setProdComparePrice(product.compare_at_price?.toString() || '');
    setProdCategory(product.category_id || categories[0]?.id || '');
    setProdDesc(product.description || '');
    setProdStock(product.stock_status);
    setProdImageUrl(product.image_urls?.[0] || STOCK_IMAGE_OPTIONS[0].url);
    setIsEditProductOpen(true);
  };

  const handleUpdateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      setProductPublishing(true);
      const payload = {
        name: prodName,
        price: parseFloat(prodPrice),
        compare_at_price: prodComparePrice ? parseFloat(prodComparePrice) : null,
        category_id: prodCategory || null,
        description: prodDesc || null,
        stock_status: prodStock,
        image_url: prodImageUrl || undefined
      };

      const res = await fetch(`${apiUrl}/v1/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success('Product updated successfully! 📝');
        setIsEditProductOpen(false);
        loadAllData(true);
      } else {
        const json = await res.json();
        throw new Error(json.message || 'Failed to update product');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error occurred saving product changes.');
    } finally {
      setProductPublishing(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action is permanent.')) return;
    try {
      const res = await fetch(`${apiUrl}/v1/products/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        toast.success('Product removed from store.');
        loadAllData(true);
      } else {
        throw new Error('Deletion failed.');
      }
    } catch {
      toast.error('Could not delete product.');
    }
  };

  // --- Order Management Status Updates ---
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`${apiUrl}/v1/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ order_status: status })
      });
      if (res.ok) {
        toast.success(`Order status updated to ${status.toUpperCase()}!`);
        // If details modal is open, update selected order
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, order_status: status });
        }
        loadAllData(true);
      } else {
        throw new Error('Failed to update status.');
      }
    } catch {
      toast.error('Could not update order status.');
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`${apiUrl}/v1/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ payment_status: status })
      });
      if (res.ok) {
        toast.success(`Payment status updated to ${status.toUpperCase()}!`);
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, payment_status: status });
        }
        loadAllData(true);
      } else {
        throw new Error('Failed to update status.');
      }
    } catch {
      toast.error('Could not update payment status.');
    }
  };

  // --- WhatsApp Simulator Chat logic ---
  const handleSendWaMessage = (text: string) => {
    if (!text.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setWaMessages(prev => [...prev, { sender: 'merchant', text, time }]);
    setWaCustomText('');
    setWaAiSuggestion('');

    // Simulate buyer reply
    setTimeout(() => {
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setWaMessages(prev => [...prev, {
        sender: 'buyer',
        text: 'Awesome! That works for me. Please reserve it and let me know how to pay.',
        time: replyTime
      }]);
      setWaAiSuggestion('Sure! We accept payment via bank transfer or card. Shall I generate your invoice receipt?');
      setWaChatLabels(['High intent buyer', 'Invoice requested']);
    }, 1800);
  };

  const handleWaOfferCoupon = () => {
    const offerText = 'I can give you an exclusive 10% discount on the sandals. The total price will be ₦7,650 + ₦2,500 shipping (₦10,150). Let me know if I should finalize!';
    handleSendWaMessage(offerText);
  };

  const handleWaCloseSale = async () => {
    try {
      setWaCloseSaleLoading(true);
      const nextOrderNo = 'ALO-INV' + Math.floor(Math.random() * 89000 + 10000);
      
      const payload = {
        customer_name: 'Chioma Obi',
        customer_phone: '+2348099887766',
        customer_whatsapp: '+2348099887766',
        delivery_method: 'delivery',
        delivery_address: 'No 15 Adeniran Ogunsanya St, Surulere, Lagos',
        total_amount: 11000.00,
        payment_status: 'unpaid',
        order_status: 'pending'
      };

      // We hit the public storefront route to create order or mock it
      const res = await fetch(`${apiUrl}/v1/public/store/${store?.username}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (res.ok) {
        toast.success(`Invoice created! Real Order #${json.data?.order_number || nextOrderNo} added.`);
        
        // Post update message inside chat log
        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setWaMessages(prev => [
          ...prev,
          { 
            sender: 'merchant', 
            text: `🧾 Invoice Created! Order #${json.data?.order_number || nextOrderNo} total ₦11,000. Ready for delivery to Surulere, Lagos.`,
            time: timeNow
          }
        ]);
        
        loadAllData(true);
      } else {
        throw new Error(json.message || 'Server failed to save order.');
      }
    } catch (e: any) {
      toast.error(e.message || 'Invoice generation error.');
    } finally {
      setWaCloseSaleLoading(false);
    }
  };

  const handleWaConfirmPayment = () => {
    // Look up the last pending invoice order for Chioma Obi and update it
    const lastObiOrder = orders.find(o => o.customer_name === 'Chioma Obi' && o.payment_status === 'unpaid');
    if (lastObiOrder) {
      handleUpdatePaymentStatus(lastObiOrder.id, 'paid');
      handleUpdateOrderStatus(lastObiOrder.id, 'confirmed');
    }
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setWaMessages(prev => [
      ...prev,
      { sender: 'merchant', text: `💚 Payment confirmed! Thank you so much Chioma. Processing your dispatch details now!`, time: timeNow }
    ]);
    toast.success('Simulated buyer marked as Paid.');
  };

  // --- Settings Update Handler ---
  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSettingsSaving(true);
      const res = await fetch(`${apiUrl}/v1/store`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          store_name: setStoreName,
          store_bio: setStoreBio,
          whatsapp_phone: setWhatsapp,
          instagram_handle: setInstagram,
          tiktok_handle: setTiktok,
          currency_code: setCurrency
        })
      });

      const json = await res.json();
      if (res.ok && json.data) {
        toast.success('Storefront settings updated! 🌟');
        setStore(json.data);
        localStorage.setItem('store', JSON.stringify(json.data));
      } else {
        throw new Error(json.message || 'Store settings update failed.');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error occurred saving settings.');
    } finally {
      setSettingsSaving(false);
    }
  };

  // --- Dev API endpoints config handler ---
  const handleSaveDevApi = () => {
    if (!devApiInput.trim()) return;
    localStorage.setItem('dev_api_url', devApiInput.trim());
    setApiUrl(devApiInput.trim());
    toast.success('Dev API Host Address updated!');
    loadAllData();
  };

  // --- Receipt view compiler ---
  const generateReceiptText = (order: Order) => {
    const divider = '===================================';
    const storeHeader = `🏪 STORE: ${store?.store_name || 'aloaye merchant'}\nURL: ${store?.username}.aloaye.com\n`;
    const orderHeader = `ORDER NO: ${order.order_number}\nDATE: ${new Date(order.created_at).toLocaleDateString()}\n`;
    const customer = `CUSTOMER: ${order.customer_name}\nPHONE: ${order.customer_phone}\nADDRESS: ${order.delivery_address || 'N/A'}\n`;
    
    // items summary list
    let itemSummary = '';
    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        const itemTotal = parseFloat(item.product_price as string) * item.quantity;
        itemSummary += `- ${item.quantity}x ${item.product_name} (@ ₦${parseFloat(item.product_price as string).toLocaleString()}) - ₦${itemTotal.toLocaleString()}\n`;
      });
    } else {
      itemSummary += `- 1x Digital Cart Purchase - ₦${parseFloat(order.total_amount as string).toLocaleString()}\n`;
    }

    const total = `\nTOTAL PAID: ₦${parseFloat(order.total_amount as string).toLocaleString()}\nSTATUS: PAID & CONFIRMED\n`;
    const footer = `\nThank you for shopping with us!\nPowered by aloaye.com\n`;

    return `${divider}\n${storeHeader}${divider}\n${orderHeader}${customer}${divider}\nITEMS:\n${itemSummary}${divider}${total}${divider}${footer}${divider}`;
  };

  const copyReceiptToClipboard = (order: Order) => {
    const text = generateReceiptText(order);
    navigator.clipboard.writeText(text);
    toast.success('Receipt copied to clipboard! 🧾📋');
  };

  // --- Logout helper ---
  const handleLogout = () => {
    fetch(`${apiUrl}/v1/auth/logout`, { method: 'POST', headers: getAuthHeaders() }).catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('store');
    setIsAuthenticated(false);
    toast.info('Merchant session ended.');
    router.push('/login');
  };

  if (isAuthChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', gap: 16 }}>
        <Loader2 size={36} className="spinner" style={{ color: 'var(--primary)' }} />
        <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>Verifying credentials...</span>
      </div>
    );
  }

  // Formatting currency
  const formatVal = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? '—' : num.toLocaleString();
  };

  const liveStoreUrl = store ? `${window.location.protocol}//${store.username}.${window.location.host.replace(/^www\./, '')}` : '';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>
      
      {/* ── SIDEBAR NAVIGATION (Desktop) ── */}
      <aside className="glass" style={{
        width: 260,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 40,
        padding: '24px 16px',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, paddingLeft: 8 }}>
          <div style={{ background: 'var(--primary)', color: '#fff', width: 36, height: 36, borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-primary)' }}>
            <Store size={20} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>aloaye</h1>
            <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Store OS v2.0</span>
          </div>
        </div>

        {/* Store Context Badge */}
        {store && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-2)', padding: '10px 12px', borderRadius: 'var(--r-lg)', marginBottom: 24, border: '1px solid var(--border)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, fontFamily: 'var(--font-heading)' }}>
              {store.store_name.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{store.store_name}</p>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>@{store.username}</span>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          {[
            { id: 'overview', label: 'Overview', icon: <BarChart3 size={18} /> },
            { id: 'orders', label: 'Orders Manager', icon: <ShoppingBag size={18} />, badge: orders.filter(o => o.order_status === 'pending').length },
            { id: 'products', label: 'Products CRUD', icon: <Package size={18} /> },
            { id: 'whatsapp', label: 'WhatsApp Simulator', icon: <MessageSquare size={18} />, badge: 1 },
            { id: 'share', label: 'Share & Referrals', icon: <Share2 size={18} /> },
            { id: 'settings', label: 'Settings & Dev', icon: <Settings size={18} /> },
          ].map(item => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className="clickable"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--r-md)',
                  border: 'none',
                  background: active ? 'var(--primary-light)' : 'transparent',
                  color: active ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: 14.5,
                  fontWeight: active ? 750 : 600,
                  textAlign: 'left',
                }}
              >
                {item.icon}
                <span style={{ flex: 1 }}>{item.label}</span>
                {!!item.badge && (
                  <span style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: '#fff',
                    background: item.id === 'whatsapp' ? 'var(--primary)' : 'var(--danger)',
                    padding: '2px 7px',
                    borderRadius: 'var(--r-full)'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <button
            onClick={handleLogout}
            className="btn btn-ghost clickable"
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-start', padding: '10px 14px', borderRadius: 'var(--r-md)', color: 'var(--danger)' }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MOBILE HEADER (Mobile size navigation bar) ── */}
      <div style={{ display: 'none' }} className="mobile-header-styles">
        {/* Handled by media queries at the bottom */}
      </div>

      {/* ── MAIN CONTENT WORKSPACE ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        
        {/* Desktop Topbar */}
        <header className="glass" style={{
          position: 'sticky', top: 0, zIndex: 30,
          padding: '16px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid var(--border)',
        }}>
          {/* Mobile menu trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="mobile-burger-btn"
            style={{ background: 'none', border: 'none', color: 'var(--text)', display: 'none', padding: 4 }}
          >
            <Menu size={24} />
          </button>

          {/* AI Command Input Bar */}
          <form onSubmit={handleAiCommandSubmit} style={{ display: 'flex', flex: 1, maxWidth: 460, position: 'relative', margin: '0 16px' }}>
            <input
              type="text"
              placeholder="⚡ Type command: 'Add product', 'insights', 'discount'..."
              value={aiCommand}
              onChange={e => setAiCommand(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                fontSize: 13.5,
                background: 'var(--bg-2)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--r-lg)',
                outline: 'none',
                color: 'var(--text)'
              }}
            />
            <Sparkles size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
            
            {aiResponseBubble && (
              <div className="card glass animate-scale-in" style={{ position: 'absolute', top: '115%', left: 0, right: 0, padding: 12, fontSize: 13, fontWeight: 600, border: '1px solid var(--primary)', zIndex: 50, color: 'var(--text)' }}>
                {aiResponseBubble}
              </div>
            )}
          </form>

          {/* Right Action Widgets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => loadAllData(true)}
              disabled={isRefreshing}
              className="btn btn-outline clickable"
              style={{ padding: '8px 12px', fontSize: 12, borderRadius: 'var(--r-md)' }}
              title="Refresh Stats"
            >
              <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
              <span className="desktop-only-text">Sync Live</span>
            </button>
            <a
              href={liveStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary clickable"
              style={{ padding: '8px 16px', fontSize: 12.5, borderRadius: 'var(--r-md)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <span>Visit Shop</span>
              <ArrowUpRight size={14} />
            </a>
          </div>
        </header>

        {/* Content Pane Wrapper */}
        <div style={{ padding: 'clamp(16px, 4vw, 32px)', flex: 1, display: 'flex', flexDirection: 'column' }}>

          {dataLoading ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <div className="spinner spinner-primary" style={{ width: 32, height: 32 }} />
              <span style={{ color: 'var(--text-muted)', fontSize: 14.5 }}>Fetching shop datasets...</span>
            </div>
          ) : (
            <>
              {/* ── TAB 1: OVERVIEW & ANALYTICS ── */}
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }} className="animate-fade-in">
                  
                  {/* Top Stats Row */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 16
                  }}>
                    <div className="card hover-lift" style={{ padding: 20 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Revenue</span>
                      <p style={{ fontSize: 26, fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)', marginTop: 8 }}>
                        ₦{stats ? formatVal(stats.revenue) : '0'}
                      </p>
                      <span style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6, display: 'block' }}>Excludes cancelled orders</span>
                    </div>

                    <div className="card hover-lift" style={{ padding: 20 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Orders</span>
                      <p style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-heading)', marginTop: 8 }}>
                        {stats ? stats.counts.total : orders.length}
                      </p>
                      <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: 11 }}>
                        <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{stats?.counts.pending ?? 0} pending</span>
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{stats?.counts.completed ?? 0} shipped</span>
                      </div>
                    </div>

                    <div className="card hover-lift" style={{ padding: 20 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Storefront Views</span>
                      <p style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-heading)', marginTop: 8 }}>
                        {stats?.metrics.total_views ?? '—'}
                      </p>
                      <span style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6, display: 'block' }}>Total catalog product clicks</span>
                    </div>

                    <div className="card hover-lift" style={{ padding: 20 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>WhatsApp Redirects</span>
                      <p style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-heading)', marginTop: 8 }}>
                        {stats?.metrics.whatsapp_redirects ?? '—'}
                      </p>
                      <span style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6, display: 'block' }}>Redirects to initiate checkout</span>
                    </div>

                    <div className="card hover-lift" style={{ padding: 20, background: 'linear-gradient(135deg, var(--surface), rgba(16, 185, 129, 0.03))' }}>
                      <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Conversion Rate</span>
                      <p style={{ fontSize: 26, fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)', marginTop: 8 }}>
                        {stats?.metrics.conversion_rate ?? '0'}%
                      </p>
                      <span style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6, display: 'block' }}>WhatsApp clicks vs page views</span>
                    </div>
                  </div>

                  {/* Visual charts block */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, alignItems: 'start' }} className="responsive-chart-grid">
                    
                    {/* SVG Analytics Graph */}
                    <div className="card" style={{ padding: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800 }}>Weekly Traffic & Redirects</h3>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Last 7 Days</span>
                      </div>
                      
                      {/* Bar columns */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 160, padding: '0 10px', borderBottom: '1px solid var(--border)' }}>
                        {[
                          { day: 'Mon', views: 30, wa: 10 },
                          { day: 'Tue', views: 45, wa: 15 },
                          { day: 'Wed', views: 75, wa: 22 },
                          { day: 'Thu', views: 50, wa: 18 },
                          { day: 'Fri', views: 90, wa: 30 },
                          { day: 'Sat', views: 120, wa: 42 },
                          { day: 'Sun', views: 80, wa: 25 }
                        ].map((item, idx) => {
                          const maxVal = 130;
                          const viewsHeight = `${(item.views / maxVal) * 100}%`;
                          const waHeight = `${(item.wa / maxVal) * 100}%`;
                          
                          return (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                              <div style={{ display: 'flex', gap: 4, width: '70%', height: '100%', alignItems: 'flex-end', justifyContent: 'center' }}>
                                {/* Views bar */}
                                <div style={{ height: viewsHeight, width: 8, background: 'var(--primary)', opacity: 0.35, borderRadius: '4px 4px 0 0' }} title={`Views: ${item.views}`} />
                                {/* WhatsApp clicks bar */}
                                <div style={{ height: waHeight, width: 8, background: 'var(--primary)', borderRadius: '4px 4px 0 0' }} title={`WhatsApp Clicks: ${item.wa}`} />
                              </div>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginTop: 4 }}>{item.day}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ display: 'flex', gap: 20, marginTop: 16, justifyContent: 'center', fontSize: 12 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                          <span style={{ width: 10, height: 10, background: 'var(--primary)', opacity: 0.35, borderRadius: '50%' }} /> Catalog Views
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                          <span style={{ width: 10, height: 10, background: 'var(--primary)', borderRadius: '50%' }} /> WhatsApp checkouts
                        </span>
                      </div>
                    </div>

                    {/* AI Coach Business Card */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div className="card" style={{
                        padding: 24,
                        border: '1.5px solid var(--primary)',
                        background: 'linear-gradient(135deg, var(--surface), rgba(16, 185, 129, 0.05))',
                        boxShadow: 'var(--shadow-primary)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                          <div style={{ background: 'var(--primary-light)', padding: 8, borderRadius: 'var(--r-md)', color: 'var(--primary)' }}>
                            <Sparkles size={20} />
                          </div>
                          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900 }}>AI Business Coach</h3>
                        </div>

                        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 20 }}>
                          {stats && stats.metrics.total_views > 0
                            ? `Your storefront has recorded ${stats.metrics.total_views} visits with a ${stats.metrics.conversion_rate}% conversion rate. ${
                                stats.metrics.conversion_rate < 15
                                  ? 'Your conversion rate is slightly below the target of 15%. I recommend launching a quick flash discount campaign to encourage checkouts.'
                                  : 'Fantastic! Your store conversion is highly optimized. List additional products to grow your revenue further.'
                              }`
                            : 'Welcome back! List some items and share your store link. I will populate automated marketing suggestions here once visitors arrive.'}
                        </p>

                        <button
                          onClick={() => setIsDiscountModalOpen(true)}
                          className="btn btn-primary clickable"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--r-lg)', display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}
                        >
                          <Zap size={14} /> Launch Discount Campaign
                        </button>
                      </div>

                      {/* Top Selling Products List */}
                      <div className="card" style={{ padding: 20 }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, marginBottom: 14 }}>Top Products</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {stats?.top_products && stats.top_products.length > 0 ? (
                            stats.top_products.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: idx < stats.top_products.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                <div>
                                  <p style={{ fontSize: 13.5, fontWeight: 800 }}>{item.product_name}</p>
                                  <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{item.orders_count} orders filled</span>
                                </div>
                                <span className="badge badge-primary" style={{ padding: '4px 10px', fontSize: 11 }}>
                                  {item.total_sold} sold
                                </span>
                              </div>
                            ))
                          ) : (
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>No top items recorded yet.</p>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ── TAB 2: ORDERS MANAGER ── */}
              {activeTab === 'orders' && (
                <div className="card animate-fade-in" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 20 }} className="responsive-order-heading">
                    <div>
                      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>Customer Orders</h2>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Confirm, ship, and generate receipts for custom purchases.</p>
                    </div>
                  </div>

                  {/* Orders Table List */}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '12px 8px' }}>Order No</th>
                          <th style={{ padding: '12px 8px' }}>Customer</th>
                          <th style={{ padding: '12px 8px' }}>Date</th>
                          <th style={{ padding: '12px 8px' }}>Amount</th>
                          <th style={{ padding: '12px 8px' }}>Payment</th>
                          <th style={{ padding: '12px 8px' }}>Order Status</th>
                          <th style={{ padding: '12px 8px', textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.length > 0 ? (
                          orders.map(order => (
                            <tr
                              key={order.id}
                              style={{ borderBottom: '1px solid var(--border)', fontSize: 14 }}
                              className="table-row-hover"
                            >
                              <td style={{ padding: '16px 8px', fontWeight: 800, color: 'var(--primary)' }}>
                                {order.order_number}
                              </td>
                              <td style={{ padding: '16px 8px' }}>
                                <p style={{ fontWeight: 700 }}>{order.customer_name}</p>
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.customer_phone}</span>
                              </td>
                              <td style={{ padding: '16px 8px', color: 'var(--text-muted)', fontSize: 13 }}>
                                {new Date(order.created_at).toLocaleDateString()}
                              </td>
                              <td style={{ padding: '16px 8px', fontWeight: 800 }}>
                                ₦{formatVal(order.total_amount)}
                              </td>
                              <td style={{ padding: '16px 8px' }}>
                                <span className={`badge ${
                                  order.payment_status === 'paid' ? 'badge-primary' : 
                                  order.payment_status === 'refunded' ? 'badge-danger' : 'badge-accent'
                                }`} style={{ fontSize: 10 }}>
                                  {order.payment_status}
                                </span>
                              </td>
                              <td style={{ padding: '16px 8px' }}>
                                <span className={`badge ${
                                  order.order_status === 'completed' ? 'badge-primary' : 
                                  order.order_status === 'cancelled' ? 'badge-danger' : 
                                  order.order_status === 'confirmed' ? 'badge-verified' : 'badge-accent'
                                }`} style={{ fontSize: 10 }}>
                                  {order.order_status}
                                </span>
                              </td>
                              <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                  <button
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setIsOrderDetailsOpen(true);
                                    }}
                                    className="btn btn-outline clickable"
                                    style={{ padding: '6px 10px', fontSize: 11.5, borderRadius: 'var(--r-sm)' }}
                                  >
                                    Inspect
                                  </button>
                                  <button
                                    onClick={() => {
                                      setReceiptOrder(order);
                                      setIsReceiptOpen(true);
                                    }}
                                    className="btn btn-ghost clickable"
                                    style={{ padding: '6px 10px', borderRadius: 'var(--r-sm)', color: 'var(--primary)' }}
                                    title="Receipt"
                                  >
                                    <Receipt size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} style={{ padding: '40px 0', color: 'var(--text-muted)', textAlign: 'center' }}>
                              No orders found. Set up your WhatsApp Simulator to test order creations!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── TAB 3: PRODUCTS CRUD ── */}
              {activeTab === 'products' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="responsive-product-header">
                    <div>
                      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>Product Catalog</h2>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Create items, update pricing, and generate descriptions using Gemini AI.</p>
                    </div>
                    <button
                      onClick={openAddProductModal}
                      className="btn btn-primary clickable"
                      style={{ padding: '10px 18px', borderRadius: 'var(--r-lg)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <Plus size={16} /> Add Product
                    </button>
                  </div>

                  {/* Product Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: 20
                  }}>
                    {products.length > 0 ? (
                      products.map(prod => (
                        <div
                          key={prod.id}
                          className="card hover-lift"
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            position: 'relative',
                            minHeight: 330
                          }}
                        >
                          {/* Image */}
                          <div style={{
                            width: '100%',
                            paddingTop: '80%',
                            position: 'relative',
                            background: 'var(--bg-2)'
                          }}>
                            {prod.image_urls?.[0] ? (
                              <img
                                src={prod.image_urls[0]}
                                alt={prod.name}
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: 'var(--text-faint)' }}>
                                📦
                              </div>
                            )}
                            
                            {/* Stock badge */}
                            <span className={`badge ${prod.stock_status === 'in_stock' ? 'badge-primary' : 'badge-danger'}`} style={{ position: 'absolute', top: 10, left: 10, fontSize: 9 }}>
                              {prod.stock_status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>

                          {/* Info */}
                          <div style={{ padding: 14, display: 'flex', flexDirection: 'column', flex: 1, gap: 4 }}>
                            <span style={{ fontSize: 10.5, color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              {prod.category?.name || 'Uncategorized'}
                            </span>
                            <h4 style={{ fontSize: 14, fontWeight: 800, minHeight: 40, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: 'var(--text)' }}>
                              {prod.name}
                            </h4>
                            
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '4px 0' }}>
                              <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--primary)' }}>
                                ₦{formatVal(prod.price)}
                              </span>
                              {prod.compare_at_price && (
                                <span style={{ fontSize: 11, color: 'var(--text-faint)', textDecoration: 'line-through' }}>
                                  ₦{formatVal(prod.compare_at_price)}
                                </span>
                              )}
                            </div>

                            <p style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 12 }}>
                              {prod.description || 'No description added.'}
                            </p>

                            {/* Action Tools */}
                            <div style={{ display: 'flex', gap: 8, marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                              <button
                                onClick={() => handleEditProductClick(prod)}
                                className="btn btn-outline clickable"
                                style={{ flex: 1, padding: '6px 10px', fontSize: 12, borderRadius: 'var(--r-sm)', display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}
                              >
                                <Edit2 size={12} /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="btn btn-ghost clickable"
                                style={{ padding: '6px 8px', borderRadius: 'var(--r-sm)', color: 'var(--danger)' }}
                                title="Delete Product"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="card" style={{ gridColumn: '1/-1', padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No products added to catalog. Add some items to showcase your storefront!
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── TAB 4: WHATSAPP CHAT SIMULATOR ── */}
              {activeTab === 'whatsapp' && (
                <div className="card animate-fade-in whatsapp-chat-shell" style={{ padding: 0, height: 'calc(100vh - 160px)', display: 'flex', overflow: 'hidden' }}>
                  
                  {/* Left Chats Sidebar */}
                  <div style={{ width: 280, borderRight: '1px solid var(--border)', background: 'var(--bg-2)', display: 'flex', flexDirection: 'column' }} className="wa-contacts-panel">
                    <div style={{ padding: 18, borderBottom: '1px solid var(--border)' }}>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 900 }}>WhatsApp Chats</h3>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Simulated buyer interactions</p>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: 8 }}>
                      <div style={{ display: 'flex', gap: 10, background: 'var(--surface)', padding: 12, borderRadius: 'var(--r-md)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#25d366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
                          CO
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ fontSize: 13, fontWeight: 800 }}>Chioma Obi</p>
                            <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 800 }}>Active</span>
                          </div>
                          <p style={{ fontSize: 11.5, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                            I need size L. Can you ship...
                          </p>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                            {waChatLabels.map(l => (
                              <span key={l} style={{ fontSize: 8, background: 'var(--primary-light)', color: 'var(--primary)', padding: '1px 5px', borderRadius: 'var(--r-full)', fontWeight: 800 }}>
                                {l}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 10, padding: 12, borderRadius: 'var(--r-md)', opacity: 0.6, cursor: 'not-allowed' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--text-faint)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
                          TB
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 700 }}>Tunde Bakare</p>
                          <p style={{ fontSize: 11, color: 'var(--text-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            Closed sale ORD-10002
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Chat Screen */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
                    
                    {/* Header */}
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#25d366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                          CO
                        </div>
                        <div>
                          <h4 style={{ fontSize: 14, fontWeight: 800 }}>Chioma Obi</h4>
                          <span style={{ fontSize: 11, color: '#25d366', fontWeight: 700 }}>● Online (Simulated)</span>
                        </div>
                      </div>

                      {/* Simulator Top Action controls */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={handleWaOfferCoupon}
                          className="btn btn-outline clickable"
                          style={{ padding: '6px 12px', fontSize: 11.5, borderRadius: 'var(--r-sm)' }}
                        >
                          🏷️ Send 10% Discount
                        </button>
                        <button
                          onClick={handleWaCloseSale}
                          disabled={waCloseSaleLoading}
                          className="btn btn-primary clickable"
                          style={{ padding: '6px 12px', fontSize: 11.5, borderRadius: 'var(--r-sm)', background: '#25d366', boxShadow: 'none' }}
                        >
                          {waCloseSaleLoading ? <Loader2 size={12} className="spinner" /> : '🧾 Close Sale (Invoice)'}
                        </button>
                        <button
                          onClick={handleWaConfirmPayment}
                          className="btn btn-outline clickable"
                          style={{ padding: '6px 12px', fontSize: 11.5, borderRadius: 'var(--r-sm)', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                        >
                          💚 Mark Paid
                        </button>
                      </div>
                    </div>

                    {/* Chat Messages viewport */}
                    <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', background: 'var(--bg)' }}>
                      {waMessages.map((msg, index) => {
                        const isMerchant = msg.sender === 'merchant';
                        return (
                          <div
                            key={index}
                            style={{
                              display: 'flex',
                              justifyContent: isMerchant ? 'flex-end' : 'flex-start',
                              width: '100%'
                            }}
                          >
                            <div style={{
                              maxWidth: '70%',
                              background: isMerchant ? '#e7fed7' : 'var(--surface)',
                              color: 'var(--text)',
                              padding: '10px 14px',
                              borderRadius: isMerchant ? '12px 12px 0 12px' : '12px 12px 12px 0',
                              border: '1px solid var(--border)',
                              boxShadow: 'var(--shadow-xs)'
                            }}>
                              <p style={{ fontSize: 13.5, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{msg.text}</p>
                              <span style={{ fontSize: 10, color: 'var(--text-faint)', display: 'block', textAlign: 'right', marginTop: 4 }}>
                                {msg.time}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom AI Suggestion assistant pane */}
                    {waAiSuggestion && (
                      <div style={{ padding: '10px 16px', background: 'linear-gradient(135deg, var(--surface), rgba(16, 185, 129, 0.05))', borderTop: '1.5px dashed var(--primary)', display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ color: 'var(--primary)', flexShrink: 0 }}>
                          <Sparkles size={16} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>AI Response Suggestion</p>
                          <p style={{ fontSize: 12.5, color: 'var(--text-2)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: 2 }}>{waAiSuggestion}</p>
                        </div>
                        <button
                          onClick={() => handleSendWaMessage(waAiSuggestion)}
                          className="btn btn-primary clickable"
                          style={{ padding: '6px 12px', fontSize: 11, borderRadius: 'var(--r-sm)' }}
                        >
                          Apply Send
                        </button>
                      </div>
                    )}

                    {/* Chat Box Input area */}
                    <div style={{ padding: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                      <input
                        type="text"
                        placeholder="Type WhatsApp reply to customer..."
                        value={waCustomText}
                        onChange={e => setWaCustomText(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '12px 14px',
                          background: 'var(--bg-2)',
                          border: '1.5px solid var(--border)',
                          borderRadius: 'var(--r-xl)',
                          outline: 'none',
                          fontSize: 13.5,
                          color: 'var(--text)'
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSendWaMessage(waCustomText);
                        }}
                      />
                      <button
                        onClick={() => handleSendWaMessage(waCustomText)}
                        className="btn btn-primary clickable"
                        style={{ padding: '12px 20px', borderRadius: 'var(--r-xl)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        Send
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* ── TAB 5: SHARE & REFERRALS ── */}
              {activeTab === 'share' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }} className="responsive-share-grid animate-fade-in">
                  
                  {/* Share Store Card */}
                  <div className="card" style={{ padding: 24 }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 900, marginBottom: 8 }}>Viral Share Center</h2>
                    <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 24 }}>Share your catalog link to receive instant shopper orders directly into your dashboard.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      
                      {/* URL Box */}
                      <div style={{ background: 'var(--bg-2)', padding: '16px 20px', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)' }}>
                        <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Store URL</label>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary-dark)', wordBreak: 'break-all' }}>
                            {store ? `${store.username}.aloaye.com` : 'aloaye.com'}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`https://${store?.username}.aloaye.com`);
                              toast.success('Store link copied! 📋');
                            }}
                            className="btn btn-outline clickable"
                            style={{ padding: '6px 12px', fontSize: 11, borderRadius: 'var(--r-sm)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          >
                            <Copy size={12} /> Copy
                          </button>
                        </div>
                      </div>

                      {/* WhatsApp share CTA */}
                      <button
                        onClick={() => {
                          const url = `https://${store?.username}.aloaye.com`;
                          const msg = encodeURIComponent(`🏪 Check out my digital store on Aloaye! Shop here: ${url}`);
                          window.open(`https://wa.me/?text=${msg}`, '_blank');
                        }}
                        className="btn clickable"
                        style={{ background: '#25d366', color: '#fff', padding: '14px', borderRadius: 'var(--r-xl)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
                      >
                        <MessageSquare size={18} /> Share Store link on WhatsApp
                      </button>

                      {/* Visual storefront banner mock */}
                      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', overflow: 'hidden', background: 'var(--bg-2)' }}>
                        <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', padding: '16px 20px', color: '#fff' }}>
                          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800 }}>🏪 Shop Live: {store?.store_name}</h4>
                          <p style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>Fast browsing · Easy WhatsApp checkouts</p>
                        </div>
                        <div style={{ padding: 16, display: 'flex', gap: 10, overflowX: 'auto' }}>
                          {products.slice(0, 3).map(p => (
                            <div key={p.id} style={{ background: 'var(--surface)', padding: 10, borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', width: 100, flexShrink: 0 }}>
                              <div style={{ width: '100%', height: 60, background: 'var(--bg-2)', borderRadius: 'var(--r-md)', overflow: 'hidden', position: 'relative' }}>
                                {p.image_urls?.[0] && <img src={p.image_urls[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                              </div>
                              <p style={{ fontSize: 10, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 6 }}>{p.name}</p>
                              <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 800, display: 'block', marginTop: 2 }}>₦{formatVal(p.price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Viral referrals panel */}
                  <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 900 }}>Referral Reward Center</h2>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Earn commissions by introducing other vendors to Aloaye.</p>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, var(--primary-light), rgba(16, 185, 129, 0.02))', border: '1.5px dashed var(--primary)', borderRadius: 'var(--r-xl)', padding: 24, textAlign: 'center' }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>EARN MONEY</span>
                      <p style={{ fontSize: 32, fontWeight: 900, color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)', margin: '8px 0 2px' }}>
                        ₦1,500
                      </p>
                      <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 700 }}>Paid for each shop referral that publishes a product</span>
                    </div>

                    {/* Ref Link */}
                    <div style={{ background: 'var(--bg-2)', padding: 14, borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Your referral link</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>aloaye.com/ref/{store?.username}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`https://aloaye.com/ref/${store?.username}`);
                            toast.success('Referral link copied! 💰');
                          }}
                          className="btn btn-outline clickable"
                          style={{ padding: '4px 10px', fontSize: 11, borderRadius: 'var(--r-sm)' }}
                        >
                          Copy link
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 6: SETTINGS & DEVELOPER OVERRIDES ── */}
              {activeTab === 'settings' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }} className="responsive-settings-grid animate-fade-in">
                  
                  {/* Shop Details updating form */}
                  <div className="card" style={{ padding: 24 }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 900, marginBottom: 16 }}>Storefront Configuration</h2>
                    
                    <form onSubmit={handleSettingsSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Store Name</label>
                        <input
                          type="text"
                          required
                          value={setStoreName}
                          onChange={e => setSetStoreName(e.target.value)}
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Store Description (Bio)</label>
                        <textarea
                          rows={3}
                          value={setStoreBio}
                          onChange={e => setSetStoreBio(e.target.value)}
                          className="input-field"
                          style={{ resize: 'vertical' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>WhatsApp Number</label>
                          <input
                            type="text"
                            required
                            value={setWhatsapp}
                            onChange={e => setSetWhatsapp(e.target.value)}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Store Currency</label>
                          <select
                            value={setCurrency}
                            onChange={e => setSetCurrency(e.target.value)}
                            className="input-field"
                          >
                            <option value="NGN">NGN (₦)</option>
                            <option value="GHS">GHS (₵)</option>
                            <option value="KES">KES (KSh)</option>
                            <option value="ZAR">ZAR (R)</option>
                            <option value="USD">USD ($)</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Instagram Handle</label>
                          <input
                            type="text"
                            value={setInstagram}
                            onChange={e => setSetInstagram(e.target.value)}
                            className="input-field"
                            placeholder="username"
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>TikTok Handle</label>
                          <input
                            type="text"
                            value={setTiktok}
                            onChange={e => setSetTiktok(e.target.value)}
                            className="input-field"
                            placeholder="username"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={settingsSaving}
                        className="btn btn-primary clickable"
                        style={{ padding: '14px', borderRadius: 'var(--r-xl)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 10 }}
                      >
                        {settingsSaving ? <><Loader2 size={16} className="spinner" /> Saving...</> : 'Save Configuration Changes'}
                      </button>
                    </form>
                  </div>

                  {/* Settings Side Panels (Identity, Developer Overrides) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    
                    {/* Identity Info Panel */}
                    <div className="card" style={{ padding: 20 }}>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, marginBottom: 14 }}>Identity Context</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Merchant Name</span>
                          <span style={{ fontWeight: 800 }}>{user?.name}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Sign-in Phone</span>
                          <span style={{ fontWeight: 700 }}>{user?.phone_number}</span>
                        </div>
                        {user?.email && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Registered Email</span>
                            <span style={{ fontWeight: 700 }}>{user.email}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Shop Username</span>
                          <span style={{ fontWeight: 700 }}>@{store?.username}</span>
                        </div>
                      </div>
                    </div>

                    {/* Developer settings URL override */}
                    <div className="card" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <div style={{ background: 'var(--danger-light)', padding: 4, borderRadius: 'var(--r-sm)', color: 'var(--danger)' }}>
                          <Settings size={14} />
                        </div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14.5, fontWeight: 800 }}>Developer Overrides</h3>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 14 }}>
                        Change the backend API endpoint address. (Default port is 8000). Useful for connecting local network devices.
                      </p>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <input
                          type="text"
                          value={devApiInput}
                          onChange={e => setDevApiInput(e.target.value)}
                          className="input-field"
                          style={{ padding: '8px 12px', fontSize: 13, height: 38 }}
                        />
                        <button
                          onClick={handleSaveDevApi}
                          className="btn btn-outline clickable"
                          style={{ width: '100%', padding: '8px', fontSize: 12, borderRadius: 'var(--r-md)', fontWeight: 700 }}
                        >
                          Sync Host Address
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </>
          )}

        </div>

      </main>

      {/* ── MOBILE MENU SLIDEOUT DRAWER ── */}
      {isMobileMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex' }} className="animate-fade-in">
          {/* Overlay mask */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}
          />
          {/* Drawer content */}
          <div className="animate-drawer" style={{
            position: 'relative',
            width: 280,
            background: 'var(--surface)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: 24,
            borderRight: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Store size={22} style={{ color: 'var(--primary)' }} />
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 18 }}>aloaye</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              {[
                { id: 'overview', label: 'Overview', icon: <BarChart3 size={18} /> },
                { id: 'orders', label: 'Orders Manager', icon: <ShoppingBag size={18} /> },
                { id: 'products', label: 'Products CRUD', icon: <Package size={18} /> },
                { id: 'whatsapp', label: 'WhatsApp Simulator', icon: <MessageSquare size={18} /> },
                { id: 'share', label: 'Share & Referrals', icon: <Share2 size={18} /> },
                { id: 'settings', label: 'Settings & Dev', icon: <Settings size={18} /> },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setIsMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--r-md)',
                    border: 'none',
                    background: activeTab === item.id ? 'var(--primary-light)' : 'transparent',
                    color: activeTab === item.id ? 'var(--primary)' : 'var(--text-muted)',
                    fontSize: 14.5,
                    fontWeight: activeTab === item.id ? 800 : 600,
                    textAlign: 'left'
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <button
              onClick={handleLogout}
              className="btn btn-ghost clickable"
              style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--danger)', marginTop: 'auto', justifyContent: 'flex-start', padding: 10 }}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: INSIGHTS DISCOUNT CAMPAIGN ── */}
      {isDiscountModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setIsDiscountModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} />
          <div className="card glass animate-scale-in" style={{ position: 'relative', width: '100%', maxWidth: 440, padding: 24, zIndex: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={18} style={{ color: 'var(--accent)' }} /> Create Flash Campaign
              </h3>
              <button onClick={() => setIsDiscountModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }}><X size={18} /></button>
            </div>

            <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 20 }}>
              Launch a flash discount campaign to automatically display sale pricing to shoppers and lift your conversion rates by over 15%.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Discount Rate (%)</label>
                <select
                  value={discountPercent}
                  onChange={e => setDiscountPercent(e.target.value)}
                  className="input-field"
                >
                  <option value="5">5% Discount</option>
                  <option value="10">10% Discount (Recommended)</option>
                  <option value="15">15% Discount</option>
                  <option value="20">20% Discount</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setIsDiscountModalOpen(false)} className="btn btn-outline clickable" style={{ flex: 1, padding: 12 }}>Cancel</button>
              <button onClick={handleApplyQuickDiscount} className="btn btn-primary clickable" style={{ flex: 1, padding: 12 }}>Deploy Campaign</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD PRODUCT OVERLAY ── */}
      {isAddProductOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setIsAddProductOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} />
          <div className="card glass animate-scale-in" style={{ position: 'relative', width: '100%', maxWidth: 540, padding: 24, zIndex: 10, maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900 }}>Create Store Product</h3>
              <button onClick={() => setIsAddProductOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleCreateProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Sales Price (₦)</label>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Category</label>
                  <select
                    value={prodCategory}
                    onChange={e => setProdCategory(e.target.value)}
                    className="input-field"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Inventory Status</label>
                  <select
                    value={prodStock}
                    onChange={e => setProdStock(e.target.value)}
                    className="input-field"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Visual Stock Image Selector */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Product Banner Image</label>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
                  {STOCK_IMAGE_OPTIONS.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setProdImageUrl(img.url)}
                      style={{
                        width: 70, height: 70, borderRadius: 'var(--r-md)', overflow: 'hidden', flexShrink: 0,
                        border: prodImageUrl === img.url ? '3px solid var(--primary)' : '1.5px solid var(--border)',
                        cursor: 'pointer', position: 'relative'
                      }}
                    >
                      <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, fontSize: 8, color: '#fff', background: 'rgba(0,0,0,0.6)', textAlign: 'center', padding: '1px 0' }}>{img.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase' }}>Description & Details</label>
                  <button
                    type="button"
                    onClick={handleGenerateAIDescription}
                    disabled={aiGenerating}
                    className="btn btn-outline"
                    style={{ padding: '4px 10px', fontSize: 10.5, borderRadius: 'var(--r-sm)', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                  >
                    {aiGenerating ? <><Loader2 size={11} className="spinner" /> Generating...</> : <><Sparkles size={11} /> AI Auto-Write</>}
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

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setIsAddProductOpen(false)} className="btn btn-outline clickable" style={{ flex: 1, padding: 12 }}>Cancel</button>
                <button type="submit" disabled={productPublishing} className="btn btn-primary clickable" style={{ flex: 1, padding: 12 }}>
                  {productPublishing ? <><Loader2 size={14} className="spinner" /> Publishing...</> : 'Publish Product'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ── MODAL: EDIT PRODUCT OVERLAY ── */}
      {isEditProductOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setIsEditProductOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} />
          <div className="card glass animate-scale-in" style={{ position: 'relative', width: '100%', maxWidth: 540, padding: 24, zIndex: 10, maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900 }}>Edit Product Settings</h3>
              <button onClick={() => setIsEditProductOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleUpdateProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Product Title</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={e => setProdName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Sales Price (₦)</label>
                  <input
                    type="number"
                    required
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Category</label>
                  <select
                    value={prodCategory}
                    onChange={e => setProdCategory(e.target.value)}
                    className="input-field"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Inventory Status</label>
                  <select
                    value={prodStock}
                    onChange={e => setProdStock(e.target.value)}
                    className="input-field"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Product Banner Image</label>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
                  {STOCK_IMAGE_OPTIONS.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setProdImageUrl(img.url)}
                      style={{
                        width: 70, height: 70, borderRadius: 'var(--r-md)', overflow: 'hidden', flexShrink: 0,
                        border: prodImageUrl === img.url ? '3px solid var(--primary)' : '1.5px solid var(--border)',
                        cursor: 'pointer', position: 'relative'
                      }}
                    >
                      <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase' }}>Description & Details</label>
                  <button
                    type="button"
                    onClick={handleGenerateAIDescription}
                    disabled={aiGenerating}
                    className="btn btn-outline"
                    style={{ padding: '4px 10px', fontSize: 10.5, borderRadius: 'var(--r-sm)', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                  >
                    {aiGenerating ? <><Loader2 size={11} className="spinner" /> Generating...</> : <><Sparkles size={11} /> AI Auto-Write</>}
                  </button>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your product specs..."
                  value={prodDesc}
                  onChange={e => setProdDesc(e.target.value)}
                  className="input-field"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setIsEditProductOpen(false)} className="btn btn-outline clickable" style={{ flex: 1, padding: 12 }}>Cancel</button>
                <button type="submit" disabled={productPublishing} className="btn btn-primary clickable" style={{ flex: 1, padding: 12 }}>
                  {productPublishing ? <><Loader2 size={14} className="spinner" /> Saving...</> : 'Save Changes'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ── MODAL: ORDER DETAILS INPSECT ── */}
      {isOrderDetailsOpen && selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setIsOrderDetailsOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} />
          <div className="card glass animate-scale-in" style={{ position: 'relative', width: '100%', maxWidth: 500, padding: 24, zIndex: 10, maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900 }}>Inspect Order {selectedOrder.order_number}</h3>
              <button onClick={() => setIsOrderDetailsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Customer summary */}
              <div style={{ background: 'var(--bg-2)', padding: 16, borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Customer Details</h4>
                <p style={{ fontWeight: 800, fontSize: 15 }}>{selectedOrder.customer_name}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Phone: {selectedOrder.customer_phone}</p>
                {selectedOrder.delivery_address && (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'start', gap: 4, marginTop: 8 }}>
                    <MapPin size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>Address: {selectedOrder.delivery_address}</span>
                  </p>
                )}
              </div>

              {/* Status row */}
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Order Status</label>
                  <select
                    value={selectedOrder.order_status}
                    onChange={e => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                    className="input-field"
                    style={{ padding: '8px 12px', fontSize: 12.5, height: 38 }}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed/Shipped</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Payment Status</label>
                  <select
                    value={selectedOrder.payment_status}
                    onChange={e => handleUpdatePaymentStatus(selectedOrder.id, e.target.value)}
                    className="input-field"
                    style={{ padding: '8px 12px', fontSize: 12.5, height: 38 }}
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              {/* Action tools */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                <button
                  onClick={() => {
                    const msg = `Hi ${selectedOrder.customer_name}! This is ${store?.store_name || 'aloaye merchant'} following up regarding your Order ${selectedOrder.order_number} totaling ₦${parseFloat(selectedOrder.total_amount as string).toLocaleString()}.`;
                    window.open(`https://wa.me/${selectedOrder.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  className="btn btn-outline clickable"
                  style={{ flex: 1, padding: 10, fontSize: 12, borderRadius: 'var(--r-md)', display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}
                >
                  <MessageSquare size={14} style={{ color: '#25d366' }} /> Chat WhatsApp
                </button>

                <button
                  onClick={() => {
                    setIsOrderDetailsOpen(false);
                    setReceiptOrder(selectedOrder);
                    setIsReceiptOpen(true);
                  }}
                  className="btn btn-outline clickable"
                  style={{ flex: 1, padding: 10, fontSize: 12, borderRadius: 'var(--r-md)', display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}
                >
                  <Receipt size={14} /> Receipt
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── MODAL: Sleek customer receipt view ── */}
      {isReceiptOpen && receiptOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setIsReceiptOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} />
          <div className="card glass animate-scale-in" style={{ position: 'relative', width: '100%', maxWidth: 420, padding: 24, zIndex: 10 }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Receipt size={18} style={{ color: 'var(--primary)' }} /> Sales Receipt
              </h3>
              <button onClick={() => setIsReceiptOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }}><X size={18} /></button>
            </div>

            {/* Receipt raw monospace render */}
            <div style={{
              background: '#1e293b',
              color: '#34d399',
              fontFamily: 'monospace',
              fontSize: 12.5,
              padding: 16,
              borderRadius: 'var(--r-md)',
              whiteSpace: 'pre-wrap',
              maxHeight: 300,
              overflowY: 'auto',
              marginBottom: 18,
              lineHeight: 1.45,
              border: '1px solid #334155'
            }}>
              {generateReceiptText(receiptOrder)}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setIsReceiptOpen(false)} className="btn btn-outline clickable" style={{ flex: 1, padding: 12 }}>Close</button>
              <button onClick={() => copyReceiptToClipboard(receiptOrder)} className="btn btn-primary clickable" style={{ flex: 1, padding: 12 }}>Copy Text</button>
            </div>

          </div>
        </div>
      )}

      {/* Styled JSX layout rules to make dashboard fully responsive */}
      <style jsx global>{`
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }

        .table-row-hover:hover {
          background: var(--bg-2);
        }

        @media (max-width: 1024px) {
          .responsive-chart-grid {
            grid-template-columns: 1fr !important;
          }
          .responsive-share-grid {
            grid-template-columns: 1fr !important;
          }
          .responsive-settings-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 768px) {
          aside {
            display: none !important;
          }
          .mobile-burger-btn {
            display: block !important;
          }
          .desktop-only-text {
            display: none !important;
          }
          .whatsapp-chat-shell {
            flex-direction: column !important;
            height: calc(100vh - 120px) !important;
          }
          .wa-contacts-panel {
            width: 100% !important;
            height: 160px !important;
            border-right: none !important;
            border-bottom: 1px solid var(--border) !important;
          }
          .responsive-order-heading {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start !important;
          }
          .responsive-product-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start !important;
          }
        }
      `}</style>

    </div>
  );
}
