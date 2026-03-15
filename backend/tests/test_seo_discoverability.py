"""
Backend tests for Mantez Reels - AI/SEO Discoverability Features
Tests: robots.txt, llms.txt, sitemap.xml, social settings, seoFiles, settings structure
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
    pytest.skip(f"Authentication failed: {response.status_code}: {response.text[:200]}")


@pytest.fixture(scope="module")
def authenticated_client(api_client, auth_token):
    """Session with auth header"""
    api_client.headers.update({"Authorization": f"Bearer {auth_token}"})
    return api_client


# ─────────────────────────────────────────────
# Public robots.txt (via frontend proxy /robots.txt)
# ─────────────────────────────────────────────
class TestRobotsTxtPublic:
    """Test GET /robots.txt served from frontend proxy"""

    def test_robots_txt_returns_200(self, api_client):
        """GET /robots.txt returns 200"""
        response = requests.get(f"{BASE_URL}/robots.txt")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text[:200]}"

    def test_robots_txt_content_type_is_text(self, api_client):
        """GET /robots.txt returns text/plain content type"""
        response = requests.get(f"{BASE_URL}/robots.txt")
        assert response.status_code == 200
        ct = response.headers.get("Content-Type", "")
        assert "text" in ct.lower(), f"Expected text/plain content-type, got: {ct}"

    def test_robots_txt_has_user_agent_wildcard(self, api_client):
        """GET /robots.txt contains User-agent: *"""
        response = requests.get(f"{BASE_URL}/robots.txt")
        assert response.status_code == 200
        assert "User-agent: *" in response.text, f"Missing 'User-agent: *' in robots.txt: {response.text[:300]}"

    def test_robots_txt_has_gptbot(self, api_client):
        """GET /robots.txt has GPTBot section"""
        response = requests.get(f"{BASE_URL}/robots.txt")
        assert response.status_code == 200
        assert "GPTBot" in response.text, f"Missing GPTBot in robots.txt: {response.text[:500]}"

    def test_robots_txt_has_claudebot(self, api_client):
        """GET /robots.txt has ClaudeBot section"""
        response = requests.get(f"{BASE_URL}/robots.txt")
        assert response.status_code == 200
        assert "ClaudeBot" in response.text, f"Missing ClaudeBot in robots.txt: {response.text[:500]}"

    def test_robots_txt_has_perplexitybot(self, api_client):
        """GET /robots.txt has PerplexityBot section"""
        response = requests.get(f"{BASE_URL}/robots.txt")
        assert response.status_code == 200
        assert "PerplexityBot" in response.text, f"Missing PerplexityBot in robots.txt: {response.text[:500]}"

    def test_robots_txt_has_google_extended(self, api_client):
        """GET /robots.txt has Google-Extended section"""
        response = requests.get(f"{BASE_URL}/robots.txt")
        assert response.status_code == 200
        assert "Google-Extended" in response.text, f"Missing Google-Extended in robots.txt: {response.text[:500]}"

    def test_robots_txt_disallows_admin(self, api_client):
        """GET /robots.txt disallows /admin"""
        response = requests.get(f"{BASE_URL}/robots.txt")
        assert response.status_code == 200
        assert "Disallow: /admin" in response.text, f"Missing Disallow: /admin in robots.txt"


# ─────────────────────────────────────────────
# Public llms.txt (via frontend proxy /llms.txt)
# ─────────────────────────────────────────────
class TestLlmsTxtPublic:
    """Test GET /llms.txt served from frontend proxy"""

    def test_llms_txt_returns_200(self, api_client):
        """GET /llms.txt returns 200"""
        response = requests.get(f"{BASE_URL}/llms.txt")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text[:200]}"

    def test_llms_txt_content_type_is_text(self, api_client):
        """GET /llms.txt returns text/plain content type"""
        response = requests.get(f"{BASE_URL}/llms.txt")
        ct = response.headers.get("Content-Type", "")
        assert "text" in ct.lower(), f"Expected text/plain content-type, got: {ct}"

    def test_llms_txt_has_mantez_reels_heading(self, api_client):
        """GET /llms.txt contains # Mantez Reels heading"""
        response = requests.get(f"{BASE_URL}/llms.txt")
        assert response.status_code == 200
        assert "Mantez Reels" in response.text, f"Missing 'Mantez Reels' in llms.txt: {response.text[:300]}"

    def test_llms_txt_has_services_section(self, api_client):
        """GET /llms.txt has ## Services section"""
        response = requests.get(f"{BASE_URL}/llms.txt")
        assert response.status_code == 200
        assert "Services" in response.text, f"Missing Services section in llms.txt: {response.text[:500]}"

    def test_llms_txt_has_videography_service(self, api_client):
        """GET /llms.txt mentions video production or videography"""
        response = requests.get(f"{BASE_URL}/llms.txt")
        assert response.status_code == 200
        text_lower = response.text.lower()
        assert "video" in text_lower or "videography" in text_lower, f"Missing video/videography in llms.txt: {response.text[:500]}"

    def test_llms_txt_is_markdown_format(self, api_client):
        """GET /llms.txt uses markdown format (# heading)"""
        response = requests.get(f"{BASE_URL}/llms.txt")
        assert response.status_code == 200
        assert "#" in response.text, f"No markdown headings (#) in llms.txt: {response.text[:300]}"


