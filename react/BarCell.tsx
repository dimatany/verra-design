'use client';

import React from 'react';

/**
 * СТОЛБИК В ЯЧЕЙКЕ — число носит форму.
 *
 * Появился на панели управления Metriverra 08.09.2026 («столбики в ячейке
 * таблицы вместо графика над ней») и понравился владелице; 11.09.2026 вынесен
 * в пакет, чтобы таблицы денег во всех продуктах читались одинаково.
 *
 * Полоска — доля от максимума столбца, не от суммы: человек сравнивает строки
 * между собой. Цвет — из данных (`tone`), а не украшение; по умолчанию акцент.
 * Число остаётся текстом: полоска помогает глазу, но не заменяет цифру.
 */
export default function BarCell({ value, max, label, tone = 'accent', align = 'left', className = '' }: Readonly<{
  /** Значение строки. */
  value: number;
  /** Максимум по столбцу (ширина 100 %). Ноль или меньше — полоски нет. */
  max: number;
  /** Готовая подпись числа (уже отформатированная по языку). */
  label: string;
  tone?: 'accent' | 'good' | 'warn' | 'bad' | 'quiet';
  /** Число слева от полоски или справа. */
  align?: 'left' | 'right';
  className?: string;
}>) {
  const width = max > 0 && value > 0 ? Math.max(2, Math.min(100, Math.round((value / max) * 100))) : 0;
  return (
    <span className={`bar-cell ${align === 'right' ? 'bar-cell-right' : ''} ${className}`}>
      <span className="bar-cell-label tabular-nums">{label}</span>
      <span className="bar-cell-track" aria-hidden>
        <span className={`bar-cell-fill bar-cell-${tone}`} style={{ width: `${width}%` }} />
      </span>
    </span>
  );
}
