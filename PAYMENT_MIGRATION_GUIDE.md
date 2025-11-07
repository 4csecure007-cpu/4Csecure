# Payment Table Migration Guide

## What Was Updated

Payment data storage system ko complete kar diya gaya hai. Ab jab bhi payment hoti hai, ye data store hoga:

### Updated Schema Fields:
- `id` - UUID (auto-generated)
- `user_id` - User ka Supabase auth ID
- `payment_status` - 'pending', 'paid', ya 'failed' (constraint added)
- `stripe_payment_intent_id` - Stripe Payment Intent ID
- `stripe_session_id` - Stripe Checkout Session ID
- `amount` - Payment amount in cents (INTEGER type)
- `currency` - Currency code (default: 'usd') **[NEW]**
- `created_at` - Payment creation timestamp
- `updated_at` - Auto-updated on record changes

### Updated Files:
1. **Database Migration**: `supabase/migrations/20250107000000_update_payments_schema.sql`
2. **Webhook Handler**: `supabase/functions/stripe-webhook/index.ts`
3. **Verify Handler**: `supabase/functions/verify-payment-session/index.ts`

## How to Deploy

### Option 1: Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID

2. **Run Migration**
   - Click on **SQL Editor** in left sidebar
   - Click **New Query**
   - Copy-paste contents of: `supabase/migrations/20250107000000_update_payments_schema.sql`
   - Click **Run** button

3. **Deploy Edge Functions**
   ```bash
   cd "/Users/apple/Downloads/4Csecure 2"

   # Deploy webhook handler
   npx supabase functions deploy stripe-webhook

   # Deploy verify-payment handler
   npx supabase functions deploy verify-payment-session
   ```

### Option 2: Supabase CLI (If Docker Running)

```bash
cd "/Users/apple/Downloads/4Csecure 2"

# Start Supabase locally
npx supabase start

# Apply migration
npx supabase db push

# Deploy functions
npx supabase functions deploy stripe-webhook
npx supabase functions deploy verify-payment-session
```

## Verification

After deployment, test payment storage:

### 1. Make a Test Payment
- Go to your app's subscription page
- Click "Pay with Stripe"
- Use Stripe test card: `4242 4242 4242 4242`
- Complete payment

### 2. Check Database
Run this query in Supabase SQL Editor:

```sql
SELECT
  id,
  user_id,
  payment_status,
  stripe_payment_intent_id,
  stripe_session_id,
  amount,
  currency,
  created_at,
  updated_at
FROM public.payments
ORDER BY created_at DESC
LIMIT 5;
```

### Expected Result:
```
id: <uuid>
user_id: <user_uuid>
payment_status: paid
stripe_payment_intent_id: pi_xxxxx
stripe_session_id: cs_xxxxx
amount: 2999
currency: usd
created_at: 2025-01-07 ...
updated_at: 2025-01-07 ...
```

## What Changed in Payment Flow

### Before:
- Webhook handler: Stored only `user_id`, `payment_status` ('completed'), `stripe_payment_intent_id`, `amount`
- Verify handler: Stored `user_id`, `payment_status` ('paid'), `stripe_payment_intent_id`, `stripe_session_id`, `amount`
- **Inconsistent data** between handlers

### After:
- **Both handlers** now store: `user_id`, `payment_status` ('paid'), `stripe_payment_intent_id`, `stripe_session_id`, `amount`, **`currency`**
- **Consistent** payment status ('paid' instead of 'completed')
- **Complete** session tracking with session_id
- **Currency** support for future international payments

## Troubleshooting

### Migration fails with "column already exists"
- Safe to ignore - migration uses `IF NOT EXISTS` checks
- Column won't be duplicated

### Edge function deployment fails
- Ensure you're logged in: `npx supabase login`
- Check project is linked: `npx supabase link --project-ref YOUR_PROJECT_ID`
- Verify environment variables are set in Supabase Dashboard

### Payment data not storing
1. Check webhook is configured in Stripe Dashboard
2. Verify `STRIPE_WEBHOOK_SECRET` is set in Supabase Edge Functions
3. Check function logs: Supabase Dashboard > Edge Functions > Logs
4. Ensure RLS policies allow service role to write

## Next Steps

1. **Deploy the migration** using Option 1 above
2. **Deploy the updated Edge Functions**
3. **Test payment flow** to verify data storage
4. **Monitor function logs** for any errors

---

**Status**: Ready to deploy
**Created**: 2025-01-07
**Migration File**: `supabase/migrations/20250107000000_update_payments_schema.sql`
