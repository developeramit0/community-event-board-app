# Community Events Board

A production-quality Community Events Board built with Next.js 14 (App Router), TypeScript, Prisma ORM, PostgreSQL (Neon), and Tailwind CSS. Clean, responsive, accessible, and structured for real-world explainability.

- **Live Demo**: [Deploy on Vercel](https://community-event-board-app11.vercel.app) *(Replace with your live Vercel URL)*

---

## 1. Setup in < 5 Minutes

```bash
# 1. Clone repository & install dependencies
git clone <repository-url>
cd community-events-board
npm install

# 2. Setup environment variables
cp .env.example .env
# Set your DATABASE_URL, DIRECT_URL, and JWT_SECRET in .env

# 3. Push schema & seed initial events
npx prisma db push
npm run prisma:seed

# 4. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) (automatically redirects to `/events`).

---

## 2. Seeded Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@communityevents.com` | `AdminPassword123!` |
| **Demo User** | `demo@communityevents.com` | `DemoUser123!` |

---

## 3. API Contract Reference

All endpoints return uniform JSON:
- **Success:** `{ data: ... }`
- **Error:** `{ error: { code: string, message: string } }`

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register new user (email, password min 8 chars) | No |
| `POST` | `/api/auth/login` | Authenticate user, returns JWT and sets cookie | No |
| `POST` | `/api/admin/login` | Authenticate admin, returns JWT with role=ADMIN | No |
| `GET` | `/api/events` | List active upcoming events (category, city, q, page, pageSize) | No (adds `isReminded` if logged in) |
| `GET` | `/api/events/cities` | Distinct cities of active upcoming events | No |
| `GET` | `/api/events/:id` | Single event details, reminder status & card design | No (adds user details if logged in) |
| `PUT` | `/api/events/:id/reminder` | Set reminder for event (optimistic UI) | User |
| `DELETE` | `/api/events/:id/reminder` | Remove reminder for event | User |
| `GET` | `/api/events/:id/card` | Fetch saved custom card design | User |
| `PUT` | `/api/events/:id/card` | Save custom card design (`theme`, `stickers` max 3) | User |
| `GET` | `/api/me` | Fetch authenticated user profile & session | Optional |
| `DELETE` | `/api/me` | Logout and clear authentication cookie | User/Admin |
| `GET` | `/api/me/favourites` | Get user's favourite categories | User |
| `PUT` | `/api/me/favourites` | Update user's favourite categories | User |
| `GET` | `/api/me/feed` | Personalized feed of upcoming events in favourite categories | User |
| `GET` | `/api/admin/events` | List all events (active + inactive) | Admin |
| `POST` | `/api/admin/events` | Create new event (title, category, city, date, price, etc.) | Admin |
| `PATCH`| `/api/admin/events/:id/status` | Toggle active/inactive state (`isActive`) | Admin |

---

## 4. What's Left / Known Limitations

1. **Email Dispatcher**: Reminders store interest in the database; an asynchronous background worker (e.g., BullMQ or Cron) is needed to send actual email/SMS alerts before events start.
2. **Ticket Checkout / Payments**: Prices are stored in paise and formatted in INR, but actual payment gateway integration (e.g. Razorpay/Stripe) is out of scope.
3. **Image Uploads**: Images currently use direct URLs (Unsplash/CDN). A direct S3 / Cloudinary multipart file upload widget can be added in future iterations.

---

## 5. AI Tools Note

> *Used AI tools (Cursor / Claude) for initial scaffolding and boilerplate code. All code, database schemas, middleware authentication, and business logic have been reviewed and refined by me, and I can explain every line.*

---

## 6. Architecture & Security Q&A

### a) DB Structure & Schema Design Choices
We used normalized relational tables with composite primary keys (`[userId, category]` for favourites and `[userId, eventId]` for reminders and card designs) to eliminate data duplication and prevent duplicate states without redundant auto-increment surrogate keys. Ticket prices are strictly stored as integers in **paise** (`priceInPaise`) to completely avoid IEEE-754 floating point rounding inaccuracies. All timestamps are stored and queried in **UTC**, while localized to `Asia/Kolkata` for the user interface.

### b) Event Filter Query & Database Indexes
The search and filter query combines all conditions with an `AND` clause: `isActive: true`, `startsAt: { gte: now }`, exact matching on `category` and `city` when provided, and a case-insensitive `OR` on `title` and `description` for keywords `q`. We created two compound indexes in Prisma:
1. `@@index([isActive, startsAt])` to rapidly narrow down upcoming live events during default page loads and ordering.
2. `@@index([category, city, isActive, startsAt])` to support composite multi-facet filtering and pagination without full table scans.

### c) Passwords, Authentication & Admin Route Protection
User and admin passwords are encrypted with `bcryptjs` using a salt work factor of 10. Authentication issues signed JWT tokens containing `userId`, `email`, and `role`, stored in `httpOnly`, `sameSite=lax` cookies for web navigation and returned in JSON for Authorization Bearer headers. Admin access is strictly guarded with **defense-in-depth**: `middleware.ts` running on the edge redirects unauthorized traffic away from `/admin/*` pages, while every `/api/admin/*` route independently executes `requireAdmin()` on the server to verify JWT signature and role before reading or mutating data. UI-level guards are never trusted alone.