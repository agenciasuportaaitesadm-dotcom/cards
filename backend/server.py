from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, UploadFile, File, Form, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import logging
import bcrypt
import jwt
import requests
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

SLUG_REGEX = re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*$')

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_HOURS = 12


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------- Auth helpers ----------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def require_auth(request: Request) -> dict:
    token = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
    if not token:
        token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Não autenticado.")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Token inválido.")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sessão expirada. Faça login novamente.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido.")
    user = await db.users.find_one({"id": payload.get("sub")}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado.")
    return user


class LoginInput(BaseModel):
    email: str
    password: str


class ChangePasswordInput(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str


# ---------------- Object storage ----------------
APP_NAME = "digital-cards-ia"
STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
_storage_key = None

IMAGE_EXT = {"jpg", "jpeg", "png", "webp"}
VIDEO_EXT = {"mp4", "webm"}
MAX_IMAGE_BYTES = 5 * 1024 * 1024
MAX_VIDEO_BYTES = 25 * 1024 * 1024
MIME_TYPES = {
    "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
    "webp": "image/webp", "mp4": "video/mp4", "webm": "video/webm",
}


def init_storage(force: bool = False):
    global _storage_key
    if _storage_key and not force:
        return _storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key, "Content-Type": content_type}, data=data, timeout=120)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.put(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key, "Content-Type": content_type}, data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# ---------------- Models ----------------
class Servico(BaseModel):
    model_config = ConfigDict(extra="ignore")
    nome: str = ""
    preco: Optional[str] = ""


class ClienteBase(BaseModel):
    model_config = ConfigDict(extra="ignore")

    nome: str
    slug: str
    descricao: Optional[str] = ""
    telefone: Optional[str] = ""
    whatsapp: Optional[str] = ""
    endereco: Optional[str] = ""
    mapsUrl: Optional[str] = ""
    horario: Optional[str] = ""
    instagram: Optional[str] = ""
    facebook: Optional[str] = ""
    tiktok: Optional[str] = ""
    website: Optional[str] = ""
    googleReviewUrl: Optional[str] = ""
    seoTitle: Optional[str] = ""
    seoDesc: Optional[str] = ""
    seoKeywords: Optional[str] = ""
    logoUrl: Optional[str] = ""
    profileUrl: Optional[str] = ""
    headerUrl: Optional[str] = ""
    headerType: Optional[str] = ""
    corFundo: Optional[str] = "#09090B"
    corBotoes: Optional[str] = "#6366F1"
    status: Optional[str] = "Rascunho"  # "Publicado" | "Rascunho"
    servicos: Optional[List[Servico]] = []


class Cliente(ClienteBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: str = Field(default_factory=now_iso)
    updatedAt: str = Field(default_factory=now_iso)


class ClienteCreate(ClienteBase):
    pass


class ClienteUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    nome: Optional[str] = None
    slug: Optional[str] = None
    descricao: Optional[str] = None
    telefone: Optional[str] = None
    whatsapp: Optional[str] = None
    endereco: Optional[str] = None
    mapsUrl: Optional[str] = None
    horario: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    tiktok: Optional[str] = None
    website: Optional[str] = None
    googleReviewUrl: Optional[str] = None
    seoTitle: Optional[str] = None
    seoDesc: Optional[str] = None
    seoKeywords: Optional[str] = None
    logoUrl: Optional[str] = None
    profileUrl: Optional[str] = None
    headerUrl: Optional[str] = None
    headerType: Optional[str] = None
    corFundo: Optional[str] = None
    corBotoes: Optional[str] = None
    status: Optional[str] = None
    servicos: Optional[List[Servico]] = None


def validate_slug(slug: str):
    if not SLUG_REGEX.match(slug or ""):
        raise HTTPException(
            status_code=400,
            detail="Slug inválido. Use apenas letras minúsculas, números e hífens.",
        )


# ---------------- Routes ----------------
@api_router.get("/")
async def root():
    return {"message": "Digital Cards IA API"}


@api_router.post("/auth/login")
async def login(payload: LoginInput):
    email = (payload.email or "").lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos.")
    token = create_access_token(user["id"], email)
    safe = {k: v for k, v in user.items() if k not in ("_id", "password_hash")}
    return {"access_token": token, "token_type": "bearer", "user": safe}


@api_router.get("/auth/me")
async def me(user: dict = Depends(require_auth)):
    return user


@api_router.post("/auth/logout")
async def logout(user: dict = Depends(require_auth)):
    return {"message": "Sessão encerrada com sucesso."}


@api_router.post("/auth/change-password")
async def change_password(payload: ChangePasswordInput, user: dict = Depends(require_auth)):
    if payload.new_password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="As novas senhas não coincidem.")
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="A nova senha deve ter pelo menos 8 caracteres.")
    full = await db.users.find_one({"id": user["id"]})
    if not full or not verify_password(payload.current_password, full.get("password_hash", "")):
        raise HTTPException(status_code=400, detail="Senha atual incorreta.")
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"password_hash": hash_password(payload.new_password)}},
    )
    return {"message": "Senha alterada com sucesso. Faça login novamente."}


