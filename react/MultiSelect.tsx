'use client';

import React from 'react';
import { useT } from './i18n';
import { createPortal } from 'react-dom';
import { useDropdownWidth, clampMenuLeft } from './dropdownWidth';

export type MultiSelectOption = { value: string; label: string; description?: string };

/**
 * Dropdown with checkboxes: «Усі» or any combination of accounts.
 * selected = [] means "all". Same visual language as LiquidSelect.
 */
export default function MultiSelect({
  options,
  selected,
  onChange,
  allLabel,
  className = '',
  buttonClassName = '',
}: Readonly<{
  options: MultiSelectOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  allLabel: string;
  className?: string;
  buttonClassName?: string;
}>) {
  const t = useT();
  const [open, setOpen] = React.useState(false);
  /** Доступность (25.08.2026): список должен закрываться Escape и объявляться. */
  const menuId = React.useId();
  const [mounted, setMounted] = React.useState(false);
  const [pos, setPos] = React.useState({ top: 0, left: 0, width: 0 });
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  // Design-system rule: button width == menu width == widest row (incl. the
  // "all" row), so the menu is never wider than its trigger (see dropdownWidth).
  const { width: contentWidth, probe } = useDropdownWidth(
    React.useMemo(() => [{ label: allLabel }, ...options], [allLabel, options]),
  );

  // eslint-disable-next-line react-hooks/set-state-in-effect -- portal target exists only in the browser; flip after mount so SSR and first client render match
  React.useEffect(() => setMounted(true), []);

  const place = React.useCallback(() => {
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 10, left: r.left, width: r.width });
  }, []);

  React.useEffect(() => {
    if (!open) return;
    place();
    const outside = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (document.getElementById('multi-select-portal')?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', outside);
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      document.removeEventListener('mousedown', outside);
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open, place]);

  // "All" is shown both when nothing is picked and when everything is picked —
  // both mean the same combined view, so the "all" row never fights the
  // individual rows.
  const isAll = selected.length === 0 || selected.length === options.length;
  const toggle = (v: string) => {
    // Plain add / remove. No auto-collapse to [] — collapsing the moment every
    // box is ticked made picking the 2nd account snap the whole control back to
    // "all", so you could never settle on one account or hold two.
    const next = selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v];
    onChange(next);
  };

  // «Выбрано: N», not «Все: N» — the truncated all-label read as «all N».
  const summary = React.useMemo(() => {
    if (isAll) return allLabel;
    if (selected.length === 1) return options.find((o) => o.value === selected[0])?.label ?? selected[0];
    return `${t('Обрано', 'Выбрано', 'Selected')}: ${selected.length}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- t пересоздаётся каждый рендер, язык уже учтён провайдером
  }, [isAll, allLabel, options, selected]);

  const check = (on: boolean) => (
    <span
      className={`w-4 h-4 shrink-0 rounded-md border flex items-center justify-center ${
        on ? 'bg-primary border-primary text-brand-bg' : 'border-neutral-dark/25 bg-white/70'
      }`}
    >
      {on && (
        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="none">
          <path d="M4.5 10.2L8 13.7L15.5 6.3" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );

  return (
    <div ref={rootRef} className={`relative min-w-0 max-w-full ${className}`}>
      {probe}
      <button
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && open) {
            event.preventDefault();
            setOpen(false);
          }
        }}
        ref={btnRef}
        type="button"
        onClick={() => { place(); setOpen((o) => !o); }}
        style={{ width: contentWidth, maxWidth: '100%' }}
        className={`btn-quiet glass-btn h-10 min-w-[200px] rounded-full border border-white/80 bg-white/94 px-4 t-data font-bold text-neutral-dark backdrop-blur-xl outline-none hover:bg-white focus:ring-2 focus:ring-primary/20 flex items-center justify-between gap-3 ${buttonClassName}`}
      >
        <span className="truncate">{summary}</span>
        <svg className={`h-4 w-4 shrink-0 text-neutral-dark/80 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none">
          <path d="M5.5 7.5L10 12L14.5 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && mounted &&
        createPortal(
          <div
            id={menuId}
            role="listbox"
            aria-multiselectable="true"
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                setOpen(false);
                btnRef.current?.focus();
              }
            }}
            id="multi-select-portal"
            style={{ position: 'fixed', top: pos.top, left: clampMenuLeft(pos.left, contentWidth ?? pos.width), width: contentWidth ?? pos.width, zIndex: 2147483647 }}
            className="overflow-hidden rounded-[22px] border chrome-glass p-2 shadow-[0_28px_80px_rgb(var(--ink-rgb)/0.22)]"
          >
            <div className="flex flex-col gap-1 max-h-[320px] overflow-y-auto">
              <button
                type="button"
                onClick={() => onChange([])}
                className={`flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left transition-all ${
                  isAll ? 'btn-primary' : 'btn-quiet text-neutral-dark/78'
                }`}
              >
                {check(isAll)}
                <span className="t-body font-bold leading-tight">{allLabel}</span>
              </button>
              {options.map((o) => {
                const on = selected.includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => toggle(o.value)}
                    className="btn-quiet flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-neutral-dark/85 transition-all"
                  >
                    {check(on)}
                    <span className="min-w-0">
                      <span className="block truncate t-body font-bold leading-tight">{o.label}</span>
                      {o.description && <span className="mt-0.5 block truncate t-cap font-semibold text-neutral-dark/60">{o.description}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
