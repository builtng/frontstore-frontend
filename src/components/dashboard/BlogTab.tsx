'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { BookOpen, Plus, Trash2, X, Loader2, Image as ImageIcon } from 'lucide-react';
import ConfirmDialog from '../ConfirmDialog';
import { api } from '@/lib/api';
import type { StoreInfo } from '@/types/dashboard';

interface BlogPost {
  id: number | string;
  title: string;
  category: string;
  excerpt: string;
  read_time?: string;
  is_pseo?: boolean;
}

interface BlogTabProps {
  store: StoreInfo | null;
}

export default function BlogTab({ store }: BlogTabProps) {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const [showBlogForm, setShowBlogForm] = useState(false);
  const [blogSubmitting, setBlogSubmitting] = useState(false);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCategory, setBlogCategory] = useState('');
  const [blogReadTime, setBlogReadTime] = useState('');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogBody, setBlogBody] = useState('');
  const [blogImageUrl, setBlogImageUrl] = useState('');
  const [blogImageMode, setBlogImageMode] = useState<'url' | 'upload'>('url');
  const [blogImageUploading, setBlogImageUploading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBlogPosts = async () => {
    setLoading(true);
    try {
      const data = await api.get<BlogPost[]>('/v1/blog');
      setBlogPosts(data || []);
    } catch {
      toast.error('Failed to load blog posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const handleCreateBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim()) {
      toast.error('Please enter a title.');
      return;
    }
    if (!blogCategory.trim()) {
      toast.error('Please enter a category.');
      return;
    }

    try {
      setBlogSubmitting(true);
      const paragraphs = blogBody.split('\n').filter(p => p.trim() !== '').map(p => ({ p: p.trim() }));

      const payload = {
        title: blogTitle.trim(),
        category: blogCategory.trim(),
        read_time: blogReadTime.trim() || '5 min read',
        excerpt: blogExcerpt.trim() || blogBody.substring(0, 150) + '...',
        body: paragraphs,
        image_url: blogImageUrl.trim() || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
        published_at: new Date().toISOString()
      };

      const data = await api.post<BlogPost>('/v1/blog', payload);

      toast.success('Blog post created successfully!');
      setBlogPosts(prev => [data, ...prev]);

      setBlogTitle('');
      setBlogCategory('');
      setBlogReadTime('');
      setBlogExcerpt('');
      setBlogBody('');
      setBlogImageUrl('');
      setShowBlogForm(false);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setBlogSubmitting(false);
    }
  };

  const handleUploadBlogImage = async (file: File) => {
    setBlogImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const data = await api.post<{ url: string }>('/v1/blog/upload-image', formData);
      setBlogImageUrl(data.url);
      toast.success('Image uploaded successfully! 📸');
    } catch (err: any) {
      toast.error(err.message || 'Image upload failed.');
    } finally {
      setBlogImageUploading(false);
    }
  };

  const handleDeleteBlogPost = (post: BlogPost) => {
    setDeleteTarget(post);
  };

  const confirmDeleteBlogPost = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.del(`/v1/blog/${deleteTarget.id}`);
      toast.success('Blog post deleted successfully.');
      setBlogPosts(prev => prev.filter(p => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
        <Loader2 size={22} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <>
      <div className="card animate-fade-in" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 900 }}>Blog Posts</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Manage blog posts and search engine optimization (pSEO) articles for your storefront.</p>
          </div>
          <button
            onClick={() => setShowBlogForm(true)}
            className="btn btn-primary clickable"
            style={{
              padding: '10px 20px',
              fontSize: '13px',
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
            <Plus size={16} /> New Post
          </button>
        </div>

        {blogPosts.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 0', textAlign: 'center' }}>
            <div className="empty-state__icon" style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: 64, height: 64, borderRadius: '50%', background: 'var(--surface-2)', color: 'var(--text-faint)', marginBottom: 16 }}>
              <BookOpen size={28} strokeWidth={1.25} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', color: 'var(--text)' }}>No blog posts yet</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', maxWidth: '320px', margin: '0 auto', lineHeight: 1.5 }}>
              Create articles or tutorials to engage your storefront visitors and improve search ranking.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {blogPosts.map((post) => (
              <div key={post.id} style={{
                background: 'var(--surface-2)',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        color: 'var(--primary)',
                        background: 'rgba(var(--primary-rgb), 0.08)',
                        padding: '2px 8px',
                        borderRadius: 'var(--r-full)',
                        border: '1px solid var(--border)'
                      }}>
                        {post.category}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {post.read_time || '5 min read'}
                      </span>
                      {post.is_pseo ? (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: 'var(--accent)',
                          background: 'rgba(var(--accent-rgb), 0.08)',
                          padding: '2px 8px',
                          borderRadius: 'var(--r-full)',
                          border: '1px solid var(--border)'
                        }}>
                          Seeded pSEO
                        </span>
                      ) : null}
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '4px 0 6px', color: 'var(--text)' }}>{post.title}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{post.excerpt}</p>
                    <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: 8 }}>
                      By <b style={{ color: 'var(--text-muted)' }}>{post.is_pseo ? 'Front Store Team' : (store?.store_name || 'My Store')}</b>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteBlogPost(post)}
                    className="btn btn-outline clickable"
                    style={{
                      color: 'var(--danger)',
                      borderColor: 'rgba(239, 68, 68, 0.2)',
                      background: 'none',
                      padding: '8px 12px',
                      fontSize: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      borderRadius: 'var(--r-md)'
                    }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL: CREATE BLOG POST ── */}
      {showBlogForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setShowBlogForm(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} className="responsive-modal-overlay" />
          <div className="card glass animate-scale-in responsive-modal-container" style={{ position: 'relative', width: '100%', maxWidth: 680, maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 28, zIndex: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexShrink: 0 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                <BookOpen size={18} style={{ color: 'var(--primary)' }} /> Create New Blog Post
              </h3>
              <button onClick={() => setShowBlogForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleCreateBlogPost} style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1, paddingRight: 4, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5 Skincare Routine Mistakes to Avoid"
                  value={blogTitle}
                  onChange={e => setBlogTitle(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 10, fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Skincare"
                    value={blogCategory}
                    onChange={e => setBlogCategory(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 10, fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Read Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 4 min read"
                    value={blogReadTime}
                    onChange={e => setBlogReadTime(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 10, fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Excerpt (Short Summary)</label>
                <textarea
                  placeholder="Brief teaser of what the post is about..."
                  value={blogExcerpt}
                  onChange={e => setBlogExcerpt(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', minHeight: 60, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 10, fontSize: 13, resize: 'vertical' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cover Image (Optional)</label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      type="button"
                      onClick={() => setBlogImageMode('url')}
                      className={`btn clickable`}
                      style={{ padding: '4px 10px', fontSize: 11, borderRadius: 'var(--r-sm)', background: blogImageMode === 'url' ? 'var(--primary)' : 'var(--surface)', color: blogImageMode === 'url' ? '#fff' : 'var(--text-muted)', fontWeight: 700, border: '1px solid var(--border)' }}
                    >
                      🔗 URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setBlogImageMode('upload')}
                      className={`btn clickable`}
                      style={{ padding: '4px 10px', fontSize: 11, borderRadius: 'var(--r-sm)', background: blogImageMode === 'upload' ? 'var(--primary)' : 'var(--surface)', color: blogImageMode === 'upload' ? '#fff' : 'var(--text-muted)', fontWeight: 700, border: '1px solid var(--border)' }}
                    >
                      📁 Upload
                    </button>
                  </div>
                </div>

                {blogImageMode === 'url' ? (
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={blogImageUrl}
                    onChange={e => setBlogImageUrl(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 10, fontSize: 13 }}
                  />
                ) : (
                  <div style={{
                    border: '2px dashed var(--border)',
                    borderRadius: 'var(--r-md)',
                    padding: '24px 16px',
                    textAlign: 'center',
                    background: 'var(--bg)'
                  }}>
                    <label htmlFor="blog-image-upload" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      {blogImageUploading ? (
                        <>
                          <Loader2 size={24} className="animate-spin" color="var(--primary)" />
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Uploading cover image...</span>
                        </>
                      ) : blogImageUrl ? (
                        <>
                          <div style={{ position: 'relative', width: 80, height: 80, borderRadius: 'var(--r-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                            <img src={blogImageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)' }}>Image uploaded successfully</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon size={24} color="var(--text-muted)" />
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Click to upload cover image</span>
                        </>
                      )}
                    </label>
                    <input
                      id="blog-image-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      disabled={blogImageUploading}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadBlogImage(file);
                        e.target.value = '';
                      }}
                    />
                    {blogImageUrl && (
                      <button type="button" onClick={() => setBlogImageUrl('')} style={{ marginTop: 6, fontSize: 11, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                        Remove image
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Body Paragraphs</label>
                <textarea
                  required
                  placeholder="Write your article paragraphs here. Use a blank line (press Enter twice) to start a new paragraph."
                  value={blogBody}
                  onChange={e => setBlogBody(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', minHeight: 180, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 10, fontSize: 13, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8, flexShrink: 0 }}>
                <button type="button" onClick={() => setShowBlogForm(false)} className="btn btn-outline clickable" style={{ flex: 1, padding: 12 }}>Cancel</button>
                <button type="submit" disabled={blogSubmitting} className="btn btn-primary clickable" style={{ flex: 1, padding: 12 }}>
                  {blogSubmitting ? 'Publishing...' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Blog Post"
        description="Are you sure you want to delete this blog post? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleting}
        onConfirm={confirmDeleteBlogPost}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
