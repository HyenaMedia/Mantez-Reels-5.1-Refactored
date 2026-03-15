"""
Iteration 14: Tests for three new features:
  1. src/utils/api.js — axios interceptor reading window.__BACKEND_URL__
  2. server.js — window.__BACKEND_URL__ injection + rrweb/badge strip regexes
  3. frontend/public/index.html — #app-shell with animation CSS
  4. Admin login (admin/admin123)
  5. Contact section gray-300 text regression check
  6. /health endpoint returning JSON
  7. Preview page loads without X-Frame-Options in dev
"""

import pytest
import requests
import re
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

API_JS_PATH = '/app/frontend/src/utils/api.js'
INDEX_JS_PATH = '/app/frontend/src/index.js'
SERVER_JS_PATH = '/app/frontend/server.js'
BUILD_INDEX_PATH = '/app/frontend/build/index.html'
PUBLIC_INDEX_PATH = '/app/frontend/public/index.html'
CONTACT_JSX_PATH = '/app/frontend/src/components/Contact.jsx'


@pytest.fixture(scope='module')
def homepage_response():
    r = requests.get(f'{BASE_URL}/', timeout=15)
    return r


@pytest.fixture(scope='module')
def homepage_html(homepage_response):
    return homepage_response.text


@pytest.fixture(scope='module')
def build_html():
    if not os.path.exists(BUILD_INDEX_PATH):
        return None
    return open(BUILD_INDEX_PATH).read()


# ─────────────────────────────────────────────────────────────
# SECTION 1: src/utils/api.js — axios interceptor
# ─────────────────────────────────────────────────────────────

class TestApiJsInterceptor:
    """Verify utils/api.js exists and contains correct axios interceptor logic"""

    def test_api_js_file_exists(self):
        """utils/api.js must exist"""
        assert os.path.exists(API_JS_PATH), f"Expected {API_JS_PATH} to exist"

    def test_api_js_imports_axios(self):
        """utils/api.js must import axios"""
        content = open(API_JS_PATH).read()
        assert "import axios from 'axios'" in content or 'import axios from "axios"' in content, (
            "utils/api.js must import axios"
        )

    def test_api_js_reads_window_backend_url(self):
        """Interceptor must read window.__BACKEND_URL__"""
        content = open(API_JS_PATH).read()
        assert 'window.__BACKEND_URL__' in content, (
            "utils/api.js must reference window.__BACKEND_URL__"
        )

    def test_api_js_has_axios_interceptor(self):
        """utils/api.js must register an axios request interceptor"""
        content = open(API_JS_PATH).read()
        assert 'axios.interceptors.request.use' in content, (
            "utils/api.js must call axios.interceptors.request.use(...)"
        )

    def test_api_js_returns_config_when_no_runtime_url(self):
        """Interceptor must return config unchanged when window.__BACKEND_URL__ is empty"""
        content = open(API_JS_PATH).read()
        assert 'if (!runtime) return config' in content or 'if(!runtime)return config' in content, (
            "Interceptor must short-circuit (return config) when runtime URL is empty"
        )

    def test_api_js_replaces_baked_url_with_runtime(self):
        """Interceptor must replace baked-in URL with runtime URL"""
        content = open(API_JS_PATH).read()
        assert 'config.url.replace' in content or 'url.replace' in content, (
            "Interceptor must replace baked-in URL with runtime URL"
        )

    def test_api_js_references_react_app_backend_url(self):
        """Interceptor must reference REACT_APP_BACKEND_URL as the baked-in URL"""
        content = open(API_JS_PATH).read()
        assert 'REACT_APP_BACKEND_URL' in content, (
            "utils/api.js should reference process.env.REACT_APP_BACKEND_URL"
        )


# ─────────────────────────────────────────────────────────────
# SECTION 2: index.js imports utils/api
# ─────────────────────────────────────────────────────────────

class TestIndexJsImport:
    """Verify index.js imports utils/api.js on line 8"""

    def test_index_js_imports_api(self):
        """index.js must import @/utils/api"""
        content = open(INDEX_JS_PATH).read()
        assert 'utils/api' in content, "index.js must import utils/api"

    def test_index_js_api_import_early(self):
        """api import should be among the first 10 lines"""
        lines = open(INDEX_JS_PATH).readlines()
        found = False
        for i, line in enumerate(lines[:10]):
            if 'utils/api' in line:
                found = True
                print(f"  Found utils/api import on line {i+1}: {line.strip()}")
                break
        assert found, "utils/api import should be in the first 10 lines of index.js"


# ─────────────────────────────────────────────────────────────
# SECTION 3: server.js — processHtml function
# ─────────────────────────────────────────────────────────────

