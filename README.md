# Media Magic Hub

2. Architecture I recommend

I would use:

                    TOOLSHUB
                       │
          ┌────────────┴────────────┐
          │                         │
     React Frontend            FastAPI Backend
          │                         │
          │                    ┌────┴────┐
          │                    │ Routers │
          │                    └────┬────┘
          │                         │
          │       ┌─────────────────┼──────────────────┐
          │       │                 │                  │
          │    Download          Image              Video
          │       │                 │                  │
          │    YouTube           Remove BG          Remove BG
          │    Instagram         Compress           Convert
          │    TikTok            Convert             Trim
          │
          └────────────── HTTP API ────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                  Redis                  PostgreSQL
                    │
               Background Jobs
                    │
              ┌─────┼─────┐
              │     │     │
            Worker Worker Worker

Important

Don't make:

main.py
 ├── YouTube
 ├── Instagram
 ├── TikTok
 ├── Image
 ├── Video
 ├── PDF
 ├── Audio
 └── everything else

Instead:

routers/
services/
workers/
models/
schemas/

That separation will make ToolsHub much easier to expand.

3. Project structure

I'd start with this:

toolshub/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── lib/
│   │   ├── types/
│   │   └── App.tsx
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   │
│   │   ├── routers/
│   │   │   ├── health.py
│   │   │   ├── youtube.py
│   │   │   ├── instagram.py
│   │   │   ├── tiktok.py
│   │   │   ├── image.py
│   │   │   ├── video.py
│   │   │   ├── audio.py
│   │   │   └── jobs.py
│   │   │
│   │   ├── services/
│   │   │   ├── youtube_service.py
│   │   │   ├── instagram_service.py
│   │   │   ├── tiktok_service.py
│   │   │   ├── image_service.py
│   │   │   ├── video_service.py
│   │   │   └── audio_service.py
│   │   │
│   │   ├── workers/
│   │   │   ├── celery_app.py
│   │   │   └── tasks/
│   │   │       ├── download_tasks.py
│   │   │       ├── image_tasks.py
│   │   │       └── video_tasks.py
│   │   │
│   │   ├── models/
│   │   │   ├── job.py
│   │   │   └── user.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── download.py
│   │   │   ├── image.py
│   │   │   ├── video.py
│   │   │   └── job.py
│   │   │
│   │   └── utils/
│   │       ├── files.py
│   │       ├── ffmpeg.py
│   │       └── cleanup.py
│   │
│   ├── requirements.txt
│   └── .env
│
├── storage/
│   ├── uploads/
│   ├── outputs/
│   └── temp/
│
├── docker-compose.yml
├── .gitignore
└── README.md

This is essentially the FastAPI "bigger applications" pattern, but adapted for a media-processing platform. FastAPI's APIRouter is specifically designed for splitting path operations into separate modules.

4. Your API structure

I would organize your API like this:

/api/v1

YouTube

POST /api/v1/youtube/info
POST /api/v1/youtube/download

Instagram

POST /api/v1/instagram/info
POST /api/v1/instagram/download

TikTok

POST /api/v1/tiktok/info
POST /api/v1/tiktok/download

Image

POST /api/v1/image/remove-background
POST /api/v1/image/compress
POST /api/v1/image/convert
POST /api/v1/image/resize
POST /api/v1/image/crop

Video

POST /api/v1/video/remove-background
POST /api/v1/video/convert
POST /api/v1/video/compress
POST /api/v1/video/trim
POST /api/v1/video/extract-audio

Audio

POST /api/v1/audio/convert
POST /api/v1/audio/compress
POST /api/v1/audio/trim

Jobs

GET /api/v1/jobs/{job_id}
DELETE /api/v1/jobs/{job_id}

This gives you a clean API.

5. FastAPI main.py

Keep main.py extremely small.

Something like:

from fastapi import FastAPI

from app.routers import (
    health,
    youtube,
    instagram,
    tiktok,
    image,
    video,
    audio,
    jobs,
)

app = FastAPI(
    title="ToolsHub API",
    version="1.0.0",
)

app.include_router(
    health.router,
    prefix="/api/v1",
    tags=["Health"],
)

app.include_router(
    youtube.router,
    prefix="/api/v1/youtube",
    tags=["YouTube"],
)

app.include_router(
    instagram.router,
    prefix="/api/v1/instagram",
    tags=["Instagram"],
)

app.include_router(
    tiktok.router,
    prefix="/api/v1/tiktok",
    tags=["TikTok"],
)

app.include_router(
    image.router,
    prefix="/api/v1/image",
    tags=["Image"],
)

app.include_router(
    video.router,
    prefix="/api/v1/video",
    tags=["Video"],
)

app.include_router(
    audio.router,
    prefix="/api/v1/audio",
    tags=["Audio"],
)

app.include_router(
    jobs.router,
    prefix="/api/v1/jobs",
    tags=["Jobs"],
)

Then you automatically get:

