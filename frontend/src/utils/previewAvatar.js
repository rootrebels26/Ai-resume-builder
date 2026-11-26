const PREVIEW_AVATARS = [
  '/avatars/avatar-1.jpg',
  '/avatars/avatar-2.jpg',
  '/avatars/avatar-3.jpg',
];

/**
 * Returns a deterministic AI-generated professional headshot URL for template previews
 * whenever the template supports a photo (`photoPolicy !== 'no_photo'`).
 */
export function getPreviewAvatarForTemplate(template = {}) {
  if (!template || template.photoPolicy === 'no_photo') return null;
  const id = String(template.id || '');
  if (!id) return PREVIEW_AVATARS[0];

  if (id === 'pro-joanna-mint-sidebar' || id === 'pro-harper-navy-banner') {
    return '/avatars/avatar-2.jpg';
  }
  if (id === 'pro-jackson-classic-center') {
    return '/avatars/avatar-3.jpg';
  }
  if (id === 'pro-paul-navy-sidebar') {
    return '/avatars/avatar-1.jpg';
  }

  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return PREVIEW_AVATARS[h % PREVIEW_AVATARS.length];
}
