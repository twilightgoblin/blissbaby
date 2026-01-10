# 🎯 BabyBliss Offers & Banners System

A comprehensive admin-managed offers and banners system that displays promotional content below featured products on the homepage.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Admin Interface](#admin-interface)
- [Frontend Components](#frontend-components)
- [Usage Examples](#usage-examples)
- [Scripts & Commands](#scripts--commands)

## 🎪 Overview

The offers system allows administrators to create and manage promotional banners and discount codes that are displayed on the homepage. The system supports:

- **Banner-only offers**: Visual promotions without discount codes
- **Discount code offers**: Codes that customers can apply at checkout
- **Combined offers**: Banners with associated discount codes

## ✨ Features

### Admin Features
- ✅ Create, edit, and delete offers
- ✅ Upload banner images via Cloudinary
- ✅ Set discount types (Percentage, Fixed Amount, Free Shipping)
- ✅ Schedule offers with start/end dates
- ✅ Set usage limits and minimum order amounts
- ✅ Priority-based sorting
- ✅ Status management (Active/Inactive/Scheduled/Expired)
- ✅ Usage tracking and analytics

### Customer Features
- ✅ Responsive carousel display on homepage
- ✅ Auto-play with manual navigation
- ✅ Copy discount codes to clipboard
- ✅ Click-through to product pages
- ✅ Mobile-optimized interface

### Technical Features
- ✅ RESTful API endpoints
- ✅ Database validation and constraints
- ✅ Error handling and fallbacks
- ✅ TypeScript support
- ✅ Prisma ORM integration

## 🗄️ Database Schema

```prisma
model offers {
  id              String       @id @default(cuid())
  title           String
  description     String?
  code            String?      @unique
  type            OfferType
  discountType    DiscountType
  discountValue   Decimal      @db.Decimal(10, 2)
  minOrderAmount  Decimal?     @db.Decimal(10, 2)
  maxUses         Int?
  usedCount       Int          @default(0)
  isActive        Boolean      @default(true)
  startDate       DateTime
  endDate         DateTime?
  position        String?      @default("home-hero")
  priority        Int          @default(0)
  image           String?
  buttonText      String?
  buttonLink      String?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

enum OfferType {
  BANNER
  DISCOUNT_CODE
  BOTH
}

enum DiscountType {
  PERCENTAGE
  FIXED_AMOUNT
  FREE_SHIPPING
}
```

## 🔌 API Endpoints

### Public Endpoints

#### GET `/api/offers`
Get active offers for public display.

**Query Parameters:**
- `type` - Filter by offer type (`BANNER`, `DISCOUNT_CODE`, `BOTH`)
- `position` - Filter by position (default: `home-hero`)

**Response:**
```json
{
  "offers": [
    {
      "id": "clx123...",
      "title": "Baby Care Essentials",
      "description": "Save big on baby care products",
      "code": "BABYCARE500",
      "type": "BOTH",
      "discountType": "FIXED_AMOUNT",
      "discountValue": 500,
      "minOrderAmount": 2000,
      "image": "https://...",
      "buttonText": "Shop Baby Care",
      "buttonLink": "/products?category=baby-care"
    }
  ]
}
```

#### POST `/api/offers/use`
Validate and use a discount code.

**Request Body:**
```json
{
  "code": "BABYCARE500",
  "orderAmount": 2500
}
```

**Response:**
```json
{
  "valid": true,
  "offer": {
    "id": "clx123...",
    "title": "Baby Care Essentials",
    "code": "BABYCARE500",
    "discountType": "FIXED_AMOUNT",
    "discountValue": 500,
    "discountAmount": 500,
    "freeShipping": false,
    "minOrderAmount": 2000
  }
}
```

### Admin Endpoints

#### GET `/api/admin/offers`
Get all offers for admin management.

**Query Parameters:**
- `type` - Filter by offer type
- `status` - Filter by status (`active`, `inactive`, `scheduled`, `expired`)

#### POST `/api/admin/offers`
Create a new offer.

#### GET `/api/admin/offers/[id]`
Get a specific offer by ID.

#### PUT `/api/admin/offers/[id]`
Update an existing offer.

#### DELETE `/api/admin/offers/[id]`
Delete an offer (or deactivate if it has been used).

## 🎛️ Admin Interface

### Location
`/admin/offers` - Accessible via the admin sidebar

### Features
- **Offer List**: View all offers with status indicators
- **Create/Edit Dialog**: Form with all offer fields
- **Image Upload**: Cloudinary integration for banner images
- **Status Management**: Toggle active/inactive status
- **Usage Analytics**: View usage statistics
- **Bulk Operations**: Delete multiple offers

### Form Fields
- **Title**: Offer headline (required)
- **Description**: Detailed description
- **Type**: Banner, Discount Code, or Both
- **Discount Type**: Percentage, Fixed Amount, or Free Shipping
- **Discount Value**: Amount or percentage
- **Discount Code**: Unique code for customers
- **Min Order Amount**: Minimum purchase requirement
- **Max Uses**: Usage limit
- **Start/End Date**: Scheduling
- **Image**: Banner image upload
- **Button Text/Link**: Call-to-action
- **Priority**: Display order (0-10)

## 🎨 Frontend Components

### OfferCarousel
**Location**: `components/offer-carousel.tsx`

**Features:**
- Auto-play carousel with 4-second intervals
- Manual navigation with arrow buttons
- Dot indicators for slide position
- Touch/swipe support for mobile
- Keyboard navigation (arrow keys)
- Copy-to-clipboard for discount codes
- Responsive design

**Usage:**
```tsx
import { OfferCarousel } from "@/components/offer-carousel"

<OfferCarousel 
  offers={offers} 
  autoPlayInterval={4000}
  className="my-8"
/>
```

### OfferBanner
**Location**: `components/offer-banner.tsx`

Single offer display component for individual banners.

## 📝 Usage Examples

### Creating a Banner-Only Offer
```typescript
const bannerOffer = {
  title: "Free Shipping Weekend",
  description: "Free shipping on all orders this weekend!",
  type: "BANNER",
  discountType: "FREE_SHIPPING",
  discountValue: 0,
  minOrderAmount: 1000,
  startDate: new Date(),
  endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
  image: "https://...",
  buttonText: "Shop Now",
  buttonLink: "/products",
  priority: 10,
  isActive: true
}
```

### Creating a Discount Code Offer
```typescript
const discountOffer = {
  title: "New Customer Special",
  description: "20% off your first order",
  code: "WELCOME20",
  type: "BOTH",
  discountType: "PERCENTAGE",
  discountValue: 20,
  minOrderAmount: 1500,
  maxUses: 100,
  startDate: new Date(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  image: "https://...",
  buttonText: "Get 20% Off",
  buttonLink: "/products",
  priority: 9,
  isActive: true
}
```

### Validating a Discount Code
```typescript
const response = await fetch('/api/offers/use', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: 'WELCOME20',
    orderAmount: 2000
  })
})

const result = await response.json()
if (result.valid) {
  console.log(`Discount: ₹${result.offer.discountAmount}`)
}
```

## 🛠️ Scripts & Commands

### Database Setup
```bash
# Setup offers schema and create sample data
npm run db:setup-offers

# View current offers
npm run db:view-offers

# Generate Prisma client after schema changes
npx prisma generate
```

### Development
```bash
# Start development server
npm run dev

# View admin interface
# Navigate to: http://localhost:3000/admin/offers
```

### Testing
```bash
# Test API endpoints (requires server running)
npx tsx scripts/test-offers-api.ts
```

## 🎯 Display Logic

### Homepage Placement
The offers carousel is displayed on the homepage:
1. **After** the Featured Products section
2. **Before** the Footer
3. Only shows **active offers** with `type` of `BANNER` or `BOTH`

### Filtering Rules
- **Active**: `isActive = true` AND `startDate <= now` AND (`endDate = null` OR `endDate >= now`)
- **Scheduled**: `isActive = true` AND `startDate > now`
- **Expired**: `endDate < now`
- **Inactive**: `isActive = false`

### Priority Sorting
Offers are sorted by:
1. Priority (descending, 0-10)
2. Creation date (newest first)

## 🔒 Security & Validation

### Input Validation
- Required fields validation
- Enum value validation
- Date range validation
- Unique discount code constraint
- Positive discount values

### Usage Protection
- Maximum usage limits
- Minimum order amount checks
- Date range enforcement
- Active status verification

### Error Handling
- Graceful API error responses
- User-friendly error messages
- Fallback UI states
- Database constraint handling

## 📊 Analytics & Tracking

### Usage Metrics
- Total offer usage count
- Individual offer performance
- Conversion tracking
- Popular discount codes

### Admin Dashboard
- Active/inactive offer counts
- Scheduled offers overview
- Usage statistics
- Performance insights

---

## 🚀 Getting Started

1. **Setup Database**: Run `npm run db:setup-offers`
2. **Access Admin**: Navigate to `/admin/offers`
3. **Create Offers**: Use the admin interface to create banners and discount codes
4. **View Homepage**: Check the homepage to see your offers in action

The system is now ready to handle all your promotional needs! 🎉