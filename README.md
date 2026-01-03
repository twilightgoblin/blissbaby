# BabyBliss - Modern Baby Products E-commerce Platform

A full-stack e-commerce platform built with Next.js 16, featuring modern authentication, secure payments, and comprehensive product management for baby products.

##  Features

### Core E-commerce
- **Product Catalog** - Browse products by categories with advanced filtering
- **Shopping Cart** - Persistent cart with real-time updates
- **Secure Checkout** - Stripe integration with tax calculation and address collection
- **Order Management** - Complete order tracking and history
- **User Profiles** - Account management with order history and addresses

### Authentication & Security
- **Clerk Authentication** - Modern, secure authentication with social logins
- **Role-based Access** - Admin and user role management
- **Webhook Integration** - Real-time user data synchronization
- **Secure API Routes** - Protected endpoints with proper authorization

### Admin Features
- **Product Management** - Create, edit, and manage products with multiple images
- **Order Processing** - View and manage customer orders
- **Category Management** - Organize products into categories
- **Image Management** - Cloudinary integration for optimized image handling

### Technical Features
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Image Optimization** - Cloudinary integration with automatic optimization
- **Database** - PostgreSQL with Prisma ORM
- **Type Safety** - Full TypeScript implementation
- **Modern UI** - Radix UI components with custom styling

##  Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - Latest React features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Robust relational database
- **Clerk** - Authentication and user management
- **Stripe** - Payment processing

### Services & Integrations
- **Cloudinary** - Image storage and optimization
- **Vercel Analytics** - Performance monitoring
- **Webhooks** - Real-time data synchronization

##  Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Clerk account
- Stripe account
- Cloudinary account

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

3. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/babybliss"
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."
   CLERK_WEBHOOK_SECRET="whsec_..."
   
   # Stripe Payment
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   
   # Cloudinary Images
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate deploy
   
   # Seed the database
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) to see the application.

##  Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Database
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset and reseed database
- `npm run db:studio` - Open Prisma Studio
- `npm run db:status` - Check database status

### Testing & Utilities
- `npm run test:api` - Test API endpoints
- `npm run test:cloudinary` - Test image upload
- `npm run test:order-creation` - Test order processing

##  Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── products/          # Product pages
│   ├── checkout/          # Checkout flow
│   └── ...
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   └── admin/            # Admin-specific components
├── contexts/             # React contexts
├── hooks/                # Custom hooks
├── lib/                  # Utility functions
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── docs/                 # Documentation
```

##  Configuration

### Clerk Setup
1. Create a Clerk application
2. Configure authentication methods
3. Set up webhooks for user synchronization
4. Add environment variables

### Stripe Setup
1. Create Stripe account
2. Get API keys from dashboard
3. Configure webhooks for payment events
4. Test with provided test cards

### Cloudinary Setup
1. Create Cloudinary account
2. Get cloud name and API credentials
3. Configure upload presets
4. Set up image transformations

##  API Documentation

### Products
- `GET /api/products` - List products with filtering
- `POST /api/products` - Create new product (admin)
- `GET /api/products/[id]` - Get product details
- `PUT /api/products/[id]` - Update product (admin)

### Orders
- `GET /api/orders` - List user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get order details

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category (admin)

### Upload
- `POST /api/upload/images` - Upload product images
- `DELETE /api/upload/delete` - Delete images

##  Testing

### Test Cards (Stripe)
- **Success**: `4000 0035 6000 0008` (India Visa)
- **Success**: `5555 5555 5555 4444` (Mastercard)
- **Decline**: `4000 0000 0000 0002`

Use any future expiry date and any 3-digit CVC.

##  Security Features

- **Authentication** - Clerk-powered secure authentication
- **Authorization** - Role-based access control
- **Input Validation** - Zod schema validation
- **CSRF Protection** - Built-in Next.js protection
- **Secure Headers** - Security headers configuration
- **Image Validation** - File type and size validation

## UI/UX Features

- **Responsive Design** - Mobile-first approach
- **Dark/Light Mode** - Theme switching support
- **Animations** - Smooth transitions and micro-interactions
- **Accessibility** - WCAG compliant components
- **Loading States** - Skeleton loaders and progress indicators

##  Performance

- **Image Optimization** - Cloudinary CDN with auto-format
- **Code Splitting** - Automatic code splitting with Next.js
- **Caching** - Optimized caching strategies
- **Bundle Analysis** - Built-in bundle analyzer
- **Core Web Vitals** - Optimized for performance metrics

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Check the [documentation](./docs/)
- Open an issue on GitHub
- Contact the development team

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Clerk](https://clerk.dev/) - Authentication platform
- [Stripe](https://stripe.com/) - Payment processing
- [Cloudinary](https://cloudinary.com/) - Image management
- [Radix UI](https://www.radix-ui.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

---

Built by DiGiLABS for modern e-commerce experiences.