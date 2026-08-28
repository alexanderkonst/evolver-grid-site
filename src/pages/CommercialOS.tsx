import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const CommercialOS = () => {
  const [loaded, setLoaded] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const sendSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    frameRef.current?.contentWindow?.postMessage({
      type: "commercial-os:token",
      token: data.session?.access_token ?? null,
    }, window.location.origin);
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow || event.data?.type !== "commercial-os:ready") return;
      void sendSession();
    };
    window.addEventListener("message", onMessage);
    const { data: authListener } = supabase.auth.onAuthStateChange(() => { void sendSession(); });
    return () => { window.removeEventListener("message", onMessage); authListener.subscription.unsubscribe(); };
  }, [sendSession]);

  return (
    <section className="relative h-[100dvh] min-h-[680px] w-full overflow-hidden bg-[#f4f1e9]" aria-label="Commercial OS">
      {!loaded && <div className="absolute inset-0 grid place-items-center text-[#6d7069]" role="status">Opening your commercial ledger…</div>}
      <iframe ref={frameRef} title="Commercial OS" src="/commercial-os/" className="h-full w-full border-0" onLoad={() => { setLoaded(true); void sendSession(); }} allow="clipboard-write" loading="lazy" />
    </section>
  );
};

export default CommercialOS;
