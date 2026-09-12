'use client';

import React from 'react';

export type CompareRow = {
  key: string;
  label: string;
  /** Наше значение и чужое; подписи — готовые строки продукта. */
  mine: number;
  theirs: number;
  mineLabel: string;
  theirsLabel: string;
  /** Предупреждение строки (например, «дороже соседа»): подкрашивает чужую полоску. */
  warn?: boolean;
};

/**
 * ПАРНЫЕ ПОЛОСКИ «МЫ ПРОТИВ НИХ» — сравнение, а не поиск строки.
 *
 * Цены на витрине Google, доля показов против конкурента: две полоски в
 * одной строке видны сразу, а таблица заставляет читать два числа и вычитать.
 * Ширина — от общего максимума, чтобы строки сравнивались и между собой.
 */
export default function CompareBars({ rows, mineName, theirsName, className = '' }: Readonly<{
  rows: CompareRow[];
  mineName: string;
  theirsName: string;
  className?: string;
}>) {
  const max = Math.max(0, ...rows.flatMap((r) => [r.mine, r.theirs]));
  if (rows.length === 0 || max <= 0) return null;
  const w = (v: number) => `${Math.max(2, Math.min(100, Math.round((v / max) * 100)))}%`;
  return (
    <div className={`cmp ${className}`}>
      <div className="cmp-legend"><span><i className="cmp-dot cmp-mine" />{mineName}</span><span><i className="cmp-dot cmp-theirs" />{theirsName}</span></div>
      {rows.map((r) => (
        <div key={r.key} className="cmp-row">
          <span className="cmp-label" title={r.label}>{r.label}</span>
          <span className="cmp-bars">
            <span className="cmp-line"><i className="cmp-mine" style={{ width: w(r.mine) }} /><b className="tabular-nums">{r.mineLabel}</b></span>
            <span className="cmp-line"><i className={`cmp-theirs ${r.warn ? 'cmp-warn' : ''}`} style={{ width: w(r.theirs) }} /><b className="tabular-nums">{r.theirsLabel}</b></span>
          </span>
        </div>
      ))}
    </div>
  );
}