class TestServerJsProcessHtml:
    """Verify server.js processHtml performs all expected HTML transformations"""

    def test_server_js_has_process_html_function(self):
        content = open(SERVER_JS_PATH).read()
        assert 'function processHtml' in content, "server.js must define processHtml function"

    def test_server_js_injects_backend_url_script(self):
        """processHtml must inject window.__BACKEND_URL__ script tag"""
        content = open(SERVER_JS_PATH).read()
        assert 'window.__BACKEND_URL__' in content, (
            "server.js must inject window.__BACKEND_URL__ in processHtml"
        )

    def test_server_js_backend_url_from_env(self):
        """window.__BACKEND_URL__ must be set from process.env.REACT_APP_BACKEND_URL"""
        content = open(SERVER_JS_PATH).read()
        assert 'process.env.REACT_APP_BACKEND_URL' in content, (
            "server.js must read REACT_APP_BACKEND_URL from env"
        )

    def test_server_js_injects_dns_prefetch_for_backend(self):
        """processHtml should inject dns-prefetch for the backend"""
        content = open(SERVER_JS_PATH).read()
        assert 'dns-prefetch' in content, "server.js must add dns-prefetch for backend URL"

    def test_server_js_injects_before_closing_head(self):
        """Backend URL injection must target </head> tag"""
        content = open(SERVER_JS_PATH).read()
        # Look in the processHtml function area
        assert '</head>' in content, "server.js must inject before </head>"

    def test_server_js_rrweb_strip_flexible_regex(self):
        """rrweb strip regex must handle both 'defer' and 'defer=\"defer\"' formats"""
        content = open(SERVER_JS_PATH).read()
        # Regex uses [^>]+ or [^>]* to match any attributes flexibly
        # Verify regex pattern is NOT bare (just 'defer src=')
        assert 'defer src=' not in content or '[^>]' in content, (
            "rrweb strip regex must use flexible [^>]+ pattern, not bare 'defer src='"
        )
        # Verify pattern handles any attribute order
        assert '[^>]' in content, "server.js rrweb regex must use [^>]+ or [^>]* for flexibility"

    def test_server_js_rrweb_strips_unpkg_script(self):
        """rrweb strip regex targets unpkg.com/rrweb (escaped in JS regex)"""
        content = open(SERVER_JS_PATH).read()
        # In JS source, the regex is written as unpkg\\.com\\/rrweb (escaped)
        assert 'unpkg' in content and 'rrweb' in content, (
            "server.js must have regex referencing unpkg rrweb script"
        )

    def test_server_js_rrweb_strips_cloudfront_script(self):
        """rrweb strip regex targets cloudfront CDN"""
        content = open(SERVER_JS_PATH).read()
        assert 'd2adkz2s9zrlge' in content, "server.js must have regex for cloudfront rrweb CDN"

    def test_server_js_badge_mutationobserver_strip_regex(self):
        """Badge MutationObserver removal script regex must exist"""
        content = open(SERVER_JS_PATH).read()
        # Check for MutationObserver stripping
        assert 'MutationObserver' in content, (
            "server.js must have regex to strip badge MutationObserver script"
        )
        # It should be in a .replace() call
        assert 'replace' in content, "Badge strip must use .replace() regex"

    def test_server_js_badge_strip_targets_window_addeventlistener(self):
        """Badge strip regex targets window.addEventListener pattern"""
        content = open(SERVER_JS_PATH).read()
        assert 'window\\.addEventListener' in content, (
            "Badge strip regex must match window.addEventListener pattern"
        )


# ─────────────────────────────────────────────────────────────
# SECTION 4: Verify rrweb regex actually works on build HTML
# ─────────────────────────────────────────────────────────────

class TestRrwebRegexOnBuild:
    """Verify rrweb stripping regex correctly matches CRA defer='defer' format"""

    def test_build_has_rrweb_scripts(self, build_html):
        if build_html is None:
            pytest.skip("build/index.html not found")
        assert 'unpkg.com/rrweb' in build_html, "Build must have rrweb script for stripping test"
        assert 'd2adkz2s9zrlge' in build_html, "Build must have cloudfront rrweb script"

    def test_rrweb_uses_defer_defer_format_in_build(self, build_html):
        """CRA v5 outputs defer='defer' format — regex must handle this"""
        if build_html is None:
            pytest.skip("build/index.html not found")
        assert 'defer="defer" src="https://unpkg.com/rrweb' in build_html or \
               'defer src="https://unpkg.com/rrweb' in build_html, (
            "Build rrweb script must have defer attribute"
        )

    def test_rrweb_regex_strips_scripts_in_simulated_prod(self, build_html):
        """Simulate IS_RENDER=true: both rrweb scripts must be stripped"""
        if build_html is None:
            pytest.skip("build/index.html not found")
        stripped = re.sub(r'<script[^>]+src="https://unpkg\.com/rrweb[^"]*"[^>]*><\/script>', '', build_html)
        stripped = re.sub(r'<script[^>]+src="https://d2adkz2s9zrlge[^"]*"[^>]*><\/script>', '', stripped)
        assert 'unpkg.com/rrweb' not in stripped, "rrweb unpkg script should be stripped in prod"
        assert 'd2adkz2s9zrlge' not in stripped, "rrweb cloudfront script should be stripped in prod"

    def test_badge_mutationobserver_script_regex_strips_in_simulated_prod(self, build_html):
        """Badge MutationObserver regex must strip DOMContentLoaded badge removal script"""
        if build_html is None:
            pytest.skip("build/index.html not found")
        # This is the same regex used in server.js
        stripped = re.sub(
            r'<script>window\.addEventListener\([^<]*MutationObserver[^<]*<\/script>',
            '',
            build_html
        )
        # After stripping, the window.addEventListener badge script should be gone
        # Count remaining MutationObserver references
        original_count = build_html.count('MutationObserver')
        stripped_count = stripped.count('MutationObserver')
        assert stripped_count < original_count, (
            f"Badge MutationObserver regex must strip at least one script. "
            f"Before: {original_count}, After: {stripped_count}"
        )


