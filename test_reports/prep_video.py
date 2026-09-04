import requests
from dotenv import dotenv_values

BASE = dotenv_values("/app/frontend/.env")["REACT_APP_BACKEND_URL"].rstrip("/")
s = requests.Session()
tok = s.post(f"{BASE}/api/auth/login", json={"email": "agenciasuportaaitesadm@gmail.com", "password": "DigitalCards@2026"}).json()["access_token"]
s.headers.update({"Authorization": f"Bearer {tok}"})

payload = {
    "nome": "Teste Vídeo Cabeçalho", "slug": "teste-video-cabecalho", "status": "Publicado",
    "descricao": "Teste de vídeo de cabeçalho responsivo.",
    "whatsapp": "5511999990000",
    "corFundo": "#FFFFFF", "corBotoes": "#E11D2A",
    "headerUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "headerType": "video",
}
existing = {c["slug"]: c for c in s.get(f"{BASE}/api/clientes").json()}
if payload["slug"] in existing:
    r = s.put(f"{BASE}/api/clientes/{existing[payload['slug']]['id']}", json=payload)
else:
    r = s.post(f"{BASE}/api/clientes", json=payload)
print(r.status_code, r.text[:300])
print(s.get(f"{BASE}/api/public/clientes/teste-video-cabecalho").json().get("headerType"))
