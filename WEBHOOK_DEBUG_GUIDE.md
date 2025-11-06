# Webhook Debugging Guide - Payments Table is Empty

## Problem Summary

✅ Payments table exists with correct schema
✅ Webhook is configured in Stripe with correct URL
✅ Event `checkout.session.completed` is selected
✅ Webhook secret is set in Supabase
❌ **Payments table is completely empty (0 records)**
❌ **Webhook has never successfully created a payment record**

This means the webhook is either:
1. Not firing at all when payments complete
2. Firing but failing silently (returning errors)
3. Firing but unable to write to database (RLS/permissions issue)

---

## Quick Fix: Manual Test Payment Record

To verify your frontend works while we debug the webhook:

### Step 1: Get Your User ID
```sql
-- Run in Supabase SQL Editor
SELECT id, email FROM auth.users WHERE email = '4csecure007@gmail.com';
```

Copy the `id` (UUID) from the result.

### Step 2: Insert Test Payment
```sql
-- Replace <YOUR_USER_ID> with the UUID from Step 1
INSERT INTO public.payments (user_id, payment_status, stripe_payment_intent_id, amount)
VALUES
  ('<YOUR_USER_ID>', 'completed', 'pi_manual_test_123', 2999);
```

### Step 3: Verify
1. Refresh your browser on `/documents` page
2. Page should now load successfully!
3. This confirms frontend payment verification works

---

## Webhook Debugging Steps

### Test 1: Send Test Webhook Event from Stripe

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click on your webhook endpoint (`energetic-voyage`)
3. Click **"Send test event"** button (top right)
4. Select **`checkout.session.completed`** from dropdown
5. Click **"Send event"**
6. **Check the response:**
   - ✅ **200 OK** = Webhook received and processed successfully
   - ❌ **500 Error** = Server error (check Edge Function logs)
   - ❌ **400 Error** = Bad request (signature verification failed)
   - ❌ **Timeout** = Function taking too long or not responding

### Test 2: Check If Payment Record Was Created

After sending the test event:

```sql
-- Run in Supabase SQL Editor
SELECT * FROM public.payments ORDER BY created_at DESC LIMIT 5;
```

**If a record appears:** Webhook is working! The issue was with real payment flow.
**If no record appears:** Webhook failed to write to database (continue debugging below).

### Test 3: Check Stripe Event Delivery Logs

1. In Stripe Dashboard → Webhooks → Your endpoint
2. Click **"Event deliveries"** tab
3. Look for recent `checkout.session.completed` events
4. **If you see events:**
   - Click on an event
   - Check the **"Response"** tab
   - Look for error messages
   - Check HTTP status code

**If you see NO events in the list:** Stripe is not sending webhooks to your endpoint at all.

### Test 4: Check Supabase Edge Function Logs

#### Option A: Via Supabase Dashboard
1. Go to **Supabase Dashboard** → **Edge Functions**
2. Click on **stripe-webhook** function
3. Click **"Logs"** tab
4. Look for recent executions
5. Check for error messages

#### Option B: Via CLI
```bash
cd /Users/apple/Desktop/Hope_projects/4Csecure
supabase functions logs stripe-webhook --limit 50
```

**Look for:**
- `"Webhook event received"` = Good, webhook is being called
- `"STRIPE_WEBHOOK_SECRET not configured"` = Secret not loaded
- `"Error updating payment"` = Database write failed
- `"Signature verification failed"` = Wrong webhook secret

---

## Common Issues and Fixes

### Issue 1: Webhook Returns 500 Error

**Cause:** Edge Function is crashing or throwing an error

**Check:**
```bash
supabase functions logs stripe-webhook
```

**Common reasons:**
- Missing environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- Database connection failed
- RLS policies blocking service_role write

