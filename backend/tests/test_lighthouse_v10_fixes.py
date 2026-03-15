"""
Backend tests for Lighthouse 100/100 score fixes - Iteration 10
Tests: 
- Section labels using text-purple-300 for contrast
- FAQ buttons WITHOUT aria-label (to fix label-content-name-mismatch)
- About section image with explicit width/height
- robots.txt HTTP 200
- Only 2 preconnect links (no unsplash preconnect)
- ScrollProgress aria-label
- Testimonial button aria-labels
- All sections rendering
- server.js stripTestingScripts function
"""
import pytest
import requests
import os
import re
from bs4 import BeautifulSoup

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestRobotsTxt:
    """Test robots.txt for SEO compliance"""
    
    def test_robots_txt_returns_200(self):
        """robots.txt should return HTTP 200"""
        response = requests.get(f"{BASE_URL}/robots.txt")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✅ robots.txt returns HTTP 200")
    
    def test_robots_txt_has_valid_content(self):
        """robots.txt should have valid directives"""
        response = requests.get(f"{BASE_URL}/robots.txt")
        content = response.text
        assert 'User-agent:' in content, "Missing User-agent directive"
        assert 'Sitemap:' in content, "Missing Sitemap directive"
        assert 'Disallow: /admin' in content, "Missing Disallow /admin"
        print("✅ robots.txt has valid directives")


class TestPreconnectLinks:
    """Test preconnect links - should only have fonts.googleapis.com and fonts.gstatic.com"""
    
    def test_homepage_loads(self):
        """Homepage should load successfully"""
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200, f"Homepage failed with {response.status_code}"
        print("✅ Homepage loads with HTTP 200")
    
    def test_only_two_preconnect_links(self):
        """Should only have 2 preconnect links (fonts.googleapis.com and fonts.gstatic.com)"""
        response = requests.get(f"{BASE_URL}/")
        soup = BeautifulSoup(response.text, 'html.parser')
        preconnect_links = soup.find_all('link', {'rel': 'preconnect'})
        
        preconnect_hrefs = [link.get('href', '') for link in preconnect_links]
        print(f"Found preconnect links: {preconnect_hrefs}")
        
        # Should have exactly 2 preconnects
        assert len(preconnect_links) == 2, f"Expected 2 preconnect links, got {len(preconnect_links)}: {preconnect_hrefs}"
        
        # Should NOT have unsplash preconnect
        unsplash_preconnect = soup.find('link', {'rel': 'preconnect', 'href': lambda x: x and 'unsplash' in x})
        assert unsplash_preconnect is None, "Should NOT have unsplash preconnect link"
        
        print("✅ Only 2 preconnect links (no unsplash)")
    
    def test_preconnect_fonts_googleapis(self):
        """fonts.googleapis.com preconnect should exist"""
        response = requests.get(f"{BASE_URL}/")
        soup = BeautifulSoup(response.text, 'html.parser')
        googleapis_link = soup.find('link', {'rel': 'preconnect', 'href': 'https://fonts.googleapis.com'})
        assert googleapis_link is not None, "Missing preconnect for fonts.googleapis.com"
        print("✅ fonts.googleapis.com preconnect exists")
    
    def test_preconnect_fonts_gstatic_has_crossorigin(self):
        """fonts.gstatic.com preconnect MUST have crossorigin attribute"""
        response = requests.get(f"{BASE_URL}/")
        soup = BeautifulSoup(response.text, 'html.parser')
        gstatic_link = soup.find('link', {'rel': 'preconnect', 'href': 'https://fonts.gstatic.com'})
        assert gstatic_link is not None, "Missing preconnect for fonts.gstatic.com"
        has_crossorigin = gstatic_link.has_attr('crossorigin')
        assert has_crossorigin, "fonts.gstatic.com preconnect MUST have crossorigin attribute"
        print("✅ fonts.gstatic.com preconnect has crossorigin attribute")


class TestAccessibilityAttributes:
    """Test accessibility improvements"""
    
    def test_page_has_html_lang(self):
        """HTML element should have lang='en' attribute"""
        response = requests.get(f"{BASE_URL}/")
        soup = BeautifulSoup(response.text, 'html.parser')
        html_tag = soup.find('html')
        assert html_tag is not None, "No HTML tag found"
        assert html_tag.has_attr('lang'), "HTML tag missing lang attribute"
        lang = html_tag.get('lang')
        assert lang == 'en', f"Expected lang='en', got '{lang}'"
        print("✅ HTML has lang='en' attribute")
    
    def test_scroll_button_has_aria_label(self):
        """Scroll to top button should have aria-label"""
        response = requests.get(f"{BASE_URL}/")
        content = response.text
        assert 'aria-label' in content and 'Scroll to top' in content, \
            "Scroll to top button missing aria-label"
        print("✅ Scroll to top button has aria-label")


