# 🎉 AutoWISH - Automated Celebration & Greeting Dispatcher

> **Never forget a loved one's special day again.**
> Pre-schedule personalized greetings for birthdays, anniversaries, and holidays. Delivered right on time via WhatsApp, SMS, Email, and Telegram &mdash; 100% automatically.

---

## ✨ Features Built Exactly for Your Requirements

- 📱 **Multi-Channel Delivery Support:**
  - **WhatsApp**: Direct message to their mobile number.
  - **Direct Phone SMS**: Ordinary SMS network delivery via phone gateway.
  - **Email**: Beautiful HTML celebration card via Resend API.
  - **Telegram**: Instant notification via Telegram Bot API.

- 🧹 **Smart 24-Hour Auto-Cleanup (Storage Optimization):**
  - **One-time wishes** are marked as `SENT`, kept for 24 hours so you can confirm delivery, and then **automatically deleted from the database** by the scheduler.
  - Keeps the database lightweight, fast, and 100% within free-tier limits forever!

- 🔁 **Editable Repeated Wishes (Yearly/Monthly):**
  - Repeated wishes (e.g. Birthday every year) automatically advance to the next year upon delivery.
  - **Crucial**: You can freely **edit or rewrite the greeting message, date, or channel at ANY time** before the next scheduled dispatch!

- 🔐 **Multi-Channel Password Recovery & Verification:**
  - Forgot password flow supports sending a 6-digit OTP code to **Email**, **WhatsApp**, or **Direct Mobile Phone SMS**.
  - Secure bcrypt password hashing and JWT sessions.

- 👤 **Comprehensive Profile & Settings:**
  - Change Name, Phone number, and Avatar.
  - **Default Timezone Selection** (ensures midnight wishes arrive right at 00:01 in the recipient's local time).
  - Delivery confirmation alert toggle.
  - Change password securely.

- 🪄 **AI Wish Crafter (Gemini API Integration):**
  - Select relationship (Friend, Bestie, Mother, Father, Colleague, Partner, Boss).
  - Choose tone (Funny, Emotional/Heartfelt, Poetic, Formal, Short).
  - Bilingual support (বাংলা, English, Banglish).
  - 1-click insert directly into the greeting form.

---

## 🚀 100% Free Hosting & Deployment Guide

### 1. Frontend & Backend (Next.js) &rarr; Vercel
- Connect your GitHub repository to [Vercel](https://vercel.com).
- Click **Deploy** (Vercel provides free SSL, CDN, and high-performance serverless hosting).

### 2. Database &rarr; Supabase (PostgreSQL) or Neon
- Create a free project at [Supabase](https://supabase.com).
- Copy the PostgreSQL connection string.
- In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"` and add the `DATABASE_URL` in Vercel environment variables.
- Run `npx prisma db push`.

### 3. Automated Cron Trigger &rarr; Free Cron Service
- Use [cron-job.org](https://cron-job.org) or [Upstash QStash](https://upstash.com/docs/qstash/overall/getstarted) or Vercel Cron.
- Set a recurring schedule (e.g. every 5 minutes or every hour):
  ```
  POST https://your-domain.vercel.app/api/cron/dispatch
  Header: Authorization: Bearer <YOUR_CRON_SECRET>
  ```
  *(Or use query param: `?key=<YOUR_CRON_SECRET>`)*

---

## 🛠️ Local Development Setup

1. **Clone & Install Dependencies:**
   ```bash
   git clone <repo-url>
   cd AutoWISH
   npm install
   ```

2. **Database Setup (SQLite by default):**
   ```bash
   npx prisma db push
   ```

3. **Environment Variables (`.env`):**
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-jwt-secret"
   CRON_SECRET="your-cron-secret"

   # Optional integrations:
   RESEND_API_KEY="re_..."
   GEMINI_API_KEY="AIza..."
   TELEGRAM_BOT_TOKEN="123456:ABC..."
   SMS_GATEWAY_URL=""
   SMS_GATEWAY_API_KEY=""
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # Register, Login, Logout, Me, Forgot-Password, Reset-Password
│   │   ├── wishes/        # CRUD wishes (Create, Read, Update, Delete)
│   │   ├── cron/          # Scheduled dispatcher & 24h auto-cleaner
│   │   ├── ai/            # Gemini AI wish generator
│   │   └── logs/          # Delivery audit logs
│   ├── dashboard/         # Main celebration overview & countdown
│   ├── wishes/
│   │   ├── new/           # Wish creator with AI modal
│   │   └── edit/[id]/     # Wish updater (editable anytime)
│   ├── profile/           # User preferences & security
│   ├── activity/          # Delivery logs viewer
│   ├── login/             # Sign in
│   ├── register/          # Sign up
│   ├── forgot-password/   # Multi-channel OTP recovery
│   ├── layout.tsx         # Root layout with responsive Navbar & Footer
│   └── page.tsx           # Landing page
├── components/
│   ├── Navbar.tsx         # Top navigation bar
│   ├── Footer.tsx         # Brand footer
│   └── AiWishModal.tsx    # AI Greeting generator modal
├── lib/
│   ├── prisma.ts          # Database client
│   ├── auth.ts            # Password hashing & JWT helpers
│   ├── ai/                # Gemini prompt engine with fallback
│   └── dispatcher/        # Multi-channel delivery adapters (Email, WhatsApp, SMS, Telegram)
└── prisma/
    └── schema.prisma      # Models: User, Wish, VerificationCode, DeliveryLog
```

---

## 📄 License
MIT License. Built for celebration & connecting hearts everywhere.
