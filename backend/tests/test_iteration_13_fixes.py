"""
Iteration 13: Tests for the multiple fixes applied to the Mantez Reels portfolio site.
Covers:
  1. X-Frame-Options NOT present in dev (IS_RENDER=false)
  2. CSP frame-ancestors * in dev
  3. rrweb regex stripping works on CRA defer="defer" format
  4. CSS preload injected BEFORE preconnect hints in served HTML
  5. Google Fonts URL has 400;500;600;700 only (no 800)
  6. /health endpoint returns correct JSON
  7. Service worker PRECACHE_URLS does not contain main.chunk.js
  8. API proxy /api/* returns 503 when backend URL not configured (internal)
"""

import pytest
import requests
import re
import os

# Use the public URL for all tests
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
INTERNAL_URL = 'http://localhost:3000'
BUILD_INDEX = '/app/frontend/build/index.html'


@pytest.fixture(scope='module')
def homepage_response():
    """Fetch the homepage once and reuse across tests."""
    r = requests.get(f'{BASE_URL}/')
    return r


@pytest.fixture(scope='module')
def homepage_html(homepage_response):
    return homepage_response.text


# ─────────────────────────────────────────────────────────────
# SECTION 1: Security Headers
# ─────────────────────────────────────────────────────────────

class TestSecurityHeaders:
    """Verify dev-mode security headers (IS_RENDER=false)"""

    def test_x_frame_options_not_present_in_dev(self, homepage_response):
        """X-Frame-Options must NOT be set in dev (only in IS_RENDER=true production)"""
        headers = {k.lower(): v for k, v in homepage_response.headers.items()}
        assert 'x-frame-options' not in headers, (
            f"X-Frame-Options should not be set in dev. Got: {headers.get('x-frame-options')}"
        )

    def test_csp_frame_ancestors_wildcard_in_dev(self, homepage_response):
        """CSP must contain frame-ancestors * in dev (not 'none')"""
        csp = homepage_response.headers.get('Content-Security-Policy', '')
        assert "frame-ancestors *" in csp, f"Expected 'frame-ancestors *' in CSP, got: {csp}"
        assert "frame-ancestors 'none'" not in csp, "frame-ancestors 'none' must NOT appear in dev CSP"

    def test_http_status_200(self, homepage_response):
        assert homepage_response.status_code == 200

    def test_hsts_present(self, homepage_response):
        """HSTS header should always be set"""
        hsts = homepage_response.headers.get('Strict-Transport-Security', '')
        assert 'max-age=31536000' in hsts

    def test_no_upgrade_insecure_requests_in_dev_csp(self, homepage_response):
        """upgrade-insecure-requests directive only in prod CSP"""
        csp = homepage_response.headers.get('Content-Security-Policy', '')
        assert 'upgrade-insecure-requests' not in csp, (
            "upgrade-insecure-requests should NOT be in dev CSP"
        )


# ─────────────────────────────────────────────────────────────
# SECTION 2: rrweb Regex Fix
# ─────────────────────────────────────────────────────────────

class TestRrwebRegexFix:
    """Verify the rrweb stripping regex works on CRA defer='defer' build output"""

    def test_rrweb_scripts_present_in_dev_build(self):
        """In dev (IS_RENDER=false) rrweb scripts should still be in the served HTML"""
        r = requests.get(f'{BASE_URL}/')
        assert 'unpkg.com/rrweb' in r.text, "rrweb script tag missing in dev build"
        assert 'd2adkz2s9zrlge.cloudfront.net' in r.text, "cloudfront rrweb script missing in dev build"

    def test_rrweb_regex_matches_defer_defer_format(self):
        """New regex must match <script defer='defer' src='...'> format from CRA v5 builds"""
        if not os.path.exists(BUILD_INDEX):
            pytest.skip("Build index.html not found")

        html = open(BUILD_INDEX).read()
        pattern = r'<script[^>]+src="https://unpkg\.com/rrweb[^"]*"[^>]*><\/script>'
        matches = re.findall(pattern, html)
        assert len(matches) >= 1, (
            f"Regex must match rrweb script tag with defer='defer' format. "
            f"HTML snippet: {html[html.find('unpkg'):html.find('unpkg')+200] if 'unpkg' in html else 'NOT FOUND'}"
        )
        # Confirm the matched tag actually has defer="defer" (CRA v5 format)
        assert 'defer="defer"' in matches[0], (
            f"Expected defer='defer' in matched tag but got: {matches[0]}"
        )

    def test_cloudfront_rrweb_regex_matches(self):
        """Second regex must also match the cloudfront rrweb recorder script"""
        if not os.path.exists(BUILD_INDEX):
            pytest.skip("Build index.html not found")

        html = open(BUILD_INDEX).read()
        pattern = r'<script[^>]+src="https://d2adkz2s9zrlge[^"]*"[^>]*><\/script>'
        matches = re.findall(pattern, html)
        assert len(matches) >= 1, "Regex must match cloudfront rrweb recorder script"

    def test_simulated_prod_stripping_removes_rrweb(self):
        """Simulate IS_RENDER=true: both rrweb scripts should be stripped"""
        if not os.path.exists(BUILD_INDEX):
            pytest.skip("Build index.html not found")

        html = open(BUILD_INDEX).read()
        # Apply both strip regexes (same as server.js processHtml with IS_RENDER=true)
        stripped = re.sub(r'<script[^>]+src="https://unpkg\.com/rrweb[^"]*"[^>]*><\/script>', '', html)
        stripped = re.sub(r'<script[^>]+src="https://d2adkz2s9zrlge[^"]*"[^>]*><\/script>', '', stripped)

        assert 'unpkg.com/rrweb' not in stripped, "rrweb script should be stripped in prod mode"
        assert 'd2adkz2s9zrlge.cloudfront.net' not in stripped, "cloudfront rrweb should be stripped in prod mode"


