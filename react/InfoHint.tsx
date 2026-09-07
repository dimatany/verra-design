'use client';

import React from 'react';
import HoverTip from './HoverTip';

/**
 * Small "i" icon with a plain-language tooltip on hover/focus/tap.
 * Used next to every metric and channel name so non-marketers
 * understand what the number means (texts live in metric-glossary.ts).
 *
 * The tooltip shell itself lives in HoverTip — shared with any other element
 * that wants a tooltip without spending layout on a caption (e.g. the KPI
 * delta pill), so positioning and iOS tap-away behave identically everywhere.
 */
export default function InfoHint({ text }: Readonly<{ text?: string }>) {
  if (!text) return null;
  return (
    <HoverTip
      text={text}
      // ЗОНА НАЖАТИЯ — САМА КНОПКА, 44 px (08.09.2026).
      //
      // Раньше зону расширял псевдоэлемент `after:-inset-14`. Замер попаданием
      // на живой странице показал: в плотной шапке таблицы соседи перекрывают
      // его, и пальцем остаётся ровно 13 px значка — ноль попаданий из четырёх
      // проб. Теперь кнопка честно 44×44, а отрицательные поля возвращают ей
      // прежний след в потоке, чтобы вёрстка вокруг не сдвинулась.
      //
      // Кольцо фокуса рисуем по самой кнопке: теперь это и есть реальная зона.
      className="relative inline-flex items-center justify-center w-11 h-11 -m-[15.5px] rounded-full text-neutral-dark/40 hover:text-primary focus:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
    >
      {/* Heroicons-outline house style: тонкая обводка (как в сайдбаре),
          скруглённые концы. Чуть плотнее 1.5 — читаемо на 13px. */}
      <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11.25v4.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25h.008" strokeWidth={2.2} />
      </svg>
    </HoverTip>
  );
}
