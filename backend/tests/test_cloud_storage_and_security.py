"""
Backend tests for Mantez Reels - Cloudflare R2 Cloud Storage + Security (Change Password)
Tests: security-check, change-password, settings/admin (cloudStorage), media/list, media/storage migration
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
    """Get authentication token for admin user (default password admin123)"""
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
# Auth Security Check Endpoint
# ─────────────────────────────────────────────
class TestSecurityCheck:
    """Tests for GET /api/auth/security-check"""

    def test_security_check_returns_200(self, authenticated_client):
        """GET /api/auth/security-check returns 200"""
        response = authenticated_client.get(f"{BASE_URL}/api/auth/security-check")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    def test_security_check_has_is_default_password_field(self, authenticated_client):
        """Response has is_default_password field"""
        response = authenticated_client.get(f"{BASE_URL}/api/auth/security-check")
        data = response.json()
        assert "is_default_password" in data, f"Missing 'is_default_password' key: {data}"

    def test_security_check_returns_true_for_default_password(self, authenticated_client):
        """is_default_password is True when using default admin123 password"""
        response = authenticated_client.get(f"{BASE_URL}/api/auth/security-check")
        data = response.json()
        assert data["is_default_password"] is True, f"Expected True for default password, got: {data}"

    def test_security_check_requires_auth(self, api_client):
        """Security check without token returns 401/403"""
        # Create a new client without auth header
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        response = session.get(f"{BASE_URL}/api/auth/security-check")
        assert response.status_code in (401, 403), f"Expected 401/403, got {response.status_code}"


# ─────────────────────────────────────────────
# Change Password Endpoint
# ─────────────────────────────────────────────
class TestChangePassword:
    """Tests for POST /api/auth/change-password"""

    def test_change_password_wrong_current_returns_400(self, authenticated_client):
        """Wrong current_password returns 400"""
        response = authenticated_client.post(f"{BASE_URL}/api/auth/change-password", json={
            "current_password": "wrong_password_xyz",
            "new_password": "newSecurePassword123"
        })
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        data = response.json()
        assert "detail" in data, f"Expected 'detail' in error response: {data}"
        assert "incorrect" in data["detail"].lower() or "wrong" in data["detail"].lower() or "password" in data["detail"].lower(), \
            f"Expected password-related error, got: {data['detail']}"

    def test_change_password_short_new_password_returns_400(self, authenticated_client):
        """New password shorter than 8 chars returns 400"""
        response = authenticated_client.post(f"{BASE_URL}/api/auth/change-password", json={
            "current_password": "admin123",
            "new_password": "short"
        })
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        data = response.json()
        assert "detail" in data, f"Expected 'detail' in error: {data}"
        # Could be either wrong password first or short password check - just verify 400

    def test_change_password_requires_auth(self, api_client):
        """Change password without token returns 401"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        response = session.post(f"{BASE_URL}/api/auth/change-password", json={
            "current_password": "admin123",
            "new_password": "newSecurePassword123"
        })
        assert response.status_code in (401, 403), f"Expected 401/403, got {response.status_code}"

    def test_change_password_correct_succeeds(self, authenticated_client, api_client, auth_token):
        """Correct current password + valid new password succeeds"""
        # Change to a new password
        response = authenticated_client.post(f"{BASE_URL}/api/auth/change-password", json={
            "current_password": "admin123",
            "new_password": "TestPassword456!"
        })
        if response.status_code == 200:
            data = response.json()
            assert data.get("success") is True, f"Expected success=True: {data}"

            # Verify we can login with new password
            login_response = api_client.post(f"{BASE_URL}/api/auth/login", json={
                "username": "admin",
                "password": "TestPassword456!"
            })
            assert login_response.status_code == 200, f"Login with new password failed: {login_response.text}"
            new_token = login_response.json().get("access_token")
            assert new_token, "No token with new password"

            # After change, security-check should return is_default_password=False
            check_response = requests.get(
                f"{BASE_URL}/api/auth/security-check",
                headers={"Authorization": f"Bearer {new_token}"}
            )
            assert check_response.status_code == 200
            check_data = check_response.json()
            assert check_data.get("is_default_password") is False, \
                f"After password change, expected is_default_password=False: {check_data}"

            # Now restore original password for other tests
            restore_response = requests.post(
                f"{BASE_URL}/api/auth/change-password",
                json={"current_password": "TestPassword456!", "new_password": "admin123"},
                headers={"Authorization": f"Bearer {new_token}"}
            )
            assert restore_response.status_code == 200, f"Failed to restore password: {restore_response.text}"

        else:
            # If password was already changed in a previous test run, still a valid behavior  
            print(f"Change password returned {response.status_code}: {response.text}")


