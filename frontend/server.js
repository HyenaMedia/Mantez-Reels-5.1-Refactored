const express = require('express');
const path = require('path');
const fs = require('fs');
const compression = require('compression');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;
const BUILD_DIR = path.join(__dirname, 'build');
const IS_RENDER = !!process.env.RENDER;

// Utility: process HTML for production — strips testing scripts & injects perf hints
// NOTE: CRA build output uses defer="defer" (not bare defer), so regex must be flexible.
function processHtml(html) {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  if (IS_RENDER) {
    // Strip rrweb scripts (flexible regex handles defer vs defer="defer")
    html = html
      .replace(/<script[^>]+src="https:\/\/unpkg\.com\/rrweb[^"]*"[^>]*><\/script>/g, '')
      .replace(/<script[^>]+src="https:\/\/d2adkz2s9zrlge[^"]*"[^>]*><\/script>/g, '');

    // Strip Emergent badge removal script (has MutationObserver watching for a badge
    // that doesn't exist in production — pure wasted CPU per page load)
    html = html.replace(/<script>window\.addEventListener\([^<]*MutationObserver[^<]*<\/script>/g, '');

    // Strip DEV_ONLY comment blocks (present in source HTML, if they survived minification)
    html = html.replace(/<!-- EMERGENT_DEV_ONLY_START -->[\s\S]*?<!-- EMERGENT_DEV_ONLY_END -->/g, '');
  }

  // Inject CSS preload hint early in <head> — browser starts fetching CSS before parsing rest of <head>
  const cssMatch = html.match(/href="(\/static\/css\/main\.[^"]+\.css)"/);
  if (cssMatch) {
    const cssHref = cssMatch[1];
    if (!html.includes(`rel="preload" href="${cssHref}"`)) {
      html = html.replace(
        '<link rel="preconnect"',
        `<link rel="preload" href="${cssHref}" as="style"><link rel="preconnect"`
      );
    }
  }

  // Inject runtime backend URL + DNS prefetch for the backend API
  // window.__BACKEND_URL__ is read by the axios interceptor in src/utils/api.js
  // This makes the frontend work on any deployment without a rebuild
  const runtimeInjection = backendUrl
    ? `<script>window.__BACKEND_URL__="${backendUrl}";</script>\n  ` +
      `<link rel="dns-prefetch" href="${backendUrl}">\n  ` +
      `<link rel="preconnect" href="${backendUrl}" crossorigin>\n  `
    : '';

  if (runtimeInjection && !html.includes('window.__BACKEND_URL__')) {
    html = html.replace('</head>', `  ${runtimeInjection}</head>`);
  }

  return html;
}

// Keep old name as alias so nothing else breaks
const stripTestingScripts = processHtml;

// Cache processed HTML at startup for fast serving
const indexHtmlPath = path.join(BUILD_DIR, 'index.html');
const spaShellPath = path.join(BUILD_DIR, 'spa-shell.html');
const cachedIndexHtml = fs.existsSync(indexHtmlPath) ? stripTestingScripts(fs.readFileSync(indexHtmlPath, 'utf8')) : null;
const cachedSpaShell = fs.existsSync(spaShellPath) ? stripTestingScripts(fs.readFileSync(spaShellPath, 'utf8')) : null;

// Security headers middleware (CRITICAL for Lighthouse 100/100)
app.use((req, res, next) => {
  // HSTS - Force HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Prevent clickjacking — only in production (dev preview uses iframes)
  if (IS_RENDER) {
    res.setHeader('X-Frame-Options', 'DENY');
  }
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Cross-Origin-Opener-Policy (COOP)
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  
  // Cross-Origin-Embedder-Policy (COEP)
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  
  // Content Security Policy
  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net https://d2adkz2s9zrlge.cloudfront.net https://assets.emergent.sh",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    `connect-src 'self' ${backendUrl}`,
    // frame-ancestors 'none' only in production — dev preview needs iframe access
    IS_RENDER ? "frame-ancestors 'none'" : "frame-ancestors *",
    "base-uri 'self'",
    "form-action 'self'",
    IS_RENDER ? "upgrade-insecure-requests" : ""
  ].filter(Boolean).join('; ');
  res.setHeader('Content-Security-Policy', csp);
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
});

