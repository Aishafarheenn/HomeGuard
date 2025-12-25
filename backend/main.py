from fastapi import FastAPI
from contextlib import asynccontextmanager
import uvicorn
from middleware.db import init_db
from properties.routers import router as property_router
from reports.routers import router as Evidence_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database
    init_db()
    yield
    # Shutdown: Clean up if needed
    pass

app = FastAPI(lifespan=lifespan)
app.include_router(property_router)
app.include_router(Evidence_router)

@app.get("/")
def read_root():
    return {"message": "Hello FastAPI"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)