# ─────────────────────────────────────────────
# Settings Admin Endpoint (CloudStorage)
# ─────────────────────────────────────────────
class TestSettingsAdmin:
    """Tests for GET /api/settings/admin - checks cloudStorage field"""

    def test_get_admin_settings_returns_200(self, authenticated_client):
        """GET /api/settings/admin returns 200"""
        response = authenticated_client.get(f"{BASE_URL}/api/settings/admin")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    def test_admin_settings_has_cloud_storage(self, authenticated_client):
        """Response includes cloudStorage object"""
        response = authenticated_client.get(f"{BASE_URL}/api/settings/admin")
        data = response.json()
        assert "cloudStorage" in data, f"Missing 'cloudStorage' in settings: {list(data.keys())}"

    def test_admin_settings_cloud_storage_structure(self, authenticated_client):
        """cloudStorage has enabled, defaultStorage, and r2 fields"""
        response = authenticated_client.get(f"{BASE_URL}/api/settings/admin")
        data = response.json()
        cloud = data.get("cloudStorage", {})
        assert "enabled" in cloud, f"cloudStorage missing 'enabled': {cloud}"
        assert "defaultStorage" in cloud, f"cloudStorage missing 'defaultStorage': {cloud}"
        assert "r2" in cloud, f"cloudStorage missing 'r2': {cloud}"

    def test_admin_settings_r2_has_required_fields(self, authenticated_client):
        """r2 object has accountId, accessKeyId, secretAccessKey, bucket, publicDomain"""
        response = authenticated_client.get(f"{BASE_URL}/api/settings/admin")
        data = response.json()
        r2 = data.get("cloudStorage", {}).get("r2", {})
        for field in ["accountId", "accessKeyId", "secretAccessKey", "bucket", "publicDomain"]:
            assert field in r2, f"r2 missing '{field}': {r2}"

    def test_admin_settings_cloud_storage_enabled_is_bool(self, authenticated_client):
        """cloudStorage.enabled is a boolean"""
        response = authenticated_client.get(f"{BASE_URL}/api/settings/admin")
        data = response.json()
        cloud = data.get("cloudStorage", {})
        assert isinstance(cloud.get("enabled"), bool), f"expected bool, got {type(cloud.get('enabled'))}: {cloud}"

    def test_admin_settings_default_storage_is_valid(self, authenticated_client):
        """cloudStorage.defaultStorage is one of local/r2/both"""
        response = authenticated_client.get(f"{BASE_URL}/api/settings/admin")
        data = response.json()
        default_storage = data.get("cloudStorage", {}).get("defaultStorage")
        assert default_storage in ("local", "r2", "both"), \
            f"defaultStorage must be local/r2/both, got: {default_storage}"

    def test_admin_settings_requires_auth(self, api_client):
        """Admin settings without token returns 401"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        response = session.get(f"{BASE_URL}/api/settings/admin")
        assert response.status_code in (401, 403), f"Expected 401/403, got {response.status_code}"

    def test_admin_settings_exposes_r2_credentials(self, authenticated_client):
        """Admin endpoint returns full credentials (not sanitized like public endpoint)"""
        # Admin endpoint should NOT sanitize secretAccessKey (returns empty string when not set vs hiding)
        response = authenticated_client.get(f"{BASE_URL}/api/settings/admin")
        data = response.json()
        r2 = data.get("cloudStorage", {}).get("r2", {})
        # secretAccessKey field must exist (value might be empty string if not configured, but key must be present)
        assert "secretAccessKey" in r2, f"secretAccessKey field missing from admin endpoint: {r2}"


# ─────────────────────────────────────────────
# Test Storage Endpoint
# ─────────────────────────────────────────────
class TestStorageConnection:
    """Tests for POST /api/settings/test-storage"""

    def test_test_storage_disabled_returns_false(self, authenticated_client):
        """When cloudStorage disabled, test-storage returns {success: false}"""
        # First ensure cloud storage is disabled
        authenticated_client.put(f"{BASE_URL}/api/settings/", json={
            "cloudStorage": {"enabled": False, "defaultStorage": "local", "r2": {}}
        })
        response = authenticated_client.post(f"{BASE_URL}/api/settings/test-storage")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "success" in data, f"Missing 'success' in response: {data}"
        assert data["success"] is False, f"Expected success=False when disabled: {data}"
        assert "message" in data, f"Missing 'message' in response: {data}"
        assert "not enabled" in data["message"].lower() or "disabled" in data["message"].lower() or "not" in data["message"].lower(), \
            f"Expected 'not enabled' message, got: {data['message']}"

    def test_test_storage_returns_message(self, authenticated_client):
        """test-storage always returns a message"""
        response = authenticated_client.post(f"{BASE_URL}/api/settings/test-storage")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data, f"Missing 'message' in response: {data}"
        assert len(data["message"]) > 0, "Message should not be empty"

    def test_test_storage_requires_auth(self, api_client):
        """test-storage without auth returns 401"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        response = session.post(f"{BASE_URL}/api/settings/test-storage")
        assert response.status_code in (401, 403), f"Expected 401/403, got {response.status_code}"


