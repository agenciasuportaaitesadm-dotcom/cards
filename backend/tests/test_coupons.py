"""Backend tests: coupons CRUD, validate, lead integration, auth guards."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "agenciasuportaaitesadm@gmail.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "DigitalCards@2026")


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ----- Public validate -----

def test_validate_adriano10_ok():
    r = requests.post(f"{API}/coupons/validate", json={"codigo": "adriano10"})
    assert r.status_code == 200
    d = r.json()
    assert d["valido"] is True
    assert d["percentual"] == 10
    assert d["precoOriginal"] == 250.0
    assert d["valorDesconto"] == 25.0
    assert d["valorFinal"] == 225.0


def test_validate_case_insensitive_and_trim():
    r = requests.post(f"{API}/coupons/validate", json={"codigo": "  ADRIANO10  "})
    assert r.status_code == 200
    d = r.json()
    assert d["valido"] is True
    assert d["valorFinal"] == 225.0


def test_validate_inexistente_no_discount():
    r = requests.post(f"{API}/coupons/validate", json={"codigo": "naoexiste_" + uuid.uuid4().hex[:6]})
    assert r.status_code == 200
    d = r.json()
    assert d["valido"] is False
    assert d["valorFinal"] == 250.0
    assert d["percentual"] in (0, None)


def test_validate_empty_no_discount():
    r = requests.post(f"{API}/coupons/validate", json={"codigo": ""})
    assert r.status_code == 200
    d = r.json()
    assert d["valido"] is False
    assert d["valorFinal"] == 250.0


# ----- Auth guards -----

def test_list_coupons_requires_auth():
    r = requests.get(f"{API}/coupons")
    assert r.status_code in (401, 403)


def test_create_coupon_requires_auth():
    r = requests.post(f"{API}/coupons", json={"codigo": "TEST_x", "percentual": 5})
    assert r.status_code in (401, 403)


def test_leads_list_requires_auth():
    r = requests.get(f"{API}/leads")
    assert r.status_code in (401, 403)


# ----- CRUD -----

def test_coupon_crud_flow(auth_headers):
    code = f"test_{uuid.uuid4().hex[:6]}"
    # create
    r = requests.post(f"{API}/coupons", json={"codigo": code.upper(), "percentual": 20}, headers=auth_headers)
    assert r.status_code == 201, r.text
    coupon = r.json()
    assert coupon["codigo"] == code  # normalized lowercase
    assert coupon["percentual"] == 20
    assert coupon["ativo"] is True
    cid = coupon["id"]

    # list contains
    r = requests.get(f"{API}/coupons", headers=auth_headers)
    assert r.status_code == 200
    assert any(c["id"] == cid for c in r.json())

    # public validate active
    r = requests.post(f"{API}/coupons/validate", json={"codigo": code})
    assert r.json()["valido"] is True
    assert r.json()["valorFinal"] == 200.0

    # update percentual + deactivate
    r = requests.put(f"{API}/coupons/{cid}", json={"percentual": 15, "ativo": False}, headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["percentual"] == 15
    assert r.json()["ativo"] is False

    # inactive -> not valid
    r = requests.post(f"{API}/coupons/validate", json={"codigo": code})
    assert r.json()["valido"] is False
    assert r.json()["valorFinal"] == 250.0

    # delete
    r = requests.delete(f"{API}/coupons/{cid}", headers=auth_headers)
    assert r.status_code in (200, 204)

    # gone
    r = requests.post(f"{API}/coupons/validate", json={"codigo": code})
    assert r.json()["valido"] is False


def test_coupon_percentual_bounds(auth_headers):
    # invalid: 0
    r = requests.post(f"{API}/coupons", json={"codigo": f"bad_{uuid.uuid4().hex[:4]}", "percentual": 0}, headers=auth_headers)
    assert r.status_code in (400, 422)
    # invalid: 101
    r = requests.post(f"{API}/coupons", json={"codigo": f"bad_{uuid.uuid4().hex[:4]}", "percentual": 101}, headers=auth_headers)
    assert r.status_code in (400, 422)


def test_coupon_duplicate(auth_headers):
    code = f"dup_{uuid.uuid4().hex[:6]}"
    r = requests.post(f"{API}/coupons", json={"codigo": code, "percentual": 10}, headers=auth_headers)
    assert r.status_code == 201
    cid = r.json()["id"]
    r2 = requests.post(f"{API}/coupons", json={"codigo": code, "percentual": 15}, headers=auth_headers)
    assert r2.status_code in (400, 409)
    requests.delete(f"{API}/coupons/{cid}", headers=auth_headers)


# ----- Lead + coupon integration -----

def _find_lead(auth_headers, lead_id):
    r = requests.get(f"{API}/leads", headers=auth_headers)
    assert r.status_code == 200
    for l in r.json():
        if l.get("id") == lead_id:
            return l
    return None


def test_lead_with_valid_coupon_records_price(auth_headers):
    r = requests.post(f"{API}/leads", json={
        "nome": "TEST_ Lead Cupom Valido",
        "telefone": "11999990001",
        "cupom": "adriano10"
    })
    assert r.status_code in (200, 201), r.text
    lead_id = r.json()["id"]
    lead = _find_lead(auth_headers, lead_id)
    assert lead is not None
    assert lead["cupomValido"] is True
    assert lead["cupomCodigo"] == "adriano10"
    assert lead["percentualAplicado"] == 10
    assert lead["precoOriginal"] == 250.0
    assert lead["valorFinal"] == 225.0


def test_lead_with_invalid_coupon_no_discount(auth_headers):
    r = requests.post(f"{API}/leads", json={
        "nome": "TEST_ Lead Cupom Invalido",
        "telefone": "11999990002",
        "cupom": "naoexiste_xyz"
    })
    assert r.status_code in (200, 201)
    lead = _find_lead(auth_headers, r.json()["id"])
    assert lead["cupomValido"] is False
    assert lead["valorFinal"] == 250.0


def test_lead_without_coupon(auth_headers):
    r = requests.post(f"{API}/leads", json={
        "nome": "TEST_ Lead Sem Cupom",
        "telefone": "11999990003"
    })
    assert r.status_code in (200, 201)
    lead = _find_lead(auth_headers, r.json()["id"])
    assert lead["valorFinal"] == 250.0
    assert lead["precoOriginal"] == 250.0
