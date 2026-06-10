/**
 * CelebrationModalListener — Day 80 Wave 2 (Sasha 2026-05-22).
 *
 * Global listener for `fytt:celebrate` custom events. Mounted in App.tsx
 * once, listens for the entire session. Renders CelebrationModal when
 * a primitive save fires.
 *
 * Once-per-primitive enforcement via sessionStorage:
 *   fytt:celebrated:talent       — set after Top Talent modal shown
 *   fytt:celebrated:mission      — set after Mission modal shown
 *   fytt:celebrated:assets       — set after Assets modal shown
 *   fytt:celebrated:graduation   — set after graduation modal shown
 *
 * If the flag is present, the event is silently ignored. Save handlers
 * can still dispatch on every save — the listener decides whether to
 * actually show the modal. Re-saves never re-fire the celebration.
 */

import { useEffect, useState } from "react";
import CelebrationModal, {
    type CelebrationPayload,
} from "./CelebrationModal";

const flagKey = (
    primitive: CelebrationPayload["primitive"],
    variant: CelebrationPayload["variant"],
) =>
    variant === "graduation"
        ? "fytt:celebrated:graduation"
        : `fytt:celebrated:${primitive}`;

const CelebrationModalListener = () => {
    const [payload, setPayload] = useState<CelebrationPayload | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onCelebrate = (e: Event) => {
            const customEvent = e as CustomEvent<CelebrationPayload>;
            const incoming = customEvent.detail;
            if (!incoming || !incoming.primitive || !incoming.variant) {
                return;
            }
            // Day 79 (Sasha 2026-05-22): match-path users never see this
            // modal. Match-path completion surfaces (Top Talent reveal,
            // Mission saved, Assets saved) carry their own inline
            // celebration + unlock copy via MatchFlowCta / AppleseedDisplay,
            // so the modal would stack a second CTA on top of the one
            // already on the page (funnel-monogamy violation) and pull
            // attention out of the recognition moment. Read storage
            // directly inside the handler so the gate evaluates at
            // event-fire time (not at component-mount time, when the
            // entry path may not yet be set).
            try {
                if (typeof window !== "undefined") {
                    const entryPath =
                        window.localStorage?.getItem("ftt_entry_path") ||
                        window.sessionStorage?.getItem("ftt_entry_path");
                    // 2026-06-10 default flip: the match funnel (inline
                    // celebration via MatchFlowCta / AppleseedDisplay) is
                    // the default — suppress this modal for everyone
                    // except explicit ?path=build entries, otherwise the
                    // default flow would stack two CTAs (funnel monogamy).
                    if (entryPath !== "build") return;
                }
            } catch {
                // If storage is unavailable (private browsing), fall
                // through and show the modal — additive UX, not load-bearing.
            }
            // Once-per-flag enforcement
            try {
                const key = flagKey(incoming.primitive, incoming.variant);
                if (typeof window !== "undefined" && window.sessionStorage) {
                    if (window.sessionStorage.getItem(key)) return;
                    window.sessionStorage.setItem(key, new Date().toISOString());
                }
            } catch {
                // If sessionStorage is unavailable (private browsing, etc.),
                // we still show the modal — risk of re-firing on refresh
                // is acceptable since the experience is additive.
            }
            setPayload(incoming);
            setOpen(true);
        };
        window.addEventListener("fytt:celebrate", onCelebrate as EventListener);
        return () => {
            window.removeEventListener(
                "fytt:celebrate",
                onCelebrate as EventListener,
            );
        };
    }, []);

    return (
        <CelebrationModal
            payload={payload}
            open={open}
            onClose={() => setOpen(false)}
        />
    );
};

export default CelebrationModalListener;
