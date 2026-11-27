// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { supabase } from "@/integrations/supabase/client";
import { output } from "@/lib/console/__tests__/fixtures";
import { readConversation, writeConversation } from "@/lib/instrument/conversation";
import { getFace } from "@/lib/instrument/faces";
import { writeTourSeen } from "@/lib/yourAiInstrument";
import en from "@/locales/en/common.json";
import "../../YourAiInstrument";

vi.mock("@/components/game/AirOctahedron", () => ({ default: () => null }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke: vi.fn() } } }));
vi.mock("react-i18next", async (importOriginal) => ({
  ...await importOriginal<typeof import("react-i18next")>(),
  useTranslation: () => ({
    i18n: { resolvedLanguage: "en" },
    t: (key: string) => key.split(".").reduce<unknown>(
      (value, part) => (value as Record<string, unknown> | undefined)?.[part], en,
    ) ?? key,
  }),
}));

afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
  window.localStorage.clear();
  vi.resetAllMocks();
});

const goal = "Launch the first paid cohort of the Your Unfolding Potential course.";
const result = "Enroll the first paying group for Your Unfolding Potential.";
const goalCard = {
  goal: result,
  why: ["This is the first cohort.", "Enrollment is paid.", "The course is already named."],
  notThis: "Launching a free pilot.",
};

it.each(["Console input", "first conversation answer"])("completes step 1 from the %s in one Console call", async (source) => {
  const ownerId = source;
  const history = source === "first conversation answer" ? [{ role: "player" as const, text: goal }] : [];
  writeTourSeen();
  writeConversation(ownerId, history);
  const invoke = vi.mocked(supabase.functions.invoke);
  invoke.mockResolvedValue({ data: { text: output(goalCard) }, error: null });

  const AirFace = getFace("air")!;
  render(<AirFace ownerId={ownerId} reduced closeMs={0} active onBack={vi.fn()} onClose={vi.fn()} onNavigate={vi.fn()} />);
  const consoleTab = screen.getByRole("tab", { name: "Console" });
  fireEvent.click(consoleTab);

  const panel = within(screen.getByTestId("console-panel"));
  const stepTwo = "The case for your goal, with its risks";
  expect(panel.queryByRole("button", { name: stepTwo })).toBeNull();
  const stepOne = panel.getByRole("button", { name: "Your goal, clear and grounded" });
  if (source === "Console input") {
    const input = panel.getByRole("textbox", { name: "Your goal" });
    fireEvent.click(stepOne);
    await waitFor(() => {
      expect(document.activeElement).toBe(input);
      expect((stepOne as HTMLButtonElement).disabled).toBe(false);
    });
    expect(invoke).not.toHaveBeenCalled();
    expect(consoleTab.getAttribute("aria-selected")).toBe("true");
    fireEvent.change(input, { target: { value: goal } });
  }
  fireEvent.click(stepOne);

  expect(await panel.findByText(result)).toBeTruthy();
  expect(panel.getByTestId("console-button-1").dataset.state).toBe("done");
  expect((panel.getByRole<HTMLButtonElement>("button", { name: stepTwo })).disabled).toBe(false);
  expect(consoleTab.getAttribute("aria-selected")).toBe("true");
  expect(readConversation(ownerId)).toEqual(history);
  expect(invoke).toHaveBeenCalledTimes(1);
  expect(invoke).toHaveBeenCalledWith("your-ai-console", {
    body: { button: 1, context: goal, previousCards: [], locale: "en" },
  });
});
