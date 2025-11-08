from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="DASH HEAVEN API",
    description="Backend API for DASH memorial platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://dashwebapp10.vercel.app",
        os.getenv("FRONTEND_URL", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "DASH HEAVEN API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

# Import routers
from app.api import ai_jobs, heaven, orders
from app.db import db

app.include_router(ai_jobs.router, prefix="/api/ai-jobs", tags=["AI Jobs"])
app.include_router(heaven.router, prefix="/api/heaven", tags=["HEAVEN"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])

@app.on_event("startup")
async def startup():
    """Initialize database connection on startup"""
    await db.connect()

@app.on_event("shutdown")
async def shutdown():
    """Close database connection on shutdown"""
    await db.disconnect()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

