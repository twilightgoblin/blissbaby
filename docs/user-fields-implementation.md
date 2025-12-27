# User Email and Name Fields Implementation

## Overview
Added `userEmail` and `userName` fields to key database tables to improve query performance and reduce the need for joins when accessing user information.

## Database Changes

### Schema Updates
The following models were updated to include user email and name fields:

1. **Cart**
   - Added `userEmail: String?`
   - Added `userName: String?`

2. **Order**
   - Added `userEmail: String?`
   - Added `userName: String?`

3. **Payment**
   - Added `userEmail: String?`
   - Added `userName: String?`

4. **Refund**
   - Added `userEmail: String?`
   - Added `userName: String?`

5. **Address**
   - Added `userEmail: String?`
   - Added `userName: String?`

### Migration
- Created migration: `20251226145920_add_user_email_name_fields`
- All fields are optional to handle existing data gracefully

## Code Changes

### Helper Functions Updated
Updated `lib/db-helpers.ts` with the following changes:

1. **New Utility Function**
   ```typescript
   export const getUserEmailAndName = async (userId: string) => {
     const user = await db.user.findUnique({
       where: { id: userId },
       select: { email: true, name: true }
     })
     return {
       userEmail: user?.email || '',
       userName: user?.name || null
     }
   }
   ```

2. **Updated Helper Functions**
   - `getOrCreateCart()` - Now populates user fields when creating new carts
   - `createOrder()` - Automatically includes user email and name
   - `createPayment()` - Fetches user info from associated order
   - `createAddress()` - Includes user fields from userId
   - `createRefund()` - Fetches user info from associated order

## Data Migration

### Backfill Script
Created `scripts/backfill-user-data.ts` to populate existing records:
- Updates all existing Cart, Order, Payment, Refund, and Address records
- Fetches user email and name from User table via relationships
- Run with: `npm run db:backfill`

### Test Script
Created `scripts/test-user-fields.ts` to verify functionality:
- Tests creation of new records with user fields
- Verifies existing records have been backfilled
- Run with: `npm run test:user-fields`

## Benefits

1. **Performance**: Reduced need for joins when displaying user information
2. **Convenience**: Direct access to user email and name in queries
3. **Reporting**: Easier to generate reports without complex joins
4. **Backwards Compatibility**: All fields are optional, existing code continues to work

## Usage Examples

### Query orders with user info (no join needed)
```typescript
const orders = await db.order.findMany({
  select: {
    id: true,
    orderNumber: true,
    userEmail: true,
    userName: true,
    totalAmount: true,
    status: true
  }
})
```

### Filter payments by user email
```typescript
const payments = await db.payment.findMany({
  where: {
    userEmail: 'user@example.com'
  }
})
```

### Admin dashboard queries
```typescript
const cartStats = await db.cart.groupBy({
  by: ['userEmail'],
  _count: {
    id: true
  }
})
```

## Scripts Added

- `npm run db:backfill` - Populate existing records with user data
- `npm run test:user-fields` - Test the new functionality

## Notes

- Fields are optional (`String?`) to handle edge cases gracefully
- Helper functions automatically populate these fields for new records
- Existing API endpoints will continue to work without changes
- Consider making fields required in future versions after ensuring all records are populated