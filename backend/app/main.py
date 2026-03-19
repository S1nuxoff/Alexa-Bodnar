from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.database import engine, Base
from app.routers import auth, content, services, gallery, inquiries, broadcasts, email_templates
from app.models import email_template as _et_model  # noqa: F401 — ensures table is registered
from app.database import AsyncSessionLocal
from app import mq


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as db:
        await email_templates.seed_defaults(db)
    await mq.connect(settings.RABBITMQ_URL)
    yield
    await mq.close()


app = FastAPI(title="Alexa Bodnar Admin API", version="1.0.0", lifespan=lifespan, redirect_slashes=False, docs_url=None, redoc_url=None, openapi_url=None)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router, prefix="/api")
app.include_router(content.router, prefix="/api")
app.include_router(services.router, prefix="/api")
app.include_router(gallery.router, prefix="/api")
app.include_router(inquiries.router, prefix="/api")
app.include_router(broadcasts.router, prefix="/api")
app.include_router(email_templates.router, prefix="/api")


@app.get("/")
async def root():
    return {"status": "ok", "message": "Alexa Bodnar API"}
