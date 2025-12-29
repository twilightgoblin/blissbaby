import { db } from '../lib/db';

async function checkDatabase() {
  try {
    console.log('🔍 Checking database contents...\n');

    // Check users
    const userCount = await db.user.count();
    console.log(`👥 Users: ${userCount}`);
    
    if (userCount > 0) {
      const users = await db.user.findMany({
        select: { id: true, email: true, name: true, role: true, createdAt: true }
      });
      console.log('Recent users:', users.slice(0, 3));
    }

    // Check products
    const productCount = await db.product.count();
    console.log(`\n📦 Products: ${productCount}`);
    
    if (productCount > 0) {
      const products = await db.product.findMany({
        take: 3,
        select: { id: true, name: true, price: true, inventory: true }
      });
      console.log('Sample products:', products);
    }

    // Check categories
    const categoryCount = await db.category.count();
    console.log(`\n🏷️  Categories: ${categoryCount}`);
    
    if (categoryCount > 0) {
      const categories = await db.category.findMany({
        select: { id: true, name: true, isActive: true }
      });
      console.log('Categories:', categories);
    }

    // Check carts
    const cartCount = await db.cart.count();
    console.log(`\n🛒 Carts: ${cartCount}`);
    
    if (cartCount > 0) {
      const carts = await db.cart.findMany({
        take: 3,
        include: {
          items: {
            include: {
              product: { select: { name: true, price: true } }
            }
          }
        }
      });
      console.log('Sample carts:', JSON.stringify(carts, null, 2));
    }

    // Check orders
    const orderCount = await db.order.count();
    console.log(`\n📋 Orders: ${orderCount}`);
    
    if (orderCount > 0) {
      const orders = await db.order.findMany({
        take: 3,
        select: { 
          id: true, 
          orderNumber: true, 
          status: true, 
          totalAmount: true, 
          userEmail: true,
          createdAt: true 
        }
      });
      console.log('Recent orders:', orders);
    }

    // Check payments
    const paymentCount = await db.payment.count();
    console.log(`\n💳 Payments: ${paymentCount}`);
    
    if (paymentCount > 0) {
      const payments = await db.payment.findMany({
        take: 3,
        select: { 
          id: true, 
          amount: true, 
          status: true, 
          method: true, 
          provider: true,
          providerPaymentId: true,
          createdAt: true 
        }
      });
      console.log('Recent payments:', payments);
    }

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await db.$disconnect();
  }
}

checkDatabase();