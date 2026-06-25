"""Backend tests for Vitruvian Construct API (iteration 2: admin edit/upload/settings)."""
import io
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://mechanical-studio.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_PW = "vitruvian-admin-2025"
ADMIN_HEADERS = {"X-Admin-Password": ADMIN_PW}


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
        for k in ["featured_project", "concept_art", "updates", "social", "tagline"]:
            assert k in d
        assert isinstance(d["social"], dict)
        for k in ["discord", "twitter", "kickstarter", "patreon", "email"]:
            assert k in d["social"]

    def test_site_featured_is_cozy_chaos(self, s):
        d = s.get(f"{API}/site", timeout=15).json()
        fp = d["featured_project"]
        assert fp is not None
        assert fp.get("title") == "Irresponsible Axolotl"
        assert fp.get("status") == "COZY CHAOS // IN DEVELOPMENT"
        for kw in ["Kiddo", "Lottie", "middle-school"]:
            assert kw in fp.get("description", ""), f"Missing keyword: {kw}"

    def test_site_has_five_concept_art(self, s):
        d = s.get(f"{API}/site", timeout=15).json()
        titles = [a["title"] for a in d["concept_art"]]
        assert len(d["concept_art"]) == 5, f"Expected 5 art entries, got {len(d['concept_art'])}: {titles}"
        assert "Irresponsible Axolotl — Key Art" in titles
        assert "Lottie — Mood Sheet (Clean)" in titles
        assert "Me & My Best Buddy, Lottie!" in titles


class TestProjects:
    def test_list_projects(self, s):
        r = s.get(f"{API}/projects", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) >= 1
        assert "_id" not in data[0] and "id" in data[0]


