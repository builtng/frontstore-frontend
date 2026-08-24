'use client';

import React from 'react';
import { Users, Zap, Loader2, X } from 'lucide-react';
import { getCurrencySymbol } from '@/utils/currency';
import type { StoreInfo } from '@/types/dashboard';

interface CustomersTabProps {
  isPro: boolean;
  openUpgradePrompt: (title: string, description: string) => void;
  store: StoreInfo | null;
  customers: any[];
  customersLoading: boolean;
  expandedCustomerId: any;
  setExpandedCustomerId: (id: any) => void;
  customerNotes: Record<string | number, any[]>;
  customerNotesLoading: boolean;
  fetchCustomerNotes: (id: any) => void;
  newCustomerTag: string;
  setNewCustomerTag: (tag: string) => void;
  handleAddCustomerTag: (id: any, tags: string[]) => void;
  handleRemoveCustomerTag: (id: any, tags: string[], tag: string) => void;
  customerTagSaving: any;
  newCustomerNote: string;
  setNewCustomerNote: (note: string) => void;
  handleAddCustomerNote: (id: any) => void;
}

export default function CustomersTab({
  isPro,
  openUpgradePrompt,
  store,
  customers,
  customersLoading,
  expandedCustomerId,
  setExpandedCustomerId,
  customerNotes,
  customerNotesLoading,
  fetchCustomerNotes,
  newCustomerTag,
  setNewCustomerTag,
  handleAddCustomerTag,
  handleRemoveCustomerTag,
  customerTagSaving,
  newCustomerNote,
  setNewCustomerNote,
  handleAddCustomerNote,
}: CustomersTabProps) {
  if (!isPro) {
    return (
      <div className="card animate-fade-in" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 650, margin: '40px auto' }}>
        <div style={{ background: 'rgba(37, 211, 102, 0.15)', color: 'var(--primary)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Users size={32} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 900, marginBottom: 12 }}>
          Customer CRM & Profiles
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          Track everyone who orders from your store. Keep internal notes, tag VIP buyers, and view lifetime spend to build long-term relationships.
        </p>
        <button
          onClick={() => openUpgradePrompt(
            'Customers requires Pro',
            'The customer CRM — tags, notes, and lifetime value for every buyer — is available on Pro. You can review the plan before upgrading.'
          )}
          className="btn btn-primary clickable"
          style={{ padding: '12px 28px', fontSize: 15, fontWeight: 800, borderRadius: 'var(--r-full)', display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <Zap size={16} /> Upgrade to Pro to Unlock Customers
        </button>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in" style={{ padding: 28 }}>
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={20} style={{ color: 'var(--primary)' }} /> Customers
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Everyone who has bought from your store, with tags, notes, and lifetime value.</p>
      </div>

      {customersLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Loader2 size={28} className="spin" style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 13 }}>Loading customers…</p>
        </div>
      ) : customers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: 64, height: 64, borderRadius: '50%', background: 'var(--surface-2)', color: 'var(--text-faint)', marginBottom: 16 }}>
            <Users size={28} strokeWidth={1.25} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No customers yet</h3>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', maxWidth: 300, margin: '0 auto', lineHeight: 1.5 }}>Once someone completes a paid order, they'll show up here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {customers.map((customer) => {
            const isExpanded = expandedCustomerId === customer.id;
            const tags: string[] = customer.tags || [];
            return (
              <div key={customer.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16 }}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', cursor: 'pointer' }}
                  onClick={() => {
                    const next = isExpanded ? null : customer.id;
                    setExpandedCustomerId(next);
                    if (next && !customerNotes[customer.id]) fetchCustomerNotes(customer.id);
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14.5 }}>{customer.name || customer.phone_number}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>{customer.phone_number}{customer.email ? ` · ${customer.email}` : ''}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                      {tags.map(tag => (
                        <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, background: 'var(--primary-light)', color: 'var(--primary)', fontSize: 11, fontWeight: 700 }}>
                          {tag}
                          {isExpanded && (
                            <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveCustomerTag(customer.id, tags, tag); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--primary)', display: 'flex' }}>
                              <X size={10} />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)' }}>{getCurrencySymbol(store?.currency_code)}{Number(customer.lifetime_value || 0).toLocaleString()}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{customer.store_order_count} order{customer.store_order_count === 1 ? '' : 's'} here · LTV</div>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 14 }} className="animate-fade-in">
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Add a tag</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="text"
                          value={newCustomerTag}
                          onChange={e => setNewCustomerTag(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomerTag(customer.id, tags); } }}
                          placeholder="e.g. VIP, wholesale, complained-once"
                          className="input-field"
                          style={{ flex: 1 }}
                        />
                        <button type="button" onClick={() => handleAddCustomerTag(customer.id, tags)} disabled={customerTagSaving === customer.id} className="btn btn-outline clickable" style={{ padding: '8px 16px' }}>
                          {customerTagSaving === customer.id ? <Loader2 size={14} className="spin" /> : 'Add'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Notes</label>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                        <input
                          type="text"
                          value={newCustomerNote}
                          onChange={e => setNewCustomerNote(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomerNote(customer.id); } }}
                          placeholder="Add a note about this customer..."
                          className="input-field"
                          style={{ flex: 1 }}
                        />
                        <button type="button" onClick={() => handleAddCustomerNote(customer.id)} className="btn btn-outline clickable" style={{ padding: '8px 16px' }}>
                          Save
                        </button>
                      </div>
                      {customerNotesLoading && !customerNotes[customer.id] ? (
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading notes…</p>
                      ) : (customerNotes[customer.id] || []).length === 0 ? (
                        <p style={{ fontSize: 12, color: 'var(--text-faint)', fontStyle: 'italic' }}>No notes yet.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {(customerNotes[customer.id] || []).map((note: any) => (
                            <div key={note.id} style={{ background: 'var(--surface-2)', borderRadius: 'var(--r-md)', padding: 10 }}>
                              <p style={{ fontSize: 13, margin: 0 }}>{note.note}</p>
                              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{note.user?.name || 'You'} · {new Date(note.created_at).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
