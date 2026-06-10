import { useEffect } from "react";

const ToolsRedirect = () => {
  useEffect(() => {
    window.location.href = "/#modules";
  }, []);

  // Day 91 (Sasha 2026-06-09): tokenized for Aurum — page wash reads --skin-page-bg, falls back to white on lapis
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--skin-page-bg,#ffffff)] text-[rgba(44,49,80,0.7)]">
      Redirecting to tools...
    </div>
  );
};

export default ToolsRedirect;
