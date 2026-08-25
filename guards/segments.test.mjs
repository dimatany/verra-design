/**
 * СЕГМЕНТ НЕ ОДЕВАЕТСЯ КНОПКАМИ.
 *
 * 26.08.2026, «Что нового»: фильтры «Все / Добавлено / Исправлено» выглядели
 * россыпью кнопок — выбранный btn-primary, остальные btn-quiet. Владелица:
 * «выглядят как кнопки, но это не кнопки». Кнопка обещает действие; выбор
 * взгляда на данные — вкладка или нажимаемый фильтр, и новых начертаний для
 * этого не заводим (первый заход с отдельным «сегментом» отменён владелицей
 * в тот же день: элемент уже существовал).
 *
 * Страж ловит сам приём «выбранность = смена кнопочной семьи»: условное
 * переключение между btn-primary и btn-quiet в одном className.
 *
 * Чем пользоваться (решение владелицы 26.08.2026 — НЕ заводить новое
 * начертание): выбор одного из N — компонент Tabs (вариант .tabs-inline внутри
 * карточки); независимый вкл/выкл-фильтр — тихая кнопка с aria-pressed.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { tsxFiles, lineOf } from './lib.mjs';

const FAMILY_SWAP = /btn-primary'\s*:\s*(?:'|`)[^'`]*btn-quiet|btn-quiet[^'`]*'\s*:\s*'btn-primary/;

test('выбранность не делается сменой кнопочной семьи — это сегмент (.seg)', () => {
  const offenders = [];
  for (const file of tsxFiles()) {
    const source = fs.readFileSync(file, 'utf8');
    let index = source.search(FAMILY_SWAP);
    while (index !== -1) {
      offenders.push(`${file}:${lineOf(source, index)}`);
      const next = source.slice(index + 1).search(FAMILY_SWAP);
      index = next === -1 ? -1 : index + 1 + next;
    }
  }
  assert.deepEqual(offenders, [],
    'переключение btn-primary ↔ btn-quiet по условию — признак сегмента; один из N — Tabs (.tabs-inline); вкл/выкл — btn-quiet + aria-pressed:\n'
    + offenders.join('\n'));
});
