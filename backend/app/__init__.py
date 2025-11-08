# Backend startup script
from app.db import db
from main import app

@app.on_event("startup")
async def startup():
    """Initialize database connection on startup"""
    await db.connect()

@app.on_event("shutdown")
async def shutdown():
    """Close database connection on shutdown"""
    await db.disconnect()

