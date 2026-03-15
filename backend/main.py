import logging
import os
from pathlib import Path

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn

from middleware.db import init_db

# Import all routers
from app.admin.routers import router as admin_router
from app.inspection.routers import router as inspection_router
from auth.routers import router as auth_router
from app.properties.routers import router as properties_router
from app.reports.routers import router as reports_router
from app.users.routers import router as user_router
from app.inspector.routers import router as inspector_router
from app.notifications.routers import router as notifications_router
from app.complaint.routers import router as complaint_router
from app.feedback.routers import router as feedback_router

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("homeguard")


def _get_cors_origins() -> list[str]:
    origins = os.getenv("CORS_ORIGINS", "").strip()
    if origins:
        return [o.strip() for o in origins.split(",") if o.strip()]
    # Production: require explicit CORS_ORIGINS
    if os.getenv("ENV") == "production":
        return []
    return ["*"]


UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "uploads"))
EVIDENCE_DIR = UPLOAD_DIR / "evidence"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting HomeGuard API")
    init_db()
    yield
    logger.info("Shutting down HomeGuard API")


app = FastAPI(
    title="HomeGuard API",
    description="HomeGuard inspection and property management backend",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(inspection_router)
app.include_router(properties_router)
app.include_router(reports_router)
app.include_router(user_router)
app.include_router(inspector_router)
app.include_router(notifications_router)
app.include_router(complaint_router)
app.include_router(feedback_router)

if UPLOAD_DIR.exists():
    app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

@app.get("/")
def read_root():
    return {"message": "HomeGuard API", "docs": "/docs"}


@app.get("/health")
def health():
    """Production health check (e.g. for load balancers)."""
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)