const BACKEND_PORT = 8001;

// Enable gzip compression
app.use(compression());

// Proxy helper: fetches from backend (uses env var for production, localhost for dev)
function proxyToBackend(apiPath, contentType, res) {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  
  if (backendUrl) {
    // Production: use the configured backend URL via HTTPS
    const url = new URL(apiPath, backendUrl);
    const https = require('https');
    https.get(url.toString(), (backendRes) => {
      let data = '';
      backendRes.on('data', (chunk) => { data += chunk; });
      backendRes.on('end', () => {
        res.set('Content-Type', contentType);
        res.set('Cache-Control', 'public, max-age=3600, must-revalidate');
        res.status(backendRes.statusCode).send(data);
      });
    }).on('error', () => res.status(502).send(''));
  } else {
    // Development: proxy to local backend
    const options = { hostname: 'localhost', port: BACKEND_PORT, path: apiPath, method: 'GET' };
    const req = http.request(options, (backendRes) => {
      let data = '';
      backendRes.on('data', (chunk) => { data += chunk; });
      backendRes.on('end', () => {
        res.set('Content-Type', contentType);
        res.set('Cache-Control', 'public, max-age=3600, must-revalidate');
        res.status(backendRes.statusCode).send(data);
      });
    });
    req.on('error', () => res.status(502).send(''));
    req.end();
  }
}

// Health check — shows runtime config status at a glance
// Useful for diagnosing Render deployment issues (missing env vars, etc.)
app.get('/health', (req, res) => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  res.json({
    status: 'ok',
    environment: IS_RENDER ? 'render_production' : 'development',
    build: {
      exists: fs.existsSync(indexHtmlPath),
      rrweb_stripped: IS_RENDER,
    },
    backend: {
      configured: !!backendUrl,
      hint: backendUrl
        ? backendUrl.replace(/https?:\/\//, '').split('/')[0]
        : 'NOT SET — add REACT_APP_BACKEND_URL to Render frontend env vars, then redeploy',
    },
    timestamp: new Date().toISOString(),
  });
});

// Serve robots.txt dynamically (adapts to any deployment URL)
app.get('/robots.txt', (req, res) => {
  const siteUrl = `${req.protocol}://${req.get('host')}`;
  res.set('Content-Type', 'text/plain');
  res.set('Cache-Control', 'public, max-age=3600, must-revalidate');
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /login\nDisallow: /api/\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
});

app.get('/llms.txt', (_req, res) => {
  const fallbackPath = path.join(BUILD_DIR, 'llms.txt');
  if (fs.existsSync(fallbackPath)) {
    res.sendFile(fallbackPath);
  } else {
    proxyToBackend('/api/settings/llms.txt', 'text/plain', res);
  }
});

