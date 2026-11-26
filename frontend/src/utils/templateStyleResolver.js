/**
 * Deterministic Visual Archetype & Header Style Resolver
 * Shared by TemplateDraftCard (gallery), TemplateQuickPreviewModal (preview),
 * and DynamicResumeCanvas (builder & PDF) so all 3 views are 100% identical
 * and every template has a distinct Canva-inspired visual identity.
 */

function hashId(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function getTemplateVisualArchetype(templateDef = {}, activeLayout) {
  if (templateDef.visualArchetype) {
    return templateDef.visualArchetype;
  }
  const layout = activeLayout || templateDef.layout || 'single-column';
  const id = String(templateDef.id || '').toLowerCase();
  const h = hashId(id);

  if (layout === 'sidebar-left') {
    return h % 2 === 0 ? 'sidebar-dark-left' : 'sidebar-tinted-left';
  }
  if (layout === 'sidebar-right') {
    return h % 2 === 0 ? 'sidebar-tinted-right' : 'sidebar-dark-right';
  }
  if (layout === 'two-column') {
    return h % 2 === 0 ? 'two-col-timeline' : 'two-col-split';
  }
  if (layout === 'header-card') {
    return h % 2 === 0 ? 'banner-solid' : 'banner-tinted';
  }

  return 'single-column';
}

export function getTemplateHeaderStyle(templateDef = {}, activeLayout) {
  if (templateDef.headerStyle) {
    return templateDef.headerStyle;
  }
  const layout = activeLayout || templateDef.layout || 'single-column';
  if (layout === 'header-card') return 'banner';
  if (layout === 'sidebar-left' || layout === 'sidebar-right') return 'left';
  if (layout === 'two-column') {
    return hashId(templateDef.id || '') % 2 === 0 ? 'centered-boxed' : 'split';
  }

  const id = String(templateDef.id || '').toLowerCase();
  const font = String(templateDef.typography?.headingFont || templateDef.fontFamily || '').toLowerCase();
  const divider = String(templateDef.dividerStyle || 'line').toLowerCase();

  if (
    id.includes('executive') ||
    id.includes('classic') ||
    id.includes('academic') ||
    id.includes('research') ||
    id.includes('finance') ||
    id.includes('legal') ||
    font.includes('playfair') ||
    font.includes('merriweather') ||
    font.includes('garamond') ||
    font.includes('georgia')
  ) {
    return 'centered';
  }

  if (divider === 'bar') return 'accent-bar';
  if (divider === 'minimal' || id.includes('minimal') || id.includes('compact')) return 'minimal-left';
  return 'split';
}
