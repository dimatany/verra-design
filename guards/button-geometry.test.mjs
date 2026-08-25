/**
 * КНОПКА НЕ ЗАДАЁТ СЕБЕ РАЗМЕР И ШРИФТ.
 *
 * 25.08.2026 владелица показала три снимка подряд: тёмная кнопка «Загрузить
 * CSV» рядом с тёмной «Поиск» — и обе тёмные, но разные. Пересчёт объяснил
 * почему: класс семьи задавал только цвет, а отступы, радиус, размер подписи и
 * капс каждая страница писала сама. 146 кнопок — столько же наборов.
 *
 * Теперь размеров ровно три (`btn`, `btn-sm`, плюс `btn-pill` / `btn-icon` как
 * форма), и они живут в пакете. На месте кнопке можно дописать только
 * РАСПОЛОЖЕНИЕ: ширину, поля снаружи, порядок во флексе, перенос строки.
 *
 * Исключения именами файлов не заводим: если размер правда нужен новый — он
 * заводится в пакете и становится доступен всем.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { tsxFiles, lineOf } from './lib.mjs';

const FAMILIES = ['btn-primary', 'btn-quiet', 'btn-danger'];

/** Открывающий тег со счётом скобок: внутри живут стрелочные обработчики. */
const OPEN = /<(?:button|a|Link|label)\b/g;

function openingTags(source) {
  const found = [];
  for (const m of source.matchAll(OPEN)) {
    let i = m.index + m[0].length;
    let depth = 0;
    let quote = '';
    while (i < source.length) {
      const ch = source[i];
      if (quote) {
        if (ch === quote && source[i - 1] !== '\\') quote = '';
      } else if (ch === '"' || ch === "'" || ch === '`') quote = ch;
      else if (ch === '{' || ch === '(') depth += 1;
      else if (ch === '}' || ch === ')') depth -= 1;
      else if (ch === '>' && depth === 0) {
        found.push({ tag: source.slice(m.index, i + 1), index: m.index });
        break;
      }
      i += 1;
    }
  }
  return found;
}

/** Внешность: это решает система. Всё остальное — дело страницы. */
const OWN_LOOK = /(?:^|[\s"'`{])(?:p[xy]?-[\d.]+|rounded(?:-(?:sm|md|lg|xl|2xl|3xl))?|min-h-\[\d+px\]|t-cap|t-data|t-body|text-(?:xs|sm|base|\[\d+px\])|font-(?:bold|semibold|medium)|uppercase|tracking-[\w[\].-]+)(?=[\s"'`}]|$)/;

test('кнопка берёт размер и шрифт из системы, а не пишет их сама', () => {
  const offenders = [];
  for (const file of tsxFiles()) {
    const source = fs.readFileSync(file, 'utf8');
    for (const { tag, index } of openingTags(source)) {
      if (!FAMILIES.some((f) => tag.includes(f))) continue;
      // Строка меню — пункт списка со своей геометрией, описанной в пакете.
      if (tag.includes('rail-item')) continue;
      const match = OWN_LOOK.exec(tag);
      if (!match) continue;
      offenders.push(`${file}:${lineOf(source, index)} — лишнее: ${match[0].trim()}`);
    }
  }
  assert.deepEqual(offenders, [],
    'уберите класс внешности — размер даёт btn / btn-sm / btn-pill / btn-icon:\n' + offenders.join('\n'));
});
