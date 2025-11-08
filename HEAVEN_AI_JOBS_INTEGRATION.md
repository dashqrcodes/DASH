# HEAVEN + AI_JOBS Integration Guide

## Current Problem

HEAVEN currently does AI operations **synchronously**:
- `extractAudioFromVideo()` - blocks until complete
- `cloneVoiceFromAudio()` - blocks for **minutes** (ElevenLabs)
- `createAvatar()` - blocks for **minutes** (D-ID/HeyGen)
- `generateTalkingVideo()` - blocks for **minutes** per message

**Issues:**
- User waits with loading spinner
- Browser timeout risk
- No progress tracking
- No retry mechanism
- Can't resume if page refreshes

## Solution: Use `ai_jobs` Table

Refactor HEAVEN to use async `ai_jobs` pattern:

### 1. Updated HEAVEN Flow

```typescript
// src/pages/heaven.tsx - REFACTORED

const handleStartCall = async () => {
  const personData = loadPersonData();
  if (!personData) {
    alert('Please create a slideshow with photos/videos first.');
    return;
  }

  setPerson(personData);
  setIsInCall(true);

  // STEP 1: Create AI jobs (non-blocking)
  setInitStep('loading-media');
  setStatusMessage('Preparing HEAVEN connection…');

  try {
    // Create 3 AI jobs in parallel
    const [audioJobId, voiceJobId, avatarJobId] = await Promise.all([
      createAIJob('audio_extract', personData.slideshowVideoUrl, {
        person_name: personData.name
      }),
      createAIJob('voice_clone', personData.slideshowVideoUrl, {
        person_name: personData.name,
        voice_name: `${personData.name}'s Voice`
      }),
      createAIJob('avatar_create', personData.primaryPhotoUrl, {
        person_name: personData.name
      })
    ]);

    // Poll for job completion
    await pollJobsUntilReady([audioJobId, voiceJobId, avatarJobId]);

    // Get results
    const results = await Promise.all([
      getAIJobResult(audioJobId),
      getAIJobResult(voiceJobId),
      getAIJobResult(avatarJobId)
    ]);

    setVoiceId(results[1].result_data.voice_id);
    setAvatarId(results[2].result_data.avatar_id);
    
    setInitStep('ready');
    setStatusMessage(`Connected to HEAVEN – ${personData.name}`);
  } catch (error) {
    console.error('HEAVEN initialization failed:', error);
    setStatusMessage('Failed to connect. Please try again.');
  }
};
```

### 2. AI Jobs API Functions

```typescript
// src/utils/ai-jobs.ts

interface AIJob {
  id: string;
  job_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress_percentage: number;
  result_data?: any;
  error_message?: string;
}

/**
 * Create AI job (non-blocking)
 */
export async function createAIJob(
  jobType: 'voice_clone' | 'avatar_create' | 'audio_extract' | 'video_generate',
  inputUrl: string,
  metadata: Record<string, any> = {}
): Promise<string> {
  const response = await fetch('/api/ai-jobs/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      job_type: jobType,
      input_url: inputUrl,
      metadata
    })
  });

  if (!response.ok) {
    throw new Error('Failed to create AI job');
  }

  const data = await response.json();
  return data.job_id;
}

/**
 * Get AI job status
 */
export async function getAIJobStatus(jobId: string): Promise<AIJob> {
  const response = await fetch(`/api/ai-jobs/${jobId}`);
  
  if (!response.ok) {
    throw new Error('Failed to get job status');
  }

  return response.json();
}

/**
 * Get AI job result (when completed)
 */
export async function getAIJobResult(jobId: string): Promise<AIJob> {
  const job = await getAIJobStatus(jobId);
  
  if (job.status === 'failed') {
    throw new Error(job.error_message || 'AI job failed');
  }
  
  if (job.status !== 'completed') {
    throw new Error('Job not completed yet');
  }
  
  return job;
}

/**
 * Poll jobs until all are ready
 */