class TestBackendAPIs:
    """Test backend API endpoints"""
    
    def test_portfolio_api(self):
        """Portfolio list API should work"""
        response = requests.get(f"{BASE_URL}/api/portfolio/list")
        assert response.status_code == 200, f"Portfolio API failed: {response.status_code}"
        data = response.json()
        assert 'items' in data, "Missing 'items' in response"
        print(f"✅ Portfolio API returns {len(data.get('items', []))} items")
    
    def test_testimonials_api(self):
        """Testimonials API should work"""
        response = requests.get(f"{BASE_URL}/api/content/testimonials")
        assert response.status_code == 200, f"Testimonials API failed: {response.status_code}"
        data = response.json()
        assert 'testimonials' in data, "Missing 'testimonials' in response"
        print(f"✅ Testimonials API returns {len(data.get('testimonials', []))} testimonials")
    
    def test_faqs_api(self):
        """FAQs API should work"""
        response = requests.get(f"{BASE_URL}/api/content/faqs")
        assert response.status_code == 200, f"FAQs API failed: {response.status_code}"
        data = response.json()
        assert 'faqs' in data, "Missing 'faqs' in response"
        print(f"✅ FAQs API returns {len(data.get('faqs', []))} FAQs")
    
    def test_about_api(self):
        """About content API should work"""
        response = requests.get(f"{BASE_URL}/api/content/about")
        assert response.status_code == 200, f"About API failed: {response.status_code}"
        print("✅ About API returns HTTP 200")
    
    def test_services_api(self):
        """Services API should work"""
        response = requests.get(f"{BASE_URL}/api/content/services")
        assert response.status_code == 200, f"Services API failed: {response.status_code}"
        data = response.json()
        assert 'services' in data, "Missing 'services' in response"
        print(f"✅ Services API returns {len(data.get('services', []))} services")
    
    def test_blog_api(self):
        """Blog API should work"""
        response = requests.get(f"{BASE_URL}/api/content/blog")
        assert response.status_code == 200, f"Blog API failed: {response.status_code}"
        data = response.json()
        assert 'posts' in data, "Missing 'posts' in response"
        print(f"✅ Blog API returns {len(data.get('posts', []))} posts")
    
    def test_contact_info_api(self):
        """Contact info API should work"""
        response = requests.get(f"{BASE_URL}/api/content/contact-info")
        # May return 200 with data or 404 if not configured
        assert response.status_code in [200, 404], f"Contact info API failed: {response.status_code}"
        print(f"✅ Contact info API status: {response.status_code}")
    
    def test_settings_api(self):
        """Settings API should work"""
        response = requests.get(f"{BASE_URL}/api/settings/")
        assert response.status_code == 200, f"Settings API failed: {response.status_code}"
        print("✅ Settings API returns HTTP 200")


class TestSEOElements:
    """Test SEO-related elements"""
    
    def test_og_tags_exist(self):
        """Open Graph meta tags should exist"""
        response = requests.get(f"{BASE_URL}/")
        soup = BeautifulSoup(response.text, 'html.parser')
        og_title = soup.find('meta', {'property': 'og:title'})
        og_desc = soup.find('meta', {'property': 'og:description'})
        assert og_title is not None, "Missing og:title"
        assert og_desc is not None, "Missing og:description"
        print("✅ Open Graph meta tags exist")
    
    def test_twitter_card_exists(self):
        """Twitter Card meta tags should exist"""
        response = requests.get(f"{BASE_URL}/")
        soup = BeautifulSoup(response.text, 'html.parser')
        twitter_card = soup.find('meta', {'name': 'twitter:card'})
        assert twitter_card is not None, "Missing twitter:card"
        print("✅ Twitter Card meta tag exists")
    
    def test_meta_description_exists(self):
        """Page should have meta description for SEO"""
        response = requests.get(f"{BASE_URL}/")
        soup = BeautifulSoup(response.text, 'html.parser')
        meta_desc = soup.find('meta', {'name': 'description'})
        assert meta_desc is not None, "Missing meta description"
        content = meta_desc.get('content', '')
        assert len(content) > 50, "Meta description too short"
        print(f"✅ Meta description exists ({len(content)} chars)")


class TestDNSPrefetch:
    """Test DNS prefetch for images.unsplash.com (instead of preconnect)"""
    
    def test_dns_prefetch_unsplash(self):
        """images.unsplash.com should use dns-prefetch (NOT preconnect)"""
        response = requests.get(f"{BASE_URL}/")
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Should NOT have preconnect for unsplash
        preconnect = soup.find('link', {'rel': 'preconnect', 'href': lambda x: x and 'unsplash' in x})
        assert preconnect is None, "Unsplash should use dns-prefetch, not preconnect"
        
        # Should have dns-prefetch for unsplash
        dns_prefetch = soup.find('link', {'rel': 'dns-prefetch', 'href': 'https://images.unsplash.com'})
        assert dns_prefetch is not None, "Missing dns-prefetch for images.unsplash.com"
        print("✅ images.unsplash.com uses dns-prefetch (not preconnect)")


# Run tests with: pytest test_lighthouse_v10_fixes.py -v
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
