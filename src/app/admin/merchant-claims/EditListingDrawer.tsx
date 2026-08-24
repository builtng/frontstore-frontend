'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { Field } from '../components';

interface EditableListing {
  id: string;
  name: string;
  category_key: string | null;
  category_value: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
  opening_hours: string | null;
}

interface EditListingDrawerProps {
  listing: EditableListing;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditListingDrawer({ listing, onClose, onSaved }: EditListingDrawerProps) {
  const { apiUrl, getHeaders, handleFetchResponse } = useAdmin();

  const [name, setName] = useState(listing.name || '');
  const [categoryKey, setCategoryKey] = useState(listing.category_key || '');
  const [categoryValue, setCategoryValue] = useState(listing.category_value || '');
  const [phone, setPhone] = useState(listing.phone || '');
  const [email, setEmail] = useState(listing.email || '');
  const [website, setWebsite] = useState(listing.website || '');
  const [address, setAddress] = useState(listing.address || '');
  const [city, setCity] = useState(listing.city || '');
  const [state, setState] = useState(listing.state || '');
  const [postcode, setPostcode] = useState(listing.postcode || '');
  const [openingHours, setOpeningHours] = useState(listing.opening_hours || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Business name is required.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${apiUrl}/v1/admin/frontstore-claims/${listing.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category_key: categoryKey.trim() || null,
          category_value: categoryValue.trim() || null,
          phone: phone.trim() || null,
          email: email.trim() || null,
          website: website.trim() || null,
          address: address.trim() || null,
          city: city.trim() || null,
          state: state.trim() || null,
          postcode: postcode.trim() || null,
          opening_hours: openingHours.trim() || null,
        }),
      });
      const json = await handleFetchResponse(res, 'Failed to update listing.');
      toast.success(json.message || 'Listing updated.');
      onSaved();
      onClose();
    } catch (error: any) {
      if (error.message !== 'Session expired') toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-drawer-overlay" onClick={onClose}>
      <div className="admin-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="admin-drawer__header">
          <div>
            <h2>Edit listing</h2>
            <p>Correct the source data imported from OpenStreetMap.</p>
          </div>
          <button className="admin-drawer__close" onClick={onClose} type="button">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="admin-drawer__content">
          <div className="admin-drawer__section">
            <h3>Business</h3>
            <div className="admin-drawer__grid admin-drawer__grid--cols-2">
              <Field label="Business name" value={name} onChange={setName} required />
              <Field label="Category key" value={categoryKey} onChange={setCategoryKey} placeholder="shop, amenity, office…" />
              <Field label="Category value" value={categoryValue} onChange={setCategoryValue} placeholder="supermarket, restaurant…" />
              <Field label="Opening hours" value={openingHours} onChange={setOpeningHours} placeholder="Mo-Sa 08:00-18:00" />
            </div>
          </div>

          <div className="admin-drawer__section">
            <h3>Contact</h3>
            <div className="admin-drawer__grid admin-drawer__grid--cols-2">
              <Field label="Phone" value={phone} onChange={setPhone} placeholder="+2348012345678" />
              <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="business@example.com" />
              <Field label="Website" value={website} onChange={setWebsite} placeholder="https://…" full />
            </div>
          </div>

          <div className="admin-drawer__section">
            <h3>Location</h3>
            <div className="admin-drawer__grid admin-drawer__grid--cols-2">
              <Field label="Address" value={address} onChange={setAddress} full />
              <Field label="City" value={city} onChange={setCity} />
              <Field label="State" value={state} onChange={setState} />
              <Field label="Postcode" value={postcode} onChange={setPostcode} />
            </div>
          </div>

          <button type="submit" className="admin-action" disabled={submitting} style={{ justifyContent: 'center' }}>
            {submitting ? <Loader2 size={15} className="animate-spin" /> : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
