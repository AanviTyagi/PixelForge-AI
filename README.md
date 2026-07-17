# MeaTech AI — Image Transformation Studio

A production-ready AI Image-to-Image Transformation application built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**. Leverages the **Magic Hour AI flux-schnell model** to apply advanced AI style transformations to uploaded images.

---

## 🚀 Live Demo

> Deploy URL will be added after Vercel deployment.

---

## 🏗️ Tech Stack

| Area | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 + Custom CSS Variables |
| File Upload | Uploadcare |
| Cloud Storage | Cloudinary |
| AI Model | Magic Hour AI — flux-schnell |
| Database | MongoDB (via Native Node Driver) |
| Deployment | Vercel |

---

## 📦 Running Locally

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm

### 1. Clone the repository

```bash
git clone <repo-url>
cd "MeaTech - Assignment"
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
# ── Magic Hour AI ─────────────────────────────
MAGIC_HOUR_API_KEY=your_primary_key_here
MAGIC_HOUR_API_KEY_SECONDARY=your_secondary_key_here
MAGIC_HOUR_API_KEY_TERTIARY=your_tertiary_key_here

# ── Replicate API Key ──────────────────────────
REPLICATE_API_TOKEN=your_replicate_token_here

# ── Cloudinary ────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── MongoDB ───────────────────────────────────
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meatech

# ── Uploadcare ────────────────────────────────
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=your_public_key
UPLOADCARE_SECRET_KEY=your_secret_key

# ── App URL ───────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables Reference

| Variable | Description | Required |
|---|---|---|
| `MAGIC_HOUR_API_KEY` | Primary API key from [magichour.ai](https://magichour.ai) | ✅ |
| `MAGIC_HOUR_API_KEY_SECONDARY` | Secondary API key for load pooling fallback | ❌ |
| `MAGIC_HOUR_API_KEY_TERTIARY` | Tertiary API key for load pooling fallback | ❌ |
| `REPLICATE_API_TOKEN` | Replicate token for fallback integrations | ❌ |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ |
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY` | Client-side public key for Uploadcare | ✅ |
| `UPLOADCARE_SECRET_KEY` | Server-side secret key for Uploadcare | ✅ |
| `NEXT_PUBLIC_APP_URL` | Full app URL for webhook / API callbacks | ✅ |

---

## 🔄 Async Webhook Architecture

The transformation pipeline is **fully asynchronous** to avoid HTTP timeouts for long-running AI generation tasks.

```
User Browser
    │
    ▼
POST /api/upload          ← Upload source image → Cloudinary
    │
    ▼
POST /api/transform       ← Trigger Magic Hour AI with:
    │                          • sourceImageUrl (Cloudinary)
    │                          • params (prompt, strength, CFG, etc.)
    │
    │  Magic Hour processes async
    │
    ▼
GET /api/history?id=      ← Frontend polls to check completion
    │                          • Checks Magic Hour status API
    │                          • Uploads generated output to Cloudinary
    │                          • Saves finalized metadata to MongoDB
    │
    ▼
GET /api/history           ← User views History page to see full results
```

### Key Design Decisions

1. **Non-blocking**: `/api/transform` returns immediately with a database `jobId`. The actual generation happens asynchronously on Magic Hour servers.
2. **Short Polling**: The client queries `/api/history?id=<jobId>`. When the server detects that Magic Hour status is `complete`, it transfers the output to Cloudinary and registers the job as completed in MongoDB.
3. **Cloudinary Redundancy**: The generated output from Magic Hour is transferred to Cloudinary for permanent, reliable asset hosting.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload` | Upload source image from Uploadcare → Cloudinary |
| `POST` | `/api/transform` | Trigger Magic Hour image generation with parameters |
| `GET` | `/api/history?id=<id>`| Poll current state of a specific transformation job |
| `GET` | `/api/history` | Fetch paginated transformation history |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout (TopBar + Font configuration)
│   ├── page.tsx            # Home page (upload + configure + loading + result)
│   ├── globals.css         # Design system tokens + global CSS variables
│   ├── history/
│   │   └── page.tsx        # History page
│   └── api/
│       ├── history/        # History fetch & Magic Hour polling route
│       ├── transform/      # Trigger Magic Hour generation route
│       └── upload/         # Client CDN to Cloudinary upload route
├── components/
│   ├── ui/
│   │   └── TopBar.tsx      # Sticky TopBar navigation
│   ├── upload/
│   │   └── ImageUploader.tsx
│   ├── transform/
│   │   └── ParametersForm.tsx
│   ├── result/
│   │   ├── LoadingState.tsx
│   │   └── ResultPreview.tsx
│   └── history/
│       ├── HistoryCard.tsx
│       └── HistoryGrid.tsx
├── hooks/
│   └── useImageTransform.ts # Custom React hook containing main application logic
├── lib/
│   ├── mock-data.ts        # Initial/default configuration parameters
│   └── utils.ts            # Client helpers & image download scripts
└── types/
    └── index.ts            # TypeScript interfaces
```

---

## 🚢 Deploying to Vercel

1. Push your code to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Populate all environment variables from the Vercel dashboard.
4. Set `NEXT_PUBLIC_APP_URL` to your Vercel production URL (e.g. `https://meatech.vercel.app`).
5. Deploy — Vercel automatically detects Next.js configurations.

---



Built for MeaTech Assignment

