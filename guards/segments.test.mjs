/**
 * СЕГМЕНТ НЕ ОДЕВАЕТСЯ КНОПКАМИ.
 *
 * 26.08.2026, «Что нового»: фильтры «Все / Добавлено / Исправлено» выглядели
 * россыпью кнопок — выбранный btn-primary, остальные btn-quiet. Владелица:
 * «выглядят как кнопки, но это не кнопки». Кнопка обещает действие; выбор
 * взгляда на данные — это сегмент: контейнер `.seg`, фишки `.seg-item`,
 * состояние aria-pressed (компонент `Segmented` в пакете).
 *
 * Страж ловит сам приём «выбранность = смена кнопочной семьи»: условное
 * переключение между btn-primary и btn-quiet в одном className.
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
    'переключение btn-primary ↔ btn-quiet по условию — признак сегмента; используйте Segmented / .seg + .seg-item + aria-pressed:\n'
    + offenders.join('\n'));
});
