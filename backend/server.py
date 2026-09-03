from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import logging
import bcrypt
import jwt
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


# ---------------- Models ----------------
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
    corFundo: Optional[str] = "#09090B"
    corBotoes: Optional[str] = "#6366F1"
    status: Optional[str] = "Rascunho"  # "Publicado" | "Rascunho"


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
    corFundo: Optional[str] = None
    corBotoes: Optional[str] = None
    status: Optional[str] = None


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
    elif not verify_password(admin_password, existing_admin.get("password_hash", "")):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )
        logger.info("Seed: senha do admin atualizada a partir do .env.")

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
