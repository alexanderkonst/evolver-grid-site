import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, MapIcon, Target, Boxes, Users, History as HistoryIcon, ChevronDown, ChevronUp } from "lucide-react";
import { formatDate } from "@/i18n/format";
import type { HistoryEvent, HistoryEventKind } from "@/modules/profile-space/types";
import { cardShell, ceremonialPill, cormorantTitle, labelMuted, sourceSerifBody } from "./styles";

interface HistoryTimelineProps {
    events: HistoryEvent[];
}

const KIND_ICON: Record<HistoryEventKind, typeof Sparkles> = {
    zog: Sparkles,
    qol: MapIcon,
    mission: Target,
    asset: Boxes,
    request: Users,
};

const VISIBLE_COUNT = 5;

const HistoryTimeline = ({ events }: HistoryTimelineProps) => {
    const { t } = useTranslation();
    const [showAll, setShowAll] = useState(false);
    const hasEvents = events.length > 0;
    const visibleEvents = showAll ? events : events.slice(0, VISIBLE_COUNT);

    return (
        <section style={cardShell}>
            <div className="flex items-center gap-2 mb-3">
                <HistoryIcon className="w-4 h-4" style={{ color: "var(--skin-accent-gold, #b8860b)" }} />
                <h2 style={{ ...cormorantTitle, fontSize: "18px", fontWeight: 600 }}>
                    {t("profileSpace.history.title")}
                </h2>
            </div>

            {hasEvents ? (
                <div className="space-y-3">
                    <ol className="space-y-3">
                        {visibleEvents.map((event, i) => {
                            const Icon = KIND_ICON[event.kind];
                            return (
                                <li key={`${event.kind}-${event.date}-${i}`} className="flex items-start gap-3">
                                    <div
                                        className="mt-0.5 w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center"
                                        style={{
                                            background: "rgba(212, 175, 55, 0.10)",
                                            border: "0.5px solid rgba(212, 175, 55, 0.30)",
                                        }}
                                    >
                                        <Icon className="w-3.5 h-3.5" style={{ color: "var(--skin-goldDeep, #5d4307)" }} />
                                    </div>
                                    <div className="min-w-0">
                                        <p style={{ ...sourceSerifBody, fontSize: "14px" }}>
                                            {t(event.titleKey)}
                                            {event.changeLine ? (
                                                <span style={{ fontWeight: 400 }}> — {event.changeLine}</span>
                                            ) : null}
                                        </p>
                                        <p style={{ ...labelMuted, textTransform: "none", letterSpacing: "0.02em", fontSize: "11.5px" }}>
                                            {formatDate(event.date, { month: "short", day: "numeric", year: "numeric" })}
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                    {events.length > VISIBLE_COUNT && (
                        <div className="flex justify-center pt-1">
                            <button
                                onClick={() => setShowAll((prev) => !prev)}
                                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 transition-all duration-200 hover:translate-y-[-0.5px]"
                                style={ceremonialPill}
                            >
                                {showAll ? t("profileSpace.history.showLess") : t("profileSpace.history.showAll")}
                                {showAll ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-4">
                    <p className="italic" style={{ ...sourceSerifBody, fontStyle: "italic", fontSize: "14px", lineHeight: 1.55 }}>
                        {t("profileSpace.history.emptyLine")}
                    </p>
                </div>
            )}
        </section>
    );
};

export default HistoryTimeline;
