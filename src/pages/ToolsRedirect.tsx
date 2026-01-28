import { useEffect } from "react";

const ToolsRedirect = () => {
  useEffect(() => {
    window.location.href = "/#modules";
  }, []);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-white text-[rgba(44,49,80,0.7)]">
      Redirecting to tools...
    </div>
  );
};

export default ToolsRedirect;
