import { useEffect } from "react";

interface ShortcutConfig {
  combo: string;
  handler: (event: KeyboardEvent) => void;
}

function parseCombo(combo: string) {
  const parts = combo.toLowerCase().split("+");
  return {
    key: parts.pop(),
    ctrl: parts.includes("ctrl"),
    meta: parts.includes("cmd") || parts.includes("meta"),
    shift: parts.includes("shift"),
    alt: parts.includes("alt")
  };
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      shortcuts.forEach(({ combo, handler }) => {
        const { key, ctrl, meta, shift, alt } = parseCombo(combo);
        if (!key) return;
        if (ctrl && !event.ctrlKey) return;
        if (meta && !event.metaKey) return;
        if (shift && !event.shiftKey) return;
        if (alt && !event.altKey) return;
        if (event.key.toLowerCase() !== key) return;
        event.preventDefault();
        handler(event);
      });
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [shortcuts]);
}
