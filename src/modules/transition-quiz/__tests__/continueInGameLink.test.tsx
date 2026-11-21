// @vitest-environment node
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { ContinueInGameLink, GAME_ENTRY_PATH } from "../ContinueInGameLink";
import en from "@/locales/en/common.json";
import ru from "@/locales/ru/common.json";
import es from "@/locales/es/common.json";

describe("B2: quiz result → continue in the game", () => {
  it("renders one quiet link to the public village entry", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ContinueInGameLink />
      </MemoryRouter>,
    );
    expect(html).toContain('class="tq-link-quiet"');
    expect(html).toContain(`href="${GAME_ENTRY_PATH}"`);
    expect(html).toContain("Continue in the game");
    expect(GAME_ENTRY_PATH).toBe("/village");
  });

  it("has EN / RU / ES strings", () => {
    for (const locale of [en, ru, es]) {
      expect(typeof locale.quiz.continueInGame).toBe("string");
      expect(locale.quiz.continueInGame.length).toBeGreaterThan(0);
    }
    expect(ru.quiz.continueInGame).not.toBe(en.quiz.continueInGame);
    expect(es.quiz.continueInGame).not.toBe(en.quiz.continueInGame);
  });
});
