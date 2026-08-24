'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Clock, Check, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { StoreInfo } from '@/types/dashboard';

interface AvailabilityTabProps {
  store: StoreInfo | null;
  setStore: (store: StoreInfo) => void;
}

const DEFAULT_WORKING_HOURS: Record<string, { open: string; close: string; enabled: boolean }> = {
  monday: { open: '09:00', close: '17:00', enabled: true },
  tuesday: { open: '09:00', close: '17:00', enabled: true },
  wednesday: { open: '09:00', close: '17:00', enabled: true },
  thursday: { open: '09:00', close: '17:00', enabled: true },
  friday: { open: '09:00', close: '17:00', enabled: true },
  saturday: { open: '10:00', close: '14:00', enabled: false },
  sunday: { open: '10:00', close: '14:00', enabled: false },
};
const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<string, string> = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };

export default function AvailabilityTab({ store, setStore }: AvailabilityTabProps) {
  const [workingHours, setWorkingHours] = useState<Record<string, { open: string; close: string; enabled: boolean }>>(DEFAULT_WORKING_HOURS);
  const [bookingCapacityPerDay, setBookingCapacityPerDay] = useState<number | ''>(10);
  const [availabilitySaving, setAvailabilitySaving] = useState(false);

  useEffect(() => {
    if (store?.working_hours) {
      setWorkingHours({ ...DEFAULT_WORKING_HOURS, ...store.working_hours });
    }
    if (store?.booking_capacity_per_day != null) {
      setBookingCapacityPerDay(Number(store.booking_capacity_per_day));
    }
  }, [store]);

  const handleSave = async () => {
    try {
      setAvailabilitySaving(true);
      const data = await api.put<StoreInfo>('/v1/store', {
        working_hours: workingHours,
        booking_capacity_per_day: Number(bookingCapacityPerDay) || 10,
      });
      if (data) {
        setStore(data);
        localStorage.setItem('store', JSON.stringify(data));
      }
      toast.success('Availability settings saved!');
    } catch (err: any) {
      toast.error(err.message || 'Could not save availability.');
    } finally {
      setAvailabilitySaving(false);
    }
  };

  return (
    <div className="card animate-fade-in" style={{ padding: 28 }}>
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={20} style={{ color: 'var(--primary)' }} /> Availability & Booking Settings
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Set your weekly working hours and how many bookings you accept per day.</p>
      </div>

      {/* Weekly Schedule Builder */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-2)', letterSpacing: 0.6, marginBottom: 14 }}>Weekly Schedule</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {DAYS_OF_WEEK.map(day => {
            const slot = workingHours[day] || { open: '09:00', close: '17:00', enabled: false };
            return (
              <div key={day} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                background: slot.enabled ? 'var(--surface-2)' : 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
                padding: '12px 16px',
                transition: 'background 0.2s'
              }}>
                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => setWorkingHours(prev => ({ ...prev, [day]: { ...prev[day], enabled: !slot.enabled } }))}
                  style={{
                    flexShrink: 0,
                    width: 40,
                    height: 22,
                    borderRadius: 11,
                    border: 'none',
                    background: slot.enabled ? 'var(--primary)' : 'var(--border)',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  aria-label={`Toggle ${day}`}
                >
                  <span style={{
                    position: 'absolute',
                    top: 3,
                    left: slot.enabled ? 20 : 3,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: '#fff',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                </button>

                {/* Day label */}
                <span style={{ width: 42, fontSize: 13, fontWeight: 700, color: slot.enabled ? 'var(--text)' : 'var(--text-faint)' }}>
                  {DAY_LABELS[day]}
                </span>

                {slot.enabled ? (
                  <>
                    <input
                      type="time"
                      value={slot.open}
                      onChange={e => setWorkingHours(prev => ({ ...prev, [day]: { ...prev[day], open: e.target.value } }))}
                      className="input-field"
                      style={{ width: 120, fontSize: 13, padding: '6px 10px' }}
                    />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>to</span>
                    <input
                      type="time"
                      value={slot.close}
                      onChange={e => setWorkingHours(prev => ({ ...prev, [day]: { ...prev[day], close: e.target.value } }))}
                      className="input-field"
                      style={{ width: 120, fontSize: 13, padding: '6px 10px' }}
                    />
                  </>
                ) : (
                  <span style={{ fontSize: 13, color: 'var(--text-faint)', fontStyle: 'italic' }}>Closed</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Booking Cap */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-2)', letterSpacing: 0.6, marginBottom: 6 }}>Daily Booking Capacity</h3>
        <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
          Maximum number of bookings you can accept on any single day. Once this limit is reached, that day becomes unavailable.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            type="number"
            min={1}
            max={500}
            value={bookingCapacityPerDay}
            onChange={e => setBookingCapacityPerDay(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 1))}
            className="input-field"
            style={{ width: 120, fontSize: 14 }}
            placeholder="e.g. 10"
          />
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>bookings / day</span>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={availabilitySaving}
        className="btn btn-primary clickable"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', fontSize: 14, fontWeight: 700 }}
      >
        {availabilitySaving ? <Loader2 size={16} className="spin" /> : <Check size={16} />}
        {availabilitySaving ? 'Saving…' : 'Save Availability'}
      </button>
    </div>
  );
}
