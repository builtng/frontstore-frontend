'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Star, ChevronLeft, ShieldCheck, Share2, AlertCircle, X, CheckCircle2 
} from 'lucide-react';
import { toast } from 'sonner';
import BuiltWithFrontstoreBadge from '@/components/BuiltWithFrontstoreBadge';
import { WhatsAppIcon } from '@/components/WhatsAppIcon';
import { InstagramIcon, TikTokIcon, FacebookIcon, TwitterXIcon } from '@/components/SocialIcons';
import { getColorHex } from '@/utils/colorUtils';

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  body: string;
  reply?: string;
  replied_at?: string;
  created_at?: string;
}

interface Store {
  id: string;
  username: string;
  store_name: string;
  store_bio?: string | null;
  primary_color?: string | null;
  is_verified?: boolean | number;
  whatsapp_phone?: string;
  instagram_handle?: string | null;
  tiktok_handle?: string | null;
  twitter_handle?: string | null;
  facebook_handle?: string | null;
}

interface Props {
  store: Store;
  initialReviews: Review[];
  systemDomain: string;
}

export default function StoreReviewsClient({ store, initialReviews, systemDomain }: Props) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Setup theme
  const primaryColor = getColorHex(store.primary_color) || '#0B5D39';
  useEffect(() => {
    document.documentElement.style.setProperty('--primary', primaryColor);
    document.documentElement.style.setProperty('--primary-dark', primaryColor);
    document.documentElement.style.setProperty('--brand', primaryColor);
    document.documentElement.style.setProperty('--tint', `color-mix(in srgb, ${primaryColor} 14%, white)`);
  }, [primaryColor]);

  // Derived stats
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const ratingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        counts[r.rating as keyof typeof counts]++;
      }
    });
    return counts;
  }, [reviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewRating) return;
    
    setIsSubmitting(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';

    try {
      const res = await fetch(`${API_URL}/v1/public/store/${store.username}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: newReviewName,
          rating: newReviewRating,
          comment: newReviewComment
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to submit review');
      }

      const { data } = await res.json();
      
      const newReview: Review = {
        id: data.id,
        reviewer_name: data.customer_name,
        rating: data.rating,
        body: data.comment,
        created_at: new Date().toISOString()
      };

      setReviews(prev => [newReview, ...prev]);
      setIsWriteModalOpen(false);
      toast.success('Review submitted successfully!');
      setNewReviewName('');
      setNewReviewRating(5);
      setNewReviewComment('');
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStoreHomeUrl = () => {
    if (typeof window === 'undefined') return '/';
    const host = window.location.host;
    const isMainDomain = host === 'frontstore.ng' || host === 'www.frontstore.ng' || host === 'frontstore.app' || host === 'www.frontstore.app';
    if (isMainDomain) {
      return `/${store.username}`;
    }
    const isSubdomain = host.startsWith(`${store.username}.`) || (host.includes('.localhost') && host.startsWith(store.username)) || host.endsWith('.frontstore.ng');
    return isSubdomain ? '/' : `https://${store.username}.${systemDomain}`;
  };

  const timeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Just now';
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', 'Hanken Grotesk', sans-serif", color: '#0f172a' }}>
      
      {/* HEADER */}
      <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              onClick={() => window.location.href = getStoreHomeUrl()}
              style={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer' }}
            >
              <ChevronLeft size={18} color="#475569" />
            </button>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                {store.store_name}
                {store.is_verified ? <ShieldCheck size={16} color="var(--brand)" /> : null}
              </h1>
              <span style={{ fontSize: 13, color: '#64748b' }}>Store Reviews</span>
            </div>
          </div>
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${store.store_name} Reviews`,
                  url: window.location.href
                });
              }
            }}
            style={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#fff', cursor: 'pointer' }}
          >
            <Share2 size={18} color="#475569" />
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '30px 20px 80px' }}>
        
        {/* REVIEWS SUMMARY */}
        <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 30, alignItems: 'center' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 120 }}>
            <span style={{ fontSize: 48, fontWeight: 800, lineHeight: 1 }}>{averageRating}</span>
            <div style={{ display: 'flex', gap: 2, margin: '6px 0 4px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} size={16} fill={star <= Number(averageRating) ? '#f59e0b' : '#e2e8f0'} color={star <= Number(averageRating) ? '#f59e0b' : '#e2e8f0'} />
              ))}
            </div>
            <span style={{ fontSize: 13, color: '#64748b' }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
          </div>

          <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[5, 4, 3, 2, 1].map(star => {
              const count = ratingCounts[star as keyof typeof ratingCounts] || 0;
              const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#475569', width: 12 }}>{star}</span>
                  <div style={{ flex: 1, height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', backgroundColor: '#f59e0b', width: `${percent}%`, borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 200 }}>
            <button
              onClick={() => setIsWriteModalOpen(true)}
              style={{
                background: 'var(--brand)',
                color: '#fff',
                border: 'none',
                padding: '12px 20px',
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <Star size={16} /> Write a Review
            </button>
            <p style={{ margin: 0, fontSize: 12, color: '#64748b', textAlign: 'center', lineHeight: 1.4 }}>
              Share your experience to help others make better choices.
            </p>
          </div>
        </div>

        {/* REVIEWS LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#fff', borderRadius: 20, border: '1px solid #e2e8f0' }}>
              <Star size={40} color="#cbd5e1" style={{ marginBottom: 16 }} />
              <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>No reviews yet</h3>
              <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>Be the first to share your experience with {store.store_name}!</p>
            </div>
          ) : (
            reviews.map(review => (
              <div key={review.id} style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--tint)', color: 'var(--brand)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 16 }}>
                      {review.reviewer_name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{review.reviewer_name || 'Anonymous'}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{timeAgo(review.created_at)}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} size={14} fill={star <= review.rating ? '#f59e0b' : '#e2e8f0'} color={star <= review.rating ? '#f59e0b' : '#e2e8f0'} />
                    ))}
                  </div>
                </div>
                
                {review.body && (
                  <p style={{ margin: 0, fontSize: 14, color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {review.body}
                  </p>
                )}
                
                {review.reply && (
                  <div style={{ marginTop: 16, padding: 16, backgroundColor: '#f8fafc', borderRadius: 12, borderLeft: '3px solid var(--brand)' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      Response from {store.store_name}
                      <CheckCircle2 size={14} color="var(--brand)" />
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                      {review.reply}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          background: '#fff',
          borderTop: '1px solid #e2e8f0',
          padding: '36px 20px 28px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'Fraunces', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
              {store.store_name}
            </span>
            {store.is_verified ? <ShieldCheck size={16} color="var(--brand)" /> : null}
          </div>

          <p style={{ fontSize: 13, color: '#64748b', margin: 0, maxWidth: 440 }}>
            {store.store_bio || 'Shop directly on WhatsApp with fast delivery and buyer protection.'}
          </p>

          {(store.whatsapp_phone || store.instagram_handle || store.tiktok_handle || store.twitter_handle || store.facebook_handle) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>Our Socials</span>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                {store.whatsapp_phone && (
                  <a
                    href={`https://wa.me/${store.whatsapp_phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#25D366', fontSize: 12.5, fontWeight: 600, textDecoration: 'none' }}
                  >
                    <WhatsAppIcon size={15} /> WhatsApp
                  </a>
                )}
                {store.instagram_handle && (
                  <a
                    href={`https://instagram.com/${store.instagram_handle.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#e1306c', fontSize: 12.5, fontWeight: 600, textDecoration: 'none' }}
                  >
                    <InstagramIcon size={15} /> Instagram
                  </a>
                )}
                {store.tiktok_handle && (
                  <a
                    href={`https://tiktok.com/@${store.tiktok_handle.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#0f172a', fontSize: 12.5, fontWeight: 600, textDecoration: 'none' }}
                  >
                    <TikTokIcon size={15} /> TikTok
                  </a>
                )}
                {store.twitter_handle && (
                  <a
                    href={`https://x.com/${store.twitter_handle.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#0f172a', fontSize: 12.5, fontWeight: 600, textDecoration: 'none' }}
                  >
                    <TwitterXIcon size={15} /> Twitter
                  </a>
                )}
                {store.facebook_handle && (
                  <a
                    href={`https://facebook.com/${store.facebook_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#1877f2', fontSize: 12.5, fontWeight: 600, textDecoration: 'none' }}
                  >
                    <FacebookIcon size={15} /> Facebook
                  </a>
                )}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            <a
              href={getStoreHomeUrl()}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Back to Store
            </a>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', width: '100%', paddingTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
              © {new Date().getFullYear()} {store.store_name}. All rights reserved.
            </p>
            <BuiltWithFrontstoreBadge href={`https://${systemDomain}`} />
          </div>
        </div>
      </footer>

      {/* WRITE REVIEW MODAL */}
      {isWriteModalOpen && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 100 }} 
            onClick={() => setIsWriteModalOpen(false)}
          />
          <div 
            style={{ 
              position: 'fixed', 
              top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
              backgroundColor: '#fff', borderRadius: 24, width: '90%', maxWidth: 440, 
              zIndex: 110, padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Write a Review</h2>
              <button 
                onClick={() => setIsWriteModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Rating</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                    >
                      <Star size={32} fill={star <= newReviewRating ? '#f59e0b' : '#e2e8f0'} color={star <= newReviewRating ? '#f59e0b' : '#e2e8f0'} style={{ transition: 'all 0.2s' }} />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Your Name</label>
                <input 
                  type="text" 
                  value={newReviewName}
                  onChange={e => setNewReviewName(e.target.value)}
                  placeholder="John Doe"
                  required
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Review (Optional)</label>
                <textarea 
                  value={newReviewComment}
                  onChange={e => setNewReviewComment(e.target.value)}
                  placeholder="Share details of your own experience at this place"
                  rows={4}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  style={{ flex: 1, padding: '14px', borderRadius: 14, backgroundColor: '#f1f5f9', color: '#475569', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newReviewName.trim() || !newReviewRating}
                  style={{ flex: 1, padding: '14px', borderRadius: 14, backgroundColor: 'var(--brand)', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