http://localhost:8000/docs

with your APIs grouped by tool. FastAPI generates the OpenAPI documentation from these routers automatically.

6. React frontend

I recommend React + Vite + TypeScript rather than Next.js for this particular project.

Your frontend can be:

frontend/
│
├── src/
│   ├── components/
│   │
│   │   ├── ToolCard.tsx
│   │   ├── ToolInput.tsx
│   │   ├── FileUploader.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── DownloadButton.tsx
│   │   └── Navbar.tsx
│   │
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Youtube.tsx
│   │   ├── Instagram.tsx
│   │   ├── TikTok.tsx
│   │   ├── RemoveImageBg.tsx
│   │   └── RemoveVideoBg.tsx
│   │
│   ├── services/
│   │   └── api.ts
│   │
│   └── App.tsx

7. Don't make every tool completely independent

This is important.

For example:

Image tools
       │
       ├── Upload
       ├── Validate
       ├── Process
       ├── Save
       ├── Return result
       └── Cleanup

Don't duplicate that logic five times.

Instead:

                    Base Processing
                          │
             ┌────────────┼────────────┐
             │            │            │
          Remove BG    Compress      Convert

Likewise:

                    Media Service
                         │
              ┌──────────┼──────────┐
              │          │          │
            Audio      Video      Image

8. Redis + Celery

This becomes very important once you process video.

Don't do this:

React
  ↓
FastAPI
  ↓
remove_background(video)
  ↓
wait 5 minutes
  ↓
response

Instead:

React
  ↓
FastAPI
  ↓
Create Job
  ↓
Redis
  ↓
Celery Worker
  ↓
Process video
  ↓
Update Job
  ↓
React checks job status

Example:

POST /api/v1/video/remove-background

returns immediately:

{
  "job_id": "8f92c...",
  "status": "queued"
}

Then React:

GET /api/v1/jobs/8f92c...

gets:

{
  "job_id": "8f92c...",
  "status": "processing",
  "progress": 64
}

Finally:

{
  "job_id": "8f92c...",
  "status": "completed",
  "download_url": "/downloads/abc.mp4"
}

That's the architecture I'd use for ToolsHub.

9. The AI should NOT build everything at once

This is where you can get much better results from Cursor.

Step 1

Ask Cursor:

Create the ToolsHub monorepo with React TypeScript frontend and FastAPI Python backend. Do not implement any tools yet.

Step 2

Then:

Implement the FastAPI architecture using APIRouter, API versioning, configuration management, error handling, CORS, and health check. Keep routers, services, schemas, models, and workers separated.

Step 3

Then:

Implement the React frontend with a ToolsHub homepage, tool cards, routing, API client, responsive layout, and reusable upload/input components.

Step 4

Then build one tool:

Implement the image background removal tool end-to-end. Create the FastAPI route, service layer, validation, temporary file handling, processing worker, job status API, React page, upload UI, progress state, and download result.

Then test it.

Step 5

Only after that:

Image compressor
       ↓
Image converter
       ↓
Video converter
       ↓
Audio converter
       ↓
URL-based media tools
       ↓
Video background removal

This gives the AI a stable architecture to work inside.

10. Create an AI instruction file

This is something I strongly recommend.

Create:

AGENTS.md

at the root:

# ToolsHub Development Guidelines

## Project

ToolsHub is a media utility platform.

Frontend:
- React
- TypeScript
- Vite
- Tailwind CSS

Backend:
- Python
- FastAPI
- Pydantic
- SQLAlchemy

Infrastructure:
- PostgreSQL
- Redis
- Celery
- Docker

## Architecture

Frontend and backend are separate applications.

FastAPI must use APIRouter.

Never put business logic directly inside routers.

Routers handle:
- Request validation
- Authentication
- Calling services
- Returning responses

Services handle:
- Business logic
- Media processing
- External integrations

Workers handle:
- Long-running jobs
- Video processing
- Large media operations

## Rules

1. Use TypeScript on frontend.
2. Use type hints on Python code.
3. Never hardcode secrets.
4. Use environment variables.
5. Never store large media permanently unless required.
6. Temporary files must be cleaned up.
7. Long-running operations must use background jobs.
8. Keep routes thin.
9. Keep services modular.
10. Every new tool should have its own router/service/schema where appropriate.
11. Do not modify unrelated files.
12. Run tests after implementing features.
13. Update documentation when API behavior changes.

## API

All APIs must use:

/api/v1/...

## Media processing

Use FFmpeg for audio/video processing.

AI processing should be isolated inside service modules.

## Security

Validate:
- File type
- File size
- URL format
- Filename
- Processing time

Never execute arbitrary user-provided commands.

This gives your coding agent persistent project rules.

Cursor supports project-aware agent workflows and custom agent configuration, so having explicit repository instructions is particularly useful for a project like this.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://toolshub-aashis.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6cad636e-99b7-435d-9be8-ec9a0f74a7c3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
