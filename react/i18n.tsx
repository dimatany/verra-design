'use client';

import React from 'react';

/**
 * Перевод в пакете — ЧЕРЕЗ ПРОДУКТ, не внутри.
 *
 * У каждого продукта свой механизм локализации (у Metriverra — tx() на 15
 * языков). Пакет не тащит его к себе: компоненты просят перевод функцией
 * t(uk, ru, en), а продукт один раз оборачивает приложение провайдером:
 *
 *   <VerraDesignI18n t={(uk, ru, en) => tx(lang === 'uk' ? uk : lang === 'ru' ? ru : en)}>
 *
 * Без провайдера компоненты говорят по-английски — честный дефолт, а не
 * пустота.
 */
export type TranslateFn = (uk: string, ru: string, en: string) => string;
export type FormatNumberFn = (n: number) => string;

/** Украинский формат чисел — правило системы: пробел-разряды, запятая-дробь. */
const defaultFormatNumber: FormatNumberFn = (n) =>
  new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 2 }).format(n);

const Ctx = React.createContext<{ t: TranslateFn; formatNumber: FormatNumberFn }>({
  t: (_uk, _ru, en) => en,
  formatNumber: defaultFormatNumber,
});

export function VerraDesignI18n({ t, formatNumber, children }: Readonly<{
  t: TranslateFn;
  /** Свой форматтер продукта; без него — украинский формат по умолчанию. */
  formatNumber?: FormatNumberFn;
  children: React.ReactNode;
}>) {
  const value = React.useMemo(
    () => ({ t, formatNumber: formatNumber ?? defaultFormatNumber }),
    [t, formatNumber],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useT = (): TranslateFn => React.useContext(Ctx).t;
export const useFormatNumber = (): FormatNumberFn => React.useContext(Ctx).formatNumber;
