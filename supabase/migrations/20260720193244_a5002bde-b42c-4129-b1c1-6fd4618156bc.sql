DO $$
DECLARE
  v_key TEXT;
  v_req_id BIGINT;
BEGIN
  SELECT decrypted_secret INTO v_key FROM vault.decrypted_secrets WHERE name='email_queue_service_role_key';
  SELECT net.http_post(
    url := 'https://jypjttotvastdhanwvrx.supabase.co/functions/v1/generate-pulse-brief',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||v_key),
    body := '{"kind":"daily"}'::jsonb,
    timeout_milliseconds := 90000
  ) INTO v_req_id;
  RAISE NOTICE 'pulse request_id=%', v_req_id;
  INSERT INTO public.entitlement_cron_log (reverted_count, error_message, duration_ms)
    VALUES (0, 'pulse-brief-test-req-id='||v_req_id, 0);
END $$;