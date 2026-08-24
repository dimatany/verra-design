'use client';

import React from 'react';

/**
 * ЧЕСТНЫЙ СТАТУС ИСТОЧНИКОВ в верхней полосе — точка и одна строка.
 *
 * До 24.08.2026 у продуктов он был свой: одинаковая по смыслу подпись стояла
 * разным кеглем и разной жирностью, а серая точка «нет источников» была только
 * у одного. Смысл один — значит и элемент один.
 *
 * Пока состояние не пришло, продукт передаёт `label = null`: показывается
 * многоточие, а не «0 активно». Ноль — это утверждение, и первые секунды
 * загрузки оно было бы неправдой.
 */
export default function SourceStatus({ label, active, title, className = '' }: Readonly<{
  /** Готовая строка: «12 активно» / «нет источников». null — ещё не знаем. */
  label: string | null;
  /** Есть ли живые источники: от этого зависит, светится точка или гаснет. */
  active: boolean;
  /** Подсказка при наведении. */
  title?: string;
  className?: string;
}>) {
  return (
    <span
      title={title}
      className={`hidden lg:inline-flex items-center gap-1.5 t-cap font-bold text-neutral-dark/80 ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${active ? 'bg-tertiary glow-dot-active' : 'bg-neutral-dark/20'}`} />
      {label ?? '…'}
    </span>
  );
}
