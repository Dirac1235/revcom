# RevCom — Ethiopia's Premier Online Marketplace

> Connecting buyers and sellers across Ethiopia through a modern, real-time commerce platform.

[![Live](https://img.shields.io/badge/Live-revecom.vercel.app-black?style=flat-square&logo=vercel)](https://revecom.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)](https://supabase.com)

---

## Overview

RevCom is a full-stack marketplace that enables anyone across Ethiopia to post procurement requests, list products, negotiate deals, and manage orders — all in one place.

**Buyers** post requests with budget ranges and receive competitive offers from sellers. **Sellers** list products and actively bid on buyer requests. Both roles are supported under a single account with seamless role switching.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Deployment | Vercel |

---

## Features

- **Dual-role accounts** — users can operate as a buyer, seller, or both
- **Product listings** — sellers create and manage searchable product catalogs
- **Buyer requests** — buyers post procurement needs with budget ranges
- **Offer system** — sellers respond to requests with competitive offers
- **Real-time messaging** — built-in chat between buyers and sellers
- **Order management** — full order lifecycle tracking from pending to delivered
- **Role-based dashboards** — analytics and activity views tailored per role
- **Search & filtering** — category and keyword filtering across listings and requests
- **Light/Dark mode** — system-aware theme support

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Installation

```bash
git clone <repo-url>
cd revcom
npm install
cp .env.example .env.local
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Database Setup

1. Create a new Supabase project
2. Run the schema migrations from `/supabase/migrations`
3. Enable Row Level Security (RLS) on all tables
4. Configure authentication providers in the Supabase dashboard

---

## Project Structure

```
├── app/                  # Next.js App Router pages & routes
├── components/
│   ├── features/         # Feature-specific components
│   ├── layout/           # Navbar, Footer
│   ├── providers/        # Context providers (Auth, Theme)
│   └── ui/               # shadcn/ui base components
├── lib/
│   ├── data/             # Database access functions (client + server)
│   ├── hooks/            # Custom React hooks
│   └── supabase/         # Supabase client configuration
├── types/                # Shared TypeScript types
└── styles/               # Global styles
```

---

## Key Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page with featured products and requests |
| `/products` | Public | Browse all active listings |
| `/requests` | Public | Browse all open buyer requests |
| `/dashboard` | Protected | Role-based analytics dashboard |
| `/messages` | Protected | Real-time messaging inbox |
| `/buyer/requests` | Buyer | Create and manage procurement requests |
| `/buyer/orders` | Buyer | Track placed orders |
| `/seller/products` | Seller | Manage product listings |
| `/seller/explore` | Seller | Browse open requests and submit offers |
| `/seller/orders` | Seller | Manage incoming orders and update statuses |
| `/profile` | Protected | User profile settings |

---

## Database Schema

### Core Tables

**`profiles`** — User accounts with role (`buyer`, `seller`, `both`), bio, rating, and avatar.

**`listings`** — Seller product listings with category, price, inventory, images, and status (`active`, `inactive`, `sold`).

**`requests`** — Buyer procurement requests with budget range (`budget_min`, `budget_max`) and status (`open`, `negotiating`, `closed`).

**`orders`** — Transactional records linking buyer, seller, and optionally a request, with full status tracking (`pending` → `accepted` → `shipped` → `delivered` → `cancelled`).

**`offers`** — Seller offers submitted against buyer requests, with status (`pending`, `accepted`, `rejected`).

**`conversations`** + **`messages`** — Chat system linking two participants, optionally tied to a request.

---

## Authentication

Authentication is handled entirely through Supabase Auth.

1. User registers → Supabase creates auth record + app creates matching `profiles` row
2. Verification email sent on signup
3. On login, a session is established and managed globally via `AuthProvider`
4. Protected routes are guarded server-side via `supabase.auth.getUser()` and client-side via the `useAuth()` hook

---

## Deployment

The app is deployed on Vercel and available at **[https://revecom.vercel.app](https://revecom.vercel.app)**.

To deploy your own instance:

1. Push the repository to GitHub
2. Import the project into [Vercel](https://vercel.com)
3. Add the required environment variables in the Vercel dashboard
4. Deploy

```bash
npm run build   # Verify build passes locally before deploying
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push and open a pull request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## License

MIT License — see [LICENSE](./LICENSE) for details.

---

## Support

Open an issue on GitHub or reach out at **support@revcom.com**.