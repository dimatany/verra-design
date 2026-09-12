'use client';

import React from 'react';

/**
 * ПОЗИЦИЯ НА ШКАЛЕ — «где стоим» одной полоской.
 *
 * Позиция в выдаче — число, у которого «меньше — лучше», и в клетке оно
 * читается наоборот: 3 выглядит меньше 18. Полоска переворачивает шкалу:
 * первое место — полная, сотое — пустая. Бледная отметка — где стояли раньше:
 * движение видно без вычитания. Цвет — из данных: в тройке — good, в десятке —
 * accent, дальше — quiet.
 */
export default function RankCell({ now, before, max = 100, label, className = '' }: Readonly<{
  /** Позиция сейчас (1 — лучшая). */
  now: number;
  /** Позиция раньше — бледной отметкой; пусто, если сравнивать не с чем. */
  before?: number | null;
  /** Правый край шкалы (обычно 100). */
  max?: number;
  /** Готовая подпись числа (отформатирована продуктом). */
  label: string;
  className?: string;
}>) {
  const clamp = (v: number) => Math.max(0, Math.min(100, ((max + 1 - Math.min(max, Math.max(1, v))) / max) * 100));
  const width = clamp(now);
  const tone = now <= 3 ? 'rank-good' : now <= 10 ? 'rank-accent' : 'rank-quiet';
  return (
    <span className={`rank-cell ${className}`}>
      <span className="rank-cell-label tabular-nums">{label}</span>
      <span className="rank-cell-track" aria-hidden>
        {before != null && Number.isFinite(before) && (
          <span className="rank-cell-before" style={{ width: `${clamp(before)}%` }} />
        )}
        <span className={`rank-cell-fill ${tone}`} style={{ width: `${width}%` }} />
      </span>
    </span>
  );
}
