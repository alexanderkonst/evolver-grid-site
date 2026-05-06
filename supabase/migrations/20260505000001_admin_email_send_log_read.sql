-- ╔═══════════════════════════════════════════════════════════════════╗
-- ║  Admin read access for email_send_log — Day 62 Wave 2            ║
-- ║                                                                   ║
-- ║  The /admin "Sent campaigns" tracker reads bulk-send history      ║
-- ║  from email_send_log filtered by template_name='admin_bulk'.      ║
-- ║  Existing policies only allow service_role; this adds an admin    ║
-- ║  SELECT policy so authenticated admins can see campaign history   ║
-- ║  directly (avoids needing a separate edge function for reads).   ║
-- ╚═══════════════════════════════════════════════════════════════════╝

DO $$ BEGIN
  CREATE POLICY "Admins can read send log"
    ON public.email_send_log FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::public.app_role));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON POLICY "Admins can read send log" ON public.email_send_log IS
  'Day 62 (Sasha 2026-05-05): admin /admin Sent-campaigns section reads bulk send history. Service-role policy still applies for edge functions; this is the additive grant for direct client reads from /admin.';