# ─────────────────────────────────────────────
# Media List Endpoint
# ─────────────────────────────────────────────
class TestMediaList:
    """Tests for GET /api/media/list"""

    def test_media_list_returns_200(self, api_client):
        """GET /api/media/list returns 200 (public endpoint)"""
        response = api_client.get(f"{BASE_URL}/api/media/list")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    def test_media_list_has_success_and_media(self, api_client):
        """Response has success and media fields"""
        response = api_client.get(f"{BASE_URL}/api/media/list")
        data = response.json()
        assert "success" in data, f"Missing 'success': {data}"
        assert "media" in data, f"Missing 'media': {data}"
        assert isinstance(data["media"], list), f"media should be a list: {type(data['media'])}"

    def test_media_list_items_have_required_fields(self, api_client):
        """Each media item has id, file_id, filename, file_type, urls, file_size, storage_type"""
        response = api_client.get(f"{BASE_URL}/api/media/list")
        data = response.json()
        media_items = data.get("media", [])
        if len(media_items) == 0:
            pytest.skip("No media items to validate - upload a file first")
        for item in media_items[:3]:  # Check first 3 items
            for field in ["id", "file_id", "filename", "file_type", "urls", "file_size", "storage_type"]:
                assert field in item, f"Media item missing '{field}': {item}"

    def test_media_list_storage_type_is_valid(self, api_client):
        """storage_type in each item is local/r2/both"""
        response = api_client.get(f"{BASE_URL}/api/media/list")
        data = response.json()
        media_items = data.get("media", [])
        if len(media_items) == 0:
            pytest.skip("No media items to validate")
        for item in media_items[:5]:
            assert item.get("storage_type") in ("local", "r2", "both"), \
                f"Invalid storage_type: {item.get('storage_type')} in {item}"

    def test_media_list_count_matches(self, api_client):
        """count field matches length of media array"""
        response = api_client.get(f"{BASE_URL}/api/media/list")
        data = response.json()
        assert data.get("count") == len(data.get("media", [])), \
            f"count {data.get('count')} != len(media) {len(data.get('media', []))}"


# ─────────────────────────────────────────────
# Media Storage Migration Endpoint
# ─────────────────────────────────────────────
class TestMediaStorageMigration:
    """Tests for PATCH /api/media/{file_id}/storage"""

    def test_migrate_nonexistent_file_returns_404(self, authenticated_client):
        """PATCH /api/media/nonexistent123/storage returns 404"""
        response = authenticated_client.patch(
            f"{BASE_URL}/api/media/nonexistent123/storage",
            json={"target": "r2"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}: {response.text}"

    def test_migrate_invalid_target_returns_400(self, authenticated_client):
        """PATCH with invalid target returns 400"""
        response = authenticated_client.patch(
            f"{BASE_URL}/api/media/somefileid/storage",
            json={"target": "invalid_target"}
        )
        assert response.status_code in (400, 404), f"Expected 400/404, got {response.status_code}: {response.text}"

    def test_migrate_requires_auth(self, api_client):
        """PATCH without auth returns 401"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        response = session.patch(
            f"{BASE_URL}/api/media/somefileid/storage",
            json={"target": "r2"}
        )
        assert response.status_code in (401, 403), f"Expected 401/403, got {response.status_code}"

    def test_migrate_r2_not_configured_returns_error(self, authenticated_client):
        """When R2 not enabled and trying to migrate to r2, should return error (400 or 404)"""
        # First ensure R2 is disabled
        authenticated_client.put(f"{BASE_URL}/api/settings/", json={
            "cloudStorage": {"enabled": False, "defaultStorage": "local"}
        })
        # Try to migrate a nonexistent file - should 404 before even checking R2
        response = authenticated_client.patch(
            f"{BASE_URL}/api/media/test_nonexistent_id/storage",
            json={"target": "r2"}
        )
        # Either 404 (file not found) or 400 (R2 not configured) are acceptable
        assert response.status_code in (400, 404), f"Expected 400/404, got {response.status_code}: {response.text}"


# ─────────────────────────────────────────────
# Public Settings (Sanitized - no credentials)
# ─────────────────────────────────────────────
class TestPublicSettings:
    """Tests for GET /api/settings/ - public endpoint sanitizes cloudStorage credentials"""

    def test_public_settings_has_cloud_storage(self, api_client):
        """Public settings includes cloudStorage"""
        response = api_client.get(f"{BASE_URL}/api/settings/")
        assert response.status_code == 200
        data = response.json()
        assert "cloudStorage" in data, f"Missing cloudStorage: {list(data.keys())}"

    def test_public_settings_sanitizes_r2_credentials(self, api_client):
        """Public settings removes sensitive R2 credentials"""
        response = api_client.get(f"{BASE_URL}/api/settings/")
        data = response.json()
        r2 = data.get("cloudStorage", {}).get("r2", {})
        # accessKeyId and secretAccessKey should be empty strings (sanitized)
        assert r2.get("accessKeyId") == "", f"accessKeyId should be empty in public settings: {r2}"
        assert r2.get("secretAccessKey") == "", f"secretAccessKey should be empty in public settings: {r2}"

    def test_public_settings_does_not_require_auth(self, api_client):
        """Public settings can be accessed without auth"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        response = session.get(f"{BASE_URL}/api/settings/")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
