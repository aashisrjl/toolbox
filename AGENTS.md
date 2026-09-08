<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

# Toolbox Development Guidelines

## Project

Toolbox is a media utility platform.

Frontend (this repo): React, TypeScript, Vite, Tailwind CSS, TanStack Router.
Backend (separate app): Python, FastAPI, Pydantic, SQLAlchemy, PostgreSQL, Redis, Celery, Docker.

## Architecture

Frontend and backend are separate applications and talk over HTTP only.
All API calls go through `src/services/api.ts`; components never call `fetch` directly.
All backend paths are versioned: `/api/v1/...`.
Long-running operations return a job id; the UI polls `GET /api/v1/jobs/{id}`.

Layers in the frontend:

- `components/` reusable UI (upload, progress, download, cards)
- `layouts/` page shells
- `pages`/`routes/` one file per tool page
- `services/` API client + endpoint wrappers
- `hooks/` stateful logic (job polling, uploads)
- `types/` shared TypeScript types
- `lib/` pure helpers and static data

## Rules

1. TypeScript everywhere; no `any` in public APIs.
2. Never hardcode secrets; use environment variables (`VITE_API_BASE_URL`).
3. Keep pages thin — logic lives in hooks and services.
4. Every new tool gets an entry in the tool registry plus its own page and API wrapper.
5. Validate file type and size before upload.
6. Never store user media longer than needed.
7. Do not modify unrelated files.
8. Update this document when API behaviour changes.
