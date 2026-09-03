"""Tests for POST /api/media/upload and GET /api/files/{path}."""
import io
import os
import struct
import zlib
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://cartoes-digitais.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "agenciasuportaaitesadm@gmail.com"
ADMIN_PASSWORD = "DigitalCards@2026"


def _png_bytes(size_bytes: int | None = None) -> bytes:
    # Minimal valid 1x1 PNG
    sig = b"\x89PNG\r\n\x1a\n"

    def chunk(t, d):
        return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xffffffff)

    ihdr = chunk(b"IHDR", struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0))
    raw = b"\x00\xff\xff\xff"
    idat = chunk(b"IDAT", zlib.compress(raw))
    iend = chunk(b"IEND", b"")
    png = sig + ihdr + idat + iend
    if size_bytes and size_bytes > len(png):
        # Not a valid PNG anymore, but backend just checks extension + size
        png = png + b"\x00" * (size_bytes - len(png))
    return png


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
    if r.status_code != 200:
        pytest.skip(f"Login failed: {r.status_code} {r.text}")
    return r.json()["access_token"]


@pytest.fixture
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


class TestMediaUploadAuth:
    def test_upload_requires_auth(self):
        files = {"file": ("a.png", _png_bytes(), "image/png")}
        r = requests.post(f"{BASE_URL}/api/media/upload", data={"field": "logo"}, files=files, timeout=30)
        assert r.status_code == 401


class TestMediaUploadValidation:
    def test_reject_wrong_ext(self, auth_headers):
        files = {"file": ("a.txt", b"hello", "text/plain")}
        r = requests.post(f"{BASE_URL}/api/media/upload", data={"field": "logo"}, files=files, headers=auth_headers, timeout=30)
        assert r.status_code == 400
        assert "não suportado" in r.json()["detail"].lower() or "nao suportado" in r.json()["detail"].lower()

    def test_reject_video_on_non_header_field(self, auth_headers):
        files = {"file": ("a.mp4", b"\x00\x00\x00\x18ftypmp42", "video/mp4")}
        r = requests.post(f"{BASE_URL}/api/media/upload", data={"field": "logo"}, files=files, headers=auth_headers, timeout=30)
        assert r.status_code == 400

    def test_reject_oversized_image(self, auth_headers):
        big = _png_bytes(size_bytes=5 * 1024 * 1024 + 100)
        files = {"file": ("big.png", big, "image/png")}
        r = requests.post(f"{BASE_URL}/api/media/upload", data={"field": "logo"}, files=files, headers=auth_headers, timeout=60)
        assert r.status_code == 400
        assert "5 mb" in r.json()["detail"].lower()


class TestMediaUploadSuccess:
    def test_upload_png_logo(self, auth_headers):
        files = {"file": ("logo.png", _png_bytes(), "image/png")}
        r = requests.post(f"{BASE_URL}/api/media/upload", data={"field": "logo"}, files=files, headers=auth_headers, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["type"] == "image"
        assert "path" in data and data["path"]
        # public GET
        r2 = requests.get(f"{BASE_URL}/api/files/{data['path']}", timeout=30)
        assert r2.status_code == 200
        assert r2.headers.get("Content-Type", "").startswith("image/")

    def test_upload_header_video_mp4(self, auth_headers):
        # Tiny fake mp4 - backend only validates extension + size
        files = {"file": ("h.mp4", b"\x00\x00\x00\x18ftypmp42" + b"\x00" * 100, "video/mp4")}
        r = requests.post(f"{BASE_URL}/api/media/upload", data={"field": "header"}, files=files, headers=auth_headers, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["type"] == "video"

    def test_unknown_file_path_returns_404(self):
        r = requests.get(f"{BASE_URL}/api/files/nonexistent/xyz.png", timeout=30)
        assert r.status_code == 404


class TestPublicSeedIntact:
    def test_seed_public(self):
        r = requests.get(f"{BASE_URL}/api/public/clientes/studio-exemplo", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert data["slug"] == "studio-exemplo"