# ─────────────────────────────────────────────────────────────
# SECTION 3: CSS Preload Injection
# ─────────────────────────────────────────────────────────────

class TestCssPreloadInjection:
    """Verify CSS preload hint appears BEFORE preconnect in served HTML"""

    def test_css_preload_injected_in_served_html(self, homepage_html):
        """CSS preload link for /static/css/main.*.css should appear in served HTML"""
        assert 'rel="preload" href="/static/css/main.' in homepage_html, (
            "CSS preload hint for main.*.css not found in served HTML"
        )
        assert 'as="style"' in homepage_html, "CSS preload link missing as='style' attribute"

    def test_css_preload_before_preconnect_in_served_html(self, homepage_html):
        """CSS preload must appear BEFORE the first preconnect link"""
        preload_idx = homepage_html.find('rel="preload" href="/static/css/main.')
        preconnect_idx = homepage_html.find('rel="preconnect"')
        assert preload_idx != -1, "CSS preload not found"
        assert preconnect_idx != -1, "preconnect not found"
        assert preload_idx < preconnect_idx, (
            f"CSS preload (idx={preload_idx}) must come before preconnect (idx={preconnect_idx})"
        )

    def test_css_preload_not_in_build_html_before_serving(self):
        """Build HTML should NOT have preload for static/css/main — server injects it at serve time"""
        if not os.path.exists(BUILD_INDEX):
            pytest.skip("Build index.html not found")
        build_html = open(BUILD_INDEX).read()
        # The preload should be ABSENT in the raw build — server.js injects it
        has_preload = bool(re.search(r'rel="preload"\s+href="/static/css/main\.', build_html))
        assert not has_preload, (
            "Preload for /static/css/main.*.css should NOT be in raw build HTML; "
            "it must be injected by server.js processHtml at serve time"
        )


# ─────────────────────────────────────────────────────────────
# SECTION 4: Google Fonts Weights
# ─────────────────────────────────────────────────────────────

class TestGoogleFonts:
    """Verify Google Fonts loads only 4 weights (no 800)"""

    def test_fonts_no_weight_800_in_served_html(self, homepage_html):
        """Google Fonts URL must not contain weight 800"""
        font_urls = re.findall(r'fonts\.googleapis\.com/css2[^"\']+', homepage_html)
        for url in font_urls:
            assert '800' not in url, f"Font URL must not contain weight 800: {url}"

    def test_fonts_has_correct_weights_in_served_html(self, homepage_html):
        """Google Fonts URL must have 400;500;600;700 weights"""
        assert 'wght@400;500;600;700' in homepage_html or 'wght@400,500,600,700' in homepage_html, (
            "Google Fonts must have weights 400;500;600;700"
        )

    def test_fonts_no_weight_800_in_build_index(self):
        """Verify source index.html doesn't have weight 800 either"""
        if not os.path.exists('/app/frontend/public/index.html'):
            pytest.skip("Source index.html not found")
        src = open('/app/frontend/public/index.html').read()
        assert '800' not in src or 'wght@' not in src or '800' not in re.search(r'wght@[^&"]+', src).group(0), (
            "Source index.html should not contain font weight 800"
        )


