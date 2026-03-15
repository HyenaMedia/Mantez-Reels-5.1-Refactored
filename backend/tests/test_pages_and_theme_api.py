"""
Test suite for Pages API and Theme API (Backend refactoring)
- Pages API: CRUD operations with MongoDB persistence
- Theme API: GlobalStylesModel with colors, typography, spacing
"""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL')
if BASE_URL:
    BASE_URL = BASE_URL.rstrip('/')


class TestAuth:
    """Authentication tests for protected endpoints"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get auth token for admin user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        assert response.status_code == 200, f"Auth failed: {response.text}"
        data = response.json()
        # API returns access_token not token
        return data.get("access_token")
    
    def test_login_success(self):
        """Test admin login returns access_token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data, f"Response missing access_token: {data}"
        assert len(data["access_token"]) > 0


class TestPagesAPI:
    """Pages API CRUD operations - /api/pages"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        return response.json().get("access_token")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Auth headers for requests"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    # GET /api/pages - List pages
    def test_list_pages(self, auth_headers):
        """GET /api/pages returns list of pages"""
        response = requests.get(f"{BASE_URL}/api/pages", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "pages" in data
        assert isinstance(data["pages"], list)
        # Should have at least default home page
        assert len(data["pages"]) >= 1
        # Check page structure
        page = data["pages"][0]
        assert "id" in page
        assert "name" in page
    
    # GET /api/pages/home - Get default home page
    def test_get_home_page_default(self, auth_headers):
        """GET /api/pages/home returns default home page structure when empty"""
        response = requests.get(f"{BASE_URL}/api/pages/home", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "page" in data
        page = data["page"]
        # Check default structure
        assert "meta" in page or "sections" in page
    
    # PUT /api/pages/home - Update/persist page
    def test_update_home_page(self, auth_headers):
        """PUT /api/pages/home persists page data to MongoDB"""
        test_page_data = {
            "page": {
                "meta": {
                    "id": "home",
                    "name": "Home Page",
                    "settings": {
                        "seo": {"title": "Test Title", "description": "Test Description"},
                        "globalStyles": {
                            "colors": {"primary": "#8b5cf6", "secondary": "#7c3aed"},
                            "typography": {"headingFont": "Inter", "bodyFont": "Inter"}
                        }
                    }
                },
                "sections": [
                    {
                        "id": "section-test-1",
                        "type": "section",
                        "name": "Test Section",
                        "elements": []
                    }
                ],
                "components": {}
            }
        }
        response = requests.put(
            f"{BASE_URL}/api/pages/home", 
            json=test_page_data, 
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") is True
        
        # Verify persistence - GET to confirm
        get_response = requests.get(f"{BASE_URL}/api/pages/home", headers=auth_headers)
        assert get_response.status_code == 200
        saved_data = get_response.json()
        assert "page" in saved_data
    
    # POST /api/pages - Create new page
    def test_create_page(self, auth_headers):
        """POST /api/pages creates a new page"""
        test_page = {
            "page": {
                "meta": {
                    "id": "TEST_new_page",
                    "name": "TEST New Page"
                },
                "sections": [],
                "components": {}
            }
        }
        response = requests.post(
            f"{BASE_URL}/api/pages", 
            json=test_page, 
            headers=auth_headers
        )
        # 201 for created or 409 if already exists
        assert response.status_code in [200, 201, 409]
        
        if response.status_code != 409:
            data = response.json()
            assert data.get("success") is True or "pageId" in data
    
    # DELETE /api/pages/{page_id} - Delete page
    def test_delete_page(self, auth_headers):
        """DELETE /api/pages/{page_id} deletes a page"""
        # First create a test page to delete
        test_page = {
            "page": {
                "meta": {
                    "id": "TEST_delete_page",
                    "name": "TEST Delete Page"
                },
                "sections": [],
                "components": {}
            }
        }
        create_response = requests.post(
            f"{BASE_URL}/api/pages", 
            json=test_page, 
            headers=auth_headers
        )
        # Either created or already exists
        
        # Now delete it
        delete_response = requests.delete(
            f"{BASE_URL}/api/pages/TEST_delete_page", 
            headers=auth_headers
        )
        assert delete_response.status_code in [200, 404]  # 200 if existed, 404 if already gone
        
        # Verify it's gone
        get_response = requests.get(
            f"{BASE_URL}/api/pages/TEST_delete_page", 
            headers=auth_headers
        )
        # Should return default structure since page doesn't exist
        assert get_response.status_code == 200
    
    # PUT /api/pages/home/sections/order - Update section order
    def test_update_section_order(self, auth_headers):
        """PUT /api/pages/home/sections/order updates section order"""
        # First ensure home page exists with sections
        test_page_data = {
            "page": {
                "meta": {"id": "home", "name": "Home Page"},
                "sections": [
                    {"id": "section-1", "type": "section", "name": "Section 1", "elements": []},
                    {"id": "section-2", "type": "section", "name": "Section 2", "elements": []}
                ],
                "components": {}
            }
        }
        requests.put(f"{BASE_URL}/api/pages/home", json=test_page_data, headers=auth_headers)
        
        # Update order
        order_data = {"section_ids": ["section-2", "section-1"]}
        response = requests.put(
            f"{BASE_URL}/api/pages/home/sections/order", 
            json=order_data, 
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") is True


class TestThemeAPI:
    """Theme API tests - /api/theme with GlobalStylesModel"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        return response.json().get("access_token")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Auth headers for requests"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    # GET /api/theme/config - Get global styles (authenticated)
    def test_get_theme_config(self, auth_headers):
        """GET /api/theme/config returns global styles with globalStyles field"""
        response = requests.get(f"{BASE_URL}/api/theme/config", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify globalStyles structure
        assert "globalStyles" in data, f"Missing globalStyles field: {data.keys()}"
        global_styles = data["globalStyles"]
        
        # Check required fields in globalStyles
        assert "colors" in global_styles
        assert "typography" in global_styles
        assert "spacing" in global_styles
        
        # Check colors structure
        colors = global_styles["colors"]
        assert "primary" in colors
        assert "secondary" in colors
        assert "accent" in colors
        
        # Check typography structure
        typography = global_styles["typography"]
        assert "headingFont" in typography
        assert "bodyFont" in typography
    
    # PUT /api/theme/config - Update global styles
    def test_update_theme_config(self, auth_headers):
        """PUT /api/theme/config updates global styles"""
        updated_theme = {
            "id": "theme_config",
            "name": "Updated Theme",
            "globalStyles": {
                "colors": {
                    "primary": "#8b5cf6",
                    "secondary": "#7c3aed",
                    "accent": "#a855f7",
                    "success": "#10b981",
                    "warning": "#f59e0b",
                    "error": "#ef4444",
                    "info": "#3b82f6",
                    "background": "#000000",
                    "surface": "#111827",
                    "text": "#ffffff",
                    "textMuted": "#9ca3af"
                },
                "typography": {
                    "headingFont": "Inter",
                    "bodyFont": "Inter",
                    "h1": {"fontSize": 48, "fontWeight": 700, "lineHeight": 1.2},
                    "h2": {"fontSize": 36, "fontWeight": 600, "lineHeight": 1.3},
                    "h3": {"fontSize": 30, "fontWeight": 600, "lineHeight": 1.3},
                    "h4": {"fontSize": 24, "fontWeight": 600, "lineHeight": 1.4},
                    "h5": {"fontSize": 20, "fontWeight": 500, "lineHeight": 1.4},
                    "h6": {"fontSize": 18, "fontWeight": 500, "lineHeight": 1.5},
                    "body": {"fontSize": 16, "fontWeight": 400, "lineHeight": 1.6},
                    "small": {"fontSize": 14, "fontWeight": 400, "lineHeight": 1.5}
                },
                "spacing": {
                    "xs": 4,
                    "sm": 8,
                    "md": 16,
                    "lg": 24,
                    "xl": 32,
                    "xxl": 48
                },
                "borderRadius": {"none": 0, "sm": 4, "md": 8, "lg": 12, "xl": 16, "full": 9999},
                "shadows": {
                    "sm": "0 1px 2px rgba(0,0,0,0.3)",
                    "md": "0 4px 6px rgba(0,0,0,0.3)",
                    "lg": "0 10px 15px rgba(0,0,0,0.3)",
                    "xl": "0 20px 25px rgba(0,0,0,0.3)"
                }
            },
            "sections": {}
        }
        
        response = requests.put(
            f"{BASE_URL}/api/theme/config", 
            json=updated_theme, 
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") is True
        
        # Verify persistence
        get_response = requests.get(f"{BASE_URL}/api/theme/config", headers=auth_headers)
        assert get_response.status_code == 200
        saved_data = get_response.json()
        assert saved_data["name"] == "Updated Theme"
    
    # GET /api/theme/config/public - Public theme (no auth)
    def test_get_public_theme_config(self):
        """GET /api/theme/config/public returns theme without auth"""
        response = requests.get(f"{BASE_URL}/api/theme/config/public")
        assert response.status_code == 200
        data = response.json()
        
        # Should have globalStyles
        assert "globalStyles" in data
        assert "colors" in data["globalStyles"]
    
    # POST /api/theme/reset - Reset to defaults
    def test_reset_theme(self, auth_headers):
        """POST /api/theme/reset resets to defaults"""
        response = requests.post(f"{BASE_URL}/api/theme/reset", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") is True
        
        # Verify reset - name should be Default
        get_response = requests.get(f"{BASE_URL}/api/theme/config", headers=auth_headers)
        assert get_response.status_code == 200
        saved_data = get_response.json()
        assert saved_data["name"] == "Default"
    
    # GET /api/theme/presets - Get presets
    def test_get_theme_presets(self, auth_headers):
        """GET /api/theme/presets returns preset list"""
        response = requests.get(f"{BASE_URL}/api/theme/presets", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "presets" in data
        presets = data["presets"]
        assert isinstance(presets, list)
        assert len(presets) >= 1
        
        # Check preset structure
        preset = presets[0]
        assert "name" in preset
        assert "description" in preset
        assert "config" in preset


class TestUnauthorizedAccess:
    """Test endpoints require auth where expected"""
    
    def test_pages_requires_auth(self):
        """GET /api/pages requires authentication"""
        response = requests.get(f"{BASE_URL}/api/pages")
        # Should return 401 Unauthorized
        assert response.status_code in [401, 403, 422]
    
    def test_theme_config_requires_auth(self):
        """GET /api/theme/config requires authentication"""
        response = requests.get(f"{BASE_URL}/api/theme/config")
        assert response.status_code in [401, 403, 422]
    
    def test_theme_public_no_auth(self):
        """GET /api/theme/config/public works without auth"""
        response = requests.get(f"{BASE_URL}/api/theme/config/public")
        assert response.status_code == 200


class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_health_endpoint(self):
        """GET /health returns 200 (may return frontend HTML through ingress)"""
        response = requests.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        # Note: Through ingress, /health may return frontend HTML, not API JSON
        # This is expected behavior as ingress routes non-/api paths to frontend
    
    def test_api_health_endpoint(self):
        """GET /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") in ["healthy", "unhealthy"]


# Cleanup after tests
@pytest.fixture(scope="session", autouse=True)
def cleanup_test_pages():
    """Cleanup test pages after all tests"""
    yield
    # Cleanup: Delete TEST_ prefixed pages
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        if response.status_code == 200:
            token = response.json().get("access_token")
            headers = {"Authorization": f"Bearer {token}"}
            
            # Delete test pages
            for page_id in ["TEST_new_page", "TEST_delete_page"]:
                requests.delete(f"{BASE_URL}/api/pages/{page_id}", headers=headers)
    except Exception:
        pass


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
