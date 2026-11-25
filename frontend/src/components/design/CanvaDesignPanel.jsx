import React from 'react';
import {
  Type, Palette, Layout, Sliders, Check, Eye, EyeOff,
  MoveUp, MoveDown, ShieldCheck, HelpCircle, FileText, Sparkles
} from 'lucide-react';

export const FONT_OPTIONS = [
  { label: 'Inter (Clean Tech)', value: 'Inter, sans-serif' },
  { label: 'Roboto (Modern Sans)', value: 'Roboto, sans-serif' },
  { label: 'Poppins (Geometric)', value: 'Poppins, sans-serif' },
  { label: 'Montserrat (Executive)', value: 'Montserrat, sans-serif' },
  { label: 'Lato (Warm & Friendly)', value: 'Lato, sans-serif' },
  { label: 'Open Sans (Neutral)', value: 'Open Sans, sans-serif' },
  { label: 'Merriweather (Classic Serif)', value: 'Merriweather, serif' },
  { label: 'Playfair Display (Luxury Serif)', value: 'Playfair Display, serif' },
  { label: 'Garamond (Academic Traditional)', value: 'Garamond, serif' },
  { label: 'Georgia (Editorial Serif)', value: 'Georgia, serif' },
  { label: 'Fira Code (Developer Mono)', value: 'Fira Code, monospace' },
  { label: 'JetBrains Mono (Tech Code)', value: 'JetBrains Mono, monospace' },
];

export const COLOR_PALETTES = [
  { name: 'Slate Enterprise', primary: '#0f172a', accent: '#3b82f6', bg: '#ffffff', text: '#1e293b' },
  { name: 'Tech Azure', primary: '#0284c7', accent: '#0369a1', bg: '#ffffff', text: '#0f172a' },
  { name: 'Royal Navy', primary: '#1e3a8a', accent: '#2563eb', bg: '#ffffff', text: '#1e293b' },
  { name: 'Emerald Forest', primary: '#065f46', accent: '#059669', bg: '#ffffff', text: '#0f172a' },
  { name: 'Executive Indigo', primary: '#3730a3', accent: '#4f46e5', bg: '#ffffff', text: '#1e1b4b' },
  { name: 'Burgundy Crimson', primary: '#881337', accent: '#be123c', bg: '#ffffff', text: '#1c1917' },
  { name: 'Nordic Teal', primary: '#115e59', accent: '#0d9488', bg: '#ffffff', text: '#0f172a' },
  { name: 'Warm Amber', primary: '#78350f', accent: '#d97706', bg: '#ffffff', text: '#1c1917' },
  { name: 'Monochrome Black', primary: '#000000', accent: '#404040', bg: '#ffffff', text: '#171717' },
];

export const LAYOUT_OPTIONS = [
  { id: 'single-column', label: 'Single Column (Standard ATS)', desc: '100% linear ATS pass-through' },
  { id: 'two-column', label: 'Two Column (Balanced)', desc: 'Experience left, skills right' },
  { id: 'sidebar-left', label: 'Sidebar Left', desc: 'Compact skills bar on left' },
  { id: 'sidebar-right', label: 'Sidebar Right', desc: 'Modern portfolio structure' },
  { id: 'header-card', label: 'Executive Header Card', desc: 'Prominent leadership title banner' },
];

export const DIVIDER_STYLES = [
  { id: 'line', label: 'Solid Line' },
  { id: 'bar', label: 'Left Accent Bar' },
  { id: 'dashed', label: 'Dashed Line' },
  { id: 'double', label: 'Double Line' },
  { id: 'minimal', label: 'Minimalist (Clean)' },
  { id: 'none', label: 'No Dividers' },
];

export const BULLET_STYLES = [
  { id: 'disc', label: '• Solid Bullet' },
  { id: 'circle', label: '○ Hollow Circle' },
  { id: 'dash', label: '— En Dash' },
  { id: 'arrow', label: '▸ Right Arrow' },
  { id: 'check', label: '✓ Checkmark' },
  { id: 'square', label: '▪ Solid Square' },
];

