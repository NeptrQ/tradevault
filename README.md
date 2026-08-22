# TradeVault

> A professional, full-stack personal trading journal and performance management platform.

---

## Features

| Feature | Description |
|---------|-------------|
| 📊 **Dashboard** | P&L cards, equity curve, daily P&L chart, prop firm progress |
| 📋 **Trade Log** | Full trade management with filters, sorting, pagination |
| 🏦 **Accounts** | Multi-account with prop firm challenge tracking |
| 📅 **Calendar** | Visual day-by-day P&L trading calendar |
| 📈 **Analytics** | Equity curves, symbol/strategy/session performance |
| 🎯 **Goals** | Visual goal tracking with progress bars |
| 🛡️ **Risk Management** | Real-time position size calculator |
| 📓 **Journal** | Qualitative trading journal with mood and tags |
| 🤖 **Smart Review** | Rule-based AI analysis — no API key required |
| ⚙️ **Settings** | Full preferences, risk config, data management |

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **UI**: shadcn/ui + Tailwind CSS v4
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Deployment**: Vercel

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/tradevault.git
cd tradevault
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → run the full contents of `supabase/schema.sql`
3. Go to **Project Settings → API** and copy your keys

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → you'll be redirected to `/login`

---

## Deploy to Vercel

### One-click (after pushing to GitHub):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual steps:

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add **Environment Variables** in Vercel dashboard:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL (e.g. `https://tradevault.vercel.app`) |
| `OPENAI_API_KEY` | *(Optional)* For AI Review feature |

4. Click **Deploy** ✅

---

## Application Routes

| Route | Page |
|-------|------|
| `/login` | Sign in |
| `/register` | Create account |
| `/dashboard` | Main overview |
| `/trades` | Trade log |
| `/trades/new` | Add trade |
| `/trades/[id]` | Trade detail |
| `/accounts` | All accounts |
| `/accounts/new` | Add account |
| `/accounts/[id]` | Account detail |
| `/calendar` | P&L calendar |
| `/analytics` | Full analytics |
| `/goals` | Goal tracking |
| `/risk-management` | Position calculator |
| `/journal` | Trading journal |
| `/ai-review` | Smart Review AI |
| `/settings` | App settings |
| `/profile` | User profile |

---

## Smart Review (AI without an API key)

TradeVault includes a built-in rule-based analysis engine:

- ✅ Revenge trading detection
- ✅ Overtrading detection
- ✅ Risk discipline scoring
- ✅ Strategy performance analysis
- ✅ Session performance insights
- ✅ Psychology pattern detection
- ✅ Consistency scoring

To enable deeper AI analysis (optional), add your `OPENAI_API_KEY` in **Settings → AI**.

---

## Database Schema

See [`supabase/schema.sql`](./supabase/schema.sql) for the complete schema including:

- Row Level Security (RLS) — users only see their own data
- Performance indexes
- Auto-update triggers
- Auto-create user settings on signup

---

## Project Structure

```
tradevault/
├── app/
│   ├── (auth)/          # Login, Register
│   ├── (dashboard)/     # All protected pages + layout
│   └── api/             # API routes (trades, accounts, analytics, AI)
├── components/ui/       # shadcn/ui components
├── lib/
│   ├── analytics/       # Performance calculation engine
│   ├── ai/              # Smart Review rule engine
│   └── supabase/        # Browser + server clients
├── types/               # TypeScript interfaces
└── supabase/
    └── schema.sql       # Full database schema
```

---

## Security

- Auth middleware protects all `/dashboard/*` routes
- Supabase RLS ensures data isolation per user
- AI API keys are **server-side only** — never sent to the browser
- `NEXT_PUBLIC_*` variables are safe (anon key + RLS)

---

## License

MIT
