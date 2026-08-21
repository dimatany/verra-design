'use client';

import React from 'react';

// Layout effect on the client (measure before paint → no width flash); plain
// effect on the server so SSR does not warn.
const useIsoLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

/**
 * DESIGN-SYSTEM RULE — one width for a dropdown.
 *
 * A dropdown's trigger button and its pop-up menu must share EXACTLY one width:
 * the width of the widest option row. Never a menu wider (or narrower) than the
 * button it belongs to. We measure the options off-screen (hidden probe, no
 * layout jump), then drive both the button and the menu from that number.
 *
 * Usage: `const { width, probe } = useDropdownWidth(options)` →
 *   - render `{probe}` once inside the control's root,
 *   - set the button `style={{ width }}` (keep a `min-w-[…]` class as the floor),
 *   - set the menu `width` to the same value.
 */
export function useDropdownWidth(options: ReadonlyArray<{ label: string }>) {
  const measureRef = React.useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = React.useState<number>();

  useIsoLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    // +1px guards against sub-pixel rounding that would clip the last glyph.
    const natural = Math.ceil(el.getBoundingClientRect().width) + 1;
    const cap = typeof window !== 'undefined' ? window.innerWidth - 32 : natural;
    setWidth(Math.min(natural, cap));
  }, [options]);

  const probe = (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 -z-10 h-0 overflow-hidden opacity-0"
    >
      {/* Mirrors a menu row's horizontal chrome: px-4 padding + gap-3 + a 16px
          checkbox/check slot + the bold label. The widest row wins. */}
      <div ref={measureRef} className="inline-flex flex-col">
        {options.map((option, index) => (
          <span key={`${index}-${option.label}`} className="flex items-center gap-3 px-4">
            <span className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap t-body font-bold">{option.label}</span>
          </span>
        ))}
      </div>
    </div>
  );

  return { width, probe };
}

/** Clamp a menu's left edge so a content-width menu never runs off the right edge. */
export function clampMenuLeft(left: number, width = 0): number {
  const edge = 16;
  const w = width;
  const vw = typeof window !== 'undefined' ? window.innerWidth : Number.POSITIVE_INFINITY;
  return Math.max(edge, Math.min(left, vw - w - edge));
}
