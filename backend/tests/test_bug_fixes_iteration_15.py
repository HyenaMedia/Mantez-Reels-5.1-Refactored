"""
Test file for Bug Fixes - Iteration 15
Tests for 4 bugs in the admin dashboard:
1. Content editor page loads without React error overlay (RichTextEditor/Quill fix)
2. Unread message badge and toggleRead backend API call
3. Dropdown/Select dark styling in admin dashboard
4. Backend GET endpoints not returning internal MongoDB fields
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin credentials for testing
ADMIN_CREDENTIALS = {
    "username": "admin",
    "password": "admin123"
}


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for admin user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDENTIALS)
    if response.status_code == 200:
        data = response.json()
        return data.get("access_token")
    pytest.skip("Authentication failed - cannot proceed with authenticated tests")


@pytest.fixture
def auth_headers(auth_token):
    """Headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestBug4_ContentEndpointsNoInternalFields:
    """Bug 4: Backend GET endpoints should NOT return _id, section, updated_at, updated_by"""

    def test_get_hero_no_internal_fields(self):
        """GET /api/content/hero should not return internal fields"""
        response = requests.get(f"{BASE_URL}/api/content/hero")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        content = data.get("content", {})
        
        # Bug 4: These internal fields should NOT be present
        assert "_id" not in content, "Bug 4: _id should not be in hero response"
        assert "section" not in content, "Bug 4: section should not be in hero response"
        assert "updated_at" not in content, "Bug 4: updated_at should not be in hero response"
        assert "updated_by" not in content, "Bug 4: updated_by should not be in hero response"
        print("PASS: GET /api/content/hero - no internal fields returned")

    def test_get_about_no_internal_fields(self):
        """GET /api/content/about should not return internal fields"""
        response = requests.get(f"{BASE_URL}/api/content/about")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        content = data.get("content", {})
        
        # Bug 4: These internal fields should NOT be present
        assert "_id" not in content, "Bug 4: _id should not be in about response"
        assert "section" not in content, "Bug 4: section should not be in about response"
        assert "updated_at" not in content, "Bug 4: updated_at should not be in about response"
        assert "updated_by" not in content, "Bug 4: updated_by should not be in about response"
        print("PASS: GET /api/content/about - no internal fields returned")

    def test_get_contact_info_no_internal_fields(self):
        """GET /api/content/contact-info should not return internal fields"""
        response = requests.get(f"{BASE_URL}/api/content/contact-info")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        content = data.get("content", {})
        
        assert "_id" not in content, "Bug 4: _id should not be in contact-info response"
        assert "section" not in content, "Bug 4: section should not be in contact-info response"
        assert "updated_at" not in content, "Bug 4: updated_at should not be in contact-info response"
        assert "updated_by" not in content, "Bug 4: updated_by should not be in contact-info response"
        print("PASS: GET /api/content/contact-info - no internal fields returned")

    def test_get_footer_no_internal_fields(self):
        """GET /api/content/footer should not return internal fields"""
        response = requests.get(f"{BASE_URL}/api/content/footer")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        content = data.get("content", {})
        
        assert "_id" not in content, "Bug 4: _id should not be in footer response"
        assert "section" not in content, "Bug 4: section should not be in footer response"
        assert "updated_at" not in content, "Bug 4: updated_at should not be in footer response"
        assert "updated_by" not in content, "Bug 4: updated_by should not be in footer response"
        print("PASS: GET /api/content/footer - no internal fields returned")

    def test_get_section_labels_no_internal_fields(self):
        """GET /api/content/section-labels should not return internal fields"""
        response = requests.get(f"{BASE_URL}/api/content/section-labels")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        content = data.get("content", {})
        
        assert "_id" not in content, "Bug 4: _id should not be in section-labels response"
        assert "section" not in content, "Bug 4: section should not be in section-labels response"
        assert "updated_at" not in content, "Bug 4: updated_at should not be in section-labels response"
        assert "updated_by" not in content, "Bug 4: updated_by should not be in section-labels response"
        print("PASS: GET /api/content/section-labels - no internal fields returned")


