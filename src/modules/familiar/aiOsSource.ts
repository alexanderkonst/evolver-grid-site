/**
 * The AI OS text the personal prompt is built on: the bundled v5.3 snapshot
 * (system-prompts/v5.3, the same prompt `/ai-os` offers as «System prompt v5.3»).
 * Read from that file, never copied into the module.
 */
import aiOsPrompt from "../../../system-prompts/v5.3/system-prompt.md?raw";

export const AI_OS_PROMPT: string = aiOsPrompt;
export const AI_OS_VERSION = "5.3";
