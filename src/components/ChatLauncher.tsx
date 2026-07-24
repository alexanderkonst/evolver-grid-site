import { useEffect, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { useLocation } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const OPEN_CHAT_EVENT = "fytt:open-chat";

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
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener(OPEN_CHAT_EVENT, openChat);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, openChat);
  }, []);

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

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 sm:bottom-6 sm:right-6 z-[65]">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Chat with us"
            className="group flex min-h-12 items-center gap-2.5 rounded-full border border-[#d9b85f]/45 bg-[#08172f]/95 px-4 py-3 text-[#fff8e7] shadow-[0_12px_40px_rgba(2,10,24,0.42),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-[#f0cf72]/75 hover:bg-[#0b2041] hover:shadow-[0_16px_48px_rgba(2,10,24,0.5),0_0_20px_rgba(217,184,95,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0cf72] focus-visible:ring-offset-2"
          >
            <MessageCircle
              className="h-[19px] w-[19px] text-[#efcf77] transition-transform duration-300 group-hover:scale-105"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <span className="font-sans text-[13px] font-medium tracking-[0.02em]">
              Chat with us
            </span>
          </button>
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="end"
          sideOffset={12}
          className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[22px] border border-[#d9b85f]/25 bg-[#08172f] p-2.5 text-[#fff8e7] shadow-[0_24px_70px_rgba(1,8,20,0.52),inset_0_1px_0_rgba(255,255,255,0.1)]"
        >
          <div className="px-3 pb-2.5 pt-2">
            <p className="font-serif text-[21px] leading-tight">Chat with us</p>
            <p className="mt-1 text-[12px] leading-relaxed text-white/55">
              Choose the channel that feels easiest.
            </p>
          </div>

          <div className="grid gap-1.5">
            <a
              href={channelHref.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => recordChannelChoice("whatsapp")}
              className="group flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.045] px-3.5 py-3.5 transition hover:border-[#69d391]/35 hover:bg-[#69d391]/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69d391]"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#25D366]/15 text-[#7ce6a3]">
                <MessageCircle className="h-[19px] w-[19px]" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium">WhatsApp</span>
                <span className="block text-[11px] text-white/45">Open a private conversation</span>
              </span>
              <span className="text-white/35 transition group-hover:translate-x-0.5 group-hover:text-white/65" aria-hidden="true">→</span>
            </a>

            <a
              href={channelHref.telegram}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => recordChannelChoice("telegram")}
              className="group flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.045] px-3.5 py-3.5 transition hover:border-[#63b8ef]/35 hover:bg-[#229ED9]/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#63b8ef]"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#229ED9]/15 text-[#73c9f2]">
                <Send className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium">Telegram</span>
                <span className="block text-[11px] text-white/45">@integralevolution</span>
              </span>
              <span className="text-white/35 transition group-hover:translate-x-0.5 group-hover:text-white/65" aria-hidden="true">→</span>
            </a>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ChatLauncher;
