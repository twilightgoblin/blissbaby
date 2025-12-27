# Stripe Integration Setup Guide

## 1. Get Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create an account or log in
3. Navigate to **Developers > API keys**
4. Copy your **Publishable key** and **Secret key**

## 2. Update Environment Variables

Update your `.env` file with your actual Stripe keys:

```env
# Replace with your actual Stripe keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_actual_publishable_key_here"
STRIPE_SECRET_KEY="sk_test_your_actual_secret_key_here"
```

## 3. Set Up Webhooks (Optional but Recommended)

1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** and add to `.env`:

```env
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
```

## 4. Test the Integration

1. Start your development server: `npm run dev`
2. Add items to cart
3. Go to checkout: `http://localhost:3000/checkout`
4. Use Stripe test card numbers for India:
   - **Success**: `4000 0035 6000 0008` (India Visa)
   - **Success**: `5555 5555 5555 4444` (Mastercard)
   - **Decline**: `4000 0000 0000 0002`
   - Use any future expiry date and any 3-digit CVC

## 5. Features Included

✅ **Secure Payment Processing** - Powered by Stripe Elements
✅ **Real Cart Integration** - Connects with your existing cart system
✅ **Order Creation** - Automatically creates orders in your database
✅ **Payment Records** - Tracks all payment attempts and statuses
✅ **Webhook Handling** - Processes Stripe events securely
✅ **Tax Calculation** - Includes 8% tax calculation
✅ **Address Collection** - Shipping and billing address forms
✅ **Mobile Responsive** - Works great on all devices
✅ **Error Handling** - Comprehensive error handling and user feedback

## 6. Going Live

When ready for production:

1. Replace test keys with live keys from Stripe Dashboard
2. Update webhook endpoint to your production domain
3. Test thoroughly with small amounts first
4. Set up proper error monitoring and logging

## 7. Customization Options

- **Tax Rate**: Update in `app/checkout/page.tsx` (currently 8%)
- **Currency**: Currently set to INR (Indian Rupees)
- **Payment Methods**: Configure in Stripe Dashboard
- **Styling**: Customize the checkout form components
- **Country**: Currently set to India (IN) for address collection

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify your Stripe keys are correct
3. Ensure webhooks are properly configured
4. Check the Stripe Dashboard for payment logs