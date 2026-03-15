"""
Backend tests for Mantez Reels - Settings Context, Sitemap, Caching, and Collaboration removal
Tests: health check, settings GET/cache, sitemap generation, collaboration routes removed
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


@pytest.fixture(scope="module")
def api_client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def auth_token(api_client):
    """Get authentication token for admin user"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "username": "admin",
        "password": "admin123"
    })
    if response.status_code == 200:
        data = response.json()
        token = data.get("access_token") or data.get("token")
        if token:
            return token
    pytest.skip(f"Authentication failed with status {response.status_code}: {response.text[:200]}")


@pytest.fixture(scope="module")
def authenticated_client(api_client, auth_token):
    """Session with auth header"""
    api_client.headers.update({"Authorization": f"Bearer {auth_token}"})
    return api_client


# ─────────────────────────────────────────────
# Health Check
# ─────────────────────────────────────────────
class TestHealth:
    """Health endpoint tests"""

    def test_api_health_returns_200(self, api_client):
        """GET /api/health returns 200"""
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    def test_api_health_returns_healthy_status(self, api_client):
        """GET /api/health returns status=healthy"""
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy", f"Expected healthy, got: {data}"

    def test_api_health_has_database_connected(self, api_client):
        """GET /api/health shows database=connected"""
        response = api_client.get(f"{BASE_URL}/api/health")
        data = response.json()
        assert data.get("database") == "connected", f"Database not connected: {data}"


# ─────────────────────────────────────────────
# Settings - Public Endpoint (TTL Cache)
# ─────────────────────────────────────────────
class TestSettingsPublic:
    """Settings public endpoint tests"""

    def test_get_settings_returns_200(self, api_client):
        """GET /api/settings/ returns 200"""
        response = api_client.get(f"{BASE_URL}/api/settings/")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    def test_get_settings_has_site_section(self, api_client):
        """GET /api/settings/ returns site configuration"""
        response = api_client.get(f"{BASE_URL}/api/settings/")
        assert response.status_code == 200
        data = response.json()
        assert "site" in data, f"Missing 'site' section in settings: {data.keys()}"
        assert "siteName" in data["site"], "Missing siteName in site section"

    def test_get_settings_site_name_is_mantez_reels(self, api_client):
        """Settings site name defaults to Mantez Reels"""
        response = api_client.get(f"{BASE_URL}/api/settings/")
        data = response.json()
        site_name = data.get("site", {}).get("siteName", "")
        assert site_name == "Mantez Reels", f"Expected 'Mantez Reels', got: '{site_name}'"

    def test_get_settings_has_seo_section(self, api_client):
        """GET /api/settings/ returns SEO section"""
        response = api_client.get(f"{BASE_URL}/api/settings/")
        data = response.json()
        assert "seo" in data, f"Missing 'seo' section"

    def test_get_settings_has_siteUrl_field(self, api_client):
        """GET /api/settings/ returns siteUrl in site section"""
        response = api_client.get(f"{BASE_URL}/api/settings/")
        data = response.json()
        site = data.get("site", {})
        assert "siteUrl" in site, f"Missing 'siteUrl' in site section: {site.keys()}"

    def test_get_settings_caching_works(self, api_client):
        """Two consecutive GET /api/settings/ calls both return 200 (cache hit on 2nd)"""
        r1 = api_client.get(f"{BASE_URL}/api/settings/")
        r2 = api_client.get(f"{BASE_URL}/api/settings/")
        assert r1.status_code == 200
        assert r2.status_code == 200
        # Both responses should return same siteName
        d1 = r1.json().get("site", {}).get("siteName")
        d2 = r2.json().get("site", {}).get("siteName")
        assert d1 == d2, f"Cache mismatch: {d1} != {d2}"

    def test_get_settings_sensitive_fields_sanitized(self, api_client):
        """Public settings endpoint sanitizes sensitive analytics fields"""
        response = api_client.get(f"{BASE_URL}/api/settings/")
        data = response.json()
        seo = data.get("seo", {})
        # Sensitive fields should be empty on public endpoint
        assert seo.get("googleAnalyticsId") == "", f"googleAnalyticsId should be empty, got: {seo.get('googleAnalyticsId')}"
        assert seo.get("posthogApiKey") == "", f"posthogApiKey should be empty, got: {seo.get('posthogApiKey')}"


