import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// The page reads the next FMF at import time, so pin "today" before importing it.
vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke: vi.fn() } } }));
vi.mock("@/components/game/GameShellV2", () => ({ default: ({ children }: { children: unknown }) => <>{children}</> }));
vi.mock("@/components/SEO", () => ({ default: () => null }));
vi.mock("@/components/circles/KindCircles", () => ({ default: () => null }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (_k: string, d?: string) => d ?? _k }) }));

const MEET_FIRST_URL = "https://cal.com/aleksandrkonstantinov/1-hour-co-working";

describe("/build/fmf: Next dates (Sasha 2026-11-25)", () => {
  let html = "";

  beforeAll(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-25T19:00:00Z"));
    const { default: Mastermind } = await import("../Mastermind");
    html = renderToStaticMarkup(
      <MemoryRouter>
        <Mastermind />
      </MemoryRouter>,
    );
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  const datesSection = () => html.slice(html.indexOf('id="fmf-dates"'), html.indexOf("</section>", html.indexOf('id="fmf-dates"')));

  it("lists exactly three cycles: Dec 7 + 9, Jan 4 + 6, Feb 1 + 3", () => {
    const section = datesSection();
    expect((section.match(/<li/g) ?? []).length).toBe(3);
    expect(section).toContain("Mon Dec 7 + Wed Dec 9, 2026");
    expect(section).toContain("Mon Jan 4 + Wed Jan 6, 2027");
    expect(section).toContain("Mon Feb 1 + Wed Feb 3, 2027");
    expect(section).not.toContain("Mar");
  });

  it("only the cycles after the next one carry «provisional»", () => {
    const rows = datesSection().split("<li").slice(1);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toContain("Next");
    expect(rows[0]).not.toContain("provisional");
    expect(rows[1]).toContain("provisional");
    expect(rows[1]).not.toContain("Next");
    expect(rows[2]).toContain("provisional");
    expect((html.match(/data-testid="fmf-provisional"/g) ?? []).length).toBe(2);
  });

  it("keeps «Want to meet me first?» but points it at the undated booking page, with no Nov 4 and no «free»", () => {
    expect(html).toContain("Want to meet me first?");
    expect(html).toContain(`href="${MEET_FIRST_URL}"`);
    expect(html).toContain("Book a time with me");
    expect(html).not.toContain("lu.ma");
    expect(html).not.toMatch(/Nov(ember)? 4|free/i);
  });

  it("keeps «Reserve my place» on the Stripe link", () => {
    expect(html).toContain("Reserve my place");
    expect(html).toContain("https://buy.stripe.com/14AcN5aIAbCr8idh1CdEs0I");
  });
});
