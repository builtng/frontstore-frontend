'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  FileText, TrendingUp, TrendingDown, DollarSign, Download, RefreshCw,
  Plus, Search, Loader2, Calendar, CheckCircle2, Clock, Trash2, Edit2,
  ExternalLink, ArrowUpRight, ArrowDownRight, Tag, PieChart, Layers,
  CreditCard, ArrowDownLeft, Check, AlertCircle, ArrowUp
} from 'lucide-react';
import { api, getApiUrl } from '@/lib/api';
import SearchableSelect from '@/components/SearchableSelect';
import AddEditBookkeepingRecordModal from './modals/AddEditBookkeepingRecordModal';
import type { BookkeepingRecord, BookkeepingSummary, StoreInfo } from '@/types/dashboard';

interface BookkeepingTabProps {
  store: StoreInfo | null;
  isPro: boolean;
  navigateDashboardTab: (tab: 'billing') => void;
}

export default function BookkeepingTab({ store, isPro, navigateDashboardTab }: BookkeepingTabProps) {
  const [summary, setSummary] = useState<BookkeepingSummary | null>(null);
  const [records, setRecords] = useState<BookkeepingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'quarter' | 'year' | 'all'>('month');
  const [subTab, setSubTab] = useState<'overview' | 'ledger' | 'credit' | 'categories'>('overview');
  
  // Ledger Filters
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState<Record<string, number>>({});

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BookkeepingRecord | null>(null);

  const fetchSummary = async () => {
    try {
      const data = await api.get<BookkeepingSummary>(`/v1/bookkeeping/summary?range=${dateRange}`);
      setSummary(data);
    } catch (e) {
      console.error('Failed to load bookkeeping summary', e);
    }
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        type: typeFilter,
        category: categoryFilter,
        status: statusFilter,
        search: searchQuery,
      });

      const res = await api.get<any>(`/v1/bookkeeping/records?${params.toString()}`);
      setRecords(res.data || []);
      setTotalPages(res.last_page || 1);
      if (res.counts) setCounts(res.counts);
    } catch (e) {
      toast.error('Failed to load bookkeeping records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [dateRange]);

  useEffect(() => {
    fetchRecords();
  }, [page, typeFilter, categoryFilter, statusFilter, searchQuery]);

  const handleSyncOrders = async () => {
    try {
      setSyncing(true);
      const res = await api.post<any>('/v1/bookkeeping/sync-orders', {});
      toast.success(res.message || 'Orders synced successfully!');
      fetchSummary();
      fetchRecords();
    } catch (e) {
      toast.error('Failed to sync orders to bookkeeping.');
    } finally {
      setSyncing(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      toast.info('Preparing Bookkeeping CSV Export...');
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${getApiUrl()}/v1/bookkeeping/export?type=${typeFilter}&category=${categoryFilter}&range=${dateRange}`, {
        headers,
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Failed to export CSV');
      }
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `bookkeeping_${store?.username || 'store'}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Bookkeeping CSV report downloaded.');
    } catch (e) {
      toast.error('Failed to export CSV report.');
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction record?')) return;
    try {
      await api.delete(`/v1/bookkeeping/records/${id}`);
      toast.success('Record deleted.');
      fetchSummary();
      fetchRecords();
    } catch (e) {
      toast.error('Failed to delete record.');
    }
  };

  const handleMarkAsCompleted = async (rec: BookkeepingRecord) => {
    try {
      await api.put(`/v1/bookkeeping/records/${rec.id}`, { status: 'completed' });
      toast.success(`Marked "${rec.title}" as settled.`);
      fetchSummary();
      fetchRecords();
    } catch (e) {
      toast.error('Failed to update status.');
    }
  };

  const currencySymbol = store?.currency_code || 'NGN';
  const netProfit = summary?.summary.net_profit ?? 0;
  const isProfitPositive = netProfit >= 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-heading)', margin: 0, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Bookkeeping & Ledger
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Automated financial tracking, profit margins, operational expenses, and ledger entries.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: 130 }}>
            <SearchableSelect
              options={[
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
                { value: 'quarter', label: 'This Quarter' },
                { value: 'year', label: 'This Year' },
                { value: 'all', label: 'All Time' },
              ]}
              value={dateRange}
              onChange={(val) => setDateRange(val as any)}
              searchable={false}
              triggerStyle={{ padding: '6px 10px', fontSize: '12.5px', height: '36px', borderRadius: 'var(--r-md)' }}
            />
          </div>

          <button
            onClick={handleSyncOrders}
            disabled={syncing}
            className="btn btn-secondary clickable"
            style={{ padding: '6px 12px', fontSize: 12.5, height: 36, display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 'var(--r-md)' }}
          >
            <RefreshCw size={13} className={syncing ? 'spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync Orders'}
          </button>

          <button
            onClick={handleExportCsv}
            className="btn btn-secondary clickable"
            style={{ padding: '6px 12px', fontSize: 12.5, height: 36, display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 'var(--r-md)' }}
          >
            <Download size={13} /> Export CSV
          </button>

          <button
            onClick={() => { setEditingRecord(null); setIsModalOpen(true); }}
            className="btn btn-primary clickable"
            style={{ padding: '6px 14px', fontSize: 12.5, fontWeight: 700, height: 36, display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 'var(--r-md)' }}
          >
            <Plus size={14} /> Add Transaction
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        {/* Net Profit */}
        <div className="card" style={{ padding: '16px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Net Profit
            </span>
            <span style={{
              fontSize: 11,
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              padding: '2px 6px',
              borderRadius: 'var(--r-full)',
              background: isProfitPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: isProfitPositive ? '#10b981' : '#ef4444'
            }}>
              {isProfitPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {summary?.summary.profit_margin || 0}% margin
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', color: isProfitPositive ? '#10b981' : '#ef4444', fontFamily: 'var(--font-heading)' }}>
            {currencySymbol} {summary ? Math.abs(summary.summary.net_profit).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
            {!isProfitPositive && <span style={{ fontSize: 12, fontWeight: 700, marginLeft: 4 }}>(Deficit)</span>}
          </div>
          <span style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 4, display: 'block' }}>
            Revenue minus operating expenses
          </span>
        </div>

        {/* Total Inflow (Income) */}
        <div className="card" style={{ padding: '16px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 5 }}>
              <ArrowDownLeft size={13} style={{ color: '#10b981' }} /> Total Inflow
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Sales & Income</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>
            {currencySymbol} {summary ? summary.summary.total_income.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <span style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 4, display: 'block' }}>
            Storefront orders & manual income
          </span>
        </div>

        {/* Total Outflow (Expenses) */}
        <div className="card" style={{ padding: '16px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 5 }}>
              <ArrowUpRight size={13} style={{ color: '#ef4444' }} /> Total Outflow
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Expenses</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>
            {currencySymbol} {summary ? summary.summary.total_expense.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <span style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 4, display: 'block' }}>
            Inventory, logistics & overheads
          </span>
        </div>

        {/* Open Balances */}
        <div className="card" style={{ padding: '16px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Open Balances
            </span>
            <Clock size={13} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
              <span style={{ color: 'var(--text-muted)' }}>Receivables:</span>
              <span style={{ fontWeight: 800, color: '#3b82f6' }}>{currencySymbol} {summary ? summary.summary.total_receivable.toLocaleString() : '0'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
              <span style={{ color: 'var(--text-muted)' }}>Payables:</span>
              <span style={{ fontWeight: 800, color: '#f59e0b' }}>{currencySymbol} {summary ? summary.summary.total_payable.toLocaleString() : '0'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: 8, marginTop: 4 }}>
        {[
          { id: 'overview', label: 'Overview & Trends', icon: <TrendingUp size={14} /> },
          { id: 'ledger', label: 'Transaction Ledger', icon: <Layers size={14} /> },
          { id: 'credit', label: 'Receivables & Payables', icon: <CreditCard size={14} /> },
          { id: 'categories', label: 'Category Analytics', icon: <PieChart size={14} /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id as any)}
            className="clickable"
            style={{
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: subTab === t.id ? 800 : 600,
              color: subTab === t.id ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: subTab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
              background: 'transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* SUB-TAB 1: OVERVIEW & CHARTS */}
      {subTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Monthly Trend Chart */}
          <div className="card" style={{ padding: '20px 24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                  6-Month Inflow vs Outflow Trend
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Comparison of store sales against business expenditures over time.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, fontWeight: 700 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: '#10B981' }} /> Inflow
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: '#EF4444' }} /> Outflow
                </span>
              </div>
            </div>

            {summary && summary.monthly_trends.length > 0 ? (
              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', height: 180, paddingTop: 10, paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>
                {summary.monthly_trends.map((m, idx) => {
                  const maxAmt = Math.max(...summary.monthly_trends.map(t => Math.max(t.income, t.expense)), 100);
                  const incHeight = Math.round((m.income / maxAmt) * 140);
                  const expHeight = Math.round((m.expense / maxAmt) * 140);

                  return (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 140 }}>
                        <div
                          title={`Inflow: ${currencySymbol} ${m.income.toLocaleString()}`}
                          style={{
                            width: 16,
                            height: Math.max(incHeight, 4),
                            background: '#10B981',
                            borderRadius: '3px 3px 0 0',
                            transition: 'height 0.3s ease',
                          }}
                        />
                        <div
                          title={`Outflow: ${currencySymbol} ${m.expense.toLocaleString()}`}
                          style={{
                            width: 16,
                            height: Math.max(expHeight, 4),
                            background: '#EF4444',
                            borderRadius: '3px 3px 0 0',
                            transition: 'height 0.3s ease',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '-0.01em' }}>{m.month}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No trend history recorded for the current store.
              </div>
            )}
          </div>

          {/* Expense & Income Categories Side-by-Side */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {/* Expense Categories Breakdown */}
            <div className="card" style={{ padding: '18px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 800, margin: '0 0 14px', color: 'var(--text)' }}>
                Outflow Allocation by Category
              </h3>
              {summary && summary.expense_categories.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {summary.expense_categories.map((cat) => (
                    <div key={cat.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                        <span style={{ textTransform: 'capitalize', color: 'var(--text)' }}>{cat.category.replace(/_/g, ' ')}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{currencySymbol} {cat.amount.toLocaleString()} <span style={{ fontSize: 11, fontWeight: 600 }}>({cat.percentage}%)</span></span>
                      </div>
                      <div style={{ width: '100%', height: 6, borderRadius: 'var(--r-full)', background: 'var(--bg-2)', overflow: 'hidden' }}>
                        <div style={{ width: `${cat.percentage}%`, height: '100%', background: '#EF4444', borderRadius: 'var(--r-full)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0', margin: 0 }}>No expense records logged yet.</p>
              )}
            </div>

            {/* Income Categories Breakdown */}
            <div className="card" style={{ padding: '18px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 800, margin: '0 0 14px', color: 'var(--text)' }}>
                Inflow Sources Breakdown
              </h3>
              {summary && summary.income_categories.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {summary.income_categories.map((cat) => (
                    <div key={cat.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                        <span style={{ textTransform: 'capitalize', color: 'var(--text)' }}>{cat.category.replace(/_/g, ' ')}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{currencySymbol} {cat.amount.toLocaleString()} <span style={{ fontSize: 11, fontWeight: 600 }}>({cat.percentage}%)</span></span>
                      </div>
                      <div style={{ width: '100%', height: 6, borderRadius: 'var(--r-full)', background: 'var(--bg-2)', overflow: 'hidden' }}>
                        <div style={{ width: `${cat.percentage}%`, height: '100%', background: '#10B981', borderRadius: 'var(--r-full)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0', margin: 0 }}>No income records logged yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: TRANSACTIONS LEDGER */}
      {subTab === 'ledger' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', padding: 3, borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
              {[
                { id: 'all', label: `All (${counts.all || 0})` },
                { id: 'income', label: `Inflow (${counts.income || 0})` },
                { id: 'expense', label: `Outflow (${counts.expense || 0})` },
                { id: 'receivable', label: `Receivables (${counts.receivable || 0})` },
                { id: 'payable', label: `Payables (${counts.payable || 0})` },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => { setTypeFilter(f.id); setPage(1); }}
                  className="clickable"
                  style={{
                    padding: '5px 10px',
                    borderRadius: 'var(--r-sm)',
                    fontSize: 12,
                    fontWeight: typeFilter === f.id ? 800 : 600,
                    background: typeFilter === f.id ? 'var(--primary)' : 'transparent',
                    color: typeFilter === f.id ? '#fff' : 'var(--text-muted)',
                    border: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: 260 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search description, party, ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
                style={{ paddingLeft: 32, fontSize: 12.5, height: 34, borderRadius: 'var(--r-md)' }}
              />
            </div>
          </div>

          {/* Transactions Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
            {loading ? (
              <div style={{ padding: 48, textAlign: 'center' }}><Loader2 className="spin" size={22} style={{ color: 'var(--primary)' }} /></div>
            ) : records.length > 0 ? (
              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)', textTransform: 'uppercase', fontSize: 10.5, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                      <th style={{ padding: '10px 14px', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left' }}>Transaction</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left' }}>Category</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left' }}>Counterparty</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => {
                      const isInc = r.type === 'income';
                      const isExp = r.type === 'expense';
                      const isRec = r.type === 'receivable';
                      const isPay = r.type === 'payable';

                      return (
                        <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', fontWeight: 600, color: 'var(--text-muted)', fontSize: 12 }}>
                            {r.transaction_date ? new Date(r.transaction_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{
                                width: 22, height: 22, borderRadius: 'var(--r-sm)',
                                background: isInc ? 'rgba(16, 185, 129, 0.1)' : isExp ? 'rgba(239, 68, 68, 0.1)' : isRec ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                color: isInc ? '#10b981' : isExp ? '#ef4444' : isRec ? '#3b82f6' : '#f59e0b',
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                              }}>
                                {isInc ? <ArrowDownLeft size={12} /> : isExp ? <ArrowUpRight size={12} /> : isRec ? <Clock size={12} /> : <CreditCard size={12} />}
                              </div>
                              <div>
                                <div style={{ fontWeight: 750, color: 'var(--text)' }}>{r.title}</div>
                                {r.is_auto_generated && (
                                  <span style={{ fontSize: 9.5, fontWeight: 800, color: '#10B981', background: 'rgba(16, 185, 129, 0.08)', padding: '1px 5px', borderRadius: 'var(--r-sm)', textTransform: 'uppercase' }}>Auto Synced</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-2)', padding: '3px 7px', borderRadius: 'var(--r-sm)', textTransform: 'capitalize' }}>
                              {r.category.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: 12 }}>
                            {r.party_name && <div>{r.party_name}</div>}
                            {r.reference_no && <div style={{ fontSize: 10.5, color: 'var(--text-faint)', fontFamily: 'monospace' }}>#{r.reference_no}</div>}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, fontSize: 13.5, color: isInc ? '#10b981' : isExp ? '#ef4444' : 'var(--text)' }}>
                            {isInc ? '+' : isExp ? '-' : ''}{currencySymbol} {parseFloat(r.amount as string).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <span style={{
                              fontSize: 10.5,
                              fontWeight: 800,
                              padding: '2px 7px',
                              borderRadius: 'var(--r-full)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              background: r.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : r.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: r.status === 'completed' ? '#10B981' : r.status === 'pending' ? '#F59E0B' : '#EF4444',
                            }}>
                              {r.status === 'completed' ? 'Settled' : r.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', alignItems: 'center' }}>
                              {r.receipt_url && (
                                <a
                                  href={r.receipt_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="View Receipt"
                                  className="clickable"
                                  style={{ padding: 4, color: 'var(--text-muted)' }}
                                >
                                  <ExternalLink size={14} />
                                </a>
                              )}
                              {r.status === 'pending' && (
                                <button
                                  onClick={() => handleMarkAsCompleted(r)}
                                  title="Mark as Settled"
                                  className="clickable btn btn-secondary"
                                  style={{ padding: '2px 7px', fontSize: 11, fontWeight: 700, height: 26, borderRadius: 'var(--r-sm)' }}
                                >
                                  Settle
                                </button>
                              )}
                              <button
                                onClick={() => { setEditingRecord(r); setIsModalOpen(true); }}
                                className="clickable"
                                style={{ padding: 4, color: 'var(--text-muted)', background: 'transparent', border: 'none' }}
                                title="Edit"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteRecord(r.id)}
                                className="clickable"
                                style={{ padding: 4, color: 'var(--danger)', background: 'transparent', border: 'none' }}
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: 48, textAlign: 'center' }}>
                <FileText size={32} color="var(--text-muted)" style={{ margin: '0 auto 10px', opacity: 0.6 }} />
                <h4 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 4px', color: 'var(--text)' }}>No Financial Records Found</h4>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0 }}>
                  No transactions match the selected filter. Add a manual record or sync store orders.
                </p>
                <button
                  onClick={() => { setEditingRecord(null); setIsModalOpen(true); }}
                  className="btn btn-primary clickable"
                  style={{ marginTop: 14, fontSize: 12.5, padding: '6px 14px' }}
                >
                  <Plus size={13} /> Add First Entry
                </button>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="btn btn-secondary clickable"
                style={{ fontSize: 12, padding: '4px 10px' }}
              >
                Previous
              </button>
              <span style={{ padding: '4px 10px', fontSize: 12, fontWeight: 700, alignSelf: 'center', color: 'var(--text-muted)' }}>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="btn btn-secondary clickable"
                style={{ fontSize: 12, padding: '4px 10px' }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: RECEIVABLES & PAYABLES */}
      {subTab === 'credit' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {/* Customer Receivables Card */}
          <div className="card" style={{ padding: '18px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, margin: 0, color: 'var(--text)' }}>
                <Clock size={15} style={{ color: '#3B82F6' }} /> Customer Receivables (Owed to You)
              </h3>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#3B82F6' }}>
                {currencySymbol} {summary?.summary.total_receivable.toLocaleString() || '0'}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 14px' }}>
              Pending credit invoices and unsettled customer balances.
            </p>

            {records.filter(r => r.type === 'receivable' && (r.status === 'pending' || r.status === 'overdue')).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {records.filter(r => r.type === 'receivable' && (r.status === 'pending' || r.status === 'overdue')).map(r => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 750, fontSize: 13, color: 'var(--text)' }}>{r.title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Customer: {r.party_name || 'N/A'} {r.due_date ? `• Due: ${r.due_date}` : ''}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: '#3B82F6', fontSize: 13 }}>{currencySymbol} {parseFloat(r.amount as string).toLocaleString()}</div>
                      <button
                        onClick={() => handleMarkAsCompleted(r)}
                        className="clickable"
                        style={{ fontSize: 11, fontWeight: 800, color: '#10B981', background: 'transparent', border: 'none', padding: 0, marginTop: 2 }}
                      >
                        ✓ Mark Paid
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0', margin: 0 }}>No pending customer receivables.</p>
            )}
          </div>

          {/* Supplier Payables Card */}
          <div className="card" style={{ padding: '18px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, margin: 0, color: 'var(--text)' }}>
                <CreditCard size={15} style={{ color: '#F59E0B' }} /> Supplier Payables (You Owe)
              </h3>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#F59E0B' }}>
                {currencySymbol} {summary?.summary.total_payable.toLocaleString() || '0'}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 14px' }}>
              Pending vendor invoices, contractor bills, and supplier dues.
            </p>

            {records.filter(r => r.type === 'payable' && (r.status === 'pending' || r.status === 'overdue')).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {records.filter(r => r.type === 'payable' && (r.status === 'pending' || r.status === 'overdue')).map(r => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 750, fontSize: 13, color: 'var(--text)' }}>{r.title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Supplier: {r.party_name || 'N/A'} {r.due_date ? `• Due: ${r.due_date}` : ''}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: '#F59E0B', fontSize: 13 }}>{currencySymbol} {parseFloat(r.amount as string).toLocaleString()}</div>
                      <button
                        onClick={() => handleMarkAsCompleted(r)}
                        className="clickable"
                        style={{ fontSize: 11, fontWeight: 800, color: '#10B981', background: 'transparent', border: 'none', padding: 0, marginTop: 2 }}
                      >
                        ✓ Mark Settled
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0', margin: 0 }}>No pending supplier payables.</p>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: CATEGORY ANALYTICS */}
      {subTab === 'categories' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {(summary?.expense_categories || []).map((cat) => (
            <div key={cat.category} className="card" style={{ padding: '16px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'rgba(239, 68, 68, 0.08)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Tag size={15} />
                </div>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 800, textTransform: 'capitalize', margin: 0, color: 'var(--text)' }}>
                    {cat.category.replace(/_/g, ' ')}
                  </h4>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{cat.count} records</span>
                </div>
              </div>

              <div style={{ fontSize: 18, fontWeight: 900, color: '#EF4444', marginTop: 6, fontFamily: 'var(--font-heading)' }}>
                {currencySymbol} {cat.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, display: 'block' }}>
                {cat.percentage}% of total outflow
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Record Modal */}
      <AddEditBookkeepingRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        record={editingRecord}
        store={store}
        onSaved={() => {
          fetchSummary();
          fetchRecords();
        }}
      />
    </div>
  );
}