# ─────────────────────────────────────────────
# Sitemap Generation (Auth Required)
# ─────────────────────────────────────────────
class TestSitemapGeneration:
    """POST /api/settings/generate-sitemap endpoint tests"""

    def test_generate_sitemap_requires_auth(self, api_client):
        """POST /api/settings/generate-sitemap returns 401/403 without auth"""
        # Create unauthenticated client
        unauth_client = requests.Session()
        unauth_client.headers.update({"Content-Type": "application/json"})
        response = unauth_client.post(f"{BASE_URL}/api/settings/generate-sitemap", json={})
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"

    def test_generate_sitemap_returns_success(self, authenticated_client):
        """POST /api/settings/generate-sitemap returns success=true"""
        response = authenticated_client.post(f"{BASE_URL}/api/settings/generate-sitemap", json={})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") is True, f"Expected success=true, got: {data}"

    def test_generate_sitemap_returns_url_count(self, authenticated_client):
        """POST /api/settings/generate-sitemap returns url_count > 0"""
        response = authenticated_client.post(f"{BASE_URL}/api/settings/generate-sitemap", json={})
        assert response.status_code == 200
        data = response.json()
        url_count = data.get("url_count", 0)
        assert url_count > 0, f"Expected url_count > 0, got: {url_count}"

    def test_generate_sitemap_returns_xml_content(self, authenticated_client):
        """POST /api/settings/generate-sitemap returns valid XML sitemap content"""
        response = authenticated_client.post(f"{BASE_URL}/api/settings/generate-sitemap", json={})
        assert response.status_code == 200
        data = response.json()
        sitemap = data.get("sitemap", "")
        assert "<?xml" in sitemap, f"Missing XML declaration in sitemap: {sitemap[:100]}"
        assert "<urlset" in sitemap, f"Missing urlset in sitemap: {sitemap[:100]}"
        assert "<url>" in sitemap, f"Missing url entries in sitemap"

    def test_generate_sitemap_has_generated_at(self, authenticated_client):
        """POST /api/settings/generate-sitemap returns generated_at timestamp"""
        response = authenticated_client.post(f"{BASE_URL}/api/settings/generate-sitemap", json={})
        data = response.json()
        assert "generated_at" in data, f"Missing generated_at in response"
        assert isinstance(data["generated_at"], str)
        assert len(data["generated_at"]) > 0


# ─────────────────────────────────────────────
# Collaboration Routes Removed
# ─────────────────────────────────────────────
class TestCollaborationRoutesRemoved:
    """Collaboration routes should return 404"""

    def test_collaboration_active_users_returns_404(self, api_client):
        """GET /api/collaboration/active-users/test should return 404"""
        response = api_client.get(f"{BASE_URL}/api/collaboration/active-users/test")
        assert response.status_code == 404, f"Expected 404 (route removed), got {response.status_code}"

    def test_collaboration_root_returns_404(self, api_client):
        """GET /api/collaboration/ should return 404"""
        response = api_client.get(f"{BASE_URL}/api/collaboration/")
        assert response.status_code == 404, f"Expected 404 (route removed), got {response.status_code}"


# ─────────────────────────────────────────────
# Admin Auth
# ─────────────────────────────────────────────
class TestAdminAuth:
    """Admin login endpoint tests"""

    def test_admin_login_returns_200(self, api_client):
        """POST /api/auth/login with valid credentials returns 200"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        assert response.status_code == 200, f"Login failed: {response.status_code} - {response.text}"

    def test_admin_login_returns_access_token(self, api_client):
        """POST /api/auth/login returns access_token"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        token = data.get("access_token") or data.get("token")
        assert token is not None, f"No token in response: {data.keys()}"
        assert isinstance(token, str) and len(token) > 0

    def test_admin_login_invalid_returns_401(self, api_client):
        """POST /api/auth/login with wrong credentials returns 401"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
