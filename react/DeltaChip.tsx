'use client';

import React from 'react';

/**
 * ДЕЛЬТА-ЧИП — сравнение с прошлым периодом одним взглядом.
 *
 * Знак, число, цвет из данных: рост — good, падение — bad, «—» — quiet.
 * Малая база (порог продукта: например, ≥ ₴500 или ≥ 100 сеансов) передаётся
 * как `weak`: чип честно показывает «—» с подсказкой, а не проценты от нуля.
 *
 * Для метрик, где падение — хорошо (CPA, отказы), продукт передаёт
 * `betterWhen="down"`, и цвета меняются местами; сам знак не врёт.
 */
export default function DeltaChip({ delta, label, weak = false, betterWhen = 'up', title, className = '' }: Readonly<{
  /** Изменение в долях: 0.124 = +12,4 %. null — сравнивать не с чем. */
  delta: number | null;
  /** Готовая подпись (напр. «12,4 %»), отформатированная продуктом по языку. */
  label?: string;
  /** База слишком мала, чтобы проценты что-то значили. */
  weak?: boolean;
  betterWhen?: 'up' | 'down';
  /** Подсказка при наведении (объяснение «мало данных» и т. п.). */
  title?: string;
  className?: string;
}>) {
  if (delta === null || weak || !Number.isFinite(delta)) {
    return <span className={`pill pill-quiet ${className}`} title={title}>—</span>;
  }
  const up = delta > 0;
  const flat = Math.abs(delta) < 0.0005;
  const good = flat ? null : (betterWhen === 'up' ? up : !up);
  const tone = flat ? 'pill-quiet' : good ? 'pill-good' : 'pill-bad';
  const arrow = flat ? '' : up ? '▲ ' : '▼ ';
  return (
    <span className={`pill ${tone} tabular-nums ${className}`} title={title}>
      {arrow}{label ?? `${Math.abs(Math.round(delta * 1000) / 10)} %`}
    </span>
  );
}
