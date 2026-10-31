import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { QRCodeCanvas } from "qrcode.react";
import CardActions from "@/components/sharing/CardActions";
import { useToast } from "@/hooks/use-toast";
import type { ShareCard as ShareCardData } from "@/lib/shareCard";
import "./ShareCard.css";

/**
 * ShareCard: name (+ photo), the gift in one sentence, the question, and (for the owner)
 * the link as text and a QR. One component for every share surface.
 * Design: docs/02-strategy/game_of_being_you.md §14.12a, docs/templates/module-form.md §11.
 *
 * `owner`   : the player's own card, with Share, Copy link, Save image.
 * `visitor` : what the player's public page leads with: name, photo, gift, the question.
 * Never level, scores, counts, metrics or prices: the props do not carry them.
 */

type Base = {
    name: string;
    avatarUrl?: string | null;
    /** Null only for a visitor view of a player with no line yet: then the card is name and photo, no question. */
    gift: string | null;
    /** The page's one h1 is the card's name on the public page; elsewhere an h2. */
    heading?: "h1" | "h2";
};

type OwnerProps = Base & { variant: "owner"; card: ShareCardData };
type VisitorProps = Base & { variant: "visitor"; card?: undefined };

const ShareCard = (props: OwnerProps | VisitorProps) => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const cardRef = useRef<HTMLDivElement>(null);
    const Heading = props.heading ?? (props.variant === "visitor" ? "h1" : "h2");
    const owner = props.variant === "owner" ? props.card : null;

    const copy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast({ title: t("shareCard.copied") });
        } catch {
            toast({ title: t("shareCard.copyFailed"), variant: "destructive" });
        }
    };

    const share = async () => {
        if (!owner) return;
        if (typeof navigator.share === "function") {
            try {
                await navigator.share({ text: owner.shareText });
                return;
            } catch (err) {
                // The player closed the sheet: nothing to do. Anything else falls back to copy.
                if (err instanceof DOMException && err.name === "AbortError") return;
            }
        }
        await copy(owner.shareText);
    };

    return (
        <div className="sc" data-variant={props.variant}>
            <div className="sc__card" ref={cardRef}>
                {props.avatarUrl && (
                    <img
                        className="sc__avatar"
                        src={props.avatarUrl}
                        alt=""
                        loading="lazy"
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                        }}
                    />
                )}
                {props.name && <Heading className="sc__name">{props.name}</Heading>}
                {props.gift && (
                    <>
                        <p className="sc__gift">{props.gift}</p>
                        <p className="sc__question">{t("shareCard.question")}</p>
                    </>
                )}
                {owner && (
                    <div className="sc__way">
                        <div className="sc__qr">
                            <QRCodeCanvas value={owner.qrUrl} size={148} bgColor="#ffffff" fgColor="#0a1628" level="M" />
                        </div>
                        <span className="sc__link">{owner.url.replace(/^https?:\/\//, "")}</span>
                    </div>
                )}
            </div>

            {owner && (
                <div className="sc__actions">
                    <button type="button" className="sc__btn" onClick={share}>
                        {t("shareCard.share")}
                    </button>
                    <button type="button" className="sc__btn" onClick={() => copy(owner.url)}>
                        {t("shareCard.copyLink")}
                    </button>
                    <CardActions
                        captureRef={cardRef}
                        fileName="my-share-card"
                        shareText={owner.shareText}
                        captureWidth={390}
                        saveOnly
                    />
                </div>
            )}
        </div>
    );
};

export default ShareCard;
