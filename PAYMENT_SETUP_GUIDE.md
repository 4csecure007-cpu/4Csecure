# 4Csecure Stripe Payment Setup Guide

## Step 1: Create the Payments Database Table

### Instructions:
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (`4cdocs-wvq`)
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `/supabase/migrations/create_payments_table.sql`
6. Paste into the SQL Editor
7. Click **Run** (or press Ctrl/Cmd + Enter)
8. You should see: ✓ Success message

### What This Creates:
- `payments` table with proper structure
- Row Level Security (RLS) policies
- Indexes for fast lookups
- Auto-updating timestamp trigger
- Unique constraint on `user_id` (one payment per user)

---

## Step 2: Verify Webhook Secret Configuration

### Check if Secret is Set:
1. In Supabase Dashboard, go to **Edge Functions** → **Secrets**
2. Look for `STRIPE_WEBHOOK_SECRET`

### If Missing, Add It:
1. Go to your Stripe Dashboard: https://dashboard.stripe.com
2. Navigate to **Developers** → **Webhooks**
3. Find your webhook endpoint (should be something like):
   ```
   https://ivyofviouquwxkcrhitw.supabase.co/functions/v1/stripe-webhook
   ```
4. Click on the webhook
5. Click **Reveal** next to "Signing secret"
6. Copy the secret (starts with `whsec_...`)
7. Back in Supabase:
   - Go to **Edge Functions** → **Secrets**
   - Add new secret:
     - Name: `STRIPE_WEBHOOK_SECRET`
     - Value: `whsec_...` (paste the secret)
   - Click **Save**

### Alternative: Set Secret via CLI
```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

---

## Step 3: Test the Payment Flow

### Test Card Details:
```
Card Number: 4242 4242 4242 4242
Expiry Date: 12/34 (any future date)
CVV: 123 (any 3 digits)
Name: Test User (any name)
Country: India (any country)
ZIP: 12345 (any valid format)
```

### Testing Steps:
1. **Sign Out** (if logged in)
2. **Sign Up** with a new test email (e.g., `test123@gmail.com`)
3. After Google OAuth, you should be redirected to `/subscription` page
4. Click **"Pay with Stripe"** button
5. You'll be redirected to Stripe Checkout page
6. Fill in the test card details above
7. Click **Pay**
8. You should be redirected to `/documents` page
9. Documents should now be accessible (no more redirect loop)

### Verify Payment Record:
1. Go to Supabase Dashboard → **Table Editor**
2. Select `payments` table
3. You should see a new row with:
   - `user_id`: Your test user's UUID
   - `payment_status`: `completed`
   - `stripe_payment_intent_id`: `pi_...`
   - `amount`: `2999` (cents)

---

## Step 4: Verify Webhook is Working

### Check Stripe Dashboard:
1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click on your webhook
3. Click **Events** tab
4. After test payment, you should see:
   - Event: `checkout.session.completed`
   - Status: ✓ Succeeded (green checkmark)
   - Response code: 200

### If Webhook Failed:
Check the **Response** tab in Stripe webhook event details for error messages.

Common issues:
- `STRIPE_WEBHOOK_SECRET` not set in Supabase
- Webhook endpoint URL incorrect
- Edge Function not deployed
- Database table not created

---

## Troubleshooting

### Issue: "No checkout URL received from server"
**Solution:** Edge Function needs redeployment. Already fixed! ✓

### Issue: Payment successful but user still can't access documents
**Possible causes:**
1. Webhook not firing (check Stripe Dashboard)
2. Webhook secret mismatch
3. Payment record not created in database
4. RLS policy blocking read access

**Debug steps:**
1. Check Supabase **Logs** → **Edge Functions** for webhook errors
2. Check Stripe **Webhooks** → Events for delivery status
3. Check `payments` table in Supabase for the payment record

### Issue: 482 Payment Required Error
This error suggests webhook configuration issue. Verify:
1. Webhook secret is correct
2. Webhook endpoint URL is correct
3. Edge Function is deployed

---

## Complete Flow Diagram

```
User Signs Up (Google OAuth)
    ↓
Redirected to /subscription page
    ↓
Clicks "Pay with Stripe"
    ↓
create-checkout-session Edge Function called
    ↓
Stripe Checkout session created
    ↓
User redirected to Stripe Checkout page
    ↓
User enters test card: 4242 4242 4242 4242
    ↓
Payment processed by Stripe
    ↓
Stripe sends webhook event to stripe-webhook Edge Function
    ↓
Webhook creates/updates record in payments table
    ↓
User redirected to /documents (success_url)
    ↓
Documents.jsx checks payments table
    ↓
Payment found → Access granted ✓
```

---

## Admin Users

Admin users automatically bypass payment check:
- Check `user_roles` table for `role = 'admin'`
- Admins can access documents without payment
- Admins can also upload documents

---

## Production Checklist (Before Going Live)

- [ ] Switch to live Stripe keys (pk_live_... and sk_live_...)
- [ ] Update webhook URL to use live keys
- [ ] Test with real card in live mode
- [ ] Set up proper error handling and user notifications
- [ ] Add email receipts (Stripe can handle this automatically)
- [ ] Consider adding refund handling
- [ ] Add payment history page for users
- [ ] Set up monitoring for failed webhooks

---

## Support

If you encounter issues:
1. Check Supabase Logs → Edge Functions
2. Check Stripe Dashboard → Webhooks → Events
3. Check browser console for errors
4. Verify all environment variables are set correctly

---

## Summary

**What you need to do now:**
1. ✓ Run the SQL script in Supabase SQL Editor
2. ✓ Verify webhook secret is set in Supabase
3. ✓ Test payment with test card: 4242 4242 4242 4242
4. ✓ Verify payment record appears in database
5. ✓ Confirm documents are accessible after payment

Everything is ready - just run the SQL and test! 🚀