**Fix:**
Verify all secrets are set in Supabase Dashboard → Edge Functions → Secrets:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_URL` (auto-set by Supabase)
- `SUPABASE_SERVICE_ROLE_KEY` (auto-set by Supabase)

### Issue 2: Webhook Returns 400 Error (Signature Verification Failed)

**Cause:** Webhook secret mismatch

**Fix:**
1. Get fresh signing secret from Stripe Dashboard
2. Update in Supabase:
```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_new_secret_here
```
3. Redeploy Edge Function:
```bash
supabase functions deploy stripe-webhook
```

### Issue 3: Webhook Succeeds but No Database Record

**Cause:** RLS policies blocking service_role write or incorrect user_id

**Check RLS policies:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'payments';
```

Should show policy: `"Service role has full access to payments"`

**Check if service_role can write:**
```sql
-- This should work (run as service_role in function)
INSERT INTO public.payments (user_id, payment_status, amount)
VALUES (gen_random_uuid(), 'completed', 2999);
```

If this fails, RLS policy is blocking writes.

**Fix:**
```sql
-- Grant service_role full access
CREATE POLICY "Service role has full access to payments"
  ON public.payments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

### Issue 4: No Events in Stripe Event Deliveries

**Cause:** Webhook endpoint not properly registered or disabled

**Check:**
1. Stripe Dashboard → Webhooks
2. Verify endpoint shows "Active" (not "Disabled")
3. Verify URL is exactly: `https://ivyofviouquwxkcrhitw.supabase.co/functions/v1/stripe-webhook`
4. Verify `checkout.session.completed` is in "Events to send" list

**Fix:**
Re-create the webhook endpoint if needed.

---

## Alternative: Bypass Webhook for Testing

If webhook debugging is taking too long, you can temporarily bypass it:

### Option 1: Create Payment Record After Successful Checkout

Modify `Subscription.jsx` to create payment record directly:

```javascript
// After successful Stripe redirect (in Documents.jsx)
if (user && !paymentRecord) {
  // Create payment record directly
  await supabase.from('payments').upsert({
    user_id: user.id,
    payment_status: 'completed',
    stripe_payment_intent_id: 'manual_' + Date.now(),
    amount: 2999
  })
}
```

### Option 2: Poll Stripe API for Payment Status

Instead of relying on webhook, check Stripe API directly:

```javascript
// In Documents.jsx
const checkStripePayment = async (sessionId) => {
  const response = await fetch('/api/check-payment', {
    method: 'POST',
    body: JSON.stringify({ sessionId })
  })
  return response.json()
}
```

---

## Next Steps

### Immediate Actions:

1. **Insert manual test payment record** (SQL above) to unblock frontend testing
2. **Send test webhook event** from Stripe Dashboard
3. **Check Supabase Edge Function logs** for errors
4. **Check Stripe event delivery logs** for response codes

### If Webhook Still Fails:

1. Check all environment variables in Supabase
2. Verify RLS policies allow service_role writes
3. Redeploy Edge Function
4. Consider temporary bypass solution

### If Everything Checks Out But Still Broken:

The webhook code itself might have an issue. Check:
- `/supabase/functions/stripe-webhook/index.ts`
- Look for any bugs in the upsert logic
- Verify metadata/user_id extraction from Stripe event

---

## Success Criteria

✅ Send test webhook from Stripe → Returns 200 OK
✅ Payment record appears in Supabase payments table
✅ Complete real payment → Webhook fires automatically
✅ Documents page loads without "Loading..." getting stuck

Once all these work, the payment flow is complete!

---

## Files Reference

- Webhook Handler: `/supabase/functions/stripe-webhook/index.ts`
- Payment Table SQL: `/supabase/migrations/create_payments_table.sql`
- Manual Test SQL: `/TEST_PAYMENT_INSERT.sql`
- Documents Payment Check: `/src/pages/user/Documents.jsx`

---

**Start with sending a test webhook event from Stripe Dashboard - that's the fastest way to see if the webhook works at all!**
