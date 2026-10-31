import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mutable stand-in for the hook, so the components can be rendered in both states.
const hookState = vi.hoisted(() => ({
  value: {
    available: false,
    ready: true,
    userId: null as string | null,
    unread: [] as unknown[],
    leave: async () => ({ ok: true as const }),
    markRead: async () => {},
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, vars?: { name?: string }) => (vars?.name ? `${key}|${vars.name}` : key),
  }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({ select: () => ({ limit: async () => ({ error: null }) }) }),
    rpc: async () => ({ error: null }),
  },
}));

import ShareCardAnswer from "@/components/game/ShareCardAnswer";
import ReflectionQuests from "@/components/game/ReflectionQuests";
import {
  isMissingReflectionBackend,
  mapReflectionError,
  type PlayerReflectionsApi,
} from "../usePlayerReflections";

// ReflectionQuests reads the hook; replace it with the stand-in above.
vi.mock("../usePlayerReflections", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../usePlayerReflections")>();
  return { ...actual, usePlayerReflections: () => hookState.value };
});

const api = (over: Partial<PlayerReflectionsApi> = {}) => ({ ...hookState.value, ...over });

beforeEach(() => {
  hookState.value = {
    available: false,
    ready: true,
    userId: null,
    unread: [],
    leave: async () => ({ ok: true as const }),
    markRead: async () => {},
  };
});

describe("mapReflectionError: the P0001 messages of leave_reflection", () => {
  it("maps each message to its own copy key", () => {
    expect(mapReflectionError({ code: "P0001", message: "reflection_needs_name" })).toBe("needsName");
    expect(mapReflectionError({ code: "P0001", message: "reflection_already_today" })).toBe("alreadyToday");
    expect(mapReflectionError({ code: "P0001", message: "reflection_own_page" })).toBe("ownPage");
    expect(mapReflectionError({ code: "P0001", message: "reflection_profile_not_public" })).toBe("notPublic");
  });

  it("falls back to a generic line for anything else", () => {
    expect(mapReflectionError({ code: "XX000", message: "boom" })).toBe("generic");
    expect(mapReflectionError(null)).toBe("generic");
    expect(mapReflectionError(undefined)).toBe("generic");
  });

  it("every mapped key has copy in en, es and ru", () => {
    for (const lng of ["en", "es", "ru"]) {
      const json = JSON.parse(
        readFileSync(join(__dirname, `../../locales/${lng}/common.json`), "utf8"),
      ).shareCard.reflection.error;
      for (const key of ["needsName", "alreadyToday", "ownPage", "notPublic", "tooShort", "tooLong", "profanity", "generic"]) {
        expect(json[key], `${lng}.${key}`).toBeTruthy();
      }
    }
  });
});

describe("isMissingReflectionBackend: the degrade probe", () => {
  it("recognises a missing table and a missing function", () => {
    expect(isMissingReflectionBackend({ code: "42P01" })).toBe(true);
    expect(isMissingReflectionBackend({ code: "PGRST205" })).toBe(true);
    expect(isMissingReflectionBackend({ code: "42883" })).toBe(true);
    expect(isMissingReflectionBackend({ code: "PGRST202" })).toBe(true);
    expect(
      isMissingReflectionBackend({ message: "Could not find the table 'public.player_reflections' in the schema cache" }),
    ).toBe(true);
  });

  it("does not treat a real answer error as a missing backend", () => {
    expect(isMissingReflectionBackend({ code: "P0001", message: "reflection_own_page" })).toBe(false);
    expect(isMissingReflectionBackend(null)).toBe(false);
  });
});

describe("degrade path: available=false means no answer UI and no quest", () => {
  it("the hook starts unavailable and its leave refuses without calling the database", async () => {
    const box: { api: PlayerReflectionsApi | null } = { api: null };
    const actual = await vi.importActual<typeof import("../usePlayerReflections")>("../usePlayerReflections");
    const Probe = () => {
      box.api = actual.usePlayerReflections();
      return null;
    };
    renderToStaticMarkup(<Probe />);
    expect(box.api?.available).toBe(false);
    expect(box.api?.unread).toEqual([]);
    const res = await box.api!.leave({ username: "sasha", answer: "yes", line: "", visitorName: "Ana" });
    expect(res.ok).toBe(false);
  });

  it("the visitor card shows no answer buttons", () => {
    const html = renderToStaticMarkup(
      <ShareCardAnswer username="sasha" playerName="Sasha" isOwner={false} api={api({ available: false })} />,
    );
    expect(html).toBe("");
  });

  it("the Quest Board shows no reflection quest, even with unread rows", () => {
    hookState.value = api({
      available: false,
      unread: [{ id: "1", visitor_name: "Ana", answer: "partly", line: "warm", created_at: "2026-10-30T00:00:00Z" }],
    });
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ReflectionQuests />
      </MemoryRouter>,
    );
    expect(html).toBe("");
  });
});

describe("available=true", () => {
  it("shows the three answers to a guest", () => {
    const html = renderToStaticMarkup(
      <ShareCardAnswer username="sasha" playerName="Sasha" isOwner={false} api={api({ available: true })} />,
    );
    expect(html).toContain("shareCard.answer.yes");
    expect(html).toContain("shareCard.answer.partly");
    expect(html).toContain("shareCard.answer.differently");
  });

  it("is hidden for the owner of the page", () => {
    const html = renderToStaticMarkup(
      <ShareCardAnswer username="sasha" playerName="Sasha" isOwner={true} api={api({ available: true, userId: "u1" })} />,
    );
    expect(html).toBe("");
  });

  it("the Quest Board lists each unread reflection as «{{name}} answered…», newest first as given", () => {
    hookState.value = api({
      available: true,
      userId: "u1",
      unread: [
        { id: "2", visitor_name: "Ana", answer: "yes", line: null, created_at: "2026-10-31T00:00:00Z" },
        { id: "1", visitor_name: "Boris", answer: "partly", line: "warm", created_at: "2026-10-30T00:00:00Z" },
      ],
    });
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ReflectionQuests />
      </MemoryRouter>,
    );
    expect(html).toContain("shareCard.reflection.questTitle|Ana");
    expect(html).toContain("shareCard.reflection.questTitle|Boris");
    expect(html.indexOf("|Ana")).toBeLessThan(html.indexOf("|Boris"));
    // closed by default: the answer and the real-life line appear only once a quest is opened
    expect(html).not.toContain("shareCard.reflection.ask");
  });
});

describe("wiring", () => {
  const read = (rel: string) => readFileSync(join(__dirname, rel), "utf8");

  it("the Quest Board mounts the reflections only for a signed-in player", () => {
    expect(read("../../components/game/QuestBoard.tsx")).toMatch(/sheet\.userId \? <ReflectionQuests \/> : null/);
  });

  it("the answer and the quest never touch level code", () => {
    for (const file of ["../../components/game/ShareCardAnswer.tsx", "../../components/game/ReflectionQuests.tsx"]) {
      expect(read(file)).not.toMatch(/PlayerLevel|usePlayerLevel|qolAverageLevel|PrivateLevel/);
    }
  });

  it("the database part stays proposed: no migration mentions player_reflections", () => {
    const dir = join(__dirname, "../../../supabase/migrations");
    for (const name of readdirSync(dir)) {
      expect(readFileSync(join(dir, name), "utf8"), name).not.toContain("player_reflections");
    }
  });
});
