# Baby Bliss E-commerce Backend

This document describes the backend setup for the Baby Bliss e-commerce application using PostgreSQL, Prisma, and Next.js API routes.

## Database Setup

### Technology Stack
- **Database**: PostgreSQL (hosted on Supabase)
- **ORM**: Prisma 7 with PostgreSQL adapter
- **API**: Next.js API Routes
- **Language**: TypeScript

### Database Schema

The database includes the following main tables:

#### Core Tables
- **users** - Customer and admin user accounts
- **products** - Product catalog with inventory management
- **carts** - Shopping carts for users
- **cart_items** - Individual items in shopping carts
- **orders** - Customer orders
- **order_items** - Individual items in orders
- **payments** - Payment transactions
- **refunds** - Refund records
- **shipments** - Shipping information
- **addresses** - User shipping and billing addresses

#### Key Features
- **User Roles**: Customer, Admin, Super Admin
- **Product Management**: Categories, inventory tracking, pricing
- **Order Management**: Status tracking, payment integration
- **Address Management**: Multiple addresses per user
- **Cart Persistence**: Saved shopping carts
- **Payment Processing**: Multiple payment methods support
- **Shipping Tracking**: Carrier integration ready

## Environment Setup

### Required Environment Variables

Create a `.env` file with:

```env
DATABASE_URL="postgresql://postgres:DiGiLABS123@db.muavtyyrapumxdutogpr.supabase.co:5432/postgres"
```

### Installation

1. Install dependencies:
```bash
npm install
```

2. Generate Prisma client:
```bash
npx prisma generate
```

3. Run database migrations:
```bash
npx prisma migrate dev --name init
```

4. Seed the database:
```bash
npm run db:seed
```

## Available Scripts

### Database Management
- `npm run db:seed` - Populate database with sample data
- `npm run db:reset` - Reset database and reseed
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:status` - Check database connection and statistics

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test:api` - Test API endpoints

## API Endpoints

### Products API
- `GET /api/products` - List all products
  - Query params: `limit`, `category`, `featured`
- `POST /api/products` - Create new product
- `GET /api/products/[id]` - Get single product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Users API
- `GET /api/users` - List all users
  - Query params: `email`
- `POST /api/users` - Create new user

### Cart API
- `GET /api/cart?userId=[id]` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart` - Update cart item quantity
- `DELETE /api/cart` - Remove item or clear cart

### Orders API
- `GET /api/orders` - List orders
  - Query params: `userId`, `status`
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get single order
- `PUT /api/orders/[id]` - Update order status

## Database Helpers

The `lib/db-helpers.ts` file provides convenient functions:

### User Functions
- `createUser(data)` - Create new user
- `getUserByEmail(email)` - Find user by email

### Product Functions
- `createProduct(data)` - Create new product
- `getActiveProducts(limit?)` - Get active products

### Cart Functions
- `getOrCreateCart(userId)` - Get or create user cart
- `addToCart(userId, productId, quantity)` - Add item to cart

### Order Functions
- `createOrder(data)` - Create new order
- `getUserOrders(userId)` - Get user's orders

### Payment Functions
- `createPayment(data)` - Create payment record

### Address Functions
- `createAddress(data)` - Create user address

## Sample Data

The seed script creates:
- 2 users (1 admin, 1 customer)
- 5 sample baby products
- 1 default address for the customer

### Sample Users
- **Admin**: admin@example.com
- **Customer**: customer@example.com

### Sample Products
- Organic Baby Onesie ($24.99)
- Baby Feeding Bottle Set ($39.99)
- Soft Teddy Bear ($19.99)
- Baby Care Products Set ($34.99)
- Colorful Baby Toys Set ($29.99)

## Database Connection

The application uses Prisma with a PostgreSQL adapter for optimal performance with Supabase. The connection is configured in `lib/db.ts` with connection pooling and proper error handling.

## Testing

Run the database status check:
```bash
npm run db:status
```

Test API endpoints (requires dev server running):
```bash
npm run test:api
```

## Production Considerations

1. **Environment Variables**: Ensure DATABASE_URL is properly set
2. **Connection Pooling**: Configured for optimal performance
3. **Error Handling**: All API routes include proper error handling
4. **Data Validation**: Input validation on all endpoints
5. **Security**: Prepared statements prevent SQL injection

## Next Steps

1. Add authentication middleware
2. Implement payment processing integration
3. Add email notifications
4. Set up automated backups
5. Add API rate limiting
6. Implement caching strategies