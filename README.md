# 🧱 BrickYard Pro — Full Stack Construction Materials Platform

## Project Structure
```
brickyard/
├── frontend/          # Next.js 14 App Router (React)
├── backend/           # Node.js + Express REST API
└── README.md
```

---

## ✅ STEP-BY-STEP SETUP GUIDE

### Prerequisites
- Node.js 18+ (https://nodejs.org)
- PostgreSQL 15+ (https://postgresql.org)
- Redis (https://redis.io) — optional for caching
- Git

---

### STEP 1 — Clone or Extract
Extract this zip folder to your desired directory. Open in VS Code:
```bash
code brickyard
```

---

### STEP 2 — Setup Backend

```bash
cd backend
npm install
```

Create your `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

Edit `.env` and fill in:
- DATABASE_URL (PostgreSQL connection string)
- JWT_SECRET (any random 32-char string)
- GOOGLE_MAPS_API_KEY or MAPBOX_TOKEN
- RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET (for payments)

Setup the database:
```bash
npm run db:migrate
npm run db:seed       # loads sample products, zones, pricing
```

Start backend dev server:
```bash
npm run dev           # runs on http://localhost:5000
```

---

### STEP 3 — Setup Frontend

```bash
cd ../frontend
npm install
```

Create `.env.local`:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in:
- NEXT_PUBLIC_API_URL=http://localhost:5000
- NEXT_PUBLIC_GOOGLE_MAPS_KEY (same as backend)
- NEXT_PUBLIC_RAZORPAY_KEY_ID

Start frontend dev server:
```bash
npm run dev           # runs on http://localhost:3000
```

---

### STEP 4 — Open the App

- **Customer Portal:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin
  - Default admin login: `admin@brickyard.com` / `Admin@123`

---

### STEP 5 — Production Deployment

**Backend (DigitalOcean / Railway / Render):**
```bash
cd backend
npm run build
npm start
```

**Frontend (Vercel — recommended):**
```bash
cd frontend
npx vercel --prod
```

**Database:** Use DigitalOcean Managed PostgreSQL for zero-maintenance production DB.

---

## 🗄️ Database Setup (PostgreSQL)

Install PostgreSQL locally or use Docker:
```bash
# Docker (easiest)
docker run --name brickyard-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=brickyard -p 5432:5432 -d postgres:15
```

Your DATABASE_URL will be:
```
postgresql://postgres:password@localhost:5432/brickyard
```

---

## 🔑 Key Features Implemented

### Customer Portal
- [x] Homepage with hero, product showcase, price estimator widget
- [x] Product catalog with categories and filters
- [x] Smart quote builder wizard (product → location → delivery → labour)
- [x] Real-time price calculator (material + transport + labour + food)
- [x] Cart and checkout flow
- [x] Order tracking page
- [x] User auth (register/login)

### Admin Panel
- [x] Dashboard with KPI cards and recent orders
- [x] Product management (CRUD with images)
- [x] Dynamic pricing engine (base, tiered, discounts)
- [x] Delivery zone configurator (fixed zones + per-km fallback)
- [x] Vehicle management
- [x] Labour rates & food charge settings
- [x] Order management (Kanban + table view)
- [x] Customer CRM
- [x] Reports & analytics

### Backend API
- [x] Full REST API with JWT auth
- [x] Pricing calculation engine
- [x] Google Maps Distance Matrix integration
- [x] Zone lookup (PostGIS-ready)
- [x] Order lifecycle management

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | PostgreSQL 15 |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| Maps | Google Maps API |
| Payments | Razorpay |
| Cache | Redis |
| Storage | Cloudflare R2 / AWS S3 |
| Deployment | Vercel (FE) + Railway/DigitalOcean (BE) |

---

## 📁 Important Files to Know

```
backend/src/
  routes/         ← All API endpoints
  controllers/    ← Business logic
  services/
    pricing.js    ← The core pricing calculation engine
    maps.js       ← Google Maps distance calculation
  models/         ← Database schema (Prisma)
  middleware/
    auth.js       ← JWT verification

frontend/src/
  app/(customer)/   ← All customer-facing pages
  app/(admin)/      ← All admin pages
  components/
    customer/       ← Customer UI components
    admin/          ← Admin UI components
  lib/
    api.js          ← API client functions
    pricing.js      ← Client-side price preview calculations
```
