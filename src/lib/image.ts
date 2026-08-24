/**
 * High-performance Image Delivery & Optimization Utilities for Frontstore
 */

export type ImageSizeVariant = 'thumb' | 'md' | 'lg' | 'orig';

/**
 * Optimizes image URLs for ultra-fast loading across all networks.
 * Supports Frontstore WebP variants, Unsplash, Cloudinary, and Supabase Storage.
 *
 * @param url The source image URL
 * @param variant 'thumb' (320px), 'md' (800px), 'lg' (1600px), or 'orig'
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  variant: ImageSizeVariant = 'md'
): string {
  if (!url || typeof url !== 'string') return '';

  let cleanUrl = url.trim();

  // If relative path (e.g. "logos/abc.png" or "/storage/logos/abc.png"), convert to full backend storage URL
  if (
    !cleanUrl.startsWith('http://') &&
    !cleanUrl.startsWith('https://') &&
    !cleanUrl.startsWith('data:') &&
    !cleanUrl.startsWith('blob:')
  ) {
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.frontstore.ng/api';
    const baseUrl = rawApiUrl.replace(/\/api\/?$/, '');

    let cleanPath = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
    if (!cleanPath.startsWith('/storage/')) {
      cleanPath = `/storage${cleanPath}`;
    }
    cleanUrl = `${baseUrl}${cleanPath}`;
  }

  // 1. Unsplash dynamic CDN
  if (cleanUrl.includes('images.unsplash.com')) {
    const base = cleanUrl.split('?')[0];
    const width = variant === 'thumb' ? 320 : variant === 'md' ? 750 : 1400;
    return `${base}?w=${width}&auto=format&fit=crop&q=80`;
  }

  // 2. Cloudinary dynamic CDN
  if (cleanUrl.includes('res.cloudinary.com')) {
    const width = variant === 'thumb' ? 'w_320' : variant === 'md' ? 'w_800' : 'w_1600';
    return cleanUrl.replace('/upload/', `/upload/f_auto,q_auto,${width}/`);
  }

  // 3. Supabase Storage transformation
  if (cleanUrl.includes('supabase.co/storage/v1/object/public/')) {
    const width = variant === 'thumb' ? 320 : variant === 'md' ? 800 : 1600;
    return cleanUrl.replace('/public/', `/render/image/public/`) + `?width=${width}&quality=80&format=origin`;
  }

  // 4. Frontstore WebP Responsive Variants
  // If the URL ends with .webp and we want a thumb or md variant:
  if (variant === 'thumb' && cleanUrl.endsWith('.webp') && !cleanUrl.includes('_thumb.') && !cleanUrl.includes('_md.')) {
    return cleanUrl.replace(/\.webp$/i, '_thumb.webp');
  }

  if (variant === 'md' && cleanUrl.endsWith('.webp') && !cleanUrl.includes('_thumb.') && !cleanUrl.includes('_md.')) {
    return cleanUrl.replace(/\.webp$/i, '_md.webp');
  }

  return cleanUrl;
}

/**
 * Returns low-overhead image tag props for optimal performance.
 */
export function getImagePerformanceProps(isPriority: boolean = false) {
  return {
    loading: isPriority ? ('eager' as const) : ('lazy' as const),
    decoding: 'async' as const,
    fetchPriority: isPriority ? ('high' as const) : ('auto' as const),
  };
}
