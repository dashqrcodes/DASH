# DASH HEAVEN FastAPI Backend

## Quick Start

### 1. Install Dependencies

```bash
cd backend
python3 -m pip install -r requirements.txt
```

### 2. Setup Environment Variables

Create `.env` file:

```bash
cp .env.example .env
# Edit .env with your credentials
```

Required variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` (PostgreSQL connection string)
- `ELEVENLABS_API_KEY` (for voice cloning)
- `DID_API_KEY` or `HEYGEN_API_KEY` (for avatar creation)

### 3. Run Server

```bash
python3 -m uvicorn main:app --reload --port 8000
```

Server will be available at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **Health**: http://localhost:8000/health

## API Endpoints

### AI Jobs
- `POST /api/ai-jobs/create` - Create AI job
- `GET /api/ai-jobs/{job_id}` - Get job status
- `POST /api/ai-jobs/{job_id}/update` - Update job status

### HEAVEN
- `POST /api/heaven/clone-voice` - Clone voice (creates AI job)
- `POST /api/heaven/create-avatar` - Create avatar (creates AI job)
- `POST /api/heaven/synthesize-speech` - Synthesize speech
- `POST /api/heaven/generate-talking-video` - Generate video (creates AI job)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order

## Architecture

- **asyncpg**: Async PostgreSQL driver with connection pooling
- **FastAPI**: Modern async web framework
- **Supabase**: Database and storage
- **Background Workers**: AI processing (TODO: Celery/RQ integration)

## Next Steps

1. Add authentication middleware
2. Implement background workers for AI jobs
3. Add Redis caching
4. Deploy to production (Railway, Render, Fly.io)

