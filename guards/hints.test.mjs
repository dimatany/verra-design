/**
 * У КАЖДОГО ПОКАЗАТЕЛЯ — КРУЖОК ⓘ С ПОЯСНЕНИЕМ (правило 5b дизайн-системы).
 *
 * Владелица 03.09.2026: «возле всех показателей должны быть кружочки с
 * объяснениями, я видела места, особенно новые, где их нет, и стража нет».
 * Правило держалось на памяти и на новых блоках сразу терялось.
 *
 * Страж требует `hint` у всего, что называет показатель:
 *   • плитка KpiTile / Tile;
 *   • заголовок группы GroupHeader;
 *   • сортируемая шапка SortableTh;
 *   • обычная шапка <th> в таблице — либо `hint=`, либо <InfoHint> внутри.
 *
 * Пропускаются: пустые угловые <th /> (например, перед часами тепловой
 * карты), шапки-объединения с colSpan и служебные шапки с `data-plain` —
 * последнее только для колонок без показателя (например, «Действие»).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { tsxFiles, tags, lineOf } from './lib.mjs';

const HINT = /\bhint=/;

test('у каждого показателя есть пояснение ⓘ', () => {
  const missing = [];
  for (const file of tsxFiles()) {
    const source = fs.readFileSync(file, 'utf8');
    for (const name of ['KpiTile', 'Tile', 'SortableTh', 'GroupHeader']) {
      for (const { tag, index } of tags(source, name)) {
        if (!HINT.test(tag)) missing.push(`${file}:${lineOf(source, index)} — <${name}> без hint`);
      }
    }
    for (const { tag, index } of tags(source, 'th')) {
      if (tag.endsWith('/') || /\bcolSpan=/.test(tag) || /\bdata-plain\b/.test(tag) || HINT.test(tag)) continue;
      const close = source.indexOf('</th>', index);
      const body = source.slice(index, close === -1 ? index + 600 : close);
      if (/<InfoHint\b/.test(body)) continue;
      // Пустая шапка (только пробелы/скобки) — угловая ячейка, не показатель.
      const inner = body.slice(tag.length + 1).replace(/\s+/g, '');
      if (inner === '' || inner === '{}') continue;
      missing.push(`${file}:${lineOf(source, index)} — <th> без пояснения`);
    }
  }
  assert.deepEqual(missing, [],
    'Показатель без кружка ⓘ: человек видит число и не знает, что оно значит.\n' +
    'Добавьте hint={metricHint(\'…\', language)} (SortableTh, KpiTile, GroupHeader) или <InfoHint text={…} /> внутри <th>;\n' +
    'служебную колонку без показателя пометьте data-plain:\n' +
    missing.join('\n'));
});
