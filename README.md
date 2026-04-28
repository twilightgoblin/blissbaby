# BabyBliss - Baby Products E-commerce Platform

A full-stack e-commerce platform built with Next.js 16, featuring modern authentication, secure payments, push notifications, and comprehensive product management for baby products.

## Features

### Core E-commerce
- **Product Catalog** - Browse products by categories with advanced filtering
- **Shopping Cart** - Persistent cart with real-time updates
- **Secure Checkout** - Stripe integration with tax calculation and address collection
- **Order Management** - Complete order tracking and history
- **Offers & Discounts** - Promo code and discount offer system
- **User Profiles** - Account management with order history and saved addresses

### Authentication & Security
- **Clerk Authentication** - Secure authentication with social logins
- **Role-based Access** - Admin and user role management
- **Webhook Integration** - Real-time user data synchronization via Svix
- **Protected API Routes** - Authorization on all sensitive endpoints

### Admin Dashboard
- **Product Management** - Create, edit, and manage products with multiple images
- **Order Processing** - View and manage customer orders
- **Category Management** - Organize products into categories
- **Offers Management** - Create and manage discount offers
- **Customer Management** - View and manage user accounts
- **Analytics** - Sales and performance reporting
- **Push Notifications** - Send notifications to all users or specific segments

### Notifications
- **Firebase Cloud Messaging** - Push notifications via FCM
- **Admin Broadcast** - Send notifications to all users from the admin panel
- **Order Notifications** - Automatic notifications on order status changes
- **Notification Preferences** - Users can manage their notification settings

### Technical Features
- **Caching** - Redis/Upstash caching layer for performance
- **Responsive Design** - Mobile-first with Tailwind CSS
- **Image Optimization** - Cloudinary CDN with automatic optimization
- **Database** - PostgreSQL with Prisma ORM
- **Type Safety** - Full TypeScript implementation
- **Modern UI** - Radix UI components with custom styling

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS 4, Radix UI |
| Auth | Clerk 6 |
| Database | PostgreSQL + Prisma 7 |
| Payments | Stripe 20 |
| Images | Cloudinary |
| Notifications | Firebase Cloud Messaging |
| Caching | Redis / Upstash |
| Deployment | Vercel |

## Installation

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Accounts for: Clerk, Stripe, Cloudinary, Firebase, Redis (or Upstash)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd babybliss
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Key variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/babybliss"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."
   CLERK_WEBHOOK_SECRET="whsec_..."

   # Admin
   ADMIN_EMAILS="admin@example.com"

   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."

   # Cloudinary
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"

   # Firebase (Push Notifications)
   NEXT_PUBLIC_FIREBASE_API_KEY="..."
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
   NEXT_PUBLIC_FIREBASE_VAPID_KEY="..."
   FIREBASE_PRIVATE_KEY="..."
   FIREBASE_CLIENT_EMAIL="..."

   # Redis / Upstash
   REDIS_URL="redis://localhost:6379"
   ```

4. **Database setup**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Add all environment variables in the Vercel dashboard
3. Deploy — migrations run automatically via `prisma migrate deploy` on build

### Manual
```bash
npm run build
npm start
```

## Available Scripts

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

### Database
```bash
npm run db:seed              # Seed with sample data
npm run db:reset             # Reset and reseed
npm run db:studio            # Open Prisma Studio
npm run db:status            # Check DB connection status
npm run db:deploy            # Run pending migrations
```

### Testing & Utilities
```bash
npm run test:api             # Test API endpoints
npm run test:cloudinary      # Test image uploads
npm run test:order-creation  # Test order flow
npm run test:redis           # Test Redis connection
npm run test:cache           # Test cache fallback
```

## Project Structure

```
├── app/
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard pages
│   ├── products/          # Product listing & detail pages
│   ├── checkout/          # Checkout flow
│   └── account/           # User account pages
├── components/
│   ├── ui/                # Base Radix UI components
│   └── admin/             # Admin-specific components
├── contexts/              # React context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities, DB client, helpers
├── prisma/                # Schema and migrations
├── public/                # Static assets
└── scripts/               # DB and utility scripts
```

## API Overview

### Products
- `GET /api/products` — List with filtering & pagination
- `GET /api/products/[id]` — Product details
- `POST /api/admin/products` — Create (admin)
- `PUT /api/admin/products/[id]` — Update (admin)

### Orders
- `GET /api/orders` — User's orders
- `POST /api/orders` — Place an order
- `GET /api/orders/[id]` — Order details

### Offers
- `GET /api/offers` — Active offers
- `POST /api/offers/use` — Apply offer code

### Notifications
- `POST /api/notifications/token` — Register FCM token
- `GET /api/notifications/preferences` — Get preferences
- `POST /api/notifications/send` — Send notification (admin)

### Categories
- `GET /api/categories` — All categories
- `POST /api/admin/categories` — Create (admin)

## Stripe Test Cards

| Card | Number |
|---|---|
| Visa (success) | `4000 0035 6000 0008` |
| Mastercard (success) | `5555 5555 5555 4444` |
| Declined | `4000 0000 0000 0002` |

Use any future expiry date and any 3-digit CVC.

## License

MIT License — see [LICENSE](LICENSE) for details.

## Acknowledgments

[Next.js](https://nextjs.org/) · [Clerk](https://clerk.dev/) · [Stripe](https://stripe.com/) · [Cloudinary](https://cloudinary.com/) · [Firebase](https://firebase.google.com/) · [Radix UI](https://www.radix-ui.com/) · [Tailwind CSS](https://tailwindcss.com/)
