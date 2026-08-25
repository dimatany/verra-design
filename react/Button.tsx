'use client';

import React from 'react';

/**
 * КНОПКА ЭКОСИСТЕМЫ — ОДНА НА ВСЁ.
 *
 * Раньше в пакете были только классы, и каждый автор собирал кнопку из них
 * заново: где-то забывал `btn`, где-то дописывал свой радиус, где-то красил
 * ссылку «под кнопку» руками. Аудит 25.08.2026 нашёл 213 кнопок, из которых
 * системный класс использовали 13. Классы остаются (старый код работает), но
 * теперь есть готовый компонент — и написать правильно быстрее, чем неправильно.
 *
 * Семья задаётся смыслом действия, а не вкусом страницы:
 *   primary — сделать: создать, сохранить, отправить, выставить счёт;
 *   quiet   — рядом: скачать, экспорт, печать, копировать, отмена;
 *   danger  — необратимое: удалить окончательно.
 *
 * Выбранность (сегмент, фильтр) — это НЕ смена семьи, а `pressed`: семья
 * остаётся quiet, состояние объявляется `aria-pressed`, иначе экранный диктор
 * не узнает о выборе, а глаз читает «другую кнопку».
 *
 * Ссылка, которая выглядит кнопкой, тоже проходит здесь: передайте `href`.
 */

export type ButtonVariant = 'primary' | 'quiet' | 'danger';

type Common = {
  variant?: ButtonVariant;
  /** Уменьшенный размер для плотных мест (шапки таблиц, строки списков). */
  size?: 'sm' | 'md';
  /** Скруглённая «таблетка» — для сегментов и фильтров. */
  pill?: boolean;
  /** Кнопка-значок: квадрат под иконку, подпись обязательна в aria-label. */
  icon?: boolean;
  /** Выбранное состояние сегмента: семья не меняется, объявляется aria-pressed. */
  pressed?: boolean;
  className?: string;
  children?: React.ReactNode;
};

type AsButton = Common & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof Common> & { href?: undefined };
type AsLink = Common & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof Common> & { href: string };

const FAMILY: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  quiet: 'btn-quiet',
  danger: 'btn-danger',
};

function classes({ variant = 'primary', size = 'md', pill, icon, className = '' }: Common): string {
  return [
    'btn',
    FAMILY[variant],
    'glass-btn',
    size === 'sm' ? 'btn-sm' : '',
    pill ? 'btn-pill' : '',
    icon ? 'btn-icon' : '',
    className,
  ].filter(Boolean).join(' ');
}

export default function Button(props: AsButton | AsLink) {
  const { variant, size, pill, icon, pressed, className, children, ...rest } = props as AsLink;

  if (typeof rest.href === 'string') {
    return (
      <a {...rest} className={classes({ variant, size, pill, icon, className })} aria-pressed={pressed}>
        {children}
      </a>
    );
  }

  const buttonProps = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      type={buttonProps.type ?? 'button'}
      {...buttonProps}
      className={classes({ variant, size, pill, icon, className })}
      aria-pressed={pressed}
    >
      {children}
    </button>
  );
}