# ─────────────────────────────────────────────
# Public sitemap.xml (via frontend proxy /sitemap.xml)
# ─────────────────────────────────────────────
class TestSitemapXmlPublic:
    """Test GET /sitemap.xml served from frontend proxy"""

    def test_sitemap_xml_returns_200(self, api_client):
        """GET /sitemap.xml returns 200"""
        response = requests.get(f"{BASE_URL}/sitemap.xml")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text[:200]}"

    def test_sitemap_xml_content_type(self, api_client):
        """GET /sitemap.xml returns application/xml content type"""
        response = requests.get(f"{BASE_URL}/sitemap.xml")
        ct = response.headers.get("Content-Type", "")
        assert "xml" in ct.lower(), f"Expected application/xml, got: {ct}"

    def test_sitemap_xml_has_xml_declaration(self, api_client):
        """GET /sitemap.xml has XML declaration"""
        response = requests.get(f"{BASE_URL}/sitemap.xml")
        assert response.status_code == 200
        assert "<?xml" in response.text, f"Missing XML declaration: {response.text[:200]}"

    def test_sitemap_xml_has_urlset(self, api_client):
        """GET /sitemap.xml contains urlset element"""
        response = requests.get(f"{BASE_URL}/sitemap.xml")
        assert response.status_code == 200
        assert "<urlset" in response.text, f"Missing urlset element: {response.text[:300]}"

    def test_sitemap_xml_has_url_entries(self, api_client):
        """GET /sitemap.xml contains url entries"""
        response = requests.get(f"{BASE_URL}/sitemap.xml")
        assert response.status_code == 200
        assert "<url>" in response.text, f"Missing url entries: {response.text[:400]}"

    def test_sitemap_xml_has_loc_elements(self, api_client):
        """GET /sitemap.xml contains loc elements"""
        response = requests.get(f"{BASE_URL}/sitemap.xml")
        assert response.status_code == 200
        assert "<loc>" in response.text, f"Missing loc elements: {response.text[:400]}"


# ─────────────────────────────────────────────
# API settings/robots.txt (direct backend)
# ─────────────────────────────────────────────
class TestApiRobotsTxt:
    """Test GET /api/settings/robots.txt"""

    def test_api_robots_txt_returns_200(self, api_client):
        """GET /api/settings/robots.txt returns 200"""
        response = api_client.get(f"{BASE_URL}/api/settings/robots.txt")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    def test_api_robots_txt_matches_public(self, api_client):
        """GET /api/settings/robots.txt content matches /robots.txt"""
        api_response = api_client.get(f"{BASE_URL}/api/settings/robots.txt")
        public_response = requests.get(f"{BASE_URL}/robots.txt")
        assert api_response.status_code == 200
        assert public_response.status_code == 200
        assert api_response.text == public_response.text, "Content mismatch between API and public robots.txt"

    def test_api_robots_txt_has_ai_crawlers(self, api_client):
        """GET /api/settings/robots.txt has AI crawler rules"""
        response = api_client.get(f"{BASE_URL}/api/settings/robots.txt")
        assert response.status_code == 200
        assert "GPTBot" in response.text
        assert "ClaudeBot" in response.text


