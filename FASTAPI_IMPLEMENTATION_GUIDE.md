# FastAPI Backend Implementation Guide

## Database Setup

✅ **SQL Schema Complete**: Run `SUPABASE_COPY_PASTE.sql` in Supabase SQL Editor

This creates:
- All core tables (media, calls, avatars, voices, slideshows, etc.)
- Business tables (orders, payments, deliveries, vendors, pdfs)
- **NEW**: `ai_jobs` table for tracking background AI processing
- All RLS policies with proper security
- Indexes for performance
- Auto-update triggers for `updated_at` fields

## FastAPI Backend Architecture

### 1. Database Connection Setup

```python
# app/db.py
import asyncpg
from contextlib import asynccontextmanager

class Database:
    def __init__(self):
        self.pool = None
    
    async def connect(self, dsn: str, min_size: int = 10, max_size: int = 20):
        """Create connection pool with asyncpg"""
        self.pool = await asyncpg.create_pool(
            dsn,
            min_size=min_size,
            max_size=max_size,
            command_timeout=30,  # 30 second statement timeout
        )
    
    async def disconnect(self):
        if self.pool:
            await self.pool.close()
    
    @asynccontextmanager
    async def acquire(self):
        """Acquire connection from pool"""
        async with self.pool.acquire() as conn:
            yield conn

db = Database()
```

### 2. AI Jobs Queue Pattern

```python
# app/ai_jobs.py
from typing import Optional
from datetime import datetime
import json

async def create_ai_job(
    user_id: str,
    job_type: str,
    input_url: str,
    metadata: Optional[dict] = None
) -> str:
    """Create AI job record and enqueue for processing"""
    async with db.acquire() as conn:
        job_id = await conn.fetchval("""
            INSERT INTO ai_jobs (user_id, job_type, input_url, metadata, status)
            VALUES ($1, $2, $3, $4, 'pending')
            RETURNING id
        """, user_id, job_type, input_url, json.dumps(metadata or {}))
        
        # Enqueue to background worker (Celery/RQ/Edge Function)
        await enqueue_job(job_id, job_type, input_url)
        
        return str(job_id)

async def update_ai_job_status(
    job_id: str,
    status: str,
    progress: Optional[int] = None,
    output_url: Optional[str] = None,
    result_data: Optional[dict] = None,
    error_message: Optional[str] = None
):
    """Update AI job status (called by background worker)"""
    async with db.acquire() as conn:
        updates = []
        params = [job_id]
        param_idx = 2
        
        if status:
            updates.append(f"status = ${param_idx}")
            params.append(status)
            param_idx += 1
            
            if status == 'processing':
                updates.append(f"started_at = ${param_idx}")
                params.append(datetime.utcnow())
                param_idx += 1
            elif status in ('completed', 'failed'):
                updates.append(f"completed_at = ${param_idx}")
                params.append(datetime.utcnow())
                param_idx += 1
        
        if progress is not None:
            updates.append(f"progress_percentage = ${param_idx}")
            params.append(progress)
            param_idx += 1
        
        if output_url:
            updates.append(f"output_url = ${param_idx}")
            params.append(output_url)
            param_idx += 1
        
        if result_data:
            updates.append(f"result_data = ${param_idx}")
            params.append(json.dumps(result_data))
            param_idx += 1
        
        if error_message:
            updates.append(f"error_message = ${param_idx}")
            params.append(error_message)
            param_idx += 1
        
        if updates:
            query = f"""
                UPDATE ai_jobs 
                SET {', '.join(updates)}
                WHERE id = $1
            """
            await conn.execute(query, *params)
```

### 3. Signed URL Pattern for Direct Uploads

```python
# app/storage.py
from supabase import create_client, Client
from datetime import timedelta

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # Use service role for admin operations
)

async def generate_upload_url(bucket: str, file_path: str, expires_in: int = 3600) -> dict:
    """Generate signed URL for direct client upload"""
    # Use Supabase Storage API to generate signed upload URL
    # Client uploads directly to Storage, bypasses FastAPI
    response = supabase.storage.from_(bucket).create_signed_upload_url(
        file_path,
        expires_in=expires_in
    )
    return {
        "upload_url": response["signedURL"],
        "path": file_path,
        "expires_at": datetime.utcnow() + timedelta(seconds=expires_in)
    }

async def generate_download_url(bucket: str, file_path: str, expires_in: int = 3600) -> str:
    """Generate signed URL for downloading (or use public bucket)"""
    response = supabase.storage.from_(bucket).create_signed_url(
        file_path,
        expires_in=expires_in
    )
    return response["signedURL"]
```

### 4. Background Worker Integration

