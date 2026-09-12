'use client';

import React from 'react';

/**
 * СПАРКЛАЙН В КЛЕТКЕ — ряд за период без отдельного графика.
 *
 * Столбики по дням (или неделям), последний выделен: видно и форму ряда, и
 * куда пришли. Ширина фиксирована, чтобы таблица не «дышала» от длины ряда.
 * Цвет — из токенов; `tone` — когда ряд несёт смысл (расход, доход).
 */
export default function SparkCell({ values, tone = 'accent', width = 72, height = 20, title, className = '' }: Readonly<{
  values: number[];
  tone?: 'accent' | 'good' | 'quiet';
  width?: number;
  height?: number;
  title?: string;
  className?: string;
}>) {
  if (values.length < 2) return <span className={`spark-cell ${className}`} style={{ width }} aria-hidden />;
  const max = Math.max(0, ...values);
  const gap = 1;
  const bw = Math.max(1, (width - gap * (values.length - 1)) / values.length);
  return (
    <svg className={`spark-cell spark-${tone} ${className}`} width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden={!title} role={title ? 'img' : undefined}>
      {title && <title>{title}</title>}
      {values.map((v, i) => {
        const h = max > 0 ? Math.max(1, Math.round((v / max) * (height - 1))) : 1;
        return <rect key={i} x={i * (bw + gap)} y={height - h} width={bw} height={h} rx={1} className={i === values.length - 1 ? 'spark-last' : undefined} />;
      })}
    </svg>
  );
}
