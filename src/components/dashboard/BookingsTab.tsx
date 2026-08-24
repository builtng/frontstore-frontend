'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Ticket, RefreshCw, Loader2, Calendar, Phone, CheckCircle2, X } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

export default function BookingsTab() {
  const apiUrl = getApiUrl();

  const [ticketCheckInCode, setTicketCheckInCode] = useState('');
  const [ticketCheckInLoading, setTicketCheckInLoading] = useState(false);
  const [ticketCheckInResult, setTicketCheckInResult] = useState<{ success: boolean; message: string } | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketSearchQuery, setTicketSearchQuery] = useState('');

  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingActionId, setBookingActionId] = useState<string | null>(null);

  const fetchTicketsData = async (q?: string) => {
    try {
      setTicketsLoading(true);
      const query = q ? `?q=${encodeURIComponent(q)}` : '';
      const res = await fetch(`${apiUrl}/v1/tickets${query}`, { credentials: 'include' });
      const json = await res.json();
      if (res.ok) {
        setTickets(json.data?.data || json.data || []);
      } else {
        toast.error(json.message || 'Failed to load tickets.');
      }
    } catch (e) {
      toast.error('Failed to load tickets.');
    } finally {
      setTicketsLoading(false);
    }
  };

  const fetchBookingsData = async () => {
    try {
      setBookingsLoading(true);
      const res = await fetch(`${apiUrl}/v1/bookings`, { credentials: 'include' });
      const json = await res.json();
      if (res.ok) setBookings(json.data?.data || json.data || []);
      else toast.error(json.message || 'Failed to load bookings.');
    } catch { toast.error('Network error.'); }
    finally { setBookingsLoading(false); }
  };

  useEffect(() => {
    fetchTicketsData();
    fetchBookingsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }} className="animate-fade-in">
      <div className="card animate-fade-in" style={{ padding: 28, marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Ticket size={18} style={{ color: 'var(--primary)' }} /> Ticket Check-In
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>Enter or scan the code shown on a customer's ticket to check them in at the door.</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!ticketCheckInCode.trim()) return;
            try {
              setTicketCheckInLoading(true);
              setTicketCheckInResult(null);
              const res = await fetch(`${apiUrl}/v1/tickets/check-in`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ check_in_code: ticketCheckInCode.trim() }),
              });
              const json = await res.json();
              setTicketCheckInResult({ success: res.ok, message: json.message || (res.ok ? 'Checked in.' : 'Check-in failed.') });
              if (res.ok) {
                setTicketCheckInCode('');
                fetchTicketsData(ticketSearchQuery);
              }
            } catch {
              setTicketCheckInResult({ success: false, message: 'Network error.' });
            } finally {
              setTicketCheckInLoading(false);
            }
          }}
          style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}
        >
          <input
            type="text"
            value={ticketCheckInCode}
            onChange={e => setTicketCheckInCode(e.target.value)}
            placeholder="e.g. TKT-A1B2C3D4"
            className="input-field"
            style={{ flex: 1, minWidth: 220 }}
          />
          <button type="submit" disabled={ticketCheckInLoading || !ticketCheckInCode.trim()} className="btn btn-primary clickable" style={{ padding: '10px 20px' }}>
            {ticketCheckInLoading ? <Loader2 size={16} className="spin" /> : 'Check In'}
          </button>
        </form>
        {ticketCheckInResult && (
          <p style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: ticketCheckInResult.success ? 'var(--primary)' : '#dc2626' }}>
            {ticketCheckInResult.message}
          </p>
        )}
      </div>

      <div className="card animate-fade-in" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Ticket size={18} style={{ color: 'var(--primary)' }} /> Issued Tickets
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Everyone who has bought a ticket to one of your events.</p>
          </div>
          <button
            onClick={() => fetchTicketsData(ticketSearchQuery)}
            className="btn btn-outline clickable"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, padding: '9px 18px' }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); fetchTicketsData(ticketSearchQuery); }}
          style={{ marginBottom: 16 }}
        >
          <input
            type="text"
            value={ticketSearchQuery}
            onChange={e => setTicketSearchQuery(e.target.value)}
            placeholder="Search by ticket code or customer name…"
            className="input-field"
            style={{ width: '100%' }}
          />
        </form>

        {ticketsLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <Loader2 size={28} className="spin" style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 13 }}>Loading tickets…</p>
          </div>
        ) : tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: 64, height: 64, borderRadius: '50%', background: 'var(--surface-2)', color: 'var(--text-faint)', marginBottom: 16 }}>
              <Ticket size={28} strokeWidth={1.25} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No tickets issued yet</h3>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', maxWidth: 300, margin: '0 auto', lineHeight: 1.5 }}>
              Tickets appear here once a customer pays for an event product. Click Refresh to load.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tickets.map((ticket: any) => {
              const isCheckedIn = !!ticket.checked_in_at;
              const isPaid = ticket.order?.payment_status === 'paid';
              const statusColor = isCheckedIn ? 'var(--primary)' : '#f59e0b';
              const statusBg = isCheckedIn ? 'var(--primary-light)' : 'rgba(245,158,11,0.1)';

              return (
                <div key={ticket.id} style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  padding: '16px 20px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 12,
                  alignItems: 'flex-start',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 'var(--r-full)', background: statusBg, color: statusColor, border: `1px solid ${statusColor}22` }}>
                        {isCheckedIn ? 'CHECKED IN' : 'NOT CHECKED IN'}
                      </span>
                      <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-faint)' }}>{ticket.check_in_code}</span>
                    </div>
                    <p style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text)', margin: '2px 0' }}>
                      {ticket.order?.customer_name || 'Customer'}
                    </p>
                    <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0 }}>
                      {ticket.product?.name || 'Event ticket'}
                    </p>
                    {!isPaid && (
                      <p style={{ fontSize: 12, color: '#dc2626', marginTop: 4, fontWeight: 700 }}>Not paid yet</p>
                    )}
                  </div>
                  {!isCheckedIn && isPaid && (
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(`${apiUrl}/v1/tickets/check-in`, {
                            method: 'POST',
                            credentials: 'include',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ check_in_code: ticket.check_in_code }),
                          });
                          const json = await res.json();
                          if (res.ok) {
                            toast.success(json.message || 'Checked in.');
                            fetchTicketsData(ticketSearchQuery);
                          } else {
                            toast.error(json.message || 'Check-in failed.');
                          }
                        } catch {
                          toast.error('Network error.');
                        }
                      }}
                      className="btn btn-primary clickable"
                      style={{ fontSize: 12.5, padding: '8px 16px' }}
                    >
                      Check In
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card animate-fade-in" style={{ padding: 28 }}>
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={20} style={{ color: 'var(--primary)' }} /> Bookings
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>All service bookings made by customers on your storefront.</p>
          </div>
          <button
            onClick={fetchBookingsData}
            className="btn btn-outline clickable"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, padding: '9px 18px' }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {bookingsLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <Loader2 size={28} className="spin" style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 13 }}>Loading bookings…</p>
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: 64, height: 64, borderRadius: '50%', background: 'var(--surface-2)', color: 'var(--text-faint)', marginBottom: 16 }}>
              <Calendar size={28} strokeWidth={1.25} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No bookings yet</h3>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', maxWidth: 300, margin: '0 auto', lineHeight: 1.5 }}>
              Customers who book your services will appear here. Click Refresh to load.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bookings.map((booking: any) => {
              const isPending = booking.status === 'pending';
              const isConfirmed = booking.status === 'confirmed';
              const isCancelled = booking.status === 'cancelled';
              const statusColor = isPending ? '#f59e0b' : isConfirmed ? 'var(--primary)' : 'var(--text-faint)';
              const statusBg = isPending ? 'rgba(245,158,11,0.1)' : isConfirmed ? 'var(--primary-light)' : 'var(--surface-2)';

              return (
                <div key={booking.id} style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  padding: '16px 20px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 12,
                  alignItems: 'flex-start',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 'var(--r-full)', background: statusBg, color: statusColor, border: `1px solid ${statusColor}22` }}>
                        {(booking.status || 'pending').toUpperCase()}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>#{booking.id?.slice(0, 8) || '—'}</span>
                    </div>
                    <p style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text)', margin: '2px 0' }}>
                      {booking.customer_name || 'Customer'}
                    </p>
                    <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0 }}>
                      {booking.service_name || booking.product_name || 'Service'}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>
                      <Calendar size={11} style={{ display: 'inline', marginRight: 4 }} />
                      {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      {booking.start_time ? `  ·  ${booking.start_time}` : ''}
                      {booking.end_time ? ` – ${booking.end_time}` : ''}
                    </p>
                    {booking.customer_phone && (
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        <Phone size={11} style={{ display: 'inline', marginRight: 4 }} />{booking.customer_phone}
                      </p>
                    )}
                  </div>

                  {!isCancelled && (
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      {isPending && (
                        <button
                          disabled={bookingActionId === booking.id}
                          onClick={async () => {
                            try {
                              setBookingActionId(booking.id);
                              const res = await fetch(`${apiUrl}/v1/bookings/${booking.id}/confirm`, {
                                method: 'POST',
                                credentials: 'include',
                              });
                              const json = await res.json();
                              if (!res.ok) throw new Error(json.message || 'Failed.');
                              setBookings(prev => prev.map((b: any) => b.id === booking.id ? { ...b, status: 'confirmed' } : b));
                              toast.success('Booking confirmed!');
                            } catch (err: any) { toast.error(err.message); }
                            finally { setBookingActionId(null); }
                          }}
                          className="btn btn-primary clickable"
                          style={{ fontSize: 12, fontWeight: 700, padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                        >
                          {bookingActionId === booking.id ? <Loader2 size={12} className="spin" /> : <CheckCircle2 size={12} />}
                          Confirm
                        </button>
                      )}
                      <button
                        disabled={bookingActionId === booking.id}
                        onClick={async () => {
                          try {
                            setBookingActionId(booking.id);
                            const res = await fetch(`${apiUrl}/v1/bookings/${booking.id}/cancel`, {
                              method: 'POST',
                              credentials: 'include',
                            });
                            const json = await res.json();
                            if (!res.ok) throw new Error(json.message || 'Failed.');
                            setBookings(prev => prev.map((b: any) => b.id === booking.id ? { ...b, status: 'cancelled' } : b));
                            toast.success('Booking cancelled.');
                          } catch (err: any) { toast.error(err.message); }
                          finally { setBookingActionId(null); }
                        }}
                        className="btn btn-outline clickable"
                        style={{ fontSize: 12, fontWeight: 700, padding: '8px 14px', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.25)', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                      >
                        {bookingActionId === booking.id ? <Loader2 size={12} className="spin" /> : <X size={12} />}
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