# ─────────────────────────────────────────────
# API settings/llms.txt (direct backend)
# ─────────────────────────────────────────────
class TestApiLlmsTxt:
    """Test GET /api/settings/llms.txt"""

    def test_api_llms_txt_returns_200(self, api_client):
        """GET /api/settings/llms.txt returns 200"""
        response = api_client.get(f"{BASE_URL}/api/settings/llms.txt")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    def test_api_llms_txt_matches_public(self, api_client):
        """GET /api/settings/llms.txt content matches /llms.txt"""
        api_response = api_client.get(f"{BASE_URL}/api/settings/llms.txt")
        public_response = requests.get(f"{BASE_URL}/llms.txt")
        assert api_response.status_code == 200
        assert public_response.status_code == 200
        assert api_response.text == public_response.text, "Content mismatch between API and public llms.txt"

    def test_api_llms_txt_has_content(self, api_client):
        """GET /api/settings/llms.txt returns non-empty content"""
        response = api_client.get(f"{BASE_URL}/api/settings/llms.txt")
        assert response.status_code == 200
        assert len(response.text.strip()) > 50, "llms.txt content too short"


# ─────────────────────────────────────────────
# Settings Structure - social and seoFiles
# ─────────────────────────────────────────────
class TestSettingsStructure:
    """Test /api/settings/ has social and seoFiles fields"""

    def test_settings_has_social_object(self, api_client):
        """GET /api/settings/ response includes 'social' object"""
        response = api_client.get(f"{BASE_URL}/api/settings/")
        assert response.status_code == 200
        data = response.json()
        assert "social" in data, f"Missing 'social' in settings: {list(data.keys())}"
        assert isinstance(data["social"], dict), f"'social' should be a dict, got: {type(data['social'])}"

    def test_settings_social_has_instagram_field(self, api_client):
        """GET /api/settings/ social object has instagram field"""
        response = api_client.get(f"{BASE_URL}/api/settings/")
        data = response.json()
        social = data.get("social", {})
        assert "instagram" in social, f"Missing 'instagram' in social: {list(social.keys())}"

    def test_settings_social_has_youtube_field(self, api_client):
        """GET /api/settings/ social object has youtube field"""
        response = api_client.get(f"{BASE_URL}/api/settings/")
        data = response.json()
        social = data.get("social", {})
        assert "youtube" in social, f"Missing 'youtube' in social: {list(social.keys())}"

    def test_settings_social_has_vimeo_field(self, api_client):
        """GET /api/settings/ social object has vimeo field"""
        response = api_client.get(f"{BASE_URL}/api/settings/")
        data = response.json()
        social = data.get("social", {})
        assert "vimeo" in social, f"Missing 'vimeo' in social: {list(social.keys())}"

    def test_settings_social_has_linkedin_field(self, api_client):
        """GET /api/settings/ social object has linkedin field"""
        response = api_client.get(f"{BASE_URL}/api/settings/")
        data = response.json()
        social = data.get("social", {})
        assert "linkedin" in social, f"Missing 'linkedin' in social: {list(social.keys())}"

    def test_settings_has_seofiles_object(self, api_client):
        """GET /api/settings/ response includes 'seoFiles' object"""
        response = api_client.get(f"{BASE_URL}/api/settings/")
        assert response.status_code == 200
        data = response.json()
        assert "seoFiles" in data, f"Missing 'seoFiles' in settings: {list(data.keys())}"
        assert isinstance(data["seoFiles"], dict), f"'seoFiles' should be a dict"

    def test_settings_seofiles_has_robotstxt(self, api_client):
        """GET /api/settings/ seoFiles has robotsTxt field"""
        response = api_client.get(f"{BASE_URL}/api/settings/")
        data = response.json()
        seo_files = data.get("seoFiles", {})
        assert "robotsTxt" in seo_files, f"Missing 'robotsTxt' in seoFiles: {list(seo_files.keys())}"

    def test_settings_seofiles_has_llmstxt(self, api_client):
        """GET /api/settings/ seoFiles has llmsTxt field"""
        response = api_client.get(f"{BASE_URL}/api/settings/")
        data = response.json()
        seo_files = data.get("seoFiles", {})
        assert "llmsTxt" in seo_files, f"Missing 'llmsTxt' in seoFiles: {list(seo_files.keys())}"

    def test_settings_seofiles_robotstxt_has_ai_crawlers(self, api_client):
        """GET /api/settings/ seoFiles.robotsTxt contains AI crawler rules"""
        response = api_client.get(f"{BASE_URL}/api/settings/")
        data = response.json()
        robots_txt = data.get("seoFiles", {}).get("robotsTxt", "")
        assert "GPTBot" in robots_txt, f"Missing GPTBot in seoFiles.robotsTxt"
        assert "ClaudeBot" in robots_txt, f"Missing ClaudeBot in seoFiles.robotsTxt"

    def test_settings_seofiles_llmstxt_has_content(self, api_client):
        """GET /api/settings/ seoFiles.llmsTxt has markdown content"""
        response = api_client.get(f"{BASE_URL}/api/settings/")
        data = response.json()
        llms_txt = data.get("seoFiles", {}).get("llmsTxt", "")
        assert len(llms_txt) > 50, f"llmsTxt content too short: '{llms_txt[:100]}'"
        assert "Mantez Reels" in llms_txt, f"Missing 'Mantez Reels' in llmsTxt"


