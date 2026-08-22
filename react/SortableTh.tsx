'use client';

import React from 'react';
import { useT } from './i18n';
import InfoHint from './InfoHint';

// Один Collator на модуль: localeCompare создавал Intl.Collator на КАЖДОЕ
// сравнение — ~50–100× медленнее на больших таблицах.
const UK_COLLATOR = new Intl.Collator('uk');

export type SortDir = 'desc' | 'asc';

/**
 * Universal table sorting (DESIGN_SYSTEM rule): every column header gets a
 * small sort control. 1st click = descending, 2nd = ascending, switching
 * column starts from descending again. Whole rows travel together;
 * missing values ('—', null) always sink to the bottom.
 */
export function useSort<T extends object>(rows: T[]) {
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [dir, setDir] = React.useState<SortDir>('desc');

  const toggle = React.useCallback((k: string) => {
    setSortKey((prev) => {
      if (prev === k) {
        setDir((d) => (d === 'desc' ? 'asc' : 'desc'));
        return prev;
      }
      setDir('desc');
      return k;
    });
  }, []);

  const sorted = React.useMemo(() => {
    if (!sortKey) return rows;
    // Объект в ячейке сравнивать как строку нельзя: String({}) даёт
    // «[object Object]», все такие строки равны — и сортировка молча врёт
    // (найдено проверкой качества 22.08.2026). Считаем их пропусками.
    const sortable = (v: unknown) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || typeof v === 'bigint';
    const missing = (v: unknown) => v === null || v === undefined || v === '' || !sortable(v) || (typeof v === 'number' && Number.isNaN(v));
    return [...rows].sort((a, b) => {
      const av = (a as Record<string, unknown> | null | undefined)?.[sortKey];
      const bv = (b as Record<string, unknown> | null | undefined)?.[sortKey];
      if (missing(av) && missing(bv)) return 0;
      if (missing(av)) return 1; // gaps always last
      if (missing(bv)) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return dir === 'desc' ? bv - av : av - bv;
      // сюда доходят только примитивы (см. sortable выше)
      const as = String(av as string | number | boolean | bigint);
      const bs = String(bv as string | number | boolean | bigint);
      return dir === 'desc' ? UK_COLLATOR.compare(bs, as) : UK_COLLATOR.compare(as, bs);
    });
  }, [rows, sortKey, dir]);

  return { sorted, sortKey, dir, toggle };
}

/**
 * Sort indicator — «спокойная шапка»: clean chevrons in the project's
 * Heroicons-outline house style (round caps, thin stroke). The arrow only
 * shows for the ACTIVE column; on the others it stays invisible but keeps its
 * box, so it fades in on hover (group-hover) without shifting the layout —
 * that's what stops the headers from "jumping". Direction: desc = ▼, asc = ▲.
 */
function SortIcon({ active, dir }: Readonly<{ active: boolean; dir: SortDir }>) {
  if (!active) {
    return (
      <svg
        className="w-3.5 h-3.5 shrink-0 text-neutral-dark/30 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10l4-4 4 4M8 14l4 4 4-4" />
      </svg>
    );
  }
  return (
    <svg className="w-3.5 h-3.5 shrink-0 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={dir === 'desc' ? 'M6 9l6 6 6-6' : 'M6 15l6-6 6 6'} />
    </svg>
  );
}

export function SortableTh({
  label,
  k,
  sortKey,
  dir,
  onToggle,
  hint,
  align = 'right',
  first = false,
}: Readonly<{
  label: React.ReactNode;
  k: string;
  sortKey: string | null;
  dir: SortDir;
  onToggle: (k: string) => void;
  hint?: string;
  align?: 'left' | 'right';
  first?: boolean;
}>) {
  const active = sortKey === k;
  const t = useT();
  const sortTitle = t('Сортувати', 'Сортировать', 'Sort');
  return (
    <th className={`py-2.5 ${first ? 'pr-3' : 'px-2'} t-cap font-bold uppercase tracking-wider ${active ? 'text-neutral-dark' : 'text-neutral-dark/70'} ${align === 'right' ? 'text-right' : ''}`}>
      {/* «Спокойная шапка»: подпись+стрелка — одна кнопка сортировки; ⓘ отделён
          тонким разделителем и увеличенным отступом, чтобы в него не попадали
          мимо сортировки. hint — отдельный <button>, поэтому живёт РЯДОМ с
          кнопкой сортировки, а не внутри неё (вложенные кнопки — невалидный HTML). */}
      {/* У правых колонок ⓘ стоит ПЕРЕД подписью. Причина не в красоте: на
          телефоне таблица едет вбок, и под закреплённый первый столбец уходит
          то, что левее. Когда ⓘ был справа, у полуприкрытой колонки оставался
          виден значок, а слово исчезало — шапка выглядела съехавшей
          относительно цифр. Теперь у правого края стоит сама подпись, ровно
          над своим числом, а первым прячется значок. */}
      <span className={`inline-flex items-center gap-2 ${align === 'right' ? 'justify-end flex-row-reverse' : ''}`}>
        <button
          type="button"
          onClick={() => onToggle(k)}
          className="group inline-flex items-center gap-1.5 uppercase tracking-wider cursor-pointer hover:text-neutral-dark transition-colors py-3 -my-3 px-1 -mx-1"
          title={sortTitle}
        >
          {label}
          <SortIcon active={active} dir={dir} />
        </button>
        {hint && (
          <>
            <span aria-hidden className="w-px h-3 bg-neutral-dark/15 shrink-0" />
            <InfoHint text={hint} />
          </>
        )}
      </span>
    </th>
  );
}
