# Redeploy Stripe Webhook Function

## What Was Fixed

The webhook was returning **401 Unauthorized** errors because it was missing CORS headers.

**Changes made to `/supabase/functions/stripe-webhook/index.ts`:**
✅ Added CORS headers constant
✅ Added OPTIONS preflight request handler
✅ Added CORS headers to all responses (200, 400, 500)

---

## How to Redeploy

### Option 1: Via Supabase Dashboard (Manual)

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Go to **Edge Functions** in the left sidebar
4. Click on **`stripe-webhook`** function
5. Click **"Edit"** or the code editor icon
6. **Delete all existing code**
7. **Copy the entire contents** of `/supabase/functions/stripe-webhook/index.ts` from your local file
8. **Paste** into the Supabase editor
9. Click **"Deploy"** button (bottom right)
10. Wait for "Successfully deployed" message

### Option 2: Via CLI (Recommended - Faster)

```bash
cd /Users/apple/Desktop/Hope_projects/4Csecure
supabase functions deploy stripe-webhook
```

**If you get an error about not being logged in:**
```bash
supabase login
supabase link --project-ref ivyofviouquwxkcrhitw
supabase functions deploy stripe-webhook
```

---

## After Deployment - Test the Webhook

### Method 1: Trigger Webhook Manually from Stripe

1. Go to **Stripe Dashboard** → **Webhooks** → Your endpoint
2. Close the CLI dialog if it appears
3. Look for **"Send test event"** or **"Test webhook"** button
4. Select **`checkout.session.completed`**
5. Click **Send**
6. **Check the response** - should now be **200 OK** (not 401!)

### Method 2: Complete a Real Test Payment

1. Sign up with a **new test email** (e.g., `test999@gmail.com`)
2. Click **"Pay with Stripe"**
3. Use test card: **4242 4242 4242 4242**, expiry **12/34**, CVV **123**
4. Complete payment
5. You should now be redirected to Documents page
6. Page should load successfully after ~2-6 seconds!

---

## Verify Webhook is Working

### Check 1: Stripe Event Deliveries

1. Go to **Stripe Dashboard** → **Webhooks** → Your endpoint
2. Click **"Event deliveries"** tab
3. Look for recent `checkout.session.completed` events
4. **Status should be:** ✅ **Succeeded** (green checkmark)
5. **Not:** ⭕ **Failed** with 401 error

### Check 2: Supabase Payments Table

1. Go to **Supabase Dashboard** → **Table Editor**
2. Select **`payments`** table
3. You should see a new row with:
   - `user_id`: User's UUID
   - `payment_status`: `completed`
   - `stripe_payment_intent_id`: `pi_test_...`
   - `amount`: `2999`

### Check 3: Documents Page Loads

1. After completing payment
2. Should show **"Verifying payment..."** for 2-6 seconds
3. Then **Documents page loads** successfully
4. No more infinite loading!

---

## If Still Getting 401 Errors

### Double-check the code was deployed:

1. Go to Supabase Dashboard → Edge Functions → stripe-webhook
2. Click to view the code
3. Verify lines 5-9 show:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
```

4. Verify line 17-20 shows:
```typescript
// Handle CORS preflight requests
if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders, status: 200 })
}
```

### If code is correct but still failing:

Try redeploying one more time:
```bash
supabase functions deploy stripe-webhook --no-verify-jwt
```

---

## Expected Results After Fix

Before Fix:
- ❌ Webhook returns 401 Unauthorized
- ❌ Payments table stays empty
- ❌ Documents page stuck on "Loading..."

After Fix:
- ✅ Webhook returns 200 OK
- ✅ Payment records created automatically
- ✅ Documents page loads within 2-6 seconds
- ✅ Complete payment flow works end-to-end!

---

## Summary

1. **Redeploy** the stripe-webhook function (via Dashboard or CLI)
2. **Test** with Stripe test event or real payment
3. **Verify** webhook returns 200 OK in Stripe Dashboard
4. **Confirm** payment record appears in Supabase
5. **Celebrate** when Documents page loads! 🎉

The 401 error should be completely fixed once you redeploy!
