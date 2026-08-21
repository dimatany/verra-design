import React from 'react';

/**
 * Системные иконки интерфейса — тонкая обводка того же стиля, что в сайдбаре.
 *
 * До этого кнопки подписывались символами и эмодзи: «⬇ Word», «⏸ Приостановить»,
 * «📎 Файл». Они рисуются шрифтом, поэтому на разных системах выглядят
 * по-разному (а на части Android эмодзи цветные и выпадают из палитры), не
 * масштабируются вместе с текстом и не читаются скринридером как иконка. Здесь
 * один набор на весь продукт: размер наследуется от кегля, цвет — от текста.
 */
export type IconName = 'check' | 'pause' | 'play' | 'download' | 'external' | 'attach' | 'spark';

const PATHS: Record<IconName, React.ReactNode> = {
  check: <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l5.25 5.25L19.5 6.75" />,
  pause: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5.25v13.5M15 5.25v13.5" />,
  play: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 5.25l11.5 6.75-11.5 6.75V5.25z" />,
  download: <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75v11.5m0 0l-4-4m4 4l4-4M4.5 19.5h15" />,
  external: <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5H19.5V10.5M19.5 4.5L11 13M18 14.25v4.5a1.5 1.5 0 01-1.5 1.5h-11a1.5 1.5 0 01-1.5-1.5v-11a1.5 1.5 0 011.5-1.5h4.5" />,
  attach: <path strokeLinecap="round" strokeLinejoin="round" d="M18 8.25l-7.5 7.5a3 3 0 11-4.25-4.25l8-8a4.5 4.5 0 116.36 6.36l-8.5 8.5" />,
  spark: <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6L12 3.75zM18 15.75l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" />,
};

export default function Icon({ name, className = 'w-4 h-4', strokeWidth = 1.8 }: Readonly<{
  name: IconName;
  className?: string;
  strokeWidth?: number;
}>) {
  return (
    <svg
      className={`inline-block shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      // Иконка здесь всегда рядом со словами — озвучивать её отдельно нечего.
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
