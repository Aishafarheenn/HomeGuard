from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from middleware.db import init_db

# Import all routers
from app.admin.routers import router as admin_router
from app.inspection.routers import router as inspection_router
from auth.routers import router as auth_router
from app.properties.routers import router as properties_router
from app.reports.routers import router as reports_router
from app.users.routers import router as user_router  # Uncomment when router is defined
from app.inspector.routers import router as inspector_router  # Uncomment when router is defined
# from app.notifications.routers import router as notifications_router  # Uncomment when router is defined

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database
    init_db()
    yield
    # Shutdown: Clean up if needed
    pass

app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(admin_router)
app.include_router(inspection_router)
app.include_router(auth_router)
app.include_router(properties_router)
app.include_router(reports_router)
app.include_router(user_router)  # Uncomment when router is defined
app.include_router(inspector_router)  # Uncomment when router is defined
# app.include_router(notifications_router)  # Uncomment when router is defined

@app.get("/")
def read_root():
    return {"message": "Hello FastAPI"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)