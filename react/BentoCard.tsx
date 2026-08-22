'use client';

import React from 'react';

/**
 * КАРТОЧКА БЛОКА — одна на экосистему (v0.4.9).
 *
 * Блок с шапкой (заголовок + подпись + отбивка линией) и содержимым. Жила
 * копией в Metriverra, а PR Hub собирал свою из `section.glass-card` с другим
 * заголовком — и одинаковые по смыслу блоки техчасти выглядели разными
 * (замечание владельца 22.08.2026). Теперь оба продукта берут её отсюда.
 */
export default function BentoCard({
  title,
  subtitle,
  className = '',
  headerExtra,
  children,
}: Readonly<{
  title?: string;
  subtitle?: string;
  className?: string;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
}>) {
  return (
    <div className={`glass-card rounded-2xl p-4 sm:p-6 lg:p-7 flex flex-col gap-5 h-full ${className}`}>
      {(title || subtitle || headerExtra) && (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-primary/10 pb-4">
          <div className="flex flex-col gap-0.5">
            {title && <h2 className="heading-block">{title}</h2>}
            {subtitle && (
              <p className="t-data text-neutral-dark/80 font-medium leading-snug mt-1.5">{subtitle}</p>
            )}
          </div>
          {headerExtra && <div className="t-body">{headerExtra}</div>}
        </div>
      )}
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
