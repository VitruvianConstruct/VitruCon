"""Backend tests for Vitruvian Construct API."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://mechanical-studio.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_PW = "vitruvian-admin-2025"


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


# ---------- Public endpoints ----------

class TestSite:
    def test_site_payload_shape(self, s):
        r = s.get(f"{API}/site", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert "featured_project" in d
        assert "concept_art" in d
        assert "updates" in d
        assert "social" in d and isinstance(d["social"], dict)
        assert d.get("tagline") == "Enter the Construct."
        # Featured project should be Irresponsible Axolotl
        fp = d["featured_project"]
        assert fp is not None
        assert "Axolotl" in fp.get("title", "")
        # social keys
        for k in ["discord", "twitter", "kickstarter", "patreon", "email"]:
            assert k in d["social"]


class TestProjects:
    def test_list_projects(self, s):
        r = s.get(f"{API}/projects", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        # No mongo _id should leak
        assert "_id" not in data[0]
        assert "id" in data[0]


class TestConceptArt:
    def test_list_all(self, s):
        r = s.get(f"{API}/concept-art", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 6  # seeded 6
        assert "_id" not in data[0]

    def test_filter_characters(self, s):
        r = s.get(f"{API}/concept-art", params={"category": "characters"}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        for item in data:
            assert item["category"] == "characters"

    def test_filter_all_keyword(self, s):
        r = s.get(f"{API}/concept-art", params={"category": "all"}, timeout=15)
        assert r.status_code == 200
        # category=all should not filter
        assert len(r.json()) >= 6


class TestUpdates:
    def test_list_updates(self, s):
        r = s.get(f"{API}/updates", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 3


# ---------- Subscribe ----------

class TestSubscribe:
    def test_valid_email_creates(self, s):
        email = f"TEST_sub_{uuid.uuid4().hex[:8]}@example.com"
        r = s.post(f"{API}/subscribe", json={"email": email}, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == email
        assert "id" in d and isinstance(d["id"], str)

    def test_duplicate_returns_existing(self, s):
        email = f"TEST_dup_{uuid.uuid4().hex[:8]}@example.com"
        r1 = s.post(f"{API}/subscribe", json={"email": email}, timeout=15)
        assert r1.status_code == 200
        first_id = r1.json()["id"]
        r2 = s.post(f"{API}/subscribe", json={"email": email}, timeout=15)
        assert r2.status_code == 200
        assert r2.json()["id"] == first_id
        assert r2.json()["email"] == email

    def test_invalid_email_422(self, s):
        r = s.post(f"{API}/subscribe", json={"email": "not-an-email"}, timeout=15)
        assert r.status_code == 422


# ---------- Admin auth ----------

class TestAdminAuth:
    def test_verify_no_password_401(self, s):
        r = requests.post(f"{API}/admin/verify", timeout=15)
        assert r.status_code == 401

    def test_verify_wrong_password_401(self, s):
        r = requests.post(f"{API}/admin/verify", headers={"X-Admin-Password": "wrong"}, timeout=15)
        assert r.status_code == 401

    def test_verify_correct_password_200(self, s):
        r = requests.post(f"{API}/admin/verify", headers={"X-Admin-Password": ADMIN_PW}, timeout=15)
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_subscribers_requires_auth(self, s):
        r = requests.get(f"{API}/admin/subscribers", timeout=15)
        assert r.status_code == 401

    def test_subscribers_authed_ok(self, s):
        r = requests.get(f"{API}/admin/subscribers", headers={"X-Admin-Password": ADMIN_PW}, timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---------- Admin CRUD ----------

class TestAdminCRUD:
    headers = {"X-Admin-Password": ADMIN_PW, "Content-Type": "application/json"}

    def test_project_create_delete(self):
        payload = {
            "title": "TEST_Project",
            "slug": f"test-{uuid.uuid4().hex[:6]}",
            "status": "PRE-ALPHA",
            "description": "Test project description",
            "featured": False,
        }
        # No auth
        r = requests.post(f"{API}/admin/projects", json=payload, timeout=15)
        assert r.status_code == 401
        # Authed create
        r = requests.post(f"{API}/admin/projects", json=payload, headers=self.headers, timeout=15)
        assert r.status_code == 200
        pid = r.json()["id"]
        # Verify in list
        r2 = requests.get(f"{API}/projects", timeout=15)
        assert any(p["id"] == pid for p in r2.json())
        # Delete unauth
        rd0 = requests.delete(f"{API}/admin/projects/{pid}", timeout=15)
        assert rd0.status_code == 401
        # Delete authed
        rd = requests.delete(f"{API}/admin/projects/{pid}", headers=self.headers, timeout=15)
        assert rd.status_code == 200

    def test_art_create_delete(self):
        payload = {
            "title": "TEST_Art",
            "category": "props",
            "image": "https://example.com/x.jpg",
            "caption": "test",
        }
        r = requests.post(f"{API}/admin/concept-art", json=payload, headers=self.headers, timeout=15)
        assert r.status_code == 200
        aid = r.json()["id"]
        rd = requests.delete(f"{API}/admin/concept-art/{aid}", headers=self.headers, timeout=15)
        assert rd.status_code == 200
        # 404 on second delete
        rd2 = requests.delete(f"{API}/admin/concept-art/{aid}", headers=self.headers, timeout=15)
        assert rd2.status_code == 404

    def test_update_create_delete(self):
        payload = {
            "title": "TEST_Transmission",
            "short_text": "test body",
            "cta_link": None,
        }
        # Unauth
        r0 = requests.post(f"{API}/admin/updates", json=payload, timeout=15)
        assert r0.status_code == 401
        # Authed
        r = requests.post(f"{API}/admin/updates", json=payload, headers=self.headers, timeout=15)
        assert r.status_code == 200
        uid = r.json()["id"]
        # Verify in public list
        rl = requests.get(f"{API}/updates", timeout=15)
        assert any(u["id"] == uid for u in rl.json())
        # Delete
        rd = requests.delete(f"{API}/admin/updates/{uid}", headers=self.headers, timeout=15)
        assert rd.status_code == 200
