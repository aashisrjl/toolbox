# 🧰 Toolbox

> A fast, modern, and privacy-focused media utility platform for image editing, video processing, audio conversion, PDF manipulation, and media downloading.

[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## ✨ Features

### 🖼️ Image Tools
- **Background Remover**: Instant AI-powered subject cutout and transparent PNG export.
- **Image Collage Maker**: Create seamless 2-photo, 3-photo, and 4-photo collages with customizable layouts, spacing, and aspect ratios.
- **Image Compressor**: Compress PNG, JPEG, and WebP images with adjustable quality settings.
- **Format Converter**: Convert between PNG, JPEG, WebP, and AVIF formats without quality loss.
- **Image Resizer**: Resize by percentage or exact dimensions with aspect-ratio locking.
- **Image to PDF**: Combine single or multiple images into a clean PDF document.

### 🎬 Video Tools
- **Video Converter**: Transcode videos between MP4, WebM, AVI, MOV, and MKV.
- **Video Compressor**: Reduce video file sizes with CRF quality presets.
- **Video Trimmer**: Cut and trim video segments using precise start/end timestamps.
- **Audio Extractor**: Extract audio tracks (MP3/AAC) directly from video files.

### 🎵 Audio Tools
- **Audio Converter**: Convert audio files across MP3, WAV, AAC, FLAC, and OGG formats.
- **Audio Compressor**: Compress audio bitrates from 64 kbps to 320 kbps.
- **Audio Trimmer**: Clip audio tracks quickly with millisecond precision.

### 📄 PDF Tools
- **Merge PDF**: Combine multiple PDF documents in any order into a single unified file.
- **Protect PDF**: Secure sensitive PDF files with custom password encryption.
- **PDF to Word**: Convert PDF pages into editable `.docx` Word documents.
- **Word to PDF**: Convert Word `.docx` documents into high-quality PDFs.

### 🌐 Media Downloaders & Utilities
- **YouTube Downloader**: Fetch and download YouTube videos in preferred resolutions and audio formats.
- **Instagram Downloader**: Save reels, posts, and videos directly from Instagram links.
- **TikTok Downloader**: Download TikTok videos cleanly without watermarks.
- **Facebook Reels Downloader**: Download public Facebook video reels easily.
- **QR Code Generator**: Create high-resolution custom QR codes with color customization and instant PNG download.

---

## 🏗️ Architecture & Tech Stack

Toolbox uses a clean separated architecture where frontend and backend communicate via a versioned REST API (`/api/v1/...`).

### Frontend
- **Framework**: React 18, TypeScript, Vite
- **Routing**: TanStack Router (TanStack Start SSR)
- **Styling**: Tailwind CSS, Radix UI / shadcn/ui components
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python 3.10+) with Pydantic v2 validation
- **Processing Engines**:
  - `Pillow` & `rembg` (image processing and AI background removal)
  - `FFmpeg` (video & audio transcoding, compression, trimming)
  - `yt-dlp` (video stream retrieval)
  - `PyMuPDF` (`fitz`) & `python-docx` (PDF manipulation and Word conversion)
  - `qrcode` (high-res QR code generation)
- **Jobs API**: Async job handling with real-time polling (`GET /api/v1/jobs/{id}`)

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended) & `npm`
- [Python](https://www.python.org/) (v3.10+)
- [FFmpeg](https://ffmpeg.org/) installed and available in your system `$PATH`

---

### 1. Frontend Setup

```bash
# Clone the repository
git clone https://github.com/aashisrjl/toolshub-aashis.git
cd toolshub-aashis

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend will be available at `http://localhost:8080`.

---

### 2. Backend Setup

```bash
# In another terminal, navigate to the backend folder
cd backend

# Create and activate a Python virtual environment
python3 -m venv .venv
source .venv/bin/activate    # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend will run at `http://localhost:8000`.
- Interactive Swagger docs: `http://localhost:8000/docs`
- Redoc documentation: `http://localhost:8000/redoc`

---

## 📁 Directory Structure

```text
├── backend/                  # FastAPI backend application
│   ├── app/
│   │   ├── core/             # Configuration & settings
│   │   ├── routers/          # API route handlers (/api/v1/...)
│   │   ├── schemas/          # Pydantic models & validation
│   │   └── services/         # Media processors (FFmpeg, Rembg, PDF, etc.)
│   └── requirements.txt      # Python dependencies
│
├── public/                   # Static assets, sitemap.xml, robots.txt, logo
├── src/                      # React frontend application
│   ├── components/           # UI components & tool forms
│   │   ├── tools/            # Specialized tool interfaces
│   │   └── ui/               # Reusable UI primitives (shadcn/ui)
│   ├── layouts/              # Main layout shells (Navbar, Footer, etc.)
│   ├── lib/                  # Tool registry, SEO helpers & static config
│   ├── routes/               # TanStack file-based routes
│   ├── services/             # HTTP API client & service wrappers
│   └── types/                # Shared TypeScript definitions
│
├── package.json              # Frontend scripts and dependencies
├── vite.config.ts            # Vite build configuration
└── README.md
```

---

## 🌐 SEO & Production

- **Robots & Sitemap**: Pre-configured `public/robots.txt` and auto-generated `public/sitemap.xml` covering all tool pages.
- **Metadata & Open Graph**: Full dynamic meta titles, descriptions, canonical URLs, and OpenGraph/Twitter card tags on all routes.
- **Structured Data**: Schema.org `WebApplication` and `WebSite` JSON-LD schemas embedded for Google search rich snippets.

---

## 👤 Author

Developed by **[Aashish Rijal](https://aashishrijal.com.np)**

---

## 📄 License

This project is licensed under the MIT License.
