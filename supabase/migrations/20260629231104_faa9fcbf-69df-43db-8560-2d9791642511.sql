DELETE FROM public.nurture_email_queue WHERE email_type = 'day8';
ALTER TABLE public.nurture_email_queue DROP CONSTRAINT IF EXISTS nurture_email_queue_email_type_check;
ALTER TABLE public.nurture_email_queue ADD CONSTRAINT nurture_email_queue_email_type_check CHECK (email_type IN ('day1','day2'));