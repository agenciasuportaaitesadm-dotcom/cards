"""Backend API tests for Digital Cards IA - Cliente CRUD + public endpoint + seed."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_EMAIL = "agenciasuportaaitesadm@gmail.com"
ADMIN_PASSWORD = "DigitalCards@2026"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    if r.status_code == 200:
        s.headers.update({"Authorization": f"Bearer {r.json()['access_token']}"})
    else:
        pytest.skip("Admin login failed - skipping authenticated tests")
    return s


@pytest.fixture
def unique_slug():
    return f"test-{uuid.uuid4().hex[:8]}"


created_ids = []


@pytest.fixture(scope="module", autouse=True)
def cleanup(session):
    yield
    for cid in created_ids:
        try:
            session.delete(f"{API}/clientes/{cid}", timeout=10)
        except Exception:
            pass


# --- Seed / list ---
def test_list_includes_seed(session):
    r = session.get(f"{API}/clientes", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    slugs = [c["slug"] for c in data]
    assert "studio-exemplo" in slugs


def test_seed_is_idempotent(session):
    r1 = session.get(f"{API}/clientes", timeout=15).json()
    count = sum(1 for c in r1 if c["slug"] == "studio-exemplo")
    assert count == 1


# --- Create ---
def test_create_valid_client(session, unique_slug):
    payload = {"nome": "TEST Cliente", "slug": unique_slug, "status": "Publicado", "descricao": "d"}
    r = session.post(f"{API}/clientes", json=payload, timeout=15)
    assert r.status_code == 201, r.text
    data = r.json()
    assert data["slug"] == unique_slug
    assert data["nome"] == "TEST Cliente"
    assert "id" in data and data["id"]
    assert data["createdAt"] and data["updatedAt"]
    created_ids.append(data["id"])

    # Verify persistence via GET
    g = session.get(f"{API}/clientes/{data['id']}", timeout=10)
    assert g.status_code == 200
    assert g.json()["slug"] == unique_slug


def test_create_invalid_slug(session):
    r = session.post(f"{API}/clientes", json={"nome": "X", "slug": "Bad Slug!"}, timeout=10)
    assert r.status_code == 400


def test_create_duplicate_slug(session):
    r = session.post(f"{API}/clientes", json={"nome": "Dup", "slug": "studio-exemplo"}, timeout=10)
    assert r.status_code == 409


# --- Update / Delete ---
def test_update_and_delete_client(session, unique_slug):
    # create
    r = session.post(f"{API}/clientes", json={"nome": "TEST Upd", "slug": unique_slug}, timeout=10)
    assert r.status_code == 201
    cid = r.json()["id"]
    original_updated = r.json()["updatedAt"]

    # update
    u = session.put(f"{API}/clientes/{cid}", json={"nome": "TEST Upd 2", "status": "Publicado"}, timeout=10)
    assert u.status_code == 200
    assert u.json()["nome"] == "TEST Upd 2"
    assert u.json()["status"] == "Publicado"

    # verify GET
    g = session.get(f"{API}/clientes/{cid}", timeout=10)
    assert g.json()["nome"] == "TEST Upd 2"

    # delete
    d = session.delete(f"{API}/clientes/{cid}", timeout=10)
    assert d.status_code == 200

    # verify gone
    g2 = session.get(f"{API}/clientes/{cid}", timeout=10)
    assert g2.status_code == 404


# --- Public ---
def test_public_get_by_slug(session):
    r = session.get(f"{API}/public/clientes/studio-exemplo", timeout=10)
    assert r.status_code == 200
    assert r.json()["slug"] == "studio-exemplo"


def test_public_unknown_slug_404(session):
    r = session.get(f"{API}/public/clientes/does-not-exist-xyz", timeout=10)
    assert r.status_code == 404
