# Database connection with asyncpg pooling
import asyncpg
from contextlib import asynccontextmanager
import os
from typing import Optional

class Database:
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None
    
    async def connect(self):
        """Create connection pool with asyncpg"""
        dsn = os.getenv("DATABASE_URL")
        if not dsn:
            raise ValueError("DATABASE_URL not set in environment")
        
        self.pool = await asyncpg.create_pool(
            dsn,
            min_size=10,
            max_size=20,
            command_timeout=30,  # 30 second statement timeout
        )
        print("✅ Database pool created")
    
    async def disconnect(self):
        """Close connection pool"""
        if self.pool:
            await self.pool.close()
            print("✅ Database pool closed")
    
    @asynccontextmanager
    async def acquire(self):
        """Acquire connection from pool"""
        if not self.pool:
            raise RuntimeError("Database pool not initialized. Call connect() first.")
        async with self.pool.acquire() as conn:
            yield conn

# Global database instance
db = Database()