# ─────────────────────────────────────────────────────────────
# SECTION 5: #app-shell in HTML
# ─────────────────────────────────────────────────────────────

class TestAppShell:
    """Verify #app-shell splash screen in public/index.html and build/index.html"""

    def test_public_index_has_app_shell_div(self):
        """public/index.html must have <div id='app-shell'>"""
        content = open(PUBLIC_INDEX_PATH).read()
        assert 'id="app-shell"' in content or "id='app-shell'" in content, (
            "public/index.html must contain #app-shell div"
        )

    def test_public_index_has_shell_animation_css(self):
        """public/index.html must have CSS animation for app-shell"""
        content = open(PUBLIC_INDEX_PATH).read()
        assert '@keyframes shellPulse' in content, "Missing shellPulse keyframe animation"
        assert '@keyframes shellSweep' in content, "Missing shellSweep keyframe animation"

    def test_public_index_has_shell_auto_hide_css(self):
        """CSS :has() selector auto-hides shell when root has content"""
        content = open(PUBLIC_INDEX_PATH).read()
        assert 'body:has(#root > *) #app-shell' in content, (
            "Missing CSS :has() rule that auto-hides #app-shell when React mounts"
        )

    def test_build_index_has_app_shell_div(self, build_html):
        """build/index.html must also have app-shell"""
        if build_html is None:
            pytest.skip("build/index.html not found")
        assert 'id="app-shell"' in build_html, "Build index.html must contain #app-shell div"

    def test_build_index_has_shell_animation(self, build_html):
        """Build HTML must have animation keyframes"""
        if build_html is None:
            pytest.skip("build/index.html not found")
        assert 'shellPulse' in build_html, "Build HTML must have shellPulse animation"
        assert 'shellSweep' in build_html, "Build HTML must have shellSweep animation"

    def test_served_html_has_app_shell(self, homepage_html):
        """Served HTML must contain #app-shell div"""
        assert 'id="app-shell"' in homepage_html, (
            "Served HTML must contain #app-shell div"
        )

    def test_app_shell_has_mantez_letter(self, homepage_html):
        """App shell must show 'M' letter and 'Mantez Reels' name"""
        assert 'Mantez Reels' in homepage_html, "App shell must show 'Mantez Reels'"


# ─────────────────────────────────────────────────────────────
# SECTION 6: Contact gray-300 text (regression)
# ─────────────────────────────────────────────────────────────

class TestContactGray300Regression:
    """Verify Contact.jsx still uses gray-300 text (not dark/invisible text)"""

    def test_contact_jsx_uses_gray_300(self):
        content = open(CONTACT_JSX_PATH).read()
        assert 'text-gray-300' in content, (
            "Contact.jsx should use text-gray-300 for readable text (regression check)"
        )

    def test_contact_gray_300_count(self):
        """Multiple text-gray-300 instances expected in Contact.jsx"""
        content = open(CONTACT_JSX_PATH).read()
        count = content.count('text-gray-300')
        assert count >= 3, (
            f"Expected >=3 text-gray-300 instances in Contact.jsx, found {count}"
        )


# ─────────────────────────────────────────────────────────────
# SECTION 7: /health endpoint
# ─────────────────────────────────────────────────────────────

