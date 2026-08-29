'use client';

import React, { useState } from 'react';
import { 
  PublicSiteNav, 
  PublicSiteFooter 
} from '@/components/PublicSiteChrome';
import { 
  FileText, 
  TrendingUp, 
  DollarSign, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  PieChart, 
  Calculator, 
  Plus, 
  Sparkles, 
  Download, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronDown, 
  Star, 
  Lock
} from 'lucide-react';

interface LedgerItem {
  id: string;
  type: 'income' | 'expense';
  title: string;
  category: string;
  amount: number;
  date: string;
  status: 'Completed' | 'Pending';
}

const INITIAL_LEDGER: LedgerItem[] = [
  { id: '1', type: 'income', title: 'Order #1084 - Silk Satin Wrap Dress', category: 'Sales', amount: 28500, date: 'Today, 14:15', status: 'Completed' },
  { id: '2', type: 'expense', title: 'Inventory Restock - Fabrics Supply', category: 'COGS', amount: 85000, date: 'Today, 11:30', status: 'Completed' },
  { id: '3', type: 'income', title: 'Order #1083 - Leather Tote Bag', category: 'Sales', amount: 18000, date: 'Yesterday, 18:40', status: 'Completed' },
  { id: '4', type: 'expense', title: 'Instagram Feed Sponsored Ad', category: 'Marketing', amount: 15000, date: 'Yesterday, 09:15', status: 'Completed' },
  { id: '5', type: 'income', title: 'Order #1082 - 3x Linen Shirts', category: 'Sales', amount: 43500, date: '2 days ago', status: 'Completed' }
];

const COMPARISON_ROWS = [
  { feature: 'Order Sales Logging', frontstore: 'Automated 1-Click Sync', notebook: 'Manual Pen & Paper', excel: 'Manual Typing / Formula Errors' },
  { feature: 'Net Profit Calculation', frontstore: 'Real-Time Instant', notebook: 'Late Night Mental Math', excel: 'Complex Formula Setup' },
  { feature: 'Customer Credit & Debts', frontstore: 'Automated WhatsApp Triggers', notebook: 'Easy to forget or lose page', excel: 'No automated reminders' },
  { feature: 'Expense Categorization', frontstore: 'Smart Tags (COGS, Ads, Rent)', notebook: 'Unorganized Lists', excel: 'Requires custom columns' },
  { feature: 'Export Financial PDF Report', frontstore: '1-Click Official PDF', notebook: 'Impossible', excel: 'Manual formatting required' },
  { feature: 'Data Backup & Security', frontstore: 'Encrypted Cloud Backup', notebook: 'Risk of physical loss', excel: 'Local drive crash risk' }
];

const TESTIMONIALS = [
  {
    name: 'Chidi Nwosu',
    store: 'Apex Footwear & Leather',
    category: 'Footwear Retailer',
    result: '100% Tax Clarity',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    text: 'I used to lose thousands of Naira to unrecorded supplier restocks and credit sales. Frontstore automatically logs every store transaction and gives me exact net profit figures every single evening.'
  },
  {
    name: 'Blessing Adebayo',
    store: 'Glow Skincare Studio',
    category: 'Beauty & Cosmetics',
    result: 'Recovered ₦850k Debts',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    text: 'The customer debt tracker with automated WhatsApp reminders is a lifesaver. Customers who owed money for months settled within days after receiving automated professional reminders!'
  },
  {
    name: 'Tariq Hassan',
    store: 'Spice & Herb Kitchen',
    category: 'Food & Catering',
    result: 'Saved 12 hrs/wk',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    text: 'No more spending Sunday nights balancing spreadsheets. My sales, delivery fees, and ingredient expenses are separated cleanly. My accountant loves Frontstore export PDFs!'
  }
];

