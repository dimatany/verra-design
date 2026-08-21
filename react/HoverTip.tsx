'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

const TOOLTIP_WIDTH = 240;
const EDGE_GAP = 8;

/**
 * Shared tooltip shell: wraps ANY trigger (the ⓘ icon, a KPI delta pill …) and
 * shows `text` on hover, keyboard focus or tap.
 *
 * Extracted from InfoHint so a tooltip can hang off an existing element instead
 * of costing extra layout — that is what lets the KPI tiles drop the always-on
 * «ср. с предыдущим периодом» caption without losing the explanation, and it
 * keeps ONE tooltip implementation (position clamping, iOS tap-away, portal)
 * instead of two that drift apart.
 *
 * The tooltip is rendered with `position: fixed` in a portal, so it is never
 * clipped by table `overflow` containers, transformed ancestors, or screen edges.
 */
export default function HoverTip({
  text,
  children,
  className = '',
  label,
}: Readonly<{
  text?: string;
  children: React.ReactNode;
  /** Classes for the trigger button (the wrapper around `children`). */
  className?: string;
  /** Accessible name; defaults to `text`. */
  label?: string;
}>) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number; arrowLeft: number; below: boolean } | null>(null);

  const show = useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();

    // Clamp horizontally to the viewport
    let left = r.left + r.width / 2 - TOOLTIP_WIDTH / 2;
    left = Math.max(EDGE_GAP, Math.min(left, window.innerWidth - TOOLTIP_WIDTH - EDGE_GAP));

    // Flip below the trigger when there is no room above
    const below = r.top < 100;
    const top = below ? r.bottom + 8 : r.top - 8;

    // Arrow keeps pointing at the trigger even when the box is clamped
    const arrowLeft = Math.max(10, Math.min(r.left + r.width / 2 - left, TOOLTIP_WIDTH - 10));

    setPos({ left, top, arrowLeft, below });
  }, []);

  const hide = useCallback(() => setPos(null), []);
  const toggle = useCallback(() => { if (pos) { setPos(null); } else { show(); } }, [pos, show]);

  // Any scroll invalidates the fixed position — just hide
  useEffect(() => {
    if (!pos) return;
    window.addEventListener('scroll', hide, true);
    return () => window.removeEventListener('scroll', hide, true);
  }, [pos, hide]);

  // Touch: dismiss on any tap outside the trigger (iOS never focuses buttons,
  // so blur alone can't close it).
  useEffect(() => {
    if (!pos) return;
    const away = (e: PointerEvent) => {
      if (!btnRef.current?.contains(e.target as Node)) hide();
    };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [pos, hide]);

  if (!text) return <>{children}</>;

  return (
    <span className="relative inline-flex shrink-0 align-middle">
      <button
        ref={btnRef}
        type="button"
        aria-label={label ?? text}
        aria-expanded={!!pos}
        tabIndex={0}
        onClick={toggle}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className={`cursor-help focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md ${className}`}
      >
        {children}
      </button>

      {pos &&
        createPortal(
          <span
            role="tooltip"
            className="pointer-events-none fixed rounded-xl bg-neutral-dark text-brand-bg t-cap font-medium leading-snug px-3.5 py-2.5 whitespace-pre-line z-[999] shadow-float normal-case tracking-normal text-left font-sans"
            style={{
              left: pos.left,
              top: pos.top,
              width: TOOLTIP_WIDTH,
              transform: pos.below ? 'none' : 'translateY(-100%)',
            }}
          >
            {text}
            <span
              className={`absolute border-[5px] border-transparent ${
                pos.below ? 'bottom-full border-b-neutral-dark' : 'top-full border-t-neutral-dark'
              }`}
              style={{ left: pos.arrowLeft, transform: 'translateX(-50%)' }}
            />
          </span>,
          document.body,
        )}
    </span>
  );
}
