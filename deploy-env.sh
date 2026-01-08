#!/bin/bash

# Script to set environment variables in Vercel
# Run this after installing Vercel CLI: npm i -g vercel

echo "Setting environment variables in Vercel..."

vercel env add DATABASE_URL production
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
vercel env add CLERK_WEBHOOK_SECRET production
vercel env add CLOUDINARY_CLOUD_NAME production
vercel env add CLOUDINARY_API_KEY production
vercel env add CLOUDINARY_API_SECRET production
vercel env add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production

echo "Environment variables set. Now redeploy your app:"
echo "vercel --prod"