from fastapi import FastAPI, APIRouter, HTTPException, Header, Depends, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
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
import shutil

ROOT_DIR = Path(__file__).parent
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "vitruvian-admin-2025")
SEED_VERSION = 3  # bump to force re-seed default content

app = FastAPI(title="Vitruvian Construct API")
api_router = APIRouter(prefix="/api")
# Mount uploads at /api/uploads so it routes through ingress
app.mount("/api/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

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


class SiteSettings(BaseModel):
    # Header / CTA
    tagline: str = "Enter the Construct."
    hero_subtitle: Optional[str] = None  # legacy, no longer rendered (kept for back-compat)

    # Hero / splash content (use *word* for italic-gold emphasis, \n for line breaks)
    hero_overline: str = "Studio · Opvs Primvm · MMXXVI"
    hero_title: str = "We build *invented beings*\nfrom *parchment* & *brass*."
    hero_body: str = (
        "Vitruvian Construct is a small studio assembling games like field notebooks — "
        "equal parts renaissance sketch, occult diagram, and animate mechanism. The "
        "archive below is incomplete. That is intentional."
    )
    hero_secondary_cta_label: str = "Receive Transmissions →"

    # Manifesto content
    manifesto_overline: str = "— Manifesto · §I"
    manifesto_heading: str = (
        "We treat the studio\nas an *atelier*,\nand every game as a\n*small mechanism*."
    )
    manifesto_body: str = (
        "Vitruvian Construct is an independent studio assembling slow, narrative games "
        "that feel less like products and more like artefacts — pulled from a workshop "
        "somewhere between a renaissance bottega and a cabinet of curiosities.\n\n"
        "We are interested in invented beings: creatures and characters that should not "
        "exist but insist on it anyway. We design our mechanics like clockwork: visible, "
        "slightly imperfect, occasionally cruel.\n\n"
        "Each project ships with its own diagrams, marginalia, and field notes. "
        "The game is the centre; the archive around it is the world."
    )
    manifesto_tags: List[str] = Field(default_factory=lambda: ["narrative", "handcrafted", "small-team", "long-form"])
    manifesto_image: str = "https://images.unsplash.com/photo-1625212895824-ff2232e9f304"
    manifesto_caption: str = "Plate I — study, reaching hands"

    # Channels
    social: dict = Field(default_factory=lambda: {
        "discord": "https://discord.com/",
        "twitter": "https://twitter.com/",
        "kickstarter": "https://www.kickstarter.com/",
        "patreon": "https://www.patreon.com/",
        "email": "transmissions@vitruvianconstruct.studio",
    })


# Partial update models — all fields optional
class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None
    hero_image: Optional[str] = None
    links: Optional[dict] = None
    featured: Optional[bool] = None


class ConceptArtUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    image: Optional[str] = None
    caption: Optional[str] = None
    project_slug: Optional[str] = None


class UpdatePatch(BaseModel):
    title: Optional[str] = None
    short_text: Optional[str] = None
    cta_link: Optional[str] = None
    publish_date: Optional[str] = None


# ---------- Seed helper ----------

# Concept art / hero images provided by the studio (uploaded assets).
KIDDO_HERO = "https://customer-assets.emergentagent.com/job_mechanical-studio/artifacts/yivqjtvm_image_c656e1e1.png"
KIDDO_COTTAGE = "https://customer-assets.emergentagent.com/job_mechanical-studio/artifacts/dtm3r1no_image_c5df5de.png"
LOTTIE_BUDDY = "https://customer-assets.emergentagent.com/job_mechanical-studio/artifacts/0trccozx_image_297d3664%20%281%29.png"
LOTTIE_MOODS_CLEAN = "https://customer-assets.emergentagent.com/job_mechanical-studio/artifacts/k7cdukth_05446940-1e6f-4ba6-a10f-ec129cb11bc2.png"
LOTTIE_MOODS_ROUGH = "https://customer-assets.emergentagent.com/job_mechanical-studio/artifacts/16riqlv6_05446940-1e6f-4ba6-a10f-ec129cb11bc2%20nws.png"


DEFAULT_PROJECT = {
    "title": "Irresponsible Axolotl",
    "slug": "irresponsible-axolotl",
    "status": "COZY CHAOS // IN DEVELOPMENT",
    "description": (
        "A cozy chaos slice-of-life game. You play Kiddo, a middle-schooler — child of "
        "two super-genius scientists and keeper of Lottie the Axolotl. Lottie is bigger, "
        "stronger, smarter, and a great deal more reckless than any axolotl has any "
        "business being. Take your eye off her for a second and she will absolutely "
        "redecorate the kitchen, hijack a science fair, or accidentally invent something. "
        "Navigate middle-school life, keep your impossibly clever pet entertained, and "
        "you might just make it through the school year intact."
    ),
    "hero_image": KIDDO_HERO,
    "links": {
        "kickstarter": "https://www.kickstarter.com/",
        "patreon": "https://www.patreon.com/",
        "discord": "https://discord.com/",
    },
    "featured": True,
}

DEFAULT_ART = [
    {"title": "Irresponsible Axolotl — Key Art", "category": "characters",
     "image": KIDDO_HERO,
     "caption": "Shhh… Lottie's on a mission. Classroom infiltration, day one."},
    {"title": "The Great Escape", "category": "environments",
     "image": KIDDO_COTTAGE,
     "caption": "Kiddo gives chase. Cottage garden, late afternoon."},
    {"title": "Me & My Best Buddy, Lottie!", "category": "characters",
     "image": LOTTIE_BUDDY,
     "caption": "Bedroom workshop. Lottie's amazing, escape-proof aquarium (allegedly)."},
    {"title": "Lottie — Mood Sheet (Clean)", "category": "creatures",
     "image": LOTTIE_MOODS_CLEAN,
     "caption": "Serene · Confused · Happy · New / Curious · Stuck · Flustered · Overwhelmed · Bored."},
    {"title": "Lottie — Mood Sheet (Studies)", "category": "creatures",
     "image": LOTTIE_MOODS_ROUGH,
     "caption": "Early colour studies for Lottie's expression set."},
]

DEFAULT_UPDATES = [
    {"title": "Transmission 001 — Meet Kiddo & Lottie",
     "short_text": "First public reveal. Cozy chaos. Middle school. An axolotl with opinions. We will be okay. Probably.",
     "cta_link": None,
     "publish_date": now_iso()},
    {"title": "Transmission 002 — Lottie's Many Moods",
     "short_text": "Lottie has at least eight documented expressions and almost as many ways to get into trouble. The mood sheet is now in the archive.",
     "cta_link": None,
     "publish_date": now_iso()},
    {"title": "Transmission 003 — Wishlist Opens Soon",
     "short_text": "We are wiring up the wishlist door. When it opens we will raise a flag in this feed and on Discord.",
     "cta_link": "https://store.steampowered.com/",
     "publish_date": now_iso()},
]


async def seed_if_empty():
    meta = await db.meta.find_one({"_id": "seed"})
    current_version = (meta or {}).get("version", 0)
    needs_reseed = current_version < SEED_VERSION

    if await db.projects.count_documents({}) == 0:
        proj = Project(**DEFAULT_PROJECT)
        await db.projects.insert_one(proj.model_dump())
        logger.info("Seeded default project: %s", proj.title)
    elif needs_reseed:
        # Update the canonical irresponsible-axolotl project in place
        await db.projects.update_one(
            {"slug": "irresponsible-axolotl"},
            {"$set": {
                "title": DEFAULT_PROJECT["title"],
                "status": DEFAULT_PROJECT["status"],
                "description": DEFAULT_PROJECT["description"],
                "hero_image": DEFAULT_PROJECT["hero_image"],
                "featured": True,
            }},
            upsert=False,
        )
        logger.info("Re-seeded irresponsible-axolotl project copy.")

    if await db.concept_art.count_documents({}) == 0 or needs_reseed:
        # wipe and re-insert canonical art
        if needs_reseed:
            await db.concept_art.delete_many({})
        docs = [ConceptArt(**a).model_dump() for a in DEFAULT_ART]
        await db.concept_art.insert_many(docs)
        logger.info("Seeded %d concept art entries", len(docs))

    if await db.updates.count_documents({}) == 0:
        docs = [Update(**u).model_dump() for u in DEFAULT_UPDATES]
        await db.updates.insert_many(docs)
        logger.info("Seeded %d transmission updates", len(docs))

    if await db.site_settings.count_documents({}) == 0:
        s = SiteSettings().model_dump()
        s["_id"] = "singleton"
        await db.site_settings.insert_one(s)

    await db.meta.update_one({"_id": "seed"}, {"$set": {"version": SEED_VERSION}}, upsert=True)


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
    raw = await db.site_settings.find_one({"_id": "singleton"}) or {}
    raw.pop("_id", None)
    # hydrate through model so missing fields fall back to defaults
    settings = SiteSettings(**{k: v for k, v in raw.items() if k in SiteSettings.model_fields}).model_dump()
    return {
        "featured_project": featured,
        "projects": projects,
        "concept_art": art,
        "updates": updates,
        "social": settings["social"],
        "tagline": settings["tagline"],
        "hero_subtitle": settings.get("hero_subtitle"),
        "settings": settings,
    }


@api_router.get("/settings")
async def get_settings():
    raw = await db.site_settings.find_one({"_id": "singleton"})
    if not raw:
        s = SiteSettings().model_dump()
        s_with_id = {"_id": "singleton", **s}
        await db.site_settings.insert_one(s_with_id)
        return s
    raw.pop("_id", None)
    return SiteSettings(**{k: v for k, v in raw.items() if k in SiteSettings.model_fields}).model_dump()


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


@api_router.put("/admin/projects/{project_id}", response_model=Project)
async def admin_update_project(project_id: str, payload: ProjectUpdate, _: bool = Depends(require_admin)):
    patch = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    if not patch:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = await db.projects.find_one_and_update({"id": project_id}, {"$set": patch})
    if not res:
        raise HTTPException(status_code=404, detail="Project not found")
    if patch.get("featured") is True:
        await db.projects.update_many({"id": {"$ne": project_id}}, {"$set": {"featured": False}})
    doc = await db.projects.find_one({"id": project_id}, {"_id": 0})
    return doc


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


@api_router.put("/admin/concept-art/{art_id}", response_model=ConceptArt)
async def admin_update_art(art_id: str, payload: ConceptArtUpdate, _: bool = Depends(require_admin)):
    patch = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    if not patch:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = await db.concept_art.find_one_and_update({"id": art_id}, {"$set": patch})
    if not res:
        raise HTTPException(status_code=404, detail="Art not found")
    doc = await db.concept_art.find_one({"id": art_id}, {"_id": 0})
    return doc


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


@api_router.put("/admin/updates/{update_id}", response_model=Update)
async def admin_update_update(update_id: str, payload: UpdatePatch, _: bool = Depends(require_admin)):
    patch = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    if not patch:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = await db.updates.find_one_and_update({"id": update_id}, {"$set": patch})
    if not res:
        raise HTTPException(status_code=404, detail="Update not found")
    doc = await db.updates.find_one({"id": update_id}, {"_id": 0})
    return doc


@api_router.delete("/admin/updates/{update_id}")
async def admin_delete_update(update_id: str, _: bool = Depends(require_admin)):
    res = await db.updates.delete_one({"id": update_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Update not found")
    return {"deleted": update_id}


# ---- Settings ----
@api_router.get("/admin/settings")
async def admin_get_settings(_: bool = Depends(require_admin)):
    raw = await db.site_settings.find_one({"_id": "singleton"})
    if not raw:
        s = SiteSettings().model_dump()
        await db.site_settings.insert_one({"_id": "singleton", **s})
        return s
    raw.pop("_id", None)
    # hydrate through model so any new fields fall back to defaults instead of being missing
    return SiteSettings(**{k: v for k, v in raw.items() if k in SiteSettings.model_fields}).model_dump()


@api_router.put("/admin/settings")
async def admin_update_settings(payload: SiteSettings, _: bool = Depends(require_admin)):
    doc = payload.model_dump()
    await db.site_settings.update_one({"_id": "singleton"}, {"$set": doc}, upsert=True)
    return doc


# ---- File upload ----
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"}


@api_router.post("/admin/upload")
async def admin_upload(file: UploadFile = File(...), _: bool = Depends(require_admin)):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}. Allowed: {sorted(ALLOWED_EXTENSIONS)}")
    new_name = f"{uuid.uuid4().hex}{ext}"
    target = UPLOADS_DIR / new_name
    with target.open("wb") as buf:
        shutil.copyfileobj(file.file, buf)
    url = f"/api/uploads/{new_name}"
    return {"url": url, "filename": new_name}


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
