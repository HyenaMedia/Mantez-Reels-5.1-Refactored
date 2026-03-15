"""
Tests for react-snap pre-rendering + loading shell implementation
Tests: pre-rendered routes (/), (/projects), (/privacy), SPA fallback (/login, /admin),
app-shell in HTML, hasChildNodes script, and file-based checks
"""
import pytest
import requests
import os
import re

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestPreRenderedRoutes:
    """Verify pre-rendered HTML files exist and have correct content"""

    def test_homepage_returns_full_html_not_empty_shell(self):
        """GET / must return HTML with actual page title 'Mantez Reels' and body content"""
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200
        html = response.text
        # Must have Mantez Reels in title
        assert 'Mantez Reels' in html, "Title 'Mantez Reels' not found in homepage HTML"
        # Must NOT be just an empty shell (~3KB) — pre-rendered is ~87KB
        assert len(html) > 20000, f"Homepage HTML too small ({len(html)} bytes) — likely SPA shell, not pre-rendered"
        # Must have navbar
        assert '<nav' in html, "Navbar <nav> not found in pre-rendered homepage"
        # Must have hero section
        assert 'id="hero"' in html or "hero" in html.lower(), "Hero section not found in pre-rendered HTML"

    def test_homepage_title_is_present(self):
        """GET / must return HTML with actual page title"""
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200
        title_match = re.search(r'<title>(.*?)</title>', response.text)
        assert title_match, "No <title> tag found"
        title = title_match.group(1)
        assert 'Mantez Reels' in title, f"Title '{title}' does not contain 'Mantez Reels'"

    def test_projects_route_pre_rendered(self):
        """GET /projects/ must return pre-rendered HTML with content"""
        response = requests.get(f"{BASE_URL}/projects/")
        assert response.status_code == 200
        html = response.text
        assert len(html) > 10000, f"Projects HTML too small ({len(html)} bytes) — likely SPA shell, not pre-rendered"
        # Should have title
        assert 'Mantez Reels' in html or 'Projects' in html

    def test_privacy_route_pre_rendered(self):
        """GET /privacy/ must return pre-rendered HTML"""
        response = requests.get(f"{BASE_URL}/privacy/")
        assert response.status_code == 200
        html = response.text
        assert len(html) > 5000, f"Privacy HTML too small ({len(html)} bytes) — likely SPA shell, not pre-rendered"
        assert 'Privacy' in html or 'privacy' in html.lower() or 'Mantez' in html


class TestSPAFallbackRoutes:
    """Verify /login and /admin use SPA fallback (not pre-rendered)"""

    def test_login_uses_spa_fallback(self):
        """GET /login must return SPA index.html (no pre-rendered file for this route)"""
        response = requests.get(f"{BASE_URL}/login")
        assert response.status_code == 200
        html = response.text
        # SPA shell should have an empty <div id="root"> — no pre-rendered children
        # Pre-rendered pages have a large #root with full content
        # The SPA shell root should be: <div id="root"></div>
        root_empty = re.search(r'<div id="root"\s*></div>', html) or \
                     re.search(r'<div id="root"></div>', html)
        assert root_empty, (
            f"GET /login returned pre-rendered content (root has children). "
            f"Expected empty SPA shell with <div id='root'></div>. "
            f"Response size: {len(html)} bytes"
        )

    def test_admin_uses_spa_fallback(self):
        """GET /admin must return SPA index.html"""
        response = requests.get(f"{BASE_URL}/admin")
        assert response.status_code == 200
        html = response.text
        root_empty = re.search(r'<div id="root"\s*></div>', html) or \
                     re.search(r'<div id="root"></div>', html)
        assert root_empty, (
            f"GET /admin returned pre-rendered content (root has children). "
            f"Expected empty SPA shell with <div id='root'></div>. "
            f"Response size: {len(html)} bytes"
        )


class TestBuildFileChecks:
    """Verify build/index.html has required shell elements (file-based checks)"""

    def test_build_index_has_app_shell_div(self):
        """build/index.html must contain id='app-shell'"""
        build_path = '/app/frontend/build/index.html'
        assert os.path.exists(build_path), "build/index.html does not exist"
        with open(build_path, 'r') as f:
            content = f.read()
        assert 'id="app-shell"' in content or "id='app-shell'" in content, (
            "build/index.html does NOT contain id='app-shell'. "
            "react-snap may have removed it during pre-rendering."
        )

    def test_build_index_has_haschildnodes_script(self):
        """build/index.html must contain the inline detection script with 'hasChildNodes'"""
        build_path = '/app/frontend/build/index.html'
        with open(build_path, 'r') as f:
            content = f.read()
        assert 'hasChildNodes' in content, (
            "build/index.html does NOT contain 'hasChildNodes' inline detection script."
        )

    def test_prerendered_homepage_size(self):
        """build/index.html should be large (pre-rendered, ~87KB) not small (SPA shell, ~3KB)"""
        build_path = '/app/frontend/build/index.html'
        size = os.path.getsize(build_path)
        assert size > 20000, f"build/index.html is only {size} bytes — too small for pre-rendered page"

    def test_projects_prerendered_file_exists(self):
        """build/projects/index.html must exist"""
        assert os.path.exists('/app/frontend/build/projects/index.html'), \
            "Pre-rendered /app/frontend/build/projects/index.html does not exist"

    def test_privacy_prerendered_file_exists(self):
        """build/privacy/index.html must exist"""
        assert os.path.exists('/app/frontend/build/privacy/index.html'), \
            "Pre-rendered /app/frontend/build/privacy/index.html does not exist"

    def test_login_no_prerendered_file(self):
        """build/login/index.html must NOT exist (SPA route)"""
        assert not os.path.exists('/app/frontend/build/login/index.html'), \
            "build/login/index.html exists but /login should be SPA-only"

    def test_admin_no_prerendered_file(self):
        """build/admin/index.html must NOT exist (SPA route)"""
        assert not os.path.exists('/app/frontend/build/admin/index.html'), \
            "build/admin/index.html exists but /admin should be SPA-only"

    def test_prerendered_root_has_content(self):
        """build/index.html #root div must have pre-rendered children (not empty)"""
        with open('/app/frontend/build/index.html', 'r') as f:
            content = f.read()
        # Empty root: <div id="root"></div>
        empty_root = bool(re.search(r'<div id="root"\s*></div>', content))
        assert not empty_root, "build/index.html has an empty #root — pre-rendering didn't work"
        # Must have App div
        assert 'class="App' in content, "#root does not contain pre-rendered App component"