export async function pollJobsUntilReady(
  jobIds: string[],
  onProgress?: (progress: Record<string, number>) => void
): Promise<void> {
  const checkInterval = 2000; // Check every 2 seconds
  const maxWaitTime = 600000; // 10 minutes max
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    const jobs = await Promise.all(jobIds.map(id => getAIJobStatus(id)));
    
    const progress: Record<string, number> = {};
    let allCompleted = true;
    let anyFailed = false;

    for (const job of jobs) {
      progress[job.id] = job.progress_percentage;
      
      if (job.status === 'failed') {
        anyFailed = true;
      }
      
      if (job.status !== 'completed') {
        allCompleted = false;
      }
    }

    // Report progress
    if (onProgress) {
      onProgress(progress);
    }

    if (anyFailed) {
      const failedJob = jobs.find(j => j.status === 'failed');
      throw new Error(failedJob?.error_message || 'AI job failed');
    }

    if (allCompleted) {
      return; // All done!
    }

    // Wait before next check
    await new Promise(resolve => setTimeout(resolve, checkInterval));
  }

  throw new Error('AI jobs timed out');
}
```

### 3. API Route: Create AI Job

```typescript
// src/pages/api/ai-jobs/create.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for inserts
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { job_type, input_url, metadata } = req.body;
  const user_id = req.headers['x-user-id'] as string; // Get from auth token

  // Create AI job record
  const { data, error } = await supabase
    .from('ai_jobs')
    .insert({
      user_id,
      job_type,
      input_url,
      metadata,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Enqueue to background worker (FastAPI/Edge Function)
  // This is non-blocking - returns immediately
  await fetch(`${process.env.BACKEND_URL}/ai-jobs/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.BACKEND_API_KEY}`
    },
    body: JSON.stringify({
      job_id: data.id,
      job_type,
      input_url,
      metadata
    })
  });

  return res.status(200).json({ job_id: data.id });
}
```

### 4. API Route: Get Job Status

```typescript
// src/pages/api/ai-jobs/[jobId].ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { jobId } = req.query;
  const user_id = req.headers['x-user-id'] as string;

  const { data, error } = await supabase
    .from('ai_jobs')
    .select('*')
    .eq('id', jobId)
    .eq('user_id', user_id) // RLS ensures user can only see own jobs
    .single();

  if (error) {
    return res.status(404).json({ error: 'Job not found' });
  }

  return res.status(200).json(data);
}
```

### 5. Background Worker (FastAPI)

```python
# app/api/ai_jobs.py (FastAPI)

from fastapi import APIRouter, BackgroundTasks
from app.ai_jobs import create_ai_job, update_ai_job_status
from app.workers import voice_clone, avatar_create, audio_extract

router = APIRouter()

@router.post("/ai-jobs/process")
async def process_ai_job(
    job_id: str,
    job_type: str,
    input_url: str,
    metadata: dict,
    background_tasks: BackgroundTasks
):
    """Enqueue AI job for background processing"""
    
    # Update status to processing
    await update_ai_job_status(job_id, 'processing', progress=0)
    
    # Enqueue background task
    if job_type == 'voice_clone':
        background_tasks.add_task(
            voice_clone.process_voice_clone_job,
            job_id, input_url, metadata
        )
    elif job_type == 'avatar_create':
        background_tasks.add_task(
            avatar_create.process_avatar_create_job,
            job_id, input_url, metadata
        )
    elif job_type == 'audio_extract':
        background_tasks.add_task(
            audio_extract.process_audio_extract_job,
            job_id, input_url, metadata
        )
    
    return {"status": "queued", "job_id": job_id}
```

### 6. Updated HEAVEN UI with Progress

```typescript
// src/pages/heaven.tsx - Progress tracking

const [jobProgress, setJobProgress] = useState<Record<string, number>>({});

const handleStartCall = async () => {
  // ... create jobs ...
  
  // Poll with progress updates
  await pollJobsUntilReady([audioJobId, voiceJobId, avatarJobId], (progress) => {
    setJobProgress(progress);
    
    // Update status message based on progress
    const totalProgress = Object.values(progress).reduce((a, b) => a + b, 0) / Object.keys(progress).length;
    setStatusMessage(`Preparing HEAVEN... ${Math.round(totalProgress)}%`);
  });
};
```

## Benefits

✅ **Non-blocking**: User can navigate away and come back  
✅ **Progress tracking**: Real-time progress updates  
✅ **Resumable**: Can check job status after page refresh  
✅ **Retry-able**: Failed jobs can be retried  
✅ **Scalable**: Background workers handle heavy processing  
✅ **Better UX**: No browser timeouts, clear progress  

## Migration Path

1. **Phase 1**: Keep current sync code, add `ai_jobs` tracking
2. **Phase 2**: Move heavy operations to background workers
3. **Phase 3**: Update UI to poll `ai_jobs` instead of waiting

The `ai_jobs` table is **perfect** for HEAVEN! 🎯

