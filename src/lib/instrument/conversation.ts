import { validateButtons } from "@/data/yourAiCatalog";
import type { DialogueMessage } from "@/modules/zone-of-genius/yourAiTurn";

const keyFor = (owner: string | null) => `fytt:instrument-conversation:v1:${owner ?? "guest"}`;
const conversations = new Map<string, DialogueMessage[]>();

export const readConversation = (owner: string | null): DialogueMessage[] => {
  const key = keyFor(owner);
  const cached = conversations.get(key);
  if (cached) return cached;
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(key) ?? "[]") as DialogueMessage[];
    if (!Array.isArray(saved)) return [];
    return saved
      .filter((message) => message && (message.role === "ai" || message.role === "player") && typeof message.text === "string")
      .map(({ role, text, buttons }) => ({
        role,
        text,
        buttons: validateButtons(buttons),
      }));
  } catch {
    return [];
  }
};

export const writeConversation = (owner: string | null, messages: DialogueMessage[]): void => {
  const key = keyFor(owner);
  conversations.set(key, messages);
  try {
    window.sessionStorage.setItem(key, JSON.stringify(messages));
  } catch {
    // Keep the conversation available in memory if storage is blocked.
  }
};