# ─────────────────────────────────────────────────────────────
# SECTION 5: Health Endpoint
# ─────────────────────────────────────────────────────────────

class TestHealthEndpoint:
    """Verify /health returns correct JSON"""

    def test_health_returns_200(self):
        r = requests.get(f'{BASE_URL}/health')
        assert r.status_code == 200

    def test_health_content_type_json(self):
        r = requests.get(f'{BASE_URL}/health')
        assert 'application/json' in r.headers.get('Content-Type', '')

    def test_health_status_ok(self):
        data = requests.get(f'{BASE_URL}/health').json()
        assert data.get('status') == 'ok', f"Expected status='ok', got: {data.get('status')}"

    def test_health_environment_development(self):
        """In preview env (IS_RENDER=false) environment should be 'development'"""
        data = requests.get(f'{BASE_URL}/health').json()
        assert data.get('environment') == 'development', (
            f"Expected environment='development', got: {data.get('environment')}"
        )

    def test_health_rrweb_stripped_false_in_dev(self):
        """rrweb_stripped must be false in dev (IS_RENDER=false)"""
        data = requests.get(f'{BASE_URL}/health').json()
        build = data.get('build', {})
        assert build.get('rrweb_stripped') is False, (
            f"Expected rrweb_stripped=false in dev, got: {build.get('rrweb_stripped')}"
        )

    def test_health_build_exists_true(self):
        data = requests.get(f'{BASE_URL}/health').json()
        build = data.get('build', {})
        assert build.get('exists') is True, "Build index.html must exist"

    def test_health_has_timestamp(self):
        data = requests.get(f'{BASE_URL}/health').json()
        assert 'timestamp' in data, "Health response must include 'timestamp'"

    def test_health_has_backend_info(self):
        data = requests.get(f'{BASE_URL}/health').json()
        assert 'backend' in data, "Health response must include 'backend' key"
        backend = data['backend']
        assert 'configured' in backend, "'configured' key missing from backend info"
        assert 'hint' in backend, "'hint' key missing from backend info"


# ─────────────────────────────────────────────────────────────
# SECTION 6: Service Worker
# ─────────────────────────────────────────────────────────────

class TestServiceWorker:
    """Verify service worker PRECACHE_URLS is correct"""

    def test_service_worker_no_main_chunk_js(self):
        """PRECACHE_URLS must not contain main.chunk.js (breaks if content hash changes)"""
        sw_path = '/app/frontend/public/service-worker.js'
        if not os.path.exists(sw_path):
            pytest.skip("service-worker.js not found")
        content = open(sw_path).read()
        assert 'main.chunk.js' not in content, "service-worker.js PRECACHE_URLS must not have main.chunk.js"

    def test_service_worker_has_core_urls(self):
        """PRECACHE_URLS must have '/', '/index.html', '/manifest.json'"""
        sw_path = '/app/frontend/public/service-worker.js'
        if not os.path.exists(sw_path):
            pytest.skip("service-worker.js not found")
        content = open(sw_path).read()
        assert "'/'," in content or '"/"' in content, "PRECACHE_URLS missing '/'"
        assert '/index.html' in content, "PRECACHE_URLS missing '/index.html'"
        assert '/manifest.json' in content, "PRECACHE_URLS missing '/manifest.json'"

    def test_service_worker_served_over_http(self):
        """Service worker file must be publicly accessible"""
        r = requests.get(f'{BASE_URL}/service-worker.js')
        assert r.status_code == 200
        assert 'PRECACHE_URLS' in r.text


# ─────────────────────────────────────────────────────────────
# SECTION 7: API Proxy 503 Behavior
# ─────────────────────────────────────────────────────────────

class TestApiProxy503:
    """Verify API proxy returns 503 when REACT_APP_BACKEND_URL not configured"""

    def test_api_proxy_503_via_internal_node_server(self):
        """When REACT_APP_BACKEND_URL is not set, Node.js server returns 503"""
        try:
            r = requests.get(f'{INTERNAL_URL}/api/nonexistent-endpoint-test', timeout=5)
            # Should return 503 since REACT_APP_BACKEND_URL is not set in Node.js runtime
            assert r.status_code == 503, (
                f"Expected 503, got {r.status_code}. Body: {r.text[:200]}"
            )
            data = r.json()
            assert 'Backend URL not configured' in data.get('detail', ''), (
                f"Expected hint in 503 body, got: {data}"
            )
        except requests.exceptions.ConnectionError:
            pytest.skip("Internal Node.js server not reachable at localhost:3000")
