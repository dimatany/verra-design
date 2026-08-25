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
  /**
   * ДОСТУПНОСТЬ (25.08.2026). Список был набором кнопок в <div>: клавиатура его
   * не понимала — ни стрелок, ни Escape, ни возврата фокуса, а экранный диктор
   * не знал, что список раскрыт. Правим здесь, в общем компоненте: этот селект
   * стоит на выборе кабинета, периода и языка во всех приложениях.
   */
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const menuId = React.useId();
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

  // Список открылся — фокус уходит в него: иначе стрелки слушает кнопка, а не
  // сам список, и подсветка пункта не двигается.
  React.useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

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
          ref={listRef}
          role="listbox"
          aria-activedescendant={activeIndex >= 0 ? `${menuId}-option-${activeIndex}` : undefined}
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              setOpen(false);
              buttonRef.current?.focus();
              return;
            }
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
              event.preventDefault();
              setActiveIndex((current) => {
                if (event.key === 'Home') return 0;
                if (event.key === 'End') return options.length - 1;
                const step = event.key === 'ArrowDown' ? 1 : -1;
                const next = current + step;
                if (next < 0) return options.length - 1;
                if (next >= options.length) return 0;
                return next;
              });
              return;
            }
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              const option = options[activeIndex];
              if (option) {
                onChange(option.value);
                setOpen(false);
                buttonRef.current?.focus();
              }
            }
          }}
          style={{
            position: 'fixed',
            top: menuPosition.top,
            bottom: menuPosition.bottom,
            left: clampMenuLeft(menuPosition.left, Math.max(contentWidth ?? 0, menuPosition.width)),
            // Ширина меню: НЕ МЕНЬШЕ триггера (растянутый триггер меню обязано
            // догнать), дальше — по самому длинному пункту. Раньше ширина
            // бралась ровно из замера-двойника, и ошибка замера в пару пикселей
            // резала название пункта до «E…» (замечено 24.08.2026 на выборе
            // кабинета). Теперь длину задаёт сам текст, а замер работает
            // нижней границей — обрезать его больше нечему.
            minWidth: Math.max(contentWidth ?? 0, menuPosition.width),
            width: 'max-content',
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: menuPosition.maxHeight,
            zIndex: 2147483647,
          }}
          className={`flex flex-col rounded-[22px] border chrome-glass p-2 shadow-[0_28px_80px_rgb(var(--ink-rgb)/0.22)] ${menuClassName}`}
        >
          <div className="flex flex-col gap-1 overflow-y-auto overscroll-contain">
            {options.map((option, index) => {
              const active = option.value === value;
              const focused = index === activeIndex;

              return (
                <button
                  key={option.value}
                  id={`${menuId}-option-${index}`}
                  role="option"
                  aria-selected={active}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    buttonRef.current?.focus();
                  }}
                  className={`pop-item justify-between ${
                    active
                      ? 'is-on shadow-pick'
                      : `${focused ? 'ring-2 ring-primary/35' : ''}`
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block whitespace-nowrap t-body font-bold leading-tight">
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
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            updateMenuPosition();
            setOpen(true);
            // Стрелка вверх открывает список на последнем пункте — так ждёт
            // привычка из системных списков.
            const start = event.key === 'ArrowUp' ? options.length - 1 : Math.max(0, options.findIndex((o) => o.value === value));
            setActiveIndex(start);
          }
        }}
        onClick={() => {
          updateMenuPosition();
          setOpen((current) => {
            if (current) return false;
            setActiveIndex(Math.max(0, options.findIndex((o) => o.value === value)));
            return true;
          });
        }}
        style={{ width: contentWidth, maxWidth: '100%' }}
        className={`select-trigger glass-btn min-w-[150px] outline-none ${buttonClassName}`}
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
