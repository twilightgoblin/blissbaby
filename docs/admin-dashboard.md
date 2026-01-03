# Admin Dashboard - Real-time Analytics

## Overview
The admin dashboard displays real-time analytics and data for your e-commerce store, integrating with your database and Stripe for accurate financial data. It automatically updates every 30 seconds.

## Features

### 📊 Real-time Analytics
- **Live Updates**: Dashboard refreshes every 30 seconds automatically
- **Manual Refresh**: Click the refresh button for instant updates
- **Live Indicator**: Green pulsing dot shows the dashboard is live
- **Last Updated**: Timestamp shows when data was last refreshed

### 📈 Key Metrics
1. **Total Revenue**: Sum of all completed Stripe payments
2. **Total Orders**: Count of all orders in the system
3. **Products**: Number of active products
4. **Customers**: Unique customer count

### 📋 Dashboard Sections

#### Revenue Overview
- Line chart showing monthly revenue from completed payments
- Data sourced from Stripe and database payments
- Interactive tooltips with formatted currency values
- Uses website color scheme (soft pink primary)

#### Top Products
- Best-selling products by quantity and revenue
- Shows sales count and total revenue per product
- Ranked list with visual indicators
- Uses chart-1 color from website theme

#### Sales by Category
- Bar chart showing performance by product category
- Interactive tooltips showing sales numbers
- Styled with website colors and soft opacity
- Helps identify top-performing categories

#### Recent Orders
- **Limited to 3 most recent orders** for focused view
- Real-time updates with order status badges
- Customer information and order amounts
- Includes payment status from Stripe integration

### 🔄 Real-time Features

#### Auto-refresh
- Polls the API every 30 seconds for new data
- Maintains user experience without interruption
- Shows loading states during refresh

#### New Order Notifications
- Toast notifications when new orders are detected
- Shows count of new orders received
- Helps admin stay informed of business activity

#### Live Status Indicator
- Green pulsing dot indicates live connection
- Visual confirmation that data is current

### 💳 Stripe Integration

#### Payment Data
- Revenue calculations based on completed Stripe payments
- Real-time payment status verification
- Fallback to database if Stripe is unavailable
- Monthly revenue trends from actual payments

#### Data Accuracy
- Cross-references database orders with Stripe payments
- Ensures revenue figures reflect actual received payments
- Handles payment failures and refunds appropriately

### 🎨 UI/UX Features

#### Website Color Scheme
- Uses soft pink primary color (`oklch(0.72 0.09 350)`)
- Chart colors match website theme (chart-1, chart-2, etc.)
- Consistent with baby-friendly brand colors
- Professional pastel palette throughout

#### Responsive Design
- Works on desktop, tablet, and mobile
- Adaptive grid layouts
- Touch-friendly controls

#### Loading States
- Skeleton loading for initial data fetch
- Smooth transitions and animations
- Professional loading indicators

## API Endpoints

### `/api/admin/analytics`
Returns comprehensive dashboard data including:
- Statistics with trend indicators
- Revenue data from Stripe payments
- Category performance metrics
- Recent orders list (limited to 3)
- Top products ranking

### `/api/admin/dashboard-status`
Provides system status information:
- Data counts (products, orders, categories)
- Sample data for verification
- Health check information

## Technical Implementation

### Real-time Updates
- Uses `setInterval` for polling every 30 seconds
- Automatic cleanup on component unmount
- Optimistic updates for better UX

### Data Sources
- **Orders**: PostgreSQL database
- **Payments**: Stripe API + database payments table
- **Products**: Database with active status filter
- **Analytics**: Calculated from real transaction data

### Performance Optimizations
- Efficient database queries with proper indexing
- Minimal API calls with comprehensive data fetching
- Proper loading states and error handling

## Usage Tips

1. **Monitor Live**: Keep dashboard open for real-time business monitoring
2. **Check Trends**: Review monthly revenue trends for business insights
3. **Track Products**: Monitor top products to optimize inventory
4. **Payment Status**: Verify order payments through Stripe integration
5. **Recent Focus**: Focus on 3 most recent orders for immediate attention

## Data Accuracy

- Revenue figures reflect actual Stripe payments received
- Order counts include all orders regardless of payment status
- Product rankings based on actual sales data
- Customer counts from unique order placements
- Monthly trends from completed payment transactions