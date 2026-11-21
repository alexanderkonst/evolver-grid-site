import { useCallback, useEffect, useRef, useState } from "react";
import type { TouchEvent } from "react";
import { Link } from "react-router-dom";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import ErrorBoundary from "@/components/ErrorBoundary";
import { BOOK_CHAPTERS, BOOK_TITLE } from "@/data/infographicBook";
import type { BookCard, BookChapter } from "@/data/infographicBook";
import "./InfographicBook.css";

/**
 * InfographicBook — the reader for The Book of Psychoactive Infographics, inside the Academy
 * (/game/learn/book). Spec row C4 (docs/02-strategy/game_launch_spec.md), Sasha's yes 2026-11-21.
 *
 * Public: a guest can read it (it is a lead magnet). Content comes from src/data/infographicBook.ts,
 * which follows docs/assets/infographics/BOOK.md. A chapter with cards is a grid; a tap opens
 * the card full-screen with prev/next (buttons, arrow keys, swipe). A chapter still "(to make)"
 * is one quiet row, no empty grid.
 */

const INK = "var(--skin-text-primary, #0a1628)";
const MUTED = "var(--skin-text-muted, rgba(26,30,58,0.7))";
const SWIPE_PX = 50;

interface OpenCard {
  chapter: BookChapter;
  index: number;
}

/** A card image that never shows the browser's broken-image icon: on error it shows the title. */
const CardImage = ({ card, className, eager }: { card: BookCard; className?: string; eager?: boolean }) => {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className={`flex items-center justify-center p-4 text-center text-sm infographic-book-lower ${className ?? ""}`}
        style={{ color: MUTED, background: "rgba(10,22,40,0.05)" }}
      >
        {card.title}
      </div>
    );
  }
  return (
    <img
      src={card.image}
      alt={card.caption ? `${card.title}. ${card.caption}` : card.title}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
      className={className}
    />
  );
};

