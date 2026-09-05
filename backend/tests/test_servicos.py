"""Backend API tests for the optional 'servicos' field on Cliente (create/update/public/clear)."""
import os
import uuid

import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_EMAIL = "agenciasuportaaitesadm@gmail.com"
ADMIN_PASSWORD = "DigitalCards@2026"


class TestServicos:
    created_ids = []

    @pytest.fixture(scope="class")
    def session(self):
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json"})
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
        if r.status_code != 200:
            pytest.fail(f"Admin login failed: {r.status_code} {r.text[:300]}")
        assert "access_token" in r.json()
        s.headers.update({"Authorization": f"Bearer {r.json()['access_token']}"})
        return s

    @pytest.fixture(scope="class", autouse=True)
    def cleanup(self, session):
        yield
        for cid in list(self.created_ids):
            session.delete(f"{API}/clientes/{cid}", timeout=15)

    def _create(self, session, **extra):
        slug = f"test-serv-{uuid.uuid4().hex[:8]}"
        payload = {"nome": "TEST_Servicos", "slug": slug, "status": "Publicado"}
        payload.update(extra)
        r = session.post(f"{API}/clientes", json=payload, timeout=20)
        assert r.status_code in (200, 201), r.text[:400]
        data = r.json()
        self.created_ids.append(data["id"])
        return data

    # --- CREATE with servicos persists ---
    def test_create_with_servicos_persists(self, session):
        servicos = [
            {"nome": "Corte masculino", "preco": "R$ 50"},
            {"nome": "Barba", "preco": "R$ 30"},
            {"nome": "Combo completo", "preco": None},
        ]
        created = self._create(session, servicos=servicos)
        assert isinstance(created.get("servicos"), list)
        assert [s["nome"] for s in created["servicos"]] == ["Corte masculino", "Barba", "Combo completo"]
        assert created["servicos"][0]["preco"] == "R$ 50"
        assert created["servicos"][2].get("preco") in (None, "")
        assert "_id" not in created

        # GET list must contain the persisted order
        r = session.get(f"{API}/clientes", timeout=20)
        assert r.status_code == 200
        found = next(c for c in r.json() if c["id"] == created["id"])
        assert [s["nome"] for s in found["servicos"]] == ["Corte masculino", "Barba", "Combo completo"]

        # Public endpoint exposes servicos
        rp = requests.get(f"{API}/public/clientes/{created['slug']}", timeout=20)
        assert rp.status_code == 200
        pub = rp.json()
        assert [s["nome"] for s in pub["servicos"]] == ["Corte masculino", "Barba", "Combo completo"]
        assert "_id" not in pub

    # --- CREATE without servicos defaults to [] ---
    def test_create_without_servicos_defaults_empty(self, session):
        created = self._create(session)
        assert created.get("servicos") == []
        rp = requests.get(f"{API}/public/clientes/{created['slug']}", timeout=20)
        assert rp.status_code == 200
        assert rp.json().get("servicos") in ([], None)

    # --- UPDATE: reorder / replace ---
    def test_update_servicos_reorder_and_verify(self, session):
        created = self._create(session, servicos=[{"nome": "A", "preco": "1"}, {"nome": "B", "preco": "2"}])
        new_list = [{"nome": "B", "preco": "2"}, {"nome": "A", "preco": "1"}, {"nome": "C", "preco": "Sob consulta"}]
        r = session.put(f"{API}/clientes/{created['id']}", json={"servicos": new_list}, timeout=20)
        assert r.status_code == 200, r.text[:400]
        assert [s["nome"] for s in r.json()["servicos"]] == ["B", "A", "C"]

        rp = requests.get(f"{API}/public/clientes/{created['slug']}", timeout=20)
        assert [s["nome"] for s in rp.json()["servicos"]] == ["B", "A", "C"]
        assert rp.json()["servicos"][2]["preco"] == "Sob consulta"

    # --- UPDATE: empty list clears ---
    def test_update_servicos_empty_clears(self, session):
        created = self._create(session, servicos=[{"nome": "X", "preco": "9"}])
        r = session.put(f"{API}/clientes/{created['id']}", json={"servicos": []}, timeout=20)
        assert r.status_code == 200, r.text[:400]
        assert r.json()["servicos"] == []
        rp = requests.get(f"{API}/public/clientes/{created['slug']}", timeout=20)
        assert rp.json()["servicos"] == []

    # --- UPDATE: omitting servicos preserves existing ---
    def test_update_other_field_preserves_servicos(self, session):
        created = self._create(session, servicos=[{"nome": "Keep", "preco": "5"}])
        r = session.put(f"{API}/clientes/{created['id']}", json={"descricao": "TEST_desc"}, timeout=20)
        assert r.status_code == 200
        assert r.json()["descricao"] == "TEST_desc"
        assert [s["nome"] for s in r.json()["servicos"]] == ["Keep"]

    # --- Validation: Servico.nome is optional (defaults to "") by design; UI filters empty rows ---
    def test_servico_without_nome_defaults_empty_string(self, session):
        created = self._create(session, servicos=[{"preco": "R$ 10"}])
        assert created["servicos"][0]["nome"] == ""
        assert created["servicos"][0]["preco"] == "R$ 10"

    # --- Validation: wrong type for servicos is rejected ---
    def test_invalid_servicos_type_rejected(self, session):
        slug = f"test-serv-{uuid.uuid4().hex[:8]}"
        r = session.post(
            f"{API}/clientes",
            json={"nome": "TEST_Bad", "slug": slug, "servicos": "nao-uma-lista"},
            timeout=20,
        )
        assert r.status_code == 422, f"expected 422, got {r.status_code}: {r.text[:300]}"

    # --- Existing seeded client with servicos (barbearia-servicos) ---
    def test_public_barbearia_servicos(self):
        r = requests.get(f"{API}/public/clientes/barbearia-servicos", timeout=20)
        if r.status_code == 404:
            pytest.skip("barbearia-servicos not present in this environment")
        assert r.status_code == 200
        data = r.json()
        assert len(data.get("servicos") or []) == 3
        assert [s["nome"] for s in data["servicos"]] == ["Corte masculino", "Barba", "Combo completo"]
        assert data.get("website")
        assert data.get("telefone")
