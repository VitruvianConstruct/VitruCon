from fastapi import FastAPI, APIRouter, HTTPException, Header, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict, EmailStr, BeforeValidator
from typing import List, Optional, Annotated, Any
from bson import ObjectId
from datetime import datetime, timezone
from pathlib import Path
import os
import uuid
import logging

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "vitruvian-admin-2025")

app = FastAPI(title="Vitruvian Construct API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vitruvian")


# ---------- Helpers ----------

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def serialize(doc: dict) -> dict:
    """Strip Mongo _id and ensure id field is present."""
    if not doc:
        return doc
    doc.pop("_id", None)
    return doc


async def require_admin(x_admin_password: Optional[str] = Header(default=None, alias="X-Admin-Password")):
    if not x_admin_password or x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized: invalid admin password")
    return True


# ---------- Models ----------

class ProjectBase(BaseModel):
    title: str
    slug: str
    status: str = "PRE-ALPHA"
    description: str
    hero_image: Optional[str] = None
    links: dict = Field(default_factory=dict)
    featured: bool = False


class Project(ProjectBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=now_iso)


class ConceptArtBase(BaseModel):
    title: str
    category: str  # environments | characters | creatures | props | mechanisms
    image: str
    caption: Optional[str] = ""
    project_slug: Optional[str] = None


class ConceptArt(ConceptArtBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=now_iso)


class UpdateBase(BaseModel):
    title: str
    short_text: str
    cta_link: Optional[str] = None
    publish_date: str = Field(default_factory=now_iso)


class Update(UpdateBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))


class SubscriberCreate(BaseModel):
    email: EmailStr


class Subscriber(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    subscribed_at: str = Field(default_factory=now_iso)


# ---------- Seed helper ----------

DEFAULT_PROJECT = {
    "title": "Irresponsible Axolotl",
    "slug": "irresponsible-axolotl",
    "status": "PRE-ALPHA // FIELD TESTS ONGOING",
    "description": (
        "An expedition into a flooded cathedral of forgotten machines, "
        "guided by a creature that was never meant to leave its tank. "
        "Part survival, part lucid dream, Irresponsible Axolotl is a "
        "narrative-driven exploration game about regret, regrowth, and the small gods we build to keep us company."
    ),
    "hero_image": "https://images.pexels.com/photos/34945014/pexels-photo-34945014.jpeg",
    "links": {
        "kickstarter": "https://www.kickstarter.com/",
        "patreon": "https://www.patreon.com/",
        "discord": "https://discord.com/",
    },
    "featured": True,
}

DEFAULT_ART = [
    {"title": "Mechanism of the Drowned Hall", "category": "mechanisms",
     "image": "https://images.pexels.com/photos/6714357/pexels-photo-6714357.jpeg",
     "caption": "Field sketch — recovered from notebook 03."},
    {"title": "The Cartographer", "category": "characters",
     "image": "https://images.unsplash.com/photo-1712685884811-5f1cf73e3d32",
     "caption": "Subject refused to give a name."},
    {"title": "Reaching, Reaching", "category": "creatures",
     "image": "https://images.unsplash.com/photo-1625212895824-ff2232e9f304",
     "caption": "Study of the lesser hands."},
    {"title": "Atelier Fragment", "category": "environments",
     "image": "https://images.pexels.com/photos/5026437/pexels-photo-5026437.jpeg",
     "caption": "From the surface workshop."},
    {"title": "Bone Architecture", "category": "environments",
     "image": "https://images.pexels.com/photos/6485526/pexels-photo-6485526.jpeg",
     "caption": "Texture study, sublevel 02."},
    {"title": "Brass Crown", "category": "props",
     "image": "https://images.pexels.com/photos/6714357/pexels-photo-6714357.jpeg",
     "caption": "Recovered artefact, oxidised."},
]

DEFAULT_UPDATES = [
    {"title": "Transmission 001 — First Field Log",
     "short_text": "We opened the door. The water remembers a different shape of the room. Documenting anomalies under sublevel two.",
     "cta_link": None,
     "publish_date": now_iso()},
    {"title": "Transmission 002 — On Names",
     "short_text": "A subject answered to three names today. None of them were the one we gave it. We are no longer certain who is observing whom.",
     "cta_link": None,
     "publish_date": now_iso()},
    {"title": "Transmission 003 — Wishlist Opens Soon",
     "short_text": "Construction continues. A wishlist signal will be raised before the next moon. Watch the feed.",
     "cta_link": "https://store.steampowered.com/",
     "publish_date": now_iso()},
]


async def seed_if_empty():
    if await db.projects.count_documents({}) == 0:
        proj = Project(**DEFAULT_PROJECT)
        await db.projects.insert_one(proj.model_dump())
        logger.info("Seeded default project: %s", proj.title)
    if await db.concept_art.count_documents({}) == 0:
        docs = [ConceptArt(**a).model_dump() for a in DEFAULT_ART]
        await db.concept_art.insert_many(docs)
        logger.info("Seeded %d concept art entries", len(docs))
    if await db.updates.count_documents({}) == 0:
        docs = [Update(**u).model_dump() for u in DEFAULT_UPDATES]
        await db.updates.insert_many(docs)
        logger.info("Seeded %d transmission updates", len(docs))


@app.on_event("startup")
async def on_startup():
    try:
        await seed_if_empty()
    except Exception as e:
        logger.exception("Seed failure: %s", e)


# ---------- Public endpoints ----------

@api_router.get("/")
async def root():
    return {"name": "Vitruvian Construct", "status": "transmission active"}


@api_router.get("/site")
async def site_payload():
    """Single payload for the home page."""
    projects = [serialize(d) for d in await db.projects.find({}, {"_id": 0}).to_list(50)]
    featured = next((p for p in projects if p.get("featured")), projects[0] if projects else None)
    art = [serialize(d) for d in await db.concept_art.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)]
    updates = [serialize(d) for d in await db.updates.find({}, {"_id": 0}).sort("publish_date", -1).to_list(50)]
    return {
        "featured_project": featured,
        "projects": projects,
        "concept_art": art,
        "updates": updates,
        "social": {
            "discord": "https://discord.com/",
            "twitter": "https://twitter.com/",
            "kickstarter": "https://www.kickstarter.com/",
            "patreon": "https://www.patreon.com/",
            "email": "transmissions@vitruvianconstruct.studio",
        },
        "tagline": "Enter the Construct.",
    }