const CardViewer = ({
  open,
  onClose,
  onStep,
}: {
  open: OpenCard;
  onClose: () => void;
  onStep: (delta: number) => void;
}) => {
  const { chapter, index } = open;
  const card = chapter.cards[index];
  const total = chapter.cards.length;
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  // Arrow keys step; Escape is handled by the dialog itself.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") onStep(-1);
      else if (e.key === "ArrowRight") onStep(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onStep]);

  // Warm the neighbours so stepping does not flash.
  useEffect(() => {
    for (const d of [-1, 1]) {
      const n = chapter.cards[index + d];
      if (n) new Image().src = n.image;
    }
  }, [chapter, index]);

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: TouchEvent) => {
    const s = touchStart.current;
    touchStart.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.5) onStep(dx < 0 ? 1 : -1);
  };

  const navBtn =
    "flex-shrink-0 w-11 h-11 rounded-full inline-flex items-center justify-center text-white bg-white/10 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:opacity-25 disabled:pointer-events-none transition-colors";

  return (
    <DialogPrimitive.Root open onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-modal bg-black/90" />
        <DialogPrimitive.Content
          className="infographic-book-viewer fixed inset-0 z-modal flex flex-col text-white outline-none"
          aria-describedby={undefined}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <DialogPrimitive.Title className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-white/80 infographic-book-lower">
              {chapter.number} · {chapter.title}
            </DialogPrimitive.Title>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-sm tabular-nums text-white/70" aria-live="polite">
                {index + 1} / {total}
              </span>
              <DialogPrimitive.Close className={navBtn} aria-label="Close">
                <X className="w-5 h-5" aria-hidden="true" />
              </DialogPrimitive.Close>
            </div>
          </div>

          <div className="flex-1 min-h-0 flex items-center gap-2 px-2 sm:px-4">
            <button type="button" className={`${navBtn} hidden sm:inline-flex`} onClick={() => onStep(-1)} disabled={index === 0} aria-label="Previous card">
              <ChevronLeft className="w-6 h-6" aria-hidden="true" />
            </button>
            <div className="flex-1 min-w-0 h-full flex items-center justify-center">
              <CardImage key={card.id} card={card} eager className="max-h-full max-w-full w-auto h-auto object-contain select-none rounded-md" />
            </div>
            <button type="button" className={`${navBtn} hidden sm:inline-flex`} onClick={() => onStep(1)} disabled={index === total - 1} aria-label="Next card">
              <ChevronRight className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          <div className="px-4 pt-3 pb-5 text-center">
            <div className="text-base font-semibold infographic-book-lower">{card.title}</div>
            {card.caption && <p className="text-sm text-white/75 mt-1 max-w-xl mx-auto">{card.caption}</p>}
            <div className="flex sm:hidden items-center justify-center gap-6 mt-3">
              <button type="button" className={navBtn} onClick={() => onStep(-1)} disabled={index === 0} aria-label="Previous card">
                <ChevronLeft className="w-6 h-6" aria-hidden="true" />
              </button>
              <button type="button" className={navBtn} onClick={() => onStep(1)} disabled={index === total - 1} aria-label="Next card">
                <ChevronRight className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

const ChapterHeading = ({ chapter }: { chapter: BookChapter }) => {
  const Tag = chapter.depth === 1 ? "h2" : "h3";
  return (
    <Tag
      className={`infographic-book-lower font-semibold tracking-tight ${chapter.depth === 1 ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"}`}
      style={{ color: INK }}
    >
      <span className="tabular-nums mr-2" style={{ color: MUTED }}>
        {chapter.number}
      </span>
      {chapter.title}
    </Tag>
  );
};

const InfographicBookPage = () => {
  const [open, setOpen] = useState<OpenCard | null>(null);

  const step = useCallback((delta: number) => {
    setOpen((cur) => {
      if (!cur) return cur;
      const next = cur.index + delta;
      if (next < 0 || next >= cur.chapter.cards.length) return cur;
      return { ...cur, index: next };
    });
  }, []);
  const close = useCallback(() => setOpen(null), []);

  return (
    <GameShellV2>
      <ErrorBoundary>
        <div className="infographic-book p-6 pb-24 lg:p-10 lg:pb-12 max-w-5xl mx-auto">
          <Link
            to="/game/learn"
            className="inline-flex items-center gap-1.5 text-sm mb-6 rounded-md hover:underline focus-visible:underline"
            style={{ color: MUTED }}
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Academy
          </Link>

          <header className="mb-10">
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.05] infographic-book-lower" style={{ color: INK }}>
              {BOOK_TITLE}
            </h1>
            <p className="mt-3 text-base max-w-xl" style={{ color: MUTED }}>
              The game journey in pictures.
            </p>
          </header>

          <div className="space-y-8">
            {BOOK_CHAPTERS.map((chapter) => (
              <section key={chapter.number} aria-label={`${chapter.number} ${chapter.title}`} className={chapter.depth === 2 ? "sm:pl-6" : ""}>
                {chapter.cards.length > 0 ? (
                  <>
                    <div className="mb-4">
                      <ChapterHeading chapter={chapter} />
                      {chapter.note && (
                        <p className="text-sm mt-1" style={{ color: MUTED }}>
                          {chapter.note}
                        </p>
                      )}
                    </div>
                    <ul className="list-none p-0 m-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {chapter.cards.map((card, i) => (
                        <li key={card.id}>
                          <button
                            type="button"
                            onClick={() => setOpen({ chapter, index: i })}
                            className="group block w-full text-left rounded-xl overflow-hidden bg-white/60 transition-transform hover:scale-[1.015] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none motion-reduce:hover:scale-100"
                            style={{ boxShadow: "0 8px 24px -12px rgba(10, 22, 40, 0.18), 0 0 0 1px rgba(212, 175, 55, 0.22)" }}
                          >
                            <CardImage card={card} className="block w-full aspect-[4/5] object-cover" />
                            <span className="block p-3">
                              <span className="block text-sm font-semibold leading-snug infographic-book-lower" style={{ color: INK }}>
                                {card.title}
                              </span>
                              {card.caption && (
                                <span className="block text-xs mt-1 leading-snug" style={{ color: MUTED }}>
                                  {card.caption}
                                </span>
                              )}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : chapter.coming ? (
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 opacity-70">
                    <ChapterHeading chapter={chapter} />
                    {chapter.note && (
                      <span className="text-sm" style={{ color: MUTED }}>
                        {chapter.note}
                      </span>
                    )}
                    <span className="text-sm italic sm:ml-auto" style={{ color: MUTED }}>
                      coming
                    </span>
                  </div>
                ) : (
                  <div>
                    <ChapterHeading chapter={chapter} />
                    {chapter.note && (
                      <p className="text-sm mt-1" style={{ color: MUTED }}>
                        {chapter.note}
                      </p>
                    )}
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
        {open && <CardViewer open={open} onClose={close} onStep={step} />}
      </ErrorBoundary>
    </GameShellV2>
  );
};

export default InfographicBookPage;
