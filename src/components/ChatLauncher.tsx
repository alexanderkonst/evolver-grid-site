import { useEffect, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const OPEN_CHAT_EVENT = "fytt:open-chat";

/**
 * The Journey screens (WP-15): title, village, every /game place, Workshop, Mastermind.
 * `/` is the title screen (and, with `?path=`, the pre-game landing: the same corner rule is harmless there).
 */
export const isGameScreenPath = (pathname: string): boolean =>
  pathname === "/" ||
  pathname === "/village" ||
  pathname.startsWith("/village/") ||
  pathname === "/game" ||
  pathname.startsWith("/game/") ||
  pathname === "/ubb" ||
  pathname.startsWith("/ubb/") ||
  pathname === "/build/mastermind" ||
  // #256: the top-talent test is not a Journey screen, but its full-width mobile
  // Continue bar sits on the pill's baseline, so it takes the same corner rule.
  pathname === "/zone-of-genius" ||
  pathname.startsWith("/zone-of-genius/");

const MESSAGE =
  "Hi, I landed on your website and wanted to get in touch.";
const WHATSAPP_NUMBER = "14157073432";

const channelHref = {
  whatsapp: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(MESSAGE)}`,
  telegram: `https://t.me/integralevolution?text=${encodeURIComponent(MESSAGE)}`,
} as const;

type Channel = keyof typeof channelHref;

/**
 * Global, deliberately lightweight contact door.
 *
 * Radix Popover supplies the accessible focus/escape/outside-click behavior;
 * the channels remain native deep links, so there is no third-party chat
 * runtime, tracking script, or new store of visitor messages.
 */
