'use client';

import React from 'react';

export type DistributionPart = {
  label: string;
  value: number;
  /** Готовая подпись значения (напр. «42 %» или «₴12 300»); без неё — доля в процентах. */
  valueLabel?: string;
  tone?: 'band' | 'accent' | 'tertiary' | 'sand' | 'quiet' | 'bad';
};

const ORDER: NonNullable<DistributionPart['tone']>[] = ['band', 'accent', 'tertiary', 'sand', 'quiet'];

/**
 * ПОЛОСА РАСПРЕДЕЛЕНИЯ — доли одной полоской 100 %.
 *
 * Вместо таблицы «канал · доля»: устройства, статусы товаров, каналы CRM,
 * страны. Легенда — под полосой строкой (на телефоне легенда сбоку не живёт).
 * Порядок цветов фиксирован по токенам, чтобы одна и та же доля во всех
 * продуктах выглядела одинаково; свой `tone` — когда цвет несёт смысл
 * (например, «отклонено» — bad).
 */
export default function DistributionBar({ parts, showLegend = true, className = '' }: Readonly<{
  parts: DistributionPart[];
  showLegend?: boolean;
  className?: string;
}>) {
  const total = parts.reduce((s, p) => s + Math.max(0, p.value), 0);
  if (total <= 0) return null;
  return (
    <div className={`dist ${className}`}>
      <div className="dist-bar" role="img" aria-label={parts.map((p) => `${p.label} ${p.valueLabel ?? `${Math.round((p.value / total) * 100)} %`}`).join(', ')}>
        {parts.map((p, i) => {
          const pct = (Math.max(0, p.value) / total) * 100;
          if (pct <= 0) return null;
          return <span key={p.label} className={`dist-seg dist-${p.tone ?? ORDER[i % ORDER.length]}`} style={{ width: `${pct}%` }} title={`${p.label}: ${p.valueLabel ?? `${Math.round(pct)} %`}`} />;
        })}
      </div>
      {showLegend && (
        <ul className="dist-legend">
          {parts.map((p, i) => (
            <li key={p.label}>
              <span className={`dist-dot dist-${p.tone ?? ORDER[i % ORDER.length]}`} aria-hidden />
              <span className="dist-legend-label">{p.label}</span>
              <span className="tabular-nums">{p.valueLabel ?? `${Math.round((Math.max(0, p.value) / total) * 100)} %`}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
