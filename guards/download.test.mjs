/**
 * СКАЧИВАНИЕ ВЫГЛЯДИТ ОДИНАКОВО ВЕЗДЕ — ЧЁРНОЙ КНОПКОЙ.
 *
 * 25.08.2026 владелица открыла помощника и SEO-страницу подряд: в одном месте
 * «Word» и «PDF» были тёмные, в другом — белые с рамкой. Действие одно и то же,
 * а глаз читает две разные кнопки и ищет разницу, которой нет.
 *
 * Решение: любое СКАЧИВАНИЕ файла — семья `primary` (в кабинете `btn-primary`,
 * на лендинге `mkt-btn-primary`). Печать, копирование, открытие в новой
 * вкладке — не скачивание, их это правило не трогает.
 *
 * Тест смотрит на подпись кнопки, а не на обработчик: человек тоже читает
 * подпись.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { tsxFiles, lineOf } from './lib.mjs';

/** Кнопка целиком: открывающий тег, подпись, закрывающий. */
const ELEMENT = /<(button|a|Link|Button)\b([^>]*)>([\s\S]{0,220}?)<\/\1>/g;

/** Подпись, по которой человек понимает «сейчас скачается файл». */
const DOWNLOAD_LABEL = /(^|[\s>{'"])(Word|WORD|PDF|Excel|XLSX|CSV|Скачать|Скачати|Завантажити|Download)([\s<}'".,]|$)/;

/** Слова, которые снимают подозрение: это не скачивание, а соседнее действие. */
const NOT_DOWNLOAD = /(Друк|Печать|Print|Копі|Копи|Copy|Відкрити|Открыть|Open|Загрузить файл|Upload)/;

const PRIMARY = /\b(btn-primary|mkt-btn-primary)\b|variant=["']primary["']/;
/** Компонент `Button` без `variant` — это уже primary по умолчанию. */
const DEFAULT_PRIMARY = /^<Button\b(?![^>]*variant=)/;

test('кнопка скачивания везде одной семьи — тёмная', () => {
  const offenders = [];
  for (const file of tsxFiles()) {
    const source = fs.readFileSync(file, 'utf8');
    for (const m of source.matchAll(ELEMENT)) {
      const [whole, name, attrs, label] = m;
      if (!DOWNLOAD_LABEL.test(label)) continue;
      if (NOT_DOWNLOAD.test(label)) continue;
      // Ссылка внутри текста абзаца кнопкой не выглядит — правило не о ней.
      const looksLikeButton = name === 'Button'
        || /\b(btn|glass-btn|mkt-btn)\b/.test(attrs);
      if (!looksLikeButton) continue;
      if (PRIMARY.test(attrs) || DEFAULT_PRIMARY.test(`<${name}${attrs}>`)) continue;
      offenders.push(`${file}:${lineOf(source, m.index)} — ${label.trim().slice(0, 40)}`);
      void whole;
    }
  }
  assert.deepEqual(offenders, [],
    'скачивание должно быть тёмной кнопкой (variant="primary" / btn-primary):\n' + offenders.join('\n'));
});