# ─────────────────────────────────────────────
# Update Social Settings (Auth Required)
# ─────────────────────────────────────────────
class TestUpdateSocialSettings:
    """Test PUT /api/settings/ with social data"""

    def test_update_social_returns_200(self, authenticated_client):
        """PUT /api/settings/ with social data returns 200"""
        payload = {
            "social": {
                "instagram": "https://instagram.com/TEST_mantezreels",
                "youtube": "",
                "vimeo": "",
                "tiktok": "",
                "linkedin": "",
                "twitter": ""
            }
        }
        response = authenticated_client.put(f"{BASE_URL}/api/settings/", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text[:300]}"

    def test_update_social_persists_instagram(self, authenticated_client):
        """PUT /api/settings/ social update persists to GET"""
        test_url = "https://instagram.com/TEST_mantezreels_persist"
        payload = {
            "social": {
                "instagram": test_url,
                "youtube": "",
                "vimeo": "",
                "tiktok": "",
                "linkedin": "",
                "twitter": ""
            }
        }
        put_response = authenticated_client.put(f"{BASE_URL}/api/settings/", json=payload)
        assert put_response.status_code == 200

        # Verify persistence via GET (bypass cache with authenticated client)
        get_response = authenticated_client.get(f"{BASE_URL}/api/settings/")
        assert get_response.status_code == 200
        data = get_response.json()
        stored_instagram = data.get("social", {}).get("instagram", "")
        assert stored_instagram == test_url, f"Expected '{test_url}', got '{stored_instagram}'"

    def test_update_social_response_has_social_field(self, authenticated_client):
        """PUT /api/settings/ response includes social field"""
        payload = {"social": {"instagram": "https://instagram.com/TEST_check"}}
        response = authenticated_client.put(f"{BASE_URL}/api/settings/", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "social" in data, f"Missing 'social' in PUT response: {list(data.keys())}"

    def test_update_social_requires_auth(self, api_client):
        """PUT /api/settings/ without auth returns 401/403"""
        unauth_client = requests.Session()
        unauth_client.headers.update({"Content-Type": "application/json"})
        response = unauth_client.put(f"{BASE_URL}/api/settings/", json={"social": {}})
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"

    def test_update_seofiles_robotstxt(self, authenticated_client):
        """PUT /api/settings/ with seoFiles.robotsTxt updates robots.txt"""
        custom_robots = "User-agent: *\nAllow: /\n# TEST custom robots"
        payload = {"seoFiles": {"robotsTxt": custom_robots, "llmsTxt": "# TEST llms"}}
        response = authenticated_client.put(f"{BASE_URL}/api/settings/", json=payload)
        assert response.status_code == 200
        data = response.json()
        stored = data.get("seoFiles", {}).get("robotsTxt", "")
        assert "TEST custom robots" in stored, f"robotsTxt update not reflected: '{stored[:200]}'"

    def test_cleanup_restore_defaults(self, authenticated_client):
        """Restore default robots.txt/llms.txt and social settings after tests"""
        # Reset via POST /api/settings/reset
        response = authenticated_client.post(f"{BASE_URL}/api/settings/reset")
        assert response.status_code == 200, f"Reset failed: {response.status_code}: {response.text[:200]}"