const ChatLauncher = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener(OPEN_CHAT_EVENT, openChat);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, openChat);
  }, []);

  // The quiz's result ceremony is a tall, content-dense single column at
  // 375px — the launcher's fixed bottom-right pill sits directly over the
  // retake link / CTA block there. Suppress it on quiz routes rather than
  // fighting z-index games on every quiz screen. (Visual-only change; the
  // launcher still mounts/behaves identically everywhere else.)
  const isQuizRoute = location.pathname.startsWith("/quiz");

  // Day 188 (Sasha 2026-09-29): /karima is a personal letter sent to
  // named people by warm introduction. A floating "Chat with us" support
  // pill reframes it as a company landing page and undercuts the register
  // the page depends on. The page carries its own contact line.
  const isPersonalLetterRoute = location.pathname.startsWith("/karima");

  const recordChannelChoice = (channel: Channel) => {
    // Feed a standard dataLayer when analytics is present, without making
    // analytics a dependency or allowing it to interrupt the contact action.
    const analyticsWindow = window as Window & {
      dataLayer?: Array<Record<string, unknown>>;
    };
    analyticsWindow.dataLayer?.push({
      event: "chat_channel_selected",
      channel,
      page_path: location.pathname,
    });
    setOpen(false);
  };

  if (isQuizRoute || isPersonalLetterRoute) return null;

  // WP-15: on the Journey screens a phone's primary button sits at the bottom of the column,
  // where the 48px pill would cover it. There the pill tucks into the corner (12px, not 16px)
  // and the screens keep `--chat-clearance` of room under their last control (theme-tokens.css).
  const isGameRoute = isGameScreenPath(location.pathname);

  return (
    <div
      data-game-route={isGameRoute || undefined}
      className={`fixed z-[65] sm:bottom-6 sm:right-6 ${
        isGameRoute
          ? "bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-3"
          : "bottom-[max(1rem,env(safe-area-inset-bottom))] right-4"
      }`}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={t("chatLauncher.title", { defaultValue: "Chat with us" })}
            // WP-1b: every colour is a --chat-* token (theme-tokens.css), so the
            // launcher follows the skin. Lapis / Lunar keep the navy + gold defaults.
            // Phone (<768px): a 48px round icon so it covers no CTA; the name stays in aria-label.
            className="group flex h-12 w-12 min-h-12 items-center justify-center rounded-full border border-[color:var(--chat-border)] bg-[color:var(--chat-bg)] p-0 md:h-auto md:w-auto md:justify-start md:gap-2.5 md:px-4 md:py-3 text-[color:var(--chat-ink)] shadow-[0_12px_40px_rgba(var(--chat-shadow-rgb),0.42),inset_0_1px_0_rgba(var(--chat-sheen-rgb),0.14)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-[color:var(--chat-border-hover)] hover:bg-[color:var(--chat-bg-hover)] hover:shadow-[0_16px_48px_rgba(var(--chat-shadow-rgb),0.5),0_0_20px_rgba(var(--chat-glow-rgb),0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--chat-ring)] focus-visible:ring-offset-2"
          >
            <MessageCircle
              className="h-[19px] w-[19px] text-[color:var(--chat-accent)] transition-transform duration-300 group-hover:scale-105"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <span className="hidden font-sans text-[13px] font-medium tracking-[0.02em] md:inline">
              {t("chatLauncher.title", { defaultValue: "Chat with us" })}
            </span>
          </button>
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="end"
          sideOffset={12}
          className="chat-panel w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[22px] border border-[color:var(--chat-panel-border)] bg-[color:var(--chat-panel-bg)] p-2.5 text-[color:var(--chat-panel-ink)] shadow-[0_24px_70px_rgba(var(--chat-panel-shadow-rgb),0.52),inset_0_1px_0_rgba(var(--chat-sheen-rgb),0.1)]"
        >
          <div className="px-3 pb-2.5 pt-2">
            <p className="font-serif text-[21px] leading-tight">{t("chatLauncher.title", { defaultValue: "Chat with us" })}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-[rgba(var(--chat-panel-ink-rgb),0.55)]">
              {t("chatLauncher.subtitle", { defaultValue: "Choose the channel that feels easiest." })}
            </p>
          </div>

          <div className="grid gap-1.5">
            <a
              href={channelHref.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => recordChannelChoice("whatsapp")}
              className="group flex items-center gap-3 rounded-2xl border border-[rgba(var(--chat-panel-ink-rgb),0.08)] bg-[rgba(var(--chat-panel-ink-rgb),0.045)] px-3.5 py-3.5 transition hover:border-[#69d391]/35 hover:bg-[#69d391]/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69d391]"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#25D366]/15 text-[#7ce6a3]">
                <MessageCircle className="h-[19px] w-[19px]" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium">WhatsApp</span>
                <span className="block text-[11px] text-[rgba(var(--chat-panel-ink-rgb),0.45)]">{t("chatLauncher.whatsappHint", { defaultValue: "Open a private conversation" })}</span>
              </span>
              <span className="text-[rgba(var(--chat-panel-ink-rgb),0.35)] transition group-hover:translate-x-0.5 group-hover:text-[rgba(var(--chat-panel-ink-rgb),0.65)]" aria-hidden="true">→</span>
            </a>

            <a
              href={channelHref.telegram}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => recordChannelChoice("telegram")}
              className="group flex items-center gap-3 rounded-2xl border border-[rgba(var(--chat-panel-ink-rgb),0.08)] bg-[rgba(var(--chat-panel-ink-rgb),0.045)] px-3.5 py-3.5 transition hover:border-[#63b8ef]/35 hover:bg-[#229ED9]/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#63b8ef]"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#229ED9]/15 text-[#73c9f2]">
                <Send className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium">Telegram</span>
                <span className="block text-[11px] text-[rgba(var(--chat-panel-ink-rgb),0.45)]">@integralevolution</span>
              </span>
              <span className="text-[rgba(var(--chat-panel-ink-rgb),0.35)] transition group-hover:translate-x-0.5 group-hover:text-[rgba(var(--chat-panel-ink-rgb),0.65)]" aria-hidden="true">→</span>
            </a>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ChatLauncher;
