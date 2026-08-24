'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { TrendingUp, Loader2, Receipt, X } from 'lucide-react';
import SearchableSelect from '../SearchableSelect';
import { api } from '@/lib/api';
import type { StoreInfo } from '@/types/dashboard';

interface FinanceSummary {
  net_profit: number | string;
  profit_margin: number | string;
  revenue: number | string;
  today_revenue: number | string;
  expenses: number | string;
  today_expenses: number | string;
  monthly_growth: number | string;
  expenses_by_category?: Array<{ category: string; total: number | string }>;
}

interface Expense {
  id: string;
  incurred_at: string;
  category: string;
  description?: string | null;
  amount: number | string;
}

interface FinanceTabProps {
  store: StoreInfo | null;
  isPro: boolean;
  navigateDashboardTab: (tab: 'billing') => void;
}

export default function FinanceTab({ store, isPro, navigateDashboardTab }: FinanceTabProps) {
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
  const [financeLoading, setFinanceLoading] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [financeRange, setFinanceRange] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('month');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ amount: '', category: 'operations', description: '', incurred_at: new Date().toISOString().split('T')[0] });

  const fetchFinanceData = async () => {
    if (!isPro) return;
    try {
      setFinanceLoading(true);
      const [summary, expensesPage] = await Promise.all([
        api.get<FinanceSummary>(`/v1/finance/summary?range=${financeRange}`),
        api.get<{ data: Expense[] }>('/v1/finance/expenses'),
      ]);
      setFinanceSummary(summary);
      setExpenses(expensesPage?.data || []);
    } catch (e) {
      toast.error('Failed to load financial records.');
    } finally {
      setFinanceLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro, financeRange]);

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.del(`/v1/finance/expenses/${expenseId}`);
      toast.success('Expense record deleted.');
      fetchFinanceData();
    } catch {
      toast.error('Error deleting expense.');
    }
  };

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/v1/finance/expenses', newExpense);
      toast.success('Expense logged successfully!');
      setIsAddExpenseOpen(false);
      setNewExpense({ amount: '', category: 'operations', description: '', incurred_at: new Date().toISOString().split('T')[0] });
      fetchFinanceData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to log expense.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {!isPro ? (
        <div className="card text-center" style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: 600, margin: '40px auto' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 'var(--r-full)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)'
          }}>
            <TrendingUp size={28} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>Profit & Expense Tracking</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
              Track item cost prices, capture day-to-day business expenses, and view real-time net profits, margins, and monthly sales growth metrics.
            </p>
          </div>
          <button onClick={() => navigateDashboardTab('billing')} className="btn btn-primary clickable" style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 800 }}>
            🚀 Upgrade to Pro Plan
          </button>
        </div>
      ) : (
        <>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={22} color="#fff" />
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-heading)' }}>Profit & Expenses</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Financial dashboard, cost tracking, and expenses ledger.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <select
                value={financeRange}
                onChange={(e: any) => setFinanceRange(e.target.value)}
                className="input"
                style={{ padding: '6px 12px', fontSize: 13.5, width: 140 }}
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
              <button onClick={() => setIsAddExpenseOpen(true)} className="btn btn-primary clickable" style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700 }}>
                + Log Expense
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          {financeLoading || !financeSummary ? (
            <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Loader2 className="spin" size={24} /></div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-muted)' }}>Net Profit</span>
                  <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8, color: Number(financeSummary.net_profit) >= 0 ? '#10b981' : 'var(--danger)' }}>
                    {store?.currency_code} {parseFloat(financeSummary.net_profit as string || '0').toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                    Margin: <strong style={{ color: '#10b981' }}>{financeSummary.profit_margin}%</strong>
                  </div>
                </div>
                <div className="card">
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-muted)' }}>Revenue (Paid Orders)</span>
                  <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8 }}>
                    {store?.currency_code} {parseFloat(financeSummary.revenue as string || '0').toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                    Today: <strong>{store?.currency_code} {parseFloat(financeSummary.today_revenue as string || '0').toLocaleString()}</strong>
                  </div>
                </div>
                <div className="card">
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-muted)' }}>Expenses Recorded</span>
                  <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8, color: 'var(--danger)' }}>
                    {store?.currency_code} {parseFloat(financeSummary.expenses as string || '0').toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                    Today: <strong>{store?.currency_code} {parseFloat(financeSummary.today_expenses as string || '0').toLocaleString()}</strong>
                  </div>
                </div>
                <div className="card">
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-muted)' }}>Monthly Revenue Growth</span>
                  <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8, color: Number(financeSummary.monthly_growth) >= 0 ? '#10b981' : 'var(--danger)' }}>
                    {Number(financeSummary.monthly_growth) >= 0 ? '+' : ''}{financeSummary.monthly_growth}%
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>VS previous calendar month</span>
                </div>
              </div>

              {/* Detail Split */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
                {/* Expense Ledger */}
                <div className="card" style={{ padding: 0 }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: 14.5, fontWeight: 800 }}>Expense Ledger</h3>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-hover)' }}>
                          <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Date</th>
                          <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Category</th>
                          <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Description</th>
                          <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Amount</th>
                          <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.map((expense: any) => (
                          <tr key={expense.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '14px 18px', fontSize: 13 }}>{expense.incurred_at}</td>
                            <td style={{ padding: '14px 18px' }}>
                              <span className="badge" style={{ background: 'var(--card-hover)' }}>{expense.category}</span>
                            </td>
                            <td style={{ padding: '14px 18px', fontSize: 13 }}>{expense.description || 'No description'}</td>
                            <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: 'var(--danger)' }}>
                              {store?.currency_code} {parseFloat(expense.amount).toLocaleString()}
                            </td>
                            <td style={{ padding: '14px 18px' }}>
                              <button
                                onClick={() => handleDeleteExpense(expense.id)}
                                className="clickable"
                                style={{ border: 'none', background: 'none', color: 'var(--danger)', fontSize: 12.5, fontWeight: 700 }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                        {expenses.length === 0 && (
                          <tr>
                            <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13.5 }}>
                              No business expenses logged in this range.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Expenses breakdown */}
                <div className="card">
                  <h3 style={{ fontSize: 14.5, fontWeight: 800, marginBottom: 16 }}>Category Breakdown</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {['inventory', 'marketing', 'operations', 'staff', 'miscellaneous'].map(cat => {
                      const totalCat = financeSummary.expenses_by_category?.find((c: any) => c.category === cat)?.total || 0;
                      const pct = Number(financeSummary.expenses) > 0 ? (Number(totalCat) / Number(financeSummary.expenses)) * 100 : 0;
                      return (
                        <div key={cat}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                            <span style={{ textTransform: 'capitalize', fontWeight: 700 }}>{cat}</span>
                            <span style={{ color: 'var(--text-muted)' }}>{store?.currency_code} {parseFloat(totalCat as string).toLocaleString()} ({Math.round(pct)}%)</span>
                          </div>
                          <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'var(--card-hover)', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: cat === 'inventory' ? '#6366f1' : cat === 'marketing' ? '#ec4899' : cat === 'operations' ? '#3b82f6' : '#10b981', borderRadius: 3 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {isAddExpenseOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setIsAddExpenseOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)' }} />
          <div className="card animate-scale-in" style={{ position: 'relative', width: '100%', maxWidth: 460, padding: 28, zIndex: 10 }}>

            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="modal-header-icon" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}><Receipt size={16} /></span>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900, lineHeight: 1 }}>Log Business Expense</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Track spending for profit calculations</p>
                </div>
              </div>
              <button onClick={() => setIsAddExpenseOpen(false)} className="modal-close-btn clickable"><X size={16} /></button>
            </div>

            <form onSubmit={handleSubmitExpense} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="field-group">
                  <label className="form-label">Amount ({store?.currency_code}) <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input type="number" step="0.01" min="0.01" value={newExpense.amount} onChange={(e: any) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))} required className="form-control" placeholder="0.00" />
                </div>
                <div className="field-group">
                  <label className="form-label">Date Incurred <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input type="date" value={newExpense.incurred_at} onChange={(e: any) => setNewExpense(prev => ({ ...prev, incurred_at: e.target.value }))} required className="form-control" />
                </div>
              </div>

              <div className="field-group">
                <label className="form-label">Category <span style={{ color: 'var(--danger)' }}>*</span></label>
                <SearchableSelect
                  value={newExpense.category}
                  onChange={val => setNewExpense(prev => ({ ...prev, category: val }))}
                  options={[
                    { value: 'inventory', label: 'Inventory / Product Sourcing', sublabel: 'Goods purchased for resale' },
                    { value: 'marketing', label: 'Marketing & Ads', sublabel: 'Paid promotions, social media ads' },
                    { value: 'operations', label: 'Operations & Utilities', sublabel: 'Rent, power, internet, tools' },
                    { value: 'staff', label: 'Staff Wages', sublabel: 'Salaries, commissions, bonuses' },
                    { value: 'miscellaneous', label: 'Miscellaneous', sublabel: 'Other business costs' },
                  ]}
                  placeholder="Select a category"
                />
              </div>

              <div className="field-group">
                <label className="form-label">Description / Note</label>
                <textarea value={newExpense.description} onChange={(e: any) => setNewExpense(prev => ({ ...prev, description: e.target.value }))} className="form-control" placeholder="e.g. Paid for Facebook ads campaign" style={{ height: 72 }} />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsAddExpenseOpen(false)} className="btn btn-outline clickable">Cancel</button>
                <button type="submit" className="btn btn-primary clickable">Log Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
