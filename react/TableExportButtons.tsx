'use client';

import React from 'react';
import Icon from './Icon';
import Button from './Button';
import { useT } from './i18n';

/**
 * «Word / PDF» рядом с большими таблицами: скачивает ПОЛНУЮ таблицу
 * (не видимый топ-100), чтобы её можно было отдать подрядчику на исправление.
 * `build` вызывается лениво в момент клика — собирает актуальные строки с
 * учётом активных фильтров и сортировки.
 */
/**
 * Сами генераторы Word/PDF живут в ПРОДУКТЕ и приходят пропсом `exporters`:
 * пакет не тащит pdfmake/docx и не знает, как продукт собирает документ.
 */
export default function TableExportButtons<T>({ build, exporters }: Readonly<{
  build: () => T;
  exporters: { word: (table: T) => Promise<void>; pdf: (table: T) => Promise<void> };
}>) {
  const [busy, setBusy] = React.useState<'' | 'word' | 'pdf'>('');
  const P = useT();
  const hint = P(
    'Завантажити всю таблицю (з урахуванням фільтрів) — можна віддати підряднику на виправлення.',
    'Скачать всю таблицу (с учётом фильтров) — можно отдать подрядчику на исправление.',
    'Download the whole table (filters applied) — hand it to a contractor to fix.',
  );
  const run = async (kind: 'word' | 'pdf') => {
    if (busy) return;
    setBusy(kind);
    try {
      const table = build();
      await (kind === 'word' ? exporters.word(table) : exporters.pdf(table));
    } finally {
      setBusy('');
    }
  };
  // Скачивание — ЧЁРНАЯ кнопка, везде и всегда (решение владелицы 25.08.2026).
  // До этого Word и PDF были то тёмные в помощнике, то белые в таблицах, и
  // человек читал одинаковое действие как два разных. Семья задана здесь один
  // раз, страж `guards/download.test.mjs` не даёт развести её обратно.
  return (
    <span className="inline-flex items-center gap-1.5 shrink-0" title={hint}>
      <Button variant="primary" size="sm" disabled={busy !== ''} onClick={() => run('word')}>
        <Icon name="download" className="w-3.5 h-3.5" /> {busy === 'word' ? '…' : 'Word'}
      </Button>
      <Button variant="primary" size="sm" disabled={busy !== ''} onClick={() => run('pdf')}>
        <Icon name="download" className="w-3.5 h-3.5" /> {busy === 'pdf' ? '…' : 'PDF'}
      </Button>
    </span>
  );
}
