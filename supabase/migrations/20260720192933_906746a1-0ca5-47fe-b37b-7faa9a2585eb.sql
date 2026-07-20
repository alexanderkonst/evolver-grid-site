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
    timeout_milliseconds := 60000
  ) INTO v_req_id;
  RAISE NOTICE 'request_id=%', v_req_id;
  PERFORM pg_sleep(45);
END $$;

SELECT id, status_code, content::jsonb->'warnings' AS warnings, left(content, 500) AS content_preview
FROM net._http_response
ORDER BY id DESC
LIMIT 1;