@api_router.post("/media/upload")
async def upload_media(field: str = Form(...), file: UploadFile = File(...), _user: dict = Depends(require_auth)):
    ext = file.filename.rsplit(".", 1)[-1].lower() if (file.filename and "." in file.filename) else ""
    is_video = ext in VIDEO_EXT
    allowed = (IMAGE_EXT | VIDEO_EXT) if field == "header" else IMAGE_EXT
    if ext not in allowed:
        msg = "Formato não suportado. Use JPG, PNG ou WEBP" + (", ou vídeo MP4/WEBM." if field == "header" else ".")
        raise HTTPException(status_code=400, detail=msg)
    data = await file.read()
    limit = MAX_VIDEO_BYTES if is_video else MAX_IMAGE_BYTES
    if len(data) > limit:
        raise HTTPException(
            status_code=400,
            detail="Vídeo muito grande. Limite de 25 MB." if is_video else "Imagem muito grande. Limite de 5 MB.",
        )
    content_type = MIME_TYPES.get(ext, file.content_type or "application/octet-stream")
    path = f"{APP_NAME}/uploads/{uuid.uuid4()}.{ext}"
    try:
        result = put_object(path, data, content_type)
    except Exception as e:
        logging.getLogger(__name__).error(f"Upload falhou: {e}")
        raise HTTPException(status_code=502, detail="Não foi possível enviar o arquivo. Tente novamente.")
    stored = result.get("path", path)
    await db.files.insert_one({
        "id": str(uuid.uuid4()),
        "storage_path": stored,
        "original_filename": file.filename,
        "content_type": content_type,
        "size": result.get("size", len(data)),
        "is_deleted": False,
        "created_at": now_iso(),
    })
    return {"path": stored, "type": "video" if is_video else "image", "content_type": content_type, "filename": file.filename}


@api_router.get("/files/{path:path}")
async def serve_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado.")
    try:
        content, ct = get_object(path)
    except Exception:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado.")
    return Response(
        content=content,
        media_type=record.get("content_type") or ct,
        headers={"Cache-Control": "public, max-age=3600"},
    )


@api_router.get("/clientes", response_model=List[Cliente])
async def list_clientes(_user: dict = Depends(require_auth)):
    docs = await db.clientes.find({}, {"_id": 0}).sort("createdAt", -1).to_list(1000)
    return docs


