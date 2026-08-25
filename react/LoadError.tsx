'use client';

import { useT } from './i18n';

/**
 * Shared "failed to load" block with a Retry button, for data pages whose fetch
 * can fail. Replaces the old behaviour where an API error left an infinite
 * loading pulse with no way to recover.
 */
export default function LoadError({
  onRetry,
  className,
}: Readonly<{
  onRetry: () => void;
  className?: string;
}>) {
  const t = useT();

  return (
    <div
      className={`p-8 min-h-[160px] flex flex-col items-center justify-center gap-3 t-data font-bold font-sans ${className ?? ''}`}
      role="alert"
    >
      <span className="metric-bad">
        {t('Не вдалося завантажити дані', 'Не удалось загрузить данные', 'Failed to load data')}
      </span>
      <button
        type="button"
        onClick={onRetry}
        className="btn btn-sm glass-btn btn-quiet"
      >
        {t('Повторити', 'Повторить', 'Retry')}
      </button>
    </div>
  );
}
