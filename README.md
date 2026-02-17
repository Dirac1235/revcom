# RevCom - Ethiopia's Premier B2B Marketplace

A sophisticated B2B marketplace platform connecting buyers and sellers across Ethiopia. Built with Next.js, Supabase, and modern web technologies.

**Live Site**: [https://revecom.vercel.app](https://revecom.vercel.app)

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://revecom.vercel.app)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org)

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Pages & Routes](#pages--routes)
- [Data Layer](#data-layer)
- [Authentication](#authentication)
- [Database Schema](#database-schema)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)

## Overview

RevCom is a business-to-business marketplace that enables:
- **Buyers** to post requests for products/services and receive competitive offers
- **Sellers** to list products and respond to buyer requests
- **Real-time messaging** between buyers and sellers
- **Order management** with status tracking
- **Multi-role support** (buyer, seller, or both)

## Architecture

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Context + Hooks
- **Icons**: Lucide React

### Project Structure
```
├── app/                    # Next.js app router pages
├── components/             # React components
│   ├── features/          # Feature-specific components
│   ├── layout/            # Layout components (Navbar, Footer)
│   ├── providers/         # Context providers
│   └── ui/                # shadcn/ui components
├── lib/                   # Utilities and data layer
│   ├── data/              # Database functions
│   ├── hooks/             # Custom React hooks
│   └── supabase/          # Supabase clients
├── types/                 # TypeScript types
└── styles/                # Global styles
```

## Features

### Core Features
1. **Dual Role System**: Users can be buyers, sellers, or both
2. **Product Listings**: Sellers can create and manage product listings
3. **Buyer Requests**: Buyers can post requirements with budget ranges
4. **Real-time Messaging**: Chat system between buyers and sellers
5. **Order Management**: Track orders from creation to delivery
6. **Search & Filter**: Advanced search with category filtering
7. **Dashboard**: Role-based dashboards with analytics
8. **Theme Support**: Light/Dark mode toggle

### User Types
- **Buyer**: Can post requests, browse products, place orders
- **Seller**: Can list products, browse requests, send offers
- **Both**: Full access to both buyer and seller features with role switching

## Pages & Routes

### Public Routes

#### `/` (Home)
**Purpose**: Landing page showcasing featured products and requests

**Functions**:
- `HomePage()`: Main component rendering hero section, stats, products grid, requests grid
- `handleSearch(query)`: Navigates to products page with search query

**Components Used**:
- `SearchBar`: Hero search input
- `ProductCard`: Grid of featured products
- `RequestCard`: Grid of recent requests
- `LoadingState`: Skeleton loaders

**Data Fetching**:
- `useProducts({ limit: 8 })`: Fetches 8 featured products
- `useRequests({ limit: 8 })`: Fetches 8 recent requests
- `getListingsCount()`: Gets total product count for stats
- `getRequestsCount()`: Gets total request count for stats

#### `/auth/login`
**Purpose**: User login page

**Functions**:
- `login(formData)`: Server action authenticating user with email/password
- Handles email verification resend if not confirmed

#### `/auth/signup`
**Purpose**: User registration page

**Functions**:
- `signup(formData)`: Server action creating new user account
- Creates profile in database after signup
- Sends verification email

#### `/products`
**Purpose**: Browse all product listings

**Functions**:
- Product grid with filtering
- Search functionality
- Category filtering

**Data**:
- `useProducts()`: Fetches all active listings
- Supports query params for search/filtering

#### `/products/[id]`
**Purpose**: Individual product detail page

**Functions**:
- `ProductDetailPage()`: Displays product information
- Contact seller functionality
- Related products

#### `/listings` (Buyer Requests)
**Purpose**: Browse all buyer requests

**Functions**:
- Grid of buyer requests
- Filter by category
- Search functionality

#### `/listings/[id]`
**Purpose**: Individual request detail page

**Functions**:
- Display request details
- Show seller responses/conversations
- Contact buyer functionality

### Protected Routes (Buyer)

#### `/buyer/requests`
**Purpose**: Manage buyer's own requests

**Functions**:
- List all requests created by the buyer
- Edit/delete requests
- View responses count

**Server Functions**:
- `getProfileById(user.id)`: Fetches user profile
- `getBuyerRequests(user.id)`: Fetches buyer's requests

#### `/buyer/requests/create`
**Purpose**: Create new buyer request

**Functions**:
- Form to create new request
- Fields: title, description, category, budget range

**Data Functions**:
- `createRequest(payload)`: Creates request in database

#### `/buyer/requests/[id]/edit`
**Purpose**: Edit existing request

**Functions**:
- `getRequestById(id)`: Fetches request data
- `updateRequest(id, update)`: Updates request

#### `/buyer/orders`
**Purpose**: View buyer's orders

**Functions**:
- List all orders placed by buyer
- Track order status
- View order details

**Server Functions**:
- `getBuyerOrders(user.id)`: Fetches orders

#### `/buyer/orders/[id]`
**Purpose**: Order detail view

**Functions**:
- Display order timeline
- View seller information
- Track delivery status

### Protected Routes (Seller)

#### `/seller/products`
**Purpose**: Manage seller's product listings

**Functions**:
- Grid of seller's products
- Edit/delete products
- View product analytics (views)

**Server Functions**:
- `getListings({ sellerId: user.id })`: Fetches seller's products

#### `/seller/products/create`
**Purpose**: Create new product listing

**Functions**:
- Form to create product
- Fields: title, description, price, inventory, images

**Data Functions**:
- `createListing(payload)`: Creates listing

#### `/seller/products/[id]/edit`
**Purpose**: Edit product listing

**Functions**:
- `getListingById(id)`: Fetches product
- `updateListing(id, updates)`: Updates product

#### `/seller/orders`
**Purpose**: View incoming orders

**Functions**:
- List orders from buyers
- Update order status (pending → accepted → shipped → delivered)

**Server Functions**:
- `getSellerOrders(user.id)`: Fetches orders
- `updateOrderStatus(id, status)`: Updates order status

#### `/seller/explore`
**Purpose**: Browse buyer requests to bid on

**Functions**:
- Grid of open buyer requests
- Send offer functionality
- Filter by category

#### `/seller/orders/[id]`
**Purpose**: Order management detail view

**Functions**:
- View order details
- Update order status
- View buyer information
- Complete order workflow

### Protected Routes (Shared)

#### `/dashboard`
**Purpose**: Role-based dashboard

**Functions**:
- `DashboardPage()`: Main dashboard component
- `BuyerDashboard()`: Buyer-specific view (listings, orders, stats)
- `SellerDashboard()`: Seller-specific view (offers, orders, requests, stats)
- Role switcher for users with "both" type

**Data Functions**:
- `getBuyerRequests(user.id)`: Buyer's listings
- `getBuyerOrders(user.id)`: Buyer's orders
- `getSellerOrders(user.id)`: Seller's orders
- `getOpenRequests()`: Available requests for sellers
- `getSellerOffers(user.id)`: Seller's offers

**Stats Tracked**:
- Total listings/requests
- Open/Negotiating/Closed counts
- Total orders
- Pending/Accepted/Rejected offers

#### `/messages`
**Purpose**: Chat interface

**Functions**:
- `MessagesContent()`: Main messages component
- `fetchConversations()`: Loads user's conversations
- `handleConversationSelect()`: Opens conversation
- Real-time message display

**Data Functions**:
- `getUserConversations(user.id)`: Fetches conversations
- `getConversationListDetails()`: Fetches participant info
- `getMessages(conversationId)`: Fetches messages

#### `/messages/[id]`
**Purpose**: Individual conversation view

**Functions**:
- `ConversationView()`: Chat interface component
- `sendMessage()`: Sends new message
- Real-time message updates

#### `/profile`
**Purpose**: User profile management

**Functions**:
- `ProfilePage()`: Profile settings component
- `handleSave()`: Saves profile changes
- Form fields: first name, last name, bio

**Data Functions**:
- `updateProfile(userId, updates)`: Updates profile
- `refreshProfile()`: Refetches profile data

## Data Layer

### Client-Side Data Functions

#### `lib/data/profiles.ts`
```typescript
getProfileById(userId: string): Promise<Profile>
updateProfile(userId: string, updates: object): Promise<void>
getCurrentUserProfile(): Promise<Profile | null>
```

#### `lib/data/orders.ts`
```typescript
getBuyerOrders(buyerId: string): Promise<Order[]>
getSellerOrders(sellerId: string): Promise<Order[]>
getOrderById(id: string): Promise<Order>
updateOrderStatus(id: string, status: string): Promise<void>
createOrder(payload: object): Promise<void>
```

#### `lib/data/requests.ts`
```typescript
getOpenRequests(): Promise<Request[]>
getBuyerRequests(buyerId: string): Promise<Request[]>
getRequestById(id: string): Promise<Request>
createRequest(payload: object): Promise<void>
updateRequest(id: string, update: object): Promise<void>
deleteRequest(id: string): Promise<void>
getRequestsCount(filters?): Promise<number>
```

#### `lib/data/listings.ts`
```typescript
getListings(filters?): Promise<Listing[]>
getListingById(id: string): Promise<Listing>
createListing(payload: object): Promise<void>
updateListing(id: string, updates: object): Promise<void>
deleteListing(id: string): Promise<void>
getListingsCount(filters?): Promise<number>
```

#### `lib/data/conversations.ts`
```typescript
getConversations(userId: string): Promise<Conversation[]>
getConversationById(id: string): Promise<Conversation>
createConversation(p1: string, p2: string): Promise<Conversation>
getMessages(conversationId: string): Promise<Message[]>
sendMessage(payload: object): Promise<void>
markMessagesAsRead(conversationId: string, userId: string): Promise<void>
```

#### `lib/data/offers.ts`
```typescript
getSellerOffers(sellerId: string, limit?: number): Promise<Offer[]>
getOfferById(id: string): Promise<Offer>
createOffer(payload: object): Promise<void>
updateOfferStatus(id: string, status: string): Promise<void>
```

### Server-Side Data Functions
Located in `lib/data/*-server.ts` files, these use `@/lib/supabase/server` for SSR.

## Authentication

### Auth Flow
1. User signs up → Account created in Supabase Auth
2. Profile created in `profiles` table with same ID
3. Verification email sent
4. User logs in → Session created
5. AuthProvider manages auth state across app

### Protected Routes
Routes check authentication via:
- Server components: `supabase.auth.getUser()`
- Client components: `useAuth()` hook

### Auth Context (`useAuth()`)
```typescript
{
  user: User | null,
  profile: Profile | null,
  loading: boolean,
  isAuthenticated: boolean,
  isBuyer: boolean,
  isSeller: boolean,
  signOut: () => Promise<void>,
  refreshProfile: () => Promise<void>
}
```

## Database Schema

### `profiles`
```sql
id: uuid (primary key, references auth.users)
email: string
first_name: string
last_name: string
user_type: enum ('buyer', 'seller', 'both')
bio: text
avatar_url: string
rating: number
total_reviews: number
created_at: timestamp
updated_at: timestamp
```

### `listings` (Products)
```sql
id: uuid (primary key)
seller_id: uuid (references profiles.id)
title: string
description: text
category: string
price: number
inventory_quantity: number
status: enum ('active', 'inactive', 'sold')
image_url: string
images: string[]
views: number
created_at: timestamp
updated_at: timestamp
```

### `requests` (Buyer Listings)
```sql
id: uuid (primary key)
buyer_id: uuid (references profiles.id)
title: string
description: text
category: string
budget_min: number
budget_max: number
status: enum ('open', 'negotiating', 'closed')
created_at: timestamp
updated_at: timestamp
```

### `orders`
```sql
id: uuid (primary key)
buyer_id: uuid (references profiles.id)
seller_id: uuid (references profiles.id)
request_id: uuid (references requests.id, nullable)
title: string
description: text
quantity: number
agreed_price: number
delivery_location: string
status: enum ('pending', 'accepted', 'shipped', 'delivered', 'cancelled')
created_at: timestamp
updated_at: timestamp
```

### `conversations`
```sql
id: uuid (primary key)
participant_1_id: uuid (references profiles.id)
participant_2_id: uuid (references profiles.id)
request_id: uuid (references requests.id, nullable)
created_at: timestamp
updated_at: timestamp
```

### `messages`
```sql
id: uuid (primary key)
conversation_id: uuid (references conversations.id)
sender_id: uuid (references profiles.id)
content: text
read: boolean
created_at: timestamp
```

### `offers`
```sql
id: uuid (primary key)
seller_id: uuid (references profiles.id)
request_id: uuid (references requests.id)
price: number
description: text
status: enum ('pending', 'accepted', 'rejected')
created_at: timestamp
```

## Custom Hooks

### `useProducts(options?)`
Fetches product listings with filtering
```typescript
const { products, loading, error, refetch } = useProducts({
  sellerId?: string,
  category?: string,
  status?: 'active' | 'inactive' | 'sold',
  search?: string,
  limit?: number
});
```

### `useRequests(options?)`
Fetches buyer requests with filtering
```typescript
const { requests, loading, error, refetch } = useRequests({
  buyerId?: string,
  status?: 'open' | 'closed' | 'completed',
  category?: string,
  search?: string,
  limit?: number
});
```

### `useAuth()`
Authentication context hook
```typescript
const { user, profile, loading, isAuthenticated, isBuyer, isSeller, signOut } = useAuth();
```

## Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation
```bash
# Clone repository
git clone <repo-url>
cd revcom

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Database Setup
1. Create Supabase project
2. Run schema migrations (if provided)
3. Set up authentication providers
4. Configure Row Level Security (RLS) policies

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Deployment

### Live Site
The application is deployed and accessible at:
**[https://revecom.vercel.app](https://revecom.vercel.app)**

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Build
```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Submit pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@revcom.com or open an issue on GitHub.