class TestConceptArt:
    def test_list_all(self, s):
        r = s.get(f"{API}/concept-art", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 5
        assert "_id" not in data[0]

    def test_filter_characters(self, s):
        r = s.get(f"{API}/concept-art", params={"category": "characters"}, timeout=15)
        assert r.status_code == 200
        for item in r.json():
            assert item["category"] == "characters"


class TestUpdates:
    def test_list_updates(self, s):
        r = s.get(f"{API}/updates", timeout=15)
        assert r.status_code == 200
        assert len(r.json()) >= 3


# ---------- Subscribe ----------

class TestSubscribe:
    def test_valid_email_creates(self, s):
        email = f"TEST_sub_{uuid.uuid4().hex[:8]}@example.com"
        r = s.post(f"{API}/subscribe", json={"email": email}, timeout=15)
        assert r.status_code == 200
        assert r.json()["email"] == email

    def test_duplicate_returns_existing(self, s):
        email = f"TEST_dup_{uuid.uuid4().hex[:8]}@example.com"
        r1 = s.post(f"{API}/subscribe", json={"email": email}, timeout=15)
        r2 = s.post(f"{API}/subscribe", json={"email": email}, timeout=15)
        assert r1.json()["id"] == r2.json()["id"]

    def test_invalid_email_422(self, s):
        r = s.post(f"{API}/subscribe", json={"email": "not-an-email"}, timeout=15)
        assert r.status_code == 422


# ---------- Admin auth ----------

class TestAdminAuth:
    def test_verify_no_password_401(self):
        assert requests.post(f"{API}/admin/verify", timeout=15).status_code == 401

    def test_verify_wrong_password_401(self):
        r = requests.post(f"{API}/admin/verify", headers={"X-Admin-Password": "wrong"}, timeout=15)
        assert r.status_code == 401

    def test_verify_correct_password_200(self):
        r = requests.post(f"{API}/admin/verify", headers=ADMIN_HEADERS, timeout=15)
        assert r.status_code == 200 and r.json().get("ok") is True


# ---------- Admin CRUD: Projects ----------

class TestAdminProjectsCRUD:
    def test_create_update_delete_flow(self):
        payload = {
            "title": "TEST_Project",
            "slug": f"test-{uuid.uuid4().hex[:6]}",
            "status": "PRE-ALPHA",
            "description": "Test project description",
            "featured": False,
        }
        r = requests.post(f"{API}/admin/projects", json=payload, headers=ADMIN_HEADERS, timeout=15)
        assert r.status_code == 200
        pid = r.json()["id"]
        # PUT update (partial)
        new_desc = "Updated description for TEST_Project"
        ru = requests.put(f"{API}/admin/projects/{pid}",
                          json={"description": new_desc, "title": "TEST_Project_v2"},
                          headers=ADMIN_HEADERS, timeout=15)
        assert ru.status_code == 200
        assert ru.json()["description"] == new_desc
        assert ru.json()["title"] == "TEST_Project_v2"
        # GET to verify persistence
        rg = requests.get(f"{API}/projects", timeout=15).json()
        proj = next(p for p in rg if p["id"] == pid)
        assert proj["description"] == new_desc
        assert proj["title"] == "TEST_Project_v2"
        # Cleanup
        rd = requests.delete(f"{API}/admin/projects/{pid}", headers=ADMIN_HEADERS, timeout=15)
        assert rd.status_code == 200

    def test_update_requires_auth(self):
        r = requests.put(f"{API}/admin/projects/nonexistent", json={"title": "x"}, timeout=15)
        assert r.status_code == 401

    def test_update_404_for_missing(self):
        r = requests.put(f"{API}/admin/projects/does-not-exist",
                         json={"title": "x"}, headers=ADMIN_HEADERS, timeout=15)
        assert r.status_code == 404

    def test_update_empty_body_400(self):
        # Create a temp project, then try empty update
        payload = {"title": "TEST_Empty", "slug": f"emp-{uuid.uuid4().hex[:6]}",
                   "description": "x"}
        cr = requests.post(f"{API}/admin/projects", json=payload, headers=ADMIN_HEADERS, timeout=15)
        pid = cr.json()["id"]
        try:
            r = requests.put(f"{API}/admin/projects/{pid}", json={}, headers=ADMIN_HEADERS, timeout=15)
            assert r.status_code == 400
        finally:
            requests.delete(f"{API}/admin/projects/{pid}", headers=ADMIN_HEADERS, timeout=15)

    def test_featured_true_unfeatures_others(self):
        # Create two extra projects, mark one featured, then mark the other featured and verify exclusivity.
        p1 = requests.post(f"{API}/admin/projects",
                           json={"title": "TEST_F1", "slug": f"tf1-{uuid.uuid4().hex[:6]}",
                                 "description": "a", "featured": False},
                           headers=ADMIN_HEADERS, timeout=15).json()
        p2 = requests.post(f"{API}/admin/projects",
                           json={"title": "TEST_F2", "slug": f"tf2-{uuid.uuid4().hex[:6]}",
                                 "description": "b", "featured": False},
                           headers=ADMIN_HEADERS, timeout=15).json()
        try:
            # Set p1 featured
            requests.put(f"{API}/admin/projects/{p1['id']}", json={"featured": True},
                         headers=ADMIN_HEADERS, timeout=15)
            # Set p2 featured -> should unfeature everyone else including p1
            requests.put(f"{API}/admin/projects/{p2['id']}", json={"featured": True},
                         headers=ADMIN_HEADERS, timeout=15)
            projs = requests.get(f"{API}/projects", timeout=15).json()
            featured = [p for p in projs if p.get("featured")]
            assert len(featured) == 1, f"Expected exactly 1 featured, got {len(featured)}: {[p['title'] for p in featured]}"
            assert featured[0]["id"] == p2["id"]
        finally:
            # Restore: refeature the cozy axolotl
            cozy = next((p for p in requests.get(f"{API}/projects", timeout=15).json()
                         if p.get("slug") == "irresponsible-axolotl"), None)
            if cozy:
                requests.put(f"{API}/admin/projects/{cozy['id']}", json={"featured": True},
                             headers=ADMIN_HEADERS, timeout=15)
            requests.delete(f"{API}/admin/projects/{p1['id']}", headers=ADMIN_HEADERS, timeout=15)
            requests.delete(f"{API}/admin/projects/{p2['id']}", headers=ADMIN_HEADERS, timeout=15)


# ---------- Admin CRUD: Concept Art ----------

class TestAdminArtCRUD:
    def test_create_update_delete(self):
        payload = {"title": "TEST_Art", "category": "props",
                   "image": "https://example.com/x.jpg", "caption": "test"}
        r = requests.post(f"{API}/admin/concept-art", json=payload, headers=ADMIN_HEADERS, timeout=15)
        aid = r.json()["id"]
        # update
        ru = requests.put(f"{API}/admin/concept-art/{aid}",
                          json={"caption": "edited caption", "category": "creatures"},
                          headers=ADMIN_HEADERS, timeout=15)
        assert ru.status_code == 200
        assert ru.json()["caption"] == "edited caption"
        assert ru.json()["category"] == "creatures"
        # verify in list
        lst = requests.get(f"{API}/concept-art", timeout=15).json()
        art = next(a for a in lst if a["id"] == aid)
        assert art["caption"] == "edited caption"
        # delete
        rd = requests.delete(f"{API}/admin/concept-art/{aid}", headers=ADMIN_HEADERS, timeout=15)
        assert rd.status_code == 200

    def test_update_auth_required(self):
        r = requests.put(f"{API}/admin/concept-art/x", json={"caption": "a"}, timeout=15)
        assert r.status_code == 401


# ---------- Admin CRUD: Updates ----------

class TestAdminUpdatesCRUD:
    def test_create_update_delete(self):
        payload = {"title": "TEST_Transmission", "short_text": "test body"}
        r = requests.post(f"{API}/admin/updates", json=payload, headers=ADMIN_HEADERS, timeout=15)
        uid = r.json()["id"]
        ru = requests.put(f"{API}/admin/updates/{uid}",
                          json={"short_text": "edited body"},
                          headers=ADMIN_HEADERS, timeout=15)
        assert ru.status_code == 200
        assert ru.json()["short_text"] == "edited body"
        rd = requests.delete(f"{API}/admin/updates/{uid}", headers=ADMIN_HEADERS, timeout=15)
        assert rd.status_code == 200


# ---------- Admin Settings ----------

class TestAdminSettings:
    def test_get_requires_auth(self):
        assert requests.get(f"{API}/admin/settings", timeout=15).status_code == 401

    def test_get_authed(self):
        r = requests.get(f"{API}/admin/settings", headers=ADMIN_HEADERS, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert "tagline" in d and "social" in d

    def test_put_persists_and_reflects_in_site(self):
        # Read current
        current = requests.get(f"{API}/admin/settings", headers=ADMIN_HEADERS, timeout=15).json()
        original_tagline = current.get("tagline", "Enter the Construct.")
        new_tagline = f"TEST_TAGLINE_{uuid.uuid4().hex[:6]}"
        try:
            payload = {
                "tagline": new_tagline,
                "hero_subtitle": current.get("hero_subtitle"),
                "social": current.get("social", {}),
            }
            r = requests.put(f"{API}/admin/settings", json=payload,
                             headers=ADMIN_HEADERS, timeout=15)
            assert r.status_code == 200
            assert r.json()["tagline"] == new_tagline
            # site payload reflects it
            site = requests.get(f"{API}/site", timeout=15).json()
            assert site["tagline"] == new_tagline
        finally:
            # Reset tagline so home page is clean
            payload = {
                "tagline": "Enter the Construct.",
                "hero_subtitle": current.get("hero_subtitle"),
                "social": current.get("social", {}),
            }
            requests.put(f"{API}/admin/settings", json=payload,
                         headers=ADMIN_HEADERS, timeout=15)


# ---------- Iteration 3: Splash / Manifesto settings ----------

DEFAULT_HERO_OVERLINE = "Studio · Opvs Primvm · MMXXVI"
DEFAULT_HERO_TITLE = "We build *invented beings*\nfrom *parchment* & *brass*."
DEFAULT_MANIFESTO_OVERLINE = "— Manifesto · §I"


class TestSplashManifestoSettings:
    def test_site_includes_settings_with_defaults(self, s):
        d = s.get(f"{API}/site", timeout=15).json()
        assert "settings" in d, "site payload must include 'settings'"
        st = d["settings"]
        for k in [
            "hero_overline", "hero_title", "hero_body", "hero_secondary_cta_label",
            "manifesto_overline", "manifesto_heading", "manifesto_body",
            "manifesto_tags", "manifesto_image", "manifesto_caption",
        ]:
            assert k in st, f"settings missing field: {k}"
        assert isinstance(st["manifesto_tags"], list)
        # defaults populated
        assert st["hero_overline"] == DEFAULT_HERO_OVERLINE
        assert "invented beings" in st["hero_title"]
        assert st["manifesto_overline"] == DEFAULT_MANIFESTO_OVERLINE

    def test_admin_get_returns_new_fields_with_defaults(self):
        r = requests.get(f"{API}/admin/settings", headers=ADMIN_HEADERS, timeout=15)
        assert r.status_code == 200
        d = r.json()
        for k in [
            "hero_overline", "hero_title", "hero_body", "hero_secondary_cta_label",
            "manifesto_overline", "manifesto_heading", "manifesto_body",
            "manifesto_tags", "manifesto_image", "manifesto_caption",
        ]:
            assert k in d, f"admin settings missing field: {k}"

    def test_put_persists_hero_and_manifesto_and_resets(self):
        current = requests.get(f"{API}/admin/settings", headers=ADMIN_HEADERS, timeout=15).json()
        unique = uuid.uuid4().hex[:6]
        new_overline = f"TEST_HERO_{unique}"
        new_heading = f"TEST_MANIFESTO_HEADING_{unique}"
        try:
            payload = {
                **current,
                "hero_overline": new_overline,
                "manifesto_heading": new_heading,
                "manifesto_tags": ["test-tag-1", "test-tag-2"],
            }
            r = requests.put(f"{API}/admin/settings", json=payload,
                             headers=ADMIN_HEADERS, timeout=15)
            assert r.status_code == 200, r.text
            assert r.json()["hero_overline"] == new_overline
            assert r.json()["manifesto_heading"] == new_heading
            assert r.json()["manifesto_tags"] == ["test-tag-1", "test-tag-2"]

            # Reflected in /api/site response.settings
            site = requests.get(f"{API}/site", timeout=15).json()
            assert site["settings"]["hero_overline"] == new_overline
            assert site["settings"]["manifesto_heading"] == new_heading
        finally:
            reset = {
                **current,
                "tagline": "Enter the Construct.",
                "hero_overline": DEFAULT_HERO_OVERLINE,
                "hero_title": DEFAULT_HERO_TITLE,
                "manifesto_overline": DEFAULT_MANIFESTO_OVERLINE,
                "manifesto_heading": current.get(
                    "manifesto_heading",
                    "We treat the studio\nas an *atelier*,\nand every game as a\n*small mechanism*.",
                ),
                "manifesto_tags": current.get(
                    "manifesto_tags",
                    ["narrative", "handcrafted", "small-team", "long-form"],
                ),
                "social": {**current.get("social", {}), "discord": "https://discord.com/"},
            }
            requests.put(f"{API}/admin/settings", json=reset,
                         headers=ADMIN_HEADERS, timeout=15)

    def test_backwards_compat_missing_fields_filled_with_defaults(self):
        """Simulate a legacy doc: PUT minimal known fields, GET fills the rest via SiteSettings."""
        current = requests.get(f"{API}/admin/settings", headers=ADMIN_HEADERS, timeout=15).json()
        # PUT a full SiteSettings (the API requires the full model). Then verify defaults remain present on GET.
        r = requests.put(f"{API}/admin/settings", json=current,
                         headers=ADMIN_HEADERS, timeout=15)
        assert r.status_code == 200
        d = requests.get(f"{API}/admin/settings", headers=ADMIN_HEADERS, timeout=15).json()
        # All fields still there with non-empty defaults (model fills if missing)
        assert d["hero_overline"]
        assert d["hero_title"]
        assert isinstance(d["manifesto_tags"], list)


# ---------- Admin Upload ----------

class TestAdminUpload:
    def test_upload_requires_auth(self):
        files = {"file": ("a.png", b"\x89PNG\r\n\x1a\n", "image/png")}
        r = requests.post(f"{API}/admin/upload", files=files, timeout=15)
        assert r.status_code == 401

    def test_upload_rejects_bad_extension(self):
        files = {"file": ("a.txt", b"hello", "text/plain")}
        r = requests.post(f"{API}/admin/upload", files=files,
                          headers=ADMIN_HEADERS, timeout=15)
        assert r.status_code == 400

    def test_upload_png_then_fetch(self):
        png_bytes = (
            b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
            b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01"
            b"\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
        )
        files = {"file": ("pixel.png", png_bytes, "image/png")}
        r = requests.post(f"{API}/admin/upload", files=files,
                          headers=ADMIN_HEADERS, timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "url" in d and "filename" in d
        assert d["url"].startswith("/api/uploads/")
        # Fetch publicly
        fetch_url = f"{BASE_URL}{d['url']}"
        fr = requests.get(fetch_url, timeout=15)
        assert fr.status_code == 200, f"Could not fetch uploaded file at {fetch_url}"
        assert len(fr.content) == len(png_bytes)
