import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * EmptyState - Wabi-sabi styled empty state component
 * Shows when a module has no data yet
 */
const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#a4a3d0]/20 to-[#8460ea]/10 flex items-center justify-center mb-4">
      <span className="text-[#a4a3d0]">{icon}</span>
    </div>
    <h3 className="text-lg font-semibold text-[#2c3150] mb-2">{title}</h3>
    <p className="text-[#a4a3d0] mb-6 max-w-sm">{description}</p>
    {action && (
      <Button variant="wabi-primary" onClick={action.onClick}>
        {action.label}
      </Button>
    )}
  </div>
);

export default EmptyState;
