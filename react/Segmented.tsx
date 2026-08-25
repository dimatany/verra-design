'use client';

import React from 'react';

/**
 * СЕГМЕНТ — выбор одного взгляда на данные из нескольких.
 *
 * Это не кнопки: кнопка обещает действие, сегмент меняет фильтр или режим на
 * тех же данных. Группа выглядит одним элементом (общая пилюля-подложка),
 * выбранная фишка тёмная, состояние объявлено aria-pressed.
 *
 * Для независимых фишек-переключателей (можно включить несколько) используйте
 * разметку напрямую: контейнер `.seg`, фишки `.seg-item` с aria-pressed.
 */
export type SegmentedItem<V extends string = string> = {
  value: V;
  label: React.ReactNode;
  /** Подпись для экранного диктора, если label — не текст. */
  ariaLabel?: string;
};

export default function Segmented<V extends string = string>({
  items, value, onChange, className = '', itemClassName = '',
}: Readonly<{
  items: SegmentedItem<V>[];
  value: V;
  onChange: (next: V) => void;
  className?: string;
  /** Только раскладка (напр. flex-1); внешность остаётся у .seg-item. */
  itemClassName?: string;
}>) {
  return (
    <div className={`seg ${className}`}>
      {items.map((it) => (
        <button
          key={it.value}
          type="button"
          aria-pressed={it.value === value}
          aria-label={it.ariaLabel}
          onClick={() => onChange(it.value)}
          className={`seg-item ${itemClassName}`}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