@api_router.get("/projects", response_model=List[Project])
async def list_projects():
    docs = await db.projects.find({}, {"_id": 0}).to_list(100)
    return docs


@api_router.get("/concept-art", response_model=List[ConceptArt])
async def list_concept_art(category: Optional[str] = None):
    q = {}
    if category and category != "all":
        q["category"] = category
    docs = await db.concept_art.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api_router.get("/updates", response_model=List[Update])
async def list_updates():
    docs = await db.updates.find({}, {"_id": 0}).sort("publish_date", -1).to_list(100)
    return docs


@api_router.post("/subscribe", response_model=Subscriber)
async def subscribe(payload: SubscriberCreate):
    existing = await db.subscribers.find_one({"email": payload.email})
    if existing:
        existing.pop("_id", None)
        return existing
    sub = Subscriber(email=payload.email)
    await db.subscribers.insert_one(sub.model_dump())
    return sub


# ---------- Admin endpoints ----------

@api_router.post("/admin/verify")
async def admin_verify(_: bool = Depends(require_admin)):
    return {"ok": True}


@api_router.get("/admin/subscribers")
async def admin_subscribers(_: bool = Depends(require_admin)):
    docs = await db.subscribers.find({}, {"_id": 0}).sort("subscribed_at", -1).to_list(1000)
    return docs


@api_router.post("/admin/projects", response_model=Project)
async def admin_create_project(payload: ProjectBase, _: bool = Depends(require_admin)):
    proj = Project(**payload.model_dump())
    await db.projects.insert_one(proj.model_dump())
    return proj


@api_router.delete("/admin/projects/{project_id}")
async def admin_delete_project(project_id: str, _: bool = Depends(require_admin)):
    res = await db.projects.delete_one({"id": project_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"deleted": project_id}


@api_router.post("/admin/concept-art", response_model=ConceptArt)
async def admin_create_art(payload: ConceptArtBase, _: bool = Depends(require_admin)):
    art = ConceptArt(**payload.model_dump())
    await db.concept_art.insert_one(art.model_dump())
    return art


@api_router.delete("/admin/concept-art/{art_id}")
async def admin_delete_art(art_id: str, _: bool = Depends(require_admin)):
    res = await db.concept_art.delete_one({"id": art_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Art not found")
    return {"deleted": art_id}


@api_router.post("/admin/updates", response_model=Update)
async def admin_create_update(payload: UpdateBase, _: bool = Depends(require_admin)):
    upd = Update(**payload.model_dump())
    await db.updates.insert_one(upd.model_dump())
    return upd


@api_router.delete("/admin/updates/{update_id}")
async def admin_delete_update(update_id: str, _: bool = Depends(require_admin)):
    res = await db.updates.delete_one({"id": update_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Update not found")
    return {"deleted": update_id}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