@api_router.get("/clientes/{cliente_id}", response_model=Cliente)
async def get_cliente(cliente_id: str, _user: dict = Depends(require_auth)):
    doc = await db.clientes.find_one({"id": cliente_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Cliente não encontrado.")
    return doc


@api_router.post("/clientes", response_model=Cliente, status_code=201)
async def create_cliente(payload: ClienteCreate, _user: dict = Depends(require_auth)):
    validate_slug(payload.slug)
    existing = await db.clientes.find_one({"slug": payload.slug})
    if existing:
        raise HTTPException(status_code=409, detail="Este slug já está em uso. Escolha outro.")
    cliente = Cliente(**payload.model_dump())
    await db.clientes.insert_one(cliente.model_dump())
    return cliente


@api_router.put("/clientes/{cliente_id}", response_model=Cliente)
async def update_cliente(cliente_id: str, payload: ClienteUpdate, _user: dict = Depends(require_auth)):
    doc = await db.clientes.find_one({"id": cliente_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Cliente não encontrado.")

    updates = {k: v for k, v in payload.model_dump().items() if v is not None}

    if "slug" in updates:
        validate_slug(updates["slug"])
        clash = await db.clientes.find_one({"slug": updates["slug"], "id": {"$ne": cliente_id}})
        if clash:
            raise HTTPException(status_code=409, detail="Este slug já está em uso. Escolha outro.")

    updates["updatedAt"] = now_iso()
    await db.clientes.update_one({"id": cliente_id}, {"$set": updates})
    doc.update(updates)
    return doc


@api_router.delete("/clientes/{cliente_id}")
async def delete_cliente(cliente_id: str, _user: dict = Depends(require_auth)):
    result = await db.clientes.delete_one({"id": cliente_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cliente não encontrado.")
    return {"message": "Cliente removido com sucesso."}


@api_router.get("/public/clientes/{slug}", response_model=Cliente)
async def get_public_cliente(slug: str):
    doc = await db.clientes.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Página não encontrada.")
    return doc


# ---------------- Seed ----------------
SEED_CLIENTE = {
    "nome": "Studio Exemplo",
    "slug": "studio-exemplo",
    "descricao": "Estúdio de beleza e estética avançada. Atendimento personalizado com hora marcada no coração da cidade.",
    "telefone": "(11) 4000-0000",
    "whatsapp": "5511990000000",
    "endereco": "Av. Paulista, 1000 — Bela Vista, São Paulo/SP",
    "mapsUrl": "https://maps.google.com/?q=Av.+Paulista+1000+Sao+Paulo",
    "horario": "Segunda a Sexta: 09:00 — 19:00\nSábado: 09:00 — 16:00\nDomingo: Fechado",
    "instagram": "https://instagram.com/studioexemplo",
    "facebook": "https://facebook.com/studioexemplo",
    "tiktok": "https://tiktok.com/@studioexemplo",
    "website": "https://studioexemplo.com.br",
    "googleReviewUrl": "https://g.page/r/exemplo/review",
    "seoTitle": "Studio Exemplo — Beleza e Estética em São Paulo",
    "seoDesc": "Estúdio de beleza e estética avançada com atendimento personalizado.",
    "seoKeywords": "salão, estética, beleza, São Paulo",
    "corFundo": "#121215",
    "corBotoes": "#6366F1",
    "status": "Publicado",
}


@app.on_event("startup")
async def seed_db():
    logger = logging.getLogger(__name__)
    try:
        init_storage()
        logger.info("Storage inicializado.")
    except Exception as e:
        logger.error(f"Falha ao inicializar storage: {e}")
    # Admin user (idempotent)
    admin_email = os.environ["ADMIN_EMAIL"].lower().strip()
    admin_password = os.environ["ADMIN_PASSWORD"]
    try:
        await db.users.create_index("email", unique=True)
    except Exception:
        pass
    existing_admin = await db.users.find_one({"email": admin_email})
    if not existing_admin:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Administrador",
            "role": "admin",
            "created_at": now_iso(),
        })
        logger.info("Seed: usuário admin criado.")
    # Observação: não sobrescrevemos a senha aqui para preservar
    # alterações feitas pelo próprio administrador em "Segurança da conta".

    # Cliente de demonstração (idempotente)
    existing = await db.clientes.find_one({"slug": SEED_CLIENTE["slug"]})
    if not existing:
        cliente = Cliente(**SEED_CLIENTE)
        await db.clientes.insert_one(cliente.model_dump())
        logger.info("Seed: cliente 'Studio Exemplo' criado.")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
