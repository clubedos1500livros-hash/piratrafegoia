export function normalizeVideoUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.includes('cloudinary') && trimmed.includes('/upload/')) {
    return trimmed.replace('/upload/', '/upload/q_auto,f_auto/');
  }

  return trimmed;
}

export function isValidVideoUrl(url: string): boolean {
  const v = url.trim().toLowerCase();
  return v.endsWith('.mp4') || v.endsWith('.webm') || v.includes('cloudinary');
}
