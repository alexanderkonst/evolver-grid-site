-- ============================================================================
-- Fix Sergey Jay Makarov's testimonial: 20260328_single_source_of_truth.sql
-- copy-pasted Sandra Otto's full_quote into his row (both expanded to the
-- identical "I knew, I just knew..." passage in production). Restores his
-- own quote, matching the (already-correct) src/data/testimonials.ts
-- fallback. Sandra's row is untouched.
-- ============================================================================

UPDATE public.testimonials
SET full_quote = 'I was applying force, but the vector was wrong. The structure is genius. I was 100% inside your structure and never felt the need to change the methodology. You stepped me right into a zone of new knowledge. Myth was the missing piece. I knew nothing about this. Everything starts aligning. This is like a ten, nine-plus. There''s nothing here that doesn''t click. Absolutely everything clicks. I feel enormous value. I''m ready to call you every other day and keep working. Testimonials, surveys — in whatever form you need, I''ll do it all.',
    updated_at = now()
WHERE person_name = 'Sergey Jay Makarov'
  AND surface = 'ignite';
