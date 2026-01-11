import { useEffect } from "react";

const ToolsRedirect = () => {
  useEffect(() => {
    window.location.href = "/#modules";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-slate-600">
      Redirecting to tools...
    </div>
  );
};

export default ToolsRedirect;
