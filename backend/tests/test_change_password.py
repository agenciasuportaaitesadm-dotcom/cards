"""Backend API tests for /api/auth/change-password (Digital Cards IA).

Covers: 401 without token, 400 wrong current, 400 mismatch, 400 too-short, 200 valid.
After valid change, verifies old password fails (401) and new password logs in (200).
Restores the original password at the end so the app stays usable.
"""
import os
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "agenciasuportaaitesadm@gmail.com"
ORIGINAL_PASSWORD = "DigitalCards@2026"
NEW_PASSWORD = "TempPass@2026!x"


def _login(session, password):
    return session.post(
        f"{API}/auth/login",
        json={"email": ADMIN_EMAIL, "password": password},
        timeout=15,
    )


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_token(session):
    r = _login(session, ORIGINAL_PASSWORD)
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


def _auth(tok):
    return {"Authorization": f"Bearer {tok}"}


# --- Auth guard ---
def test_change_password_requires_token(session):
    r = session.post(
        f"{API}/auth/change-password",
        json={"current_password": "x", "new_password": "xxxxxxxx", "confirm_password": "xxxxxxxx"},
        timeout=10,
    )
    assert r.status_code == 401


# --- Validation errors (order in server.py: mismatch → length → current) ---
def test_change_password_mismatch(session, admin_token):
    r = session.post(
        f"{API}/auth/change-password",
        headers=_auth(admin_token),
        json={"current_password": ORIGINAL_PASSWORD, "new_password": "abcdefgh", "confirm_password": "abcdefghX"},
        timeout=10,
    )
    assert r.status_code == 400
    assert "não coincidem" in r.json()["detail"].lower() or "coincidem" in r.json()["detail"]


def test_change_password_too_short(session, admin_token):
    r = session.post(
        f"{API}/auth/change-password",
        headers=_auth(admin_token),
        json={"current_password": ORIGINAL_PASSWORD, "new_password": "short", "confirm_password": "short"},
        timeout=10,
    )
    assert r.status_code == 400
    assert "8" in r.json()["detail"]


def test_change_password_wrong_current(session, admin_token):
    r = session.post(
        f"{API}/auth/change-password",
        headers=_auth(admin_token),
        json={"current_password": "wrong-current", "new_password": "abcdefgh1", "confirm_password": "abcdefgh1"},
        timeout=10,
    )
    assert r.status_code == 400
    assert "Senha atual incorreta" in r.json()["detail"]


# --- Happy path + old/new login checks + RESTORE ---
def test_change_password_valid_flow_and_restore(session, admin_token):
    # 1) change to NEW
    r = session.post(
        f"{API}/auth/change-password",
        headers=_auth(admin_token),
        json={
            "current_password": ORIGINAL_PASSWORD,
            "new_password": NEW_PASSWORD,
            "confirm_password": NEW_PASSWORD,
        },
        timeout=15,
    )
    assert r.status_code == 200, r.text
    assert "sucesso" in r.json()["message"].lower()

    # 2) old password should now fail
    old = _login(session, ORIGINAL_PASSWORD)
    assert old.status_code == 401

    # 3) new password should succeed
    newlogin = _login(session, NEW_PASSWORD)
    assert newlogin.status_code == 200
    new_token = newlogin.json()["access_token"]

    # 4) Restore original password so the app stays usable
    restore = session.post(
        f"{API}/auth/change-password",
        headers=_auth(new_token),
        json={
            "current_password": NEW_PASSWORD,
            "new_password": ORIGINAL_PASSWORD,
            "confirm_password": ORIGINAL_PASSWORD,
        },
        timeout=15,
    )
    assert restore.status_code == 200, restore.text

    # 5) Original works again
    final = _login(session, ORIGINAL_PASSWORD)
    assert final.status_code == 200


# --- Regression: public endpoint still open ---
def test_public_endpoint_still_open(session):
    r = session.get(f"{API}/public/clientes/studio-exemplo", timeout=10)
    assert r.status_code == 200
    assert r.json()["slug"] == "studio-exemplo"
