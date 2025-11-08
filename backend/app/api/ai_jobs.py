# AI Jobs management
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import json
import os
from app.db import db

router = APIRouter()

class CreateAIJobRequest(BaseModel):
    job_type: str
    input_url: str
    metadata: Optional[Dict[str, Any]] = None

class AIJobResponse(BaseModel):
    job_id: str
    status: str
    progress_percentage: int

@router.post("/create")
async def create_ai_job(
    request: CreateAIJobRequest,
    user_id: str = "test_user"  # TODO: Get from auth token
):
    """Create AI job (non-blocking)"""
    try:
        async with db.acquire() as conn:
            job_id = await conn.fetchval("""
                INSERT INTO ai_jobs (user_id, job_type, input_url, metadata, status)
                VALUES ($1, $2, $3, $4, 'pending')
                RETURNING id
            """, user_id, request.job_type, request.input_url, json.dumps(request.metadata or {}))
            
            # TODO: Enqueue to background worker
            # await enqueue_job(job_id, request.job_type, request.input_url)
            
            return {"job_id": str(job_id), "status": "pending"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{job_id}")
async def get_ai_job_status(job_id: str, user_id: str = "test_user"):
    """Get AI job status"""
    try:
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
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{job_id}/update")
async def update_ai_job_status(
    job_id: str,
    status: Optional[str] = None,
    progress: Optional[int] = None,
    output_url: Optional[str] = None,
    result_data: Optional[Dict[str, Any]] = None,
    error_message: Optional[str] = None
):
    """Update AI job status (called by background worker)"""
    try:
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
            
            return {"status": "updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

