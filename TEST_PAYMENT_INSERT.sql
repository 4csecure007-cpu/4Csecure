-- ============================================================================
-- MANUAL TEST PAYMENT INSERTION
-- ============================================================================
-- This script manually inserts a test payment record to verify the Documents
-- page works correctly while we debug the webhook issue
-- ============================================================================

-- IMPORTANT: You need to replace <USER_ID> with your actual user ID
-- To get your user ID, run this query first:

SELECT id, email FROM auth.users WHERE email = '4csecure007@gmail.com';

-- Copy the UUID from the result, then run the INSERT below with that UUID

-- ============================================================================
-- INSERT TEST PAYMENT RECORD
-- ============================================================================

-- Replace <YOUR_USER_ID_HERE> with the actual UUID from the query above
INSERT INTO public.payments (user_id, payment_status, stripe_payment_intent_id, amount, created_at)
VALUES
  ('<YOUR_USER_ID_HERE>', 'completed', 'pi_manual_test_123456', 2999, NOW())
ON CONFLICT (user_id)
DO UPDATE SET
  payment_status = 'completed',
  stripe_payment_intent_id = 'pi_manual_test_123456',
  amount = 2999,
  updated_at = NOW();

-- ============================================================================
-- VERIFY THE RECORD WAS CREATED
-- ============================================================================

SELECT * FROM public.payments WHERE user_id = '<YOUR_USER_ID_HERE>';

-- ============================================================================
-- AFTER RUNNING THIS:
-- ============================================================================
-- 1. Refresh your browser on the /documents page
-- 2. The page should now load successfully
-- 3. This confirms the frontend payment verification works
-- 4. Then we can focus on fixing the webhook issue separately
-- ============================================================================
