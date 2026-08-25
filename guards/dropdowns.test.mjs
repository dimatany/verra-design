/**
 * ВЫПАДАЮЩИЙ СПИСОК В ЭКОСИСТЕМЕ ОДИН.
 *
 * 26.08.2026 владелица открыла три списка подряд — каналы воронки, выбор
 * кабинета, смену приложения — и увидела три разных элемента: где-то пункты
 * голые, где-то в кнопочном капсе, где-то панель просвечивала тёмной колонкой.
 * Вопрос был точный: «сколько вообще компонентов выпадающих списков в коде?»
 *
 * Компонентов-обёрток может быть несколько (одиночный выбор, множественный,
 * период, язык, смена приложения) — но ВНЕШНОСТЬ у них одна:
 *   .pop-panel — панель (глухая бумага, одно скругление, одна тень);
 *   .pop-item  — пункт (одна высота, один шрифт, один вид выбранного .is-on).
 *
 * Страж проверяет: всё, что объявляет себя пунктом списка (role="option" /
 * role="menuitem"), носит .pop-item — и не носит кнопочных семей: пункт
 * списка не кнопка.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { tsxFiles, lineOf } from './lib.mjs';

const ITEM_ROLE = /role=["'](?:option|menuitem)["']/;
const OPEN = /<(?:button|a|Link|span|div|li)\b/g;

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

test('каждый пункт выпадающего списка — .pop-item, и он не кнопка', () => {
  const offenders = [];
  for (const file of tsxFiles()) {
    const source = fs.readFileSync(file, 'utf8');
    if (!ITEM_ROLE.test(source)) continue;
    for (const { tag, index } of openingTags(source)) {
      if (!ITEM_ROLE.test(tag)) continue;
      if (!tag.includes('pop-item')) {
        offenders.push(`${file}:${lineOf(source, index)} — пункт без pop-item`);
      } else if (/\bbtn-(?:primary|quiet|danger)\b|\bbtn\b(?!-)/.test(tag)) {
        offenders.push(`${file}:${lineOf(source, index)} — пункт одет кнопкой (btn*): выбранность это .is-on`);
      }
    }
  }
  assert.deepEqual(offenders, [],
    'пункт списка оформляется классом pop-item (+ .is-on для выбранного):\n' + offenders.join('\n'));
});