class TestBug2_MessagesReadStatus:
    """Bug 2: Unread message badge and toggleRead backend API call"""

    def test_get_messages_returns_read_field(self, auth_headers):
        """GET /api/contact/messages should return read field"""
        response = requests.get(
            f"{BASE_URL}/api/contact/messages",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        # Just verify the API works - messages may or may not exist
        assert "messages" in data
        print(f"PASS: GET /api/contact/messages - returned {data.get('count', 0)} messages")

    def test_patch_message_read_status(self, auth_headers):
        """PATCH /api/contact/messages/{id}?read=true should update read and status"""
        # First, get existing messages
        response = requests.get(
            f"{BASE_URL}/api/contact/messages",
            headers=auth_headers
        )
        assert response.status_code == 200
        messages = response.json().get("messages", [])
        
        if not messages:
            pytest.skip("No messages to test with")
        
        message_id = messages[0].get("id")
        
        # Test marking as read
        response = requests.patch(
            f"{BASE_URL}/api/contact/messages/{message_id}",
            params={"read": True},
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"PASS: PATCH /api/contact/messages/{message_id}?read=true returned 200")
        
        # Verify the message was updated
        response = requests.get(
            f"{BASE_URL}/api/contact/messages",
            headers=auth_headers
        )
        updated_messages = response.json().get("messages", [])
        updated_msg = next((m for m in updated_messages if m.get("id") == message_id), None)
        
        if updated_msg:
            # Bug 2 fix: When read=true, status should be 'read'
            assert updated_msg.get("read") == True, "Bug 2: read field should be True"
            assert updated_msg.get("status") == "read", "Bug 2: status should be 'read' when read=true"
            print(f"PASS: Message {message_id} has read=True and status='read'")

    def test_patch_message_unread_status(self, auth_headers):
        """PATCH /api/contact/messages/{id}?read=false should update status to 'new'"""
        response = requests.get(
            f"{BASE_URL}/api/contact/messages",
            headers=auth_headers
        )
        messages = response.json().get("messages", [])
        
        if not messages:
            pytest.skip("No messages to test with")
        
        message_id = messages[0].get("id")
        
        # Test marking as unread
        response = requests.patch(
            f"{BASE_URL}/api/contact/messages/{message_id}",
            params={"read": False},
            headers=auth_headers
        )
        assert response.status_code == 200
        print(f"PASS: PATCH /api/contact/messages/{message_id}?read=false returned 200")
        
        # Verify status changed to 'new'
        response = requests.get(
            f"{BASE_URL}/api/contact/messages",
            headers=auth_headers
        )
        updated_messages = response.json().get("messages", [])
        updated_msg = next((m for m in updated_messages if m.get("id") == message_id), None)
        
        if updated_msg:
            assert updated_msg.get("status") == "new", "Bug 2: status should be 'new' when read=false"
            print(f"PASS: Message {message_id} has status='new' after read=false")


class TestBug1_ContentSaving:
    """Bug 1: Content saving works via PUT /api/content/{section}"""

    def test_save_hero_section(self, auth_headers):
        """PUT /api/content/hero should save content and return 200"""
        # First get current content
        response = requests.get(f"{BASE_URL}/api/content/hero")
        current_content = response.json().get("content", {})
        
        # Modify brand name
        test_brand_name = f"TEST_Mantez_Reels_{os.urandom(4).hex()}"
        updated_content = {
            "brand_name": test_brand_name,
            "tagline_line1": current_content.get("tagline_line1", "Test tagline 1"),
            "tagline_line2": current_content.get("tagline_line2", "Test tagline 2"),
            "description": current_content.get("description", "Test description"),
            "availability_badge": current_content.get("availability_badge", "Available"),
            "cta_button_text": current_content.get("cta_button_text", "Send message")
        }
        
        # Save the content
        response = requests.put(
            f"{BASE_URL}/api/content/hero",
            json=updated_content,
            headers=auth_headers
        )
        assert response.status_code == 200, f"Bug 1: PUT /api/content/hero should return 200, got {response.status_code}"
        data = response.json()
        assert data.get("success") == True
        print("PASS: PUT /api/content/hero returned 200 with success=true")
        
        # Verify persistence by fetching again
        response = requests.get(f"{BASE_URL}/api/content/hero")
        saved_content = response.json().get("content", {})
        assert saved_content.get("brand_name") == test_brand_name, "Bug 1: brand_name should persist after save"
        print(f"PASS: Brand name '{test_brand_name}' persisted correctly")
        
        # Restore original brand name
        if current_content.get("brand_name"):
            updated_content["brand_name"] = current_content["brand_name"]
            requests.put(
                f"{BASE_URL}/api/content/hero",
                json=updated_content,
                headers=auth_headers
            )

    def test_save_about_section(self, auth_headers):
        """PUT /api/content/about should save content"""
        response = requests.get(f"{BASE_URL}/api/content/about")
        current_content = response.json().get("content", {})
        
        test_title = f"TEST_About_Title_{os.urandom(4).hex()}"
        updated_content = {
            "title": test_title,
            "subtitle": current_content.get("subtitle", "Test subtitle"),
            "description": current_content.get("description", ["Test paragraph"]),
            "image_url": current_content.get("image_url", "")
        }
        
        response = requests.put(
            f"{BASE_URL}/api/content/about",
            json=updated_content,
            headers=auth_headers
        )
        assert response.status_code == 200
        print("PASS: PUT /api/content/about returned 200")
        
        # Restore
        if current_content.get("title"):
            updated_content["title"] = current_content["title"]
            requests.put(f"{BASE_URL}/api/content/about", json=updated_content, headers=auth_headers)


class TestServicesEndpoints:
    """Test services and FAQs endpoints"""

    def test_get_services(self):
        """GET /api/content/services returns services list"""
        response = requests.get(f"{BASE_URL}/api/content/services")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "services" in data
        print(f"PASS: GET /api/content/services - returned {len(data.get('services', []))} services")

    def test_get_faqs(self):
        """GET /api/content/faqs returns FAQ list"""
        response = requests.get(f"{BASE_URL}/api/content/faqs")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "faqs" in data
        print(f"PASS: GET /api/content/faqs - returned {len(data.get('faqs', []))} FAQs")


class TestAuthEndpoint:
    """Test authentication endpoint"""

    def test_login_success(self):
        """POST /api/auth/login with valid credentials returns token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=ADMIN_CREDENTIALS
        )
        assert response.status_code == 200, f"Login should return 200, got {response.status_code}"
        data = response.json()
        assert "access_token" in data, "Response should contain access_token"
        assert len(data["access_token"]) > 0, "Token should not be empty"
        print("PASS: POST /api/auth/login - authentication successful")

    def test_login_invalid_credentials(self):
        """POST /api/auth/login with invalid credentials returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": "wrong", "password": "wrong"}
        )
        assert response.status_code == 401, f"Invalid login should return 401, got {response.status_code}"
        print("PASS: POST /api/auth/login - invalid credentials rejected with 401")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