const FAQS = [
  {
    q: 'How does Frontstore automatically log sales into my record keeping?',
    a: 'Whenever an order is paid or marked as completed on your Frontstore storefront, the revenue, product cost, and customer details instantly flow into your income ledger without requiring manual data entry.'
  },
  {
    q: 'Can I add manual expenses like store rent, electricity, or staff wages?',
    a: 'Yes! You can add custom expenses in 5 seconds by picking a category (Rent, Logistics, Marketing, Salaries, COGS) and entering the amount.'
  },
  {
    q: 'How does the Customer Debt & Credit tracker work?',
    a: 'If a customer buys on credit or makes partial payment, you can record the balance owed under Customer Receivables. Frontstore lets you trigger professional WhatsApp reminders with payment links in 1 click.'
  },
  {
    q: 'Can I export reports for my tax filing or bank loan applications?',
    a: 'Absolutely. You can export complete Profit & Loss Statements, Revenue Summaries, and Expense Breakdowns as official PDF or CSV files anytime.'
  },
  {
    q: 'Is my business financial data secure and private?',
    a: 'Yes! All financial records are encrypted using bank-grade AES-256 protocols and stored on secure cloud servers with automated daily backups.'
  }
];

export default function RecordKeepingClient() {
  const [ledger, setLedger] = useState<LedgerItem[]>(INITIAL_LEDGER);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemType, setNewItemType] = useState<'income' | 'expense'>('income');

  // Profit Calculator State
  const [calcSales, setCalcSales] = useState<number>(1200000);
  const [calcCogs, setCalcCogs] = useState<number>(480000);
  const [calcExpenses, setCalcExpenses] = useState<number>(180000);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Computed Ledger Stats
  const totalIncome = ledger.filter(i => i.type === 'income').reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = ledger.filter(i => i.type === 'expense').reduce((sum, i) => sum + i.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const profitMarginPercent = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';

  // Calculator Computations
  const grossProfitCalc = calcSales - calcCogs;
  const netProfitCalc = calcSales - calcCogs - calcExpenses;
  const netMarginCalcPercent = calcSales > 0 ? ((netProfitCalc / calcSales) * 100).toFixed(1) : '0';

  const handleAddLedgerItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle || !newItemAmount) return;
    const numAmount = parseFloat(newItemAmount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const item: LedgerItem = {
      id: Date.now().toString(),
      type: newItemType,
      title: newItemTitle,
      category: newItemType === 'income' ? 'Sales' : 'Expense',
      amount: numAmount,
      date: 'Just now',
      status: 'Completed'
    };

    setLedger([item, ...ledger]);
    setNewItemTitle('');
    setNewItemAmount('');
  };

  return (
    <div style={{ background: '#FFFFFF', color: '#111827', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', overflowX: 'hidden' }}>
      
      {/* ── HERO BANNER (SIGNATURE DEEP ROYAL INDIGO) ── */}
      <section style={{ background: 'linear-gradient(135deg, #021C11 0%, #042A19 50%, #074328 100%)', color: '#FFFFFF', paddingTop: 0, paddingBottom: 64, position: 'relative' }}>
        
        <PublicSiteNav />

        <div style={{ maxWidth: 1040, padding: '40px 24px 0', margin: '0 auto', textAlign: 'center' }}>
          
          {/* Announcement Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(252, 165, 165, 0.3)',
            padding: '6px 18px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
            color: '#FCA5A5',
            marginBottom: 24
          }}>
            <FileText size={15} style={{ color: '#F87171' }} />
            <span>Automated Bookkeeping & Ledger Suite</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(34px, 5vw, 62px)', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.03em', margin: '0 auto 20px', color: '#FFFFFF' }}>
            Master Your Business Finances <br />
            <span style={{ color: '#FCA5A5' }}>Without the Stress</span>
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: 'clamp(16px, 2vw, 19px)', color: '#CBD5E1', maxWidth: 740, margin: '0 auto 36px', lineHeight: 1.6, fontWeight: 400 }}>
            Say goodbye to lost paper notebooks, messy spreadsheets, and mixed personal funds. Automatically log online sales, track operating expenses, calculate real-time net profits, and collect customer debts.
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginBottom: 50 }}>
            
            <a href="/signup" style={{ 
              background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)', 
              color: '#FFFFFF', 
              fontWeight: 700, 
              fontSize: 15, 
              padding: '14px 32px', 
              borderRadius: 999, 
              textDecoration: 'none', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 8, 
              boxShadow: '0 8px 24px rgba(220, 38, 38, 0.4)', 
              transition: 'all 0.2s ease'
            }}>
              <span>Start Bookkeeping Free</span>
              <ArrowRight size={16} />
            </a>

            <a href="#profit-calculator" style={{ 
              background: '#FFFFFF', 
              color: '#042A19', 
              fontWeight: 700, 
              fontSize: 15, 
              padding: '14px 28px', 
              borderRadius: 999, 
              textDecoration: 'none', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 8, 
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)', 
              transition: 'all 0.2s ease'
            }}>
              <span>Try Profit Calculator</span>
              <Calculator size={16} />
            </a>

          </div>

          {/* Micro Trust Indicators */}
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', color: '#94A3B8', fontSize: 13, fontWeight: 500 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} style={{ color: '#34D399' }} />
              <span>Auto-Synced Store Sales</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} style={{ color: '#34D399' }} />
              <span>Customer Debt Reminders</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} style={{ color: '#34D399' }} />
              <span>1-Click PDF Report Export</span>
            </div>
          </div>

        </div>

      </section>

      {/* ── INTERACTIVE LIVE BOOKKEEPING LEDGER SIMULATOR ── */}
      <section style={{ padding: '60px 24px', maxWidth: 1100, margin: '0 auto' }}>
        
        <div style={{ 
          background: '#FFFFFF', 
          border: '1px solid #E5E7EB', 
          borderRadius: 24, 
          padding: '36px 28px', 
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)'
        }}>
          
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: '#DC2626', textTransform: 'uppercase' }}>INTERACTIVE PREVIEW</span>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, marginTop: 4, color: '#111827' }}>
              Live Financial Dashboard & Bookkeeping Ledger
            </h2>
            <p style={{ color: '#4B5563', fontSize: 15, maxWidth: 600, margin: '6px auto 0' }}>
              Test adding a sample income or expense entry to watch real-time profit calculations.
            </p>
          </div>

          {/* Real-time Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
            
            {/* Total Revenue */}
            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 16, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#065F46' }}>Total Revenue</span>
                <ArrowUpRight size={16} style={{ color: '#059669' }} />
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#064E3B' }}>₦{totalIncome.toLocaleString()}</div>
              <span style={{ fontSize: 11.5, color: '#047857', marginTop: 4, display: 'block' }}>Verified Sales Income</span>
            </div>

            {/* Total Expenses */}
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 16, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#991B1B' }}>Total Expenses</span>
                <ArrowDownRight size={16} style={{ color: '#DC2626' }} />
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#7F1D1D' }}>₦{totalExpense.toLocaleString()}</div>
              <span style={{ fontSize: 11.5, color: '#B91C1C', marginTop: 4, display: 'block' }}>COGS, Ads & Logistics</span>
            </div>

            {/* Net Profit */}
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 16, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#92400E' }}>Net Profit Margin</span>
                <span style={{ background: '#F59E0B', color: '#FFF', fontSize: 11, fontWeight: 800, padding: '2px 7px', borderRadius: 999 }}>{profitMarginPercent}%</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#78350F' }}>₦{netProfit.toLocaleString()}</div>
              <span style={{ fontSize: 11.5, color: '#B45309', marginTop: 4, display: 'block' }}>Take-Home Earnings</span>
            </div>

            {/* Debt Receivables */}
            <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 16, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#3730A3' }}>Receivables (Debts)</span>
                <Users size={16} style={{ color: '#4F46E5' }} />
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#312E81' }}>₦145,000</div>
              <span style={{ fontSize: 11.5, color: '#4338CA', marginTop: 4, display: 'block' }}>3 Customers Pending</span>
            </div>

          </div>

          {/* Form Bar */}
          <form onSubmit={handleAddLedgerItem} style={{ background: '#FAFAFA', border: '1px solid #E5E7EB', borderRadius: 16, padding: 16, marginBottom: 24 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 10 }}>+ Add Test Ledger Entry</span>
            
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <select 
                value={newItemType} 
                onChange={(e) => setNewItemType(e.target.value as 'income' | 'expense')}
                style={{ background: '#FFFFFF', color: '#111827', border: '1px solid #D1D5DB', borderRadius: 8, padding: '8px 12px', fontSize: 13.5, fontWeight: 600, outline: 'none' }}
              >
                <option value="income">🟢 Income (+)</option>
                <option value="expense">🔴 Expense (-)</option>
              </select>

              <input 
                type="text" 
                placeholder="Description (e.g. Fabric Restock / Order #1085)" 
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                style={{ flex: 1, minWidth: 180, background: '#FFFFFF', color: '#111827', border: '1px solid #D1D5DB', borderRadius: 8, padding: '8px 12px', fontSize: 13.5, outline: 'none' }}
              />

              <input 
                type="number" 
                placeholder="Amount (₦)" 
                value={newItemAmount}
                onChange={(e) => setNewItemAmount(e.target.value)}
                style={{ width: 130, background: '#FFFFFF', color: '#111827', border: '1px solid #D1D5DB', borderRadius: 8, padding: '8px 12px', fontSize: 13.5, outline: 'none' }}
              />

              <button 
                type="submit"
                style={{ background: '#DC2626', color: '#FFF', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Plus size={15} />
                <span>Add Entry</span>
              </button>
            </div>
          </form>

          {/* Ledger Table */}
          <div style={{ background: '#FFFFFF', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <div style={{ padding: '12px 18px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#374151', margin: 0 }}>Recent Financial Transactions</h4>
              <span style={{ fontSize: 12, color: '#16A34A', fontWeight: 600 }}>Cloud Ledger</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {ledger.map((item) => (
                <div 
                  key={item.id}
                  style={{ 
                    padding: '12px 18px', 
                    borderBottom: '1px solid #F3F4F6', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 10
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: 8, 
                      background: item.type === 'income' ? '#DCFCE7' : '#FEE2E2',
                      color: item.type === 'income' ? '#15803D' : '#B91C1C',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {item.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    </div>

                    <div>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', display: 'block' }}>{item.title}</span>
                      <span style={{ fontSize: 11.5, color: '#6B7280' }}>{item.category} • {item.date}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: item.type === 'income' ? '#16A34A' : '#DC2626', display: 'block' }}>
                      {item.type === 'income' ? '+' : '-'}₦{item.amount.toLocaleString()}
                    </span>
                    <span style={{ fontSize: 11, background: '#F3F4F6', color: '#4B5563', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                      {item.status}
                    </span>
                  </div>

                </div>
              ))}
            </div>

          </div>

        </div>

      </section>

      {/* ── PROFIT CALCULATOR TOOL ── */}
      <section id="profit-calculator" style={{ padding: '60px 24px', maxWidth: 1040, margin: '0 auto' }}>
        
        <div style={{ 
          background: '#FAFAFA', 
          border: '1px solid #E5E7EB', 
          borderRadius: 24, 
          padding: '36px 28px'
        }}>
          
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#0B5D39', letterSpacing: '0.08em', textTransform: 'uppercase' }}>FINANCIAL CALCULATOR</span>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 800, color: '#111827', marginTop: 4 }}>
              Profit & Loss Margin Calculator
            </h2>
            <p style={{ color: '#4B5563', fontSize: 14.5, maxWidth: 540, margin: '6px auto 0' }}>
              Adjust sales revenue, inventory COGS, and expenses to view your net margin.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, alignItems: 'center' }}>
            
            {/* Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                  Monthly Sales Revenue (₦)
                </label>
                <input 
                  type="number" 
                  value={calcSales} 
                  onChange={(e) => setCalcSales(Math.max(0, parseFloat(e.target.value) || 0))}
                  style={{ width: '100%', background: '#FFFFFF', color: '#16A34A', border: '1px solid #D1D5DB', borderRadius: 10, padding: '10px 14px', fontSize: 15, fontWeight: 800, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                  Cost of Goods Sold / COGS (₦)
                </label>
                <input 
                  type="number" 
                  value={calcCogs} 
                  onChange={(e) => setCalcCogs(Math.max(0, parseFloat(e.target.value) || 0))}
                  style={{ width: '100%', background: '#FFFFFF', color: '#DC2626', border: '1px solid #D1D5DB', borderRadius: 10, padding: '10px 14px', fontSize: 15, fontWeight: 800, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                  Operating Expenses (Ads, Rent, Shipping) (₦)
                </label>
                <input 
                  type="number" 
                  value={calcExpenses} 
                  onChange={(e) => setCalcExpenses(Math.max(0, parseFloat(e.target.value) || 0))}
                  style={{ width: '100%', background: '#FFFFFF', color: '#D97706', border: '1px solid #D1D5DB', borderRadius: 10, padding: '10px 14px', fontSize: 15, fontWeight: 800, outline: 'none' }}
                />
              </div>

            </div>

            {/* Output Box */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 18, padding: 24, textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>ESTIMATED NET MONTHLY PROFIT</span>
              
              <div style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: netProfitCalc >= 0 ? '#16A34A' : '#DC2626', margin: '8px 0' }}>
                ₦{netProfitCalc.toLocaleString()}
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: netProfitCalc >= 0 ? '#DCFCE7' : '#FEE2E2', color: netProfitCalc >= 0 ? '#15803D' : '#B91C1C', padding: '4px 14px', borderRadius: 999, fontSize: 13, fontWeight: 800, marginBottom: 20 }}>
                <span>Net Profit Margin: {netMarginCalcPercent}%</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left', borderTop: '1px solid #F3F4F6', paddingTop: 14, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280' }}>
                  <span>Gross Profit (Revenue - COGS):</span>
                  <span style={{ color: '#111827', fontWeight: 700 }}>₦{grossProfitCalc.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280' }}>
                  <span>Operating Expenses:</span>
                  <span style={{ color: '#DC2626', fontWeight: 700 }}>-₦{calcExpenses.toLocaleString()}</span>
                </div>
              </div>

              <a href="/signup" style={{ background: '#DC2626', color: '#FFF', fontSize: 13.5, fontWeight: 700, padding: '10px 20px', borderRadius: 10, textDecoration: 'none', display: 'inline-block', width: '100%', marginTop: 20, textAlign: 'center' }}>
                Automate Ledger in Frontstore
              </a>
            </div>

          </div>

        </div>

      </section>

      {/* ── 6 CORE FINANCIAL PILLARS GRID ── */}
      <section style={{ padding: '60px 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: '#DC2626', textTransform: 'uppercase' }}>FINANCIAL ENGINE</span>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 800, color: '#111827', marginTop: 4 }}>
            Complete Bookkeeping Automation
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 18, padding: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: 18 }}>
              <TrendingUp size={22} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Auto-Synced Store Sales</h3>
            <p style={{ color: '#4B5563', fontSize: 14, lineHeight: 1.6 }}>
              Every completed order on your store populates into your ledger as verified income without manual data entry.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 18, padding: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', marginBottom: 18 }}>
              <PieChart size={22} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Expense Categorization</h3>
            <p style={{ color: '#4B5563', fontSize: 14, lineHeight: 1.6 }}>
              Categorize inventory restocks, shipping fees, ads, rent, and software subscriptions with visual cost charts.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 18, padding: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', marginBottom: 18 }}>
              <Users size={22} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Customer Debt Reminders</h3>
            <p style={{ color: '#4B5563', fontSize: 14, lineHeight: 1.6 }}>
              Record customer credit balances and trigger automated WhatsApp payment reminder links in 1 click.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 18, padding: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', marginBottom: 18 }}>
              <Download size={22} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 8 }}>1-Click Financial PDF Export</h3>
            <p style={{ color: '#4B5563', fontSize: 14, lineHeight: 1.6 }}>
              Download official Profit & Loss Statements, Revenue Summaries, and Tax reports as clean PDF or CSV files.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 18, padding: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', marginBottom: 18 }}>
              <DollarSign size={22} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Multi-Currency Accounts</h3>
            <p style={{ color: '#4B5563', fontSize: 14, lineHeight: 1.6 }}>
              Track earnings and expenses seamlessly in NGN, GHS, KES, ZAR, and USD with automatic conversion rates.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 18, padding: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EDF7F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0B5D39', marginBottom: 18 }}>
              <Lock size={22} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Bank-Grade Cloud Security</h3>
            <p style={{ color: '#4B5563', fontSize: 14, lineHeight: 1.6 }}>
              All financial data is encrypted with AES-256 protocols and safely backed up to high-security servers daily.
            </p>
          </div>

        </div>

      </section>

      {/* ── COMPARISON TABLE ── */}
      <section style={{ padding: '60px 24px', maxWidth: 1040, margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: '#DC2626', textTransform: 'uppercase' }}>COMPARISON MATRIX</span>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 800, color: '#111827', marginTop: 4 }}>
            Frontstore vs. Paper & Excel
          </h2>
        </div>

        <div style={{ overflowX: 'auto', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '16px 20px', color: '#6B7280', fontSize: 13, fontWeight: 700 }}>Feature</th>
                <th style={{ padding: '16px 20px', color: '#DC2626', fontSize: 14, fontWeight: 900, background: '#FEF2F2' }}>Frontstore</th>
                <th style={{ padding: '16px 20px', color: '#374151', fontSize: 13, fontWeight: 700 }}>Paper Notebook</th>
                <th style={{ padding: '16px 20px', color: '#374151', fontSize: 13, fontWeight: 700 }}>Excel / QuickBooks</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '14px 20px', color: '#111827', fontSize: 13.5, fontWeight: 600 }}>{row.feature}</td>
                  <td style={{ padding: '14px 20px', color: '#16A34A', fontSize: 13.5, fontWeight: 800, background: '#F0FDF4' }}>{row.frontstore}</td>
                  <td style={{ padding: '14px 20px', color: '#6B7280', fontSize: 13.5 }}>{row.notebook}</td>
                  <td style={{ padding: '14px 20px', color: '#6B7280', fontSize: 13.5 }}>{row.excel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '60px 24px', maxWidth: 1100, margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: '#16A34A', textTransform: 'uppercase' }}>SELLER SUCCESS STORIES</span>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, color: '#111827', marginTop: 4 }}>
            Trusted by Business Owners Across Africa
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} style={{ 
              background: '#FFFFFF', 
              border: '1px solid #E5E7EB', 
              borderRadius: 18, 
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <div>
                <div style={{ display: 'flex', gap: 4, color: '#F59E0B', marginBottom: 14 }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={15} fill="#F59E0B" />)}
                </div>
                <p style={{ color: '#374151', fontSize: 14, lineHeight: 1.6, fontStyle: 'italic', marginBottom: 18 }}>
                  "{t.text}"
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F3F4F6', paddingTop: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={t.avatar} alt={t.name} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <h5 style={{ fontSize: 14, fontWeight: 800, color: '#111827', margin: 0 }}>{t.name}</h5>
                    <span style={{ fontSize: 12, color: '#6B7280' }}>{t.store}</span>
                  </div>
                </div>
                <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: 12, fontWeight: 800, padding: '3px 8px', borderRadius: 6 }}>
                  {t.result}
                </span>
              </div>

            </div>
          ))}
        </div>

      </section>

      {/* ── FAQ ACCORDION ── */}
      <section style={{ padding: '60px 24px', maxWidth: 800, margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 800, color: '#111827' }}>
            Bookkeeping & Ledger FAQs
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div 
                key={index} 
                style={{ 
                  background: '#FFFFFF', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: 14, 
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: 'transparent',
                    border: 'none',
                    color: '#111827',
                    fontSize: 15,
                    fontWeight: 700,
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={18} style={{ color: '#DC2626', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                </button>

                {isOpen && (
                  <div style={{ padding: '0 20px 16px', color: '#4B5563', fontSize: 14, lineHeight: 1.6, borderTop: '1px solid #F3F4F6', paddingTop: 12 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </section>

      {/* ── BOTTOM CTA BANNER ── */}
      <section style={{ padding: '40px 24px 80px', maxWidth: 1040, margin: '0 auto' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 50%, #B91C1C 100%)', 
          borderRadius: 24, 
          padding: '50px 32px', 
          textAlign: 'center',
          color: '#FFFFFF'
        }}>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900, color: '#FFF', margin: '0 0 14px' }}>
            Take Charge of Your Business Profits
          </h2>
          <p style={{ color: '#FCA5A5', fontSize: 16, maxWidth: 580, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Automate your bookkeeping, track customer credit, and view real-time net profit margins with Frontstore.
          </p>

          <a href="/signup" style={{ 
            background: '#FFFFFF', 
            color: '#7F1D1D', 
            fontSize: 16, 
            fontWeight: 800, 
            padding: '14px 36px', 
            borderRadius: 999, 
            textDecoration: 'none', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 8, 
            boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
          }}>
            <span>Start Free Bookkeeping</span>
            <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <PublicSiteFooter />

    </div>
  );
}
