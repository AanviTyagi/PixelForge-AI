# MeaTech AI — Video Transformation Studio

A production-ready AI Video-to-Video Transformation application built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**. Leverages the **FAL AI Hunyuan-Video model** to apply advanced AI transformations to uploaded videos.

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
| AI Model | FAL AI — Hunyuan-Video |
| Database | MongoDB (via Mongoose) |
| Deployment | Vercel |

---

## 📦 Running Locally

### Prerequisites
- Node.js 18+
- npm or yarn

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
cp .env.example .env.local
```

Then edit `.env.local`:

```env
# ── FAL AI ────────────────────────────────────
FAL_KEY=your_fal_api_key_here

# ── Cloudinary ────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── MongoDB ───────────────────────────────────
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meatech

# ── App URL (for webhook callback) ────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
# In production, this must be your Vercel URL (must be HTTPS)
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
| `FAL_KEY` | FAL AI API key from [fal.ai](https://fal.ai) | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ |
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `NEXT_PUBLIC_APP_URL` | Full app URL for webhook construction | ✅ |

---

## 🔄 Async Webhook Architecture

The transformation pipeline is **fully asynchronous** to avoid HTTP timeouts for long-running AI jobs.

```
User Browser
    │
    ▼
POST /api/upload          ← Upload source video → Cloudinary
    │
    ▼
POST /api/transform       ← Trigger FAL AI with:
    │                          • sourceVideoUrl (Cloudinary)
    │                          • params (prompt, strength, CFG, etc.)
    │                          • webhookUrl = APP_URL/api/webhook
    │
    │  FAL AI processes async (2–5 min)
    │
    ▼
POST /api/webhook          ← FAL AI calls this when done
    │                          • Receives transformed video URL
    │                          • Uploads output to Cloudinary
    │                          • Saves full metadata to MongoDB
    │
    ▼
GET /api/history           ← Frontend polls or user navigates to
                               History page to see result
```

### Key Design Decisions

1. **Non-blocking**: `/api/transform` returns immediately with a `jobId`. The actual processing happens in the background.
2. **Webhook signature validation**: FAL sends a signature header (`x-fal-signature`) — the webhook handler validates this HMAC to reject unauthorized requests.
3. **Idempotency**: The webhook handler checks if a job has already been processed before saving to MongoDB to handle duplicate deliveries.
4. **Cloudinary for output**: The transformed video URL from FAL AI is re-uploaded to Cloudinary for long-term reliable storage.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload` | Upload source video from Uploadcare → Cloudinary |
| `POST` | `/api/transform` | Trigger FAL AI with source URL + params + webhook URL |
| `POST` | `/api/webhook` | Receive FAL AI result, upload output to Cloudinary, save to MongoDB |
| `GET` | `/api/history` | Fetch paginated transformation history from MongoDB |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout (Navbar + Footer)
│   ├── page.tsx            # Home page (upload + configure + generate)
│   ├── globals.css         # Design system tokens + utilities
│   └── history/
│       └── page.tsx        # History page
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── upload/
│   │   └── VideoUploader.tsx
│   ├── transform/
│   │   └── ParametersForm.tsx
│   ├── result/
│   │   ├── LoadingState.tsx
│   │   └── ResultPreview.tsx
│   └── history/
│       ├── HistoryCard.tsx
│       └── HistoryGrid.tsx
├── lib/
│   ├── mock-data.ts        # Demo/mock data
│   └── utils.ts            # Shared utilities
└── types/
    └── index.ts            # TypeScript interfaces
```

---

## 🚢 Deploying to Vercel

1. Push to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Add all environment variables in the Vercel dashboard
4. Set `NEXT_PUBLIC_APP_URL` to your Vercel production URL (e.g. `https://meatech.vercel.app`)
5. Deploy — Vercel auto-detects Next.js

> **Important**: The webhook URL must be publicly accessible. Use [ngrok](https://ngrok.com) for local webhook testing.

---

## 📄 License

MIT — Built for MeaTech Assignment
