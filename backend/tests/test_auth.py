"""Backend API tests for Digital Cards IA - Authentication flow."""
import os
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
    return s


@pytest.fixture(scope="module")
def admin_token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "access_token" in data
    assert data["user"]["email"] == ADMIN_EMAIL
    return data["access_token"]


# --- Login ---
def test_login_success(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data.get("access_token"), str) and len(data["access_token"]) > 20
    assert data["user"]["email"] == ADMIN_EMAIL


def test_login_wrong_password_returns_401_pt_br(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong-pass"}, timeout=15)
    assert r.status_code == 401
    detail = r.json().get("detail", "")
    assert "inválid" in detail.lower() or "invalid" in detail.lower()


def test_login_unknown_email_returns_401(session):
    r = session.post(f"{API}/auth/login", json={"email": "nobody@example.com", "password": "x"}, timeout=15)
    assert r.status_code == 401


# --- /auth/me ---
def test_me_without_token_401(session):
    r = session.get(f"{API}/auth/me", timeout=10)
    assert r.status_code == 401


def test_me_with_token_returns_user(session, admin_token):
    r = session.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {admin_token}"}, timeout=10)
    assert r.status_code == 200
    assert r.json()["email"] == ADMIN_EMAIL


# --- Protected endpoints ---
def test_clientes_get_requires_auth(session):
    r = session.get(f"{API}/clientes", timeout=10)
    assert r.status_code == 401


def test_clientes_post_requires_auth(session):
    r = session.post(f"{API}/clientes", json={"nome": "X", "slug": "x"}, timeout=10)
    assert r.status_code == 401


def test_clientes_get_with_auth_works(session, admin_token):
    r = session.get(f"{API}/clientes", headers={"Authorization": f"Bearer {admin_token}"}, timeout=15)
    assert r.status_code == 200
    slugs = [c["slug"] for c in r.json()]
    assert "studio-exemplo" in slugs


# --- Public endpoint stays open ---
def test_public_endpoint_no_auth(session):
    r = session.get(f"{API}/public/clientes/studio-exemplo", timeout=10)
    assert r.status_code == 200
    assert r.json()["slug"] == "studio-exemplo"


# --- Seed idempotency ---
def test_admin_seed_idempotent_only_one_user_can_login(session):
    # Login twice, both should succeed with same email (implicit: no duplicate would break unique login)
    r1 = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=10)
    r2 = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=10)
    assert r1.status_code == 200 and r2.status_code == 200
    assert r1.json()["user"]["id"] == r2.json()["user"]["id"]
