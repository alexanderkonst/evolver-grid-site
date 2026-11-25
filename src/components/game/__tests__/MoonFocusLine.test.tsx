import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MoonFocusLine from "../MoonFocusLine";

const data = vi.hoisted(() => ({ current: { status: "guest", moonFocus: null, doNow: null } as Record<string, unknown> }));
vi.mock("@/hooks/useMoonDialData", () => ({ useMoonDialData: () => data.current }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: undefined }) }));

const render = () => renderToStaticMarkup(<MemoryRouter><MoonFocusLine redirect="/village" /></MemoryRouter>);

// Fixes v6.2 item 7: one invitation, not three.
describe("MoonFocusLine: one invitation", () => {
  beforeEach(() => { data.current = { status: "guest", moonFocus: null, doNow: null }; });

  it("signed out: one quiet line for the year and the focus, linking to sign-in", () => {
    const html = render();
    expect(html).toContain("Sign in to see your year and Moon Focus");
    expect(html).toContain('href="/auth?redirect=%2Fvillage"');
    expect(html).not.toContain("Add your birthday");
  });

  it("signed in with no focus: «Moon Focus: name it in Equilibrium →»", () => {
    data.current = { status: "ready", moonFocus: null, doNow: null };
    const html = render();
    expect(html).toContain("Moon Focus: name it in Equilibrium →");
    expect(html).toContain('href="/build/equilibrium"');
  });

  it("signed in with a focus: label and value, separated by a space", () => {
    data.current = { status: "ready", moonFocus: "Ship the pilot", doNow: null };
    const html = render();
    expect(html).toMatch(/bio-clock__focus-label">Moon Focus<\/span> <span class="bio-clock__focus-value">Ship the pilot</);
  });
});
