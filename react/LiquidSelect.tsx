'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { useDropdownWidth, clampMenuLeft } from './dropdownWidth';

export type LiquidSelectOption = {
  value: string;
  label: string;
  description?: string;
};

type LiquidSelectProps = {
  value: string;
  options: LiquidSelectOption[];
  onChange: (value: string) => void;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  placeholder?: string;
};

export default function LiquidSelect({
  value,
  options,
  onChange,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  placeholder = 'Select',
}: Readonly<LiquidSelectProps>) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxHeight: number;
  }>({ top: 0, left: 0, width: 0, maxHeight: 420 });

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const selected = options.find((option) => option.value === value);

  // Design-system rule: button width == menu width == widest option (see dropdownWidth).
  const { width: contentWidth, probe } = useDropdownWidth(options);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- portal target exists only in the browser; flip after mount so SSR and first client render match
    setMounted(true);
  }, []);

  const updateMenuPosition = React.useCallback(() => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();

    // Long lists must scroll inside the menu, never run off-screen: cap the
    // height to the free space below the button, or flip upward when the
    // space above is bigger.
    const margin = 10;
    const edge = 16;
    const spaceBelow = window.innerHeight - rect.bottom - margin - edge;
    const spaceAbove = rect.top - margin - edge;
    const openUp = spaceBelow < 240 && spaceAbove > spaceBelow;

    setMenuPosition({
      top: openUp ? undefined : rect.bottom + margin,
      bottom: openUp ? window.innerHeight - rect.top + margin : undefined,
      left: rect.left,
      width: rect.width,
      maxHeight: Math.min(420, Math.max(160, openUp ? spaceAbove : spaceBelow)),
    });
  }, []);

  React.useEffect(() => {
    if (!open) return;

    updateMenuPosition();

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (rootRef.current?.contains(target)) return;

      const menu = document.getElementById('liquid-select-portal-menu');
      if (menu?.contains(target)) return;

      setOpen(false);
    };

    const handleReposition = () => {
      updateMenuPosition();
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [open, updateMenuPosition]);

  const menu = open && mounted
    ? createPortal(
        <div
          id="liquid-select-portal-menu"
          style={{
            position: 'fixed',
            top: menuPosition.top,
            bottom: menuPosition.bottom,
            left: clampMenuLeft(menuPosition.left, Math.max(contentWidth ?? 0, menuPosition.width)),
            // Menu width == trigger width. Обычно это «самый длинный пункт»,
            // но растянутый триггер (w-full на телефоне) меню обязано догнать.
            width: Math.max(contentWidth ?? 0, menuPosition.width),
            maxHeight: menuPosition.maxHeight,
            zIndex: 2147483647,
          }}
          className={`flex flex-col rounded-[22px] border chrome-glass p-2 shadow-[0_28px_80px_rgb(var(--ink-rgb)/0.22)] ${menuClassName}`}
        >
          <div className="flex flex-col gap-1 overflow-y-auto overscroll-contain">
            {options.map((option) => {
              const active = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-[18px] px-4 py-3 text-left transition-all ${
                    active
                      ? 'btn-primary shadow-pick'
                      : 'btn-quiet bg-transparent text-neutral-dark/78'
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate t-body font-bold leading-tight">
                      {option.label}
                    </span>
                    {option.description && (
                      <span
                        className={`mt-1 block truncate t-cap font-semibold leading-tight ${
                          active ? 'text-brand-bg/75' : 'text-neutral-dark/70'
                        }`}
                      >
                        {option.description}
                      </span>
                    )}
                  </span>

                  {active && (
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M4.5 10.2L8 13.7L15.5 6.3"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div ref={rootRef} className={`relative min-w-0 max-w-full ${className}`}>
      {probe}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          updateMenuPosition();
          setOpen((current) => !current);
        }}
        style={{ width: contentWidth, maxWidth: '100%' }}
        className={`select-trigger btn-quiet glass-btn h-10 min-w-[150px] rounded-full border border-white/80 bg-white/94 px-4 t-data font-bold text-neutral-dark backdrop-blur-xl outline-none hover:bg-white focus:ring-2 focus:ring-primary/20 flex items-center justify-between gap-3 ${buttonClassName}`}
      >
        <span className="truncate">{selected?.label || placeholder}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-neutral-dark/80 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M5.5 7.5L10 12L14.5 7.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {menu}
    </div>
  );
}
