-- 2026-06-29 — Top Talent auth gate consent alignment
-- The product now promises exactly two short follow-up emails after a
-- user saves their result. Remove pending day8 rows and tighten the
-- queue constraint so the database matches that promise.

DELETE FROM public.nurture_email_queue
WHERE email_type = 'day8'
  AND status = 'pending';

ALTER TABLE public.nurture_email_queue
  DROP CONSTRAINT IF EXISTS nurture_email_queue_email_type_check;

ALTER TABLE public.nurture_email_queue
  ADD CONSTRAINT nurture_email_queue_email_type_check
  CHECK (email_type IN ('day1', 'day2'));
