'use client';

import React from 'react';

/**
 * ВЕРХНЯЯ ПОЛОСА КАБИНЕТА — одна на экосистему (v0.5.0).
 *
 * Каркас: слева бургер и выбор проекта, справа период и прочие переключатели.
 * Жила копией в каждом продукте, и копии разъехались: у PR Hub полоса
 * переносилась по строкам, а раскрытый список периода растаскивал её
 * элементы по экрану (замечание владельца 22.08.2026). Здесь заданы и
 * раскладка, и правило «на узком экране полоса не переносится, лишнее
 * прячется» — продукты приносят только своё содержимое.
 */
export default function AppTopbar({ menuButton, left, right, className = '' }: Readonly<{
  /** Кнопка-бургер (показывается только на узком экране самим продуктом). */
  menuButton?: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}>) {
  return (
    <header
      className={`shrink-0 chrome-glass border-b flex flex-nowrap items-center justify-between gap-x-2 gap-y-1.5 h-16 px-3 sm:px-5 lg:px-8 z-[200] w-full ${className}`}
    >
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {menuButton}
        {left}
      </div>
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-5 shrink-0">{right}</div>
    </header>
  );
}
