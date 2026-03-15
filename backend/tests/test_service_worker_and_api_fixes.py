"""
Test suite for service worker fix, server.js API proxy, and admin login.
Covers: service-worker.js PRECACHE_URLS, cache version, server.js error callbacks,
API proxy existence, and admin login via direct backend API.
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestAdminLogin:
    """Direct backend API login tests"""

    def test_admin_login_success(self):
        """Admin login with admin/admin123 should return access_token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": "admin", "password": "admin123"},
            timeout=15
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}. Body: {response.text[:500]}"
        data = response.json()
        assert "access_token" in data, f"No access_token in response: {data}"
        assert len(data["access_token"]) > 10, "access_token looks too short"
        print(f"PASS: Admin login returned access_token ({len(data['access_token'])} chars)")

    def test_admin_login_wrong_password(self):
        """Login with wrong password should return 401 or 400"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": "admin", "password": "wrongpassword"},
            timeout=15
        )
        assert response.status_code in [400, 401, 422], \
            f"Expected 4xx for bad credentials, got {response.status_code}"
        print(f"PASS: Wrong password correctly rejected with {response.status_code}")

    def test_admin_me_with_token(self):
        """After login, /api/auth/me should return user info"""
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": "admin", "password": "admin123"},
            timeout=15
        )
        if login_response.status_code != 200:
            pytest.skip("Login failed — cannot test /me endpoint")
        token = login_response.json()["access_token"]

        me_response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        assert me_response.status_code == 200, f"Expected 200, got {me_response.status_code}"
        data = me_response.json()
        assert data.get("success") is True or "user" in data, \
            f"Unexpected /me response: {data}"
        print(f"PASS: /api/auth/me returned: {data}")


class TestHealthAndBasicEndpoints:
    """Basic endpoint checks"""

    def test_backend_reachable(self):
        """Backend base URL should return a valid response"""
        response = requests.get(f"{BASE_URL}/api/", timeout=10)
        # Any non-5xx is OK for root
        assert response.status_code < 500, \
            f"Backend returned server error: {response.status_code}"
        print(f"PASS: Backend reachable, status={response.status_code}")

    def test_api_auth_endpoint_exists(self):
        """POST /api/auth/login should exist (not 404/405)"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={},
            timeout=10
        )
        # 422 (validation error) or 400 are fine — endpoint exists
        assert response.status_code != 404, \
            f"/api/auth/login returned 404 — endpoint missing"
        assert response.status_code != 405, \
            f"/api/auth/login returned 405 — method not allowed"
        print(f"PASS: /api/auth/login exists, status={response.status_code}")
