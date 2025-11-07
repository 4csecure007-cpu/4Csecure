# Stripe Integration Setup Guide

## Overview
This guide will help you complete the Stripe payment integration for the 4C Management subscription page.

## ✅ Completed Steps

1. ✅ Added Stripe keys to `.env` file
2. ✅ Updated Subscription.jsx with Stripe Checkout logic
3. ✅ Created Supabase Edge Functions:
   - `create-checkout-session` - Creates Stripe Checkout sessions
   - `stripe-webhook` - Handles payment confirmations

## 📋 Steps to Complete Integration

### Step 1: Deploy Supabase Edge Functions

You need to deploy the Edge Functions to Supabase. Run these commands:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref ivyofviouquwxkcrhitw

# Set required secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY_HERE
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Deploy the functions
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

### Step 2: Configure Stripe Webhook

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/test/webhooks
2. **Click "Add endpoint"**
3. **Enter webhook URL**:
   ```
   https://ivyofviouquwxkcrhitw.supabase.co/functions/v1/stripe-webhook
   ```
4. **Select events to listen to**:
   - `checkout.session.completed`
5. **Click "Add endpoint"**
6. **Copy the Signing Secret** (starts with `whsec_`)
7. **Update the secret** in Supabase:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_SECRET
   ```

### Step 3: Test the Integration

1. **Start your dev server** (if not running):
   ```bash
   npm run dev
   ```

2. **Sign in as a user** and go to `/subscription`

3. **Click "Pay with Stripe"** button

4. **Use Stripe test card**:
   - Card Number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

5. **Complete payment** - You should be redirected to `/documents`

6. **Check Supabase** - Payment record should be created in `payments` table

### Step 4: Verify Payment Status (Optional Future Enhancement)

To enforce payment before document access, you can update the ProtectedRoute:

```javascript
// Check if user has paid
const { data: payment } = await supabase
  .from('payments')
  .select('payment_status')
  .eq('user_id', user.id)
  .eq('payment_status', 'completed')
  .single()

if (!payment && !isAdmin) {
  return <Navigate to="/subscription" />
}
```

## 🔍 Troubleshooting

### Issue: "Function not found"
- Make sure you deployed the functions: `supabase functions deploy`
- Check function logs: `supabase functions logs create-checkout-session`

### Issue: "Webhook signature verification failed"
- Verify you set the correct webhook secret
- Check Stripe Dashboard webhook logs

### Issue: "Payment record not created"
- Check webhook is receiving events in Stripe Dashboard
- View Edge Function logs: `supabase functions logs stripe-webhook`
- Verify `payments` table exists with correct structure

## 📝 Environment Variables

Make sure your `.env` file has:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

And Supabase secrets are set:
```bash
supabase secrets list
```

Should show:
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET

## 🎉 Going Live (Production)

When ready for production:

1. Replace test keys with live keys:
   - `pk_live_...` in `.env`
   - `sk_live_...` in Supabase secrets

2. Update webhook URL to production domain

3. Test with small real payment first

4. Enable Stripe Radar for fraud protection

## 📧 Support

If you encounter issues:
- Check Stripe Dashboard logs
- Check Supabase Edge Function logs
- Review browser console for errors
