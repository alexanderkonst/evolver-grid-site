import * as React from "react";

import { Textarea, type TextareaProps } from "@/components/ui/textarea";

export interface PasteTextareaHandle {
  /** The textarea's live DOM value. Read this on submit instead of mirroring it in state. */
  getValue: () => string;
  clear: () => void;
}

export interface PasteTextareaProps
  extends Omit<TextareaProps, "value" | "defaultValue" | "onChange"> {
  /** Text to start with (e.g. a previous attempt). Defaults to empty. */
  initialValue?: string;
  /**
   * Fires only when the box flips between empty and non-empty, so a parent can
   * enable/disable its submit button without re-rendering on every keystroke.
   */
  onHasTextChange?: (hasText: boolean) => void;
}

/**
 * Uncontrolled textarea for pasting long AI responses.
 *
 * The browser owns the text; React never writes it back after mount, so a
 * long paste or fast typing can't be clobbered by a re-render. Spellcheck,
 * autocorrect and writing-assistant extensions are switched off because they
 * rewrite text in place. Read the value through the ref handle on submit.
 */
const PasteTextarea = React.forwardRef<PasteTextareaHandle, PasteTextareaProps>(
  ({ initialValue = "", onHasTextChange, onInput, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const hasTextRef = React.useRef<boolean | null>(null);
    const notifyRef = React.useRef(onHasTextChange);
    notifyRef.current = onHasTextChange;

    const syncHasText = React.useCallback(() => {
      const hasText = /\S/.test(textareaRef.current?.value ?? "");
      if (hasTextRef.current !== hasText) {
        hasTextRef.current = hasText;
        notifyRef.current?.(hasText);
      }
    }, []);

    React.useImperativeHandle(
      ref,
      () => ({
        getValue: () => textareaRef.current?.value ?? "",
        clear: () => {
          if (textareaRef.current) textareaRef.current.value = "";
          syncHasText();
        },
      }),
      [syncHasText],
    );

    // Set the text explicitly on mount so nothing the browser restored into
    // the field (form-state restore after a reload) survives.
    React.useEffect(() => {
      if (textareaRef.current) textareaRef.current.value = initialValue;
      syncHasText();
      // Mount-only: later changes to initialValue must not overwrite what the user typed.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <Textarea
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        data-gramm="false"
        data-gramm_editor="false"
        data-enable-grammarly="false"
        {...props}
        ref={textareaRef}
        defaultValue={initialValue}
        onInput={(event) => {
          syncHasText();
          onInput?.(event);
        }}
      />
    );
  },
);
PasteTextarea.displayName = "PasteTextarea";

export { PasteTextarea };