```python
# app/workers/voice_clone.py
import asyncio
from elevenlabs import Voice, clone
from app.ai_jobs import update_ai_job_status
from app.storage import download_from_storage, upload_to_storage

async def process_voice_clone_job(job_id: str, input_url: str, metadata: dict):
    """Background worker: Clone voice from audio"""
    try:
        # Update status to processing
        await update_ai_job_status(job_id, 'processing', progress=10)
        
        # Download audio from Storage
        audio_data = await download_from_storage(input_url)
        await update_ai_job_status(job_id, 'processing', progress=30)
        
        # Clone voice using ElevenLabs API
        voice_settings = Voice(
            stability=metadata.get('stability', 0.5),
            similarity_boost=metadata.get('similarity_boost', 0.75)
        )
        voice = clone(
            name=metadata.get('voice_name', 'Cloned Voice'),
            description=metadata.get('description', ''),
            files=[audio_data],
            settings=voice_settings
        )
        await update_ai_job_status(job_id, 'processing', progress=70)
        
        # Store result metadata
        result_data = {
            "voice_id": voice.voice_id,
            "voice_name": voice.name
        }
        
        # Update job status to completed
        await update_ai_job_status(
            job_id,
            'completed',
            progress=100,
            result_data=result_data
        )
        
        # Optionally update voices table
        await update_voice_record(job_id, voice.voice_id)
        
    except Exception as e:
        await update_ai_job_status(
            job_id,
            'failed',
            error_message=str(e)
        )
```

### 5. FastAPI Endpoints with Timeouts

```python
# app/api/ai.py
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
import asyncio

router = APIRouter()

@router.post("/ai/jobs/voice-clone")
async def create_voice_clone_job(
    input_url: str,
    metadata: dict,
    user_id: str = Depends(get_current_user)
):
    """Create voice clone job (non-blocking)"""
    try:
        # Use context timeout for external API calls
        async with asyncio.timeout(10):  # 10 second timeout
            job_id = await create_ai_job(
                user_id=user_id,
                job_type='voice_clone',
                input_url=input_url,
                metadata=metadata
            )
        
        return JSONResponse({
            "job_id": job_id,
            "status": "pending",
            "message": "Job queued for processing"
        })
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Request timeout")

@router.get("/ai/jobs/{job_id}")
async def get_ai_job_status(
    job_id: str,
    user_id: str = Depends(get_current_user)
):
    """Get AI job status"""
    async with db.acquire() as conn:
        job = await conn.fetchrow("""
            SELECT id, job_type, status, progress_percentage, 
                   result_data, error_message, created_at, updated_at
            FROM ai_jobs
            WHERE id = $1 AND user_id = $2
        """, job_id, user_id)
        
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        return dict(job)
```

### 6. Edge Function Pattern (Alternative to Celery)

```typescript
// supabase/functions/process-ai-job/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { job_id, job_type, input_url, metadata } = await req.json()
  
  // Update job status
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  // Process job (use waitUntil for background work)
  const response = await fetch(req.url, {
    method: 'POST',
    headers: req.headers,
    body: JSON.stringify({ job_id, job_type, input_url, metadata })
  })
  
  // Use EdgeRuntime.waitUntil for background processing
  if (response.ok) {
    ctx.waitUntil(processJobInBackground(job_id, job_type, input_url))
  }
  
  return new Response(JSON.stringify({ status: 'queued' }))
})
```

## Caching Strategy

```python
# app/cache.py
import redis
import json
import hashlib

redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    decode_responses=True
)

def cache_key(job_type: str, input_url: str, model_params: dict) -> str:
    """Generate cache key for AI job results"""
    params_str = json.dumps(model_params, sort_keys=True)
    hash_input = f"{job_type}:{input_url}:{params_str}"
    return f"ai_job:{hashlib.md5(hash_input.encode()).hexdigest()}"

async def get_cached_result(job_type: str, input_url: str, model_params: dict):
    """Check cache for existing AI job result"""
    key = cache_key(job_type, input_url, model_params)
    cached = redis_client.get(key)
    if cached:
        return json.loads(cached)
    return None

async def set_cached_result(job_type: str, input_url: str, model_params: dict, result: dict, ttl: int = 86400):
    """Cache AI job result (24 hour default TTL)"""
    key = cache_key(job_type, input_url, model_params)
    redis_client.setex(key, ttl, json.dumps(result))
```

## CDN Configuration

1. **Enable Public Buckets** for media that should be publicly accessible:
   - Slideshow images/videos
   - Profile photos

2. **Use Signed URLs** for private media:
   - Personal media files
   - Unprocessed uploads

3. **Supabase Storage CDN**: Supabase automatically serves public buckets via CDN

## Environment Variables

```bash
# .env
SUPABASE_URL=https://ftgrrlkjavcumjkyyyva.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

DATABASE_URL=postgresql://postgres:[password]@db.ftgrrlkjavcumjkyyyva.supabase.co:5432/postgres

REDIS_HOST=localhost
REDIS_PORT=6379

ELEVENLABS_API_KEY=your_key
DID_API_KEY=your_key
HEYGEN_API_KEY=your_key

# Timeouts (seconds)
DB_STATEMENT_TIMEOUT=30
AI_API_TIMEOUT=300
```

## Best Practices Summary

✅ **Use asyncpg with connection pooling**  
✅ **Set statement timeouts** (30s default)  
✅ **Use context timeouts for external APIs**  
✅ **Offload heavy AI work to background workers**  
✅ **Direct client uploads via signed URLs**  
✅ **Cache AI results** (Redis or DB key-value)  
✅ **Use CDN for public media**  
✅ **RLS policies protect ai_jobs table**  

The `ai_jobs` table is now integrated with RLS policies, so users can only see/modify their own jobs!

