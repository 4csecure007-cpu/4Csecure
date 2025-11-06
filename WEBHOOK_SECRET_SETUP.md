# Stripe Webhook Secret Setup Guide

## Problem
Your payment flow is stuck because the Stripe webhook cannot verify payment events. The `STRIPE_WEBHOOK_SECRET` is missing from Supabase configuration.

---

## Step-by-Step Fix

### Step 1: Get Your Webhook Signing Secret from Stripe

1. Go to **Stripe Dashboard**: https://dashboard.stripe.com/test/webhooks
2. You should see a webhook endpoint listed (created earlier)
   - URL should be: `https://ivyofviouquwxkcrhitw.supabase.co/functions/v1/stripe-webhook`
3. **Click on the webhook endpoint**
4. Look for **"Signing secret"** section
5. Click **"Reveal"** button
6. **Copy the secret** (starts with `whsec_`)

**Example:** `whsec_1234567890abcdefghijklmnopqrstuvwxyz`

---

### Step 2: Add Secret to Supabase

#### Option A: Via Supabase Dashboard (Recommended)

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project (`4cdocs-wvq`)
3. Navigate to **Edge Functions** in the left sidebar
4. Click **"Secrets"** or **"Environment Variables"**
5. Click **"Add new secret"** or **"New variable"**
6. Fill in:
   - **Name:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_...` (paste the secret from Step 1)
7. Click **"Save"** or **"Add"**

#### Option B: Via CLI (if you have Supabase CLI installed)

```bash
cd /Users/apple/Desktop/Hope_projects/4Csecure
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_actual_secret_here
```

---

### Step 3: Verify Webhook Configuration in Stripe

1. Still in **Stripe Dashboard → Webhooks**
2. Click on your webhook endpoint
3. Check **"Events to send"** section
4. Verify that **`checkout.session.completed`** is listed
   - If not, click **"Add events"** → Select **`checkout.session.completed`** → Save

---

### Step 4: Verify Edge Functions are Deployed

1. Go to **Supabase Dashboard → Edge Functions**
2. You should see two functions:
   - ✅ `create-checkout-session`
   - ✅ `stripe-webhook`
3. Both should show recent deployment times

If they're not deployed or show errors, redeploy them:

#### Via Dashboard:
1. Click on each function
2. Verify the code is present
3. Click **"Deploy"** if needed

#### Via CLI:
```bash
supabase functions deploy stripe-webhook
supabase functions deploy create-checkout-session
```

---

### Step 5: Test the Webhook

#### Option 1: Send Test Event from Stripe Dashboard

1. Go to **Stripe Dashboard → Webhooks → Your endpoint**
2. Click **"Send test event"** button
3. Select **"checkout.session.completed"** from dropdown
4. Click **"Send event"**
5. Check the **"Response"** tab:
   - ✅ **200 OK** = Success! Webhook is working
   - ❌ **500 Error** = Secret still not configured or function error
   - ❌ **400 Error** = Signature verification failed

#### Option 2: Make a Real Test Payment

1. Sign up with a new test email (e.g., `test789@gmail.com`)
2. Click **"Pay with Stripe"**
3. Use test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVV: `123`
4. Complete payment
5. You should see:
   - "Verifying payment..." (2-6 seconds)
   - Then redirects to Documents page
   - Documents load successfully

---

### Step 6: Verify Payment Record in Database

1. Go to **Supabase Dashboard → Table Editor**
2. Select **`payments`** table
3. You should see a new row with:
   - `user_id`: Your test user's UUID
   - `payment_status`: `completed`
   - `stripe_payment_intent_id`: `pi_test_...`
   - `amount`: `2999`

---

## Troubleshooting

### Issue: "Still showing Loading... after adding secret"

**Possible causes:**
1. Secret was added but functions weren't redeployed
   - **Fix:** Redeploy both Edge Functions
2. Old browser session is cached
   - **Fix:** Clear browser cache and cookies, sign up with a new email
3. Webhook isn't registered in Stripe
   - **Fix:** Check Step 3 - verify webhook exists and has correct URL

### Issue: "500 Error in Stripe webhook logs"

**Check:**
1. Supabase function logs: `supabase functions logs stripe-webhook`
2. Look for error message (usually about missing secret or database connection)
3. Verify both secrets are set: `STRIPE_SECRET_KEY` AND `STRIPE_WEBHOOK_SECRET`

### Issue: "Payment record not appearing in database"

**Check:**
1. RLS policies are correct (service_role should have full access)
2. Database table exists: Run SQL from `/supabase/migrations/create_payments_table.sql`
3. Webhook event is firing: Check Stripe Dashboard → Webhooks → Events tab

---

## Quick Verification Checklist

- [ ] Webhook secret copied from Stripe Dashboard
- [ ] Secret added to Supabase with name `STRIPE_WEBHOOK_SECRET`
- [ ] Both Edge Functions deployed successfully
- [ ] Webhook endpoint exists in Stripe with correct URL
- [ ] `checkout.session.completed` event is enabled
- [ ] `payments` table exists in Supabase database
- [ ] RLS policies allow service_role to write
- [ ] Test payment completed successfully
- [ ] Payment record appears in database
- [ ] Documents page loads after payment

---

## Expected Flow After Fix

```
1. User signs up → Redirected to /subscription
2. User clicks "Pay with Stripe" → Stripe Checkout loads
3. User enters test card details → Payment succeeds
4. Stripe sends webhook to Supabase → Webhook verifies signature ✓
5. Webhook creates payment record in database ✓
6. User redirected to /documents → Page checks for payment
7. Payment found → Documents load successfully ✓
```

---

## Need Help?

If you're still stuck after following these steps:

1. **Check Supabase Function Logs:**
   ```bash
   supabase functions logs stripe-webhook --limit 50
   ```

2. **Check Stripe Webhook Events:**
   - Go to Stripe Dashboard → Webhooks → Events
   - Look for failed deliveries (red X)
   - Click to see error details

3. **Open Browser Console:**
   - F12 → Console tab
   - Look for error messages
   - Share screenshot if needed

4. **Verify Database:**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT * FROM payments ORDER BY created_at DESC LIMIT 10;
   ```

---

## Summary

The fix is simple but critical:
1. Get `whsec_...` secret from Stripe Dashboard
2. Add it to Supabase as `STRIPE_WEBHOOK_SECRET`
3. Test payment flow

Once the secret is configured, everything else should work automatically!
