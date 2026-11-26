import type { YourAiButton } from "@/data/yourAiCatalog";

type Props = {
  suggestion: YourAiButton;
  onReply: (text: string) => void;
  onGo: (destination: string, suggestion: YourAiButton) => void;
  goLabel: string;
  disabled: boolean;
  className: string;
  style: React.CSSProperties;
  accent: string;
};

export const ConversationSuggestion = ({ suggestion, onReply, onGo, goLabel, disabled, className, style, accent }: Props) => {
  const { label, to } = suggestion;
  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => onReply(label)}
        disabled={disabled}
        className={`${className} disabled:opacity-60`}
        style={style}
      >
        {label}
      </button>
      {to && (
        <button type="button" aria-label={`${goLabel}: ${label}`} onClick={() => onGo(to, suggestion)} className={`${className} !px-2`} style={{ color: accent }}>
          {goLabel}
        </button>
      )}
    </div>
  );
};
