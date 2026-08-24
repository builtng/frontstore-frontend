'use client';

import React from 'react';
import { Star, CheckCircle2, Zap } from 'lucide-react';

interface ReviewsTabProps {
  isPro: boolean;
  reviews: any[];
  replyTexts: { [reviewId: string]: string };
  setReplyTexts: React.Dispatch<React.SetStateAction<{ [reviewId: string]: string }>>;
  submittingReplyId: string | null;
  handleReplyReview: (reviewId: string) => void;
  openUpgradePrompt: (title: string, description: string) => void;
}

// `reviews` and the reply-submission state stay owned by dashboard/page.tsx —
// they're loaded together with orders/products/stats in the same shared
// loadAllData() call and the sidebar's Customer Reviews badge count reads
// this same list, so this tab takes them as props rather than re-fetching.
export default function ReviewsTab({
  isPro, reviews, replyTexts, setReplyTexts, submittingReplyId, handleReplyReview, openUpgradePrompt,
}: ReviewsTabProps) {
  if (!isPro) {
    return (
      <div className="card animate-fade-in" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 650, margin: '40px auto' }}>
        <div style={{ background: 'rgba(217, 119, 6, 0.15)', color: '#d97706', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Star size={32} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Customer Reviews</h2>
        <p style={{ fontSize: 11.5, fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Ratings & Reputation</p>
        <p style={{ fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
          See every rating and comment left by your customers, and reply publicly to build trust and win repeat business.
        </p>

        <div style={{ alignSelf: 'stretch', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 20, textAlign: 'left', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>Read every customer review</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>Reply publicly to build trust</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>Track your store's overall rating</span>
          </div>
        </div>

        <button
          onClick={() => openUpgradePrompt(
            'Customer Reviews requires Pro',
            'Viewing and replying to customer reviews is available on Pro. You can review the plan before upgrading.'
          )}
          className="btn btn-primary clickable"
          style={{ padding: '12px 24px', borderRadius: 'var(--r-lg)', display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 800 }}
        >
          <Zap size={16} /> Upgrade to Pro to Unlock Reviews
        </button>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>Customer Reviews</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Manage and respond to feedback left for your store and products.</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="empty-state" style={{ padding: '60px 0', textAlign: 'center' }}>
          <div className="empty-state__icon" style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: 64, height: 64, borderRadius: '50%', background: 'var(--surface-2)', color: 'var(--text-faint)', marginBottom: 16 }}>
            <Star size={28} strokeWidth={1.25} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', color: 'var(--text)' }}>No reviews yet</h3>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', maxWidth: '320px', margin: '0 auto', lineHeight: 1.5 }}>
            Once verified buyers review their orders, their ratings and comments will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reviews.map((review) => (
            <div key={review.id} style={{
              background: 'var(--surface-2)',
              borderRadius: 'var(--r-md)',
              border: '1px solid var(--border)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: '14.5px' }}>{review.customer_name}</span>
                  {review.order && (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Order #{review.order.order_number}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      size={13}
                      fill={star <= review.rating ? 'var(--primary)' : 'none'}
                      stroke={star <= review.rating ? 'var(--primary)' : 'var(--text-faint)'}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 'var(--r-full)',
                  background: review.product_id ? 'var(--bg)' : 'rgba(16, 185, 129, 0.08)',
                  color: review.product_id ? 'var(--text-muted)' : 'var(--primary)',
                  border: '1px solid var(--border)'
                }}>
                  {review.product_id
                    ? `Product: ${review.product?.name ?? 'Deleted Product'}`
                    : 'Store Experience'
                  }
                </span>
              </div>

              {review.comment && (
                <p style={{ fontSize: '13.5px', margin: 0, color: 'var(--text)', fontStyle: 'italic', background: 'var(--bg)', padding: '12px', borderRadius: 'var(--r-sm)', borderLeft: '3px solid var(--border-strong)', lineHeight: 1.4 }}>
                  &ldquo;{review.comment}&rdquo;
                </p>
              )}

              {review.reply ? (
                <div style={{
                  marginTop: '4px',
                  padding: '12px 14px',
                  background: 'var(--bg)',
                  borderRadius: 'var(--r-sm)',
                  borderLeft: '3px solid var(--primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Your Response</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
                      {new Date(review.replied_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', margin: 0, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {review.reply}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                  <textarea
                    placeholder="Type a response to this review..."
                    value={replyTexts[review.id] ?? ''}
                    onChange={(e) => setReplyTexts(prev => ({ ...prev, [review.id]: e.target.value }))}
                    className="input-field"
                    style={{
                      fontSize: '13px',
                      minHeight: '60px',
                      padding: '10px',
                      borderRadius: 'var(--r-md)',
                      resize: 'vertical',
                      background: 'var(--bg)',
                      border: '1px solid var(--border)'
                    }}
                  />
                  <button
                    onClick={() => handleReplyReview(review.id)}
                    disabled={submittingReplyId === review.id}
                    className="btn btn-primary clickable"
                    style={{
                      alignSelf: 'flex-end',
                      padding: '8px 16px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      borderRadius: 'var(--r-md)',
                      backgroundColor: 'var(--primary)',
                      color: '#fff',
                      border: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    {submittingReplyId === review.id ? 'Submitting...' : 'Submit Response'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
