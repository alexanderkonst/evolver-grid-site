import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSessionUserId } from "@/hooks/useSessionUserId";
import { threadPath } from "@/lib/playerMessages";

interface WriteButtonProps {
  /** The player to write to (their auth user id). */
  recipientUserId: string | null | undefined;
  size?: "default" | "sm";
  variant?: "default" | "outline";
  className?: string;
}

/**
 * "Write" (spec A6): opens the 1:1 thread with a player. Signed-in players go straight to the
 * thread; guests see the button and are sent to sign in, then land on the same thread.
 * Renders nothing for the player's own profile.
 */
const WriteButton = ({ recipientUserId, size = "default", variant = "default", className }: WriteButtonProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const viewerId = useSessionUserId();

  if (!recipientUserId || viewerId === recipientUserId) return null;

  const target = threadPath(recipientUserId);
  const handleClick = () => {
    if (viewerId) {
      navigate(target);
    } else {
      navigate(`/auth?redirect=${encodeURIComponent(target)}`);
    }
  };

  return (
    <Button type="button" size={size} variant={variant} className={className} onClick={handleClick}>
      <MessageCircle className="w-4 h-4 mr-1.5" />
      {t("messages.write")}
    </Button>
  );
};

export default WriteButton;
