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

const Ctx = React.createContext<TranslateFn>((_uk, _ru, en) => en);

export function VerraDesignI18n({ t, children }: Readonly<{ t: TranslateFn; children: React.ReactNode }>) {
  return <Ctx.Provider value={t}>{children}</Ctx.Provider>;
}

export const useT = (): TranslateFn => React.useContext(Ctx);
