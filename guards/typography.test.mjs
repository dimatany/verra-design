/**
 * РАЗМЕР ТЕКСТА — ТОЛЬКО СТУПЕНЬЮ ШКАЛЫ (правило 6b дизайн-системы).
 *
 * 20.08.2026 шкалу свели к восьми ступеням (t-h1 … t-cap), а 03.09.2026
 * владелица снова увидела на одной странице крупный и мелкий текст рядом:
 * новые карточки были набраны `text-sm` и таблицами без ступени, которые
 * наследуют браузерные 16px. Устно правило не держится — его роняет проверка.
 *
 * Страж требует от каждого файла продукта двух вещей:
 *   1) никаких размеров Tailwind и произвольных (`text-xs`, `text-sm`,
 *      `text-lg`, `text-[10px]`, `text-[0.8rem]` …) — только `t-*`;
 *   2) у каждой таблицы ступень задана: либо на самом `<table>`, либо на
 *      каждой её ячейке `<td>`/`<th>` (шапки из SortableTh ступень несут сами).
 *
 * Подписи осей внутри графиков задаются темой библиотеки и стража не касаются.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { tsxFiles, tags, lineOf } from './lib.mjs';

const FORBIDDEN = /\btext-(xs|sm|base|lg|xl|[2-9]xl|\[[0-9.]+(px|rem|em)\])\b/g;
const STEP = /\bt-(h1|h2|kpi|lead|body|data|meta|cap)\b/;

test('размер текста задаётся только ступенью шкалы t-*', () => {
  const sizes = [];
  const tables = [];

  for (const file of tsxFiles()) {
    const source = fs.readFileSync(file, 'utf8');

    let m;
    FORBIDDEN.lastIndex = 0;
    while ((m = FORBIDDEN.exec(source))) sizes.push(`${file}:${lineOf(source, m.index)} — ${m[0]}`);

    for (const { tag, index } of tags(source, 'table')) {
      if (STEP.test(tag)) continue;
      const end = source.indexOf('</table>', index);
      const body = source.slice(index, end === -1 ? source.length : end);
      const bare = [...tags(body, 'td'), ...tags(body, 'th')].filter((cell) => !STEP.test(cell.tag));
      if (bare.length) tables.push(`${file}:${lineOf(source, index)} — ${bare.length} ${bare.length === 1 ? 'ячейка' : 'ячеек'} без ступени`);
    }
  }

  assert.deepEqual(sizes, [],
    'Размер текста классом Tailwind или произвольным значением запрещён — только ступень шкалы\n' +
    '(t-h1 28 · t-kpi 26 · t-h2 21 · t-lead 17 · t-body 15 · t-data 13 · t-meta 12 · t-cap 11):\n' +
    sizes.join('\n'));

  assert.deepEqual(tables, [],
    'Таблица без ступени: текст в ячейках наследует браузерные 16px и выбивается из шкалы.\n' +
    'Добавьте t-data на <table> (шапки — t-cap, как в SortableTh):\n' +
    tables.join('\n'));
});
