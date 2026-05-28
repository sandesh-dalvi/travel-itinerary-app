# TripCrafter — AI-Powered Travel Itinerary Generator

> Upload your flight tickets, hotel bookings, and travel documents. Let AI craft a structured day-by-day itinerary automatically.

**Live App:** https://YOUR-APP.netlify.app  
**Backend API:** https://YOUR-API.onrender.com

---

## Features

- **JWT Authentication** — Secure register/login with access + refresh token rotation via httpOnly cookies
- **Document Uploads** — Drag-and-drop PDFs and images (JPEG, PNG, WebP) up to 10MB, stored on Cloudinary
- **AI Data Extraction** — Groq (LLaMA 3.3 70B) extracts structured booking data from uploaded documents
- **AI Itinerary Generation** — Generates a complete day-by-day travel itinerary from your booking data
- **Itinerary History** — All generated itineraries saved and accessible from the dashboard
- **Public Share Links** — Share itineraries via a public URL with configurable expiry (7 days / 30 days / never)
- **Print to PDF** — Clean print layout via browser's native print dialog
- **Fully Responsive** — Works across mobile, tablet, and desktop

---

## Tech Stack

### Frontend

| Tech            | Version | Purpose                |
| --------------- | ------- | ---------------------- |
| React           | 19      | UI framework           |
| TypeScript      | 5.x     | Type safety            |
| Vite            | 6       | Build tool             |
| Tailwind CSS    | v4      | Styling                |
| shadcn/ui       | latest  | Component library      |
| React Router    | v7      | Client-side routing    |
| TanStack Query  | v5      | Server state + caching |
| Zustand         | v5      | Auth state management  |
| React Hook Form | v7      | Form handling          |
| Zod             | v3      | Schema validation      |
| react-dropzone  | latest  | Drag-and-drop uploads  |
| Axios           | latest  | HTTP client            |
| Sonner          | latest  | Toast notifications    |

### Backend

| Tech                               | Version | Purpose              |
| ---------------------------------- | ------- | -------------------- |
| Node.js                            | 22 LTS  | Runtime              |
| Express                            | v5      | Web framework        |
| TypeScript                         | 5.x     | Type safety          |
| MongoDB + Mongoose                 | v8      | Database + ODM       |
| Zod                                | v3      | Request validation   |
| jsonwebtoken                       | v9      | JWT auth             |
| bcryptjs                           | latest  | Password hashing     |
| Multer                             | latest  | File upload handling |
| Cloudinary                         | v2      | File storage         |
| pdf-parse                          | latest  | PDF text extraction  |
| helmet + cors + express-rate-limit | latest  | Security middleware  |

### AI & Infrastructure

| Service              | Purpose                                        |
| -------------------- | ---------------------------------------------- |
| Groq — LLaMA 3.3 70B | Booking data extraction + itinerary generation |
| Groq — LLaMA 4 Scout | Vision (image document extraction)             |
| MongoDB Atlas        | Database (M0 free tier)                        |
| Cloudinary           | Document storage (free tier)                   |
| Render               | Backend deployment (free tier)                 |
| Netlify              | Frontend deployment (free tier)                |

---

## Project Structure

```
travel-itinerary-app/
├── client/                        # React frontend
│   └── src/
│       ├── api/                   # Typed API call functions
│       ├── components/
│       │   ├── auth/              # Login + Register forms
│       │   ├── itinerary/         # Timeline, activity, share modal
│       │   ├── layout/            # Navbar, AppLayout, ProtectedRoute
│       │   └── upload/            # DropZone, FileCard
│       ├── hooks/                 # useShare, useItineraryStatus
│       ├── lib/                   # Axios instance, QueryClient
│       ├── pages/                 # Dashboard, Upload, Generate, Detail, PublicShare
│       ├── schemas/               # Zod form schemas
│       ├── store/                 # Zustand auth store
│       ├── types/                 # Shared TypeScript interfaces
│       └── utils/                 # formatDate, activityIcons, cn
│
└── server/                        # Express backend
    └── src/
        ├── config/                # DB, Cloudinary, Groq, env validation
        ├── controllers/           # Thin request/response handlers
        ├── middleware/            # Auth, validate, upload, error
        ├── models/                # User, Document, Itinerary (Mongoose)
        ├── routes/                # auth, documents, itineraries, share
        ├── schemas/               # Zod request validation schemas
        ├── services/              # Business logic — auth, AI, document, share
        ├── types/                 # Shared interfaces + express.d.ts
        └── utils/                 # AppError, jwt, response, prompts
```

---

## Local Setup

### Prerequisites

- Node.js v22+
- MongoDB Atlas account (free M0 cluster)
- Cloudinary account (free tier)
- Groq API key — [console.groq.com](https://console.groq.com)

### Backend

```bash
cd server
npm install
cp .env.example .env   # fill in all values
npm run dev            # starts on http://localhost:5000
```

### Frontend

```bash
cd client
npm install
cp .env.example .env   # set VITE_API_URL=http://localhost:5000/api
npm run dev            # starts on http://localhost:5173
```

### Environment Variables

**`server/.env`**

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/travel-itinerary
JWT_ACCESS_SECRET=<min_32_chars>
JWT_REFRESH_SECRET=<min_32_chars>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GROQ_API_KEY=
CLIENT_URL=http://localhost:5173
```

**`client/.env`**

```env
VITE_API_URL=http://localhost:5000/api
```

---

## API Reference

| Method | Endpoint                     | Auth | Description                       |
| ------ | ---------------------------- | ---- | --------------------------------- |
| POST   | `/api/auth/register`         | ✗    | Create account                    |
| POST   | `/api/auth/login`            | ✗    | Login                             |
| POST   | `/api/auth/refresh`          | ✗    | Rotate access token               |
| POST   | `/api/auth/logout`           | ✓    | Logout                            |
| GET    | `/api/auth/me`               | ✓    | Get current user                  |
| POST   | `/api/documents`             | ✓    | Upload a document                 |
| GET    | `/api/documents`             | ✓    | List user's documents             |
| DELETE | `/api/documents/:id`         | ✓    | Delete a document                 |
| POST   | `/api/itineraries/generate`  | ✓    | Generate itinerary from documents |
| GET    | `/api/itineraries`           | ✓    | List user's itineraries           |
| GET    | `/api/itineraries/:id`       | ✓    | Get single itinerary              |
| DELETE | `/api/itineraries/:id`       | ✓    | Delete itinerary                  |
| POST   | `/api/itineraries/:id/share` | ✓    | Toggle public sharing             |
| GET    | `/api/share/:token`          | ✗    | Fetch public itinerary            |

---

## How the AI Pipeline Works

```
Upload PDF/image
      ↓
Extract text (pdf-parse for PDFs, Groq Vision for images)
      ↓
Groq LLaMA 3.3 70B extracts structured booking data → JSON
      ↓
User clicks "Generate Itinerary"
      ↓
All booking JSONs sent to Groq in a single prompt
      ↓
Groq returns complete day-by-day itinerary → saved to MongoDB
      ↓
Rendered in the UI — shareable via public link
```

---

## Notes

- The backend is hosted on Render's free tier which **spins down after 15 minutes of inactivity**. The first request after a sleep period may take ~30 seconds to respond. This is a hosting limitation, not an application issue.
- File uploads are limited to 10MB per file, max 5 files per upload batch.
- Supported file types: PDF, JPEG, PNG, WebP.
