import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProfileSummaryCardProps {
  icon: ReactNode;
  title: string;
  actionLabel: ReactNode;
  actionTo: string;
  className?: string;
  children: ReactNode;
}

const ProfileSummaryCard = ({
  icon,
  title,
  actionLabel,
  actionTo,
  className,
  children,
}: ProfileSummaryCardProps) => (
  <div className={cn("rounded-xl border border-[#a4a3d0]/30 bg-gradient-to-br from-[#e7e9e5] to-[#dcdde2] p-5", className)}>
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 text-[#8460ea] mb-2">
          {icon}
          <h3 className="font-semibold">{title}</h3>
        </div>
        {children}
      </div>
      <Button asChild variant="wabi-ghost" size="sm">
        <Link to={actionTo}>
          {actionLabel}
        </Link>
      </Button>
    </div>
  </div>
);

export default ProfileSummaryCard;
