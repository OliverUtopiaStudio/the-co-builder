-- Migration 013: Normalize agreement/KYC to timestamp in onboarding_status
-- Run in Supabase: SQL Editor → New query → paste this entire file → Run
-- (If your runner injects the file path as a line, that line must be prefixed with -- so it is a comment.)

-- agreementSigned: boolean true → fellow's created_at
UPDATE public.fellows
SET onboarding_status = jsonb_set(
  COALESCE((onboarding_status)::jsonb, '{}'::jsonb),
  '{agreementSigned}',
  to_jsonb(created_at::text)
)
WHERE (onboarding_status->>'agreementSigned') = 'true';

-- agreementSigned: boolean false → null
UPDATE public.fellows
SET onboarding_status = jsonb_set(
  COALESCE((onboarding_status)::jsonb, '{}'::jsonb),
  '{agreementSigned}',
  'null'::jsonb
)
WHERE (onboarding_status->>'agreementSigned') = 'false';

-- kycVerified: boolean true → fellow's created_at
UPDATE public.fellows
SET onboarding_status = jsonb_set(
  COALESCE((onboarding_status)::jsonb, '{}'::jsonb),
  '{kycVerified}',
  to_jsonb(created_at::text)
)
WHERE (onboarding_status->>'kycVerified') = 'true';

-- kycVerified: boolean false → null
UPDATE public.fellows
SET onboarding_status = jsonb_set(
  COALESCE((onboarding_status)::jsonb, '{}'::jsonb),
  '{kycVerified}',
  'null'::jsonb
)
WHERE (onboarding_status->>'kycVerified') = 'false';
