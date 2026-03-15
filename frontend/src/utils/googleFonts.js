/**
 * Google Fonts Integration
 * Comprehensive list of popular free fonts from Google Fonts
 */

export const GOOGLE_FONTS = [
  // Sans-Serif (Most Popular)
  { name: 'Inter', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Roboto', category: 'sans-serif', weights: [100, 300, 400, 500, 700, 900] },
  { name: 'Open Sans', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800] },
  { name: 'Lato', category: 'sans-serif', weights: [100, 300, 400, 700, 900] },
  { name: 'Montserrat', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Poppins', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Raleway', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Nunito', category: 'sans-serif', weights: [200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Ubuntu', category: 'sans-serif', weights: [300, 400, 500, 700] },
  { name: 'Work Sans', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Noto Sans', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Roboto Condensed', category: 'sans-serif', weights: [300, 400, 700] },
  { name: 'Source Sans Pro', category: 'sans-serif', weights: [200, 300, 400, 600, 700, 900] },
  { name: 'Oswald', category: 'sans-serif', weights: [200, 300, 400, 500, 600, 700] },
  { name: 'PT Sans', category: 'sans-serif', weights: [400, 700] },
  { name: 'Rubik', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800, 900] },
  { name: 'Karla', category: 'sans-serif', weights: [200, 300, 400, 500, 600, 700, 800] },
  { name: 'Barlow', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Oxygen', category: 'sans-serif', weights: [300, 400, 700] },
  { name: 'Mulish', category: 'sans-serif', weights: [200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Nunito Sans', category: 'sans-serif', weights: [200, 300, 400, 600, 700, 800, 900] },
  { name: 'Quicksand', category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  { name: 'Manrope', category: 'sans-serif', weights: [200, 300, 400, 500, 600, 700, 800] },
  { name: 'DM Sans', category: 'sans-serif', weights: [400, 500, 700] },
  { name: 'Hind', category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  { name: 'Josefin Sans', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700] },
  { name: 'Lexend', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Archivo', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Titillium Web', category: 'sans-serif', weights: [200, 300, 400, 600, 700, 900] },
  { name: 'IBM Plex Sans', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700] },
  
  // Serif
  { name: 'Playfair Display', category: 'serif', weights: [400, 500, 600, 700, 800, 900] },
  { name: 'Merriweather', category: 'serif', weights: [300, 400, 700, 900] },
  { name: 'Lora', category: 'serif', weights: [400, 500, 600, 700] },
  { name: 'PT Serif', category: 'serif', weights: [400, 700] },
  { name: 'Crimson Text', category: 'serif', weights: [400, 600, 700] },
  { name: 'EB Garamond', category: 'serif', weights: [400, 500, 600, 700, 800] },
  { name: 'Libre Baskerville', category: 'serif', weights: [400, 700] },
  { name: 'Bitter', category: 'serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Cormorant', category: 'serif', weights: [300, 400, 500, 600, 700] },
  { name: 'Spectral', category: 'serif', weights: [200, 300, 400, 500, 600, 700, 800] },
  { name: 'Noto Serif', category: 'serif', weights: [400, 700] },
  { name: 'Crimson Pro', category: 'serif', weights: [200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Cardo', category: 'serif', weights: [400, 700] },
  { name: 'Domine', category: 'serif', weights: [400, 500, 600, 700] },
  { name: 'Gelasio', category: 'serif', weights: [400, 500, 600, 700] },
  
  // Display
  { name: 'Bebas Neue', category: 'display', weights: [400] },
  { name: 'Abril Fatface', category: 'display', weights: [400] },
  { name: 'Archivo Black', category: 'display', weights: [400] },
  { name: 'Righteous', category: 'display', weights: [400] },
  { name: 'Fredoka One', category: 'display', weights: [400] },
  { name: 'Lobster', category: 'display', weights: [400] },
  { name: 'Pacifico', category: 'display', weights: [400] },
  { name: 'Staatliches', category: 'display', weights: [400] },
  { name: 'Anton', category: 'display', weights: [400] },
  { name: 'Alfa Slab One', category: 'display', weights: [400] },
  { name: 'Righteous', category: 'display', weights: [400] },
  { name: 'Bangers', category: 'display', weights: [400] },
  { name: 'Bungee', category: 'display', weights: [400] },
  { name: 'Permanent Marker', category: 'display', weights: [400] },
  { name: 'Passion One', category: 'display', weights: [400, 700, 900] },
  
  // Monospace
  { name: 'Fira Code', category: 'monospace', weights: [300, 400, 500, 600, 700] },
  { name: 'Source Code Pro', category: 'monospace', weights: [200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'JetBrains Mono', category: 'monospace', weights: [100, 200, 300, 400, 500, 600, 700, 800] },
  { name: 'Roboto Mono', category: 'monospace', weights: [100, 200, 300, 400, 500, 600, 700] },
  { name: 'IBM Plex Mono', category: 'monospace', weights: [100, 200, 300, 400, 500, 600, 700] },
  { name: 'Space Mono', category: 'monospace', weights: [400, 700] },
  { name: 'Courier Prime', category: 'monospace', weights: [400, 700] },
  { name: 'Anonymous Pro', category: 'monospace', weights: [400, 700] },
  { name: 'Inconsolata', category: 'monospace', weights: [200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Ubuntu Mono', category: 'monospace', weights: [400, 700] },
];

/**
 * Generate Google Fonts URL for given fonts
 * @param {Array} fonts - Array of font names
 * @returns {string} Google Fonts API URL
 */
export const generateFontUrl = (fonts) => {
  if (!fonts || fonts.length === 0) return '';
  
  const fontFamilies = fonts.map(fontName => {
    const font = GOOGLE_FONTS.find(f => f.name === fontName);
    if (!font) return fontName.replace(/ /g, '+');
    
    const weights = font.weights.join(';');
    return `${font.name.replace(/ /g, '+')}:wght@${weights}`;
  });
  
  return `https://fonts.googleapis.com/css2?${fontFamilies.map(f => `family=${f}`).join('&')}&display=swap`;
};

/**
 * Load a Google Font dynamically
 * @param {string} fontName - Name of the font to load
 */
export const loadGoogleFont = (fontName) => {
  // Check if font is already loaded
  const existingLink = document.querySelector(`link[href*="${fontName.replace(/ /g, '+')}"]`);
  if (existingLink) return;
  
  // Create and append link element
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = generateFontUrl([fontName]);
  document.head.appendChild(link);
};

/**
 * Get font family CSS value
 * @param {string} fontName - Name of the font
 * @returns {string} CSS font-family value
 */
export const getFontFamily = (fontName) => {
  const font = GOOGLE_FONTS.find(f => f.name === fontName);
  if (!font) return fontName;
  
  return `'${fontName}', ${font.category}`;
};

/**
 * Get fonts by category
 * @param {string} category - Font category (sans-serif, serif, display, monospace)
 * @returns {Array} Filtered fonts
 */
export const getFontsByCategory = (category) => {
  return GOOGLE_FONTS.filter(f => f.category === category);
};

export default {
  GOOGLE_FONTS,
  generateFontUrl,
  loadGoogleFont,
  getFontFamily,
  getFontsByCategory
};
