/**
 * The AI OS text the personal prompt is built on: the bundled v6.0 release
 * (system-prompts/v6.0, the same prompt `/ai-os` offers as «System prompt v6.0»).
 * Read from that file, never copied into the module.
 */
import aiOsPrompt from "../../../system-prompts/v6.0/system-prompt.md?raw";

export const AI_OS_PROMPT: string = aiOsPrompt;
export const AI_OS_VERSION = "6.0";
