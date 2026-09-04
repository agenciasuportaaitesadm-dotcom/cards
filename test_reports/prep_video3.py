import subprocess, requests, imageio_ffmpeg
from dotenv import dotenv_values

FF = imageio_ffmpeg.get_ffmpeg_exe()
BASE = dotenv_values("/app/frontend/.env")["REACT_APP_BACKEND_URL"].rstrip("/")

def make(path, size):
    cmd = [FF, "-y", "-f", "lavfi", "-i", f"testsrc=size={size}:rate=10:duration=3",
           "-f", "lavfi", "-i", "sine=frequency=440:duration=3",
           "-c:v", "libvpx", "-b:v", "300k", "-c:a", "libvorbis", "-shortest", path]
    subprocess.run(cmd, check=True, capture_output=True)
    print("created", path)

make("/tmp/landscape.webm", "640x360")
make("/tmp/portrait.webm", "360x640")

s = requests.Session()
tok = s.post(f"{BASE}/api/auth/login", json={"email": "agenciasuportaaitesadm@gmail.com", "password": "DigitalCards@2026"}).json()["access_token"]
s.headers.update({"Authorization": f"Bearer {tok}"})

urls = {}
for key in ["landscape", "portrait"]:
    p = f"/tmp/{key}.webm"
    with open(p, "rb") as f:
        r = s.post(f"{BASE}/api/media/upload", data={"field": "header"}, files={"file": (f"{key}.webm", f, "video/webm")})
    print(key, r.status_code, r.text[:160])
    urls[key] = f"{BASE}/api/files/{r.json()['path']}"

existing = {c["slug"]: c for c in s.get(f"{BASE}/api/clientes").json()}
for slug, nome, url in [("teste-video-cabecalho", "Teste Vídeo Cabeçalho", urls["landscape"]),
                        ("teste-video-vertical", "Teste Vídeo Vertical", urls["portrait"])]:
    payload = {"nome": nome, "slug": slug, "status": "Publicado",
               "descricao": "Teste de vídeo de cabeçalho responsivo.",
               "whatsapp": "5511999990000", "corFundo": "#FFFFFF", "corBotoes": "#E11D2A",
               "headerUrl": url, "headerType": "video"}
    r = s.put(f"{BASE}/api/clientes/{existing[slug]['id']}", json=payload)
    print(slug, r.status_code, url)
