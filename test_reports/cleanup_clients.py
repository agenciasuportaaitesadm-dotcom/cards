import requests
from dotenv import dotenv_values

BASE = dotenv_values("/app/frontend/.env")["REACT_APP_BACKEND_URL"].rstrip("/")
s = requests.Session()
tok = s.post(f"{BASE}/api/auth/login", json={"email": "agenciasuportaaitesadm@gmail.com", "password": "DigitalCards@2026"}).json()["access_token"]
s.headers.update({"Authorization": f"Bearer {tok}"})
clients = s.get(f"{BASE}/api/clientes").json()
for c in clients:
    if c["slug"] in {"qa-crop-teste"}:
        r = s.delete(f"{BASE}/api/clientes/{c['id']}")
        print("deleted", c["slug"], r.status_code)
print("remaining:", [c["slug"] for c in s.get(f"{BASE}/api/clientes").json()])
