-- ============================================================================
-- UPDATE PAYMENTS TABLE SCHEMA
-- ============================================================================
-- This migration updates the payments table to match the new schema requirements
-- Adds currency field and payment status constraints
-- ============================================================================

-- Add currency column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'currency'
  ) THEN
    ALTER TABLE public.payments
    ADD COLUMN currency TEXT DEFAULT 'usd';
  END IF;
END $$;

-- Update amount column type from BIGINT to INTEGER
-- Note: This is safe because our amounts are in cents and won't exceed INTEGER range
ALTER TABLE public.payments
ALTER COLUMN amount TYPE INTEGER USING amount::INTEGER;

-- Update payment_status column type from VARCHAR to TEXT
ALTER TABLE public.payments
ALTER COLUMN payment_status TYPE TEXT USING payment_status::TEXT;

-- Update stripe_payment_intent_id column type from VARCHAR to TEXT
ALTER TABLE public.payments
ALTER COLUMN stripe_payment_intent_id TYPE TEXT USING stripe_payment_intent_id::TEXT;

-- Update stripe_session_id column type from VARCHAR to TEXT (if exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'stripe_session_id'
  ) THEN
    ALTER TABLE public.payments
    ALTER COLUMN stripe_session_id TYPE TEXT USING stripe_session_id::TEXT;
  END IF;
END $$;

-- Add check constraint for payment_status (only allows: pending, paid, failed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'payments_payment_status_check'
  ) THEN
    ALTER TABLE public.payments
    ADD CONSTRAINT payments_payment_status_check
    CHECK (payment_status = ANY (ARRAY['pending'::TEXT, 'paid'::TEXT, 'failed'::TEXT]));
  END IF;
END $$;

-- Update default for created_at to use timezone('utc', now())
ALTER TABLE public.payments
ALTER COLUMN created_at SET DEFAULT timezone('utc'::TEXT, now());

-- Update default for updated_at to use timezone('utc', now())
ALTER TABLE public.payments
ALTER COLUMN updated_at SET DEFAULT timezone('utc'::TEXT, now());

-- Ensure trigger exists (it should already exist from create_payments_table.sql)
-- But we'll verify it exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_payments_updated_at'
  ) THEN
    CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- You can run these queries to verify the changes:
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'payments'
-- ORDER BY ordinal_position;

-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'public.payments'::regclass;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
