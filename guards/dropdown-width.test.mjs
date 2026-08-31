/**
 * СПИСКИ В ОДНОЙ ГРУППЕ — ОДНОЙ ШИРИНЫ.
 *
 * 31.08.2026 владелица открыла настройку и увидела три выпадающих списка
 * разной длины: каждый растянулся по своей подписи — «7 дней после клика»,
 * «Только пиксель сайта», «Показывать отдельно от покупок». Вопрос был
 * точный: «почему они все разной длины, где дизайн-система?»
 *
 * Правило простое: когда списки стоят группой (форма, набор фильтров), их
 * ширину задаёт контейнер, а не длина текста внутри. Иначе группа читается
 * как три разных элемента, а не как один набор.
 *
 * Страж срабатывает, когда в одном файле несколько списков, и хотя бы один
 * отличается от других шириной. Одиночный список в строке (переключатель
 * кабинета, язык) правило не трогает: ему сжиматься по содержимому нормально.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { tsxFiles, tags, lineOf } from './lib.mjs';

/** Классы, задающие ширину явно. */
const WIDTH = /\b(w-full|w-\[[^\]]+\]|min-w-\[[^\]]+\]|flex-1|basis-full)\b/;

const SELECTS = ['LiquidSelect', 'MultiSelect', 'AccountPicker'];

test('выпадающие списки одной группы имеют одинаковую ширину', () => {
  const offenders = [];

  for (const file of tsxFiles()) {
    const source = fs.readFileSync(file, 'utf8');

    for (const name of SELECTS) {
      const found = tags(source, name);
      // Один список в файле — сравнивать не с чем.
      if (found.length < 2) continue;

      const widths = found.map(({ tag, index }) => {
        const m = tag.match(WIDTH);
        return { width: m ? m[0] : null, line: lineOf(source, index) };
      });

      const distinct = new Set(widths.map((w) => w.width ?? '—'));
      if (distinct.size > 1) {
        offenders.push(
          `${file}: ${name} в одном файле имеют разную ширину ` +
          `(${widths.map((w) => `строка ${w.line}: ${w.width ?? 'ширина не задана'}`).join('; ')})`,
        );
      }
    }
  }

  assert.deepEqual(
    offenders,
    [],
    'Списки одной группы разъезжаются по длине подписи. Задайте ширину контейнером ' +
    '(например, buttonClassName="w-full" у всех):\n' + offenders.join('\n'),
  );
});
