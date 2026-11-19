/**
 * Helper to resolve product and asset image URLs.
 * Handles:
 * 1. Full absolute URLs (e.g. https://... or http://...)
 * 2. Uploaded backend assets starting with /uploads/
 * 3. Local public assets starting with /assets/
 * 4. Blob preview URLs (blob:http://...)
 * 5. Data URLs (data:image/...)
 */
export function getProductImageUrl(src, fallback = '/assets/images/prod-p2.jpg') {
  if (!src || typeof src !== 'string') return fallback;

  // Blob URLs from URL.createObjectURL or data: base64 URLs or full http/https URLs
  if (
    src.startsWith('blob:') ||
    src.startsWith('data:') ||
    src.startsWith('http://') ||
    src.startsWith('https://')
  ) {
    return src;
  }

  // Relative backend uploads (/uploads/products/...)
  if (src.startsWith('/uploads')) {
    const backendBase = (
      import.meta.env.VITE_BACKEND_URL ||
      import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') ||
      ''
    ).replace(/\/$/, '');

    return backendBase ? `${backendBase}${src}` : src;
  }

  // Fallback to relative path for public folder assets (e.g. /assets/...)
  return src;
}

