/**
 * Copy text to the clipboard. Starts the copy synchronously, so a caller can call it first in a
 * click handler and still open a window right after (iOS Safari only honours both inside the
 * tap). Falls back to a hidden textarea where the async clipboard is blocked (older Safari,
 * iframes), the same fallback `/ai-os` uses.
 */
export function copyText(text: string): Promise<boolean> {
  const legacy = (): boolean => {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  };
  try {
    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(text).then(
        () => true,
        () => legacy(),
      );
    }
  } catch {
    /* fall through to the legacy path */
  }
  return Promise.resolve(legacy());
}