export const SECTIONS_META = [
  { key: 'summary', label: 'Professional Summary' },
  { key: 'skills', label: 'Technical & Core Skills' },
  { key: 'experience', label: 'Professional Experience' },
  { key: 'projects', label: 'Key Projects' },
  { key: 'education', label: 'Education' },
  { key: 'certifications', label: 'Certifications' },
  { key: 'publications', label: 'Publications & Research' },
  { key: 'awards', label: 'Honors & Awards' },
  { key: 'languages', label: 'Languages' },
];

export function CanvaDesignPanel({
  preferences = {},
  onUpdatePreferences,
  atsScore = 95,
  onResetDefaults,
}) {
  const currentFont = preferences.fontFamily || 'Inter, sans-serif';
  const currentScale = preferences.fontScale || 1;
  const currentLineHeight = preferences.lineHeight || 1.45;
  const currentPrimary = preferences.primaryColor || preferences.themeColor || '#0f172a';
  const currentAccent = preferences.accentColor || '#3b82f6';
  const currentBg = preferences.backgroundColor || '#ffffff';
  const currentText = preferences.textColor || '#1e293b';
  const currentLayout = preferences.layout || 'single-column';
  const currentFormat = preferences.paperFormat || 'a4';
  const currentMargin = preferences.marginSize || 'normal';
  const currentDivider = preferences.dividerStyle || 'line';
  const currentBullet = preferences.bulletStyle || 'disc';

  const defaultOrder = SECTIONS_META.map(s => s.key);
  const sectionOrder = preferences.sectionOrder && preferences.sectionOrder.length > 0 ? preferences.sectionOrder : defaultOrder;
  const sectionVisibility = preferences.sectionVisibility || {};

  // Handlers
  const handleColorChange = (key, val) => {
    onUpdatePreferences({ [key]: val });
  };

  const handleApplyPalette = (palette) => {
    onUpdatePreferences({
      primaryColor: palette.primary,
      themeColor: palette.primary,
      accentColor: palette.accent,
      backgroundColor: palette.bg,
      textColor: palette.text,
    });
  };

  const toggleSectionVisibility = (key) => {
    const isCurrentlyVisible = sectionVisibility[key] !== false;
    onUpdatePreferences({
      sectionVisibility: {
        ...sectionVisibility,
        [key]: !isCurrentlyVisible,
      },
    });
  };

  const moveSection = (index, direction) => {
    const newOrder = [...sectionOrder];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    onUpdatePreferences({ sectionOrder: newOrder });
  };

  return (
    <div className="canva-design-panel bg-white border-l border-ink/15 h-full overflow-y-auto w-full p-4 space-y-6 text-xs text-ink">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-ink/10">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary" />
          <h2 className="font-extrabold text-sm tracking-tight text-ink">Design Studio</h2>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          ATS {atsScore}%
        </span>
      </div>

      {/* 1. Layout & Paper Dimensions */}
      <div className="space-y-3">
        <label className="font-extrabold text-xs uppercase tracking-wider text-ink-secondary flex items-center gap-1.5">
          <Layout className="w-3.5 h-3.5" />
          <span>Layout & Paper Size</span>
        </label>
        
        {/* Paper Format (A4 vs US Letter) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onUpdatePreferences({ paperFormat: 'a4' })}
            className={`py-2 px-3 rounded-lg border text-center font-bold text-xs transition cursor-pointer ${
              currentFormat === 'a4'
                ? 'border-ink bg-ink text-white shadow-brutal-xs'
                : 'border-ink/20 hover:border-ink bg-canvas'
            }`}
          >
            A4 (210×297mm)
          </button>
          <button
            type="button"
            onClick={() => onUpdatePreferences({ paperFormat: 'letter' })}
            className={`py-2 px-3 rounded-lg border text-center font-bold text-xs transition cursor-pointer ${
              currentFormat === 'letter'
                ? 'border-ink bg-ink text-white shadow-brutal-xs'
                : 'border-ink/20 hover:border-ink bg-canvas'
            }`}
          >
            US Letter (8.5×11")
          </button>
        </div>

        {/* Layout Style */}
        <div className="space-y-1.5">
          {LAYOUT_OPTIONS.map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onUpdatePreferences({ layout: opt.id })}
              className={`w-full text-left p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                currentLayout === opt.id
                  ? 'border-primary bg-primary/5 text-primary font-bold'
                  : 'border-ink/15 hover:border-ink/40 bg-white'
              }`}
            >
              <div>
                <div className="font-semibold text-xs">{opt.label}</div>
                <div className="text-[10px] text-ink-muted">{opt.desc}</div>
              </div>
              {currentLayout === opt.id && <Check className="w-4 h-4 shrink-0 text-primary" />}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Typography Customizer */}
      <div className="space-y-3 pt-3 border-t border-ink/10">
        <label className="font-extrabold text-xs uppercase tracking-wider text-ink-secondary flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5" />
          <span>Typography</span>
        </label>

        {/* Font Family Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-ink-muted mb-1">Font Family</label>
          <select
            value={currentFont}
            onChange={(e) => onUpdatePreferences({ fontFamily: e.target.value })}
            className="w-full p-2 rounded-lg border border-ink/20 text-xs bg-white focus:outline-none focus:border-ink"
          >
            {FONT_OPTIONS.map(font => (
              <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                {font.label}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size Scaling */}
        <div>
          <div className="flex justify-between text-[11px] font-semibold text-ink-muted mb-1">
            <span>Font Size Scaling</span>
            <span className="font-mono">{Math.round(currentScale * 100)}%</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Compact', val: 0.92 },
              { label: 'Standard', val: 1 },
              { label: 'Spacious', val: 1.08 },
            ].map(sz => (
              <button
                key={sz.label}
                type="button"
                onClick={() => onUpdatePreferences({ fontScale: sz.val })}
                className={`py-1.5 rounded border text-xs font-semibold cursor-pointer ${
                  Math.abs(currentScale - sz.val) < 0.03
                    ? 'border-ink bg-ink text-white'
                    : 'border-ink/20 hover:border-ink bg-canvas'
                }`}
              >
                {sz.label}
              </button>
            ))}
          </div>
        </div>

        {/* Line Height */}
        <div>
          <div className="flex justify-between text-[11px] font-semibold text-ink-muted mb-1">
            <span>Line Spacing</span>
            <span className="font-mono">{currentLineHeight}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Dense', val: 1.35 },
              { label: 'Normal', val: 1.45 },
              { label: 'Relaxed', val: 1.6 },
            ].map(lh => (
              <button
                key={lh.label}
                type="button"
                onClick={() => onUpdatePreferences({ lineHeight: lh.val })}
                className={`py-1.5 rounded border text-xs font-semibold cursor-pointer ${
                  currentLineHeight === lh.val
                    ? 'border-ink bg-ink text-white'
                    : 'border-ink/20 hover:border-ink bg-canvas'
                }`}
              >
                {lh.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Color Palette Customizer */}
      <div className="space-y-3 pt-3 border-t border-ink/10">
        <label className="font-extrabold text-xs uppercase tracking-wider text-ink-secondary flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5" />
          <span>Color Schemes</span>
        </label>

        {/* Palette Grid */}
        <div className="grid grid-cols-3 gap-2">
          {COLOR_PALETTES.map(pal => (
            <button
              key={pal.name}
              type="button"
              onClick={() => handleApplyPalette(pal)}
              className="group p-2 rounded-lg border border-ink/15 hover:border-ink transition text-left cursor-pointer flex flex-col gap-1.5 bg-white"
            >
              <div className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: pal.primary }} />
                <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: pal.accent }} />
              </div>
              <span className="text-[10px] font-bold truncate text-ink-secondary group-hover:text-ink">
                {pal.name}
              </span>
            </button>
          ))}
        </div>

        {/* Custom Color Pickers */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div>
            <label className="block text-[10px] font-semibold text-ink-muted mb-1">Primary Color</label>
            <div className="flex items-center gap-2 border border-ink/20 rounded-lg p-1.5">
              <input
                type="color"
                value={currentPrimary}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 p-0"
              />
              <span className="font-mono text-[11px] font-bold">{currentPrimary}</span>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-ink-muted mb-1">Accent Color</label>
            <div className="flex items-center gap-2 border border-ink/20 rounded-lg p-1.5">
              <input
                type="color"
                value={currentAccent}
                onChange={(e) => handleColorChange('accentColor', e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 p-0"
              />
              <span className="font-mono text-[11px] font-bold">{currentAccent}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Dividers & Bullets */}
      <div className="space-y-3 pt-3 border-t border-ink/10">
        <label className="font-extrabold text-xs uppercase tracking-wider text-ink-secondary flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5" />
          <span>Dividers & Bullets</span>
        </label>

        {/* Divider Style */}
        <div>
          <label className="block text-[11px] font-semibold text-ink-muted mb-1">Section Divider</label>
          <select
            value={currentDivider}
            onChange={(e) => onUpdatePreferences({ dividerStyle: e.target.value })}
            className="w-full p-2 rounded-lg border border-ink/20 text-xs bg-white focus:outline-none focus:border-ink"
          >
            {DIVIDER_STYLES.map(div => (
              <option key={div.id} value={div.id}>{div.label}</option>
            ))}
          </select>
        </div>

        {/* Bullet Style */}
        <div>
          <label className="block text-[11px] font-semibold text-ink-muted mb-1">Bullet Point Style</label>
          <div className="grid grid-cols-3 gap-1.5">
            {BULLET_STYLES.map(b => (
              <button
                key={b.id}
                type="button"
                onClick={() => onUpdatePreferences({ bulletStyle: b.id })}
                className={`py-1.5 px-2 rounded border text-xs font-semibold cursor-pointer text-center truncate ${
                  currentBullet === b.id
                    ? 'border-ink bg-ink text-white'
                    : 'border-ink/20 hover:border-ink bg-canvas'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Margins */}
        <div>
          <label className="block text-[11px] font-semibold text-ink-muted mb-1">Page Margins</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'compact', label: 'Compact' },
              { id: 'normal', label: 'Normal' },
              { id: 'spacious', label: 'Spacious' },
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => onUpdatePreferences({ marginSize: m.id })}
                className={`py-1.5 rounded border text-xs font-semibold cursor-pointer text-center ${
                  currentMargin === m.id
                    ? 'border-ink bg-ink text-white'
                    : 'border-ink/20 hover:border-ink bg-canvas'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Section Reordering & Visibility */}
      <div className="space-y-3 pt-3 border-t border-ink/10">
        <label className="font-extrabold text-xs uppercase tracking-wider text-ink-secondary flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5" />
          <span>Section Order & Visibility</span>
        </label>
        <p className="text-[11px] text-ink-muted leading-tight">
          Reorder sections to prioritize your strongest assets or toggle off sections you don't need.
        </p>

        <div className="space-y-1.5">
          {sectionOrder.map((key, idx) => {
            const meta = SECTIONS_META.find(s => s.key === key) || { key, label: key };
            const visible = sectionVisibility[key] !== false;

            return (
              <div
                key={key}
                className="flex items-center justify-between p-2 rounded-lg border border-ink/15 bg-white hover:border-ink/30 transition text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <button
                    type="button"
                    onClick={() => toggleSectionVisibility(key)}
                    className="text-ink-muted hover:text-ink cursor-pointer"
                    title={visible ? 'Hide section' : 'Show section'}
                  >
                    {visible ? <Eye className="w-3.5 h-3.5 text-primary" /> : <EyeOff className="w-3.5 h-3.5 text-ink-muted" />}
                  </button>
                  <span className={`font-semibold truncate ${visible ? 'text-ink' : 'text-ink-muted line-through'}`}>
                    {meta.label}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveSection(idx, -1)}
                    className="p-1 text-ink-muted hover:text-ink disabled:opacity-20 cursor-pointer"
                    title="Move section up"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === sectionOrder.length - 1}
                    onClick={() => moveSection(idx, 1)}
                    className="p-1 text-ink-muted hover:text-ink disabled:opacity-20 cursor-pointer"
                    title="Move section down"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
