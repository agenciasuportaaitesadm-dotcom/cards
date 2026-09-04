import os, json, requests
from dotenv import dotenv_values

BASE = dotenv_values("/app/frontend/.env")["REACT_APP_BACKEND_URL"].rstrip("/")
s = requests.Session()
r = s.post(f"{BASE}/api/auth/login", json={"email": "agenciasuportaaitesadm@gmail.com", "password": "DigitalCards@2026"})
print("login", r.status_code)
tok = r.json()["access_token"]
s.headers.update({"Authorization": f"Bearer {tok}"})

r = s.get(f"{BASE}/api/clientes")
print("list", r.status_code)
for c in r.json():
    print(c.get("slug"), "|", c.get("nome"), "|", c.get("status"), "| fundo", c.get("corFundo"), "| botoes", c.get("corBotoes"), "| headerType", c.get("headerType"), "| header", (c.get("headerUrl") or "")[:60])

targets = [
    {"slug": "teste-escuro-botao-claro", "nome": "Teste Escuro Botão Claro", "corFundo": "#0B0B10", "corBotoes": "#F5F5F5"},
    {"slug": "teste-claro-botao-escuro", "nome": "Teste Claro Botão Escuro", "corFundo": "#FAFAFA", "corBotoes": "#141420"},
]
existing = {c.get("slug"): c for c in r.json()}
for t in targets:
    payload = {
        "nome": t["nome"], "slug": t["slug"], "status": "Publicado",
        "descricao": "Cliente de teste de contraste automático.",
        "whatsapp": "5511999990000", "telefone": "1133334444",
        "instagram": "https://instagram.com/teste", "facebook": "https://facebook.com/teste",
        "tiktok": "https://tiktok.com/@teste", "website": "https://exemplo.com.br",
        "googleReviewUrl": "https://g.page/r/teste/review",
        "mapsUrl": "https://maps.google.com/?q=teste",
        "endereco": "Rua Teste, 100 - São Paulo/SP",
        "horario": "Seg: 09:00 - 18:00\nDom: Fechado",
        "corFundo": t["corFundo"], "corBotoes": t["corBotoes"],
    }
    if t["slug"] in existing:
        cid = existing[t["slug"]]["id"]
        rr = s.put(f"{BASE}/api/clientes/{cid}", json=payload)
    else:
        rr = s.post(f"{BASE}/api/clientes", json=payload)
    print("upsert", t["slug"], rr.status_code, rr.text[:200])
