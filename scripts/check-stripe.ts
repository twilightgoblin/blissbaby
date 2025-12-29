import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

async function checkStripeData() {
  try {
    console.log('🔍 Checking Stripe data...\n');

    // Get recent payment intents
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 5,
    });

    console.log(`💳 Recent Payment Intents: ${paymentIntents.data.length}`);
    
    paymentIntents.data.forEach((pi, index) => {
      console.log(`\n${index + 1}. Payment Intent: ${pi.id}`);
      console.log(`   Amount: $${(pi.amount / 100).toFixed(2)} ${pi.currency.toUpperCase()}`);
      console.log(`   Status: ${pi.status}`);
      console.log(`   Created: ${new Date(pi.created * 1000).toLocaleString()}`);
      console.log(`   Metadata:`, pi.metadata);
    });

    // Get account info
    const account = await stripe.accounts.retrieve();
    console.log(`\n🏪 Stripe Account:`);
    console.log(`   ID: ${account.id}`);
    console.log(`   Country: ${account.country}`);
    console.log(`   Default Currency: ${account.default_currency}`);
    console.log(`   Test Mode: ${account.id.includes('test') || process.env.STRIPE_SECRET_KEY?.includes('test')}`);

  } catch (error) {
    console.error('❌ Stripe error:', error);
  }
}

checkStripeData();