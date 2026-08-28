import { useState } from "react";

const CommercialOS = () => {
  const [loaded, setLoaded] = useState(false);
  return (
    <section className="relative h-[100dvh] min-h-[680px] w-full overflow-hidden bg-[#f4f1e9]" aria-label="Commercial OS">
      {!loaded && <div className="absolute inset-0 grid place-items-center text-[#6d7069]" role="status">Opening your commercial ledger…</div>}
      <iframe title="Commercial OS" src="/commercial-os/" className="h-full w-full border-0" onLoad={() => setLoaded(true)} allow="clipboard-write" loading="lazy" />
    </section>
  );
};

export default CommercialOS;
