/**
 * /join/collective/:code — the Collective invite page (WP2).
 * Spec: docs/specs/collective/build_spec.md (v0.2) → WP2; approved by Sasha 2026-11-25 (S1).
 *
 * Flow:
 *   dead link (invalid / used / expired) → one calm screen, link home
 *   signed out, link good               → /auth?redirect=<this route>, the same mechanism
 *                                          RequireAuth uses; Auth.tsx is not changed
 *   signed in                           → redeem → four-field profile → the Collective
 *
 * The page renders outside the game shell (bare Outlet, see lib/shellRoutes.ts), so the
 * onboarding redirect in GameShellV2 never sees a new member on this route: no title, intro
 * or reveals in between.
 */
import { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MoonNotice from "@/components/game/MoonNotice";
import { supabase } from "@/integrations/supabase/client";
import { collectiveJoinText } from "@/data/collectiveJoinCopy";
import {
  PROFILE_LIMITS,
  authPathForInvite,
  buildProfileRow,
  checkCollectiveInvite,
  collectiveLandingPath,
  inviteFailure,
  loadOwnCollectiveProfile,
  looksLikeInviteCode,
  redeemCollectiveInvite,
  saveCollectiveProfile,
  type CollectiveProfileInput,
  type InviteFailure,
} from "@/lib/collectiveInvites";

type View =
  | { kind: "checking" }
  | { kind: "dead"; reason: InviteFailure }
  | { kind: "error" }
  | { kind: "signin" }
  | { kind: "profile"; userId: string; initial: CollectiveProfileInput };

const INK = "#e6ebf2";
const MOONLIGHT = "#d9d1b4";
const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
const MONO = '"IBM Plex Mono", "JetBrains Mono", ui-monospace, monospace';

const pageStyle: React.CSSProperties = {
  minHeight: "100dvh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 20px",
  background: "radial-gradient(ellipse at 50% 0%, #14213a 0%, #0a0f1a 62%)",
  color: INK,
  fontFamily: SERIF,
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: 16, // 16px keeps iOS from zooming the page on focus
  color: INK,
  background: "rgba(255,255,255,0.06)",
  border: `1px solid rgba(217,209,180,0.35)`,
  borderRadius: 6,
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 6,
  fontFamily: MONO,
  fontWeight: 300,
  fontSize: 12,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: MOONLIGHT,
};

const JoinCollective = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "en";
  const text = useCallback((key: Parameters<typeof collectiveJoinText>[0]) => collectiveJoinText(key, lang), [lang]);

  const [view, setView] = useState<View>({ kind: "checking" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let live = true;
    const run = async () => {
      setView({ kind: "checking" });
      if (!looksLikeInviteCode(code)) {
        setView({ kind: "dead", reason: "invalid" });
        return;
      }
      try {
        const { data } = await supabase.auth.getSession();
        const userId = data.session?.user.id;

        if (!userId) {
          // Signed out: say «expired» before asking anyone to sign up, otherwise send them to the
          // existing sign-up / sign-in and come back here.
          const status = await checkCollectiveInvite(code);
          if (!live) return;
          const failure = inviteFailure(status);
          setView(failure ? { kind: "dead", reason: failure } : { kind: "signin" });
          return;
        }

        // Signed in: redeem. A member who reloads this page gets `already_member`, which is not
        // a failure: they carry on to their profile.
        const status = await redeemCollectiveInvite(code);
        if (!live) return;
        const failure = inviteFailure(status);
        if (failure) {
          setView({ kind: "dead", reason: failure });
          return;
        }
        const initial = await loadOwnCollectiveProfile(userId).catch(() => ({
          uniquenessLine: "",
          offers: "",
          seeks: "",
          siteUrl: "",
        }));
        if (live) setView({ kind: "profile", userId, initial });
      } catch (e) {
        console.error("collective invite failed:", e);
        if (live) setView({ kind: "error" });
      }
    };
    void run();
    return () => {
      live = false;
    };
  }, [code, attempt]);

  if (view.kind === "signin" && code) {
    return <Navigate to={authPathForInvite(code)} replace />;
  }

  if (view.kind === "checking" || view.kind === "signin") {
    return (
      <main style={{ ...pageStyle, justifyContent: "center", textAlign: "center" }} aria-busy="true">
        <p style={{ fontStyle: "italic", fontWeight: 300, fontSize: 20, opacity: 0.85 }}>{text("checking")}</p>
      </main>
    );
  }

  if (view.kind === "dead") {
    const titleKey = view.reason === "used" ? "usedTitle" : view.reason === "expired" ? "expiredTitle" : "invalidTitle";
    return (
      <MoonNotice
        eyebrow="Collective"
        title={text(titleKey)}
        line={text("deadBody")}
        primary={{ to: "/", label: text("home") }}
      />
    );
  }

  if (view.kind === "error") {
    return (
      <MoonNotice eyebrow="Collective" title={text("errorTitle")} line={text("errorBody")} primary={{ to: "/", label: text("home") }}>
        <button
          type="button"
          onClick={() => setAttempt((n) => n + 1)}
          style={{
            marginTop: 24,
            minHeight: 44,
            padding: "0 24px",
            background: "none",
            border: `1px solid ${MOONLIGHT}`,
            color: INK,
            fontFamily: MONO,
            fontWeight: 300,
            fontSize: 13,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          {text("retry")}
        </button>
      </MoonNotice>
    );
  }

  return (
    <ProfileForm
      userId={view.userId}
      initial={view.initial}
      text={text}
      onDone={() => navigate(collectiveLandingPath(), { replace: true })}
    />
  );
};

interface ProfileFormProps {
  userId: string;
  initial: CollectiveProfileInput;
  text: (key: Parameters<typeof collectiveJoinText>[0]) => string;
  onDone: () => void;
}

const ProfileForm = ({ userId, initial, text, onDone }: ProfileFormProps) => {
  const [values, setValues] = useState<CollectiveProfileInput>(initial);
  const [error, setError] = useState<null | "uniquenessRequired" | "siteInvalid" | "saveFailed">(null);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof CollectiveProfileInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const built = buildProfileRow(values);
    if ("error" in built) {
      setError(built.error);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveCollectiveProfile(userId, built.row);
      onDone();
    } catch (err) {
      console.error("collective profile save failed:", err);
      setError("saveFailed");
      setSaving(false);
    }
  };

  return (
    <main style={pageStyle}>
      <form onSubmit={submit} noValidate style={{ width: "100%", maxWidth: 520 }}>
        <h1 style={{ margin: 0, fontWeight: 300, fontSize: "clamp(30px, 6vw, 44px)", lineHeight: 1.12, textWrap: "balance" }}>
          {text("profileTitle")}
        </h1>
        <p style={{ margin: "14px 0 28px", fontStyle: "italic", fontWeight: 300, fontSize: 19, opacity: 0.85 }}>
          {text("profileIntro")}
        </p>

        <div style={{ marginBottom: 20 }}>
          <label htmlFor="cj-uniqueness" style={labelStyle}>
            {text("uniquenessLabel")}
          </label>
          <input
            id="cj-uniqueness"
            type="text"
            value={values.uniquenessLine}
            onChange={set("uniquenessLine")}
            maxLength={PROFILE_LIMITS.uniquenessLine}
            aria-describedby="cj-uniqueness-help"
            aria-invalid={error === "uniquenessRequired"}
            autoFocus
            style={fieldStyle}
          />
          <p id="cj-uniqueness-help" style={{ margin: "6px 0 0", fontSize: 15, fontStyle: "italic", opacity: 0.7 }}>
            {text("uniquenessHelp")}
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label htmlFor="cj-offers" style={labelStyle}>
            {text("offersLabel")} · {text("optional")}
          </label>
          <textarea
            id="cj-offers"
            rows={3}
            value={values.offers}
            onChange={set("offers")}
            maxLength={PROFILE_LIMITS.offers}
            style={{ ...fieldStyle, resize: "vertical" }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label htmlFor="cj-seeks" style={labelStyle}>
            {text("seeksLabel")} · {text("optional")}
          </label>
          <textarea
            id="cj-seeks"
            rows={3}
            value={values.seeks}
            onChange={set("seeks")}
            maxLength={PROFILE_LIMITS.seeks}
            style={{ ...fieldStyle, resize: "vertical" }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label htmlFor="cj-site" style={labelStyle}>
            {text("siteLabel")} · {text("optional")}
          </label>
          <input
            id="cj-site"
            type="text"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            value={values.siteUrl}
            onChange={set("siteUrl")}
            maxLength={PROFILE_LIMITS.siteUrl}
            aria-invalid={error === "siteInvalid"}
            style={fieldStyle}
          />
        </div>

        {error ? (
          <p role="alert" style={{ margin: "0 0 16px", fontSize: 17, color: "#f0b4a8" }}>
            {text(error)}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          style={{
            width: "100%",
            minHeight: 48,
            padding: "0 24px",
            background: "none",
            border: `1px solid ${MOONLIGHT}`,
            color: INK,
            fontFamily: MONO,
            fontWeight: 300,
            fontSize: 13,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            cursor: saving ? "wait" : "pointer",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? text("saving") : text("submit")}
        </button>
      </form>
    </main>
  );
};

export default JoinCollective;