app.get('/sitemap.xml', (req, res) => {
  const fallbackPath = path.join(BUILD_DIR, 'sitemap.xml');
  if (fs.existsSync(fallbackPath)) {
    res.sendFile(fallbackPath);
  } else {
    // Dynamic fallback sitemap
    const siteUrl = `${req.protocol}://${req.get('host')}`;
    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600, must-revalidate');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${siteUrl}/</loc><priority>1.0</priority></url>
  <url><loc>${siteUrl}/privacy</loc><priority>0.3</priority></url>
</urlset>`);
  }
});

// Explicitly handle static JS files FIRST with long cache
app.get('/static/js/*.js', (req, res) => {
  const filePath = path.join(BUILD_DIR, req.path);
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.sendFile(filePath, (err) => {
    if (err) res.status(404).end();
  });
});

// Explicitly handle static CSS files with long cache
app.get('/static/css/*.css', (req, res) => {
  const filePath = path.join(BUILD_DIR, req.path);
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.sendFile(filePath, (err) => {
    if (err) res.status(404).end();
  });
});

// API Proxy — forward /api/* to the real backend at runtime
// This handles the case where REACT_APP_BACKEND_URL was not set at build time,
// causing the React bundle to use relative /api/* URLs (BACKEND_URL = '' → API = '/api').
// The runtime env var always has the correct value on Render.
app.use('/api', (req, res) => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  if (!backendUrl) {
    return res.status(503).json({ detail: 'Backend URL not configured. Set REACT_APP_BACKEND_URL env var.' });
  }

  const targetUrl = new URL('/api' + req.url, backendUrl);
  const isHttps = targetUrl.protocol === 'https:';
  const transport = isHttps ? require('https') : http;

  const options = {
    hostname: targetUrl.hostname,
    port: targetUrl.port || (isHttps ? 443 : 80),
    path: targetUrl.pathname + (targetUrl.search || ''),
    method: req.method,
    headers: { ...req.headers, host: targetUrl.hostname },
  };
  // Let Node calculate content-length from body
  delete options.headers['content-length'];

  const proxyReq = transport.request(options, (proxyRes) => {
    res.status(proxyRes.statusCode);
    // Forward backend headers (skip hop-by-hop headers)
    Object.entries(proxyRes.headers).forEach(([key, val]) => {
      if (!['connection', 'transfer-encoding', 'keep-alive'].includes(key.toLowerCase())) {
        res.set(key, val);
      }
    });
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('[API Proxy] Backend unreachable:', err.message);
    res.status(502).json({ detail: 'Backend unavailable' });
  });

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
});

// Handle other static files
app.use('/static', express.static(path.join(BUILD_DIR, 'static'), {
  maxAge: '1y',
  immutable: true
}));

// Serve favicon, manifest, robots.txt, etc.
app.use(express.static(BUILD_DIR, {
  index: false, // Don't serve index.html here
  maxAge: '1h'
}));

// Handle React routing — serve pre-rendered HTML when available, fallback to SPA index.html
app.get('*', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300, must-revalidate');
  res.set('Content-Type', 'text/html');

  // Check for a react-snap pre-rendered file for this exact route
  const prerenderedPath = path.join(BUILD_DIR, req.path, 'index.html');
  if (fs.existsSync(prerenderedPath)) {
    const html = stripTestingScripts(fs.readFileSync(prerenderedPath, 'utf8'));
    return res.send(html);
  }

  // SPA fallback: use the cached processed HTML
  const html = cachedSpaShell || cachedIndexHtml;
  if (html) {
    return res.send(html);
  }
  res.sendFile(path.join(BUILD_DIR, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Production server running on port ${PORT}`);
  console.log(`📦 Serving JS/CSS with 1-year cache + immutable`);
  console.log(`🗜️  Gzip compression enabled`);

  // Keep-alive: ping backend every 10 minutes to prevent Render free-tier sleep
  // Render spins down services after 15 min of inactivity; 10 min gives a 5 min safety buffer
  const KEEP_ALIVE_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

  function pingBackend() {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    if (!backendUrl) return; // skip in dev where backend is local

    const url = new URL('/api/health', backendUrl);
    const isHttps = url.protocol === 'https:';
    const transport = isHttps ? require('https') : http;

    const req = transport.get(url.toString(), (res) => {
      console.log(`[keep-alive] Backend ping OK — HTTP ${res.statusCode}`);
      res.resume(); // drain the response
    });
    req.on('error', (err) => {
      console.warn(`[keep-alive] Backend ping failed: ${err.message}`);
    });
    req.setTimeout(10000, () => {
      console.warn('[keep-alive] Backend ping timed out');
      req.destroy();
    });
  }

  if (IS_RENDER) {
    setInterval(pingBackend, KEEP_ALIVE_INTERVAL_MS);
    console.log(`[keep-alive] Pinging backend every 10 min to prevent Render sleep`);
  }
});
