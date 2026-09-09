/**
 * ВЫКЛЮЧЕНИЕ НЕ СТИРАЕТ ВЫБОР.
 *
 * 09.09.2026, вопрос владелицы: «у неё вообще ничего не выбрано, а у меня
 * выбрано — как так может быть?». У аналитика переключатель источника продаж
 * стоял выключенным по роли, и все четыре кнопки выглядели одинаково.
 *
 * Причина была в весе селекторов: выключенная тихая кнопка красится через
 * `button:disabled.btn-quiet` (0,2,1), выбранная — через
 * `.btn-quiet[aria-pressed]` (0,2,0). Второе легче и проигрывало независимо от
 * порядка правил в файле.
 *
 * Страж держит парное правило на месте. Убрать его — значит вернуть состояние,
 * в котором человек не видит, что именно выбрано.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const css = fs.readFileSync(path.join(here, '..', 'components.css'), 'utf8');

test('выбранная тихая кнопка остаётся тёмной и в выключенном виде', () => {
  const required = [
    "button:disabled.btn-quiet[aria-pressed='true']",
    "button:disabled.btn-quiet[aria-selected='true']",
    ".btn-quiet[aria-disabled='true'][aria-pressed='true']",
  ];
  const missing = required.filter((sel) => !css.includes(sel));
  assert.deepEqual(
    missing, [],
    'Нет правила, возвращающего выбранной кнопке её вид при выключении:\n  '
    + missing.join('\n  ')
    + '\nБез него выключение перекрашивает выбранную кнопку в светлую, и выбор пропадает.',
  );
});

test('правило выбранности стоит ПОСЛЕ правила выключенности', () => {
  // Даже с равным весом порядок решает: пара правил обязана идти следом.
  const disabled = css.indexOf('button:disabled.btn-quiet,');
  const pressedWhenDisabled = css.indexOf("button:disabled.btn-quiet[aria-pressed='true']");
  assert.ok(disabled >= 0 && pressedWhenDisabled > disabled,
    'правило «выбранная и выключенная» должно идти после общего правила выключенности');
});
