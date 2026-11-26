import type { ReactElement } from "react";
import { expect, it, vi } from "vitest";
import { validateButtons } from "@/data/yourAiCatalog";
import { ConversationSuggestion } from "../ConversationSuggestion";

it("a suggestion click replies with its label and only Go navigates", () => {
  const [suggestion] = validateButtons(["practice:breathwork"]);
  const onReply = vi.fn();
  const onGo = vi.fn();
  const chip = ConversationSuggestion({
    suggestion, onReply, onGo, goLabel: "Go", disabled: false, className: "", style: {}, accent: "",
  });
  const [reply, go] = chip.props.children as ReactElement<{ onClick: () => void }>[];
  reply.props.onClick();
  expect(onReply).toHaveBeenCalledWith("Breathwork and activations");
  expect(onGo).not.toHaveBeenCalled();

  go.props.onClick();
  expect(onGo).toHaveBeenCalledWith("/library/foundational-videos", suggestion);
  expect(onReply).toHaveBeenCalledTimes(1);
});
