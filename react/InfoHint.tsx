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
      // Зона нажатия расширена псевдоэлементом до ~41 px (палец), но рамка
      // фокуса рисовалась по самой иконке в 13 px — с клавиатуры её было почти
      // не видно. Кольцо рисуем со смещением наружу, по реальной зоне.
      className="relative inline-flex rounded-full text-neutral-dark/40 hover:text-primary focus:text-primary transition-colors after:absolute after:-inset-[14px] after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-[6px] focus-visible:ring-offset-transparent"
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
