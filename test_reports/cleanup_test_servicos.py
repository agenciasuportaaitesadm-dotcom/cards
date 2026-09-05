import os, requests
API = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") + "/api"
s = requests.Session()
r = s.post(f"{API}/auth/login", json={"email": "agenciasuportaaitesadm@gmail.com", "password": "DigitalCards@2026"}, timeout=20)
s.headers.update({"Authorization": f"Bearer {r.json()['access_token']}"})
for c in s.get(f"{API}/clientes", timeout=20).json():
    if c["nome"].startswith("TEST_") or c["slug"].startswith("test-serv-"):
        print("deleting", c["slug"], s.delete(f"{API}/clientes/{c['id']}", timeout=20).status_code)
print("remaining:", [c["slug"] for c in s.get(f"{API}/clientes", timeout=20).json()])
