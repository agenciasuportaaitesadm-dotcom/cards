"""Backend tests for Leads, Demo endpoint, Botões personalizados + corBotoesOpacidade,
and the status-preservation fix (empty status must not despublicate).
"""
import os
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "agenciasuportaaitesadm@gmail.com"
ADMIN_PASSWORD = "DigitalCards@2026"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


@pytest.fixture(scope="module")
def token(s):
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- LEADS ----------
class TestLeads:
    def test_create_lead_public(self, s):
        payload = {
            "nome": "TEST_Cliente Automated",
            "empresa": "TEST_Empresa",
            "email": "test-lead@example.com",
            "telefone": "5511900000000",
            "mensagem": "Olá, quero saber mais",
            "origem": "landing",
        }
        r = s.post(f"{API}/leads", json=payload, timeout=15)
        assert r.status_code == 201, r.text
        data = r.json()
        assert "id" in data
        assert "message" in data
        pytest.lead_id = data["id"]

    def test_list_leads_requires_auth(self, s):
        r = s.get(f"{API}/leads", timeout=15)
        assert r.status_code in (401, 403)

    def test_list_leads_shows_new_first(self, s, auth_headers):
        r = s.get(f"{API}/leads", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        leads = r.json()
        assert isinstance(leads, list) and len(leads) > 0
        ids = [l["id"] for l in leads]
        assert pytest.lead_id in ids
        # created lead should be first (sorted -1 by createdAt)
        assert leads[0]["id"] == pytest.lead_id
        assert leads[0]["nome"] == "TEST_Cliente Automated"
        assert leads[0]["status"] == "Novo"
        assert leads[0]["origem"] == "landing"

    def test_update_lead_status_em_contato_and_concluido(self, s, auth_headers):
        lid = pytest.lead_id
        for st in ("Em contato", "Concluído"):
            r = s.patch(f"{API}/leads/{lid}/status", headers=auth_headers, json={"status": st}, timeout=15)
            assert r.status_code == 200, r.text
            # verify via GET
            leads = s.get(f"{API}/leads", headers=auth_headers, timeout=15).json()
            lead = next(l for l in leads if l["id"] == lid)
            assert lead["status"] == st

    def test_update_lead_status_invalid_rejected(self, s, auth_headers):
        r = s.patch(f"{API}/leads/{pytest.lead_id}/status", headers=auth_headers, json={"status": "Bogus"}, timeout=15)
        assert r.status_code == 400

    def test_update_lead_status_not_found(self, s, auth_headers):
        r = s.patch(f"{API}/leads/does-not-exist/status", headers=auth_headers, json={"status": "Novo"}, timeout=15)
        assert r.status_code == 404


# ---------- DEMO ----------
class TestDemo:
    def test_public_demo_returns_data(self, s):
        r = s.get(f"{API}/public/demo", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "nome" in data
        assert "profileUrl" in data and data["profileUrl"]
        pytest.demo_original_nome = data["nome"]

    def test_put_demo_requires_auth(self, s):
        r = s.put(f"{API}/demo", json={"nome": "hack"}, timeout=15)
        assert r.status_code in (401, 403)

    def test_put_demo_updates_and_persists(self, s, auth_headers):
        new_name = "TEST_Demo Nome Atualizado"
        r = s.put(f"{API}/demo", headers=auth_headers, json={"nome": new_name, "descricao": "TEST demo desc"}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["nome"] == new_name
        # verify via public GET
        r2 = s.get(f"{API}/public/demo", timeout=15)
        assert r2.json()["nome"] == new_name
        # restore
        s.put(f"{API}/demo", headers=auth_headers, json={"nome": pytest.demo_original_nome}, timeout=15)


# ---------- CLIENTE: botoes + opacidade + STATUS FIX ----------
class TestClienteBotoesOpacidadeAndStatusFix:
    @pytest.fixture(scope="class")
    def created(self, s, auth_headers):
        payload = {
            "nome": "TEST_Botoes Cliente",
            "slug": "test-botoes-cliente-auto",
            "status": "Publicado",
            "corFundo": "#FFFFFF",
            "corBotoes": "#E11D2A",
            "corBotoesOpacidade": 0.5,
            "botoesPersonalizados": [
                {"label": "Cardápio", "url": "cardapio.com", "cor": "", "ordem": 0},
                {"label": "Agendar", "url": "https://agendar.example.com", "cor": "#00AA00", "ordem": 1},
            ],
        }
        r = s.post(f"{API}/clientes", headers=auth_headers, json=payload, timeout=15)
        assert r.status_code == 201, r.text
        cid = r.json()["id"]
        yield cid
        s.delete(f"{API}/clientes/{cid}", headers=auth_headers, timeout=15)

    def test_created_persists_botoes_and_opacidade(self, s, auth_headers, created):
        r = s.get(f"{API}/clientes/{created}", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["corBotoesOpacidade"] == 0.5
        assert data["status"] == "Publicado"
        assert len(data["botoesPersonalizados"]) == 2
        assert data["botoesPersonalizados"][0]["label"] == "Cardápio"

    def test_public_slug_returns_botoes(self, s, created):
        r = s.get(f"{API}/public/clientes/test-botoes-cliente-auto", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert len(data["botoesPersonalizados"]) == 2
        assert data["corBotoesOpacidade"] == 0.5

    def test_status_fix_empty_status_preserves_publicado(self, s, auth_headers, created):
        """CRITICAL FIX: PUT with status='' must NOT change status."""
        # send update without touching status field (simulate) by sending status=""
        r = s.put(f"{API}/clientes/{created}", headers=auth_headers,
                  json={"nome": "TEST_Botoes Cliente Renomeado", "status": ""}, timeout=15)
        assert r.status_code == 200
        after = s.get(f"{API}/clientes/{created}", headers=auth_headers, timeout=15).json()
        assert after["status"] == "Publicado", "Empty status should be ignored"
        assert after["nome"] == "TEST_Botoes Cliente Renomeado"

    def test_status_fix_missing_status_preserves(self, s, auth_headers, created):
        r = s.put(f"{API}/clientes/{created}", headers=auth_headers,
                  json={"descricao": "nova"}, timeout=15)
        assert r.status_code == 200
        assert s.get(f"{API}/clientes/{created}", headers=auth_headers, timeout=15).json()["status"] == "Publicado"

    def test_status_change_still_works(self, s, auth_headers, created):
        r = s.put(f"{API}/clientes/{created}", headers=auth_headers,
                  json={"status": "Rascunho"}, timeout=15)
        assert r.status_code == 200
        assert s.get(f"{API}/clientes/{created}", headers=auth_headers, timeout=15).json()["status"] == "Rascunho"
        # revert
        s.put(f"{API}/clientes/{created}", headers=auth_headers, json={"status": "Publicado"}, timeout=15)

    def test_update_botoes_replaces_list(self, s, auth_headers, created):
        r = s.put(f"{API}/clientes/{created}", headers=auth_headers,
                  json={"botoesPersonalizados": [{"label": "Único", "url": "a.com", "ordem": 0}]}, timeout=15)
        assert r.status_code == 200
        data = s.get(f"{API}/clientes/{created}", headers=auth_headers, timeout=15).json()
        assert len(data["botoesPersonalizados"]) == 1
        assert data["botoesPersonalizados"][0]["label"] == "Único"


# ---------- CLEANUP any test leads ----------
def test_cleanup_test_leads(s, auth_headers):
    leads = s.get(f"{API}/leads", headers=auth_headers, timeout=15).json()
    # Note: no delete endpoint available for leads, just verify they're findable
    # The TEST_ prefixed lead remains but is identifiable
    assert isinstance(leads, list)