class TestHealthEndpoint:
    """Verify /health returns JSON"""

    def test_health_returns_200(self):
        r = requests.get(f'{BASE_URL}/health', timeout=10)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"

    def test_health_content_type_json(self):
        r = requests.get(f'{BASE_URL}/health', timeout=10)
        assert 'application/json' in r.headers.get('Content-Type', ''), (
            "Content-Type must be application/json"
        )

    def test_health_status_ok(self):
        data = requests.get(f'{BASE_URL}/health', timeout=10).json()
        assert data.get('status') == 'ok', f"Expected status='ok', got: {data.get('status')}"

    def test_health_environment_field(self):
        data = requests.get(f'{BASE_URL}/health', timeout=10).json()
        assert 'environment' in data, "Health response must include 'environment' field"

    def test_health_build_info(self):
        data = requests.get(f'{BASE_URL}/health', timeout=10).json()
        assert 'build' in data, "Health response must include 'build' field"
        assert 'rrweb_stripped' in data['build'], "'build' must have 'rrweb_stripped'"

    def test_health_backend_info(self):
        data = requests.get(f'{BASE_URL}/health', timeout=10).json()
        assert 'backend' in data, "Health response must include 'backend' field"

    def test_health_timestamp(self):
        data = requests.get(f'{BASE_URL}/health', timeout=10).json()
        assert 'timestamp' in data, "Health response must include 'timestamp'"


# ─────────────────────────────────────────────────────────────
# SECTION 8: Security Headers — no X-Frame-Options in dev
# ─────────────────────────────────────────────────────────────

class TestSecurityHeadersDev:
    """Verify dev-mode security headers (IS_RENDER=false)"""

    def test_no_x_frame_options_in_dev(self, homepage_response):
        """X-Frame-Options must NOT be present in dev (iframe preview must work)"""
        headers_lower = {k.lower(): v for k, v in homepage_response.headers.items()}
        assert 'x-frame-options' not in headers_lower, (
            f"X-Frame-Options must not be set in dev. Got: {headers_lower.get('x-frame-options')}"
        )

    def test_csp_frame_ancestors_wildcard(self, homepage_response):
        """CSP frame-ancestors must be '*' in dev (not 'none')"""
        csp = homepage_response.headers.get('Content-Security-Policy', '')
        assert "frame-ancestors *" in csp, f"Expected frame-ancestors * in dev CSP. Got: {csp}"

    def test_homepage_200(self, homepage_response):
        assert homepage_response.status_code == 200

    def test_rrweb_scripts_present_in_dev(self, homepage_html):
        """rrweb scripts should NOT be stripped in dev (IS_RENDER=false)"""
        assert 'unpkg.com/rrweb' in homepage_html, (
            "rrweb script should still be in served HTML in dev mode"
        )


# ─────────────────────────────────────────────────────────────
# SECTION 9: Admin Login
# ─────────────────────────────────────────────────────────────

class TestAdminLogin:
    """Verify admin login page is accessible"""

    def test_login_page_loads(self):
        r = requests.get(f'{BASE_URL}/login', timeout=10)
        assert r.status_code == 200

    def test_admin_page_loads(self):
        r = requests.get(f'{BASE_URL}/admin', timeout=10)
        # Should either load the admin page or redirect to login
        assert r.status_code in [200, 302, 401], (
            f"Admin page should return 200/302/401. Got: {r.status_code}"
        )

    def test_api_health_via_backend(self):
        """Backend /api/health is reachable"""
        r = requests.get(f'{BASE_URL}/api/health', timeout=10)
        assert r.status_code == 200


# ─────────────────────────────────────────────────────────────
# SECTION 10: window.__BACKEND_URL__ injection in served HTML
# ─────────────────────────────────────────────────────────────

class TestBackendUrlInjection:
    """Verify window.__BACKEND_URL__ behavior in served HTML"""

    def test_served_html_does_not_have_backend_url_injection_in_dev(self, homepage_html):
        """In dev, REACT_APP_BACKEND_URL is not set in Node.js runtime, so no injection"""
        # In dev env, the Node.js process does NOT load .env files.
        # So window.__BACKEND_URL__ will be empty/absent.
        # The injection only happens when REACT_APP_BACKEND_URL is set in runtime env.
        # This is the EXPECTED dev behavior.
        health_data = requests.get(f'{BASE_URL}/health', timeout=10).json()
        backend_configured = health_data.get('backend', {}).get('configured', False)
        if not backend_configured:
            # Window.__BACKEND_URL__ should NOT be injected when backend is not configured
            assert 'window.__BACKEND_URL__' not in homepage_html, (
                "window.__BACKEND_URL__ must not be injected when REACT_APP_BACKEND_URL is not in Node.js runtime env"
            )
            print("  EXPECTED: window.__BACKEND_URL__ absent (backend not configured in Node.js runtime)")
        else:
            # Backend is configured, injection should be present
            assert 'window.__BACKEND_URL__' in homepage_html, (
                "window.__BACKEND_URL__ must be injected when REACT_APP_BACKEND_URL is set"
            )
            print(f"  EXPECTED: window.__BACKEND_URL__ injected. Backend: {health_data['backend']['hint']}")
