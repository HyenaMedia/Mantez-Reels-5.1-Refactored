/**
 * WCAG Contrast & Color Utilities
 * Extracted from GlobalSettings.jsx for reuse across the app.
 */

export const hexToRgb = (hex) => {
  if (!hex || typeof hex !== 'string') return [0, 0, 0];
  const clean = hex.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(clean)) return [0, 0, 0];
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;
  const n = parseInt(full, 16);
  if (isNaN(n)) return [0, 0, 0];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const luminance = (r, g, b) => {
  const s = [r, g, b].map(c => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
};

export const contrastRatio = (hex1, hex2) => {
  try {
    const [r1, g1, b1] = hexToRgb(hex1);
    const [r2, g2, b2] = hexToRgb(hex2);
    const L1 = luminance(r1, g1, b1);
    const L2 = luminance(r2, g2, b2);
    const lighter = Math.max(L1, L2);
    const darker  = Math.min(L1, L2);
    return (lighter + 0.05) / (darker + 0.05);
  } catch { return 1; }
};

/**
 * @param {number} ratio  - contrast ratio
 * @param {'normal'|'large'} size
 * @returns {'AAA'|'AA'|'fail'}
 */
export const wcagLevel = (ratio, size = 'normal') => {
  if (size === 'large') return ratio >= 4.5 ? 'AAA' : ratio >= 3 ? 'AA' : 'fail';
  return ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'fail';
};
